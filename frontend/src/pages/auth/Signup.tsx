import { Link, useLocation } from "wouter";
import { Shield, Loader2, Eye, EyeOff, User } from "lucide-react";
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
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-7 w-7" />
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
                    className="rounded-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-foreground shadow-lg transition-all font-bold"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="signup" className="space-y-5">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-bold text-slate-700 ml-1">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className={`h-14 px-6 rounded-2xl bg-slate-500/5 border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium ${errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-bold text-slate-700 ml-1">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className={`h-14 px-6 rounded-2xl bg-slate-500/5 border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium ${errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-bold text-slate-700 ml-1">Company Name</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="My Awesome Store"
                      className={`h-14 px-6 rounded-2xl bg-slate-500/5 border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium ${errors.company ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="john@example.com"
                      className={`h-14 px-6 rounded-2xl bg-slate-500/5 border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`h-14 px-6 pr-14 rounded-2xl bg-slate-500/5 border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-sm font-bold text-slate-700 ml-1">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                      placeholder="+1234567890"
                      className={`h-14 px-6 rounded-2xl bg-slate-500/5 border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium ${errors.mobileNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
                  </Button>
                </form>


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
              <Label htmlFor="mobile-modal" className="text-sm font-bold text-slate-700 ml-1">Mobile Number</Label>
              <Input
                id="mobile-modal"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                placeholder="+1234567890"
                className="h-14 px-6 rounded-2xl bg-slate-500/5 border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium"
              />
            </div>
            <Button onClick={submitGoogleSignup} disabled={googleLoading} className="w-full glossy-button-primary rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20">
              {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Registration"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
