"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingInvite, setValidatingInvite] = useState(false);
  const [error, setError] = useState("");
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Check for invite code in URL
  useEffect(() => {
    const codeFromUrl = searchParams.get("invite");
    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
      validateInviteCode(codeFromUrl);
    }
  }, [searchParams]);

  const validateInviteCode = async (code: string) => {
    if (!code.trim()) {
      setInviteValid(false);
      return;
    }

    setValidatingInvite(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("bl_invites")
        .select("*")
        .eq("code", code)
        .single();

      if (error || !data) {
        setError("Invalid invite code");
        setInviteValid(false);
        return;
      }

      if (data.used) {
        setError("This invite code has already been used");
        setInviteValid(false);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This invite code has expired");
        setInviteValid(false);
        return;
      }

      // If invite has a specific email, pre-fill it
      if (data.email) {
        setEmail(data.email);
        setInviteEmail(data.email);
      }

      setInviteValid(true);
    } catch (err: any) {
      setError("Failed to validate invite code");
      setInviteValid(false);
    } finally {
      setValidatingInvite(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteValid) {
      setError("Please enter a valid invite code");
      return;
    }

    // If invite is for a specific email, verify it matches
    if (inviteEmail && email !== inviteEmail) {
      setError(`This invite is only valid for ${inviteEmail}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Mark invite as used first
      const { error: inviteError } = await supabase
        .from("bl_invites")
        .update({ used: true })
        .eq("code", inviteCode)
        .eq("used", false); // Prevent race conditions

      if (inviteError) {
        setError("This invite code is no longer valid");
        setLoading(false);
        return;
      }

      // Create the user account
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) throw signupError;

      // Update the invite with the user ID
      if (data.user) {
        await supabase
          .from("bl_invites")
          .update({ used_by: data.user.id })
          .eq("code", inviteCode);
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      // Revert the invite if signup failed
      await supabase
        .from("bl_invites")
        .update({ used: false, used_by: null })
        .eq("code", inviteCode);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to The Builder's Lab!</h2>
          <p className="text-slate-400">Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Join The Builder's Lab</h1>
            <p className="text-slate-400">Invite-only access for community members</p>
          </div>

          {!inviteValid && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-yellow-200 font-semibold mb-1">Invite Required</h3>
                  <p className="text-yellow-300/80 text-sm">
                    You need an invite code to join. Check your email for your unique invite link from our newsletter.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Invite Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Invite Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    validateInviteCode(e.target.value);
                  }}
                  className={`w-full px-4 py-3 bg-white/5 border-2 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                    inviteValid
                      ? "border-green-500 focus:ring-green-500"
                      : "border-white/10 focus:ring-purple-500"
                  }`}
                  placeholder="Enter your invite code"
                  required
                  disabled={validatingInvite}
                />
                {validatingInvite && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
                )}
                {inviteValid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </div>

            {inviteValid && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      placeholder="you@example.com"
                      required
                      disabled={!!inviteEmail}
                    />
                  </div>
                  {inviteEmail && (
                    <p className="text-xs text-slate-400 mt-1">This invite is for this email only</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">At least 6 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !inviteValid}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </p>

          {!inviteCode && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-slate-400 text-sm text-center">
                Don't have an invite?{" "}
                <a href="https://your-newsletter-link.com" className="text-purple-400 hover:text-purple-300">
                  Subscribe to our newsletter
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
