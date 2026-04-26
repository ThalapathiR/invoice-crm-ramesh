import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  Sparkles,
  Star,
  Layers,
  Lock,
  LayoutDashboard,
  Users,
  Settings,
  Receipt,
  Package,
  QrCode,
  LineChart,
  ShoppingCart,
  Store
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const capabilities = [
  {
    title: "Instant Invoicing",
    desc: "Generate professional GST-compliant invoices in seconds. Support for thermal and standard printers.",
    icon: Receipt,
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500"
  },
  {
    title: "Inventory Control",
    desc: "Real-time stock tracking with low-stock alerts. Manage variants like size, color, and fabric types.",
    icon: Package,
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500"
  },
  {
    title: "QR Code Tagging",
    desc: "Generate and print QR codes for your products. Scan at checkout for lightning-fast billing.",
    icon: QrCode,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500"
  },
  {
    title: "Sales Analytics",
    desc: "Detailed reports on your top-selling products, daily revenue, and profit margins.",
    icon: LineChart,
    color: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-500"
  },
  {
    title: "POS Terminal",
    desc: "Optimized checkout interface for fast-paced retail environments. Barcode scanner ready.",
    icon: ShoppingCart,
    color: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-500"
  },
  {
    title: "Multi-Store Support",
    desc: "Manage multiple retail outlets from a single dashboard with centralized inventory.",
    icon: Store,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500"
  }
];

const faqs = [
  { q: "Is Billing POS suitable for a clothing store?", a: "Yes! It includes specialized features for apparel like size/color management and QR code tag printing." },
  { q: "Does it support GST calculation?", a: "Absolutely. You can set GST rates for products, and the system automatically calculates tax for every invoice." },
  { q: "Can I use it on my mobile or tablet?", a: "Yes, the interface is fully responsive and works perfectly on tablets and smartphones for on-the-floor billing." },
  { q: "How do I import my existing stock?", a: "You can easily bulk-upload your entire inventory using our Excel/CSV import tool." }
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "super_admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, setLocation]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const plans = [
    { name: "Starter", price: "0", desc: "For small individual shops", icon: Zap, popular: false },
    { name: "Business Pro", price: "29", desc: "For growing retail outlets", icon: Star, popular: true },
    { name: "Enterprise", price: "Custom", desc: "For large retail chains", icon: Lock, popular: false }
  ];

  return (
    <div className="flex flex-col gap-0 pb-0 overflow-x-hidden bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-24 md:pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="mb-8 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-6 py-2 text-sm font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
                <Sparkles className="w-4 h-4 mr-2.5 text-accent" />
                Modern Billing & Inventory Solution
              </Badge>

              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 text-heading leading-[1.1]">
                Master Your Business <br />
                <span className="text-gradient-premium">With Billing POS</span>
              </h1>

              <p className="text-lg md:text-2xl text-foreground/80 max-w-2xl mb-12 leading-relaxed font-medium">
                The most efficient way to manage your retail store. 
                <strong className="text-primary font-bold"> Invoicing, Inventory, and Analytics</strong> all in one place.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="h-16 px-10 text-lg font-black bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-lg border-0 group">
                    Register Your Store
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-bold border-2 rounded-full">
                    Access Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 border-accent/40 text-accent uppercase text-[11px] font-black tracking-[0.25em] px-4 py-1.5 rounded-full">Core Capabilities</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-heading">Everything your shop needs to scale</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((it, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className={cn("w-16 h-16 rounded-[20px] bg-white border border-slate-100 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform", it.iconColor)}>
                  <it.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{it.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{it.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-heading tracking-tighter">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-3xl px-8 shadow-sm border-0">
                <AccordionTrigger className="text-left font-black text-xl py-6 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 text-lg pb-8 pt-2">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-heading tracking-tighter">Transparent Pricing</h2>
            <p className="text-slate-500 mt-4 text-xl">Choose the plan that fits your business scale.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden",
                  plan.popular ? "ring-2 ring-primary shadow-xl" : ""
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black">{plan.price === "Custom" ? "Custom" : `$${plan.price}`}</span>
                  {plan.price !== "Custom" && <span className="text-slate-400 text-sm font-bold">/mo</span>}
                </div>
                <p className="text-slate-500 font-medium mb-8 text-sm">{plan.desc}</p>
                <Link href="/signup">
                  <Button className={cn("w-full h-12 rounded-xl font-bold", plan.popular ? "bg-primary" : "variant-outline border-slate-200")}>
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="relative bg-slate-900 rounded-[64px] p-12 md:p-24 overflow-hidden text-center text-white">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
                Ready to Organize Your <br />
                <span className="text-primary italic">Store Today?</span>
              </h2>
              <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                Join thousands of retailers who have simplified their billing and inventory management with Billing Ramesh.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link href="/signup">
                  <Button size="lg" className="h-16 px-12 text-xl font-black bg-white text-slate-900 hover:bg-slate-100 rounded-full border-0">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-16 px-12 text-xl font-bold rounded-full border-white/20 text-white hover:bg-white/10">
                    Live Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
