/**
 * WebRTC Remote Play Together Service for Quán Game Xóm
 * Enables ultra-low latency peer-to-peer screen/audio streaming (Host -> Guest)
 * and gamepad/keyboard controller input transmission (Guest -> Host)
 * with zero external signaling server dependencies.
 */

export type NetplayButton = 
  | 'UP' 
  | 'DOWN' 
  | 'LEFT' 
  | 'RIGHT' 
  | 'A' 
  | 'B' 
  | 'X' 
  | 'Y' 
  | 'L' 
  | 'R' 
  | 'START' 
  | 'SELECT';

export interface P2InputMessage {
  type: 'p2_input';
  action: 'keydown' | 'keyup';
  button: NetplayButton;
}

export interface PingMessage {
  type: 'ping';
  t: number;
}

export interface PongMessage {
  type: 'pong';
  t: number;
}

export type WebRTCDataMessage = P2InputMessage | PingMessage | PongMessage;

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' }
  ],
  iceCandidatePoolSize: 10
};

// Player 2 key mapping for EmulatorJS
// We map these unambiguous physical key events when Player 2 presses a button
export const P2_KEY_MAPPINGS: Record<NetplayButton, { key: string; code: string; keyCode: number }> = {
  UP: { key: 'w', code: 'KeyW', keyCode: 87 },
  DOWN: { key: 's', code: 'KeyS', keyCode: 83 },
  LEFT: { key: 'a', code: 'KeyA', keyCode: 65 },
  RIGHT: { key: 'd', code: 'KeyD', keyCode: 68 },
  B: { key: 'k', code: 'KeyK', keyCode: 75 },
  A: { key: 'l', code: 'KeyL', keyCode: 76 },
  Y: { key: 'j', code: 'KeyJ', keyCode: 74 },
  X: { key: 'i', code: 'KeyI', keyCode: 73 },
  L: { key: 'u', code: 'KeyU', keyCode: 85 },
  R: { key: 'o', code: 'KeyO', keyCode: 79 },
  SELECT: { key: 'b', code: 'KeyB', keyCode: 66 },
  START: { key: 'v', code: 'KeyV', keyCode: 86 }
};

// =========================================================================
// HOST WEBRTC SESSION (Player 1)
// =========================================================================
export class HostWebRTCSession {
  private roomId: string;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private mediaStream: MediaStream | null = null;
  private isDestroyed = false;
  private hasRemoteAnswer = false;
  private processedGuestCandidates = new Set<string>();
  private pollInterval: any = null;
  private pingInterval: any = null;

