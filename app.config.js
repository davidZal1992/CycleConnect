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
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cycleconnect.app",
      associatedDomains: [
        "applinks:dev-lwik063shdh4q48o.us.auth0.com"
      ]
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.cycleconnect.app",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "cycleconnect"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-web-browser",
        {
          "maybeCompleteAuthSession": true
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    scheme: "cycleconnect",
    schemes: ["cycleconnect", "exp"],
    extra: {
      proxyUrl: process.env.NGROK_URL ? `${process.env.NGROK_URL}/places-proxy/autocomplete` : 'http://172.28.129.120:3000/places-proxy/autocomplete',
      eas: {
        projectId: "your-project-id"
      }
    }
  }
}; 