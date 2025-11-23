// src/pages/ChannelPage.jsx
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

  const scrollRef = useRef();
  const bottomRef = useRef();

  const [isMember, setIsMember] = useState(false);
  const [me, setMe] = useState(null);

  const socketRef = useRef(null);

  /* ---------------- LOAD AUTH USER ---------------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setMe(res.data.user);
    });
  }, []);

  /* ---------------- LOAD CHANNEL ---------------- */
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

  /* ---------------- LOAD MESSAGES ---------------- */
  const loadMessages = () => {
    API.get(`/channel/${id}/messages?page=0&limit=200`).then((res) => {
      if (res.data.success) {
        setMessages(res.data.messages);
        setTimeout(() => scrollToBottom(), 60);
      }
    });
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    if (!id) return;
    loadChannel();
    loadMessages();
  }, [id, me]);

  /* ---------------- SOCKET.IO ---------------- */
  useEffect(() => {
    if (!id) return;
    socketRef.current = io("https://greycat-backend.onrender.com", {
  withCredentials: true,
});

    socketRef.current.emit("joinRoom", id);

    socketRef.current.on("new_message", (msg) => {
      const channelId = msg.channel?._id || msg.channel;
      if (channelId === id) {
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

  /* ---------------- HELPERS ---------------- */
  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const sendMessage = async () => {
    if (!text.trim()) return;
    const res = await API.post(`/channel/${id}/message`, { text });
    if (res.data.success) setText("");
  };

  const deleteMessage = async (msgId) => {
    if (!window.confirm("Delete this message?")) return;
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

  /* ---------------- RENDER ---------------- */
  if (!channel) return <DashboardLayout>Loading channel...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "18px 12px",
          color: "#c9d1d9",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: 14 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              color: "#c9d1d9",
            }}
          >
            #{channel.title || channel.name}
          </h2>
          <div style={{ color: "#8b949e", marginTop: 4 }}>
            {channel.topic || channel.description}
          </div>
        </div>

        <div
  className="gc-channel-layout"
  style={{ gap: 20, alignItems: "flex-start" }}
>

          {/* CHAT BOX */}
          <div
            style={{
              flex: 1,
              height: "76vh",
              display: "flex",
              flexDirection: "column",
              background: "#161b22",
              borderRadius: 12,
              border: "1px solid #30363d",
              padding: 12,
            }}
          >
            {/* MESSAGE LIST */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "8px 6px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {messages.map((m) => {
                const isMine = me && m.user?._id === me._id;

                const bubble = {
                  maxWidth: "75%",
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: "#21262d",
                  border: "1px solid #30363d",
                  fontSize: 15,
                  lineHeight: 1.4,
                  color: "#c9d1d9",
                  wordBreak: "break-word",
                };

                return (
                  <div
                    key={m._id}
                    style={{
                      display: "flex",
                      justifyContent: isMine ? "flex-end" : "flex-start",
                      gap: 10,
                    }}
                  >
                    {/* LEFT AVATAR */}
                    {!isMine && (
                      <img
                        src={
                          m.user?.photo ||
                          `https://ui-avatars.com/api/?background=2b2b2b&name=${encodeURIComponent(
                            m.user?.username
                          )}`
                        }
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #30363d",
                        }}
                      />
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMine ? "flex-end" : "flex-start",
                      }}
                    >
                      {!isMine && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#8b949e",
                            marginBottom: 4,
                          }}
                        >
                          @{m.user?.username}
                        </div>
                      )}

                      {/* BUBBLE */}
                      <div style={bubble}>{m.text}</div>

                      {/* META + REACTIONS */}
                      <div
                        style={{
                          marginTop: 6,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#8b949e" }}>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {/* REACTIONS */}
                        <div style={{ display: "flex", gap: 6 }}>
                          {["👍", "❤️", "🔥", "😮"].map((emoji) => {
                            const count =
                              m.reactions?.filter((r) => r.emoji === emoji)
                                .length || 0;
                            const reactedByMe = m.reactions?.some(
                              (r) =>
                                r.emoji === emoji && r.user === me?._id
                            );

                            return (
                              <button
                                key={emoji}
                                onClick={() => react(m._id, emoji)}
                                style={{
                                  padding: "3px 6px",
                                  borderRadius: 12,
                                  border: "1px solid #30363d",
                                  background: reactedByMe
                                    ? "#1f6feb33"
                                    : "#21262d",
                                  fontSize: 12,
                                  cursor: "pointer",
                                  color: "#c9d1d9",
                                }}
                              >
                                {emoji} {count > 0 && count}
                              </button>
                            );
                          })}
                        </div>

                        {/* DELETE */}
                        {isMine && (
                          <button
                            onClick={() => deleteMessage(m._id)}
                            style={{
                              padding: "3px 6px",
                              borderRadius: 6,
                              border: "1px solid #30363d",
                              background: "#21262d",
                              color: "#e5534b",
                              fontSize: 11,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* RIGHT AVATAR */}
                    {isMine && (
                      <img
                        src={m.user?.photo}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #30363d",
                        }}
                      />
                    )}
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            {/* INPUT BAR */}
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 10,
                alignItems: "center",
                borderTop: "1px solid #30363d",
                paddingTop: 12,
              }}
            >
              {isMember ? (
                <>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Message #${channel.name}`}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 6,
                      border: "1px solid #30363d",
                      background: "#0d1117",
                      color: "#c9d1d9",
                      outline: "none",
                      fontSize: 15,
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 6,
                      background: "#238636",
                      border: "1px solid #2ea043",
                      color: "white",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 15,
                    }}
                  >
                    Send
                  </button>
                </>
              ) : (
                <button
                  onClick={joinChannel}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 6,
                    background: "#238636",
                    border: "1px solid #2ea043",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 15,
                  }}
                >
                  Join Channel to Chat
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ width: 300 }}>
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "#161b22",
                border: "1px solid #30363d",
                boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
              }}
            >
              <h4
                style={{
                  marginTop: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                About
              </h4>

              <p
                style={{
                  color: "#8b949e",
                  marginBottom: 16,
                  whiteSpace: "pre-line",
                }}
              >
                {channel.description || "No description."}
              </p>

              {/* MEMBERS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>Members</div>
                <div style={{ color: "#8b949e" }}>
                  {channel.members?.length}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                {channel.members?.slice(0, 6).map((m) => (
                  <img
                    key={m._id}
                    src={m.photo}
                    title={`@${m.username}`}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #30363d",
                    }}
                  />
                ))}
              </div>

              {/* LEAVE / JOIN BUTTON */}
              {isMember ? (
                <button
                  onClick={leaveChannel}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 6,
                    background: "#21262d",
                    border: "1px solid #30363d",
                    color: "#da3633",
                    fontWeight: 600,
                    cursor: "pointer",
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
                    borderRadius: 6,
                    background: "#238636",
                    border: "1px solid #2ea043",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Join Channel
                </button>
              )}

              {/* MODERATORS */}
              {channel.moderators?.length > 0 && (
                <>
                  <hr
                    style={{
                      border: "none",
                      height: 1,
                      background: "#30363d",
                      margin: "14px 0",
                    }}
                  />
                  <div
                    style={{ color: "#8b949e", fontSize: 13, marginBottom: 6 }}
                  >
                    Moderators
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {channel.moderators.map((modId) => {
                      const m = channel.members?.find((x) => x._id === modId);
                      if (!m) return null;

                      return (
                        <div
                          key={modId}
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            padding: "6px 8px",
                            borderRadius: 8,
                            background: "#21262d",
                            border: "1px solid #30363d",
                          }}
                        >
                          <img
                            src={m.photo}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div style={{ fontSize: 13 }}>
                            @{m.username}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
