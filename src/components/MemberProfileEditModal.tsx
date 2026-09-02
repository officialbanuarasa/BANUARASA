import React, { useState } from 'react';
import { Member } from '../types';
import { storage } from '../services/storage';
import {
  X,
  User,
  Camera,
  Upload,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Save,
  Image as ImageIcon,
} from 'lucide-react';

interface MemberProfileEditModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedMember: Member) => void;
}

export const MemberProfileEditModal: React.FC<MemberProfileEditModalProps> = ({
  member,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [namaLengkap, setNamaLengkap] = useState(member.nama_lengkap || '');
  const [nik, setNik] = useState(member.nik || '');
  const [nomorHp, setNomorHp] = useState(member.nomor_hp || member.whatsapp || '');
  const [email, setEmail] = useState(member.email || '');
  const [namaUsaha, setNamaUsaha] = useState(member.nama_usaha || '');
  const [kategoriUsaha, setKategoriUsaha] = useState(member.kategori_usaha || 'Kuliner');
  const [deskripsiUsaha, setDeskripsiUsaha] = useState(member.deskripsi_usaha || '');
  const [alamatUsaha, setAlamatUsaha] = useState(member.alamat_usaha || member.alamat || '');
  const [fotoProfilUrl, setFotoProfilUrl] = useState(
    member.foto_profil_url ||
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File Upload to Base64 Photo
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setFotoProfilUrl(base64);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) return;

    const res = storage.updateMemberProfile(member.member_id, {
      nama_lengkap: namaLengkap.trim(),
      nik: nik.trim(),
      nomor_hp: nomorHp.trim(),
      whatsapp: nomorHp.trim(),
      email: email.trim(),
      nama_usaha: namaUsaha.trim(),
      kategori_usaha: kategoriUsaha,
      deskripsi_usaha: deskripsiUsaha.trim(),
      alamat_usaha: alamatUsaha.trim(),
      alamat: alamatUsaha.trim(),
      foto_profil_url: fotoProfilUrl,
    });

    if (res.success && res.member) {
      setSuccessMessage('Biodata dan Foto Profil berhasil disimpan dan diperbarui!');
      if (onSuccess) onSuccess(res.member);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Lengkapi Biodata & Foto Anggota</h3>
              <p className="text-xs text-emerald-300 font-mono">ID: {member.member_id} • {member.nomor_anggota}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Photo Uploader Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <img
                src={fotoProfilUrl}
                alt="Foto Profil"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md bg-white"
              />
              <label
                htmlFor="member-photo-input"
                className="absolute inset-0 bg-slate-950/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span>Ganti Foto</span>
              </label>
              <input
                id="member-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <h4 className="text-xs font-black text-slate-900">Foto Profil Resmi Anggota (KTA)</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Foto ini akan otomatis tercetak pada <strong>Kartu Tanda Anggota (KTA) Digital</strong> dan diverifikasi oleh pengurus koperasi saat bazar mingguan.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <label
                  htmlFor="member-photo-input"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Memproses...' : 'Upload dari Perangkat / HP'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Masukkan tautan URL foto online:', fotoProfilUrl);
                    if (url && url.trim()) setFotoProfilUrl(url.trim());
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Gunakan URL Web</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-slate-100">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Biodata Pribadi & Usaha UMKM</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nama Lengkap (Sesuai KTP)</label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Nama Lengkap Anggota"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">NIK (Nomor Induk Kependudukan)</label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="6403xxxxxxxxxxxx"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nomor WhatsApp / HP Aktif</label>
                <input
                  type="tel"
                  required
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="0812xxxxxxxx"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Email Anggota</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="anggota@email.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nama Usaha / Merek Produk</label>
                <input
                  type="text"
                  required
                  value={namaUsaha}
                  onChange={(e) => setNamaUsaha(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Contoh: Dapur Sedap Berau"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Kategori Usaha</label>
                <select
                  value={kategoriUsaha}
                  onChange={(e) => setKategoriUsaha(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Kuliner">Kuliner & Minuman</option>
                  <option value="Kriya">Kriya & Kerajinan Tangan</option>
                  <option value="Fashion">Fashion & Busana</option>
                  <option value="Jasa">Jasa Kreatif</option>
                  <option value="Pertanian">Hasil Tani & Olahan</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Alamat Usaha & Domisili di Berau</label>
                <input
                  type="text"
                  value={alamatUsaha}
                  onChange={(e) => setAlamatUsaha(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Jl. Pemuda No. 12, Tanjung Redeb, Berau"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Deskripsi Singkat Usaha / Menu Unggulan</label>
                <textarea
                  rows={2}
                  value={deskripsiUsaha}
                  onChange={(e) => setDeskripsiUsaha(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Menjual berbagai macam kuliner olahan khas pesisir Berau..."
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Terapkan ke KTA</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
