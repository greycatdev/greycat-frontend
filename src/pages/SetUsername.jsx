import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SetUsername() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const [userId, setUserId] = useState(null);

  // Auto-detect backend URL
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) return navigate("/login");
        setUserId(data.user._id);
        if (data.user.username) return navigate("/");
      })
      .catch(() => navigate("/login"));
  }, []);

  /* ---------------- VALIDATION ---------------- */
  const validateFormat = (name) => /^[a-zA-Z0-9._]+$/.test(name);

  const checkUsername = async () => {
    if (!validateFormat(username)) {
      alert("Username can contain letters, numbers, . and _ only.");
      return;
    }

    setChecking(true);

    const res = await fetch(
      `${BACKEND_URL}/user/check-username/${username}`
    );
    const data = await res.json();

    setAvailable(!data.exists);
    setChecking(false);
  };

  const saveUsername = async () => {
    const res = await fetch(`${BACKEND_URL}/user/set-username`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, username }),
    });

    const data = await res.json();
    if (data.success) navigate("/");
    else alert(data.message || "Error saving username");
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#0d1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins, sans-serif",
        color: "#c9d1d9",
      }}
    >
      {/* CARD */}
      <div
        style={{
          width: 420,
          background: "#161b22",
          padding: "36px",
          borderRadius: 12,
          border: "1px solid #30363d",
          boxShadow: "0 0 8px rgba(0,0,0,0.4)",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            color: "#f0f6fc",
            marginBottom: 4,
            textAlign: "left",
            fontWeight: 600,
          }}
        >
          Pick your username
        </h1>
        <p
          style={{
            marginTop: 0,
            marginBottom: 24,
            fontSize: 14,
            color: "#8b949e",
          }}
        >
          This will be your unique identity on GreyCat.
        </p>

        <label
          style={{
            fontSize: 14,
            marginBottom: 6,
            display: "block",
            color: "#8b949e",
          }}
        >
          Username
        </label>

        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value.toLowerCase());
            setAvailable(null);
          }}
          placeholder="your_username"
          style={{
            width: "100%",
            height: 44,
            padding: "0 12px",
            borderRadius: 6,
            background: "#0d1117",
            border:
              available === null
                ? "1px solid #30363d"
                : available
                ? "1px solid #2ea043"
                : "1px solid #f85149",
            color: "#c9d1d9",
            outline: "none",
            fontSize: 15,
            transition: "0.15s",
          }}
        />

        {checking && (
          <p style={{ color: "#8b949e", marginTop: 8 }}>Checking...</p>
        )}

        {available === true && (
          <p style={{ color: "#2ea043", marginTop: 8, fontSize: 14 }}>
            ✔ Username is available
          </p>
        )}

        {available === false && (
          <p style={{ color: "#f85149", marginTop: 8, fontSize: 14 }}>
            ✖ Username is taken
          </p>
        )}

        <button
          onClick={checkUsername}
          style={{
            width: "100%",
            height: 44,
            marginTop: 16,
            borderRadius: 6,
            background: "#21262d",
            border: "1px solid #30363d",
            color: "#c9d1d9",
            fontSize: 15,
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          Check availability
        </button>

        <button
          disabled={!available}
          onClick={saveUsername}
          style={{
            width: "100%",
            height: 44,
            marginTop: 14,
            borderRadius: 6,
            background: available ? "#238636" : "#1f6a31",
            opacity: available ? 1 : 0.5,
            border: "1px solid #2ea043",
            color: "white",
            cursor: available ? "pointer" : "not-allowed",
            fontSize: 15,
            fontWeight: 500,
            transition: "0.2s",
          }}
        >
          Save username
        </button>
      </div>
    </div>
  );
}
