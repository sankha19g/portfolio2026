"use client";

import { useState, useEffect } from "react";
import { persistProjects } from "@/lib/projectsApi";

export default function AdminDeleteModal({ open, projects, preferredIndex, onClose, onDeleted }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      setError("");
      setProgress(0);
      const safe = Math.max(0, Math.min(preferredIndex ?? 0, projects.length - 1));
      setSelectedIndex(safe);
    }
  }, [open, preferredIndex, projects.length]);

  const handleDelete = async () => {
    if (!projects[selectedIndex]) { setError("Select a project first."); return; }
    const title = projects[selectedIndex].title || "this project";
    if (!window.confirm(`Delete "${title}"?`)) return;

    setDeleting(true);
    setProgress(1);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(90, p + (p < 50 ? 3 : 1)));
    }, 80);

    const updated = [...projects];
    updated.splice(selectedIndex, 1);

    try {
      await persistProjects(updated);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setDeleting(false);
        setProgress(0);
        onDeleted(updated, selectedIndex);
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setDeleting(false);
      setProgress(0);
      setError(err.message);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget && !deleting) onClose(); }}
    >
      <div
        className="rounded-xl shadow-2xl p-6 w-80"
        style={{ background: "var(--card-bg)", color: "var(--text)" }}
      >
        <h3 className="font-bold text-lg mb-1">Delete Project</h3>
        <p className="text-sm opacity-60 mb-4">Select the project you want to delete.</p>

        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          disabled={deleting || !projects.length}
          className="w-full px-3 py-2 rounded-lg border text-sm mb-3 outline-none"
          style={{
            background: "var(--bg)",
            borderColor: "var(--border-color)",
            color: "var(--text)",
          }}
        >
          {projects.length === 0 ? (
            <option value="">No projects available</option>
          ) : (
            projects.map((p, i) => (
              <option key={p._id || i} value={i}>
                {p.title || `Project ${i + 1}`}
              </option>
            ))
          )}
        </select>

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

        {deleting && (
          <div className="mb-3">
            <div className="text-xs opacity-60 mb-1">Deleting... {Math.round(progress)}%</div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: "var(--primary-color)" }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-opacity hover:opacity-70 disabled:opacity-40"
            style={{ borderColor: "var(--border-color)", color: "var(--text)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || !projects.length}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "#e74c3c", color: "#fff" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
