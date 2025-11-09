# 📋 API Endpoints - Quick Reference Table

## 🔐 Authentication APIs

| # | Method | Endpoint | Auth | Content-Type | Description |
|---|--------|----------|------|--------------|-------------|
| 1 | POST | `/api/v1/auth/register` | ❌ | `application/json` | Simple registration |
| 2 | POST | `/api/v1/auth/register-with-kyc` | ❌ | `multipart/form-data` | Register with KYC |
| 3 | POST | `/api/v1/auth/login` | ❌ | `application/json` | User login |
| 4 | GET | `/api/v1/auth/verify?token={token}` | ❌ | - | Verify email |
| 5 | POST | `/api/v1/auth/forgot-password` | ❌ | `application/json` | Request password reset |
| 6 | POST | `/api/v1/auth/reset-password` | ❌ | `application/json` | Reset password |
| 7 | GET | `/api/v1/auth/me` | ✅ | - | Get current user |

---

## 🔐 KYC Management APIs

| # | Method | Endpoint | Auth | Content-Type | Description |
|---|--------|----------|------|--------------|-------------|
| 1 | GET | `/api/v1/kyc/status` | ✅ | - | Get KYC status |
| 2 | POST | `/api/v1/kyc/resubmit` | ✅ | `multipart/form-data` | Resubmit documents |
| 3 | PUT | `/api/v1/kyc/update` | ✅ | `application/json` | Update KYC info |

---

## 👨‍💼 Admin APIs

| # | Method | Endpoint | Auth | Content-Type | Description |
|---|--------|----------|------|--------------|-------------|
| 1 | GET | `/api/v1/admin/dashboard/stats` | ✅ Admin | - | Dashboard statistics |
| 2 | GET | `/api/v1/admin/users` | ✅ Admin | - | List users (with filters) |
| 3 | GET | `/api/v1/admin/users/:userId` | ✅ Admin | - | Get user details |
| 4 | PUT | `/api/v1/admin/kyc/:userId/approve` | ✅ Admin | `application/json` | Approve KYC |
| 5 | PUT | `/api/v1/admin/kyc/:userId/reject` | ✅ Admin | `application/json` | Reject KYC |
| 6 | POST | `/api/v1/admin/kyc/:userId/request-documents` | ✅ Admin | `application/json` | Request documents |
| 7 | GET | `/api/v1/admin/audit-logs` | ✅ Admin | - | Get audit logs |

---

## 📊 Request/Response Summary

### 1. Register (Simple)
```typescript
// Request
POST /api/v1/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "test@example.com",
  "password": "password123"
}

// Response
{
  "message": "Registration successful. Please check your email for verification."
}
```

---

### 2. Register with KYC
```typescript
// Request (FormData)
POST /api/v1/auth/register-with-kyc
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "test@example.com",
  "password": "SecurePass@123",
  "phone": "+92 300 1234567",
  "city": "Karachi",
  "province": "Sindh",
  "country": "Pakistan",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "cnicNumber": "42101-1234567-1",
  "cnicFront": File,
  "cnicBack": File,
  "selfie": File
}

// Response
{
  "message": "Registration successful. Please check your email for verification. Your KYC has been submitted and will be reviewed by an admin."
}
```

---

### 3. Login
```typescript
// Request
POST /api/v1/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": { "id": 1, "name": "user" }
  }
}
```

---

### 4. Verify Email
```typescript
// Request
GET /api/v1/auth/verify?token={token}

// Response
{
  "message": "Email verified successfully",
  "redirectUrl": "/"
}
```

---

### 5. Forgot Password
```typescript
// Request
POST /api/v1/auth/forgot-password
{
  "email": "test@example.com"
}

// Response
{
  "message": "Password reset email sent. Please check your email."
}
```

---

### 6. Reset Password
```typescript
// Request
POST /api/v1/auth/reset-password
{
  "token": "reset_token",
  "newPassword": "newPassword123"
}

// Response
{
  "message": "Password reset successfully"
}
```

---

### 7. Get Current User
```typescript
// Request
GET /api/v1/auth/me
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "id": "uuid",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+92 300 1234567",
  "city": "Karachi",
  "role": { "id": 1, "name": "user" },
  "isVerified": true
}
```

---

### 8. Get KYC Status
```typescript
// Request
GET /api/v1/kyc/status
Headers: { Authorization: "Bearer {token}" }

// Response
{
  "id": "uuid",
  "status": "pending",
  "city": "Karachi",
  "province": "Sindh",
  "country": "Pakistan",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "cnicNumber": "42101-1234567-1",
  "rejectionReason": null,
  "submissionCount": 1,
  "documents": [
    {
      "id": "uuid",
      "type": "cnic_front",
      "status": "pending",
      "fileName": "cnic_front_abc.jpg"
    }
  ]
}
```

