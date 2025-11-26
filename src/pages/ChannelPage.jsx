import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";
import io from "socket.io-client";

export default function ChannelPage() {
  const { id } = useParams();

  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef();
  const socketRef = useRef(null);

  // ----------- RESPONSIVE ----------
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 800
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ----------- FETCH ME -----------
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setMe(res.data.user);
    });
  }, []);

  // ----------- LOAD CHANNEL ----------
  const loadChannel = () => {
    API.get(`/channel/${id}`).then((res) => {
      if (res.data.success) {
        const ch = res.data.channel;
        setChannel(ch);

        if (me) {
          const joined = ch.members.some((m) => m._id === me._id);
          setIsMember(joined);
        }
      }
    });
  };

  // ----------- LOAD MESSAGES ----------
  const loadMessages = () => {
    API.get(`/channel/${id}/messages?page=0&limit=100`).then((res) => {
      if (res.data.success) setMessages(res.data.messages);
      scrollToBottom();
    });
  };

  // ----------- INITIAL LOAD ----------
  useEffect(() => {
    if (!id) return;
    if (!me) return; // wait for "me"

    loadChannel();
    loadMessages();
    setLoading(false);
  }, [id, me]);

  // ----------- SOCKET ----------
  useEffect(() => {
    if (!id) return;

    socketRef.current = io(API.defaults.baseURL, { withCredentials: true });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("joinRoom", id);
    });

    socketRef.current.on("new_message", (msg) => {
      if (msg.channel === id || msg.channel?._id === id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    socketRef.current.on("message_deleted", ({ msgId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    });

    socketRef.current.on("reaction_updated", (msg) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    });

    return () => {
      socketRef.current.emit("leaveRoom", id);
      socketRef.current.disconnect();
    };
  }, [id]);

  // ----------- HELPERS ----------
  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const sendMessage = async () => {
    if (!text.trim()) return;
    await API.post(`/channel/${id}/message`, { text });
    setText("");
  };

  const deleteMessage = async (msgId) => {
    if (!window.confirm("Delete message?")) return;
    await API.delete(`/channel/message/${msgId}`);
  };

  const react = async (msgId, emoji) => {
    await API.post(`/channel/message/${msgId}/react`, { emoji });
  };

  const joinChannel = async () => {
    await API.post(`/channel/${id}/join`);
    loadChannel();
  };

  const leaveChannel = async () => {
    await API.post(`/channel/${id}/leave`);
    loadChannel();
  };

  // ----------- DARK THEME PALETTE -----------
  const palette = {
    bgCard: "#000000cc",
    accent: "#00598dff",
    border: "#313643",
    textMain: "#F4F6FB",
    textLight: "#969ba1",
    danger: "#e74c3c",
    surface: "#181A20",
    bgMain: "#0d1117",
  };

  // ----------- LOADING SCREEN (NO LAYOUT YET!) -----------
  if (loading || !channel) {
    return (
      <div
        style={{
          background: palette.bgMain,
          minHeight: "100vh",
          padding: 40,
          fontFamily: "Poppins",
          color: palette.textMain,
        }}
      >
        Loading channel…
      </div>
    );
  }

  // ----------- PAGE UI ----------
  return (
    <DashboardLayout>
      <div
        style={{
          background: palette.bgMain,
          minHeight: "100vh",
          color: palette.textMain,
          paddingTop: 30,
          paddingBottom: 40,
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "2em",
            fontWeight: 700,
            marginBottom: 30,
            color: palette.accent,
          }}
        >
          # {channel.title || channel.name}
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 0 : 24,
          }}
        >
          {/* ------------- CHAT BOX ------------- */}
          <div
            style={{
              flex: 1,
              border: `1px solid ${palette.border}`,
              padding: 12,
              borderRadius: 8,
              background: palette.bgCard,
              display: "flex",
              flexDirection: "column",
              minHeight: 460,
              marginBottom: isMobile ? 26 : 0,
            }}
          >
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 6 }}>
              {messages.map((m) => {
                const photo =
                  m.user?.photo ||
                  "https://ui-avatars.com/api/?name=" + m.user?.username;

                return (
                  <div
                    key={m._id}
                    style={{
                      padding: 10,
                      marginBottom: 10,
                      borderRadius: 8,
                      background: palette.surface,
                      color: palette.textMain,
                    }}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      <img
                        src={photo}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: `2px solid ${palette.accent}`,
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <b style={{ color: palette.accent }}>
                              @{m.user?.username}
                            </b>
                            <small
                              style={{
                                marginLeft: 8,
                                color: palette.textLight,
                              }}
                            >
                              {new Date(m.createdAt).toLocaleTimeString()}
                            </small>
                          </div>

                          {me &&
                            (m.user?._id === me._id ||
                              channel.moderators?.includes(me._id)) && (
                              <button
                                onClick={() => deleteMessage(m._id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: palette.danger,
                                  cursor: "pointer",
                                  fontWeight: 700,
                                }}
                              >
                                Delete
                              </button>
                            )}
                        </div>

                        <div style={{ marginTop: 6 }}>{m.text}</div>

                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            gap: 8,
                          }}
                        >
                          {["👍", "❤️", "🔥", "😮"].map((emoji) => {
                            const count =
                              m.reactions?.filter((r) => r.emoji === emoji)
                                .length || 0;
                            return (
                              <button
                                key={emoji}
                                onClick={() => react(m._id, emoji)}
                                style={{
                                  border: `1px solid ${palette.border}`,
                                  background: palette.bgCard,
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  fontSize: 18,
                                  cursor: "pointer",
                                }}
                              >
                                {emoji} {count > 0 && count}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            {isMember ? (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message #${channel.name}`}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${palette.border}`,
                    background: palette.surface,
                    color: palette.textMain,
                  }}
                />

                <button
                  onClick={sendMessage}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    background: palette.accent,
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                  }}
                >
                  Send
                </button>
              </div>
            ) : (
              <button
                onClick={joinChannel}
                style={{
                  marginTop: 10,
                  padding: "10px",
                  width: "100%",
                  borderRadius: 8,
                  border: `1px solid ${palette.accent}`,
                  background: palette.bgMain,
                  color: palette.textMain,
                  fontWeight: 700,
                }}
              >
                Join Channel to Chat
              </button>
            )}
          </div>

          {/* ------------- SIDEBAR ------------- */}
          <div
            style={{
              width: isMobile ? "100%" : 260,
              position: isMobile ? "static" : "sticky",
              top: 80,
            }}
          >
            <div
              style={{
                padding: 15,
                borderRadius: 8,
                border: `1px solid ${palette.border}`,
                background: palette.bgCard,
              }}
            >
              <h4 style={{ margin: "0 0 10px 0", color: palette.accent }}>
                About
              </h4>

              <p style={{ color: palette.textLight }}>{channel.description}</p>
              <p>
                <b>Members:</b> {channel.members.length}
              </p>

              {isMember ? (
                <button
                  onClick={leaveChannel}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: `1px solid ${palette.danger}`,
                    background: "#301c1c",
                    color: palette.danger,
                    fontWeight: 700,
                    marginTop: 12,
                  }}
                >
                  Leave Channel
                </button>
              ) : (
                <button
                  onClick={joinChannel}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: `1px solid ${palette.accent}`,
                    background: palette.bgMain,
                    color: palette.textMain,
                    fontWeight: 700,
                    marginTop: 12,
                  }}
                >
                  Join Channel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
