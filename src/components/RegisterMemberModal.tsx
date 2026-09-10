import React, { useState } from 'react';
import { StandCategory, Member } from '../types';
import { storage } from '../services/storage';
import { googleWorkspaceSync } from '../services/googleWorkspaceSync';
import { sha256 } from 'js-sha256';

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
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
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
      // ID dibuat dari timestamp agar tidak bergantung pada panjang cache lokal
      // dan tidak mudah bentrok ketika dua pengguna mendaftar bersamaan.
      const unique = Date.now().toString().slice(-8);
      const newId = `MBR-${unique}`;
      const nomorAnggota = `KBMB-2026-${unique.slice(-6)}`;

      let profilePhotoUrl = photoUrl.trim();
      if (profilePhotoUrl && !/^https?:\/\//i.test(profilePhotoUrl)) {
        throw new Error('URL foto harus diawali http:// atau https://.');
      }

      const newMember: Member = {
        member_id: newId,
        nomor_anggota: nomorAnggota,
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
        foto_profil_url: profilePhotoUrl,
        nomor_hp: formData.nomor_hp.trim(),
        whatsapp: formData.nomor_hp.trim(),
        email: formData.email.trim() || `${newId.toLowerCase()}@banuarasa.id`,
        // Jangan simpan password plaintext ke Spreadsheet. Login setelah
        // sinkronisasi menggunakan password_hash.
        password: formData.password,
        password_hash: sha256(formData.password),
        tanggal_bergabung: new Date().toISOString().split('T')[0],
        role: 'MEMBER',
        status_keanggotaan: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 1) Tulis anggota ke Google Spreadsheet dan TUNGGU hasilnya.
      // Pendaftaran tidak boleh dianggap berhasil jika backend gagal menulis.
      const createResult = await googleWorkspaceSync.createMember({
        ...newMember,
        password: undefined,
      });
      if (!createResult.success) {
        throw new Error(createResult.error || createResult.message || 'Data anggota gagal disimpan ke Google Spreadsheet.');
      }

      let finalMember = newMember;

      // 2) Simpan cache lokal setelah backend mengonfirmasi pembuatan baris.
      storage.saveMember(newMember);

      // 3) Jika foto berasal dari file, upload ke Drive dan update URL hasilnya
      // ke baris anggota yang sama di Spreadsheet.
      if (photoFile) {
        const mediaResult = await storage.saveMemberMedia(newMember.member_id, photoFile);
        if (mediaResult.success && mediaResult.member) {
          finalMember = mediaResult.member;
        } else {
          console.warn('[RegisterMember] Anggota berhasil disimpan, tetapi foto gagal diunggah:', mediaResult.message);
        }
      }

      storage.logActivity('REGISTER_MEMBER', 'MEMBER', `Pendaftaran anggota baru UMKM: ${finalMember.nama_lengkap} (${finalMember.nama_usaha})`, finalMember.member_id);

      setIsLoading(false);
      onSuccess(finalMember);
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

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-white flex items-center justify-center shadow-sm">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview foto anggota" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-emerald-200">Foto</span>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1 w-full text-center sm:text-left">
                <label className="block font-bold text-slate-800 mb-1">Foto Profil Anggota</label>
                <p className="text-[11px] text-slate-500 mb-2">Opsional. Foto akan tersimpan ke Google Drive dan digunakan pada KTA digital.</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <label htmlFor="register-member-gallery" className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition">
                    🖼️ Galeri
                  </label>
                  <input id="register-member-gallery" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <label htmlFor="register-member-camera" className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition">
                    📷 Kamera
                  </label>
                  <input id="register-member-camera" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
                </div>
                {photoFile && <p className="mt-1 text-[10px] text-emerald-700 truncate">{photoFile.name}</p>}
                <div className="mt-2">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => { setPhotoUrl(e.target.value); if (e.target.value) { setPhotoFile(null); setPhotoPreview(e.target.value); } }}
                    placeholder="Atau masukkan URL foto https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 bg-white text-xs"
                  />
                </div>
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
