import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { NavigationHelper } from '@/utils/navigationHelper';
import { SimpleLoading } from '@/components/ui/SimpleLoading';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Use NavigationHelper for safer cross-platform navigation
    NavigationHelper.safeNavigate(() => {
      router.replace('/welcome');
    });
    
    // Cleanup function
    return () => {
      NavigationHelper.clearPendingNavigation();
    };
  }, [router]);

  return <SimpleLoading text="Loading..." />;
}
