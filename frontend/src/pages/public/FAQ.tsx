import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  Search, HelpCircle,
  Cpu, Zap,
  ShieldCheck,
  Globe, Layers, Star, Settings as SettingsIcon, Sparkles,
  Rocket,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const faqCategories = [
  {
    id: "general",
    title: "General Questions",
    icon: HelpCircle,
    questions: [
      { id: 1, q: "What is Billing POS?", a: "Billing POS is a specialized software solution for managing invoices, inventory, and point-of-sale operations for retail and wholesale businesses." },
      { id: 2, q: "Is it suitable for my retail shop?", a: "Yes, it's designed for various retail sectors including clothing, electronics, groceries, and more." },
      { id: 3, q: "Do I need special hardware?", a: "No, Billing POS works on any modern web browser. You can optionally connect barcode scanners and thermal printers for a better POS experience." },
      { id: 4, q: "Can I manage multiple stores?", a: "Yes, our Enterprise plan supports multi-store management with centralized inventory control." },
    ]
  },
  {
    id: "features",
    title: "Billing & Inventory",
    icon: Layers,
    questions: [
      { id: 5, q: "Does it support GST billing?", a: "Yes, you can easily configure GST rates for products and generate GST-compliant tax invoices." },
      { id: 6, q: "How do I track stock?", a: "The system automatically deducts stock when you make a sale and provides real-time alerts when inventory levels are low." },
      { id: 7, q: "Can I import existing products?", a: "Yes, you can bulk import your product list using our CSV/Excel import tool." },
      { id: 8, q: "Is there a POS mode?", a: "Yes, the POS terminal is optimized for fast scanning and quick checkout in busy environments." },
    ]
  },
  {
    id: "security",
    title: "Security & Data",
    icon: ShieldCheck,
    questions: [
      { id: 9, q: "Where is my data stored?", a: "Your data is stored securely in the cloud with daily backups and enterprise-grade encryption." },
      { id: 10, q: "Can I export my data?", a: "Yes, you can export your sales, inventory, and customer data at any time in various formats." },
    ]
  }
];

