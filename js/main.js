const grid = document.getElementById("projectsGrid");
const modal = document.getElementById("projectModal");
const closeModal = document.getElementById("closeModal");
const titleEl = document.getElementById("projectTitle");
const descEl = document.getElementById("projectDesc");
const techEl = document.getElementById("projectTech");
const sliderImg = document.getElementById("sliderImage");
const sliderPrev = document.getElementById("sliderPrev");
const sliderNext = document.getElementById("sliderNext");
const sliderZoom = document.getElementById("sliderZoom");
const fullscreenModal = document.getElementById("fullscreenModal");
const fullscreenImage = document.getElementById("fullscreenImage");
const fullscreenPrev = document.getElementById("fullscreenPrev");
const fullscreenNext = document.getElementById("fullscreenNext");
const fullscreenThumbs = document.getElementById("fullscreenThumbs");
const fullscreenClose = document.getElementById("fullscreenClose");
const liveBtn = document.getElementById("liveBtn");
const githubBtn = document.getElementById("githubBtn");
const thumbsEl = document.getElementById("thumbs");
const modalEdit = document.getElementById("modalEdit");
const linkError = document.getElementById("linkError");
const linkErrorMessage = document.getElementById("linkErrorMessage");
const linkErrorClose = document.getElementById("linkErrorClose");

const themeToggle = document.getElementById("themeToggle");
const resumeLink = document.getElementById("resumeLink");

const adminToggle = document.getElementById("adminToggle");
const adminAddButton = document.getElementById("adminAddButton");
const adminResumeButton = document.getElementById("adminResumeButton");
const adminDeleteButton = document.getElementById("adminDeleteButton");
const adminSortToggle = document.getElementById("adminSortToggle");
const adminLogout = document.getElementById("adminLogout");
const adminPanel = document.getElementById("adminPanel");
const adminBackdrop = document.getElementById("adminBackdrop");
const adminClose = document.getElementById("adminClose");
const adminNew = document.getElementById("adminNew");
const adminDelete = document.getElementById("adminDelete");
const adminList = document.getElementById("adminList");
const adminForm = document.getElementById("adminForm");
const adminTitle = document.getElementById("adminTitle");
const adminDesc = document.getElementById("adminDesc");
const adminTech = document.getElementById("adminTech");
const adminLive = document.getElementById("adminLive");
const adminGithub = document.getElementById("adminGithub");
const adminGithubConnect = document.getElementById("adminGithubConnect");
const adminImages = document.getElementById("adminImages");
const adminImageFiles = document.getElementById("adminImageFiles");
const adminStatus = document.getElementById("adminStatus");
const adminAuth = document.getElementById("adminAuth");
const adminPassword = document.getElementById("adminPassword");
const adminAuthSubmit = document.getElementById("adminAuthSubmit");
const adminAuthCancel = document.getElementById("adminAuthCancel");
const adminAuthError = document.getElementById("adminAuthError");
const adminDeleteModal = document.getElementById("adminDeleteModal");
const adminDeleteSelect = document.getElementById("adminDeleteSelect");
const adminDeleteConfirm = document.getElementById("adminDeleteConfirm");
const adminDeleteCancel = document.getElementById("adminDeleteCancel");
const adminDeleteError = document.getElementById("adminDeleteError");
const resumeUploadModal = document.getElementById("resumeUploadModal");
const resumeFile = document.getElementById("resumeFile");
const resumeUploadConfirm = document.getElementById("resumeUploadConfirm");
const resumeUploadCancel = document.getElementById("resumeUploadCancel");
const resumeUploadStatus = document.getElementById("resumeUploadStatus");

const STORAGE_KEY = "portfolioProjects";
const ADMIN_AUTH_KEY = "portfolioAdminAuth";
const ADMIN_PASSWORD = "sunny6787";
const USE_API = true;
const API_ENDPOINT = "https://portfolio2026-0qxw.onrender.com/api/projects";
const API_BASE = USE_API
  ? API_ENDPOINT.replace(/\/api\/projects\/?$/, "")
  : "";

let projectsData = [];
let selectedIndex = null;
let currentImages = [];
let currentIndex = 0;
let currentProjectIndex = null;
let adminAuthenticated = false;
let isSortMode = false;
let dragIndex = null;

