"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Header({
  adminAuthenticated,
  onAdminToggle,
  onAdminAdd,
  onAdminResume,
  onAdminDelete,
  onAdminSort,
  isSortMode,
  onAdminLogout,
  theme,
  onThemeToggle,
  resumeLink,
  isScrolled,
  isSquareGrid,
  onToggleGridAspect,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 flex justify-between items-center px-8 z-50 transition-all duration-300`}
      style={{
        height: "75px",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: isScrolled ? "blur(12px)" : "none",
        backgroundColor: isScrolled
          ? theme === "dark"
            ? "rgba(15, 15, 15, 0.85)"
            : "rgba(255, 255, 255, 0.85)"
          : "transparent",
        borderColor: isScrolled
          ? theme === "dark"
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.06)"
          : "transparent",
      }}
    >
      {/* LEFT: Social + links */}
      <div className="flex items-center gap-2.5">
        {/* GitHub */}
        <a
          href="https://github.com/sankha19g"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-110"
        >
          <img
            src="/images/logo/github.svg"
            alt="GitHub"
            width={24}
            height={24}
            style={{ filter: "var(--icon-filter, none)" }}
          />
        </a>

        <span
          className="w-px h-6 mx-2.5"
          style={{ background: "#888" }}
        />

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/sankha19/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-110"
        >
          <img
            src="/images/logo/linkedin.svg"
            alt="LinkedIn"
            width={24}
            height={24}
            style={{ filter: "var(--icon-filter, none)" }}
          />
        </a>

        <span className="w-px h-6 mx-2.5" style={{ background: "#888" }} />

        {/* Resume */}
        <a
          id="resumeLink"
          href={resumeLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-md font-semibold text-sm transition-all hover:scale-105"
          style={{
            background: "var(--primary-color)",
            color: "var(--btn-text)",
          }}
        >
          Resume
        </a>

        <span className="w-px h-6 mx-2.5" style={{ background: "#888" }} />

        {/* Contact */}
        <a
          href="#contact"
          className="px-3 py-1.5 rounded-md font-semibold text-sm transition-all hover:scale-105"
          style={{
            background: "var(--primary-color)",
            color: "var(--btn-text)",
          }}
        >
          Contact Me
        </a>
      </div>

      {/* RIGHT: Admin + Theme */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {adminAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className={`px-3 py-1.5 rounded-md font-semibold text-sm border transition-all flex items-center gap-1.5 ${dropdownOpen
                ? "text-(--btn-text) bg-(--primary-color)"
                : "text-(--primary-color) bg-transparent"
                }`}
              style={{ borderColor: "var(--primary-color)" }}
            >
              Admin Tools ▾
            </button>

            {dropdownOpen && (
              <div
                className="absolute top-[calc(100%+10px)] right-0 w-48 rounded-lg shadow-2xl z-60 flex flex-col gap-1 p-1.5"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <DropdownItem label="Add Project" onClick={() => { setDropdownOpen(false); onAdminAdd(); }} />
                <DropdownItem label="Upload Resume" onClick={() => { setDropdownOpen(false); onAdminResume(); }} />
                <DropdownItem label="Delete Project" onClick={() => { setDropdownOpen(false); onAdminDelete(); }} />
                <DropdownItem
                  label={isSortMode ? "Done Sorting" : "Sort Projects"}
                  onClick={() => { setDropdownOpen(false); onAdminSort(); }}
                  active={isSortMode}
                />
                <DropdownItem
                  label={isSquareGrid ? "Rectangle Grid Layout" : "Square Grid Layout"}
                  onClick={() => { setDropdownOpen(false); onToggleGridAspect(); }}
                />
                <div className="h-px my-1" style={{ background: "var(--border-color)" }} />
                <DropdownItem label="Logout" onClick={() => { setDropdownOpen(false); onAdminLogout(); }} danger />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onAdminToggle}
            className="px-3 py-1.5 rounded-md font-semibold text-sm border transition-all hover:bg-(--primary-color) hover:text-(--btn-text) hover:-translate-y-px"
            style={{
              borderColor: "var(--primary-color)",
              color: "var(--primary-color)",
            }}
          >
            Admin
          </button>
        )}

        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
    </header>
  );
}

function DropdownItem({ label, onClick, danger, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${danger
        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        : active
          ? "font-semibold"
          : "hover:bg-(--bg-secondary)"
        }`}
      style={{ color: danger ? "#e74c3c" : "var(--text)" }}
    >
      {label}
    </button>
  );
}
