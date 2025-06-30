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
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/EstienLogo2Blacktransparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.overlayBox}>
          <View style={styles.welcomeContent}>
            <Text style={[styles.welcomeTitle, { color: colors.text, textShadowColor: '#0002', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 }]}
              numberOfLines={2} ellipsizeMode="tail">
              Welcome to Estien Capital
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.primary, textShadowColor: '#0002', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 2 }]}
              numberOfLines={2} ellipsizeMode="tail">
              Professional Digital Asset Investment Platform
            </Text>
            <Text style={[styles.welcomeDescription, { color: colors.textSecondary, textShadowColor: '#0001', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 2 }]}
              numberOfLines={3} ellipsizeMode="tail">
              Secure access to cryptocurrency investments with expert analysis and institutional-grade portfolio management.
            </Text>
          </View>
        </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: height * 0.1,
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
  overlayBox: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 24,
    marginVertical: 24,
    marginHorizontal: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  welcomeContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  welcomeDescription: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
    fontWeight: '500',
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 18,
    marginTop: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});