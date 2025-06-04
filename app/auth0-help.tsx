import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Auth0HelpScreen() {
  const router = useRouter();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const redirectUri = __DEV__ 
    ? Linking.createURL('auth')
    : 'cycleconnect://auth';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Auth0 Configuration Help</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color={Colors.light.primary} />
            <ThemedText style={styles.sectionTitle}>Common Issues</ThemedText>
          </View>
          
          <ThemedText style={styles.text}>
            If Google sign-in isn't working, it's likely due to one of these configuration issues:
          </ThemedText>
          
          <View style={styles.issueList}>
            <ThemedText style={styles.bulletPoint}>• Google OAuth2 connection not set up in Auth0</ThemedText>
            <ThemedText style={styles.bulletPoint}>• Missing or incorrect callback URLs</ThemedText>
            <ThemedText style={styles.bulletPoint}>• Invalid Google Client ID/Secret</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={20} color={Colors.light.primary} />
            <ThemedText style={styles.sectionTitle}>Required Callback URLs</ThemedText>
          </View>
          
          <ThemedText style={styles.text}>
            Add these URLs to your Auth0 application's "Allowed Callback URLs":
          </ThemedText>
          
          <View style={styles.urlContainer}>
            <ThemedText style={styles.urlLabel}>Development URL:</ThemedText>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(redirectUri, 'dev')}
            >
              <ThemedText style={styles.urlText}>{redirectUri}</ThemedText>
              <Ionicons 
                name={copiedText === 'dev' ? "checkmark" : "copy"} 
                size={16} 
                color={Colors.light.primary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.urlContainer}>
            <ThemedText style={styles.urlLabel}>Production URL:</ThemedText>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard('cycleconnect://auth', 'prod')}
            >
              <ThemedText style={styles.urlText}>cycleconnect://auth</ThemedText>
              <Ionicons 
                name={copiedText === 'prod' ? "checkmark" : "copy"} 
                size={16} 
                color={Colors.light.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={Colors.light.primary} />
            <ThemedText style={styles.sectionTitle}>Step-by-Step Fix</ThemedText>
          </View>
          
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Open Auth0 Dashboard</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Go to dev-lwik063shdh4q48o.us.auth0.com and log in
                </ThemedText>
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => Linking.openURL('https://dev-lwik063shdh4q48o.us.auth0.com')}
                >
                  <ThemedText style={styles.linkText}>Open Dashboard</ThemedText>
                  <Ionicons name="open-outline" size={16} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Configure Google Connection</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Go to Connections → Social → Google OAuth2 and configure:
                </ThemedText>
                <View style={styles.subSteps}>
                  <ThemedText style={styles.subStep}>• Add your Google Client ID</ThemedText>
                  <ThemedText style={styles.subStep}>• Add your Google Client Secret</ThemedText>
                  <ThemedText style={styles.subStep}>• Enable the connection</ThemedText>
                  <ThemedText style={styles.subStep}>• Set scopes: email, profile, openid</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Update Application Settings</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Go to Applications → CycleConnect → Settings and:
                </ThemedText>
                <View style={styles.subSteps}>
                  <ThemedText style={styles.subStep}>• Add the callback URLs above</ThemedText>
                  <ThemedText style={styles.subStep}>• Save changes</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>4</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Test Authentication</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Return to the app and try Google sign-in again
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={20} color={Colors.light.primary} />
            <ThemedText style={styles.sectionTitle}>Still Having Issues?</ThemedText>
          </View>
          
          <ThemedText style={styles.text}>
            If you're still experiencing problems:
          </ThemedText>
          
          <View style={styles.issueList}>
            <ThemedText style={styles.bulletPoint}>• Check your Google Cloud Console for correct OAuth settings</ThemedText>
            <ThemedText style={styles.bulletPoint}>• Verify your bundle ID matches in all configurations</ThemedText>
            <ThemedText style={styles.bulletPoint}>• Try testing on a physical device instead of simulator</ThemedText>
            <ThemedText style={styles.bulletPoint}>• Clear app data and try again</ThemedText>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => {
            router.back();
            Alert.alert('Ready to Test', 'Configuration updated. Try Google sign-in again.');
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <ThemedText style={styles.testButtonText}>I've Updated Configuration</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  issueList: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  urlContainer: {
    marginBottom: 12,
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: Colors.light.muted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  urlText: {
    fontSize: 12,
    fontFamily: 'monospace',
    flex: 1,
    marginRight: 8,
  },
  stepsList: {
    marginTop: 8,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  linkText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  subSteps: {
    marginLeft: 8,
  },
  subStep: {
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 