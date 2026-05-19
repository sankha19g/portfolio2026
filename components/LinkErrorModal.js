"use client";

import { useEffect, useRef } from "react";

export default function LinkErrorModal({ open, message, onClose }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-xl shadow-2xl p-6 w-80"
        style={{ background: "var(--card-bg)", color: "var(--text)" }}
      >
        <h3 className="font-bold text-lg mb-2">Link Unavailable</h3>
        <p className="text-sm opacity-80 mb-4">{message || "This link is not available yet."}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--primary-color)", color: "var(--btn-text)" }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
