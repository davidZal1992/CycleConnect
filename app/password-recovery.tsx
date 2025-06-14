import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type RecoveryStep = 'email' | 'sent' | 'reset';

export default function PasswordRecoveryScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const primaryColor = Colors.light.primary;
  const backgroundColor = Colors.light.background;
  const cardBackgroundColor = Colors.light.card;
  const textColor = Colors.light.text;
  const borderColor = Colors.light.border;
  const placeholderColor = Colors.light.tabIconDefault;

  // Colors for gradient background - matching login screen
  const bikeBlueLight = 'rgba(52, 152, 219, 0.05)'; 
  const bikeGreenLight = 'rgba(46, 204, 113, 0.05)';

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert("שגיאה", "אנא הכנס כתובת אימייל");
      return;
    }

    if (!email.includes('@')) {
      Alert.alert("שגיאה", "אנא הכנס כתובת אימייל תקינה");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    try {
      // TODO: Implement your email sending logic here
      // Options:
      // 1. EmailJS: emailjs.send(serviceId, templateId, { email, resetLink })
      // 2. Firebase: auth().sendPasswordResetEmail(email)
      // 3. Your backend API: fetch('/api/password-reset', { method: 'POST', body: { email }})
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentStep('sent');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("שגיאה", "אירעה שגיאה בשליחת האימייל. אנא נסה שוב מאוחר יותר.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert("שגיאה", "אנא הכנס סיסמה חדשה");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("שגיאה", "הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("שגיאה", "הסיסמאות אינן תואמות");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    try {
      // TODO: Implement password reset logic here
      // This would typically involve:
      // 1. Validating the reset token from the email link
      // 2. Updating the password in your backend
      // 3. Redirecting to login
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "הצלחה!",
        "הסיסמה שונתה בהצלחה. אנא התחבר עם הסיסמה החדשה.",
        [
          {
            text: "התחבר",
            onPress: () => router.replace('/login')
          }
        ]
      );
    } catch (error) {
      Alert.alert("שגיאה", "אירעה שגיאה בשינוי הסיסמה. אנא נסה שוב מאוחר יותר.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerContainer}>
        <Ionicons name="mail-outline" size={48} color={primaryColor} style={styles.headerIcon} />
        <ThemedText style={styles.stepTitle}>שחזור סיסמה</ThemedText>
        <ThemedText style={styles.stepDescription}>
          הכנס את כתובת האימייל שלך ונשלח לך קישור לשחזור הסיסמה
        </ThemedText>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>כתובת אימייל</Text>
          <View style={[
            styles.inputContainer,
            { borderColor },
            emailFocused && { borderColor: primaryColor, borderWidth: 2 }
          ]}>
            <Ionicons name="mail-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
            <TextInput
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: textColor }]}
              placeholderTextColor={placeholderColor}
              textAlign="right"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              editable={!isLoading}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.button, 
            { backgroundColor: primaryColor },
            isLoading && styles.buttonDisabled
          ]}
          onPress={handleSendResetEmail}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.buttonText}>שולח...</Text>
          ) : (
            <Text style={styles.buttonText}>שלח קישור לשחזור</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerContainer}>
        <Ionicons name="checkmark-circle" size={48} color="#4CAF50" style={styles.headerIcon} />
        <ThemedText style={styles.stepTitle}>אימייל נשלח!</ThemedText>
        <ThemedText style={styles.stepDescription}>
          שלחנו קישור לשחזור סיסמה לכתובת: {email}
        </ThemedText>
        <ThemedText style={[styles.stepDescription, styles.additionalInfo]}>
          בדוק את תיבת הדואר שלך (כולל ספאם) ולחץ על הקישור לשחזור הסיסמה.
        </ThemedText>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={() => setCurrentStep('email')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>שלח שוב</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, { borderColor }]}
          onPress={() => setCurrentStep('reset')}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryButtonText, { color: primaryColor }]}>
            כבר יש לי קוד? הכנס סיסמה חדשה
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResetStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerContainer}>
        <Ionicons name="lock-closed-outline" size={48} color={primaryColor} style={styles.headerIcon} />
        <ThemedText style={styles.stepTitle}>סיסמה חדשה</ThemedText>
        <ThemedText style={styles.stepDescription}>
          הכנס את הסיסמה החדשה שלך
        </ThemedText>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>סיסמה חדשה</Text>
          <View style={[
            styles.inputContainer,
            { borderColor },
            newPasswordFocused && { borderColor: primaryColor, borderWidth: 2 }
          ]}>
            <Ionicons name="lock-closed-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
            <TextInput
              placeholder="סיסמה חדשה"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              style={[styles.input, { color: textColor }]}
              placeholderTextColor={placeholderColor}
              textAlign="right"
              onFocus={() => setNewPasswordFocused(true)}
              onBlur={() => setNewPasswordFocused(false)}
              editable={!isLoading}
            />
            <TouchableOpacity 
              onPress={toggleNewPasswordVisibility} 
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={placeholderColor} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: textColor }]}>אימות סיסמה</Text>
          <View style={[
            styles.inputContainer,
            { borderColor },
            confirmPasswordFocused && { borderColor: primaryColor, borderWidth: 2 }
          ]}>
            <Ionicons name="lock-closed-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
            <TextInput
              placeholder="הכנס שוב את הסיסמה"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={[styles.input, { color: textColor }]}
              placeholderTextColor={placeholderColor}
              textAlign="right"
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
              editable={!isLoading}
            />
            <TouchableOpacity 
              onPress={toggleConfirmPasswordVisibility} 
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={placeholderColor} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.button, 
            { backgroundColor: primaryColor },
            isLoading && styles.buttonDisabled
          ]}
          onPress={handleResetPassword}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.buttonText}>משנה סיסמה...</Text>
          ) : (
            <Text style={styles.buttonText}>שנה סיסמה</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 'email':
        return renderEmailStep();
      case 'sent':
        return renderSentStep();
      case 'reset':
        return renderResetStep();
      default:
        return renderEmailStep();
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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <ThemedView style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor }]}>
            {getCurrentStepContent()}
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
    padding: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
  },
  stepContainer: {
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    color: Colors.light.tabIconDefault,
  },
  additionalInfo: {
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
  formContainer: {
    width: '100%',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: Colors.light.background,
  },
  inputIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 