const pricingPlans = [
  {
    id: 41,
    name: "Free",
    tagline: "For Individual Sellers",
    description: "Basic tools to start your digital billing journey.",
    features: [
      "Up to 50 Invoices/mo",
      "Basic Inventory",
      "Single Store",
      "Standard Templates",
      "Email Support"
    ],
    price: "0",
    icon: Zap
  },
  {
    id: 42,
    name: "Business",
    tagline: "For Growing Shops",
    description: "Complete solution for professional retail management.",
    features: [
      "Unlimited Invoices",
      "Advanced Inventory",
      "Barcode Support",
      "GST Reporting",
      "Priority Email Support"
    ],
    price: "29",
    popular: true,
    icon: Star
  },
  {
    id: 43,
    name: "Enterprise",
    tagline: "For Retail Chains",
    description: "Scalable infrastructure for large scale operations.",
    features: [
      "Multi-Store Support",
      "Warehouse Management",
      "Advanced Analytics",
      "API Access",
      "Dedicated Account Manager"
    ],
    price: "Custom",
    icon: ShieldCheck
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 border-primary/40 text-primary uppercase text-[11px] font-black tracking-[0.25em] px-4 py-1.5 rounded-full bg-primary/5 font-sans">
              Knowledge Hub
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-heading mb-6 md:mb-8 tracking-tighter leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium">
              Everything you need to know about Billing POS platform and ecosystem.
            </p>

            <div className="relative max-w-xl mx-auto group">
              <div className="absolute inset-0 bg-primary/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity rounded-full"></div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions or keywords..."
                  className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white border border-slate-100 focus:border-primary/30 outline-none shadow-[0_10px_30px_-15px_rgba(0,0,0,0.06)] focus:ring-4 focus:ring-primary/5 transition-all text-slate-900 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="pb-32 px-4 container mx-auto max-w-5xl">
        {filteredCategories.length > 0 ? (
          <div className="space-y-12">
            {filteredCategories.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-800">{category.title}</h2>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={`item-${faq.id}`}
                      className="border-0 bg-white rounded-2xl md:rounded-3xl px-5 md:px-8 py-1 md:py-2 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-20px_rgba(134,75,239,0.2)] hover:border-primary/20 border transition-all duration-300 overflow-hidden group/item"
                    >
                      <AccordionTrigger className="text-left font-black text-lg hover:no-underline tracking-tight text-slate-800 py-5 md:py-6 border-b border-transparent data-[state=open]:border-slate-50 transition-colors">
                        <span className="flex items-center gap-4 group/trigger">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-primary group-hover/trigger:bg-primary group-hover/trigger:text-white transition-all duration-300 shadow-sm shrink-0">
                            <span className="text-sm font-bold">?</span>
                          </div>
                          <span className="group-hover/trigger:text-primary transition-colors duration-300">{faq.q}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-500 text-sm md:text-lg leading-relaxed pb-6 md:pb-8 pt-2 md:pt-4 font-medium pl-4 md:pl-12">
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {faq.a}
                        </motion.div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
            <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">No results matched your search</h3>
            <p className="text-slate-500 font-medium">Try different keywords or browse our categories.</p>
            <Button variant="outline" className="mt-8 rounded-xl font-bold" onClick={() => setSearchQuery("")}>Clear Search</Button>
          </div>
        )}
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-slate-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center mb-24">
            <Badge variant="outline" className="mb-6 border-white/20 text-blue-400 uppercase text-[11px] font-black tracking-[0.25em] px-4 py-1.5 rounded-full bg-white/5">
              Pricing & Plans
            </Badge>
            <h2 className="text-4xl md:text-4xl font-black text-white mb-8 tracking-tighter">Choose Your Path to Efficiency</h2>
            <p className="text-xl text-blue-100/60 max-w-2xl mx-auto font-medium">
              Transparent plans designed to scale with your business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex flex-col p-8 rounded-[40px] border h-full transition-all duration-300 group ${plan.popular
                  ? "bg-white border-primary shadow-[0_20px_50px_-20px_rgba(134,75,239,0.3)] scale-105 z-10"
                  : "bg-slate-800/50 border-white/5 hover:border-white/20"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.popular ? "bg-primary/10 text-primary" : "bg-white/5 text-blue-400"
                    }`}>
                    <plan.icon className="w-7 h-7" />
                  </div>
                  <h3 className={`text-2xl font-black tracking-tight mb-3 ${plan.popular ? "text-slate-900" : "text-white"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm font-semibold leading-relaxed ${plan.popular ? "text-slate-500" : "text-blue-100/40"}`}>
                    {plan.tagline}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className={`${plan.price === "Custom" ? "text-4xl" : "text-5xl"} font-black tracking-tighter ${plan.popular ? "text-slate-900" : "text-white"}`}>
                      {plan.price === "Custom" ? "Custom" : `$${plan.price}`}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className={`text-sm font-bold uppercase tracking-widest ${plan.popular ? "text-slate-400" : "text-blue-100/20"}`}>/mo</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-primary" : "text-emerald-500"}`} />
                      <span className={`text-sm font-semibold tracking-tight ${plan.popular ? "text-slate-600" : "text-blue-100/60"}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link href="/signup" className="mt-auto">
                  <Button className={`w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[11px] transition-all ${plan.popular
                    ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                    : "bg-white/10 hover:bg-white/20 text-white border-0"
                    }`}>
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden text-center px-4">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-8 animate-pulse" />
          <h2 className="text-2xl md:text-4xl font-black text-heading mb-8 tracking-tighter">
            Still have questions?
          </h2>
          <p className="text-xl text-slate-500 mb-12 font-medium">
            Our team is here to help you design the perfect billing strategy for your business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-10 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20">
                Talk to an Expert
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-black rounded-2xl border-slate-200 hover:bg-slate-50">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}