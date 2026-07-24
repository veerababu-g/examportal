import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import '../style.css'

export default function TakeExam() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [locking, setLocking] = useState(null); // questionId currently being saved
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
    
  }, [courseId]);

  async function load() {
    setError("");
    try {
      const { data } = await api.get(`/student/exam/${courseId}`);
      setCourse(data.course);
      setQuestions(data.questions);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate(`/result/${courseId}`);
        return;
      }
      setError(err.response?.data?.message || "Failed to load exam");
    } finally {
      setLoading(false);
    }
  }

  async function selectOption(question, optionIndex) {
    if (question.lockedAnswer !== null) return; // already locked, cannot change
    setLocking(question.id);
    setError("");
    try {
      await api.post(`/student/exam/${courseId}/answer`, {
        questionId: question.id,
        selectedOptionIndex: optionIndex,
      });
      setQuestions((qs) =>
        qs.map((q) => (q.id === question.id ? { ...q, lockedAnswer: optionIndex } : q))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not lock in that answer");
    } finally {
      setLocking(null);
    }
  }

  async function handleSubmit() {
    if (!confirm("Submit the exam? You cannot make changes after this.")) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/student/exam/${courseId}/submit`);
      navigate(`/result/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page">Loading exam…</div>
      </div>
    );
  }

  const answeredCount = questions.filter((q) => q.lockedAnswer !== null).length;
  const progressPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        {error && <div className="error-banner">{error}</div>}

        {course && (
          <div className="exam-header">
            <div>
              <h2 style={{ margin: 0 }}>{course.title}</h2>
              <div className="meta">Training duration: {course.trainingHours} hours</div>
            </div>
            <div className="meta">
              {answeredCount} / {questions.length} answered
            </div>
          </div>
        )}

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {questions.length === 0 ? (
          <div className="empty-state">No questions have been added to this exam yet.</div>
        ) : (
          questions.map((q, i) => (
            <div className="q-card" key={q.id}>
              <div className="q-index">Question {i + 1}</div>
              <p className="q-text">{q.questionText}</p>
              {q.options.map((opt, idx) => {
                const isLocked = q.lockedAnswer !== null;
                const isSelected = q.lockedAnswer === idx;
                return (
                  <div
                    key={idx}
                    className={`option-row ${isSelected ? "selected" : ""} ${isLocked ? "locked" : ""}`}
                    onClick={() => selectOption(q, idx)}
                  >
                    <span className="bubble" />
                    <span className="option-text">{opt}</span>
                    {isSelected && <span className="lock-tag">🔒 Locked</span>}
                  </div>
                );
              })}
              {locking === q.id && <div className="meta">Locking in your answer…</div>}
            </div>
          ))
        )}

        {questions.length > 0 && (
          <div className="exam-footer">
            <button className="btn btn-amber" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit exam"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
