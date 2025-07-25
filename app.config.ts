import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: "EstienCapital",
  slug: "EstienCapital",
  description: "A financial app for Estien Capital",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/EstienLogo2Blacktransparent.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    API_BASE_URL: process.env.API_BASE_URL || "http://192.168.0.175:5000",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.estiencapital.app",
    infoPlist: {
      NSCameraUsageDescription: "This app needs access to your camera to take photos for KYC and document uploads.",
      NSPhotoLibraryUsageDescription: "This app needs access to your photo library to select images for KYC and document uploads.",
      NSPhotoLibraryAddUsageDescription: "This app needs access to save photos to your library.",
      UIViewControllerBasedStatusBarAppearance: false
    }
  },
  android: {
    permissions: ["CAMERA", "READ_MEDIA_IMAGES"],
    package: "com.estiencapital.app"
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png"
  },
  plugins: ["expo-router", "expo-font", "expo-web-browser"],
  experiments: {
    typedRoutes: true
  }
};

export default config;
