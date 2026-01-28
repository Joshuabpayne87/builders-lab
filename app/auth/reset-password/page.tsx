"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setReady(true);
          return;
        }

        let sessionEstablished = false;
        let errorMessage = "";

        const authAny = supabase.auth as unknown as {
          getSessionFromUrl?: (options?: { storeSession?: boolean }) => Promise<{
            data?: { session?: unknown };
            error?: { message?: string };
          }>;
        };

        if (typeof authAny.getSessionFromUrl === "function") {
          const { data: urlData, error: urlError } = await authAny.getSessionFromUrl({
            storeSession: true,
          });

          if (urlError?.message) {
            errorMessage = urlError.message;
          } else if (urlData?.session) {
            sessionEstablished = true;
          }
        }

        if (!sessionEstablished) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              errorMessage = error.message || "Invalid recovery session.";
            } else {
              sessionEstablished = true;
            }
          }
        }

        if (sessionEstablished) {
          window.history.replaceState(null, "", window.location.pathname);
          setReady(true);
          return;
        }

        setError(errorMessage || "Invalid or expired recovery link.");
      } catch (err: any) {
        setError(err.message || "Failed to initialize recovery.");
      }
    };

    initialize();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Ubuntu+Mono:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&display=swap');

        body {
          margin: 0;
          font-family: 'Roboto', sans-serif;
          background: radial-gradient(circle, #080a0c, #020304);
          color: #fff;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          width: "440px",
          maxWidth: "90vw",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)"
        }}>
          <h1 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "28px",
            marginBottom: "8px"
          }}>
            Set a new password
          </h1>
          <p style={{
            fontFamily: "'Ubuntu Mono', monospace",
            color: "#a8b3ba",
            fontSize: "14px",
            marginBottom: "24px"
          }}>
            Create a new password for your account.
          </p>

          {!ready && !error && (
            <div style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              padding: "14px",
              color: "#a8b3ba",
              fontFamily: "'Ubuntu Mono', monospace",
              marginBottom: "16px"
            }}>
              Verifying your recovery link...
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              border: "1px solid rgba(244, 67, 54, 0.3)",
              borderRadius: "6px",
              padding: "12px",
              color: "#f44336",
              fontFamily: "'Ubuntu Mono', monospace",
              marginBottom: "16px"
            }}>
              {error}
            </div>
          )}

          {success ? (
            <div style={{
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: "6px",
              padding: "16px",
              color: "#9be39b",
              fontFamily: "'Ubuntu Mono', monospace",
              marginBottom: "16px"
            }}>
              Password updated. Redirecting to sign in...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{
                display: "block",
                fontFamily: "'Ubuntu Mono', monospace",
                fontSize: "13px",
                marginBottom: "6px",
                color: "#a8b3ba"
              }}>
                New password
              </label>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <Lock style={{
                  position: "absolute",
                  top: "50%",
                  left: "12px",
                  transform: "translateY(-50%)",
                  color: "#6f7a82",
                  width: "18px",
                  height: "18px"
                }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  disabled={!ready}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 40px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#fff",
                    fontFamily: "'Ubuntu Mono', monospace"
                  }}
                />
              </div>

              <label style={{
                display: "block",
                fontFamily: "'Ubuntu Mono', monospace",
                fontSize: "13px",
                marginBottom: "6px",
                color: "#a8b3ba"
              }}>
                Confirm password
              </label>
              <div style={{ position: "relative", marginBottom: "18px" }}>
                <Lock style={{
                  position: "absolute",
                  top: "50%",
                  left: "12px",
                  transform: "translateY(-50%)",
                  color: "#6f7a82",
                  width: "18px",
                  height: "18px"
                }} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={!ready}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 40px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#fff",
                    fontFamily: "'Ubuntu Mono', monospace"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !ready}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: loading || !ready ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite" }} />
                    Updating...
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight style={{ width: "18px", height: "18px" }} />
                  </>
                )}
              </button>
            </form>
          )}

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Link href="/auth/login" style={{ color: "#9be39b", textDecoration: "none", fontSize: "14px" }}>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
