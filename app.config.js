import 'dotenv/config';

export default {
  expo: {
    name: "CycleConnect",
    slug: "cycle-connect",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "cycleconnect",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cycleconnect.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.cycleconnect.app"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Safe to include in client code - not sensitive
      proxyUrl: process.env.NGROK_URL ? `${process.env.NGROK_URL}/places-proxy/autocomplete` : 'http://localhost:3000/places-proxy/autocomplete',
      eas: {
        projectId: "your-project-id"
      }
    }
  }
}; 