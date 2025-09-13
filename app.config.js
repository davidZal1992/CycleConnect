import 'dotenv/config';

export default {
  expo: {
    extra: {
      "eas": {
        "projectId": "eecb061f-706b-4b01-b3a2-f17de4587980"
      }
    },
    owner:"davidzal1992",
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
      bundleIdentifier: "com.cycleconnect.app"
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
    schemes: ["cycleconnect", "exp"],
  }
}; 