import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { API } from "../api";

export default function CreatePost() {
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadPost = async () => {
    if (!imageFile) return alert("Please select an image.");

    setUploading(true);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("caption", caption);

    const res = await API.post("/post/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    setUploading(false);

    if (res.data.success) {
      window.location.href = "/";
    }
  };

  return (
    <DashboardLayout requireAuth={true}>
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          padding: "22px 20px",
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
            marginBottom: 20,
            textAlign: "center",
            fontSize: 24,
            fontWeight: 600,
            color: "#c9d1d9",
          }}
        >
          Create a Post
        </h2>

        {/* IMAGE PREVIEW */}
        <div
          style={{
            width: "100%",
            height: 270,
            borderRadius: 10,
            border: "1px solid #30363d",
            background: "#0d1117",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginBottom: 18,
          }}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ color: "#8b949e", fontSize: 14 }}>
              Select an image to preview
            </span>
          )}
        </div>

        {/* FILE INPUT */}
        <label style={labelStyle}>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImageFile(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
          }}
          style={fileInputStyle}
        />

        {/* CAPTION */}
        <label style={labelStyle}>Caption</label>
        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          style={{
            ...inputStyle,
            height: 85,
            resize: "none",
          }}
        ></textarea>

        {/* SUBMIT BUTTON */}
        <button
          onClick={uploadPost}
          disabled={uploading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#238636",
            border: "1px solid #2ea043",
            color: "white",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 16,
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "0.2s",
            opacity: uploading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!uploading) e.currentTarget.style.background = "#2ea043";
          }}
          onMouseLeave={(e) => {
            if (!uploading) e.currentTarget.style.background = "#238636";
          }}
        >
          {uploading ? "Uploading…" : "Post"}
        </button>
      </div>
    </DashboardLayout>
  );
}

/* ──────────── GitHub-Style Input/Label Styles ──────────── */

const labelStyle = {
  marginBottom: 6,
  marginTop: 4,
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
  marginBottom: 16,
  fontSize: 15,
  outline: "none",
};

const fileInputStyle = {
  marginBottom: 18,
  color: "#c9d1d9",
  fontSize: 14,
};
