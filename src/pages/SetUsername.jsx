import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SetUsername() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const [userId, setUserId] = useState(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* ---------------------------
      CLEAR QUERY PARAMETERS
  ---------------------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("logout") || params.get("error")) {
      window.history.replaceState({}, "", "/set-username");
    }
  }, [location.search]);

  /* ---------------------------
      AUTH CHECK + FETCH USER
  ---------------------------- */
  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) return navigate("/login");

        setUserId(data.user._id);

        if (data.user.username) {
          navigate("/");
        }
      })
      .catch(() => navigate("/login"));
  }, []);

  /* ---------------------------
      VALIDATION RULE
  ---------------------------- */
  const validateFormat = (name) => /^[a-zA-Z0-9._]+$/.test(name);

  /* ---------------------------
      CHECK USERNAME AVAILABILITY
  ---------------------------- */
  const checkUsername = async () => {
    const trimmed = username.trim().toLowerCase();

    if (!trimmed) return alert("Username cannot be empty.");

    if (!validateFormat(trimmed)) {
      alert(
        "Usernames can contain letters, numbers, dot (.) and underscore (_) only."
      );
      return;
    }

    setChecking(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/user/check-username/${trimmed}`
      );
      const data = await res.json();
      setAvailable(!data.exists);
    } catch {
      alert("Error checking username.");
    }

    setChecking(false);
  };

  /* ---------------------------
      SAVE USERNAME
  ---------------------------- */
  const saveUsername = async () => {
    if (!available || !userId) return;

    const trimmed = username.trim().toLowerCase();

    const res = await fetch(`${BACKEND_URL}/user/set-username`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, username: trimmed }),
    });

    const data = await res.json();

    if (data.success) navigate("/");
    else alert(data.message || "Error saving username");
  };

  /* ---------------------------
      UI
  ---------------------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#0d1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily: "Poppins, sans-serif",
        color: "#c9d1d9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#161b22",
          padding: "32px",
          borderRadius: 12,
          border: "1px solid #30363d",
          boxShadow: "0 0 12px rgba(0,0,0,0.35)",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            color: "#f0f6fc",
            marginBottom: 6,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Pick your username
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: 20,
            fontSize: 14,
            color: "#8b949e",
            textAlign: "center",
          }}
        >
          This will be your unique identity on GreyCat.
        </p>

        {/* LABEL */}
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

        {/* INPUT */}
        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value.toLowerCase());
            setAvailable(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") checkUsername();
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

        {/* CHECKING INDICATOR */}
        {checking && (
          <p style={{ color: "#8b949e", marginTop: 8 }}>Checking...</p>
        )}

        {/* SUCCESS */}
        {available === true && (
          <p
            style={{
              color: "#2ea043",
              marginTop: 8,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ✔ Username is available
          </p>
        )}

        {/* ERROR */}
        {available === false && (
          <p
            style={{
              color: "#f85149",
              marginTop: 8,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ✖ Username is taken
          </p>
        )}

        {/* CHECK BUTTON */}
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

        {/* SAVE BUTTON */}
        <button
          disabled={!available}
          onClick={saveUsername}
          style={{
            width: "100%",
            height: 44,
            marginTop: 14,
            borderRadius: 6,
            background: available ? "#238636" : "#1b4426",
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
