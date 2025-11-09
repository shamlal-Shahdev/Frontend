import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const KYC = () => {
  const [kycStatus, setKycStatus] = useState<"pending" | "approved" | "rejected" | "incomplete">("incomplete");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [files, setFiles] = useState({
    cnicFront: null as File | null,
    cnicBack: null as File | null,
    selfie: null as File | null,
    utilityBill: null as File | null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // DUMMY API CALL FOR UI TESTING - Remove this when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate KYC status
      // In real implementation, this would call: GET /api/kyc/status
      const dummyStatus = "incomplete"; // Change to 'pending', 'approved', or 'rejected' to test
      setKycStatus(dummyStatus as any);

      /* 
      // REAL API CALL - Uncomment this when backend is ready
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKycStatus(data.status || "incomplete");
      }
      */
    } catch (error) {
      console.error("Failed to fetch KYC status:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    // DUMMY FILE UPLOAD FOR UI TESTING - Remove this when backend is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate file upload - return a placeholder URL
    const dummyUrl = `https://via.placeholder.com/400x250?text=${folder}`;
    return dummyUrl;

    /* 
    // REAL API CALL - Uncomment this when backend is ready
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'File upload failed');
    }

    const data = await response.json();
    return data.url || data.publicUrl || data.path;
    */
  };

  const handleSubmit = async () => {
    if (!files.cnicFront || !files.cnicBack || !files.selfie || !files.utilityBill) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      setUploading("CNIC Front");
      const cnicFrontUrl = await uploadFile(files.cnicFront, "cnic-front");
      
      setUploading("CNIC Back");
      const cnicBackUrl = await uploadFile(files.cnicBack, "cnic-back");
      
      setUploading("Selfie");
      const selfieUrl = await uploadFile(files.selfie, "selfie");
      
      setUploading("Utility Bill");
      const utilityBillUrl = await uploadFile(files.utilityBill, "utility-bill");

      // DUMMY API CALL FOR UI TESTING - Remove this when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("KYC Submission (dummy):", {
        cnicFrontUrl,
        cnicBackUrl,
        selfieUrl,
        utilityBillUrl,
      });

      toast({
        title: "Success!",
        description: "Your KYC documents have been submitted for review",
      });
      setKycStatus("pending");

      /* 
      // REAL API CALL - Uncomment this when backend is ready
      const formData = new FormData();
      formData.append('cnicFront', files.cnicFront);
      formData.append('cnicBack', files.cnicBack);
      formData.append('selfie', files.selfie);
      formData.append('utilityBill', files.utilityBill);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/kyc/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'KYC submission failed');
      }

      toast({
        title: "Success!",
        description: "Your KYC documents have been submitted for review",
      });
      setKycStatus("pending");
      */
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(null);
    }
  };

  const getStatusBadge = () => {
    if (kycStatus === "approved") {
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Verified
        </Badge>
      );
    }
    if (kycStatus === "pending") {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <Clock className="h-4 w-4 mr-1" />
          Under Review
        </Badge>
      );
    }
    if (kycStatus === "rejected") {
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <AlertCircle className="h-4 w-4 mr-1" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <AlertCircle className="h-4 w-4 mr-1" />
        Incomplete
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">KYC Verification</h1>
              <p className="text-muted-foreground mt-2">
                Complete your identity verification to access all features
              </p>
            </div>
            {getStatusBadge()}
          </div>

          <Card className="glass-card animate-slide-up">
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>
                Upload your CNIC (front and back), utility bill, and a recent selfie for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnicFront">CNIC Front *</Label>
                  <div className="relative">
                    <input
                      id="cnicFront"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "cnicFront")}
                      className="hidden"
                    />
                    <label
                      htmlFor="cnicFront"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center"
                    >
                      {files.cnicFront ? (
                        <>
                          <FileText className="h-8 w-8 mb-2 text-primary" />
                          <p className="text-sm font-medium">{files.cnicFront.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnicBack">CNIC Back *</Label>
                  <div className="relative">
                    <input
                      id="cnicBack"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "cnicBack")}
                      className="hidden"
                    />
                    <label
                      htmlFor="cnicBack"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center"
                    >
                      {files.cnicBack ? (
                        <>
                          <FileText className="h-8 w-8 mb-2 text-primary" />
                          <p className="text-sm font-medium">{files.cnicBack.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utilityBill">Utility Bill *</Label>
                  <div className="relative">
                    <input
                      id="utilityBill"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e, "utilityBill")}
                      className="hidden"
                    />
                    <label
                      htmlFor="utilityBill"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center"
                    >
                      {files.utilityBill ? (
                        <>
                          <FileText className="h-8 w-8 mb-2 text-primary" />
                          <p className="text-sm font-medium">{files.utilityBill.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selfie">Selfie *</Label>
                  <div className="relative">
                    <input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "selfie")}
                      className="hidden"
                    />
                    <label
                      htmlFor="selfie"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center"
                    >
                      {files.selfie ? (
                        <>
                          <FileText className="h-8 w-8 mb-2 text-primary" />
                          <p className="text-sm font-medium">{files.selfie.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full energy-glow" 
                size="lg"
                onClick={handleSubmit}
                disabled={loading || kycStatus === "pending" || kycStatus === "approved"}
              >
                {loading ? `Uploading ${uploading}...` : kycStatus === "pending" ? "Submitted" : kycStatus === "approved" ? "Already Verified" : "Submit for Verification"}
              </Button>
            </CardContent>
          </Card>

          {kycStatus === "pending" && (
            <Card className="glass-card border-yellow-500/20">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Verification in Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Your documents are being reviewed by our team. This typically takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default KYC;
