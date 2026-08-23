import React, { useState, useEffect } from 'react';
import { 
  X, Upload, Cloud, Copy, Check, Trash2, Play, 
  Eye, EyeOff, FileCode, AlertCircle, RefreshCw, HardDrive, Sparkles, Gamepad2, CheckCircle2 
} from 'lucide-react';
import { useAdminMode } from '../hooks/useAdminMode';

export interface AdminBlobGameItem {
  id: string;
  title: string;
  system: string;
  systemName?: string;
  romUrl: string;
  size?: number | string;
  uploadedAt?: string;
  isHidden?: boolean;
}

interface BlobListItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  title?: string;
  system?: string;
  systemName?: string;
  id?: string;
  isHidden?: boolean;
}

interface AdminRomManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayRom?: (url: string, name: string, core?: string) => void;
  onGameUpdated?: () => void;
}

const SUPPORTED_SYSTEMS = [
  { id: 'snes', name: 'Super Nintendo (SNES)', ext: ['.sfc', '.smc', '.snes'] },
  { id: 'nes', name: 'NES / Điện Tử 4 Nút', ext: ['.nes'] },
  { id: 'gba', name: 'Game Boy Advance (GBA)', ext: ['.gba'] },
  { id: 'gbc', name: 'Game Boy Color (GBC)', ext: ['.gbc', '.gb'] },
  { id: 'n64', name: 'Nintendo 64 (N64)', ext: ['.n64', '.z64'] },
  { id: 'nds', name: 'Nintendo DS (NDS)', ext: ['.nds'] },
  { id: 'segamd', name: 'Sega Genesis / Mega Drive', ext: ['.md', '.gen', '.bin'] },
  { id: 'psx', name: 'Sony PlayStation 1 (PS1)', ext: ['.iso', '.cue', '.chd'] }
];

