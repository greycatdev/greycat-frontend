// src/layouts/DashboardLayout.jsx
import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // ⭐ FIX

  // MOBILE SIDEBAR STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // SEARCH STATE
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({ users: [], events: [] });
  const [visible, setVisible] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  /* ---------------- SEARCH LOGIC ---------------- */
  const runSearch = (value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

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

  /* CLOSE SEARCH ON CLICK OUTSIDE */
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setVisible(false);
      }
      const isClickOnBackdrop = e.target.classList.contains("gc-sidebar-backdrop");
      if (isSidebarOpen && isClickOnBackdrop) {
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
        setVisible(false);
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ---------------- LOAD AUTH USER (SAFE) ---------------- */
  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await API.get("/auth/user");
        if (!mounted) return;

        if (res.data.authenticated) {
          setUser(res.data.user);
        } else {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    check();
    return () => (mounted = false);
  }, []);

  if (authLoading) {
    return (
      <div
        style={{
          padding: 40,
          background: "#0d1117",
          color: "#c9d1d9",
          fontFamily: "Poppins",
          minHeight: "100vh",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  if (!user)
    return (
      <div
        style={{
          padding: 40,
          background: "#0d1117",
          color: "#c9d1d9",
          fontFamily: "Poppins",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    );

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
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Mobile Sidebar Header */}
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
                cursor: "pointer",
              }}
            >
              &times;
            </button>
          </div>

          {/* Desktop Brand */}
          <div
            className="gc-desktop-brand"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#161b22",
                border: "1px solid #30363d",
                overflow: "hidden",
                marginRight: 8,
              }}
            >
              <img
                src="/icons/greycat.jpeg"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            Greycat
          </div>

          <hr
            className="gc-sidebar-hr"
            style={{
              height: 1,
              background: "#30363d",
              border: "none",
              margin: "8px 0 10px 0",
            }}
          />

          <SidebarItem to="/" label="Home" icon="home.svg" />
          <SidebarItem to="/explore" label="Explore" icon="explore.svg" />
          <SidebarItem to="/events" label="Events" icon="calendar.svg" />
          <SidebarItem to={`/${user.username}`} label="Profile" icon="user.svg" />
          <SidebarItem to="/projects" label="Projects" icon="folder.svg" />
          <SidebarItem to="/import/github" label="Import GitHub" icon="github.svg" />
          <SidebarItem to="/channels" label="Channels" icon="folder.svg" />
          <SidebarItem to="/create-post" label="Create Post" icon="plus.svg" />
          <SidebarItem to="/create-project" label="Add Project" icon="plus.svg" />
          <SidebarItem to="/settings" label="Settings" icon="settings.svg" />

          <div style={{ flexGrow: 1 }} />

          {/* Logout */}
          <button
            onClick={() =>
              (window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/logout`)
            }
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              color: "#f0f6fc",
              background: "#21262d",
              border: "1px solid #30363d",
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

        {/* MAIN AREA */}
        <div className="gc-main">
          <div
            className="gc-mobile-brand-top"
            onClick={() => navigate("/")}
          >
            <div className="gc-brand-left">
              <img src="/icons/greycat.jpeg" className="gc-brand-logo" />
              <span className="gc-brand-text">Greycat</span>
            </div>
          </div>

          {/* TOPBAR */}
          <div className="gc-topbar">
            <div
              className="gc-mobile-toggle"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </div>

            <div
              style={{ position: "relative", flex: 1, margin: "0 10px" }}
              ref={searchRef}
              className="gc-search-container"
            >
              <input
                placeholder="Search users, events..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  runSearch(e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #30363d",
                  background: "#0d1117",
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
                    zIndex: 100,
                  }}
                >
                  {results.users.length === 0 && results.events.length === 0 ? (
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
                      {results.users.length > 0 && (
                        <div>
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
                                src={u.photo}
                                alt={u.username}
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
                        </div>
                      )}

                      {results.events.length > 0 && (
                        <div>
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
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <img
              src={user.photo}
              onClick={() => navigate(`/${user.username}`)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                border: "1px solid #30363d",
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

function SidebarItem({ to, icon, label }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 8px",
        fontSize: 14,
        color: "#c9d1d9",
        borderRadius: 6,
        marginBottom: 2,
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#161b22";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }} // ⭐ FIXED THIS
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
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontSize: 13,
        color: "#c9d1d9",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#21262d")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} // ⭐ FIXED THIS
    >
      {children}
    </div>
  );
}
