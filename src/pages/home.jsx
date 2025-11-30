import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";
import CarLoader from "./CarLoader";

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const timeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diff = (now - posted) / 1000;

    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    if (diff < 172800) return "Yesterday";
    return posted.toLocaleDateString();
  };

  /* ---------------------- FETCH POSTS ONLY ---------------------- */
  useEffect(() => {
    API.get("/post/feed")
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.posts)) {
          setPosts(res.data.posts);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------------------- LOADER (NO DASHBOARDLAYOUT WRAP) ---------------------- */
  if (loading) return <CarLoader />;

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 650,
          margin: "0 auto",
          paddingBottom: 40,
          paddingTop: 10,
          fontFamily: "Poppins",
          color: "#c9d1d9",
        }}
      >
        {posts.length === 0 && (
          <p
            style={{
              textAlign: "center",
              marginTop: 60,
              color: "#8b949e",
              fontSize: 15,
            }}
          >
            No posts yet. Follow users or create a post.
          </p>
        )}

        {posts.map(
          (post) =>
            post && (
              <div
                key={post._id}
                style={{
                  marginBottom: 32,
                  background: "#161b22",
                  borderRadius: 12,
                  border: "1px solid #30363d",
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                }}
              >
                {/* ---------------------- USER HEADER ---------------------- */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    post?.user?.username &&
                    navigate(`/${post.user.username}`)
                  }
                >
                  <img
                    src={post?.user?.photo || "https://greycat-backend.onrender.com/default-image.jpg"}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #30363d",
                      marginRight: 12,
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: "#c9d1d9",
                      }}
                    >
                      @{post?.user?.username ?? "unknown"}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#8b949e",
                        marginTop: 2,
                      }}
                    >
                      {timeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>

                {/* ---------------------- IMAGE ---------------------- */}
                <img
                  src={post.image}
                  alt="post"
                  style={{
                    width: "100%",
                    maxHeight: 600,
                    objectFit: "cover",
                    borderTop: "1px solid #30363d",
                    borderBottom: "1px solid #30363d",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/post/${post._id}`)}
                />

                {/* ---------------------- CAPTION ---------------------- */}
                {post.caption && (
                  <div style={{ padding: "12px 16px 16px 16px" }}>
                    <span
                      onClick={() =>
                        post?.user?.username &&
                        navigate(`/${post.user.username}`)
                      }
                      style={{
                        fontWeight: 600,
                        color: "#c9d1d9",
                        cursor: "pointer",
                      }}
                    >
                      @{post?.user?.username ?? "unknown"}
                    </span>{" "}
                    <span style={{ color: "#8b949e" }}>{post.caption}</span>
                  </div>
                )}
              </div>
            )
        )}
      </div>
    </DashboardLayout>
  );
}
