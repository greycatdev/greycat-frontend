// frontend/src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { API } from "../api";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // profile
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState({ district: "" });
  const [skills, setSkills] = useState("");
  const [social, setSocial] = useState({
    github: "",
    linkedin: "",
    instagram: "",
    website: "",
  });

  // preferences
  const [darkMode, setDarkMode] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showProjects, setShowProjects] = useState(true);
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
  });

  // privacy
  const [privateProfile, setPrivateProfile] = useState(false);

  /* ---------------------------------------------------
      LOAD SETTINGS
  --------------------------------------------------- */
  useEffect(() => {
    API.get("/settings", { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          const s = res.data.settings;

          setUser(s);
          setName(s.name || "");
          setUsername(s.username || "");
          setBio(s.bio || "");
          setLocation(s.location || { district: "" });
          setSkills((s.skills || []).join(", "));
          setSocial(
            s.social || {
              github: "",
              linkedin: "",
              instagram: "",
              website: "",
            }
          );

          setDarkMode(!!s.preferences?.darkMode);
          setShowEmail(!!s.preferences?.showEmail);
          setShowProjects(s.preferences?.showProjects ?? true);
          setLanguage(s.preferences?.language || "en");
          setNotifications(
            s.preferences?.notifications || { email: true, inApp: true }
          );

          setPrivateProfile(!!s.privacy?.privateProfile);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------------------------------------------------
      SAVE ACTIONS
  --------------------------------------------------- */
  const saveProfile = async () => {
    const payload = {
      name,
      username,
      bio,
      location,
      social,
      skills: skills
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const res = await API.post("/settings/profile", payload, {
      withCredentials: true,
    });

    alert(res.data.success ? "Profile saved" : "Save failed");
  };

  const savePreferences = async () => {
    const payload = {
      darkMode,
      showEmail,
      showProjects,
      notifications,
      language,
    };
    const res = await API.post("/settings/preferences", payload, {
      withCredentials: true,
    });
    alert(res.data.success ? "Preferences saved" : "Save failed");
  };

  const savePrivacy = async () => {
    const res = await API.post(
      "/settings/privacy",
      { privateProfile },
      { withCredentials: true }
    );
    alert(res.data.success ? "Privacy saved" : "Save failed");
  };

  /* ---------------------------------------------------
      DELETE ACCOUNT
  --------------------------------------------------- */
  const deleteAccount = async () => {
    if (!window.confirm("Delete your account permanently?")) return;

    try {
      const res = await API.delete("/settings/delete", {
        withCredentials: true,
      });

      if (res.data.success) {
        window.location.href = "/login";
      } else {
        alert("Delete failed. Please try again.");
      }
    } catch (err) {
      alert("Error deleting account.");
    }
  };

  if (loading)
    return <DashboardLayout>Loading settings...</DashboardLayout>;

  return (
    <DashboardLayout>

      {/* ---------------------------------------------------
          FIXED FLOATING PANEL (DUMMY TOGGLES)
      --------------------------------------------------- */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#161b22",
          border: "1px solid #30363d",
          padding: "14px 16px",
          borderRadius: 10,
          zIndex: 9999,
          width: "220px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        <p style={{ color: "#8b949e", fontSize: 13, marginBottom: 10 }}>
          Quick Toggles (Demo)
        </p>

        <Toggle
          label="Dark mode"
          value={darkMode}
          setValue={setDarkMode}
        />

        <Toggle
          label="Email notifications"
          value={notifications.email}
          setValue={(v) =>
            setNotifications({ ...notifications, email: v })
          }
        />

        <Toggle
          label="In-app notifications"
          value={notifications.inApp}
          setValue={(v) =>
            setNotifications({ ...notifications, inApp: v })
          }
        />
      </div>

      {/* ---------------------------------------------------
          MAIN SETTINGS PAGE CONTENT
      --------------------------------------------------- */}
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "24px 24px 40px",
          fontFamily:
            "Poppins, system-ui, -apple-system, BlinkMacSystemFont",
          color: "#c9d1d9",
        }}
      >
        {/* PAGE TITLE */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            marginBottom: 8,
            color: "#f0f6fc",
          }}
        >
          Settings
        </h1>
        <p
          style={{ marginBottom: 24, color: "#8b949e", fontSize: 14 }}
        >
          Manage your profile, preferences, and privacy.
        </p>

        {/* PROFILE */}
        <Section title="Profile">
          <Input label="Name" value={name} setValue={setName} />
          <Input
            label="Username"
            value={username}
            setValue={setUsername}
          />
          <Input
            label="Bio"
            type="textarea"
            value={bio}
            setValue={setBio}
            placeholder="Tell something about yourself..."
          />

          <Input
            label="Skills (comma separated)"
            value={skills}
            setValue={setSkills}
            placeholder="react, node, mongodb..."
          />

          <Input
            label="Location - District"
            value={location.district || ""}
            setValue={(v) => setLocation({ ...location, district: v })}
            placeholder="eg. Kannur"
          />

          <Input
            label="Social - GitHub"
            value={social.github}
            setValue={(v) => setSocial({ ...social, github: v })}
            placeholder="https://github.com/username"
          />

          <Input
            label="Social - LinkedIn"
            value={social.linkedin}
            setValue={(v) => setSocial({ ...social, linkedin: v })}
            placeholder="https://linkedin.com/in/username"
          />

          <Input
            label="Social - Instagram"
            value={social.instagram}
            setValue={(v) => setSocial({ ...social, instagram: v })}
          />

          <Input
            label="Social - Website"
            value={social.website}
            setValue={(v) => setSocial({ ...social, website: v })}
            placeholder="https://your-site.com"
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveButton onClick={saveProfile} text="Save profile" />
          </div>
        </Section>

        {/* PREFERENCES */}
        <Section title="Preferences">
          <Toggle
            label="Show email on public profile"
            value={showEmail}
            setValue={setShowEmail}
          />
          <Toggle
            label="Show projects on profile"
            value={showProjects}
            setValue={setShowProjects}
          />

          <div style={{ marginTop: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                color: "#8b949e",
                marginBottom: 4,
              }}
            >
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                marginTop: 2,
                padding: "8px 10px",
                borderRadius: 6,
                background: "#0d1117",
                border: "1px solid #30363d",
                color: "#c9d1d9",
                fontSize: 14,
              }}
            >
              <option value="en">English</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveButton
              onClick={savePreferences}
              text="Save preferences"
            />
          </div>
        </Section>

        {/* PRIVACY */}
        <Section title="Privacy">
          <Toggle
            label="Private profile (only followers can see your posts)"
            value={privateProfile}
            setValue={setPrivateProfile}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveButton onClick={savePrivacy} text="Save privacy" />
          </div>
        </Section>

        {/* DANGER ZONE */}
        <Section title="Danger zone" danger>
          <p
            style={{
              color: "#f85149",
              marginBottom: 12,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Deleting your account is permanent. All posts, projects,
            and data will be erased. This action cannot be undone.
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <DangerButton
              onClick={deleteAccount}
              text="Delete account"
            />
          </div>
        </Section>
      </div>
    </DashboardLayout>
  );
}

/* ============================================================================  
    COMPONENTS
============================================================================ */

function Section({ title, children, danger }) {
  return (
    <section
      style={{
        border: danger ? "1px solid #f85149" : "1px solid #30363d",
        backgroundColor: danger ? "#1b1113" : "#161b22",
        padding: 20,
        borderRadius: 12,
        marginTop: 20,
      }}
    >
      <h3
        style={{
          marginBottom: 14,
          fontSize: 18,
          fontWeight: 600,
          color: danger ? "#f85149" : "#c9d1d9",
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function Input({ label, value, setValue, type, placeholder }) {
  return (
    <div style={{ marginTop: 12 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          color: "#8b949e",
          marginBottom: 4,
        }}
      >
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          style={{
            ...inputStyle,
            height: 96,
            paddingTop: 8,
            paddingBottom: 8,
            resize: "vertical",
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function Toggle({ label, value, setValue }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        fontSize: 14,
        color: "#c9d1d9",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => setValue(e.target.checked)}
        style={{ cursor: "pointer" }}
      />
      {label}
    </label>
  );
}

function SaveButton({ onClick, text }) {
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: 18,
        padding: "8px 14px",
        borderRadius: 6,
        background: "#238636",
        border: "1px solid #2ea043",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {text}
    </button>
  );
}

function DangerButton({ onClick, text }) {
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: 12,
        padding: "8px 14px",
        borderRadius: 6,
        background: "#da3633",
        border: "1px solid #f85149",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {text}
    </button>
  );
}

/* ============================================================================  
    STYLES
============================================================================ */

const inputStyle = {
  width: "100%",
  height: 40,
  padding: "0 10px",
  borderRadius: 6,
  background: "#0d1117",
  border: "1px solid #30363d",
  color: "#c9d1d9",
  fontSize: 14,
  outline: "none",
};
