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
const projectsHeading = document.querySelector(".projects-heading");
const resumeLink = document.getElementById("resumeLink");

const adminToggle = document.getElementById("adminToggle");
const adminToolsBtn = document.getElementById("adminToolsBtn");
const adminDropdown = document.getElementById("adminDropdown");

const adminToolsToggle = document.getElementById("adminToolsToggle");
const adminTools = document.getElementById("adminTools");
const adminToolsClose = document.getElementById("adminToolsClose");
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
// Deprecated: const adminImages = document.getElementById("adminImages");
// Deprecated: const adminImageFiles = document.getElementById("adminImageFiles");
const adminPcImages = document.getElementById("adminPcImages");
const adminPcImageFiles = document.getElementById("adminPcImageFiles");
const adminMobileImages = document.getElementById("adminMobileImages");
const adminMobileImageFiles = document.getElementById("adminMobileImageFiles");
const pcDropZone = document.getElementById("pcDropZone");
const mobileDropZone = document.getElementById("mobileDropZone");
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
const adminDeleteProgress = document.getElementById("adminDeleteProgress");
const adminDeleteProgressText = document.getElementById("adminDeleteProgressText");
const adminPanelProgress = document.getElementById("adminPanelProgress");
const adminProgressText = document.getElementById("adminProgressText");
const resumeUploadModal = document.getElementById("resumeUploadModal");
const resumeFile = document.getElementById("resumeFile");
const resumeUploadConfirm = document.getElementById("resumeUploadConfirm");
const resumeUploadCancel = document.getElementById("resumeUploadCancel");
const resumeUploadStatus = document.getElementById("resumeUploadStatus");

const STORAGE_KEY = "portfolioProjects";
const ADMIN_AUTH_KEY = "portfolioAdminAuth";
const ADMIN_PASSWORD = "sunny6787";
const IMGBB_API_KEY = "25cac9ce68d0a1a895b4f8e64a4fc8eb";

// ── Firebase / Firestore setup ───────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBUxU5ZkJmMe1IfXWFNUloxhzQ2lE3GG6A",
  authDomain: "personal-website-sankha.firebaseapp.com",
  projectId: "personal-website-sankha",
  storageBucket: "personal-website-sankha.firebasestorage.app",
  messagingSenderId: "2380613033",
  appId: "1:2380613033:web:b2ec9c782844100f7ef0b8"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Compatibility shim — keep USE_API true so the rest of the code
// still flows through the API branches, but we swap in Firestore below.
const USE_API = true;
const API_BASE = "";       // unused — kept so no reference errors
const API_ENDPOINT = "";   // unused

let projectsData = [];
let selectedIndex = null;
let currentImages = [];
let activeFilter = "all"; // 'all', 'pc', 'mobile'
let currentIndex = 0;
let currentProjectIndex = null;
let adminAuthenticated = false;
let isSortMode = false;
let dragIndex = null;
let saveProgressInterval = null;
let saveProgressValue = 0;
let saveProgressTarget = 0;
let saveProgressTimer = null;
let deleteProgressInterval = null;
let deleteProgressValue = 0;
let deleteProgressTarget = 0;
let deleteProgressTimer = null;

async function compressImage(dataUrl, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
  });
}

async function uploadToImgBB(dataUrl) {
  // ImgBB needs the base64 part only
  const base64Data = dataUrl.split(",")[1];
  const formData = new FormData();
  formData.append("image", base64Data);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error("ImgBB upload failed.");
  const resData = await response.json();
  return resData.data.url;
}

async function loadProjects() {
  // Load directly from Firestore — no backend server needed
  try {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  } catch (err) {
    // Fallback: unordered if composite index not yet built
    console.warn("Ordered query failed, using unordered:", err.message);
    const snap = await getDocs(collection(db, "projects"));
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  }
}

