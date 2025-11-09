import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Upload, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { useKYC } from '@/hooks/useKYC';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { formatDate } from '@/utils/date-formatter';
import { KycStatus } from '@/integration/kyc.api';

const statusConfig: Record<KycStatus, { icon: any; color: string; label: string; description: string }> = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    label: 'Pending Review',
    description: 'Your KYC documents are being reviewed by our team',
  },
  in_review: {
    icon: Eye,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    label: 'In Review',
    description: 'Our team is currently reviewing your documents',
  },
  approved: {
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50 border-green-200',
    label: 'Approved',
    description: 'Your KYC has been approved. You can now access all features',
  },
  rejected: {
    icon: AlertCircle,
    color: 'text-red-600 bg-red-50 border-red-200',
    label: 'Rejected',
    description: 'Your KYC submission was rejected. Please resubmit with updated documents',
  },
  additional_docs_required: {
    icon: Upload,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    label: 'Additional Documents Required',
    description: 'Please upload the requested additional documents',
  },
};

export default function KYCDashboard() {
  const { kycStatus, loading, error, fetchKycStatus, resubmitKyc } = useKYC();
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
  const [resubmitLoading, setResubmitLoading] = useState(false);
  const [resubmitFiles, setResubmitFiles] = useState({
    cnicFront: null as File | null,
    cnicBack: null as File | null,
    selfie: null as File | null,
    notes: '',
  });

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const handleResubmit = async () => {
    if (!resubmitFiles.cnicFront && !resubmitFiles.cnicBack && !resubmitFiles.selfie) {
      toast.error('Please select at least one document to resubmit');
      return;
    }

    try {
      setResubmitLoading(true);
      await resubmitKyc(resubmitFiles);
      toast.success('Documents resubmitted successfully');
      setResubmitDialogOpen(false);
      setResubmitFiles({
        cnicFront: null,
        cnicBack: null,
        selfie: null,
        notes: '',
      });
    } catch (err) {
      toast.error('Failed to resubmit documents');
    } finally {
      setResubmitLoading(false);
    }
  };

  if (loading && !kycStatus) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!kycStatus) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No KYC record found. Please complete your KYC registration.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const config = statusConfig[kycStatus.status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">KYC Status</h1>
          <p className="text-gray-600 mt-2">Manage your Know Your Customer verification</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Card */}
        <Card className={`mb-6 border-2 ${config.color}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${config.color}`}>
                  <StatusIcon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">{config.label}</CardTitle>
                  <CardDescription className="mt-1">{config.description}</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={config.color}>
                {kycStatus.status.toUpperCase().replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>

          {kycStatus.rejectionReason && (
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rejection Reason:</strong> {kycStatus.rejectionReason}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        {/* Personal Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">CNIC Number</Label>
                <p className="font-medium">{kycStatus.cnicNumber}</p>
              </div>
              <div>
                <Label className="text-gray-600">City</Label>
                <p className="font-medium">{kycStatus.city}</p>
              </div>
              <div>
                <Label className="text-gray-600">Province</Label>
                <p className="font-medium">{kycStatus.province}</p>
              </div>
              <div>
                <Label className="text-gray-600">Country</Label>
                <p className="font-medium">{kycStatus.country}</p>
              </div>
              <div>
                <Label className="text-gray-600">Gender</Label>
                <p className="font-medium capitalize">{kycStatus.gender}</p>
              </div>
              <div>
                <Label className="text-gray-600">Date of Birth</Label>
                <p className="font-medium">{formatDate(kycStatus.dateOfBirth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Submitted Documents</CardTitle>
            <CardDescription>
              Submission Count: {kycStatus.submissionCount} | 
              Submitted: {formatDate(kycStatus.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kycStatus.documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-sm">
                        {doc.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <Badge variant={doc.status === 'verified' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {doc.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{doc.fileName}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(doc.createdAt)}</p>
                  {doc.rejectionReason && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription className="text-xs">
                        {doc.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {(kycStatus.status === 'rejected' || kycStatus.status === 'additional_docs_required') && (
          <Card>
            <CardHeader>
              <CardTitle>Resubmit Documents</CardTitle>
              <CardDescription>
                Upload new documents to update your KYC application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={resubmitDialogOpen} onOpenChange={setResubmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resubmit Documents
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Resubmit KYC Documents</DialogTitle>
                    <DialogDescription>
                      Upload the documents that need to be updated. You don't need to resubmit all documents.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cnicFront">CNIC Front (Optional)</Label>
                      <Input
                        id="cnicFront"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setResubmitFiles({ ...resubmitFiles, cnicFront: e.target.files?.[0] || null })}
                      />
                      {resubmitFiles.cnicFront && (
                        <p className="text-sm text-gray-600 mt-1">{resubmitFiles.cnicFront.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cnicBack">CNIC Back (Optional)</Label>
                      <Input
                        id="cnicBack"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setResubmitFiles({ ...resubmitFiles, cnicBack: e.target.files?.[0] || null })}
                      />
                      {resubmitFiles.cnicBack && (
                        <p className="text-sm text-gray-600 mt-1">{resubmitFiles.cnicBack.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="selfie">Selfie (Optional)</Label>
                      <Input
                        id="selfie"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setResubmitFiles({ ...resubmitFiles, selfie: e.target.files?.[0] || null })}
                      />
                      {resubmitFiles.selfie && (
                        <p className="text-sm text-gray-600 mt-1">{resubmitFiles.selfie.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about your resubmission..."
                        value={resubmitFiles.notes}
                        onChange={(e) => setResubmitFiles({ ...resubmitFiles, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setResubmitDialogOpen(false)}
                      disabled={resubmitLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleResubmit}
                      disabled={resubmitLoading}
                    >
                      {resubmitLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

