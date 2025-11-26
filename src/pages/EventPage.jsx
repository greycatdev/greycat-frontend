// src/pages/EventPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";

// --- START: Helper for responsive styles based on screen size (simulated media query) ---
const getResponsiveStyles = () => {
  const isMobile = window.innerWidth <= 600;

  return {
    // For the main wrapper
    mainContainer: {
      maxWidth: 900,
      width: "100%", // Use full width on mobile
      margin: "0 auto",
      padding: isMobile ? "10px" : "20px", // Less padding on small screens
      fontFamily: "Poppins, system-ui, sans-serif",
      color: "#c9d1d9",
    },
    // For the Banner Section
    bannerContainer: {
      position: "relative",
      height: isMobile ? 180 : 220, // Reduced height for mobile
      overflow: "hidden",
    },
    // For the Host and Actions Section (To force stacking on mobile)
    hostActions: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row", // Stack on mobile
      alignItems: isMobile ? "flex-start" : "center", // Align to start on mobile
      gap: 14,
      marginBottom: 18,
    },
    // For the right-side action buttons (Share/Delete)
    actionButtons: {
      marginLeft: isMobile ? "0" : "auto", // Remove auto margin on mobile
      marginTop: isMobile ? "10px" : "0", // Add top margin on mobile
      width: isMobile ? "100%" : "auto", // Take full width on mobile
      display: "flex",
      flexWrap: "wrap", // Allow buttons to wrap
      gap: 10,
    },
    // For individual action buttons
    actionButtonBase: {
      flexGrow: isMobile ? 1 : 0, // Stretch buttons horizontally on mobile
      justifyContent: "center", // Center text in stretched buttons
      padding: "6px 10px",
      borderRadius: 6,
      border: "1px solid #30363d",
      background: "#161b22",
      color: "#c9d1d9",
      fontSize: 13,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      textDecoration: "none",
    },
    // For the Join/Leave button
    joinLeaveButton: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 15,
      cursor: "pointer",
      marginBottom: 24,
    },
  };
};

