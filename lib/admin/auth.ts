import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

export type AdminContext = {
  supabase: Awaited<ReturnType<typeof createSessionClient>>;
  userId: string;
  email: string | null;
};

/** Resolves the current user and whether they are in admin_users. */
export const getAdminSession = cache(async () => {
  if (!isSupabaseConfigured) return { supabase: null, user: null, isAdmin: false } as const;
  const supabase = await createSessionClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) return { supabase, user: null, isAdmin: false } as const;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  return {
    supabase,
    user: { id: claims.sub as string, email: (claims.email as string | undefined) ?? null },
    isAdmin: isAdmin === true,
  } as const;
});

/** For admin pages: redirects anyone who is not a signed-in admin. */
export async function requireAdminPage(): Promise<AdminContext> {
  const { supabase, user, isAdmin } = await getAdminSession();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin/login?error=not-admin");
  return { supabase, userId: user.id, email: user.email };
}

/** For server actions: throws instead of redirecting. */
export async function requireAdminAction(): Promise<AdminContext> {
  const { supabase, user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) throw new Error("Not authorised");
  return { supabase, userId: user.id, email: user.email };
}
