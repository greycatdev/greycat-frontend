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

  /* ---------------------- RESPONSIVE ---------------------- */
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------------------- FETCH USER ---------------------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setMe(res.data.user);
    });
  }, []);

  /* ---------------------- LOAD CHANNEL ---------------------- */
  const loadChannel = () => {
    API.get(`/channel/${id}`).then((res) => {
      if (res.data.success) {
        const ch = res.data.channel;
        setChannel(ch);

        if (me) {
          // Fix: Ensure comparison uses toString() for consistency
          const joined = ch.members.some((m) => m._id.toString() === me._id.toString());
          setIsMember(joined);
        }
      }
    });
  };

  const loadMessages = () => {
    API.get(`/channel/${id}/messages?page=0&limit=200`).then((res) => {
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

  /* ---------------------- SOCKET.IO ---------------------- */
  useEffect(() => {
    // Note: If deployed, ensure this points to your deployed backend URL, not localhost
    socketRef.current = io("http://localhost:5000", { withCredentials: true });

    socketRef.current.emit("joinRoom", id);

    // REAL-TIME RECEIVE MESSAGE (Fix: Use toString() for comparison and rely only on socket event)
    socketRef.current.on("new_message", (msg) => {
      setMessages((prev) => {
        // Fix: Use toString() for reliable ID comparison
        if (prev.some((m) => m._id.toString() === msg._id.toString())) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    // Fix: Use toString() for comparison
    socketRef.current.on("message_deleted", ({ msgId }) => {
      setMessages((prev) => prev.filter((m) => m._id.toString() !== msgId.toString()));
    });

    // Fix: Use toString() for comparison to ensure real-time reaction update works
    socketRef.current.on("reaction_updated", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => 
          (m._id.toString() === updatedMsg._id.toString() ? updatedMsg : m)
        )
      );
    });

    return () => {
      socketRef.current.emit("leaveRoom", id);
      socketRef.current.disconnect();
    };
  }, [id]);

  /* ---------------------- SCROLL ---------------------- */
  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  /* ---------------------- SEND MESSAGE ---------------------- */
  const sendMessage = async () => {
    if (!text.trim()) return;

    // Preserve text while clearing input for better UX
    const messageText = text; 
    setText(""); 

    try {
      // FIX: Rely only on the Socket.IO event 'new_message' for state update.
      // Removed the local `setMessages` call to prevent duplication.
      await API.post(`/channel/${id}/message`, { text: messageText });
      // Scrolling will happen when 'new_message' is received.
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optional: Handle error or restore text if API call failed
      // setText(messageText);
    }
  };

  /* ---------------------- DELETE MESSAGE ---------------------- */
  const deleteMessage = async (msgId) => {
    if (!window.confirm("Delete message?")) return;
    await API.delete(`/channel/message/${msgId}`);
    // State will be updated by the 'message_deleted' socket event
  };

  /* ---------------------- REACT EMOJI ---------------------- */
  const react = async (msgId, emoji) => {
    await API.post(`/channel/message/${msgId}/react`, { emoji });
    // State will be updated by the 'reaction_updated' socket event
  };

  /* ---------------------- JOIN / LEAVE ---------------------- */
  const joinChannel = async () => {
    await API.post(`/channel/${id}/join`);
    loadChannel();
    loadMessages(); // Load messages upon joining, in case the channel was private
  };

  const leaveChannel = async () => {
    await API.post(`/channel/${id}/leave`);
    loadChannel();
  };

  /* ---------------------- THEME ---------------------- */
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

  /* ---------------------- RENDER UI ---------------------- */
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
            {/* CHAT */}
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
                    `https://ui-avatars.com/api/?background=random&name=${m.user?.username}`;

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

                            {(me?._id.toString() === m.user?._id.toString() ||
                              channel.moderators.some(modId => modId.toString() === me?._id.toString())) && (
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

                          <div style={{ marginTop: 6, color: palette.textMain }}>
                            {m.text}
                          </div>

                          {/* REACTIONS */}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage();
                      }
                    }}
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