import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  overlay?: boolean;
}

export function LoadingSpinner({ size = 'large', text, overlay = false }: Readonly<LoadingSpinnerProps>) {
  const { colors } = useTheme();

  const content = (
    <View style={[
      styles.container, 
      overlay && styles.overlay,
      overlay && Platform.OS === 'ios' && styles.iosOverlay
    ]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {text && (
        <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
      )}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  iosOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});