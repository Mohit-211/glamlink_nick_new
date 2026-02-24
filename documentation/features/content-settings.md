# Content Settings System

The content settings system provides dynamic control over page visibility and content without requiring code deployments. This allows administrators to hide/show pages and edit content in real-time.

## Overview

- **Purpose**: Control which pages are visible to users and manage page content
- **Access**: Restricted to authorized administrators only
- **Location**: `/content-settings` (requires authentication)
- **Authorized Users**: Listed in `ALLOWED_EMAILS` array

## Architecture

### 1. **Page Visibility Configuration** (`/lib/config/pageVisibility.ts`)

```typescript
interface PageConfig {
  path: string;        // URL path of the page
  name: string;        // Display name
  description: string; // Brief description
  isVisible: boolean;  // Visibility state
}
```

- **defaultPageVisibility**: Array of pages that can be toggled
- **alwaysVisiblePages**: Core pages that cannot be hidden (/, /login, /signup, etc.)

### 2. **Content Settings Service** (`/lib/services/contentSettings.ts`)

- Manages communication with the API
- Caches settings for performance (5-minute cache)
- Falls back to localStorage if API is unavailable
- Handles import/export functionality

### 3. **Middleware Enforcement** (`/middleware.ts`)

- Checks page visibility on every request
- Returns 404 for hidden pages
- Bypasses check for always-visible pages
- Maintains security and consistency

### 4. **Admin Interface** (`/app/content-settings/page.tsx`)

Two main tabs:
- **Page Visibility**: Toggle pages on/off
- **Page Content**: Edit text, images, and other content (currently supports Home and For Clients pages)

## How It Works

1. **Default State**: Most pages are hidden by default for new installations
2. **Admin Access**: Authorized users sign in to access settings
3. **Real-time Updates**: Changes take effect immediately without deployment
4. **Persistence**: Settings are stored in Firebase and cached locally
5. **Fallback**: If Firebase is unavailable, uses localStorage

## Managing Pages

### Visibility Controls:
- **Toggle Switch**: Turn pages on/off instantly
- **Live Status**: Shows current state (Live/Hidden)
- **Preview Links**: Quick access to view pages
- **Batch Operations**: Export/import settings as JSON

### Available Actions:
- **Save Changes**: Persist current settings
- **Reset to Default**: Return all pages to hidden state
- **Export Settings**: Download current configuration
- **Import Settings**: Upload saved configuration

## Adding New Pages

To add a new page to the content settings system:

1. **Add to Configuration** (`/lib/config/pageVisibility.ts`):
```typescript
{
  path: '/new-page',
  name: 'New Page',
  description: 'Description of the page',
  isVisible: false // Usually hidden by default
}
```

2. **Decide Visibility**:
   - Add to `defaultPageVisibility` for toggleable pages
   - Add to `alwaysVisiblePages` if it should never be hidden

3. **Automatic Integration**:
   - Page appears in admin panel immediately
   - Middleware automatically enforces visibility
   - No additional code needed

## Magazine Page Integration

The Magazine page has been added to the content settings:
- **Path**: `/magazine`
- **Description**: "Trending profiles, new products, and product highlights"
- **Default State**: Hidden (can be toggled by admins)
- **Features**: Shows aggregated content from all brands with mock data fallback

## Security Considerations

1. **Authentication Required**: Only logged-in users can access settings
2. **Email Whitelist**: Only specific emails have permission
3. **No Code Access**: Changes don't affect application code
4. **Audit Trail**: All changes can be tracked via Firebase

## Best Practices

1. **Test Before Going Live**: Use preview links to check pages
2. **Backup Settings**: Export before major changes
3. **Coordinate Changes**: Inform team when toggling pages
4. **Monitor Impact**: Check analytics after visibility changes

## Technical Implementation

### API Endpoints

- `GET /api/content-settings`: Fetch current settings
- `POST /api/content-settings`: Update settings
- `POST /api/content-settings/reset`: Reset to defaults

### Caching Strategy

- Client-side: 5-minute cache
- Server-side: Real-time from Firebase
- LocalStorage: Offline fallback

### Performance Impact

- Minimal overhead on requests
- Cached for performance
- No database queries for static checks