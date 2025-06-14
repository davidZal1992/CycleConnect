const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs');

// This fixes the "Component auth has not been registered yet" error in Expo Go
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig; 