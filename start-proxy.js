/**
 * ngrok Tunnel Setup for Google Places API Proxy
 * 
 * This script starts the proxy server and creates an ngrok tunnel to expose
 * it to the internet. This enables React Native apps to communicate with the
 * Google Places API through a secure proxy, bypassing CORS and App Transport
 * Security issues.
 */

const { spawn } = require('child_process');
const ngrok = require('ngrok');

// Configuration
const proxyPort = 3000;
const proxyScript = 'proxy-server.js';

// Start the proxy server
console.log(`Starting proxy server (${proxyScript})...`);
const server = spawn('node', [proxyScript], { stdio: 'inherit' });

// Function to handle server exit
const handleServerExit = (code) => {
  console.log(`Proxy server exited with code ${code}`);
  process.exit(code);
};

// Function to handle server error
const handleServerError = (err) => {
  console.error('Failed to start proxy server:', err);
  process.exit(1);
};

// Set up event listeners for the server process
server.on('exit', handleServerExit);
server.on('error', handleServerError);

// Start ngrok tunnel after a short delay to ensure server is ready
setTimeout(async () => {
  try {
    console.log('Starting ngrok tunnel...');
    const url = await ngrok.connect({
      addr: proxyPort,
      onStatusChange: status => {
        if (status === 'connected') {
          console.log('ngrok tunnel is active');
        }
      }
    });
    
    console.log(`✅ Ngrok tunnel established at: ${url}`);
    console.log(`📱 Use this URL in your app: ${url}/places-proxy/autocomplete`);
    console.log(`⚠️  Note: This URL will change if you restart this script`);
  } catch (error) {
    console.error('❌ Error starting ngrok:', error);
    server.kill();
    process.exit(1);
  }
}, 1500);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  ngrok.kill();
  server.kill();
  process.exit(0);
}); 