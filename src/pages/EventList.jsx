// frontend/src/pages/EventList.jsx
import { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

export default function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD EVENTS ---------------- */
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await API.get("/event");
        if (res.data.success) {
          setEvents(res.data.events);
        }
      } catch (err) {
        console.error("Failed to load events");
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  /* ---------------- LOADING PAGE (NO LAYOUT YET!) ---------------- */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d1117",
          color: "#c9d1d9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontFamily: "Poppins",
        }}
      >
        Loading events…
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div style={wrapper}>
        {/* HEADER */}
        <div style={headerRow}>
          <h2 style={title}>Upcoming Events</h2>

          <button onClick={() => navigate("/event/create")} style={createBtn}>
            + Create Event
          </button>
        </div>

        {/* EVENT GRID */}
        <div style={grid}>
          {events.length === 0 && (
            <p style={{ color: "#8b949e", fontSize: 16 }}>No events yet…</p>
          )}

          {events.map((ev) => (
            <div
              key={ev._id}
              onClick={() => navigate(`/event/${ev._id}`)}
              style={eventCard}
              className="event-card"
            >
              {/* EVENT BANNER */}
              <div style={bannerBox}>
                <img
                  src={
                    ev.bannerImage ||
                    "https://via.placeholder.com/800x300/0d1117/ffffff?text=Event+Banner"
                  }
                  alt="Event banner"
                  style={bannerImage}
                />
              </div>

              {/* CONTENT */}
              <div style={cardContent}>
                <h3 style={eventTitle}>{ev.title}</h3>

                <p style={detailText}>📅 {new Date(ev.date).toLocaleString()}</p>
                <p style={detailText}>📍 {ev.location}</p>

                {/* TYPE LABEL */}
                <span
                  style={{
                    ...chip,
                    background:
                      ev.type === "online"
                        ? "rgba(88,166,255,0.12)"
                        : "rgba(35,197,94,0.12)",
                    border:
                      ev.type === "online"
                        ? "1px solid rgba(88,166,255,0.4)"
                        : "1px solid rgba(35,197,94,0.4)",
                    color: ev.type === "online" ? "#58a6ff" : "#2ea043",
                  }}
                >
                  {ev.type.toUpperCase()}
                </span>

                {/* HOST */}
                <div style={hostRow}>
                  <img
                    src={
                      ev.host?.photo ||
                      "https://ui-avatars.com/api/?background=333&color=fff&name=" +
                        ev.host?.username
                    }
                    alt="host"
                    style={hostAvatar}
                  />
                  <span style={hostName}>@{ev.host?.username}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOVER ANIMATION */}
      <style>{`
        .event-card:hover {
          transform: translateY(-6px);
          border-color: #58a6ff;
          box-shadow: 0 0 18px rgba(88,166,255,0.25);
        }
      `}</style>
    </DashboardLayout>
  );
}

/* -----------------------------------------------------
   STYLES — GitHub Dark UI
----------------------------------------------------- */

const wrapper = {
  maxWidth: 1050,
  margin: "0 auto",
  padding: "10px 12px 60px",
  fontFamily: "Poppins",
  color: "#c9d1d9",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 25,
};

const title = {
  margin: 0,
  fontSize: 30,
  fontWeight: 600,
  background: "linear-gradient(90deg, #58a6ff, #ff7b72)",
  WebkitBackgroundClip: "text",
  color: "transparent",
};

const createBtn = {
  padding: "10px 20px",
  background: "#238636",
  border: "1px solid #2ea043",
  color: "#fff",
  borderRadius: 8,
  fontSize: 15,
  cursor: "pointer",
  transition: "0.2s",
  fontWeight: 600,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: 28,
};

const eventCard = {
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: 14,
  cursor: "pointer",
  transition: "0.25s",
  boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
  overflow: "hidden",
};

const bannerBox = {
  width: "100%",
  height: 160,
  overflow: "hidden",
  borderBottom: "1px solid #30363d",
};

const bannerImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const cardContent = {
  padding: "16px 16px 20px",
};

const eventTitle = {
  margin: "0 0 10px",
  fontSize: 20,
  fontWeight: 600,
  color: "#f0f6fc",
};

const detailText = {
  margin: "0 0 8px",
  color: "#8b949e",
  fontSize: 14,
};

const chip = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  marginTop: 8,
  marginBottom: 12,
};

const hostRow = {
  marginTop: 6,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const hostAvatar = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  objectFit: "cover",
  border: "1px solid #30363d",
};

const hostName = {
  fontSize: 14,
  fontWeight: 600,
  color: "#58a6ff",
};
