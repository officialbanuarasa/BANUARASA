import React, { useState, useEffect } from 'react';
import { UserRole, Member, AppNotification, AuthUser } from '../types';
import { storage } from '../services/storage';
import { BANUARASA_ASSETS, BARA_ASSETS } from '../assets/baraAssets';
import {
  Store,
  Calendar,
  Wallet,
  LayoutDashboard,
  ShieldCheck,
  Bell,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  QrCode,
  LogOut,
  ExternalLink,
  Sparkles,
  Lock,
  Cloud,
  FileSpreadsheet,
  Smile,
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
  onLogout: () => void;
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
  onLogout,
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
        return 'Super Admin Koperasi';
      case 'ADMIN_KOPERASI':
        return 'Admin Koperasi';
      case 'ADMIN_EVENT':
        return 'Admin Event Banuarasa';
      case 'MEMBER':
        return 'Anggota UMKM';
      case 'PUBLIC':
        return 'Belum Masuk (Tamu)';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN_KOPERASI':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ADMIN_EVENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEMBER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex flex-col md:flex-row justify-between items-center shrink-0 gap-3 z-30 relative shadow-xs">
      {/* Brand Identity: Official Banua Rasa Weekend Market Logo */}
      <div className="flex items-center justify-between w-full md:w-auto gap-3">
        <button
          onClick={() => onTabChange('landing')}
          className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
          title="Beranda Banua Rasa Weekend Market"
        >
          {/* Official Logo Emblem */}
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-950 shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform shrink-0 p-0.5 flex items-center justify-center">
            <img
              src={branding.logoUrl || BANUARASA_ASSETS.logo}
              alt={branding.logoAlt || 'Logo Resmi Banua Rasa Weekend Market'}
              className="w-full h-full object-contain filter drop-shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = BANUARASA_ASSETS.logo;
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black leading-tight tracking-tight text-slate-900">
                BANUARASA <span className="text-emerald-600">WEEKEND MARKET</span>
              </h1>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-black rounded-md border border-amber-300">
                Wisata Gastronomi
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
              <span className="text-emerald-700 font-extrabold">"{branding.tagline || 'Rasa Lokal, Cerita Global'}"</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
              <span className="truncate">Koperasi Berau Melangkah Bersama</span>
            </p>
          </div>
        </button>

        {/* Mobile quick icons */}
        <div className="flex items-center gap-2 md:hidden">
          {onOpenSplashIntro && (
            <button
              onClick={onOpenSplashIntro}
              className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200"
              title="Sambutan Maskot Bara"
            >
              <Smile className="w-4 h-4 text-amber-600" />
            </button>
          )}
          {currentUser && currentRole === 'MEMBER' && (
            <button
              onClick={onOpenMemberCard}
              className="p-2 bg-slate-100 rounded-lg text-slate-700"
              title="Digital Member Card"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
          {currentUser && (
            <button
              onClick={handleToggleNotifications}
              className="p-2 bg-slate-100 rounded-lg text-slate-700 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Nav Navigation */}
      <nav className="flex items-center gap-1 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-600 overflow-x-auto max-w-full pb-1 md:pb-0">
        <button
          onClick={() => onTabChange('landing')}
          className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'landing'
              ? 'text-emerald-800 bg-emerald-50 font-bold border border-emerald-200 shadow-xs'
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Store className="w-4 h-4 text-emerald-600" />
          <span>{currentUser ? 'Beranda' : 'Portal Masuk & Registrasi'}</span>
        </button>

        {currentUser && currentRole === 'MEMBER' && (
          <>
            <button
              onClick={() => onTabChange('member-dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'member-dashboard'
                  ? 'text-emerald-800 bg-emerald-50 font-bold border border-emerald-200 shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>Member Area</span>
            </button>
          </>
        )}

        {currentUser &&
          (currentRole === 'SUPER_ADMIN' ||
            currentRole === 'ADMIN_KOPERASI' ||
            currentRole === 'ADMIN_EVENT') && (
            <button
              onClick={() => onTabChange('admin-dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'admin-dashboard'
                  ? 'text-purple-900 bg-purple-50 font-bold border border-purple-200 shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Admin Dashboard</span>
            </button>
          )}
      </nav>

      {/* Right Controls: Sambutan Maskot, Google Workspace Hub, QR Check-in, Notifications, Role Switcher, & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Sambutan Maskot Bara Splash Intro Trigger */}
        {onOpenSplashIntro && (
          <button
            id="btn-navbar-sambutan-bara"
            onClick={onOpenSplashIntro}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Sambutan & Intro Maskot Bara"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-amber-500">
              <img
                src={BARA_ASSETS.mascot}
                alt="Bara"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden xl:inline">Sambutan Bara</span>
          </button>
        )}

        {/* Google Workspace Cloud Sync Hub Button */}
        {onOpenGoogleModal && (
          <button
            id="btn-navbar-google-sync"
            onClick={onOpenGoogleModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Google Sheets & Drive Hub"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Google Workspace</span>
          </button>
        )}

        {currentUser ? (
          <>
            {/* Check-In Scanner button for Admins */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN_EVENT') && (
              <button
                onClick={onOpenQRScanner}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scan QR</span>
              </button>
            )}

            {/* Member Digital Card button */}
            {currentRole === 'MEMBER' && (
              <button
                onClick={onOpenMemberCard}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>KTA Digital</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative hidden md:block">
              <button
                onClick={handleToggleNotifications}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors"
                title="Pemberitahuan"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-rose-500 text-white font-bold text-[10px] rounded-full ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">Notifikasi Koperasi</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {notifications.length} Pesan
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Tersinkron Realtime</span>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">Tidak ada notifikasi baru</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  n.type === 'SUCCESS'
                                    ? 'bg-emerald-500'
                                    : n.type === 'ALERT'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                                }`}
                              ></span>
                              {n.title}
                            </p>
                            <span className="text-[9px] text-slate-400 whitespace-nowrap">
                              {new Date(n.timestamp).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Widget with Logout */}
            <div className="relative pl-3 border-l border-slate-200">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1.5">
                    <p className="text-xs font-black text-slate-900">
                      {currentUser.name}
                    </p>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-transform" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {currentUser.role === 'MEMBER'
                      ? `ID: ${currentUser.member_id || '-'} • ${currentUser.nama_usaha || 'UMKM'}`
                      : 'Super Admin Koperasi'}
                  </p>
                </div>
                <div className="relative">
                  <img
                    src={
                      currentUser.foto_profil_url ||
                      (currentUser.role === 'MEMBER'
                        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80')
                    }
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-emerald-600/30"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-600' : 'bg-emerald-500'
                    }`}
                  ></span>
                </div>
              </button>

              {/* Role & Logout Dropdown */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Akun Masuk
                    </p>
                    <p className="text-xs font-black text-slate-900">{currentUser.name}</p>
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mt-1 ${getRoleBadgeColor(
                        currentUser.role
                      )}`}
                    >
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                    Ganti Akun Cepat (Demo Switcher)
                  </p>
                  <div className="space-y-1 mb-2">
                    <button
                      onClick={() => {
                        const demoMembers = storage.getMembers();
                        const demoMember = demoMembers[0];
                        if (demoMember) {
                          const authM: AuthUser = {
                            id: demoMember.member_id,
                            username: demoMember.email,
                            name: demoMember.nama_lengkap,
                            role: 'MEMBER',
                            member_id: demoMember.member_id,
                            email: demoMember.email,
                            foto_profil_url: demoMember.foto_profil_url,
                            nomor_anggota: demoMember.nomor_anggota,
                            nama_usaha: demoMember.nama_usaha,
                          };
                          storage.setCurrentUser(authM);
                          onRoleChange('MEMBER');
                          onTabChange('member-dashboard');
                        }
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        currentUser.role === 'MEMBER'
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold">Ahmad Zulkarnain</p>
                        <p className="text-[10px] text-slate-500">Anggota UMKM (BM-00241)</p>
                      </div>
                      {currentUser.role === 'MEMBER' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        const adminUser: AuthUser = {
                          id: 'ADM-SUPER',
                          username: 'superadmin',
                          name: 'Super Admin Koperasi Berau',
                          role: 'SUPER_ADMIN',
                          email: 'admin@koperasiberau.id',
                        };
                        storage.setCurrentUser(adminUser);
                        onRoleChange('SUPER_ADMIN');
                        onTabChange('admin-dashboard');
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        currentUser.role === 'SUPER_ADMIN'
                          ? 'bg-purple-50 text-purple-900 border border-purple-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold">Super Admin</p>
                        <p className="text-[10px] text-slate-500">Otoritas Penuh & Hapus Data</p>
                      </div>
                      {currentUser.role === 'SUPER_ADMIN' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      )}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      id="btn-navbar-logout"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
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
          <div className="flex items-center gap-2">
            <button
              id="btn-navbar-auth"
              onClick={() => {
                if (onOpenAuthModal) {
                  onOpenAuthModal('MEMBER_LOGIN');
                } else {
                  onTabChange('landing');
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Masuk / Daftar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
