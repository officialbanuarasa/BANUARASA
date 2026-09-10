import React, { useState } from 'react';
import { StandCategory, Member } from '../types';
import { storage } from '../services/storage';

interface RegisterMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMember: Member) => void;
}

export const RegisterMemberModal: React.FC<RegisterMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoSource, setPhotoSource] = useState<'device' | 'url'>('device');

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('File foto harus berupa gambar.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 5 MB.');
      return;
    }
    setPhotoFile(file);
    setPhotoUrl('');
    setPhotoSource('device');
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handlePhotoUrlChange = (value: string) => {
    setPhotoUrl(value);
    setPhotoFile(null);
    setPhotoSource('url');
    setErrorMsg('');
    setPhotoPreview(value.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        nomor_anggota: `KBMB-2026-${String(allMembers.length + 1).padStart(3, '0')}`,
        nik: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'L',

        nama_lengkap: formData.nama_lengkap.trim(),
        nama_usaha: formData.nama_usaha.trim(),
        kategori_usaha: ({ KULINER: 'Kuliner', KERAJINAN: 'Kriya', FASHION: 'Fashion', JASA: 'Jasa', UMUM: 'Lainnya' } as const)[formData.kategori_usaha],
        alamat: formData.alamat.trim() || 'Berau, Kalimantan Timur',
        alamat_usaha: formData.alamat.trim() || 'Berau, Kalimantan Timur',
        deskripsi_usaha: '',
        foto_profil_url: photoUrl.trim(),
        nomor_hp: formData.nomor_hp.trim(),
        whatsapp: formData.nomor_hp.trim(),
        email: formData.email.trim() || `${newId.toLowerCase()}@banuarasa.id`,
        password: formData.password,
        password_hash: '',
        tanggal_bergabung: new Date().toISOString().split('T')[0],
        role: 'MEMBER',
        status_keanggotaan: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      storage.saveMember(newMember);
      let finalMember = newMember;

      if (photoFile) {
        const mediaResult = await storage.saveMemberMedia(newMember.member_id, photoFile);
        if (mediaResult.success && mediaResult.member) {
          finalMember = mediaResult.member;
        } else {
          console.warn('[RegisterMember] Foto gagal diunggah:', mediaResult.message);
        }
      }

      storage.logActivity('REGISTER_MEMBER', 'MEMBER', `Pendaftaran anggota baru UMKM: ${newMember.nama_lengkap} (${newMember.nama_usaha})`, newMember.member_id);

      setIsLoading(false);
      onSuccess(finalMember);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Gagal menyimpan data pendaftaran.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto overscroll-contain">
      <div className="w-full max-w-md max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl my-2 sm:my-6 border border-slate-100 flex flex-col overflow-hidden">
        
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

        <form onSubmit={handleSubmit} className="space-y-3 text-xs min-h-0 overflow-y-auto overscroll-contain pr-1 pb-1">
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

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-white flex items-center justify-center shadow-sm">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview foto anggota"
                      className="w-full h-full object-cover"
                      onError={() => {
                        if (photoSource === 'url') {
                          setErrorMsg('URL foto tidak dapat dimuat. Pastikan URL gambar dapat diakses publik.');
                        }
                      }}
                    />
                  ) : (
                    <span className="text-3xl font-black text-emerald-200">Foto</span>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1 w-full text-center sm:text-left">
                <label className="block font-bold text-slate-800 mb-1">Foto Profil Anggota</label>
                <p className="text-[11px] text-slate-500 mb-2">Opsional. Pilih dari galeri, gunakan kamera, atau masukkan URL foto.</p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoSource('device');
                      document.getElementById('register-member-photo-gallery')?.click();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition"
                  >
                    🖼️ Galeri
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoSource('device');
                      document.getElementById('register-member-photo-camera')?.click();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer transition"
                  >
                    📷 Kamera
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoSource('url')}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${photoSource === 'url' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    🔗 Gunakan URL
                  </button>
                </div>

                <input
                  id="register-member-photo-gallery"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <input
                  id="register-member-photo-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {photoSource === 'url' && (
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={e => handlePhotoUrlChange(e.target.value)}
                    placeholder="https://contoh.com/foto.jpg"
                    className="w-full min-w-0 px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500 text-xs"
                  />
                )}

                {photoFile && photoSource === 'device' && (
                  <p className="mt-1 text-[10px] text-emerald-700 truncate">{photoFile.name}</p>
                )}
              </div>
            </div>
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
