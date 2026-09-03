import React, { useState, useMemo } from 'react';
import { EventItem, EventRegistration, Stand, Member } from '../types';
import { generateAll64Stands, getStandPrice } from '../services/standEngine';
import { storage } from '../services/storage';
import {
  X,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Layers,
  ShoppingBag,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface StandMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  currentMember?: Member | null;
  onBookingSuccess: (registration: EventRegistration) => void;
}

export const StandMapModal: React.FC<StandMapModalProps> = ({
  isOpen,
  onClose,
  event,
  currentMember,
  onBookingSuccess,
}) => {
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState<'ALL' | 'A-J' | '1-43' | '44-54'>('ALL');

  const allStands = useMemo(() => generateAll64Stands(), []);
  const registrations = storage.getRegistrations(event.event_id);

  if (!isOpen) return null;

  // Map each stand with its current booking status
  const getStandStatus = (standCode: string) => {
    const targetCode = String(standCode || '').trim().toUpperCase();
    const reg = registrations.find(
      (r) =>
        String(r.stand_code || '').trim().toUpperCase() === targetCode &&
        ['RESERVED', 'WAITING_PAYMENT', 'PAYMENT_VERIFICATION', 'CONFIRMED'].includes(
          r.registration_status
        )
    );
    if (!reg) return { status: 'AVAILABLE', registration: null };
    return { status: reg.registration_status, registration: reg };
  };

  const filteredStands = allStands.filter((s) => {
    if (activeZoneFilter === 'A-J') return s.stand_category === 'KATEGORI_1';
    if (activeZoneFilter === '1-43') return s.stand_category === 'KATEGORI_2';
    if (activeZoneFilter === '44-54') return s.stand_category === 'KATEGORI_3';
    return true;
  });

  const availableCount = allStands.filter((s) => getStandStatus(s.stand_code).status === 'AVAILABLE').length;
  const occupiedCount = 64 - availableCount;

  const handleSelectStand = (stand: Stand) => {
    const { status, registration } = getStandStatus(stand.stand_code);
    if (status !== 'AVAILABLE') {
      if (currentMember && registration?.member_id === currentMember.member_id) {
        setErrorMessage(`Anda telah memilih stand ini dengan status: ${status}.`);
      } else {
        setErrorMessage(`Stand ${stand.stand_code} sedang terisi (${status}) oleh penyewa ID: ${registration?.member_id || '-'}.`);
      }
      return;
    }
    setErrorMessage(null);
    setSelectedStand(stand);
  };

  const handleConfirmReservation = async () => {
    if (!selectedStand) return;
    if (!currentMember) {
      setErrorMessage('Mode Inspeksi Admin: Hanya anggota UMKM yang dapat membooking stand.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await storage.reserveStand(
      event.event_id,
      selectedStand.stand_code,
      currentMember.member_id,
      notes
    );

    setIsSubmitting(false);

    if (result.success && result.registration) {
      onBookingSuccess(result.registration);
      onClose();
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Denah 64 Stand
              </span>
              <span className="text-xs text-slate-400 font-semibold">• {event.event_name}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
              Pilih Stand Banuarasa Weekend Market
            </h2>
            <p className="text-xs text-emerald-300">
              {event.location} • Tanggal: {event.event_date} ({event.start_time} - {event.end_time} WITA)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Filter & Legend Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Zone Filter Tabs */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold mr-1">Zona:</span>
            {[
              { id: 'ALL', label: 'Semua (64 Stand)' },
              { id: 'A-J', label: 'Kategori 1 (A s/d J) • Rp50k' },
              { id: '1-43', label: 'Kategori 2 (1 s/d 43) • Rp50k' },
              { id: '44-54', label: 'Kategori 3 (44 s/d 54) • Rp35k' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveZoneFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  activeZoneFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600 inline-block"></span>
              <span>Available ({availableCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-400 border border-amber-500 inline-block"></span>
              <span>Waiting Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-sky-400 border border-sky-500 inline-block"></span>
              <span>Verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-slate-900 inline-block"></span>
              <span>Confirmed ({occupiedCount})</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Perhatian</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Section 1: Category 1 (A-J) - Rp50.000 */}
          {(activeZoneFilter === 'ALL' || activeZoneFilter === 'A-J') && (
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md uppercase">
                    Kategori 1
                  </span>
                  <h3 className="font-bold text-sm text-slate-800">
                    Kategori 1 (A sampai J)
                  </h3>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Rp50.000 / Event
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                {allStands
                  .filter((s) => s.stand_category === 'KATEGORI_1')
                  .map((stand) => {
                    const { status } = getStandStatus(stand.stand_code);
                    const isSelected = selectedStand?.stand_code === stand.stand_code;
                    const isAvailable = status === 'AVAILABLE';

                    let btnColor = 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs';
                    if (status === 'WAITING_PAYMENT') btnColor = 'bg-amber-400 text-amber-950 border-amber-500 cursor-not-allowed opacity-90';
                    else if (status === 'PAYMENT_VERIFICATION') btnColor = 'bg-sky-500 text-white border-sky-600 cursor-not-allowed opacity-90';
                    else if (status === 'CONFIRMED') btnColor = 'bg-slate-800 text-slate-300 border-slate-900 cursor-not-allowed opacity-75';

                    if (isSelected) {
                      btnColor = 'ring-4 ring-emerald-400 ring-offset-2 bg-emerald-600 text-white font-black scale-105 shadow-lg';
                    }

                    return (
                      <button
                        key={stand.stand_id}
                        type="button"
                        onClick={() => handleSelectStand(stand)}
                        className={`h-16 rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${btnColor}`}
                      >
                        <span className="text-lg font-black tracking-tight">{stand.stand_code}</span>
                        <span className="text-[9px] uppercase font-bold tracking-tighter opacity-90">
                          {status === 'AVAILABLE' ? '50k' : status === 'CONFIRMED' ? 'TERISI' : status.slice(0, 7)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Section 2: Category 2 (1-43) - Rp50.000 */}
          {(activeZoneFilter === 'ALL' || activeZoneFilter === '1-43') && (
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[10px] rounded-md uppercase">
                    Kategori 2
                  </span>
                  <h3 className="font-bold text-sm text-slate-800">
                    Kategori 2 (1 sampai 43)
                  </h3>
                </div>
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  Rp50.000 / Event
                </span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-11 md:grid-cols-12 gap-2">
                {allStands
                  .filter((s) => s.stand_category === 'KATEGORI_2')
                  .map((stand) => {
                    const { status } = getStandStatus(stand.stand_code);
                    const isSelected = selectedStand?.stand_code === stand.stand_code;

                    let btnColor = 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs';
                    if (status === 'WAITING_PAYMENT') btnColor = 'bg-amber-400 text-amber-950 border-amber-500 cursor-not-allowed opacity-90';
                    else if (status === 'PAYMENT_VERIFICATION') btnColor = 'bg-sky-500 text-white border-sky-600 cursor-not-allowed opacity-90';
                    else if (status === 'CONFIRMED') btnColor = 'bg-slate-800 text-slate-300 border-slate-900 cursor-not-allowed opacity-75';

                    if (isSelected) {
                      btnColor = 'ring-4 ring-emerald-400 ring-offset-2 bg-emerald-600 text-white font-black scale-105 shadow-lg';
                    }

                    return (
                      <button
                        key={stand.stand_id}
                        type="button"
                        onClick={() => handleSelectStand(stand)}
                        className={`h-13 rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${btnColor}`}
                      >
                        <span className="text-sm font-black">{stand.stand_code}</span>
                        <span className="text-[8px] uppercase font-bold tracking-tighter opacity-90">
                          {status === 'AVAILABLE' ? '50k' : status === 'CONFIRMED' ? 'ISI' : 'BOOK'}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Section 3: Category 3 (44-54) - Rp35.000 */}
          {(activeZoneFilter === 'ALL' || activeZoneFilter === '44-54') && (
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded-md uppercase">
                    Kategori 3
                  </span>
                  <h3 className="font-bold text-sm text-slate-800">
                    Kategori 3 (44 sampai 54)
                  </h3>
                </div>
                <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Rp35.000 / Event
                </span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-2.5">
                {allStands
                  .filter((s) => s.stand_category === 'KATEGORI_3')
                  .map((stand) => {
                    const { status } = getStandStatus(stand.stand_code);
                    const isSelected = selectedStand?.stand_code === stand.stand_code;

                    let btnColor = 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs';
                    if (status === 'WAITING_PAYMENT') btnColor = 'bg-amber-400 text-amber-950 border-amber-500 cursor-not-allowed opacity-90';
                    else if (status === 'PAYMENT_VERIFICATION') btnColor = 'bg-sky-500 text-white border-sky-600 cursor-not-allowed opacity-90';
                    else if (status === 'CONFIRMED') btnColor = 'bg-slate-800 text-slate-300 border-slate-900 cursor-not-allowed opacity-75';

                    if (isSelected) {
                      btnColor = 'ring-4 ring-emerald-400 ring-offset-2 bg-emerald-600 text-white font-black scale-105 shadow-lg';
                    }

                    return (
                      <button
                        key={stand.stand_id}
                        type="button"
                        onClick={() => handleSelectStand(stand)}
                        className={`h-14 rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${btnColor}`}
                      >
                        <span className="text-base font-black">{stand.stand_code}</span>
                        <span className="text-[8px] uppercase font-bold tracking-tighter opacity-90">
                          {status === 'AVAILABLE' ? '35k' : status === 'CONFIRMED' ? 'ISI' : 'BOOK'}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Booking Summary Footer */}
        <div className="bg-slate-900 text-white px-6 sm:px-8 py-4 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {selectedStand ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md">
                  {selectedStand.stand_code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Stand Terpilih:</span>
                    <span className="text-sm font-black text-white">Stand {selectedStand.stand_code}</span>
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded">
                      {selectedStand.zone_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Biaya Partisipasi Otomatis:{' '}
                    <span className="font-black text-emerald-400 text-sm">
                      Rp{selectedStand.participation_price.toLocaleString('id-ID')}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Klik salah satu stand berwarna hijau di atas untuk melihat detail dan melakukan booking.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors w-full sm:w-auto"
            >
              Batal
            </button>
            {currentMember ? (
              <button
                type="button"
                disabled={!selectedStand || isSubmitting}
                onClick={handleConfirmReservation}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Memproses Lock Stand...</span>
                  </>
                ) : (
                  <>
                    <span>KONFIRMASI BOOKING STAND</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all w-full sm:w-auto"
              >
                Selesai Inspeksi Denah
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
