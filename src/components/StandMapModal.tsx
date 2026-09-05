import React, { useState, useEffect } from 'react';
import { EventItem, Member, MasterStand, EventStand } from '../types';
import { storage } from '../services/storage';
import { callGoogleAppsScript } from '../services/googleWorkspaceSync';

interface StandMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvent: EventItem | null;
  currentMember: Member | null;
  onBookingSuccess: () => void;
}

export const StandMapModal: React.FC<StandMapModalProps> = ({
  isOpen,
  onClose,
  activeEvent,
  currentMember,
  onBookingSuccess
}) => {
  const [stands, setStands] = useState<MasterStand[]>([]);
  const [eventStands, setEventStands] = useState<EventStand[]>([]);
  const [selectedStand, setSelectedStand] = useState<MasterStand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStands(storage.getStands());
      if (activeEvent) {
        setEventStands(storage.getEventStands(activeEvent.event_id));
      }
      setSelectedStand(null);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, activeEvent]);

  if (!isOpen || !activeEvent) return null;

  const getStandStatus = (standId: string) => {
    const matched = eventStands.find(es => es.stand_id === standId);
    if (!matched) return 'AVAILABLE';

    const now = new Date().getTime();
    const expiry = matched.lock_expires_at ? new Date(matched.lock_expires_at).getTime() : 0;
    const isLocked = expiry > now;

    if (matched.booking_status === 'CONFIRMED') return 'CONFIRMED';
    if (isLocked) return 'RESERVED';
    return 'AVAILABLE';
  };

  const handleBookStand = async () => {
    if (!selectedStand) return;
    if (!currentMember) {
      setErrorMessage('Silakan masuk ke akun Member terlebih dahulu untuk memesan stand.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 1. Catat reservasi ke Google Apps Script (dengan atomic lock)
      const response = await callGoogleAppsScript('bookStand', {
        event_id: activeEvent.event_id,
        stand_id: selectedStand.stand_id,
        stand_code: selectedStand.stand_code,
        member_id: currentMember.member_id,
        member_name: currentMember.nama_lengkap
      });

      if (!response.success) {
        throw new Error(response.error || 'Gagal memproses pemesanan stand.');
      }

      // 2. Sinkronkan pemesanan ke cache lokal
      storage.bookStand(activeEvent.event_id, selectedStand.stand_id, currentMember);

      setSuccessMessage(`Berhasil memesan Stand ${selectedStand.stand_code}! Silakan lakukan pembayaran dalam 15 menit.`);
      setTimeout(() => {
        onBookingSuccess();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi gangguan saat memesan stand. Coba beberapa saat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Denah Stand — {activeEvent.title}</h2>
            <p className="text-xs text-slate-500">Pilih stand yang masih berwarna hijau untuk melakukan reservasi (15 Menit).</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Notifikasi Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* Legend Status Stand */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-slate-100 bg-white text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-sm bg-emerald-500"></span>
            <span>Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-sm bg-amber-400"></span>
            <span>Dipesan (Lock 15 Mnt)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-sm bg-slate-300"></span>
            <span>Terisi Penuh</span>
          </div>
        </div>

        {/* Grid Peta Stand */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {stands.map((stand) => {
              const status = getStandStatus(stand.stand_id);
              const isSelected = selectedStand?.stand_id === stand.stand_id;

              let btnColor = 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-500';
              if (status === 'RESERVED') {
                btnColor = 'bg-amber-50 text-amber-600 border-amber-300 cursor-not-allowed';
              } else if (status === 'CONFIRMED') {
                btnColor = 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed';
              }

              if (isSelected) {
                btnColor = 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400';
              }

              return (
                <button
                  key={stand.stand_id}
                  disabled={status !== 'AVAILABLE' || isSubmitting}
                  onClick={() => setSelectedStand(stand)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold transition ${btnColor}`}
                >
                  <span className="text-sm">{stand.stand_code}</span>
                  <span className="text-[10px] opacity-80">{stand.zone}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Aksi */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white">
          <div>
            {selectedStand ? (
              <div className="text-sm">
                <span className="text-slate-500">Stand Terpilih:</span>{' '}
                <span className="font-bold text-slate-800">{selectedStand.stand_code}</span>{' '}
                <span className="text-emerald-600 font-semibold">(Rp {selectedStand.base_price.toLocaleString('id-ID')})</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Pilih salah satu stand di atas</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              onClick={handleBookStand}
              disabled={!selectedStand || isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition flex items-center gap-2"
            >
              {isSubmitting ? 'Memproses...' : 'Booking Stand'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandMapModal;
