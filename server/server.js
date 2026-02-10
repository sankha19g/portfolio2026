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

app.use(express.json({ limit: "10mb" }));
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
