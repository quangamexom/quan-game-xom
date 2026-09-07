let appInstance: any = null;

async function getApp() {
  if (!appInstance) {
    // This prebuilt bundle contains server.ts and all service modules. The
    // matching includeFiles rule prevents Vercel's file tracer from omitting
    // dynamic dependencies required by the Express API.
    const mod = await import("../dist/server.cjs");
    appInstance = mod.default || mod;
  }
  return appInstance;
}

export default async function handler(req: any, res: any) {
  try {
    return (await getApp())(req, res);
  } catch (err: any) {
    console.error("[Vercel Serverless Function Invocation Error]:", err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: err?.message || "Serverless Function Handler Crash" });
    }
  }
}


