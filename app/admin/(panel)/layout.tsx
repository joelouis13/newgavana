import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/toaster";
import { requireAdminPage } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const { email } = await requireAdminPage();
  return (
    <>
      <AdminShell email={email}>{children}</AdminShell>
      <Toaster />
    </>
  );
}
