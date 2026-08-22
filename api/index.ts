import app from "../server";

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error("[Vercel Serverless Function Invocation Error]:", err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: err?.message || "Serverless Function Handler Crash",
        stack: err?.stack || ""
      });
    }
  }
}

