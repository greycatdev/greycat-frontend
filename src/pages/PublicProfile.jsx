// src/pages/PublicProfile.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  /* ----------------- Responsive Listener ----------------- */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------------- Load logged-in user ---------------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setLoggedInUser(res.data.user);
    });
  }, []);

  /* ---------------- Load profile ---------------- */
  useEffect(() => {
    if (!username) return;

    async function loadProfile() {
      try {
        const res = await API.get(`/user/by-username/${username}`);

        if (!res.data.success) {
          setError("User not found");
          setLoading(false);
          return;
        }

        setProfileUser(res.data.user);

        const [followStatus, followers, following] = await Promise.all([
          API.get(`/follow/status/${username}`),
          API.get(`/follow/followers/${username}`),
          API.get(`/follow/following/${username}`),
        ]);

        setIsFollowing(followStatus.data.following || false);
        setFollowersCount(followers.data.followers?.length || 0);
        setFollowingCount(following.data.following?.length || 0);

        setLoading(false);
      } catch (err) {
        setError("User not found");
        setLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  /* ---------------- Load Posts ---------------- */
  useEffect(() => {
    API.get(`/post/user/${username}`).then((res) => {
      if (res.data.success) setPosts(res.data.posts);
    });
  }, [username]);

  /* ---------------- Load Projects ---------------- */
  useEffect(() => {
    API.get(`/project/user/${username}`).then((res) => {
      if (res.data.success) setProjects(res.data.projects);
    });
  }, [username]);

  /* ---------------- Follow Actions ---------------- */
  const follow = () => {
    API.post(`/follow/follow/${username}`).then((res) => {
      if (res.data.success) {
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    });
  };

  const unfollow = () => {
    API.post(`/follow/unfollow/${username}`).then((res) => {
      if (res.data.success) {
        setIsFollowing(false);
        setFollowersCount((c) => c - 1);
      }
    });
  };

  /* ---------------- SAFETY ---------------- */

  if (loading)
    return <DashboardLayout>Loading profile…</DashboardLayout>;

  if (error)
    return (
      <DashboardLayout>
        <div style={{ padding: 30 }}>
          <h2 style={{ color: "#ff7b72" }}>{error}</h2>
          <Link to="/" style={{ color: "#58a6ff" }}>Go Home</Link>
        </div>
      </DashboardLayout>
    );

  if (!profileUser)
    return <DashboardLayout>User not found.</DashboardLayout>;

  /* ---------------- UI ---------------- */
  return (
    <DashboardLayout>
      <div
        style={{
          fontFamily: "Poppins",
          padding: "0 14px",
          color: "#c9d1d9",
          maxWidth: 950,
          margin: "0 auto",
        }}
      >
        {/* -----------------------------------------------------
            TOP PROFILE HEADER (Avatar + Name + Follow Button)
        ------------------------------------------------------ */}
        <div
          style={{
            display: "flex",
            gap: 24,
            padding: "25px 0",
            borderBottom: "1px solid #30363d",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
          }}
        >
          <img
            src={profileUser.photo}
            style={{
              width: isMobile ? 100 : 150,
              height: isMobile ? 100 : 150,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #30363d",
            }}
          />

          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 22 : 28,
                color: "#f0f6fc",
              }}
            >
              {profileUser.name}
            </h1>

            <p style={{ margin: "6px 0 4px", color: "#8b949e" }}>
              @{profileUser.username}
            </p>

            {profileUser.preferences?.showEmail && (
              <p style={{ color: "#8b949e" }}>{profileUser.email}</p>
            )}

            {/* Follow Button */}
            <div style={{ marginTop: 10 }}>
              {loggedInUser?.username === profileUser.username ? (
                <button style={btnPrimary} onClick={() => navigate("/edit-profile")}>
                  Edit Profile
                </button>
              ) : (
                <button
                  style={isFollowing ? btnSecondary : btnPrimary}
                  onClick={isFollowing ? unfollow : follow}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------
            STATS ROW
        ------------------------------------------------------ */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "space-around",
            textAlign: "center",
            fontSize: 15,
          }}
        >
          <span><b>{posts.length}</b> posts</span>
          <span><b>{followersCount}</b> followers</span>
          <span><b>{followingCount}</b> following</span>
        </div>

        {/* BIO */}
        {profileUser.bio && (
          <p style={{ marginTop: 18, color: "#b3b3b3", lineHeight: 1.6 }}>
            {profileUser.bio}
          </p>
        )}

        {/* SOCIAL LINKS */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {profileUser.social?.github && <a style={socialLink} href={profileUser.social.github}>GitHub</a>}
          {profileUser.social?.linkedin && <a style={socialLink} href={profileUser.social.linkedin}>LinkedIn</a>}
          {profileUser.social?.instagram && <a style={socialLink} href={profileUser.social.instagram}>Instagram</a>}
          {profileUser.social?.website && <a style={socialLink} href={profileUser.social.website}>Website</a>}
        </div>

        {/* -----------------------------------------------------
            SKILLS
        ------------------------------------------------------ */}
        {profileUser.skills?.length > 0 && (
          <div style={{ marginTop: 35 }}>
            <h3 style={sectionTitle}>Skills</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {profileUser.skills.map((skill) => (
                <span key={skill} style={skillChip}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------
            PROJECTS
        ------------------------------------------------------ */}
        {profileUser.preferences?.showProjects !== false && (
          <div style={{ marginTop: 45 }}>
            <h3 style={sectionTitle}>Projects</h3>

            {projects.length === 0 ? (
              <p style={{ color: "#8b949e" }}>No projects yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: 20,
                }}
              >
                {projects.map((proj) => (
                  <div
                    key={proj._id}
                    style={projectCard}
                    onClick={() => navigate(`/project/${proj._id}`)}
                  >
                    <h4 style={{ margin: "6px 0", color: "#f0f6fc" }}>
                      {proj.title}
                    </h4>
                    <p style={{ color: "#8b949e", fontSize: 13, marginBottom: 4 }}>
                      {Array.isArray(proj.tech) ? proj.tech.join(", ") : proj.tech}
                    </p>

                    {proj.user && (
                      <p style={{ color: "#8b949e", fontSize: 12 }}>
                        @{proj.user.username}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------
            POSTS
        ------------------------------------------------------ */}
        <div style={{ marginTop: 55, marginBottom: 40 }}>
          <h3 style={sectionTitle}>Posts</h3>

          {posts.length === 0 ? (
            <p style={{ color: "#8b949e" }}>No posts yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {posts.map((p) => (
                <img
                  key={p._id}
                  src={p.image}
                  style={{
                    width: "100%",
                    height: isMobile ? 150 : 240,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid #30363d",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/post/${p._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ------------------- STYLES ------------------- */

const btnPrimary = {
  padding: "8px 16px",
  background: "#238636",
  border: "1px solid #2ea043",
  color: "white",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};

const btnSecondary = {
  padding: "8px 16px",
  background: "#21262d",
  border: "1px solid #30363d",
  color: "#c9d1d9",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};

const sectionTitle = {
  fontSize: 18,
  color: "#f0f6fc",
  marginBottom: 12,
};

const socialLink = {
  color: "#58a6ff",
  textDecoration: "none",
  fontSize: 14,
};

const skillChip = {
  padding: "6px 12px",
  background: "#161b22",
  borderRadius: 8,
  border: "1px solid #30363d",
  fontSize: 14,
};

const projectCard = {
  padding: 14,
  borderRadius: 10,
  background: "#0d1117",
  border: "1px solid #30363d",
  cursor: "pointer",
  transition: "0.25s",
};

