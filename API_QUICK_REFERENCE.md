# 🚀 API Quick Reference Card

Quick reference for all available API endpoints in your frontend.

---

## 📦 Import

```typescript
import { authApi, kycApi, adminApi, userApi } from '@/integration';
```

---

## 🔐 Authentication

| Function | Endpoint | Auth | Returns |
|----------|----------|------|---------|
| `authApi.login()` | POST `/auth/login` | ❌ | `{ token, user }` |
| `authApi.register()` | POST `/auth/register` | ❌ | `{ message }` |
| `authApi.registerWithKyc()` | POST `/auth/register-with-kyc` | ❌ | `{ message }` |
| `authApi.verifyEmail()` | GET `/auth/verify` | ❌ | `{ message }` |
| `authApi.forgotPassword()` | POST `/auth/forgot-password` | ❌ | `{ message }` |
| `authApi.resetPassword()` | POST `/auth/reset-password` | ❌ | `{ message }` |
| `authApi.refreshToken()` | POST `/auth/refresh-token` | ❌ | `{ accessToken, refreshToken }` |

### Usage Example
```typescript
// Login
const { token, user } = await authApi.login({ email, password });
localStorage.setItem('token', token);

// Register with KYC
await authApi.registerWithKyc({
  firstName, lastName, email, password, phone,
  city, province, country, gender, dateOfBirth,
  cnicNumber, cnicFront, cnicBack, selfie
});
```

---

## 👤 User Profile

| Function | Endpoint | Auth | Returns |
|----------|----------|------|---------|
| `userApi.getProfile()` | GET `/me` | ✅ | `User` |
| `userApi.updateProfile()` | PATCH `/me` | ✅ | `User` |
| `userApi.changePassword()` | PATCH `/users/change-password` | ✅ | `{ message }` |
| `userApi.deleteAccount()` | DELETE `/me` | ✅ | `{ message }` |

### Usage Example
```typescript
// Get profile
const user = await userApi.getProfile();

// Update profile
await userApi.updateProfile({ firstName, lastName, phone });

// Change password
await userApi.changePassword({ currentPassword, newPassword });
```

---

## 🔐 KYC Management

| Function | Endpoint | Auth | Returns |
|----------|----------|------|---------|
| `kycApi.getStatus()` | GET `/kyc/my-kyc` | ✅ | `KycStatusResponse` |
| `kycApi.resubmit()` | POST `/kyc/resubmit` | ✅ | `{ success, message }` |
| `kycApi.uploadFile()` | POST `/files/upload` | ✅ | `{ url, id }` |
| `kycApi.getDocumentUrl()` | GET `/kyc/document/:id/url` | ✅ | `{ url }` |

### Usage Example
```typescript
// Get KYC status
const status = await kycApi.getStatus();
console.log(status.status); // 'pending' | 'approved' | 'rejected'

// Resubmit documents
await kycApi.resubmit({
  cnicFront: newFile,
  cnicBack: newFile,
  selfie: newFile
});

// Upload file
const { url, id } = await kycApi.uploadFile(file);
```

---

## 👨‍💼 Admin Panel

| Function | Endpoint | Auth | Returns |
|----------|----------|------|---------|
| `adminApi.listUsers()` | GET `/admin/users` | ✅ Admin | `PaginatedUsersResponse` |
| `adminApi.viewUserDetails()` | GET `/admin/users/:id` | ✅ Admin | `User` |
| `adminApi.approveKyc()` | PATCH `/admin/kyc/approve` | ✅ Admin | `{ message }` |
| `adminApi.rejectKyc()` | PATCH `/admin/kyc/reject` | ✅ Admin | `{ message }` |
| `adminApi.requestDocuments()` | PATCH `/admin/kyc/request-documents` | ✅ Admin | `{ message }` |
| `adminApi.getAuditLogs()` | GET `/admin/audit-logs` | ✅ Admin | `AuditLog[]` |
| `adminApi.getAllKyc()` | GET `/admin/users?kycStatus=*` | ✅ Admin | `KycSubmission[]` |
| `adminApi.getPendingKYC()` | GET `/admin/users?kycStatus=pending` | ✅ Admin | `KycSubmission[]` |
| `adminApi.checkAdminRole()` | GET `/admin/users` | ✅ | `boolean` |

