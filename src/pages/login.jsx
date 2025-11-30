import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const DEFAULT_PHOTO =
  "https://greycat-backend.onrender.com/default-image.jpg";


export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* -----------------------------------------
     CLEAR QUERY PARAMS (?logout=success)
  ----------------------------------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("logout") || params.get("error")) {
      window.history.replaceState({}, "", "/login");
    }
  }, [location.search]);

  /* -----------------------------------------
     CHECK SESSION → If user already logged in
  ----------------------------------------- */
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/user`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data?.authenticated) {
          const user = data.user;

          // Ensure default photo
          if (!user.photo) user.photo = DEFAULT_PHOTO;

          if (!user.username) {
            return navigate("/set-username");
          }

          return navigate("/");
        }
      } catch (err) {
        console.log("Auth check failed", err);
      }

      setCheckingAuth(false);
    }

    checkAuth();
  }, []);

  /* -----------------------------------------
     SHOW LOADING SCREEN
  ----------------------------------------- */
  if (checkingAuth) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          color: "#8b949e",
          background: "#0d1117",
          fontFamily: "Poppins",
        }}
      >
        Checking login…
      </div>
    );
  }

  /* -----------------------------------------
     HANDLE EMAIL LOGIN
  ----------------------------------------- */
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data?.success) {
        const user = data.user;

        // Apply default fox pic if backend returned empty
        if (!user.photo) user.photo = DEFAULT_PHOTO;

        if (!user.username) {
          return navigate("/set-username");
        } else {
          return navigate("/");
        }
      } else {
        setError(data?.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  /* -----------------------------------------
     THEME (Dark / Light)
  ----------------------------------------- */
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = {
    bg: isDark ? "#0d1117" : "#f6f8fa",
    cardBg: isDark ? "#161b22" : "#ffffff",
    text: isDark ? "#e6edf3" : "#1f2328",
    border: isDark ? "#30363d" : "#d0d7de",
    googleHover: isDark ? "#21262d" : "#f3f4f6",
    inputBg: isDark ? "#0d1117" : "#f0f2f4",
  };

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
        <h1
          style={{
            fontSize: "20px",
            marginBottom: "24px",
            fontWeight: 600,
            color: theme.text,
          }}
        >
          Sign in to GreyCat
        </h1>

        {/* ERROR */}
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

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
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
            outline: "none",
            fontSize: 14,
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
            marginBottom: 6,
            outline: "none",
            fontSize: 14,
          }}
        />

        {/* FORGOT PASSWORD */}
        <div
          style={{
            width: "100%",
            textAlign: "right",
            marginBottom: 16,
          }}
        >
          <span
            onClick={() => navigate("/forgot-password")}
            style={{
              color: "#2f81f7",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Forgot password?
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleEmailLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 6,
            background: "#238636",
            border: "none",
            color: "#ffffff",
            fontSize: 15,
            cursor: "pointer",
            marginBottom: 20,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in…" : "Login"}
        </button>

        {/* GOOGLE LOGIN */}
        <button
          onClick={() =>
            (window.location.href = `${BACKEND_URL}/auth/google`)
          }
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "16px",
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

        {/* GITHUB LOGIN */}
        <button
          onClick={() =>
            (window.location.href = `${BACKEND_URL}/auth/github`)
          }
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

        {/* SIGNUP LINK */}
        <p
          style={{
            marginTop: 18,
            fontSize: 14,
            color: theme.text,
          }}
        >
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={{
              color: "#2f81f7",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
