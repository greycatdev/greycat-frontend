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

  const [socketConnected, setSocketConnected] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [me, setMe] = useState(null);
  const socketRef = useRef(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setMe(res.data.user);
    });
  }, []);

  const loadChannel = () => {
    API.get(`/channel/${id}`).then((res) => {
      if (res.data.success) {
        setChannel(res.data.channel);
        if (me) {
          const joined = res.data.channel.members.some((m) => m._id === me._id);
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

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => setSocketConnected(true));
    socketRef.current.emit("joinRoom", id);

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

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const sendMessage = async () => {
    if (!text.trim()) return;
    const res = await API.post(`/channel/${id}/message`, { text });
    if (res.data.success) setText("");
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

  // ---------- DARK THEME & RESPONSIVE STYLES ----------
  const palette = {
    bgCard: "#000000cc",
    accent: "#00598dff",
    border: "#313643",
    textMain: "#F4F6FB",
    textLight: "#969ba1",
    danger: "#e74c3c",
    surface: "#181A20",
  };

  const pageStyle = {
    background: palette.bgMain,
    minHeight: "100vh",
    color: palette.textMain,
    paddingTop: 30,
    paddingBottom: 40,
  };

  const containerStyle = {
    maxWidth: 980,
    margin: "0 auto",
  };

  const headingStyle = {
    fontSize: "2em",
    fontWeight: 700,
    letterSpacing: "1px",
    margin: isMobile ? "0 0 20px 6px" : "0 0 30px 0",
    color: palette.accent,
  };

  const flexStyle = {
    display: "flex",
    gap: isMobile ? 0 : 24,
    alignItems: isMobile ? "stretch" : "flex-start",
    flexDirection: isMobile ? "column" : "row",
  };

  const chatBoxStyle = {
    flex: 1,
    border: `1px solid ${palette.border}`,
    padding: 12,
    borderRadius: 8,
    minHeight: 460,
    display: "flex",
    flexDirection: "column",
    background: palette.bgCard,
    marginBottom: isMobile ? 28 : 0,
  };

  const chatScrollStyle = {
    overflowY: "auto",
    flex: 1,
    paddingRight: 6,
  };

  const messageStyle = {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    background: palette.surface,
    boxShadow: "0 0 6px 0 rgba(0,0,0,0.06)",
    color: palette.textMain,
  };

  const sidebarStyle = {
    width: isMobile ? "100%" : 260,
    position: isMobile ? "static" : "sticky",
    top: 80,
    alignSelf: isMobile ? "unset" : "flex-start",
    marginBottom: isMobile ? 6 : 0,
  };

  const sidebarCardStyle = {
    padding: 15,
    border: `1px solid ${palette.border}`,
    borderRadius: 8,
    background: palette.bgCard,
    color: palette.textMain,
    boxSizing: "border-box",
  };

  const leaveBtnStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    background: "#301c1c",
    border: `1px solid ${palette.danger}`,
    color: palette.danger,
    width: "100%",
    textAlign: "center",
    fontWeight: 700,
    marginTop: 12,
    cursor: "pointer",
  };

  const joinBtnStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    background: palette.bgMain,
    border: `1px solid ${palette.accent}`,
    color: palette.textMain,
    width: "100%",
    textAlign: "center",
    fontWeight: 700,
    marginTop: 12,
    cursor: "pointer",
  };

  const sendBtnStyle = {
    padding: "10px 16px",
    borderRadius: 8,
    background: palette.accent,
    color: "#fff",
    border: "none",
    fontWeight: 600,
  };

  const inputStyle = {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${palette.border}`,
    background: palette.surface,
    color: palette.textMain,
  };

  if (!channel)
    return (
      <DashboardLayout>
        <div style={pageStyle}>Loading channel...</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout requireAuth={true}>
      <div style={{ ...pageStyle, ...containerStyle }}>
        <h2 style={headingStyle}># {channel.title || channel.name}</h2>
        <div style={flexStyle}>
          {/* CHAT BOX */}
          <div style={chatBoxStyle}>
            <div style={chatScrollStyle}>
              {messages.map((m) => {
                const photo =
                  m.user?.photo ||
                  "https://ui-avatars.com/api/?background=random&name=" +
                    m.user?.username;

                return (
                  <div key={m._id} style={messageStyle}>
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
                        alt="user avatar"
                      />

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
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
                                fontSize: "0.93em",
                              }}
                            >
                              {new Date(m.createdAt).toLocaleTimeString()}
                            </small>
                          </div>
                          {me &&
                            (m.user?._id === me._id ||
                              channel.moderators.includes(me._id)) && (
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
                        <div style={{ marginTop: 6, color: palette.textMain }}>
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
                                  border: `1px solid ${palette.border}`,
                                  background: palette.bgCard,
                                  color: palette.textMain,
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  fontWeight: 700,
                                  fontSize: "1em",
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
            {/* MESSAGE INPUT */}
            {isMember && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message #${channel.name}`}
                  style={inputStyle}
                />
                <button onClick={sendMessage} style={sendBtnStyle}>
                  Send
                </button>
              </div>
            )}
            {!isMember && (
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <button onClick={joinChannel} style={joinBtnStyle}>
                  Join Channel to Chat
                </button>
              </div>
            )}
          </div>
          {/* SIDEBAR */}
          <div style={sidebarStyle}>
            <div style={sidebarCardStyle}>
              <h4 style={{ margin: "0 0 12px 0", color: palette.accent }}>
                About
              </h4>
              <p style={{ color: palette.textLight }}>{channel.description}</p>
              <p>
                <b>Members:</b> {channel.members?.length}
              </p>
              {isMember ? (
                <button onClick={leaveChannel} style={leaveBtnStyle}>
                  Leave Channel
                </button>
              ) : (
                <button onClick={joinChannel} style={joinBtnStyle}>
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
