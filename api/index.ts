// Keep this import static. Vercel's function tracer only includes modules it
// can resolve at build time; a dynamic import left server.ts out of the
// serverless bundle and made every /api request return HTTP 500.
import app from "../server.ts";

export default async function handler(req: any, res: any) {
  return app(req, res);
}


