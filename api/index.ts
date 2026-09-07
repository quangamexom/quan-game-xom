let appInstance: any = null;

async function getApp() {
  if (!appInstance) {
    // Vercel compiles server.ts to server.js at the project root. The matching
    // includeFiles rule keeps this entry and its source dependencies in this
    // function's runtime bundle.
    const mod = await import("../server.js");
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


