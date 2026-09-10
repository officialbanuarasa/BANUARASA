import React, { useState, useEffect, useRef } from 'react';
import { EventRegistration, Member, PaymentType, PaymentMethod } from '../types';
import { googleWorkspaceSync } from '../services/googleWorkspaceSync';
import { storage } from '../services/storage';
import {
  X,
  UploadCloud,
  CheckCircle2,
  Copy,
  Building2,
  QrCode,
  ShieldCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember?: Member | null;
  registration?: EventRegistration | null;
  paymentType?: PaymentType;
  defaultAmount?: number;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  registration,
  paymentType = 'EVENT_PARTICIPATION',
  defaultAmount = 50000,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('TRANSFER_BANK');
  const [amount, setAmount] = useState<number>(
    registration && registration.stand_price ? registration.stand_price : defaultAmount
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsSubmitted(false);
    setError(null);
    setUploadStatus(null);
    setProofFile(null);
    setIsSubmitting(false);
  }, [isOpen, registration?.registration_id]);

  useEffect(() => {
    if (registration && registration.stand_price) {
      setAmount(registration.stand_price);
    } else if (defaultAmount) {
      setAmount(defaultAmount);
    }
  }, [registration, defaultAmount]);

  if (!isOpen) return null;

  const memberId = currentMember?.member_id || registration?.member_id || 'MEMBER';
  const koperasiConfig = storage.getKoperasiConfig();
  const officialBank = 'Bank Mandiri';
  const officialAccount = '1490030302105';
  const officialAccountName = 'Koperasi Berau Melangkah Bersama';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(id);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleProofFileChange = (file: File | null) => {
    setError(null);
    setUploadStatus(null);
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format bukti pembayaran harus JPG, PNG, atau PDF.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran bukti pembayaran maksimal 2 MB.');
      return;
    }

    setProofFile(file);
    if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    setProofPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
  };

  useEffect(() => () => {
    if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
  }, [proofPreviewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) {
      setError('Silakan pilih bukti pembayaran terlebih dahulu melalui tombol Pilih File Bukti Pembayaran.');
      return;
    }

    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setError(null);
    setUploadStatus('Mengirim bukti pembayaran ke Google Drive...');

    try {
      const driveResult = await googleWorkspaceSync.uploadFile(
        proofFile,
        'BUKTI_PEMBAYARAN',
        memberId,
        currentMember?.nama_lengkap || memberId
      );

      if (!driveResult?.success) {
        throw new Error(driveResult?.error || driveResult?.message || 'Upload bukti pembayaran gagal.');
      }

      const uploaded = (driveResult.result || driveResult.data || driveResult) as any;
      const payment = await storage.uploadPaymentProof({
        registration_id: registration?.registration_id,
        member_id: memberId,
        payment_type: (paymentType || 'EVENT_PARTICIPATION') as PaymentType,
        amount: Number(amount) || 50000,
        payment_method: selectedMethod,
        proof_file_url: uploaded.directImageUrl || uploaded.driveUrl || '',
        proof_file_id: uploaded.fileId || '',
        proof_file_name: proofFile.name,
      });

      if (!payment) throw new Error('Data pembayaran gagal disimpan.');

      setUploadStatus('Bukti pembayaran berhasil dikirim. Pembayaran akan diverifikasi manual oleh Pengurus Koperasi maksimal 1x24 jam.');
      setIsSubmitted(true);
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      setUploadStatus(null);
      setIsSubmitted(false);
      setError(err?.message || 'Terjadi kesalahan saat mengirim bukti pembayaran.');
    }
  };

  const getDrivePathPreview = () => {
    if (registration) {
      return `02_EVENT/2026/${registration.event_id || 'BWM-001'}/Pembayaran/${registration.registration_id || 'REG'}/`;
    }
    return `01_ANGGOTA/${memberId}/Simpanan/`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                {String(paymentType || 'EVENT_PARTICIPATION').replace('_', ' ')}
              </span>
              {registration && (
                <span className="text-xs text-slate-400 font-semibold">
                  • Stand {registration.stand_code} ({registration.registration_id})
                </span>
              )}
            </div>
            <h2 className="text-lg font-black tracking-tight">Form Pembayaran & Upload Bukti</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Nominal Summary Box */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                Total Tagihan Pembayaran
              </p>
              <p className="text-2xl font-black text-emerald-950">
                Rp{amount.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {paymentType === 'EVENT_PARTICIPATION'
                  ? `Biaya Stand ${registration?.stand_code || ''} Banuarasa Weekend Market`
                  : `Setoran ${String(paymentType || '').replace('_', ' ')}`}
              </p>
            </div>
            <ShieldCheck className="w-10 h-10 text-emerald-600 opacity-80" />
          </div>

          {/* Rekening Tujuan Resmi */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Rekening Resmi Koperasi Berau Melangkah Bersama
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bank Mandiri */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      MANDIRI
                    </span>
                    <span className="text-xs font-bold text-slate-800">{officialBank}</span>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-900">{officialAccount}</p>
                  <p className="text-[10px] text-slate-500">A/n. {officialAccountName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(officialAccount, 'mandiri')}
                  className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                  title="Salin Nomor Rekening"
                >
                  {copiedBank === 'mandiri' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Whatsapp Konfirmasi */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      WA KONFIRMASI
                    </span>
                    <span className="text-xs font-bold text-slate-800">WhatsApp Admin</span>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-900">{koperasiConfig.nomor_wa_konfirmasi || '—'}</p>
                  <p className="text-[10px] text-slate-500">Kontak konfirmasi pembayaran</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(koperasiConfig.nomor_wa_konfirmasi || '', 'whatsapp')}
                  className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                  title="Salin Nomor WhatsApp"
                >
                  {copiedBank === 'whatsapp' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'TRANSFER_BANK', label: 'Transfer Bank', icon: Building2 },
                { id: 'QRIS', label: 'QRIS Dinamis', icon: QrCode },
                { id: 'CASH', label: 'Tunai di Kantor', icon: FileText },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-1.5 transition-colors ${
                      selectedMethod === m.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Bukti */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Unggah Bukti Transfer / Resi
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/70 p-5 rounded-2xl text-center space-y-3 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Pilih bukti pembayaran dari perangkat Anda
                </p>
                <p className="text-[10px] text-slate-500">
                  Pilih JPG, PNG, atau PDF (Maks. 2MB). File belum dikirim sampai tombol Kirim Bukti Pembayaran ditekan.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) => {
                  handleProofFileChange(e.target.files?.[0] || null);
                  e.currentTarget.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto px-4 py-2.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-black hover:bg-emerald-50"
              >
                Pilih File Bukti Pembayaran
              </button>

              {proofFile && (
                <div className="mt-3 p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-3 text-left">
                  {proofPreviewUrl ? (
                    <img src={proofPreviewUrl} alt="Preview Bukti" className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-[10px] font-black">PDF</div>
                  )}
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{proofFile.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{(proofFile.size / 1024).toFixed(0)} KB • {getDrivePathPreview()}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">Siap Kirim</span>
                </div>
              )}

              {uploadStatus && <p className={`text-[10px] font-bold ${isSubmitted ? 'text-emerald-700' : 'text-slate-600'}`}>{uploadStatus}</p>}
            </div>
          </div>

          {isSubmitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-emerald-900">Bukti pembayaran berhasil dikirim</p>
                <p className="text-xs text-emerald-800 mt-1">Bukti sudah dikirim ke Google Drive dan data pembayaran sudah dicatat. Pembayaran akan diverifikasi manual oleh Pengurus Koperasi maksimal 1x24 jam.</p>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              Verifikasi manual oleh Pengurus Koperasi berlangsung maksimal 1x24 jam. Status stand akan langsung aktif setelah disetujui.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!isSubmitted ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !proofFile}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Mengirim ke Google Drive...' : 'KIRIM BUKTI PEMBAYARAN'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                SELESAI
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
