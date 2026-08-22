import { put, list, del } from "@vercel/blob";

export interface NetplayRoomStatus {
  roomId: string;
  p1Ready: boolean;
  p2Joined: boolean;
  p2Ready: boolean;
  started: boolean;
  gameId?: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory cache + fallback when BLOB_READ_WRITE_TOKEN is not available
const inMemoryRooms = new Map<string, NetplayRoomStatus>();

// Auto clean rooms older than 15 minutes
async function cleanOldRooms() {
  const now = Date.now();
  const maxAge = 15 * 60 * 1000; // 15 minutes

  // 1. Clean in-memory
  for (const [id, room] of inMemoryRooms.entries()) {
    if (now - room.createdAt > maxAge) {
      inMemoryRooms.delete(id);
    }
  }

  // 2. Clean Vercel Blob storage periodically
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const { blobs } = await list({ token: blobToken, prefix: 'netplay-rooms/' });
      for (const blob of blobs) {
        if (now - new Date(blob.uploadedAt).getTime() > maxAge) {
          await del(blob.url, { token: blobToken });
          console.log(`[Netplay Storage] Expired room cleaned from Blob: ${blob.pathname}`);
        }
      }
    } catch (err) {
      console.warn('[Netplay Storage] Error during auto cleanup of expired blobs:', err);
    }
  }
}

export async function createNetplayRoom(roomId: string, meta?: { gameId?: string }): Promise<NetplayRoomStatus> {
  // Run cleanup in background
  cleanOldRooms().catch(() => {});

  const cleanId = roomId.trim().toLowerCase();
  const now = Date.now();
  const roomData: NetplayRoomStatus = {
    roomId: cleanId,
    p1Ready: true,
    p2Joined: false,
    p2Ready: false,
    started: false,
    gameId: meta?.gameId,
    createdAt: now,
    updatedAt: now
  };

  inMemoryRooms.set(cleanId, roomData);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const blobPath = `netplay-rooms/${cleanId}.json`;
      const blobResult = await put(blobPath, JSON.stringify(roomData), {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json"
      });
      console.log(`[Netplay Storage] Created room on Vercel Blob: ${cleanId} -> URL: ${blobResult.url}`);
    } catch (err) {
      console.warn(`[Netplay Storage] Failed to save room to Vercel Blob (${cleanId}):`, err);
    }
  }

  return roomData;
}

export async function joinNetplayRoom(roomId: string): Promise<NetplayRoomStatus | null> {
  const cleanId = roomId.trim().toLowerCase();
  let room = inMemoryRooms.get(cleanId);

  if (!room) {
    room = await getRoomStatus(cleanId) || undefined;
  }

  const now = Date.now();
  if (!room) {
    room = {
      roomId: cleanId,
      p1Ready: true,
      p2Joined: true,
      p2Ready: false,
      started: false,
      createdAt: now,
      updatedAt: now
    };
  } else {
    room.p2Joined = true;
    room.updatedAt = now;
  }

  inMemoryRooms.set(cleanId, room);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const blobPath = `netplay-rooms/${cleanId}.json`;
      const blobResult = await put(blobPath, JSON.stringify(room), {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json"
      });
      console.log(`[Netplay Storage] Player 2 joined room on Vercel Blob: ${cleanId} -> URL: ${blobResult.url}`);
    } catch (err) {
      console.warn(`[Netplay Storage] Failed to update room on Vercel Blob (${cleanId}):`, err);
    }
  }

  return room;
}

export async function setPlayerReady(roomId: string, role: 'p1' | 'p2' = 'p2'): Promise<NetplayRoomStatus | null> {
  const cleanId = roomId.trim().toLowerCase();
  let room = inMemoryRooms.get(cleanId);

  if (!room) {
    room = await getRoomStatus(cleanId) || undefined;
  }

  const now = Date.now();
  if (!room) {
    room = {
      roomId: cleanId,
      p1Ready: true,
      p2Joined: true,
      p2Ready: role === 'p2',
      started: false,
      createdAt: now,
      updatedAt: now
    };
  } else {
    if (role === 'p1') room.p1Ready = true;
    if (role === 'p2') {
      room.p2Joined = true;
      room.p2Ready = true;
    }
    room.updatedAt = now;
  }

  inMemoryRooms.set(cleanId, room);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const blobPath = `netplay-rooms/${cleanId}.json`;
      const blobResult = await put(blobPath, JSON.stringify(room), {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json"
      });
      console.log(`[Netplay Storage] Player ${role} is READY in room on Vercel Blob: ${cleanId} (p2Ready: ${room.p2Ready}) -> URL: ${blobResult.url}`);
    } catch (err) {
      console.warn(`[Netplay Storage] Failed to update ready state on Vercel Blob (${cleanId}):`, err);
    }
  }

  return room;
}

export async function startNetplayRoom(roomId: string): Promise<NetplayRoomStatus | null> {
  const cleanId = roomId.trim().toLowerCase();
  let room = inMemoryRooms.get(cleanId);

  if (!room) {
    room = await getRoomStatus(cleanId) || undefined;
  }

  const now = Date.now();
  if (!room) {
    room = {
      roomId: cleanId,
      p1Ready: true,
      p2Joined: true,
      p2Ready: true,
      started: true,
      createdAt: now,
      updatedAt: now
    };
  } else {
    room.started = true;
    room.updatedAt = now;
  }

  inMemoryRooms.set(cleanId, room);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const blobPath = `netplay-rooms/${cleanId}.json`;
      const blobResult = await put(blobPath, JSON.stringify(room), {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json"
      });
      console.log(`[Netplay Storage] Room ${cleanId} marked as STARTED on Vercel Blob -> URL: ${blobResult.url}`);
    } catch (err) {
      console.warn(`[Netplay Storage] Failed to mark room started on Vercel Blob (${cleanId}):`, err);
    }
  }

  return room;
}

export async function getRoomStatus(roomId: string): Promise<NetplayRoomStatus | null> {
  const cleanId = roomId.trim().toLowerCase();

  // 1. If Vercel Blob token exists, always fetch fresh data from Blob with anti-cache headers
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const { blobs } = await list({ token: blobToken, prefix: `netplay-rooms/${cleanId}` });
      const targetBlob = blobs.find(b => b.pathname === `netplay-rooms/${cleanId}.json` || b.pathname.includes(`${cleanId}.json`));
      if (targetBlob) {
        // Check age (> 15 mins)
        if (Date.now() - new Date(targetBlob.uploadedAt).getTime() > 15 * 60 * 1000) {
          await del(targetBlob.url, { token: blobToken });
          inMemoryRooms.delete(cleanId);
          return null;
        }

        const res = await fetch(`${targetBlob.url}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
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

  // 2. Fallback to inMemoryRooms (for local development or cache)
  const memoryRoom = inMemoryRooms.get(cleanId);
  if (memoryRoom) {
    // Check if expired (> 15 mins)
    if (Date.now() - memoryRoom.createdAt > 15 * 60 * 1000) {
      inMemoryRooms.delete(cleanId);
      return null;
    }
    return memoryRoom;
  }

  return null;
}

export async function deleteNetplayRoom(roomId: string): Promise<boolean> {
  const cleanId = roomId.trim().toLowerCase();
  inMemoryRooms.delete(cleanId);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const { blobs } = await list({ token: blobToken, prefix: `netplay-rooms/${cleanId}` });
      const targetBlob = blobs.find(b => b.pathname === `netplay-rooms/${cleanId}.json` || b.pathname.includes(`${cleanId}.json`));
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

