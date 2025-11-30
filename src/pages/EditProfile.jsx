import { useEffect, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

// ⭐ FIXED → No backend URL needed
const DEFAULT_PHOTO = "/default-image.jpg";

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

  const [photoPreview, setPhotoPreview] = useState(DEFAULT_PHOTO);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  /* ---------------- RESPONSIVE ---------------- */
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
      setPhotoPreview(u.photo || DEFAULT_PHOTO);
      setBio(u.bio || "");
      setSkills((u.skills || []).join(", "));
      setSocial(u.social || {});
    });
  }, []);

  /* ---------------------------------------------------------
       SAVE PROFILE 
  --------------------------------------------------------- */
  const saveChanges = async () => {
    const payload = {
      name: user.name,
      username: user.username,
      bio,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      social,
      location: user.location || {},
    };

    const res = await API.post("/settings/profile", payload);

    if (res.data.success) {
      const updated = {
        ...res.data.user,
        photo: res.data.user.photo || DEFAULT_PHOTO,
      };

      sessionStorage.setItem("gc_user", JSON.stringify(updated));

      alert("Profile updated!");
      navigate(`/${updated.username}`);
    }
  };

  /* ---------------------------------------------------------
       PHOTO UPLOAD
  --------------------------------------------------------- */
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

      if (res.data.success) {
        const newPhoto = res.data.photo || DEFAULT_PHOTO;

        setPhotoPreview(newPhoto);

        const updatedUser = {
          ...user,
          photo: newPhoto,
          updatedAt: res.data.updatedAt,
        };

        sessionStorage.setItem("gc_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
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
      <div
        style={{
          width: "100%",
          maxWidth: 650,
          padding: "0 16px",
        }}
      >
        <h2 style={{ fontSize: 26, marginBottom: 30 }}>Edit Profile</h2>

        {/* PROFILE PIC */}
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
              src={photoPreview || DEFAULT_PHOTO}
              onError={(e) => (e.target.src = DEFAULT_PHOTO)}
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

        {/* BIO */}
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

        {/* SKILLS */}
        <div style={{ marginBottom: 22 }}>
          <label style={label}>Skills (comma separated)</label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            style={input}
          />
        </div>

        {/* SOCIAL LINKS */}
        <SocialField
          label="GitHub"
          value={social.github}
          onChange={(v) => setSocial({ ...social, github: v })}
        />

        <SocialField
          label="LinkedIn"
          value={social.linkedin}
          onChange={(v) => setSocial({ ...social, linkedin: v })}
        />

        <SocialField
          label="Instagram"
          value={social.instagram}
          onChange={(v) => setSocial({ ...social, instagram: v })}
        />

        <SocialField
          label="Website"
          value={social.website}
          onChange={(v) => setSocial({ ...social, website: v })}
        />

        <button
          onClick={saveChanges}
          style={{
            ...saveBtn,
            width: "100%",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ---------- SOCIAL FIELD COMPONENT ---------- */
function SocialField({ label: lbl, value, onChange }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={label}>{lbl}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={input} />
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
