# Glamlink Web App - Development Guide

This document provides guidance to Claude Code when working with the Glamlink beauty marketplace application.

## Project Overview

Glamlink is a comprehensive multi-tenant beauty marketplace platform built with Next.js 15. It empowers beauty entrepreneurs to create and manage their own digital storefronts, connect with certified beauty professionals, and leverage AI-powered tools to grow their businesses.

**Core Concept:**
Each authenticated user (except the super admin) automatically gets their own beauty brand upon signup. They can then manage all aspects of their brand through a sophisticated admin panel, while customers browse and interact with brands through public-facing pages.

**Key Features:**
- Multi-tenant architecture with complete brand isolation
- AI-powered content generation for products, providers, reviews, and more
- Comprehensive admin panel with role-based access control
- Professional detail pages for products, providers, and transformations
- AI-powered business growth tools (brainstorming, research, analysis)
- Optimized nested document structure for performance (1 read vs 6+)
- AI beauty analysis tool for personalized recommendations
- Social features for brand discovery and engagement

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- OpenAI API key (optional)

### Setup
```bash
cd web_app
npm install
cp .env.example .env.local
# Add your Firebase and OpenAI credentials
npm run dev
```

Visit http://localhost:3000

### Initial Setup
1. Sign up as admin@glamlink.com for super admin access
2. Go to Admin Panel → Settings → Initialize Database
3. Create regular user accounts for testing brand owner features

## Directory Structure

```
web_app/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   ├── admin/              # Admin panel
│   ├── brand/              # Brand pages
│   ├── profile/            # User profile
│   └── (auth)/             # Auth pages
├── lib/                     # Core application code
│   ├── admin/              # Admin components
│   ├── auth/               # Authentication
│   ├── components/         # Shared components
│   ├── config/             # Configuration
│   ├── pages/              # Page modules
│   └── services/           # Service layers
├── documentation/           # Detailed documentation
│   ├── architecture/       # Technical details
│   ├── features/           # Feature docs
│   ├── guides/             # How-to guides
│   └── updates/            # Release notes
└── public/                  # Static assets
```

## Core Concepts

### User Roles

1. **Super Admin** (admin@glamlink.com)
   - Only sees Settings tab
   - Can initialize database
   - System configuration

2. **Brand Owners** (all other users)
   - Full brand management
   - All tabs except Settings
   - One brand per user

### Database Architecture

We use a nested document structure for optimal performance:

```typescript
brands/
  └── brand_id (document)
      ├── name, tagline, mission
      ├── products: Product[]
      ├── certifiedProviders: Provider[]
      ├── beforeAfters: Transformation[]
      ├── trainingPrograms: Training[]
      └── reviews: Review[]
```

Benefits:
- Single read for all brand data
- Atomic updates
- Complete data isolation
- Better performance

### Authentication

We use Firebase Auth with session cookies:
- Client: Firebase Auth → ID Token → Session Cookie
- Server: Read Cookie → Create ServerApp → User Context

**Important:** Never use Firebase Admin SDK for user operations. Always use `getAuthenticatedAppForUser()`.

### Plain Pages System

Some pages in the app need to render without the standard layout (no navigation, footer, or alerts). These are called "plain pages" and use only the `MainWrapper` component.

**Configuration Location**: `/lib/config/plainPages.ts`

#### How It Works

1. **Plain pages list**: Maintained in `plainPages` array with pattern matching
2. **Conditional rendering**: `RootLayoutClient` checks the current pathname
3. **Pattern support**: Both exact string matches and regex patterns

#### Adding Plain Pages

Edit `/lib/config/plainPages.ts`:

```typescript
export const plainPages: PlainPageConfig[] = [
  {
    pattern: /^\/for-professionals\/[^/]+$/,  // Dynamic route
    description: "Professional detail pages (Digital Business Cards)"
  },
  {
    pattern: "/exact-page",  // Exact match
    description: "Some standalone page"
  },
];
```

#### Pattern Examples

- **Exact path**: `"/page-name"`
- **Dynamic segment**: `/^\/blog\/[^/]+$/` (matches `/blog/post-slug`)
- **Multiple segments**: `/^\/shop\/[^/]+\/[^/]+$/` (matches `/shop/category/product`)
- **Optional trailing slash**: `/^\/page\/?$/` (matches `/page` or `/page/`)

