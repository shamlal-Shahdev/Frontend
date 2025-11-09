import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAdmin } from '@/hooks/useAdmin';
import { formatDate, formatDateTime } from '@/utils/date-formatter';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  Upload
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminUserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { userDetail, loading, error, fetchUserDetails, approveKyc, rejectKyc, requestDocuments } = useAdmin();

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [requestDocsDialogOpen, setRequestDocsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [requestDocsData, setRequestDocsData] = useState({
    documentTypes: [] as string[],
    message: '',
  });

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
  }, [userId]);

  const handleApprove = async () => {
    if (!userId) return;

    try {
      setActionLoading(true);
      await approveKyc(userId, { note: approveNote || undefined });
      toast.success('KYC approved successfully');
      setApproveDialogOpen(false);
      setApproveNote('');
    } catch (err) {
      toast.error('Failed to approve KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!userId || !rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      setActionLoading(true);
      await rejectKyc(userId, { reason: rejectReason });
      toast.success('KYC rejected');
      setRejectDialogOpen(false);
      setRejectReason('');
    } catch (err) {
      toast.error('Failed to reject KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestDocuments = async () => {
    if (!userId || requestDocsData.documentTypes.length === 0 || !requestDocsData.message.trim()) {
      toast.error('Please select documents and provide a message');
      return;
    }

    try {
      setActionLoading(true);
      await requestDocuments(userId, requestDocsData);
      toast.success('Document request sent successfully');
      setRequestDocsDialogOpen(false);
      setRequestDocsData({ documentTypes: [], message: '' });
    } catch (err) {
      toast.error('Failed to request documents');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleDocumentType = (type: string) => {
    setRequestDocsData(prev => ({
      ...prev,
      documentTypes: prev.documentTypes.includes(type)
        ? prev.documentTypes.filter(t => t !== type)
        : [...prev.documentTypes, type],
    }));
  };

  if (loading && !userDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !userDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'User not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <p className="font-medium">{userDetail.firstName} {userDetail.lastName}</p>
                </div>
                <div>
                  <Label className="text-gray-600 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </Label>
                  <p className="font-medium text-sm">{userDetail.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email Verified</Label>
                  <div>
                    <Badge variant={userDetail.isVerified ? 'default' : 'secondary'}>
                      {userDetail.isVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Registered
                  </Label>
                  <p className="font-medium text-sm">{formatDate(userDetail.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KYC Info */}
          <div className="lg:col-span-2 space-y-6">
            {userDetail.kyc ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>KYC Information</CardTitle>
                      <Badge className={
                        userDetail.kyc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        userDetail.kyc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        userDetail.kyc.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {userDetail.kyc.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      Submission #{userDetail.kyc.submissionCount}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 flex items-center gap-1">
                          <CreditCard className="h-3 w-3" /> CNIC Number
                        </Label>
                        <p className="font-medium">{userDetail.kyc.cnicNumber}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Date of Birth</Label>
                        <p className="font-medium">{formatDate(userDetail.kyc.dateOfBirth)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Gender</Label>
                        <p className="font-medium capitalize">{userDetail.kyc.gender}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> City
                        </Label>
                        <p className="font-medium">{userDetail.kyc.city}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Province</Label>
                        <p className="font-medium">{userDetail.kyc.province}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Country</Label>
                        <p className="font-medium">{userDetail.kyc.country}</p>
                      </div>
                    </div>

                    {userDetail.kyc.rejectionReason && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Rejection Reason:</strong> {userDetail.kyc.rejectionReason}
                        </AlertDescription>
                      </Alert>
                    )}

                    {userDetail.kyc.approvedAt && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Approved on {formatDateTime(userDetail.kyc.approvedAt)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {userDetail.kyc.documents.map((doc) => (
                        <div key={doc.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-sm">
                                {doc.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <Badge variant={
                              doc.status === 'verified' ? 'default' : 
                              doc.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }>
                              {doc.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{doc.fileName}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(doc.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                {(userDetail.kyc.status === 'pending' || userDetail.kyc.status === 'in_review') && (
                  <Card>
                    <CardHeader>
                      <CardTitle>KYC Actions</CardTitle>
                      <CardDescription>Review and take action on this KYC submission</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => setApproveDialogOpen(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve KYC
                        </Button>
                        <Button
                          onClick={() => setRejectDialogOpen(true)}
                          variant="destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject KYC
                        </Button>
                        <Button
                          onClick={() => setRequestDocsDialogOpen(true)}
                          variant="outline"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Request Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Audit Logs */}
                {userDetail.auditLogs && userDetail.auditLogs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userDetail.auditLogs.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{log.action}</p>
                              <p className="text-xs text-gray-600">{log.description}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatDateTime(log.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No KYC submission found for this user</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve KYC</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this KYC submission?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approveNote">Note (Optional)</Label>
              <Textarea
                id="approveNote"
                placeholder="Add any notes about this approval..."
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
              {actionLoading ? <><LoadingSpinner size="sm" className="mr-2" />Approving...</> : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectReason">Rejection Reason *</Label>
              <Textarea
                id="rejectReason"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={actionLoading} variant="destructive">
              {actionLoading ? <><LoadingSpinner size="sm" className="mr-2" />Rejecting...</> : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Documents Dialog */}
      <Dialog open={requestDocsDialogOpen} onOpenChange={setRequestDocsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Documents</DialogTitle>
            <DialogDescription>
              Select which documents you need the user to resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Types *</Label>
              {['cnic_front', 'cnic_back', 'selfie'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={requestDocsData.documentTypes.includes(type)}
                    onCheckedChange={() => toggleDocumentType(type)}
                  />
                  <label htmlFor={type} className="text-sm cursor-pointer">
                    {type.replace('_', ' ').toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="requestMessage">Message *</Label>
              <Textarea
                id="requestMessage"
                placeholder="Explain why you need these documents..."
                value={requestDocsData.message}
                onChange={(e) => setRequestDocsData({ ...requestDocsData, message: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDocsDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleRequestDocuments} disabled={actionLoading}>
              {actionLoading ? <><LoadingSpinner size="sm" className="mr-2" />Sending...</> : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

