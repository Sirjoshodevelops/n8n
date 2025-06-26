# AI Employee Iframe Embedding Configuration

This document explains the security configurations that have been modified to allow AI Employee to be embedded in iframes from any domain.

## Changes Made

### 1. X-Frame-Options Header (Disabled)
**File:** `/packages/cli/src/server.ts`
- Changed `xFrameOptions` from `{ action: 'sameorigin' }` to `false`
- This removes the X-Frame-Options header entirely, allowing iframe embedding from any domain

### 2. Content Security Policy (CSP) - Frame Ancestors
**File:** `/packages/cli/src/server.ts`
- Modified CSP configuration to set `frame-ancestors: ["'self'", "*"]`
- This explicitly allows the application to be embedded in iframes from any origin

### 3. CORS Configuration (Enhanced)
**File:** `/packages/cli/src/middlewares/cors.ts`
- Modified to always set Access-Control-Allow-Origin header (even without origin header)
- Added Authorization to allowed headers list
- Ensures API calls work properly from iframe contexts

## Security Considerations

⚠️ **WARNING**: These changes reduce security by allowing:
1. **Clickjacking attacks**: Any website can embed AI Employee in an iframe
2. **Cross-origin requests**: Any domain can make API requests to AI Employee
3. **Potential data leakage**: Sensitive information might be exposed to embedding sites

## Recommendations for Production

For production environments, consider:

1. **Whitelist specific domains** instead of allowing all:
   ```javascript
   'frame-ancestors': ["'self'", "https://your-crm.com", "https://trusted-domain.com"]
   ```

2. **Use environment variables** to control iframe embedding:
   ```javascript
   const allowedFrameAncestors = process.env.ALLOWED_FRAME_ANCESTORS?.split(',') || ["'self'"];
   ```

3. **Implement additional authentication** for iframe contexts:
   - Check referrer headers
   - Use postMessage API for secure communication
   - Implement token-based authentication

4. **Monitor and log** iframe embedding attempts for security auditing

## Testing Iframe Embedding

To test iframe embedding, create an HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>AI Employee Iframe Test</title>
</head>
<body>
    <h1>AI Employee Embedded</h1>
    <iframe 
        src="http://localhost:5678" 
        width="100%" 
        height="800px"
        style="border: 1px solid #ccc;">
    </iframe>
</body>
</html>
```

## Reverting Changes

To revert to secure defaults:

1. In `/packages/cli/src/server.ts`:
   - Change `xFrameOptions: false` back to `xFrameOptions: isPreviewMode || inE2ETests || inDevelopment ? false : { action: 'sameorigin' }`
   - Remove the frame-ancestors override

2. In `/packages/cli/src/middlewares/cors.ts`:
   - Revert to checking for origin header before setting CORS headers
   - Remove Authorization from allowed headers if not needed

## Environment Variables

You can also control security headers via environment variables:

- `N8N_CONTENT_SECURITY_POLICY`: Set CSP directives as JSON string
- Example: `N8N_CONTENT_SECURITY_POLICY='{"frame-ancestors":["https://your-crm.com"]}'`

Note: The code changes override environment variable settings for frame-ancestors to ensure iframe embedding works.