async function persistProjects(data) {
  const CHUNK = 400;
  const col = collection(db, "projects");
  const now = new Date().toISOString();

  // --- SAFETY SCRUB: Convert any residual Base64 to ImgBB ---
  for (const project of data) {
    // 1. Scrub image arrays
    const fields = ["images", "pcImages", "mobileImages"];
    for (const f of fields) {
      if (Array.isArray(project[f])) {
        for (let j = 0; j < project[f].length; j++) {
          const val = project[f][j];
          if (val && val.startsWith("data:image")) {
            try {
              project[f][j] = await uploadToImgBB(val);
            } catch (e) {
              console.error("Failed to rescue Base64 image in array", e);
            }
          }
        }
      }
    }

    // 2. Scrub description (TinyMCE embedded images)
    if (project.description && project.description.includes("data:image")) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(project.description, "text/html");
        const images = doc.querySelectorAll('img[src^="data:image"]');

        for (const img of images) {
          const base64 = img.getAttribute("src");
          console.log("Found embedded Base64 in description, converting...");
          const cloudUrl = await uploadToImgBB(base64);
          img.setAttribute("src", cloudUrl);
        }
        project.description = doc.body.innerHTML;
      } catch (e) {
        console.error("Failed to scrub description images", e);
      }
    }
  }

  // 1. Delete all existing project docs
  const existing = await getDocs(col);
  for (let i = 0; i < existing.docs.length; i += CHUNK) {
    const batch = writeBatch(db);
    existing.docs.slice(i, i + CHUNK).forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  // 2. Write the new array in order
  for (let i = 0; i < data.length; i += CHUNK) {
    const batch = writeBatch(db);
    data.slice(i, i + CHUNK).forEach((p, offset) => {
      const idx = i + offset;
      const ref = p._id ? doc(col, p._id) : doc(col);
      const { _id, ...rest } = p;
      batch.set(ref, {
        ...rest,
        order: idx,
        updatedAt: now,
        createdAt: rest.createdAt || now
      });
    });
    await batch.commit();
  }
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

    const thumb = (project.pcImages && project.pcImages.length)
      ? project.pcImages[0]
      : (project.images && project.images.length ? project.images[0] : null);

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "project-image-wrapper";

    if (thumb) {
      const img = document.createElement("img");
      img.src = thumb;
      img.alt = project.title || "Project image";
      img.loading = "lazy";
      imgWrapper.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "project-placeholder";
      placeholder.textContent = "No image";
      imgWrapper.appendChild(placeholder);
    }
    card.appendChild(imgWrapper);

    const title = document.createElement("p");
    title.className = "project-title";
    title.textContent = project.title || "Untitled Project";
    card.appendChild(title);

    card.onclick = async () => {
      if (isSortMode) return;

      let targetProject = project;
      if (project._id && !project.fullDetails) {
        try {
          document.body.style.cursor = "wait";
          const snap = await getDoc(doc(db, "projects", project._id));
          if (snap.exists()) {
            const details = { _id: snap.id, ...snap.data(), fullDetails: true };
            projectsData[index] = details;
            targetProject = details;
          }
        } catch (e) {
          console.error("Failed to load project details", e);
        } finally {
          document.body.style.cursor = "default";
        }
      }
      openModal(targetProject, index);
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

  // Default to "PC"
  setFilter("pc", project);

  liveBtn.href = project.live || "#";
}

function setFilter(type, project = null) {
  activeFilter = type;
  const proj = project || projectsData[currentProjectIndex];
  if (!proj) return;

  // Update Buttons
  const btns = document.querySelectorAll(".filter-btn");
  btns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === type);
    btn.onclick = () => setFilter(btn.dataset.filter);
  });

  // Filter Images
  let images = [];
  const pc = proj.pcImages || [];
  const mobile = proj.mobileImages || [];
  const old = proj.images || [];

  if (type === "pc") {
    images = pc.length ? pc : (old.length ? old : []);
  } else if (type === "mobile") {
    images = mobile;
  } else {
    // All: combine PC (or old) and Mobile
    images = [...(pc.length ? pc : old), ...mobile];
  }

  setCurrentImages(images);


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

  if (projectsHeading) {
    projectsHeading.textContent = isSortMode ? "Drag and Move Projects" : "My Projects";
  }

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



