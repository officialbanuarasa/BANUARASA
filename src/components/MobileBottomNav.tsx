import React, { useState } from 'react';
import { AuthUser, UserRole, Member } from '../types';
import { BARA_ASSETS } from '../assets/baraAssets';
import { storage } from '../services/storage';
import {
  Store,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  QrCode,
  CreditCard,
  RefreshCw,
  KeyRound,
  LogOut,
  SlidersHorizontal,
  Smile,
  X,
  Megaphone,
  Sparkles,
  Phone,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentUser: AuthUser | null;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  currentMember?: Member | null;
  onOpenNoticeBoard: () => void;
  onOpenMemberCard: () => void;
  onOpenQRScanner: () => void;
  onOpenBarcodeModal: (member?: Member | null) => void;
  onOpenAuthModal: (mode: 'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER') => void;
  onOpenSplashIntro: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentUser,
  activeTab,
  onNavigateTab,
  currentMember,
  onOpenNoticeBoard,
  onOpenMemberCard,
  onOpenQRScanner,
  onOpenBarcodeModal,
  onOpenAuthModal,
  onOpenSplashIntro,
  onOpenChangePassword,
  onLogout,
  onRefresh,
  isRefreshing,
}) => {
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN_KOPERASI' || currentUser?.role === 'ADMIN_EVENT';
  const isAdminEvent = currentUser?.role === 'ADMIN_EVENT';
  const isMember = currentUser?.role === 'MEMBER';

  return (
    <>
      {/* Pop-up Quick Action Dropdown Menu / Bottom Sheet */}
      {isQuickMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsQuickMenuOpen(false)}
          />

          <div className="relative bg-white rounded-t-3xl border-t-2 border-amber-400 p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto z-10 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Menu & Layanan Cepat</h4>
                  <p className="text-[10px] text-slate-500">Akses ringkas fitur Banuarasa tanpa scrolling</p>
                </div>
              </div>

              <button
                onClick={() => setIsQuickMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Papan Bara */}
              <button
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onOpenNoticeBoard();
                }}
                className="col-span-2 p-3 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl flex items-center gap-3 border border-amber-400/80 shadow-xs cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-400 shrink-0 bg-slate-900">
                  <img src={BARA_ASSETS.mascot} alt="Bara" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="font-black text-amber-300 block truncate">Papan Pemberitahuan Bara</span>
                  <span className="text-[10px] text-slate-300 block truncate">Maklumat resmi & kebijakan koperasi</span>
                </div>
              </button>

              {/* Barcode KTA — hanya anggota */}
              {isMember && <button
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onOpenBarcodeModal(currentMember);
                }}
                className="p-3 bg-slate-50 hover:bg-amber-50 text-slate-800 border border-slate-200 hover:border-amber-300 rounded-2xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
              >
                <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Barcode KTA</p>
                  <p className="text-[10px] text-slate-500">Generator & Cek Stand</p>
                </div>
              </button>}

              {/* Scan QR untuk Admin Event / Super Admin */}
              {(isSuperAdmin || isAdminEvent) && (
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenQRScanner();
                  }}
                  className="p-3 bg-slate-900 text-white rounded-2xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                >
                  <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-xs">Scan Check-In</p>
                    <p className="text-[10px] text-emerald-300">Verifikasi QR Anggota</p>
                  </div>
                </button>
              )}

              {/* KTA Digital for Member */}
              {isMember && (
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenMemberCard();
                  }}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                >
                  <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-bold text-xs">KTA Digital</p>
                    <p className="text-[10px] text-emerald-700">Kartu Tanda Anggota</p>
                  </div>
                </button>
              )}

              {/* Real-time Refresh Sync */}
              {onRefresh && (
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onRefresh();
                  }}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-800 border border-slate-200 rounded-2xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                >
                  <RefreshCw className={`w-4 h-4 text-emerald-600 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <div>
                    <p className="font-bold text-xs">Sinkron Data</p>
                    <p className="text-[10px] text-slate-500">Google Spreadsheet</p>
                  </div>
                </button>
              )}

              {/* Sambutan Intro Resmi */}
              <button
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onOpenSplashIntro();
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
              >
                <Smile className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Intro Sambutan</p>
                  <p className="text-[10px] text-slate-500">Kenalan dengan Bara</p>
                </div>
              </button>

              {/* Ganti Sandi */}
              {currentUser && (
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenChangePassword();
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                >
                  <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-xs">Ganti Sandi</p>
                    <p className="text-[10px] text-slate-500">Keamanan Akun</p>
                  </div>
                </button>
              )}

              {/* Bersihkan Cache & Sinkron */}
              <button
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  storage.purgeDeviceCookiesAndCache();
                  if (onRefresh) onRefresh();
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl flex items-center gap-2.5 transition-colors cursor-pointer text-left"
              >
                <RefreshCw className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Bersihkan Cache</p>
                  <p className="text-[10px] text-slate-500">Refresh Data HP</p>
                </div>
              </button>
            </div>

            {/* Bottom Session Action */}
            <div className="pt-2 border-t border-slate-100">
              {currentUser ? (
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun ({currentUser.name})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenAuthModal('MEMBER_LOGIN');
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Masuk / Daftar Akun UMKM</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile/Tablet Bottom Navigation Bar */}
      <nav
        id="mobile-tablet-bottom-navbar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xl px-2 py-1.5 lg:hidden flex items-center justify-around"
      >
        {/* 1. Beranda & Stand */}
        <button
          onClick={() => onNavigateTab('landing')}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'landing'
              ? 'text-emerald-700 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className={`w-5 h-5 ${activeTab === 'landing' ? 'text-emerald-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 leading-none">Stand</span>
        </button>

        {/* 2. ICON BARA (Directly to Papan Pemberitahuan) */}
        <button
          id="btn-mobile-nav-bara-notice"
          onClick={onOpenNoticeBoard}
          className="group relative flex flex-col items-center justify-center -mt-4 cursor-pointer focus:outline-hidden"
          title="Buka Papan Pemberitahuan Resmi Bara"
        >
          <div className="relative w-12 h-12 rounded-full border-2 border-amber-400 bg-slate-900 shadow-lg shadow-amber-500/25 p-0.5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30" />
            <img
              src={BARA_ASSETS.mascot}
              alt="Bara Papan Info"
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-black ring-2 ring-white">
              <Megaphone className="w-2.5 h-2.5" />
            </span>
          </div>
          <span className="text-[10px] font-black text-amber-800 mt-1 leading-none tracking-tight">
            Papan Bara
          </span>
        </button>

        {/* 3. Dashboard / Akun */}
        {currentUser ? (
          isAdmin ? (
            <button
              onClick={() => onNavigateTab('admin-dashboard')}
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
                activeTab === 'admin-dashboard'
                  ? 'text-purple-700 font-black scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck
                className={`w-5 h-5 ${activeTab === 'admin-dashboard' ? 'text-purple-600 stroke-[2.5]' : ''}`}
              />
              <span className="text-[10px] mt-0.5 leading-none">Admin</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('member-dashboard')}
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
                activeTab === 'member-dashboard'
                  ? 'text-emerald-700 font-black scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard
                className={`w-5 h-5 ${activeTab === 'member-dashboard' ? 'text-emerald-600 stroke-[2.5]' : ''}`}
              />
              <span className="text-[10px] mt-0.5 leading-none">Dashboard</span>
            </button>
          )
        ) : (
          <button
            onClick={() => onOpenAuthModal('MEMBER_LOGIN')}
            className="flex flex-col items-center justify-center w-16 py-1 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] mt-0.5 leading-none">Masuk</span>
          </button>
        )}

        {/* 4. Menu Cepat (Dropdown Bottom Sheet) */}
        <button
          onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
            isQuickMenuOpen ? 'text-slate-900 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-none">Menu</span>
        </button>
      </nav>
    </>
  );
};
