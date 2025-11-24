import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState("");

  const loadPost = () =>
    API.get(`/post/${id}`).then((res) => {
      if (res.data.success) setPost(res.data.post);
    });

  const loadUser = () =>
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setUser(res.data.user);
    });

  useEffect(() => {
    loadPost();
    loadUser();
  }, [id]);

  if (!post) return <DashboardLayout>Loading...</DashboardLayout>;

  const isOwner = user && post?.user && user._id === post.user._id;

  const deletePost = () => {
    if (!window.confirm("Delete this post?")) return;
    API.delete(`/post/${id}`).then((res) => {
      if (res.data.success) navigate("/");
    });
  };

  const toggleLike = () => {
    API.post(`/post/${id}/like`).then((res) => {
      if (res.data.success) loadPost();
    });
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    API.post(`/post/${id}/comment`, { text: commentText }).then((res) => {
      if (res.data.success) {
        setCommentText("");
        loadPost();
      }
    });
  };

  const formatTime = (dateString) => {
    const diff = (new Date() - new Date(dateString)) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const HeartIcon = ({ filled }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill={filled ? "#ff3040" : "none"}
      stroke={filled ? "#ff3040" : "#999"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: "pointer", transition: "0.25s" }}
    >
      <path d="M20.8 4.6c-1.5-1.6-4-1.7-5.6-.2l-.9.9-.9-.9C12 2.9 9.5 3 8 4.6c-1.6 1.6-1.7 4.3 0 6l7.4 7.6L20.8 10c1.7-1.7 1.6-4.4 0-6z" />
    </svg>
  );

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 650,
          margin: "0 auto",
          background: "#0d1117",
          border: "1px solid #30363d",
          borderRadius: 12,
          color: "#c9d1d9",
          overflow: "hidden",
          fontFamily: "Poppins",
        }}
      >
        {/* ---------- HEADER ---------- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid #30363d",
          }}
        >
          <div
            onClick={() =>
              post?.user?.username && navigate(`/${post.user.username}`)
            }
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <img
              src={post?.user?.photo}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: 12,
                border: "1px solid #30363d",
              }}
            />
            <b style={{ fontSize: 15, color: "#c9d1d9" }}>
              @{post?.user?.username ?? "unknown"}
            </b>
          </div>

          {isOwner && (
            <button
              onClick={deletePost}
              style={{
                marginLeft: "auto",
                padding: "6px 14px",
                borderRadius: 6,
                background: "#15171aff",
                border: "1px solid #f85149",
                color: "#f85149",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          )}
        </div>

        {/* ---------- IMAGE ---------- */}
        <img
          src={post.image}
          style={{ width: "100%", objectFit: "cover", maxHeight: 600 }}
        />

        {/* ---------- LIKE + CAPTION ---------- */}
        <div style={{ padding: "18px 20px" }}>
          <div onClick={toggleLike} style={{ display: "inline-block" }}>
            <HeartIcon filled={post.likedByCurrentUser} />
          </div>

          <p style={{ margin: "8px 0 10px 0" }}>
            <b style={{ color: "#fff" }}>{post.likesCount} likes</b>
          </p>

          {post.caption && (
            <p style={{ marginBottom: 6, fontSize: 15 }}>
              <b
                onClick={() =>
                  post?.user?.username && navigate(`/${post.user.username}`)
                }
                style={{ cursor: "pointer", color: "#c9d1d9" }}
              >
                @{post?.user?.username ?? "unknown"}
              </b>{" "}
              <span style={{ color: "#b3b3b3" }}>{post.caption}</span>
            </p>
          )}

          <p style={{ color: "#8b949e", fontSize: 13 }}>
            {formatTime(post.createdAt)}
          </p>
        </div>

        {/* ---------- COMMENTS ---------- */}
        <div style={{ padding: "0 20px 24px 20px" }}>
          <h3
            style={{
              marginTop: 8,
              marginBottom: 14,
              fontSize: 16,
              fontWeight: 600,
              color: "#c9d1d9",
            }}
          >
            Comments
          </h3>

          {post.comments?.map((c) =>
            c ? (
              <div
                key={c._id}
                style={{
                  marginBottom: 14,
                  padding: "8px 10px",
                  background: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: 6,
                  display: "flex",
                  gap: 10,
                }}
              >
                <b
                  onClick={() =>
                    c?.user?.username && navigate(`/${c.user.username}`)
                  }
                  style={{
                    cursor: "pointer",
                    color: "#c9d1d9",
                    fontSize: 14,
                  }}
                >
                  @{c?.user?.username ?? "unknown"}
                </b>

                <span style={{ flex: 1, color: "#b3b3b3", fontSize: 14 }}>
                  {c.text}
                </span>

                <span
                  style={{
                    color: "#8b949e",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatTime(c.createdAt)}
                </span>
              </div>
            ) : null
          )}

          {/* ---------- COMMENT INPUT ---------- */}
          <div style={{ marginTop: 12 }}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 6,
                background: "#0d1117",
                border: "1px solid #30363d",
                color: "#c9d1d9",
                outline: "none",
                marginBottom: 10,
              }}
            />

            <button
              onClick={submitComment}
              style={{
                padding: "10px 18px",
                borderRadius: 6,
                background: "#238636",
                border: "1px solid #2ea043",
                color: "white",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
