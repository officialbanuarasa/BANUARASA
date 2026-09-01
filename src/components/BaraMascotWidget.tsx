import React, { useState } from 'react';
import { BARA_ASSETS } from '../assets/baraAssets';
import { Sparkles, MessageCircle, X, ChevronRight, Store, Heart, Award, HelpCircle, Smile } from 'lucide-react';

interface BaraMascotWidgetProps {
  onOpenAuthModal?: (mode: 'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER') => void;
  onExploreStands?: () => void;
  onOpenSplashIntro?: () => void;
}

export const BaraMascotWidget: React.FC<BaraMascotWidgetProps> = ({
  onOpenAuthModal,
  onExploreStands,
  onOpenSplashIntro,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  const nextFact = () => {
    setFactIndex((prev) => (prev + 1) % BARA_ASSETS.funFacts.length);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
      {/* Expanded Interactive Mascot Chat Balloon */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-5 border-2 border-amber-500/40 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-amber-400 bg-emerald-950 shrink-0 shadow-md">
                <img
                  src={BARA_ASSETS.mascot}
                  alt="Maskot Bara"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-amber-300">BARA</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold border border-emerald-500/30">
                    Maskot Resmi
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Si Kerang Laut Kalimantan Timur
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Speech Message Bubble */}
          <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-3.5 relative text-xs text-slate-200 leading-relaxed">
            <p className="font-medium">
              "{BARA_ASSETS.funFacts[factIndex]}"
            </p>
            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-emerald-900/60 text-[11px]">
              <button
                onClick={nextFact}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cerita Lainnya</span>
              </button>
              <span className="text-slate-400 text-[10px]">
                {factIndex + 1} dari {BARA_ASSETS.funFacts.length}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {onOpenSplashIntro && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSplashIntro();
                }}
                className="col-span-2 p-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Buka Sambutan Intro Resmi</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenAuthModal) onOpenAuthModal('MEMBER_LOGIN');
              }}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Sewa 64 Stand</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenAuthModal) onOpenAuthModal('REGISTER');
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Daftar UMKM</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bara Button Avatar with Pulse */}
      <button
        id="btn-floating-bara-mascot"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-slate-900 hover:bg-slate-950 text-white pl-2 pr-4 py-2 rounded-full border-2 border-amber-400/80 shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
        title="Bicara dengan Bara (Maskot Banuarasa)"
      >
        <span className="relative flex h-10 w-10 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30"></span>
          <img
            src={BARA_ASSETS.mascot}
            alt="Bara Mascot"
            className="relative inline-flex rounded-full h-10 w-10 object-cover border border-amber-300 ring-2 ring-emerald-500/50"
          />
        </span>

        <div className="text-left">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-amber-300 tracking-wide">BARA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-300 font-bold leading-none">
            {isOpen ? 'Tutup Dialog' : 'Hai, Kenalan Yuk!'}
          </p>
        </div>
      </button>
    </div>
  );
};

