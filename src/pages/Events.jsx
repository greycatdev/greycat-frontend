import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Events() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "25px 16px 60px",
          fontFamily: "Poppins",
          color: "#c9d1d9",
        }}
      >
        {/* PAGE HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              background: "linear-gradient(90deg, #58a6ff, #ff7b72)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Events
          </h1>

          <button
            onClick={() => navigate("/event/create")}
            style={{
              padding: "10px 20px",
              background: "#238636",
              border: "1px solid #2ea043",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 600,
              transition: "0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2ea043")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#238636")}
          >
            + Create Event
          </button>
        </div>

        {/* EMPTY STATE UI */}
        <div
          style={{
            padding: "40px 20px",
            background: "#0d1117",
            borderRadius: 12,
            border: "1px solid #30363d",
            textAlign: "center",
            boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
          }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/9474/9474083.png"
            alt="events"
            style={{
              width: 110,
              opacity: 0.8,
              marginBottom: 20,
              filter: "invert(80%)",
            }}
          />

          <h2
            style={{
              fontSize: 22,
              marginBottom: 8,
              color: "#c9d1d9",
              fontWeight: 600,
            }}
          >
            No Events Yet
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "#8b949e",
              marginBottom: 20,
            }}
          >
            Hackathons, meetups, workshops & tech events will appear here.
          </p>

          <button
            onClick={() => navigate("/event/create")}
            style={{
              padding: "10px 22px",
              background: "#238636",
              border: "1px solid #2ea043",
              color: "#fff",
              borderRadius: 8,
              fontSize: 15,
              cursor: "pointer",
              transition: "0.2s",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2ea043")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#238636")}
          >
            Create the First Event
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
