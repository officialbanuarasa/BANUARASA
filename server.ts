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

// Helper function to merge array records by primary ID & timestamp
function mergeById<T extends { [key: string]: any }>(
  existingList: T[] | undefined,
  incomingList: T[] | undefined,
  idKey: string,
  timeKey = "updated_at"
): T[] {
  if (!Array.isArray(incomingList)) return existingList || [];
  if (!Array.isArray(existingList) || existingList.length === 0) return incomingList;

  const map = new Map<string, T>();

  // Put existing into map
  for (const item of existingList) {
    if (item && item[idKey]) {
      map.set(String(item[idKey]), item);
    }
  }

  // Merge or insert incoming
  for (const item of incomingList) {
    if (item && item[idKey]) {
      const key = String(item[idKey]);
      const prev = map.get(key);
      if (!prev) {
        map.set(key, item);
      } else {
        // compare timestamps if present
        const prevTime = prev[timeKey] || prev.timestamp || prev.created_at || "";
        const incomingTime = item[timeKey] || item.timestamp || item.created_at || "";
        if (incomingTime >= prevTime || !prevTime) {
          map.set(key, { ...prev, ...item });
        }
      }
    }
  }

  return Array.from(map.values());
}

function mergeNotifications(existing: any[] = [], incoming: any[] = []): any[] {
  if (!Array.isArray(incoming)) return existing || [];
  if (!Array.isArray(existing) || existing.length === 0) return incoming;

  const map = new Map<string, any>();
  for (const n of existing) {
    if (n && n.id) map.set(n.id, n);
  }
  for (const n of incoming) {
    if (n && n.id) {
      const prev = map.get(n.id);
      if (!prev) {
        map.set(n.id, n);
      } else {
        map.set(n.id, { ...prev, ...n });
      }
    }
  }

  // Sort descending by timestamp, keep latest 100
  const sorted = Array.from(map.values()).sort((a, b) => {
    const tA = new Date(a.timestamp || 0).getTime();
    const tB = new Date(b.timestamp || 0).getTime();
    return tB - tA;
  });
  return sorted.slice(0, 100);
}

function savePersistedState(incoming: any) {
  try {
    const prev = sharedAppState || {};
    sharedAppState = {
      ...prev,
      events: mergeById(prev.events, incoming.events, "event_id"),
      members: mergeById(prev.members, incoming.members, "member_id"),
      registrations: mergeById(prev.registrations, incoming.registrations, "registration_id"),
      payments: mergeById(prev.payments, incoming.payments, "payment_id"),
      savings: mergeById(prev.savings, incoming.savings, "saving_id"),
      salesReports: mergeById(prev.salesReports, incoming.salesReports, "report_id"),
      products: mergeById(prev.products, incoming.products, "product_id"),
      documents: mergeById(prev.documents, incoming.documents, "document_id"),
      announcements: mergeById(prev.announcements, incoming.announcements, "id"),
      news: mergeById(prev.news, incoming.news, "id"),
      gallery: mergeById(prev.gallery, incoming.gallery, "id"),
      sponsors: mergeById(prev.sponsors, incoming.sponsors, "id"),
      auditLogs: mergeById(prev.auditLogs, incoming.auditLogs, "log_id", "timestamp").slice(0, 200),
      notifications: mergeNotifications(prev.notifications, incoming.notifications),
      branding: incoming.branding ? { ...(prev.branding || {}), ...incoming.branding } : prev.branding || {},
      cardDesign: incoming.cardDesign ? { ...(prev.cardDesign || {}), ...incoming.cardDesign } : prev.cardDesign || undefined,
      gasUrl: typeof incoming.gasUrl === "string" && incoming.gasUrl.trim() ? incoming.gasUrl.trim() : prev.gasUrl || "",
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
