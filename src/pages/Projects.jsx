// FULL GITHUB DARK THEME REDESIGN — Projects.jsx
// Clean, modern, consistent with GitHub Dark UI

import { useEffect, useState } from "react";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  /* ---------------- LOAD USER + PROJECTS ---------------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) {
        setUser(res.data.user);
        API.get(`/project/user/${res.data.user.username}`).then((r) => {
          if (r.data.success) setProjects(r.data.projects);
        });
      }
    });
  }, []);

  if (!user)
    return (
      <DashboardLayout>
        <p style={{ color: "#8b949e", padding: 20 }}>Loading...</p>
      </DashboardLayout>
    );

  /* ---------------- DELETE PROJECT ---------------- */
  const deleteProject = (id) => {
    if (!window.confirm("Delete this project?")) return;
    API.delete(`/project/${id}`).then((res) => {
      if (res.data.success) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
      }
    });
  };

  /* ---------------- RENDER IMAGE ---------------- */
  const renderProjectImage = (p) => {
    if (p.image) return p.image;
    if (p.link && p.link.includes("github.com")) {
      try {
        const parts = p.link.split("github.com/")[1].split("/");
        return `https://opengraph.githubassets.com/1/${parts[0]}/${parts[1]}`;
      } catch {
        return "/no-image.png";
      }
    }
    return "/no-image.png";
  };

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "24px 20px 60px",
          fontFamily: "Poppins",
          color: "#c9d1d9",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <h1
            style={{
              fontSize: 30,
              fontWeight: 600,
              margin: 0,
              background: "linear-gradient(90deg, #58a6ff, #ff7b72)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            My Projects
          </h1>

          <button
            onClick={() => navigate("/create-project")}
            style={{
              padding: "10px 18px",
              background: "#238636",
              border: "1px solid #2ea043",
              color: "#fff",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 12px rgba(46,160,67,0.35)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            + New Project
          </button>
        </div>

        {/* EMPTY STATE */}
        {projects.length === 0 && (
          <p style={{ color: "#8b949e", marginTop: 20 }}>
            You haven't added any projects yet.
          </p>
        )}

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: 26,
          }}
        >
          {projects.map((p) => {
            const imgSrc = renderProjectImage(p);

            return (
              <div
                key={p._id}
                style={{
                  background: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                  transition: "0.25s",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid #f7fff8ff";
                  e.currentTarget.style.boxShadow =
                    "0 0 16px rgba(88,166,255,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid #30363d";
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(0,0,0,0.25)";
                }}
              >
                {/* IMAGE */}
                <div
                  style={{ marginBottom: 12 }}
                  onClick={() => navigate(`/project/${p._id}`)}
                >
                  <img
                    src={imgSrc}
                    style={{
                      width: "100%",
                      height: 150,
                      borderRadius: 10,
                      objectFit: "cover",
                      background: "#161b22",
                      border: "1px solid #30363d",
                    }}
                  />
                </div>

                {/* TITLE */}
                <h3
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: 18,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "#f0f6fc",
                  }}
                  onClick={() => navigate(`/project/${p._id}`)}
                >
                  {p.title}
                </h3>

                {/* TECH STACK */}
                <p
                  style={{
                    color: "#8b949e",
                    fontSize: 14,
                    marginBottom: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.tech?.join(", ")}
                </p>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => deleteProject(p._id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "rgba(255,0,120,0.08)",
                    border: "1px solid rgba(255,0,120,0.3)",
                    color: "#ff4b8b",
                    fontSize: 14,
                    fontWeight: 600,
                    marginTop: "auto",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,0,120,0.12)";
                    e.currentTarget.style.border =
                      "1px solid rgba(255,0,120,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255,0,120,0.08)";
                    e.currentTarget.style.border =
                      "1px solid rgba(255,0,120,0.3)";
                  }}
                >
                  Delete Project
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