async function loadProjects() {
  if (USE_API) {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error("Unable to load projects from the server.");
    }
    return await response.json();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const seed = Array.isArray(window.seedProjects) ? window.seedProjects : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

async function persistProjects(data) {
  if (USE_API) {
    const response = await fetch(API_ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error("Unable to save projects to the server.");
    }
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderGrid() {
  if (!grid) return;
  grid.innerHTML = "";

  if (!projectsData.length) {
    const empty = document.createElement("p");
    empty.textContent = "No projects yet.";
    grid.appendChild(empty);
    return;
  }

  projectsData.forEach((project, index) => {
    const card = document.createElement("div");
    card.className = "project-item";
    card.dataset.index = index;

    if (project.images && project.images.length) {
      const img = document.createElement("img");
      img.src = project.images[0];
      img.alt = project.title || "Project image";
      card.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "project-placeholder";
      placeholder.textContent = "No image";
      card.appendChild(placeholder);
    }

    const title = document.createElement("p");
    title.className = "project-title";
    title.textContent = project.title || "Untitled Project";
    card.appendChild(title);

    card.onclick = () => {
      if (isSortMode) return;
      openModal(project, index);
    };
    grid.appendChild(card);
  });

  applySortModeToGrid();
}

function setCurrentImages(images) {
  currentImages = Array.isArray(images) ? images.filter(Boolean) : [];
  currentIndex = 0;
  renderThumbnails();
  updateSlide();
}

function openModal(project, index = null) {
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  titleEl.textContent = project.title || "Untitled Project";
  descEl.innerHTML = project.description || "No description yet.";
  if (techEl) {
    if (project.tech && project.tech.length) {
      const breakdown = renderTechBreakdown(project.tech);
      if (breakdown) {
        const bar = breakdown
          .map(
            item =>
              `<span class="tech-seg" style="width:${item.pct.toFixed(1)}%;background:${item.color}"></span>`
          )
          .join("");
        const legend = breakdown
          .map(
            item =>
              `<span class="tech-legend-item"><span class="tech-dot" style="background:${item.color}"></span><span class="tech-name">${item.name}</span><span class="tech-pct">${item.pct.toFixed(1)}%</span></span>`
          )
          .join("");
        techEl.innerHTML = `<div class="tech-title">Languages</div><div class="tech-bar">${bar}</div><div class="tech-legend">${legend}</div>`;
      } else {
        const line = project.tech.join(" | ");
        techEl.innerHTML = `<span class="tech-label">Tech Used:</span><span class="tech-line">${line}</span>`;
      }
    } else {
      techEl.innerHTML = `<span class="tech-label">Tech Used:</span><span class="tech-line">Not specified</span>`;
    }
  }

  currentProjectIndex = index;
  setCurrentImages(project.images);

  liveBtn.href = project.live || "#";
  githubBtn.href = project.github || "#";

  if (modalEdit) {
    modalEdit.hidden = !adminAuthenticated;
  }
}

if (closeModal) {
  closeModal.onclick = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    setFullscreenOpen(false);
  };
}

if (modal) {
  modal.addEventListener("click", e => {
    if (e.target === modal && closeModal) closeModal.onclick();
  });
}

if (thumbsEl) {
  thumbsEl.addEventListener("click", event => {
    const target = event.target.closest(".thumb");
    if (!target) return;
    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) return;
    currentIndex = index;
    updateSlide();
  });
}

if (grid) {
  grid.addEventListener("dragstart", event => {
    if (!isSortMode) return;
    const card = event.target.closest(".project-item");
    if (!card) return;
    dragIndex = Number(card.dataset.index);
    if (Number.isNaN(dragIndex)) return;
    card.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(dragIndex));
  });

  grid.addEventListener("dragover", event => {
    if (!isSortMode) return;
    const card = event.target.closest(".project-item");
    if (!card) return;
    event.preventDefault();
    grid.querySelectorAll(".project-item.drop-target").forEach(el => {
      if (el !== card) el.classList.remove("drop-target");
    });
    card.classList.add("drop-target");
  });

  grid.addEventListener("dragleave", event => {
    const card = event.target.closest(".project-item");
    if (!card) return;
    card.classList.remove("drop-target");
  });

  grid.addEventListener("dragend", () => {
    dragIndex = null;
    grid.querySelectorAll(".project-item").forEach(card => {
      card.classList.remove("dragging", "drop-target");
    });
  });

  grid.addEventListener("drop", event => {
    if (!isSortMode) return;
    event.preventDefault();
    const card = event.target.closest(".project-item");
    let dropIndex = projectsData.length - 1;
    if (card) {
      const parsedIndex = Number(card.dataset.index);
      if (!Number.isNaN(parsedIndex)) {
        dropIndex = parsedIndex;
      }
    }
    if (dragIndex === null || Number.isNaN(dropIndex)) return;
    if (dropIndex === dragIndex) return;

    const moved = projectsData.splice(dragIndex, 1)[0];
    projectsData.splice(dropIndex, 0, moved);
    dragIndex = null;
    renderGrid();
    if (isSortMode) {
      applySortModeToGrid();
    }
    persistOrder();
  });
}

function renderThumbnails() {
  if (!thumbsEl) return;
  thumbsEl.innerHTML = "";

  currentImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = src;
    img.alt = "Thumbnail";
    img.dataset.index = String(index);
    thumbsEl.appendChild(img);
  });
}