### Usage Example
```typescript
// List users
const { data, hasNextPage } = await adminApi.listUsers({
  kycStatus: 'pending',
  page: 1,
  limit: 10
});

// Approve KYC
await adminApi.approveKyc({ kycId });

// Reject KYC
await adminApi.rejectKyc({ 
  kycId, 
  reason: "Documents are unclear" 
});

// Request additional documents
await adminApi.requestDocuments({ 
  kycId, 
  reason: "Please upload a clearer CNIC front" 
});

// Get audit logs
const logs = await adminApi.getAuditLogs();
```

---

## 📊 KYC Status Values

| Status | Description |
|--------|-------------|
| `pending` | Submitted and awaiting review |
| `in_review` | Currently being reviewed by admin |
| `approved` | KYC approved ✅ |
| `rejected` | KYC rejected with reason ❌ |
| `additional_docs_required` | Admin requested more documents 📄 |

---

## 📄 Document Types

| Type | Description |
|------|-------------|
| `cnic_front` | Front side of CNIC |
| `cnic_back` | Back side of CNIC |
| `selfie` | Selfie with CNIC |
| `additional` | Additional documents |

---

## 🎯 Common Patterns

### Pattern 1: Fetch Data on Mount
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await kycApi.getStatus();
      setData(data);
    } catch (error) {
      console.error(error);
    }
  };
  fetchData();
}, []);
```

### Pattern 2: Form Submission with Loading
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await authApi.login({ email, password });
    navigate('/dashboard');
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Pattern 3: Error Handling
```typescript
try {
  await adminApi.approveKyc({ kycId });
  toast.success('KYC approved!');
} catch (error) {
  if (error instanceof Error) {
    toast.error(error.message);
  }
}
```

### Pattern 4: File Upload
```typescript
const handleFileUpload = async (file: File) => {
  try {
    const { url, id } = await kycApi.uploadFile(file);
    console.log('File uploaded:', url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

---

## 🔒 Authentication Flow

```
1. Login → Get token
   ↓
2. Store token in localStorage
   ↓
3. Token automatically added to requests
   ↓
4. Token expires → Use refreshToken()
   ↓
5. Logout → Clear localStorage
```

### Implementation
```typescript
// Login
const { token, refreshToken } = await authApi.login({ email, password });
localStorage.setItem('token', token);
localStorage.setItem('refreshToken', refreshToken);

// Auto-inject token (handled by client.ts)
const profile = await userApi.getProfile(); // ✅ Token added automatically

// Refresh token
const { accessToken } = await authApi.refreshToken(refreshToken);
localStorage.setItem('token', accessToken);

// Logout
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');
```

---

## 🛡️ Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check form validation |
| 401 | Unauthorized | Check token / login again |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email/CNIC |
| 422 | Invalid Data | Check data format |
| 500 | Server Error | Try again later |

---

## ⚙️ Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

Update in `.env` file.

---

## 📚 Full Documentation

- **Complete API Docs:** [`src/integration/API_DOCUMENTATION.md`](./src/integration/API_DOCUMENTATION.md)
- **Integration Guide:** [`src/integration/README.md`](./src/integration/README.md)
- **Example Updates:** [`EXAMPLE_UPDATES.md`](./EXAMPLE_UPDATES.md)
- **Type Definitions:** [`src/types/api.types.ts`](./src/types/api.types.ts)

---

## 🎨 Component Example Templates

### Loading State
```typescript
{loading ? (
  <div>Loading...</div>
) : (
  <div>{/* Your content */}</div>
)}
```

### Status Badge
```typescript
const getStatusColor = (status: KycStatus) => {
  const colors = {
    pending: 'yellow',
    in_review: 'blue',
    approved: 'green',
    rejected: 'red',
    additional_docs_required: 'orange',
  };
  return colors[status];
};
```

### Error Display
```typescript
{error && (
  <Alert variant="destructive">
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

---

## 🔍 Debugging

Enable logging by adding to any API call:
```typescript
console.log('Request:', { email, password });
const response = await authApi.login({ email, password });
console.log('Response:', response);
```

---

## ✅ Checklist

Before deploying:

- [ ] Update all pages to use new API
- [ ] Remove all dummy/mock API calls
- [ ] Test all user flows
- [ ] Test all admin flows
- [ ] Add proper error handling
- [ ] Add loading states
- [ ] Test file uploads
- [ ] Test with real backend
- [ ] Update environment variables
- [ ] Test token refresh

---

## 🎉 You're All Set!

All APIs are integrated and ready to use. Copy-paste examples and adapt to your needs!

**Happy coding!** 💻✨

