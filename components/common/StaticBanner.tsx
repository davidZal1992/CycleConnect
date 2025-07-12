import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// Static image source - never changes
const BANNER_IMAGE_SOURCE = require('@/assets/images/cyclists.jpg');

// Completely static banner component - never re-renders
export const StaticBanner = React.memo(() => {
  console.log('🖼️ StaticBanner rendered - this should only appear ONCE');
  return (
    <View style={styles.bannerContainer}>
      <Image
        source={BANNER_IMAGE_SOURCE}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerOverlay}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerMainText}>מעכשיו</Text>
          <Text style={styles.bannerSubText}>מפסיקים לרכב לבד</Text>
        </View>
      </View>
    </View>
  );
});

// Set display name for debugging
StaticBanner.displayName = 'StaticBanner';

// Static banner styles - never change
const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerTextContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  bannerMainText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 2,
  },
  bannerSubText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    opacity: 0.95,
  },
}); 