import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CommonService } from "@/service/commonservice.page";
import "./Login.css";
import { useBranding } from "@/lib/branding";
import { KeyRound, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { settings } = useBranding();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const submit = async (e: any) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    const payload = { email };
    setError("");
    setLoading(true);
    try {
      const res = await CommonService.CommonPost(
        payload,
        "/auth/ForgotPassword",
      );
      if (res.Type === "S") {
        toast({ title: "Verification Sent", description: "If an account exists, you will receive an OTP." });
      }
    } catch (err: any) {
      // Error handled globally
    }
    setLoading(false);
  };

  return (
    <div className="login-page min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF5EB] via-[#FFFEF8] to-[#FFF5EB] p-6 relative overflow-hidden font-sans">
      <div className="mb-12 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {settings?.platformName || "Billing Ramesh"}
          </span>
        </div>
        </div>

      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <Card className="glass-card-auth border-white/80 shadow-3xl shadow-primary/5 overflow-hidden p-8">
          <CardHeader className="p-0 mb-8 border-none bg-transparent">
            <div className="flex items-center gap-4 ml-1">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#1E1B4B] to-[#312E81] flex items-center justify-center text-white shadow-lg shadow-indigo-950/20">
                <KeyRound className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h2>
                <p className="text-slate-500 font-medium text-sm">Receive a secure link to reset your account password</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 ml-1">Work Email Address<span className="text-accent ml-1">*</span></Label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`h-14 px-6 rounded-2xl glass-input-auth border-slate-200 focus:bg-white focus:border-primary transition-all text-slate-900 font-medium ${error ? "border-destructive" : ""}`}
                />
                {error && <p className="text-xs font-bold text-destructive mt-1 ml-2">{error}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full glossy-button-primary rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20"
                  disabled={loading || !email}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset OTP"}
                </Button>
                
                <Link href="/login" className="flex items-center justify-center gap-2 mt-6 text-slate-500 hover:text-primary transition-colors font-bold text-sm">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
