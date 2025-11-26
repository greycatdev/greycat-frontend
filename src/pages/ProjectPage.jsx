import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* ---------------- LOAD PROJECT ---------------- */
  const loadProject = async () => {
    try {
      const res = await API.get(`/project/${id}`);
      if (res.data.success) setProject(res.data.project);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOAD USER ---------------- */
  const loadUser = () =>
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setUser(res.data.user);
    });

  useEffect(() => {
    loadProject();
    loadUser();
  }, [id]);

  /* ---------------- LOADING SCREEN ---------------- */
  if (loading || !project) {
    return (
      <DashboardLayout>
        <div
          style={{
            padding: 40,
            fontSize: 18,
            color: "#c9d1d9",
            fontFamily: "Poppins",
          }}
        >
          Loading project…
        </div>
      </DashboardLayout>
    );
  }

  const isOwner = user && user._id === project.user._id;

  /* ---------------- DELETE PROJECT ---------------- */
  const deleteProject = () => {
    if (!window.confirm("Delete this project?")) return;

    API.delete(`/project/${id}`).then((res) => {
      if (res.data.success) navigate(`/${project.user.username}`);
    });
  };

  /* ---------------- FIX IMAGE URL ---------------- */
  const imageUrl =
    project.image && project.image.trim() !== ""
      ? project.image.startsWith("http")
        ? project.image
        : `${BACKEND_URL}/${project.image}`
      : `https://opengraph.githubassets.com/1/${project.user.username}/${project.title.replace(
          /\s+/g,
          "-"
        )}`;

  const userPhoto =
    project.user.photo ||
    `https://ui-avatars.com/api/?name=${project.user.username}`;

  /* ---------------- UI ---------------- */
  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "20px",
          borderRadius: 12,
          background: "#0d1117",
          border: "1px solid #30363d",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          fontFamily: "Poppins",
          color: "#c9d1d9",
          marginBottom: 40,
        }}
      >
        {/* HEADER ROW */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 30,
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {/* USER INFO */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={userPhoto}
              alt="user"
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #30363d",
                marginRight: 15,
                cursor: "pointer",
              }}
              onClick={() => navigate(`/${project.user.username}`)}
            />

            <div>
              <div
                onClick={() => navigate(`/${project.user.username}`)}
                style={{
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#58a6ff",
                }}
              >
                @{project.user.username}
              </div>
              <div style={{ fontSize: 13, color: "#8b949e" }}>
                Posted on{" "}
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* DELETE BUTTON */}
          {isOwner && (
            <button
              onClick={deleteProject}
              style={{
                padding: "8px 18px",
                background: "#21262d",
                border: "1px solid #30363d",
                color: "#f85149",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#30363d";
                e.currentTarget.style.color = "#ff7b72";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#21262d";
                e.currentTarget.style.color = "#f85149";
              }}
            >
              Delete
            </button>
          )}
        </div>

        {/* PROJECT IMAGE */}
        <div
          style={{
            marginBottom: 30,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid #30363d",
          }}
        >
          <img
            src={imageUrl}
            alt="project"
            style={{
              width: "100%",
              height: 300,
              objectFit: "cover",
            }}
          />
        </div>

        {/* TITLE */}
        <h1
          style={{
            fontSize: 22,
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          {project.title}
        </h1>

        {/* DESCRIPTION */}
        <div
          style={{
            background: "#161b22",
            padding: "10px 15px",
            borderRadius: 10,
            border: "1px solid #30363d",
            marginBottom: 15,
          }}
        >
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "#c9d1d9",
              whiteSpace: "pre-line",
            }}
          >
            {project.description}
          </p>
        </div>

        {/* TECH STACK */}
        {project.tech?.length > 0 && (
          <div
            style={{
              marginBottom: 20,
              paddingBottom: 15,
              borderBottom: "1px solid #30363d",
            }}
          >
            <h3
              style={{
                fontSize: 20,
                marginBottom: 15,
                color: "#c9d1d9",
              }}
            >
              Tech Stack
            </h3>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {project.tech.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: "#1f6feb20",
                    border: "1px solid #1f6feb40",
                    color: "#58a6ff",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* VISIT BUTTON */}
        {project.link && (
          <a
            href={
              project.link.startsWith("http")
                ? project.link
                : `https://${project.link}`
            }
            target="_blank"
            rel="noreferrer"
          >
            <button
              style={{
                padding: "12px 22px",
                background: "#238636",
                border: "1px solid #2ea043",
                color: "white",
                cursor: "pointer",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 500,
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2ea043";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#238636";
              }}
            >
              Visit Project →
            </button>
          </a>
        )}
      </div>
    </DashboardLayout>
  );
}