function useResponsiveStyles() {
  const [styles, setStyles] = useState(getResponsiveStyles());

  useEffect(() => {
    const handleResize = () => setStyles(getResponsiveStyles());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return styles;
}
// --- END: Helper for responsive styles ---

export default function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");

  const styles = useResponsiveStyles(); // Use responsive styles hook

  /* ---------------- LOAD EVENT + USER ---------------- */
  const loadEvent = () => {
    API.get(`/event/${id}`).then((res) => {
      if (res.data.success) setEvent(res.data.event);
    });
  };

  const loadUser = () => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setUser(res.data.user);
    });
  };

  useEffect(() => {
    loadEvent();
    loadUser();
  }, [id]);

  /* ---------------- COUNTDOWN ---------------- */
  useEffect(() => {
    if (!event?.date) return;

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(event.date);
      const diffMs = target - now;

      if (diffMs <= 0) {
        setCountdown({
          label: "Event started / finished",
          isLive: false,
        });
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);

      let label = "";
      if (days > 0) label = `${days}d ${hours}h ${mins}m`;
      else if (hours > 0) label = `${hours}h ${mins}m`;
      else label = `${mins}m`;

      setCountdown({
        label: `Starts in ${label}`,
        isLive: diffMs <= 2 * 60 * 60 * 1000, // within 2 hours
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // 1 min
    return () => clearInterval(timer);
  }, [event?.date]);

  if (!event) return <DashboardLayout>Loading...</DashboardLayout>;

  const isJoined = user && event.attendees.some((a) => a._id === user._id);
  const isHost = user && user._id === event.host._id;

  /* ---------------- JOIN / LEAVE ---------------- */
  const joinEvent = () => {
    API.post(`/event/${id}/join`).then(() => loadEvent());
  };

  /* ---------------- DELETE (HOST) ---------------- */
  const deleteEvent = () => {
    if (!window.confirm("Delete this event?")) return;

    API.delete(`/event/${id}`).then((res) => {
      if (res.data.success) {
        alert("Event deleted");
        navigate("/events");
      }
    });
  };

  /* ---------------- COMMENTS ---------------- */
  const submitComment = () => {
    if (!commentText.trim()) return;
    API.post(`/event/${id}/comment`, { text: commentText }).then((res) => {
      if (res.data.success) {
        setCommentText("");
        loadEvent();
      }
    });
  };

  const comments = event.comments || [];

  /* ---------------- SHARE ---------------- */
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/event/${id}`
      : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Link copied!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    `Join this event: ${event.title} - ${shareUrl}`
  )}`;

  const xLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Join this event: ${event.title} - ${shareUrl}`
  )}`;

  /* ---------------- TIME FORMAT ---------------- */
  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString();
  };

  /* ---------------- UI ---------------- */
  return (
    <DashboardLayout>
      <div style={styles.mainContainer}>
        {/* CARD WRAPPER */}
        <div
          style={{
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(1,4,9,0.5)",
          }}
        >
          {/* BANNER (Feature A) */}
          <div style={styles.bannerContainer}>
            {event.bannerImage ? (
              <img
                src={event.bannerImage}
                alt="Event banner"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.85)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at top, #1f6feb 0, #0d1117 55%)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "16px 20px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#8b949e",
                      marginBottom: 4,
                    }}
                  >
                    Event
                  </div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 26,
                      color: "#f0f6fc",
                      textShadow: "0 2px 4px rgba(0,0,0,0.45)",
                    }}
                  >
                    {event.title}
                  </h1>
                </div>
              </div>
            )}

            {/* GRADIENT OVERLAY */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(13,17,23,0.7), transparent 40%)",
              }}
            />

            {/* TOP LEFT: TYPE + DATE */}
            <div
              style={{
                position: "absolute",
                left: 18,
                top: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid #30363d",
                  background: "rgba(13,17,23,0.85)",
                  color: "#c9d1d9",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {event.type === "online" ? "Online" : "In-person"}
              </span>
              <span
                style={{
                  fontSize: 13,
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid #30363d",
                  background: "rgba(13,17,23,0.85)",
                  color: "#8b949e",
                }}
              >
                {new Date(event.date).toLocaleDateString()}
              </span>
            </div>

            {/* BOTTOM RIGHT: COUNTDOWN (Feature B) */}
            {countdown && (
              <div
                style={{
                  position: "absolute",
                  right: 18,
                  // Changed from top: 14 to bottom: 14
                  bottom: 14, 
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid #30363d",
                  background: countdown.isLive ? "#238636" : "#161b22",
                  color: countdown.isLive ? "#f0f6fc" : "#c9d1d9",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {countdown.isLive && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ff7b72",
                      boxShadow: "0 0 6px #ff7b72",
                    }}
                  />
                )}
                {countdown.label}
              </div>
            )}
          </div>

          {/* CONTENT AREA */}
          <div style={{ padding: "18px 20px 22px 20px" }}>
            {/* HOST + ACTIONS */}
            <div style={styles.hostActions}>
              <div
                onClick={() => navigate(`/${event.host.username}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <img
                  src={event.host.photo || "/default-avatar.png"}
                  alt={event.host.username}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #30363d",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#8b949e",
                      marginBottom: 2,
                    }}
                  >
                    Hosted by
                  </div>
                  <div style={{ fontSize: 15, color: "#c9d1d9" }}>
                    @{event.host.username}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (Share/Delete) */}
              <div style={styles.actionButtons}>
                {/* Share (Feature F) */}
                <button
                  onClick={copyLink}
                  style={styles.actionButtonBase}
                >
                  <span>🔗</span> Copy link
                </button>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.actionButtonBase}
                >
                  🟢 WhatsApp
                </a>

                <a
                  href={xLink}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.actionButtonBase}
                >
                  ✖ X
                </a>

                {isHost && (
                  <button
                    onClick={deleteEvent}
                    style={{
                      ...styles.actionButtonBase,
                      border: "1px solid #f85149",
                      background: "#1b1516",
                      color: "#f85149",
                      flexGrow: styles.actionButtonBase.flexGrow, // Inherit flexGrow for mobile
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {copyStatus && (
              <p style={{ fontSize: 12, color: "#8b949e", marginTop: -6 }}>
                {copyStatus}
              </p>
            )}

            {/* STATS BAR (Feature E) */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #30363d",
                background: "#0d1117",
                marginBottom: 18,
              }}
            >
              <StatBlock label="Date & time" value={formatTime(event.date)} />
              <StatBlock label="Location" value={event.location} />
              <StatBlock
                label="Type"
                value={event.type === "online" ? "Online" : "In-person"}
              />
              <StatBlock
                label="Attendees"
                value={`${event.attendees.length}`}
              />
            </div>

            {/* DESCRIPTION */}
            <div style={{ marginBottom: 22 }}>
              <h3
                style={{
                  fontSize: 16,
                  marginBottom: 8,
                  color: "#c9d1d9",
                }}
              >
                About this event
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#b3b3b3",
                  whiteSpace: "pre-line",
                }}
              >
                {event.description}
              </p>
            </div>

            {/* JOIN / LEAVE BUTTON */}
            {user && (
              <button
                onClick={joinEvent}
                style={{
                  ...styles.joinLeaveButton,
                  border: isJoined ? "1px solid #f85149" : "1px solid #2ea043",
                  background: isJoined ? "#1b1516" : "#238636",
                  color: "#ffffff",
                }}
              >
                {isJoined ? "Leave event" : "Join event"}
              </button>
            )}

            {/* MUTUAL / ATTENDEES (Feature C-ish) */}
            <div style={{ marginBottom: 22 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    fontSize: 15,
                    margin: 0,
                    color: "#c9d1d9",
                  }}
                >
                  Attendees ({event.attendees.length})
                </h3>
                {isJoined && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: "#8b949e",
                    }}
                  >
                    You’re going
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {event.attendees.slice(0, 12).map((a) => (
                  <div
                    key={a._id}
                    onClick={() => navigate(`/${a.username}`)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "1px solid #30363d",
                    }}
                    title={`@${a.username}`}
                  >
                    <img
                      src={a.photo || "/default-avatar.png"}
                      alt={a.username}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
                {event.attendees.length > 12 && (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: "1px solid #30363d",
                      background: "#161b22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#8b949e",
                    }}
                  >
                    +{event.attendees.length - 12}
                  </div>
                )}
              </div>
            </div>

            {/* COMMENTS (Feature D) */}
            <div>
              <h3
                style={{
                  fontSize: 15,
                  marginBottom: 10,
                  color: "#c9d1d9",
                }}
              >
                Comments ({comments.length})
              </h3>

              {/* List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                {comments.length === 0 && (
                  <p
                    style={{
                      fontSize: 14,
                      color: "#8b949e",
                    }}
                  >
                    No comments yet. Be the first to ask something.
                  </p>
                )}

                {comments.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #30363d",
                      background: "#0d1117",
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <img
                      src={c.user?.photo || "/default-avatar.png"}
                      alt={c.user?.username}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #30363d",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 2,
                        }}
                      >
                        <span
                          onClick={() => navigate(`/${c.user?.username || ""}`)}
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#c9d1d9",
                            cursor: "pointer",
                          }}
                        >
                          @{c.user?.username}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#8b949e",
                          }}
                        >
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#b3b3b3",
                        }}
                      >
                        {c.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              {user && (
                <div>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ask something or share your thoughts…"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #30363d",
                      background: "#0d1117",
                      color: "#c9d1d9",
                      fontSize: 14,
                      resize: "vertical",
                      marginBottom: 8,
                    }}
                  />
                  <button
                    onClick={submitComment}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 6,
                      border: "1px solid #2ea043",
                      background: "#238636",
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Post comment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* Small stat block component for the stats bar */
function StatBlock({ label, value }) {
  return (
    <div style={{ minWidth: 0, flex: "1 1 45%" }}> {/* Added flex property for distribution */}
      <div
        style={{
          fontSize: 12,
          color: "#8b949e",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#c9d1d9",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}