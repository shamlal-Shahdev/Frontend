# API Integration Guide

This directory contains all API integration files for the WattsUp Energy platform.

## 📁 Structure

```
integration/
├── api.ts              # Authentication APIs
├── kyc.api.ts          # KYC management APIs
├── admin.api.ts        # Admin panel APIs
├── user.api.ts         # User profile APIs
├── client.ts           # HTTP client configuration
├── index.ts            # Centralized exports
├── API_DOCUMENTATION.md # Complete API reference
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Import APIs

```typescript
// Import individual APIs
import { authApi, kycApi, adminApi, userApi } from '@/integration';

// Or import everything
import * as api from '@/integration';
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Use in Components

```typescript
import { authApi } from '@/integration';
import { useState } from 'react';

function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('token', response.token);
      // Handle success
    } catch (error) {
      console.error(error.message);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (/* Your JSX */);
}
```

## 📚 Available APIs

### Authentication (`authApi`)
- `login()` - User login
- `register()` - Simple registration
- `registerWithKyc()` - Registration with KYC submission
- `verifyEmail()` - Verify email address
- `forgotPassword()` - Request password reset
- `resetPassword()` - Reset password with token
- `refreshToken()` - Refresh access token

### User Profile (`userApi`)
- `getProfile()` - Get current user profile
- `updateProfile()` - Update profile information
- `changePassword()` - Change password
- `deleteAccount()` - Delete user account

### KYC Management (`kycApi`)
- `getStatus()` - Get current KYC status
- `resubmit()` - Resubmit KYC documents
- `uploadFile()` - Upload files to S3
- `getDocumentUrl()` - Get signed document URL

### Admin Panel (`adminApi`)
- `listUsers()` - List all users with filters
- `viewUserDetails()` - View specific user details
- `approveKyc()` - Approve KYC submission
- `rejectKyc()` - Reject KYC with reason
- `requestDocuments()` - Request additional documents
- `getAuditLogs()` - Get admin audit logs
- `getAllKyc()` - Get all KYC submissions
- `getPendingKYC()` - Get pending KYC submissions
- `checkAdminRole()` - Check if user is admin

## 🔐 Authentication Flow

The client automatically manages authentication:

1. **Login:** Token is returned and should be stored in localStorage
2. **Requests:** Token is automatically added to request headers
3. **Refresh:** Use `refreshToken()` to get new access token
4. **Logout:** Clear token from localStorage

```typescript
// Login
const { token } = await authApi.login({ email, password });
localStorage.setItem('token', token);

// The token is automatically used in subsequent requests
const profile = await userApi.getProfile();

// Logout
localStorage.removeItem('token');
```

## 🎯 Best Practices

### 1. Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const result = await authApi.login({ email, password });
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    // Display error.message to user
    toast.error(error.message);
  }
}
```

### 2. Loading States

Show loading indicators during API calls:

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await authApi.register(formData);
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### 3. TypeScript Types

Use the provided types for type safety:

```typescript
import type { User, KycStatus, KycSubmission } from '@/integration';

const [user, setUser] = useState<User | null>(null);
const [kycStatus, setKycStatus] = useState<KycStatus>('pending');
```

### 4. File Uploads

For file uploads, use FormData (handled automatically):

```typescript
const handleKycSubmit = async (files: {
  cnicFront: File;
  cnicBack: File;
  selfie: File;
}) => {
  try {
    await authApi.registerWithKyc({
      ...formData,
      ...files,
    });
  } catch (error) {
    console.error(error);
  }
};
```

## 🔄 API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "message": "Error message",
  "statusCode": 400,
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## 🛡️ Security Notes

1. **Token Storage:** Tokens are stored in localStorage. Consider using httpOnly cookies for production.
2. **HTTPS:** Always use HTTPS in production.
3. **Token Expiry:** Implement token refresh logic to handle expired tokens.
4. **CORS:** Ensure backend CORS is properly configured.
5. **File Upload:** Maximum file size is enforced by backend (check limits).

## 📝 Environment Variables

Required environment variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000  # Backend API URL

# Optional
VITE_API_TIMEOUT=30000              # Request timeout in ms
```

## 🔍 Debugging

Enable detailed logging:

```typescript
// In client.ts, add:
console.log('API Request:', url, options);
console.log('API Response:', response);
```

## 📖 Complete Documentation

For detailed API documentation including all endpoints, parameters, and response formats, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🤝 Contributing

When adding new API endpoints:

1. Add the function to the appropriate API file (`api.ts`, `kyc.api.ts`, etc.)
2. Add TypeScript types in `types/api.types.ts`
3. Export from `index.ts`
4. Update `API_DOCUMENTATION.md`
5. Add usage examples in this README

## 📞 Support

For issues or questions:
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete reference
- Review existing code examples in the `pages/` directory
- Contact the backend team for API changes

