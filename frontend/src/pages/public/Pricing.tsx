import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Globe, Star, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { CommonService } from "@/service/commonservice.page";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Pricing() {
  // Hardcoded premium plans based on Billing & Inventory domain
  const defaultPlans = [
    {
      id: "starter",
      name: "Starter",
      slug: "starter",
      tagline: "For Small Shops",
      price: "0",
      currency: "INR",
      billing_period: "monthly",
      features: [
        "Up to 100 Invoices/mo",
        "50 Products Tracking",
        "Single Store Access",
        "Sales Dashboard",
        "Standard Templates",
        "Email Support"
      ],
      is_popular: "false",
      icon: Zap
    },
    {
      id: "pro",
      name: "Business Pro",
      slug: "pro",
      tagline: "For Growing Retailers",
      price: "29",
      currency: "USD",
      billing_period: "monthly",
      features: [
        "Unlimited Invoices",
        "Unlimited Products",
        "Barcode Scanning",
        "Inventory Alerts",
        "GST Reporting",
        "Priority Support",
        "Customer Management"
      ],
      is_popular: "true",
      icon: Star
    },
    {
      id: "enterprise",
      name: "Enterprise",
      slug: "enterprise",
      tagline: "For Retail Chains",
      price: "Custom",
      currency: "USD",
      billing_period: "monthly",
      is_custom_pricing: "true",
      features: [
        "Multi-Store Support",
        "Warehouse Management",
        "Role-Based Access",
        "Advanced Analytics",
        "Dedicated Server",
        "API Integrations",
        "24/7 Priority Support",
        "Dedicated Account Manager"
      ],
      is_popular: "false",
      icon: Shield
    }
  ];

  const [plans, setPlans] = useState<any[]>(defaultPlans);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = root.classList.contains("dark");
    if (isDark) {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    return () => {
      if (isDark) {
        root.classList.remove("light");
        root.classList.add("dark");
      }
    };
  }, []);

  const getCurrencySymbol = (currency?: string) => {
    if (currency === 'INR') return '₹';
    if (currency === 'USD' || !currency) return '$';
    return currency;
  };

  return (
    <div className="pb-32 bg-background min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-20 text-center container mx-auto px-4 max-w-4xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] -z-10"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary uppercase text-[10px] font-black tracking-widest px-4 py-1 font-sans">Pricing Plans</Badge>
          <h1 className="text-2xl md:text-5xl font-black font-display tracking-tight mb-6 md:mb-8 text-heading leading-tight">
            Scale Your Retail <br className="hidden md:block" /> <span className="text-gradient-premium">Business</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Simple, transparent pricing for every stage of growth. No hidden fees, just pure business efficiency.
          </p>
        </motion.div>
      </section>

      {/* Plans Grid */}
      <section className="container mx-auto px-4 max-w-7xl">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[600px] rounded-3xl bg-slate-100 dark:bg-slate-800/10 animate-pulse border border-border/50"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="h-full transform-gpu"
              >
                <Card
                  className={cn(
                    "glass-card border-border/40 relative overflow-hidden flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group rounded-3xl md:rounded-[32px]",
                    plan.is_popular === "true" && "border-primary/50 shadow-2xl shadow-primary/10 ring-1 ring-primary/20 scale-[1.03] z-10"
                  )}
                >
                  {plan.is_popular === "true" && (
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-primary via-accent to-primary animate-pulse"></div>
                  )}

                  <CardHeader className="pt-8 md:pt-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-border/50", plan.is_popular === "true" ? "text-primary border-primary/20" : "text-muted-foreground")}>
                        {plan.icon ? <plan.icon className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                      </div>
                      {plan.is_popular === "true" && (
                        <Badge className="bg-primary text-white font-black italic text-[10px] uppercase tracking-wider rounded-full px-3 py-1 animate-bounce">Best Value</Badge>
                      )}
                    </div>
                    <CardTitle className={cn("text-2xl font-black capitalize tracking-tight", plan.is_popular === "true" && "text-primary")}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="font-semibold text-muted-foreground line-clamp-1">{plan.tagline}</CardDescription>

                    <div className="mt-8 flex items-baseline gap-1">
                      {plan.is_custom_pricing === "true" || plan.price === "Custom" ? (
                        <span className="text-4xl font-black tracking-tight">Custom</span>
                      ) : (
                        <>
                          <span className="text-5xl font-black tracking-tight">
                            {getCurrencySymbol(plan.currency)}{plan.price}
                          </span>
                          <span className="text-muted-foreground font-bold text-sm tracking-tighter">/mo</span>
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pt-6">
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 opacity-50">What's Included</div>
                    <ul className="space-y-4">
                      {plan.features?.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-semibold">
                          <div className={cn("mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0", plan.is_popular === "true" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400 group-hover:text-primary transition-colors")}>
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pb-8 md:pb-10">
                    <Link href={`/signup?plan=${plan.slug}`} className="w-full">
                      <Button
                        className={cn(
                          "w-full font-black rounded-2xl h-12  transition-all duration-300",
                          plan.is_popular === "true"
                            ? "glossy-button-primary"
                            : "bg-white/5 border-2 border-border/60 hover:bg-primary hover:text-white hover:border-primary text-heading"
                        )}
                        variant={plan.is_popular === "true" ? "default" : "outline"}
                      >
                        {plan.slug === 'enterprise' ? 'Talk to Us' : 'Get Started'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Comparison Preview (Enterprise) */}
      <section className="container mx-auto px-4 max-w-5xl mt-32">
        <div className="glass-card p-12 rounded-[48px] border-border/40 text-center relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent/20 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-6">Need a custom enterprise solution?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
              We support dedicated infrastructure, multi-warehouse synchronization,
              and 24/7 mission-critical support for large retail organizations.
            </p>
            <Link href="/signup">
              <Button size="lg" className="rounded-2xl h-16 px-10 font-bold glossy-button-primary">
                Contact Enterprise Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}