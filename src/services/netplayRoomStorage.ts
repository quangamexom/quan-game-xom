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
  // WebRTC Remote Play Together Signaling fields
  hostOffer?: string;
  guestAnswer?: string;
  hostIceCandidates?: string[];
  guestIceCandidates?: string[];
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
    updatedAt: now,
    hostOffer: undefined,
    guestAnswer: undefined,
    hostIceCandidates: [],
    guestIceCandidates: []
  };

  inMemoryRooms.set(cleanId, roomData);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const blobPath = `netplay-rooms/${cleanId}.json`;
    put(blobPath, JSON.stringify(roomData), {
      access: "public",
      token: blobToken,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json"
    }).then(blobResult => {
      console.log(`[Netplay Storage] Created room on Vercel Blob: ${cleanId} -> URL: ${blobResult.url}`);
    }).catch(err => {
      console.warn(`[Netplay Storage] Failed to save room to Vercel Blob (${cleanId}):`, err);
    });
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
      updatedAt: now,
      hostIceCandidates: [],
      guestIceCandidates: []
    };
  } else {
    room.p2Joined = true;
    room.updatedAt = now;
  }

  inMemoryRooms.set(cleanId, room);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const blobPath = `netplay-rooms/${cleanId}.json`;
    put(blobPath, JSON.stringify(room), {
      access: "public",
      token: blobToken,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json"
    }).then(blobResult => {
      console.log(`[Netplay Storage] Player 2 joined room on Vercel Blob: ${cleanId} -> URL: ${blobResult.url}`);
    }).catch(err => {
      console.warn(`[Netplay Storage] Failed to update room on Vercel Blob (${cleanId}):`, err);
    });
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
      updatedAt: now,
      hostIceCandidates: [],
      guestIceCandidates: []
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
    const blobPath = `netplay-rooms/${cleanId}.json`;
    put(blobPath, JSON.stringify(room), {
      access: "public",
      token: blobToken,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json"
    }).then(blobResult => {
      console.log(`[Netplay Storage] Player ${role} is READY in room on Vercel Blob: ${cleanId} (p2Ready: ${room?.p2Ready}) -> URL: ${blobResult.url}`);
    }).catch(err => {
      console.warn(`[Netplay Storage] Failed to update ready state on Vercel Blob (${cleanId}):`, err);
    });
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
      updatedAt: now,
      hostIceCandidates: [],
      guestIceCandidates: []
    };
  } else {
    room.started = true;
    room.updatedAt = now;
  }

  inMemoryRooms.set(cleanId, room);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const blobPath = `netplay-rooms/${cleanId}.json`;
    put(blobPath, JSON.stringify(room), {
      access: "public",
      token: blobToken,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json"
    }).then(blobResult => {
      console.log(`[Netplay Storage] Room ${cleanId} marked as STARTED on Vercel Blob -> URL: ${blobResult.url}`);
    }).catch(err => {
      console.warn(`[Netplay Storage] Failed to mark room started on Vercel Blob (${cleanId}):`, err);
    });
  }

  return room;
}

