import React, { useState } from 'react';
import {
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { storage } from '../services/storage';
import { AuthUser, Member, UserRole } from '../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  targetMember?: Member | null; // If passed by Super Admin to edit a specific member
  isSuperAdminReset?: boolean;
  onSuccess?: (message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetMember,
  isSuperAdminReset = false,
  onSuccess,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Determine target user details
  const isSuperAdminEditingSelf = !targetMember && currentUser?.role === 'SUPER_ADMIN';
  const targetName = targetMember
    ? targetMember.nama_lengkap
    : isSuperAdminEditingSelf
    ? 'Super Admin Koperasi'
    : currentUser?.name || 'Anggota Koperasi';

  const targetId = targetMember
    ? targetMember.member_id
    : isSuperAdminEditingSelf
    ? currentUser?.id || 'ADM-SUPER'
    : currentUser?.member_id || currentUser?.id || '';

  const targetRole: UserRole = targetMember
    ? 'MEMBER'
    : currentUser?.role || 'MEMBER';

  const targetSubtitle = targetMember
    ? `Anggota: ${targetMember.nomor_anggota} • ${targetMember.nama_usaha}`
    : isSuperAdminEditingSelf
    ? 'Master Account • Otoritas Penuh Sistem'
    : currentUser?.nomor_anggota
    ? `ID: ${currentUser.nomor_anggota} • ${currentUser.nama_usaha || 'UMKM'}`
    : 'Akun Terdaftar';

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Lemah', color: 'bg-rose-500 text-rose-700' };
    if (score <= 3) return { score: 2, label: 'Sedang', color: 'bg-amber-500 text-amber-700' };
    return { score: 3, label: 'Kuat & Aman', color: 'bg-emerald-500 text-emerald-700' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleResetToDefault = () => {
    setNewPassword('123456');
    setConfirmPassword('123456');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!isSuperAdminReset && !oldPassword.trim()) {
      setErrorMessage('Silakan masukkan kata sandi lama Anda.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage('Silakan masukkan kata sandi baru.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setErrorMessage('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok. Periksa kembali.');
      return;
    }

    if (!isSuperAdminReset && oldPassword.trim() === newPassword.trim()) {
      setErrorMessage('Kata sandi baru tidak boleh sama persis dengan kata sandi lama.');
      return;
    }

    setIsLoading(true);

    try {
      const res = storage.changePassword({
        targetUserId: targetId,
        targetRole: targetRole,
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
        isSuperAdminReset: isSuperAdminReset,
        operatorId: currentUser?.id,
      });

      if (res.success) {
        setSuccessMessage(res.message);
        if (onSuccess) {
          onSuccess(res.message);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat memperbarui kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                  {isSuperAdminReset ? 'Reset Kata Sandi Anggota' : 'Rubah Kata Sandi'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {isSuperAdminReset ? 'Reset Kata Sandi Akun' : 'Ganti Kata Sandi Akun'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account Info Pill */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-black text-xs shadow-xs">
              {targetRole === 'SUPER_ADMIN' ? 'SA' : 'MB'}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">{targetName}</p>
              <p className="text-[10px] text-slate-500 font-medium">{targetSubtitle}</p>
            </div>
          </div>
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
              targetRole === 'SUPER_ADMIN'
                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            {targetRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Anggota Koperasi'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gagal memperbarui</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Berhasil</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Quick reset button for Super Admin */}
          {isSuperAdminReset && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-2">
              <div className="text-left">
                <p className="text-[11px] font-bold text-amber-950">PIN Standar Sistem: 123456</p>
                <p className="text-[10px] text-amber-800">Setel langsung ke kata sandi bawaan koperasi</p>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Pakai 123456</span>
              </button>
            </div>
          )}

          {/* Old Password (Only for self change) */}
          {!isSuperAdminReset && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Kata Sandi Lama <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Masukkan kata sandi lama akun yang sedang aktif untuk verifikasi keamanan.
              </p>
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium">Kekuatan Sandi:</span>
                  <span className="font-bold">{strength.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 h-1.5">
                  <div
                    className={`rounded-full transition-all ${
                      strength.score >= 1 ? strength.color.split(' ')[0] : 'bg-slate-100'
                    }`}
                  ></div>
                  <div
                    className={`rounded-full transition-all ${
                      strength.score >= 2 ? strength.color.split(' ')[0] : 'bg-slate-100'
                    }`}
                  ></div>
                  <div
                    className={`rounded-full transition-all ${
                      strength.score >= 3 ? strength.color.split(' ')[0] : 'bg-slate-100'
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Kata sandi tidak cocok</span>
              </p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Kata sandi cocok & siap disimpan</span>
              </p>
            )}
          </div>

          {/* Security Note */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Kata sandi akan dienkripsi dengan standar SHA-256 dan disinkronkan secara aman ke database cloud Koperasi Berau.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>{isSuperAdminReset ? 'Simpan Sandi Baru' : 'Perbarui Kata Sandi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
