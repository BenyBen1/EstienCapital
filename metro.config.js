const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure proper platform extensions resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add any additional resolver configurations for iOS compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
