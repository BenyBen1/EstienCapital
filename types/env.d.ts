declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_KEY: string;
      EXPO_PUBLIC_ENVIRONMENT: 'development' | 'staging' | 'production';
    }
  }
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  // ...other fields
}

// Ensure this file is treated as a module
export {};