// ADMIN DROPDOWN LOGIC
if (adminToolsBtn && adminDropdown) {
  adminToolsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = adminDropdown.classList.contains("active");
    adminDropdown.classList.toggle("active", !isActive);
    adminToolsBtn.classList.toggle("active", !isActive);
  });

  document.addEventListener("click", (e) => {
    if (!adminDropdown.contains(e.target) && !adminToolsBtn.contains(e.target)) {
      adminDropdown.classList.remove("active");
      adminToolsBtn.classList.remove("active");
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

function setAdminToolsOpen(isOpen) {
  if (!adminTools) return;
  adminTools.hidden = !isOpen;
  adminTools.classList.toggle("active", isOpen);
  adminTools.setAttribute("aria-hidden", String(!isOpen));
}

function setAdminAuthenticated(isAuthed) {
  adminAuthenticated = isAuthed;

  if (adminToolsBtn) {
    adminToolsBtn.hidden = !isAuthed;
  }

  // Note: We don't need to hide individual buttons inside the dropdown
  // as the dropdown itself is hidden/shown via adminToolsBtn and CSS.

  if (adminToolsToggle) {
    adminToolsToggle.hidden = !isAuthed;
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
    // Close dropdown if open
    if (adminDropdown) adminDropdown.classList.remove("active");
    if (adminToolsBtn) adminToolsBtn.classList.remove("active");

    setAdminToolsOpen(false);
    if (adminSortToggle) {
      adminSortToggle.classList.remove("active");
      adminSortToggle.textContent = "Sort Projects";
      adminSortToggle.style.background = "";
      adminSortToggle.style.color = "";
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
  if (!resumeLink) return;
  try {
    const snap = await getDoc(doc(db, "resume", "current"));
    if (snap.exists()) {
      // Resume is in Firestore — serve it via a blob URL when clicked
      resumeLink.setAttribute("data-resume", "firestore");
      resumeLink.href = "#";
      resumeLink.onclick = async (e) => {
        e.preventDefault();
        const d = snap.data();
        const bytes = Uint8Array.from(atob(d.data), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: d.contentType || "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      };
    }
  } catch (err) {
    // ignore
  }
}

async function uploadResumeFile(file) {
  const reader = new FileReader();
  const dataUrl = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });

  const match = String(dataUrl).match(/^data:(.+);base64,(.*)$/);
  if (!match) throw new Error("Invalid file format.");

  await setDoc(doc(db, "resume", "current"), {
    data: match[2],
    contentType: match[1] || file.type || "application/pdf",
    fileName: file.name || "resume.pdf",
    updatedAt: new Date().toISOString()
  });

  // Re-wire the resume link to open from Firestore
  if (resumeLink) {
    resumeLink.setAttribute("data-resume", "firestore");
    resumeLink.href = "#";
    resumeLink.onclick = (e) => {
      e.preventDefault();
      const bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: match[1] || "application/pdf" });
      window.open(URL.createObjectURL(blob), "_blank");
    };
  }
}

function setAdminDeleteOpen(isOpen, preferredIndex = null) {
  if (!adminDeleteModal) return;
  adminDeleteModal.classList.toggle("active", isOpen);
  adminDeleteModal.setAttribute("aria-hidden", String(!isOpen));
  adminDeleteModal.setAttribute("aria-busy", "false");
  if (adminDeleteError) adminDeleteError.textContent = "";
  if (isOpen) {
    populateDeleteSelect(preferredIndex);
  }
}

function setDeleteLoading(isLoading) {
  if (adminDeleteModal) {
    adminDeleteModal.setAttribute("aria-busy", String(isLoading));
  }
  if (adminDeleteProgress) {
    adminDeleteProgress.classList.toggle("active", isLoading);
    adminDeleteProgress.setAttribute("aria-hidden", String(!isLoading));
  }
  if (adminDeleteProgressText) {
    adminDeleteProgressText.classList.toggle("active", isLoading);
    adminDeleteProgressText.setAttribute("aria-hidden", String(!isLoading));
  }
  if (adminPanelProgress) {
    adminPanelProgress.classList.toggle("active", isLoading);
    adminPanelProgress.setAttribute("aria-hidden", String(!isLoading));
  }
  if (adminDeleteSelect) adminDeleteSelect.disabled = isLoading;
  if (adminDeleteConfirm) adminDeleteConfirm.disabled = isLoading;
  if (adminDeleteCancel) adminDeleteCancel.disabled = isLoading;
  if (adminDelete) {
    adminDelete.disabled = isLoading || selectedIndex === null;
  }
}

function setSaveProgressText(text) {
  if (!adminProgressText) return;
  adminProgressText.textContent = text;
  adminProgressText.classList.add("active");
  adminProgressText.setAttribute("aria-hidden", "false");
}

function clearSaveProgressText() {
  if (!adminProgressText) return;
  adminProgressText.classList.remove("active");
  adminProgressText.setAttribute("aria-hidden", "true");
}

function updateSaveProgressBar(value) {
  if (!adminPanelProgress) return;
  const bar = adminPanelProgress.querySelector(".admin-progress-bar");
  if (!bar) return;
  bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
}

function updateDeleteProgressBar(value) {
  if (!adminDeleteProgress) return;
  const bar = adminDeleteProgress.querySelector(".admin-progress-bar");
  if (!bar) return;
  const pct = Math.max(0, Math.min(100, value));
  bar.style.width = `${pct}%`;
  if (adminDeleteProgressText) {
    adminDeleteProgressText.textContent = `Deleting project... ${Math.round(pct)}%`;
  }
}

function startSaveLoading() {
  if (saveProgressInterval) {
    clearInterval(saveProgressInterval);
  }
  if (saveProgressTimer) {
    clearTimeout(saveProgressTimer);
  }
  saveProgressValue = 0;
  saveProgressTarget = 90;
  if (adminPanelProgress) {
    adminPanelProgress.classList.add("active");
    adminPanelProgress.setAttribute("aria-hidden", "false");
  }
  setSaveProgressText("Syncing projects...");
  updateSaveProgressBar(1);

  saveProgressInterval = setInterval(() => {
    if (saveProgressValue >= saveProgressTarget) return;
    const step = saveProgressValue < 50 ? 3 : 1;
    saveProgressValue = Math.min(saveProgressTarget, saveProgressValue + step);
    updateSaveProgressBar(saveProgressValue);
  }, 80);

  saveProgressTimer = setTimeout(() => {
    saveProgressTarget = 95;
  }, 1400);
}

function finishSaveLoading(success = true) {
  if (saveProgressInterval) {
    clearInterval(saveProgressInterval);
    saveProgressInterval = null;
  }
  if (saveProgressTimer) {
    clearTimeout(saveProgressTimer);
    saveProgressTimer = null;
  }

  saveProgressValue = 100;
  updateSaveProgressBar(100);
  if (adminProgressText) {
    adminProgressText.textContent = success ? "Deployment complete." : "Save failed.";
  }

  setTimeout(() => {
    if (adminPanelProgress) {
      adminPanelProgress.classList.remove("active");
      adminPanelProgress.setAttribute("aria-hidden", "true");
    }
    updateSaveProgressBar(0);
    clearSaveProgressText();
  }, 500);
}

function startDeleteLoading() {
  if (deleteProgressInterval) {
    clearInterval(deleteProgressInterval);
  }
  if (deleteProgressTimer) {
    clearTimeout(deleteProgressTimer);
  }
  deleteProgressValue = 1;
  deleteProgressTarget = 85;
  setDeleteLoading(true);
  updateDeleteProgressBar(deleteProgressValue);

  deleteProgressInterval = setInterval(() => {
    if (deleteProgressValue >= deleteProgressTarget) return;
    const step = deleteProgressValue < 40 ? 2 : 1;
    deleteProgressValue = Math.min(deleteProgressTarget, deleteProgressValue + step);
    updateDeleteProgressBar(deleteProgressValue);
  }, 120);

  deleteProgressTimer = setTimeout(() => {
    deleteProgressTarget = 92;
  }, 1500);
}

function finishDeleteLoading(success = true) {
  if (deleteProgressInterval) {
    clearInterval(deleteProgressInterval);
    deleteProgressInterval = null;
  }
  if (deleteProgressTimer) {
    clearTimeout(deleteProgressTimer);
    deleteProgressTimer = null;
  }

  deleteProgressValue = 100;
  updateDeleteProgressBar(100);
  if (adminDeleteProgressText) {
    adminDeleteProgressText.textContent = success ? "Delete complete." : "Delete failed.";
  }

  setTimeout(() => {
    setDeleteLoading(false);
    updateDeleteProgressBar(0);
  }, 600);
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

  startDeleteLoading();
  if (showStatus) {
    setAdminStatus("Deleting project...", "info");
  }

  let deleteSuccess = true;
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
    deleteSuccess = false;
    if (showStatus) {
      setAdminStatus(err.message, "error");
    } else {
      window.alert(err.message);
    }
    return false;
  } finally {
    finishDeleteLoading(deleteSuccess);
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
  adminPcImages.value = "";
  adminMobileImages.value = "";
  setDescriptionHtml("");
  adminDelete.disabled = true;
  renderAdminList();
  setAdminStatus("Creating a new project.");
}

async function selectProject(index) {
  if (!adminForm) return;
  selectedIndex = index;
  let project = projectsData[index];

  if (project._id && !project.fullDetails) {
    try {
      setAdminStatus("Loading details...", "info");
      const snap = await getDoc(doc(db, "projects", project._id));
      if (snap.exists()) {
        const details = { _id: snap.id, ...snap.data(), fullDetails: true };
        projectsData[index] = details;
        project = details;
      }
    } catch (e) {
      setAdminStatus("Failed to load details.", "error");
    }
  }

  adminTitle.value = project.title || "";
  setDescriptionHtml(project.description || "");
  adminTech.value = project.tech ? project.tech.join(", ") : "";
  adminLive.value = project.live || "";
  adminGithub.value = project.github || "";

  if (project.pcImages && project.pcImages.length) {
    adminPcImages.value = project.pcImages.join("\n");
  } else if (project.images && project.images.length) {
    // Migration / Fallback: put old images in PC
    adminPcImages.value = project.images.join("\n");
  } else {
    adminPcImages.value = "";
  }

  adminMobileImages.value = project.mobileImages ? project.mobileImages.join("\n") : "";

  // Refresh photo arrange grids
  const _pcGrid = document.getElementById("pcSorterGrid");
  const _pcSorter = document.getElementById("pcPhotoSorter");
  const _mobGrid = document.getElementById("mobileSorterGrid");
  const _mobSorter = document.getElementById("mobilePhotoSorter");
  if (typeof renderImageSorter === "function") {
    setTimeout(() => {
      renderImageSorter(adminPcImages, _pcGrid, _pcSorter);
      renderImageSorter(adminMobileImages, _mobGrid, _mobSorter);
    }, 80);
  }

  adminDelete.disabled = false;
  renderAdminList();
  setAdminStatus(`Editing "${project.title || "Untitled Project"}".`);
}

function buildProjectFromForm() {
  const tech = adminTech.value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  const pcImages = adminPcImages.value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);

  const mobileImages = adminMobileImages.value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);

  return {
    title: adminTitle.value.trim(),
    description: getDescriptionHtml().trim(),
    tech,
    live: adminLive.value.trim(),
    github: adminGithub.value.trim(),
    pcImages,
    mobileImages
  };
}

function appendImageUrl(url, targetInput) {
  if (!targetInput) return;
  const current = targetInput.value.trim();
  targetInput.value = current ? `${current}\n${url}` : url;
}

if (adminToggle) {
  adminToggle.onclick = () => setAdminAuthOpen(true);
}

if (adminToolsToggle) {
  adminToolsToggle.onclick = () => {
    if (!adminTools) return;
    const isOpen = adminTools.classList.contains("active");
    setAdminToolsOpen(!isOpen);
  };
}

if (adminToolsClose) {
  adminToolsClose.onclick = () => setAdminToolsOpen(false);
}

document.addEventListener("click", event => {
  if (!adminTools || !adminToolsToggle) return;
  if (!adminTools.classList.contains("active")) return;
  if (adminTools.contains(event.target) || adminToolsToggle.contains(event.target)) {
    return;
  }
  setAdminToolsOpen(false);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    setAdminToolsOpen(false);
  }
});

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
    setAdminToolsOpen(false);
    openAdminForAdd();
  };
}

