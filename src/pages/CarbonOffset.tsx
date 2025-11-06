import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingUp, TreePine, Wind } from "lucide-react";

const CarbonOffset = () => {
  const totalOffset = 892;
  const equivalents = [
    {
      icon: TreePine,
      label: "Trees Planted Equivalent",
      value: "41 trees",
      description: "Based on average CO₂ absorption"
    },
    {
      icon: Wind,
      label: "Coal Power Avoided",
      value: "986 kg",
      description: "Equivalent coal-based emissions"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight">CO₂ Offset Calculator</h1>
            <p className="text-muted-foreground mt-2">
              Track your environmental impact and carbon reduction
            </p>
          </div>

          {/* Total Offset Card */}
          <Card className="glass-card animate-slide-up border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total CO₂ Offset</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold gradient-text">{totalOffset}</span>
                    <span className="text-2xl text-muted-foreground">kg</span>
                  </div>
                  <p className="text-sm text-green-500 flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15.8% from last month
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 energy-glow animate-glow-pulse">
                  <Leaf className="h-16 w-16 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equivalents Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {equivalents.map((item, index) => (
              <Card 
                key={item.label} 
                className="glass-card animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent energy-glow">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.label}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly Breakdown */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Monthly CO₂ Offset Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { month: "March 2024", offset: 312, percentage: 35 },
                  { month: "February 2024", offset: 298, percentage: 33 },
                  { month: "January 2024", offset: 282, percentage: 32 }
                ].map((month) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-muted-foreground">{month.offset} kg CO₂</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                        style={{ width: `${month.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="glass-card bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Leaf className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="font-semibold">How is CO₂ offset calculated?</h3>
                  <p className="text-sm text-muted-foreground">
                    We calculate your carbon offset based on the clean energy you generate. For every kWh of renewable energy produced, you offset approximately 0.715 kg of CO₂ that would have been emitted by traditional fossil fuel power generation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CarbonOffset;
