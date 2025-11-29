import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuth = document.cookie.includes("connect.sid");

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
