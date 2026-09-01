import React, { useState } from 'react';
import { BANUARASA_ASSETS, BARA_ASSETS } from '../assets/baraAssets';
import { storage } from '../services/storage';
import {
  X,
  Sparkles,
  Store,
  Compass,
  UserCheck,
  CheckCircle2,
  Volume2,
  ArrowRight,
  Heart,
} from 'lucide-react';

interface SplashIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenAuthModal?: (mode?: 'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER') => void;
  onOpenStandMap?: () => void;
}

export const SplashIntroModal: React.FC<SplashIntroModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenAuthModal,
  onOpenStandMap,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [activeVoiceSnippet, setActiveVoiceSnippet] = useState(0);
  const branding = storage.getBrandingConfig();

  if (!isOpen) return null;

  const voiceLines = [
    'Halo kando & dinda! Saya BARA, maskot resmi Banuarasa. Selamat datang di pusat wisata gastronomi terpadu Tepian Teratai Kabupaten Berau!',
    'Nikmati 64 stand kuliner autentik & kriya binaan Koperasi Berau Melangkah Bersama dengan pembayaran QRIS terintegrasi!',
    'Mari lestarikan kuliner tradisional Dayak, Banua, & Bajau Berau lewat konsep Rasa Lokal, Cerita Global!',
  ];

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('banuarasa_splash_dismissed', 'true');
      } catch (e) {
        // ignore
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow ornaments */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-600/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 z-20"
          title="Tutup Sambutan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Wisata Gastronomi Terpadu Kab. Berau</span>
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
            <span>Tepian Teratai • 64 Stand Mingguan</span>
          </div>
        </div>

        {/* Main Content Grid: Logo + Mascot Presentation */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10 my-2">
          {/* Left Column: Official Banua Rasa Logo Emblem (5 cols) */}
          <div className="sm:col-span-5 flex flex-col items-center text-center space-y-3">
            <div className="relative group">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-amber-400 bg-slate-950/80 shadow-2xl p-1.5 flex items-center justify-center">
                <img
                  src={branding.logoUrl || BANUARASA_ASSETS.logo}
                  alt={branding.logoAlt || 'Official Banua Rasa Weekend Market Logo'}
                  className="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = BANUARASA_ASSETS.logo;
                  }}
                />
              </div>
              <div className="absolute -bottom-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                Logo Resmi
              </div>
            </div>

            <div className="pt-1">
              <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                BANUARASA
              </h2>
              <p className="text-xs font-black text-amber-400 tracking-wider">
                WEEKEND MARKET
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Koperasi Berau Melangkah Bersama
              </p>
            </div>
          </div>

          {/* Right Column: Mascot Bara Character & Speech (7 cols) */}
          <div className="sm:col-span-7 space-y-4">
            {/* Mascot Greeting Speech Bubble */}
            <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-4 relative shadow-lg">
              <div className="flex items-start gap-3">
                {/* Mascot Icon Thumbnail */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-amber-400 bg-emerald-950 shadow-md">
                  <img
                    src={branding.mascotUrl || BARA_ASSETS.mascot}
                    alt="Bara Maskot Banuarasa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = BARA_ASSETS.mascot;
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-amber-400 border-2 border-slate-900 rounded-full"></span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300">
                      BARA (Maskot Resmi)
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-bold">
                      Si Kerang Berau
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{voiceLines[activeVoiceSnippet]}"
                  </p>
                </div>
              </div>

              {/* Voice line cycle button */}
              <div className="flex justify-end gap-1.5 mt-2 pt-2 border-t border-slate-700/60">
                <button
                  onClick={() =>
                    setActiveVoiceSnippet((prev) => (prev + 1) % voiceLines.length)
                  }
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Ganti Pesan Sambutan</span>
                </button>
              </div>
            </div>

            {/* Quick Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-200">64 Stand Terdaftar</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-slate-200">Wisata Gastronomi</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="font-bold text-slate-200">QRIS & Sync Cloud</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-bold text-slate-200">UMKM Binaan Berau</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded-md border-slate-700 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Jangan tampilkan otomatis lagi di sesi ini</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenAuthModal && (
              <button
                onClick={() => {
                  handleClose();
                  onOpenAuthModal('REGISTER');
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 justify-center cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Daftar UMKM</span>
              </button>
            )}

            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 justify-center cursor-pointer"
            >
              <span>Mulai Jelajahi Pasar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
