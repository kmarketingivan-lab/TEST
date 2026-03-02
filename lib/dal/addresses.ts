import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/types/database";

/**
 * Get all addresses for a user.
 */
export async function getUserAddresses(userId: string): Promise<Address[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Address[];
}

/**
 * Get the default address for a user.
 */
export async function getDefaultAddress(userId: string): Promise<Address | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (error) throw error;
  return (data as Address) ?? null;
}

/**
 * Create a new address.
 */
export async function createAddress(address: {
  user_id: string;
  label?: string;
  full_name: string;
  phone?: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}): Promise<Address> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addresses")
    .insert(address)
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

/**
 * Update an address.
 */
export async function updateAddress(
  addressId: string,
  updates: {
    label?: string;
    full_name?: string;
    phone?: string;
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
    is_default?: boolean;
  }
): Promise<Address> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addresses")
    .update(updates)
    .eq("id", addressId)
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

/**
 * Delete an address.
 */
export async function deleteAddress(addressId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId);

  if (error) throw error;
}

/**
 * Set an address as default (trigger handles unsetting the old one).
 */
export async function setDefaultAddress(addressId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId);

  if (error) throw error;
}
