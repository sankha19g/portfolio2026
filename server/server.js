import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in environment.");
  process.exit(1);
}

app.use(express.json({ limit: "25mb" }));
app.use(
  cors({
    origin: ALLOWED_ORIGIN === "*" ? "*" : ALLOWED_ORIGIN.split(","),
    credentials: false
  })
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tech: { type: [String], default: [] },
    live: { type: String, default: "" },
    github: { type: String, default: "" },
    images: { type: [String], default: [] }
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

const resumeSchema = new mongoose.Schema(
  {
    data: { type: String, required: true },
    contentType: { type: String, default: "application/pdf" },
    fileName: { type: String, default: "resume.pdf" }
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }).lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to load projects." });
  }
});

app.put("/api/projects", async (req, res) => {
  try {
    const incoming = Array.isArray(req.body) ? req.body : [];
    await Project.deleteMany({});
    const inserted = await Project.insertMany(incoming);
    res.json(inserted);
  } catch (err) {
    res.status(500).json({ error: "Failed to save projects." });
  }
});

app.get("/api/resume/status", async (req, res) => {
  try {
    const resume = await Resume.findOne().select("_id").lean();
    res.json({ exists: Boolean(resume) });
  } catch (err) {
    res.status(500).json({ error: "Failed to check resume status." });
  }
});

app.get("/api/resume", async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ updatedAt: -1 }).lean();
    if (!resume) {
      return res.status(404).json({ error: "No resume found." });
    }

    const buffer = Buffer.from(resume.data, "base64");
    res.setHeader("Content-Type", resume.contentType || "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${resume.fileName || "resume.pdf"}"`
    );
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: "Failed to load resume." });
  }
});

app.post("/api/resume", async (req, res) => {
  try {
    const { dataUrl, fileName, contentType, data } = req.body || {};
    let base64 = "";
    let resolvedType = contentType || "application/pdf";
    let resolvedName = fileName || "resume.pdf";

    if (dataUrl) {
      const match = String(dataUrl).match(/^data:(.+);base64,(.*)$/);
      if (!match) {
        return res.status(400).json({ error: "Invalid data URL." });
      }
      resolvedType = match[1] || resolvedType;
      base64 = match[2];
    } else if (data) {
      base64 = String(data);
    }

    if (!base64) {
      return res.status(400).json({ error: "Resume data is required." });
    }

    await Resume.deleteMany({});
    await Resume.create({
      data: base64,
      contentType: resolvedType,
      fileName: resolvedName
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save resume." });
  }
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
