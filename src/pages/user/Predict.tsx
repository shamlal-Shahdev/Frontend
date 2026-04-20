import { Card, CardContent } from '@/components/ui/card';
import { FileCheck, Clock } from 'lucide-react';

export const Predict = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <FileCheck className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Predict & Win</h1>
                <p className="text-xl text-gray-600 mb-4">Coming Soon</p>
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Clock className="w-5 h-5" />
                  <span>We&apos;re working on something amazing!</span>
                </div>
              </div>
              <p className="text-gray-600 max-w-md mx-auto">
                Predict energy generation patterns, compete with other users, and win exciting rewards.
                Test your forecasting skills and earn bonus WATT tokens!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
