import React, { useState, useRef } from 'react';
import { Member } from '../types';
import { storage } from '../services/storage';

interface DigitalMemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onPhotoUpdated?: (updatedMember: Member) => void;
}

export const DigitalMemberCardModal: React.FC<DigitalMemberCardModalProps> = ({
  isOpen,
  onClose,
  member,
  onPhotoUpdated
}) => {
  const [currentPhoto, setCurrentPhoto] = useState<string>(member.avatar_url || '');
  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Barcode / QR Code dinamis berbasis ID Anggota & Spreadsheet Verification
  const barcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    JSON.stringify({
      id: member.member_id,
      nik: member.nik,
      nama: member.nama_lengkap,
      usaha: member.nama_usaha,
      status: member.status_keanggotaan,
      app: 'BANUARASA_WEEKEND_MARKET'
    })
  )}`;

  // Handler Upload Foto dari Perangkat (Galeri / Kamera)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Photo = reader.result as string;
      saveUpdatedAvatar(base64Photo);
    };
    reader.readAsDataURL(file);
  };

  // Handler Simpan Foto via Input Link URL
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) return;
    saveUpdatedAvatar(photoUrlInput.trim());
    setPhotoUrlInput('');
  };

  // Fungsi Simpan ke Storage & Update State
  const saveUpdatedAvatar = (avatarUrl: string) => {
    const updated: Member = {
      ...member,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    };

    storage.saveMember(updated);
    setCurrentPhoto(avatarUrl);
    setIsEditingPhoto(false);
    setSaveMessage('Foto profil KTA berhasil diperbarui!');
    setTimeout(() => setSaveMessage(''), 2500);

    if (onPhotoUpdated) {
      onPhotoUpdated(updated);
    }
  };

  // Cetak / Download KTA
  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">Kartu Tanda Anggota (KTA) Digital</h2>
            <p className="text-xs text-slate-500">Koperasi & Komunitas Banuarasa Weekend Market</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {saveMessage && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl text-center">
            {saveMessage}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* DESAIN FISIK KTA DIGITAL BANUARASA                 */}
        {/* -------------------------------------------------- */}
        <div 
          id="digital-kta-card"
          className="relative w-full rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 shadow-xl border border-emerald-500/30 overflow-hidden"
        >
          {/* Aksen Motif Background */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-400/10 rounded-full blur-xl -ml-12 -mb-12 pointer-events-none"></div>

          {/* Header Kartu */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
                B
              </div>
              <div>
                <span className="text-xs font-black tracking-wider uppercase text-white block">
                  BANUARASA
                </span>
                <span className="text-[9px] text-emerald-300 font-semibold block tracking-wide">
                  KARTU TANDA ANGGOTA UMKM
                </span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
              {member.status_keanggotaan || 'ACTIVE'}
            </span>
          </div>

          {/* Konten Identitas Anggota & Barcode */}
          <div className="mt-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Foto Profil KTA */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-28 rounded-xl bg-slate-800 border-2 border-emerald-400/50 overflow-hidden shadow-md flex items-center justify-center">
                {currentPhoto ? (
                  <img src={currentPhoto} alt={member.nama_lengkap} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-slate-400">
                    {member.nama_lengkap.charAt(0)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg text-[10px] font-bold transition border border-white/40"
                title="Ganti Foto KTA"
              >
                📷
              </button>
            </div>

            {/* Biodata Anggota */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono block tracking-wider">
                NO. REG: {member.member_id}
              </span>
              <h3 className="text-base font-black text-white leading-snug">
                {member.nama_lengkap}
              </h3>
              <p className="text-xs font-semibold text-slate-200">
                {member.nama_usaha}
              </p>
              <div className="pt-1 flex flex-wrap justify-center sm:justify-start gap-1.5 text-[10px] text-slate-300">
                <span className="bg-white/10 px-2 py-0.5 rounded-md">
                  🏷️ {member.kategori_usaha || 'KULINER'}
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded-md">
                  📍 Berau
                </span>
              </div>
            </div>

            {/* Barcode / QR Code untuk Verifikasi Spreadsheet */}
            <div className="flex-shrink-0 flex flex-col items-center bg-white p-2 rounded-xl shadow-md">
              <img src={barcodeUrl} alt="QR Verifikasi" className="w-20 h-20" />
              <span className="text-[8px] font-mono text-slate-700 mt-1 font-bold">SCAN VERIFIKASI</span>
            </div>
          </div>

          {/* Footer Kartu */}
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
            <span>Berau, Kalimantan Timur</span>
            <span>Scan barcode untuk periksa keabsahan</span>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* PANEL PENGATURAN FOTO (UPLOAD / INPUT URL)          */}
        {/* -------------------------------------------------- */}
        {isEditingPhoto && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">Ganti Foto Profil KTA</h4>
            <p className="text-slate-500 text-[11px]">
              Pilih foto langsung dari galeri/kamera perangkat Anda atau masukkan tautan link gambar web.
            </p>

            <div className="space-y-3 pt-1">
              {/* Opsi 1: Upload File Gambar */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span>📁</span>
                  <span>Upload Foto dari Galeri / Kamera</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                <div className="h-px flex-1 bg-slate-200"></div>
                <span>ATAU GUNAKAN LINK URL</span>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              {/* Opsi 2: Input URL Gambar */}
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/foto-saya.jpg"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-emerald-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
                >
                  Terapkan
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tombol Aksi Modal */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsEditingPhoto(!isEditingPhoto)}
            className="px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
          >
            {isEditingPhoto ? 'Tutup Pengaturan Foto' : '📷 Ganti Foto KTA'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Tutup
            </button>
            <button
              onClick={handlePrintCard}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Cetak / Simpan KTA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalMemberCardModal;
