import React from 'react';
import { Member } from '../types';
import { BANUARASA_ASSETS, BARA_ASSETS } from '../assets/baraAssets';
import { X, QrCode, ShieldCheck, Download, Printer, Award, Store } from 'lucide-react';

interface DigitalMemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
}

export const DigitalMemberCardModal: React.FC<DigitalMemberCardModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>KTA Digital Banuarasa Weekend Market</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col items-center">
          {/* Physical style Digital Card (Slate 900 Luxury Bento styling) */}
          <div
            id="printable-member-card"
            className="w-full bg-radial from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl p-6 relative overflow-hidden border border-slate-800 flex flex-col justify-between aspect-[1.586/1]"
          >
            {/* Background mascot watermark pattern */}
            <div className="absolute -right-6 -bottom-6 w-36 h-36 opacity-15 pointer-events-none select-none">
              <img
                src={BARA_ASSETS.mascot}
                alt="Bara Maskot"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>

            {/* Top Bar with Official Logo */}
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-950 shrink-0 p-0.5 flex items-center justify-center shadow-md">
                  <img
                    src={BANUARASA_ASSETS.logo}
                    alt="Logo Banua Rasa Weekend Market"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-tight leading-none text-white">
                    BANUARASA <span className="text-emerald-400">WEEKEND MARKET</span>
                  </h4>
                  <p className="text-[8px] uppercase tracking-wider text-amber-300 font-bold mt-0.5">
                    Koperasi Berau Melangkah Bersama
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-bold">
                <Award className="w-3 h-3 text-amber-400" />
                <span>ANGGOTA TERVERIFIKASI</span>
              </div>
            </div>

            {/* Middle Section: Member & QR Code */}
            <div className="flex items-center justify-between my-auto py-2 z-10 gap-4">
              <div className="flex-grow min-w-0">
                <p className="text-[8px] uppercase text-slate-400 font-bold tracking-widest">
                  Nomor Anggota Koperasi
                </p>
                <p className="text-base font-mono font-bold tracking-wider text-emerald-300">
                  {member.nomor_anggota}
                </p>

                <div className="mt-2.5">
                  <h5 className="text-sm font-black text-white truncate">{member.nama_lengkap}</h5>
                  <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 truncate">
                    <Store className="w-3 h-3 shrink-0" />
                    <span>{member.nama_usaha}</span>
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Kategori: {member.kategori_usaha} • Sejak {member.tanggal_bergabung.slice(0, 4)}
                  </p>
                </div>
              </div>

              {/* QR Code generator */}
              <div className="shrink-0 bg-white p-2 rounded-2xl shadow-md flex flex-col items-center">
                <svg viewBox="0 0 100 100" className="w-18 h-18 text-slate-900">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="26" height="26" fill="currentColor" rx="4" />
                  <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="13" width="10" height="10" fill="currentColor" rx="2" />

                  <rect x="69" y="5" width="26" height="26" fill="currentColor" rx="4" />
                  <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="77" y="13" width="10" height="10" fill="currentColor" rx="2" />

                  <rect x="5" y="69" width="26" height="26" fill="currentColor" rx="4" />
                  <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="77" width="10" height="10" fill="currentColor" rx="2" />

                  {/* Simulated matrix patterns */}
                  <rect x="36" y="10" width="6" height="6" fill="currentColor" />
                  <rect x="46" y="10" width="6" height="6" fill="currentColor" />
                  <rect x="56" y="10" width="6" height="6" fill="currentColor" />

                  <rect x="36" y="24" width="8" height="8" fill="currentColor" />
                  <rect x="50" y="24" width="12" height="6" fill="currentColor" />

                  <rect x="10" y="38" width="6" height="6" fill="currentColor" />
                  <rect x="22" y="38" width="8" height="8" fill="currentColor" />
                  <rect x="36" y="38" width="28" height="8" fill="currentColor" />
                  <rect x="70" y="38" width="20" height="8" fill="currentColor" />

                  <rect x="10" y="52" width="20" height="8" fill="currentColor" />
                  <rect x="38" y="52" width="10" height="10" fill="currentColor" />
                  <rect x="54" y="52" width="18" height="6" fill="currentColor" />
                  <rect x="78" y="52" width="12" height="12" fill="currentColor" />

                  <rect x="36" y="68" width="8" height="8" fill="currentColor" />
                  <rect x="48" y="68" width="16" height="6" fill="currentColor" />
                  <rect x="36" y="82" width="24" height="8" fill="currentColor" />
                  <rect x="66" y="76" width="12" height="14" fill="currentColor" />
                  <rect x="84" y="76" width="10" height="14" fill="currentColor" />
                </svg>
                <span className="text-[7px] font-mono font-bold text-slate-800 mt-0.5">
                  {member.member_id}
                </span>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-white/10 flex justify-between items-center z-10 text-[9px] text-slate-400">
              <span>ID: {member.member_id}</span>
              <span className="text-emerald-400 font-bold">Banuarasa Weekend Market</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Tunjukkan QR Code ini kepada panitia saat check-in di stand Banuarasa Weekend Market.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full mt-5">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Selesai</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
