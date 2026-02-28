"use server";

import { signOut } from "@/lib/auth/actions";

/**
 * Server action wrapper for signOut that conforms to form action signature.
 */
export async function handleSignOut(): Promise<void> {
  await signOut();
}
