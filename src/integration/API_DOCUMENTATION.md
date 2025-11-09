# WattsUp Energy - API Documentation

This document provides a comprehensive overview of all available API endpoints integrated in the frontend.

## Base URL
```
Development: http://localhost:3000/api/v1
Production: [Your Production URL]/api/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```typescript
Authorization: Bearer <token>
```

---

## 📝 Authentication APIs (`authApi`)

### 1. Login
```typescript
authApi.login({ email, password })
```
**Endpoint:** `POST /auth/login`  
**Returns:** `{ token, refreshToken, tokenExpires, user }`

### 2. Register (Simple)
```typescript
authApi.register({ email, password, firstName, lastName, phone })
```
**Endpoint:** `POST /auth/register`  
**Returns:** `{ message }`

### 3. Register with KYC
```typescript
authApi.registerWithKyc({
  firstName, lastName, email, password, phone,
  city, province, country, gender, dateOfBirth,
  cnicNumber, cnicFront, cnicBack, selfie
})
```
**Endpoint:** `POST /auth/register-with-kyc`  
**Content-Type:** `multipart/form-data`  
**Returns:** `{ message }`  
**Note:** Includes automatic KYC submission with user registration

### 4. Verify Email
```typescript
authApi.verifyEmail(token)
```
**Endpoint:** `GET /auth/verify?token=<token>`  
**Returns:** `{ message }`

### 5. Forgot Password
```typescript
authApi.forgotPassword(email)
```
**Endpoint:** `POST /auth/forgot-password`  
**Returns:** `{ message }`

### 6. Reset Password
```typescript
authApi.resetPassword(token, newPassword)
```
**Endpoint:** `POST /auth/reset-password`  
**Returns:** `{ message }`

### 7. Refresh Token
```typescript
authApi.refreshToken(refreshToken)
```
**Endpoint:** `POST /auth/refresh-token`  
**Returns:** `{ accessToken, refreshToken }`

---

## 👤 User Profile APIs (`userApi`)

### 1. Get Profile
```typescript
userApi.getProfile()
```
**Endpoint:** `GET /me`  
**Auth:** Required  
**Returns:** `User` object

### 2. Update Profile
```typescript
userApi.updateProfile({
  firstName, lastName, phone, city,
  province, country, gender, dateOfBirth
})
```
**Endpoint:** `PATCH /me`  
**Auth:** Required  
**Returns:** Updated `User` object

### 3. Change Password
```typescript
userApi.changePassword({ currentPassword, newPassword })
```
**Endpoint:** `PATCH /users/change-password`  
**Auth:** Required  
**Returns:** `{ message }`

### 4. Delete Account
```typescript
userApi.deleteAccount()
```
**Endpoint:** `DELETE /me`  
**Auth:** Required  
**Returns:** `{ message }`

---

## 🔐 KYC APIs (`kycApi`)

### 1. Get KYC Status
```typescript
kycApi.getStatus()
```
**Endpoint:** `GET /kyc/my-kyc`  
**Auth:** Required  
**Returns:** `KycStatusResponse` with documents and status

### 2. Resubmit KYC Documents
```typescript
kycApi.resubmit({
  cnicFront?, cnicBack?, selfie?, additionalDocument?
})
```
**Endpoint:** `POST /kyc/resubmit`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`  
**Returns:** `{ success, message }`  
**Note:** At least one document must be provided

