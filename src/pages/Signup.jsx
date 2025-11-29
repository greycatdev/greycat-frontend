import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = {
    bg: isDark ? "#0d1117" : "#f6f8fa",
    cardBg: isDark ? "#161b22" : "#ffffff",
    text: isDark ? "#e6edf3" : "#1f2328",
    border: isDark ? "#30363d" : "#d0d7de",
    inputBg: isDark ? "#0d1117" : "#f0f2f4",
    googleHover: isDark ? "#21262d" : "#f3f4f6",
  };

  /* -----------------------------------------
     HANDLE SIGNUP
  ----------------------------------------- */
  async function handleSignup() {
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (data?.success) {
        navigate("/login");
      } else {
        setError(data?.message || "Signup failed");
      }
    } catch (err) {
      setError("Something went wrong.");
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
            fontSize: "20px",
            marginBottom: 24,
            fontWeight: 600,
            color: theme.text,
          }}
        >
          Create your GreyCat account
        </h2>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              marginBottom: 15,
              padding: "10px",
              borderRadius: 6,
              background: "#ffebe9",
              color: "#cf222e",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* FULL NAME */}
        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

        {/* SIGNUP BUTTON */}
        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 6,
            background: "#238636",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: 15,
            marginBottom: 16,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {/* OR */}
        <div
          style={{
            color: theme.text,
            fontSize: 13,
            margin: "10px 0",
            opacity: 0.7,
          }}
        >
          OR
        </div>

        {/* GOOGLE BUTTON */}
        <button
          onClick={() => (window.location.href = `${BACKEND_URL}/auth/google`)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            borderRadius: 6,
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            fontSize: 15,
            cursor: "pointer",
            transition: "0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = theme.googleHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = theme.cardBg)
          }
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            width="20"
            style={{ filter: isDark ? "invert(1)" : "none" }}
          />
          Continue with Google
        </button>

        {/* GITHUB BUTTON */}
        <button
          onClick={() => (window.location.href = `${BACKEND_URL}/auth/github`)}
          style={{
            width: "100%",
            padding: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            borderRadius: 6,
            background: "#24292f",
            border: "1px solid #1b1f24",
            color: "#ffffff",
            fontSize: 15,
            cursor: "pointer",
            transition: "0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#1f2328")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#24292f")
          }
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
            width="20"
            style={{ filter: "invert(1)" }}
          />
          Continue with GitHub
        </button>

        {/* LOGIN LINK */}
        <p
          style={{
            marginTop: 18,
            fontSize: 14,
            color: theme.text,
          }}
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{
              color: "#2f81f7",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
