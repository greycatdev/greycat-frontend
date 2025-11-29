// src/layouts/DashboardLayout.jsx
import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  // ⭐ NEW DEFAULT AVATAR
  const DEFAULT_AVATAR = "https://greycat-backend.onrender.com/default-profile.jpg";

  /* ============================================
     1️⃣ USER STATE + SESSION CACHE
  ============================================ */
  const cachedUser = sessionStorage.getItem("gc_user");
  const [user, setUser] = useState(cachedUser ? JSON.parse(cachedUser) : null);
  const [authLoading, setAuthLoading] = useState(!cachedUser);

  /* ============================================
     2️⃣ GLOBAL USER UPDATE LISTENER
  ============================================ */
  useEffect(() => {
    const sync = () => {
      const updated = sessionStorage.getItem("gc_user");
      updated && setUser(JSON.parse(updated));
    };

    window.addEventListener("gc_user_updated", sync);
    return () => window.removeEventListener("gc_user_updated", sync);
  }, []);

  /* ============================================
     3️⃣ SIDEBAR + SEARCH UI
  ============================================ */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({ users: [], events: [] });
  const [visible, setVisible] = useState(false);

  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  /* ============================================
     4️⃣ AUTH CHECK
  ============================================ */
  useEffect(() => {
    if (cachedUser) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    async function checkAuth() {
      try {
        const res = await API.get("/auth/user");

        if (!mounted) return;

        if (res.data.authenticated) {
          const u = res.data.user;
          u.photo = u.photo || DEFAULT_AVATAR;

          setUser(u);
          sessionStorage.setItem("gc_user", JSON.stringify(u));
        } else {
          sessionStorage.removeItem("gc_user");
          navigate("/login");
          return;
        }
      } catch {
        sessionStorage.removeItem("gc_user");
        navigate("/login");
        return;
      }

      mounted && setAuthLoading(false);
    }

    checkAuth();
    return () => (mounted = false);
  }, []);

  /* ============================================
     5️⃣ SEARCH ENGINE
  ============================================ */
  const runSearch = (value) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!value.trim()) {
      setVisible(false);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      API.get(`/search?q=${value}`).then((res) => {
        // Fix user image fallback
        const updatedResults = {
          ...res.data,
          users: res.data.users.map((u) => ({
            ...u,
            photo: u.photo || DEFAULT_AVATAR,
          })),
        };

        setResults(updatedResults);
        setVisible(true);
      });
    }, 250);
  };

  /* ============================================
     6️⃣ CLICK OUTSIDE HANDLER
  ============================================ */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setVisible(false);

      if (
        isSidebarOpen &&
        e.target.classList.contains("gc-sidebar-backdrop")
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isSidebarOpen]);

  /* ============================================
     7️⃣ ESC CLOSE
  ============================================ */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setVisible(false);
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ============================================
     8️⃣ AUTH LOADING SCREEN
  ============================================ */
  if (authLoading) {
    return (
      <div
        style={{
          padding: 40,
          minHeight: "100vh",
          background: "#0d1117",
          color: "#c9d1d9",
          fontFamily: "Poppins",
        }}
      >
        Checking authentication…
      </div>
    );
  }

  // No user → no page
  if (!user) return null;

  // Guaranteed fallback
  if (!user.photo) user.photo = DEFAULT_AVATAR;

  /* ============================================
     9️⃣ LOGOUT
  ============================================ */
  const handleLogout = () => {
    sessionStorage.removeItem("gc_user");
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/logout`;
  };

  /* ============================================
     🔟 LAYOUT
  ============================================ */
  return (
    <>
      {isSidebarOpen && <div className="gc-sidebar-backdrop" />}

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
          }}
        >
          {/* MOBILE SIDEBAR TOP */}
          <div className="gc-mobile-sidebar-header">
            <div className="gc-brand-left">
              <img src="/icons/greycat.jpeg" className="gc-brand-logo" />
              <span className="gc-brand-text">Greycat</span>
            </div>

            <button
              className="gc-close-mobile"
              onClick={() => setIsSidebarOpen(false)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#c9d1d9",
                fontSize: 24,
              }}
            >
              ×
            </button>
          </div>

          {/* DESKTOP BRAND */}
          <div
            className="gc-desktop-brand"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <img
              src="/icons/greycat.jpeg"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: "1px solid #30363d",
                marginRight: 8,
              }}
            />
            Greycat
          </div>

          <hr
            style={{
              height: 1,
              background: "#30363d",
              border: "none",
              margin: "8px 0 10px",
            }}
          />

          {/* MENU */}
          <SidebarItem label="Home" to="/" icon="home.svg" />
          <SidebarItem label="Explore" to="/explore" icon="explore.svg" />
          <SidebarItem label="Events" to="/events" icon="calendar.svg" />
          <SidebarItem label="Profile" to={`/${user.username}`} icon="user.svg" />
          <SidebarItem label="Projects" to="/projects" icon="folder.svg" />
          <SidebarItem label="Import GitHub" to="/import/github" icon="github.svg" />
          <SidebarItem label="Channels" to="/channels" icon="folder.svg" />
          <SidebarItem label="Create Post" to="/create-post" icon="plus.svg" />
          <SidebarItem label="Add Project" to="/create-project" icon="plus.svg" />
          <SidebarItem label="Settings" to="/settings" icon="settings.svg" />

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

        {/* MAIN */}
        <div className="gc-main">
          {/* MOBILE BRAND */}
          <div className="gc-mobile-brand-top" onClick={() => navigate("/")}>
            <div className="gc-brand-left">
              <img src="/icons/greycat.jpeg" className="gc-brand-logo" />
              <span className="gc-brand-text">Greycat</span>
            </div>
          </div>

          {/* TOPBAR */}
          <div className="gc-topbar">
            {/* Mobile Toggle */}
            <div className="gc-mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <svg width="24" height="24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </div>

            {/* SEARCH BAR */}
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

              {/* Search dropdown */}
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
                    zIndex: 100,
                  }}
                >
                  {results.users.length === 0 &&
                  results.events.length === 0 ? (
                    <p
                      style={{
                        padding: 10,
                        color: "#8b949e",
                        fontSize: 13,
                      }}
                    >
                      No results found
                    </p>
                  ) : (
                    <>
                      {/* Users */}
                      {results.users.length > 0 && (
                        <>
                          <p
                            style={{
                              padding: "6px 10px",
                              fontSize: 11,
                              color: "#6e7681",
                            }}
                          >
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
                                src={u.photo || DEFAULT_AVATAR}
                                onError={(e) => (e.target.src = DEFAULT_AVATAR)}
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

                      {/* Events */}
                      {results.events.length > 0 && (
                        <>
                          <p
                            style={{
                              padding: "6px 10px",
                              fontSize: 11,
                              color: "#6e7681",
                            }}
                          >
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
                    </>
                  )}
                </div>
              )}
            </div>

            {/* TOPBAR AVATAR */}
            <img
              src={user.photo || DEFAULT_AVATAR}
              onError={(e) => (e.target.src = DEFAULT_AVATAR)}
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

          {/* MAIN CONTENT */}
          <main className="gc-main-content">{children}</main>
        </div>
      </div>
    </>
  );
}

/* ============================================
   COMPONENTS
============================================ */

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
