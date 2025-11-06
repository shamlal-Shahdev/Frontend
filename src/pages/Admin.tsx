import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, FileCheck, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/integration/admin.api";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [kycSubmissions, setKycSubmissions] = useState<any[]>([]);
  const [installations, setInstallations] = useState<any[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const isAdmin = await adminApi.checkAdminRole();
      if (isAdmin) {
        setIsAdmin(true);
        fetchKYCSubmissions();
        fetchInstallations();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
    }
  };

  const fetchKYCSubmissions = async () => {
    try {
      const data = await adminApi.getPendingKYC();
      setKycSubmissions(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch KYC submissions",
        variant: "destructive",
      });
    }
  };

  const fetchInstallations = async () => {
    try {
      const data = await adminApi.getPendingInstallations();
      setInstallations(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch installations",
        variant: "destructive",
      });
    }
  };

  const handleKYCReview = async (submissionId: string, status: "approved" | "rejected") => {
    try {
      await adminApi.reviewKYC(
        submissionId,
        status,
        status === "rejected" ? rejectionReason : undefined
      );

      toast({
        title: "Success!",
        description: `KYC ${status === "approved" ? "approved" : "rejected"} successfully`,
      });
      
      setRejectionReason("");
      fetchKYCSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInstallationReview = async (installationId: string, status: "verified" | "rejected") => {
    try {
      await adminApi.reviewInstallation(installationId, status);

      toast({
        title: "Success!",
        description: `Installation ${status === "verified" ? "verified" : "rejected"} successfully`,
      });
      
      fetchInstallations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container px-4 py-8">
          <Card className="glass-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this page
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage users, KYC submissions, and installations
            </p>
          </div>

          <Tabs defaultValue="kyc" className="space-y-6">
            <TabsList className="glass-card">
              <TabsTrigger value="kyc">
                <FileCheck className="h-4 w-4 mr-2" />
                KYC Reviews
              </TabsTrigger>
              <TabsTrigger value="installations">
                <Zap className="h-4 w-4 mr-2" />
                Installations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kyc" className="space-y-4">
              {kycSubmissions.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending KYC submissions
                  </CardContent>
                </Card>
              ) : (
                kycSubmissions.map((submission) => (
                  <Card key={submission.id} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{(submission.profiles as any)?.full_name || "Unknown User"}</CardTitle>
                          <CardDescription>{(submission.profiles as any)?.email}</CardDescription>
                        </div>
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Pending Review
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">CNIC Front</p>
                          <a 
                            href={submission.cnic_front_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">CNIC Back</p>
                          <a 
                            href={submission.cnic_back_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Utility Bill</p>
                          <a 
                            href={submission.utility_bill_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Selfie</p>
                          <a 
                            href={submission.selfie_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rejection Reason (if applicable)</label>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                          onClick={() => handleKYCReview(submission.id, "approved")}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                          onClick={() => handleKYCReview(submission.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="installations" className="space-y-4">
              {installations.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending installation verifications
                  </CardContent>
                </Card>
              ) : (
                installations.map((installation) => (
                  <Card key={installation.id} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{(installation.profiles as any)?.full_name || "Unknown User"}</CardTitle>
                          <CardDescription>{(installation.profiles as any)?.email}</CardDescription>
                        </div>
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Pending Verification
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{installation.installation_type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Capacity</p>
                          <p className="font-medium">{installation.capacity_kw} kW</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Inverter ID</p>
                          <p className="font-medium">{installation.inverter_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{installation.location}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                          onClick={() => handleInstallationReview(installation.id, "verified")}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                          onClick={() => handleInstallationReview(installation.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
