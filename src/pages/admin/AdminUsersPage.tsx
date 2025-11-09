import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAdmin } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/date-formatter';
import { KycStatus } from '@/integration/kyc.api';
import { Search, AlertCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const kycStatusOptions: { value: KycStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'additional_docs_required', label: 'Additional Docs Required' },
];

const kycStatusColors: Record<KycStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  additional_docs_required: 'bg-orange-100 text-orange-800',
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { users, loading, error, pagination, fetchUsers } = useAdmin();

  const [filters, setFilters] = useState({
    email: searchParams.get('email') || '',
    cnicNumber: searchParams.get('cnicNumber') || '',
    kycStatus: (searchParams.get('kycStatus') as KycStatus) || '',
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
  });

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.email) params.email = filters.email;
    if (filters.cnicNumber) params.cnicNumber = filters.cnicNumber;
    if (filters.kycStatus) params.kycStatus = filters.kycStatus;
    if (filters.page > 1) params.page = filters.page.toString();
    setSearchParams(params);

    fetchUsers(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">View and manage all users and their KYC submissions</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Search by email..."
                    value={filters.email}
                    onChange={(e) => handleFilterChange('email', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cnicNumber">CNIC Number</Label>
                <Input
                  id="cnicNumber"
                  placeholder="12345-1234567-1"
                  value={filters.cnicNumber}
                  onChange={(e) => handleFilterChange('cnicNumber', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="kycStatus">KYC Status</Label>
                <Select
                  value={filters.kycStatus}
                  onValueChange={(value) => handleFilterChange('kycStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {kycStatusOptions.map((option) => (
                      <SelectItem key={option.value || 'all'} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  {pagination ? `Showing ${users.length} of ${pagination.total} users` : 'Loading...'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && !users.length ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>KYC Status</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                              {user.isVerified ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.kycStatus ? (
                              <Badge className={kycStatusColors[user.kycStatus]}>
                                {user.kycStatus.replace('_', ' ').toUpperCase()}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">No KYC</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.kycSubmissionCount || 0}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page === pagination.totalPages || loading}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

