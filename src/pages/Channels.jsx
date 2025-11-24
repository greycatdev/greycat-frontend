// src/pages/Channels.jsx
import { useEffect, useState } from "react";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

// --- START: Helper for responsive styles based on screen size (simulated media query) ---
const getResponsiveStyles = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  return {
    // For the main wrapper
    mainContainer: {
      maxWidth: 900,
      width: "100%", // Ensure it takes full width
      margin: "0 auto",
      padding: isMobile ? "15px 10px" : "25px 20px", // Less padding on small screens
      color: "#c9d1d9",
      fontFamily: "Poppins",
    },
    // For the two side-by-side inputs
    inputGroup: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row", // Stack on mobile
      gap: 12,
      marginTop: 12,
    },
    // For the individual input fields within the group
    groupInput: { 
        flex: 1, 
        minWidth: isMobile ? "auto" : 0 // Allows inputs to properly stack
    }
  };
};

function useResponsiveStyles() {
  const [styles, setStyles] = useState(getResponsiveStyles());

  useEffect(() => {
    // Only run this hook logic client-side
    if (typeof window === 'undefined') return;

    const handleResize = () => setStyles(getResponsiveStyles());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return styles;
}
// --- END: Helper for responsive styles ---

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const navigate = useNavigate();
  
  const styles = useResponsiveStyles(); // Use responsive styles hook

  const loadChannels = () => {
    API.get("/channel").then((res) => {
      if (res.data.success) setChannels(res.data.channels);
    });
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const createChannel = async () => {
    if (!name.trim()) return alert("Channel name is required");

    if (!/^[a-zA-Z0-9-_]+$/.test(name.trim()))
      return alert("Channel name can only contain letters, numbers, - and _");

    const res = await API.post("/channel/create", {
      name,
      title,
      description: desc,
    });

    if (res.data.success) {
      alert("Channel created successfully!");
      setName("");
      setTitle("");
      setDesc("");
      loadChannels();
    } else {
      alert(res.data.message || "Create failed");
    }
  };

  return (
    <DashboardLayout>
      <div style={styles.mainContainer}>
        {/* PAGE TITLE */}
        <h1
          style={{
            marginBottom: 20,
            fontSize: 28,
            fontWeight: 600,
            color: "#c9d1d9",
          }}
        >
          Channels
        </h1>
        
        {/* --- CREATE CHANNEL --- */}
        <div
          style={{
            padding: 18,
            borderRadius: 10,
            background: "#161b22",
            border: "1px solid #30363d",
            marginBottom: 30,
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              marginBottom: 10,
              color: "#c9d1d9",
            }}
          >
            Create a Channel
          </h3>

          {/* Responsive Input Group */}
          <div style={styles.inputGroup}>
            <input
              placeholder="channel-name (no spaces)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ ...inputStyle, ...styles.groupInput }}
            />

            <input
              placeholder="Title (optional)"
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
              // Removed fixed height: 90 to allow it to be dynamic based on rows
              marginTop: 12,
              resize: "none",
            }}
          />

          <button onClick={createChannel} style={createBtn}>
            Create Channel
          </button>
        </div>

        {/* --- CHANNEL LIST --- */}
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

        <div style={{ display: "grid", gap: 12 }}>
          {channels.map((c) => (
            <div
              key={c._id}
              style={channelCard}
              onClick={() => navigate(`/channel/${c._id}`)}
            >
              <div style={{ flex: 1 }}>
                <div style={channelTitle}>{c.title || c.name}</div>
                <div style={channelDesc}>{c.description}</div>
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

/* ---------------------- GITHUB STYLE INPUTS ---------------------- */

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

/* ---------------------- CHANNEL CARD ---------------------- */

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

/* OPEN BUTTON */
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