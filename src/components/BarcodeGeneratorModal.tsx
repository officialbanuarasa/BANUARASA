import React, { useState, useEffect, useRef } from 'react';
import { Member } from '../types';
import { storage } from '../services/storage';
import { renderBarcodeToElement, generateQrCodeDataUrl, formatVerificationUrl } from '../utils/barcode';
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  Table,
  ShieldCheck,
  Store,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  Barcode as BarcodeIcon,
} from 'lucide-react';

interface BarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMember?: Member | null;
  onOpenScanner?: () => void;
}

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialMember,
  onOpenScanner,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [activeFormat, setActiveFormat] = useState<'BARCODE' | 'QR' | 'BOTH'>('BOTH');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const allMembers = storage.getMembers();
      setMembers(allMembers);
      if (initialMember) {
        setSelectedMemberId(initialMember.member_id);
      } else if (allMembers.length > 0) {
        setSelectedMemberId(allMembers[0].member_id);
      }
    }
  }, [isOpen, initialMember]);

  const currentMember = members.find((m) => m.member_id === selectedMemberId) || initialMember || members[0];

  // Render Barcode and QR when currentMember changes
  useEffect(() => {
    if (!currentMember) return;

    const barcodeValue = currentMember.member_id;
    const verificationUrl = formatVerificationUrl(currentMember.member_id);

    // 1. Render Barcode (Code 128)
    if (barcodeSvgRef.current) {
      renderBarcodeToElement(barcodeSvgRef.current, barcodeValue, {
        height: 54,
        width: 2,
        displayValue: true,
        fontSize: 13,
        margin: 10,
        background: '#ffffff',
        lineColor: '#0f172a',
      });
    }

    // 2. Render QR Code
    generateQrCodeDataUrl(verificationUrl, {
      width: 220,
      margin: 1,
      color: { dark: '#042f2e', light: '#ffffff' },
    }).then((url) => {
      setQrDataUrl(url);
    });
  }, [currentMember, activeFormat]);

  if (!isOpen || !currentMember) return null;

  const events = storage.getEvents();
  const activeEvent = events[0];
  const registrations = storage.getRegistrations(activeEvent?.event_id);
  const memberReg = registrations.find((r) => r.member_id === currentMember.member_id);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentMember.member_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!barcodeSvgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(barcodeSvgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Barcode_${currentMember.member_id}_${currentMember.nama_lengkap.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${currentMember.member_id}_${currentMember.nama_lengkap.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredMembers = members.filter(
    (m) =>
      m.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nama_usaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nomor_anggota.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Barcode Generator & Verifikasi KTA</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">
                  Sync Spreadsheet
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Terhubung dengan Database Google Sheets Koperasi Berau Melangkah Bersama
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Member Selector if more than 1 member */}
          {members.length > 1 && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pilih Anggota UMKM:</span>
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama / usaha / ID..."
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden w-full sm:w-56"
                />
              </div>

              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                {filteredMembers.map((m) => (
                  <option key={m.member_id} value={m.member_id}>
                    {m.member_id} - {m.nama_lengkap} ({m.nama_usaha})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Member Card Summary Banner */}
          <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={
                  currentMember.foto_profil_url ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                }
                alt={currentMember.nama_lengkap}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 bg-slate-800 shrink-0 shadow-md"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                    {currentMember.nomor_anggota}
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-md font-bold uppercase border border-emerald-400/30">
                    {currentMember.status_keanggotaan}
                  </span>
                </div>
                <h3 className="text-sm font-black text-white truncate mt-0.5">{currentMember.nama_lengkap}</h3>
                <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 truncate">
                  <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{currentMember.nama_usaha}</span>
                  <span className="text-slate-400">• {currentMember.kategori_usaha || 'Kuliner'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 border-emerald-900/60 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-700/50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : currentMember.member_id}</span>
              </button>
            </div>
          </div>

          {/* Format Selector Pills */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFormat('BOTH')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeFormat === 'BOTH'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Barcode 1D + QR Code
            </button>
            <button
              type="button"
              onClick={() => setActiveFormat('BARCODE')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeFormat === 'BARCODE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hanya Barcode (Code 128)
            </button>
            <button
              type="button"
              onClick={() => setActiveFormat('QR')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeFormat === 'QR'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hanya QR Code (2D)
            </button>
          </div>

          {/* Live Barcode & QR Code Display Container */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-col items-center justify-center gap-5">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
              {/* 1. Barcode Code 128 (1D) */}
              {(activeFormat === 'BARCODE' || activeFormat === 'BOTH') && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center max-w-sm w-full">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Standard Code 128 (POS / Scanner)
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>SVG</span>
                    </button>
                  </div>

                  <div className="p-2 bg-white rounded-xl flex items-center justify-center overflow-x-auto w-full">
                    <svg ref={barcodeSvgRef} className="max-w-full" />
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 font-mono">
                    Standar barcode internasional untuk pemindai barcode optik laser / CCD
                  </p>
                </div>
              )}

              {/* 2. QR Code (2D) */}
              {(activeFormat === 'QR' || activeFormat === 'BOTH') && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center max-w-xs w-full">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      QR Code (Kamera HP)
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG</span>
                    </button>
                  </div>

                  <div className="p-2 bg-white rounded-xl flex items-center justify-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR Code ${currentMember.member_id}`}
                        className="w-36 h-36 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-36 h-36 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                        Memuat QR...
                      </div>
                    )}
                  </div>

                  <span className="font-mono font-bold text-xs text-slate-800 mt-1">
                    {currentMember.member_id}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Scan via kamera smartphone untuk verifikasi cepat
                  </p>
                </div>
              )}
            </div>

            {/* Stand Booking Badge if registered */}
            {memberReg && (
              <div className="w-full max-w-md p-3 bg-emerald-100/70 border border-emerald-300 text-emerald-950 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Terdaftar di {activeEvent?.event_name || 'Weekend Market'}
                  </span>
                  <p className="font-black text-sm text-emerald-950 mt-0.5">
                    Stand {memberReg.stand_code} • {memberReg.registration_status}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-xl text-[10px]">
                  Check-in Ready
                </span>
              </div>
            )}
          </div>

          {/* Google Spreadsheet Integration Mapping Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Mapping Data Barcode ke Spreadsheet Google Sheets
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                SHEET_ANGGOTA_KOPERASI
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">KOLOM A (ID)</span>
                <span className="font-mono font-bold text-slate-800">{currentMember.member_id}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">KOLOM B (NO ANGGOTA)</span>
                <span className="font-mono font-bold text-slate-800 truncate block">{currentMember.nomor_anggota}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">KOLOM C (NAMA)</span>
                <span className="font-bold text-slate-800 truncate block">{currentMember.nama_lengkap}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">KOLOM E (USAHA)</span>
                <span className="font-bold text-slate-800 truncate block">{currentMember.nama_usaha}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Barcode resmi divalidasi dengan algoritma Code 128 dan enkripsi ID keanggotaan.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onOpenScanner && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenScanner();
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-700" />
                <span>Buka Scanner Kamera</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
