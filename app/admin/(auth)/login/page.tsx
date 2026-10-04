import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const [{ error }, session] = await Promise.all([searchParams, getAdminSession()]);
  if (session.isAdmin) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-blush-50 via-cream to-navy-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/brand/logo-mark.png" alt="" width={64} height={64} className="rounded-2xl mix-blend-multiply" priority />
          <h1 className="mt-4 font-display text-3xl text-navy-900">
            <span className="text-navy-700">New</span>
            <span className="text-coral-500">Gavana</span> Admin
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your store</p>
        </div>
        <LoginForm notAdmin={error === "not-admin"} />
      </div>
    </main>
  );
}
