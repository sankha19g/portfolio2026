const grid = document.getElementById("projectsGrid");
const modal = document.getElementById("projectModal");
const closeModal = document.getElementById("closeModal");
const titleEl = document.getElementById("projectTitle");
const descEl = document.getElementById("projectDesc");
const techEl = document.getElementById("projectTech");
const sliderImg = document.getElementById("sliderImage");
const liveBtn = document.getElementById("liveBtn");
const githubBtn = document.getElementById("githubBtn");
const thumbsEl = document.getElementById("thumbs");

const themeToggle = document.getElementById("themeToggle");

const adminToggle = document.getElementById("adminToggle");
const adminAddButton = document.getElementById("adminAddButton");
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
const adminImages = document.getElementById("adminImages");
const adminImageFiles = document.getElementById("adminImageFiles");
const adminStatus = document.getElementById("adminStatus");
const adminAuth = document.getElementById("adminAuth");
const adminPassword = document.getElementById("adminPassword");
const adminAuthSubmit = document.getElementById("adminAuthSubmit");
const adminAuthCancel = document.getElementById("adminAuthCancel");
const adminAuthError = document.getElementById("adminAuthError");

const STORAGE_KEY = "portfolioProjects";
const ADMIN_AUTH_KEY = "portfolioAdminAuth";
const ADMIN_PASSWORD = "admin123";
const USE_API = true;
const API_ENDPOINT = "http://localhost:3000/api/projects";

let projectsData = [];
let selectedIndex = null;
let currentImages = [];
let currentIndex = 0;
let adminAuthenticated = false;

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

    card.onclick = () => openModal(project);
    grid.appendChild(card);
  });
}

function setCurrentImages(images) {
  currentImages = Array.isArray(images) ? images.filter(Boolean) : [];
  currentIndex = 0;
  renderThumbnails();
  updateSlide();
}

function openModal(project) {
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  titleEl.textContent = project.title || "Untitled Project";
  descEl.textContent = project.description || "No description yet.";
  techEl.textContent = project.tech && project.tech.length
    ? "Tech Used: " + project.tech.join(", ")
    : "Tech Used: Not specified";

  setCurrentImages(project.images);

  liveBtn.href = project.live || "#";
  githubBtn.href = project.github || "#";
}

if (closeModal) {
  closeModal.onclick = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };
}

if (modal) {
  modal.onclick = e => {
    if (e.target === modal && closeModal) closeModal.onclick();
  };
}

function renderThumbnails() {
  if (!thumbsEl) return;
  thumbsEl.innerHTML = "";

  currentImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = src;
    img.alt = "Thumbnail";
    img.onclick = () => {
      currentIndex = index;
      updateSlide();
    };
    thumbsEl.appendChild(img);
  });
}

function updateSlide() {
  if (!sliderImg) return;
  if (!currentImages.length) {
    sliderImg.removeAttribute("src");
    sliderImg.alt = "No project image";
    return;
  }

  sliderImg.style.opacity = 0;
  setTimeout(() => {
    sliderImg.src = currentImages[currentIndex];
    sliderImg.style.opacity = 1;
  }, 150);

  if (!thumbsEl) return;
  const thumbs = thumbsEl.querySelectorAll(".thumb");
  thumbs.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentIndex);
  });
}

const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

if (nextBtn) {
  nextBtn.onclick = () => {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateSlide();
  };
}

if (prevBtn) {
  prevBtn.onclick = () => {
    if (!currentImages.length) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateSlide();
  };
}

let startX = 0;
if (sliderImg) {
  sliderImg.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  sliderImg.addEventListener("touchend", e => {
    if (!currentImages.length) return;
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) nextBtn.click();
    if (endX - startX > 50) prevBtn.click();
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
  if (adminToggle) {
    adminToggle.hidden = isAuthed;
  }
  if (isAuthed) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
}

function setAdminOpen(isOpen) {
  if (!adminPanel || !adminBackdrop) return;
  adminPanel.classList.toggle("active", isOpen);
  adminBackdrop.classList.toggle("active", isOpen);
  document.body.classList.toggle("admin-open", isOpen);
  adminPanel.setAttribute("aria-hidden", String(!isOpen));
  adminBackdrop.setAttribute("aria-hidden", String(!isOpen));
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

function openAdminForAdd() {
  if (!adminPanel) return;
  adminPanel.classList.add("add-only");
  resetAdminForm();
  setAdminOpen(true);
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
  adminDelete.disabled = true;
  renderAdminList();
  setAdminStatus("Creating a new project.");
}

function selectProject(index) {
  if (!adminForm) return;
  selectedIndex = index;
  const project = projectsData[index];
  adminTitle.value = project.title || "";
  adminDesc.value = project.description || "";
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
    description: adminDesc.value.trim(),
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

if (adminForm) {
  adminForm.addEventListener("submit", async event => {
    event.preventDefault();

    const project = buildProjectFromForm();
    if (!project.title || !project.description) {
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
    } catch (err) {
      setAdminStatus(err.message, "error");
    }
  });
}

if (adminDelete) {
  adminDelete.onclick = async () => {
    if (selectedIndex === null) return;
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) return;

    projectsData.splice(selectedIndex, 1);
    selectedIndex = null;
    try {
      await persistProjects(projectsData);
      renderGrid();
      resetAdminForm();
      setAdminStatus("Project deleted.", "success");
    } catch (err) {
      setAdminStatus(err.message, "error");
    }
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

async function init() {
  try {
    if (adminAddButton || adminToggle) {
      const authed = sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
      setAdminAuthenticated(authed);
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
    setAdminStatus(err.message, "error");
  }
}

init();
