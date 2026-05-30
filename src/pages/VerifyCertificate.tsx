import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateApi } from '@/api/certificate.api';
import type { CertificateVerifyResult } from '@/types/certificate.types';
import {
  ACHIEVEMENT_LABELS,
  formatCertificateMonth,
  getApiErrorMessage,
} from '@/types/certificate.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';

export default function VerifyCertificate() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CertificateVerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!certificateId) {
        setError('Certificate ID is required');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await certificateApi.verify(certificateId);
        setResult(data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Certificate not found or invalid'));
      } finally {
        setLoading(false);
      }
    };
    void verify();
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <ShieldCheck className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="text-gray-600 mt-1">Proof of Green — WattsUp Energy</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verification Result</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-6 space-y-3">
                <XCircle className="w-10 h-10 text-red-500 mx-auto" />
                <p className="text-gray-700">{error}</p>
                <Button asChild variant="outline">
                  <Link to="/login">Go to Login</Link>
                </Button>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {result.status === 'active' && result.digitallyVerified ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <Badge className="bg-green-100 text-green-800">Verified & Active</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <Badge variant="destructive">Revoked or Invalid</Badge>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Certificate ID</p>
                    <p className="font-mono">{result.certificateId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">User</p>
                    <p className="font-medium">{result.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Period</p>
                    <p>{formatCertificateMonth(result.month, result.year)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Energy Generated</p>
                    <p>{result.energyGenerated.toFixed(2)} kWh</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CO₂ Offset</p>
                    <p>{result.co2Offset.toFixed(2)} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Achievement</p>
                    <p>{ACHIEVEMENT_LABELS[result.achievementLevel]}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Issue Date</p>
                    <p>{new Date(result.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-gray-500">Blockchain Transaction</p>
                    <p className="font-mono text-xs break-all">{result.transactionHash}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 pt-2 border-t">
                  Issued By: Proof of Green Platform — Digitally Verified
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
