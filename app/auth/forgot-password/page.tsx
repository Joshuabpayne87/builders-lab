"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
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
          width: "420px",
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
            Reset your password
          </h1>
          <p style={{
            fontFamily: "'Ubuntu Mono', monospace",
            color: "#a8b3ba",
            fontSize: "14px",
            marginBottom: "24px"
          }}>
            Enter your email and we will send you a reset link.
          </p>

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
              Check your email for the reset link.
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
                Email
              </label>
              <div style={{ position: "relative", marginBottom: "18px" }}>
                <Mail style={{
                  position: "absolute",
                  top: "50%",
                  left: "12px",
                  transform: "translateY(-50%)",
                  color: "#6f7a82",
                  width: "18px",
                  height: "18px"
                }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                disabled={loading}
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
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite" }} />
                    Sending...
                  </>
                ) : (
                  <>
                    Send reset link
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
