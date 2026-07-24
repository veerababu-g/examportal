import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import '../style.css'
export default function AdminDashboard() {
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/courses");
      setCourses(data);
      if (data.length && !selectedCourse) setSelectedCourse(data[0]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  function flash(msg) {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <div className="section-head">
          <div>
            <h2>Admin control room</h2>
            <p>Create trainings, author exam questions, and review declared results.</p>
          </div>
        </div>

        {notice && <div className="success-banner">{notice}</div>}
        {error && <div className="error-banner">{error}</div>}

        <div className="tabs">
          <button className={tab === "courses" ? "active" : ""} onClick={() => setTab("courses")}>
            Trainings &amp; Courses
          </button>
          <button className={tab === "questions" ? "active" : ""} onClick={() => setTab("questions")}>
            Questions
          </button>
          <button className={tab === "results" ? "active" : ""} onClick={() => setTab("results")}>
            Results
          </button>
          <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
            History
          </button>
        </div>

        {tab === "courses" && (
          <CoursesTab
            courses={courses}
            loading={loading}
            reload={loadCourses}
            flash={flash}
            setError={setError}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
          />
        )}

        {tab === "questions" && (
          <QuestionsTab
            courses={courses}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            flash={flash}
            setError={setError}
          />
        )}

        {tab === "results" && (
          <ResultsTab
            courses={courses}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            setError={setError}
          />
        )}

        {tab === "history" && <HistoryTab setError={setError} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function CoursesTab({ courses, loading, reload, flash, setError, selectedCourse, setSelectedCourse }) {
  const [form, setForm] = useState({ title: "", description: "", trainingHours: "" });
  const [saving, setSaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/admin/courses", {
        ...form,
        trainingHours: Number(form.trainingHours),
      });
      setForm({ title: "", description: "", trainingHours: "" });
      flash("Training course created");
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(course) {
    try {
      await api.patch(`/admin/courses/${course._id}`, { isActive: !course.isActive });
      flash(`Exam ${course.isActive ? "closed" : "opened"} for "${course.title}"`);
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course");
    }
  }

  async function remove(course) {
    if (!confirm(`Delete "${course.title}"? Its full record (details, students, mock scores, and dates) will be preserved in the History tab.`))
      return;
    try {
      await api.delete(`/admin/courses/${course._id}`);
      flash("Project deleted. Full record moved to History.");
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  }

  return (
    <div className="two-col">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>New training / course</h3>
        <form onSubmit={handleCreate}>
          <div className="field">
            <label>Course title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Full Stack Web Development"
              required
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What this training covers"
            />
          </div>
          <div className="field">
            <label>Training hours (which training hour / total duration)</label>
            <input
              type="number"
              min={1}
              value={form.trainingHours}
              onChange={(e) => setForm((f) => ({ ...f, trainingHours: e.target.value }))}
              placeholder="e.g. 40"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={saving}>
            {saving ? "Creating…" : "Create course"}
          </button>
        </form>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Existing courses</h3>
        {loading ? (
          <p>Loading…</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">No courses yet. Create one on the left.</div>
        ) : (
          <div className="grid">
            {courses.map((c) => (
              <div
                key={c._id}
                className="card course-card"
                style={{
                  borderColor: selectedCourse?._id === c._id ? "var(--navy)" : undefined,
                  cursor: "pointer",
                }}
                onClick={() => setSelectedCourse(c)}
              >
                <span className="hours-tag">{c.trainingHours} training hrs</span>
                <h3>{c.title}</h3>
                <p>{c.description || "No description"}</p>
                <div className="row">
                  <span className={`status-chip ${c.isActive ? "done" : "pending"}`}>
                    {c.isActive ? "Exam open" : "Exam closed"}
                  </span>
                </div>
                <div className="row">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActive(c);
                    }}
                  >
                    {c.isActive ? "Close exam" : "Open exam"}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(c);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function QuestionsTab({ courses, selectedCourse, setSelectedCourse, flash, setError }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qText, setQText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedCourse) loadQuestions(selectedCourse._id);
    else setQuestions([]);
  }, [selectedCourse]);

  async function loadQuestions(courseId) {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/questions/${courseId}`);
      setQuestions(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  function updateOption(i, value) {
    setOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  }
  function addOption() {
    setOptions((opts) => [...opts, ""]);
  }
  function removeOption(i) {
    setOptions((opts) => opts.filter((_, idx) => idx !== i));
    if (correctIndex >= options.length - 1) setCorrectIndex(0);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!selectedCourse) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/admin/questions", {
        course: selectedCourse._id,
        questionText: qText,
        options: options.filter((o) => o.trim() !== ""),
        correctOptionIndex: correctIndex,
      });
      setQText("");
      setOptions(["", ""]);
      setCorrectIndex(0);
      flash("Question added");
      loadQuestions(selectedCourse._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create question");
    } finally {
      setSaving(false);
    }
  }

  async function removeQuestion(id) {
    if (!confirm("Delete this question?")) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      flash("Question deleted");
      loadQuestions(selectedCourse._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  }

  if (!courses.length) {
    return <div className="empty-state">Create a course first, then come back to add questions.</div>;
  }

  return (
    <div>
      <div className="field" style={{ maxWidth: 340, marginBottom: 24 }}>
        <label>Course</label>
        <select
          value={selectedCourse?._id || ""}
          onChange={(e) => setSelectedCourse(courses.find((c) => c._id === e.target.value))}
        >
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="two-col">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add a question</h3>
          <form onSubmit={handleCreate}>
            <div className="field">
              <label>Question text</label>
              <textarea rows={2} value={qText} onChange={(e) => setQText(e.target.value)} required />
            </div>
            <div className="field">
              <label>Options (mark the correct one — hidden from students)</label>
              {options.map((opt, i) => (
                <div className="option-input-row" key={i}>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    required
                  />
                  <label className="correct-radio">
                    <input
                      type="radio"
                      name="correct"
                      checked={correctIndex === i}
                      onChange={() => setCorrectIndex(i)}
                    />
                    Correct
                  </label>
                  {options.length > 2 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeOption(i)}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addOption}>
                + Add option
              </button>
            </div>
            <button className="btn btn-primary btn-block" disabled={saving} style={{ marginTop: 8 }}>
              {saving ? "Adding…" : "Add question"}
            </button>
          </form>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Questions in this course ({questions.length})</h3>
          {loading ? (
            <p>Loading…</p>
          ) : questions.length === 0 ? (
            <div className="empty-state">No questions yet for this course.</div>
          ) : (
            questions.map((q, i) => (
              <div className="q-card" key={q._id}>
                <div className="q-index">Question {i + 1}</div>
                <p className="q-text">{q.questionText}</p>
                {q.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="option-row"
                    style={
                      idx === q.correctOptionIndex
                        ? { borderColor: "var(--green)", background: "var(--green-soft)" }
                        : {}
                    }
                  >
                    <span className="bubble" style={idx === q.correctOptionIndex ? { borderColor: "var(--green)" } : {}} />
                    <span className="option-text">{opt}</span>
                    {idx === q.correctOptionIndex && (
                      <span className="lock-tag" style={{ color: "var(--green)" }}>
                        Correct
                      </span>
                    )}
                  </div>
                ))}
                <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(q._id)} style={{ marginTop: 8 }}>
                  Delete question
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function ResultsTab({ courses, selectedCourse, setSelectedCourse, setError }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCourse) loadResults(selectedCourse._id);
    else setResults([]);
  }, [selectedCourse]);

  async function loadResults(courseId) {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/results/${courseId}`);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  }

  if (!courses.length) {
    return <div className="empty-state">No courses available yet.</div>;
  }

  return (
    <div>
      <div className="field" style={{ maxWidth: 340, marginBottom: 24 }}>
        <label>Course</label>
        <select
          value={selectedCourse?._id || ""}
          onChange={(e) => setSelectedCourse(courses.find((c) => c._id === e.target.value))}
        >
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : results.length === 0 ? (
        <div className="empty-state">No results declared yet for this course.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Score</th>
              <th>Submitted at</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id}>
                <td>{r.student?.name}</td>
                <td>{r.student?.email}</td>
                <td>
                  {r.score} / {r.totalQuestions}
                </td>
                <td>{new Date(r.submittedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function HistoryTab({ setError }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/history");
      setRecords(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  if (records.length === 0) {
    return (
      <div className="empty-state">
        No deleted projects yet. When a course/project is deleted, its full record — details,
        students, mock scores, and dates — will show up here.
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: "var(--ink-soft)", marginTop: 0, marginBottom: 20, fontSize: "0.9rem" }}>
        Archived projects are kept permanently with their original dates, even after deletion.
      </p>
      {records.map((r) => {
        const isOpen = expandedId === r._id;
        return (
          <div className="card" key={r._id} style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                cursor: "pointer",
                flexWrap: "wrap",
                gap: 10,
              }}
              onClick={() => setExpandedId(isOpen ? null : r._id)}
            >
              <div>
                <h3 style={{ margin: "0 0 4px" }}>{r.courseTitle}</h3>
                <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.85rem" }}>
                  {r.courseDescription || "No description"}
                </p>
                <div className="meta" style={{ marginTop: 8 }}>
                  Created {new Date(r.courseCreatedAt).toLocaleDateString()} &middot; Deleted{" "}
                  {new Date(r.deletedAt).toLocaleDateString()} &middot; {r.trainingHours} training hrs
                  &middot; {r.totalQuestions} questions
                </div>
              </div>
              <span className="hours-tag">{r.students.length} students</span>
            </div>

            {isOpen && (
              <div style={{ marginTop: 16 }}>
                {r.students.length === 0 ? (
                  <div className="empty-state">No students had attempted this project.</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Mock score</th>
                        <th>Status</th>
                        <th>Submitted at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.students.map((s, i) => (
                        <tr key={i}>
                          <td>{s.name}</td>
                          <td>{s.email}</td>
                          <td>
                            {s.submitted ? `${s.score} / ${s.totalQuestions}` : "—"}
                          </td>
                          <td>
                            <span className={`status-chip ${s.submitted ? "done" : "pending"}`}>
                              {s.submitted ? "Submitted" : "In progress"}
                            </span>
                          </td>
                          <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
