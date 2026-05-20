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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on resize to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 flex justify-between items-center px-4 md:px-8 z-50 transition-all duration-300`}
        style={{
          height: "75px",
          backdropFilter: isScrolled || mobileMenuOpen ? "blur(12px)" : "none",
          WebkitBackdropFilter: isScrolled || mobileMenuOpen ? "blur(12px)" : "none",
          backgroundColor: isScrolled || mobileMenuOpen
            ? theme === "dark"
              ? "rgba(15, 15, 15, 0.85)"
              : "rgba(255, 255, 255, 0.85)"
            : "transparent",
          borderColor: isScrolled || mobileMenuOpen
            ? theme === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.06)"
            : "transparent",
          borderBottomWidth: isScrolled || mobileMenuOpen ? "1px" : "0px",
          borderBottomStyle: "solid",
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

          <span className="w-px h-6 mx-2.5 hidden md:inline-block" style={{ background: "#888" }} />

          {/* Resume */}
          <a
            id="resumeLink"
            href={resumeLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md font-semibold text-sm transition-all hover:scale-105 hidden md:inline-block"
            style={{
              background: "var(--primary-color)",
              color: "var(--btn-text)",
            }}
          >
            Resume
          </a>

          <span className="w-px h-6 mx-2.5 hidden md:inline-block" style={{ background: "#888" }} />

          {/* Contact */}
          <a
            href="#contact"
            className="px-3 py-1.5 rounded-md font-semibold text-sm transition-all hover:scale-105 hidden md:inline-block"
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
          {/* Desktop Admin Tools */}
          <div className="hidden md:block">
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
          </div>

          <ThemeToggle theme={theme} onToggle={onThemeToggle} />

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex md:hidden items-center justify-center p-2 rounded-md hover:bg-(--bg-secondary) transition-colors cursor-pointer"
            aria-label="Toggle Menu"
            style={{ color: "var(--text)" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile navigation overlay menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[75px] z-45 flex flex-col p-6 gap-6 md:hidden transition-all duration-300"
          style={{
            background: theme === "dark" ? "rgba(15, 15, 15, 0.98)" : "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            height: "calc(100vh - 75px)",
            overflowY: "auto",
          }}
        >
          <a
            id="resumeLinkMobile"
            href={resumeLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3.5 text-center rounded-xl font-semibold text-base transition-all active:scale-95 flex items-center justify-center"
            style={{
              background: "var(--primary-color)",
              color: "var(--btn-text)",
            }}
          >
            Resume
          </a>

          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3.5 text-center rounded-xl font-semibold text-base transition-all active:scale-95 flex items-center justify-center"
            style={{
              background: "var(--primary-color)",
              color: "var(--btn-text)",
            }}
          >
            Contact Me
          </a>

          <div className="h-px w-full my-1" style={{ background: "var(--border-color)" }} />

          {/* Admin panel controls inside mobile menu */}
          <div className="w-full">
            {adminAuthenticated ? (
              <div className="flex flex-col gap-3">
                <div className="text-center font-bold text-xs uppercase tracking-wider opacity-60 mb-1">
                  Admin Tools
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); onAdminAdd(); }}
                  className="w-full py-3 text-center rounded-xl font-medium border text-sm cursor-pointer"
                  style={{ borderColor: "var(--border-color)", color: "var(--text)" }}
                >
                  Add Project
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onAdminResume(); }}
                  className="w-full py-3 text-center rounded-xl font-medium border text-sm cursor-pointer"
                  style={{ borderColor: "var(--border-color)", color: "var(--text)" }}
                >
                  Upload Resume
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onAdminDelete(); }}
                  className="w-full py-3 text-center rounded-xl font-medium border text-sm cursor-pointer"
                  style={{ borderColor: "var(--border-color)", color: "var(--text)" }}
                >
                  Delete Project
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onAdminSort(); }}
                  className="w-full py-3 text-center rounded-xl font-medium border text-sm cursor-pointer"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text)",
                    background: isSortMode ? "var(--bg-secondary)" : "transparent",
                  }}
                >
                  {isSortMode ? "Done Sorting" : "Sort Projects"}
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onToggleGridAspect(); }}
                  className="w-full py-3 text-center rounded-xl font-medium border text-sm cursor-pointer"
                  style={{ borderColor: "var(--border-color)", color: "var(--text)" }}
                >
                  {isSquareGrid ? "Rectangle Grid Layout" : "Square Grid Layout"}
                </button>
                <div className="h-px w-full my-1" style={{ background: "var(--border-color)" }} />
                <button
                  onClick={() => { setMobileMenuOpen(false); onAdminLogout(); }}
                  className="w-full py-3 text-center rounded-xl font-semibold border text-sm text-red-500 cursor-pointer"
                  style={{ borderColor: "#e74c3c", color: "#e74c3c" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); onAdminToggle(); }}
                className="w-full py-3.5 text-center rounded-xl font-semibold text-base border transition-all active:scale-95 cursor-pointer"
                style={{
                  borderColor: "var(--primary-color)",
                  color: "var(--primary-color)",
                }}
              >
                Admin Login
              </button>
            )}
          </div>
        </div>
      )}
    </>
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