if (adminResumeButton) {
  adminResumeButton.onclick = () => {
    if (!adminAuthenticated) {
      setAdminAuthOpen(true);
      return;
    }
    setAdminToolsOpen(false);
    setResumeUploadOpen(true);
  };
}

if (adminDeleteButton) {
  adminDeleteButton.onclick = async () => {
    if (!adminAuthenticated) return;
    setAdminToolsOpen(false);
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
    setAdminToolsOpen(false);
    isSortMode = !isSortMode;
    adminSortToggle.classList.toggle("active", isSortMode);
    adminSortToggle.textContent = isSortMode ? "Done Sorting" : "Sort Projects";
    applySortModeToGrid();
  };
}

if (adminLogout) {
  adminLogout.onclick = () => {
    setAdminToolsOpen(false);
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
      startSaveLoading();
      await persistProjects(projectsData);
      renderGrid();
      renderAdminList();
      setAdminStatus("Saved successfully.", "success");
      const savedIndex = selectedIndex;
      setAdminOpen(false);
      if (projectsData[savedIndex]) {
        openModal(projectsData[savedIndex], savedIndex);
      }
      finishSaveLoading(true);
    } catch (err) {
      setAdminStatus(err.message, "error");
      finishSaveLoading(false);
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


if (adminPcImageFiles) {
  adminPcImageFiles.addEventListener("change", () => {
    const files = Array.from(adminPcImageFiles.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          setAdminStatus("Uploading to cloud...", "info");
          const compressed = await compressImage(reader.result);
          const url = await uploadToImgBB(compressed);
          appendImageUrl(url, adminPcImages);
          setAdminStatus("PC Image uploaded. Remember to save.", "success");
        } catch (err) {
          setAdminStatus("Cloud upload failed.", "error");
        }
      };
      reader.readAsDataURL(file);
    });

    adminPcImageFiles.value = "";
  });
}

