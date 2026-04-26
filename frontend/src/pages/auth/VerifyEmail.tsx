import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { CommonService } from "@/service/commonservice.page";
import { useBranding } from "@/lib/branding";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { settings } = useBranding();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await CommonService.CommonPost({ token }, "/auth/verify-email");
        if (res.Type === "S" || res.Type === "Success") {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(res.Message || "Invalid or expired verification token.");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Failed to verify email. Please try again.");
      }
    };

    verifyToken();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] p-4 relative overflow-hidden font-display">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-gradient-to-br from-primary/20 to-indigo-500/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "10s" }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-gradient-to-tl from-accent/20 to-purple-500/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "14s", animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-linear-to-br from-primary to-accent flex items-center justify-center text-white shadow-2xl shadow-primary/20 rotate-3">
              <ShieldCheck className="h-9 w-9" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              {settings?.platformName || "Billing Ramesh"}
            </span>
          </div>
        </div>

        <Card className="glass-card-auth border-white/60 shadow-2xl shadow-primary/10 overflow-hidden pt-4">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
              Email Verification
            </CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              {status === "loading" && "Please wait while we verify your email..."}
              {status === "success" && "Your email has been verified successfully!"}
              {status === "error" && "We couldn't verify your email address."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {status === "loading" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <Loader2 className="h-20 w-20 text-primary animate-spin relative z-10" />
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-8 w-full"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                  <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10" />
                </div>
                <Button 
                  className="w-full glossy-button-primary rounded-xl h-12 text-lg font-semibold"
                  onClick={() => setLocation("/login")}
                >
                  Continue to Login
                </Button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-8 w-full"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
                  <XCircle className="h-24 w-24 text-destructive relative z-10" />
                </div>
                <div className="text-center text-sm font-medium text-destructive/90 bg-destructive/10 p-3 rounded-lg border border-destructive/20 w-full">
                  {errorMessage}
                </div>
                <Button 
                  className="w-full glass-button rounded-xl h-12 text-lg font-semibold"
                  variant="outline"
                  onClick={() => setLocation("/login")}
                >
                  Return to Login
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
