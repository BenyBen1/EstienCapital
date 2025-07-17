import { Platform } from 'react-native';

/**
 * Navigation helper utility for iOS/Android compatibility
 */
export class NavigationHelper {
  private static navigationTimeout: ReturnType<typeof setTimeout> | null = null;
  
  /**
   * Safe navigation with platform-specific delays
   */
  static safeNavigate(navigationFn: () => void, delay: number = 100): void {
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }
    
    // Longer delay for iOS to ensure proper mounting
    const platformDelay = Platform.OS === 'ios' ? Math.max(delay, 150) : delay;
    
    this.navigationTimeout = setTimeout(() => {
      try {
        navigationFn();
      } catch (error) {
        console.error('Navigation error:', error);
        // Retry after a longer delay
        setTimeout(() => {
          try {
            navigationFn();
          } catch (retryError) {
            console.error('Navigation retry failed:', retryError);
          }
        }, 500);
      }
    }, platformDelay);
  }
  
  /**
   * Clear any pending navigation timeouts
   */
  static clearPendingNavigation(): void {
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
      this.navigationTimeout = null;
    }
  }
}
