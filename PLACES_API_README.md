# Google Places API Integration for CycleConnect

This document explains how the Google Places API integration works in the CycleConnect app.

## Overview

The app uses the Google Places API for location search functionality in the ride creation flow. To avoid common networking issues in React Native (especially on iOS), we use a proxy server with ngrok to handle API requests.

## Architecture

```
React Native App → ngrok Tunnel → Local Proxy Server → Google Places API
```

This approach solves several problems:
1. Bypasses iOS App Transport Security restrictions
2. Avoids CORS issues
3. Keeps the API key on the server side
4. Works around React Native networking limitations

## Setup Instructions

### 1. Start the Proxy Server

```bash
# Install dependencies if you haven't already
npm install express cors axios ngrok --save --legacy-peer-deps

# Start the proxy server and ngrok tunnel
node start-proxy.js
```

### 2. Update the App Code

When the proxy starts, it will display a URL like this:
```
✅ Ngrok tunnel established at: https://xxxx-xxxx-xxxx.ngrok-free.app
📱 Use this URL in your app: https://xxxx-xxxx-xxxx.ngrok-free.app/places-proxy/autocomplete
```

Update the URL in `app/post-ride.tsx`:
```typescript
const NGROK_PROXY_URL = 'https://xxxx-xxxx-xxxx.ngrok-free.app/places-proxy/autocomplete';
```

### 3. Restart the App

```bash
npx expo start --clear
```

## Important Notes

- **The ngrok URL changes every time you restart the proxy server** (free tier limitation)
- The app checks if it's fully active before making API requests using the AppState context
- API keys are stored on the server side for security

## Troubleshooting

If location search isn't working:

1. Make sure the proxy server is running
2. Verify the ngrok URL is correct in the app code
3. Check the proxy server logs for errors
4. Restart the app with `npx expo start --clear`

## Future Improvements

For a production environment:
- Deploy the proxy to a permanent server (e.g., Heroku, Vercel)
- Use environment variables for API keys
- Add rate limiting and caching to the proxy server 