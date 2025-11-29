import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Auth */
import Login from "./pages/login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SetUsername from "./pages/SetUsername";

/* Home */
import Home from "./pages/home";

/* Profiles */
import PublicProfile from "./pages/PublicProfile";
import EditProfile from "./pages/EditProfile";

/* Explore */
import Explore from "./pages/Explore";

/* Events */
import EventList from "./pages/EventList";
import EventCreate from "./pages/EventCreate";
import EventPage from "./pages/EventPage";

/* Posts */
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";

/* Projects */
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";
import GithubImport from "./pages/GithubImport";

/* Settings */
import Settings from "./pages/Settings";

/* Channels */
import Channels from "./pages/Channels";
import ChannelPage from "./pages/ChannelPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ----------------------------
            AUTH ROUTES
        ----------------------------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/set-username" element={<SetUsername />} />

        {/* ----------------------------
            MAIN APP ROUTES
        ----------------------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/settings" element={<Settings />} />

        {/* Explore */}
        <Route path="/explore" element={<Explore />} />

        {/* Posts */}
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostPage />} />

        {/* Events */}
        <Route path="/events" element={<EventList />} />
        <Route path="/event/create" element={<EventCreate />} />
        <Route path="/event/:id" element={<EventPage />} />

        {/* Projects */}
        <Route path="/projects" element={<Projects />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/import/github" element={<GithubImport />} />

        {/* Channels */}
        <Route path="/channels" element={<Channels />} />
        <Route path="/channel/:id" element={<ChannelPage />} />

        {/* ----------------------------
            ⚠ IMPORTANT: Public Profile Route
            MUST BE AT THE END so it doesn't
            override other routes
        ----------------------------- */}
        <Route path="/:username" element={<PublicProfile />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}
