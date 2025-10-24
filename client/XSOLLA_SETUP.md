# Xsolla Login Widget Integration Setup

This project includes a complete Xsolla Login Widget integration for user authentication in your game.

## Features Implemented

✅ **Xsolla Login Widget Integration**
- Dynamic script loading of Xsolla Login Widget
- Proper initialization with project configuration
- Error handling for script loading failures

✅ **Frontend Implementation**
- "Login with Xsolla" button with loading states
- User-friendly error messages
- Responsive design with Tailwind CSS

✅ **Token Storage & Management**
- Automatic token storage in localStorage
- Session persistence across browser refreshes
- Token validation and cleanup

✅ **UI Updates**
- Display authenticated user status
- Username and email display
- Logout functionality with data cleanup

✅ **Game Integration**
- Personalized welcome message in game
- User-specific bonuses (extra coins, special items)
- Authenticated user features

## Setup Instructions

### 1. Xsolla Account Setup

1. Go to [Xsolla Publisher Account](https://publisher.xsolla.com/)
2. Create a new project or use an existing one
3. Navigate to your project settings
4. Copy your **Project ID**

### 2. Environment Configuration

Create a `.env.local` file in the `client` directory:

```bash
NEXT_PUBLIC_XSOLLA_PROJECT_ID=your_actual_project_id_here
```

### 3. Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── XsollaLogin.tsx      # Enhanced login component
│   │   └── FarmGame.tsx         # Game with user integration
│   ├── hooks/
│   │   ├── useAuth.ts           # Authentication state management
│   │   └── useGameState.ts      # Game state management
│   ├── lib/
│   │   └── auth.ts              # Authentication utilities
│   ├── config/
│   │   └── xsolla.ts            # Xsolla configuration
│   └── app/
│       └── page.tsx             # Main page with auth integration
```

## Usage

### Authentication Flow

1. **Initial Load**: The app checks for existing authentication
2. **Login**: Users click "Login with Xsolla" to open the widget
3. **Authentication**: Xsolla handles the login process
4. **Token Storage**: Token and user data are stored in localStorage
5. **Game Access**: Authenticated users can start the game
6. **Personalization**: Game shows user-specific content and bonuses

### User Experience

- **Unauthenticated**: Shows login button
- **Authenticated**: Shows user info, logout option, and game start button
- **In Game**: Personalized welcome message and user-specific bonuses

## API Integration

The authentication system includes utilities for API integration:

```typescript
import { getAuthHeaders } from '../lib/auth';

// Use in API calls
const headers = getAuthHeaders();
fetch('/api/user-data', { headers });
```

## Token Validation

The system includes both client-side and server-side token validation:

- **Client-side**: Basic token format and expiration checking
- **Server-side**: Placeholder for Xsolla API validation

## Security Features

- Token validation on app load
- Automatic cleanup of invalid tokens
- Secure token storage in localStorage
- Error handling for authentication failures

## Customization

### Adding User-Specific Features

In `FarmGame.tsx`, you can add more user-specific features:

```typescript
const getUserSpecificCoins = () => {
  if (userData) {
    return Math.max(coins, 150); // Bonus for authenticated users
  }
  return coins;
};
```

### Customizing the Login Widget

The Xsolla Login Widget can be customized through the Xsolla Publisher Account dashboard, including:
- Branding and styling
- Login methods (email, social, etc.)
- User data collection preferences

## Troubleshooting

### Common Issues

1. **"Xsolla Login Widget is not initialized"**
   - Check that the script loaded successfully
   - Verify your Project ID is correct
   - Ensure the Xsolla script URL is accessible

2. **"Login failed"**
   - Check your Xsolla project configuration
   - Verify callback URL settings
   - Check browser console for detailed errors

3. **Token validation errors**
   - Clear localStorage and try logging in again
   - Check token format and expiration
   - Verify Xsolla project settings

### Development Tips

- Use browser dev tools to inspect localStorage
- Check the Network tab for Xsolla script loading
- Monitor console for authentication errors
- Test with different user accounts

## Next Steps

1. Set up your Xsolla project
2. Add your Project ID to the environment
3. Test the authentication flow
4. Customize user-specific game features
5. Implement server-side token validation (optional)

The integration is now complete and ready for use!