function updateSlide() {
  if (!sliderImg) return;
  if (!currentImages.length) {
    sliderImg.removeAttribute("src");
    sliderImg.alt = "No project image";
    updateArrowState();
    updateFullscreenView();
    return;
  }

  sliderImg.style.opacity = 0;
  setTimeout(() => {
    sliderImg.src = currentImages[currentIndex];
    sliderImg.style.opacity = 1;
    updateFullscreenView();
  }, 150);

  if (!thumbsEl) return;
  const thumbs = thumbsEl.querySelectorAll(".thumb");
  thumbs.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentIndex);
  });
  updateArrowState();
}
function updateFullscreenView() {
  if (!fullscreenModal || !fullscreenModal.classList.contains("active")) return;
  if (!fullscreenImage) return;
  if (!currentImages.length) {
    fullscreenImage.removeAttribute("src");
    fullscreenImage.alt = "No project image";
    updateFullscreenArrows();
    return;
  }
  fullscreenImage.src = currentImages[currentIndex];
  renderFullscreenThumbs();
  updateFullscreenArrows();
}

function updateFullscreenArrows() {
  if (fullscreenPrev) {
    fullscreenPrev.disabled = currentIndex <= 0;
  }
  if (fullscreenNext) {
    fullscreenNext.disabled = currentIndex >= currentImages.length - 1;
  }
}

function renderFullscreenThumbs() {
  if (!fullscreenThumbs) return;
  fullscreenThumbs.innerHTML = "";
  currentImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = src;
    img.alt = "Thumbnail";
    img.dataset.index = String(index);
    if (index === currentIndex) img.classList.add("active");
    fullscreenThumbs.appendChild(img);
  });
}

function setFullscreenOpen(isOpen) {
  if (!fullscreenModal) return;
  fullscreenModal.classList.toggle("active", isOpen);
  fullscreenModal.setAttribute("aria-hidden", String(!isOpen));
  if (isOpen) {
    updateFullscreenView();
    document.body.style.overflow = "hidden";
  } else if (!modal || !modal.classList.contains("active")) {
    document.body.style.overflow = "";
  }
}

function updateArrowState() {
  if (sliderPrev) {
    sliderPrev.disabled = currentIndex <= 0;
  }
  if (sliderNext) {
    sliderNext.disabled = currentIndex >= currentImages.length - 1;
  }
  if (sliderZoom) {
    sliderZoom.disabled = currentImages.length === 0;
  }
}

function applySortModeToGrid() {
  if (!grid) return;
  grid.classList.toggle("sorting", isSortMode);
  const cards = grid.querySelectorAll(".project-item");
  cards.forEach(card => {
    card.draggable = isSortMode;
    card.classList.remove("dragging", "drop-target");
  });
}

async function persistOrder() {
  try {
    await persistProjects(projectsData);
    renderAdminList();
  } catch (err) {
    setAdminStatus(err.message, "error");
  }
}

if (sliderNext) {
  sliderNext.addEventListener("click", event => {
    event.preventDefault();
    if (!currentImages.length) return;
    if (currentIndex < currentImages.length - 1) {
      currentIndex += 1;
      updateSlide();
    }
  });
}

if (sliderPrev) {
  sliderPrev.addEventListener("click", event => {
    event.preventDefault();
    if (!currentImages.length) return;
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateSlide();
    }
  });
}

if (sliderZoom) {
  sliderZoom.addEventListener("click", () => {
    if (!currentImages.length) return;
    setFullscreenOpen(true);
  });
}

if (fullscreenClose) {
  fullscreenClose.addEventListener("click", () => setFullscreenOpen(false));
}

if (fullscreenModal) {
  fullscreenModal.addEventListener("click", event => {
    if (event.target === fullscreenModal) setFullscreenOpen(false);
  });
}

if (fullscreenPrev) {
  fullscreenPrev.addEventListener("click", () => {
    if (!currentImages.length) return;
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateSlide();
      updateFullscreenView();
    }
  });
}

if (fullscreenNext) {
  fullscreenNext.addEventListener("click", () => {
    if (!currentImages.length) return;
    if (currentIndex < currentImages.length - 1) {
      currentIndex += 1;
      updateSlide();
      updateFullscreenView();
    }
  });
}

if (fullscreenThumbs) {
  fullscreenThumbs.addEventListener("click", event => {
    const target = event.target.closest(".thumb");
    if (!target) return;
    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) return;
    currentIndex = index;
    updateSlide();
    updateFullscreenView();
  });
}

let startX = 0;
if (sliderImg) {
  sliderImg.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  sliderImg.addEventListener("touchend", e => {
    if (!currentImages.length) return;
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50 && sliderNext) sliderNext.click();
    if (endX - startX > 50 && sliderPrev) sliderPrev.click();
  });
}

function updateThemeIcon() {
  if (!themeToggle) return;
  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀️";
    themeToggle.setAttribute("aria-label", "Turn on light mode");
    themeToggle.setAttribute("title", "Turn on light mode");
  } else {
    themeToggle.textContent = "🌙";
    themeToggle.setAttribute("aria-label", "Turn on dark mode");
    themeToggle.setAttribute("title", "Turn on dark mode");
  }
}

