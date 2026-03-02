"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Ticket,
  Truck,
  BookOpen,
  FileText,
  Image,
  Star,
  Mail,
  Settings,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [
      { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    ],
  },
  {
    label: "Catalogo",
    items: [
      { label: "Prodotti", href: "/admin/products", icon: <Package className="h-5 w-5" /> },
      { label: "Categorie", href: "/admin/categories", icon: <FolderTree className="h-5 w-5" /> },
      { label: "Marchi", href: "/admin/brands", icon: <Tag className="h-5 w-5" /> },
    ],
  },
  {
    label: "Vendite",
    items: [
      { label: "Ordini", href: "/admin/orders", icon: <ShoppingCart className="h-5 w-5" /> },
      { label: "Coupon", href: "/admin/coupons", icon: <Ticket className="h-5 w-5" /> },
      { label: "Spedizioni", href: "/admin/shipping", icon: <Truck className="h-5 w-5" /> },
    ],
  },
  {
    label: "Contenuti",
    items: [
      { label: "Blog", href: "/admin/blog", icon: <BookOpen className="h-5 w-5" /> },
      { label: "Pagine", href: "/admin/pages", icon: <FileText className="h-5 w-5" /> },
      { label: "Media", href: "/admin/media", icon: <Image className="h-5 w-5" /> },
    ],
  },
  {
    label: "Clienti",
    items: [
      { label: "Recensioni", href: "/admin/reviews", icon: <Star className="h-5 w-5" /> },
      { label: "Newsletter", href: "/admin/newsletter", icon: <Mail className="h-5 w-5" /> },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Impostazioni", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
    ],
  },
];

function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navContent = (
    <nav className="flex flex-col gap-1 p-4">
      <div className="mb-4 px-3 py-2">
        <h2 className="text-lg font-bold text-neutral-900">Admin</h2>
      </div>
      {navGroups.map((group) => (
        <div key={group.label || "top"} className="mb-2">
          {group.label && (
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {group.label}
            </p>
          )}
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive(item.href)
                    ? "bg-red-50 text-red-700"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-md bg-white p-2 shadow-md lg:hidden"
        aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto bg-white shadow-lg transition-transform lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-neutral-200 lg:bg-white">
        {navContent}
      </aside>
    </>
  );
}

export { AdminSidebar };
