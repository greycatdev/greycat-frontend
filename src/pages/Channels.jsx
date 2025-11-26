// src/pages/Channels.jsx
import { useEffect, useState } from "react";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

/* ---------------------- RESPONSIVE SYSTEM ---------------------- */
const getResponsiveStyles = () => {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;

  return {
    mainContainer: {
      maxWidth: 900,
      width: "100%",
      margin: "0 auto",
      padding: isMobile ? "15px 10px" : "25px 20px",
      color: "#c9d1d9",
      fontFamily: "Poppins",
    },

    inputGroup: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 12,
      marginTop: 12,
    },

    groupInput: {
      flex: 1,
      minWidth: isMobile ? "100%" : 0,
    },
  };
};

function useResponsiveStyles() {
  const [styles, setStyles] = useState(getResponsiveStyles());

  useEffect(() => {
    const handler = () => setStyles(getResponsiveStyles());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return styles;
}

/* ------------------------------------------------------------- */
/*                           PAGE                                 */
/* ------------------------------------------------------------- */

export default function Channels() {
  const navigate = useNavigate();
  const styles = useResponsiveStyles();

  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------- LOAD CHANNELS (FIXED setLoading logic) ---------- */
  const loadChannels = async () => {
    try {
      const res = await API.get("/channel");
      if (res.data.success) {
        setChannels(res.data.channels);
      }
    } catch (err) {
      console.error("Failed to load channels", err);
      // Optional: alert or show error on screen
    } finally {
      // FIX: Set loading to false regardless of success/failure
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  /* ---------- CLEAN SANITIZATION (Allow spaces) ---------- */
  const cleanChannelName = (raw) => {
    // Note: The server-side check in channelRoutes.js enforces /^[a-z0-9-_]+$/
    return raw
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // spaces → hyphens
      .replace(/[^a-z0-9-_]/g, ""); // only allow a-z, 0-9, - _
  };

  /* ---------- CREATE CHANNEL ---------- */
  const createChannel = async () => {
    if (!name.trim()) return alert("Channel name is required");

    const sanitizedName = cleanChannelName(name);

    // This client-side check is good to prevent unnecessary server calls
    if (!sanitizedName)
      return alert("Channel name must contain letters/numbers");

    try {
      const res = await API.post("/channel/create", {
        name: sanitizedName,
        title: title.trim() || sanitizedName,
        description: desc.trim(),
      });

      if (res.data.success) {
        alert("Channel created successfully!");
        setName("");
        setTitle("");
        setDesc("");
        loadChannels();
      } else {
        alert(res.data.message || "Failed to create channel");
      }
    } catch (err) {
      console.error("Create channel failed:", err);
      alert("An error occurred during channel creation.");
    }
  };

  /* ---------- CLEAN LOADING SCREEN ---------- */
  if (loading) {
    return (
      <DashboardLayout>
        <div
          style={{
            padding: 40,
            color: "#c9d1d9",
            background: "#0d1117",
            minHeight: "100vh",
            fontFamily: "Poppins",
          }}
        >
          Loading channels…
        </div>
      </DashboardLayout>
    );
  }

  /* -------------------------------------------------------- */
  /*                           UI                               */
  /* -------------------------------------------------------- */

  return (
    <DashboardLayout>
      <div style={styles.mainContainer}>
        <h1
          style={{
            marginBottom: 20,
            fontSize: 28,
            fontWeight: 700,
            color: "#c9d1d9",
          }}
        >
          Channels
        </h1>

        {/* ---------------- CREATE CHANNEL ---------------- */}
        <div
          style={{
            padding: 18,
            borderRadius: 12,
            background: "#161b22",
            border: "1px solid #30363d",
            marginBottom: 30,
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            transition: "0.2s ease",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              marginBottom: 10,
              color: "#c9d1d9",
              fontWeight: 600,
            }}
          >
            Create a New Channel
          </h3>

          <div style={styles.inputGroup}>
            <input
              placeholder="Channel name (spaces allowed)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              // Added onKeyDown for Enter key submission
              onKeyDown={(e) => e.key === "Enter" && createChannel()}
              style={{ ...inputStyle, ...styles.groupInput }}
            />

            <input
              placeholder="Channel Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ ...inputStyle, ...styles.groupInput }}
            />
          </div>

          <textarea
            placeholder="Channel description..."
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{
              ...inputStyle,
              width: "100%",
              marginTop: 12,
              resize: "none",
            }}
          />

          <button onClick={createChannel} style={createBtn}>
            Create Channel
          </button>

          {name.trim() !== "" && (
            <p style={{ marginTop: 8, color: "#8b949e", fontSize: 14 }}>
              Final URL-safe name:{" "}
              <span style={{ color: "#58a6ff" }}>
                {cleanChannelName(name)}
              </span>
            </p>
          )}
        </div>

        {/* ---------------- CHANNEL LIST ---------------- */}
        <h3
          style={{
            marginBottom: 15,
            fontSize: 20,
            fontWeight: 600,
            color: "#c9d1d9",
          }}
        >
          Available Channels
        </h3>

        {channels.length === 0 && (
          <p style={{ color: "#8b949e" }}>No channels created yet.</p>
        )}

        <div style={{ display: "grid", gap: 14 }}>
          {channels.map((c) => (
            <div
              key={c._id}
              style={channelCard}
              onClick={() => navigate(`/channel/${c._id}`)}
            >
              <div style={{ flex: 1 }}>
                <div style={channelTitle}># {c.title || c.name}</div>
                <div style={channelDesc}>{c.description}</div>
                <div style={{ color: "#8b949e", fontSize: 12, marginTop: 4 }}>
                  Members: {c.members?.length || 0}
                </div>
              </div>

              <button
                style={openBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/channel/${c._id}`);
                }}
              >
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ---------------------- STYLES ---------------------- */

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 6,
  background: "#0d1117",
  border: "1px solid #30363d",
  color: "#c9d1d9",
  fontSize: 15,
  outline: "none",
};

const createBtn = {
  width: "100%",
  marginTop: 14,
  padding: "12px",
  borderRadius: 6,
  background: "#238636",
  border: "1px solid #2ea043",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 16,
  transition: "0.2s",
};

const channelCard = {
  padding: 16,
  borderRadius: 10,
  background: "#161b22",
  border: "1px solid #30363d",
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  transition: "0.2s",
};

const channelTitle = {
  color: "#c9d1d9",
  fontWeight: 600,
  fontSize: 17,
};

const channelDesc = {
  color: "#8b949e",
  fontSize: 14,
  marginTop: 4,
};

const openBtn = {
  padding: "6px 14px",
  borderRadius: 6,
  background: "#21262d",
  color: "#58a6ff",
  border: "1px solid #30363d",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: 14,
  transition: "0.2s",
};