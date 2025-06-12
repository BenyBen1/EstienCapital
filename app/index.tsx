import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: '#fff' }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/Estien Logo 2 Black transparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.welcomeContent}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Welcome to Estien Capital
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Professional digital asset investment platform
          </Text>
          <Text style={[styles.welcomeDescription, { color: colors.textSecondary }]}>
            Secure access to cryptocurrency investments with expert analysis and institutional-grade portfolio management
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              Create Account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Log In
            </Text>
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
  welcomeContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 16,
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