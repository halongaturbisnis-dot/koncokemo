import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Automatically download the official high-resolution transparent logo from Google Drive
  const logoUrl = "https://lh3.googleusercontent.com/d/13A59jDQDvXFFvrpe9uvTdlusw3OKGM44";
  const publicDir = path.join(process.cwd(), "public");
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const logoTransparentPath = path.join(publicDir, "logo-transparent.png");

  // Keep a local try-catch so startup is never blocked but resources are gathered
  try {
    console.log("Fetching official KoncoKemo transparent logo...");
    const response = await fetch(logoUrl);
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(logoTransparentPath, buffer);
      console.log("Successfully cached official logo-transparent.png");
    } else {
      console.warn("Could not download logo, status:", response.status);
    }
  } catch (error) {
    console.error("Error securing official logo resource:", error);
  }

  // API endpoints
  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin"; // default 'admin' securely check
    
    if (password === adminPassword) {
      // In a real app we'd use JWT or similar. For this simple setup we pass a token back.
      res.json({ token: "admin-session-token-123", success: true });
    } else {
      res.status(401).json({ error: "Password salah", success: false });
    }
  });

  app.post("/api/verify-session", (req, res) => {
    const { token } = req.body;
    if (token === "admin-session-token-123") {
      res.json({ valid: true });
    } else {
      res.status(401).json({ valid: false });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
