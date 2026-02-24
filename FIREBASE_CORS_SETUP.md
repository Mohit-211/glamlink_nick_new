# Firebase Storage CORS Configuration

## Problem
When trying to extract video thumbnails from Firebase Storage videos in the browser, you'll encounter CORS errors:
```
Access to fetch at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Solution
Configure CORS for your Firebase Storage bucket to allow browser access.

## Setup Instructions

### Option 1: Using Google Cloud SDK (Recommended)

1. **Install Google Cloud SDK**
   - Download from: https://cloud.google.com/sdk/docs/install
   - Follow the installation instructions for your OS

2. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   ```

3. **Apply CORS Configuration**
   ```bash
   # From the web_app directory where cors.json is located
   gsutil cors set cors.json gs://glamlink-demo.firebasestorage.app
   ```

4. **Verify Configuration**
   ```bash
   gsutil cors get gs://glamlink-demo.firebasestorage.app
   ```

### Option 2: Using Google Cloud Console (No Installation Required)

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com
   - Select your project: `glamlink-demo`

2. **Open Cloud Shell**
   - Click the "Activate Cloud Shell" button (terminal icon) in the top right

3. **Create CORS Configuration**
   In the Cloud Shell, create the cors.json file:
   ```bash
   cat > cors.json << 'EOF'
   [
     {
       "origin": ["http://localhost:3000", "https://localhost:3000", "https://*.vercel.app", "https://glamlink.app", "https://www.glamlink.app"],
       "method": ["GET", "HEAD", "OPTIONS"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers"]
     }
   ]
   EOF
   ```

4. **Apply Configuration**
   ```bash
   gsutil cors set cors.json gs://glamlink-demo.firebasestorage.app
   ```

5. **Verify Configuration**
   ```bash
   gsutil cors get gs://glamlink-demo.firebasestorage.app
   ```

## CORS Configuration Explained

The `cors.json` file configures:
- **origin**: Allowed origins (localhost for development, Vercel for preview, glamlink.app for production)
- **method**: Allowed HTTP methods (GET for downloads, HEAD for metadata, OPTIONS for preflight)
- **maxAgeSeconds**: How long browsers can cache the CORS response (1 hour)
- **responseHeader**: Headers that the browser is allowed to access

## Testing

After configuring CORS:
1. Refresh your browser page
2. Clear browser cache if needed (Ctrl+Shift+R or Cmd+Shift+R)
3. Try the "Use video thumbnail" button again
4. The video thumbnail extraction should now work

## Troubleshooting

If you still get CORS errors:
1. **Check the bucket name**: Ensure you're using the correct bucket name from Firebase Console
2. **Wait a few minutes**: CORS changes can take a few minutes to propagate
3. **Clear browser cache**: Force refresh the page
4. **Check browser console**: Look for specific error messages

## Important Notes

- This configuration is **required** for any browser-based access to Firebase Storage videos
- The configuration is safe and follows Firebase best practices
- You only need to do this once per Firebase Storage bucket
- The same configuration works for development, staging, and production

## Security Considerations

The CORS configuration allows specific origins to access your storage bucket from browsers. This is safe because:
- Firebase Storage URLs still require authentication tokens
- Only specified origins are allowed
- Only GET/HEAD methods are permitted (no uploads or deletions)