if (adminMobileImageFiles) {
  adminMobileImageFiles.addEventListener("change", () => {
    const files = Array.from(adminMobileImageFiles.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          setAdminStatus("Uploading to cloud...", "info");
          const compressed = await compressImage(reader.result);
          const url = await uploadToImgBB(compressed);
          appendImageUrl(url, adminMobileImages);
          setAdminStatus("Mobile Image uploaded. Remember to save.", "success");
        } catch (err) {
          setAdminStatus("Cloud upload failed.", "error");
        }
      };
      reader.readAsDataURL(file);
    });

    adminMobileImageFiles.value = "";
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

    // Show loading state in grid while Firestore fetches
    if (grid) {
      grid.innerHTML = `<p class="grid-loading">⏳ Loading projects…</p>`;
    }

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
    if (grid) {
      grid.innerHTML = `<p class="grid-loading grid-error">⚠️ ${err.message}</p>`;
    }
    setAdminStatus(err.message, "error");
  }
}


function setupDropZone(dropZone, fileInput, targetTextArea, typeName) {
  if (!dropZone || !fileInput || !targetTextArea) return;

  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add("drag-over"), false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove("drag-over"), false);
  });

  dropZone.addEventListener("drop", e => {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files);

    if (files.length) {
      files.forEach(file => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            setAdminStatus(`Uploading ${typeName} to cloud...`, "info");
            const compressed = await compressImage(reader.result);
            const url = await uploadToImgBB(compressed);
            appendImageUrl(url, targetTextArea);
            setAdminStatus(`${typeName} Image uploaded. Remember to save.`, "success");
          } catch (err) {
            setAdminStatus("Cloud upload failed.", "error");
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }, false);
}

