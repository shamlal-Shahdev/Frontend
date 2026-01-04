import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kycApi } from '@/api/kyc.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export const KYCStatus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'none' | 'in_review' | 'additional_docs_required' | 'not_submitted'>('none');
  const [rejectionReason, setRejectionReason] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await kycApi.getStatus();
      const statusValue = response.status === 'none' ? 'not_submitted' : response.status;
      setStatus(statusValue as any);
      setRejectionReason(response.rejectionReason || '');
      setDocuments(response.documents || []);

      if (response.status === 'approved') {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to load KYC status', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === 'none' || status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">KYC Status: Not Submitted</CardTitle>
                <CardDescription>You need to submit KYC documents to access the dashboard</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-blue-800">
                Please complete the KYC verification process to access all features of your account.
              </p>
            </div>
            <Button onClick={() => navigate('/kyc/info')} className="w-full py-6 text-lg font-semibold">
              Start KYC Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'in_review') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">KYC Status: Pending</CardTitle>
                <CardDescription>Your KYC verification is under review</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-yellow-900 font-semibold text-lg mb-2">⏳ Verification in Progress</p>
                  <p className="text-sm text-yellow-800">
                    Your documents are being reviewed by our admin team. This process usually takes 1-3 business days. 
                    You will be notified once the review is complete.
                  </p>
                </div>
              </div>
            </div>

            {/* {documents.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Submitted Documents:</h3>
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {doc.docType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || `Document ${idx + 1}`}
                      </span>
                      <span className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                        {doc.status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'rejected' || status === 'additional_docs_required') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-2xl border-2 border-red-200">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-red-800">
                  KYC Status: {status === 'rejected' ? 'Rejected' : 'Additional Documents Required'}
                </CardTitle>
                <CardDescription className="text-red-700">
                  Your KYC verification was not approved
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-900 font-semibold text-lg mb-2">
                    {status === 'rejected' ? '❌ Documents Not Approved' : '⚠️ Additional Documents Required'}
                  </p>
                  <p className="text-sm text-red-800 mb-4">
                    {status === 'rejected' 
                      ? 'Your KYC documents have been reviewed and rejected by our admin team.'
                      : 'Your KYC submission requires additional documents to complete the verification process.'}
                  </p>
                  
                  {rejectionReason && (
                    <div className="bg-white border border-red-200 p-4 rounded-lg mt-4">
                      <p className="text-xs font-semibold text-red-900 mb-2 uppercase tracking-wide">Rejection Reason / Admin Feedback:</p>
                      <p className="text-sm text-red-700 font-medium leading-relaxed">{rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> Please review the feedback above and resubmit your documents with the correct information or additional documents as required.
                </p>
              </div>
            </div>

            {/* {documents.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Previously Submitted Documents:</h3>
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {doc.docType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || `Document ${idx + 1}`}
                      </span>
                      <span className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                        {doc.status || 'Rejected'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            <Button 
              onClick={() => navigate('/kyc/info')} 
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-6 text-lg shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Resubmit KYC Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};




