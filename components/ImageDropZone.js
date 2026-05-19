"use client";

import { useState, useRef, useCallback } from "react";

export default function ImageDropZone({ onFiles, label }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  const handleChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length) onFiles(files);
      e.target.value = "";
    },
    [onFiles]
  );

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-6 gap-3 transition-all cursor-pointer ${
        isDragOver ? "drop-zone-active" : ""
      }`}
      style={{ borderColor: isDragOver ? "#7b3ff2" : "var(--border-color)" }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {/* Cloud icon */}
      <svg
        width={40}
        height={40}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-40"
      >
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
      </svg>
      <p className="text-xs opacity-60 text-center leading-relaxed">
        Drop {label} images here
        <br />or
      </p>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        className="px-4 py-1.5 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-70"
        style={{ borderColor: "var(--border-color)", color: "var(--text)" }}
      >
        Browse
      </button>
    </div>
  );
}
