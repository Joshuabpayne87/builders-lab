"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Script from "next/script";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Initialize particles.js after script loads
    if (typeof window !== 'undefined' && (window as any).particlesJS) {
      (window as any).particlesJS('particles-js', {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: "#ffffff"
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 0.5,
            random: false,
          },
          size: {
            value: 5,
            random: true,
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 6,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "repulse"
            },
            onclick: {
              enable: true,
              mode: "push"
            },
            resize: true
          },
          modes: {
            repulse: {
              distance: 200
            },
            push: {
              particles_nb: 4
            }
          }
        }
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if ((window as any).particlesJS) {
            (window as any).particlesJS('particles-js', {
              particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 5, random: true },
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 6, direction: "none", random: false, straight: false, out_mode: "out" }
              },
              interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
                modes: { repulse: { distance: 200 }, push: { particles_nb: 4 } }
              }
            });
          }
        }}
      />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Ubuntu+Mono:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&display=swap');

        body {
          margin: 0;
          overflow: hidden;
          font-family: 'Roboto', sans-serif;
        }

        @keyframes membraneGlow {
          0% { opacity: 0.95; }
          100% { opacity: 0.8; }
        }
      `}</style>

      <div style={{
        margin: 0,
        overflow: 'hidden',
        background: 'radial-gradient(circle, #080a0c, #020304)',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div id="particles-js" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 0
        }} />

        <div style={{
          position: 'relative',
          width: '400px',
          maxWidth: '90vw',
          height: '600px',
          overflow: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Bio-Luminescence Membrane */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, #1a2a3a, #0b1117)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='diagonalLines' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cline x1='0' y1='0' x2='10' y2='10' style='stroke:rgba(255,255,255,0.05); stroke-width:1' /%3E%3Cline x1='0' y1='10' x2='10' y2='0' style='stroke:rgba(255,255,255,0.05); stroke-width:1' /%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%' height='100%' fill='url(%23diagonalLines)' /%3E%3C/svg%3E")`,
            opacity: 0.95,
            zIndex: 1,
            animation: 'membraneGlow 5s ease-in-out infinite alternate',
            clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 100%)'
          }} />

          {/* Form Content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            padding: '40px',
            color: '#fff',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <h2 style={{
              fontSize: '2.5em',
              fontWeight: 600,
              marginBottom: '20px',
              letterSpacing: '1px',
              textShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
              fontFamily: "'Rajdhani', sans-serif"
            }}>
              Login
            </h2>

            {error && (
              <div style={{
                width: '100%',
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '5px',
                color: '#f44336',
                fontSize: '0.9em',
                fontFamily: "'Ubuntu Mono', monospace"
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ width: '100%' }}>
              <div style={{ width: '100%', marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  textAlign: 'left',
                  fontSize: '0.9em',
                  marginBottom: '5px',
                  color: '#a8b3ba',
                  fontFamily: "'Ubuntu Mono', monospace"
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontSize: '1em',
                    transition: 'background-color 0.3s ease',
                    fontFamily: "'Ubuntu Mono', monospace",
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                  onBlur={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                />
              </div>

              <div style={{ width: '100%', marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  textAlign: 'left',
                  fontSize: '0.9em',
                  marginBottom: '5px',
                  color: '#a8b3ba',
                  fontFamily: "'Ubuntu Mono', monospace"
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontSize: '1em',
                    transition: 'background-color 0.3s ease',
                    fontFamily: "'Ubuntu Mono', monospace",
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                  onBlur={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#999' : '#4CAF50',
                  color: 'white',
                  padding: '14px 20px',
                  margin: '8px 0',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: '100%',
                  fontSize: '1.1em',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'background-color 0.3s ease',
                  fontFamily: "'Rajdhani', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#3e8e41')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4CAF50')}
              >
                {loading ? (
                  <>
                    <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div style={{
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              <span style={{ fontSize: '0.85em', color: '#777', fontFamily: "'Ubuntu Mono', monospace" }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            </div>

            <button
              onClick={handleGoogleLogin}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                padding: '12px 20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '1em',
                transition: 'background-color 0.3s ease',
                fontFamily: "'Rajdhani', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
            >
              Continue with Google
            </button>

            <p style={{
              marginTop: '20px',
              fontSize: '0.85em',
              color: '#777',
              fontFamily: "'Ubuntu Mono', monospace"
            }}>
              Don't have an account?{' '}
              <Link href="/auth/signup" style={{ color: '#4CAF50', textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
