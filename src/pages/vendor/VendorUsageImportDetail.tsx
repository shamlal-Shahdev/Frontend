import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorApi, VendorUsageImportBatch, VendorUsageImportRow } from '@/api/vendor.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';

export const VendorUsageImportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<VendorUsageImportBatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBatchDetail(parseInt(id, 10));
    }
  }, [id]);

  const loadBatchDetail = async (batchId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vendorApi.getUsageImport(batchId);
      setBatch(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load batch details';
      setError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: 'Transaction hash copied successfully',
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-lg">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/vendor/usage-imports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Monthly Imports
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-red-900">Failed to Load Import Batch</h2>
            <p className="text-red-700">{error || 'Batch not found'}</p>
            <Button onClick={() => id && loadBatchDetail(parseInt(id, 10))}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = batch.summaryJson as {
    acceptedCredited?: number;
    acceptedSkipped?: number;
    rejected?: number;
    mintFailed?: number;
    totalRows?: number;
  } | null;

  const rows: VendorUsageImportRow[] = batch.rows ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vendor/usage-imports')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 pl-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Monthly Usage Imports
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Batch #{batch.id} Detail
            </h1>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                batch.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : batch.status === 'failed'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : batch.status === 'processing'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {batch.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" /> Period: <strong className="text-gray-700">{batch.periodYearMonth}</strong>
            </span>
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4 text-gray-400" /> File: <strong className="text-gray-700">{batch.originalFilename}</strong>
            </span>
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => loadBatchDetail(batch.id)}
          className="flex items-center gap-2"
        >
          Refresh Batch Status
        </Button>
      </div>

      {batch.errorMessage && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Batch Execution Warning / Error</p>
                <p className="text-sm text-red-700 mt-1">{batch.errorMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.totalRows ?? rows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200 bg-emerald-50/30">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-700">Credited / Minted</p>
                <p className="text-2xl font-bold text-emerald-900">{summary?.acceptedCredited ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200 bg-amber-50/30">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-700">Skipped (Existing)</p>
                <p className="text-2xl font-bold text-amber-900">{summary?.acceptedSkipped ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-200 bg-red-50/30">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-red-700">Rejected / Failed</p>
                <p className="text-2xl font-bold text-red-900">
                  {(summary?.rejected ?? 0) + (summary?.mintFailed ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rows Table Card */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-gray-50/50 py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-gray-500" />
            Imported Usage Rows & Blockchain Mint Details
          </CardTitle>
          <CardDescription>
            Row-by-row breakdown of imported meter data, status, and on-chain Sepolia transaction hashes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No individual rows recorded for this batch.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100/70 text-gray-700 uppercase tracking-wider text-xs border-b">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Row #</th>
                    <th className="py-3.5 px-4 font-semibold">Meter ID</th>
                    <th className="py-3.5 px-4 font-semibold">Usage (kWh)</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Reason Code</th>
                    <th className="py-3.5 px-4 font-semibold">Transaction Hash</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Etherscan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => {
                    const isAccepted = row.status === 'accepted';
                    const isRejected = row.status === 'rejected';

                    return (
                      <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-gray-600">
                          #{row.rowNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          {row.meterId}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          {typeof row.totalKwh === 'number'
                            ? row.totalKwh.toFixed(2)
                            : parseFloat(row.totalKwh || '0').toFixed(2)}{' '}
                          <span className="text-xs text-gray-500 font-normal">kWh</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isAccepted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              <XCircle className="w-3.5 h-3.5 text-red-600" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500 font-mono">
                          {row.reasonCode ? (
                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-medium">
                              {row.reasonCode}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          {row.txHash ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded border font-semibold">
                                {row.txHash.substring(0, 8)}...{row.txHash.substring(row.txHash.length - 6)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(row.txHash!)}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
                                title="Copy Tx Hash"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">
                              {isAccepted ? 'Processing mint...' : 'No transaction'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {row.txHash ? (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${row.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition-colors"
                            >
                              Sepolia Etherscan <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
