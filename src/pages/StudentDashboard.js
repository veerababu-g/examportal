import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getProfile } from "../api";
import Navbar from "../components/Navbar";
import '../style.css'

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const profile = getProfile();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await api.get("/student/courses");
      setCourses(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <div className="section-head">
          <div>
            <h2>Welcome, {profile.name}</h2>
            <p>Pick a training to begin your exam. Once you select an option, it's locked in.</p>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p>Loading…</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">No exams are open right now. Check back later.</div>
        ) : (
          <div className="grid">
            {courses.map((c) => (
              <div className="card course-card" key={c._id}>
                <span className="hours-tag">{c.trainingHours} training hrs</span>
                <h3>{c.title}</h3>
                <p>{c.description || "No description provided."}</p>
                <button className="btn btn-primary" onClick={() => navigate(`/exam/${c._id}`)}>
                  Start exam
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