if (themeToggle) {
  themeToggle.onclick = () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );

    updateThemeIcon();
  };

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  updateThemeIcon();
}

function setLinkErrorOpen(isOpen, message = "") {
  if (!linkError) return;
  linkError.classList.toggle("active", isOpen);
  linkError.setAttribute("aria-hidden", String(!isOpen));
  if (linkErrorMessage && message) {
    linkErrorMessage.textContent = message;
  }
}

function isValidLink(href) {
  if (!href) return false;
  const cleaned = href.trim();
  if (!cleaned || cleaned === "#") return false;
  return /^https?:\/\//i.test(cleaned);
}

if (linkErrorClose) {
  linkErrorClose.onclick = () => setLinkErrorOpen(false);
}

if (linkError) {
  linkError.onclick = event => {
    if (event.target === linkError) setLinkErrorOpen(false);
  };
}

if (liveBtn) {
  liveBtn.addEventListener("click", event => {
    const href = liveBtn.getAttribute("href");
    if (!isValidLink(href)) {
      event.preventDefault();
      setLinkErrorOpen(true, "Live website link is not available yet.");
    }
  });
}

if (githubBtn) {
  githubBtn.addEventListener("click", event => {
    const href = githubBtn.getAttribute("href");
    if (!isValidLink(href)) {
      event.preventDefault();
      setLinkErrorOpen(true, "GitHub link is not available yet.");
    }
  });
}

function setAdminAuthOpen(isOpen) {
  if (!adminAuth) return;
  adminAuth.classList.toggle("active", isOpen);
  adminAuth.setAttribute("aria-hidden", String(!isOpen));
  if (adminAuthError) adminAuthError.textContent = "";
  if (adminPassword) {
    adminPassword.value = "";
    if (isOpen) {
      setTimeout(() => adminPassword.focus(), 50);
    }
  }
}

function setAdminAuthenticated(isAuthed) {
  adminAuthenticated = isAuthed;
  if (adminAddButton) {
    adminAddButton.hidden = !isAuthed;
  }
  if (adminResumeButton) {
    adminResumeButton.hidden = !isAuthed;
  }
  if (adminDeleteButton) {
    adminDeleteButton.hidden = !isAuthed;
  }
  if (adminSortToggle) {
    adminSortToggle.hidden = !isAuthed;
  }
  if (adminLogout) {
    adminLogout.hidden = !isAuthed;
  }
  if (adminToggle) {
    adminToggle.hidden = isAuthed;
  }
  if (modalEdit) {
    modalEdit.hidden = !isAuthed;
  }
  if (isAuthed) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    isSortMode = false;
    if (adminSortToggle) {
      adminSortToggle.classList.remove("active");
      adminSortToggle.textContent = "Sort Projects";
    }
    applySortModeToGrid();
  }
}

function setAdminOpen(isOpen) {
  if (!adminPanel || !adminBackdrop) return;
  adminPanel.classList.toggle("active", isOpen);
  adminBackdrop.classList.toggle("active", isOpen);
  document.body.classList.toggle("admin-open", isOpen);
  adminPanel.setAttribute("aria-hidden", String(!isOpen));
  adminBackdrop.setAttribute("aria-hidden", String(!isOpen));
  if (!isOpen) {
    adminPanel.classList.remove("add-only");
    adminPanel.classList.remove("single-edit");
  }
}

function setAdminStatus(message, type = "info") {
  if (!adminStatus) return;
  adminStatus.textContent = message;
  if (type === "info") {
    adminStatus.removeAttribute("data-type");
  } else {
    adminStatus.setAttribute("data-type", type);
  }
}

function setResumeUploadOpen(isOpen) {
  if (!resumeUploadModal) return;
  resumeUploadModal.classList.toggle("active", isOpen);
  resumeUploadModal.setAttribute("aria-hidden", String(!isOpen));
  if (!isOpen) {
    if (resumeFile) resumeFile.value = "";
    if (resumeUploadStatus) resumeUploadStatus.textContent = "";
  }
}

function setResumeStatus(message, type = "info") {
  if (!resumeUploadStatus) return;
  resumeUploadStatus.textContent = message;
  if (type === "error") {
    resumeUploadStatus.style.color = "#b9402a";
  } else if (type === "success") {
    resumeUploadStatus.style.color = "#2c7a2c";
  } else {
    resumeUploadStatus.style.color = "";
  }
}

async function checkResumeStatus() {
  if (!USE_API || !API_BASE || !resumeLink) return;
  try {
    const response = await fetch(`${API_BASE}/api/resume/status`);
    if (!response.ok) return;
    const data = await response.json();
    if (data?.exists) {
      resumeLink.href = `${API_BASE}/api/resume`;
      resumeLink.setAttribute("data-resume", "api");
    }
  } catch (err) {
    // ignore
  }
}

