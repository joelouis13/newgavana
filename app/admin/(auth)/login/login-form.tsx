"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { isSupabaseConfigured } from "@/lib/env";
import { getBrowserClient } from "@/lib/supabase/browser";

export function LoginForm({ notAdmin }: { notAdmin: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    notAdmin ? "This account does not have admin access. Sign in with an admin account." : null,
  );
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setPending(true);
    setError(null);
    const supabase = getBrowserClient();
    const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) {
      setPending(false);
      setError(signInError.message === "Invalid login credentials" ? "Incorrect email or password." : signInError.message);
      return;
    }
    // A token that is already "expired" the moment it's issued means this device's clock is wrong.
    const expiresAt = signIn.session?.expires_at;
    if (expiresAt && expiresAt * 1000 < Date.now()) {
      await supabase.auth.signOut();
      setPending(false);
      setError(
        "Your device's date/time is incorrect, so the login can't be verified. Turn on “Set time automatically” and the correct time zone in your device settings, then try again.",
      );
      return;
    }
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin !== true) {
      await supabase.auth.signOut();
      setPending(false);
      setError("This account does not have admin access.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-6 shadow-xl shadow-navy-900/5 sm:p-8">
      {!isSupabaseConfigured && (
        <p className="rounded-xl bg-coral-50 p-3 text-sm text-coral-700">
          Supabase is not configured. Add your keys to <code>.env.local</code> first.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="field pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-lg text-muted hover:bg-navy-50 hover:text-navy-900"
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
      </div>
      <button type="submit" className="btn btn-primary w-full py-3" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
