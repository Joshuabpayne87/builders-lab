"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";

const AUTHORIZED_REFERRERS = [
  "https://topaitools.dev/#/portal/signup/6855cc19f0c9910008da8f33/monthly",
  "https://topaitools.dev/#/portal/signup/6855cc19f0c9910008da8f33/yearly",
  "topaitools.dev",
];

const ADMIN_EMAIL = "joshua@craftedmarketing.solutions";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user came from authorized payment portal
    const referrer = document.referrer;
    const hasValidToken = searchParams.get("token") === process.env.NEXT_PUBLIC_SIGNUP_TOKEN;

    // Check referrer or token
    const authorized =
      hasValidToken ||
      AUTHORIZED_REFERRERS.some(auth => referrer.includes(auth)) ||
      referrer === "" && process.env.NODE_ENV === "development"; // Allow in dev mode

    setIsAuthorized(authorized);
    setCheckingAuth(false);

    // Pre-fill email if provided
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Check if admin email is being used
  useEffect(() => {
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAuthorized(true);
    }
  }, [email]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!isAuthorized) {
      setError("Unauthorized access. Please sign up through our payment portal.");
      setLoading(false);
      return;
    }

    try {
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: name,
            role: isAdmin ? "admin" : "user",
          },
        },
      });

      if (signupError) throw signupError;

      if (data.user) {
        setSuccess(true);
        // If email confirmation is not required, redirect immediately
        if (data.session) {
          setTimeout(() => {
            router.push(isAdmin ? "/admin" : "/dashboard");
          }, 2000);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
        </div>

        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Welcome, {name}!</h1>
            <p className="text-slate-400 mb-6">
              Your account has been created. You're all set to start building.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Welcome to Builder's Lab</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-slate-400">
            Complete your registration to access your workspace
          </p>
        </div>

        {!isAuthorized && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-orange-400 mb-1">Unauthorized Access</h3>
                <p className="text-xs text-orange-300/80">
                  This page is only accessible after completing payment. Please{" "}
                  <a href="/" className="underline hover:text-orange-200">
                    return to the homepage
                  </a>{" "}
                  to sign up.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                  required
                  disabled={!isAuthorized}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                  required
                  disabled={!isAuthorized}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                  required
                  disabled={!isAuthorized}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                  required
                  disabled={!isAuthorized}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isAuthorized}
              className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Features List */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-4">What you'll get:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                AI-Powered Tools & Automation
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                Complete Implementation Library
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                Ready-to-Use Templates & Workflows
              </li>
            </ul>
          </div>
        </div>

        {/* Already have account */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-white hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
