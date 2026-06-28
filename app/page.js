"use client";

import { useEffect, useCallback, useState } from "react";
import { loadProjects, loadProjectDetails, loadResumeLink, loadGridLayout, saveGridLayout } from "@/lib/projectsApi";
import Header from "@/components/Header";
import ThemeToggle from "@/components/ThemeToggle";
import ProjectGrid from "@/components/ProjectGrid";
import ProjectModal from "@/components/ProjectModal";
import FullscreenViewer from "@/components/FullscreenViewer";
import AdminPanel from "@/components/AdminPanel";
import AdminAuthModal from "@/components/AdminAuthModal";
import AdminDeleteModal from "@/components/AdminDeleteModal";
import ResumeUploadModal from "@/components/ResumeUploadModal";
import LinkErrorModal from "@/components/LinkErrorModal";
import { AnimatePresence } from "motion/react";

const ADMIN_AUTH_KEY = "portfolioAdminAuth";

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Modal state
  const [modalProject, setModalProject] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [linkError, setLinkError] = useState({ open: false, message: "" });

  // Admin state
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [adminDeleteOpen, setAdminDeleteOpen] = useState(false);
  const [adminDeletePreferred, setAdminDeletePreferred] = useState(null);
  const [resumeUploadOpen, setResumeUploadOpen] = useState(false);
  const [resumeLink, setResumeLink] = useState("https://flowcv.com/resume/254chbkj0ep4");
  const [isSortMode, setIsSortMode] = useState(false);
  const [adminEditIndex, setAdminEditIndex] = useState(null);
  const [adminMode, setAdminMode] = useState("add"); // 'add' | 'edit'

  // Image slider state (managed globally so modal + fullscreen share it)
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("pc");
  const [isScrolled, setIsScrolled] = useState(false);

  const [isSquareGrid, setIsSquareGrid] = useState(false);

  // Restore theme & grid preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setTheme("dark");

    const savedGrid = localStorage.getItem("isSquareGrid") === "true";
    setIsSquareGrid(savedGrid);

    // Fetch global grid preference from Firestore to sync layout for all visitors
    loadGridLayout().then((layout) => {
      if (typeof layout === "boolean") {
        setIsSquareGrid(layout);
        localStorage.setItem("isSquareGrid", String(layout));
      }
    });
  }, []);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.style.background = theme === "dark" ? "#0f0f0f" : "#ffffff";
    document.body.style.color = theme === "dark" ? "#f1f1f1" : "#111";
  }, [theme]);

  // Restore admin auth on mount
  useEffect(() => {
    const authed = sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
    setAdminAuthenticated(authed);
  }, []);

  // Load projects on mount
  useEffect(() => {
    loadProjects()
      .then((data) => {
        setProjects(data);
        setLoadingProjects(false);
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoadingProjects(false);
      });
  }, []);

  // Track page scroll to activate sticky styles
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load resume link on mount
  useEffect(() => {
    loadResumeLink().then((url) => { if (url) setResumeLink(url); });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  const toggleGridAspect = useCallback(() => {
    setIsSquareGrid((prev) => {
      const next = !prev;
      localStorage.setItem("isSquareGrid", String(next));
      // Save globally in Firestore so all visitors see the preferred grid layout!
      saveGridLayout(next).catch((err) => console.error("Failed to save grid layout globally:", err));
      return next;
    });
  }, []);

  const handleAdminAuth = useCallback((password) => {
    if (password === "sunny6787") {
      setAdminAuthenticated(true);
      sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
      setAdminAuthOpen(false);
      return true;
    }
    return false;
  }, []);

  const handleLogout = useCallback(() => {
    setAdminAuthenticated(false);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsSortMode(false);
    setAdminOpen(false);
  }, []);

  const openProjectModal = useCallback(
    async (project, index) => {
      if (isSortMode) return;
      let targetProject = project;
      if (project._id && !project.fullDetails) {
        try {
          document.body.style.cursor = "wait";
          const details = await loadProjectDetails(project._id);
          if (details) {
            setProjects((prev) => {
              const updated = [...prev];
              updated[index] = details;
              return updated;
            });
            targetProject = details;
          }
        } catch (e) {
          console.error("Failed to load project details", e);
        } finally {
          document.body.style.cursor = "default";
        }
      }
      setModalProject(targetProject);
      setModalIndex(index);
      setActiveFilter("pc");
      const pc = targetProject.pcImages || [];
      const old = targetProject.images || [];
      setCurrentImages(pc.length ? pc : old);
      setCurrentImageIndex(0);
      document.body.style.overflow = "hidden";
    },
    [isSortMode]
  );

  const closeProjectModal = useCallback(() => {
    setModalProject(null);
    setModalIndex(null);
    setFullscreenOpen(false);
    document.body.style.overflow = "";
  }, []);

  const handleFilterChange = useCallback(
    (filter) => {
      if (!modalProject) return;
      setActiveFilter(filter);
      const pc = modalProject.pcImages || [];
      const mobile = modalProject.mobileImages || [];
      const old = modalProject.images || [];
      let images = [];
      if (filter === "pc") images = pc.length ? pc : old;
      else if (filter === "mobile") images = mobile;
      else images = [...(pc.length ? pc : old), ...mobile];
      setCurrentImages(images);
      setCurrentImageIndex(0);
    },
    [modalProject]
  );

  const handleProjectsUpdate = useCallback((updated) => {
    setProjects(updated);
  }, []);

  const openAdminAdd = useCallback(() => {
    setAdminMode("add");
    setAdminEditIndex(null);
    setAdminOpen(true);
  }, []);

  const openAdminEdit = useCallback((index) => {
    setAdminMode("edit");
    setAdminEditIndex(index);
    setAdminOpen(true);
  }, []);

  const openAdminDelete = useCallback((preferredIndex = null) => {
    setAdminDeletePreferred(preferredIndex);
    setAdminDeleteOpen(true);
  }, []);

  const handleLinkClick = useCallback((href, label) => {
    if (!href || href === "#" || !/^https?:\/\//i.test(href.trim())) {
      setLinkError({ open: true, message: `${label} link is not available yet.` });
      return false;
    }
    return true;
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* HEADER */}
      <Header
        adminAuthenticated={adminAuthenticated}
        onAdminToggle={() => setAdminAuthOpen(true)}
        onAdminAdd={openAdminAdd}
        onAdminResume={() => setResumeUploadOpen(true)}
        onAdminDelete={() => openAdminDelete(modalProject ? modalIndex : null)}
        onAdminSort={() => setIsSortMode((v) => !v)}
        isSortMode={isSortMode}
        onAdminLogout={handleLogout}
        theme={theme}
        onThemeToggle={toggleTheme}
        resumeLink={resumeLink}
        isScrolled={isScrolled}
        isSquareGrid={isSquareGrid}
        onToggleGridAspect={toggleGridAspect}
      />

      {/* Spacer to push content below the fixed header on page load */}
      <div className="h-20" />

      {/* STICKY HEADING */}
      <div
        className={`sticky top-[75px] z-40 text-center py-4 transition-all duration-300 ${
          isScrolled ? "border-b shadow-sm" : "border-b border-transparent"
        }`}
        style={{
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
        <h1
          className="font-bold tracking-widest mt-0 mb-0 text-3xl md:text-5xl"
        >
          {isSortMode ? "Drag and Move Projects" : "My Projects"}
        </h1>
      </div>

      {/* PROJECT GRID */}
      <ProjectGrid
        projects={projects}
        loading={loadingProjects}
        error={loadError}
        isSortMode={isSortMode}
        onProjectClick={openProjectModal}
        onProjectsReorder={handleProjectsUpdate}
        isSquareGrid={isSquareGrid}
      />

      {/* PROJECT MODAL */}
      <AnimatePresence>
        {modalProject && (
          <ProjectModal
            project={modalProject}
            index={modalIndex}
            currentImages={currentImages}
            currentIndex={currentImageIndex}
            activeFilter={activeFilter}
            adminAuthenticated={adminAuthenticated}
            onClose={closeProjectModal}
            onFilterChange={handleFilterChange}
            onImageIndexChange={setCurrentImageIndex}
            onFullscreen={() => setFullscreenOpen(true)}
            onEdit={() => {
              closeProjectModal();
              openAdminEdit(modalIndex);
            }}
            onLinkClick={handleLinkClick}
          />
        )}
      </AnimatePresence>

      {/* FULLSCREEN VIEWER */}
      {fullscreenOpen && (
        <FullscreenViewer
          images={currentImages}
          index={currentImageIndex}
          onIndexChange={setCurrentImageIndex}
          onClose={() => setFullscreenOpen(false)}
        />
      )}

      {/* LINK ERROR */}
      <LinkErrorModal
        open={linkError.open}
        message={linkError.message}
        onClose={() => setLinkError({ open: false, message: "" })}
      />

      {/* ADMIN AUTH */}
      <AdminAuthModal
        open={adminAuthOpen}
        onAuth={handleAdminAuth}
        onCancel={() => setAdminAuthOpen(false)}
      />

      {/* RESUME LINK */}
      <ResumeUploadModal
        open={resumeUploadOpen}
        onClose={() => setResumeUploadOpen(false)}
        currentLink={resumeLink}
        onLinkSaved={(url) => setResumeLink(url)}
      />

      {/* ADMIN DELETE */}
      <AdminDeleteModal
        open={adminDeleteOpen}
        projects={projects}
        preferredIndex={adminDeletePreferred}
        onClose={() => setAdminDeleteOpen(false)}
        onDeleted={(updatedProjects, deletedIndex) => {
          setProjects(updatedProjects);
          if (modalProject && modalIndex === deletedIndex) closeProjectModal();
          setAdminDeleteOpen(false);
        }}
      />

      {/* ADMIN PANEL */}
      {adminAuthenticated && (
        <AdminPanel
          open={adminOpen}
          mode={adminMode}
          editIndex={adminEditIndex}
          projects={projects}
          onClose={() => setAdminOpen(false)}
          onProjectsUpdate={handleProjectsUpdate}
          onOpenModal={openProjectModal}
        />
      )}
    </div>
  );
}
