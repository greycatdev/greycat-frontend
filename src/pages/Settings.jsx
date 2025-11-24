import { useEffect, useState, useCallback } from "react";
// Assuming API and DashboardLayout are imported correctly, 
// though they are not defined in this single file context.

// Dummy API object for runnable code context
const API = {
  get: () => Promise.resolve({ data: { success: true, settings: {} } }),
  post: () => Promise.resolve({ data: { success: true } }),
  delete: () => Promise.resolve({ data: { success: true } }),
};

// Dummy DashboardLayout for runnable code context
const DashboardLayout = ({ children }) => (
  <div className="bg-[#0D1117] min-h-screen p-8 text-white">
    {children}
  </div>
);


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
  // FIX: Hardcode dark mode to true as requested for dummy data
  const [darkMode, setDarkMode] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showProjects, setShowProjects] = useState(true);
  const [language, setLanguage] = useState("en");
  // FIX: Keep notifications fixed to true as requested for dummy data
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
  });

  // privacy
  const [privateProfile, setPrivateProfile] = useState(false);

  /* ---------------------------------------------------
      MODAL LOGIC (replaces alert/confirm)
  --------------------------------------------------- */
  const [modalContent, setModalContent] = useState(null);

  const showModal = useCallback((message, isConfirm = false, onConfirm = null) => {
    setModalContent({ message, isConfirm, onConfirm });
  }, []);

  const hideModal = useCallback(() => {
    setModalContent(null);
  }, []);

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

          // FIX: Do NOT load these fixed values from dummy API
          // setDarkMode(!!s.preferences?.darkMode); 

          setShowEmail(!!s.preferences?.showEmail);
          setShowProjects(s.preferences?.showProjects ?? true);
          setLanguage(s.preferences?.language || "en");
          
          // FIX: Do NOT load these fixed values from dummy API
          // setNotifications(s.preferences?.notifications || { email: true, inApp: true }); 

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

    showModal(res.data.success ? "Profile saved successfully!" : "Save failed. Please try again.");
  };

  const savePreferences = async () => {
    const payload = {
      // These fixed states (darkMode and notifications) will be sent with their hardcoded value (true)
      darkMode,
      showEmail,
      showProjects,
      notifications,
      language,
    };
    const res = await API.post("/settings/preferences", payload, {
      withCredentials: true,
    });
    showModal(res.data.success ? "Preferences saved successfully!" : "Save failed. Please try again.");
  };

  const savePrivacy = async () => {
    const res = await API.post(
      "/settings/privacy",
      { privateProfile },
      { withCredentials: true }
    );
    showModal(res.data.success ? "Privacy settings saved successfully!" : "Save failed. Please try again.");
  };

  /* ---------------------------------------------------
      DELETE ACCOUNT — FIXED VERSION (uses custom modal)
  --------------------------------------------------- */
  const deleteAccount = () => {
    showModal(
      "Delete your account permanently? All posts, projects, and data will be erased. This action cannot be undone.",
      true,
      async () => {
        hideModal(); // Hide confirmation modal first
        try {
          const res = await API.delete("/settings/delete", {
            withCredentials: true,
          });

          if (res.data.success) {
            // Immediately forget cookies and redirect
            window.location.href = "/login";
          } else {
            showModal("Delete failed. Please try again.");
          }
        } catch (err) {
          showModal("Error deleting account.");
        }
      }
    );
  };

  if (loading)
    return <DashboardLayout>Loading settings...</DashboardLayout>;

  return (
    <DashboardLayout>
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

        {/* -------------------------------- PROFILE -------------------------------- */}
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

        {/* -------------------------------- PREFERENCES -------------------------------- */}
        <Section title="Preferences">
          {/* FIX: Dark mode is fixed to ON for dummy state */}
          <Toggle
            label="Enable dark mode (Fixed: ON)"
            value={darkMode}
            setValue={() => {}} // Disabled setter
            disabled={true} // Disabled UI
          />
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

          {/* FIX: Email notifications fixed to ON for dummy state */}
          <Toggle
            label="Email notifications (Fixed: ON)"
            value={notifications.email}
            setValue={() => {}} // Disabled setter
            disabled={true} // Disabled UI
          />
          {/* FIX: In-app notifications fixed to ON for dummy state */}
          <Toggle
            label="In-app notifications (Fixed: ON)"
            value={notifications.inApp}
            setValue={() => {}} // Disabled setter
            disabled={true} // Disabled UI
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveButton
              onClick={savePreferences}
              text="Save preferences"
            />
          </div>
        </Section>

        {/* -------------------------------- PRIVACY -------------------------------- */}
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

        {/* -------------------------------- DANGER ZONE -------------------------------- */}
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

      <Modal modalContent={modalContent} hideModal={hideModal} />
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

// Updated Toggle component to handle disabled state
function Toggle({ label, value, setValue, disabled = false }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        fontSize: 14,
        color: disabled ? "#8b949e" : "#c9d1d9", // Dim color if disabled
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={value}
        // Only call setValue if not disabled
        onChange={(e) => !disabled && setValue(e.target.checked)}
        disabled={disabled} // Disabled HTML attribute
        style={{ cursor: disabled ? "default" : "pointer" }}
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
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2ea043'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#238636'}
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
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f85149'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#da3633'}
    >
      {text}
    </button>
  );
}

function Modal({ modalContent, hideModal }) {
  if (!modalContent) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#161b22',
          padding: 24,
          borderRadius: 12,
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          color: '#c9d1d9',
        }}
      >
        <p style={{ marginBottom: 20, fontSize: 16 }}>
          {modalContent.message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          {modalContent.isConfirm && (
            <button
              onClick={hideModal}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                background: "#30363d",
                border: "1px solid #484f58",
                color: "#c9d1d9",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (modalContent.onConfirm) {
                modalContent.onConfirm();
              } else {
                hideModal();
              }
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              background: modalContent.isConfirm ? "#da3633" : "#238636",
              border: modalContent.isConfirm ? "1px solid #f85149" : "1px solid #2ea043",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {modalContent.isConfirm ? "Confirm Delete" : "OK"}
          </button>
        </div>
      </div>
    </div>
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