#### Current Plain Pages

- `/for-professionals/[id]` - Professional detail pages (Digital Business Cards)

#### Magazine JSON Editor

The Magazine Editor now includes a powerful JSON editing mode that allows direct manipulation of section content:

### Features
- **Toggle Mode**: Switch between form fields and JSON editor with a single click
- **Real-time Validation**: JSON is validated against section type schemas
- **Example Templates**: Load pre-filled examples for each section type
- **Format & Copy**: Built-in JSON formatting and clipboard functionality
- **Error Messages**: Clear validation errors showing exactly what's wrong

### Usage
1. Open any section in the Magazine Editor
2. Click "{ } Update JSON" button in the header
3. Edit the JSON directly or load an example
4. Click "Apply JSON" to update the form fields
5. Switch back to form view anytime

### Benefits
- **Speed**: Bulk edit multiple fields at once
- **Flexibility**: Copy/paste configurations between sections
- **Debugging**: See exact data structure
- **Import/Export**: Easy sharing of section configurations

## Magazine Image Crop Feature

The Magazine module includes a powerful image cropping and positioning system that allows editors to fine-tune how images appear in magazine sections:

### How It Works
1. **Crop Button**: Available in the ImageUploadField component for all image fields
2. **Image Object Structure**: Images can be stored as objects with multiple properties:
   ```typescript
   {
     url: string,              // Display URL (cropped or original)
     originalUrl?: string,     // Original uncropped image URL
     cropData?: any,          // Crop area coordinates
     objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down',
     objectPositionX?: number, // Horizontal position (0-100%)
     objectPositionY?: number  // Vertical position (0-100%)
   }
   ```
3. **Utility Functions**: All section components use these helpers:
   - `getImageUrl()` - Extracts display URL from string or object
   - `getImageObjectFit()` - Gets object-fit CSS property
   - `getImageObjectPosition()` - Gets object-position CSS value

### Supported Sections
All magazine sections now support cropped images:
- CoverProFeature (cover image, professional image, photo gallery)
- MariesCorner (background, author image, product images, photo gallery)
- TopTreatment (hero image, before/after images, pro images)
- MagazineClosing (next issue cover, highlights, spotlight images)
- RisingStar (star image, photo gallery)
- TopProductSpotlight (product images, similar products)

### Using the Crop Feature
1. Click the "✂️ Crop" button next to any image field
2. Adjust the crop area in the modal
3. The cropped version is saved while preserving the original
4. Use object-fit controls to fine-tune display behavior
5. Adjust object-position percentages for precise focal points

## Magazine Editor System

The Magazine Editor (`/magazine/editor/`) provides comprehensive content management:

### Key Features
- **Split-Pane Interface**: Preview and edit modes with live updates
- **JSON Editor Mode**: Direct JSON editing with validation
- **Template System**: Apply standard layouts with 10 pre-configured sections
- **Image Management**: Upload to Firebase Storage with gallery access
- **PDF Generation**: Dynamic PDF creation with Firebase image proxy support

### Advanced Capabilities
- **Drag-and-Drop Positioning**: Visual text positioning on covers
- **Responsive Preview**: Test all breakpoints (mobile to 2XL)
- **Auto-Save**: Changes saved every 30 seconds
- **Visibility Controls**: Hide issues from public view
- **Empty State Detection**: Prevent displaying incomplete issues

## Magazine PDF Generation

The magazine includes sophisticated PDF generation with special handling for Firebase Storage images:

### Firebase Image Proxy
- **Problem**: CORS blocks Firebase images in client-side PDFs
- **Solution**: Server-side proxy at `/api/magazine/image-proxy`
- **Automatic**: `pdfGenerator.ts` detects and proxies Firebase URLs
- **Performance**: Images loaded in batches of 5 to prevent freezing

### PDF Features
- **Multi-Page Support**: Automatically splits tall content
- **Progress Tracking**: Real-time feedback during generation
- **Base64 Conversion**: All images converted for jsPDF compatibility
- **Mobile Fallback**: Generates lightweight HTML on mobile devices
- **Test Mode**: "Test PDF" button validates proxy functionality

