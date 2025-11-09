# 🚀 Quick Start Guide - WattsUp Energy Frontend

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Backend API running on `http://localhost:3000`

## Installation

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the Frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

## Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at: **http://localhost:5173**

## Default Credentials

### Testing Simple Registration
1. Go to http://localhost:5173/register
2. Fill in the form
3. Check your email for verification link
4. Click verify link
5. Login

### Testing KYC Registration
1. Go to http://localhost:5173/register-kyc
2. Complete 4-step registration:
   - Step 1: Personal info
   - Step 2: CNIC + Documents upload
   - Step 3: Email & password
   - Step 4: Success
3. Check email for verification
4. Login

### Admin Access
Create an admin user in your backend, then:
1. Login at http://localhost:5173/login
2. Navigate to http://localhost:5173/admin

## Available Routes

### Public Routes
- `/` or `/login` - Login page
- `/register` - Simple registration
- `/register-kyc` - KYC registration (multi-step)
- `/forgot-password` - Password recovery
- `/reset-password?token=...` - Reset password
- `/verify-email?token=...` - Email verification

### User Routes (Protected)
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/kyc` - KYC status and resubmission

### Admin Routes (Protected)
- `/admin` - Admin dashboard with stats
- `/admin/users` - Users list with filters
- `/admin/users/:userId` - User details with KYC approval

## Testing the Application

### 1. Test User Registration Flow
```bash
# Open browser
http://localhost:5173/register

# Fill form and submit
# Check backend logs/email for verification link
# Click verification link
# Login
```

### 2. Test KYC Registration Flow
```bash
# Open browser
http://localhost:5173/register-kyc

# Complete all 4 steps
# Upload test images (JPG/PNG, max 5MB)
# Submit
# Login after verification
```

### 3. Test KYC Dashboard
```bash
# Login as a user with KYC submitted
http://localhost:5173/kyc

# View status, documents
# Test resubmission (if rejected)
```

### 4. Test Admin Panel
```bash
# Login as admin
http://localhost:5173/admin

# View stats
# Click "View All Users"
# Filter by KYC status
# Click on a user
# Approve/Reject/Request docs
```

## API Integration

All API calls are centralized in `/src/integration/`:

```typescript
// Import APIs
import { authApi, kycApi, adminApi, userApi } from '@/integration';

// Use in components
const response = await authApi.login({ email, password });
const kycStatus = await kycApi.getStatus();
const users = await adminApi.getUsers({ kycStatus: 'pending' });
```

## Custom Hooks

```typescript
// KYC Management
import { useKYC } from '@/hooks/useKYC';
const { kycStatus, loading, fetchKycStatus, resubmitKyc } = useKYC();

// Admin Operations
import { useAdmin } from '@/hooks/useAdmin';
const { stats, users, fetchDashboardStats, approveKyc } = useAdmin();

// Authentication
import { useAuth } from '@/context/auth.context';
const { state, login, logout, register } = useAuth();
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts or kill process
lsof -ti:5173 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5173   # Windows
```

### API Connection Issues
1. Check `.env` file has correct `VITE_API_URL`
2. Ensure backend is running
3. Check browser console for CORS errors
4. Verify backend CORS settings

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check TypeScript config
npm run build

# Fix linting issues
npm run lint
```

## Project Structure

```
Frontend/
├── src/
│   ├── integration/      # API layer
│   ├── hooks/            # Custom hooks
│   ├── context/          # Global state
│   ├── pages/            # Page components
│   ├── components/       # UI components
│   ├── utils/            # Utilities
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── routes/           # Routing config
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env                  # Environment config
└── package.json          # Dependencies
```

## Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **React Hook Form** - Forms
- **Zod** - Validation
- **TailwindCSS** - Styling
- **ShadCN UI** - Components
- **Sonner** - Notifications
- **Vite** - Build tool

## Next Steps

1. ✅ Backend API is running
2. ✅ Frontend is configured
3. ✅ Create test users
4. ✅ Test all flows
5. ✅ Deploy to production

## Support

For issues or questions:
- Check `IMPLEMENTATION_SUMMARY.md` for detailed documentation
- Review `API_SPECIFICATION.md` for API reference
- Check browser console for errors
- Review backend logs

---

**Happy Coding! 🎉**

