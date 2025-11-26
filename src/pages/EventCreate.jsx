// frontend/src/pages/EventCreate.jsx
import { useState } from "react";
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

    const start = Date.now();
    setLoading(true);

    let bannerUrl = "https://greycat-banners.vercel.app/default-event.jpg"; // fast fallback

    // If user uploaded → upload
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

      const elapsed = Date.now() - start;
      const delay = Math.max(0, 800 - elapsed); // ensure smooth UX

      setTimeout(() => {
        if (res.data.success) navigate(`/event/${res.data.event._id}`);
        setLoading(false);
      }, delay);
    } catch (err) {
      setLoading(false);
      alert("Event creation failed.");
    }
  };

  return (
    <DashboardLayout>
      {/* ---------------- MINIMAL CLEAN LOADER ---------------- */}
      {loading && (
        <div style={loaderOverlay}>
          <div style={loaderBox}>
            <div className="clean-spinner"></div>
            <p style={loaderText}>Creating event…</p>
          </div>

          <style>{`
            .clean-spinner {
              width: 34px;
              height: 34px;
              border: 3px solid rgba(255,255,255,0.25);
              border-top-color: #ffffff;
              border-radius: 50%;
              animation: spin 0.65s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
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
  background: "rgba(0,0,0,0.82)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const loaderBox = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "25px 35px",
  background: "#0d1117",
  borderRadius: 10,
  border: "1px solid #30363d",
};

const loaderText = {
  marginTop: 14,
  fontSize: 15,
  color: "#ffffff",
  opacity: 0.85,
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