### Implementation
```typescript
// Automatic proxy for Firebase images
if (url.includes('firebasestorage.googleapis.com')) {
  fetchUrl = `/api/magazine/image-proxy?url=${encodeURIComponent(url)}`;
}
```

## Magazine Authentication Pattern

The Magazine module requires special attention for authentication:

**Critical Requirements:**
1. **API Routes with Dynamic Params**: In Next.js 15, always await params before accessing:
   ```typescript
   // CORRECT
   export async function GET(
     request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
   ) {
     const { id } = await params; // MUST await params
   }
   
   // WRONG - Will cause errors
   export async function GET(
     request: NextRequest,
     { params }: { params: { id: string } }
   ) {
     const id = params.id; // ERROR: params not awaited
   }
   ```

2. **Client-Side API Calls**: Always include credentials for authentication:
   ```typescript
   // CORRECT - Includes cookies for authentication
   const response = await fetch('/api/magazine/issues', {
     credentials: 'include'
   });
   
   // WRONG - No authentication, will fall back to local files
   const response = await fetch('/api/magazine/issues');
   ```

3. **Server-Side Data Fetching**: For authenticated pages, fetch data server-side:
   ```typescript
   // CORRECT - Server-side authentication and data fetching
   export default async function MagazinePage({ params }) {
     const { currentUser, db } = await getAuthenticatedAppForUser();
     if (!currentUser) {
       redirect('/login?redirect=/magazine');
     }
     const data = await magazineServerService.getIssueById(db, params.id);
     return <MagazineComponent data={data} />;
   }
   ```

**Common Pitfalls to Avoid:**
- Not awaiting params in API routes (Next.js 15 requirement)
- Forgetting `credentials: 'include'` in fetch calls
- Using client-side fetching for authenticated data
- Not checking for authentication before Firestore operations

## Magazine PDF Generation & Firebase Images

The Magazine module includes PDF generation that requires special handling for Firebase Storage images:

### Firebase Image CORS Issue
When generating PDFs client-side, Firebase Storage images are blocked by CORS policies. This prevents them from being embedded in the PDF.

### Solution: Server-Side Image Proxy
We use a proxy pattern similar to our video proxy:

```typescript
// Automatic proxy usage in pdfGenerator.ts
if (img.src.includes('firebasestorage.googleapis.com')) {
  fetchUrl = `/api/magazine/image-proxy?url=${encodeURIComponent(img.src)}`;
}
```

### Key Implementation Points:
1. **Image Proxy Route** (`/api/magazine/image-proxy`): Fetches images server-side
2. **Automatic Detection**: `pdfGenerator.ts` automatically proxies Firebase URLs
3. **Base64 Conversion**: All images converted to Base64 for jsPDF compatibility
4. **Batched Loading**: Images loaded in batches of 5 to prevent freezing
5. **Progress Tracking**: Real-time feedback during PDF generation

### Testing:
- Use the "Test PDF" button to verify both local and Firebase images work
- Check console for "Using proxy for Firebase image" messages
- Monitor Network tab to see proxy requests

