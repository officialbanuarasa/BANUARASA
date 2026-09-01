import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../services/storage';
import { EventItem, EventRegistration, Member } from '../types';
import {
  X,
  QrCode,
  CheckCircle2,
  Camera,
  Search,
  Store,
  UserCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  adminId,
}) => {
  const [manualInput, setManualInput] = useState('');
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    registration?: EventRegistration;
    member?: Member;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const events = storage.getEvents();
      setActiveEvent(events[0] || null);
      setScanResult(null);
      setManualInput('');
    }
  }, [isOpen]);

  if (!isOpen || !activeEvent) return null;

  const handleProcessScan = (codeToScan: string) => {
    if (!codeToScan.trim()) return;
    const result = storage.processEventCheckIn(codeToScan.trim(), activeEvent.event_id, adminId);
    setScanResult(result);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessScan(manualInput);
  };

  // Get confirmed registrations for quick testing simulation
  const confirmedRegistrations = storage
    .getRegistrations(activeEvent.event_id)
    .filter((r) => r.registration_status === 'CONFIRMED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Scanner Kehadiran
              </span>
              <span className="text-xs text-slate-400 font-semibold">• {activeEvent.event_name}</span>
            </div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              Scan QR Code Check-In Tenant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-5">
          {/* Scanner Viewfinder Box */}
          <div className="relative w-full h-56 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800 text-white p-4">
            {/* Animated Scan Line */}
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10B981] animate-pulse"></div>

            <div className="w-40 h-40 border-2 border-emerald-500/60 rounded-2xl relative flex items-center justify-center">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400"></div>
              <QrCode className="w-16 h-16 text-emerald-400/40" />
            </div>

            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5 font-medium">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              Arahkan kamera ke Digital Member Card / QR Code Tenant
            </p>
          </div>

          {/* Scan Result Feedback Box */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 ${
                scanResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-grow">
                  <h4 className="text-sm font-black mb-1">
                    {scanResult.success ? 'Check-In Berhasil Terverifikasi' : 'Check-In Ditolak'}
                  </h4>
                  <p className="text-xs leading-relaxed">{scanResult.message}</p>

                  {scanResult.member && scanResult.registration && (
                    <div className="mt-3 p-3 bg-white/90 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{scanResult.member.nama_lengkap}</p>
                        <p className="text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                          <Store className="w-3.5 h-3.5 text-emerald-600" />
                          {scanResult.member.nama_usaha}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-emerald-600 text-white font-black text-sm rounded-lg shadow-sm">
                          Stand {scanResult.registration.stand_code}
                        </span>
                        <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Hadir di Lokasi</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Manual / Test Barcode Input */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Atau Masukkan Nomor Member ID / Registration ID Manual
            </label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Contoh: BM-00241 atau REG-20260906-0001"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors shrink-0"
              >
                Proses Check-In
              </button>
            </div>
          </form>

          {/* One-Click Simulator for Testing */}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Simulasi Cepat Tenant Terdaftar (1-Klik):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {confirmedRegistrations.map((reg) => {
                const member = storage.getMemberById(reg.member_id);
                return (
                  <button
                    key={reg.registration_id}
                    type="button"
                    onClick={() => handleProcessScan(reg.member_id)}
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left flex items-center justify-between transition-colors text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{member?.nama_lengkap}</p>
                      <p className="text-[10px] text-slate-500">{member?.nama_usaha}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded text-[11px]">
                      Stand {reg.stand_code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
