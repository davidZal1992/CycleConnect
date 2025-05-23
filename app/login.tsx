import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppLogo } from "@/components/auth/AppLogo";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SocialLogin } from "@/components/auth/SocialLogin";
import { Colors } from "@/constants/Colors";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const primaryColor = Colors.light.primary;
  const backgroundColor = Colors.light.background;
  const cardBackgroundColor = Colors.light.card;
  const mutedBackgroundColor = Colors.light.muted;
  const inactiveTabTextColor = Colors.light.icon; 

  // Colors for gradient background - exact match with web version
  const bikeBlueLight = 'rgba(52, 152, 219, 0.05)'; 
  const bikeGreenLight = 'rgba(46, 204, 113, 0.05)';

  const switchTab = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <LinearGradient
      colors={[bikeBlueLight, backgroundColor, bikeGreenLight]}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          <AppLogo />

          <ThemedView style={styles.card}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[
                  styles.tabButton,
                  activeTab === "login" 
                    ? [styles.activeTab, { backgroundColor: cardBackgroundColor }]
                    : { backgroundColor: 'transparent' }
                ]}
                onPress={() => switchTab("login")}
                activeOpacity={0.7}
              >
                <ThemedText style={[
                  styles.tabText, 
                  activeTab === "login" 
                    ? styles.activeTabText 
                    : { color: inactiveTabTextColor }
                ]}>התחברות</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.tabButton, 
                  activeTab === "register" 
                    ? [styles.activeTab, { backgroundColor: cardBackgroundColor }]
                    : { backgroundColor: 'transparent' }
                ]}
                onPress={() => switchTab("register")}
                activeOpacity={0.7}
              >
                <ThemedText style={[
                  styles.tabText, 
                  activeTab === "register" 
                    ? styles.activeTabText 
                    : { color: inactiveTabTextColor }
                ]}>הרשמה</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              {activeTab === "login" ? (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                />
              ) : (
                <RegisterForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  name={name}
                  setName={setName}
                />
              )}

              <SocialLogin />

              <View style={styles.termsContainer}>
                <ThemedText style={styles.termsText}>
                  בהמשך, אתה מסכים ל{" "}
                  <ThemedText 
                    style={styles.termsLink}
                    onPress={() => alert("תנאי השירות יהיו זמינים בקרוב")}
                  >
                    תנאי השירות
                  </ThemedText>
                  {" "}ו{" "}
                  <ThemedText 
                    style={styles.termsLink}
                    onPress={() => alert("מדיניות פרטיות תהיה זמינה בקרוב")}
                  >
                    מדיניות פרטיות
                  </ThemedText>
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    marginVertical: 24,
  },
  card: {
    borderRadius: 16,
    overflow: "visible",
    backgroundColor: Colors.light.card,
    padding: 20,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light.muted,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    borderBottomColor: Colors.light.primary,
    borderBottomWidth: 2,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  cardContent: {
    paddingTop: 8,
  },
  termsContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  termsText: {
    fontSize: 13,
    textAlign: "center",
    color: Colors.light.text,
  },
  termsLink: {
    color: Colors.light.primary,
    textDecorationLine: "underline",
    fontSize: 13,
  },
}); 