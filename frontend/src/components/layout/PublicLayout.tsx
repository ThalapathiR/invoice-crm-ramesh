import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/lib/branding";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useBranding();

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col overflow-x-hidden">
      {/* Background Orbs - Optimized with GPU-accelerated transforms */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none transform-gpu">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '18s', animationDelay: '4s' }}></div>
      </div>

      {/* Public Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b border-[#f0e8e2] bg-white/70 backdrop-blur-xl`}>
        <div className="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between max-w-7xl">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <img
                src={settings?.logoUrl || "/favicon.png"}
                alt="Logo"
                className="h-10 md:h-14 w-auto object-contain relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#why" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Why Billing POS?</Link>
            <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">FAQs</Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Pricing</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/20 rounded-full">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button className="glossy-button-primary rounded-full px-5 md:px-6 border-none text-xs md:text-sm h-10 md:h-11">Start Free</Button>
            </Link>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-black/5 rounded-full h-10 w-10 shrink-0">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] border-none bg-white p-0">
                  <SheetHeader className="p-8 border-b border-slate-100 text-left">
                    <div className="flex items-center gap-3">
                      <img
                        src={settings?.logoUrl || "/favicon.png"}
                        alt="Logo"
                        className="h-15 w-auto object-contain"
                      />
                      {/* <SheetTitle className="text-xl font-bold tracking-tight">Navigation</SheetTitle> */}
                    </div>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 p-6">
                    <Link href="/#why">
                      <div className="flex items-center p-4 text-lg font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all">
                        Why Billing POS?
                      </div>
                    </Link>
                    <Link href="/faq">
                      <div className="flex items-center p-4 text-lg font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all">
                        FAQs
                      </div>
                    </Link>
                    <Link href="/pricing">
                      <div className="flex items-center p-4 text-lg font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all">
                        Pricing
                      </div>
                    </Link>
                    <div className="mt-4 pt-10 border-t border-slate-100 flex flex-col gap-4">
                      <Link href="/login">
                        <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold border-slate-200">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}