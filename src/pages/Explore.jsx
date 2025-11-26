import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { API } from "../api";

export default function Explore() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/post/explore/random").then((res) => {
      if (res.data.success) setPosts(res.data.posts);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 950,
          margin: "0 auto",
          padding: "16px 10px 60px",
          fontFamily: "Poppins",
        }}
      >
        {/* TITLE */}
        <h2
          style={{
            marginBottom: 25,
            fontSize: 30,
            fontWeight: 700,
            background: "linear-gradient(90deg, #58a6ff, #ff7b72)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Explore
        </h2>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="explore-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="explore-skeleton" />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && posts.length === 0 && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "#8b949e",
              borderRadius: 12,
              background: "#0d1117",
              border: "1px solid #30363d",
              boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
            }}
          >
            <p style={{ fontSize: 15 }}>No explore posts yet.</p>
          </div>
        )}

        {/* EXPLORE GRID */}
        {!loading && posts.length > 0 && (
          <div className="explore-grid">
            {posts.map((post) => (
              <div
                key={post._id}
                className="explore-card fadein"
                onClick={() => navigate(`/post/${post._id}`)}
              >
                <img src={post.image} alt="post" className="explore-img" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS */}
      <style>{`
        .explore-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        @media (max-width: 600px) {
          .explore-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* CARD */
        .explore-card {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          background: #161b22;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #30363d;
          transition: 0.20s ease;
        }

        .explore-card:hover {
          border-color: #58a6ff88;
          transform: scale(1.03);
          box-shadow: 0 0 14px rgba(88,166,255,0.3);
        }

        .explore-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* SKELETON LOADER */
        .explore-skeleton {
          width: 100%;
          padding-bottom: 100%;
          border-radius: 10px;
          background: linear-gradient(90deg, #1c2128 0%, #2d333b 50%, #1c2128 100%);
          background-size: 200% 100%;
          animation: skeletonAnim 1.2s infinite ease-in-out;
        }

        @keyframes skeletonAnim {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Fade-in animation */
        .fadein {
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
