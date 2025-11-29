import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = {
    bg: isDark ? "#0d1117" : "#f6f8fa",
    cardBg: isDark ? "#161b22" : "#ffffff",
    text: isDark ? "#e6edf3" : "#1f2328",
    border: isDark ? "#30363d" : "#d0d7de",
    inputBg: isDark ? "#0d1117" : "#f0f2f4",
  };

  async function handleForgot() {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMsg("");

    try {
      const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data?.success) {
        setMsg("A password reset link has been sent to your email.");
      } else {
        setError(data?.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Network error. Try again.");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
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
        <h2
          style={{
            color: theme.text,
            fontSize: 20,
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          Reset Your Password
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

        {/* EMAIL INPUT */}
        <input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 6,
            border: `1px solid ${theme.border}`,
            background: theme.inputBg,
            color: theme.text,
            marginBottom: 16,
            outline: "none",
            fontSize: 14,
          }}
        />

        {/* RESET BUTTON */}
        <button
          onClick={handleForgot}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 6,
            background: "#2f81f7",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: 15,
            opacity: loading ? 0.7 : 1,
            marginBottom: 18,
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* BACK TO LOGIN */}
        <p style={{ marginTop: 10, color: theme.text, fontSize: 14 }}>
          Back to{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#2f81f7", cursor: "pointer", fontWeight: 500 }}
          >
            Login
          </span>
        </p>

        {/* BACK TO SIGNUP */}
        <p style={{ marginTop: 6, color: theme.text, fontSize: 13 }}>
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={{ color: "#2f81f7", cursor: "pointer", fontWeight: 500 }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
