# Application Flow

## User Journey

### 1. **New User Onboarding**

```
User signs up → Brand created automatically → Redirected to admin panel →
Profile tab selected → User customizes brand → Starts adding content
```

### 2. **Brand Management Flow**

```
Brand owner logs in → Admin panel → Uses AI to generate content →
Customizes generated items → Publishes to public brand page
```

### 3. **Customer Discovery Flow**

```
Visitor browses /brand → Clicks on brand → Views products/services →
Explores detail pages → Books appointments or purchases
```

## Data Flow Architecture

### 1. **Authentication Layer**

- Firebase Auth handles user sessions
- Auth state stored in Redux
- Protected routes via middleware
- Session cookies for server-side auth

### 2. **Data Layer**

- Single Firestore document per brand
- All brand data nested in one document
- Atomic updates for consistency
- Real-time sync capabilities

### 3. **AI Integration Layer**

- API routes handle AI requests
- OpenAI for generation
- Fallback to mock data
- Caching for performance

### 4. **Presentation Layer**

- Server-side rendering for SEO
- Client-side navigation
- Optimistic UI updates
- Progressive enhancement

## Key User Flows

### Brand Owner Flow

1. **Registration**
   - User signs up with email/password or Google OAuth
   - Brand document created automatically
   - User profile linked to brand

2. **Brand Setup**
   - Access profile dashboard
   - Complete brand questionnaire
   - Upload requirements.txt (optional)
   - Generate initial content with AI

3. **Content Management**
   - Add/edit products, providers, etc.
   - Use AI generation for quick content
   - Preview changes before saving
   - Publish to public brand page

4. **Analytics & Growth**
   - View dashboard metrics
   - Use brainstorming tools
   - Research market topics
   - Track performance

### Customer Flow

1. **Discovery**
   - Browse all brands on /brand
   - Filter by categories
   - Search functionality
   - View brand cards

2. **Brand Exploration**
   - Visit individual brand page
   - Browse products catalog
   - View provider directory
   - Check transformations gallery

3. **Detail Views**
   - Product detail pages
   - Provider profiles
   - Before/after comparisons
   - Reviews and ratings

4. **Engagement**
   - Book appointments
   - Purchase products
   - Leave reviews
   - Share on social media

## Technical Flow

### API Request Flow

```
Client Request → Middleware (auth check) → API Route →
getAuthenticatedAppForUser() → Firestore Operation →
Response → Client Update
```

### State Management Flow

```
User Action → Dispatch Redux Action → Async Thunk →
API Call → Update Store → Component Re-render
```

### Content Generation Flow

```
User clicks "Generate with AI" → Modal Opens →
Configuration → API Call to OpenAI → Preview Results →
User Selection → Save to Firestore → Update UI
```