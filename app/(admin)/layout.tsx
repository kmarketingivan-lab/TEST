import { requireAdmin } from "@/lib/auth/helpers";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();

  return (
    <AdminShell userEmail={admin.email}>
      {children}
    </AdminShell>
  );
}
