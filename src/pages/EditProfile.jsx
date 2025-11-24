import { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [social, setSocial] = useState({
    github: "",
    linkedin: "",
    instagram: "",
    website: "",
  });

  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  /* ---------- RESPONSIVE LISTENER ---------- */
  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (!res.data.authenticated) return navigate("/login");

      const u = res.data.user;
      setUser(u);
      setPhotoPreview(u.photo || "");
      setBio(u.bio || "");
      setSkills((u.skills || []).join(", "));
      setSocial(u.social || {});
    });
  }, []);

  /* ---------------- SAVE ---------------- */
  const saveChanges = async () => {
    const res = await API.put("/user/update", {
      bio,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      social,
    });

    if (res.data.success) {
      alert("Profile updated!");
      navigate(`/${user.username}`);
    }
  };

  /* ---------------- PHOTO UPLOAD ---------------- */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await API.post("/user/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) setPhotoPreview(res.data.photo);
    } catch {
      alert("Upload failed");
    }

    setUploading(false);
  };

  if (!user)
    return <div style={{ color: "white", padding: 40 }}>Loading…</div>;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0d1117",
        display: "flex",
        justifyContent: "center",
        paddingTop: 40,
        paddingBottom: 40,
        color: "white",
        fontFamily: "Poppins",
      }}
    >
      {/* CENTERED CONTAINER */}
      <div
        style={{
          width: "100%",
          maxWidth: 650,
          padding: "0 16px",
        }}
      >
        <h2 style={{ fontSize: 26, marginBottom: 30 }}>Edit Profile</h2>

        {/* ---------- PROFILE PICTURE ---------- */}
        <div style={{ marginBottom: 30 }}>
          <label style={label}>Profile Picture</label>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "center" : "flex-start",
              gap: 20,
            }}
          >
            <img
              src={photoPreview || "/default-avatar.png"}
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #30363d",
              }}
            />

            <label
              style={{
                padding: "8px 16px",
                background: "#21262d",
                border: "1px solid #30363d",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                width: isMobile ? "100%" : "auto",
                textAlign: "center",
              }}
            >
              {uploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
        </div>

        {/* ---------- BIO ---------- */}
        <div style={{ marginBottom: 22 }}>
          <label style={label}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{
              ...input,
              height: 110,
              resize: "vertical",
            }}
          />
        </div>

        {/* ---------- SKILLS ---------- */}
        <div style={{ marginBottom: 22 }}>
          <label style={label}>Skills (comma separated)</label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            style={input}
          />
        </div>

        {/* ---------- SOCIAL LINKS ---------- */}
        <div style={{ marginBottom: 22 }}>
          <label style={label}>GitHub</label>
          <input
            value={social.github}
            onChange={(e) => setSocial({ ...social, github: e.target.value })}
            style={input}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={label}>LinkedIn</label>
          <input
            value={social.linkedin}
            onChange={(e) => setSocial({ ...social, linkedin: e.target.value })}
            style={input}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={label}>Instagram</label>
          <input
            value={social.instagram}
            onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
            style={input}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={label}>Website</label>
          <input
            value={social.website}
            onChange={(e) => setSocial({ ...social, website: e.target.value })}
            style={input}
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={saveChanges}
          style={{
            ...saveBtn,
            width: isMobile ? "100%" : "100%",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const input = {
  width: "100%",
  padding: "12px 14px",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: 6,
  fontSize: 15,
  color: "white",
  outline: "none",
};

const label = {
  fontSize: 14,
  color: "#8b949e",
  marginBottom: 6,
  display: "block",
};

const saveBtn = {
  marginTop: 30,
  padding: "12px",
  fontSize: 16,
  background: "#238636",
  border: "1px solid #2ea043",
  color: "white",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};
