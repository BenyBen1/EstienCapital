# Estien Capital Mobile App

A professional digital asset investment platform built with React Native and Expo.

## Features

- **Authentication**: Secure login and registration with JWT tokens
- **Portfolio Management**: Real-time portfolio tracking and analytics
- **KYC Verification**: Complete identity verification flow
- **Transactions**: Deposit and withdrawal management
- **Professional UI**: Clean, institutional-grade design
- **Dark/Light Theme**: Automatic theme switching

## Tech Stack

- **Frontend**: React Native, Expo Router, TypeScript
- **Backend**: Node.js, Express, PostgreSQL (to be implemented)
- **Authentication**: JWT with refresh tokens
- **State Management**: React Context API
- **UI Components**: Custom component library
- **Charts**: React Native Chart Kit

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (for mobile testing)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Setup

Create environment files for different environments:

- `.env` - Development (already created)
- `.env.staging` - Staging environment
- `.env.production` - Production environment

## Backend Integration

The app is prepared for integration with a Node.js/Express backend with PostgreSQL. Key integration points:

### API Client
- Configured in `services/api.ts`
- Handles authentication, user management, portfolio data, and transactions
- Automatic token refresh and error handling

### Authentication Context
- JWT token management with AsyncStorage
- Automatic login state persistence
- Token refresh handling

### Required Backend Endpoints

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/user/profile
PUT  /api/user/profile
GET  /api/portfolio
GET  /api/transactions
POST /api/transactions
POST /api/kyc/submit
GET  /api/kyc/status
```

## UI Components

### Custom Components
- `Button`: Flexible button component with variants
- `Input`: Enhanced input with validation and icons
- `Card`: Consistent card layout
- `LoadingSpinner`: Loading states with overlay option

### Theme System
- Automatic dark/light mode detection
- Consistent color palette
- Professional gold and black branding

## Project Structure

```
app/                    # Expo Router pages
├── (tabs)/            # Tab navigation screens
├── auth/              # Authentication screens
├── kyc/               # KYC verification flow
└── _layout.tsx        # Root layout

components/
├── ui/                # Reusable UI components
└── ...

contexts/              # React contexts
├── AuthContext.tsx    # Authentication state
└── ThemeContext.tsx   # Theme management

services/
└── api.ts            # API client and types

types/
└── env.d.ts          # Environment variable types
```

## Development Guidelines

### Code Style
- Use TypeScript for all components
- Follow React Native best practices
- Use StyleSheet.create for styling
- Implement proper error handling

### Authentication Flow
1. User registers/logs in
2. JWT tokens stored in AsyncStorage
3. API client configured with token
4. Automatic token refresh on expiry
5. Logout clears all stored data

### KYC Integration
- Multi-step verification process
- Document upload capability
- Status tracking and updates
- Integration with backend verification

## Deployment

### Web
```bash
npm run build:web
```

### Mobile
Use Expo EAS Build for production builds:
```bash
eas build --platform all
```

## Contributing

1. Follow the established code style
2. Add proper TypeScript types
3. Test on both iOS and Android
4. Update documentation as needed

## License

Private - Estien Capital