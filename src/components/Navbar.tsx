import React, { useState, useEffect } from 'react';
import { UserRole, Member, AppNotification, AuthUser } from '../types';
import { storage } from '../services/storage';
import { BANUARASA_ASSETS, BARA_ASSETS } from '../assets/baraAssets';
import {
  Store,
  LayoutDashboard,
  ShieldCheck,
  Bell,
  ChevronDown,
  UserCheck,
  QrCode,
  LogOut,
  Sparkles,
  Cloud,
  KeyRound,
  RefreshCw,
  CreditCard,
} from 'lucide-react';

interface NavbarProps {
  currentUser: AuthUser | null;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentMember?: Member | null;
  onOpenMemberCard: () => void;
  onOpenQRScanner: () => void;
  onOpenAuthModal?: (mode?: 'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER') => void;
  onOpenGoogleModal?: () => void;
  onOpenSplashIntro?: () => void;
  onOpenChangePassword?: () => void;
  onLogout: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  currentMember,
  onOpenMemberCard,
  onOpenQRScanner,
  onOpenAuthModal,
  onOpenGoogleModal,
  onOpenSplashIntro,
  onOpenChangePassword,
  onLogout,
  onRefresh,
  isRefreshing,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [branding, setBranding] = useState(storage.getBrandingConfig());

  useEffect(() => {
    setNotifications(storage.getNotifications());
    setBranding(storage.getBrandingConfig());
    const unsub = storage.subscribe(() => {
      setNotifications(storage.getNotifications());
      setBranding(storage.getBrandingConfig());
    });
    return unsub;
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      storage.markNotificationsRead();
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN_KOPERASI':
        return 'Admin Koperasi';
      case 'ADMIN_EVENT':
        return 'Admin Event';
      case 'MEMBER':
        return 'Anggota UMKM';
      case 'PUBLIC':
      default:
        return 'Tamu / Pengunjung';
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentRole === 'SUPER_ADMIN';
  const isMember = currentUser?.role === 'MEMBER' && !isSuperAdmin;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Identity */}
        <button
          onClick={() => onTabChange('landing')}
          className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer shrink-0"
          title="Beranda Banuarasa Weekend Market"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-950 shadow-xs group-hover:scale-105 transition-transform shrink-0 p-0.5 flex items-center justify-center">
            <img
              src={branding.logoUrl || BANUARASA_ASSETS.logo}
              alt={branding.logoAlt || 'Logo Resmi Banuarasa'}
              className="w-full h-full object-contain filter drop-shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = BANUARASA_ASSETS.logo;
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black leading-tight tracking-tight text-slate-900">
                BANUARASA <span className="text-emerald-600">WEEKEND MARKET</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 font-bold hidden sm:block truncate max-w-[260px]">
              {branding.tagline || 'Koperasi Berau Melangkah Bersama'}
            </p>
          </div>
        </button>

        {/* Center / Navigation Links (Clean & Dynamic) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-600">
          <button
            onClick={() => onTabChange('landing')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'landing'
                ? 'text-emerald-900 bg-emerald-50 border border-emerald-200 shadow-2xs font-extrabold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Beranda &</span> 64 Stand
          </button>

          {/* Member Area Link (Only when logged in as Member) */}
          {currentUser && isMember && (
            <button
              onClick={() => onTabChange('member-dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'member-dashboard'
                  ? 'text-emerald-900 bg-emerald-50 border border-emerald-200 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dashboard Saya</span>
            </button>
          )}

          {/* Admin Dashboard Link (Only when logged in as Admin) */}
          {currentUser && isSuperAdmin && (
            <button
              onClick={() => onTabChange('admin-dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin-dashboard'
                  ? 'text-purple-900 bg-purple-50 border border-purple-200 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Koperasi</span>
            </button>
          )}
        </nav>

        {/* Right Section: Compact, dynamic controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Real-time Refresh Sync Button */}
          {onRefresh && (
            <button
              id="btn-navbar-refresh-data"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer disabled:opacity-60"
              title="Sinkronkan data terbaru dengan Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* When User is Logged In */}
          {currentUser ? (
            <>
              {/* Quick KTA Digital Button for Member */}
              {isMember && (
                <button
                  onClick={onOpenMemberCard}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>KTA Digital</span>
                </button>
              )}

              {/* QR Scanner for Admin */}
              {isSuperAdmin && (
                <button
                  onClick={onOpenQRScanner}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scan QR</span>
                </button>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={handleToggleNotifications}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
                  title="Pemberitahuan Koperasi"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {/* Dropdown Notifications */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                      <h4 className="text-xs font-bold text-slate-800">Notifikasi Terkini</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {notifications.length} Pesan
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Belum ada notifikasi baru</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-left text-xs"
                          >
                            <p className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  n.type === 'SUCCESS' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              {n.title}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile & Logout */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <img
                    src={
                      currentUser.foto_profil_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500/50"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-black text-slate-900 leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[9px] text-slate-500 font-semibold">{getRoleLabel(currentUser.role)}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                      <p className="text-xs font-black text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.email || currentUser.username}</p>
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 mt-1">
                        {getRoleLabel(currentUser.role)}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      {onOpenChangePassword && (
                        <button
                          onClick={() => {
                            setShowRoleDropdown(false);
                            onOpenChangePassword();
                          }}
                          className="w-full py-2 px-3 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ganti Kata Sandi</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          onLogout();
                        }}
                        className="w-full py-2 px-3 hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Visitor State: Clear and clean Masuk/Daftar button without admin exposure */
            <div className="flex items-center gap-2">
              <button
                id="btn-navbar-auth"
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal('MEMBER_LOGIN');
                  else onTabChange('landing');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Masuk / Daftar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
