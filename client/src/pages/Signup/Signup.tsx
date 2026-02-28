import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (touched.name && name.trim().length < 2) {
        e.name = "Name must be at least 2 characters.";
      }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        e.email = "Enter a valid email.";
    }
    if (touched.password && password.length < 8) {
        e.password = "Password must be at least 8 characters.";
    }    
    if ((touched.confirm || confirm.length > 0) && confirm !== password) {
        e.confirm = "Passwords do not match.";
    }
    return e;
  }, [name, email, password, confirm]);

  const showNameError = touched.name && !!errors.name;
  const showEmailError = touched.email && !!errors.email;
  const showPasswordError = touched.password && !!errors.password;
  const showConfirmError = touched.confirm && !!errors.confirm;
  const canSubmit =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.length >= 8 &&
    confirm.length > 0 &&
    confirm === password;
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.logo} />
          <div>
            <div style={styles.brandTitle}>Interview Simulation</div>
            <div style={styles.brandSub}>Create your account</div>
          </div>
        </div>

        <h1 style={styles.h1}>Sign up</h1>
        <p style={styles.p}>Practice interviews, track progress, and improve fast.</p>

        <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              style={styles.input}
              placeholder="Divya Panthi"
              autoComplete="name"
            />
            {errors.name && <div style={styles.error}>{errors.name}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              style={styles.input}
              placeholder="you@email.com"
              autoComplete="email"
              inputMode="email"
            />
            {showEmailError && <div style={styles.error}>{errors.email}</div>}
            </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                style={styles.inputInner}
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <div style={styles.error}>{errors.password}</div>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm password</label>
            <div style={styles.inputWrap}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                style={styles.inputInner}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={styles.eyeBtn}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {showPasswordError && <div style={styles.error}>{errors.password}</div>}
          </div>

          <button type="button" disabled={!canSubmit} style={{ ...styles.primaryBtn, ...(canSubmit ? {} : styles.btnDisabled) }}>
            Create account
          </button>

          <div style={styles.dividerRow}>
            <div style={styles.divider} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.divider} />
          </div>

          <button type="button" style={styles.secondaryBtn}>
            Continue with Google
          </button>

          <div style={styles.footer}>
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>

        <div style={styles.legal}>
          By creating an account, you agree to the Terms and Privacy Policy.
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 20,
    background:
      "radial-gradient(1200px 600px at 10% 10%,rgb(167, 178, 210) 0%, transparent 50%), radial-gradient(900px 500px at 90% 20%,rgb(208, 226, 237) 0%, transparent 55%),rgb(209, 218, 234)",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid #EDEDED",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    backdropFilter: "blur(6px)",
  },
  brandRow: { display: "flex", gap: 12, alignItems: "center" },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "linear-gradient(135deg, #111827 0%, #4F46E5 50%, #06B6D4 100%)",
  },
  brandTitle: { fontSize: 14, fontWeight: 700, color: "#111827" },
  brandSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  h1: { margin: "14px 0 6px", fontSize: 26, letterSpacing: -0.3, color: "#111827" },
  p: { margin: 0, color: "#6B7280", fontSize: 14, lineHeight: 1.5 },
  form: { marginTop: 16, display: "grid", gap: 12 },
  field: { display: "grid", gap: 6 },
  label: { fontSize: 13, color: "#374151", fontWeight: 600 },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    outline: "none",
    fontSize: 14,
    background: "white",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    background: "white",
    overflow: "hidden",
  },
  inputInner: {
    flex: 1,
    padding: "12px 12px",
    border: "none",
    outline: "none",
    fontSize: 14,
    background: "transparent",
  },
  eyeBtn: {
    border: "none",
    background: "transparent",
    padding: "0 12px",
    cursor: "pointer",
    fontSize: 13,
    color: "#4F46E5",
    fontWeight: 600,
  },
  error: { fontSize: 12, color: "#B00020" },
  primaryBtn: {
    marginTop: 4,
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },
  btnDisabled: {
    background: "#E5E7EB",
    border: "1px solid #E5E7EB",
    color: "#6B7280",
    cursor: "not-allowed",
  },
  dividerRow: { display: "flex", alignItems: "center", gap: 10, margin: "6px 0" },
  divider: { flex: 1, height: 1, background: "#E5E7EB" },
  dividerText: { fontSize: 12, color: "#9CA3AF" },
  secondaryBtn: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "white",
    color: "#111827",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },
  footer: { marginTop: 6, fontSize: 14, color: "#374151" },
  legal: { marginTop: 14, fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 },
};