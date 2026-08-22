import { put, list, del } from "@vercel/blob";

export interface NetplayRoomStatus {
  roomId: string;
  p1Ready: boolean;
  p2Ready: boolean;
  gameId?: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory cache + fallback when BLOB_READ_WRITE_TOKEN is not available
const inMemoryRooms = new Map<string, NetplayRoomStatus>();

// Auto clean rooms older than 15 minutes
function cleanOldRooms() {
  const now = Date.now();
  const maxAge = 15 * 60 * 1000; // 15 minutes
  for (const [id, room] of inMemoryRooms.entries()) {
    if (now - room.createdAt > maxAge) {
      inMemoryRooms.delete(id);
    }
  }
}

export async function createNetplayRoom(roomId: string, meta?: { gameId?: string }): Promise<NetplayRoomStatus> {
  cleanOldRooms();
  const cleanId = roomId.trim().toUpperCase();
  const now = Date.now();
  const roomData: NetplayRoomStatus = {
    roomId: cleanId,
    p1Ready: true,
    p2Ready: false,
    gameId: meta?.gameId,
    createdAt: now,
    updatedAt: now
  };

  inMemoryRooms.set(cleanId, roomData);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const blobPath = `netplay-rooms/${cleanId}.json`;
      await put(blobPath, JSON.stringify(roomData), {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json"
      });
      console.log(`[Netplay Storage] Created room on Vercel Blob: ${cleanId}`);
    } catch (err) {
      console.warn(`[Netplay Storage] Failed to save room to Vercel Blob (${cleanId}):`, err);
    }
  }

  return roomData;
}

export async function markPlayerJoined(roomId: string, role: 'p1' | 'p2' = 'p2'): Promise<NetplayRoomStatus | null> {
  const cleanId = roomId.trim().toUpperCase();
  let room = inMemoryRooms.get(cleanId);

  // If not found in memory, try loading from Blob
  if (!room) {
    room = await getRoomStatus(cleanId) || undefined;
  }

  const now = Date.now();
  if (!room) {
    // If room wasn't explicitly created, initialize it with P1 and P2 ready
    room = {
      roomId: cleanId,
      p1Ready: true,
      p2Ready: role === 'p2',
      createdAt: now,
      updatedAt: now
    };
  } else {
    if (role === 'p1') room.p1Ready = true;
    if (role === 'p2') room.p2Ready = true;
    room.updatedAt = now;
  }

  inMemoryRooms.set(cleanId, room);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const blobPath = `netplay-rooms/${cleanId}.json`;
      await put(blobPath, JSON.stringify(room), {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json"
      });
      console.log(`[Netplay Storage] Player ${role} joined room ${cleanId}`);
    } catch (err) {
      console.warn(`[Netplay Storage] Failed to update room on Vercel Blob (${cleanId}):`, err);
    }
  }

  return room;
}

export async function getRoomStatus(roomId: string): Promise<NetplayRoomStatus | null> {
  cleanOldRooms();
  const cleanId = roomId.trim().toUpperCase();
  const memoryRoom = inMemoryRooms.get(cleanId);
  if (memoryRoom) {
    return memoryRoom;
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const { blobs } = await list({ token: blobToken, prefix: `netplay-rooms/${cleanId}` });
      const targetBlob = blobs.find(b => b.pathname.includes(`${cleanId}.json`));
      if (targetBlob) {
        const res = await fetch(`${targetBlob.url}?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const data: NetplayRoomStatus = await res.json();
          inMemoryRooms.set(cleanId, data);
          return data;
        }
      }
    } catch (err) {
      console.warn(`[Netplay Storage] Error reading room from Vercel Blob (${cleanId}):`, err);
    }
  }

  return null;
}

export async function deleteNetplayRoom(roomId: string): Promise<boolean> {
  const cleanId = roomId.trim().toUpperCase();
  inMemoryRooms.delete(cleanId);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const { blobs } = await list({ token: blobToken, prefix: `netplay-rooms/${cleanId}` });
      const targetBlob = blobs.find(b => b.pathname.includes(`${cleanId}.json`));
      if (targetBlob) {
        await del(targetBlob.url, { token: blobToken });
        console.log(`[Netplay Storage] Deleted room from Vercel Blob: ${cleanId}`);
      }
    } catch (err) {
      console.warn(`[Netplay Storage] Error deleting room from Vercel Blob (${cleanId}):`, err);
    }
  }

  return true;
}
