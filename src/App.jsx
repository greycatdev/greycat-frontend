import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Auth */
import Login from "./pages/login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import SetUsername from "./pages/SetUsername";

/* Protected Wrapper */
import ProtectedRoute from "./components/ProtectedRoute";

/* Home */
import Home from "./pages/home";

/* Profiles */
import PublicProfile from "./pages/PublicProfile";
import EditProfile from "./pages/EditProfile";

/* Explore */
import Explore from "./pages/Explore";

/* Events */
import Events from "./pages/Events";
import EventList from "./pages/EventList";
import EventCreate from "./pages/EventCreate";
import EventPage from "./pages/EventPage";

/* Posts */
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";

/* Projects */
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";
import Projects from "./pages/Projects";
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

        {/* PUBLIC ROUTES (No auth required) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-username" element={<SetUsername />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/:username"
          element={
            <ProtectedRoute>
              <PublicProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />

        {/* POSTS */}
        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          }
        />

        {/* EVENTS */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event/create"
          element={
            <ProtectedRoute>
              <EventCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event/:id"
          element={
            <ProtectedRoute>
              <EventPage />
            </ProtectedRoute>
          }
        />

        {/* PROJECTS */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-project"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <ProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/import/github"
          element={
            <ProtectedRoute>
              <GithubImport />
            </ProtectedRoute>
          }
        />

        {/* CHANNELS */}
        <Route
          path="/channels"
          element={
            <ProtectedRoute>
              <Channels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/channel/:id"
          element={
            <ProtectedRoute>
              <ChannelPage />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
