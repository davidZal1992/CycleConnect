# CycleConnect

CycleConnect is a React Native mobile application that allows cyclists in Israel to find and join cycling rides, create their own rides, and connect with fellow cycling enthusiasts. The app features a clean, modern UI with Hebrew language support.

## Features

- Browse and search for upcoming rides
- Create new cycling rides with detailed information
- Filter rides by type, difficulty, technical level, and more
- Location search with Google Places API integration
- Mobile-first UI design with Hebrew localization
- User profiles and ride management

## Project Structure

- `/app` - Main application screens and navigation
- `/components` - Reusable UI components
- `/constants` - App-wide constants like colors and themes
- `/assets` - Images and other static assets
- `/proxy-server.js` - Google Places API proxy for location search

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- Google Places API key (for location search)

### Environment Setup

1. Clone the repository
2. Create a `.env` file in the root directory with the following variables:
```
GOOGLE_API_KEY=your_google_places_api_key
PORT=3000
```

### Installation

```bash
# Install dependencies
npm install

# Start the proxy server (in a separate terminal)
node proxy-server.js

# In another terminal, expose the proxy server with ngrok
ngrok http 3000

# Update your .env with the ngrok URL
NGROK_URL=your_ngrok_url

# Start the Expo development server
npm start
```

## Running the Location Search Proxy

The app uses a proxy server to securely handle Google Places API requests. To use the location search feature:

1. Make sure your `.env` file has a valid `GOOGLE_API_KEY`
2. Start the proxy server: `node proxy-server.js`
3. Use ngrok to expose your local server: `ngrok http 3000`
4. Update the `NGROK_URL` in your `.env` file with the ngrok URL

## Technology Stack

- React Native / Expo
- Expo Router for navigation
- TypeScript
- Express.js (for proxy server)
- Google Places API

## License

MIT

## Authors

- David Zaltsman
