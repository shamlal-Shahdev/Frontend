# 📋 WattsUp Energy - Complete API Specification

## Base URL
```
Development: http://localhost:3000/api/v1
Production: [Your Production URL]/api/v1
```

## Authentication
Most endpoints require JWT Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication APIs

### 1. Register (Simple)
**Endpoint:** `POST /api/v1/auth/register`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "test@example.com",
  "password": "password123"
}
```

#### Response (201 Created)
```json
{
  "message": "Registration successful. Please check your email for verification."
}
```

#### Validation Rules
- `firstName`: Required, string
- `lastName`: Required, string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

---

### 2. Register with KYC
**Endpoint:** `POST /api/v1/auth/register-with-kyc`  
**Auth Required:** No  
**Content-Type:** `multipart/form-data`

#### Request Body (FormData)
```typescript
{
  // Personal Information
  "firstName": "John",
  "lastName": "Doe",
  "email": "test@example.com",
  "password": "SecurePass@123",
  "phone": "+92 300 1234567",
  "city": "Karachi",
  "province": "Sindh",
  "country": "Pakistan",
  "gender": "male",  // "male" | "female" | "other"
  "dateOfBirth": "1990-01-01",  // YYYY-MM-DD
  "cnicNumber": "42101-1234567-1",  // Format: 12345-1234567-1
  
  // Files (binary)
  "cnicFront": File,
  "cnicBack": File,
  "selfie": File
}
```

#### Response (201 Created)
```json
{
  "message": "Registration successful. Please check your email for verification. Your KYC has been submitted and will be reviewed by an admin."
}
```

#### Validation Rules
- `firstName`: Required, string
- `lastName`: Required, string
- `email`: Required, valid email
- `password`: Required, min 8 chars, must contain uppercase, lowercase, number, special character
- `phone`: Required, string
- `city`: Required, string
- `province`: Required, string
- `country`: Required, string
- `gender`: Required, enum ["male", "female", "other"]
- `dateOfBirth`: Required, ISO date string
- `cnicNumber`: Required, format: `12345-1234567-1`
- `cnicFront`: Required, File (image)
- `cnicBack`: Required, File (image)
- `selfie`: Required, File (image)

---

### 3. Login
**Endpoint:** `POST /api/v1/auth/login`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request Body
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": {
      "id": 1,
      "name": "user"
    },
    "status": {
      "id": 1,
      "name": "active"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Verify Email
**Endpoint:** `GET /api/v1/auth/verify?token={token}`  
**Auth Required:** No

#### Query Parameters
- `token`: Email verification token (required)

#### Response (200 OK)
```json
{
  "message": "Email verified successfully",
  "redirectUrl": "/"
}
```

---

### 5. Forgot Password
**Endpoint:** `POST /api/v1/auth/forgot-password`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request Body
```json
{
  "email": "test@example.com"
}
```

#### Response (200 OK)
```json
{
  "message": "Password reset email sent. Please check your email."
}
```

---

### 6. Reset Password
**Endpoint:** `POST /api/v1/auth/reset-password`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request Body
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

#### Response (200 OK)
```json
{
  "message": "Password reset successfully"
}
```

---

### 7. Get Current User (Me)
**Endpoint:** `GET /api/v1/auth/me`  
**Auth Required:** Yes

#### Response (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+92 300 1234567",
  "city": "Karachi",
  "province": "Sindh",
  "country": "Pakistan",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "role": {
    "id": 1,
    "name": "user"
  },
  "status": {
    "id": 1,
    "name": "active"
  },
  "isVerified": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 🔐 KYC Management APIs

### 1. Get KYC Status
**Endpoint:** `GET /api/v1/kyc/status`  
**Auth Required:** Yes

#### Response (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "city": "Karachi",
  "province": "Sindh",
  "country": "Pakistan",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "cnicNumber": "42101-1234567-1",
  "rejectionReason": null,
  "submissionCount": 1,
  "reviewedAt": null,
  "approvedAt": null,
  "documents": [
    {
      "id": "doc-uuid-1",
      "type": "cnic_front",
      "status": "pending",
      "fileName": "cnic_front_abc123.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "doc-uuid-2",
      "type": "cnic_back",
      "status": "pending",
      "fileName": "cnic_back_xyz789.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "doc-uuid-3",
      "type": "selfie",
      "status": "pending",
      "fileName": "selfie_def456.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### KYC Status Values
- `pending` - Submitted, awaiting review
- `in_review` - Currently being reviewed
- `approved` - KYC approved
- `rejected` - KYC rejected
- `additional_docs_required` - More documents needed

#### Document Status Values
- `pending` - Awaiting review
- `verified` - Document verified
- `rejected` - Document rejected

#### Document Types
- `cnic_front` - Front of CNIC
- `cnic_back` - Back of CNIC
- `selfie` - Selfie photo
- `additional` - Additional documents

---

### 2. Resubmit KYC Documents
**Endpoint:** `POST /api/v1/kyc/resubmit`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

#### Request Body (FormData)
```typescript
{
  "cnicFront": File,  // Optional
  "cnicBack": File,   // Optional
  "selfie": File,     // Optional
  "notes": "Resubmitting with clearer images"  // Optional
}
```

**Note:** At least one file must be provided.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "KYC documents resubmitted successfully"
}
```