  public onPlayer2Input?: (action: 'keydown' | 'keyup', button: NetplayButton) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState, iceState?: RTCIceConnectionState) => void;
  public onLatencyUpdate?: (pingMs: number) => void;
  public onError?: (error: Error) => void;

  constructor(roomId: string, mediaStream: MediaStream) {
    this.roomId = roomId.trim().toLowerCase();
    this.mediaStream = mediaStream;
  }

  public async start(): Promise<void> {
    try {
      console.log(`%c[HostWebRTC] 🚀 [Step 1/5] Starting Host session for room [${this.roomId}]...`, 'color: #38bdf8; font-weight: bold;');
      this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

      // Add video and audio tracks
      if (this.mediaStream) {
        const tracks = this.mediaStream.getTracks();
        console.log(`[HostWebRTC] 📹 [Step 2/5] MediaStream contains ${tracks.length} track(s):`, tracks.map(t => `${t.kind}:${t.id}:${t.readyState}`).join(', '));
        tracks.forEach((track) => {
          console.log(`[HostWebRTC] Adding local ${track.kind} track to PeerConnection.`);
          this.peerConnection?.addTrack(track, this.mediaStream!);
        });
      } else {
        console.warn(`[HostWebRTC] ⚠️ No MediaStream provided to HostWebRTCSession!`);
      }

      // Create unordered, maxRetransmits: 0 DataChannel for ultra-low latency inputs
      this.dataChannel = this.peerConnection.createDataChannel('p2_controls', {
        ordered: false,
        maxRetransmits: 0
      });
      console.log(`[HostWebRTC] 🎮 [Step 3/5] Created RTCDataChannel 'p2_controls'`);

      this.setupDataChannel(this.dataChannel);

      // ICE candidate handling
      this.peerConnection.onicecandidate = (event) => {
        if (this.isDestroyed) return;
        if (event.candidate && event.candidate.candidate && event.candidate.candidate.trim() !== '') {
          console.log(`%c[HostWebRTC] 📤 [ICE] Generated local ICE candidate -> type: ${event.candidate.type || 'host'}, protocol: ${event.candidate.protocol}, IP: ${event.candidate.address || event.candidate.relatedAddress || 'local'}`, 'color: #a855f7;');
          this.sendSignal('candidate', event.candidate.toJSON(), 'p1');
        } else if (!event.candidate) {
          console.log(`%c[HostWebRTC] 🏁 [ICE] Local ICE candidate gathering completed.`, 'color: #a855f7;');
        }
      };

      this.peerConnection.onicecandidateerror = (event: any) => {
        console.warn(`[HostWebRTC] ⚠️ ICE candidate error (${event.errorCode}): ${event.errorText} (${event.url})`);
      };

      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState || 'closed';
        const iceState = this.peerConnection?.iceConnectionState;
        console.log(`%c[HostWebRTC] 🔄 Connection state changed: "${state}" (ICE: "${iceState}")`, 'color: #3b82f6; font-weight: bold;');
        this.onConnectionStateChange?.(state, iceState);
      };

      this.peerConnection.oniceconnectionstatechange = () => {
        const iceState = this.peerConnection?.iceConnectionState;
        const connState = this.peerConnection?.connectionState || 'new';
        console.log(`%c[HostWebRTC] 🔄 ICE state changed: "${iceState}" (Conn: "${connState}")`, 'color: #8b5cf6; font-weight: bold;');
        this.onConnectionStateChange?.(connState, iceState);
      };

      // Create Offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
      });
      await this.peerConnection.setLocalDescription(offer);

      console.log(`%c[HostWebRTC] 📤 [Step 4/5] Created SDP Offer (${offer.sdp?.length || 0} chars). Uploading to /api/netplay/signal...`, 'color: #f59e0b; font-weight: bold;');
      await this.sendSignal('offer', offer, 'p1');

      // Start polling for Guest Answer & Candidates
      this.startSignalingPoll();
    } catch (err: any) {
      console.error(`[HostWebRTC Error]:`, err);
      this.onError?.(err);
    }
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      console.log(`%c[HostWebRTC] ✅ 🎉 DataChannel 'p2_controls' OPENED with Guest! Remote Play active.`, 'color: #10b981; font-weight: bold; font-size: 13px;');
      this.onConnectionStateChange?.('connected', 'connected');
      this.startPingLoop();
    };

    channel.onclose = () => {
      console.log(`[HostWebRTC] ❌ DataChannel closed.`);
      if (this.pingInterval) clearInterval(this.pingInterval);
    };

    channel.onerror = (e) => {
      console.warn(`[HostWebRTC] DataChannel error:`, e);
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebRTCDataMessage;
        if (data.type === 'p2_input') {
          this.onPlayer2Input?.(data.action, data.button);
        } else if (data.type === 'ping') {
          // Respond to guest ping with pong
          const pong: PongMessage = { type: 'pong', t: data.t };
          channel.send(JSON.stringify(pong));
        } else if (data.type === 'pong') {
          const now = performance.now();
          const rtt = Math.round(now - data.t);
          this.onLatencyUpdate?.(rtt);
        }
      } catch (e) {
        console.warn(`[HostWebRTC] Invalid DataChannel message received:`, event.data);
      }
    };
  }

  private startPingLoop() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        const ping: PingMessage = { type: 'ping', t: performance.now() };
        try {
          this.dataChannel.send(JSON.stringify(ping));
        } catch (e) {}
      }
    }, 1500);
  }

  private async sendSignal(type: 'offer' | 'answer' | 'candidate', payload: any, role: 'p1' | 'p2') {
    try {
      const res = await fetch('/api/netplay/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: this.roomId, type, payload, role })
      });
      if (!res.ok) {
        console.warn(`[HostWebRTC Signal Warning] POST /api/netplay/signal HTTP ${res.status}`);
      } else {
        console.log(`[HostWebRTC] 📡 Sent signal [${type}] to server successfully.`);
      }
    } catch (e) {
      console.warn(`[HostWebRTC Signal Warning] Failed to send signal ${type}:`, e);
    }
  }

  private startSignalingPoll() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    const poll = async () => {
      if (this.isDestroyed || !this.peerConnection) return;

      try {
        const res = await fetch(`/api/netplay/room-status?room=${encodeURIComponent(this.roomId)}&_t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (!res.ok) return;

        const data = await res.json();
        const status = data.status;
        if (!status) return;

        // 1. Process Remote Answer from Guest
        if (status.guestAnswer && !this.hasRemoteAnswer) {
          console.log(`%c[HostWebRTC] 📥 [Step 5/5] Received Guest SDP Answer from server! Signaling state: ${this.peerConnection.signalingState}`, 'color: #10b981; font-weight: bold;');
          const answerDesc = typeof status.guestAnswer === 'string'
            ? JSON.parse(status.guestAnswer)
            : status.guestAnswer;

          if (this.peerConnection.signalingState === 'have-local-offer') {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerDesc));
            this.hasRemoteAnswer = true;
            console.log(`%c[HostWebRTC] ✅ [Step 5/5] Remote Answer applied to PeerConnection successfully! State is now: ${this.peerConnection.signalingState}`, 'color: #10b981; font-weight: bold;');
          } else {
            console.log(`[HostWebRTC] PeerConnection signalingState is "${this.peerConnection.signalingState}", waiting for have-local-offer...`);
          }
        }

        // 2. Process Guest ICE Candidates
        if (this.hasRemoteAnswer && Array.isArray(status.guestIceCandidates) && status.guestIceCandidates.length > 0) {
          for (const candStr of status.guestIceCandidates) {
            if (!this.processedGuestCandidates.has(candStr)) {
              this.processedGuestCandidates.add(candStr);
              try {
                const candObj = typeof candStr === 'string' ? JSON.parse(candStr) : candStr;
                if (candObj && candObj.candidate && candObj.candidate.trim() !== '') {
                  await this.peerConnection.addIceCandidate(candObj);
                  console.log(`[HostWebRTC] 📥 [ICE] Applied Guest ICE candidate: ${candObj.candidate.substring(0, 55)}...`);
                }
              } catch (cErr) {
                console.warn(`[HostWebRTC] ⚠️ Error applying guest ICE candidate:`, cErr);
              }
            }
          }
        }

        // Once connected, reduce polling frequency
        if (!this.isDestroyed && this.peerConnection) {
          const connState = this.peerConnection.connectionState;
          const iceState = this.peerConnection.iceConnectionState;
          if (connState === 'connected' || iceState === 'connected' || iceState === 'completed') {
            if (this.pollInterval) {
              clearInterval(this.pollInterval);
              this.pollInterval = setInterval(poll, 4000);
            }
          }
        }
      } catch (err) {
        if (!this.isDestroyed) {
          console.warn(`[HostWebRTC Poll Warning]:`, err);
        }
      }
    };

    poll();
    this.pollInterval = setInterval(poll, 600);
  }

  public destroy(reason: string = 'component_unmount') {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    console.log(`%c[HostWebRTC] 🛑 Session destroyed. Reason: "${reason}"`, 'color: #ef4444; font-weight: bold;');

    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pollInterval = null;
    this.pingInterval = null;

    if (this.dataChannel) {
      try { this.dataChannel.close(); } catch (e) {}
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch (e) {}
      this.peerConnection = null;
    }
  }
}

// =========================================================================
// GUEST WEBRTC SESSION (Player 2)
// =========================================================================
export class GuestWebRTCSession {
  private roomId: string;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private isDestroyed = false;
  private hasProcessedOffer = false;
  private processedHostCandidates = new Set<string>();
  private pollInterval: any = null;
  private pingInterval: any = null;

  public onRemoteStream?: (stream: MediaStream) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState, iceState?: RTCIceConnectionState) => void;
  public onLatencyUpdate?: (pingMs: number) => void;
  public onError?: (error: Error) => void;

  constructor(roomId: string) {
    this.roomId = roomId.trim().toLowerCase();
  }

  public async start(): Promise<void> {
    try {
      console.log(`%c[GuestWebRTC] 🚀 [Step 1/4] Starting Guest session for room [${this.roomId}]...`, 'color: #06b6d4; font-weight: bold;');
      this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

      // Handle receiving remote MediaStream from Host
      this.peerConnection.ontrack = (event) => {
        console.log(`%c[GuestWebRTC] 📺 [Track] Received remote track from Host: ${event.track.kind} (${event.track.id}, readyState: ${event.track.readyState})`, 'color: #10b981; font-weight: bold;');
        this.onConnectionStateChange?.('connected', 'connected');
        if (event.streams && event.streams[0]) {
          this.onRemoteStream?.(event.streams[0]);
        } else {
          const stream = new MediaStream([event.track]);
          this.onRemoteStream?.(stream);
        }
      };

      // Handle DataChannel created by Host
      this.peerConnection.ondatachannel = (event) => {
        console.log(`%c[GuestWebRTC] 🎮 [DataChannel] Received DataChannel from Host: '${event.channel.label}'`, 'color: #10b981; font-weight: bold;');
        this.dataChannel = event.channel;
        this.setupDataChannel(this.dataChannel);
      };

      // ICE candidate handling
      this.peerConnection.onicecandidate = (event) => {
        if (this.isDestroyed) return;
        if (event.candidate && event.candidate.candidate && event.candidate.candidate.trim() !== '') {
          console.log(`%c[GuestWebRTC] 📤 [ICE] Generated local ICE candidate -> type: ${event.candidate.type || 'host'}, protocol: ${event.candidate.protocol}, IP: ${event.candidate.address || event.candidate.relatedAddress || 'local'}`, 'color: #a855f7;');
          this.sendSignal('candidate', event.candidate.toJSON(), 'p2');
        } else if (!event.candidate) {
          console.log(`%c[GuestWebRTC] 🏁 [ICE] Local ICE candidate gathering completed.`, 'color: #a855f7;');
        }
      };

      this.peerConnection.onicecandidateerror = (event: any) => {
        console.warn(`[GuestWebRTC] ⚠️ ICE candidate error (${event.errorCode}): ${event.errorText} (${event.url})`);
      };

      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState || 'closed';
        const iceState = this.peerConnection?.iceConnectionState;
        console.log(`%c[GuestWebRTC] 🔄 Connection state changed: "${state}" (ICE: "${iceState}")`, 'color: #3b82f6; font-weight: bold;');
        this.onConnectionStateChange?.(state, iceState);
      };

      this.peerConnection.oniceconnectionstatechange = () => {
        const iceState = this.peerConnection?.iceConnectionState;
        const connState = this.peerConnection?.connectionState || 'new';
        console.log(`%c[GuestWebRTC] 🔄 ICE state changed: "${iceState}" (Conn: "${connState}")`, 'color: #8b5cf6; font-weight: bold;');
        this.onConnectionStateChange?.(connState, iceState);
      };

      // Start polling for Host Offer & Candidates
      this.startSignalingPoll();
    } catch (err: any) {
      console.error(`[GuestWebRTC Error]:`, err);
      this.onError?.(err);
    }
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      console.log(`%c[GuestWebRTC] ✅ 🎉 DataChannel OPENED with Host! Can now transmit Player 2 inputs.`, 'color: #10b981; font-weight: bold; font-size: 13px;');
      this.onConnectionStateChange?.('connected', 'connected');
      this.startPingLoop();
    };

    channel.onclose = () => {
      console.log(`[GuestWebRTC] ❌ DataChannel closed.`);
      if (this.pingInterval) clearInterval(this.pingInterval);
    };

    channel.onerror = (e) => {
      console.warn(`[GuestWebRTC] DataChannel error:`, e);
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebRTCDataMessage;
        if (data.type === 'ping') {
          // Respond to host ping with pong
          const pong: PongMessage = { type: 'pong', t: data.t };
          channel.send(JSON.stringify(pong));
        } else if (data.type === 'pong') {
          const now = performance.now();
          const rtt = Math.round(now - data.t);
          this.onLatencyUpdate?.(rtt);
        }
      } catch (e) {}
    };
  }

  private startPingLoop() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        const ping: PingMessage = { type: 'ping', t: performance.now() };
        try {
          this.dataChannel.send(JSON.stringify(ping));
        } catch (e) {}
      }
    }, 1500);
  }

  public sendInput(action: 'keydown' | 'keyup', button: NetplayButton) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const msg: P2InputMessage = {
        type: 'p2_input',
        action,
        button
      };
      try {
        this.dataChannel.send(JSON.stringify(msg));
      } catch (e) {
        console.warn(`[GuestWebRTC] Send input failed:`, e);
      }
    }
  }

  private async sendSignal(type: 'offer' | 'answer' | 'candidate', payload: any, role: 'p1' | 'p2') {
    try {
      const res = await fetch('/api/netplay/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: this.roomId, type, payload, role })
      });
      if (!res.ok) {
        console.warn(`[GuestWebRTC Signal Warning] POST /api/netplay/signal HTTP ${res.status}`);
      } else {
        console.log(`[GuestWebRTC] 📡 Sent signal [${type}] to server successfully.`);
      }
    } catch (e) {
      console.warn(`[GuestWebRTC Signal Warning] Failed to send signal ${type}:`, e);
    }
  }

  private startSignalingPoll() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    const poll = async () => {
      if (this.isDestroyed || !this.peerConnection) return;

      try {
        const res = await fetch(`/api/netplay/room-status?room=${encodeURIComponent(this.roomId)}&_t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (!res.ok || this.isDestroyed || !this.peerConnection) return;

        const data = await res.json();
        if (this.isDestroyed || !this.peerConnection) return;
        const status = data.status;
        if (!status) return;

        // 1. Process Host SDP Offer
        if (status.hostOffer && !this.hasProcessedOffer) {
          if (this.isDestroyed || !this.peerConnection) return;
          console.log(`%c[GuestWebRTC] 📥 [Step 2/4] Received Host SDP Offer from server! Applying remote description...`, 'color: #06b6d4; font-weight: bold;');
          this.hasProcessedOffer = true;

          const offerDesc = typeof status.hostOffer === 'string'
            ? JSON.parse(status.hostOffer)
            : status.hostOffer;

          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerDesc));

          if (this.isDestroyed || !this.peerConnection) return;
          console.log(`%c[GuestWebRTC] 📝 [Step 3/4] Creating SDP Answer...`, 'color: #06b6d4;');
          const answer = await this.peerConnection.createAnswer();

          if (this.isDestroyed || !this.peerConnection) return;
          await this.peerConnection.setLocalDescription(answer);

          if (this.isDestroyed || !this.peerConnection) return;
          console.log(`%c[GuestWebRTC] 📤 [Step 4/4] Uploading SDP Answer (${answer.sdp?.length || 0} chars) to /api/netplay/signal...`, 'color: #06b6d4; font-weight: bold;');
          await this.sendSignal('answer', answer, 'p2');
        }

        // 2. Process Host ICE Candidates
        if (this.hasProcessedOffer && Array.isArray(status.hostIceCandidates) && status.hostIceCandidates.length > 0) {
          for (const candStr of status.hostIceCandidates) {
            if (this.isDestroyed || !this.peerConnection) return;
            if (!this.processedHostCandidates.has(candStr)) {
              this.processedHostCandidates.add(candStr);
              try {
                const candObj = typeof candStr === 'string' ? JSON.parse(candStr) : candStr;
                if (candObj && candObj.candidate && candObj.candidate.trim() !== '') {
                  await this.peerConnection.addIceCandidate(candObj);
                  console.log(`[GuestWebRTC] 📥 [ICE] Applied Host ICE candidate: ${candObj.candidate.substring(0, 55)}...`);
                }
              } catch (cErr) {
                console.warn(`[GuestWebRTC] ⚠️ Error applying host ICE candidate:`, cErr);
              }
            }
          }
        }

        // Once connected, reduce polling frequency
        if (!this.isDestroyed && this.peerConnection) {
          const connState = this.peerConnection.connectionState;
          const iceState = this.peerConnection.iceConnectionState;
          if (connState === 'connected' || iceState === 'connected' || iceState === 'completed') {
            if (this.pollInterval) {
              clearInterval(this.pollInterval);
              this.pollInterval = setInterval(poll, 4000);
            }
          }
        }
      } catch (err) {
        if (!this.isDestroyed) {
          console.warn(`[GuestWebRTC Poll Warning]:`, err);
        }
      }
    };

    poll();
    this.pollInterval = setInterval(poll, 600);
  }

  public destroy(reason: string = 'component_unmount') {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    console.log(`%c[GuestWebRTC] 🛑 Session destroyed. Reason: "${reason}"`, 'color: #ef4444; font-weight: bold;');

    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pollInterval = null;
    this.pingInterval = null;

    if (this.dataChannel) {
      try { this.dataChannel.close(); } catch (e) {}
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch (e) {}
      this.peerConnection = null;
    }
  }
}
