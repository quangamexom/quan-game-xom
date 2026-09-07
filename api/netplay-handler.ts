import {
  createNetplayRoom,
  deleteNetplayRoom,
  getRoomStatus,
  joinNetplayRoom,
  saveSignalPayload,
  setPlayerReady,
  startNetplayRoom,
} from "../src/services/netplayRoomStorage.ts";

function roomFrom(value: unknown): string {
  return String(value || "").split("?")[0].split("&")[0].trim().toLowerCase();
}

function noCache(res: any) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

export default async function handler(req: any, res: any) {
  noCache(res);
  const action = String(req.query?.action || "").replace(/^\/+|\/+$/g, "");
  const body = req.body || {};
  const room = roomFrom(body.room || req.query?.room);

  try {
    if (action === "room-status" && req.method === "GET") {
      const status = await getRoomStatus(room);
      return res.status(200).json({ success: true, room, exists: Boolean(status), status });
    }

    if (!room) return res.status(400).json({ success: false, error: "Mã phòng không hợp lệ" });

    if (action === "create-room" && req.method === "POST") {
      const status = await createNetplayRoom(room, { gameId: body.gameId });
      return res.status(200).json({ success: true, room, status });
    }
    if (action === "join-room" && req.method === "POST") {
      const status = await joinNetplayRoom(room);
      return res.status(200).json({ success: true, room, status });
    }
    if (action === "set-ready" && req.method === "POST") {
      const status = await setPlayerReady(room, body.role === "p1" ? "p1" : "p2");
      return res.status(200).json({ success: true, room, status });
    }
    if (action === "start-room" && req.method === "POST") {
      const status = await startNetplayRoom(room);
      return res.status(200).json({ success: true, room, status });
    }
    if (action === "signal" && req.method === "POST") {
      if (!body.type || !body.payload) return res.status(400).json({ success: false, error: "Thiếu dữ liệu signal" });
      const status = await saveSignalPayload(room, body.type, body.payload, body.role === "p2" ? "p2" : "p1");
      return res.status(200).json({ success: true, room, status });
    }
    if ((action === "delete-room" || action === "leave-room") && ["POST", "DELETE"].includes(req.method)) {
      await deleteNetplayRoom(room);
      return res.status(200).json({ success: true, room });
    }

    return res.status(404).json({ success: false, error: "Netplay endpoint không tồn tại" });
  } catch (error: any) {
    console.error("[Netplay Function Error]", error);
    return res.status(500).json({ success: false, error: error?.message || "Lỗi máy chủ Netplay" });
  }
}
