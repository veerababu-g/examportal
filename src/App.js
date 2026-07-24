import { Routes, Route, Navigate, Link } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin.js";
import StudentLogin from "./pages/StudentLogin.js";
import StudentRegister from "./pages/StudentRegister.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import StudentDashboard from "./pages/StudentDashboard.js";
import TakeExam from "./pages/TakeExam.js";
import Result from "./pages/Result.js";
import ProtectedRoute from "./components/ProtectedRoute.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Student */}
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/register" element={<StudentRegister />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:courseId"
        element={
          <ProtectedRoute role="student">
            <TakeExam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/result/:courseId"
        element={
          <ProtectedRoute role="student">
            <Result />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
