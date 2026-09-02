import React, { useState, useEffect } from 'react';
import {
  Member,
  EventRegistration,
  Payment,
  Saving,
  SalesReport,
  PaymentType,
  PaymentMethod,
  MembershipStatus,
  EventItem,
} from '../types';
import { storage } from '../services/storage';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  UserPlus,
  CreditCard,
  Store,
  DollarSign,
  TrendingUp,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  adminId: string;
  onSaved: (msg: string) => void;
}

export const MemberCrudModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  adminId,
  onSaved,
}) => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nik: '',
    nama_usaha: '',
    kategori_usaha: 'Kuliner',
    whatsapp: '',
    email: '',
    alamat_usaha: '',
    status_keanggotaan: 'ACTIVE' as MembershipStatus,
  });

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        nama_lengkap: memberToEdit.nama_lengkap,
        nik: memberToEdit.nik || '',
        nama_usaha: memberToEdit.nama_usaha,
        kategori_usaha: memberToEdit.kategori_usaha,
        whatsapp: memberToEdit.whatsapp,
        email: memberToEdit.email,
        alamat_usaha: memberToEdit.alamat_usaha || '',
        status_keanggotaan: memberToEdit.status_keanggotaan,
      });
    } else {
      setFormData({
        nama_lengkap: '',
        nik: '',
        nama_usaha: '',
        kategori_usaha: 'Kuliner',
        whatsapp: '',
        email: '',
        alamat_usaha: '',
        status_keanggotaan: 'ACTIVE',
      });
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberToEdit) {
      const ok = storage.updateMember(memberToEdit.member_id, formData, adminId);
      if (ok) {
        onSaved(`Data anggota ${formData.nama_lengkap} berhasil diperbarui.`);
        onClose();
      }
    } else {
      const newM = storage.addMemberManual(
        {
          ...formData,
          tempat_lahir: 'Berau',
          tanggal_lahir: '1995-01-01',
          jenis_kelamin: 'L',
          alamat: formData.alamat_usaha || 'Tanjung Redeb, Berau',
          nomor_hp: formData.whatsapp,
          foto_profil_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
          deskripsi_usaha: `Usaha kuliner/kriya UMKM ${formData.nama_usaha}`,
          tanggal_bergabung: new Date().toISOString().slice(0, 10),
        } as any,
        adminId
      );
      onSaved(`Anggota baru ${newM.nama_lengkap} (${newM.member_id}) berhasil ditambahkan.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {memberToEdit ? 'Ubah Data Anggota UMKM' : 'Tambah Anggota Koperasi Baru'}
              </h3>
              <p className="text-xs text-slate-500">Super Admin Authority • Google Sheets Synced</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pemilik *</label>
            <input
              type="text"
              required
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Usaha / Brand *</label>
            <input
              type="text"
              required
              value={formData.nama_usaha}
              onChange={(e) => setFormData({ ...formData, nama_usaha: e.target.value })}
              placeholder="Contoh: Dapur Rasa Berau"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kategori Usaha</label>
            <select
              value={formData.kategori_usaha}
              onChange={(e) => setFormData({ ...formData, kategori_usaha: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="Kuliner">Kuliner (Makanan & Minuman)</option>
              <option value="Kriya">Kriya & Kerajinan</option>
              <option value="Fashion">Fashion & Pakaian</option>
              <option value="Pertanian">Pertanian & Perkebunan</option>
              <option value="Jasa">Jasa & Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp *</label>
            <input
              type="text"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="081234567890"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">NIK (KTP)</label>
            <input
              type="text"
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
              placeholder="640301..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="umkm@koperasiberau.id"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Keanggotaan</label>
            <select
              value={formData.status_keanggotaan}
              onChange={(e) => setFormData({ ...formData, status_keanggotaan: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="ACTIVE">ACTIVE (Aktif)</option>
              <option value="PENDING">PENDING (Menunggu)</option>
              <option value="INACTIVE">INACTIVE (Nonaktif)</option>
              <option value="SUSPENDED">SUSPENDED (Ditangguhkan)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{memberToEdit ? 'Simpan Perubahan' : 'Tambah Anggota'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Stand Assign/Edit Modal ---
interface StandModalProps {
  isOpen: boolean;
  onClose: () => void;
  standToEdit?: EventRegistration | null;
  members: Member[];
  eventId: string;
  adminId: string;
  onSaved: (msg: string) => void;
}

export const StandCrudModal: React.FC<StandModalProps> = ({
  isOpen,
  onClose,
  standToEdit,
  members,
  eventId,
  adminId,
  onSaved,
}) => {
  const [standCode, setStandCode] = useState('01');
  const [memberId, setMemberId] = useState(members[0]?.member_id || '');
  const [standPrice, setStandPrice] = useState(50000);
  const [regStatus, setRegStatus] = useState<EventRegistration['registration_status']>('CONFIRMED');
  const [paymentStatus, setPaymentStatus] = useState<EventRegistration['payment_status']>('PAID');
  const [checkInStatus, setCheckInStatus] = useState<EventRegistration['check_in_status']>('NOT_CHECKED_IN');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (standToEdit) {
      setStandCode(standToEdit.stand_code);
      setMemberId(standToEdit.member_id);
      setStandPrice(standToEdit.stand_price);
      setRegStatus(standToEdit.registration_status);
      setPaymentStatus(standToEdit.payment_status);
      setCheckInStatus(standToEdit.check_in_status);
      setNotes(standToEdit.notes || '');
    } else {
      setStandCode('01');
      setMemberId(members[0]?.member_id || '');
      setStandPrice(50000);
      setRegStatus('CONFIRMED');
      setPaymentStatus('PAID');
      setCheckInStatus('NOT_CHECKED_IN');
      setNotes('Penetapan langsung oleh Super Admin');
    }
  }, [standToEdit, isOpen, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (standToEdit) {
      const ok = storage.updateRegistration(
        standToEdit.registration_id,
        {
          stand_code: standCode.toUpperCase(),
          member_id: memberId,
          stand_price: standPrice,
          registration_status: regStatus,
          payment_status: paymentStatus,
          check_in_status: checkInStatus,
          notes,
        },
        adminId
      );
      if (ok) {
        onSaved(`Data stand ${standCode} berhasil diperbarui.`);
        onClose();
      }
    } else {
      const res = storage.assignStandManual(
        {
          eventId,
          standCode: standCode.toUpperCase(),
          memberId,
          standPrice,
          registrationStatus: regStatus,
          paymentStatus,
          checkInStatus,
          notes,
        },
        adminId
      );
      if (res.success) {
        onSaved(res.message);
        onClose();
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {standToEdit ? `Ubah Alokasi Stand ${standToEdit.stand_code}` : 'Alokasikan Stand 64 Manual'}
              </h3>
              <p className="text-xs text-slate-500">Event Banuarasa Weekend Market</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor / Kode Stand *</label>
            <input
              type="text"
              required
              value={standCode}
              onChange={(e) => setStandCode(e.target.value)}
              placeholder="01-64 / A-J"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Anggota UMKM *</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.nama_usaha} ({m.nama_lengkap})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tarif Partisipasi (Rp) *</label>
            <input
              type="number"
              required
              value={standPrice}
              onChange={(e) => setStandPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Registrasi</label>
            <select
              value={regStatus}
              onChange={(e) => setRegStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="CONFIRMED">CONFIRMED (Terkonfirmasi)</option>
              <option value="WAITING_PAYMENT">WAITING_PAYMENT (Menunggu Bayar)</option>
              <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Pembayaran</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="PAID">PAID (Lunas)</option>
              <option value="UNPAID">UNPAID (Belum Bayar)</option>
              <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Kehadiran</label>
            <select
              value={checkInStatus}
              onChange={(e) => setCheckInStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="NOT_CHECKED_IN">Belum Hadir</option>
              <option value="CHECKED_IN">Hadir di Lokasi (Checked In)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Catatan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan penempatan tenant..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{standToEdit ? 'Simpan Perubahan' : 'Tetapkan Stand'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Payment Create/Edit Modal ---
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentToEdit?: Payment | null;
  members: Member[];
  adminId: string;
  onSaved: (msg: string) => void;
}

export const PaymentCrudModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentToEdit,
  members,
  adminId,
  onSaved,
}) => {
  const [memberId, setMemberId] = useState(members[0]?.member_id || '');
  const [paymentType, setPaymentType] = useState<PaymentType>('EVENT_PARTICIPATION');
  const [amount, setAmount] = useState(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFER_BANK');
  const [verStatus, setVerStatus] = useState<Payment['verification_status']>('VERIFIED');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (paymentToEdit) {
      setMemberId(paymentToEdit.member_id);
      setPaymentType(paymentToEdit.payment_type);
      setAmount(paymentToEdit.amount);
      setPaymentMethod(paymentToEdit.payment_method);
      setVerStatus(paymentToEdit.verification_status);
      setRejectionReason(paymentToEdit.rejection_reason || '');
    } else {
      setMemberId(members[0]?.member_id || '');
      setPaymentType('EVENT_PARTICIPATION');
      setAmount(50000);
      setPaymentMethod('TRANSFER_BANK');
      setVerStatus('VERIFIED');
      setRejectionReason('');
    }
  }, [paymentToEdit, isOpen, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentToEdit) {
      const ok = storage.updatePayment(
        paymentToEdit.payment_id,
        {
          member_id: memberId,
          payment_type: paymentType,
          amount,
          payment_method: paymentMethod,
          verification_status: verStatus,
          rejection_reason: verStatus === 'REJECTED' ? rejectionReason : undefined,
        },
        adminId
      );
      if (ok) {
        onSaved(`Pembayaran ${paymentToEdit.payment_id} berhasil diperbarui.`);
        onClose();
      }
    } else {
      const newPay = storage.createPaymentManual(
        {
          member_id: memberId,
          payment_type: paymentType,
          amount,
          payment_method: paymentMethod,
          verification_status: verStatus,
        },
        adminId
      );
      onSaved(`Transaksi baru ${newPay.payment_id} (Rp${amount.toLocaleString('id-ID')}) berhasil dicatat.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {paymentToEdit ? 'Ubah Catatan Pembayaran' : 'Tambah Pembayaran Kas / Stand Manual'}
              </h3>
              <p className="text-xs text-slate-500">Super Admin Direct Entry</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Pilih Anggota UMKM *</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.nama_usaha} ({m.nama_lengkap})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipe Pembayaran</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="EVENT_PARTICIPATION">Biaya Stand Event</option>
              <option value="SIMPANAN_POKOK">Simpanan Pokok</option>
              <option value="SIMPANAN_WAJIB">Simpanan Wajib</option>
              <option value="SIMPANAN_SUKARELA">Simpanan Sukarela</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nominal (Rp) *</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="TRANSFER_BANK">Transfer Bank</option>
              <option value="QRIS">QRIS Statis/Dinamis</option>
              <option value="CASH">Tunai (Kasir / Petugas)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Verifikasi</label>
            <select
              value={verStatus}
              onChange={(e) => setVerStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="VERIFIED">VERIFIED (Diterima / Lunas)</option>
              <option value="PENDING">PENDING (Menunggu Verifikasi)</option>
              <option value="REJECTED">REJECTED (Ditolak)</option>
            </select>
          </div>

          {verStatus === 'REJECTED' && (
            <div className="sm:col-span-2">
              <label className="block font-bold text-rose-700 mb-1">Alasan Penolakan</label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Bukti transfer tidak terbaca / nominal tidak sesuai..."
                className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-900"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{paymentToEdit ? 'Simpan Perubahan' : 'Catat Transaksi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Savings Create/Edit Modal ---
interface SavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  savingToEdit?: Saving | null;
  members: Member[];
  adminId: string;
  onSaved: (msg: string) => void;
}

export const SavingCrudModal: React.FC<SavingModalProps> = ({
  isOpen,
  onClose,
  savingToEdit,
  members,
  adminId,
  onSaved,
}) => {
  const [memberId, setMemberId] = useState(members[0]?.member_id || '');
  const [savingType, setSavingType] = useState<Saving['saving_type']>('SIMPANAN_WAJIB');
  const [amount, setAmount] = useState(50000);
  const [period, setPeriod] = useState('2026-08');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (savingToEdit) {
      setMemberId(savingToEdit.member_id);
      setSavingType(savingToEdit.saving_type);
      setAmount(savingToEdit.amount);
      setPeriod(savingToEdit.period_month_year);
      setPaymentStatus(savingToEdit.payment_status);
      setNotes(savingToEdit.notes || '');
    } else {
      setMemberId(members[0]?.member_id || '');
      setSavingType('SIMPANAN_WAJIB');
      setAmount(50000);
      setPeriod('2026-08');
      setPaymentStatus('PAID');
      setNotes('Setoran kas simpanan koperasi');
    }
  }, [savingToEdit, isOpen, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (savingToEdit) {
      const ok = storage.updateSaving(
        savingToEdit.saving_id,
        {
          member_id: memberId,
          saving_type: savingType,
          amount,
          period_month_year: period,
          payment_status: paymentStatus,
          notes,
        },
        adminId
      );
      if (ok) {
        onSaved(`Simpanan ${savingToEdit.saving_id} berhasil diperbarui.`);
        onClose();
      }
    } else {
      const newS = storage.createSavingManual(
        {
          member_id: memberId,
          saving_type: savingType,
          amount,
          period_month_year: period,
          payment_status: paymentStatus,
          notes,
        },
        adminId
      );
      onSaved(`Simpanan baru ${newS.saving_id} (Rp${amount.toLocaleString('id-ID')}) berhasil dicatat.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {savingToEdit ? 'Ubah Data Simpanan Kas' : 'Tambah Setoran Simpanan Anggota'}
              </h3>
              <p className="text-xs text-slate-500">Buku Kas Koperasi Berau Melangkah Bersama</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Pilih Anggota *</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.nama_lengkap} ({m.nama_usaha})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Jenis Simpanan</label>
            <select
              value={savingType}
              onChange={(e) => setSavingType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="SIMPANAN_POKOK">Simpanan Pokok (Rp100.000)</option>
              <option value="SIMPANAN_WAJIB">Simpanan Wajib (Rp50.000/bln)</option>
              <option value="SIMPANAN_SUKARELA">Simpanan Sukarela</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nominal (Rp) *</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Periode (YYYY-MM)</label>
            <input
              type="text"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="2026-08"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Pembayaran</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="PAID">PAID (Lunas / Masuk Kas)</option>
              <option value="PENDING">PENDING (Belum Lunas)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Catatan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan setoran simpanan..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{savingToEdit ? 'Simpan Perubahan' : 'Catat Setoran'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Sales Report Create/Edit Modal ---
interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesToEdit?: SalesReport | null;
  members: Member[];
  eventId: string;
  adminId: string;
  onSaved: (msg: string) => void;
}

export const SalesReportCrudModal: React.FC<SalesReportModalProps> = ({
  isOpen,
  onClose,
  salesToEdit,
  members,
  eventId,
  adminId,
  onSaved,
}) => {
  const [memberId, setMemberId] = useState(members[0]?.member_id || '');
  const [registrationId, setRegistrationId] = useState('Stand 01');
  const [grossSales, setGrossSales] = useState(1500000);
  const [cost, setCost] = useState(700000);
  const [itemsSold, setItemsSold] = useState(45);
  const [notes, setNotes] = useState('Menu Utama Laris Manis');

  useEffect(() => {
    if (salesToEdit) {
      setMemberId(salesToEdit.member_id);
      setRegistrationId(salesToEdit.registration_id);
      setGrossSales(salesToEdit.gross_sales);
      setCost(salesToEdit.cost);
      setItemsSold(salesToEdit.total_items_sold);
      setNotes(salesToEdit.notes || '');
    } else {
      setMemberId(members[0]?.member_id || '');
      setRegistrationId('Stand 01');
      setGrossSales(1500000);
      setCost(700000);
      setItemsSold(45);
      setNotes('Menu Utama Laris Manis');
    }
  }, [salesToEdit, isOpen, members]);

  if (!isOpen) return null;

  const netProfit = grossSales - cost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (salesToEdit) {
      const ok = storage.updateSalesReport(
        salesToEdit.sales_report_id,
        {
          member_id: memberId,
          registration_id: registrationId,
          gross_sales: grossSales,
          cost,
          net_profit: netProfit,
          total_items_sold: itemsSold,
          notes,
        },
        adminId
      );
      if (ok) {
        onSaved(`Laporan omzet ${salesToEdit.sales_report_id} berhasil diperbarui.`);
        onClose();
      }
    } else {
      const newSr = storage.createSalesReportManual(
        {
          event_id: eventId,
          member_id: memberId,
          registration_id: registrationId,
          total_items_sold: itemsSold,
          gross_sales: grossSales,
          cost,
          net_profit: netProfit,
          notes,
        },
        adminId
      );
      onSaved(`Laporan omzet baru ${newSr.sales_report_id} (Rp${grossSales.toLocaleString('id-ID')}) berhasil dicatat.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {salesToEdit ? 'Ubah Laporan Omzet UMKM' : 'Input Laporan Omzet Stand UMKM'}
              </h3>
              <p className="text-xs text-slate-500">Banuarasa Weekend Market</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih UMKM / Tenant *</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.nama_usaha} ({m.nama_lengkap})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Stand Code / ID</label>
            <input
              type="text"
              required
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              placeholder="Stand 01"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Omzet Kotor (Rp) *</label>
            <input
              type="number"
              required
              value={grossSales}
              onChange={(e) => setGrossSales(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Modal / HPP (Rp) *</label>
            <input
              type="number"
              required
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Estimasi Laba Bersih (Rp)</label>
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl font-black text-emerald-800">
              Rp{netProfit.toLocaleString('id-ID')}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Total Porsi/Item Terjual</label>
            <input
              type="number"
              required
              value={itemsSold}
              onChange={(e) => setItemsSold(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Produk Terlaris & Catatan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Menu terlaris, catatan ramai pengunjung..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{salesToEdit ? 'Simpan Perubahan' : 'Catat Omzet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// ==================== EVENT CRUD MODAL (SUPER ADMIN) ====================
interface EventCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventItem | null;
  adminId: string;
  onSaved: (msg: string) => void;
}

export const EventCrudModal: React.FC<EventCrudModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  adminId,
  onSaved,
}) => {
  const [eventName, setEventName] = useState('Banuarasa Weekend Market Edisi #24');
  const [eventDate, setEventDate] = useState('2026-09-05');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('Jl. Dr. Murjani I, Tanjung Redeb Kabupaten Berau');
  const [description, setDescription] = useState('Pasar mingguan UMKM & kuliner khas Berau dengan 64 stand resmi.');
  const [eventStatus, setEventStatus] = useState<EventItem['event_status']>('ACTIVE');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80');

  useEffect(() => {
    if (eventToEdit) {
      setEventName(eventToEdit.event_name || 'Banuarasa Weekend Market');
      setEventDate(eventToEdit.event_date || '2026-09-05');
      setStartTime(eventToEdit.start_time || '06:00');
      setEndTime(eventToEdit.end_time || '12:00');
      setLocation(eventToEdit.location || 'Jl. Dr. Murjani I, Tanjung Redeb Kabupaten Berau');
      setDescription(eventToEdit.description || '');
      setEventStatus(eventToEdit.event_status || 'ACTIVE');
      setBannerUrl(eventToEdit.banner_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80');
    } else {
      const activeEv = storage.getEvents()[0];
      if (activeEv) {
        setEventName(activeEv.event_name);
        setEventDate(activeEv.event_date);
        setStartTime(activeEv.start_time);
        setEndTime(activeEv.end_time);
        setLocation(activeEv.location);
        setDescription(activeEv.description);
        setEventStatus(activeEv.event_status);
        setBannerUrl(activeEv.banner_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80');
      }
    }
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventToEdit) {
      const res = storage.updateEvent(
        eventToEdit.event_id,
        {
          event_name: eventName,
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          location,
          description,
          event_status: eventStatus,
          banner_url: bannerUrl,
        },
        adminId
      );
      if (res.success) {
        onSaved(res.message);
        onClose();
      }
    } else {
      const activeEv = storage.getEvents()[0];
      if (activeEv) {
        const res = storage.updateEvent(
          activeEv.event_id,
          {
            event_name: eventName,
            event_date: eventDate,
            start_time: startTime,
            end_time: endTime,
            location,
            description,
            event_status: eventStatus,
            banner_url: bannerUrl,
          },
          adminId
        );
        onSaved(res.message);
        onClose();
      } else {
        storage.createEvent(
          {
            event_number: 25,
            event_name: eventName,
            event_date: eventDate,
            start_time: startTime,
            end_time: endTime,
            location,
            description,
            event_status: eventStatus,
            banner_url: bannerUrl,
            registration_open: `${eventDate}T00:00:00Z`,
            registration_close: `${eventDate}T23:59:59Z`,
          },
          adminId
        );
        onSaved(`Event baru "${eventName}" berhasil dibuat dan dipublikasikan.`);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {eventToEdit ? 'Ubah Informasi Event Stand' : 'Pengaturan Event Banuarasa'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Update waktu, tanggal, dan lokasi yang tampil di dashboard semua user
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Event / Edisi Pelaksanaan *</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Contoh: Banuarasa Weekend Market Edisi #24"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tanggal *</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Jam Mulai *</span>
              </label>
              <input
                type="text"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="06:00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Jam Selesai *</span>
              </label>
              <input
                type="text"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="12:00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Tempat / Lokasi Pelaksanaan Event *</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Jl. Dr. Murjani I, Tanjung Redeb Kabupaten Berau"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Event & Pendaftaran</label>
            <select
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value="ACTIVE">ACTIVE (Pendaftaran & Stand Dibuka)</option>
              <option value="OPEN_REGISTRATION">OPEN_REGISTRATION (Reservasi Berlangsung)</option>
              <option value="ONGOING">ONGOING (Pasar Sedang Berlangsung Hari Ini)</option>
              <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED (Pendaftaran Ditutup)</option>
              <option value="COMPLETED">COMPLETED (Event Selesai)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi / Informasi Tambahan</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informasi tema kuliner, pentas seni, atau tata tertib..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">URL Gambar Banner Event</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Informasi Event</span>
          </button>
        </div>
      </form>
    </div>
  );
};
