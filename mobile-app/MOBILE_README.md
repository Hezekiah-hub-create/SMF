# Student Feedback Management System - Mobile App

A React Native mobile application for the Student Feedback Management System using Expo. Staff can view, manage, and respond to student feedback on the go.

## Features

- ✅ User authentication with JWT tokens
- ✅ Secure token storage using expo-secure-store
- ✅ View assigned feedback items
- ✅ Submit responses to feedback
- ✅ Real-time feedback status tracking
- ✅ Mobile-optimized UI with React Native
- ✅ Cross-platform support (iOS, Android, Web)

## Prerequisites

- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- A running instance of the backend server (on `localhost:5000` or configure the API URL)
- iOS: Xcode (for pushing to physical device or simulator)
- Android: Android Studio and ADB (for Android emulator)

## Installation

### 1. Install Dependencies

The dependencies are defined in `package.json`. To install them:

```bash
cd mobile-app
npm install
```

If you encounter peer dependency issues, use:
```bash
npm install --legacy-peer-deps
```

### 2. Configure API URL

Update `.env` or set `EXPO_PUBLIC_API_URL` environment variable:

```bash
export EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

Or in the `services/authService.js` and `services/feedbackService.js` files, update the `API_BASE_URL`.

## Running the App

### Development Server

```bash
npm start
```

This will open the Expo DevTools. You can:
- Scan the QR code with Expo Go app (iOS App Store or Google Play)
- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Press `w` to open in web browser

### iOS

```bash
npm run ios
```

Requires macOS and Xcode installed.

### Android

```bash
npm run android
```

Requires Android Studio and an Android emulator running.

### Web

```bash
npm run web
```

## Project Structure

```
mobile-app/
├── app/                    # Expo Router pages (if using navigation from app/ directory)
├── screens/               # Screen components
│   ├── LoginScreen.js      # Authentication screen
│   ├── DashboardScreen.js  # Main feedback list screen
│   └── FeedbackDetail.js   # Individual feedback detail screen
├── context/               # React Context for state management
│   └── AuthContext.js      # Authentication context and useAuth hook
├── services/              # API services
│   ├── authService.js      # Authentication API calls
│   └── feedbackService.js  # Feedback API calls
├── navigation/            # Navigation configuration
│   └── RootNavigator.js    # Root navigation setup
├── components/            # Reusable components
├── hooks/                 # Custom hooks
├── constants/             # App constants
└── package.json           # Dependencies and scripts
```

## Key Dependencies

- **expo**: React Native framework for cross-platform mobile development
- **expo-router**: File-based routing for Expo apps
- **@react-navigation/native**: Navigation library
- **react-native-gesture-handler**: Gesture handling library
- **expo-secure-store**: Secure storage for authentication tokens
- **axios**: HTTP client for API requests
- **react-native-screens**: Optimized native screens

## Authentication Flow

1. **Login**: User enters credentials on LoginScreen
2. **Token Storage**: JWT token stored securely using `expo-secure-store`
3. **Protected Routes**: Navigation switches to Main stack after authentication
4. **Token Validation**: User profile fetched on app launch
5. **Logout**: Token cleared and user redirected to LoginScreen

## API Integration

The mobile app communicates with the backend server via REST API. Key endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Feedback
- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/:id` - Get feedback details
- `POST /api/feedback/:id/response` - Submit feedback response
- `GET /api/feedback/stats` - Get feedback statistics

## Environment Variables

Create a `.env` file or set environment variables:

```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

## Development Tips

### Hot Reloading

Changes to JavaScript files reload automatically. Native module changes require app rebuild.

### Debugging

Use React Native Debugger or Chrome DevTools:
- Press `j` in Expo DevTools to open debugger
- Install React Native Debugger: `npm install --global react-native-debugger`

### Performance Optimization

- Memoize components with `React.memo()` to prevent unnecessary re-renders
- Use `FlatList` for long lists with `keyExtractor`
- Lazy load screens and images
- Profile with Expo's built-in profiler

## Testing

Run linting to check code quality:

```bash
npm run lint
```

## Troubleshooting

### "expo is not recognized" on Windows

Install Expo CLI globally:
```bash
npm install -g expo-cli
```

### QR code scanning issues
- Ensure phone is on same network as development machine
- Try opening Expo app and selecting "Enter URL Manually"
- Check firewall settings

### API connection errors
- Verify backend server is running on configured port
- Check API_BASE_URL is correct
- Use `npx expo-doctor` to diagnose issues

### Token expiration
- Token validation happens on app launch in `AuthContext`
- Expired tokens will logout user automatically
- Implement token refresh if needed in `api.interceptors.response`

## Next Steps

1. **Implement FeedbackDetail screen**: Show detailed feedback and response form
2. **Add notification support**: Push notifications for new feedback
3. **Offline support**: Use AsyncStorage for caching feedback data
4. **Advanced features**: Image uploads, geolocation tracking, voice feedback
5. **Testing**: Unit tests with Jest, E2E tests with Detox

## Contributing

Follow the project structure and naming conventions. Test changes before pushing.

## License

Proprietary - University System
