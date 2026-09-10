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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoSource, setPhotoSource] = useState<'device' | 'camera' | 'url'>('device');

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

    const normalized = value.trim();
    if (!normalized) {
      setPhotoPreview('');
      return;
    }

    try {
      const url = new URL(normalized);
      if (!['http:', 'https:'].includes(url.protocol)) {
        setPhotoPreview('');
        return;
      }
      setPhotoPreview(normalized);
    } catch {
      setPhotoPreview('');
    }
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

    if (photoUrl.trim()) {
      try {
        const parsedUrl = new URL(photoUrl.trim());
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('URL foto harus menggunakan http:// atau https://.');
        }
      } catch (urlError: any) {
        setErrorMsg(urlError?.message || 'URL foto tidak valid.');
        return;
      }
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
        foto_profil_url: photoUrl.trim() || '',
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

      if (photoUrl.trim()) {
        // URL foto disimpan langsung pada profil dan akan ikut tersinkron ke Google Sheets.
        finalMember = storage.updateMemberProfile(newMember.member_id, {
          foto_profil_url: photoUrl.trim(),
        }).member || newMember;
      } else if (photoFile) {
        const mediaResult = await storage.saveMemberMedia(newMember.member_id, photoFile);
        if (mediaResult.success && mediaResult.member) {
          finalMember = mediaResult.member;
        } else {
          console.warn('[RegisterMember] Foto gagal diunggah:', mediaResult.message);
        }
      }

      storage.logActivity('REGISTER_MEMBER', 'MEMBER', `Pendaftaran anggota baru UMKM: ${newMember.nama_lengkap} (${newMember.nama_usaha})`, newMember.member_id);

      setIsLoading(false);
      onRegisterSuccess(finalMember);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Gagal menyimpan data pendaftaran.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] bg-white rounded-3xl p-5 sm:p-8 shadow-2xl overflow-y-auto overscroll-contain touch-pan-y my-3 sm:my-6 border border-slate-100">
        
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

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-white flex items-center justify-center shadow-sm">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview foto anggota"
                      className="w-full h-full object-cover"
                      onError={() => {
                        if (photoSource === 'url') {
                          setPhotoPreview('');
                          setErrorMsg('URL foto tidak dapat ditampilkan. Pastikan URL mengarah langsung ke file gambar yang dapat diakses publik.');
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
                <p className="text-[11px] text-slate-500 mb-3">
                  Opsional. Pilih foto dari galeri, ambil langsung dengan kamera, atau gunakan URL foto publik.
                </p>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <label
                    htmlFor="register-member-photo-gallery"
                    className="inline-flex min-w-0 items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition"
                  >
                    🖼️ Galeri
                  </label>
                  <input
                    id="register-member-photo-gallery"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="register-member-photo-camera"
                    className="inline-flex min-w-0 items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold cursor-pointer transition"
                  >
                    📷 Kamera
                  </label>
                  <input
                    id="register-member-photo-camera"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoSource('url');
                      setPhotoFile(null);
                      setErrorMsg('');
                    }}
                    className="col-span-2 sm:col-span-1 inline-flex min-w-0 items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold transition"
                  >
                    🔗 Gunakan URL
                  </button>
                </div>

                {photoSource === 'url' && (
                  <div className="mt-2">
                    <input
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      placeholder="https://contoh.com/foto.jpg"
                      value={photoUrl}
                      onChange={(e) => handlePhotoUrlChange(e.target.value)}
                      className="w-full min-w-0 px-3 py-2 border border-emerald-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 text-xs"
                    />
                    <p className="mt-1 text-[10px] text-slate-500 text-left">
                      Gunakan URL langsung ke gambar yang bisa diakses publik (JPG, PNG, WEBP, dan sejenisnya).
                    </p>
                  </div>
                )}

                {photoFile && (
                  <p className="mt-1 text-[10px] text-emerald-700 truncate text-left">{photoFile.name}</p>
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
