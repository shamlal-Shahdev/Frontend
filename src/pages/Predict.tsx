import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Gift } from "lucide-react";

const Predict = () => {
  const predictions = [
    {
      month: "March 2024",
      predicted: 320,
      actual: 312,
      accuracy: 97,
      bonus: 50,
      status: "completed"
    },
    {
      month: "February 2024",
      predicted: 280,
      actual: 298,
      accuracy: 94,
      bonus: 45,
      status: "completed"
    },
    {
      month: "April 2024",
      predicted: 350,
      actual: null,
      accuracy: null,
      bonus: null,
      status: "pending"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight">Predict & Win Bonus</h1>
            <p className="text-muted-foreground mt-2">
              Predict your monthly energy generation and earn bonus rewards for accuracy
            </p>
          </div>

          {/* Current Month Prediction */}
          <Card className="glass-card border-primary/20 animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent energy-glow animate-glow-pulse">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Make Your Prediction</CardTitle>
                  <CardDescription>Predict your energy generation for next month</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Last Month Average</p>
                      <p className="text-3xl font-bold">312 kWh</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">3-Month Average</p>
                      <p className="text-3xl font-bold">297 kWh</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prediction">Your Prediction (kWh)</Label>
                  <Input 
                    id="prediction" 
                    type="number" 
                    placeholder="Enter your prediction"
                    className="text-lg"
                  />
                </div>
                
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">Bonus Reward</p>
                        <p className="text-sm text-muted-foreground">
                          Earn up to <span className="text-primary font-bold">100 ZAB</span> bonus based on prediction accuracy
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full energy-glow" size="lg">
                  <Trophy className="mr-2 h-4 w-4" />
                  Submit Prediction
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prediction History */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Prediction History</h2>
            <div className="space-y-4">
              {predictions.map((pred, index) => (
                <Card 
                  key={pred.month} 
                  className="glass-card animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pred.month}</CardTitle>
                      <Badge className={pred.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}>
                        {pred.status === "completed" ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Predicted</p>
                        <p className="text-2xl font-bold">{pred.predicted} kWh</p>
                      </div>
                      {pred.actual && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Actual</p>
                            <p className="text-2xl font-bold">{pred.actual} kWh</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold text-primary">{pred.accuracy}%</p>
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Bonus Earned</p>
                            <p className="text-2xl font-bold text-green-500">+{pred.bonus} ZAB</p>
                          </div>
                        </>
                      )}
                      {!pred.actual && (
                        <div className="col-span-3 flex items-center text-muted-foreground">
                          <p>Waiting for month to complete...</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Predict;