export const AdminRomManagerModal: React.FC<AdminRomManagerModalProps> = ({
  isOpen,
  onClose,
  onPlayRom,
  onGameUpdated
}) => {
  const { isAdmin } = useAdminMode();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayTitle, setDisplayTitle] = useState<string>('');
  const [selectedSystem, setSelectedSystem] = useState<string>('snes');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadedGame, setUploadedGame] = useState<any | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Blob & Metadata List
  const [blobs, setBlobs] = useState<BlobListItem[]>([]);
  const [isLoadingBlobs, setIsLoadingBlobs] = useState(false);
  const [isSyncingBlobs, setIsSyncingBlobs] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const detectSystemFromFilename = (filename: string): string => {
    const lower = filename.toLowerCase();
    for (const sys of SUPPORTED_SYSTEMS) {
      if (sys.ext.some(ext => lower.endsWith(ext))) {
        return sys.id;
      }
    }
    return 'snes';
  };

  const cleanFilenameToTitle = (filename: string): string => {
    return filename
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[\(\[\{].*?[\)\]\}]/g, ' ') // remove bracketed text e.g. (USA), (Beta)
      .replace(/[_.-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Fetch blobs list
  const loadBlobs = async () => {
    setIsLoadingBlobs(true);
    try {
      const res = await fetch(`/api/admin/blob/list?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await res.json();
      if (data.success) {
        setBlobs(data.blobs || []);
        setHasToken(data.hasToken !== false);
      } else {
        setHasToken(false);
      }
    } catch (err: any) {
      console.warn("Load blobs error:", err);
    } finally {
      setIsLoadingBlobs(false);
    }
  };

  const handleSyncAllBlobs = async () => {
    setIsSyncingBlobs(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/admin/blob/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message || `Đã đồng bộ thành công ${data.totalGames} game từ Vercel Blob!`);
        await loadBlobs();
        if (onGameUpdated) onGameUpdated();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('qgx_games_updated'));
        }
      } else {
        setErrorMessage(data.error || data.message || 'Lỗi đồng bộ từ Vercel Blob.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối khi đồng bộ Vercel Blob.');
    } finally {
      setIsSyncingBlobs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBlobs();
      setErrorMessage(null);
      setSuccessMessage(null);
      setUploadedGame(null);
      setSelectedFile(null);
      setDisplayTitle('');
      setSelectedSystem('snes');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const autoTitle = cleanFilenameToTitle(file.name) || file.name.replace(/\.[^/.]+$/, '');
      const detectedSys = detectSystemFromFilename(file.name);
      setDisplayTitle(autoTitle);
      setSelectedSystem(detectedSys);
      setErrorMessage(null);
      setSuccessMessage(null);
      setUploadedGame(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Vui lòng chọn 1 file ROM (.sfc, .smc, .nes, .gba, .zip...) từ máy tính.');
      return;
    }

    if (!displayTitle.trim()) {
      setErrorMessage('Vui lòng nhập Tên hiển thị cho Game.');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Đang đọc dữ liệu file ROM...');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setUploadProgress('Đang tải lên Vercel Blob & Tự động tạo thẻ Game...');

        try {
          const res = await fetch('/api/admin/blob/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              filename: selectedFile.name,
              fileData: base64Data,
              contentType: selectedFile.type || 'application/octet-stream',
              title: displayTitle.trim(),
              system: selectedSystem
            })
          });

          const rawText = await res.text();
          let result: any;
          try {
            result = JSON.parse(rawText);
          } catch {
            throw new Error(`Máy chủ trả về phản hồi không hợp lệ (HTTP ${res.status}): ${rawText.slice(0, 150) || res.statusText}`);
          }

          if (res.ok && result.success && result.url) {
            setUploadedGame(result.game || {
              title: displayTitle.trim(),
              system: selectedSystem,
              romUrl: result.url
            });
            setSuccessMessage(`Tải lên thành công! Game "${displayTitle}" đã tự động xuất hiện trong Thư Viện Game và Khu Vực Giả Lập.`);
            setSelectedFile(null);
            setDisplayTitle('');
            loadBlobs();
            // Notify parent components to reload game catalogs
            if (onGameUpdated) onGameUpdated();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('qgx_games_updated'));
            }
          } else {
            const errorMsg = result?.error || result?.hint || `Upload thất bại (HTTP ${res.status}).`;
            setErrorMessage(errorMsg);
          }
        } catch (postErr: any) {
          setErrorMessage(postErr.message || 'Lỗi mạng khi gọi API upload Vercel Blob.');
        } finally {
          setIsUploading(false);
          setUploadProgress('');
        }
      };

      reader.onerror = () => {
        setErrorMessage('Không thể đọc file từ thiết bị.');
        setIsUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi xử lý file.');
      setIsUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleToggleVisibility = async (id: string, currentHidden: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch('/api/admin/games/toggle-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isHidden: !currentHidden })
      });
      const data = await res.json();
      if (data.success) {
        setBlobs(blobs.map(b => (b.id === id || b.url === id) ? { ...b, isHidden: data.isHidden } : b));
        if (onGameUpdated) onGameUpdated();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('qgx_games_updated'));
        }
      } else {
        alert(data.error || 'Lỗi cập nhật trạng thái.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (url: string, id?: string) => {
    if (!confirm('Bạn có chắc muốn xóa vĩnh viễn game ROM này khỏi Vercel Blob và Thư Viện?')) return;

    try {
      const res = await fetch('/api/admin/blob/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, id })
      });
      const data = await res.json();
      if (data.success) {
        setBlobs(blobs.filter(b => b.url !== url && (!id || b.id !== id)));
        if (uploadedGame && uploadedGame.romUrl === url) setUploadedGame(null);
        if (onGameUpdated) onGameUpdated();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('qgx_games_updated'));
        }
      } else {
        alert(data.error || 'Lỗi khi xóa file.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    }
  };

  const formatFileSize = (bytes: number | string | undefined): string => {
    if (!bytes) return 'N/A';
    if (typeof bytes === 'string') return bytes;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-white max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>ADMIN UPLOAD ROM</span>
                <span className="text-amber-400 text-glow-amber">TỰ ĐỘNG TẠO CARD GAME</span>
              </h2>
              <p className="text-xs text-slate-400 font-body">
                Upload ROM trực tiếp lên Vercel Blob • Tự động tạo thẻ Game trong Thư Viện & Giả Lập
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1 custom-scrollbar">
          
          {/* Environment Warning if token missing */}
          {!hasToken && (
            <div className="p-4 bg-amber-950/60 border border-amber-500/50 rounded-2xl text-xs text-amber-200 flex items-start gap-3 font-body">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-300 block mb-1">Cần cấu hình BLOB_READ_WRITE_TOKEN:</strong>
                <span>Để upload file lên Vercel Blob Storage, hãy chắc chắn bạn đã gán biến môi trường <code>BLOB_READ_WRITE_TOKEN</code> trong Vercel Project Settings. (Nếu đang dev local, server sẽ tự lưu bản sao metadata vào file disk).</span>
              </div>
            </div>
          )}

          {/* Section 1: Upload Form with 2 Required Fields */}
          <div className="p-5 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>1. Chọn file ROM & Nhập thông tin Game:</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                (.smc, .sfc, .nes, .gba, .gbc, .zip)
              </span>
            </div>

            {/* Drag & Drop / Input area */}
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-5 text-center transition-colors bg-slate-900/40">
              <input
                id="rom-file-input"
                type="file"
                accept=".sfc,.smc,.snes,.nes,.gba,.gbc,.gb,.n64,.z64,.nds,.md,.gen,.bin,.zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <label 
                htmlFor="rom-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-bold text-white font-mono">{selectedFile.name}</p>
                    <p className="text-xs text-amber-400 font-mono mt-0.5">{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-300">
                      Nhấp vào đây để chọn file ROM từ máy tính
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-body">
                      Tự động điền Tên game & Nhận diện Hệ máy
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* 2 Fields: Tên Hiển Thị & Hệ Máy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Tên hiển thị Game: <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={displayTitle}
                  onChange={(e) => setDisplayTitle(e.target.value)}
                  placeholder="Ví dụ: Aladdin (USA), Contra, Pokemon Emerald..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Hệ máy (Core): <span className="text-amber-400">*</span>
                </label>
                <select
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 outline-none cursor-pointer"
                >
                  {SUPPORTED_SYSTEMS.map(sys => (
                    <option key={sys.id} value={sys.id}>
                      {sys.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setDisplayTitle('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-xl cursor-pointer"
                >
                  Bỏ chọn
                </button>
              )}
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || !displayTitle.trim() || isUploading}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{uploadProgress || 'Đang tải lên...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-slate-950" />
                    <span>TẢI LÊN & TẠO CARD GAME</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Upload Box with Auto-Card Feedback */}
            {uploadedGame && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ĐÃ TỰ ĐỘNG TẠO NAME CARD TRONG THƯ VIỆN & GIẢ LẬP!</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold">
                    MỚI
                  </span>
                </div>

                <div className="p-3 bg-slate-950/90 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white font-display truncate">{uploadedGame.title}</p>
                    <p className="text-xs text-amber-400 font-mono mt-0.5">
                      Hệ máy: {uploadedGame.systemName || uploadedGame.system?.toUpperCase()} • Direct Vercel Blob Stream
                    </p>
                  </div>
                  {onPlayRom && (
                    <button
                      type="button"
                      onClick={() => {
                        onPlayRom(uploadedGame.romUrl, uploadedGame.title, uploadedGame.system || 'snes');
                        onClose();
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Chơi ngay</span>
                    </button>
                  )}
                </div>

                {/* Copy Link Row */}
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30">
                  <input
                    type="text"
                    readOnly
                    value={uploadedGame.romUrl}
                    className="flex-1 bg-transparent text-xs font-mono text-emerald-200 outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(uploadedGame.romUrl)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {copiedUrl === uploadedGame.romUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã Copy!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] font-body text-slate-300">
                  ✨ Game đã sẵn sàng cho tất cả người dùng (kể cả tab ẩn danh). Bạn không cần nhập tay vào Google Sheet nữa!
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Uploaded ROMs on Vercel Blob with Visibility Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span>2. Quản lý ROM đã upload ({blobs.length} game)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncAllBlobs}
                  disabled={isSyncingBlobs}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title="Tự động quét toàn bộ file ROM trên Vercel Blob và cập nhật vào Thư Viện"
                >
                  <Cloud className={`w-3.5 h-3.5 text-amber-400 ${isSyncingBlobs ? 'animate-bounce' : ''}`} />
                  <span>{isSyncingBlobs ? 'Đang Quét & Đồng Bộ...' : 'Đồng Bộ Game Mới Từ Blob'}</span>
                </button>

                <button
                  type="button"
                  onClick={loadBlobs}
                  disabled={isLoadingBlobs}
                  className="text-[11px] font-mono text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingBlobs ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>

            {blobs.length === 0 ? (
              <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-center text-xs font-body text-slate-500">
                {isLoadingBlobs ? 'Đang tải danh sách...' : 'Chưa có file ROM nào trên Vercel Blob. Hãy upload file đầu tiên ở trên!'}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {blobs.map((blob, idx) => {
                  const filename = blob.pathname.replace(/^roms\//, '');
                  const gameTitle = blob.title || filename.replace(/\.[^/.]+$/, '');
                  const isCopied = copiedUrl === blob.url;
                  const core = blob.system || detectSystemFromFilename(filename);
                  const isHidden = blob.isHidden === true;
                  const itemKey = blob.id || blob.url || idx;

                  return (
                    <div 
                      key={itemKey}
                      className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-colors text-xs font-mono ${
                        isHidden 
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-75' 
                          : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold shrink-0">
                            {core}
                          </span>

                          {/* Visibility badge */}
                          {isHidden ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold shrink-0 flex items-center gap-1 border border-slate-700">
                              <EyeOff className="w-2.5 h-2.5" />
                              <span>Đang Ẩn (Test)</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold shrink-0 flex items-center gap-1 border border-emerald-500/30">
                              <Eye className="w-2.5 h-2.5" />
                              <span>Công Khai</span>
                            </span>
                          )}

                          <span className="text-white font-bold truncate" title={gameTitle}>
                            {gameTitle}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center gap-3 mt-1 truncate">
                          <span>File: {filename}</span>
                          <span>•</span>
                          <span>{formatFileSize(blob.size)}</span>
                          <span>•</span>
                          <span>{blob.uploadedAt ? new Date(blob.uploadedAt).toLocaleDateString('vi-VN') : 'Hôm nay'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Toggle Visibility Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(blob.id || blob.url, isHidden)}
                          disabled={togglingId === (blob.id || blob.url)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                            isHidden
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-slate-700'
                          }`}
                          title={isHidden ? "Hiện game lên Thư Viện công khai" : "Ẩn game khỏi Thư Viện (chỉ để test riêng)"}
                        >
                          {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span className="hidden sm:inline">{isHidden ? 'Hiện game' : 'Ẩn game'}</span>
                        </button>

                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(blob.url)}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                          }`}
                          title="Copy Direct URL"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        {/* Test Play Button */}
                        {onPlayRom && (
                          <button
                            type="button"
                            onClick={() => {
                              onPlayRom(blob.url, gameTitle, core);
                              onClose();
                            }}
                            className="p-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg transition-all cursor-pointer"
                            title="Chơi thử game này"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(blob.url, blob.id)}
                          className="p-1.5 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 rounded-lg transition-all cursor-pointer"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Quán Game Xóm Cloud Blob Engine</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
