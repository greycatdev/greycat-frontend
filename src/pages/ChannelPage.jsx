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
  const bottomRef = useRef();

  const [isMember, setIsMember] = useState(false);
  const [me, setMe] = useState(null);
  const socketRef = useRef(null);

  // Responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setMe(res.data.user);
    });
  }, []);

  // Load channel
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

  const loadMessages = () => {
    API.get(`/channel/${id}/messages?page=0&limit=100`).then((res) => {
      if (res.data.success) {
        setMessages(res.data.messages);
        scrollToBottom();
      }
    });
  };

  useEffect(() => {
    if (!id) return;
    loadChannel();
    loadMessages();
  }, [id, me]);

  // SOCKET.io
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    socketRef.current.emit("joinRoom", id);

    // RECEIVE NEW MESSAGE
    socketRef.current.on("new_message", (msg) => {
      if (msg.channel === id || msg.channel?._id === id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    });

    // DELETE MESSAGE
    socketRef.current.on("message_deleted", ({ msgId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    });

    // UPDATE REACTIONS
    socketRef.current.on("reaction_updated", (msg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? msg : m))
      );
    });

    return () => {
      socketRef.current.emit("leaveRoom", id);
      socketRef.current.disconnect();
    };
  }, [id]);

  // SCROLL
  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  // SEND MESSAGE (FIXED)
  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await API.post(`/channel/${id}/message`, { text });

    if (res.data.success) {
      // Show message instantly
      setMessages((prev) => [...prev, res.data.message]);
      setText("");
      scrollToBottom();
    }
  };

  // DELETE MESSAGE
  const deleteMessage = async (msgId) => {
    if (!window.confirm("Delete message?")) return;
    await API.delete(`/channel/message/${msgId}`);
  };

  // REACT
  const react = async (msgId, emoji) => {
    await API.post(`/channel/message/${msgId}/react`, { emoji });
  };

  // JOIN CHANNEL
  const joinChannel = async () => {
    await API.post(`/channel/${id}/join`);
    loadChannel();
  };

  const leaveChannel = async () => {
    await API.post(`/channel/${id}/leave`);
    loadChannel();
  };

  // THEME
  const palette = {
    bgMain: "#0d0f12",
    bgCard: "#000000dd",
    surface: "#1a1d24",
    border: "#2f333d",
    textMain: "#f8f9fb",
    textLight: "#a7abb3",
    accent: "#0ea5e9",
    danger: "#ef4444",
  };

  if (!channel)
    return (
      <DashboardLayout>
        <div
          style={{
            background: palette.bgMain,
            height: "100vh",
            padding: 30,
            color: palette.textMain,
          }}
        >
          Loading channel...
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout requireAuth={true}>
      <div
        style={{
          background: palette.bgMain,
          minHeight: "100vh",
          paddingTop: 20,
          paddingBottom: 40,
          color: palette.textMain,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: isMobile ? "0 10px" : "0 20px",
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? "1.6em" : "2em",
              fontWeight: 700,
              color: palette.accent,
              marginBottom: 20,
            }}
          >
            # {channel.title || channel.name}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 20,
            }}
          >
            {/* CHAT AREA */}
            <div
              style={{
                flex: 1,
                border: `1px solid ${palette.border}`,
                padding: 12,
                borderRadius: 10,
                minHeight: 460,
                background: palette.bgCard,
                backdropFilter: "blur(4px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: 6,
                }}
              >
                {messages.map((m) => {
                  const avatar =
                    m.user?.photo ||
                    "https://ui-avatars.com/api/?background=random&name=" +
                      m.user?.username;

                  return (
                    <div
                      key={m._id}
                      style={{
                        marginBottom: 14,
                        background: palette.surface,
                        padding: 10,
                        borderRadius: 8,
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      <div style={{ display: "flex", gap: 12 }}>
                        <img
                          src={avatar}
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: `2px solid ${palette.accent}`,
                          }}
                          alt="avatar"
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

                            {(me?._id === m.user?._id ||
                              channel.moderators.includes(me?._id)) && (
                              <button
                                onClick={() => deleteMessage(m._id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: palette.danger,
                                  cursor: "pointer",
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </div>

                          <div
                            style={{
                              marginTop: 6,
                              color: palette.textMain,
                            }}
                          >
                            {m.text}
                          </div>

                          {/* reactions */}
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
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    background: palette.bgCard,
                                    border: `1px solid ${palette.border}`,
                                    color: palette.textMain,
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
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
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
                      fontWeight: 600,
                      border: "none",
                    }}
                  >
                    Send
                  </button>
                </div>
              ) : (
                <button
                  onClick={joinChannel}
                  style={{
                    marginTop: 14,
                    padding: 12,
                    width: "100%",
                    background: palette.accent,
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  Join Channel to Chat
                </button>
              )}
            </div>

            {/* SIDEBAR */}
            <div
              style={{
                width: isMobile ? "100%" : 260,
                position: isMobile ? "static" : "sticky",
                top: 90,
              }}
            >
              <div
                style={{
                  background: palette.bgCard,
                  padding: 16,
                  borderRadius: 10,
                  border: `1px solid ${palette.border}`,
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: palette.accent,
                  }}
                >
                  About
                </h4>

                <p style={{ color: palette.textLight }}>
                  {channel.description}
                </p>

                <p>
                  <b>Members:</b> {channel.members?.length}
                </p>

                {isMember ? (
                  <button
                    onClick={leaveChannel}
                    style={{
                      padding: 10,
                      width: "100%",
                      borderRadius: 8,
                      background: "#2e1a1a",
                      border: `1px solid ${palette.danger}`,
                      color: palette.danger,
                      fontWeight: 700,
                      marginTop: 10,
                    }}
                  >
                    Leave Channel
                  </button>
                ) : (
                  <button
                    onClick={joinChannel}
                    style={{
                      padding: 10,
                      width: "100%",
                      borderRadius: 8,
                      background: "transparent",
                      border: `1px solid ${palette.accent}`,
                      color: palette.textMain,
                      fontWeight: 700,
                      marginTop: 10,
                    }}
                  >
                    Join Channel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
