import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function IndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/welcome');
  }, []);
  return <View />;
}
