import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [checkingAuth, setCheckingAuth] = useState(true);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* -----------------------------------------
     CLEAR STALE QUERY PARAMS
  ----------------------------------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("logout") || params.get("error")) {
      window.history.replaceState({}, "", "/login");
    }
  }, [location.search]);

  /* -----------------------------------------
     VERIFY IF USER IS ALREADY LOGGED IN
  ----------------------------------------- */
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/user`, {
          credentials: "include",
        });

        const data = await res.json();

        // Valid logged-in state
        if (data?.authenticated) {
          navigate("/");
          return;
        }
      } catch (err) {
        console.log("Auth check failed", err);
      }

      setCheckingAuth(false); // allow page to render
    }

    checkAuth();
  }, []);

  /* -----------------------------------------
     LOADER UNTIL AUTH IS VERIFIED
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
     LOGIN HANDLERS
  ----------------------------------------- */
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  /* -----------------------------------------
     THEME (DARK/LIGHT DETECTION)
  ----------------------------------------- */
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = {
    bg: isDark ? "#0d1117" : "#f6f8fa",
    cardBg: isDark ? "#161b22" : "#ffffff",
    text: isDark ? "#e6edf3" : "#1f2328",
    border: isDark ? "#30363d" : "#d0d7de",
    googleHover: isDark ? "#21262d" : "#f3f4f6",
  };

  /* -----------------------------------------
     UI
  ----------------------------------------- */
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

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
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
          onMouseEnter={(e) => (e.currentTarget.style.background = theme.googleHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = theme.cardBg)}
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            width="20"
            style={{
              filter: isDark ? "invert(1)" : "none",
            }}
          />
          Continue with Google
        </button>

        {/* GitHub Button */}
        <button
          onClick={handleGithubLogin}
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
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2328")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#24292f")}
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
            width="20"
            style={{ filter: "invert(1)" }}
          />
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