// Initialize Drop Zones
setupDropZone(pcDropZone, adminPcImageFiles, adminPcImages, "PC");
setupDropZone(mobileDropZone, adminMobileImageFiles, adminMobileImages, "Mobile");

// ─────────────────────────────────────────────────
//  PHOTO ARRANGE — Drag-to-reorder sorter
// ─────────────────────────────────────────────────
function renderImageSorter(textArea, gridEl, sorterEl) {
  if (!gridEl || !textArea || !sorterEl) return;

  const urls = textArea.value
    .split("\n")
    .map(u => u.trim())
    .filter(Boolean);

  gridEl.innerHTML = "";

  if (!urls.length) {
    sorterEl.classList.remove("has-images");
    return;
  }

  sorterEl.classList.add("has-images");

  let dragSrcIndex = null;

  urls.forEach((url, index) => {
    const item = document.createElement("div");
    item.className = "sorter-item";
    item.draggable = true;
    item.dataset.index = index;

    const img = document.createElement("img");
    img.src = url;
    img.alt = `Photo ${index + 1}`;
    img.loading = "lazy";
    item.appendChild(img);

    // Order badge
    const badge = document.createElement("span");
    badge.className = "sorter-badge";
    badge.textContent = index + 1;
    item.appendChild(badge);

    // Delete button
    const del = document.createElement("button");
    del.type = "button";
    del.className = "sorter-del";
    del.textContent = "×";
    del.title = "Remove this photo";
    del.onclick = (e) => {
      e.stopPropagation();
      urls.splice(index, 1);
      textArea.value = urls.join("\n");
      renderImageSorter(textArea, gridEl, sorterEl);
    };
    item.appendChild(del);

    // Drag events
    item.addEventListener("dragstart", () => {
      dragSrcIndex = index;
      setTimeout(() => item.classList.add("dragging"), 0);
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      gridEl.querySelectorAll(".sorter-item").forEach(el => el.classList.remove("drag-over"));
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      gridEl.querySelectorAll(".sorter-item").forEach(el => el.classList.remove("drag-over"));
      if (index !== dragSrcIndex) item.classList.add("drag-over");
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragSrcIndex === null || dragSrcIndex === index) return;
      // Reorder
      const moved = urls.splice(dragSrcIndex, 1)[0];
      urls.splice(index, 0, moved);
      textArea.value = urls.join("\n");
      dragSrcIndex = null;
      renderImageSorter(textArea, gridEl, sorterEl);
    });

    gridEl.appendChild(item);
  });
}

