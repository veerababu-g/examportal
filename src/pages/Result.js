import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import '../style.css'

export default function Result() {
  const { courseId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    
  }, [courseId]);

  async function load() {
    try {
      const { data } = await api.get(`/student/result/${courseId}`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Result not available yet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page page-narrow">
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : (
          <>
            {(() => {
              const pct = result.totalQuestions
                ? Math.round((result.score / result.totalQuestions) * 100)
                : 0;
              const passed = pct >= 40;
              return (
                <div className={`result-seal ${passed ? "" : "fail"}`}>
                  <div className="stamp">{passed ? "Result Declared" : "Result Declared"}</div>
                  <div className="score-big">
                    {result.score} / {result.totalQuestions}
                  </div>
                  <div className="score-label">
                    {pct}% &middot; {result.course?.title}
                  </div>
                </div>
              );
            })()}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Link to="/dashboard" className="btn btn-secondary">
                Back to dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
