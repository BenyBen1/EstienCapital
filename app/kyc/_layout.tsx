import { Stack } from 'expo-router';
import { KYCProvider } from '@/contexts/KYCContext';

export default function KYCLayout() {
  return (
    <KYCProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="personal-details" />
        <Stack.Screen name="identification" />
        <Stack.Screen name="professional" />
        <Stack.Screen name="address" />
        <Stack.Screen name="next-of-kin" />
        <Stack.Screen name="review" />
        <Stack.Screen name="status" />
      </Stack>
    </KYCProvider>
  );
}