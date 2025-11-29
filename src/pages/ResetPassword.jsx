import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  /* -----------------------------------------
     THEME
  ----------------------------------------- */
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = {
    bg: isDark ? "#0d1117" : "#f6f8fa",
    cardBg: isDark ? "#161b22" : "#ffffff",
    text: isDark ? "#e6edf3" : "#1f2328",
    border: isDark ? "#30363d" : "#d0d7de",
    inputBg: isDark ? "#0d1117" : "#f0f2f4",
  };

  /* -----------------------------------------
     RESET PASSWORD HANDLER
  ----------------------------------------- */
  async function handleReset() {
    if (!password || !confirm) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        setMsg("Password reset successful! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Invalid or expired link.");
      }
    } catch (err) {
      setError("Something went wrong.");
    }

    setLoading(false);
  }

  /* -----------------------------------------
     UI — RESET FORM
  ----------------------------------------- */
  return (
    <div
      style={{
        height: "100vh",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: "32px 28px",
          borderRadius: 10,
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          textAlign: "center",
        }}
      >
        <h2 style={{ color: theme.text, marginBottom: 20 }}>
          Reset Password
        </h2>

        {/* SUCCESS MESSAGE */}
        {msg && (
          <div
            style={{
              marginBottom: 15,
              padding: 10,
              borderRadius: 6,
              background: "#dafbe1",
              color: "#116329",
              fontSize: 14,
            }}
          >
            {msg}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              marginBottom: 15,
              padding: 10,
              borderRadius: 6,
              background: "#ffebe9",
              color: "#cf222e",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* NEW PASSWORD */}
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 6,
            border: `1px solid ${theme.border}`,
            background: theme.inputBg,
            color: theme.text,
            marginBottom: 12,
          }}
        />

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 6,
            border: `1px solid ${theme.border}`,
            background: theme.inputBg,
            color: theme.text,
            marginBottom: 16,
          }}
        />

        {/* RESET BUTTON */}
        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 6,
            background: "#238636",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: 15,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Updating…" : "Reset Password"}
        </button>

        {/* BACK TO LOGIN */}
        <p
          style={{
            marginTop: 20,
            color: theme.text,
            fontSize: 14,
          }}
        >
          Back to{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#2f81f7", cursor: "pointer" }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
