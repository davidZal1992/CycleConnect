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
    newArchEnabled: false,
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
      bundleIdentifier: "com.davidzal1992.CycleConnect",
      googleServicesFile: "./GoogleService-Info.plist",
      language: "objc",
      associatedDomains: [
        "applinks:dev-lwik063shdh4q48o.us.auth0.com"
      ],
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        },
        NSLocationWhenInUseUsageDescription: "CycleConnect uses your location to show nearby cycling routes and meeting points.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "CycleConnect uses your location to show nearby cycling routes and meeting points."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.davidzal1992.CycleConnect",
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
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
      "@react-native-google-signin/google-signin",
      "expo-router",
      "expo-dev-client",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    schemes: [
      "cycleconnect", 
      "exp", 
      "com.googleusercontent.apps.696545960135-crhdd2fi9ngj1j4jp5af0vrao7jspenv"
    ],
    extra: {
      proxyUrl: process.env.NGROK_URL ? `${process.env.NGROK_URL}/places-proxy/autocomplete` : 'http://172.28.129.120:3000/places-proxy/autocomplete',
      eas: {
        projectId: "eecb061f-706b-4b01-b3a2-f17de4587980"
      }
    }
  }
}; 