import fs from "fs";
import path from "path";

export default async function handler(req: any, res: any) {
  const result: any = {
    status: "ok",
    timestamp: new Date().toISOString(),
    versions: process.versions,
    envKeys: Object.keys(process.env).sort(),
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      isVercel: Boolean(process.env.VERCEL),
      vercelEnv: process.env.VERCEL_ENV || "unknown",
      vercelRegion: process.env.VERCEL_REGION || "unknown",
      nodeEnv: process.env.NODE_ENV || "unknown",
    },
    moduleLookup: {
      cwd: process.cwd(),
      cwdFiles: [] as string[],
      apiDirFiles: [] as string[],
      serverExistsTs: false,
      serverExistsJs: false,
    },
    serverImport: {
      success: false,
      type: "unknown",
      isFunction: false,
      exportedKeys: [] as string[],
      error: null as string | null,
      stack: null as string | null,
    },
  };

  // 1. Inspect Filesystem & Paths safely
  try {
    const cwd = process.cwd();
    if (fs.existsSync(cwd)) {
      result.moduleLookup.cwdFiles = fs.readdirSync(cwd).slice(0, 30);
      result.moduleLookup.serverExistsTs = fs.existsSync(path.join(cwd, "server.ts"));
      result.moduleLookup.serverExistsJs = fs.existsSync(path.join(cwd, "server.js"));
    }
    const apiDir = path.join(cwd, "api");
    if (fs.existsSync(apiDir)) {
      result.moduleLookup.apiDirFiles = fs.readdirSync(apiDir);
    }
  } catch (fsErr: any) {
    result.moduleLookup.fsError = fsErr?.message || String(fsErr);
  }

  // 2. Safe dynamic import for '../server'
  try {
    const serverModule = await import("../server");
    const app = serverModule.default || serverModule;
    result.serverImport.success = true;
    result.serverImport.type = typeof app;
    result.serverImport.isFunction = typeof app === "function";
    result.serverImport.exportedKeys = Object.keys(serverModule);
  } catch (importErr: any) {
    result.serverImport.success = false;
    result.serverImport.error = importErr?.message || String(importErr);
    result.serverImport.stack = importErr?.stack || null;
  }

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(result);
}
