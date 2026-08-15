import React, { useState, useEffect } from 'react';
import { 
  X, Upload, Cloud, Copy, Check, Trash2, Play, 
  ExternalLink, FileCode, AlertCircle, RefreshCw, HardDrive, Sparkles 
} from 'lucide-react';
import { useAdminMode } from '../hooks/useAdminMode';

interface BlobItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface AdminRomManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayRom?: (url: string, name: string, core?: string) => void;
}

export const AdminRomManagerModal: React.FC<AdminRomManagerModalProps> = ({
  isOpen,
  onClose,
  onPlayRom
}) => {
  const { isAdmin } = useAdminMode();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Blob List
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [isLoadingBlobs, setIsLoadingBlobs] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(true);

  // Fetch blobs list
  const loadBlobs = async () => {
    setIsLoadingBlobs(true);
    try {
      const res = await fetch('/api/admin/blob/list');
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

  useEffect(() => {
    if (isOpen) {
      loadBlobs();
      setErrorMessage(null);
      setSuccessMessage(null);
      setUploadedUrl(null);
      setSelectedFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
      setSuccessMessage(null);
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Vui lòng chọn 1 file ROM (.sfc, .smc, .nes, .gba, .zip...) từ máy tính.');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Đang đọc dữ liệu file ROM...');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setUploadProgress('Đang tải lên Vercel Blob Storage...');

        try {
          const res = await fetch('/api/admin/blob/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              filename: selectedFile.name,
              fileData: base64Data,
              contentType: selectedFile.type || 'application/octet-stream'
            })
          });

          const result = await res.json();
          if (result.success && result.url) {
            setUploadedUrl(result.url);
            setSuccessMessage(`Tải lên thành công! File: ${selectedFile.name}`);
            setSelectedFile(null);
            loadBlobs();
          } else {
            setErrorMessage(result.error || result.hint || 'Không thể upload file lên Vercel Blob.');
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

  const handleDelete = async (url: string) => {
    if (!confirm('Bạn có chắc muốn xóa file ROM này khỏi Vercel Blob?')) return;

    try {
      const res = await fetch('/api/admin/blob/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.success) {
        setBlobs(blobs.filter(b => b.url !== url));
        if (uploadedUrl === url) setUploadedUrl(null);
      } else {
        alert(data.error || 'Lỗi khi xóa file.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const detectCore = (name: string): string => {
    const l = name.toLowerCase();
    if (l.endsWith('.sfc') || l.endsWith('.smc') || l.endsWith('.snes')) return 'snes';
    if (l.endsWith('.nes')) return 'nes';
    if (l.endsWith('.gba')) return 'gba';
    if (l.endsWith('.gbc') || l.endsWith('.gb')) return 'gbc';
    if (l.endsWith('.n64') || l.endsWith('.z64')) return 'n64';
    if (l.endsWith('.nds')) return 'nds';
    if (l.endsWith('.md') || l.endsWith('.gen')) return 'segaMD';
    if (l.endsWith('.iso') || l.endsWith('.cue')) return 'psx';
    return 'snes';
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
                <span className="text-amber-400 text-glow-amber">VERCEL BLOB</span>
              </h2>
              <p className="text-xs text-slate-400 font-body">
                Lưu trữ ROM công khai, tốc độ cao, direct URL ổn định cho EmulatorJS.
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
                <span>Để upload file lên Vercel Blob Storage, hãy chắc chắn bạn đã gán biến môi trường <code>BLOB_READ_WRITE_TOKEN</code> trong Vercel Project Settings.</span>
              </div>
            </div>
          )}

          {/* Section 1: Upload Zone */}
          <div className="p-5 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>1. Chọn file ROM từ máy tính:</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                (.smc, .sfc, .nes, .gba, .gbc, .zip)
              </span>
            </div>

            {/* Drag & Drop / Input area */}
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 text-center transition-colors bg-slate-900/40">
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
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <HardDrive className="w-6 h-6" />
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
                      Dung lượng hỗ trợ lên đến 50MB
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Upload Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-xl cursor-pointer"
                >
                  Bỏ chọn
                </button>
              )}
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
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
                    <span>TẢI LÊN VERCEL BLOB</span>
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

            {/* Success Upload Box with Copy Link */}
            {uploadedUrl && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>URL CÔNG KHAI ĐÃ TẠO THÀNH CÔNG:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">Tải trực tiếp 100% không qua proxy</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30">
                  <input
                    type="text"
                    readOnly
                    value={uploadedUrl}
                    className="flex-1 bg-transparent text-xs font-mono text-emerald-200 outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(uploadedUrl)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {copiedUrl === uploadedUrl ? (
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

                <div className="flex items-center justify-between text-[11px] font-body text-slate-300 pt-1">
                  <span>👉 Dán link trên vào cột <strong>romUrl</strong> trong Google Sheet của bạn.</span>
                  {onPlayRom && (
                    <button
                      type="button"
                      onClick={() => {
                        const core = detectCore(uploadedUrl);
                        onPlayRom(uploadedUrl, 'Test Vercel Blob ROM', core);
                        onClose();
                      }}
                      className="text-amber-400 hover:text-amber-300 font-mono font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-amber-400" />
                      <span>Chơi thử ngay</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Uploaded ROMs on Vercel Blob */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span>2. Danh sách ROM đã lưu trên Vercel Blob ({blobs.length})</span>
              </span>

              <button
                type="button"
                onClick={loadBlobs}
                disabled={isLoadingBlobs}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingBlobs ? 'animate-spin' : ''}`} />
                <span>Làm mới danh sách</span>
              </button>
            </div>

            {blobs.length === 0 ? (
              <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-center text-xs font-body text-slate-500">
                {isLoadingBlobs ? 'Đang tải danh sách...' : 'Chưa có file ROM nào trên Vercel Blob. Hãy upload file đầu tiên ở trên!'}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {blobs.map((blob, idx) => {
                  const filename = blob.pathname.replace(/^roms\//, '');
                  const isCopied = copiedUrl === blob.url;
                  const core = detectCore(filename);

                  return (
                    <div 
                      key={blob.url || idx}
                      className="p-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl flex items-center justify-between gap-3 transition-colors text-xs font-mono"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold shrink-0">
                            {core}
                          </span>
                          <span className="text-white font-bold truncate" title={filename}>
                            {filename}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-3 mt-1">
                          <span>{formatFileSize(blob.size)}</span>
                          <span>•</span>
                          <span>{new Date(blob.uploadedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(blob.url)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                          }`}
                          title="Copy Direct URL"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        {/* Test Play Button */}
                        {onPlayRom && (
                          <button
                            type="button"
                            onClick={() => {
                              onPlayRom(blob.url, filename.replace(/\.[^/.]+$/, ''), core);
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
                          onClick={() => handleDelete(blob.url)}
                          className="p-1.5 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 rounded-lg transition-all cursor-pointer"
                          title="Xóa khỏi Vercel Blob"
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
          <span>Khu vực Admin Quán Game Xóm</span>
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
