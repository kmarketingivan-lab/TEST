import { Resend } from "resend";
import { logger } from "@/lib/utils/logger";

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY ?? "");
  }
  return resendClient;
}

function isEmailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return typeof key === "string" && key.length > 0;
}

export { getClient, isEmailConfigured };
