import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { API } from "../api";

export default function Explore() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    API.get("/post/explore/random").then((res) => {
      if (res.data.success) setPosts(res.data.posts);
    });
  }, []);

  return (
    <DashboardLayout>
      <h2
        style={{
          marginBottom: 22,
          fontSize: 24,
          fontFamily: "Poppins",
          color: "#f0f6fc",
          fontWeight: 600,
        }}
      >
        Explore
      </h2>

      {/* GRID */}
      <div className="explore-grid">
        {posts.map((post) => (
          <div
            key={post._id}
            className="explore-card"
            onClick={() => navigate(`/post/${post._id}`)}
          >
            <img src={post.image} alt="post" className="explore-img" />
          </div>
        ))}
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
          border: 1px solid #f0f6fc22;
          background: #1e232a;
          transform: scale(1.02);
        }

        .explore-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </DashboardLayout>
  );
}
