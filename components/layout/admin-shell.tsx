import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

/** Props for the AdminShell layout component */
interface AdminShellProps {
  /** Admin user email to display in the header */
  userEmail: string;
  /** Page content */
  children: React.ReactNode;
}

/**
 * Complete admin layout shell: sidebar + header + main content area.
 */
function AdminShell({ userEmail, children }: AdminShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AdminShell };
export type { AdminShellProps };
