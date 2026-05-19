"use client";

import { useEffect } from "react";

export default function FullscreenViewer({ images, index, onIndexChange, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
      if (e.key === "ArrowRight" && index < images.length - 1) onIndexChange(index + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, images.length, onClose, onIndexChange]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.95)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl bg-transparent border-none cursor-pointer transition-transform hover:rotate-90 z-10"
        aria-label="Close full screen"
      >
        &times;
      </button>

      {/* Prev */}
      <button
        onClick={() => { if (index > 0) onIndexChange(index - 1); }}
        disabled={index <= 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-transparent border-none cursor-pointer disabled:opacity-30 z-10 transition-opacity"
        aria-label="Previous image"
      >
        &#10094;
      </button>

      {/* Image */}
      <img
        src={images[index]}
        alt="Project screenshot full screen"
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
      />

      {/* Next */}
      <button
        onClick={() => { if (index < images.length - 1) onIndexChange(index + 1); }}
        disabled={index >= images.length - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-transparent border-none cursor-pointer disabled:opacity-30 z-10 transition-opacity"
        aria-label="Next image"
      >
        &#10095;
      </button>

      {/* Thumbnails */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Thumbnail ${i + 1}`}
            onClick={() => onIndexChange(i)}
            className="cursor-pointer rounded flex-none transition-all"
            style={{
              width: 64,
              height: 48,
              objectFit: "cover",
              opacity: i === index ? 1 : 0.45,
              outline: i === index ? "2px solid white" : "none",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
