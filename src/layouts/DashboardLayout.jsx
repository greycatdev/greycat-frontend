// src/layouts/DashboardLayout.jsx
import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  // Load cached user instantly → avoids flashing loader
  const cachedUser = JSON.parse(sessionStorage.getItem("gc_user"));
  const [user, setUser] = useState(cachedUser);
  const [checkingAuth, setCheckingAuth] = useState(!cachedUser);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search state
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({ users: [], events: [] });
  const [visible, setVisible] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  /* ---------------- AUTH CHECK (ONE TIME, OPTIMIZED) ---------------- */
  useEffect(() => {
    if (cachedUser) {
      setCheckingAuth(false);
      return;
    }

    async function fetchUser() {
      try {
        const res = await API.get("/auth/user");
        if (res.data.authenticated) {
          setUser(res.data.user);
          sessionStorage.setItem("gc_user", JSON.stringify(res.data.user));
        } else {
          sessionStorage.removeItem("gc_user");
          return navigate("/login");
        }
      } catch {
        sessionStorage.removeItem("gc_user");
        return navigate("/login");
      }
      setCheckingAuth(false);
    }

    fetchUser();
  }, []);

  /* ---------------- QUICK LOADER (ONLY WHILE AUTH CHECKING) ---------------- */
  if (checkingAuth) {
    return (
      <div
        style={{
          padding: 40,
          background: "#0d1117",
          color: "#c9d1d9",
          minHeight: "100vh",
          fontFamily: "Poppins",
        }}
      >
        Checking authentication…
      </div>
    );
  }

  // If still no user → force login
  if (!user) {
    return null;
  }

  /* ---------------- SEARCH LOGIC ---------------- */
  const runSearch = (value) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value.trim()) {
      setVisible(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      API.get(`/search?q=${value}`).then((res) => {
        setResults(res.data);
        setVisible(true);
      });
    }, 300);
  };

  /* CLOSE SEARCH WHEN CLICK OUTSIDE */
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setVisible(false);
      }

      if (
        isSidebarOpen &&
        e.target.classList.contains("gc-sidebar-backdrop")
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isSidebarOpen]);

  /* ESC KEY CLOSE */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
        setVisible(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    sessionStorage.removeItem("gc_user");
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/logout`;
  };

  /* ---------------- LAYOUT UI ---------------- */
  return (
    <>
      {isSidebarOpen && (
        <div
          className="gc-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="gc-layout">
        {/* SIDEBAR */}
        <aside
          className={`gc-sidebar ${isSidebarOpen ? "gc-sidebar--open" : ""}`}
          style={{
            background: "#010409",
            borderRight: "1px solid #30363d",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* MOBILE HEADER */}
          <div className="gc-mobile-sidebar-header">
            <div className="gc-brand-left">
              <img src="/icons/greycat.jpeg" className="gc-brand-logo" />
              <span className="gc-brand-text">Greycat</span>
            </div>
            <button
              className="gc-close-mobile"
              onClick={() => setIsSidebarOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#c9d1d9",
                fontSize: 24,
              }}
            >
              &times;
            </button>
          </div>

          {/* BRAND LOGO */}
          <div
            className="gc-desktop-brand"
            style={{ display: "flex", alignItems: "center", marginBottom: 10 }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid #30363d",
                marginRight: 8,
              }}
            >
              <img
                src="/icons/greycat.jpeg"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            Greycat
          </div>

          <hr
            style={{
              height: 1,
              background: "#30363d",
              border: "none",
              margin: "8px 0 10px 0",
            }}
          />

          <SidebarItem to="/" icon="home.svg" label="Home" />
          <SidebarItem to="/explore" icon="explore.svg" label="Explore" />
          <SidebarItem to="/events" icon="calendar.svg" label="Events" />
          <SidebarItem to={`/${user.username}`} icon="user.svg" label="Profile" />
          <SidebarItem to="/projects" icon="folder.svg" label="Projects" />
          <SidebarItem to="/import/github" icon="github.svg" label="Import GitHub" />
          <SidebarItem to="/channels" icon="folder.svg" label="Channels" />
          <SidebarItem to="/create-post" icon="plus.svg" label="Create Post" />
          <SidebarItem to="/create-project" icon="plus.svg" label="Add Project" />
          <SidebarItem to="/settings" icon="settings.svg" label="Settings" />

          <div style={{ flexGrow: 1 }} />

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              background: "#21262d",
              border: "1px solid #30363d",
              color: "#f0f6fc",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f85149";
              e.currentTarget.style.borderColor = "#ff7b72";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#21262d";
              e.currentTarget.style.borderColor = "#30363d";
            }}
          >
            Logout
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <div className="gc-main">
          {/* MOBILE TOP BRAND */}
          <div className="gc-mobile-brand-top" onClick={() => navigate("/")}>
            <div className="gc-brand-left">
              <img src="/icons/greycat.jpeg" className="gc-brand-logo" />
              <span className="gc-brand-text">Greycat</span>
            </div>
          </div>

          {/* TOPBAR */}
          <div className="gc-topbar">
            {/* SIDEBAR TOGGLE */}
            <div className="gc-mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <svg width="24" height="24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </div>

            {/* SEARCH */}
            <div
              style={{ position: "relative", flex: 1, margin: "0 10px" }}
              ref={searchRef}
            >
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  runSearch(e.target.value);
                }}
                placeholder="Search users, events…"
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "#0d1117",
                  border: "1px solid #30363d",
                  color: "#c9d1d9",
                }}
              />

              {visible && (
                <div
                  style={{
                    position: "absolute",
                    top: 34,
                    width: "100%",
                    background: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: 6,
                    maxHeight: 320,
                    overflowY: "auto",
                  }}
                >
                  {/* USERS */}
                  {results.users.length > 0 && (
                    <>
                      <p style={{ padding: "6px 10px", fontSize: 11, color: "#6e7681" }}>
                        Users
                      </p>

                      {results.users.map((u) => (
                        <SearchItem
                          key={u._id}
                          onClick={() => {
                            navigate(`/${u.username}`);
                            setVisible(false);
                          }}
                        >
                          <img
                            src={u.photo}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          @{u.username}
                        </SearchItem>
                      ))}
                    </>
                  )}

                  {/* EVENTS */}
                  {results.events.length > 0 && (
                    <>
                      <p style={{ padding: "6px 10px", fontSize: 11, color: "#6e7681" }}>
                        Events
                      </p>

                      {results.events.map((ev) => (
                        <SearchItem
                          key={ev._id}
                          onClick={() => {
                            navigate(`/event/${ev._id}`);
                            setVisible(false);
                          }}
                        >
                          {ev.title}
                        </SearchItem>
                      ))}
                    </>
                  )}

                  {/* EMPTY */}
                  {results.users.length === 0 &&
                    results.events.length === 0 && (
                      <p style={{ padding: 10, color: "#8b949e", fontSize: 13 }}>
                        No results found
                      </p>
                    )}
                </div>
              )}
            </div>

            {/* USER AVATAR */}
            <img
              src={user.photo}
              onClick={() => navigate(`/${user.username}`)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #30363d",
                cursor: "pointer",
                objectFit: "cover",
              }}
            />
          </div>

          <main className="gc-main-content">{children}</main>
        </div>
      </div>
    </>
  );
}

/* ---------------- SUB COMPONENTS ---------------- */

function SidebarItem({ to, icon, label }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 8px",
        borderRadius: 6,
        fontSize: 14,
        color: "#c9d1d9",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#161b22")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <img
        src={`/icons/${icon}`}
        width="18"
        height="18"
        style={{ opacity: 0.9, filter: "invert(80%)" }}
      />
      {label}
    </Link>
  );
}

function SearchItem({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "6px 10px",
        display: "flex",
        gap: 8,
        cursor: "pointer",
        color: "#c9d1d9",
        fontSize: 13,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#21262d")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </div>
  );
}
