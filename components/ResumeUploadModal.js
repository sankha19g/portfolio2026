"use client";

import { useState, useEffect } from "react";
import { saveResumeLink } from "@/lib/projectsApi";

const FALLBACK_LINK = "https://flowcv.com/resume/254chbkj0ep4";

export default function ResumeUploadModal({ open, onClose, currentLink, onLinkSaved }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState({ message: "", type: "info" });
  const [saving, setSaving] = useState(false);

  // Pre-fill with current link whenever modal opens
  useEffect(() => {
    if (open) {
      setUrl(currentLink || FALLBACK_LINK);
      setStatus({ message: "", type: "info" });
    }
  }, [open, currentLink]);

  const handleSave = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setStatus({ message: "Please enter a URL.", type: "error" });
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setStatus({ message: "Enter a valid URL starting with http:// or https://", type: "error" });
      return;
    }
    setSaving(true);
    setStatus({ message: "Saving…", type: "info" });
    try {
      await saveResumeLink(trimmed);
      setStatus({ message: "Resume link saved!", type: "success" });
      onLinkSaved?.(trimmed);
      setTimeout(() => { onClose(); }, 700);
    } catch (err) {
      setStatus({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-160 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-xl shadow-2xl p-6 w-96"
        style={{ background: "var(--card-bg)", color: "var(--text)" }}
      >
        <h3 className="font-bold text-lg mb-1">Update Resume Link</h3>
        <p className="text-sm mb-4" style={{ opacity: 0.6 }}>
          Paste the URL of your resume (e.g. FlowCV, Google Drive, Notion).
        </p>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          placeholder="https://flowcv.com/resume/..."
          className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            color: "var(--text)",
          }}
        />

        {status.message && (
          <p
            className="text-xs mb-3"
            style={{
              color:
                status.type === "error"
                  ? "#e05252"
                  : status.type === "success"
                  ? "#3cba6e"
                  : "var(--text)",
            }}
          >
            {status.message}
          </p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border-color)", color: "var(--text)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--primary-color)", color: "var(--btn-text)" }}
          >
            {saving ? "Saving…" : "Save Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
