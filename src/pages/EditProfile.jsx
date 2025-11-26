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

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768
  );

  /* ---------- Responsive listener ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const r = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  /* ---------- Load user ---------- */
  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (!res.data.authenticated) return navigate("/login");

      const u = res.data.user;
      setUser(u);

      setPhotoPreview(u.photo || "");
      setBio(u.bio || "");
      setSkills((u.skills || []).join(", "));
      setSocial({
        github: u.social?.github || "",
        linkedin: u.social?.linkedin || "",
        instagram: u.social?.instagram || "",
        website: u.social?.website || "",
      });
    });
  }, []);

  /* ---------- Save changes ---------- */
  const saveChanges = async () => {
    const payload = {
      bio,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      social,
    };

    const res = await API.put("/user/update", payload);

    if (res.data.success) {
      alert("Profile updated!");
      navigate(`/${user.username}`);
    }
  };

  /* ---------- Upload photo ---------- */
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
    return (
      <div
        style={{
          padding: 40,
          color: "#c9d1d9",
          fontFamily: "Poppins",
          background: "#0d1117",
          minHeight: "100vh",
        }}
      >
        Loading…
      </div>
    );

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
      <div style={{ width: "100%", maxWidth: 650, padding: "0 16px" }}>
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
        <EditableField
          label="Bio"
          value={bio}
          onChange={setBio}
          multiline
        />

        {/* ---------- SKILLS ---------- */}
        <EditableField
          label="Skills (comma separated)"
          value={skills}
          onChange={setSkills}
        />

        {/* ---------- SOCIAL LINKS ---------- */}
        <EditableField
          label="GitHub"
          value={social.github}
          onChange={(v) => setSocial({ ...social, github: v })}
        />
        <EditableField
          label="LinkedIn"
          value={social.linkedin}
          onChange={(v) => setSocial({ ...social, linkedin: v })}
        />
        <EditableField
          label="Instagram"
          value={social.instagram}
          onChange={(v) => setSocial({ ...social, instagram: v })}
        />
        <EditableField
          label="Website"
          value={social.website}
          onChange={(v) => setSocial({ ...social, website: v })}
        />

        {/* SAVE BUTTON */}
        <button style={saveBtn} onClick={saveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */

function EditableField({ label, value, onChange, multiline }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...inputStyle,
            height: 110,
            resize: "vertical",
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: 6,
  fontSize: 15,
  color: "white",
  outline: "none",
};

const labelStyle = {
  fontSize: 14,
  color: "#8b949e",
  marginBottom: 6,
  display: "block",
};

const saveBtn = {
  marginTop: 30,
  padding: "12px",
  background: "#238636",
  border: "1px solid #2ea043",
  borderRadius: 6,
  fontSize: 16,
  fontWeight: 600,
  color: "white",
  cursor: "pointer",
  width: "100%",
};
