import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useBranding } from "@/lib/branding";
import { ScrollText } from "lucide-react";

interface LogoLoaderProps {
  fullScreen?: boolean;
}

export function LogoLoader({ fullScreen = true }: LogoLoaderProps) {
  const { settings } = useBranding();

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? "h-screen w-screen fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px]" : "h-full w-full"
      } overflow-hidden`}
    >
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo Container with Animated Rings */}
        <div className="relative h-24 w-24 md:h-32 md:w-32">
          {/* Pulsing Outer Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
          />
          
          {/* Animated Spinner Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -inset-2 rounded-full border-2 border-t-primary border-r-accent border-b-primary/20 border-l-accent/20"
          />

          {/* Logo Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full relative z-10 p-4 bg-white/10 backdrop-blur-md rounded-full border border-[#f0e8e2] shadow-2xl flex items-center justify-center overflow-hidden"
          >
            <ScrollText className="h-1/2 w-1/2 text-white" />
          </motion.div>
        </div>

        {/* Animated Progress/Text */}
        <div className="flex flex-col items-center gap-2">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-bold bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-display tracking-tight"
          >
            {settings?.platformName || "Billing POS"}
          </motion.h2>
          
          <div className="w-32 h-1 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-linear-to-r from-transparent via-primary to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
