"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, ChevronRight } from "lucide-react";
import { handleSignOut } from "./admin-logout-action";

/** Props for the AdminHeader component */
interface AdminHeaderProps {
  /** Admin user email to display */
  userEmail: string;
}

/**
 * Generates breadcrumb segments from the current pathname.
 */
function getBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href: string }> = [];

  const labelMap: Record<string, string> = {
    admin: "Admin",
    products: "Prodotti",
    categories: "Categorie",
    orders: "Ordini",
    bookings: "Prenotazioni",
    blog: "Blog",
    pages: "Pagine",
    media: "Media",
    settings: "Impostazioni",
    new: "Nuovo",
    edit: "Modifica",
    services: "Servizi",
    availability: "Disponibilità",
  };

  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    const label = labelMap[segment] ?? segment;
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

/**
 * Admin header with breadcrumb navigation, user info, and logout button.
 */
function AdminHeader({ userEmail }: AdminHeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-gray-900">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-gray-500 hover:text-gray-700">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{userEmail}</span>
        <form action={handleSignOut}>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </button>
        </form>
      </div>
    </header>
  );
}

export { AdminHeader };
export type { AdminHeaderProps };
