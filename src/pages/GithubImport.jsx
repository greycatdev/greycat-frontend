import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { API } from "../api";

export default function GithubImport() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Listen for screen resizing
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ------------------------------------
     GitHub Dark Mode Color Palette
  ------------------------------------ */
  const githubColors = {
    backgroundPrimary: "#0D1117",
    backgroundSecondary: "#161B22",
    textPrimary: "#C9D1D9",
    textSecondary: "#8B949E",
    border: "#30363D",
    accentBlue: "#238636",
    importPurple: "#087423ff",
    selectedBackground: "rgba(51, 255, 36, 0.04)",
    selectedBorder: "#1bd478ff",
  };

  /* ------------------------------------
     FETCH REPOS
  ------------------------------------ */
  const fetchRepos = async () => {
    if (!username.trim()) return alert("Enter a GitHub username!");

    setLoading(true);
    const res = await API.get(`/github/repos/${username}`);
    setLoading(false);

    if (res.data.success) setRepos(res.data.repos);
    else alert("GitHub user not found");
  };

  /* ------------------------------------
     SELECT / UNSELECT
  ------------------------------------ */
  const toggleSelect = (repo) => {
    if (selected.includes(repo.url)) {
      setSelected(selected.filter((r) => r !== repo.url));
    } else {
      setSelected([...selected, repo.url]);
    }
  };

  /* ------------------------------------
     IMPORT PROJECTS
  ------------------------------------ */
  const importProjects = async () => {
    if (selected.length === 0) return alert("Select at least 1 repository!");

    const selectedRepos = repos.filter((r) => selected.includes(r.url));
    // Ensure user is authenticated before import
    const authRes = await API.get("/auth/user");
    if (!authRes.data.authenticated) {
      alert("Please log in to import projects");
      window.location.href = "/login";
      return;
    }

    const res = await API.post("/github/import", { repos: selectedRepos });

    if (res.status === 401 || res.data?.message === "Not authenticated") {
      alert("Please log in to import projects");
      window.location.href = "/login";
      return;
    }

    if (res.data.success) {
      alert("Projects imported!");
      window.location.href = "/projects";
    } else {
      alert(res.data.message || "Import failed");
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "0 15px",
          color: githubColors.textPrimary,
          fontFamily: "sans-serif",
        }}
      >
        {/* TITLE */}
        <h2
          style={{
            fontSize: isMobile ? 24 : 28,
            marginBottom: 25,
            color: githubColors.textPrimary,
            fontWeight: 600,
            borderBottom: `1px solid ${githubColors.border}`,
            paddingBottom: 15,
            marginTop: 0,
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
            alignItems: "stretch",
            marginBottom: 30,
          }}
        >
          <input
            placeholder="Enter GitHub username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 6,
              background: githubColors.backgroundSecondary,
              color: githubColors.textPrimary,
              border: `1px solid ${githubColors.border}`,
              outline: "none",
              fontSize: 16,
              width: "100%",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = githubColors.selectedBorder)
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = githubColors.border)
            }
          />

          <button
            onClick={fetchRepos}
            disabled={loading}
            style={{
              padding: "12px 20px",
              background: loading
                ? githubColors.border
                : githubColors.accentBlue,
              border: `1px solid ${githubColors.accentBlue}`,
              color: githubColors.textPrimary,
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontSize: 16,
              width: isMobile ? "100%" : "auto",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#2ea043";
            }}
            onMouseLeave={(e) => {
              if (!loading)
                e.currentTarget.style.background = githubColors.accentBlue;
            }}
          >
            {loading ? "Loading..." : "Fetch Repos"}
          </button>
        </div>

        {/* REPO LIST */}
        <div>
          {repos.map((repo) => {
            const isSelected = selected.includes(repo.url);

            return (
              <div
                key={repo.url}
                onClick={() => toggleSelect(repo)}
                style={{
                  padding: "16px 18px",
                  borderRadius: 6,
                  marginBottom: 10,
                  cursor: "pointer",
                  background: isSelected
                    ? githubColors.selectedBackground
                    : githubColors.backgroundSecondary,
                  border: isSelected
                    ? `1px solid ${githubColors.selectedBorder}`
                    : `1px solid ${githubColors.border}`,
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.border = `1px solid ${githubColors.textSecondary}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = isSelected
                    ? `1px solid ${githubColors.selectedBorder}`
                    : `1px solid ${githubColors.border}`;
                }}
              >
                <b
                  style={{
                    fontSize: 17,
                    color: isSelected
                      ? githubColors.selectedBorder
                      : githubColors.textPrimary,
                  }}
                >
                  {repo.name}
                </b>

                <p
                  style={{
                    margin: "6px 0",
                    color: githubColors.textSecondary,
                    fontSize: 14,
                  }}
                >
                  {repo.description || "No description"}
                </p>

                <span
                  style={{
                    fontSize: 12,
                    padding: "3px 8px",
                    borderRadius: 15,
                    background: githubColors.border,
                    color: githubColors.textSecondary,
                  }}
                >
                  {repo.language || "Unknown"}
                </span>
              </div>
            );
          })}

          {/* IMPORT BUTTON */}
          {repos.length > 0 && (
            <button
              onClick={importProjects}
              style={{
                padding: "14px 22px",
                background: githubColors.importPurple,
                border: "none",
                color: githubColors.textPrimary,
                borderRadius: 6,
                cursor: "pointer",
                marginTop: 25,
                fontWeight: 600,
                fontSize: 16,
                width: isMobile ? "100%" : "auto",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#2d8b10ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = githubColors.importPurple)
              }
            >
              Import Selected Projects →
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
