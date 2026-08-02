import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAdminMode } from '../hooks/useAdminMode';

export const AdminBadge: React.FC = () => {
  const { isAdmin, disableAdmin, toastMessage } = useAdminMode();

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-[#0A0E1A]/95 border border-amber-500/80 shadow-[0_10px_30px_rgba(245,158,11,0.3)] rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-xl">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <span className="text-xs sm:text-sm font-display font-bold text-amber-200">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Floating Admin Mode Indicator Badge (Bottom Right) */}
      {isAdmin && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[90] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={disableAdmin}
            title="Nhấp để thoát quyền Admin"
            className="group flex items-center gap-2 bg-[#090E1D]/95 hover:bg-red-950/90 border border-amber-500/80 hover:border-red-500/80 text-amber-300 hover:text-red-200 rounded-full px-3.5 py-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer backdrop-blur-xl"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 group-hover:bg-red-400"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 group-hover:bg-red-500"></span>
            </span>
            <span className="text-xs font-display font-bold uppercase tracking-wider">
              🔓 Admin Mode
            </span>
            <span className="text-[10px] font-mono text-slate-400 group-hover:text-red-300 border-l border-amber-500/30 group-hover:border-red-500/30 pl-2">
              Click để thoát
            </span>
            <LogOut className="w-3.5 h-3.5 ml-0.5 text-slate-400 group-hover:text-red-300 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </>
  );
};
