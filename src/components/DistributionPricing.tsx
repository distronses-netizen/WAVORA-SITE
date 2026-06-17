/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Check, X, Shield, Sparkles, HelpCircle, Trophy, Globe, Zap, Percent } from "lucide-react";
import { motion } from "motion/react";
import { PricingPlan, FeatureComparison } from "../types";
import { getPlanPriceDetails } from "../lib/pricing";

export default function DistributionPricing() {
  const [pricingMode, setPricingMode] = useState<"annual" | "monthly" | "single">("annual");
  const [offersVersion, setOffersVersion] = useState(0);

  const isAnnual = pricingMode === "annual";

  useEffect(() => {
    const handleUpdated = () => {
      setOffersVersion(v => v + 1);
    };
    window.addEventListener("wavora_offers_updated", handleUpdated);
    window.addEventListener("storage", handleUpdated);
    return () => {
      window.removeEventListener("wavora_offers_updated", handleUpdated);
      window.removeEventListener("storage", handleUpdated);
    };
  }, []);

  const plans: PricingPlan[] = [
    {
      id: "basic",
      name: "Basic Plan",
      price: isAnnual ? "₹399" : "₹39",
      period: isAnnual ? "year" : "month",
      description: "Perfect for bedroom producers and beginners starting their musical journey.",
      popular: false,
      features: [
        "Distribute to 150 platforms",
        "80% royalty split to absolute artist",
        "7 days release turnaround time",
        "Support via WhatsApp, call & email",
        "Full access to our dashboard",
        "Official Artist Channel (OAC) setup"
      ],
      ctaText: "Apply for Distribution",
      accent: "border-white/10 hover:border-white/20 bg-neutral-900/40"
    },
    {
      id: "pro",
      name: "Pro Artist Plan",
      price: isAnnual ? "₹1199" : "₹119",
      period: isAnnual ? "year" : "month",
      description: "Built for growing artists ready to scale and understand their audience.",
      popular: true,
      features: [
        "Distribute to 150 platforms",
        "90% royalty split to absolute artist",
        "3-5 days expedited release",
        "Priority WhatsApp, email & call support",
        "Official Artist Channel (OAC) setup",
        "Spotify and Apple Artists verification",
        "C and P copyright line ownership"
      ],
      ctaText: "Apply for Distribution",
      accent: "border-purple-500/40 hover:border-purple-500/60 bg-purple-950/20"
    },
    {
      id: "elite",
      name: "Elite Label Plan",
      price: isAnnual ? "₹1999" : "₹199",
      period: isAnnual ? "year" : "month",
      description: "The ultimate toolkit for serious professional artists and indie labels.",
      popular: false,
      features: [
        "Distribute to 150+ platforms",
        "100% royalty split to absolute artist",
        "2-3 days fastest express release",
        "Fastest WhatsApp, call & email support",
        "Get showcased directly at Wavora events",
        "Spotify and Apple Artists verification",
        "Official Artist Channel (OAC) setup",
        "Next-gen AI music distribution",
        "Custom record label name",
        "C and P copyright line ownership"
      ],
      ctaText: "Apply for Distribution",
      accent: "border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-950/15"
    }
  ];

  const singleTrackPlans: PricingPlan[] = [
    {
      id: "basic",
      name: "Basic Single",
      price: "₹19",
      period: "one-time release",
      description: "Launch a single track directly to top platforms. Standard validation & 80% split.",
      popular: false,
      features: [
        "Distribute single to 150+ streaming stores",
        "80% absolute artist royalties",
        "Standard 7-day launch turnaround",
        "Verify raw WAV master quality",
        "General placeholder label support"
      ],
      ctaText: "Launch Single Track",
      accent: "border-white/10 hover:border-white/20 bg-neutral-900/40"
    },
    {
      id: "pro",
      name: "Pro Single",
      price: "₹39",
      period: "one-time release",
      description: "Expedited single track launch with synced lyrics metadata and 90% artist split.",
      popular: true,
      features: [
        "Expedited 3-5 days direct launch",
        "90% absolute artist royalties",
        "Distribute single to 50 key platforms",
        "Synchronized lyrics text syncing support",
        "Priority WhatsApp, call & email support"
      ],
      ctaText: "Launch Single Track",
      accent: "border-purple-500/40 hover:border-purple-500/60 bg-purple-950/20"
    },
    {
      id: "elite",
      name: "Elite Single",
      price: "₹79",
      period: "one-time release",
      description: "Direct elite launch featuring custom record label branding and Atmos validation.",
      popular: false,
      features: [
        "Express 2-3 days fastest release",
        "100% absolute revenues to artist",
        "Distribute single to 150+ global stores",
        "YouTube Content ID protection",
        "Professional Dolby Spatial Atmos checks"
      ],
      ctaText: "Launch Single Track",
      accent: "border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-950/15"
    }
  ];

  const activePlans = pricingMode === "single" ? singleTrackPlans : plans;

  const comparisons: FeatureComparison[] = [
    { category: "Distribution", featureName: "Supported Platforms", basic: "150 platforms", pro: "150 platforms", elite: "150+ platforms" },
    { category: "Distribution", featureName: "Royalty Percentage", basic: "80%", pro: "90%", elite: "100%" },
    { category: "Distribution", featureName: "Release Turnaround", basic: "7 days", pro: "3-5 days", elite: "2-3 days" },
    { category: "Support", featureName: "Channels Covered", basic: "WhatsApp, call & email", pro: "Priority WhatsApp, email, call", elite: "Fastest WhatsApp, call, email" },
    { category: "Verification", featureName: "OAC (Official Artist Channel)", basic: true, pro: true, elite: true },
    { category: "Verification", featureName: "Spotify & Apple verification", basic: false, pro: true, elite: true },
    { category: "Sovereignty", featureName: "C and P copyrighted line", basic: false, pro: true, elite: true },
    { category: "Sovereignty", featureName: "Custom Record Label name", basic: false, pro: false, elite: true },
    { category: "Next-gen Capabilities", featureName: "AI music distribution", basic: false, pro: false, elite: true },
    { category: "Events", featureName: "Get showcased at Wavora events", basic: false, pro: false, elite: true },
    { category: "System", featureName: "Dashboard Access", basic: true, pro: true, elite: true }
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#0B0B0F]">
      {/* Decorative Radial Grid / Circles */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0B0B0F] to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-purple-900/5 to-cyan-900/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Intro Copy Section */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16" id="pricing-intro">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0B0F] border border-white/10 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            Clear, honest pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans" id="pricing-header">
            Seamless Global Distribution
          </h2>
          <p className="text-base sm:text-lg text-gray-400 font-normal">
            Publish your audio tracks across Spotify, Apple Music, TikTok, Deezer, and YouTube Music. Zero hidden upload fees. Choose the tier that matches your career momentum.
          </p>

          {/* Billing Mode Switcher with robust responsive layout */}
          <div className="pt-6 flex justify-center w-full" id="pricing-switcher">
            <div className="grid grid-cols-3 p-1.5 bg-neutral-900/90 border border-white/10 rounded-2xl gap-2 w-full max-w-2xl mx-auto">
              <button
                onClick={() => setPricingMode("annual")}
                className={`py-3 px-1 sm:px-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer select-none text-center relative ${
                  pricingMode === "annual"
                    ? "bg-white text-black shadow-lg font-black"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-1 sm:gap-1.5 justify-center">
                  <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all shrink-0 ${pricingMode === "annual" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" : "bg-emerald-500/40"}`} />
                  <span className="hidden sm:inline">Subscription (Annual)</span>
                  <span className="sm:hidden">Annual</span>
                </span>
                <span className={`text-[8px] px-1 py-0.5 rounded leading-none font-bold uppercase shrink-0 transition-all ${
                  pricingMode === "annual"
                    ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                }`}>
                  Save 20%
                </span>
              </button>

              <button
                onClick={() => setPricingMode("monthly")}
                className={`py-3 px-1 sm:px-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer select-none text-center ${
                  pricingMode === "monthly"
                    ? "bg-white text-black shadow-lg font-black"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-1 sm:gap-1.5 justify-center">
                  <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all shrink-0 ${pricingMode === "monthly" ? "bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.9)]" : "bg-purple-500/40"}`} />
                  <span className="hidden sm:inline">Subscription (Monthly)</span>
                  <span className="sm:hidden">Monthly</span>
                </span>
                <span className="text-[8px] text-neutral-500/80 uppercase leading-none mt-0.5 md:mt-0 font-bold tracking-wide">
                  Standard
                </span>
              </button>

              <button
                onClick={() => setPricingMode("single")}
                className={`py-3 px-1 sm:px-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer select-none text-center ${
                  pricingMode === "single"
                    ? "bg-white text-black shadow-lg font-black"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-1 sm:gap-1.5 justify-center">
                  <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all shrink-0 ${pricingMode === "single" ? "bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.9)]" : "bg-cyan-500/40"}`} />
                  <span className="hidden sm:inline">Single Track Release</span>
                  <span className="sm:hidden">Single Track</span>
                </span>
                <span className={`text-[8px] px-1 py-0.5 rounded leading-none font-bold uppercase shrink-0 ${
                  pricingMode === "single"
                    ? "bg-cyan-500/15 text-cyan-600 border border-cyan-500/20"
                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/10"
                }`}>
                  One-time
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-24" id="pricing-grid-cards">
          {activePlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular 
                  ? "border-purple-500 bg-white/10 backdrop-blur-md shadow-[0_0_40px_rgba(139,92,246,0.12)] md:-translate-y-2 z-10" 
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-purple-cyan text-white text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                  <Sparkles className="h-3 w-3 animate-spin" /> Most Recommended
                </div>
              )}

              {/* Plan Metadata */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                  {plan.id === "elite" && <Trophy className="h-5 w-5 text-yellow-500" />}
                  {plan.id === "basic" && <Globe className="h-5 w-5 text-neutral-400" />}
                </div>

                {(() => {
                  if (pricingMode === "single") {
                    return (
                      <div className="flex flex-col gap-1.5 mb-2">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-tight">{plan.price}</span>
                          <span className="text-gray-400 text-xs">/ {plan.period}</span>
                        </div>
                      </div>
                    );
                  }
                  const priceInfo = getPlanPriceDetails(plan.id, isAnnual);
                  return (
                    <div className="flex flex-col gap-1.5 mb-2">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {priceInfo.hasOffer ? (
                          <>
                            <span className="text-xl sm:text-2xl font-mono font-extrabold text-gray-500 line-through tracking-tight">₹{priceInfo.basePrice}</span>
                            <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-tight">₹{priceInfo.finalPrice}</span>
                          </>
                        ) : (
                          <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-tight">₹{priceInfo.basePrice}</span>
                        )}
                        <span className="text-gray-400 text-xs">/ {plan.period}</span>
                      </div>
                      {priceInfo.hasOffer && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-400/10 text-red-400 border border-red-400/15">
                            {priceInfo.discountPercent}% OFF
                          </span>
                          {priceInfo.offerLabel && (
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                              🎁 {priceInfo.offerLabel}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <p className="text-gray-400 text-xs leading-relaxed mb-6 font-normal">
                  {plan.description}
                </p>

                {/* Plan Features */}
                <ul className="space-y-3.5 mb-8 border-t border-white/10 pt-6 text-sm" id={`features-${plan.id}`}>
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-neutral-300">
                      <div className="mt-0.5 rounded bg-purple-500/10 p-0.5">
                        <Check className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <span className="leading-tight text-xs font-normal text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              {/* LINK: Dashboard Link Placeholder --> */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pricingMode === "single") {
                      window.dispatchEvent(new CustomEvent("open-single-track-distribute", { detail: { planId: plan.id } }));
                    } else {
                      window.dispatchEvent(new CustomEvent("open-apply-modal", { detail: { planId: plan.id, isAnnual } }));
                    }
                  }}
                  className={`block w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    plan.popular
                      ? "bg-white text-black hover:bg-gray-200 shadow-lg"
                      : "bg-white/5 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Free Distribution Card Banner */}
        <div className="relative mt-8 mb-20 md:-translate-y-4 max-w-4xl mx-auto rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-900/40 via-[#0B0B0F] to-[#0B0B0F] shadow-[0_15px_30px_rgba(16,185,129,0.1)] group">
          <div className="absolute top-0 right-0 p-32 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
            <div className="w-full h-full bg-emerald-500 rounded-full blur-[80px]"></div>
          </div>
          <div className="relative p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="h-3 w-3" />
                Selective Free Program
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Got potential? Distribute <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">for free.</span></h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                We believe in investing in ambitious upcoming artists. Wavora allows highly selective free music distribution—giving you 70% royalties and a 7-day release turnaround.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-300 font-medium">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  No up-front costs
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-300 font-medium">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  70% Royalties
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-300 font-medium">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  7 Days Release
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-300 font-medium">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Workspace dashboard
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent("open-free-modal"));
                }}
                className="w-full md:w-auto px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#070709] rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 relative overflow-hidden group/btn shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Apply for Free Tier
                  <Sparkles className="h-4 w-4" />
                </span>
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-3 font-medium uppercase tracking-widest leading-relaxed">
                Subject to Curation verification
              </p>
            </div>
          </div>
        </div>

        {/* Feature Comparison breakdown table/grid */}
        <div className="mt-16" id="pricing-comparison-table">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white tracking-tight">Compare All Features</h3>
            <p className="text-gray-400 text-xs mt-1 font-normal">Every plan features 100% royalty payout guarantees.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-4 px-6 text-xs font-extrabold uppercase tracking-wider text-neutral-400 w-1/3">Core Deliverable</th>
                  <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-wider text-neutral-400 text-center">Basic</th>
                  <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-wider text-neutral-400 text-center">Pro</th>
                  <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-wider text-neutral-400 text-center">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6 text-xs sm:text-sm font-medium text-white flex flex-col">
                      <span className="font-semibold text-white">{row.featureName}</span>
                      <span className="text-[10px] text-neutral-500 font-mono scale-95 origin-left tracking-wide">{row.category}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center">
                        {typeof row.basic === "boolean" ? (
                          row.basic ? <Check className="h-4 w-4 text-purple-400" /> : <X className="h-4 w-4 text-neutral-600" />
                        ) : (
                          <span className="text-xs font-mono text-neutral-300 font-bold">{row.basic}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center bg-purple-500/2">
                      <div className="inline-flex items-center justify-center">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? <Check className="h-4 w-4 text-purple-400 font-semibold" /> : <X className="h-4 w-4 text-neutral-600" />
                        ) : (
                          <span className="text-xs font-mono text-purple-400 font-bold">{row.pro}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center">
                        {typeof row.elite === "boolean" ? (
                          row.elite ? <Check className="h-4 w-4 text-cyan-400 font-semibold" /> : <X className="h-4 w-4 text-neutral-600" />
                        ) : (
                          <span className="text-xs font-mono text-cyan-400 font-bold">{row.elite}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