#### Error Response (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Can only resubmit rejected or additional_docs_required KYC applications",
  "error": "Bad Request"
}
```

---

### 3. Update KYC Information
**Endpoint:** `PUT /api/v1/kyc/update`  
**Auth Required:** Yes  
**Content-Type:** `application/json`

#### Request Body
```json
{
  "city": "Lahore",
  "province": "Punjab",
  "country": "Pakistan",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "phone": "+92 300 9876543"
}
```

**Note:** All fields are optional. Only send fields you want to update.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "KYC information updated successfully"
}
```

---

## 👨‍💼 Admin APIs

### 1. Get Dashboard Statistics
**Endpoint:** `GET /api/v1/admin/dashboard/stats`  
**Auth Required:** Yes (Admin only)

#### Response (200 OK)
```json
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

### 2. Get Users with Filters
**Endpoint:** `GET /api/v1/admin/users`  
**Auth Required:** Yes (Admin only)

#### Query Parameters
- `email` (optional): Filter by email
- `cnicNumber` (optional): Filter by CNIC number
- `kycStatus` (optional): Filter by KYC status
  - Values: `pending`, `in_review`, `approved`, `rejected`, `additional_docs_required`
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

#### Example Request
```
GET /api/v1/admin/users?kycStatus=pending&page=1&limit=10
```

#### Response (200 OK)
```json
{
  "users": [
    {
      "id": "user-uuid-1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "isVerified": true,
      "kycStatus": "pending",
      "kycSubmissionCount": 1,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "user-uuid-2",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "isVerified": true,
      "kycStatus": "pending",
      "kycSubmissionCount": 1,
      "createdAt": "2025-01-02T00:00:00.000Z"
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

### 3. Get User Details
**Endpoint:** `GET /api/v1/admin/users/:userId`  
**Auth Required:** Yes (Admin only)

#### URL Parameters
- `userId`: UUID of the user

#### Example Request
```
GET /api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000
```

#### Response (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "isVerified": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "kyc": {
    "id": "kyc-uuid-1",
    "status": "pending",
    "city": "Karachi",
    "province": "Sindh",
    "country": "Pakistan",
    "gender": "male",
    "dateOfBirth": "1990-01-01",
    "cnicNumber": "42101-1234567-1",
    "rejectionReason": null,
    "submissionCount": 1,
    "reviewedAt": null,
    "approvedAt": null,
    "documents": [
      {
        "id": "doc-uuid-1",
        "type": "cnic_front",
        "status": "pending",
        "fileName": "cnic_front_abc123.jpg",
        "createdAt": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": "doc-uuid-2",
        "type": "cnic_back",
        "status": "pending",
        "fileName": "cnic_back_xyz789.jpg",
        "createdAt": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": "doc-uuid-3",
        "type": "selfie",
        "status": "pending",
        "fileName": "selfie_def456.jpg",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  },
  "auditLogs": [
    {
      "action": "KYC_SUBMITTED",
      "description": "User submitted KYC application",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 4. Approve KYC
**Endpoint:** `PUT /api/v1/admin/kyc/:userId/approve`  
**Auth Required:** Yes (Admin only)  
**Content-Type:** `application/json`

#### URL Parameters
- `userId`: UUID of the user whose KYC to approve

#### Request Body
```json
{
  "note": "All documents verified successfully"
}
```

**Note:** `note` is optional.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "KYC approved successfully"
}
```

#### Error Response (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "KYC record not found",
  "error": "Not Found"
}
```

---

### 5. Reject KYC
**Endpoint:** `PUT /api/v1/admin/kyc/:userId/reject`  
**Auth Required:** Yes (Admin only)  
**Content-Type:** `application/json`

#### URL Parameters
- `userId`: UUID of the user whose KYC to reject

#### Request Body
```json
{
  "reason": "Document quality is poor. Please upload clearer images."
}
```

**Note:** `reason` is required.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "KYC rejected successfully"
}
```

---

### 6. Request Additional Documents
**Endpoint:** `POST /api/v1/admin/kyc/:userId/request-documents`  
**Auth Required:** Yes (Admin only)  
**Content-Type:** `application/json`

#### URL Parameters
- `userId`: UUID of the user from whom to request documents

#### Request Body
```json
{
  "documentTypes": ["cnic_front", "selfie"],
  "message": "Please upload clearer images of your CNIC front and selfie."
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Document request sent successfully"
}
```

---

### 7. Get Audit Logs
**Endpoint:** `GET /api/v1/admin/audit-logs`  
**Auth Required:** Yes (Admin only)

#### Query Parameters
- `userId` (optional): Filter logs by user ID
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

#### Example Request
```
GET /api/v1/admin/audit-logs?userId=550e8400-e29b-41d4-a716-446655440000&page=1&limit=20
```

#### Response (200 OK)
```json
{
  "logs": [
    {
      "id": "log-uuid-1",
      "action": "KYC_APPROVED",
      "description": "KYC approved by admin",
      "createdAt": "2025-01-01T12:00:00.000Z"
    },
    {
      "id": "log-uuid-2",
      "action": "KYC_REJECTED",
      "description": "KYC rejected by admin",
      "createdAt": "2025-01-01T11:00:00.000Z"
    },
    {
      "id": "log-uuid-3",
      "action": "DOCUMENT_REQUESTED",
      "description": "Additional documents requested by admin",
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

#### Audit Actions
- `KYC_SUBMITTED` - User submitted KYC
- `KYC_RESUBMITTED` - User resubmitted KYC
- `KYC_APPROVED` - Admin approved KYC
- `KYC_REJECTED` - Admin rejected KYC
- `DOCUMENT_REQUESTED` - Admin requested additional documents
- `KYC_UPDATED` - User updated KYC information

---

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |

### Validation Error Response Example

```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "errors": {
    "email": ["email must be a valid email"],
    "password": ["password must be longer than or equal to 6 characters"]
  }
}
```

---

## 📝 File Upload Requirements

### Supported File Types
- **Images:** JPG, JPEG, PNG
- **Maximum Size:** 5 MB per file

### File Upload Format

When uploading files, use `multipart/form-data`:

```typescript
const formData = new FormData();
formData.append('cnicFront', file1);
formData.append('cnicBack', file2);
formData.append('selfie', file3);
formData.append('firstName', 'John');
// ... other fields

fetch('/api/v1/auth/register-with-kyc', {
  method: 'POST',
  body: formData,
  // Don't set Content-Type header - browser will set it with boundary
});
```

---

## 🔒 JWT Token Structure

The JWT token contains:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1640995200,
  "exp": 1640998800
}
```

### Token Expiration
- **Access Token:** 1 hour
- **Refresh Token:** 7 days

---

## 🌐 CORS Headers

The API supports these CORS headers:
- `Access-Control-Allow-Origin: *` (Development)
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

---

## 📊 Rate Limiting

- **Anonymous requests:** 10 requests per minute
- **Authenticated requests:** 100 requests per minute

If rate limit is exceeded:

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate Limit Exceeded"
}
```

---

## 🧪 Testing

### Example: Login Flow

```typescript
// 1. Register
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

// 2. Verify Email (use token from email)
await fetch('/api/v1/auth/verify?token=<token_from_email>');

// 3. Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { token, user } = await loginResponse.json();

// 4. Use token for authenticated requests
const meResponse = await fetch('/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📞 Support

For API issues or questions, contact the development team.

---

**Last Updated:** January 2025  
**API Version:** 1.0.0

