import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Settings, Check, Clock, X } from "lucide-react";

const InstallToEarn = () => {
  const installations = [
    {
      id: 1,
      name: "Rooftop Solar Array",
      type: "Solar",
      capacity: "5.5 kW",
      location: "Karachi, Pakistan",
      status: "verified",
      installDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Wind Turbine Unit",
      type: "Wind",
      capacity: "3.2 kW",
      location: "Lahore, Pakistan",
      status: "pending",
      installDate: "2024-02-20"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <Check className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Install to Earn</h1>
              <p className="text-muted-foreground mt-2">
                Register your renewable energy installations and start earning rewards
              </p>
            </div>
            <Button className="energy-glow">
              <Plus className="mr-2 h-4 w-4" />
              Register Installation
            </Button>
          </div>

          {/* Registration Form */}
          <Card className="glass-card animate-slide-up">
            <CardHeader>
              <CardTitle>Register New Installation</CardTitle>
              <CardDescription>
                Provide details about your solar or wind installation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="installType">Installation Type</Label>
                    <Select>
                      <SelectTrigger id="installType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solar">Solar Panels</SelectItem>
                        <SelectItem value="wind">Wind Turbine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (kW)</Label>
                    <Input id="capacity" type="number" step="0.1" placeholder="5.5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inverterId">Inverter/Device ID</Label>
                  <Input id="inverterId" placeholder="INV-2024-XXXX" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City, Region" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installDate">Installation Date</Label>
                  <Input id="installDate" type="date" />
                </div>

                <Button type="submit" className="w-full energy-glow">
                  Submit for Verification
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Installations */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">My Installations</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {installations.map((install) => (
                <Card key={install.id} className="glass-card hover:scale-105 transition-transform">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {install.name}
                          <Badge className={getStatusColor(install.status)}>
                            {getStatusIcon(install.status)}
                            {install.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {install.location}
                        </CardDescription>
                      </div>
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-semibold">{install.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Capacity</p>
                        <p className="font-semibold">{install.capacity}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Install Date</p>
                        <p className="font-semibold">{install.installDate}</p>
                      </div>
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

export default InstallToEarn;
