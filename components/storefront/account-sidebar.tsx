"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  ShoppingCart,
  CalendarCheck,
  Heart,
  MapPin,
  LogOut,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Profilo", href: "/account/profile", icon: <User className="h-5 w-5" /> },
  { label: "Ordini", href: "/account/orders", icon: <ShoppingCart className="h-5 w-5" /> },
  { label: "Prenotazioni", href: "/account/bookings", icon: <CalendarCheck className="h-5 w-5" /> },
  { label: "Wishlist", href: "/account/wishlist", icon: <Heart className="h-5 w-5" /> },
  { label: "Indirizzi", href: "/account/addresses", icon: <MapPin className="h-5 w-5" /> },
];

function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (href === "/account") return pathname === "/account";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const res = await fetch("/api/account/signout", { method: "POST" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      addToast("error", "Errore nel logout");
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <nav className="sticky top-24 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 px-3 text-lg font-bold text-gray-900">Il mio account</h2>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${isActive(item.href)
                    ? "bg-red-50 text-red-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-5 w-5" />
              {loggingOut ? "Uscita..." : "Esci"}
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile tabs */}
      <div className="overflow-x-auto border-b border-gray-200 bg-white lg:hidden">
        <nav className="flex min-w-max gap-1 px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? "bg-red-50 text-red-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-5 w-5" />
            {loggingOut ? "Uscita..." : "Esci"}
          </button>
        </nav>
      </div>
    </>
  );
}

export { AccountSidebar };
