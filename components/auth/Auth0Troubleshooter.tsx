import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "@/constants/auth0-config";
import { Colors } from "@/constants/Colors";
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function Auth0Troubleshooter() {
  // Generate the redirect URI the same way as in SocialLogin
  const redirectUri = __DEV__ 
    ? Linking.createURL('auth') 
    : 'cycleconnect://auth';

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "URL has been copied to clipboard");
  };

  const openAuth0Dashboard = () => {
    const url = `https://${AUTH0_DOMAIN}/dashboard`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Auth0 Configuration Issue</Text>
        <Text style={styles.subtitle}>
          Your app is trying to use a callback URL that isn't registered in Auth0
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Auth0 Details:</Text>
        <Text style={styles.infoText}>Domain: {AUTH0_DOMAIN}</Text>
        <Text style={styles.infoText}>Client ID: {AUTH0_CLIENT_ID}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Callback URL:</Text>
        <View style={styles.urlContainer}>
          <Text style={styles.urlText} selectable={true}>{redirectUri}</Text>
          <TouchableOpacity 
            style={styles.copyButton} 
            onPress={() => copyToClipboard(redirectUri)}
          >
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.note}>
          This is the exact URL that needs to be added to your Auth0 allowed callback URLs
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to fix this:</Text>
        <Text style={styles.stepText}>1. Go to the Auth0 Dashboard</Text>
        <Text style={styles.stepText}>2. Navigate to Applications → Applications</Text>
        <Text style={styles.stepText}>3. Select your application (with Client ID shown above)</Text>
        <Text style={styles.stepText}>4. Scroll down to "Application URIs" section</Text>
        <Text style={styles.stepText}>5. Add the URL above to "Allowed Callback URLs"</Text>
        <Text style={styles.stepText}>6. Also add it to "Allowed Logout URLs" and "Allowed Web Origins"</Text>
        <Text style={styles.stepText}>7. Click "Save Changes" at the bottom</Text>
        <Text style={styles.stepText}>8. Restart your Expo app</Text>
      </View>

      <TouchableOpacity style={styles.dashboardButton} onPress={openAuth0Dashboard}>
        <Text style={styles.dashboardButtonText}>Open Auth0 Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text + 'DD',
    textAlign: 'center',
    marginBottom: 8,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'monospace',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  urlText: {
    fontSize: 14,
    fontFamily: 'monospace',
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 8,
  },
  stepText: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  dashboardButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  dashboardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 