import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Upload, Camera, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/integration/api";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  city: string;
  province: string;
  country: string;
  cnicNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const KYCSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    city: "",
    province: "",
    country: "Pakistan",
    cnicNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const [documents, setDocuments] = useState({
    cnicFront: null as File | null,
    cnicBack: null as File | null,
    selfie: null as File | null,
  });

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9+\-\s()]*$/.test(value)) {
      handlePersonalInfoChange("phone", value);
    } else {
      toast({
        title: "Invalid Input",
        description: "Phone number must contain only numbers",
        variant: "destructive",
      });
    }
  };

  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    // Format as 12345-1234567-1 (5 digits - 7 digits - 1 digit)
    if (value.length > 13) {
      value = value.slice(0, 13); // Limit to 13 digits
    }
    // Add formatting
    if (value.length > 12) {
      value = value.slice(0, 5) + '-' + value.slice(5, 12) + '-' + value.slice(12);
    } else if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5);
    }
    handlePersonalInfoChange("cnicNumber", value);
  };

  const handleFileChange = (field: "cnicFront" | "cnicBack" | "selfie", file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateStep1 = (): boolean => {
    const required = ["firstName", "lastName", "phone", "gender", "dateOfBirth", "city", "province", "country"];
    const missing = required.filter(field => !personalInfo[field as keyof PersonalInfo]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!personalInfo.cnicNumber) {
      toast({
        title: "Missing CNIC Number",
        description: "Please enter your CNIC number.",
        variant: "destructive",
      });
      return false;
    }
    
    // Validate CNIC format (Pakistani format: 12345-1234567-1)
    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicPattern.test(personalInfo.cnicNumber.replace(/\s/g, ''))) {
      toast({
        title: "Invalid CNIC Format",
        description: "CNIC number must be in format: 12345-1234567-1",
        variant: "destructive",
      });
      return false;
    }
    
    if (!documents.cnicFront || !documents.cnicBack) {
      toast({
        title: "Missing Documents",
        description: "Please upload both CNIC front and back images.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    const required = ["email", "password", "confirmPassword"];
    const missing = required.filter(field => !personalInfo[field as keyof PersonalInfo]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    if (personalInfo.password !== personalInfo.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    // Validate password strength (backend requirements)
    if (personalInfo.password.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return false;
    }

    // Check for uppercase, lowercase, number, and special character
    const hasUpperCase = /[A-Z]/.test(personalInfo.password);
    const hasLowerCase = /[a-z]/.test(personalInfo.password);
    const hasNumber = /[0-9]/.test(personalInfo.password);
    const hasSpecialChar = /[@$!%*?&]/.test(personalInfo.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast({
        title: "Invalid Password",
        description: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!documents.selfie) {
      toast({
        title: "Missing Selfie",
        description: "Please upload your selfie for face verification.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    // Validate all required documents
    if (!documents.cnicFront || !documents.cnicBack || !documents.selfie) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents (CNIC Front, CNIC Back, and Selfie).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validate data before sending
      console.log('📋 Registration Data:', {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        city: personalInfo.city,
        province: personalInfo.province,
        country: personalInfo.country,
        gender: personalInfo.gender,
        dateOfBirth: personalInfo.dateOfBirth,
        cnicNumber: personalInfo.cnicNumber,
        hasFiles: {
          cnicFront: !!documents.cnicFront,
          cnicBack: !!documents.cnicBack,
          selfie: !!documents.selfie,
        },
      });

      // Use the authApi.registerWithKyc from integration
      const registrationData = {
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        email: personalInfo.email.trim().toLowerCase(),
        password: personalInfo.password,
        phone: personalInfo.phone.trim(),
        city: personalInfo.city.trim(),
        province: personalInfo.province.trim(),
        country: personalInfo.country.trim(),
        gender: personalInfo.gender as 'male' | 'female' | 'other',
        dateOfBirth: personalInfo.dateOfBirth, // Should be YYYY-MM-DD format
        cnicNumber: personalInfo.cnicNumber.trim().replace(/\s/g, ''), // Remove spaces
        cnicFront: documents.cnicFront!,
        cnicBack: documents.cnicBack!,
        selfie: documents.selfie!,
      };

      // Call the API
      const response = await authApi.registerWithKyc(registrationData);
      
      // Show success message
      toast({
        title: "Registration Successful! ✅",
        description: response.message || "Please check your email to verify your account. Your KYC has been submitted for review.",
      });

      // Redirect to login after a delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed ❌",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8 flex-wrap gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === currentStep
                  ? "bg-primary text-white"
                  : step < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step}
            </div>
            {step < 4 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  step < currentStep ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent energy-glow mb-4">
            <Zap className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">WattsUp Energy</h1>
          <p className="text-xl font-bold gradient-text">Power Up. Earn Up.</p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-center">KYC Verification</CardTitle>
            <CardDescription className="text-center">
              Complete your registration by verifying your identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepIndicator()}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="First Name"
                      value={personalInfo.firstName}
                      onChange={(e) => handlePersonalInfoChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      value={personalInfo.lastName}
                      onChange={(e) => handlePersonalInfoChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={personalInfo.phone}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={personalInfo.gender} onValueChange={(value) => handlePersonalInfoChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => handlePersonalInfoChange("dateOfBirth", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={personalInfo.city}
                      onChange={(e) => handlePersonalInfoChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <Input
                      id="province"
                      placeholder="Province"
                      value={personalInfo.province}
                      onChange={(e) => handlePersonalInfoChange("province", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="Country"
                    value={personalInfo.country}
                    onChange={(e) => handlePersonalInfoChange("country", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: CNIC Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cnicNumber">CNIC Number *</Label>
                  <Input
                    id="cnicNumber"
                    placeholder="12345-1234567-1"
                    value={personalInfo.cnicNumber}
                    onChange={handleCNICChange}
                    maxLength={15}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnicFront">CNIC Front Picture *</Label>
                  <div className="relative">
                    <input
                      id="cnicFront"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("cnicFront", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="cnicFront"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
                    >
                      {documents.cnicFront ? (
                        <>
                          <img
                            src={URL.createObjectURL(documents.cnicFront)}
                            alt="CNIC Front preview"
                            className="max-w-full max-h-48 rounded-lg mb-2"
                          />
                          <p className="text-sm font-medium">{documents.cnicFront.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload CNIC Front</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnicBack">CNIC Back Picture *</Label>
                  <div className="relative">
                    <input
                      id="cnicBack"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("cnicBack", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="cnicBack"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
                    >
                      {documents.cnicBack ? (
                        <>
                          <img
                            src={URL.createObjectURL(documents.cnicBack)}
                            alt="CNIC Back preview"
                            className="max-w-full max-h-48 rounded-lg mb-2"
                          />
                          <p className="text-sm font-medium">{documents.cnicBack.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload CNIC Back</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Email and Password */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Your Email"
                    value={personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Your Password"
                      value={personalInfo.password}
                      onChange={(e) => handlePersonalInfoChange("password", e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 bg-transparent border-0 p-0 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-type Your Password"
                      value={personalInfo.confirmPassword}
                      onChange={(e) => handlePersonalInfoChange("confirmPassword", e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 bg-transparent border-0 p-0 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Selfie Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="selfie">Face Verification - Selfie *</Label>
                  <div className="relative">
                    <input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => handleFileChange("selfie", e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="selfie"
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[300px]"
                    >
                      {documents.selfie ? (
                        <>
                          <img
                            src={URL.createObjectURL(documents.selfie)}
                            alt="Selfie preview"
                            className="max-w-full max-h-64 rounded-lg mb-2"
                          />
                          <p className="text-sm font-medium">{documents.selfie.name}</p>
                        </>
                      ) : (
                        <>
                          <Camera className="h-12 w-12 mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to take or upload selfie</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <div>
                {currentStep === 1 ? (
                  <Link to="/" className="text-sm text-primary hover:underline">
                    Back to Login
                  </Link>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="energy-glow"
                  disabled={isLoading}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="energy-glow"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KYCSignup;