### 3. Upload File
```typescript
kycApi.uploadFile(file)
```
**Endpoint:** `POST /files/upload`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`  
**Returns:** `{ url, id }`

### 4. Get Document URL
```typescript
kycApi.getDocumentUrl(documentId)
```
**Endpoint:** `GET /kyc/document/:documentId/url`  
**Auth:** Required  
**Returns:** `{ url }` (signed URL for temporary access)

---

## 👨‍💼 Admin APIs (`adminApi`)

**Note:** All admin endpoints require admin role

### 1. List Users with Filters
```typescript
adminApi.listUsers({
  email?, cnicNumber?, kycStatus?, page?, limit?
})
```
**Endpoint:** `GET /admin/users`  
**Auth:** Required (Admin)  
**Query Params:**
- `email` - Filter by email
- `cnicNumber` - Filter by CNIC number
- `kycStatus` - Filter by KYC status
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

**Returns:** `{ data: User[], hasNextPage: boolean }`

### 2. View User Details
```typescript
adminApi.viewUserDetails(userId)
```
**Endpoint:** `GET /admin/users/:id`  
**Auth:** Required (Admin)  
**Returns:** Complete `User` object with KYC details

### 3. Approve KYC
```typescript
adminApi.approveKyc({ kycId })
```
**Endpoint:** `PATCH /admin/kyc/approve`  
**Auth:** Required (Admin)  
**Returns:** `{ message }`

### 4. Reject KYC
```typescript
adminApi.rejectKyc({ kycId, reason })
```
**Endpoint:** `PATCH /admin/kyc/reject`  
**Auth:** Required (Admin)  
**Body:** `{ kycId, reason }`  
**Returns:** `{ message }`

### 5. Request Additional Documents
```typescript
adminApi.requestDocuments({ kycId, reason })
```
**Endpoint:** `PATCH /admin/kyc/request-documents`  
**Auth:** Required (Admin)  
**Body:** `{ kycId, reason }`  
**Returns:** `{ message }`

### 6. Get Audit Logs
```typescript
adminApi.getAuditLogs()
```
**Endpoint:** `GET /admin/audit-logs`  
**Auth:** Required (Admin)  
**Returns:** `AuditLog[]`

### 7. Get All KYC Submissions
```typescript
adminApi.getAllKyc(status?)
```
**Endpoint:** `GET /admin/users?kycStatus=<status>`  
**Auth:** Required (Admin)  
**Returns:** `KycSubmission[]`

### 8. Get Pending KYC
```typescript
adminApi.getPendingKYC()
```
**Endpoint:** `GET /admin/users?kycStatus=pending`  
**Auth:** Required (Admin)  
**Returns:** `KycSubmission[]`

### 9. Check Admin Role
```typescript
adminApi.checkAdminRole()
```
**Endpoint:** `GET /admin/users`  
**Auth:** Required  
**Returns:** `boolean` (true if user is admin)

---

## 📊 KYC Status Values

- `pending` - Submitted and awaiting review
- `in_review` - Currently being reviewed by admin
- `approved` - KYC approved
- `rejected` - KYC rejected with reason
- `additional_docs_required` - Admin requested more documents

---

## 📄 Document Types

- `cnic_front` - Front side of CNIC
- `cnic_back` - Back side of CNIC
- `selfie` - Selfie with CNIC
- `additional` - Additional documents requested by admin

---

## 🔒 Security Features

1. **JWT Authentication** - Secure token-based authentication
2. **Refresh Tokens** - Long-lived tokens for session refresh
3. **Password Hashing** - Bcrypt with salt rounds
4. **Role-Based Access** - Admin and User roles
5. **Rate Limiting** - Prevents brute force attacks
6. **Input Validation** - Server-side validation using class-validator
7. **Secure File Upload** - Files stored in Backblaze S3 with signed URLs

---

## 🚀 Usage Examples

### Complete Registration Flow with KYC

```typescript
import { authApi } from '@/integration';

const handleRegister = async (formData: RegisterWithKycRequest) => {
  try {
    const response = await authApi.registerWithKyc(formData);
    console.log(response.message);
    // Redirect to email verification page
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};
```

### Check KYC Status

```typescript
import { kycApi } from '@/integration';

const checkKycStatus = async () => {
  try {
    const status = await kycApi.getStatus();
    console.log('KYC Status:', status.status);
    console.log('Documents:', status.documents);
  } catch (error) {
    console.error('Failed to fetch KYC status:', error.message);
  }
};
```

### Admin: Review KYC Submission

```typescript
import { adminApi } from '@/integration';

const approveKyc = async (kycId: string) => {
  try {
    await adminApi.approveKyc({ kycId });
    console.log('KYC approved successfully');
  } catch (error) {
    console.error('Failed to approve KYC:', error.message);
  }
};

const rejectKyc = async (kycId: string, reason: string) => {
  try {
    await adminApi.rejectKyc({ kycId, reason });
    console.log('KYC rejected successfully');
  } catch (error) {
    console.error('Failed to reject KYC:', error.message);
  }
};
```

---

## 🛠️ Error Handling

All API functions throw errors with descriptive messages. Use try-catch blocks:

```typescript
try {
  const result = await authApi.login({ email, password });
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // Display error to user
  }
}
```

Common error responses:
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (invalid token or credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email, CNIC, etc.)
- `422` - Unprocessable Entity (invalid data format)
- `500` - Internal Server Error

---

## 📝 Type Definitions

All types are available in `@/types/api.types.ts` and can be imported:

```typescript
import type {
  User,
  KycStatus,
  KycSubmission,
  Document,
  AuditLog,
  PaginatedUsersResponse,
} from '@/types/api.types';
```

---

## 🔄 API Client Configuration

Update the base URL in `.env`:

```env
VITE_API_URL=http://localhost:3000
```

The client automatically:
- Adds Authorization header when token is available
- Sets Content-Type headers appropriately
- Handles FormData for file uploads
- Stores JWT token in localStorage

---

## 📞 Support

For issues or questions about the API integration, please contact the development team.

