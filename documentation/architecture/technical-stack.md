# Technical Architecture

## Frontend Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **State Management**: Redux Toolkit with async thunks
- **Styling**: Tailwind CSS, Material-UI v6, Framer Motion
- **UI Components**: Custom component library with consistent patterns

## Backend Stack

- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Database**: Firebase Firestore with optimized nested documents
- **Storage**: Firebase Storage for images and media
- **AI Integration**: OpenAI GPT-4 for content generation
- **API Pattern**: RESTful endpoints with consistent response format

## Development Tools

- **Package Manager**: npm
- **Build Tool**: Next.js with Turbopack
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript compiler

## Architecture Patterns

### Page Structure

```
/                   → Landing page
/brand              → All brands listing (public marketplace)
/brand/[id]         → Individual brand showcase page
/brand/[id]/products/[productId]  → Product detail page
/brand/[id]/providers/[providerId] → Provider profile page
/brand/[id]/gallery/[transformationId] → Transformation detail page
/admin              → Admin panel (requires authentication)
/login              → User authentication
/signup             → New user registration
/profile            → User profile dashboard
├── /profile/dashboard     → Analytics and overview
├── /profile/brand         → Brand profile management
├── /profile/brand/products → Product catalog management
├── /profile/brand/providers → Provider directory management
├── /profile/brand/training → Training programs management
├── /profile/brand/reviews  → Customer reviews management
└── /profile/brand/brainstorm → AI brainstorming tools
/image-analysis     → AI-powered beauty analysis tool
```

### Data Flow

1. User signs up → Brand created automatically
2. User logs in → Redirected to admin panel
3. Brand owner edits in Profile tab → Updates their brand
4. Public views `/brand` → Sees all brands
5. Public views `/brand/[id]` → Sees specific brand

### State Management

- Redux for global state (auth, brand data)
- Each page module has its own slice
- Authentication state determines UI visibility
- Brand association stored in user profile