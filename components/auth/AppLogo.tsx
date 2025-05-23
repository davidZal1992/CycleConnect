import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
// @ts-ignore
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function AppLogo() {
  const primaryColor = Colors.light.primary;
  const gradientColors: [string, string] = [Colors.light.primary, Colors.light.secondary];
  const secondaryTextColor = Colors.light.icon;

  return (
    <View style={styles.logoContainer}>
      <View style={[styles.logoCircle, { backgroundColor: primaryColor }]}>
        <Ionicons name="bicycle" size={32} color="white" />
      </View>
      <MaskedView
        maskElement={
          <Text style={styles.appTitle}>CycleConnect</Text>
        }
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.appTitle, { opacity: 0 }]}>CycleConnect</Text>
        </LinearGradient>
      </MaskedView>
      <Text style={[styles.appSubtitle, { color: secondaryTextColor }]}>
        מצא את שותפי הרכיבה המושלמים שלך
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
}); 