---

### 9. Resubmit KYC
```typescript
// Request (FormData)
POST /api/v1/kyc/resubmit
Headers: { Authorization: "Bearer {token}" }
{
  "cnicFront": File,  // Optional
  "cnicBack": File,   // Optional
  "selfie": File,     // Optional
  "notes": "Resubmitting with clearer images"
}

// Response
{
  "success": true,
  "message": "KYC documents resubmitted successfully"
}
```

---

### 10. Update KYC Info
```typescript
// Request
PUT /api/v1/kyc/update
Headers: { Authorization: "Bearer {token}" }
{
  "city": "Lahore",
  "province": "Punjab",
  "phone": "+92 300 9876543"
}

// Response
{
  "success": true,
  "message": "KYC information updated successfully"
}
```

---

### 11. Dashboard Stats (Admin)
```typescript
// Request
GET /api/v1/admin/dashboard/stats
Headers: { Authorization: "Bearer {admin_token}" }

// Response
{
  "totalUsers": 150,
  "totalKyc": 120,
  "stats": {
    "pending": 35,
    "in_review": 15,
    "approved": 50,
    "rejected": 20
  }
}
```

---

### 12. List Users (Admin)
```typescript
// Request
GET /api/v1/admin/users?kycStatus=pending&page=1&limit=10
Headers: { Authorization: "Bearer {admin_token}" }

// Response
{
  "users": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "kycStatus": "pending"
    }
  ],
  "pagination": {
    "total": 35,
    "page": 1,
    "limit": 10,
    "totalPages": 4
  }
}
```

---

### 13. Get User Details (Admin)
```typescript
// Request
GET /api/v1/admin/users/{userId}
Headers: { Authorization: "Bearer {admin_token}" }

// Response
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "kyc": {
    "status": "pending",
    "cnicNumber": "42101-1234567-1",
    "documents": [...]
  },
  "auditLogs": [...]
}
```

---

### 14. Approve KYC (Admin)
```typescript
// Request
PUT /api/v1/admin/kyc/{userId}/approve
Headers: { Authorization: "Bearer {admin_token}" }
{
  "note": "All documents verified"
}

// Response
{
  "success": true,
  "message": "KYC approved successfully"
}
```

---

### 15. Reject KYC (Admin)
```typescript
// Request
PUT /api/v1/admin/kyc/{userId}/reject
Headers: { Authorization: "Bearer {admin_token}" }
{
  "reason": "Document quality is poor"
}

// Response
{
  "success": true,
  "message": "KYC rejected successfully"
}
```

---

### 16. Request Documents (Admin)
```typescript
// Request
POST /api/v1/admin/kyc/{userId}/request-documents
Headers: { Authorization: "Bearer {admin_token}" }
{
  "documentTypes": ["cnic_front", "selfie"],
  "message": "Please upload clearer images"
}

// Response
{
  "success": true,
  "message": "Document request sent successfully"
}
```

---

### 17. Get Audit Logs (Admin)
```typescript
// Request
GET /api/v1/admin/audit-logs?userId={userId}&page=1&limit=20
Headers: { Authorization: "Bearer {admin_token}" }

// Response
{
  "logs": [
    {
      "id": "uuid",
      "action": "KYC_APPROVED",
      "description": "KYC approved by admin",
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```

---

## 🎯 Common Values

### KYC Status
- `pending`
- `in_review`
- `approved`
- `rejected`
- `additional_docs_required`

### Document Types
- `cnic_front`
- `cnic_back`
- `selfie`
- `additional`

### Document Status
- `pending`
- `verified`
- `rejected`

### Gender
- `male`
- `female`
- `other`

### Audit Actions
- `KYC_SUBMITTED`
- `KYC_RESUBMITTED`
- `KYC_APPROVED`
- `KYC_REJECTED`
- `DOCUMENT_REQUESTED`
- `KYC_UPDATED`

---

## 🚨 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Failed |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## 📝 Notes

1. **Base URL:** `http://localhost:3000/api/v1`
2. **Authentication:** Use `Authorization: Bearer {token}` header
3. **File Uploads:** Use `multipart/form-data`
4. **JSON Requests:** Use `Content-Type: application/json`
5. **Token Expiry:** Access token expires in 1 hour
6. **Rate Limiting:** 100 requests per minute (authenticated)

---

**Total Endpoints:** 17

