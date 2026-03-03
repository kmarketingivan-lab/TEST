/**
 * WhatsApp notification via CallMeBot (free service).
 *
 * Setup (one-time manual step):
 *   1. Save +34 644 59 21 91 to WhatsApp contacts as "CallMeBot"
 *   2. Send the message "I allow callmebot to send me messages" to that number
 *   3. You'll receive an API key (e.g. "123456")
 *   4. Add to .env.local:
 *      CALLMEBOT_PHONE=39XXXXXXXXXX  ← Italian number with prefix 39, no +
 *      CALLMEBOT_APIKEY=123456
 *
 * Docs: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
export async function sendWhatsAppNotification(message: string): Promise<void> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  // Graceful degradation: skip silently if not configured
  if (!phone || !apikey) return;

  try {
    const encoded = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apikey}`;
    await fetch(url);
  } catch {
    // Non-critical — do not throw
  }
}
