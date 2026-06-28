"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  persistProjects,
  compressImage,
  uploadToCloudinary,
} from "@/lib/projectsApi";
import { loadProjectDetails } from "@/lib/projectsApi";
import { connectGithubRepo } from "@/lib/techUtils";
import ImageDropZone from "./ImageDropZone";
import PhotoSorter from "./PhotoSorter";

export default function AdminPanel({
  open,
  mode,
  editIndex,
  projects,
  onClose,
  onProjectsUpdate,
  onOpenModal,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tech: "",
    live: "",
    github: "",
    pcImages: "",
    mobileImages: "",
  });
  const [status, setStatus] = useState({ message: "", type: "info" });
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [githubLoading, setGithubLoading] = useState(false);

  // When mode or editIndex changes, populate form
  useEffect(() => {
    if (!open) return;
    if (mode === "add") {
      setSelectedIndex(null);
      resetForm();
    } else if (mode === "edit" && typeof editIndex === "number") {
      loadAndSelectProject(editIndex);
    }
  }, [open, mode, editIndex]);

  function resetForm() {
    const empty = { title: "", description: "", tech: "", live: "", github: "", pcImages: "", mobileImages: "" };
    setForm(empty);
    setSelectedIndex(null);
    setStatus({ message: "Creating a new project.", type: "info" });
  }

  async function loadAndSelectProject(index) {
    setSelectedIndex(index);
    let project = projects[index];
    if (project._id && !project.fullDetails) {
      try {
        setStatus({ message: "Loading details...", type: "info" });
        const details = await loadProjectDetails(project._id);
        if (details) {
          const updated = [...projects];
          updated[index] = details;
          onProjectsUpdate(updated);
          project = details;
        }
      } catch {
        setStatus({ message: "Failed to load details.", type: "error" });
      }
    }
    const newForm = {
      title: project.title || "",
      description: htmlToMarkdown(project.description || ""),
      tech: project.tech ? project.tech.join(", ") : "",
      live: project.live || "",
      github: project.github || "",
      pcImages: project.pcImages?.join("\n") || project.images?.join("\n") || "",
      mobileImages: project.mobileImages?.join("\n") || "",
    };
    setForm(newForm);
    setStatus({ message: `Editing "${project.title || "Untitled Project"}".`, type: "info" });
  }

  function getDescriptionHtml() {
    return markdownToHtml(form.description || "");
  }

  function getDescriptionText() {
    return (form.description || "").trim();
  }

  const handleSave = async (e) => {
    e.preventDefault();

    const desc = getDescriptionText();
    if (!form.title.trim() || !desc) {
      setStatus({ message: "Title and description are required.", type: "error" });
      return;
    }

    const project = {
      title: form.title.trim(),
      description: getDescriptionHtml().trim(),
      tech: form.tech.split(",").map((t) => t.trim()).filter(Boolean),
      live: form.live.trim(),
      github: form.github.trim(),
      pcImages: form.pcImages.split("\n").map((u) => u.trim()).filter(Boolean),
      mobileImages: form.mobileImages.split("\n").map((u) => u.trim()).filter(Boolean),
    };

    // Preserve _id if editing
    if (selectedIndex !== null && projects[selectedIndex]?._id) {
      project._id = projects[selectedIndex]._id;
    }

    const updated = [...projects];
    let savedIndex;
    if (selectedIndex === null) {
      updated.push(project);
      savedIndex = updated.length - 1;
    } else {
      updated[selectedIndex] = project;
      savedIndex = selectedIndex;
    }

    setSaving(true);
    setSaveProgress(1);
    const interval = setInterval(() => {
      setSaveProgress((p) => Math.min(90, p + (p < 50 ? 3 : 1)));
    }, 80);

    try {
      await persistProjects(updated);
      clearInterval(interval);
      setSaveProgress(100);
      onProjectsUpdate(updated);
      setStatus({ message: "Saved successfully.", type: "success" });
      setTimeout(() => {
        setSaving(false);
        setSaveProgress(0);
        onClose();
        if (updated[savedIndex]) onOpenModal(updated[savedIndex], savedIndex);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setSaving(false);
      setSaveProgress(0);
      setStatus({ message: err.message, type: "error" });
    }
  };

  const handleImageUpload = useCallback(async (files, field) => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      setStatus({ message: `Uploading ${field === "pcImages" ? "PC" : "Mobile"} image...`, type: "info" });
      try {
        const reader = new FileReader();
        const dataUrl = await new Promise((res, rej) => {
          reader.onload = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
        const compressed = await compressImage(dataUrl);
        const url = await uploadToCloudinary(compressed);
        setForm((prev) => ({
          ...prev,
          [field]: prev[field] ? `${prev[field]}\n${url}` : url,
        }));
        setStatus({ message: "Image uploaded. Remember to save.", type: "success" });
      } catch {
        setStatus({ message: "Cloud upload failed.", type: "error" });
      }
    }
  }, []);

  const handleGithubConnect = async () => {
    setGithubLoading(true);
    setStatus({ message: "Connecting to GitHub...", type: "info" });
    try {
      const result = await connectGithubRepo({
        githubUrl: form.github,
        currentTitle: form.title,
        hasDesc: !!getDescriptionText(),
      });
      setForm((prev) => ({
        ...prev,
        tech: result.tech.join(", ") || prev.tech,
        github: result.github,
        title: result.title || prev.title,
        live: result.live || prev.live,
      }));
      if (result.description) {
        setForm((prev) => ({ ...prev, description: htmlToMarkdown(result.description) }));
      }
      setStatus({ message: "Connected. GitHub data imported.", type: "success" });
    } catch (err) {
      setStatus({ message: err.message, type: "error" });
    } finally {
      setGithubLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-110 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 h-full z-120 flex flex-col admin-panel-open overflow-hidden"
        style={{
          width: "min(480px, 95vw)",
          background: "var(--card-bg)",
          color: "var(--text)",
          boxShadow: "-4px 0 40px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-none"
          style={{ borderColor: "var(--border-color)" }}
        >
          <h2 className="font-bold text-lg">
            {mode === "edit" ? "Edit Project" : "Add Your Project"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-xl transition-transform hover:rotate-90"
            style={{ color: "var(--text)" }}
          >
            &times;
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Project list (add mode) */}
          {mode === "add" && projects.length > 0 && (
            <div>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-opacity hover:opacity-70"
                  style={{ borderColor: "var(--border-color)", color: "var(--text)" }}
                >
                  New Project
                </button>
              </div>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {projects.map((p, i) => (
                  <button
                    key={p._id || i}
                    type="button"
                    onClick={() => loadAndSelectProject(i)}
                    className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: selectedIndex === i ? "var(--primary-color)" : "var(--bg-secondary)",
                      color: selectedIndex === i ? "var(--btn-text)" : "var(--text)",
                    }}
                  >
                    {p.title || `Project ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-4" id="adminForm">
            <Field label="Title">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="admin-input"
                style={inputStyle}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={7}
                required
                placeholder="Describe your project here... (supports # Headings, - Bullets, **Bold**, *Italics*, etc.)"
                style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
              />
            </Field>

            <Field label="Tech Used (comma separated)">
              <input
                type="text"
                value={form.tech}
                onChange={(e) => setForm((f) => ({ ...f, tech: e.target.value }))}
                placeholder="HTML, CSS, JavaScript"
                style={inputStyle}
              />
            </Field>

            <Field label="Live URL">
              <input
                type="url"
                value={form.live}
                onChange={(e) => setForm((f) => ({ ...f, live: e.target.value }))}
                placeholder="https://"
                style={inputStyle}
              />
            </Field>

            <Field label="GitHub URL">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.github}
                  onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleGithubConnect}
                  disabled={githubLoading}
                  className="px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: "var(--primary-color)", color: "var(--btn-text)" }}
                >
                  {githubLoading ? "…" : "Connect"}
                </button>
              </div>
              <p className="text-xs opacity-50 mt-1">Paste a GitHub repo link and click Connect to pull language %.</p>
            </Field>

            {/* PC Images */}
            <Field label="PC Images">
              <ImageDropZone
                onFiles={(files) => handleImageUpload(files, "pcImages")}
                label="PC"
              />
              <textarea
                rows={3}
                value={form.pcImages}
                onChange={(e) => setForm((f) => ({ ...f, pcImages: e.target.value }))}
                placeholder="https://..."
                className="mt-2"
                style={inputStyle}
              />
              <PhotoSorter
                value={form.pcImages}
                onChange={(val) => setForm((f) => ({ ...f, pcImages: val }))}
                label="🖼 Drag to reorder PC photos"
              />
            </Field>

            {/* Mobile Images */}
            <Field label="Mobile Images">
              <ImageDropZone
                onFiles={(files) => handleImageUpload(files, "mobileImages")}
                label="Mobile"
              />
              <textarea
                rows={3}
                value={form.mobileImages}
                onChange={(e) => setForm((f) => ({ ...f, mobileImages: e.target.value }))}
                placeholder="https://..."
                className="mt-2"
                style={inputStyle}
              />
              <PhotoSorter
                value={form.mobileImages}
                onChange={(val) => setForm((f) => ({ ...f, mobileImages: val }))}
                label="📱 Drag to reorder Mobile photos"
              />
            </Field>
          </form>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex-none flex flex-col gap-2"
          style={{ borderColor: "var(--border-color)" }}
        >
          {status.message && (
            <p
              className="text-xs"
              style={{
                color: status.type === "error" ? "#b9402a" : status.type === "success" ? "#2c7a2c" : "var(--text)",
              }}
            >
              {status.message}
            </p>
          )}

          {saving && (
            <div>
              <div className="text-xs opacity-60 mb-1">Syncing projects... {Math.round(saveProgress)}%</div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${saveProgress}%`, background: "var(--primary-color)" }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            form="adminForm"
            disabled={saving}
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: "var(--primary-color)", color: "var(--btn-text)" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </aside>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-color)",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  fontFamily: "inherit",
};

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold opacity-80">{label}</span>
      {children}
    </label>
  );
}

function markdownToHtml(md) {
  if (!md) return "";
  
  let html = md;
  
  // 1. Bold: **text** or __text__ -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  
  // 2. Italic: *text* or _text_ -> <em>text</em>
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  
  // 3. Code Blocks: ```code``` -> <pre>
  html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-secondary p-3 rounded-lg font-mono text-xs my-2 overflow-x-auto block border border-color'><code>$1</code></pre>");
  
  // 4. Inline Code: `code` -> <code>
  html = html.replace(/`(.*?)`/g, "<code class='bg-secondary px-1.5 py-0.5 rounded font-mono text-xs border border-color'>$1</code>");
  
  // 5. Headers
  html = html.replace(/^### (.*?)$/gm, "<h4 class='text-base font-bold mt-4 mb-2'>$1</h4>");
  html = html.replace(/^## (.*?)$/gm, "<h3 class='text-lg font-bold mt-5 mb-2'>$1</h3>");
  html = html.replace(/^# (.*?)$/gm, "<h2 class='text-xl font-bold mt-6 mb-3'>$1</h2>");
  
  // 6. Unordered lists: - item or * item -> <li>item</li>
  const lines = html.split("\n");
  let inList = false;
  let result = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (/^[-*+]\s+(.*)$/.test(trimmed)) {
      const content = trimmed.replace(/^[-*+]\s+/, "");
      if (!inList) {
        result.push("<ul class='list-disc pl-5 my-2 flex flex-col gap-1'>");
        inList = true;
      }
      result.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push(line);
    }
  }
  if (inList) {
    result.push("</ul>");
  }
  html = result.join("\n");
  
  // 7. Paragraphs & manual line breaks
  const finalLines = html.split("\n");
  let parsedResult = [];
  let inParagraph = false;
  
  for (let line of finalLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) {
        parsedResult.push("</p>");
        inParagraph = false;
      }
      continue;
    }
    
    if (trimmed.startsWith("<h") || trimmed.startsWith("<ul") || trimmed.startsWith("</ul") || trimmed.startsWith("<li>") || trimmed.startsWith("<pre") || trimmed.startsWith("</pre") || trimmed.startsWith("<code") || trimmed.startsWith("</code")) {
      if (inParagraph) {
        parsedResult.push("</p>");
        inParagraph = false;
      }
      parsedResult.push(line);
    } else {
      if (!inParagraph) {
        parsedResult.push("<p class='my-2'>");
        inParagraph = true;
      } else {
        parsedResult.push("<br />");
      }
      parsedResult.push(line);
    }
  }
  if (inParagraph) {
    parsedResult.push("</p>");
  }
  
  return parsedResult.join("");
}

function htmlToMarkdown(html) {
  if (!html) return "";
  
  let md = html;
  
  // 1. Convert headers
  md = md.replace(/<h2 class='text-xl font-bold mt-6 mb-3'>(.*?)<\/h2>/gi, "# $1\n");
  md = md.replace(/<h3 class='text-lg font-bold mt-5 mb-2'>(.*?)<\/h3>/gi, "## $1\n");
  md = md.replace(/<h4 class='text-base font-bold mt-4 mb-2'>(.*?)<\/h4>/gi, "### $1\n");
  md = md.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "# $1\n");
  
  // 2. Convert lists
  md = md.replace(/<ul[^>]*>/gi, "");
  md = md.replace(/<\/ul>/gi, "\n");
  md = md.replace(/<li>(.*?)<\/li>/gi, "- $1\n");
  
  // 3. Convert pre/code blocks
  md = md.replace(/<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/gi, "```$1```\n");
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
  
  // 4. Convert bold and italics
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  
  // 5. Convert paragraphs and line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  
  // 6. Strip any other HTML tags
  md = md.replace(/<[^>]+>/g, "");
  
  // 7. Decode HTML entities
  md = md
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
  
  // 8. Clean up extra spacing
  md = md.replace(/\n{3,}/g, "\n\n");
  
  return md.trim();
}
