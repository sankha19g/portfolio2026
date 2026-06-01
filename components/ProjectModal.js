"use client";

import { useEffect, useRef } from "react";

export default function ProjectModal({
  project,
  currentImages,
  currentIndex,
  activeFilter,
  adminAuthenticated,
  onClose,
  onFilterChange,
  onImageIndexChange,
  onFullscreen,
  onEdit,
  onLinkClick,
}) {
  const touchStartX = useRef(0);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const goPrev = () => {
    if (currentIndex > 0) onImageIndexChange(currentIndex - 1);
  };
  const goNext = () => {
    if (currentIndex < currentImages.length - 1) onImageIndexChange(currentIndex + 1);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-105 transition-opacity duration-300 px-4 py-6"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-5xl rounded-xl overflow-hidden flex flex-col"
        style={{
          background: "var(--card-bg)",
          color: "var(--text)",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-3xl cursor-pointer bg-transparent border-none leading-none transition-transform hover:rotate-90 z-10"
          style={{ color: "var(--text)" }}
        >
          &times;
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          {/* Title */}
          <h2 className="text-xl md:text-2xl font-bold pr-8 mb-4">{project.title || "Untitled Project"}</h2>

          {/* Body */}
          <div className="flex flex-col md:flex-row gap-5" style={{ minHeight: 0 }}>
            {/* LEFT: Slider */}
            <div className="w-full md:w-[45%] md:flex-none" style={{ minWidth: 0 }}>
              {/* Filter buttons */}
              <div className="flex justify-center gap-2.5 mb-4">
                {["pc", "mobile"].map((f) => (
                  <button
                    key={f}
                    onClick={() => onFilterChange(f)}
                    className="px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all border"
                    style={{
                      background: activeFilter === f ? "var(--primary-color)" : "transparent",
                      color: activeFilter === f ? "#fff" : "var(--text-color)",
                      borderColor: activeFilter === f ? "var(--primary-color)" : "var(--border-color)",
                    }}
                  >
                    {f === "pc" ? "PC" : "Mobile"}
                  </button>
                ))}
              </div>

              {/* Slider */}
              <div
                className="relative flex items-center justify-center my-4"
                style={{ minHeight: 320 }}
              >
                <button
                  onClick={goPrev}
                  disabled={currentIndex <= 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center text-3xl transition-opacity disabled:opacity-40 cursor-pointer"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "2px solid rgba(0,0,0,0.7)",
                    color: "var(--text)",
                  }}
                >
                  &#10094;
                </button>

                {currentImages.length > 0 ? (
                  <img
                    key={currentImages[currentIndex]}
                    src={currentImages[currentIndex]}
                    alt="Project screenshot"
                    className="slider-img-fade relative z-1"
                    style={{ maxWidth: "100%", maxHeight: 400 }}
                    onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                    onTouchEnd={(e) => {
                      const endX = e.changedTouches[0].clientX;
                      if (touchStartX.current - endX > 50) goNext();
                      if (endX - touchStartX.current > 50) goPrev();
                    }}
                  />
                ) : (
                  <div className="text-sm opacity-50">No images</div>
                )}

                <button
                  onClick={goNext}
                  disabled={currentIndex >= currentImages.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center text-3xl transition-opacity disabled:opacity-40 cursor-pointer"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "2px solid rgba(0,0,0,0.7)",
                    color: "var(--text)",
                  }}
                >
                  &#10095;
                </button>

                {/* Zoom */}
                <button
                  onClick={onFullscreen}
                  disabled={!currentImages.length}
                  className="absolute top-2.5 right-2.5 z-3 w-9 h-9 rounded-full text-lg flex items-center justify-center transition-all hover:-translate-y-px disabled:opacity-40"
                  style={{
                    background: "#fff",
                    border: "2px solid rgba(0,0,0,0.7)",
                    color: "var(--text)",
                  }}
                  aria-label="View full screen"
                >
                  🔍
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 mt-3 p-1 overflow-x-auto pb-1">
                {currentImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Thumbnail ${i + 1}`}
                    onClick={() => onImageIndexChange(i)}
                    className="cursor-pointer rounded flex-none transition-all"
                    style={{
                      width: 60,
                      height: 45,
                      objectFit: "cover",
                      opacity: i === currentIndex ? 1 : 0.5,
                      outline: i === currentIndex ? "2px solid var(--primary-color)" : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT: Description */}
            <div
              className="flex-1 md:overflow-y-auto pl-0 md:pl-5 pr-0 md:pr-4 pt-5 md:pt-0 border-t md:border-t-0 border-l-0 md:border-l max-h-none md:max-h-[450px]"
              style={{
                borderColor: "var(--border-color)",
              }}
            >
              {/* Tech breakdown */}
              <div className="mb-5">
                <div className="font-semibold mb-2">Tech Stack</div>
                {project.tech?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer hover:px-[20px]"
                        style={{
                          background: "var(--bg-secondary)",
                          borderColor: "var(--border-color)",
                          color: "var(--text-color)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm opacity-60">Tech not specified</div>
                )}
              </div>

              {/* Description */}
              <div
                className="scroll-desc text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: project.description || "No description yet." }}
              />
            </div>
          </div>
        </div>

        {/* Buttons (Fixed Footer) */}
        <div
          className="flex gap-3 px-5 md:px-8 py-4 border-t shrink-0 w-full z-10"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          {adminAuthenticated && (
            <button
              onClick={onEdit}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm border transition-all hover:opacity-80 cursor-pointer"
              style={{ borderColor: "var(--primary-color)", color: "var(--primary-color)" }}
            >
              Edit
            </button>
          )}
          <a
            href={project.live || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!onLinkClick(project.live, "Live website")) e.preventDefault();
            }}
            className="flex-1 text-center py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-80"
            style={{ background: "var(--primary-color)", color: "var(--btn-text)" }}
          >
            Visit Website
          </a>
          <a
            href={project.github || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!onLinkClick(project.github, "GitHub")) e.preventDefault();
            }}
            className="flex-1 text-center py-2.5 border rounded-lg font-semibold text-sm transition-all hover:opacity-80"
            style={{ borderColor: "var(--primary-color)", color: "var(--primary-color)" }}
          >
            Visit GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
