"use server";

import { subscribe } from "@/lib/dal/newsletter";

export async function subscribeAction(email: string) {
  await subscribe(email);
}
