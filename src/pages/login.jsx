import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // Backend auto-detection (works locally + Render)
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* ---------------- CHECK AUTH ---------------- */
  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) navigate("/");
      })
      .catch(() => {});
  }, []);

  /* ---------------- OAUTH ---------------- */
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#f6f8fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, sans-serif',
        color: "#1f2328",
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "40px 36px",
          borderRadius: "8px",
          background: "#ffffff",
          border: "1px solid #d0d7de",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            marginBottom: "26px",
            fontWeight: 600,
            color: "#1f2328",
          }}
        >
          Sign in to GreyCat
        </h1>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            borderRadius: "6px",
            background: "#ffffff",
            border: "1px solid #d0d7de",
            color: "#1f2328",
            fontSize: "15px",
            transition: "0.15s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#f3f4f6")}
          onMouseLeave={(e) => (e.target.style.background = "#ffffff")}
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            width="20"
          />
          Continue with Google
        </button>

        {/* GitHub */}
        <button
          onClick={handleGithubLogin}
          style={{
            width: "100%",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            borderRadius: "6px",
            background: "#24292f",
            border: "1px solid #1b1f24",
            color: "#ffffff",
            fontSize: "15px",
            transition: "0.15s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#1f2328")}
          onMouseLeave={(e) => (e.target.style.background = "#24292f")}
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
