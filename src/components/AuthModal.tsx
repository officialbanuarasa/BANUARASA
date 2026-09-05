import React, { useState } from 'react';
import { AuthSession, Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
  onOpenRegister?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleSelection, setRoleSelection] = useState<Role>('SUPER_ADMIN');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Username/Email dan kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);

    // Kredensial Resmi Banuarasa v2
    setTimeout(() => {
      let matchedSession: AuthSession | null = null;

      // 1. Super Admin
      if (
        (cleanUser === 'superadmin' || cleanUser === 'admin') &&
        (cleanPass === 'Banu@rasa2026!' || cleanPass === 'admin123' || cleanPass === 'admin')
      ) {
        matchedSession = {
          token: `TOKEN-${Date.now()}-SUPERADMIN`,
          user: {
            user_id: 'USR-SUPERADMIN',
            username: 'superadmin',
            role: 'SUPER_ADMIN',
            nama_lengkap: 'Super Administrator Banuarasa'
          }
        };
      }
      // 2. Admin Koperasi
      else if (
        (cleanUser === 'adminkoperasi' || cleanUser === 'koperasi') &&
        (cleanPass === 'KoperasiBwm#2026' || cleanPass === 'koperasi123')
      ) {
        matchedSession = {
          token: `TOKEN-${Date.now()}-KOPERASI`,
          user: {
            user_id: 'USR-ADM-KOP',
            username: 'adminkoperasi',
            role: 'ADMIN_KOPERASI',
            nama_lengkap: 'Pengurus Koperasi Banuarasa'
          }
        };
      }
      // 3. Admin Event
      else if (
        (cleanUser === 'adminevent' || cleanUser === 'event') &&
        (cleanPass === 'EventBwm#2026' || cleanPass === 'event123')
      ) {
        matchedSession = {
          token: `TOKEN-${Date.now()}-EVENT`,
          user: {
            user_id: 'USR-ADM-EVT',
            username: 'adminevent',
            role: 'ADMIN_EVENT',
            nama_lengkap: 'Panitia Pelaksana Event'
          }
        };
      }
      // 4. Akun Member UMKM
      else if (cleanUser.startsWith('mbr-') || roleSelection === 'MEMBER') {
        matchedSession = {
          token: `TOKEN-${Date.now()}-MEMBER`,
          user: {
            user_id: `USR-${cleanUser}`,
            member_id: cleanUser.toUpperCase(),
            username: cleanUser,
            role: 'MEMBER',
            nama_lengkap: `Anggota ${cleanUser.toUpperCase()}`
          }
        };
      }

      setIsLoading(false);

      if (matchedSession) {
        onLoginSuccess(matchedSession);
      } else {
        setErrorMessage('Username atau kata sandi tidak cocok. Silakan periksa kembali.');
      }
    }, 200);
  };

  // Shortcut untuk mengisi akun demo otomatis
  const fillQuickCredential = (role: Role) => {
    setRoleSelection(role);
    setErrorMessage('');
    if (role === 'SUPER_ADMIN') {
      setUsername('superadmin');
      setPassword('Banu@rasa2026!');
    } else if (role === 'ADMIN_KOPERASI') {
      setUsername('adminkoperasi');
      setPassword('KoperasiBwm#2026');
    } else if (role === 'ADMIN_EVENT') {
      setUsername('adminevent');
      setPassword('EventBwm#2026');
    } else {
      setUsername('MBR-0001');
      setPassword('member123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Masuk ke Banuarasa</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pilih peran dan masukkan kredensial akses Anda</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Role Shortcut */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold text-slate-600">
          {[
            { role: 'SUPER_ADMIN', label: 'Super' },
            { role: 'ADMIN_KOPERASI', label: 'Koperasi' },
            { role: 'ADMIN_EVENT', label: 'Event' },
            { role: 'MEMBER', label: 'Member' },
          ].map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => fillQuickCredential(item.role as Role)}
              className={`py-1.5 rounded-lg transition ${
                roleSelection === item.role
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Notifikasi Kesalahan */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Username / ID Anggota
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: superadmin atau MBR-0001"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-emerald-500 bg-slate-50/50 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              placeholder="Masukkan kata sandi akun"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-emerald-500 bg-slate-50/50 focus:bg-white transition"
            />
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* Informasi Bantuan Kredensial Default */}
        <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">Kredensial Default Terkonfigurasi:</p>
          <p>• <strong>Super Admin:</strong> <code>superadmin</code> / <code>Banu@rasa2026!</code> (atau <code>admin123</code>)</p>
          <p>• <strong>Admin Koperasi:</strong> <code>adminkoperasi</code> / <code>KoperasiBwm#2026</code></p>
          <p>• <strong>Admin Event:</strong> <code>adminevent</code> / <code>EventBwm#2026</code></p>
        </div>

        {onOpenRegister && (
          <div className="mt-4 text-center text-xs text-slate-500">
            Belum punya akun UMKM?{' '}
            <button
              type="button"
              onClick={onOpenRegister}
              className="font-bold text-emerald-600 hover:underline"
            >
              Daftar Anggota Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
