import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tech, setTech] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    API.get("/auth/user").then((res) => {
      if (res.data.authenticated) setUser(res.data.user);
    });
  }, []);

  const submit = async () => {
    if (!title.trim()) return alert("Title is required");
    if (!desc.trim()) return alert("Description is required");
    if (!tech.trim()) return alert("Tech stack is required");
    if (!image) return alert("Please upload a project image");

    setUploading(true);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", desc);
    fd.append("tech", tech);
    fd.append("link", link);
    fd.append("image", image);

    const res = await API.post("/project/create", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setUploading(false);

    if (res.data.success) {
      alert("Project added!");
      if (user) navigate(`/${user.username}`);
      else window.location.href = "/";
    }
  };

  return (
    <DashboardLayout requireAuth={true}>
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "25px 20px",
          background: "#161b22",
          borderRadius: 12,
          border: "1px solid #30363d",
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          color: "#c9d1d9",
          fontFamily: "Poppins",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 20,
            fontSize: 24,
            fontWeight: 600,
            color: "#c9d1d9",
          }}
        >
          Add a New Project
        </h2>

        {/* IMAGE PREVIEW */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: "100%",
              height: 220,
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 18,
              border: "1px solid #30363d",
            }}
          />
        )}

        {/* IMAGE UPLOAD */}
        <label style={labelStyle}>Project Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImage(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
          }}
          style={fileInputStyle}
        />

        {/* TITLE */}
        <label style={labelStyle}>Project Title</label>
        <input
          type="text"
          placeholder="e.g. GreyCat Platform"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />

        {/* DESCRIPTION */}
        <label style={labelStyle}>Description</label>
        <textarea
          placeholder="Explain your project..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          style={{
            ...inputStyle,
            height: 100,
            resize: "none",
          }}
        />

        {/* TECH */}
        <label style={labelStyle}>Tech Stack</label>
        <input
          type="text"
          placeholder="React, Node.js, MongoDB"
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          style={inputStyle}
        />

        {/* LINK */}
        <label style={labelStyle}>Project Link (optional)</label>
        <input
          type="text"
          placeholder="GitHub Repo / Live Demo"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          style={inputStyle}
        />

        {/* SUBMIT BUTTON */}
        <button
          onClick={submit}
          disabled={uploading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#238636",
            border: "1px solid #2ea043",
            color: "white",
            fontSize: 16,
            borderRadius: 6,
            fontWeight: 500,
            cursor: "pointer",
            transition: "0.2s",
            marginTop: 8,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2ea043")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#238636")}
        >
          {uploading ? "Saving..." : "Save Project"}
        </button>
      </div>
    </DashboardLayout>
  );
}

/* ──────────── INPUT STYLES (GITHUB LIKE) ──────────── */

const labelStyle = {
  marginBottom: 6,
  fontSize: 14,
  color: "#c9d1d9",
  fontWeight: 500,
  display: "block",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #30363d",
  background: "#0d1117",
  color: "#c9d1d9",
  marginBottom: 18,
  fontSize: 15,
  outline: "none",
};

const fileInputStyle = {
  marginBottom: 18,
  color: "#c9d1d9",
  fontSize: 14,
};
