import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { login } from "../api";
import '../style.css'

export default function StudentRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/student/register", form);
      login(data.token, "student", data.student);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-eyebrow">Student</div>
        <h1>Create your account</h1>
        {error && <div className="error-banner">{error}</div>}
        <div className="field">
          <label>Full name</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} required autoFocus />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
        <div className="switch-line">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