async function uploadResumeFile(file) {
  if (!USE_API || !API_BASE) {
    throw new Error("Resume upload requires the backend.");
  }
  const reader = new FileReader();
  const dataUrl = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });

  const response = await fetch(`${API_BASE}/api/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dataUrl,
      fileName: file.name,
      contentType: file.type || "application/pdf"
    })
  });

  if (!response.ok) {
    let errorMessage = `Resume upload failed (HTTP ${response.status}).`;
    try {
      const data = await response.json();
      if (data?.error) {
        errorMessage = data.error;
      }
    } catch (err) {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  if (resumeLink) {
    resumeLink.href = `${API_BASE}/api/resume`;
    resumeLink.setAttribute("data-resume", "api");
  }
}

function setAdminDeleteOpen(isOpen, preferredIndex = null) {
  if (!adminDeleteModal) return;
  adminDeleteModal.classList.toggle("active", isOpen);
  adminDeleteModal.setAttribute("aria-hidden", String(!isOpen));
  if (adminDeleteError) adminDeleteError.textContent = "";
  if (isOpen) {
    populateDeleteSelect(preferredIndex);
  }
}

function populateDeleteSelect(preferredIndex = null) {
  if (!adminDeleteSelect || !adminDeleteConfirm) return;
  adminDeleteSelect.innerHTML = "";

  if (!projectsData.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No projects available";
    adminDeleteSelect.appendChild(option);
    adminDeleteConfirm.disabled = true;
    return;
  }

  projectsData.forEach((project, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = project.title || `Project ${index + 1}`;
    adminDeleteSelect.appendChild(option);
  });

  let defaultIndex = 0;
  if (typeof preferredIndex === "number" && !Number.isNaN(preferredIndex)) {
    defaultIndex = Math.max(0, Math.min(preferredIndex, projectsData.length - 1));
  }

  adminDeleteSelect.value = String(defaultIndex);
  adminDeleteConfirm.disabled = false;
}

async function deleteProjectAtIndex(index, options = {}) {
  const {
    closeModal = false,
    showStatus = true,
    resetForm = false,
    fallbackAlert = ""
  } = options;

  if (
    typeof index !== "number" ||
    Number.isNaN(index) ||
    !projectsData[index]
  ) {
    if (fallbackAlert) {
      window.alert(fallbackAlert);
    } else if (showStatus) {
      setAdminStatus("Select a project to delete.", "error");
    }
    return false;
  }

  const title = projectsData[index].title || "this project";
  const confirmed = window.confirm(`Delete "${title}"?`);
  if (!confirmed) return false;

  projectsData.splice(index, 1);

  if (selectedIndex !== null) {
    if (selectedIndex === index) selectedIndex = null;
    else if (selectedIndex > index) selectedIndex -= 1;
  }

  if (currentProjectIndex !== null) {
    if (currentProjectIndex === index) currentProjectIndex = null;
    else if (currentProjectIndex > index) currentProjectIndex -= 1;
  }

  if (closeModal && modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  try {
    await persistProjects(projectsData);
    renderGrid();
    renderAdminList();
    if (resetForm && adminForm) {
      resetAdminForm();
    }
    if (showStatus) {
      setAdminStatus("Project deleted.", "success");
    }
    return true;
  } catch (err) {
    if (showStatus) {
      setAdminStatus(err.message, "error");
    } else {
      window.alert(err.message);
    }
    return false;
  }
}

function parseGithubRepo(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;

  if (raw.includes("github.com")) {
    try {
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length < 2) return null;
      return {
        owner: parts[0],
        repo: parts[1].replace(/\.git$/i, "")
      };
    } catch (err) {
      return null;
    }
  }

  const parts = raw.split("/").filter(Boolean);
  if (parts.length >= 2) {
    return {
      owner: parts[parts.length - 2],
      repo: parts[parts.length - 1].replace(/\.git$/i, "")
    };
  }

  return null;
}

function buildLanguageStats(languages) {
  const entries = Object.entries(languages || {});
  if (!entries.length) return [];
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([lang, bytes]) => {
      if (!total) return lang;
      const pct = (bytes / total) * 100;
      const pctText = Number(pct.toFixed(1));
      return `${lang} ${pctText}%`;
    });
}

function parseTechBreakdown(items) {
  if (!Array.isArray(items)) return [];
  const parsed = items
    .map(item => {
      const text = String(item || "").trim();
      if (!text) return null;
      const match = text.match(/^(.*?)(\d+(?:\.\d+)?)\s*%$/);
      if (!match) return null;
      const name = match[1].trim();
      const pct = Number(match[2]);
      if (!name || Number.isNaN(pct)) return null;
      return { name, pct };
    })
    .filter(Boolean);

  if (!parsed.length) return [];
  const total = parsed.reduce((sum, item) => sum + item.pct, 0) || 0;
  return parsed.map(item => ({
    name: item.name,
    pct: total ? (item.pct / total) * 100 : item.pct
  }));
}

function renderTechBreakdown(items) {
  const breakdown = parseTechBreakdown(items);
  if (!breakdown.length) return null;
  const palette = [
    "#f05a28",
    "#7b3ff2",
    "#2d9cdb",
    "#f2c94c",
    "#27ae60",
    "#eb5757"
  ];
  return breakdown.map((item, index) => ({
    name: item.name,
    pct: item.pct,
    color: palette[index % palette.length]
  }));
}

async function connectGithubRepo() {
  if (!adminGithub || !adminTech) return;
  const parsed = parseGithubRepo(adminGithub.value);
  if (!parsed) {
    setAdminStatus("Paste a valid GitHub repo URL (owner/repo).", "error");
    return;
  }

  if (adminGithubConnect) {
    adminGithubConnect.disabled = true;
  }

  setAdminStatus("Connecting to GitHub...", "info");

  try {
    const repoResponse = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json"
        }
      }
    );

    if (repoResponse.status === 404) {
      throw new Error("GitHub repo not found.");
    }
    if (repoResponse.status === 403) {
      throw new Error("GitHub rate limit reached. Try again later.");
    }
    if (!repoResponse.ok) {
      throw new Error("Unable to connect to GitHub.");
    }

    const repoData = await repoResponse.json();

    const headers = { Accept: "application/vnd.github+json" };

    const languageResponse = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/languages`,
      { headers }
    );

    if (!languageResponse.ok) {
      throw new Error("Unable to fetch language data.");
    }

    const languageData = await languageResponse.json();
    const techList = buildLanguageStats(languageData);
    if (techList.length) {
      adminTech.value = techList.join(", ");
    }

    if (repoData?.html_url) {
      adminGithub.value = repoData.html_url;
    }

    if (!adminTitle.value.trim() && repoData?.name) {
      adminTitle.value = repoData.name;
    }

    if (!getDescriptionText() && repoData?.description) {
      setDescriptionHtml(repoData.description);
    }

    if (!adminLive.value.trim()) {
      const homepage = String(repoData?.homepage || "").trim();
      if (homepage) {
        adminLive.value = homepage;
      } else {
        let liveUrl = "";
        if (repoData?.has_pages) {
          liveUrl = `https://${parsed.owner}.github.io/${parsed.repo}`;
        }

        const pagesUrl = await fetchGithubPagesUrl(parsed.owner, parsed.repo, headers);
        if (pagesUrl) {
          liveUrl = pagesUrl;
        }

        const deploymentUrl = await fetchDeploymentUrl(parsed.owner, parsed.repo, headers);
        if (deploymentUrl) {
          liveUrl = deploymentUrl;
        }

        if (liveUrl) {
          adminLive.value = liveUrl;
        }
      }
    }

    setAdminStatus("Connected. GitHub data imported.", "success");
  } catch (err) {
    setAdminStatus(err.message, "error");
  } finally {
    if (adminGithubConnect) {
      adminGithubConnect.disabled = false;
    }
  }
}

