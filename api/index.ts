let appInstance: any = null;

async function getApp() {
  if (appInstance) return appInstance;

  // 1. Try server.js (Standard Vercel output)
  try {
    const mod = await import("../server.js");
    appInstance = mod.default || mod;
    return appInstance;
  } catch (errJs: any) {
    console.warn("[getApp] Failed importing ../server.js:", errJs?.message);
  }

  // 2. Try server.ts (Local TypeScript)
  try {
    const mod = await import("../server.ts");
    appInstance = mod.default || mod;
    return appInstance;
  } catch (errTs: any) {
    console.warn("[getApp] Failed importing ../server.ts:", errTs?.message);
  }

  // 3. Try bundled server.cjs (Esbuild bundle output)
  try {
    const mod = await import("../dist/server.cjs");
    appInstance = mod.default || mod;
    return appInstance;
  } catch (errCjs: any) {
    console.warn("[getApp] Failed importing ../dist/server.cjs:", errCjs?.message);
  }

  throw new Error("Cannot resolve Express app module on Vercel runtime");
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err: any) {
    console.error("[Vercel Serverless Function Invocation Error]:", err);
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        success: false,
        error: err?.message || "Serverless Function Handler Crash",
        stack: err?.stack || ""
      });
    }
  }
}


