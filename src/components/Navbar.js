import { useNavigate } from "react-router-dom";
import { logout, getProfile, getRole } from "../api";
import '../style.css'

export default function Navbar() {
  const navigate = useNavigate();
  const profile = getProfile();
  const role = getRole();

  function handleLogout() {
    logout();
    navigate(role === "admin" ? "/admin/login" : "/login");
  }

  return (
    <nav className="navbar">
      <div className="brand">
        <span className="seal">IE</span>
        Institute Exam Portal
      </div>
      <div className="nav-right">
        <span>
          {role === "admin" ? "Admin" : profile.name} &middot;{" "}
          {role === "admin" ? "Administrator" : "Student"}
        </span>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  );
}
