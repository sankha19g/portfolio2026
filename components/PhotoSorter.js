"use client";

import { useState, useCallback } from "react";

export default function PhotoSorter({ value, onChange, label }) {
  const [dragSrc, setDragSrc] = useState(null);

  const urls = value
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  const handleDrop = useCallback(
    (dropIndex) => {
      if (dragSrc === null || dragSrc === dropIndex) return;
      const updated = [...urls];
      const [moved] = updated.splice(dragSrc, 1);
      updated.splice(dropIndex, 0, moved);
      onChange(updated.join("\n"));
      setDragSrc(null);
    },
    [dragSrc, urls, onChange]
  );

  const handleDelete = useCallback(
    (index) => {
      const updated = urls.filter((_, i) => i !== index);
      onChange(updated.join("\n"));
    },
    [urls, onChange]
  );

  if (!urls.length) return null;

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold opacity-60 mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {urls.map((url, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragSrc(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => setDragSrc(null)}
            className="relative rounded-lg overflow-hidden flex-none cursor-grab active:cursor-grabbing transition-opacity"
            style={{ width: 72, height: 54, opacity: dragSrc === i ? 0.5 : 1 }}
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {/* Badge */}
            <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[10px] rounded px-1">
              {i + 1}
            </span>
            {/* Delete */}
            <button
              type="button"
              onClick={() => handleDelete(i)}
              className="absolute top-0.5 right-0.5 bg-black/60 text-white text-xs w-4 h-4 rounded flex items-center justify-center leading-none hover:bg-red-600"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
