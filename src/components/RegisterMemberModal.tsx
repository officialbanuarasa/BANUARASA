import React, { useState } from 'react';
import { StandCategory, Member } from '../types';
import { storage } from '../services/storage';

interface RegisterMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newMember: Member) => void;
}

export const RegisterMemberModal: React.FC<RegisterMemberModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess
}) => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nama_usaha: '',
    kategori_usaha: 'KULINER' as StandCategory,
    alamat: '',
    nomor_hp: '',
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nama_lengkap.trim() || !formData.nama_usaha.trim() || !formData.nomor_hp.trim()) {
      setErrorMsg('Nama lengkap, nama usaha, dan nomor HP/WhatsApp wajib diisi.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Kata sandi akun minimal 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const allMembers = storage.getMembers();
      const newId = `MBR-${String(allMembers.length + 1).padStart(4, '0')}`;

      const newMember: Member = {
        member_id: newId,
        nik: '', // NIK dikosongkan/ditiadakan
        nama_lengkap: formData.nama_lengkap.trim(),
        nama_usaha: formData.nama_usaha.trim(),
        kategori_usaha: formData.kategori_usaha,
        alamat: formData.alamat.trim() || 'Berau, Kalimantan Timur',
        nomor_hp: formData.nomor_hp.trim(),
        whatsapp: formData.nomor_hp.trim(),
        email: formData.email.trim() || `${newId.toLowerCase()}@banuarasa.id`,
        password: formData.password,
        status_keanggotaan: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      storage.saveMember(newMember);
      storage.logActivity('REGISTER_MEMBER', 'MEMBER', `Pendaftaran anggota baru UMKM: ${newMember.nama_lengkap} (${newMember.nama_usaha})`, newMember.member_id);

      setIsLoading(false);
      onRegisterSuccess(newMember);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Gagal menyimpan data pendaftaran.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-6 border border-slate-100">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Pendaftaran Anggota UMKM</h2>
            <p className="text-xs text-slate-500 mt-0.5">Gabung ekosistem Banuarasa Weekend Market</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pemilik Usaha</label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={formData.nama_lengkap}
              onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Usaha / Brand UMKM</label>
            <input
              type="text"
              required
              placeholder="Contoh: Dapur Pesisir Berau"
              value={formData.nama_usaha}
              onChange={e => setFormData({ ...formData, nama_usaha: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Kategori Produk</label>
              <select
                value={formData.kategori_usaha}
                onChange={e => setFormData({ ...formData, kategori_usaha: e.target.value as StandCategory })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500 font-semibold"
              >
                <option value="KULINER">KULINER</option>
                <option value="KERAJINAN">KERAJINAN</option>
                <option value="FASHION">FASHION</option>
                <option value="JASA">JASA</option>
                <option value="UMUM">UMUM</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">No. WhatsApp / HP</label>
              <input
                type="tel"
                required
                placeholder="0812xxxxxxxx"
                value={formData.nomor_hp}
                onChange={e => setFormData({ ...formData, nomor_hp: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Email Aktif</label>
            <input
              type="email"
              placeholder="email@domain.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Alamat di Berau</label>
            <input
              type="text"
              placeholder="Kecamatan / Kelurahan"
              value={formData.alamat}
              onChange={e => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kata Sandi Akun</label>
            <input
              type="password"
              required
              placeholder="Minimal 6 karakter untuk masuk"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-semibold"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftar Sebagai Anggota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMemberModal;
