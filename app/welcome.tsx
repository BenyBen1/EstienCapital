import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSpinner text="Loading..." overlay />;
  }

  return (
    <View style={[styles.container, { backgroundColor: '#fff' }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {/* Top Section - Logo */}
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/EstienLogo2Blacktransparent.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Middle Section - Welcome Text */}
        <View style={styles.middleSection}>
          <View style={styles.welcomeContent}>
            <Text style={[styles.welcomeTitle, { color: '#000' }]}>
              Welcome to{'\n'}Estien Capital
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.primary }]}>
              Professional Digital Asset Investment Platform
            </Text>
            <Text style={[styles.welcomeDescription, { color: colors.textSecondary }]}>
              Secure access to cryptocurrency investments with expert analysis and institutional-grade portfolio management.
            </Text>
          </View>
        </View>

        {/* Bottom Section - Buttons */}
        <View style={styles.bottomSection}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.primary }]}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  middleSection: {
    flex: 0.45,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  bottomSection: {
    flex: 0.2,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 24,
  },
  welcomeContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    fontWeight: '400',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});