# Environment Setup

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Firebase account created
- Code editor (VS Code recommended)

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# OpenAI Configuration (Optional - will use mock data if not set)
OPENAI_API_KEY=your-openai-api-key

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 2. Enable Authentication

1. Navigate to Authentication in Firebase Console
2. Click "Get Started"
3. Enable Email/Password provider
4. Enable Google provider (optional)
5. Add authorized domains

### 3. Create Firestore Database

1. Navigate to Firestore Database
2. Click "Create Database"
3. Choose production mode
4. Select your region
5. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all brands
    match /brands/{brandId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Content settings - admin only
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.email in ['admin@glamlink.com'];
    }
  }
}
```

### 4. Set Up Storage

1. Navigate to Storage
2. Click "Get Started"
3. Set up security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /brands/{brandId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/glamlink-website.git
cd glamlink-website/web_app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration
3. Add OpenAI API key (optional)

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Initial Data Setup

### 1. Create Super Admin User

1. Sign up with email: admin@glamlink.com
2. This user will have access to Settings tab
3. Can initialize database with sample data

### 2. Initialize Database

1. Login as super admin
2. Go to Admin Panel → Settings
3. Click "Initialize Database"
4. Creates sample brand with data

### 3. Create Test Users

For testing different roles:

```
# Brand Owner
email: brandowner@test.com
password: TestPassword123!

# Customer (no admin access)
email: customer@test.com
password: TestPassword123!
```

## VS Code Setup (Recommended)

### Extensions

Install these VS Code extensions:

- ESLint
- Prettier
- TypeScript and JavaScript
- Tailwind CSS IntelliSense
- Auto Rename Tag
- ES7+ React/Redux/React-Native snippets

### Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check environment variables
   - Verify Firebase project exists
   - Check network connection

2. **Build Errors**
   - Clear `.next` folder
   - Delete `node_modules` and reinstall
   - Check TypeScript errors

3. **Authentication Issues**
   - Clear browser cookies
   - Check Firebase Auth settings
   - Verify authorized domains

### Debug Commands

```bash
# Check environment
npm run env:check

# Clear cache
rm -rf .next node_modules
npm install

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Environment Variables for Production

Add these in Vercel dashboard:

- All `NEXT_PUBLIC_*` variables
- `OPENAI_API_KEY`
- Update `NEXT_PUBLIC_BASE_URL` to production URL

### Post-Deployment

1. Update Firebase authorized domains
2. Test all authentication flows
3. Verify content settings work
4. Check AI generation features