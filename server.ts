import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "shared-app-state.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error("Failed to create data directory", e);
  }
}

// In-memory cache of shared state
let sharedAppState: any = null;

// Load persisted state if exists
function loadPersistedState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      sharedAppState = JSON.parse(raw);
      console.log("[Server] Loaded persisted shared app state from disk.");
    }
  } catch (err) {
    console.warn("[Server] Could not read shared state file:", err);
  }
}

function savePersistedState(state: any) {
  try {
    sharedAppState = {
      ...sharedAppState,
      ...state,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(sharedAppState, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Server] Could not save shared state to file:", err);
  }
}

loadPersistedState();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser for syncing large branding data / base64 images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get current shared application state (for any browser / mobile device)
  app.get("/api/app-state", (_req, res) => {
    res.json({
      success: true,
      data: sharedAppState || {},
      updatedAt: sharedAppState?.updatedAt || null,
    });
  });

  // Update shared application state (persists across all users & devices)
  app.post("/api/app-state", (req, res) => {
    try {
      const incoming = req.body || {};
      savePersistedState(incoming);
      res.json({
        success: true,
        message: "Application state synchronized successfully.",
        updatedAt: sharedAppState?.updatedAt,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to save state" });
    }
  });

  // Global GAS URL configuration endpoint
  app.get("/api/gas-url", (_req, res) => {
    const gasUrl = sharedAppState?.gasUrl || process.env.VITE_GAS_API_URL || "";
    res.json({ success: true, gasUrl });
  });

  app.post("/api/gas-url", (req, res) => {
    const { gasUrl } = req.body || {};
    if (typeof gasUrl === "string") {
      savePersistedState({ gasUrl: gasUrl.trim() });
      res.json({ success: true, gasUrl: gasUrl.trim() });
    } else {
      res.status(400).json({ success: false, error: "Invalid gasUrl" });
    }
  });

  // Proxy to Google Apps Script Web App (bypasses browser CORS & header issues)
  app.post("/api/gas-proxy", async (req, res) => {
    const targetGasUrl = req.body?.gasUrl || sharedAppState?.gasUrl || process.env.VITE_GAS_API_URL;
    if (!targetGasUrl) {
      return res.status(400).json({
        success: false,
        error: "Google Apps Script Web App URL is not configured yet.",
      });
    }

    try {
      const payload = req.body?.payload || req.body;
      const response = await fetch(targetGasUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return res.json(json);
      } catch {
        return res.json({ success: true, raw: text });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || "Proxy connection to Google Apps Script failed",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Banuarasa backend & Vite running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
