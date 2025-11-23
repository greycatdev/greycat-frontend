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
      if (res.data.success) setPosts(res.data.posts);
    });
  }, [username]);

  /* ---------------- Load projects ---------------- */
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

  /* ---------------- LOADING / ERROR ---------------- */
  if (loading) return <DashboardLayout>Loading profile...</DashboardLayout>;

  if (error)
    return (
      <DashboardLayout>
        <h2 style={{ color: "#f85149" }}>{error}</h2>
        <Link to="/" style={{ color: "#58a6ff" }}>
          Go Back Home
        </Link>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "Poppins" }}>
        {/* ---------------- HEADER ---------------- */}
        <div
          style={{
            display: "flex",
            gap: 30,
            alignItems: "flex-start",
            paddingBottom: 25,
            borderBottom: "1px solid #30363d",
          }}
        >
          <img
            src={profileUser.photo}
            alt={profileUser.name}
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #30363d",
            }}
          />

          <div>
            <h1 style={{ margin: 0, color: "#c9d1d9" }}>
              {profileUser.name}
            </h1>

            <p style={{ margin: "6px 0", color: "#8b949e" }}>
              @{profileUser.username}
            </p>

            {profileUser.preferences?.showEmail && (
              <p style={{ color: "#8b949e", marginTop: 5 }}>
                {profileUser.email}
              </p>
            )}

            {/* BUTTONS */}
            {loggedInUser?.username === profileUser.username ? (
              <button
                onClick={() => navigate("/edit-profile")}
                style={btnPrimary}
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={isFollowing ? unfollow : follow}
                style={isFollowing ? btnSecondary : btnPrimary}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}

            {/* STATS */}
            <div
              style={{
                marginTop: 16,
                color: "#c9d1d9",
                fontSize: 15,
                display: "flex",
                gap: 18,
              }}
            >
              <span>
                <b>{posts.length}</b> posts
              </span>
              <span>
                <b>{followersCount}</b> followers
              </span>
              <span>
                <b>{followingCount}</b> following
              </span>
            </div>

            {/* BIO */}
            {profileUser.bio && (
              <p style={{ marginTop: 18, maxWidth: 600, color: "#b3b3b3" }}>
                {profileUser.bio}
              </p>
            )}

            {/* SOCIAL */}
            <div style={{ marginTop: 12, display: "flex", gap: 14 }}>
              {profileUser.social?.github && (
                <a href={profileUser.social.github} style={socialLink}>
                  GitHub
                </a>
              )}
              {profileUser.social?.linkedin && (
                <a href={profileUser.social.linkedin} style={socialLink}>
                  LinkedIn
                </a>
              )}
              {profileUser.social?.instagram && (
                <a href={profileUser.social.instagram} style={socialLink}>
                  Instagram
                </a>
              )}
              {profileUser.social?.website && (
                <a href={profileUser.social.website} style={socialLink}>
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- SKILLS ---------------- */}
        {profileUser.skills?.length > 0 && (
          <div style={{ marginTop: 35 }}>
            <h3 style={sectionTitle}>Skills</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {profileUser.skills.map((s) => (
                <span key={s} style={skillChip}>
                  {s}
                </span>
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
              <div style={projectGrid}>
                {projects.map((proj) => (
                  <div
                    key={proj._id}
                    onClick={() => navigate(`/project/${proj._id}`)}
                    style={projectCard}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.border = "1px solid #58a6ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.border = "1px solid #30363d")
                    }
                  >
                    <h4 style={{ margin: "10px 0", color: "#c9d1d9" }}>
                      {proj.title}
                    </h4>
                    <p style={{ fontSize: 13, color: "#8b949e" }}>
                      {Array.isArray(proj.tech)
                        ? proj.tech.join(", ")
                        : proj.tech}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- POSTS ---------------- */}
        <div style={{ marginTop: 55 }}>
          <h3 style={sectionTitle}>Posts</h3>

          {posts.length === 0 ? (
            <p style={{ color: "#8b949e" }}>No posts yet.</p>
          ) : (
            <div style={postGrid}>
              {posts.map((post) => (
                <img
                  key={post._id}
                  src={post.image}
                  style={postCard}
                  onClick={() => navigate(`/post/${post._id}`)}
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
  fontSize: 15,
};

const btnSecondary = {
  padding: "8px 16px",
  background: "#21262d",
  border: "1px solid #30363d",
  color: "#c9d1d9",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 15,
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

const projectGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 20,
};

const projectCard = {
  border: "1px solid #30363d",
  background: "#0d1117",
  borderRadius: 10,
  padding: 14,
  cursor: "pointer",
  transition: "0.2s ease",
};

const postGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
};

const postCard = {
  width: "100%",
  height: 240,
  objectFit: "cover",
  borderRadius: 6,
  cursor: "pointer",
  border: "1px solid #30363d",
};
