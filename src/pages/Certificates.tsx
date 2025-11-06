import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Award, Calendar, Zap } from "lucide-react";

const Certificates = () => {
  const certificates = [
    {
      id: 1,
      month: "January 2024",
      energyGenerated: "245 kWh",
      co2Offset: "175 kg",
      tokensEarned: "680 ZAB",
      issueDate: "2024-02-01",
      status: "issued"
    },
    {
      id: 2,
      month: "February 2024",
      energyGenerated: "298 kWh",
      co2Offset: "213 kg",
      tokensEarned: "825 ZAB",
      issueDate: "2024-03-01",
      status: "issued"
    },
    {
      id: 3,
      month: "March 2024",
      energyGenerated: "312 kWh",
      co2Offset: "223 kg",
      tokensEarned: "865 ZAB",
      issueDate: "Pending",
      status: "pending"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight">Proof of Green Certificates</h1>
            <p className="text-muted-foreground mt-2">
              Your verified renewable energy contribution certificates
            </p>
          </div>

          <div className="grid gap-6">
            {certificates.map((cert, index) => (
              <Card 
                key={cert.id} 
                className="glass-card hover:scale-102 transition-all animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent energy-glow">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        {cert.month}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Issued: {cert.issueDate}
                      </CardDescription>
                    </div>
                    <Badge className={cert.status === "issued" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}>
                      {cert.status === "issued" ? "Issued" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Energy Generated</p>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <p className="text-2xl font-bold">{cert.energyGenerated}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">CO₂ Offset</p>
                      <p className="text-2xl font-bold text-green-500">{cert.co2Offset}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tokens Earned</p>
                      <p className="text-2xl font-bold text-primary">{cert.tokensEarned}</p>
                    </div>
                  </div>
                  
                  {cert.status === "issued" && (
                    <Button className="w-full energy-glow" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Certificate (PDF)
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Certificates;
