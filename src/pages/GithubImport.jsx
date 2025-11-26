import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { API } from "../api";

export default function GithubImport() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  /* ---------- SCREEN SIZE LISTENER ---------- */
  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  /* ---------- CHECK AUTH BEFORE ANYTHING ---------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (!res.data.authenticated) window.location.href = "/login";
      setCheckingUser(false);
    });
  }, []);

  const colors = {
    bgPrimary: "#0d1117",
    bgSecondary: "#161b22",
    textPrimary: "#c9d1d9",
    textSecondary: "#8b949e",
    border: "#30363d",
    accent: "#238636",
    accentHover: "#2ea043",
    selectedBorder: "#1bd478ff",
    selectedBg: "rgba(40, 255, 40, 0.05)",
  };

  /* ---------- FETCH REPOS ---------- */
  const fetchRepos = async () => {
    if (!username.trim()) return alert("Enter a GitHub username");

    setLoading(true);
    setRepos([]);
    setSelected([]);

    const res = await API.get(`/github/repos/${username}`);
    setLoading(false);

    if (res.data.success) setRepos(res.data.repos);
    else alert("GitHub user not found");
  };

  /* ---------- SELECT / UNSELECT ---------- */
  const toggle = (repo) => {
    if (selected.includes(repo.url)) {
      setSelected(selected.filter((u) => u !== repo.url));
    } else {
      setSelected([...selected, repo.url]);
    }
  };

  /* ---------- IMPORT SELECTED ---------- */
  const importProjects = async () => {
    if (selected.length === 0)
      return alert("Please select at least one repository");

    const selectedRepos = repos.filter((r) => selected.includes(r.url));

    const res = await API.post("/github/import", { repos: selectedRepos });

    if (res.data.success) {
      alert("Projects imported!");
      window.location.href = "/projects";
    } else {
      alert("Import failed");
    }
  };

  /* ---------- SHOW LOADER BEFORE USER AUTH ---------- */
  if (checkingUser)
    return (
      <DashboardLayout>
        <div style={{ color: "white", padding: 40 }}>Loading…</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "15px",
          color: colors.textPrimary,
          fontFamily: "Poppins",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            fontSize: 28,
            fontWeight: 600,
            background: "linear-gradient(90deg,#58a6ff,#ff7b72)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          Import from GitHub
        </h2>

        {/* INPUT + BUTTON */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 12,
            marginBottom: 25,
          }}
        >
          <input
            placeholder="Enter GitHub username…"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 6,
              background: colors.bgSecondary,
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
              fontSize: 15,
              outline: "none",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.border = `1px solid ${colors.selectedBorder}`)
            }
            onBlur={(e) =>
              (e.currentTarget.style.border = `1px solid ${colors.border}`)
            }
          />

          <button
            onClick={fetchRepos}
            disabled={loading}
            style={{
              padding: "12px 20px",
              background: loading ? colors.border : colors.accent,
              border: `1px solid ${colors.accent}`,
              color: colors.textPrimary,
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {loading ? "Loading…" : "Fetch"}
          </button>
        </div>

        {/* SKELETON LOADER */}
        {loading && (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: 68,
                  borderRadius: 6,
                  background:
                    "linear-gradient(90deg,#1c2128 0%,#2d333b 50%,#1c2128 100%)",
                  backgroundSize: "200% 100%",
                  animation: "skeletonAnim 1.2s infinite linear",
                  marginBottom: 10,
                }}
              />
            ))}

            <style>{`
              @keyframes skeletonAnim {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </div>
        )}

        {/* REPO LIST */}
        {!loading &&
          repos.map((repo) => {
            const selectedNow = selected.includes(repo.url);

            return (
              <div
                key={repo.url}
                onClick={() => toggle(repo)}
                style={{
                  padding: "16px 18px",
                  borderRadius: 8,
                  background: selectedNow
                    ? colors.selectedBg
                    : colors.bgSecondary,
                  border: `1px solid ${
                    selectedNow ? colors.selectedBorder : colors.border
                  }`,
                  marginBottom: 10,
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                <b
                  style={{
                    fontSize: 17,
                    color: selectedNow
                      ? colors.selectedBorder
                      : colors.textPrimary,
                  }}
                >
                  {repo.name}
                </b>

                <p
                  style={{
                    margin: "6px 0",
                    fontSize: 14,
                    color: colors.textSecondary,
                  }}
                >
                  {repo.description || "No description"}
                </p>

                <span
                  style={{
                    padding: "3px 8px",
                    fontSize: 12,
                    borderRadius: 20,
                    background: colors.border,
                    color: colors.textSecondary,
                  }}
                >
                  {repo.language || "Unknown"}
                </span>
              </div>
            );
          })}

        {/* EMPTY STATE */}
        {!loading && repos.length === 0 && username && (
          <div
            style={{
              marginTop: 30,
              border: `1px solid ${colors.border}`,
              background: colors.bgSecondary,
              padding: 20,
              borderRadius: 8,
              textAlign: "center",
              color: colors.textSecondary,
            }}
          >
            No repositories found.
          </div>
        )}

        {/* IMPORT BUTTON */}
        {!loading && repos.length > 0 && (
          <button
            onClick={importProjects}
            style={{
              marginTop: 25,
              padding: "14px 22px",
              borderRadius: 8,
              background: colors.accent,
              border: `1px solid ${colors.accentHover}`,
              color: colors.textPrimary,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
              width: isMobile ? "100%" : "auto",
            }}
          >
            Import Selected →
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}
