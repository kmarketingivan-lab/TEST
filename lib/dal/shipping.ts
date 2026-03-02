import { createClient } from "@/lib/supabase/server";
import type { ShippingZone, ShippingRule } from "@/types/database";

interface ShippingCalculation {
  cost: number;
  isFree: boolean;
  zone: ShippingZone | null;
}

/**
 * Get all active shipping zones.
 */
export async function getShippingZones(): Promise<ShippingZone[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("is_active", true);

  if (error) throw error;
  return (data ?? []) as ShippingZone[];
}

/**
 * Calculate shipping cost for a given country, weight, and order amount.
 */
export async function calculateShipping(
  country: string,
  weightGrams: number,
  orderAmount: number
): Promise<ShippingCalculation> {
  const supabase = await createClient();

  // Find zone matching the country
  const { data: zones, error: zoneError } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("is_active", true)
    .contains("countries", [country]);

  if (zoneError) throw zoneError;

  if (!zones || zones.length === 0) {
    return { cost: 0, isFree: false, zone: null };
  }

  const zone = zones[0] as ShippingZone;

  // Check free shipping threshold
  if (zone.min_order_free_shipping && orderAmount >= zone.min_order_free_shipping) {
    return { cost: 0, isFree: true, zone };
  }

  // Check weight-based rules
  const { data: rules, error: rulesError } = await supabase
    .from("shipping_rules")
    .select("*")
    .eq("zone_id", zone.id)
    .lte("min_weight_grams", weightGrams)
    .order("min_weight_grams", { ascending: false })
    .limit(1);

  if (rulesError) throw rulesError;

  if (rules && rules.length > 0) {
    const rule = rules[0] as ShippingRule;
    if (rule.max_weight_grams === null || weightGrams <= rule.max_weight_grams) {
      return { cost: rule.price, isFree: false, zone };
    }
  }

  // Fall back to flat_rate + per_kg
  const weightKg = weightGrams / 1000;
  const cost = zone.flat_rate + zone.per_kg_rate * weightKg;

  return { cost: Math.round(cost * 100) / 100, isFree: false, zone };
}
