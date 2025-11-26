// src/pages/EventPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";

/* --------------------------------------------------
   Responsive helper
-------------------------------------------------- */
const getStyles = () => {
  const isMobile = window.innerWidth <= 600;

  return {
    container: {
      maxWidth: 900,
      margin: "0 auto",
      padding: isMobile ? "12px" : "20px",
      fontFamily: "Poppins",
      color: "#c9d1d9",
    },

    banner: {
      position: "relative",
      height: isMobile ? 180 : 240,
      overflow: "hidden",
      borderRadius: "12px 12px 0 0",
    },

    hostActionsRow: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 12,
      marginBottom: 20,
      alignItems: isMobile ? "flex-start" : "center",
    },

    actionButtons: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginLeft: isMobile ? 0 : "auto",
      width: isMobile ? "100%" : "auto",
    },

    actionBtn: {
      padding: "7px 12px",
      borderRadius: 6,
      border: "1px solid #30363d",
      background: "#161b22",
      color: "#c9d1d9",
      cursor: "pointer",
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      gap: 6,
      flex: isMobile ? 1 : 0,
    },

    joinBtn: {
      marginTop: 20,
      padding: "12px 14px",
      borderRadius: 8,
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
      width: "100%",
    },
  };
};

function useResponsive() {
  const [styles, setStyles] = useState(getStyles());

  useEffect(() => {
    const handle = () => setStyles(getStyles());
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return styles;
}

/* --------------------------------------------------
   PAGE COMPONENT
-------------------------------------------------- */

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const styles = useResponsive();

  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [countdown, setCountdown] = useState(null);

  /* ---------------- Load Event + User ---------------- */
  useEffect(() => {
    API.get(`/event/${id}`).then((res) => {
      if (res.data.success) setEvent(res.data.event);
    });

    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setUser(res.data.user);
    });
  }, [id]);

  /* ---------------- Countdown ---------------- */
  useEffect(() => {
    if (!event?.date) return;

    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(event.date);

      const diff = target - now;

      if (diff <= 0) {
        setCountdown({ text: "Event started", live: false });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);

      let label = `${d}d ${h}h ${m}m`;
      if (d === 0) label = `${h}h ${m}m`;
      if (h === 0 && d === 0) label = `${m}m`;

      setCountdown({
        text: "Starts in " + label,
        live: diff <= 1000 * 60 * 60 * 2, // <2 hours
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [event?.date]);

  if (!event)
    return (
      <DashboardLayout>
        <div style={{ padding: 40, color: "white" }}>Loading event…</div>
      </DashboardLayout>
    );

  /* ---------------- Utilities ---------------- */
  const isHost = user && event.host._id === user._id;
  const isJoined = user && event.attendees.some((a) => a._id === user._id);

  const shareUrl = `${window.location.origin}/event/${id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopyMsg("Copied!");
    setTimeout(() => setCopyMsg(""), 2000);
  };

  const joinEvent = async () => {
    await API.post(`/event/${id}/join`);
    const res = await API.get(`/event/${id}`);
    setEvent(res.data.event);
  };

  const deleteEvent = async () => {
    if (!confirm("Delete this event?")) return;
    await API.delete(`/event/${id}`);
    navigate("/events");
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    await API.post(`/event/${id}/comment`, { text: comment });
    const res = await API.get(`/event/${id}`);
    setEvent(res.data.event);
    setComment("");
  };

  /* --------------------------------------------------
     RENDER UI
  -------------------------------------------------- */
  return (
    <DashboardLayout>
      <div style={styles.container}>
        <div
          style={{
            background: "#0d1117",
            borderRadius: 12,
            border: "1px solid #30363d",
            overflow: "hidden",
          }}
        >
          {/* BANNER */}
          <div style={styles.banner}>
            <img
              src={
                event.bannerImage ||
                "https://via.placeholder.com/1200x400/0d1117/ffffff?text=Event+Banner"
              }
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(0.85)",
              }}
            />

            {/* Type + Date */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 16,
                display: "flex",
                gap: 8,
              }}
            >
              <span style={pill}>{event.type.toUpperCase()}</span>
              <span style={pill}>
                {new Date(event.date).toLocaleDateString()}
              </span>
            </div>

            {/* Countdown */}
            {countdown && (
              <div
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 14,
                  background: countdown.live ? "#238636" : "#161b22",
                  border: "1px solid #30363d",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 13,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {countdown.live && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      background: "red",
                      borderRadius: "50%",
                      boxShadow: "0 0 6px red",
                    }}
                  />
                )}
                {countdown.text}
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div style={{ padding: 20 }}>
            {/* HOST + ACTIONS */}
            <div style={styles.hostActionsRow}>
              {/* Host */}
              <div
                onClick={() => navigate(`/${event.host.username}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <img
                  src={event.host.photo}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    border: "1px solid #30363d",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, color: "#8b949e" }}>Hosted by</div>
                  <div style={{ fontSize: 15 }}>@{event.host.username}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={styles.actionButtons}>
                <button style={styles.actionBtn} onClick={copyLink}>
                  🔗 Copy Link
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.actionBtn}
                >
                  🟢 WhatsApp
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.actionBtn}
                >
                  ✖ X
                </a>

                {isHost && (
                  <button
                    onClick={deleteEvent}
                    style={{
                      ...styles.actionBtn,
                      border: "1px solid #f85149",
                      color: "#f85149",
                      background: "#1b1516",
                    }}
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>

            {copyMsg && (
              <small style={{ color: "#8b949e", marginTop: -10 }}>
                {copyMsg}
              </small>
            )}

            {/* STATS */}
            <div
              style={{
                marginTop: 18,
                padding: "12px 14px",
                border: "1px solid #30363d",
                borderRadius: 8,
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              <Stat label="Date & Time" value={new Date(event.date).toLocaleString()} />
              <Stat label="Location" value={event.location} />
              <Stat label="Type" value={event.type.toUpperCase()} />
              <Stat label="Attendees" value={event.attendees.length} />
            </div>

            {/* DESCRIPTION */}
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 17, marginBottom: 8 }}>Event Description</h3>
              <p style={{ fontSize: 14, color: "#b3b3b3", lineHeight: 1.5 }}>
                {event.description}
              </p>
            </div>

            {/* JOIN BUTTON */}
            {user && (
              <button
                onClick={joinEvent}
                style={{
                  ...styles.joinBtn,
                  background: isJoined ? "#1b1516" : "#238636",
                  border: isJoined
                    ? "1px solid #f85149"
                    : "1px solid #2ea043",
                }}
              >
                {isJoined ? "Leave Event" : "Join Event"}
              </button>
            )}

            {/* ATTENDEES */}
            <h3 style={{ marginTop: 20 }}>
              Attendees ({event.attendees.length})
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {event.attendees.map((a) => (
                <img
                  key={a._id}
                  src={a.photo}
                  title={a.username}
                  onClick={() => navigate(`/${a.username}`)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "1px solid #30363d",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            {/* COMMENTS */}
            <h3 style={{ marginTop: 24 }}>
              Comments ({event.comments.length})
            </h3>

            <div style={{ marginTop: 10 }}>
              {event.comments.map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: 10,
                    borderRadius: 8,
                    background: "#161b22",
                    border: "1px solid #30363d",
                    marginBottom: 8,
                  }}
                >
                  <img
                    src={c.user.photo}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      border: "1px solid #30363d",
                      objectFit: "cover",
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#c9d1d9",
                        marginBottom: 3,
                      }}
                    >
                      @{c.user.username} ·{" "}
                      <span style={{ color: "#8b949e" }}>
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: 14, color: "#b3b3b3" }}>
                      {c.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {user && (
              <>
                <textarea
                  rows={3}
                  placeholder="Write a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #30363d",
                    background: "#0d1117",
                    color: "#c9d1d9",
                  }}
                ></textarea>

                <button
                  onClick={postComment}
                  style={{
                    marginTop: 10,
                    padding: "10px 16px",
                    background: "#238636",
                    border: "1px solid #2ea043",
                    color: "white",
                    fontSize: 15,
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Post Comment
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* --------------------------------------------------
   STAT COMPONENT
-------------------------------------------------- */
function Stat({ label, value }) {
  return (
    <div style={{ flex: "1 1 45%", minWidth: "45%" }}>
      <div style={{ fontSize: 12, color: "#8b949e" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#c9d1d9" }}>{value}</div>
    </div>
  );
}

/* --------------------------------------------------
   Small Pill Styling
-------------------------------------------------- */
const pill = {
  padding: "4px 10px",
  borderRadius: 20,
  border: "1px solid #30363d",
  background: "rgba(13,17,23,0.8)",
  fontSize: 12,
  color: "#c9d1d9",
};
