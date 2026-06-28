"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function ContactPage() {
  const [theme, setTheme] = useState("light");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Restore theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setTheme("dark");
  }, []);

  // Apply theme to <html> and body
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.style.background = theme === "dark" ? "#0f0f0f" : "#ffffff";
    document.body.style.color = theme === "dark" ? "#f1f1f1" : "#111";
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  // Handle files adding
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...filesArray]);
    }
  };

  // Remove individual attachment
  const handleRemoveAttachment = (indexToRemove) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("senderEmail", senderEmail);
      formData.append("subject", subject);
      formData.append("body", body);
      
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to send message. Please try again.");
      }

      setSuccess(true);
      setSenderEmail("");
      setSubject("");
      setBody("");
      setAttachments([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* Top Navbar */}
      <header
        className="w-full flex justify-between items-center px-4 md:px-8 border-b transition-all duration-300"
        style={{
          height: "75px",
          borderColor: "var(--border-color)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-sm transition-all hover:-translate-x-1"
          style={{ color: "var(--text)" }}
        >
          <svg className="w-5 h-5 animate-pulse-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Portfolio
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div
          className="w-full max-w-2xl rounded-2xl p-6 md:p-10 transition-all duration-300 shadow-xl border"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Get in Touch</h1>
            <p className="opacity-70 text-sm">Send a message using the form below. I will reply to you as soon as possible.</p>
          </div>

          {success && (
            <div
              className="p-4 mb-6 rounded-lg text-center flex flex-col items-center gap-2 border animate-pulse-soft"
              style={{
                backgroundColor: "rgba(46, 204, 113, 0.1)",
                borderColor: "rgba(46, 204, 113, 0.4)",
                color: "#2ecc71",
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Message Sent Successfully!</h3>
                <p className="text-xs opacity-90 mt-1">Thank you for reaching out. I'll get back to you shortly.</p>
              </div>
            </div>
          )}

          {error && (
            <div
              className="p-4 mb-6 rounded-lg text-center flex flex-col items-center gap-2 border"
              style={{
                backgroundColor: "rgba(231, 76, 60, 0.1)",
                borderColor: "rgba(231, 76, 60, 0.4)",
                color: "#e74c3c",
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Failed to Send Message</h3>
                <p className="text-xs opacity-90 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Sender Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="senderEmail" className="text-xs font-semibold uppercase tracking-wider opacity-85">
                Your Email Address
              </label>
              <input
                id="senderEmail"
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-lg border outline-none transition-all duration-300 text-sm"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text)",
                }}
              />
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider opacity-85">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is this about?"
                className="w-full px-4 py-3 rounded-lg border outline-none transition-all duration-300 text-sm"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text)",
                }}
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="body" className="text-xs font-semibold uppercase tracking-wider opacity-85">
                Message / Body
              </label>
              <textarea
                id="body"
                required
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 rounded-lg border outline-none transition-all duration-300 text-sm resize-none"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text)",
                }}
              />
            </div>

            {/* Attachments */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-85">
                Attachments (Optional)
              </span>
              
              <div 
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all hover:opacity-85"
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-secondary)",
                }}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <svg className="w-8 h-8 mx-auto mb-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-xs opacity-75 font-medium">Click to select files or attachments</p>
                <p className="text-[10px] opacity-50 mt-1">Images, PDFs, or documents</p>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2.5">
                  <span className="text-[10px] font-semibold uppercase opacity-65 tracking-wider">
                    Selected Files ({attachments.length})
                  </span>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium"
                        style={{
                          background: "var(--bg-secondary)",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="text-red-500 hover:text-red-700 transition-colors p-0.5 rounded cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3 px-4 rounded-lg font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: "var(--primary-color)",
                color: "var(--btn-text)",
              }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending Message...
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
