import React, { useState } from 'react';
import { Member } from '../types';
import { storage } from '../services/storage';
import { BANUARASA_ASSETS, BARA_ASSETS } from '../assets/baraAssets';
import {
  X,
  QrCode,
  ShieldCheck,
  Printer,
  Award,
  Store,
  RotateCw,
  Edit3,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { MemberProfileEditModal } from './MemberProfileEditModal';

interface DigitalMemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onMemberUpdated?: (updatedMember: Member) => void;
}

export const DigitalMemberCardModal: React.FC<DigitalMemberCardModalProps> = ({
  isOpen,
  onClose,
  member,
  onMemberUpdated,
}) => {
  if (!isOpen) return null;

  const [activeSide, setActiveSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const design = storage.getMemberCardDesign();
  const liveMember = storage.getMemberById(member.member_id) || member;

  const handlePrint = () => {
    window.print();
  };

  const getThemeClasses = () => {
    switch (design.theme) {
      case 'EMERALD_GOLD':
        return {
          gradient: 'from-emerald-900 via-teal-950 to-slate-950',
          border: 'border-amber-400/60 shadow-amber-500/10',
          badge: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
          textMuted: 'text-amber-100/75',
          textAccent: 'text-amber-300',
        };
      case 'ROYAL_PURPLE':
        return {
          gradient: 'from-purple-950 via-indigo-950 to-slate-950',
          border: 'border-purple-400/50 shadow-purple-500/10',
          badge: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
          textMuted: 'text-purple-200/75',
          textAccent: 'text-purple-300',
        };
      case 'OCEAN_BLUE':
        return {
          gradient: 'from-sky-950 via-blue-950 to-slate-950',
          border: 'border-cyan-400/50 shadow-cyan-500/10',
          badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30',
          textMuted: 'text-cyan-200/75',
          textAccent: 'text-cyan-300',
        };
      case 'MINIMAL_LIGHT':
        return {
          gradient: 'from-slate-50 via-emerald-50/50 to-slate-100',
          border: 'border-emerald-400 shadow-emerald-500/10',
          badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
          textMuted: 'text-slate-500',
          textAccent: 'text-emerald-700',
        };
      case 'LUXURY_SLATE':
      default:
        return {
          gradient: 'from-slate-950 via-slate-900 to-emerald-950',
          border: 'border-emerald-500/50 shadow-emerald-500/10',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
          textMuted: 'text-slate-400',
          textAccent: 'text-emerald-400',
        };
    }
  };

  const theme = getThemeClasses();
  const isLight = design.theme === 'MINIMAL_LIGHT';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">
                {design.cardTitle || 'KTA Digital Banuarasa Weekend Market'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Edit Biodata & Foto Anggota"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Biodata</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 flex flex-col items-center space-y-4">
            {/* Flip Controls */}
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kartu Tanda Anggota Resmi Digital</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveSide(activeSide === 'FRONT' ? 'BACK' : 'FRONT')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{activeSide === 'FRONT' ? 'Lihat Sisi Belakang' : 'Lihat Sisi Depan'}</span>
              </button>
            </div>

            {/* The Digital Card Rendered */}
            <div
              id="printable-member-card"
              className={`w-full rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden bg-gradient-to-br ${
                theme.gradient
              } ${theme.border} border-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              } flex flex-col justify-between`}
              style={{ minHeight: '340px' }}
            >
              {/* Background Mascot Watermark */}
              <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-15 pointer-events-none select-none">
                <img
                  src={BARA_ASSETS.mascot}
                  alt="Bara Maskot"
                  className="w-full h-full object-contain"
                />
              </div>

              {activeSide === 'FRONT' ? (
                /* FRONT SIDE */
                <div className="relative z-10 flex flex-col justify-between h-full space-y-5">
                  {/* Top Bar with Logo & Badge */}
                  <div className="flex justify-between items-start border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-slate-950 shrink-0 p-1 flex items-center justify-center shadow-md">
                        <img
                          src={BANUARASA_ASSETS.logo}
                          alt="Logo Banua Rasa"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className={`text-[8px] uppercase tracking-wider font-bold ${theme.textAccent}`}>
                          {design.organizationName || 'KOPERASI BERAU MELANGKAH BERSAMA'}
                        </p>
                        <h4 className="text-xs font-black tracking-tight leading-none mt-0.5">
                          {design.marketName || 'BANUARASA WEEKEND MARKET'}
                        </h4>
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${theme.badge}`}>
                      {design.badgeText || 'ANGGOTA RESMI'}
                    </span>
                  </div>

                  {/* Middle: Member Photo, Details & QR */}
                  <div className="flex items-center gap-4 my-auto">
                    {design.showPhoto && (
                      <div className="relative shrink-0">
                        <img
                          src={
                            liveMember.foto_profil_url ||
                            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
                          }
                          alt={liveMember.nama_lengkap}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md bg-slate-800"
                        />
                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-slate-950 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <p className={`text-[9px] font-mono font-bold tracking-widest ${theme.textAccent}`}>
                        {liveMember.nomor_anggota}
                      </p>
                      <h4 className="text-base font-black truncate leading-tight">
                        {liveMember.nama_lengkap}
                      </h4>
                      {design.showBusinessName && (
                        <p className="text-xs font-bold truncate flex items-center gap-1 opacity-90">
                          <Store className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          <span>{liveMember.nama_usaha}</span>
                        </p>
                      )}
                      {design.showCategory && (
                        <p className={`text-[9px] ${theme.textMuted}`}>
                          Kategori: {liveMember.kategori_usaha || 'Kuliner'}
                        </p>
                      )}
                    </div>

                    {design.showQrCode && (
                      <div className="shrink-0 bg-white p-2 rounded-2xl shadow-md flex flex-col items-center">
                        <QrCode className="w-12 h-12 text-slate-900" />
                        <span className="text-[7px] font-mono font-bold text-slate-800 mt-0.5">
                          {liveMember.member_id}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Address & Validity */}
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[9px]">
                    <div className={`${theme.textMuted} space-y-0.5 truncate max-w-[240px]`}>
                      {design.showAddress && (
                        <p className="truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{liveMember.alamat_usaha || liveMember.alamat || 'Berau, Kalimantan Timur'}</span>
                        </p>
                      )}
                      {design.showValidityPeriod && (
                        <p className="font-mono">
                          Masa Berlaku: s/d 2029 • Berau, Kaltim
                        </p>
                      )}
                    </div>
                    <span className={`font-mono font-bold ${theme.textAccent}`}>
                      ID: {liveMember.member_id}
                    </span>
                  </div>
                </div>
              ) : (
                /* BACK SIDE */
                <div className="relative z-10 flex flex-col justify-between h-full space-y-5">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${theme.textAccent}`}>
                        Legalitas & Hak Anggota
                      </span>
                      <Award className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className={`text-[11px] leading-relaxed mt-3 opacity-90 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {design.disclaimerNotes ||
                        'Kartu ini adalah bukti identitas sah anggota Koperasi Berau Melangkah Bersama dan berhak atas kuota 64 stand resmi Banuarasa Weekend Market.'}
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] opacity-75">Tanjung Redeb, Berau</p>
                      <p className="text-[10px] font-bold mt-0.5">
                        {design.authorizedOfficerTitle || 'Ketua Pengurus Koperasi'}
                      </p>
                      <div className="h-7 flex items-center">
                        <span className="font-serif italic text-xs text-emerald-400 opacity-85">
                          ( Tanda Tangan Digital Terverifikasi )
                        </span>
                      </div>
                      <p className="text-xs font-black underline">
                        {design.authorizedOfficerName || 'H. AHMAD FAUZI'}
                      </p>
                      {design.authorizedOfficerNip && (
                        <p className="text-[9px] font-mono opacity-70">
                          REG: {design.authorizedOfficerNip}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-bold text-emerald-300">
                        OFFICIAL VERIFIED
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Footer */}
            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Photo Edit Modal */}
      <MemberProfileEditModal
        isOpen={isEditProfileOpen}
        member={liveMember}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={(updated) => {
          if (onMemberUpdated) onMemberUpdated(updated);
        }}
      />
    </>
  );
};
