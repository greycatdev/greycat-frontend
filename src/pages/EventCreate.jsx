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
    if (!title.trim() || !description.trim() || !date.trim() || !location.trim()) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    let bannerUrl = null;

    // Generate banner if user didn't upload
    if (!bannerFile) {
      bannerUrl = `https://source.unsplash.com/random/1200x400?event,tech,hack,cyber&sig=${
        Date.now()
      }`;
    }

    // Upload banner to server
    if (bannerFile) {
      const formData = new FormData();
      formData.append("banner", bannerFile);

      try {
        const upload = await API.post("/upload/banner", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (upload.data.success) bannerUrl = upload.data.url;
      } catch {
        alert("Banner upload failed.");
        setLoading(false);
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
    } catch {
      alert("Event creation failed.");
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div style={pageWrapper}>
        <div style={card}>
          <h2 style={formTitle}>Create New Event</h2>

          {/* BANNER SECTION */}
          <div style={{ marginBottom: 32 }}>
            <label style={label}>Event Banner</label>

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
                  style={{ display: "none" }}
                  onChange={handleBannerChange}
                />
              </label>
            </div>

            <p style={note}>Recommended size: 1200 × 400px</p>
          </div>

          {/* FORM */}
          <div style={formGrid}>
            <InputField
              label="Event Title"
              placeholder="Hackathon, Meetup..."
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
              <label style={label}>Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ ...input, cursor: "pointer" }}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              style={{
                ...submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating…" : "Create Event"}
            </button>
          </div>
        </div>

        {/* STYLE FIXES */}
        <style>{`
          input:focus, textarea:focus, select:focus {
            border-color: #58a6ff !important;
            box-shadow: 0 0 0 2px rgba(88,166,255,0.4);
          }

          input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

/* ---------------- COMPONENTS ---------------- */

function InputField({ label, value, setValue, placeholder, type = "text" }) {
  return (
    <div>
      <label style={label}>{label}</label>
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
      <label style={label}>{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        style={{ ...input, height: 140, resize: "none" }}
      />
    </div>
  );
}

/* ---------------- STYLES ---------------- */

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
  color: "#c9d1d9",
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
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

const label = {
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
  outline: "none",
  fontFamily: "Poppins",
};

const submitBtn = {
  padding: "14px",
  background: "#238636",
  border: "1px solid #2ea043",
  color: "#fff",
  borderRadius: 8,
  fontSize: 17,
  fontWeight: 600,
  transition: "0.25s",
};

const bannerBox = {
  width: "100%",
  height: 200,
  borderRadius: 10,
  border: "1px solid #30363d",
  overflow: "hidden",
  position: "relative",
  background: "#161b22",
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
