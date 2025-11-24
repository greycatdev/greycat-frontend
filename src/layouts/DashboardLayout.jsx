// src/layouts/DashboardLayout.jsx
import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  /* -------------- CLOSE SEARCH ON CLICK OUTSIDE (and sidebar) -------------- */
  useEffect(() => {
    const handleClick = (e) => {
      // Close search dropdown if click is outside search bar
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setVisible(false);
      }

      // Close sidebar if it's open and click is on the backdrop
      const isClickOnBackdrop = e.target.classList.contains('gc-sidebar-backdrop');
      if (isSidebarOpen && isClickOnBackdrop) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isSidebarOpen]);

  /* -------------- ESC KEY CLOSES SEARCH AND SIDEBAR -------------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setVisible(false);
        setIsSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ---------------- LOAD AUTH USER ---------------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (!res.data.authenticated) return navigate("/login");
      setUser(res.data.user);
    });
  }, []);

  if (!user)
    return (
      <div
        style={{
          padding: 40,
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "#0d1117",
          color: "#c9d1d9",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    );

  return (
    <>
      {/* Mobile Sidebar Backdrop - ONLY visible when isSidebarOpen */}
      {isSidebarOpen && <div className="gc-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Layout Container */}
      <div className="gc-layout">

        {/* ================= SIDEBAR ================= */}
        <aside
          className={`gc-sidebar ${isSidebarOpen ? 'gc-sidebar--open' : ''}`}
          style={{
              background: "#010409",
              borderRight: "1px solid #30363d",
              padding: "18px 18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
          }}
        >
          {/* 1. Mobile Sidebar Header (Brand + Close Button) - Shown only when sidebar is open on mobile */}
          <div className="gc-mobile-sidebar-header">
            <div className="gc-brand-left">
              <img
                src="/icons/greycat.jpeg"
                className="gc-brand-logo"
                alt="Greycat Logo"
              />
              <span className="gc-brand-text">Greycat</span>
            </div>
            <button
              className="gc-close-mobile"
              onClick={() => setIsSidebarOpen(false)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#c9d1d9', fontSize: 24, cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>


          {/* 2. Desktop Brand/Logo (Hidden on Mobile) */}
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
                overflow: "hidden",
              }}
            >
              <img
                src="/icons/greycat.jpeg"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            Greycat
          </div>

          {/* HR separator (hidden on mobile via CSS) */}
          <hr
            className="gc-sidebar-hr"
            style={{
              border: "none",
              height: 1,
              background: "#30363d",
              margin: "8px 0 10px 0",
            }}
          />

          <SidebarItem to="/" label="Home" icon="home.svg" />
          <SidebarItem to="/explore" label="Explore" icon="explore.svg" />
          <SidebarItem to="/events" label="Events" icon="calendar.svg" />
          <SidebarItem to={`/${user.username}`} label="Profile" icon="user.svg" />
          <SidebarItem to="/projects" label="Projects" icon="folder.svg" />
          <SidebarItem
            to="/import/github"
            label="Import GitHub"
            icon="github.svg"
          />
          <SidebarItem to="/channels" label="Channels" icon="folder.svg" />
          <SidebarItem to="/create-post" label="Create Post" icon="plus.svg" />
          <SidebarItem to="/create-project" label="Add Project" icon="plus.svg" />
          <SidebarItem to="/settings" label="Settings" icon="settings.svg" />

          <div style={{ flexGrow: 1 }} />

          {/* Logout button */}
          <button
  onClick={() =>
    (window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/logout`)
  }
  style={{
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    textAlign: "center",
    color: "#f0f6fc",
    background: "#21262d",
    border: "1px solid #30363d",
    fontSize: 13,
    fontWeight: 500,
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

        {/* ================= MAIN AREA ================= */}
        <div className="gc-main">

          {/* -------- NEW MOBILE TOP NAVBAR (User Request) -------- */}
          <div className="gc-mobile-brand-top" onClick={() => navigate('/')}>
            <div className="gc-brand-left">
              <img
                src="/icons/greycat.jpeg"
                className="gc-brand-logo"
                alt="Greycat Logo"
              />
              <span className="gc-brand-text">Greycat</span>
            </div>
          </div>
          {/* -------- TOP NAV (Search, Toggle, Avatar) -------- */}
          <div className="gc-topbar">
            {/* Mobile Hamburger Icon */}
            <div className="gc-mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                  style={{ display: 'block' }}
              >
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </div>

            {/* Search container - takes up remaining space */}
            <div
                style={{ position: "relative", flex: 1, margin: '0 10px' }}
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
                  fontSize: 14,
                  background: "#0d1117",
                  color: "#c9d1d9",
                  outline: "none",
                }}
              />

              {/* Search dropdown */}
              {visible && (
                <div
                  style={{
                    position: "absolute",
                    top: "34px",
                    width: "100%",
                    background: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: 6,
                    boxShadow: "0 8px 24px rgba(1,4,9,0.85)",
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
                      {/* USERS SECTION */}
                      {results.users.length > 0 && (
                        <div>
                          <p
                            style={{
                              padding: "6px 10px",
                              fontSize: 11,
                              color: "#6e7681",
                              textTransform: "uppercase",
                              letterSpacing: 0.04,
                            }}
                          >
                            Users
                          </p>

                          {results.users.map((u) => (
                            <SearchItem
                              key={u._id}
                              onClick={() => {
                                navigate(`/${u.username}`);
                                setVisible(false); // Close search dropdown
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

                      {/* EVENTS SECTION */}
                      {results.events.length > 0 && (
                        <div>
                          <p
                            style={{
                              padding: "6px 10px",
                              fontSize: 11,
                              color: "#6e7681",
                              textTransform: "uppercase",
                              letterSpacing: 0.04,
                            }}
                          >
                            Events
                          </p>

                          {results.events.map((ev) => (
                            <SearchItem
                              key={ev._id}
                              onClick={() => {
                                navigate(`/event/${ev._id}`);
                                setVisible(false); // Close search dropdown
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

            {/* Avatar */}
            <img
              src={user.photo}
              onClick={() => navigate(`/${user.username}`)}
              alt="avatar"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",
                border: "1px solid #30363d",
              }}
            />
          </div>

          {/* -------- PAGE CONTENT -------- */}
          <main className="gc-main-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

// SidebarItem and SearchItem components remain the same...
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
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#161b22";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <img
          src={`/icons/${icon}`}
          width="18"
          height="18"
          style={{ opacity: 0.9, filter: "invert(80%)" }}
          alt=""
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
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {children}
      </div>
    );
  }

