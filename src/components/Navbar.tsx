import React from 'react';
import { AuthSession, Member } from '../types';

interface NavbarProps {
  session: AuthSession | null;
  currentMember: Member | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateMember: () => void;
  onNavigateAdmin: () => void;
  onOpenGoogleWorkspace: () => void;
  onOpenRegisterMember: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  currentMember,
  onOpenAuth,
  onLogout,
  onNavigateHome,
  onNavigateMember,
  onNavigateAdmin,
  onOpenGoogleWorkspace,
  onOpenRegisterMember
}) => {
  const isAdmin = session && ['SUPER_ADMIN', 'ADMIN_KOPERASI', 'ADMIN_EVENT'].includes(session.user.role);
  const isMember = session?.user?.role === 'MEMBER';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Nama Platform */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-sm">
              B
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                BANUARASA
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase block">
                Weekend Market • Berau
              </span>
            </div>
          </div>

          {/* Navigasi Menu Tengah */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <button
              onClick={onNavigateHome}
              className="px-3.5 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Beranda
            </button>

            {isMember && (
              <button
                onClick={onNavigateMember}
                className="px-3.5 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                Dashboard Anggota
              </button>
            )}

            {isAdmin && (
              <button
                onClick={onNavigateAdmin}
                className="px-3.5 py-2 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
              >
                Pusat Kendali Admin
              </button>
            )}

            <button
              onClick={onOpenGoogleWorkspace}
              className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <span>📊</span>
              <span>Integrasi Spreadsheet</span>
            </button>
          </nav>

          {/* Tombol Aksi / Auth Kanan */}
          <div className="flex items-center gap-2.5">
            {!session ? (
              <>
                <button
                  onClick={onOpenRegisterMember}
                  className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-emerald-200"
                >
                  Daftar Anggota
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition"
                >
                  Masuk Akun
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800">
                    {currentMember?.nama_lengkap || session.user.nama_lengkap || session.user.username}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600">
                    {session.user.role}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
