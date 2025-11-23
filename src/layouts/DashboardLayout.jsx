import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // SEARCH STATE
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({ users: [], events: [] });
  const [visible, setVisible] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // MOBILE SIDEBAR
  const [mobileOpen, setMobileOpen] = useState(false);

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

  /* -------------- CLOSE SEARCH ON CLICK OUTSIDE -------------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* -------------- ESC KEY -------------- */
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setVisible(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (!res.data.authenticated) return navigate("/login");
      setUser(res.data.user);
    });
  }, []);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/logout`, {
        credentials: "include",
      });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  if (!user)
    return (
      <div
        style={{
          padding: 40,
          background: "#0d1117",
          color: "#c9d1d9",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    );

  return (
    <div className="gc-layout">
      {/* ===== MOBILE BACKDROP ===== */}
      {mobileOpen && (
        <div
          className="gc-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`gc-sidebar ${mobileOpen ? "gc-sidebar--open" : ""}`}
        style={{
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* SIDEBAR HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 10,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#161b22",
                border: "1px solid #30363d",
                marginRight: 8,
              }}
            >
              <img
                src="/icons/greycat.jpeg"
                alt="greycat"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            Greycat
          </div>

          {/* CLOSE (mobile only) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="gc-close-mobile"
            style={{
              border: "none",
              background: "transparent",
              color: "#8b949e",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <hr
          style={{
            border: "none",
            height: 1,
            background: "#30363d",
            margin: "8px 0 10px 0",
          }}
        />

        {/* SIDEBAR LINKS */}
        <SidebarItem
          to="/"
          icon="home.svg"
          label="Home"
          onClickMobile={() => setMobileOpen(false)}
        />
        <SidebarItem
          to="/explore"
          icon="explore.svg"
          label="Explore"
          onClickMobile={() => setMobileOpen(false)}
        />
        <SidebarItem
          to="/events"
          icon="calendar.svg"
          label="Events"
          onClickMobile={() => setMobileOpen(false)}
        />
        <SidebarItem
          to={`/${user.username}`}
          icon="user.svg"
          label="Profile"
          onClickMobile={() => setMobileOpen(false)}
        />
        <SidebarItem
          to="/projects"
          icon="folder.svg"
          label="Projects"
          onClickMobile={() => setMobileOpen(false)}
        />
        <SidebarItem
          to="/import/github"
          icon="github.svg"
          label="Import GitHub"
          onClickMobile={() => setMobileOpen(false)}
        />
        <SidebarItem
          to="/channels"
          icon="folder.svg"
          label="Channels"
          onClickMobile={() => setMobileOpen(false)}
        />
        <SidebarItem
          to="/create-post"
          icon="plus.svg"
          label="Create Post"
          onClickMobile={() => setMobileOpen(false)}
        />
        <SidebarItem
          to="/create-project"
          icon="plus.svg"
          label="Add Project"
          onClickMobile={() => setMobileOpen(false)}
        />
        <SidebarItem
          to="/settings"
          icon="settings.svg"
          label="Settings"
          onClickMobile={() => setMobileOpen(false)}
        />

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
        >
          Logout
        </button>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="gc-main">
        {/* MOBILE BRAND BAR */}
        <div className="gc-mobile-brand">
          <div className="gc-brand-left" onClick={() => navigate("/")}>
            <img src="/icons/greycat.jpeg" className="gc-brand-logo" />
            <span className="gc-brand-text">GreyCat</span>
          </div>
        </div>

        {/* TOPBAR */}
        <div className="gc-topbar">
          {/* LEFT SIDE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
            }}
          >
            {/* Hamburger */}
            <button
              className="gc-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 20,
                color: "#c9d1d9",
              }}
            >
              ☰
            </button>

            {/* Search */}
            <div
              style={{ width: "100%", position: "relative", maxWidth: 480 }}
              ref={searchRef}
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

              {/* Search results */}
              {visible && (
                <div
                  style={{
                    position: "absolute",
                    top: "34px",
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
                    <p style={{ padding: 10, color: "#8b949e", fontSize: 13 }}>
                      No results found
                    </p>
                  ) : (
                    <>
                      {results.users.length > 0 && (
                        <div>
                          <p
                            style={{
                              padding: 6,
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
                                setSearch("");
                              }}
                            >
                              <img
                                src={u.photo}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
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
                              padding: 6,
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
                                setSearch("");
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
          </div>

          {/* Avatar */}
          <img
            src={user.photo}
            onClick={() => navigate(`/${user.username}`)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: "pointer",
              border: "1px solid #30363d",
              marginLeft: 12,
            }}
          />
        </div>

        {/* PAGE CONTENT */}
        <main className="gc-main-content">{children}</main>
      </div>
    </div>
  );
}

/* ============ SIDEBAR ITEM ============ */
function SidebarItem({ to, icon, label, onClickMobile }) {
  return (
    <Link
      to={to}
      onClick={onClickMobile}
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
    >
      <img
        src={`/icons/${icon}`}
        width={18}
        height={18}
        style={{ filter: "invert(80%)" }}
      />
      {label}
    </Link>
  );
}

/* ============ SEARCH ITEM ============ */
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
      }}
    >
      {children}
    </div>
  );
}
