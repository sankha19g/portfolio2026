"use client";

import { useState, useEffect, useRef } from "react";

export default function AdminAuthModal({ open, onAuth, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = () => {
    const success = onAuth(password);
    if (!success) setError("Incorrect password.");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="rounded-xl shadow-2xl p-6 w-80"
        style={{ background: "var(--card-bg)", color: "var(--text)" }}
      >
        <h3 className="font-bold text-lg mb-1">Admin Access</h3>
        <p className="text-sm opacity-60 mb-4">Enter the admin password to continue.</p>
        <input
          ref={inputRef}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          className="w-full px-3 py-2 rounded-lg border text-sm mb-2 outline-none focus:ring-2"
          style={{
            background: "var(--bg)",
            borderColor: "var(--border-color)",
            color: "var(--text)",
          }}
          autoComplete="current-password"
        />
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex gap-2 justify-end mt-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border-color)", color: "var(--text)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--primary-color)", color: "var(--btn-text)" }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}
