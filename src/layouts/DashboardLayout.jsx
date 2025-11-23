// src/layouts/DashboardLayout.jsx
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

  /* -------------- ESC KEY CLOSES SEARCH -------------- */
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && setVisible(false);
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
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0d1117", // GitHub dark background
        color: "#c9d1d9",
        fontFamily: "Poppins, system-ui, sans-serif",
      }}
    >
      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          width: 250,
          background: "#010409", // GitHub sidebar / header color
          borderRight: "1px solid #30363d",
          padding: "18px 18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Logo / title */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 10 }}
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
              overflow: "hidden", // VERY IMPORTANT to make logo round
            }}
          >
            <img
              src="/icons/greycat.jpeg"
              alt="greycat"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          Greycat
        </div>

        <hr
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

        {/* Logout button (GitHub danger style) */}
        <button
  onClick={() =>
    (window.location.href = "https://greycat-backend.onrender.com/auth/logout")
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* -------- TOP NAV -------- */}
        <div
          style={{
            padding: "8px 18px",
            background: "#010409",
            borderBottom: "1px solid #30363d",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Search */}
          <div style={{ width: "50%", position: "relative" }} ref={searchRef}>
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
                            onClick={() => navigate(`/${u.username}`)}
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
                            onClick={() => navigate(`/event/${ev._id}`)}
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
        <main
          style={{
            padding: 24,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/* ================= SIDEBAR ITEM COMPONENT ================= */
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

/* ================= SEARCH ITEM COMPONENT ================= */
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