async function fetchGithubPagesUrl(owner, repo, headers) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pages`,
      { headers }
    );
    if (!response.ok) return "";
    const data = await response.json();
    return data?.html_url || data?.url || "";
  } catch (err) {
    return "";
  }
}

async function fetchDeploymentUrl(owner, repo, headers) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/deployments?environment=production&per_page=1`,
      { headers }
    );
    if (!response.ok) return "";
    const deployments = await response.json();
    if (!Array.isArray(deployments) || !deployments.length) return "";
    const deployment = deployments[0];
    if (deployment?.environment_url) return deployment.environment_url;

    const statusResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/deployments/${deployment.id}/statuses?per_page=1`,
      { headers }
    );
    if (!statusResponse.ok) return "";
    const statuses = await statusResponse.json();
    if (!Array.isArray(statuses) || !statuses.length) return "";
    const status = statuses[0];
    return status?.environment_url || status?.target_url || "";
  } catch (err) {
    return "";
  }
}

function initTinyMCE(retries = 0) {
  if (!adminDesc) return;
  if (window.tinymce) {
    if (!tinymce.get("adminDesc")) {
      tinymce.init({
        selector: "#adminDesc",
        menubar: false,
        plugins: "lists link",
        toolbar: "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link simpleemoji | removeformat",
        height: 200,
        branding: false,
        content_style: "body { font-family: Sora, sans-serif; font-size: 14px; }",
        setup: editor => {
          const emojis = ["😀", "🚀", "✨", "🔥", "💡", "✅"];
          editor.ui.registry.addMenuButton("simpleemoji", {
            text: "Emoji",
            fetch: callback => {
              const items = emojis.map(emoji => ({
                type: "menuitem",
                text: emoji,
                onAction: () => editor.insertContent(emoji)
              }));
              callback(items);
            }
          });
        }
      });
    }
    return;
  }
  if (retries < 20) {
    setTimeout(() => initTinyMCE(retries + 1), 200);
  }
}

function getEditorInstance() {
  if (window.tinymce) {
    return tinymce.get("adminDesc");
  }
  return null;
}

function getDescriptionHtml() {
  const editor = getEditorInstance();
  if (editor) {
    return editor.getContent();
  }
  return adminDesc ? adminDesc.value : "";
}

function getDescriptionText() {
  const editor = getEditorInstance();
  if (editor) {
    return editor.getContent({ format: "text" }).trim();
  }
  return adminDesc ? adminDesc.value.trim() : "";
}

function setDescriptionHtml(html) {
  const editor = getEditorInstance();
  const content = html || "";
  if (editor) {
    editor.setContent(content);
    return;
  }
  if (adminDesc) {
    adminDesc.value = content;
  }
}

function openAdminForAdd() {
  if (!adminPanel) return;
  initTinyMCE();
  adminPanel.classList.add("add-only");
  adminPanel.classList.remove("single-edit");
  resetAdminForm();
  setAdminOpen(true);
}

function openAdminForEdit(index) {
  if (!adminPanel) return;
  initTinyMCE();
  adminPanel.classList.remove("add-only");
  adminPanel.classList.add("single-edit");
  setAdminOpen(true);
  if (typeof index === "number") {
    selectProject(index);
  }
}

function renderAdminList() {
  if (!adminList) return;
  adminList.innerHTML = "";

  if (!projectsData.length) {
    const empty = document.createElement("span");
    empty.className = "admin-status";
    empty.textContent = "No projects yet.";
    adminList.appendChild(empty);
    return;
  }

  projectsData.forEach((project, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "admin-list-item";
    button.textContent = project.title || `Project ${index + 1}`;
    if (index === selectedIndex) {
      button.classList.add("active");
    }
    button.onclick = () => selectProject(index);
    adminList.appendChild(button);
  });
}

function resetAdminForm() {
  if (!adminForm) return;
  selectedIndex = null;
  adminForm.reset();
  adminImages.value = "";
  setDescriptionHtml("");
  adminDelete.disabled = true;
  renderAdminList();
  setAdminStatus("Creating a new project.");
}

function selectProject(index) {
  if (!adminForm) return;
  selectedIndex = index;
  const project = projectsData[index];
  adminTitle.value = project.title || "";
  setDescriptionHtml(project.description || "");
  adminTech.value = project.tech ? project.tech.join(", ") : "";
  adminLive.value = project.live || "";
  adminGithub.value = project.github || "";
  adminImages.value = project.images ? project.images.join("\n") : "";
  adminDelete.disabled = false;
  renderAdminList();
  setAdminStatus(`Editing "${project.title || "Untitled Project"}".`);
}

function buildProjectFromForm() {
  const tech = adminTech.value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  const images = adminImages.value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);

  return {
    title: adminTitle.value.trim(),
    description: getDescriptionHtml().trim(),
    tech,
    live: adminLive.value.trim(),
    github: adminGithub.value.trim(),
    images
  };
}

function appendImageUrl(url) {
  const current = adminImages.value.trim();
  adminImages.value = current ? `${current}\n${url}` : url;
}

if (adminToggle) {
  adminToggle.onclick = () => setAdminAuthOpen(true);
}

if (adminClose) {
  adminClose.onclick = () => setAdminOpen(false);
}

if (adminBackdrop) {
  adminBackdrop.onclick = () => setAdminOpen(false);
}

if (adminAddButton) {
  adminAddButton.onclick = () => {
    if (!adminAuthenticated) {
      setAdminAuthOpen(true);
      return;
    }
    openAdminForAdd();
  };
}

if (adminResumeButton) {
  adminResumeButton.onclick = () => {
    if (!adminAuthenticated) {
      setAdminAuthOpen(true);
      return;
    }
    setResumeUploadOpen(true);
  };
}

if (adminDeleteButton) {
  adminDeleteButton.onclick = async () => {
    if (!adminAuthenticated) return;
    let preferredIndex = null;
    const modalOpen = modal && modal.classList.contains("active");
    const panelOpen = adminPanel && adminPanel.classList.contains("active");
    if (modalOpen && typeof currentProjectIndex === "number") {
      preferredIndex = currentProjectIndex;
    } else if (panelOpen && typeof selectedIndex === "number") {
      preferredIndex = selectedIndex;
    }
    setAdminDeleteOpen(true, preferredIndex);
  };
}

if (adminSortToggle) {
  adminSortToggle.onclick = () => {
    if (!adminAuthenticated) return;
    isSortMode = !isSortMode;
    adminSortToggle.classList.toggle("active", isSortMode);
    adminSortToggle.textContent = isSortMode ? "Done Sorting" : "Sort Projects";
    applySortModeToGrid();
  };
}

if (adminLogout) {
  adminLogout.onclick = () => {
    setAdminAuthenticated(false);
    setAdminOpen(false);
  };
}

if (adminAuthSubmit) {
  adminAuthSubmit.onclick = () => {
    if (!adminPassword) return;
    if (adminPassword.value === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setAdminAuthOpen(false);
      return;
    }
    if (adminAuthError) {
      adminAuthError.textContent = "Incorrect password.";
    }
  };
}

if (adminAuthCancel) {
  adminAuthCancel.onclick = () => setAdminAuthOpen(false);
}

if (adminAuth) {
  adminAuth.onclick = event => {
    if (event.target === adminAuth) setAdminAuthOpen(false);
  };
}

if (resumeUploadModal) {
  resumeUploadModal.onclick = event => {
    if (event.target === resumeUploadModal) setResumeUploadOpen(false);
  };
}

if (adminDeleteModal) {
  adminDeleteModal.onclick = event => {
    if (event.target === adminDeleteModal) setAdminDeleteOpen(false);
  };
}

if (adminPassword) {
  adminPassword.addEventListener("keydown", event => {
    if (event.key === "Enter" && adminAuthSubmit) {
      event.preventDefault();
      adminAuthSubmit.click();
    }
  });
}

if (adminNew) {
  adminNew.onclick = () => resetAdminForm();
}

if (resumeUploadCancel) {
  resumeUploadCancel.onclick = () => setResumeUploadOpen(false);
}

if (resumeUploadConfirm) {
  resumeUploadConfirm.onclick = async () => {
    if (!resumeFile || !resumeFile.files || !resumeFile.files[0]) {
      setResumeStatus("Choose a PDF file first.", "error");
      return;
    }
    const file = resumeFile.files[0];
    if (file.type !== "application/pdf") {
      setResumeStatus("Only PDF files are allowed.", "error");
      return;
    }
    setResumeStatus("Uploading...", "info");
    try {
      await uploadResumeFile(file);
      setResumeStatus("Resume uploaded.", "success");
      setTimeout(() => setResumeUploadOpen(false), 600);
    } catch (err) {
      setResumeStatus(err.message, "error");
    }
  };
}

if (adminGithubConnect) {
  adminGithubConnect.onclick = () => {
    if (!adminAuthenticated) return;
    initTinyMCE();
    connectGithubRepo();
  };
}

if (adminDeleteCancel) {
  adminDeleteCancel.onclick = () => setAdminDeleteOpen(false);
}

if (adminDeleteConfirm) {
  adminDeleteConfirm.onclick = async () => {
    if (!adminDeleteSelect) return;
    const value = Number(adminDeleteSelect.value);
    if (Number.isNaN(value)) {
      if (adminDeleteError) {
        adminDeleteError.textContent = "Select a project first.";
      }
      return;
    }

    const modalOpen = modal && modal.classList.contains("active");
    const panelOpen = adminPanel && adminPanel.classList.contains("active");
    const deleted = await deleteProjectAtIndex(value, {
      closeModal: modalOpen && currentProjectIndex === value,
      showStatus: panelOpen,
      resetForm: panelOpen
    });

    if (deleted) {
      setAdminDeleteOpen(false);
    }
  };
}

if (adminForm) {
  adminForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (window.tinymce) {
      tinymce.triggerSave();
    }

    const project = buildProjectFromForm();
    const descText = getDescriptionText();
    if (!project.title || !descText) {
      setAdminStatus("Title and description are required.", "error");
      return;
    }

    if (selectedIndex === null) {
      projectsData.push(project);
      selectedIndex = projectsData.length - 1;
    } else {
      projectsData[selectedIndex] = project;
    }

    try {
      await persistProjects(projectsData);
      renderGrid();
      renderAdminList();
      setAdminStatus("Saved successfully.", "success");
      const savedIndex = selectedIndex;
      setAdminOpen(false);
      if (projectsData[savedIndex]) {
        openModal(projectsData[savedIndex], savedIndex);
      }
    } catch (err) {
      setAdminStatus(err.message, "error");
    }
  });
}


if (adminDelete) {
  adminDelete.onclick = async () => {
    await deleteProjectAtIndex(selectedIndex, {
      closeModal: false,
      showStatus: true,
      resetForm: true
    });
  };
}

if (adminImageFiles) {
  adminImageFiles.addEventListener("change", () => {
    const files = Array.from(adminImageFiles.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        appendImageUrl(reader.result);
        setAdminStatus("Image added. Remember to save.", "info");
      };
      reader.readAsDataURL(file);
    });

    adminImageFiles.value = "";
  });
}

if (modalEdit) {
  modalEdit.addEventListener("click", () => {
    if (!adminAuthenticated) return;
    if (typeof currentProjectIndex !== "number") return;
    setAdminOpen(false);
    openAdminForEdit(currentProjectIndex);
  });
}

async function init() {
  try {
    initTinyMCE();
    if (adminAddButton || adminToggle) {
      const authed = sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
      setAdminAuthenticated(authed);
    }
    checkResumeStatus();
    projectsData = await loadProjects();
    renderGrid();
    renderAdminList();
    if (adminForm) {
      if (projectsData.length) {
        selectProject(0);
      } else {
        resetAdminForm();
      }
    }
  } catch (err) {
    setAdminStatus(err.message, "error");
  }
}

init();
