import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultPageVisibility, alwaysVisiblePages, PageConfig } from './lib/config/pageVisibility';
import { 
  extractTrackingParams, 
  extractFunctionalParams, 
  storeTrackingParams, 
  buildCleanUrl, 
  hasTrackingParams,
  formatTrackingForAnalytics 
} from './lib/utils/utmHandler';

async function getPageVisibilitySettings(request: NextRequest): Promise<PageConfig[]> {
  // Use the request's origin for server-side API calls
  const origin = request.nextUrl.origin;
  const apiUrl = `${origin}/api/settings/page-visibility`;
  
  try {
    // Always fetch fresh settings from API (no caching)
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      const text = await response.text();
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        return defaultPageVisibility;
      }
      
      if (data.success && data.settings) {
        return data.settings;
      }
    }
  } catch (error) {
    // Error fetching settings, fall back to defaults
  }

  return defaultPageVisibility;
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;
  const host = request.headers.get('host');
  
  // === UTM & TRACKING PARAMETER HANDLING ===
  // Check if the URL has tracking parameters that need to be cleaned
  if (hasTrackingParams(request.nextUrl)) {
    // Extract tracking parameters
    const trackingParams = extractTrackingParams(request.nextUrl);
    
    // Extract functional parameters to keep in URL
    const functionalParams = extractFunctionalParams(request.nextUrl);
    
    // Build clean URL with only functional parameters
    const cleanUrl = buildCleanUrl(request.nextUrl, functionalParams);
    
    // Create redirect response
    const response = NextResponse.redirect(cleanUrl);
    
    // Store tracking parameters in cookies for attribution
    storeTrackingParams(response, trackingParams);
    
    // Track the campaign arrival (server-side)
    // Note: We'll implement server-side tracking in a separate API call
    // since we can't directly call analytics from middleware
    if (Object.keys(trackingParams).length > 0) {
      // Store for later processing by analytics
      response.cookies.set({
        name: 'glamlink_track_arrival',
        value: JSON.stringify(formatTrackingForAnalytics(trackingParams)),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60, // Short-lived, just for the next request
        path: '/'
      });
    }
    
    return response;
  }
  
  // Detect if we're on the preview environment
  const isPreviewEnvironment = host === 'preview.glamlink.net';
  
  // For preview environment, bypass all visibility checks
  if (isPreviewEnvironment) {
    console.log(`[Preview Mode] Allowing access to: ${url}`);
    
    // Only block paths that truly don't exist
    const actualNonExistentPaths = [
      '/admin-old',
      '/test-page-that-does-not-exist',
    ];
    
    if (actualNonExistentPaths.includes(url)) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
    
    // Allow everything else on preview
    return NextResponse.next();
  }
  
  // Skip visibility check for API routes
  if (url.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Skip static assets (images, fonts, videos, etc.)
  if (url.startsWith('/images/') ||
      url.startsWith('/fonts/') ||
      url.startsWith('/videos/') ||
      url.startsWith('/email/') ||
      url.startsWith('/_next/') ||
      url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.gif') ||
      url.endsWith('.webp') ||
      url.endsWith('.svg') ||
      url.endsWith('.ico') ||
      url.endsWith('.css') ||
      url.endsWith('.js') ||
      url.endsWith('.map') ||
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.ogg') ||
      url.endsWith('.pdf') ||
      url.endsWith('.html')) {
    return NextResponse.next();
  }
  
  // Check page visibility settings
  const isAlwaysVisible = alwaysVisiblePages.some(page =>
    url === page || url.startsWith(page + '/')
  );

  console.log(`[MIDDLEWARE] URL: ${url}, isAlwaysVisible: ${isAlwaysVisible}`);

  if (!isAlwaysVisible) {
    // Get visibility settings from API
    const settings = await getPageVisibilitySettings(request);
    console.log(`[MIDDLEWARE] Settings loaded: ${settings.length} pages`);

    // Check if current page or its parent path should be visible
    // This allows /magazine to control /magazine/catalog and /magazine/[id]
    const isPageVisible = settings.some(page => {
      // Exact match
      if (page.path === url) {
        console.log(`[MIDDLEWARE] Exact match for ${url}: ${page.isVisible}`);
        return page.isVisible;
      }

      // Prefix match - if the page path is a prefix of the current URL
      // For example, /magazine enables /magazine/catalog and /magazine/2025-08-04
      if (url.startsWith(page.path + '/')) {
        console.log(`[MIDDLEWARE] Prefix match for ${url} with ${page.path}: ${page.isVisible}`);
        return page.isVisible;
      }

      // Dynamic route pattern matching - handle paths like /[id] or /[id]/edit
      if (page.path.includes('[') && page.path.includes(']')) {
        // Convert path pattern to regex: /[id] -> /^\/[^\/]+$/  or /[id]/edit -> /^\/[^\/]+\/edit$/
        const regexPattern = page.path
          .replace(/\[[\w]+\]/g, '[^/]+')  // Replace [id], [slug], etc. with [^/]+
          .replace(/\//g, '\\/');           // Escape forward slashes
        const regex = new RegExp(`^${regexPattern}$`);

        if (regex.test(url)) {
          console.log(`[MIDDLEWARE] Dynamic route match for ${url} with pattern ${page.path}: ${page.isVisible}`);
          return page.isVisible;
        }
      }

      return false;
    });

    console.log(`[MIDDLEWARE] Final visibility for ${url}: ${isPageVisible}`);

    // If page is not visible (either not in settings or explicitly hidden)
    if (!isPageVisible) {
      console.log(`[MIDDLEWARE] BLOCKING ${url} - redirecting to /not-found`);
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};