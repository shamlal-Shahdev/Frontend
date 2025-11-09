import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Edit2, Save, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth.context";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    email: "",
    full_name: "",
    phone: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      // REAL API CALL - Get current user profile
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      console.log('📧 Profile data received:', data);
      console.log('📧 Email from response:', data.email);
      console.log('📧 Phone from response:', data.phone);
      console.log('📧 Name from response:', data.name);
      console.log('📧 Full response keys:', Object.keys(data));
      
      setProfile({
        email: data.email || "",
        full_name: data.name || "",
        phone: data.phone || "",
      });
      
      console.log('📧 Profile state set:', {
        email: data.email || "",
        full_name: data.name || "",
        phone: data.phone || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      // REAL API CALL - Update user profile
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/auth/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.full_name.trim(),
          phone: profile.phone.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Profile update failed');
      }

      const updatedData = await response.json();
      
      // Update local state with response data
      setProfile({
        email: updatedData.email || profile.email,
        full_name: updatedData.name || profile.full_name,
        phone: updatedData.phone || "",
      });

      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });
      setEditing(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Use auth context logout which clears all storage
    logout();
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });

    // Redirect to login page
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information
            </p>
          </div>

          <Card className="glass-card animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </div>
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10">
                    <User className="h-10 w-10 text-primary" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!editing}
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  {editing ? (
                    <>
                      <Button 
                        className="flex-1 energy-glow" 
                        onClick={handleSave}
                        disabled={loading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setEditing(false);
                          fetchProfile();
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
                
                {/* Logout Button */}
                <Button 
                  variant="outline" 
                  className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
