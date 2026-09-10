import React, { useEffect, useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onOpenRegister?: () => void;
  initialMode?: 'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister,
  initialMode = 'MEMBER_LOGIN'
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleSelection, setRoleSelection] = useState<UserRole>('SUPER_ADMIN');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialMode === 'REGISTER') {
      onOpenRegister?.();
      return;
    }
    if (initialMode === 'ADMIN_LOGIN') setRoleSelection('SUPER_ADMIN');
    else setRoleSelection('MEMBER');
  }, [isOpen, initialMode, onOpenRegister]);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Username/Email dan kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = storage.login(cleanUser, cleanPass);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message || 'Username atau kata sandi tidak cocok.');
      }
    }, 100);
  };

  // Pemilihan peran hanya mengatur konteks login.
  // Jangan pernah mengisi atau menampilkan username/password admin di UI publik.
  const selectRole = (role: UserRole) => {
    setRoleSelection(role);
    setUsername('');
    setPassword('');
    setErrorMessage('');
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
              onClick={() => selectRole(item.role as UserRole)}
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
              placeholder={roleSelection === 'MEMBER' ? 'Email / ID Anggota / No. WhatsApp' : 'Masukkan username atau email'}
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
