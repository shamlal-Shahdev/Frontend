import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";


const Energy = () => {
  const [installations, setInstallations] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [totalEnergy, setTotalEnergy] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch installations
    const { data: installationsData } = await supabase
      .from("installations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (installationsData) {
      setInstallations(installationsData);

      // Fetch readings for all installations
      const installationIds = installationsData.map(i => i.id);
      if (installationIds.length > 0) {
        const { data: readingsData } = await supabase
          .from("energy_readings")
          .select("*")
          .in("installation_id", installationIds)
          .order("reading_date", { ascending: false })
          .limit(10);

        if (readingsData) {
          setReadings(readingsData);
          const total = readingsData.reduce((sum, r) => sum + parseFloat(String(r.reading_kwh)), 0);
          setTotalEnergy(total);
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight">Energy Monitoring</h1>
            <p className="text-muted-foreground mt-2">
              Track your renewable energy generation
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Energy Generated</CardTitle>
                <Zap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEnergy.toFixed(2)} kWh</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time production
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Installations</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {installations.filter(i => i.status === "verified").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Verified systems
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Reading</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {readings.length > 0 ? `${parseFloat(readings[0].reading_kwh).toFixed(2)} kWh` : "No data"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {readings.length > 0 ? formatDate(readings[0].reading_date) : "Waiting for data"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Your Installations</CardTitle>
              <CardDescription>
                Manage and monitor your renewable energy systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {installations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No installations registered yet</p>
                  <p className="text-sm mt-2">Visit the Install to Earn page to register your system</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {installations.map((installation) => (
                    <div key={installation.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold capitalize">{installation.installation_type} System</h3>
                          <p className="text-sm text-muted-foreground">{installation.location}</p>
                        </div>
                        <Badge 
                          className={
                            installation.status === "verified" 
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : installation.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {installation.status === "verified" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {installation.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {installation.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Capacity</p>
                          <p className="font-medium">{installation.capacity_kw} kW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Inverter ID</p>
                          <p className="font-medium">{installation.inverter_id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Energy Readings</CardTitle>
              <CardDescription>
                Latest verified energy production data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No energy readings recorded yet
                </div>
              ) : (
                <div className="space-y-3">
                  {readings.map((reading) => (
                    <div key={reading.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{parseFloat(reading.reading_kwh).toFixed(2)} kWh</p>
                        <p className="text-sm text-muted-foreground">{formatDate(reading.reading_date)}</p>
                      </div>
                      <Badge 
                        variant={reading.verified ? "default" : "outline"}
                        className={reading.verified ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                      >
                        {reading.verified ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Energy;
