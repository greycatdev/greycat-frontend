// frontend/src/pages/EventCreate.jsx
import { useState, useEffect } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

export default function EventCreate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("online");

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loaderTextIndex, setLoaderTextIndex] = useState(0);

  // 🔥 Loader rotating texts
  const loaderTexts = [
    "Connecting to database…",
    "Uploading image…",
    "Securing connection…",
    "Uploading content…",
    "Finalizing event…",
  ];

  // 🔄 Rotate text every 1 sec
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoaderTextIndex((prev) => (prev + 1) % loaderTexts.length);
    }, 900);

    return () => clearInterval(interval);
  }, [loading]);

  /* ---------------- HANDLE FILE UPLOAD ---------------- */
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  /* ---------------- SUBMIT EVENT ---------------- */
  const submit = async () => {
    if (!title || !description || !date || !location) {
      alert("Please fill all fields!");
      return;
    }

    setLoading(true);

    let bannerUrl = null;

    // If user didn't upload → random banner
    if (!bannerFile) {
      bannerUrl = `https://source.unsplash.com/random/1200x400?event,cyber,tech,hackathon,neon&sig=${
        Date.now() + "-" + Math.random()
      }`;
    }

    // User uploaded → upload
    if (bannerFile) {
      try {
        const formData = new FormData();
        formData.append("banner", bannerFile);

        const uploadRes = await API.post("/upload/banner", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadRes.data.success) bannerUrl = uploadRes.data.url;
      } catch (err) {
        setLoading(false);
        alert("Banner upload failed.");
        return;
      }
    }

    try {
      const res = await API.post("/event/create", {
        title,
        description,
        date,
        location,
        type,
        bannerImage: bannerUrl,
      });

      if (res.data.success) navigate(`/event/${res.data.event._id}`);
    } catch (err) {
      alert("Event creation failed.");
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      {/* 🔥 BEAUTIFUL CYBER LOADER */}
      {loading && (
        <div style={loaderOverlay}>
          <div style={loaderCard}>
            <div className="loader-spinner"></div>

            <p className="loader-text">{loaderTexts[loaderTextIndex]}</p>
          </div>

          <style>{`
            .loader-spinner {
              width: 50px;
              height: 50px;
              border: 5px solid rgba(255,255,255,0.2);
              border-top: 5px solid #58a6ff;
              border-radius: 50%;
              animation: spin 0.8s linear infinite, glow 1.5s ease-in-out infinite;
            }

            @keyframes spin {
              to { transform: rotate(360deg); }
            }

            @keyframes glow {
              0% { box-shadow: 0 0 5px #58a6ff; }
              50% { box-shadow: 0 0 18px #58a6ff; }
              100% { box-shadow: 0 0 5px #58a6ff; }
            }

            .loader-text {
              margin-top: 18px;
              font-size: 17px;
              font-weight: 500;
              color: #e6edf3;
              animation: pulse 1.2s ease-in-out infinite;
            }

            @keyframes pulse {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* ---------------- PAGE CONTENT ---------------- */}
      <div style={pageWrapper}>
        <div style={card}>
          <h2 style={formTitle}>Create New Event</h2>

          {/* Banner Upload */}
          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Event Banner</label>

            <div style={bannerBox}>
              <img
                src={
                  bannerPreview ||
                  "https://via.placeholder.com/1200x400/0d1117/ffffff?text=Event+Banner"
                }
                alt="Event Banner"
                style={bannerImage}
              />

              <label style={uploadBtn}>
                Upload Banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <p style={note}>Recommended size: 1200 × 400</p>
          </div>

          {/* FORM */}
          <div style={formGrid}>
            <InputField
              label="Event Title"
              placeholder="Hackathon, Meetup, Workshop..."
              value={title}
              setValue={setTitle}
            />

            <TextAreaField
              label="Description"
              placeholder="Explain what your event is about..."
              value={description}
              setValue={setDescription}
            />

            <InputField
              label="Date & Time"
              type="datetime-local"
              value={date}
              setValue={setDate}
            />

            <InputField
              label="Location"
              placeholder="Online link or physical address"
              value={location}
              setValue={setLocation}
            />

            <div>
              <label style={labelStyle}>Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ ...input, cursor: "pointer" }}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <button onClick={submit} style={submitBtn} disabled={loading}>
              {loading ? "Creating…" : "Create Event"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ---------------- INPUT COMPONENTS ---------------- */

function InputField({ label, value, setValue, placeholder, type = "text" }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={input}
      />
    </div>
  );
}

function TextAreaField({ label, value, setValue, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ ...input, height: 140, resize: "none" }}
      />
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const loaderOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const loaderCard = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "30px 40px",
  background: "#0d1117",
  borderRadius: 12,
  border: "1px solid #30363d",
};

const pageWrapper = {
  width: "100%",
  paddingTop: 25,
  paddingBottom: 60,
};

const card = {
  maxWidth: 760,
  margin: "0 auto",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: 12,
  padding: "40px 38px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  color: "#c9d1d9",
  fontFamily: "Poppins",
};

const formTitle = {
  textAlign: "center",
  marginBottom: 30,
  fontSize: 28,
  fontWeight: 600,
  color: "#f0f6fc",
};

const formGrid = {
  display: "flex",
  flexDirection: "column",
  gap: 28,
};

const labelStyle = {
  fontSize: 14,
  color: "#8b949e",
  marginBottom: 6,
};

const input = {
  width: "100%",
  padding: "14px 16px",
  background: "#0d1117",
  border: "1px solid #30363d",
  color: "#c9d1d9",
  borderRadius: 8,
  fontSize: 15,
  fontFamily: "Poppins",
  outline: "none",
  transition: "0.25s",
};

const submitBtn = {
  padding: "14px",
  background: "#238636",
  border: "1px solid #2ea043",
  color: "#fff",
  borderRadius: 8,
  fontSize: 17,
  cursor: "pointer",
  transition: "0.25s",
  fontWeight: 600,
};

const bannerBox = {
  width: "100%",
  height: 200,
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid #30363d",
  background: "#161b22",
  marginTop: 10,
  position: "relative",
};

const bannerImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const uploadBtn = {
  position: "absolute",
  bottom: 12,
  right: 12,
  padding: "7px 14px",
  background: "#21262d",
  border: "1px solid #30363d",
  borderRadius: 6,
  color: "#c9d1d9",
  cursor: "pointer",
  fontSize: 13,
};

const note = {
  fontSize: 12,
  color: "#8b949e",
  marginTop: 6,
};
