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

  // -------------------------------------------------------------------------
  // URL PROFIL ANGGOTA RESMI DI WEBSITE (DIPINDAI DARI BARCODE SMARTPHONE)
  // -------------------------------------------------------------------------
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://banuarasa.vercel.app';
  const memberPublicUrl = `${currentOrigin}/?view=member-profile&id=${encodeURIComponent(member.member_id)}`;

  // Barcode / QR Code dinamis beresolusi tinggi yang menghubungkan langsung ke profil website
  const barcodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=2&data=${encodeURIComponent(memberPublicUrl)}`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      saveUpdatedAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) return;
    saveUpdatedAvatar(photoUrlInput.trim());
    setPhotoUrlInput('');
  };

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

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      {/* Style cetak presisi standar ID-1: 85,6 mm x 53,98 mm */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area-kta, #print-area-kta * {
            visibility: visible;
          }
          #print-area-kta {
            position: fixed;
            left: 0;
            top: 0;
            width: 85.6mm !important;
            height: 53.98mm !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl overflow-hidden my-6 border border-slate-100">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">KTA Digital Standar ISO/IEC 7810</h2>
            <p className="text-xs text-slate-500">Ukuran Standar ID-1: <strong>85,6 mm × 53,98 mm</strong></p>
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

        {/* ----------------------------------------------------------------- */}
        {/* KARTU KTA STANDAR: 85,6 mm × 53,98 mm (Aspect Ratio: 1.5857)     */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex justify-center items-center py-2">
          <div 
            id="print-area-kta"
            style={{
              width: '100%',
              maxWidth: '380px',
              aspectRatio: '85.6 / 53.98'
            }}
            className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-3.5 sm:p-4 shadow-xl border border-emerald-500/30 overflow-hidden flex flex-col justify-between select-none"
          >
            {/* Latar Belakang Motif Ornamen */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-teal-400/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>

            {/* Header KTA */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center font-black text-slate-950 text-xs shadow-xs">
                  B
                </div>
                <div>
                  <span className="text-[11px] font-black tracking-wider uppercase text-white block leading-tight">
                    BANUARASA
                  </span>
                  <span className="text-[7.5px] text-emerald-300 font-bold block tracking-wider">
                    KARTU TANDA ANGGOTA UMKM
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full text-[7.5px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  {member.status_keanggotaan || 'ACTIVE'}
                </span>
                <span className="block text-[7.5px] font-mono text-slate-300 mt-0.5">
                  {member.member_id}
                </span>
              </div>
            </div>

            {/* Konten KTA: Foto, Identitas, & Barcode Terintegrasi */}
            <div className="relative z-10 my-auto flex items-center gap-3">
              {/* Foto Profil KTA */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-xl bg-slate-800 border-2 border-emerald-400/50 overflow-hidden shadow-md flex items-center justify-center">
                  {currentPhoto ? (
                    <img src={currentPhoto} alt={member.nama_lengkap} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-slate-400">
                      {(member.nama_lengkap || 'M').charAt(0)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                  className="absolute -bottom-1.5 -right-1.5 p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-md text-[9px] font-bold transition border border-white/40"
                  title="Ganti Foto KTA"
                >
                  📷
                </button>
              </div>

              {/* Biodata Anggota */}
              <div className="flex-1 space-y-0.5 min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white leading-snug truncate">
                  {member.nama_lengkap}
                </h3>
                <p className="text-[10px] font-bold text-emerald-300 truncate">
                  {member.nama_usaha}
                </p>
                <div className="flex flex-wrap gap-1 pt-1 text-[8px] text-slate-300">
                  <span className="bg-white/10 px-1.5 py-0.5 rounded">
                    🏷️ {member.kategori_usaha || 'KULINER'}
                  </span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded truncate max-w-[110px]">
                    📍 {member.alamat || 'Berau'}
                  </span>
                </div>
              </div>

              {/* Barcode / QR Code Terintegrasi ke Halaman Profil Website */}
              <div className="flex-shrink-0 flex flex-col items-center bg-white p-1 rounded-xl shadow-md border border-slate-200">
                <img src={barcodeApiUrl} alt="QR Profil Website" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
                <span className="text-[6.5px] font-mono text-slate-900 font-extrabold mt-0.5 tracking-tighter">
                  SCAN PROFIL
                </span>
              </div>
            </div>

            {/* Footer KTA */}
            <div className="relative z-10 pt-1.5 border-t border-white/15 flex items-center justify-between text-[7.5px] text-slate-400">
              <span>Standard ISO 85,6 × 53,98 mm</span>
              <span>Scan QR untuk membuka profil resmi di website</span>
            </div>
          </div>
        </div>

        {/* Panel Ganti Foto (Upload / Link URL) */}
        {isEditingPhoto && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 text-xs">Ganti Foto Profil KTA</h4>
            <div className="space-y-2">
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
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 text-xs"
                >
                  <span>📁</span>
                  <span>Upload Foto dari Galeri / Kamera</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                <div className="h-px flex-1 bg-slate-200"></div>
                <span>ATAU TEMPELKAN LINK URL FOTO</span>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://domain.com/foto.jpg"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-emerald-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Terapkan
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Petunjuk Integrasi Barcode */}
        <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-[11px] text-emerald-900 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <span>🔗</span> Integrasi Web Aktif:
          </p>
          <p className="text-slate-600 text-[10px] break-all">
            Barcode di atas terhubung ke: <span className="font-mono text-emerald-800 font-bold">{memberPublicUrl}</span>
          </p>
        </div>

        {/* Tombol Aksi Modal */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsEditingPhoto(!isEditingPhoto)}
            className="px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
          >
            {isEditingPhoto ? 'Tutup Pengaturan Foto' : '📷 Ganti Foto'}
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
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Cetak Ukuran 85,6 × 53,98 mm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalMemberCardModal;
