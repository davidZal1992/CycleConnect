import { auth } from "@/config/firebase";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('שגיאה', 'אנא הכנס כתובת אימייל תקינה');
      return;
    }

    try {
      setIsLoading(true);
      await auth().signInWithEmailAndPassword(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      let errorMessage = 'שגיאה בהתחברות';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'משתמש לא נמצא במערכת. אנא בדוק את כתובת האימייל או הירשם כמשתמש חדש';
          break;
        case 'auth/wrong-password':
          errorMessage = 'פרטי ההתחברות שהוזנו שגויים, אנא נסה שוב';
          break;
        case 'auth/invalid-email':
          errorMessage = 'כתובת האימייל אינה תקינה';
          break;
        case 'auth/user-disabled':
          errorMessage = 'החשבון הזה חסום. אנא פנה לתמיכה';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'יותר מדי ניסיונות התחברות. אנא המתן מספר דקות ונסה שוב';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'בעיית רשת. אנא בדוק את החיבור לאינטרנט ונסה שוב';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'פרטי ההתחברות שהוזנו שגויים, אנא נסה שוב';
          break;
        default:
          errorMessage = 'אירעה שגיאה בהתחברות. אנא נסה שוב מאוחר יותר';
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
            editable={!isLoading}
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
            editable={!isLoading}
          />
          <TouchableOpacity 
            onPress={togglePasswordVisibility} 
            style={styles.eyeIcon}
            activeOpacity={0.7}
            disabled={isLoading}
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
          disabled={isLoading}
        >
          <Text style={[styles.forgotPasswordText, { color: primaryColor }]}>שכחת סיסמה?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[
          styles.button, 
          { backgroundColor: isLoading ? Colors.light.tabIconDefault : primaryColor }
        ]}
        onPress={handleLogin}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>התחבר/י</Text>
        )}
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