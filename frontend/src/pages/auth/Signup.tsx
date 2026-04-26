import { Link, useLocation } from "wouter";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import "./Login.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { CommonService } from "@/service/commonservice.page";
import { CommonHelper } from "@/helper/helper";
import { useBranding } from "@/lib/branding";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { settings } = useBranding();
  const { register, login } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleAuthToken, setGoogleAuthToken] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const checkRes = await CommonService.CommonPost(
          { access_token: tokenResponse.access_token },
          "auth/check-google"
        );

        if (checkRes?.AddtionalData?.exists === true) {
          toast({
            title: "Account Found",
            description: "You already have an account! Logging you in...",
          });

          const loginRes = await CommonService.CommonPost(
            { access_token: tokenResponse.access_token },
            "auth/google-login"
          );

          if (loginRes?.Type === "S" || loginRes?.Type === "Success") {
            const userData = loginRes.AddtionalData;
            await login(userData);
            setLocation(userData.role === "super_admin" ? "/admin" : "/dashboard");
          }
        } else {
          setGoogleAuthToken(tokenResponse.access_token);
        }
      } catch (error: any) {
        console.error("Google check/login error:", error);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Google authentication failed",
        variant: "destructive",
      });
    }
  });

  const submitGoogleSignup = async () => {
    if (!googleAuthToken) return;

    const newErrors: Record<string, string> = {};
    if (!mobileNumber || mobileNumber.trim() === "") {
      newErrors.mobileNumber = "Mobile number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await CommonService.CommonPost(
        {
          access_token: googleAuthToken,
          mobile: mobileNumber,
        },
        "/auth/google-signup",
      );

      if (res.Type === "S" || res.Type === "Success") {
        const userData = res.AddtionalData;
        await login(userData);
        setLocation("/dashboard");
      } else {
        setGoogleAuthToken(null);
      }
    } catch (error: any) {
      console.error("Google signup error:", error);
      setGoogleAuthToken(null);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!company.trim()) newErrors.company = "Company name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (/[A-Z]/.test(email)) {
      newErrors.email = "Email must be in lowercase";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Min 8 characters";
    }
    if (!mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const userData: any = await register({ 
        company,
        password, 
        firstName, 
        lastName, 
        email, 
        mobile: mobileNumber 
      });

      if (userData) {
        toast({
          title: "Account Created",
          description: "Welcome to Billing Ramesh! Redirecting to your dashboard...",
        });
        // Redirect handled by register function in AuthProvider
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      // Toast handled by queryClient globally
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF5EB] via-[#FFFEF8] to-[#FFF5EB] p-6 font-sans">
      <div className="mb-12 flex flex-col items-center">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {settings?.platformName || "Billing Ramesh"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-[540px]">
        <Card className="glass-card-auth border-white/80 shadow-3xl p-8">
          <CardHeader className="p-0 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-linear-to-br from-[#1E1B4B] to-[#312E81] flex items-center justify-center text-white">
                <Shield className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs
              defaultValue="signup"
              className="w-full"
              onValueChange={(v) => {
                if (v === "login") setLocation("/login");
              }}
            >
              <div className="p-1 glass-input-auth rounded-full mb-8 flex items-center justify-center max-w-[320px] mx-auto">
                <TabsList className="grid grid-cols-2 w-full bg-transparent border-none p-0 h-10">
                  <TabsTrigger
                    value="login"
                    className="rounded-full h-full hover:bg-black/5 transition-colors font-bold text-slate-500"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white shadow-lg transition-all font-bold"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="signup" className="space-y-5">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className={errors.firstName ? "border-destructive" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className={errors.lastName ? "border-destructive" : ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="My Awesome Store"
                      className={errors.company ? "border-destructive" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="john@example.com"
                      className={errors.email ? "border-destructive" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? "border-destructive" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                      placeholder="+1234567890"
                      className={errors.mobileNumber ? "border-destructive" : ""}
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs font-bold uppercase">
                    <span className="bg-white px-4 text-slate-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="h-12 w-full font-bold"
                  onClick={() => handleGoogleSignup()}
                  disabled={googleLoading}
                >
                  {googleLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Google
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!googleAuthToken} onOpenChange={(open) => !open && !googleLoading && setGoogleAuthToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Setup</DialogTitle>
            <DialogDescription>Just one more step to finish your registration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mobile-modal">Mobile Number</Label>
              <Input
                id="mobile-modal"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                placeholder="+1234567890"
              />
            </div>
            <Button onClick={submitGoogleSignup} disabled={googleLoading} className="w-full h-12 font-bold">
              {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Registration"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
