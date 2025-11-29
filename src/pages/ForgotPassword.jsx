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
      setError("Enter your email");
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
        setMsg("Reset link sent to your email!");
      } else {
        setError(data?.message || "Something went wrong");
      }
    } catch (err) {
      setError("Network error");
    }

    setLoading(false);
  }

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
        <h2 style={{ color: theme.text, marginBottom: 20 }}>Forgot Password</h2>

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
          }}
        />

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
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p style={{ marginTop: 20, color: theme.text, fontSize: 14 }}>
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
