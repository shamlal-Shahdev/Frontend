# 📝 Example Page Updates

This file shows you exactly how to update your pages to use the new API integration.

---

## ✅ Example 1: Update KYCSignup.tsx

### Current Code (Lines 208-308)
Replace the dummy API call with the real implementation:

```typescript
// ❌ OLD CODE (Remove this)
const handleSubmit = async () => {
  if (!validateStep4()) return;
  setIsLoading(true);

  try {
    // DUMMY API CALL FOR UI TESTING
    await new Promise(resolve => setTimeout(resolve, 2000));
    const dummyResponse = {
      message: "Registration successful..."
    };
    // ... rest of dummy code
  } catch (error) {
    // ...
  } finally {
    setIsLoading(false);
  }
};
```

### ✅ NEW CODE (Use this instead)

```typescript
const handleSubmit = async () => {
  if (!validateStep4()) return;
  setIsLoading(true);

  try {
    // Prepare data for the new API
    const registrationData = {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      email: personalInfo.email,
      password: personalInfo.password,
      phone: personalInfo.phone,
      city: personalInfo.city,
      province: personalInfo.province,
      country: personalInfo.country,
      gender: personalInfo.gender as 'male' | 'female' | 'other',
      dateOfBirth: personalInfo.dateOfBirth,
      cnicNumber: personalInfo.cnicNumber,
      cnicFront: documents.cnicFront!,
      cnicBack: documents.cnicBack!,
      selfie: documents.selfie!,
    };

    // Call the new API
    const response = await authApi.registerWithKyc(registrationData);

    // Show success message
    toast({
      title: "Registration Successful! 🎉",
      description: response.message,
    });

    // Redirect to verify email page
    setTimeout(() => {
      navigate("/verify-email");
    }, 2000);

  } catch (error) {
    toast({
      title: "Registration Failed",
      description: error instanceof Error ? error.message : "An error occurred during registration.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

---

## ✅ Example 2: Update Dashboard.tsx to Show KYC Status

Add this to your Dashboard component:

```typescript
import { useEffect, useState } from 'react';
import { kycApi } from '@/integration';
import type { KycStatusResponse } from '@/integration';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

