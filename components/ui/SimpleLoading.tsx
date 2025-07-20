import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface SimpleLoadingProps {
  text?: string;
}

export function SimpleLoading({ text = 'Loading...' }: Readonly<SimpleLoadingProps>) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
