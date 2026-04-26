import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CommonService } from "@/service/commonservice.page";
import { Eye, EyeOff, Lock, ArrowLeft, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const { uid: id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchEmail = async () => {
      try {
        const res = await CommonService.GetAll(`/auth/reset-user/${id}`);
        const data = res.AddtionalData || res;

        if (data.Type === "S") {
          setEmail(data.email);
        } else {
          toast({
            title: data.Message || "Failed to load email",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Error fetching email",
          variant: "destructive",
        });
      }
    };

    fetchEmail();
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        user_id: id,
        reset_otp: otp,
        password: password,
      };

      const res = await CommonService.CommonPost(
        payload,
        "/auth/resetpassword",
      );

      if (res.Type === "S") {
        toast({ title: "Success", description: "Password reset successful!" });
        setTimeout(() => setLocation("/login"), 2000);
      } else {
        // Error handled globally
      }
    } catch (err) {
      // Error handled globally
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF5EB] via-[#FFFEF8] to-[#FFF5EB] p-6 relative overflow-hidden font-sans">
      <div className="mb-12 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {settings?.platformName || "Billing Ramesh"}
          </span>
        </div>
        <p className="mt-2 text-[15px] font-black text-black tracking-[0.3em] uppercase">BILLING & INVENTORY MANAGEMENT</p>
      </div>

      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <Card className="glass-card-auth border-white/80 shadow-3xl shadow-primary/5 overflow-hidden p-8">
          <CardHeader className="p-0 mb-8 border-none bg-transparent">
            <div className="flex items-center gap-4 ml-1">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#1E1B4B] to-[#312E81] flex items-center justify-center text-white shadow-lg shadow-indigo-950/20">
                <Lock className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h2>
                <p className="text-slate-500 font-medium text-sm">Create a secure new password for your account</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 ml-1">Account Email</Label>
                <Input 
                  value={email} 
                  readOnly 
                  className="h-14 px-6 rounded-2xl glass-input-auth border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 ml-1">Verification OTP</Label>
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-14 px-6 rounded-2xl glass-input-auth border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 ml-1">New Secure Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 px-6 pr-14 rounded-2xl glass-input-auth border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  className="w-full glossy-button-primary rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20" 
                  disabled={loading || !password || !otp}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Your Password"}
                </Button>
                
                <Link href="/login" className="flex items-center justify-center gap-2 mt-6 text-slate-500 hover:text-primary transition-colors font-bold text-sm">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}