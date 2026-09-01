import React, { useState } from 'react';
import { Payment } from '../types';
import { storage } from '../services/storage';
import {
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  Store,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

interface PaymentProofViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  adminId: string;
  onProcessed: () => void;
}

export const PaymentProofViewerModal: React.FC<PaymentProofViewerModalProps> = ({
  isOpen,
  onClose,
  payment,
  adminId,
  onProcessed,
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);

  if (!isOpen || !payment) return null;

  const member = storage.getMemberById(payment.member_id);
  const registration = payment.registration_id
    ? storage.getRegistrations().find((r) => r.registration_id === payment.registration_id)
    : null;

  const handleApprove = () => {
    setIsSubmitting(true);
    storage.verifyPayment(payment.payment_id, adminId, true);
    setIsSubmitting(false);
    onProcessed();
    onClose();
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Wajib memasukkan alasan penolakan pembayaran.');
      return;
    }
    setIsSubmitting(true);
    storage.verifyPayment(payment.payment_id, adminId, false, rejectionReason);
    setIsSubmitting(false);
    onProcessed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Verifikasi Pembayaran
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">• {payment.payment_id}</span>
            </div>
            <h2 className="text-lg font-black tracking-tight">Pemeriksaan Bukti Transfer Masuk</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Transaction Details */}
          <div className="space-y-4 text-xs">
            {/* Amount Banner */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Nominal Transfer
              </p>
              <p className="text-2xl font-black text-emerald-950">
                Rp{payment.amount.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                Tipe: {payment.payment_type.replace('_', ' ')} via {payment.payment_method}
              </p>
            </div>

            {/* Member Info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <User className="w-4 h-4 text-emerald-600" />
                Data Anggota / Pembayar
              </h4>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Nama Anggota</p>
                <p className="font-bold text-slate-800 text-sm">{member?.nama_lengkap || payment.member_id}</p>
                <p className="text-slate-500 font-mono text-[10px]">{member?.nomor_anggota}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Nama Usaha / Tenant</p>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  {member?.nama_usaha}
                </p>
              </div>
            </div>

            {/* Event & Stand Info if applicable */}
            {registration && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Detail Stand & Event
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Kode Stand</p>
                    <p className="text-base font-black text-emerald-700">Stand {registration.stand_code}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Biaya Stand</p>
                    <p className="font-bold text-slate-800">
                      Rp{registration.stand_price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Registration ID</p>
                  <p className="font-mono text-[11px] text-slate-700">{registration.registration_id}</p>
                </div>
              </div>
            )}

            {/* Google Drive Path Metadata */}
            <div className="p-3 bg-slate-100 rounded-xl font-mono text-[10px] text-slate-600 break-all">
              <span className="font-bold text-slate-700">Drive ID:</span> {payment.proof_file_id}
            </div>
          </div>

          {/* Right: Proof Receipt Image & Actions */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Bukti Transfer / Struk Resmi
                </label>
                <button
                  type="button"
                  onClick={() => setZoomImage(!zoomImage)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {zoomImage ? 'Kecilkan' : 'Perbesar'}
                </button>
              </div>

              <div
                onClick={() => setZoomImage(!zoomImage)}
                className={`bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer transition-all ${
                  zoomImage ? 'h-80' : 'h-60'
                }`}
              >
                <img
                  src={payment.proof_file_url}
                  alt="Bukti Transfer"
                  className="w-full h-full object-contain hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                Tanggal Bukti: {payment.payment_date} • Klik gambar untuk memperbesar
              </p>
            </div>

            {/* Rejection Form or Main Buttons */}
            {showRejectForm ? (
              <form onSubmit={handleReject} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Alasan Penolakan Pembayaran</span>
                </div>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer buram / nominal tidak sesuai / nama rekening pengirim tidak jelas..."
                  className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[70px]"
                  required
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'KIRIM PENOLAKAN'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>TOLAK PEMBAYARAN</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleApprove}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFIKASI & SETUJUI</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Setelah disetujui, status stand atau simpanan anggota akan langsung terkonfirmasi otomatis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
