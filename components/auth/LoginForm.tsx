import { Colors } from "@/constants/Colors";
import { auth } from "@/constants/firebase-config";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onForgotPassword?: () => void;
}

export function LoginForm({ email, setEmail, password, setPassword, onForgotPassword }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const primaryColor = Colors.light.primary;
  const textColor = Colors.light.text;
  const borderColor = Colors.light.border;
  const placeholderColor = Colors.light.tabIconDefault;
  const focusRingColor = Colors.light.focusRing;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    setIsLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'התחברות הצליחה!', 
        `ברוך הבא ${user.email}`,
        [
          {
            text: 'המשך',
            onPress: () => router.replace("/(tabs)")
          }
        ]
      );
    } catch (error: any) {
      console.error('Login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'שגיאה בהתחברות';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'משתמש לא קיים. אנא הירשם תחילה.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'סיסמה שגויה';
          break;
        case 'auth/invalid-email':
          errorMessage = 'כתובת אימייל לא תקינה';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר.';
          break;
        default:
          errorMessage = `שגיאה: ${error.message}`;
      }
      
      Alert.alert('שגיאה בהתחברות', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>אימייל</Text>
        <View style={[
          styles.inputContainer,
          emailFocused && { borderColor: primaryColor, borderWidth: 2 }
        ]}>
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
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>סיסמה</Text>
        <View style={[
          styles.inputContainer,
          passwordFocused && { borderColor: primaryColor, borderWidth: 2 }
        ]}>
          <Ionicons name="lock-closed-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
          <TextInput
            placeholder="סיסמה"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[styles.input, { color: textColor }]}
            placeholderTextColor={placeholderColor}
            textAlign="right"
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <TouchableOpacity 
            onPress={togglePasswordVisibility} 
            style={styles.eyeIcon}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={placeholderColor} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.forgotPasswordContainer}>
        <TouchableOpacity 
          onPress={() => {
            if (onForgotPassword) {
              onForgotPassword();
            } else {
              router.push('/password-recovery');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.forgotPasswordText, { color: primaryColor }]}>שכחת סיסמה?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }]}
        onPress={handleLogin}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'מתחבר...' : 'התחבר/י'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
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
    backgroundColor: Colors.light.inputBg,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    right: 12,
    zIndex: 1,
  },
  eyeIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 40,
    fontSize: 14,
    backgroundColor: Colors.light.muted,
  },
  forgotPasswordContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    height: 42,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
}); 