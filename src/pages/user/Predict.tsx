import { useState, useEffect } from 'react';
import {
  predictionApi,
  Prediction,
  PredictionStatusResponse,
  PredictionRewardTier,
} from '@/api/prediction.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import {
  FileCheck,
  Loader2,
  Lock,
  HelpCircle,
  Trophy,
  Frown,
  Clock,
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatMonthYear = (month: number, year: number) =>
  `${MONTH_NAMES[month - 1]} ${year}`;

const formatAccuracyRange = (tier: PredictionRewardTier) => {
  if (tier.maxAccuracy == null) {
    return `${tier.minAccuracy}%+`;
  }
  return `${tier.minAccuracy}–${tier.maxAccuracy}%`;
};

const RewardTiersTable = ({
  tiers,
  compact = false,
}: {
  tiers: PredictionRewardTier[];
  compact?: boolean;
}) => (
  <div className={compact ? 'rounded-lg border bg-gray-50/80 overflow-hidden' : ''}>
    <Table>
      <TableHeader>
        <TableRow className={compact ? 'hover:bg-transparent' : undefined}>
          <TableHead className={compact ? 'h-9 text-xs' : undefined}>Accuracy</TableHead>
          <TableHead className={compact ? 'h-9 text-xs' : undefined}>Reward</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tiers.map((tier) => (
          <TableRow key={tier.label} className={compact ? 'hover:bg-transparent' : undefined}>
            <TableCell className={compact ? 'py-2 text-sm' : undefined}>
              {formatAccuracyRange(tier)}
            </TableCell>
            <TableCell className={compact ? 'py-2 text-sm font-medium text-green-700' : 'font-medium text-green-700'}>
              {tier.tokens} WATT
            </TableCell>
          </TableRow>
        ))}
        <TableRow className={compact ? 'hover:bg-transparent' : undefined}>
          <TableCell className={compact ? 'py-2 text-sm text-gray-500' : 'text-gray-500'}>
            Below 80%
          </TableCell>
          <TableCell className={compact ? 'py-2 text-sm text-gray-500' : 'text-gray-500'}>
            No reward
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

const getOutcomeBadge = (prediction: Prediction) => {
  if (prediction.status === 'locked') {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
        <Clock className="w-3 h-3 mr-1" />
        Awaiting Results
      </Badge>
    );
  }

  const result = prediction.predictionResult;
  if (!result) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
        Processing
      </Badge>
    );
  }

  const rewardTokens = Number(result.rewardTokens);
  if (result.bonusAwarded && rewardTokens > 0) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
        <Trophy className="w-3 h-3 mr-1" />
        Rewarded
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
      <Frown className="w-3 h-3 mr-1" />
      Better luck next time
    </Badge>
  );
};

export const Predict = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<PredictionStatusResponse | null>(null);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [predictedKwh, setPredictedKwh] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const statusRes = await predictionApi.getStatus();
      const historyRes = await predictionApi.getHistory(1, 100);
      setStatus(statusRes);
      setHistory(historyRes.data);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to load prediction data';
      toast({
        title: 'Error',
        description: message || 'Failed to load prediction data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const installationId = status?.eligibility.completedInstallations[0]?.id;
    if (!installationId || !predictedKwh) {
      toast({
        title: 'Missing fields',
        description: 'Please enter predicted kWh.',
        variant: 'destructive',
      });
      return;
    }

    const kwh = parseFloat(predictedKwh);
    if (!Number.isFinite(kwh) || kwh <= 0) {
      toast({
        title: 'Invalid value',
        description: 'Predicted kWh must be a positive number.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await predictionApi.submit({
        installationId,
        predictedKwh: kwh,
      });
      toast({
        title: 'Prediction submitted!',
        description: 'Your prediction is locked for this month. Good luck!',
      });
      setPredictedKwh('');
      await loadData();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to submit prediction';
      toast({
        title: 'Submission failed',
        description: message || 'Failed to submit prediction',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    status?.window.isOpen &&
    status?.eligibility.eligible &&
    !status?.hasSubmittedThisMonth;

  if (loading && !status) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <FileCheck className="w-8 h-8 text-green-600" />
        Predict &amp; Win
      </h1>

      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Prediction</CardTitle>
            <CardDescription>
              Predict energy generation for{' '}
              {formatMonthYear(status!.window.targetMonth, status!.window.targetYear)}.
              Submissions are locked after submit — no edits allowed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="predictedKwh">Predicted Energy Generation (kWh)</Label>
                <Input
                  id="predictedKwh"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 550"
                  value={predictedKwh}
                  onChange={(e) => setPredictedKwh(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit & Lock Prediction'
                )}
              </Button>
            </form>

            {status?.rewardTiers && (
              <div className="pt-4 border-t">
                <Accordion type="single" collapsible>
                  <AccordionItem value="how-it-works" className="border-none">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <span className="flex items-center gap-2 text-base font-medium">
                        <HelpCircle className="w-5 h-5 text-green-600" />
                        How it works
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">When to predict</p>
                        <p>
                          Submit between the 1st and 3rd of each month for that month&apos;s
                          generation. One prediction per month — locked after submit.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">When rewards are paid</p>
                        <p>
                          At month end, your vendor uploads actual energy data. The system compares
                          your prediction with actual generation, calculates accuracy, and transfers
                          WATT tokens to your wallet automatically.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Reward tiers</p>
                        <RewardTiersTable tiers={status.rewardTiers.tiers} compact />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Accuracy formula</p>
                        <p className="font-mono text-xs bg-gray-100 rounded px-3 py-2 text-gray-800">
                          Accuracy = (1 − |Prediction − Actual| / Actual) × 100
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {status?.hasSubmittedThisMonth && status.currentMonthPrediction?.status === 'locked' && (
        <Alert className="border-green-200 bg-green-50">
          <Lock className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your prediction for this month is locked. Results will be calculated automatically
            when vendor uploads actual generation data at month end.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
          <CardDescription>Your past predictions and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No prediction history yet.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((p) => (
                    <TableRow key={p.id}>
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
                          ? Number(p.predictionResult.rewardTokens) > 0
                            ? `${Number(p.predictionResult.rewardTokens).toFixed(0)} WATT`
                            : '0 WATT'
                          : '—'}
                      </TableCell>
                      <TableCell>{getOutcomeBadge(p)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
