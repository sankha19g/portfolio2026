import { db, collection, doc, getDocs, getDoc, setDoc, writeBatch, query, orderBy } from "./firebase";

// Cloudinary configuration — set your cloud name and an unsigned upload preset
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export async function compressImage(dataUrl, maxWidth = 1200, quality = 0.7) {
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

export async function uploadToCloudinary(dataUrl) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local");
  }
  const formData = new FormData();
  formData.append("file", dataUrl);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "portfolio");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Cloudinary upload failed.");
  }
  const resData = await response.json();
  return resData.secure_url;
}

// Legacy alias kept so old call sites still compile during transition
export const uploadToImgBB = uploadToCloudinary;

export async function loadProjects() {
  try {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Ordered query failed, using unordered:", err.message);
    const snap = await getDocs(collection(db, "projects"));
    return snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
  }
}

export async function loadProjectDetails(id) {
  const snap = await getDoc(doc(db, "projects", id));
  if (snap.exists()) return { _id: snap.id, ...snap.data(), fullDetails: true };
  return null;
}

export async function persistProjects(data) {
  const CHUNK = 400;
  const col = collection(db, "projects");
  const now = new Date().toISOString();

  // Scrub base64 images
  for (const project of data) {
    const fields = ["images", "pcImages", "mobileImages"];
    for (const f of fields) {
      if (Array.isArray(project[f])) {
        for (let j = 0; j < project[f].length; j++) {
          const val = project[f][j];
          if (val && val.startsWith("data:image")) {
            try {
              project[f][j] = await uploadToImgBB(val);
            } catch (e) {
              console.error("Failed to rescue Base64 image", e);
            }
          }
        }
      }
    }
    if (project.description && project.description.includes("data:image")) {
      try {
        const parser = new DOMParser();
        const docParsed = parser.parseFromString(project.description, "text/html");
        const images = docParsed.querySelectorAll('img[src^="data:image"]');
        for (const img of images) {
          const cloudUrl = await uploadToImgBB(img.getAttribute("src"));
          img.setAttribute("src", cloudUrl);
        }
        project.description = docParsed.body.innerHTML;
      } catch (e) {
        console.error("Failed to scrub description images", e);
      }
    }
  }

  // Delete all existing docs
  const existing = await getDocs(col);
  for (let i = 0; i < existing.docs.length; i += CHUNK) {
    const batch = writeBatch(db);
    existing.docs.slice(i, i + CHUNK).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  // Write new docs
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
        createdAt: rest.createdAt || now,
      });
    });
    await batch.commit();
  }
}

export async function loadResumeLink() {
  try {
    const snap = await getDoc(doc(db, "resume", "current"));
    if (snap.exists() && snap.data().url) return snap.data().url;
    return null;
  } catch {
    return null;
  }
}

export async function saveResumeLink(url) {
  await setDoc(doc(db, "resume", "current"), {
    url,
    updatedAt: new Date().toISOString(),
  });
}

export async function loadGridLayout() {
  try {
    const snap = await getDoc(doc(db, "settings", "layout"));
    if (snap.exists() && typeof snap.data().isSquareGrid === "boolean") {
      return snap.data().isSquareGrid;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveGridLayout(isSquareGrid) {
  await setDoc(doc(db, "settings", "layout"), {
    isSquareGrid,
    updatedAt: new Date().toISOString(),
  });
}
