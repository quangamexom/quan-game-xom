import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  LogOut,
  Wifi,
  WifiOff,
  Radio,
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';
import { GuestWebRTCSession, NetplayButton } from '../services/webrtcRemotePlay';

interface GuestRemotePlayerProps {
  roomId: string;
  gameTitle: string;
  gameCoverArt?: string;
  onExit: () => void;
}

export const GuestRemotePlayer: React.FC<GuestRemotePlayerProps> = ({
  roomId,
  gameTitle,
  gameCoverArt,
  onExit
}) => {
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed'
  >('connecting');
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasUserUnmuted, setHasUserUnmuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeButtons, setActiveButtons] = useState<Set<NetplayButton>>(new Set());
  const [showControlsGuide, setShowControlsGuide] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<GuestWebRTCSession | null>(null);
  const gamepadPollingRef = useRef<number | null>(null);
  const prevGamepadButtonsRef = useRef<Record<string, boolean>>({});

  // Helper to send P2 button action
  const handleButtonAction = useCallback((action: 'keydown' | 'keyup', button: NetplayButton) => {
    if (sessionRef.current) {
      sessionRef.current.sendInput(action, button);
    }
    setActiveButtons((prev) => {
      const next = new Set(prev);
      if (action === 'keydown') next.add(button);
      else next.delete(button);
      return next;
    });
  }, []);

  // Initialize WebRTC Session — single effect keyed on roomId
  // NOTE: Using closure flag 'isCancelled' to survive React StrictMode double-invocation.
  // In StrictMode, React runs: mount → cleanup → mount again. The flag prevents the
  // cleanup from the FIRST mount from destroying a session that the SECOND mount created.
  useEffect(() => {
    let isCancelled = false;

    // Small delay to let StrictMode's immediate unmount/remount cycle complete
    // before we actually start the session. This prevents wasted sessions.
    const initTimer = setTimeout(() => {
      if (isCancelled) {
        console.log('[GuestRemotePlayer] Init cancelled before session could start (StrictMode cleanup).');
        return;
      }

      // Destroy any stale session before creating a fresh one
      if (sessionRef.current) {
        sessionRef.current.destroy('guest_stale_before_new_init');
        sessionRef.current = null;
      }

      setConnectionState('connecting');
      console.log(`[GuestRemotePlayer] 🎮 Initializing new GuestWebRTCSession for room [${roomId}]...`);
      const session = new GuestWebRTCSession(roomId);

      session.onRemoteStream = (stream) => {
        if (isCancelled) return;
        console.log('[GuestRemotePlayer] 📺 Received MediaStream from Host. Stream tracks:', stream.getTracks().map(t => `${t.kind}:${t.id}:${t.readyState}`));
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            console.log('[GuestRemotePlayer] ✅ Video playback started successfully!');
          }).catch((e) => {
            console.warn('[GuestRemotePlayer] Video autoplay requires mute initially:', e);
          });
        }
      };

      session.onConnectionStateChange = (state, iceState) => {
        if (isCancelled) return;
        console.log(`[GuestRemotePlayer] Connection state: "${state}", ICE state: "${iceState}"`);
        if (state === 'connected' || iceState === 'connected' || iceState === 'completed') {
          setConnectionState('connected');
        } else if (state === 'connecting' || iceState === 'checking') {
          setConnectionState('connecting');
        } else if (iceState === 'disconnected') {
          setConnectionState('reconnecting');
        } else if (state === 'failed' || iceState === 'failed') {
          setConnectionState('failed');
        } else if (state === 'closed') {
          setConnectionState('disconnected');
        }
      };

      session.onLatencyUpdate = (latency) => {
        if (isCancelled) return;
        setPingMs(latency);
      };

      session.onError = (err) => {
        if (isCancelled) return;
        console.error('[GuestRemotePlayer Error]:', err);
        setConnectionState('failed');
      };

      session.start();
      sessionRef.current = session;
    }, 50); // 50ms delay: enough for StrictMode unmount+remount cycle to complete

    return () => {
      isCancelled = true;
      clearTimeout(initTimer);
      console.log('[GuestRemotePlayer] Cleanup effect running (unmount or roomId changed).');
      if (sessionRef.current) {
        sessionRef.current.destroy('guest_effect_cleanup');
        sessionRef.current = null;
      }
      if (gamepadPollingRef.current) {
        cancelAnimationFrame(gamepadPollingRef.current);
        gamepadPollingRef.current = null;
      }
    };
  }, [roomId]);

  // Manual reconnect — called by "Thử Kết Nối Lại" button
  const handleReconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.destroy('guest_manual_reconnect');
      sessionRef.current = null;
    }
    setConnectionState('connecting');
    console.log(`[GuestRemotePlayer] 🔄 Manual reconnect for room [${roomId}]...`);
    const session = new GuestWebRTCSession(roomId);

    session.onRemoteStream = (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    };
    session.onConnectionStateChange = (state, iceState) => {
      if (state === 'connected' || iceState === 'connected' || iceState === 'completed') {
        setConnectionState('connected');
      } else if (state === 'connecting' || iceState === 'checking') {
        setConnectionState('connecting');
      } else if (iceState === 'disconnected') {
        setConnectionState('reconnecting');
      } else if (state === 'failed' || iceState === 'failed') {
        setConnectionState('failed');
      } else if (state === 'closed') {
        setConnectionState('disconnected');
      }
    };
    session.onLatencyUpdate = (latency) => setPingMs(latency);
    session.onError = (err) => {
      console.error('[GuestRemotePlayer Error]:', err);
      setConnectionState('failed');
    };
    session.start();
    sessionRef.current = session;
  }, [roomId]);
  useEffect(() => {
    const KEY_TO_BUTTON: Record<string, NetplayButton> = {
      // Directional (Arrows or WASD)
      ArrowUp: 'UP',
      KeyW: 'UP',
      ArrowDown: 'DOWN',
      KeyS: 'DOWN',
      ArrowLeft: 'LEFT',
      KeyA: 'LEFT',
      ArrowRight: 'RIGHT',
      KeyD: 'RIGHT',

      // Action Buttons
      KeyZ: 'B',
      KeyK: 'B',
      KeyX: 'A',
      KeyL: 'A',
      KeyC: 'Y',
      KeyJ: 'Y',
      KeyV: 'X',
      KeyI: 'X',

      // Shoulder & Special
      KeyQ: 'L',
      KeyU: 'L',
      KeyE: 'R',
      KeyO: 'R',
      Enter: 'START',
      ShiftRight: 'SELECT',
      ShiftLeft: 'SELECT',
      Space: 'SELECT'
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.repeat) return;
      const button = KEY_TO_BUTTON[e.code] || KEY_TO_BUTTON[e.key];
      if (button) {
        handleButtonAction('keydown', button);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const button = KEY_TO_BUTTON[e.code] || KEY_TO_BUTTON[e.key];
      if (button) {
        handleButtonAction('keyup', button);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleButtonAction]);

  // Gamepad API Polling
  useEffect(() => {
    const GAMEPAD_BUTTON_MAP: Record<number, NetplayButton> = {
      0: 'B',       // A button on Xbox / Cross on PS -> SNES B
      1: 'A',       // B button on Xbox / Circle on PS -> SNES A
      2: 'Y',       // X button on Xbox / Square on PS -> SNES Y
      3: 'X',       // Y button on Xbox / Triangle on PS -> SNES X
      4: 'L',       // Left Bumper
      5: 'R',       // Right Bumper
      8: 'SELECT',  // Back / Share
      9: 'START',   // Start / Options
      12: 'UP',     // D-Pad Up
      13: 'DOWN',   // D-Pad Down
      14: 'LEFT',   // D-Pad Left
      15: 'RIGHT'   // D-Pad Right
    };

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0]; // Player 2's primary connected controller

      if (gp) {
        Object.entries(GAMEPAD_BUTTON_MAP).forEach(([btnIdxStr, netplayBtn]) => {
          const btnIdx = Number(btnIdxStr);
          const isPressed = gp.buttons[btnIdx]?.pressed || false;
          const prevPressed = prevGamepadButtonsRef.current[netplayBtn] || false;

          if (isPressed && !prevPressed) {
            handleButtonAction('keydown', netplayBtn);
            prevGamepadButtonsRef.current[netplayBtn] = true;
          } else if (!isPressed && prevPressed) {
            handleButtonAction('keyup', netplayBtn);
            prevGamepadButtonsRef.current[netplayBtn] = false;
          }
        });

        // Left Analog Stick threshold
        const axisX = gp.axes[0] || 0;
        const axisY = gp.axes[1] || 0;

        const checkAxis = (direction: NetplayButton, active: boolean) => {
          const wasActive = prevGamepadButtonsRef.current[direction] || false;
          if (active && !wasActive) {
            handleButtonAction('keydown', direction);
            prevGamepadButtonsRef.current[direction] = true;
          } else if (!active && wasActive) {
            handleButtonAction('keyup', direction);
            prevGamepadButtonsRef.current[direction] = false;
          }
        };

        checkAxis('LEFT', axisX < -0.45);
        checkAxis('RIGHT', axisX > 0.45);
        checkAxis('UP', axisY < -0.45);
        checkAxis('DOWN', axisY > 0.45);
      }

      gamepadPollingRef.current = requestAnimationFrame(pollGamepad);
    };

    gamepadPollingRef.current = requestAnimationFrame(pollGamepad);
    return () => {
      if (gamepadPollingRef.current) {
        cancelAnimationFrame(gamepadPollingRef.current);
      }
    };
  }, [handleButtonAction]);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Toggle Audio
  const handleToggleAudio = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      setHasUserUnmuted(true);
      if (!nextMuted) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Ping color & label
  const getPingBadge = () => {
    if (pingMs === null) return { color: 'text-slate-400 bg-slate-800/80', text: 'Đang đo ping...' };
    if (pingMs < 60) return { color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40', text: `${pingMs} ms (Cực mượt)` };
    if (pingMs < 120) return { color: 'text-amber-400 bg-amber-950/80 border-amber-500/40', text: `${pingMs} ms (Tốt)` };
    return { color: 'text-rose-400 bg-rose-950/80 border-rose-500/40', text: `${pingMs} ms (Lag nhẹ)` };
  };

  const pingBadge = getPingBadge();

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex flex-col items-center select-none"
    >
      {/* Top Header Bar */}
      <div className="w-full px-4 py-2.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Khách (Player 2)
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-200 font-semibold truncate max-w-[180px] sm:max-w-xs">{gameTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Latency badge */}
          <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 ${pingBadge.color}`}>
            <Wifi className="w-3 h-3" />
            <span>{pingBadge.text}</span>
          </div>

          {/* Controls Guide button */}
          <button
            type="button"
            onClick={() => setShowControlsGuide(!showControlsGuide)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors"
            title="Hướng dẫn phím bấm"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`p-1.5 rounded-lg border transition-all ${
              isMuted
                ? 'bg-rose-950/60 text-rose-300 border-rose-700/50 hover:bg-rose-900'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:text-amber-400'
            }`}
            title={isMuted ? 'Bật âm thanh game' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Room */}
          <button
            type="button"
            onClick={onExit}
            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-800 transition-colors"
            title="Rời phòng"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Stream Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[75vh] bg-black flex items-center justify-center overflow-hidden">
        {/* WebRTC Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Unmute Prompt Floating Banner */}
        {isMuted && !hasUserUnmuted && connectionState === 'connected' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shadow-2xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
            onClick={handleToggleAudio}
          >
            <Volume2 className="w-4 h-4" />
            <span>Click để bật Âm Thanh Game</span>
          </motion.div>
        )}

        {/* Connecting / Loading Overlay */}
        <AnimatePresence>
          {connectionState === 'connecting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-40 p-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 animate-pulse">
                <Radio className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white font-mono mb-1">
                Đang Kết Nối WebRTC P2P Với Chủ Phòng...
              </h3>
              <p className="text-xs text-slate-400 font-mono max-w-md mb-4">
                Đang bắt tay tín hiệu SDP & tìm tuyến đường truyền STUN độ trễ thấp nhất tới Host.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400/90 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mã phòng: {roomId.toUpperCase()}</span>
              </div>
            </motion.div>
          )}

          {/* Reconnecting / Disconnected Overlay */}
          {(connectionState === 'reconnecting' || connectionState === 'failed' || connectionState === 'disconnected') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center z-40 p-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
                <WifiOff className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-base font-bold text-white font-mono mb-1">
                {connectionState === 'reconnecting'
                  ? 'Tạm Mất Kết Nối Với Chủ Phòng...'
                  : 'Không Thể Kết Nối Tới Chủ Phòng'}
              </h3>
              <p className="text-xs text-slate-400 font-mono max-w-md mb-6">
                Chủ phòng có thể đã đóng tab hoặc đường truyền mạng bị gián đoạn.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReconnect}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Thử Kết Nối Lại</span>
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Thoát Phòng</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Controls Guide Modal */}
        <AnimatePresence>
          {showControlsGuide && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-4 sm:inset-10 z-50 rounded-2xl bg-slate-900/95 border border-slate-700 backdrop-blur-xl p-5 shadow-2xl flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h4 className="text-sm font-bold text-amber-400 font-mono flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Bảng Nút Bấm Khách (Player 2)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowControlsGuide(false)}
                  className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
                >
                  Đóng ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-bold mb-2">🕹️ Nút Di Chuyển (D-Pad)</div>
                  <div className="space-y-1 text-slate-300">
                    <div>Lên: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">↑ Phím Mũi Tên</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">W</kbd></div>
                    <div>Xuống: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">↓ Phím Mũi Tên</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">S</kbd></div>
                    <div>Trái: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">← Phím Mũi Tên</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">A</kbd></div>
                    <div>Phải: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">→ Phím Mũi Tên</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">D</kbd></div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-bold mb-2">🎮 Nút Hành Động</div>
                  <div className="space-y-1 text-slate-300">
                    <div>Nút B: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">Z</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">K</kbd></div>
                    <div>Nút A: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">X</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">L</kbd></div>
                    <div>Nút Y: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">C</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">J</kbd></div>
                    <div>Nút X: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">V</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">I</kbd></div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-bold mb-2">⚡ Nút Vai (L / R)</div>
                  <div className="space-y-1 text-slate-300">
                    <div>Nút L: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">Q</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">U</kbd></div>
                    <div>Nút R: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">E</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">O</kbd></div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-bold mb-2">⚙️ Menu & Bắt Đầu</div>
                  <div className="space-y-1 text-slate-300">
                    <div>Start: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">Enter</kbd></div>
                    <div>Select: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">Shift</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Space</kbd></div>
                    <div>Tay Cầm: Cắm tay cầm USB/Bluetooth là chơi tự động!</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* On-Screen Virtual Touch Gamepad (Visible on Mobile / Touch screens) */}
      <div className="w-full bg-slate-950 border-t border-slate-800/80 p-3 flex items-center justify-between gap-4">
        {/* Left: D-Pad */}
        <div className="grid grid-cols-3 gap-1.5 w-32 h-32 items-center justify-items-center">
          <div />
          <button
            type="button"
            onPointerDown={() => handleButtonAction('keydown', 'UP')}
            onPointerUp={() => handleButtonAction('keyup', 'UP')}
            onPointerLeave={() => handleButtonAction('keyup', 'UP')}
            className={`w-10 h-10 rounded-xl bg-slate-900 border text-slate-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              activeButtons.has('UP') ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg' : 'border-slate-700'
            }`}
          >
            ▲
          </button>
          <div />

          <button
            type="button"
            onPointerDown={() => handleButtonAction('keydown', 'LEFT')}
            onPointerUp={() => handleButtonAction('keyup', 'LEFT')}
            onPointerLeave={() => handleButtonAction('keyup', 'LEFT')}
            className={`w-10 h-10 rounded-xl bg-slate-900 border text-slate-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              activeButtons.has('LEFT') ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg' : 'border-slate-700'
            }`}
          >
            ◀
          </button>
          <div className="w-6 h-6 rounded-full bg-slate-800/50" />
          <button
            type="button"
            onPointerDown={() => handleButtonAction('keydown', 'RIGHT')}
            onPointerUp={() => handleButtonAction('keyup', 'RIGHT')}
            onPointerLeave={() => handleButtonAction('keyup', 'RIGHT')}
            className={`w-10 h-10 rounded-xl bg-slate-900 border text-slate-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              activeButtons.has('RIGHT') ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg' : 'border-slate-700'
            }`}
          >
            ▶
          </button>

          <div />
          <button
            type="button"
            onPointerDown={() => handleButtonAction('keydown', 'DOWN')}
            onPointerUp={() => handleButtonAction('keyup', 'DOWN')}
            onPointerLeave={() => handleButtonAction('keyup', 'DOWN')}
            className={`w-10 h-10 rounded-xl bg-slate-900 border text-slate-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              activeButtons.has('DOWN') ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg' : 'border-slate-700'
            }`}
          >
            ▼
          </button>
          <div />
        </div>

        {/* Center: Select / Start & L / R */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => handleButtonAction('keydown', 'L')}
              onPointerUp={() => handleButtonAction('keyup', 'L')}
              onPointerLeave={() => handleButtonAction('keyup', 'L')}
              className={`px-3 py-1.5 rounded-lg bg-slate-900 border text-[11px] font-mono font-bold text-slate-300 active:scale-95 transition-all ${
                activeButtons.has('L') ? 'bg-amber-400 text-slate-950 border-amber-300' : 'border-slate-700'
              }`}
            >
              [L]
            </button>
            <button
              type="button"
              onPointerDown={() => handleButtonAction('keydown', 'R')}
              onPointerUp={() => handleButtonAction('keyup', 'R')}
              onPointerLeave={() => handleButtonAction('keyup', 'R')}
              className={`px-3 py-1.5 rounded-lg bg-slate-900 border text-[11px] font-mono font-bold text-slate-300 active:scale-95 transition-all ${
                activeButtons.has('R') ? 'bg-amber-400 text-slate-950 border-amber-300' : 'border-slate-700'
              }`}
            >
              [R]
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => handleButtonAction('keydown', 'SELECT')}
              onPointerUp={() => handleButtonAction('keyup', 'SELECT')}
              onPointerLeave={() => handleButtonAction('keyup', 'SELECT')}
              className={`px-3 py-1 rounded-md bg-slate-900 border text-[10px] font-mono font-bold text-slate-400 active:scale-95 transition-all ${
                activeButtons.has('SELECT') ? 'bg-amber-400 text-slate-950 border-amber-300' : 'border-slate-800'
              }`}
            >
              SELECT
            </button>
            <button
              type="button"
              onPointerDown={() => handleButtonAction('keydown', 'START')}
              onPointerUp={() => handleButtonAction('keyup', 'START')}
              onPointerLeave={() => handleButtonAction('keyup', 'START')}
              className={`px-3 py-1 rounded-md bg-slate-900 border text-[10px] font-mono font-bold text-slate-400 active:scale-95 transition-all ${
                activeButtons.has('START') ? 'bg-amber-400 text-slate-950 border-amber-300' : 'border-slate-800'
              }`}
            >
              START
            </button>
          </div>
        </div>

        {/* Right: Action Buttons (A, B, X, Y) */}
        <div className="grid grid-cols-3 gap-1.5 w-32 h-32 items-center justify-items-center">
          <div />
          <button
            type="button"
            onPointerDown={() => handleButtonAction('keydown', 'X')}
            onPointerUp={() => handleButtonAction('keyup', 'X')}
            onPointerLeave={() => handleButtonAction('keyup', 'X')}
            className={`w-10 h-10 rounded-full bg-blue-950/80 border text-blue-300 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              activeButtons.has('X') ? 'bg-blue-400 text-slate-950 border-blue-200 shadow-lg' : 'border-blue-700/60'
            }`}
          >
            X
          </button>
          <div />

          <button
            type="button"
            onPointerDown={() => handleButtonAction('keydown', 'Y')}
            onPointerUp={() => handleButtonAction('keyup', 'Y')}
            onPointerLeave={() => handleButtonAction('keyup', 'Y')}
            className={`w-10 h-10 rounded-full bg-emerald-950/80 border text-emerald-300 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              activeButtons.has('Y') ? 'bg-emerald-400 text-slate-950 border-emerald-200 shadow-lg' : 'border-emerald-700/60'
            }`}
          >
            Y
          </button>
          <div className="w-4 h-4" />
          <button
            type="button"
            onPointerDown={() => handleButtonAction('keydown', 'A')}
            onPointerUp={() => handleButtonAction('keyup', 'A')}
            onPointerLeave={() => handleButtonAction('keyup', 'A')}
            className={`w-10 h-10 rounded-full bg-red-950/80 border text-red-300 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              activeButtons.has('A') ? 'bg-red-400 text-slate-950 border-red-200 shadow-lg' : 'border-red-700/60'
            }`}
          >
            A
          </button>

          <div />
          <button
            type="button"
            onPointerDown={() => handleButtonAction('keydown', 'B')}
            onPointerUp={() => handleButtonAction('keyup', 'B')}
            onPointerLeave={() => handleButtonAction('keyup', 'B')}
            className={`w-10 h-10 rounded-full bg-yellow-950/80 border text-yellow-300 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              activeButtons.has('B') ? 'bg-yellow-400 text-slate-950 border-yellow-200 shadow-lg' : 'border-yellow-700/60'
            }`}
          >
            B
          </button>
          <div />
        </div>
      </div>
    </div>
  );
};