// Wire up: re-render sorter whenever a textarea changes
const pcSorterGrid = document.getElementById("pcSorterGrid");
const pcPhotoSorter = document.getElementById("pcPhotoSorter");
const mobileSorterGrid = document.getElementById("mobileSorterGrid");
const mobilePhotoSorter = document.getElementById("mobilePhotoSorter");

if (adminPcImages) {
  adminPcImages.addEventListener("input", () =>
    renderImageSorter(adminPcImages, pcSorterGrid, pcPhotoSorter)
  );
}

if (adminMobileImages) {
  adminMobileImages.addEventListener("input", () =>
    renderImageSorter(adminMobileImages, mobileSorterGrid, mobilePhotoSorter)
  );
}

// Re-render sorters when a project is selected for editing
const _origSelectProject = selectProject;
// Patch selectProject to also refresh sorters after loading
const _patchedSelect = async (index) => {
  await _origSelectProject(index);
  // Give the textarea a tick to populate, then render the sorters
  setTimeout(() => {
    renderImageSorter(adminPcImages, pcSorterGrid, pcPhotoSorter);
    renderImageSorter(adminMobileImages, mobileSorterGrid, mobilePhotoSorter);
  }, 100);
};
// ── Global Exports ──────────────────────────────────────────
// When using <script type="module">, functions are scoped to the file.
// We must manually attach them to 'window' so HTML onclicks work.
window.openModal = (project, index) => {
  currentProjectIndex = index;
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  document.getElementById("projectTitle").textContent = project.title || "";
  document.getElementById("projectDesc").innerHTML = project.description || "";

  // Set filter and open
  setFilter("pc", project);
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.setFilter = setFilter;
window.selectProject = selectProject;
window.toggleAdmin = () => setAdminOpen(!adminPanel.classList.contains('active'));
window.init = init;

init();

// ── Contact Modal ─────────────────────────────────────────────
const contactModal = document.getElementById('contactModal');
const contactBtn = document.getElementById('contactBtn');
const contactClose = document.getElementById('contactClose');

function openContactModal() {
  if (!contactModal) return;
  contactModal.classList.add('active');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeContactModal() {
  if (!contactModal) return;
  contactModal.classList.remove('active');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (contactBtn) contactBtn.addEventListener('click', openContactModal);
if (contactClose) contactClose.addEventListener('click', closeContactModal);
if (contactModal) {
  contactModal.addEventListener('click', e => {
    if (e.target === contactModal) closeContactModal();
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && contactModal && contactModal.classList.contains('active')) {
    closeContactModal();
  }
});

// ── Telegram Bot Form ─────────────────────────────────────────
const TG_TOKEN = '8611277317:AAHTnhxQvWmPMAToXFUlVGeW_L8L6KjNQlo';
const TG_CHAT_ID = '1251459252';

const tgForm = document.getElementById('tgForm');
const tgName = document.getElementById('tgName');
const tgMessage = document.getElementById('tgMessage');
const tgStatus = document.getElementById('tgStatus');
const tgSendBtn = document.getElementById('tgSendBtn');

function setTgStatus(msg, type) {
  if (!tgStatus) return;
  tgStatus.textContent = msg;
  tgStatus.className = 'tg-status ' + (type || '');
}

if (tgForm) {
  tgForm.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = tgMessage ? tgMessage.value.trim() : '';
    if (!msg) {
      setTgStatus('Please enter a message.', 'error');
      return;
    }

    const name = tgName ? tgName.value.trim() : '';
    const text = name
      ? `📬 New message from *${name}*:\n\n${msg}`
      : `📬 New message from your portfolio:\n\n${msg}`;

    tgSendBtn.disabled = true;
    setTgStatus('Sending…', '');

    try {
      const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text,
          parse_mode: 'Markdown'
        })
      });
      const data = await res.json();
      if (data.ok) {
        setTgStatus('✅ Message sent! I\'ll get back to you soon.', 'success');
        tgForm.reset();
      } else {
        setTgStatus('❌ Failed to send. Please try again.', 'error');
      }
    } catch (err) {
      setTgStatus('❌ Network error. Please try again.', 'error');
    } finally {
      tgSendBtn.disabled = false;
    }
  });
}