export async function getRoomStatus(roomId: string): Promise<NetplayRoomStatus | null> {
  if (!roomId) return null;
  const cleanId = String(roomId).split('?')[0].split('&')[0].trim().toLowerCase();
  if (!cleanId) return null;

  // 1. Check inMemoryRooms first (0ms latency, zero cache lag, perfect for WebRTC real-time signaling)
  const memoryRoom = inMemoryRooms.get(cleanId);
  if (memoryRoom) {
    // Check if expired (> 15 mins)
    if (Date.now() - memoryRoom.createdAt > 15 * 60 * 1000) {
      inMemoryRooms.delete(cleanId);
      return null;
    }
    return memoryRoom;
  }

  // 2. If not found in memory and Vercel Blob token exists (e.g. cold start / multi-instance), fallback to Blob
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const { blobs } = await list({ token: blobToken, prefix: `netplay-rooms/${cleanId}` });
      const targetBlob = blobs.find(b => b.pathname === `netplay-rooms/${cleanId}.json` || b.pathname.endsWith(`/${cleanId}.json`));
      if (targetBlob && targetBlob.url) {
        // Check age (> 15 mins)
        if (targetBlob.uploadedAt && Date.now() - new Date(targetBlob.uploadedAt).getTime() > 15 * 60 * 1000) {
          try {
            await del(targetBlob.url, { token: blobToken });
          } catch (delErr) {}
          inMemoryRooms.delete(cleanId);
          return null;
        }

        try {
          const fetchUrl = targetBlob.url.includes('?') 
            ? `${targetBlob.url}&_t=${Date.now()}` 
            : `${targetBlob.url}?_t=${Date.now()}`;
          
          const res = await fetch(fetchUrl, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });

          if (res.ok) {
            const data = (await res.json()) as NetplayRoomStatus;
            if (data && data.roomId) {
              inMemoryRooms.set(cleanId, data);
              return data;
            }
          } else if (res.status === 404) {
            console.log(`[Netplay Storage] Blob for room ${cleanId} returned 404 (room not found).`);
            inMemoryRooms.delete(cleanId);
            return null;
          } else {
            console.warn(`[Netplay Storage] Blob fetch returned status ${res.status} for ${cleanId}`);
          }
        } catch (fetchErr) {
          console.warn(`[Netplay Storage] Failed to fetch targetBlob url for ${cleanId}:`, fetchErr);
        }
      }
    } catch (err) {
      console.warn(`[Netplay Storage] Error reading room from Vercel Blob (${cleanId}):`, err);
    }
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

export async function saveSignalPayload(
  roomId: string,
  type: 'offer' | 'answer' | 'candidate',
  payload: any,
  role: 'p1' | 'p2' = 'p1'
): Promise<NetplayRoomStatus | null> {
  const cleanId = roomId.trim().toLowerCase();
  let room = inMemoryRooms.get(cleanId);
  if (!room) {
    room = (await getRoomStatus(cleanId)) || undefined;
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
      updatedAt: now,
      hostIceCandidates: [],
      guestIceCandidates: []
    };
  }

  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);

  if (type === 'offer') {
    // When Host creates a new Offer, start a fresh WebRTC signaling handshake
    room.hostOffer = payloadStr;
    room.guestAnswer = undefined;
    room.hostIceCandidates = [];
    room.guestIceCandidates = [];
    console.log(`[Netplay Signaling] 🌟 Registered new SDP Offer for room ${cleanId} (Host P1)`);
  } else if (type === 'answer') {
    room.guestAnswer = payloadStr;
    console.log(`[Netplay Signaling] 🌟 Registered SDP Answer for room ${cleanId} (Guest P2)`);
  } else if (type === 'candidate') {
    if (role === 'p1') {
      if (!room.hostIceCandidates) room.hostIceCandidates = [];
      if (!room.hostIceCandidates.includes(payloadStr)) {
        room.hostIceCandidates.push(payloadStr);
      }
      console.log(`[Netplay Signaling] 🧊 Saved Host ICE candidate #${room.hostIceCandidates.length} for room ${cleanId}`);
    } else {
      if (!room.guestIceCandidates) room.guestIceCandidates = [];
      if (!room.guestIceCandidates.includes(payloadStr)) {
        room.guestIceCandidates.push(payloadStr);
      }
      console.log(`[Netplay Signaling] 🧊 Saved Guest ICE candidate #${room.guestIceCandidates.length} for room ${cleanId}`);
    }
  }

  room.updatedAt = now;
  inMemoryRooms.set(cleanId, room);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const blobPath = `netplay-rooms/${cleanId}.json`;
    put(blobPath, JSON.stringify(room), {
      access: "public",
      token: blobToken,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json"
    }).then(() => {
      console.log(`[Netplay Signaling] Synced ${type} (${role}) for room ${cleanId} to Vercel Blob`);
    }).catch(err => {
      console.warn(`[Netplay Signaling] Failed to sync signal to Vercel Blob (${cleanId}):`, err);
    });
  }

  return room;
}


