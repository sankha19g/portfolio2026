"use client";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      id="themeToggle"
      onClick={onToggle}
      aria-label={theme === "dark" ? "Turn on light mode" : "Turn on dark mode"}
      title={theme === "dark" ? "Turn on light mode" : "Turn on dark mode"}
      className="text-xl cursor-pointer bg-transparent border-none transition-transform active:scale-90 flex items-center justify-center p-1.5"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
