import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup as signupApi } from "../../../services/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const isValidEmail    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidName     = name.trim().length >= 2;
  const isValidPassword = password.length >= 8;
  const passwordsMatch  = confirm === password && confirm.length > 0;

  const canSubmit = isValidName && isValidEmail && isValidPassword && passwordsMatch;

  const passwordStrength =
    password.length === 0 ? null :
    password.length < 4   ? "weak" :
    password.length < 8   ? "medium" : "strong";

  const strengthColor: Record<string, string> = { weak: "#EF4444", medium: "#F59E0B", strong: "#10B981" };
  const strengthWidth: Record<string, string> = { weak: "33%", medium: "66%", strong: "100%" };

  async function handleSignup() {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);

    try {
      await signupApi(email.trim(), password);
      navigate("/"); // ← redirect after signup (change "/" to your home route)
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        .field-input:focus {
          outline: none;
          border-color: #6366F1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }

        .btn-primary:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .btn-primary { transition: all 0.2s ease; }

        .btn-google:hover { background: #f5f3ff !important; border-color: #a5b4fc !important; }
        .btn-google { transition: all 0.2s ease; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.5s ease forwards; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50%       { transform: translateY(-18px); opacity: 0.8; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        .feature-row:hover { background: rgba(255,255,255,0.06) !important; transform: translateX(4px); }
        .feature-row { transition: all 0.2s ease; }

        .step-card:hover { background: rgba(255,255,255,0.07) !important; transform: translateY(-2px); }
        .step-card { transition: all 0.2s ease; }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", height: "100vh", width: "100vw", fontFamily: "'Inter', sans-serif" }}>

        {/* LEFT PANEL — unchanged */}
        <div style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0c1445 100%)", color: "white", padding: "52px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", left: "-60px", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-80px", right: "-60px", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

          {[{ top: "8%", left: "60%", size: 3, dur: "5.5s", delay: "0.8s" }, { top: "12%", left: "75%", size: 4, dur: "4s", delay: "0s" }, { top: "18%", left: "45%", size: 2, dur: "6.5s", delay: "1.2s" }, { top: "22%", left: "30%", size: 3, dur: "5s", delay: "0.3s" }, { top: "25%", left: "88%", size: 3, dur: "6s", delay: "1s" }, { top: "30%", left: "55%", size: 2, dur: "7s", delay: "2.5s" }, { top: "35%", left: "20%", size: 4, dur: "4.5s", delay: "0.6s" }, { top: "38%", left: "70%", size: 3, dur: "6s", delay: "1.8s" }, { top: "42%", left: "92%", size: 5, dur: "5s", delay: "0.5s" }, { top: "47%", left: "38%", size: 2, dur: "5.5s", delay: "1.4s" }, { top: "52%", left: "62%", size: 3, dur: "4s", delay: "0.9s" }, { top: "55%", left: "15%", size: 2, dur: "6.5s", delay: "2.2s" }, { top: "60%", left: "82%", size: 3, dur: "7s", delay: "2s" }, { top: "63%", left: "48%", size: 4, dur: "5s", delay: "0.4s" }, { top: "68%", left: "25%", size: 2, dur: "6s", delay: "1.6s" }, { top: "72%", left: "67%", size: 3, dur: "4.5s", delay: "1.1s" }, { top: "75%", left: "90%", size: 4, dur: "4.5s", delay: "1.5s" }, { top: "80%", left: "35%", size: 2, dur: "5.5s", delay: "0.7s" }, { top: "85%", left: "58%", size: 3, dur: "6s", delay: "2.8s" }, { top: "90%", left: "78%", size: 2, dur: "5s", delay: "1.9s" }].map((dot, i) => (
            <div key={i} style={{ position: "absolute", top: dot.top, left: dot.left, width: dot.size, height: dot.size, borderRadius: "50%", background: "linear-gradient(135deg, #818CF8, #06B6D4)", animation: `float ${dot.dur} ease-in-out ${dot.delay} infinite`, pointerEvents: "none" } as React.CSSProperties} />
          ))}

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #818CF8, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 8px 24px rgba(99,102,241,0.45)" }}>⚡</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "white" }}>InterviewAI</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Practice platform</div>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, background: "rgba(99,102,241,0.18)", border: "1px solid rgba(129,140,248,0.3)", fontSize: 12, fontWeight: 600, color: "#a5b4fc", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818CF8", boxShadow: "0 0 6px #818CF8" }} />
              Start for free today
            </div>
            <h1 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", background: "linear-gradient(135deg, #ffffff 30%, rgba(165,180,252,0.85) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your next job<br />starts here.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.5)", marginBottom: 36, maxWidth: 400 }}>
              Create your free account and start practicing with a realistic AI interviewer in minutes.
            </p>
            {[{ icon: "🎯", title: "Realistic Simulations", desc: "Industry-specific questions tailored to your role" }, { icon: "💡", title: "Instant AI Feedback", desc: "Get scored on clarity, depth, and confidence" }, { icon: "📈", title: "Progress Tracking", desc: "See how you improve across every session" }].map((f) => (
              <div key={f.title} className="feature-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 14, marginBottom: 8, cursor: "default" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>How it works</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[{ step: "01", icon: "📝", title: "Pick a role", desc: "Choose the job type you're preparing for" }, { step: "02", icon: "🤖", title: "Get asked", desc: "AI asks you real interview-style questions" }, { step: "03", icon: "✅", title: "See feedback", desc: "Review scores and tips to improve fast" }].map((s) => (
                <div key={s.step} className="step-card" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 14px", cursor: "default" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 10 }}>STEP {s.step}</div>
                  <div style={{ fontSize: 20, marginBottom: 10, width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.35)" }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* RIGHT PANEL */}
        <div className="fade-in" style={{ background: "white", padding: "0 60px", display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg, #818CF8, #06B6D4)", boxShadow: "0 6px 18px rgba(99,102,241,0.25)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Interview Simulation</div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Create your account</div>
            </div>
          </div>

          <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: "#0F172A", marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sign up</h2>
          <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 24 }}>Practice interviews, track progress, and improve fast.</p>

          {/* ── ERROR BANNER ── */}
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#DC2626", marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          {/* ── FULL NAME ── */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#94A3B8", marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Full name</label>
            <input className="field-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Divya Panthi" autoComplete="name"
              style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${isValidName && name ? "#10B981" : "#E2E8F0"}`, fontSize: 14, fontFamily: "'Inter', sans-serif", background: "#FAFBFD", color: "#0F172A", transition: "border-color 0.2s ease" }}
            />
          </div>

          {/* ── EMAIL ── */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#94A3B8", marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Email</label>
            <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email"
              style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${isValidEmail && email ? "#10B981" : "#E2E8F0"}`, fontSize: 14, fontFamily: "'Inter', sans-serif", background: "#FAFBFD", color: "#0F172A", transition: "border-color 0.2s ease" }}
            />
          </div>

          {/* ── PASSWORD ── */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#94A3B8", marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Password</label>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E2E8F0", borderRadius: 12, background: "#FAFBFD", overflow: "hidden" }}>
              <input className="field-input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" autoComplete="new-password"
                style={{ flex: 1, padding: "13px 14px", border: "none", outline: "none", fontSize: 14, fontFamily: "'Inter', sans-serif", background: "transparent", color: "#0F172A" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ border: "none", background: "transparent", padding: "0 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#94A3B8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {passwordStrength && (
              <div style={{ height: 3, borderRadius: 2, background: "#F1F5F9", marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, width: strengthWidth[passwordStrength], background: strengthColor[passwordStrength], transition: "width 0.3s ease, background 0.3s ease" }} />
              </div>
            )}
          </div>

          {/* ── CONFIRM PASSWORD ── */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#94A3B8", marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Confirm password</label>
            <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${confirm.length > 0 ? (passwordsMatch ? "#10B981" : "#EF4444") : "#E2E8F0"}`, borderRadius: 12, background: "#FAFBFD", overflow: "hidden", transition: "border-color 0.2s ease" }}>
              <input className="field-input" type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm Password" autoComplete="new-password"
                style={{ flex: 1, padding: "13px 14px", border: "none", outline: "none", fontSize: 14, fontFamily: "'Inter', sans-serif", background: "transparent", color: "#0F172A" }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ border: "none", background: "transparent", padding: "0 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#94A3B8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {confirm.length > 0 && (
              <div style={{ fontSize: 12, marginTop: 6, color: passwordsMatch ? "#10B981" : "#EF4444" }}>
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </div>
            )}
          </div>

          {/* ── SIGN UP BUTTON ── */}
          <button
            className="btn-primary"
            type="button"
            disabled={!canSubmit || isLoading}
            onClick={handleSignup}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: canSubmit ? "linear-gradient(135deg, #1e1b4b, #4F46E5)" : "#F1F5F9",
              color: canSubmit ? "white" : "#94A3B8",
              fontSize: 15, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? "0 8px 24px rgba(79,70,229,0.3)" : "none",
              marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {isLoading ? <><span className="spinner" /> Creating account…</> : "Create account →"}
          </button>

          {/* ── DIVIDER ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "#EEF2F7" }} />
            <span style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#EEF2F7" }} />
          </div>

          {/* ── GOOGLE BUTTON ── */}
          <button className="btn-google" type="button" style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "white", color: "#0F172A", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18a8.6 8.6 0 0 0 5.96-2.18l-2.92-2.26a5.43 5.43 0 0 1-8.07-2.85H.96v2.34A9 9 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.69 9c0-.59.1-1.17.28-1.71V4.95H.96A9.01 9.01 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.34z"/>
              <path fill="#EA4335" d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.63 8.63 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.34A5.36 5.36 0 0 1 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", marginBottom: 16 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#6366F1", fontWeight: 700, textDecoration: "none" }}>Log in</Link>
          </p>

          <p style={{ fontSize: 11, color: "#CBD5E1", textAlign: "center", lineHeight: 1.6 }}>
            By creating an account, you agree to our Terms and Privacy Policy.
          </p>
        </div>

      </div>
    </>
  );
}
