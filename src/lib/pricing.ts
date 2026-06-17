/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from "./supabase";

export interface PlanPrices {
  annual: number;
  monthly: number;
  oneTime: number;
}

export const BASE_PRICES: Record<string, PlanPrices> = {
  basic: { annual: 799, monthly: 79, oneTime: 49 },
  pro: { annual: 1499, monthly: 149, oneTime: 99 },
  elite: { annual: 2499, monthly: 249, oneTime: 149 }
};

export interface PlanOffer {
  planId: string; // "basic" | "pro" | "elite"
  annualOfferPrice: number | null; // e.g. 299 (null means no offer override)
  monthlyOfferPrice: number | null; // e.g. 39 (null means no offer override)
  oneTimeOfferPrice: number | null; // e.g. 19
  offerLabel: string; // e.g. "Early Bird Offer", "Festival Special"
}

// Load current promotional offers
export function getStoredOffers(): Record<string, PlanOffer> {
  const defaultOffers: Record<string, PlanOffer> = {
    basic: { planId: "basic", annualOfferPrice: null, monthlyOfferPrice: null, oneTimeOfferPrice: null, offerLabel: "" },
    pro: { planId: "pro", annualOfferPrice: null, monthlyOfferPrice: null, oneTimeOfferPrice: null, offerLabel: "" },
    elite: { planId: "elite", annualOfferPrice: null, monthlyOfferPrice: null, oneTimeOfferPrice: null, offerLabel: "" }
  };

  const stored = localStorage.getItem("wavora_plan_offers");
  if (!stored) return defaultOffers;

  try {
    const parsed = JSON.parse(stored);
    // Merge into default to maintain all IDs
    return {
      basic: { ...defaultOffers.basic, ...parsed.basic },
      pro: { ...defaultOffers.pro, ...parsed.pro },
      elite: { ...defaultOffers.elite, ...parsed.elite }
    };
  } catch (err) {
    return defaultOffers;
  }
}

// Fetch current offers from Supabase database to sync globally
export async function syncOffersFromSupabase() {
  try {
    const { data, error } = await supabase.from("plan_offers").select("*");
    if (error) {
      console.warn("Could not retrieve plan offers from Supabase. Falling back to local values:", error);
      return;
    }
    if (data && data.length > 0) {
      const parsedOffers: Record<string, PlanOffer> = {
        basic: { planId: "basic", annualOfferPrice: null, monthlyOfferPrice: null, oneTimeOfferPrice: null, offerLabel: "" },
        pro: { planId: "pro", annualOfferPrice: null, monthlyOfferPrice: null, oneTimeOfferPrice: null, offerLabel: "" },
        elite: { planId: "elite", annualOfferPrice: null, monthlyOfferPrice: null, oneTimeOfferPrice: null, offerLabel: "" }
      };

      data.forEach((row: any) => {
        if (parsedOffers[row.plan_id]) {
          parsedOffers[row.plan_id] = {
            planId: row.plan_id,
            annualOfferPrice: row.annual_offer_price !== null && row.annual_offer_price !== undefined ? Number(row.annual_offer_price) : null,
            monthlyOfferPrice: row.monthly_offer_price !== null && row.monthly_offer_price !== undefined ? Number(row.monthly_offer_price) : null,
            oneTimeOfferPrice: row.one_time_offer_price !== null && row.one_time_offer_price !== undefined ? Number(row.one_time_offer_price) : null,
            offerLabel: row.offer_label || ""
          };
        }
      });

      localStorage.setItem("wavora_plan_offers", JSON.stringify(parsedOffers));
      // Dispatch globally to sync UI state instantly in a modular SPA setup
      window.dispatchEvent(new Event("wavora_offers_updated"));
    }
  } catch (err) {
    console.warn("Error synchronizing offers from Supabase:", err);
  }
}

// Save pricing offer configurations
export async function saveStoredOffers(offers: Record<string, PlanOffer>) {
  localStorage.setItem("wavora_plan_offers", JSON.stringify(offers));
  // Dispatch globally to sync UI state instantly in a modular SPA setup
  window.dispatchEvent(new Event("wavora_offers_updated"));

  try {
    const plansToSync = ["basic", "pro", "elite"] as const;
    for (const planId of plansToSync) {
      const offer = offers[planId];
      if (offer) {
        await supabase
          .from("plan_offers")
          .upsert({
            plan_id: planId,
            annual_offer_price: offer.annualOfferPrice,
            monthly_offer_price: offer.monthlyOfferPrice,
            one_time_offer_price: offer.oneTimeOfferPrice,
            offer_label: offer.offerLabel,
            updated_at: new Date().toISOString()
          });
      }
    }
  } catch (err) {
    console.warn("Failed to synchronize pricing offers with Supabase:", err);
  }
}

// Compute active discounted outcomes for display and transactions
export function getPlanPriceDetails(planId: string, isAnnual: boolean, isOneTime: boolean = false) {
  const base = BASE_PRICES[planId] || BASE_PRICES["pro"];
  const basePrice = isOneTime ? base.oneTime : (isAnnual ? base.annual : base.monthly);
  
  const offers = getStoredOffers();
  const offer = offers[planId];
  
  const offerPrice = offer 
    ? (isOneTime ? offer.oneTimeOfferPrice : (isAnnual ? offer.annualOfferPrice : offer.monthlyOfferPrice))
    : null;
    
  const hasOffer = offerPrice !== null && offerPrice !== undefined && offerPrice > 0 && offerPrice < basePrice;
  const finalPrice = hasOffer ? Number(offerPrice) : basePrice;
  const discountPercent = hasOffer ? Math.round(((basePrice - finalPrice) / basePrice) * 100) : 0;
  
  return {
    basePrice,
    finalPrice,
    hasOffer,
    offerPrice,
    discountPercent,
    offerLabel: (hasOffer && offer?.offerLabel) ? offer.offerLabel : "",
    period: isOneTime ? "one-time release" : (isAnnual ? "year" : "month")
  };
}
