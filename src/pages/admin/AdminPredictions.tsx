import { useState, useEffect } from 'react';
import { predictionApi, Prediction } from '@/api/prediction.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileCheck, Loader2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatMonthYear = (month: number, year: number) =>
  `${MONTH_NAMES[month - 1]} ${year}`;

export const AdminPredictions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [data, setData] = useState<Prediction[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await predictionApi.getAdminAll(page, limit);
        setData(res.data);
        setTotal(res.total);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load predictions');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [page, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileCheck className="w-8 h-8 text-purple-600" />
          Predict &amp; Win
        </h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Read-only monitoring — rewards are calculated automatically at month end.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Predictions</CardTitle>
          <CardDescription>
            User submissions, evaluation results, and rewards issued by the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <p className="text-red-600 text-center py-8">{error}</p>
          ) : data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No predictions recorded yet.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Installation</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Predicted</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{p.user?.name ?? `User #${p.userId}`}</p>
                          <p className="text-xs text-gray-500">{p.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{p.installation?.name ?? `#${p.installationId}`}</TableCell>
                      <TableCell>{formatMonthYear(p.month, p.year)}</TableCell>
                      <TableCell>{Number(p.predictedKwh).toFixed(0)} kWh</TableCell>
                      <TableCell>
                        {p.predictionResult
                          ? `${Number(p.predictionResult.actualKwh).toFixed(0)} kWh`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {p.predictionResult?.accuracyPercent != null
                          ? `${Number(p.predictionResult.accuracyPercent).toFixed(1)}%`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {p.predictionResult
                          ? `${Number(p.predictionResult.rewardTokens).toFixed(0)} WATT`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            p.status === 'locked'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                              : 'bg-green-50 text-green-700 border-green-300'
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
