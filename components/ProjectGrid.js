"use client";

import { useRef, useState, useCallback } from "react";
import { persistProjects } from "@/lib/projectsApi";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function ProjectGrid({
  projects,
  loading,
  error,
  isSortMode,
  onProjectClick,
  onProjectsReorder,
  isSquareGrid,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const gridRef = useRef(null);

  const handleDragStart = useCallback(
    (e, index) => {
      if (!isSortMode) return;
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
    },
    [isSortMode]
  );

  const handleDragOver = useCallback(
    (e, index) => {
      if (!isSortMode) return;
      e.preventDefault();
      setDropTarget(index);
    },
    [isSortMode]
  );

  const handleDrop = useCallback(
    async (e, dropIndex) => {
      if (!isSortMode || dragIndex === null) return;
      e.preventDefault();
      if (dropIndex === dragIndex) {
        setDragIndex(null);
        setDropTarget(null);
        return;
      }
      const updated = [...projects];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      onProjectsReorder(updated);
      setDragIndex(null);
      setDropTarget(null);
      try {
        await persistProjects(updated);
      } catch (err) {
        console.error("Failed to persist order:", err);
      }
    },
    [isSortMode, dragIndex, projects, onProjectsReorder]
  );

  if (loading) {
    const skeletons = Array.from({ length: 6 });
    return (
      <div
        className="animate-pulse"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "24px",
          padding: "0 20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="overflow-hidden flex flex-col rounded-xl"
            style={{
              width: "300px",
              maxWidth: "100%",
              flexShrink: 0,
              border: "1px solid var(--border-color)",
            }}
          >
            {/* Image Skeleton */}
            <div
              style={{
                aspectRatio: isSquareGrid ? "1/1" : "16/9",
                background: "var(--bg-secondary)",
                width: "100%",
              }}
            />
            {/* Title Skeleton */}
            <div style={{ padding: "12px", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  height: "14px",
                  width: "60%",
                  background: "var(--bg-secondary)",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-5">
        <p className="text-center py-12 text-sm text-red-500">⚠️ {error}</p>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="max-w-6xl mx-auto px-5">
        <p className="text-center py-12 text-sm opacity-60">No projects yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={gridRef}
      className={isSortMode ? "grid-sorting" : ""}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "24px",
        padding: "0 20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {projects.map((project, index) => {
        const thumb =
          project.pcImages?.length
            ? project.pcImages[0]
            : project.images?.length
              ? project.images[0]
              : null;

        const isDragging = dragIndex === index;
        const isDropTarget = dropTarget === index && dragIndex !== index;

        return (
          <motion.div
            variants={cardVariants}
            key={project._id || index}
            data-index={index}
            draggable={isSortMode}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={() => { setDragIndex(null); setDropTarget(null); }}
            onClick={() => onProjectClick(project, index)}
            whileHover={!isSortMode ? { y: -6, scale: 1.02, boxShadow: "0 14px 36px rgba(0,0,0,0.14)" } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`project-card cursor-pointer overflow-hidden flex flex-col rounded-xl ${
              isSortMode ? "cursor-grab active:cursor-grabbing" : ""
            } ${isDragging ? "dragging opacity-50" : ""} ${isDropTarget ? "drop-target" : ""
            }`}
            style={{
              width: "300px",
              maxWidth: "100%",
              flexShrink: 0,
            }}
          >
            <div>
              {/* Image */}
              <div
                className="w-full overflow-hidden relative transition-all duration-300"
                style={{ aspectRatio: isSquareGrid ? "1/1" : "16/9", background: "rgba(0,0,0,0.03)" }}
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={project.title || "Project image"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    style={{ transformOrigin: "center center" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center border border-dashed border-gray-400 text-gray-500 text-sm">
                    No image
                  </div>
                )}
              </div>
              {/* Title */}
              <p
                className="text-center mt-2 mb-1 font-semibold text-sm px-2 cursor-pointer"
                style={{ color: "var(--text)" }}
              >
                {project.title || "Untitled Project"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
