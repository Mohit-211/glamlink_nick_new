# Firebase Authentication in Next.js App Router

## Overview

This application uses Firebase's recommended approach for Next.js App Router: **FirebaseServerApp** with session cookies for server-side authentication. This approach allows API routes to perform authenticated operations while respecting Firestore security rules.

**IMPORTANT**: Do NOT use Firebase Admin SDK for user-specific operations. Admin SDK requires service account credentials and is meant for privileged operations, not user context operations.

## Authentication Architecture

### 1. Client-Side Authentication Flow

```
User logs in → Firebase Auth → ID Token generated →
AuthProvider detects change → Sends token to /api/auth/session →
Server sets httpOnly cookie → All API requests authenticated
```

### 2. Server-Side Authentication Flow

```
API Route called → getAuthenticatedAppForUser() →
Reads __session cookie → Creates FirebaseServerApp →
Performs operations with user's permissions
```

## Key Implementation Files

### 1. **Firebase Configuration** (`/lib/config/firebase.ts`)

```typescript
// MUST export firebaseConfig for serverApp to use
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... other config
};
```

### 2. **AuthProvider Component** (`/lib/auth/components/AuthProvider.tsx`)

- Listens for Firebase auth state changes
- Automatically manages session cookies
- Updates Redux auth state
- MUST be wrapped around entire app in providers.tsx

### 3. **Session Cookie API** (`/app/api/auth/session/route.ts`)

- POST: Sets \_\_session cookie with ID token
- DELETE: Clears cookie on logout
- Uses httpOnly cookies for security

### 4. **Server App Helper** (`/lib/firebase/serverApp.ts`)

```typescript
export async function getAuthenticatedAppForUser() {
  const authIdToken = (await cookies()).get("__session")?.value;

  if (!authIdToken) {
    return { firebaseServerApp: null, currentUser: null, db: null };
  }

  const firebaseServerApp = initializeServerApp(firebaseConfig, {
    authIdToken,
  });

  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();

  return {
    firebaseServerApp,
    currentUser: auth.currentUser,
    db: getFirestore(firebaseServerApp),
  };
}
```

## Setting Up Authentication (Step-by-Step)

### Prerequisites

1. Firebase project created
2. Authentication enabled in Firebase Console
3. Firestore security rules configured
4. Environment variables set

### Implementation Steps

1. **Export Firebase Config**

   ```typescript
   // In /lib/config/firebase.ts
   export const firebaseConfig = {
     /* ... */
   };
   ```

2. **Create Cookie Utilities**

   ```typescript
   // In /lib/utils/cookies.ts
   export async function setCookie(name: string, value: string) {
     (await cookies()).set(name, value, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: "lax",
       maxAge: 60 * 60, // 1 hour
     });
   }
   ```

3. **Add AuthProvider to App**

   ```typescript
   // In app/providers.tsx
   <Provider store={store}>
     <AuthProvider>{children}</AuthProvider>
   </Provider>
   ```

4. **Create Session Endpoint**

   ```typescript
   // In /app/api/auth/session/route.ts
   export async function POST(request: NextRequest) {
     const { idToken } = await request.json();
     await setCookie("__session", idToken);
     return NextResponse.json({ success: true });
   }
   ```

5. **Use in API Routes**

   ```typescript
   // In any API route
   const { db, currentUser } = await getAuthenticatedAppForUser();

   if (!currentUser) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   // Perform Firestore operations with user context
   await setDoc(doc(db, "users", currentUser.uid), data);
   ```

## Common Pitfalls & Solutions

### ❌ DON'T: Use Firebase Admin SDK for user operations

```typescript
// WRONG - This will cause "INTERNAL" errors
import * as admin from "firebase-admin";
adminApp = admin.initializeApp({
  /* ... */
});
```

### ✅ DO: Use FirebaseServerApp with cookies

```typescript
// CORRECT
const firebaseServerApp = initializeServerApp(firebaseConfig, {
  authIdToken,
});
```

### ❌ DON'T: Pass ID tokens in request headers manually

```typescript
// WRONG - Prone to errors
headers: { 'Authorization': `Bearer ${idToken}` }
```

### ✅ DO: Let AuthProvider manage cookies automatically

```typescript
// CORRECT - Cookies set automatically
// No manual token handling needed
```

### ❌ DON'T: Try to access auth.currentUser on server without ServerApp

```typescript
// WRONG - Will always be null
import { auth } from "@/lib/config/firebase";
const user = auth.currentUser; // Always null on server
```

### ✅ DO: Use getAuthenticatedAppForUser()

```typescript
// CORRECT
const { currentUser } = await getAuthenticatedAppForUser();
```

## Troubleshooting Guide

### "Unauthorized" errors in API routes

1. Check if user is logged in on client
2. Verify AuthProvider is in providers.tsx
3. Check if \_\_session cookie exists in browser DevTools
4. Ensure session endpoint is working

### "Cannot read properties of undefined" errors

- Usually means trying to use Admin SDK
- Remove all firebase-admin imports
- Use FirebaseServerApp instead

### Cookie not being set

1. Check browser console for errors
2. Verify /api/auth/session endpoint exists
3. Ensure AuthProvider wraps your app
4. Check cookie settings match your environment

### Firestore permission denied

1. Check Firestore rules allow the operation
2. Verify currentUser.uid matches document ID
3. Ensure using authenticated Firestore instance from ServerApp

## Example: Authenticated API Route

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppForUser } from "@/lib/firebase/serverApp";
import { doc, setDoc } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated app
    const { db, currentUser } = await getAuthenticatedAppForUser();

    if (!currentUser || !db) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Save with user's permissions
    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

## Security Considerations

1. **Session cookies are httpOnly** - Can't be accessed by JavaScript
2. **Cookies expire after 1 hour** - Matches Firebase token expiration
3. **Operations use user's permissions** - Respects Firestore rules
4. **No service account needed** - Reduces security risk

## Migration from Firebase Admin SDK

If you're migrating from Admin SDK:

1. Remove `firebase-admin` from package.json
2. Delete `/lib/config/firebase-admin.ts`
3. Remove service account JSON files
4. Update all API routes to use `getAuthenticatedAppForUser()`
5. Test all authenticated operations