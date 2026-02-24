# Common Development Tasks

## Adding a New Admin Tab

1. Add to `AdminTab` type in `/lib/admin/config.ts`
2. Add to `ALL_ADMIN_TABS` array with icon and description
3. Create component in `/lib/admin/components/`
4. Add case in admin page's `renderTabContent()`
5. Update Firestore service if new data type needed

Example:
```typescript
// In config.ts
export type AdminTab = "overview" | "profile" | "products" | "newfeature";

// In ALL_ADMIN_TABS
{
  id: "newfeature",
  label: "New Feature",
  icon: <NewIcon />,
  description: "Manage new feature"
}
```

## Creating New AI Generation

1. Add interface to `contentGeneratorService.ts`
2. Create generation method with OpenAI prompt
3. Add mock data fallback method
4. Create API endpoint in `/app/api/ai/`
5. Integrate with admin tab component

Example flow:
```typescript
// 1. Add interface
interface NewFeatureItem {
  id: string;
  name: string;
  // ... other fields
}

// 2. Add generation method
async generateNewFeatures(brand: Brand, count: number) {
  // OpenAI prompt logic
}

// 3. Add mock fallback
private generateMockNewFeatures() {
  // Return mock data
}
```

## Adding New Detail Page

1. Create component in `/lib/pages/brand/components/`
2. Add route in `/app/brand/[id]/`
3. Update navigation in grid components
4. Add breadcrumb navigation
5. Include share functionality

File structure:
```
/app/brand/[id]/newfeature/[itemId]/page.tsx
/lib/pages/brand/components/NewFeatureDetail.tsx
```

## Adding New Profile Page

1. Create page in `/app/profile/brand/[feature]/page.tsx`
2. Add navigation item to `/app/profile/layout.tsx`
3. Create management component in `/lib/admin/components/`
4. Implement CRUD operations with Firestore
5. Add date formatting if needed

Navigation item:
```typescript
{
  label: "New Feature",
  href: "/profile/brand/newfeature",
  icon: <NewIcon className="w-4 h-4" />
}
```

## Implementing Date Fields

1. Add field type as 'date' in EditModal fields config
2. Store dates as YYYY-MM-DD strings
3. Use formatDate() utility for display
4. Example:

```typescript
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
```

## Working with Firestore

### Adding to Brand Array
```typescript
await addToBrandArray(brandId, 'products', newProduct);
```

### Updating in Brand Array
```typescript
await updateInBrandArray(brandId, 'products', productId, updates);
```

### Removing from Brand Array
```typescript
await removeFromBrandArray(brandId, 'products', productId);
```

## Creating API Endpoints

1. Create route file in `/app/api/`
2. Use `getAuthenticatedAppForUser()` for auth
3. Validate request data
4. Perform Firestore operations
5. Return consistent response format

Template:
```typescript
export async function POST(request: NextRequest) {
  try {
    const { db, currentUser } = await getAuthenticatedAppForUser();
    
    if (!currentUser || !db) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }
    
    // Your logic here
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

## Adding New Components

1. Create component file with TypeScript
2. Define props interface
3. Implement responsive design
4. Add loading and error states
5. Include accessibility features

Component template:
```typescript
interface NewComponentProps {
  data: SomeType;
  onAction?: () => void;
}

export default function NewComponent({ data, onAction }: NewComponentProps) {
  // Component logic
}
```