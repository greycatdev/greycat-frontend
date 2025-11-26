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

  /* ----------------- Screen Resize Listener ----------------- */
  useEffect(() => {
    const resizeHandler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  /* ---------------- Load logged-in user ---------------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setLoggedInUser(res.data.user);
    });
  }, []);

  /* ---------------- Load profile user ---------------- */
  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const res = await API.get(`/user/by-username/${username}`);
        if (!res.data.success) {
          setError("User not found");
          setLoading(false);
          return;
        }

        setProfileUser(res.data.user);

        API.get(`/follow/status/${username}`).then((r) =>
          setIsFollowing(r.data.success ? r.data.following : false)
        );
        API.get(`/follow/followers/${username}`).then((r) =>
          setFollowersCount(r.data.success ? r.data.followers.length : 0)
        );
        API.get(`/follow/following/${username}`).then((r) =>
          setFollowingCount(r.data.success ? r.data.following.length : 0)
        );

        setLoading(false);
      } catch {
        setError("User not found");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  /* ---------------- Load posts ---------------- */
  useEffect(() => {
    API.get(`/post/user/${username}`).then((res) => {
      if (res.data.success && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      }
    });
  }, [username]);

  /* ---------------- Load projects ---------------- */
  useEffect(() => {
    API.get(`/project/user/${username}`).then((res) => {
      if (res.data.success && Array.isArray(res.data.projects)) {
        setProjects(res.data.projects);
      }
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

  /* ---------------- SAFETY CHECKS ---------------- */
  if (loading)
    return <DashboardLayout>Loading profile...</DashboardLayout>;

  if (error)
    return (
      <DashboardLayout>
        <h2 style={{ color: "#f85149" }}>{error}</h2>
        <Link to="/" style={{ color: "#58a6ff" }}>Go Back Home</Link>
      </DashboardLayout>
    );

  if (!profileUser) return <DashboardLayout>User not found.</DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "Poppins", padding: "0 12px", color: "#c9d1d9" }}>

        {/* =====================================================
            INSTAGRAM-STYLE HEADER
        ====================================================== */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 20,
            paddingBottom: 25,
            borderBottom: "1px solid #30363d",
          }}
        >
          {/* Avatar */}
          <img
            src={profileUser.photo}
            alt={profileUser.name}
            style={{
              width: isMobile ? 90 : 140,
              height: isMobile ? 90 : 140,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #30363d",
            }}
          />

          {/* Right Section */}
          <div style={{ flex: 1 }}>
            {/* Name */}
            <h1 style={{ margin: 0, color: "#c9d1d9", fontSize: isMobile ? 20 : 26 }}>
              {profileUser.name}
            </h1>

            {/* Username */}
            <p style={{ margin: "4px 0", color: "#8b949e", fontSize: 14 }}>
              @{profileUser.username}
            </p>

            {/* Email */}
            {profileUser.preferences?.showEmail && (
              <p style={{ color: "#8b949e", fontSize: 14 }}>
                {profileUser.email}
              </p>
            )}

            {/* Follow / Edit */}
            <div style={{ marginTop: 10, width: isMobile ? "100%" : "auto" }}>
              {loggedInUser?.username === profileUser.username ? (
                <button
                  onClick={() => navigate("/edit-profile")}
                  style={{ ...btnPrimary, width: isMobile ? "100%" : "auto" }}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={isFollowing ? unfollow : follow}
                  style={{
                    ...(isFollowing ? btnSecondary : btnPrimary),
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-around",
            color: "#c9d1d9",
            fontSize: 15,
          }}
        >
          <span><b>{posts.length}</b> posts</span>
          <span><b>{followersCount}</b> followers</span>
          <span><b>{followingCount}</b> following</span>
        </div>

        {/* BIO */}
        {profileUser.bio && (
          <p style={{ marginTop: 18, fontSize: 15, color: "#b3b3b3" }}>
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
          {profileUser.social?.github && (
            <a href={profileUser.social.github} style={socialLink}>GitHub</a>
          )}
          {profileUser.social?.linkedin && (
            <a href={profileUser.social.linkedin} style={socialLink}>LinkedIn</a>
          )}
          {profileUser.social?.instagram && (
            <a href={profileUser.social.instagram} style={socialLink}>Instagram</a>
          )}
          {profileUser.social?.website && (
            <a href={profileUser.social.website} style={socialLink}>Website</a>
          )}
        </div>

        {/* ---------------- SKILLS ---------------- */}
        {profileUser.skills?.length > 0 && (
          <div style={{ marginTop: 35 }}>
            <h3 style={sectionTitle}>Skills</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {profileUser.skills.map((s) => (
                <span key={s} style={skillChip}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- PROJECTS ---------------- */}
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
                  proj ? (
                    <div
                      key={proj._id}
                      onClick={() => navigate(`/project/${proj._id}`)}
                      style={projectCard}
                    >
                      <h4 style={{ margin: "10px 0", color: "#c9d1d9" }}>
                        {proj.title}
                      </h4>

                      <p style={{ fontSize: 13, color: "#8b949e" }}>
                        {Array.isArray(proj.tech) ? proj.tech.join(", ") : proj.tech}
                      </p>

                      {/* SAFETY: user may be missing */}
                      {proj.user && (
                        <p style={{ color: "#8b949e", fontSize: 12 }}>
                          @{proj.user.username}
                        </p>
                      )}
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- POSTS ---------------- */}
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
              {posts.map((post) =>
                post ? (
                  <img
                    key={post._id}
                    src={post.image}
                    style={{
                      ...postCard,
                      height: isMobile ? 150 : 240,
                    }}
                    onClick={() => navigate(`/post/${post._id}`)}
                  />
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ------------------- STYLES ------------------- */

const btnPrimary = {
  padding: "8px 14px",
  background: "#238636",
  border: "1px solid #2ea043",
  color: "white",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};

const btnSecondary = {
  padding: "8px 14px",
  background: "#21262d",
  border: "1px solid #30363d",
  color: "#c9d1d9",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
};

const sectionTitle = {
  color: "#c9d1d9",
  marginBottom: 12,
  fontSize: 18,
  fontWeight: 600,
};

const socialLink = {
  color: "#58a6ff",
  textDecoration: "none",
  fontSize: 14,
};

const skillChip = {
  background: "#161b22",
  padding: "6px 12px",
  borderRadius: 6,
  color: "#c9d1d9",
  border: "1px solid #30363d",
  fontSize: 14,
};

const projectCard = {
  border: "1px solid #30363d",
  background: "#0d1117",
  borderRadius: 10,
  padding: 14,
  cursor: "pointer",
  transition: "0.2s ease",
};

const postCard = {
  width: "100%",
  objectFit: "cover",
  borderRadius: 6,
  cursor: "pointer",
  border: "1px solid #30363d",
};
