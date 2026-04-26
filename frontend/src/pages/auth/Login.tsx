import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import "./Login.css";
import { useGoogleLogin } from "@react-oauth/google";
import { CommonService } from "@/service/commonservice.page";

import { Users, Briefcase, Shield, Lock, Play, Save, ChevronRight, Activity, Volume2, ShieldCheck, Bot, CheckCircle2, Search, ArrowLeft, Loader2, Check, CreditCard, User, LayersIcon, Eye, EyeOff } from "lucide-react";
import { useBranding } from "@/lib/branding";

export default function Login() {
  const [, setLocation] = useLocation();
  const { settings } = useBranding();
  const { login, user, googleLogin } = useAuth();
  const { toast } = useToast();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identity?: string; password?: string }>({});

  // Automatically redirect if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      const normalizedRole = user.role?.toLowerCase()?.replace(/\s+/g, '_') || "";
      if (normalizedRole === "super_admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, loading, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { identity?: string; password?: string } = {};
    if (!usernameOrEmail) {
      newErrors.identity = "Username or Email is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const loggedInUser = await login(usernameOrEmail, password);
      const normalizedRole = loggedInUser.role?.toLowerCase()?.replace(/\s+/g, '_') || "";
      if (loggedInUser && normalizedRole === "super_admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      if (err.message && err.message.includes("EMAIL_NOT_VERIFIED")) {
        setErrors({ identity: "EMAIL_NOT_VERIFIED" });
      } else {
        console.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        await googleLogin(tokenResponse.access_token, 'access_token');
        setLocation("/dashboard");
      } catch (error: any) {
        console.error("Google login error:", error);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Google login failed",
        variant: "destructive",
      });
    }
  });


  return (
    <div className="login-page min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF5EB] via-[#FFFEF8] to-[#FFF5EB] p-6 relative overflow-hidden font-sans">
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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            </div>
          </CardHeader>

            <CardContent className="p-0">
              <Tabs
                defaultValue="login"
                className="w-full"
                onValueChange={(v) => {
                  if (v === "signup") setLocation("/signup");
                }}
              >
                <div className="p-1 glass-input-auth rounded-full mb-8 flex items-center justify-center max-w-[320px] mx-auto">
                  <TabsList className="grid grid-cols-2 w-full bg-transparent border-none p-0 h-10">
                    <TabsTrigger
                      value="login"
                      className="rounded-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white shadow-lg transition-all font-bold"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="rounded-full h-full hover:bg-black/5 transition-colors font-bold text-slate-500"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="login" className="space-y-6 mt-0">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="identity"
                        className="text-sm font-bold text-slate-700 ml-1"
                      >
                        Username or Email
                        <span className="text-accent ml-1 font-bold">*</span>
                      </Label>
                      <Input
                        id="identity"
                        type="text"
                        placeholder="e.g. admin@example.com"
                        value={usernameOrEmail}
                        onChange={(e) => {
                          setUsernameOrEmail(e.target.value.toLowerCase());
                          if (errors.identity)
                            setErrors({ ...errors, identity: undefined });
                        }}
                        className={`h-14 px-6 rounded-2xl bg-slate-500/5 border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium ${errors.identity ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.identity === "EMAIL_NOT_VERIFIED" ? (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mt-3 flex flex-col gap-2 animate-in slide-in-from-top-2">
                          <p className="text-amber-600 text-xs font-medium">
                            Email not verified. Please check your inbox.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 border-none h-8 text-xs font-bold"
                            onClick={async () => {
                              try {
                                await CommonService.CommonPost(
                                  { email: usernameOrEmail },
                                  "/auth/resend-verification",
                                );
                                // toast({ title: "Verification Sent", description: "A new verification link has been sent to your email." });
                              } catch (e) {}
                            }}
                          >
                            Resend Verification Email
                          </Button>
                        </div>
                      ) : errors.identity === "ACCOUNT_PENDING_APPROVAL" ? (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mt-3 animate-in slide-in-from-top-2">
                          <p className="text-blue-600 text-xs font-medium">
                            Account pending approval. Our team will review your
                            request and notify you via email shortly.
                          </p>
                        </div>
                      ) : (
                        errors.identity && (
                          <p className="text-xs font-medium text-destructive mt-1">
                            {errors.identity}
                          </p>
                        )
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <Label
                          htmlFor="password"
                          className="text-sm font-bold text-slate-700"
                        >
                          Password
                          <span className="text-accent ml-1 font-bold">*</span>
                        </Label>
                        <Link
                          href="/forgotpassword"
                          className="text-sm font-bold text-primary hover:text-accent transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          minLength={8}
                          maxLength={12}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password)
                              setErrors({ ...errors, password: undefined });
                          }}
                          className={`h-14 px-6 pr-14 rounded-2xl bg-slate-500/5 border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs font-bold text-destructive mt-1 ml-2">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full glossy-button-primary rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                      <span className="bg-white px-4 text-slate-400">
                        Or sign in with
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="h-14 w-full rounded-2xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-700"
                      onClick={() => handleGoogleLogin()}
                      type="button"
                    >
                      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M 12 5.38 c 1.62 0 3.06 0.56 4.21 1.64 l 3.15 -3.15 C 17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07 l 3.66 2.84 c 0.87 -2.6 3.3 -4.53 6.16 -4.53 z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      Sign in with Google
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <div className="flex justify-center border-t border-slate-100 mt-8 pt-8">
              <div className="text-sm font-medium text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary hover:text-accent font-bold transition-colors ml-1"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
  );
}
