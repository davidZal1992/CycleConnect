import { auth } from "@/config/firebase";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
}

export function RegisterForm({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  name, 
  setName 
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
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

  const handleRegister = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס שם מלא');
      return;
    }

    if (!email.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס כתובת אימייל');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('שגיאה', 'אנא הכנס כתובת אימייל תקינה');
      return;
    }

    if (!password.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס סיסמה');
      return;
    }

    if (password.length < 6) {
      Alert.alert('שגיאה', 'הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      console.log('🔥 Attempting to create user with email:', email);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('🔥 User created successfully:', userCredential.user?.email);
      
      // Update the user's display name
      if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: name
        });
        console.log('🔥 User profile updated with name:', name);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/profile-creation");
    } catch (error: any) {
      console.error('🔥 Registration error:', error);
      
      let errorMessage = 'שגיאה בהרשמה';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'כתובת אימייל זו כבר בשימוש. אנא השתמש בכתובת אחרת או התחבר.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'כתובת אימייל לא תקינה.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'הסיסמה חלשה מדי. אנא בחר סיסמה חזקה יותר.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'בעיית רשת. אנא בדוק את החיבור לאינטרנט.';
      }
      
      Alert.alert('שגיאה', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>שם מלא</Text>
        <View style={[
          styles.inputContainer,
          nameFocused && { borderColor: primaryColor, borderWidth: 2 }
        ]}>
          <Ionicons name="person-outline" size={20} color={placeholderColor} style={styles.inputIcon} />
          <TextInput
            placeholder="שם מלא"
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: textColor }]}
            placeholderTextColor={placeholderColor}
            textAlign="right"
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            editable={!isLoading}
          />
        </View>
      </View>

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

      <TouchableOpacity 
        style={[
          styles.button, 
          { backgroundColor: isLoading ? Colors.light.tabIconDefault : primaryColor }
        ]}
        onPress={handleRegister}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>צור/י חשבון</Text>
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
    paddingHorizontal: 40, // Adjusted for icon
    fontSize: 14,
    backgroundColor: Colors.light.muted, // Gray input background
  },
  button: {
    height: 42,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8, // Added margin for spacing from the last input field
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
}); 