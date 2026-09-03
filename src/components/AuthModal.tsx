import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { AuthUser, Member } from '../types';
import { BARA_ASSETS } from '../assets/baraAssets';
import {
  X,
  UserCheck,
  UserPlus,
  LogIn,
  Sparkles,
  Mail,
  AlertCircle,
  KeyRound,
  Cloud,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER';
  onLoginSuccess: (user: AuthUser) => void;
  onRegisterSuccess: (member: Member, user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'MEMBER_LOGIN',
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>(() =>
    initialMode === 'REGISTER' ? 'REGISTER' : 'LOGIN'
  );

  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode === 'REGISTER' ? 'REGISTER' : 'LOGIN');
      setLoginError('');
      setRegError('');
    }
  }, [isOpen, initialMode]);

  // Register Form State
  const [regNama, setRegNama] = useState('');
  const [regNIK, setRegNIK] = useState('');
  const [regNamaUsaha, setRegNamaUsaha] = useState('');
  const [regKategori, setRegKategori] = useState<'Kuliner' | 'Kriya' | 'Fashion' | 'Pertanian' | 'Jasa' | 'Lainnya'>('Kuliner');
  const [regDeskripsiUsaha, setRegDeskripsiUsaha] = useState('');
  const [regWhatsApp, setRegWhatsApp] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAlamatUsaha, setRegAlamatUsaha] = useState('');
  const [regFotoUrl, setRegFotoUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  );
  const [regError, setRegError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!identifier.trim() || !password.trim()) {
      setLoginError('Silakan isi email/WhatsApp/Nomor Anggota dan kata sandi.');
      return;
    }

    const res = storage.login(identifier, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setLoginError(res.message || 'Kombinasi identitas dan kata sandi tidak cocok.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regNama || !regNIK || !regNamaUsaha || !regWhatsApp || !regEmail) {
      setRegError('Mohon lengkapi seluruh formulir bertanda wajib (*).');
      return;
    }

    if (regNIK.length < 16) {
      setRegError('Nomor Induk Kependudukan (NIK) harus terdiri dari 16 digit.');
      return;
    }

    setIsSubmitting(true);

    try {
      const existingMembers = storage.getMembers();
      const nextNum = (existingMembers.length + 1).toString().padStart(4, '0');
      const memberId = `BM-${nextNum}`;
      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const nomorAnggota = `KBM/${year}/${month}/${nextNum}`;

      const newMember = storage.createMember({
        member_id: memberId,
        nomor_anggota: nomorAnggota,
        nama_lengkap: regNama,
        nik: regNIK,
        tempat_lahir: 'Tanjung Redeb',
        tanggal_lahir: '1995-01-01',
        jenis_kelamin: 'L',
        alamat: regAlamatUsaha || 'Tanjung Redeb, Berau',
        nomor_hp: regWhatsApp,
        email: regEmail,
        foto_profil_url: regFotoUrl,
        nama_usaha: regNamaUsaha,
        deskripsi_usaha: regDeskripsiUsaha || 'Pelaku UMKM Binaan Koperasi Berau Melangkah Bersama',
        kategori_usaha: regKategori,
        alamat_usaha: regAlamatUsaha || 'Tanjung Redeb, Berau',
        whatsapp: regWhatsApp,
        status_keanggotaan: 'ACTIVE',
        tanggal_bergabung: new Date().toISOString().split('T')[0],
      });

      const authUser: AuthUser = {
        id: newMember.member_id,
        username: newMember.email,
        name: newMember.nama_lengkap,
        role: 'MEMBER',
        member_id: newMember.member_id,
        email: newMember.email,
        foto_profil_url: newMember.foto_profil_url,
        nomor_anggota: newMember.nomor_anggota,
        nama_usaha: newMember.nama_usaha,
      };

      storage.setCurrentUser(authUser);
      setIsSubmitting(false);
      onRegisterSuccess(newMember, authUser);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setRegError(err.message || 'Gagal memproses pendaftaran. Silakan coba kembali.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-amber-400/80 bg-emerald-950 shrink-0 shadow-md flex items-center justify-center">
              <img
                src={BARA_ASSETS.avatar}
                alt="Bara"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">
                  Portal Masuk Banuarasa
                </h3>
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <Cloud className="w-3 h-3" />
                <span>Koperasi Berau Melangkah Bersama</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Only 2 options (Masuk ke Akun & Daftar Anggota) */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 shrink-0 gap-1 text-xs font-extrabold">
          <button
            id="modal-tab-login"
            type="button"
            onClick={() => {
              setAuthMode('LOGIN');
              setLoginError('');
            }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'LOGIN'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Masuk ke Akun</span>
          </button>

          <button
            id="modal-tab-register"
            type="button"
            onClick={() => {
              setAuthMode('REGISTER');
              setRegError('');
            }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'REGISTER'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Daftar Anggota Baru</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: LOGIN */}
          {authMode === 'LOGIN' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <p className="font-bold text-emerald-900">
                    Masuk ke Sistem Banuarasa
                  </p>
                  <p className="text-emerald-800 leading-relaxed mt-0.5">
                    Gunakan email, nomor WhatsApp, atau ID akun terdaftar untuk mengakses dashboard.
                  </p>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email / Nomor WhatsApp / Nomor Anggota <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="input-login-id"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Masukkan email, nomor WhatsApp, atau ID akun"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="input-login-pass"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-login"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                Belum memiliki akun anggota?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('REGISTER')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Daftar Sekarang
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {authMode === 'REGISTER' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <p className="font-bold text-emerald-900">
                    Formulir Pendaftaran Anggota UMKM Baru
                  </p>
                  <p className="text-emerald-800 leading-relaxed mt-0.5">
                    Isi data biodata dan usaha untuk mendapatkan Nomor Anggota Koperasi serta hak memilih stand Banuarasa.
                  </p>
                </div>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap (Sesuai KTP) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-nama"
                      type="text"
                      required
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIK (16 Digit KTP) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-nik"
                      type="text"
                      maxLength={16}
                      required
                      value={regNIK}
                      onChange={(e) => setRegNIK(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="640301xxxxxxxxxx"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Brand / Usaha UMKM <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-nama-usaha"
                      type="text"
                      required
                      value={regNamaUsaha}
                      onChange={(e) => setRegNamaUsaha(e.target.value)}
                      placeholder="Contoh: Keripik Singkong Derawan"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori Usaha <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="reg-kategori"
                      value={regKategori}
                      onChange={(e) => setRegKategori(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    >
                      <option value="Kuliner">Kuliner (Makanan & Minuman)</option>
                      <option value="Kriya">Kriya & Kerajinan Tangan</option>
                      <option value="Fashion">Fashion & Pakaian Tradisional</option>
                      <option value="Pertanian">Hasil Bumi & Pertanian</option>
                      <option value="Jasa">Jasa & Kreatif</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-whatsapp"
                      type="tel"
                      required
                      value={regWhatsApp}
                      onChange={(e) => setRegWhatsApp(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Email Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Domisili / Tempat Usaha
                  </label>
                  <input
                    id="reg-alamat-usaha"
                    type="text"
                    value={regAlamatUsaha}
                    onChange={(e) => setRegAlamatUsaha(e.target.value)}
                    placeholder="Jl. Pulau Derawan No. 12, Tanjung Redeb"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deskripsi Singkat Produk / Usaha
                  </label>
                  <textarea
                    id="reg-deskripsi-usaha"
                    rows={2}
                    value={regDeskripsiUsaha}
                    onChange={(e) => setRegDeskripsiUsaha(e.target.value)}
                    placeholder="Jelaskan produk unggulan yang Anda tawarkan..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-submit-register"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Memproses Pendaftaran...' : 'Daftar Sebagai Anggota Koperasi'}</span>
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                Sudah punya akun anggota?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Masuk di sini
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
