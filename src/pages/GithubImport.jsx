import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { API } from "../api";

export default function GithubImport() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  // Define GitHub-style dark mode colors
  const githubColors = {
    // Primary background
    backgroundPrimary: "#0D1117",
    // Secondary background (for input, repo items)
    backgroundSecondary: "#161B22",
    // Text color
    textPrimary: "#C9D1D9",
    // Subtle text/description color
    textSecondary: "#8B949E",
    // Border color
    border: "#30363D",
    // Accent/Link color (used for 'Fetch Repos' button)
    accentBlue: "#238636", // A green similar to GitHub's primary button
    // Import button color
    importPurple: "#087423ff", // A purple/pink for the import action
    // Selected repo highlight color
    selectedBackground: "rgba(51, 255, 36, 0.04)",
    selectedBorder: "#1bd478ff",
  };

  /* ------------------------------------------------------
      FETCH REPOSITORIES
  ------------------------------------------------------ */
  const fetchRepos = async () => {
    if (!username.trim()) return alert("Enter a GitHub username!");

    setLoading(true);
    const res = await API.get(`/github/repos/${username}`);
    setLoading(false);

    if (res.data.success) setRepos(res.data.repos);
    else alert("GitHub user not found");
  };

  /* ------------------------------------------------------
      SELECT / UNSELECT REPO
  ------------------------------------------------------ */
  const toggleSelect = (repo) => {
    if (selected.includes(repo.url)) {
      setSelected(selected.filter((r) => r !== repo.url));
    } else {
      setSelected([...selected, repo.url]);
    }
  };

  /* ------------------------------------------------------
      IMPORT SELECTED
  ------------------------------------------------------ */
  const importProjects = async () => {
    if (selected.length === 0)
      return alert("Select at least 1 repository!");

    const selectedRepos = repos.filter((r) => selected.includes(r.url));

    const res = await API.post("/github/import", {
      repos: selectedRepos,
    });

    if (res.data.success) {
      alert("Projects imported!");
      window.location.href = "/projects";
    } else {
      alert("Import failed");
    }
  };

  return (
    // Assuming DashboardLayout sets the main background to backgroundPrimary
    <DashboardLayout>
      <div 
        style={{ 
          maxWidth: 700, 
          margin: "0 auto", 
          fontFamily: "sans-serif", // Using a common web font like GitHub
          color: githubColors.textPrimary 
        }}
      >
        
        {/* TITLE */}
        <h2
          style={{
            fontSize: 28,
            marginBottom: 25,
            color: githubColors.textPrimary,
            fontWeight: 600,
            borderBottom: `1px solid ${githubColors.border}`, // Subtle separator
            paddingBottom: 15,
            marginTop: 0,
          }}
        >
          Import from GitHub
        </h2>

        {/* USERNAME INPUT */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
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
              borderRadius: 6, // Slightly smaller radius
              background: githubColors.backgroundSecondary,
              color: githubColors.textPrimary,
              border: `1px solid ${githubColors.border}`,
              outline: "none",
              fontSize: 16,
              // Focus state similar to GitHub
              boxShadow: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = githubColors.selectedBorder)}
            onBlur={(e) => (e.currentTarget.style.borderColor = githubColors.border)}
          />

          <button
            onClick={fetchRepos}
            disabled={loading}
            style={{
              padding: "12px 20px",
              background: loading ? githubColors.border : githubColors.accentBlue,
              border: `1px solid ${githubColors.accentBlue}`,
              color: githubColors.textPrimary,
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : "pointer",
              fontWeight: 500,
              fontSize: 16,
              transition: "0.2s",
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#2ea043"; // Darker green on hover
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = githubColors.accentBlue;
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
                    e.currentTarget.style.border =
                      `1px solid ${githubColors.textSecondary}`; // Slightly brighter border on hover
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

                <p style={{ margin: "6px 0 6px 0", color: githubColors.textSecondary, fontSize: 14 }}>
                  {repo.description || "No description"}
                </p>

                <span
                  style={{
                    fontSize: 12,
                    padding: "3px 8px",
                    borderRadius: 15, // Pill shape for language tag
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
                transition: "0.2s",
                boxShadow: '0 0 0 transparent',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#2d8b10ff") // Lighter purple on hover
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