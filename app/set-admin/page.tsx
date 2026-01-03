"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

export default function SetAdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  const handleSetAdmin = async () => {
    try {
      setLoading(true);
      setResult(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setResult({ success: false, message: "You must be logged in" });
        return;
      }

      setUserEmail(user.email || "");

      // Call the API to set admin role
      const response = await fetch("/api/admin/set-admin", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: "Admin role set successfully! Redirecting to admin dashboard..."
        });

        // Wait 2 seconds then redirect
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to set admin role"
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "An error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Set Admin Access
          </h1>
          <p className="text-slate-400">
            Grant admin privileges to your account
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {userEmail && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Current Email</p>
              <p className="font-mono text-sm">{userEmail}</p>
            </div>
          )}

          {result && (
            <div className={`mb-6 p-4 rounded-lg border ${
              result.success
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${result.success ? "text-green-400" : "text-red-400"}`}>
                  {result.message}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleSetAdmin}
            disabled={loading || result?.success}
            className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                Setting Admin Role...
              </>
            ) : result?.success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Redirecting...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Set Admin Role
              </>
            )}
          </button>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-3">Requirements:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                Must be logged in
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                Email must be: joshua@craftedmarketing.solutions
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          <a href="/dashboard" className="text-white hover:underline">
            Back to Dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
