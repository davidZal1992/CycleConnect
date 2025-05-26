import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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

  const handleRegister = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In a real app, we would register with a backend
    alert("ההרשמה הצליחה!\nברוכים הבאים ל-CycleConnect!");
    router.push("/profile-creation");
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

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: primaryColor }]}
        onPress={handleRegister}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>צור/י חשבון</Text>
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