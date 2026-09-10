import React from 'react';
import { BARA_ASSETS } from '../assets/baraAssets';
import { Megaphone, Sparkles } from 'lucide-react';

interface BaraMascotWidgetProps {
  onOpenNoticeBoard?: () => void;
  onOpenAuthModal?: (mode: 'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER') => void;
  onExploreStands?: () => void;
  onOpenSplashIntro?: () => void;
}

export const BaraMascotWidget: React.FC<BaraMascotWidgetProps> = ({
  onOpenNoticeBoard,
  onOpenSplashIntro,
}) => {
  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-auto">
      {/* Floating Bara Mascot Button Avatar - Direct to Papan Pemberitahuan */}
      <button
        id="btn-floating-bara-mascot"
        type="button"
        onClick={() => {
          if (onOpenNoticeBoard) {
            onOpenNoticeBoard();
          } else if (onOpenSplashIntro) {
            onOpenSplashIntro();
          }
        }}
        className="group relative flex items-center gap-2.5 bg-slate-900 hover:bg-slate-950 text-white pl-2 pr-4 py-2 rounded-full border-2 border-amber-400 shadow-2xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Buka Papan Pemberitahuan Resmi Bara"
      >
        <span className="relative flex h-10 w-10 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30" />
          <img
            src={BARA_ASSETS.mascot}
            alt="Bara Mascot"
            className="relative inline-flex rounded-full h-10 w-10 object-cover border border-amber-300 ring-2 ring-emerald-500/50"
          />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-black ring-2 ring-white">
            <Megaphone className="w-2.5 h-2.5" />
          </span>
        </span>

        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-amber-300 tracking-wide">PAPAN BARA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-300 font-bold leading-none">
            Pemberitahuan Resmi
          </p>
        </div>
      </button>
    </div>
  );
};
