import { StorefrontHeader } from "@/components/layout/storefront-header";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { CookieConsent } from "@/components/gdpr/cookie-consent";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getCart } from "@/lib/cart/cart";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, cartItems] = await Promise.all([
    getCurrentUser(),
    getCart(),
  ]);

  let siteName = "My Ecommerce";
  let contactEmail = "";
  let contactPhone = "";

  try {
    const { getPublicSettings } = await import("@/lib/dal/settings");
    const settings = await getPublicSettings();
    if (typeof settings["site_name"] === "string") siteName = settings["site_name"];
    if (typeof settings["contact_email"] === "string") contactEmail = settings["contact_email"];
    if (typeof settings["contact_phone"] === "string") contactPhone = settings["contact_phone"];
  } catch {
    // Settings may not exist yet — use defaults
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontHeader cartCount={cartCount} isLoggedIn={!!user} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter
        siteName={siteName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
      />
      <CookieConsent />
    </div>
  );
}