function Dashboard() {
  const [kycStatus, setKycStatus] = useState<KycStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const status = await kycApi.getStatus();
      setKycStatus(status);
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending Review', variant: 'secondary', icon: Clock },
      in_review: { label: 'Under Review', variant: 'default', icon: Clock },
      approved: { label: 'Approved', variant: 'success', icon: CheckCircle2 },
      rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
      additional_docs_required: { label: 'Documents Required', variant: 'warning', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading KYC status...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          {kycStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(kycStatus.status)}
              </div>

              {kycStatus.rejectionReason && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Rejection Reason</AlertTitle>
                  <AlertDescription>{kycStatus.rejectionReason}</AlertDescription>
                </Alert>
              )}

              {(kycStatus.status === 'rejected' || kycStatus.status === 'additional_docs_required') && (
                <Button onClick={() => navigate('/kyc/resubmit')}>
                  Resubmit Documents
                </Button>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Submitted Documents:</h4>
                {kycStatus.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border p-2 rounded">
                    <span className="text-sm capitalize">{doc.type.replace('_', ' ')}</span>
                    {doc.fileUrl && (
                      <Button variant="link" onClick={() => window.open(doc.fileUrl, '_blank')}>
                        View
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p>No KYC submission found.</p>
              <Button onClick={() => navigate('/kyc-signup')}>
                Submit KYC
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ✅ Example 3: Update Profile.tsx

```typescript
import { useEffect, useState } from 'react';
import { userApi } from '@/integration';
import type { User } from '@/types/api.types';
import { useToast } from '@/hooks/use-toast';

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await userApi.getProfile();
      setUser(profile);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData: any) => {
    try {
      const updated = await userApi.updateProfile(updatedData);
      setUser(updated);
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {user && (
        <div>
          <p>Name: {user.firstName} {user.lastName}</p>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone}</p>
          <p>City: {user.city}</p>
          {/* Add edit form here */}
        </div>
      )}
    </div>
  );
}
```

---

## ✅ Example 4: Update AdminDashboard.tsx

```typescript
import { useEffect, useState } from 'react';
import { adminApi } from '@/integration';
import type { KycSubmission, FilterUsersParams } from '@/integration';
import { useToast } from '@/hooks/use-toast';

function AdminDashboard() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterUsersParams>({
    kycStatus: 'pending',
    page: 1,
    limit: 10,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await adminApi.listUsers(filters);
      // Filter only users with KYC submissions
      const kycUsers = response.data.filter(user => user.kycStatus);
      setSubmissions(kycUsers as any);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch KYC submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId: string) => {
    try {
      await adminApi.approveKyc({ kycId });
      toast({
        title: "Success",
        description: "KYC approved successfully!",
      });
      fetchSubmissions(); // Refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve KYC",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (kycId: string, reason: string) => {
    try {
      await adminApi.rejectKyc({ kycId, reason });
      toast({
        title: "Success",
        description: "KYC rejected successfully!",
      });
      fetchSubmissions(); // Refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject KYC",
        variant: "destructive",
      });
    }
  };

  const handleRequestDocuments = async (kycId: string, reason: string) => {
    try {
      await adminApi.requestDocuments({ kycId, reason });
      toast({
        title: "Success",
        description: "Additional documents requested!",
      });
      fetchSubmissions(); // Refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request documents",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h1>Admin Dashboard - KYC Submissions</h1>
      
      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <Button 
          onClick={() => setFilters({...filters, kycStatus: 'pending'})}
          variant={filters.kycStatus === 'pending' ? 'default' : 'outline'}
        >
          Pending
        </Button>
        <Button 
          onClick={() => setFilters({...filters, kycStatus: 'approved'})}
          variant={filters.kycStatus === 'approved' ? 'default' : 'outline'}
        >
          Approved
        </Button>
        <Button 
          onClick={() => setFilters({...filters, kycStatus: 'rejected'})}
          variant={filters.kycStatus === 'rejected' ? 'default' : 'outline'}
        >
          Rejected
        </Button>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3>{submission.user.firstName} {submission.user.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{submission.user.email}</p>
                    <p className="text-sm">CNIC: {submission.cnicNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApprove(submission.id)}
                      variant="default"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => {
                        const reason = prompt("Enter rejection reason:");
                        if (reason) handleReject(submission.id, reason);
                      }}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => {
                        const reason = prompt("Enter reason for requesting documents:");
                        if (reason) handleRequestDocuments(submission.id, reason);
                      }}
                      variant="outline"
                    >
                      Request Docs
                    </Button>
                  </div>
                </div>

                {/* Documents */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {submission.documents.map((doc) => (
                    <div key={doc.id} className="border p-2 rounded">
                      <p className="text-xs capitalize">{doc.type.replace('_', ' ')}</p>
                      {doc.fileUrl && (
                        <Button 
                          size="sm" 
                          variant="link"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## ✅ Example 5: Update Auth.tsx (Login/Register)

```typescript
import { useState } from 'react';
import { authApi } from '@/integration';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      // Store token
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);

      toast({
        title: "Login Successful!",
        description: `Welcome back, ${response.user.firstName}!`,
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      toast({
        title: "Registration Successful!",
        description: response.message,
      });

      // Redirect to verify email page
      navigate('/verify-email');
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        {/* Your form fields */}
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
        </Button>
      </form>
    </div>
  );
}
```

---

## 🎯 Quick Checklist

Update these files in order:

- [ ] `KYCSignup.tsx` - Use `authApi.registerWithKyc()`
- [ ] `Auth.tsx` - Use `authApi.login()` and `authApi.register()`
- [ ] `Dashboard.tsx` - Use `kycApi.getStatus()`
- [ ] `Profile.tsx` - Use `userApi.getProfile()` and `userApi.updateProfile()`
- [ ] `AdminDashboard.tsx` - Use `adminApi.*` methods
- [ ] `VerifyEmail.tsx` - Use `authApi.verifyEmail()`
- [ ] `ForgotPassword.tsx` - Use `authApi.forgotPassword()`
- [ ] `ResetPassword.tsx` - Use `authApi.resetPassword()`

---

## 💡 Pro Tips

1. **Always use try-catch** for error handling
2. **Show loading states** with `setLoading(true/false)`
3. **Display toast notifications** for user feedback
4. **Store tokens** in localStorage after login
5. **Clear tokens** on logout
6. **Refresh data** after successful operations
7. **Use TypeScript types** for better autocomplete

---

## 🚀 You're Ready!

All the APIs are integrated and ready to use. Just copy the examples above and adapt them to your needs!

For complete API reference, see: [`src/integration/API_DOCUMENTATION.md`](./src/integration/API_DOCUMENTATION.md)