For detailed documentation, see [Magazine PDF Generation](/lib/pages/magazine/CLAUDE.md#pdf-generation-system)

## Key Features

### AI Integration
- **Content Generation**: Products, providers, reviews, etc.
- **Image Generation**: DALL-E 3 with Unsplash fallback
- **Brainstorming**: Business ideas and market research
- **Beauty Analysis**: AI-powered skin analysis tool

### Admin Panel
- Overview dashboard
- Brand profile management
- Products, providers, training management
- Reviews and transformations
- AI brainstorming tools
- Settings (super admin only)

### Public Pages
- Brand marketplace listing
- Individual brand showcases
- Product detail pages
- Provider profiles
- Before/after galleries

### Profile Management
- Nested navigation sidebar
- Brand setup wizard
- File upload for requirements
- Date picker integration
- Real-time progress tracking

## Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Run production server

# Code Quality
npm run lint            # Run ESLint
npm run typecheck       # TypeScript checking

# Common Tasks
curl http://localhost:3000/sample-requirements.txt -o requirements.txt
```

## API Patterns

### Authenticated Endpoints
```typescript
export async function POST(request: NextRequest) {
  const { db, currentUser } = await getAuthenticatedAppForUser();
  
  if (!currentUser || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Your logic here
  return NextResponse.json({ success: true, data });
}
```

### Firestore Operations
```typescript
// Add to brand array
await addToBrandArray(brandId, 'products', newProduct);

// Update in array
await updateInBrandArray(brandId, 'products', productId, updates);

// Remove from array
await removeFromBrandArray(brandId, 'products', productId);
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Optional
OPENAI_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Common Tasks

### Adding a New Feature
1. Add to admin tab config
2. Create component in `/lib/admin/components/`
3. Add API endpoints if needed
4. Update Firestore structure
5. Add to navigation

### Creating AI Generation
1. Add to `contentGeneratorService.ts`
2. Create API endpoint
3. Add mock data fallback
4. Integrate with UI

### Adding Detail Pages
1. Create route in `/app/brand/[id]/`
2. Build detail component
3. Add navigation from grids
4. Include breadcrumbs and sharing

## Important Guidelines

### State Management
- Redux for global auth state
- Component state for UI
- Firestore for persistence
- No prop drilling

### Performance
- Single document reads
- Loading states everywhere
- Image optimization
- Response caching

### Security
- Role-based access
- Input validation
- Data isolation
- Sanitized content

### Best Practices
- TypeScript strict mode
- Consistent error handling
- Mobile-first design
- Accessibility features

## Detailed Documentation

For comprehensive information, see the documentation directory:

### Architecture
- [Technical Stack](./documentation/architecture/technical-stack.md)
- [Database Structure](./documentation/architecture/database-structure.md)
- [Authentication](./documentation/architecture/authentication.md)
- [Application Flow](./documentation/architecture/application-flow.md)

### Features
- [Admin Panel](./documentation/features/admin-panel.md)
- [Public Pages](./documentation/features/public-pages.md)
- [Content Settings](./documentation/features/content-settings.md)
- [AI Integration](./documentation/features/ai-integration.md)

### Guides
- [Common Tasks](./documentation/guides/common-tasks.md)
- [Best Practices](./documentation/guides/best-practices.md)
- [Testing Scenarios](./documentation/guides/testing-scenarios.md)
- [Environment Setup](./documentation/guides/environment-setup.md)

### Updates
- [Latest Updates (2025-07-11)](./documentation/updates/2025-07-11-updates.md)
- [Recent Updates (2025-07-10)](./documentation/updates/2025-07-10-updates.md)
- [Previous Updates](./documentation/updates/2025-07-10-previous.md)

## Development Timeline

### Recent Milestones
1. **Profile Management System**: Complete brand management dashboard
2. **AI Image Generation**: DALL-E 3 integration with smart prompts
3. **Database Restructure**: Nested documents for better performance
4. **Content Generation**: AI-powered content for all brand aspects
5. **Magazine JSON Editor**: Dynamic JSON editing mode for all magazine sections

### Future Enhancements
- Brand verification system
- Payment integration
- Advanced analytics
- Mobile app development
- Multi-language support

## Testing Checklist

- [ ] New user signup and brand creation
- [ ] AI content generation (with/without API key)
- [ ] Profile management CRUD operations
- [ ] Public page browsing
- [ ] Mobile responsiveness
- [ ] Authentication flows
- [ ] Error handling

## Support & Resources

- Firebase Console: https://console.firebase.google.com
- OpenAI Platform: https://platform.openai.com
- Next.js Docs: https://nextjs.org/docs
- Project Repository: [Your GitHub URL]

## Important Reminders

- **No Mock Data Fallback**: Components show real Firestore data only
- **User-Brand Relationship**: One user = One brand (except super admin)
- **AI Fallbacks**: Mock data used only when OpenAI unavailable
- **Authentication**: Always use FirebaseServerApp, never Admin SDK
- **Date Format**: Store as YYYY-MM-DD, display as "Feb 2, 2024"

---

For detailed information on any topic, refer to the `/documentation/` directory.