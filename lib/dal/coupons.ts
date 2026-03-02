import { createClient } from "@/lib/supabase/server";
import type { Coupon } from "@/types/database";

interface CouponValidationResult {
  valid: boolean;
  discount: number;
  reason: string | null;
  coupon_id?: string;
  code?: string;
}

/**
 * Validate a coupon code against an order amount via RPC.
 */
export async function validateCoupon(
  code: string,
  orderAmount: number
): Promise<CouponValidationResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("validate_and_apply_coupon", {
    p_code: code,
    p_order_amount: orderAmount,
  });

  if (error) throw error;
  return data as unknown as CouponValidationResult;
}

/**
 * Increment coupon usage count after an order.
 */
export async function applyCoupon(couponId: string): Promise<void> {
  const supabase = await createClient();

  const { data: coupon, error: fetchError } = await supabase
    .from("coupons")
    .select("current_uses")
    .eq("id", couponId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("coupons")
    .update({ current_uses: (coupon as Coupon).current_uses + 1 })
    .eq("id", couponId);

  if (error) throw error;
}

/**
 * Get all active coupons (admin).
 */
export async function getActiveCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Coupon[];
}

/**
 * Get all coupons (admin).
 */
export async function getAllCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Coupon[];
}

/**
 * Create a new coupon (admin).
 */
export async function createCoupon(coupon: {
  code: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  starts_at?: string;
  expires_at?: string;
  is_active?: boolean;
}): Promise<Coupon> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .insert(coupon)
    .select()
    .single();

  if (error) throw error;
  return data as Coupon;
}

/**
 * Update a coupon (admin).
 */
export async function updateCoupon(
  couponId: string,
  updates: {
    code?: string;
    description?: string;
    discount_type?: string;
    discount_value?: number;
    min_order_amount?: number;
    max_uses?: number;
    starts_at?: string;
    expires_at?: string;
    is_active?: boolean;
  }
): Promise<Coupon> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .update(updates)
    .eq("id", couponId)
    .select()
    .single();

  if (error) throw error;
  return data as Coupon;
}

/**
 * Delete a coupon (admin).
 */
export async function deleteCoupon(couponId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", couponId);

  if (error) throw error;
}
