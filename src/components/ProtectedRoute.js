import { Navigate } from "react-router-dom";
import { getRole } from "../api";
import '../style.css'

export default function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem("token");
  const currentRole = getRole();

  if (!token || currentRole !== role) {
    return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
  }
  return children;
}
