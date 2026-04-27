"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, Zap, Shield, Crown, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FALLBACK_PLANS = [
  {
    name: "Basic",
    description: "Essential HR tools for small teams",
    price: 2999,
    billingCycle: "Monthly",
    currency: "₹",
    per: "per month",
    employees: "Up to 30 employees",
    popular: false,
    features: [
      { name: "Core HR Database", included: true },
      { name: "Basic Attendance Tracking", included: true },
      { name: "Payroll Generation", included: true },
      { name: "Standard Email Support", included: true }
    ]
  },
  {
    name: "Professional",
    description: "Advanced features for growing businesses",
    price: 3999,
    billingCycle: "Monthly",
    currency: "₹",
    per: "per month",
    employees: "Up to 50 employees",
    popular: true,
    features: [
      { name: "Everything in Basic", included: true },
      { name: "Biometric Integration", included: true },
      { name: "Advanced Leave Management", included: true },
      { name: "Automated Statutory Reports", included: true },
      { name: "Priority Support", included: true }
    ]
  },
  {
    name: "Expert",
    description: "Complete solution for larger organizations",
    price: 5998,
    billingCycle: "Monthly",
    currency: "₹",
    per: "per month",
    employees: "Up to 99 employees",
    popular: false,
    features: [
      { name: "Everything in Professional", included: true },
      { name: "Recruitment Pipeline", included: true },
      { name: "Custom Workflows", included: true },
      { name: "API Access", included: true },
      { name: "Dedicated Account Manager", included: true }
    ]
  },
];

export const Pricing = () => {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        let responseData = null;
        try {
          const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${apiURL}/public/subscriptions`);

          if (res.ok) {
            const json = await res.json();
            responseData = json.data || json;
          }
        } catch (err) {
          console.error("Fetch error:", err);
        }

        const data = Array.isArray(responseData) ? responseData : [];
        const activePlans = data.filter(p => p.status?.toLowerCase() === 'active' || p.isActive);

        if (activePlans.length === 0) {
          setPlans(FALLBACK_PLANS);
          return;
        }

        const processedPlans = activePlans.map(p => {
          let featuresList = [];
          if (Array.isArray(p.features) && p.features.length > 0) {
            featuresList = p.features.map(f => typeof f === 'string' ? { name: f, included: true } : f);
          } else if (typeof p.features === 'string' && p.features.trim().length > 0) {
            featuresList = p.features.split('\n').filter(f => f.trim()).map(f => ({ name: f.trim(), included: true }));
          }

          return {
            id: p.id || p._id || null,
            name: p.name,
            description: p.description || "",
            price: p.price,
            billingCycle: p.billingCycle || "Monthly",
            currency: p.currency === 'INR' ? '₹' : '$',
            per: (() => {
              const cycle = (p.billingCycle || "Monthly").toLowerCase();
              if (cycle === 'yearly') return 'per year';
              if (cycle === 'half yearly') return 'per 6 months';
              if (cycle === 'quarterly') return 'per quarter';
              return 'per month';
            })(),
            employees: (p.maxUsers && parseInt(p.maxUsers) > 0) ? `Up to ${p.maxUsers} employees` : "Unlimited employees",
            popular: p.isPopular || (p.name && (p.name.toLowerCase().includes('professional') || p.name.toLowerCase().includes('gold'))),
            features: featuresList
          };
        });

        setPlans(processedPlans.length > 0 ? processedPlans : FALLBACK_PLANS);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        setPlans(FALLBACK_PLANS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPlanIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('start') || lowerName.includes('basic')) return <Zap className="w-5 h-5 text-gray-400" />;
    if (lowerName.includes('pro') || lowerName.includes('gold') || lowerName.includes('premium')) return <Crown className="w-5 h-5 text-brand-400" />;
    return <Shield className="w-5 h-5 text-indigo-400" />;
  };

  const displayPlans = plans;

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#0A0A0A] border-t border-white/5">
      <div className="absolute inset-0 mesh-gradient-dark opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 noise-overlay opacity-20 pointer-events-none"></div>

      <div className="container-custom relative z-10" ref={containerRef}>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-premium hairline-border mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span className="badge-label text-gray-300">Simple, Transparent Pricing</span>
          </div>
          <h2 className="heading-section text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
            Awesome doesn&apos;t have to be <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">expensive.</span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Start with what you need today and scale to advanced automation as your workforce grows.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-white/10 border-t-brand-400 rounded-full animate-spin mb-4" />
            <p className="text-brand-400 font-medium tracking-wide">Loading premium plans...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {displayPlans.map((plan, index) => (
              <motion.div
                key={plan.id || index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex flex-col p-8 rounded-[2rem] transition-all duration-300 ${
                  plan.popular
                    ? "glass-premium hairline-border scale-[1.02] shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)] z-10"
                    : "bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:-translate-y-1 hover:border-white/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-brand-500 to-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg shadow-brand-500/30">
                      <Crown className="w-3.5 h-3.5" /> Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${
                      plan.popular ? 'bg-brand-500/20 border border-brand-500/30' : 'bg-white/5 border border-white/10'
                    }`}>
                      {getPlanIcon(plan.name)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{plan.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{plan.employees}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-[15px] leading-relaxed min-h-[48px]">{plan.description}</p>
                </div>

                <div className="mb-8 pb-8 border-b border-white/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-5xl font-bold text-white tracking-tighter">
                      {plan.price !== null && plan.price !== undefined ? (
                        <>
                          <span className="text-2xl text-gray-400 font-medium align-top mr-1">{plan.currency}</span>
                          {plan.price.toLocaleString()}
                        </>
                      ) : (
                        "Custom"
                      )}
                    </span>
                    {plan.price !== null && plan.price !== undefined && (
                      <span className="text-gray-500 font-medium">{plan.per}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="flex-1 mb-8">
                  <ul className="space-y-4">
                    {plan.features?.slice(0, 6).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-brand-400' : 'text-gray-500'}`} />
                        <span className="text-gray-300 text-[15px]">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.price !== null && plan.price !== undefined ? '/signin' : '/request-demo'}
                  className={`w-full text-center ${plan.popular ? 'btn-magnetic' : 'btn-magnetic-outline'}`}
                >
                  {plan.price !== null && plan.price !== undefined ? 'Start Free Trial' : 'Contact Sales'}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Need enterprise-grade customization?{" "}
            <Link href="/request-demo" className="text-white hover:text-brand-400 font-medium transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-brand-400/50">
              Contact Sales
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
