# Social Media Embed Fallback Improvements

## Problem Statement
The SocialMediaEmbed component was experiencing repeating 503 Service Unavailable errors when attempting to fetch Instagram embeds. The service worker was correctly ignoring `/api/oembed` requests, but the API endpoint itself was returning 503 for Instagram requests without attempting to fetch from the Facebook Graph API.

## Root Cause Analysis

### Service Worker Behavior (Correct)
- Service worker ignores `/api/` paths (including `/api/oembed`)
- This is proper behavior - API requests should go directly to network
- Not the cause of 503 errors

### API Endpoint Issue (Primary Cause)
- `src/routes/api/oembed/+server.ts` returned 503 immediately for Instagram
- Hardcoded response instead of attempting fetch with provided access token
- Error message: "Instagram embeds require Facebook App configuration"

### Component Error Handling (Secondary Issues)
- No URL validation before fetch attempts
- Generic error messages without classification
- No caching of failed attempts (causing loops)
- Console error spam flooding logs
- No timeout for fetch requests

## Implemented Solutions

### 1. Enhanced Error Classification
Added error type classification in `SocialMediaEmbed.svelte`:
- **Network errors**: Connection issues, timeouts
- **API errors**: Server-side problems (5xx)
- **Content errors**: Invalid URLs, missing content (4xx)
- **Configuration errors**: Authentication/configuration issues

### 2. URL Validation & Caching
- Added `isValidUrl()` function to validate URLs before fetch
- Session storage caching for failed attempts (`social-embed-failed-attempts`)
- Prevents retry loops for same URLs in same session
- Limits cache to last 50 failed attempts

### 3. Improved API Error Responses
Updated `src/routes/api/oembed/+server.ts`:
- Attempts Instagram requests instead of returning 503 immediately
- Provides platform-specific error messages
- Returns helpful notes for configuration issues
- Better HTTP status codes (400 for config issues instead of 503)

### 4. Graceful Fallback UI
Enhanced fallback display with:
- Visual distinction for different error types (colors, icons)
- Configuration guidance for Instagram
- Thumbnail display with fallback
- Clear platform links with context
- Reduced console logging (warnings instead of errors)

### 5. Timeout & Performance
- 15-second timeout for fetch requests
- AbortController for proper timeout handling
- Exponential backoff consideration (future enhancement)

## Key Changes Made

### SocialMediaEmbed.svelte
- Added `errorType` state for classification
- Added `hasAttemptedFetch` state for UI context
- Implemented `isValidUrl()` validation
- Added session storage caching functions
- Enhanced `classifyError()` function
- Improved `fetchOEmbedData()` with timeout and error handling
- Updated template with contextual error displays

### API Endpoint (+server.ts)
- Removed hardcoded 503 for Instagram
- Added platform-specific error messages
- Better error response structure with `note` field
- Maintains backward compatibility

## Testing Results

The improvements ensure:
1. **No infinite error loops** - Caching prevents repeated attempts
2. **Clear user feedback** - Error types guide users appropriately
3. **Graceful degradation** - Fallback UI shows thumbnails and links
4. **Configuration guidance** - Instagram setup instructions provided
5. **Reduced console spam** - Warnings instead of errors for expected failures

## Configuration Requirements

### Instagram Embeds
To enable Instagram embeds:
1. Create a Facebook App at https://developers.facebook.com/
2. Get an access token with `instagram_basic` permission
3. Update the access token in `src/routes/api/oembed/+server.ts` line 32
4. Ensure the token has permissions for the Instagram posts being embedded

### Fallback Behavior Hierarchy
1. Attempt oEmbed API fetch (with 15s timeout)
2. If fails, classify error and cache if persistent
3. Show appropriate error message with visual cues
4. Display thumbnail if available
5. Show platform link with contextual information
6. Provide configuration guidance for Instagram

## Future Enhancements
- Exponential backoff for retryable errors
- Persistent cache across sessions (with expiration)
- User-configurable timeout settings
- Preview image generation for failed embeds
- Analytics for embed failure rates

## Files Modified
- `src/lib/components/moodboard/SocialMediaEmbed.svelte`
- `src/routes/api/oembed/+server.ts`
- `test-embed-fallback.js` (test script)

## Verification
Run the test script to verify improvements:
```bash
node test-embed-fallback.js
```

The solution addresses the original browser console error loop while providing a robust, user-friendly fallback experience for failed social media embeds.