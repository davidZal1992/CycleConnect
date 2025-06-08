import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppLogo } from "@/components/auth/AppLogo";
import { SocialLogin } from "@/components/auth/FirebaseSocialLogin";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Colors } from "@/constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'sent' | 'reset'>('email');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const primaryColor = Colors.light.primary;
  const backgroundColor = Colors.light.background;
  const cardBackgroundColor = Colors.light.card;
  const mutedBackgroundColor = Colors.light.muted;
  const inactiveTabTextColor = Colors.light.icon;
  const textColor = Colors.light.text;
  const placeholderColor = Colors.light.text + '80';

  // Colors for gradient background - exact match with web version
  const bikeBlueLight = 'rgba(52, 152, 219, 0.05)'; 
  const bikeGreenLight = 'rgba(46, 204, 113, 0.05)';

  const switchTab = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    // Reset recovery step when switching away from recovery tab
    if (tab !== "recovery") {
      setRecoveryStep('email');
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab("recovery");
    setRecoveryStep('email');
  };

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      alert("אנא הכנס כתובת אימייל");
      return;
    }

    if (!email.includes('@')) {
      alert("אנא הכנס כתובת אימייל תקינה");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    try {
      // TODO: Implement your email sending logic here
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRecoveryStep('sent');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      alert("אירעה שגיאה בשליחת האימייל. אנא נסה שוב מאוחר יותר.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      alert("אנא הכנס סיסמה חדשה");
      return;
    }

    if (newPassword.length < 6) {
      alert("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("הסיסמאות אינן תואמות");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    try {
      // TODO: Implement password reset logic here
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("הסיסמה שונתה בהצלחה! אנא התחבר עם הסיסמה החדשה.");
      
      // Switch back to login tab
      setActiveTab("login");
      setRecoveryStep('email');
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert("אירעה שגיאה בשינוי הסיסמה. אנא נסה שוב מאוחר יותר.");
    } finally {
      setIsLoading(false);
    }
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
                  onForgotPassword={handleForgotPassword}
                />
              ) : activeTab === "register" ? (
                <RegisterForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  name={name}
                  setName={setName}
                />
              ) : (
                // Password Recovery Tab
                <View style={styles.recoveryContainer}>
                  {recoveryStep === 'email' && (
                    <>
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>אימייל</Text>
                        <View style={[styles.inputContainer, { backgroundColor: Colors.light.muted }]}>
                          <Ionicons name="mail-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
                          <TextInput
                            placeholder="אימייל"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={[styles.input, { color: textColor }]}
                            placeholderTextColor={placeholderColor}
                            textAlign="right"
                            editable={!isLoading}
                          />
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={[styles.loginButton, { backgroundColor: primaryColor }]}
                        onPress={handleSendResetEmail}
                        activeOpacity={0.8}
                        disabled={isLoading}
                      >
                        <Text style={styles.loginButtonText}>
                          {isLoading ? 'שולח...' : 'שלח קישור לשחזור'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {recoveryStep === 'sent' && (
                    <>
                      <View style={styles.successHeader}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" style={styles.successIcon} />
                        <ThemedText style={styles.successTitle}>אימייל נשלח!</ThemedText>
                      </View>
                      <ThemedText style={styles.recoveryText}>
                        שלחנו קישור לשחזור סיסמה לכתובת: <Text style={styles.boldEmail}>{email}</Text>
                      </ThemedText>
                      <ThemedText style={styles.recoverySubText}>
                        בדוק את תיבת הדואר שלך (כולל ספאם) ולחץ על הקישור לשחזור הסיסמה.
                      </ThemedText>

                      <TouchableOpacity 
                        style={[styles.loginButton, { backgroundColor: primaryColor }]}
                        onPress={() => setRecoveryStep('email')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.loginButtonText}>שלח שוב</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => setRecoveryStep('reset')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.secondaryButtonText, { color: primaryColor }]}>
                          יש לי קוד? הכנס סיסמה חדשה
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {recoveryStep === 'reset' && (
                    <>
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>סיסמה חדשה</Text>
                        <View style={[styles.inputContainer, { backgroundColor: Colors.light.muted }]}>
                          <Ionicons name="lock-closed-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
                          <TextInput
                            placeholder="סיסמה חדשה"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={true}
                            style={[styles.input, { color: textColor }]}
                            placeholderTextColor={placeholderColor}
                            textAlign="right"
                            editable={!isLoading}
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>אימות סיסמה</Text>
                        <View style={[styles.inputContainer, { backgroundColor: Colors.light.muted }]}>
                          <Ionicons name="lock-closed-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
                          <TextInput
                            placeholder="הכנס שוב את הסיסמה"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={true}
                            style={[styles.input, { color: textColor }]}
                            placeholderTextColor={placeholderColor}
                            textAlign="right"
                            editable={!isLoading}
                          />
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={[styles.loginButton, { backgroundColor: primaryColor }]}
                        onPress={handleResetPassword}
                        activeOpacity={0.8}
                        disabled={isLoading}
                      >
                        <Text style={styles.loginButtonText}>
                          {isLoading ? 'משנה סיסמה...' : 'שנה סיסמה'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
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
  recoveryContainer: {
    marginBottom: 16,
  },
  recoveryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: Colors.light.text,
  },
  recoveryText: {
    fontSize: 14,
    textAlign: "center",
    color: Colors.light.text,
    marginBottom: 16,
  },
  recoverySubText: {
    fontSize: 14,
    textAlign: "center",
    color: Colors.light.text,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: Colors.light.text,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: Colors.light.border,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    right: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 40,
    fontSize: 14,
  },
  loginButton: {
    height: 42,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    height: 42,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 4,
  },
  successIcon: {
    marginRight: 4,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  boldEmail: {
    fontWeight: 'bold',
  },
}); 