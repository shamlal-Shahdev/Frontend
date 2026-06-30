import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  vendorApi,
  VendorUsageImportBatch,
} from '@/api/vendor.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  Download,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';

function defaultPeriodYm(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatPeriodLabel(periodYearMonth: string): string {
  const [year, month] = periodYearMonth.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

export const VendorUsageImport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [batches, setBatches] = useState<VendorUsageImportBatch[]>([]);
  const [total, setTotal] = useState(0);

  const loadList = async () => {
    setLoadingList(true);
    try {
      const res = await vendorApi.listUsageImports(1, 20);
      setBatches(res.data || []);
      setTotal(res.total || 0);
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to load import history',
        variant: 'destructive',
      });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await vendorApi.downloadUsageImportTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wattsup-usage-import-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({
        title: 'Error',
        description: 'Could not download template',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'File required',
        description: 'Choose a .csv or .xlsx file.',
        variant: 'destructive',
      });
      return;
    }
    setUploading(true);
    try {
      await vendorApi.uploadUsageImport(defaultPeriodYm(), file);
      toast({
        title: 'Import processed',
        description: 'Usage file was uploaded and rewards were applied where rows matched completed installs.',
      });
      setFile(null);
      await loadList();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast({
        title: 'Upload failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const statusBadge = (status: VendorUsageImportBatch['status']) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-900',
      processing: 'bg-blue-100 text-blue-900',
      completed: 'bg-green-100 text-green-900',
      failed: 'bg-red-100 text-red-900',
    };
    return (
      <Badge className={map[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly usage import</h1>
          <p className="text-gray-600 text-sm mt-1">
            Upload meter_id and total_kWh for the calendar month. Rows must match a{' '}
            <strong>completed</strong> installation with the same meter ID on your account.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Manual entry
            </CardTitle>
            <CardDescription>
              <code className="text-xs bg-gray-100 px-1 rounded">total_kwh</code> is kWh consumed in
              the selected month (not cumulative register).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period">Calendar month</Label>
                <div
                  id="period"
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900"
                >
                  {formatPeriodLabel(defaultPeriodYm())}
                </div>
                <p className="text-xs text-gray-500">
                  Only the current calendar month can be uploaded.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">CSV or Excel (.xlsx)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV template
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload and apply rewards
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent imports ({total})</CardTitle>
            <CardDescription>Status and row summary for your uploads.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingList ? (
              <p className="text-gray-500">Loading…</p>
            ) : batches.length === 0 ? (
              <p className="text-gray-500">No imports yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-600">
                      <th className="py-2 pr-4">Period</th>
                      <th className="py-2 pr-4">File</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr key={b.id} className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-medium">{b.periodYearMonth}</td>
                        <td className="py-2 pr-4 max-w-[200px] truncate" title={b.originalFilename}>
                          {b.originalFilename}
                        </td>
                        <td className="py-2 pr-4">{statusBadge(b.status)}</td>
                        <td className="py-2 text-gray-600">
                          {b.summaryJson
                            ? `${String((b.summaryJson as { acceptedCredited?: number }).acceptedCredited ?? 0)} credited, ${String((b.summaryJson as { rejected?: number }).rejected ?? 0)} rejected`
                            : b.errorMessage || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
