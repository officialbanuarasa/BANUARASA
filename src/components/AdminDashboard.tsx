import React, { useState, useEffect } from 'react';
import {
  Payment,
  EventItem,
  Member,
  EventRegistration,
  Saving,
  SalesReport,
  AuditLog,
  MemberDocument,
} from '../types';
import { storage } from '../services/storage';
import {
  GOOGLE_DRIVE_FOLDER_URL,
  GOOGLE_SPREADSHEET_URL,
} from '../services/googleWorkspaceSync';
import {
  MemberCrudModal,
  StandCrudModal,
  PaymentCrudModal,
  SavingCrudModal,
  SalesReportCrudModal,
} from './AdminCrudModals';
import { AdminMediaManager } from './AdminMediaManager';
import {
  ShieldCheck,
  CreditCard,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  Filter,
  Eye,
  Store,
  QrCode,
  Sparkles,
  Award,
  DollarSign,
  Building2,
  FileCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Check,
  X,
  Cloud,
  FileSpreadsheet,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminDashboardProps {
  adminId: string;
  onOpenPaymentInspector: (payment: Payment) => void;
  onOpenQRScanner: () => void;
  onOpenStandMap: (event: EventItem) => void;
  onOpenGoogleWorkspaceModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminId,
  onOpenPaymentInspector,
  onOpenQRScanner,
  onOpenStandMap,
  onOpenGoogleWorkspaceModal,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'OVERVIEW' | 'PAYMENTS' | 'STANDS' | 'MEMBERS' | 'SAVINGS' | 'SALES' | 'AUDIT' | 'BRANDING'
  >('OVERVIEW');

  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [version, setVersion] = useState(0);

  // Modals inside Admin - CRUD State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const [isAssignStandOpen, setIsAssignStandOpen] = useState(false);
  const [standToEdit, setStandToEdit] = useState<EventRegistration | null>(null);
  const [standToDelete, setStandToDelete] = useState<EventRegistration | null>(null);

  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const [isAddSavingOpen, setIsAddSavingOpen] = useState(false);
  const [savingToEdit, setSavingToEdit] = useState<Saving | null>(null);
  const [savingToDelete, setSavingToDelete] = useState<Saving | null>(null);

  const [isAddSalesOpen, setIsAddSalesOpen] = useState(false);
  const [salesToEdit, setSalesToEdit] = useState<SalesReport | null>(null);
  const [salesToDelete, setSalesToDelete] = useState<SalesReport | null>(null);

  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [docRejectReason, setDocRejectReason] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Subscribe to storage updates
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  // Data from Storage
  const stats = storage.getAggregatedStats();
  const payments = storage.getPayments();
  const events = storage.getEvents();
  const members = storage.getMembers();
  const registrations = storage.getRegistrations();
  const savings = storage.getSavings();
  const salesReports = storage.getSalesReports();
  const auditLogs = storage.getAuditLogs();
  const documents = storage.getDocuments();

  const activeEvent = events[0];

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    if (paymentFilter !== 'ALL' && p.verification_status !== paymentFilter) return false;
    if (!searchQuery) return true;
    const member = members.find((m) => m.member_id === p.member_id);
    const query = searchQuery.toLowerCase();
    return (
      p.payment_id.toLowerCase().includes(query) ||
      p.member_id.toLowerCase().includes(query) ||
      (member?.nama_lengkap.toLowerCase().includes(query) ?? false) ||
      (member?.nama_usaha.toLowerCase().includes(query) ?? false)
    );
  });

  const pendingPaymentsCount = payments.filter((p) => p.verification_status === 'PENDING').length;
  const pendingDocsCount = documents.filter((d) => d.verification_status === 'PENDING').length;

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleConfirmDeleteMember = () => {
    if (!memberToDelete) return;
    const res = storage.deleteMember(memberToDelete.member_id, adminId);
    if (res.success) {
      showToast(res.message);
    }
    setMemberToDelete(null);
  };

  const handleConfirmDeleteStand = () => {
    if (!standToDelete) return;
    const ok = storage.deleteRegistration(standToDelete.registration_id, adminId);
    if (ok) {
      showToast(`Alokasi Stand ${standToDelete.stand_code} berhasil dilepaskan.`);
    }
    setStandToDelete(null);
  };

  const handleConfirmDeletePayment = () => {
    if (!paymentToDelete) return;
    const ok = storage.deletePayment(paymentToDelete.payment_id, adminId);
    if (ok) {
      showToast(`Catatan pembayaran ${paymentToDelete.payment_id} berhasil dihapus.`);
    }
    setPaymentToDelete(null);
  };

  const handleConfirmDeleteSaving = () => {
    if (!savingToDelete) return;
    const ok = storage.deleteSaving(savingToDelete.saving_id, adminId);
    if (ok) {
      showToast(`Catatan simpanan ${savingToDelete.saving_id} berhasil dihapus.`);
    }
    setSavingToDelete(null);
  };

  const handleConfirmDeleteSales = () => {
    if (!salesToDelete) return;
    const ok = storage.deleteSalesReport(salesToDelete.sales_report_id, adminId);
    if (ok) {
      showToast(`Laporan omzet ${salesToDelete.sales_report_id} berhasil dihapus.`);
    }
    setSalesToDelete(null);
  };

  const handleApproveDocument = (docId: string) => {
    const ok = storage.verifyDocument(docId, adminId, true);
    if (ok) {
      showToast('Dokumen legalitas berhasil diverifikasi.');
    }
  };

  const handleRejectDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDocId) return;
    const ok = storage.verifyDocument(rejectingDocId, adminId, false, docRejectReason);
    if (ok) {
      showToast('Dokumen legalitas telah ditolak.');
    }
    setRejectingDocId(null);
    setDocRejectReason('');
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID_ANGGOTA,NAMA_LENGKAP,NAMA_USAHA,KATEGORI,STATUS,WHATSAPP\n' +
      members
        .map(
          (m) =>
            `"${m.member_id}","${m.nama_lengkap}","${m.nama_usaha}","${m.kategori_usaha}","${m.status_keanggotaan}","${m.whatsapp}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Koperasi_Berau_Data_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh.');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold">{actionNotice}</p>
        </div>
      )}

      {/* Top Bento Header & Navigation Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Panel Super Admin Koperasi
              </span>
              <span className="text-xs text-slate-400 font-bold">• Tingkat Otoritas Penuh (CRUD)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dashboard Manajemen & Keuangan Koperasi
            </h2>
            <p className="text-xs text-slate-500">
              Pengelolaan 64 Stand Banuarasa, Verifikasi Pembayaran & Dokumen, Manajemen Anggota, dan Laporan Kas.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenGoogleWorkspaceModal && (
              <button
                id="btn-admin-google-workspace"
                onClick={onOpenGoogleWorkspaceModal}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span>Google Workspace Hub</span>
              </button>
            )}
            <button
              onClick={onOpenQRScanner}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan QR Check-In</span>
            </button>
            <button
              onClick={() => onOpenStandMap(activeEvent)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Denah 64 Stand</span>
            </button>
          </div>
        </div>

        {/* Real Links Direct Action Banner */}
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] uppercase">
              Cloud Database
            </span>
            <span className="text-slate-300">Tautan repositori data resmi Banuarasa:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={GOOGLE_SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Spreadsheet Resmi</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Google Drive Folder Resmi</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Sub-Nav Bento Tabs */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Ringkasan Eksekutif', icon: ShieldCheck },
            { id: 'PAYMENTS', label: `Verifikasi Bayar (${pendingPaymentsCount})`, icon: CreditCard },
            { id: 'STANDS', label: 'Manajemen 64 Stand', icon: Calendar },
            { id: 'MEMBERS', label: `Anggota & Legalitas (${members.length})`, icon: Users },
            { id: 'SAVINGS', label: 'Buku Kas Simpanan', icon: DollarSign },
            { id: 'SALES', label: 'Laporan Omzet UMKM', icon: TrendingUp },
            { id: 'BRANDING', label: 'Logo, Banner & Media', icon: ImageIcon },
            { id: 'AUDIT', label: 'Audit Logs & Ekspor', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeAdminTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* 4 Primary Bento Metrics: Koperasi vs UMKM strictly separated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Pendapatan Kas Koperasi */}
            <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Kas Koperasi
                  </span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs text-emerald-200 font-medium">Total Kas Masuk Koperasi</p>
                <p className="text-2xl font-black text-white mt-1">
                  Rp{stats.totalKasMasukKoperasi.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-800/80 text-[10px] text-emerald-200 flex justify-between">
                <span>Stand: Rp{stats.totalPendapatanPartisipasiStand.toLocaleString('id-ID')}</span>
                <span>Simpanan: Rp{stats.totalSemuaSimpanan.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Card 2: Total Omzet Penjualan UMKM */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Omzet UMKM
                  </span>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Total Omzet Transaksi Tenant</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  Rp{stats.totalOmzetUMKM.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                <span>Laba: Rp{stats.totalLabaBersihUMKM.toLocaleString('id-ID')}</span>
                <span className="font-bold text-emerald-700">{stats.totalProdukTerjual} Item Terjual</span>
              </div>
            </div>

            {/* Card 3: Stand Status */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Okupansi Stand
                  </span>
                  <Store className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Stand Terisi (Banuarasa #1)</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {stats.standTerisi} <span className="text-sm font-bold text-slate-400">/ 64 Stand</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                <span className="text-emerald-700 font-bold">{stats.standAvailable} Stand Kosong</span>
                <span>{Math.round((stats.standTerisi / 64) * 100)}% Terisi</span>
              </div>
            </div>

            {/* Card 4: Anggota Aktif */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Keanggotaan
                  </span>
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Total Anggota Terdaftar</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {stats.totalAnggota} <span className="text-sm font-bold text-slate-400">Pelaku UMKM</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                <span className="text-purple-700 font-bold">{stats.anggotaAktif} Anggota Aktif</span>
                <span>{pendingPaymentsCount} Antrean Bayar</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Verifikasi Pembayaran</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Terdapat {pendingPaymentsCount} bukti transfer menanti persetujuan pengurus.
                </p>
              </div>
              <button
                onClick={() => setActiveAdminTab('PAYMENTS')}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
              >
                Buka Antrean Verifikasi →
              </button>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Direktori Anggota UMKM</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Kelola profil anggota, verifikasi NIB/Halal, dan kelola akun demo/anggota baru.
                </p>
              </div>
              <button
                onClick={() => setActiveAdminTab('MEMBERS')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Kelola Anggota & Hapus Akun →
              </button>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Audit Trail & Laporan</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Ekspor rekaman kas simpanan dan omzet mingguan ke file spreadsheet.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File CSV Anggota</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeAdminTab === 'PAYMENTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Verifikasi Pembayaran Masuk</h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan bukti transfer bank dan QRIS untuk biaya stand dan simpanan anggota.
              </p>
            </div>

            {/* Actions: Filter Buttons & Tambah Pembayaran Manual */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setPaymentToEdit(null);
                  setIsAddPaymentOpen(true);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pembayaran</span>
              </button>

              <div className="flex items-center gap-1">
                {(['PENDING', 'VERIFIED', 'REJECTED', 'ALL'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPaymentFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      paymentFilter === filter
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'ALL' ? 'Semua' : filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID Pembayaran, Nama Anggota, atau Nama Usaha..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Payment List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                  <th className="p-3">ID Pembayaran</th>
                  <th className="p-3">Nama Anggota / Usaha</th>
                  <th className="p-3">Jenis & Metode</th>
                  <th className="p-3">Nominal</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Tidak ada pembayaran dengan filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => {
                    const member = members.find((m) => m.member_id === pay.member_id);
                    return (
                      <tr key={pay.payment_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-700">{pay.payment_id}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{member?.nama_lengkap || pay.member_id}</p>
                          <p className="text-[10px] text-slate-500">{member?.nama_usaha}</p>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800">{pay.payment_type.replace(/_/g, ' ')}</span>
                          <p className="text-[10px] text-slate-500">{pay.payment_method}</p>
                        </td>
                        <td className="p-3 font-black text-slate-900">
                          Rp{pay.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-slate-500">{pay.payment_date}</td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              pay.verification_status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : pay.verification_status === 'PENDING'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {pay.verification_status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => onOpenPaymentInspector(pay)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Periksa bukti bayar"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat</span>
                          </button>
                          <button
                            onClick={() => {
                              setPaymentToEdit(pay);
                              setIsAddPaymentOpen(true);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Ubah data pembayaran"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>
                          <button
                            onClick={() => setPaymentToDelete(pay)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Hapus pembayaran"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STANDS TAB */}
      {activeAdminTab === 'STANDS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Manajemen 64 Stand - {activeEvent?.event_name}
              </h3>
              <p className="text-xs text-slate-500">
                Pemetaan 64 stand resmi Banuarasa Weekend Market beserta tenant terdaftar.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setStandToEdit(null);
                  setIsAssignStandOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Alokasi Stand Manual</span>
              </button>
              <button
                onClick={() => onOpenStandMap(activeEvent)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
              >
                Buka Peta Visual 64 Stand
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                  <th className="p-3">Kode Stand</th>
                  <th className="p-3">Biaya Stand</th>
                  <th className="p-3">Penyewa (Member ID)</th>
                  <th className="p-3">Nama Usaha</th>
                  <th className="p-3">Status Registrasi</th>
                  <th className="p-3">Status Check-In</th>
                  <th className="p-3 text-right">Aksi Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Belum ada stand yang terisi. Semua 64 stand siap di-booking!
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => {
                    const member = members.find((m) => m.member_id === reg.member_id);
                    return (
                      <tr key={reg.registration_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-black text-slate-900 text-sm">Stand {reg.stand_code}</td>
                        <td className="p-3 font-bold text-slate-800">
                          Rp{reg.stand_price.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{member?.nama_lengkap || reg.member_id}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{reg.member_id}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{member?.nama_usaha || '-'}</td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              reg.registration_status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : reg.registration_status === 'WAITING_PAYMENT'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {reg.registration_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              reg.check_in_status === 'CHECKED_IN'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {reg.check_in_status === 'CHECKED_IN' ? 'HADIR DI LOKASI' : 'BELUM HADIR'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setStandToEdit(reg);
                              setIsAssignStandOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Ubah data stand"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>
                          <button
                            onClick={() => setStandToDelete(reg)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Lepas alokasi stand ini"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Lepas</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MEMBERS DIRECTORY TAB (WITH CRUD ACTIONS) */}
      {activeAdminTab === 'MEMBERS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Direktori Anggota UMKM ({members.length})</h3>
                <p className="text-xs text-slate-500">
                  Super Admin berhak menambah, mengubah profil, dan menghapus data anggota koperasi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMemberToEdit(null);
                    setIsAddMemberOpen(true);
                  }}
                  className="px-3.5 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Anggota</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                    <th className="p-3">No. Anggota</th>
                    <th className="p-3">Nama Anggota</th>
                    <th className="p-3">Nama Usaha / Brand</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">No. WhatsApp</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada anggota terdaftar. Klik 'Tambah Anggota' di atas.
                      </td>
                    </tr>
                  ) : (
                    members.map((m) => (
                      <tr key={m.member_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-700">{m.nomor_anggota}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{m.nama_lengkap}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.member_id}</p>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">{m.nama_usaha}</td>
                        <td className="p-3 text-slate-500">{m.kategori_usaha}</td>
                        <td className="p-3 font-mono text-slate-600">{m.whatsapp}</td>
                        <td className="p-3">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {m.status_keanggotaan}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <a
                            href={`https://wa.me/${m.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-colors inline-block"
                          >
                            WA
                          </a>

                          <button
                            onClick={() => {
                              setMemberToEdit(m);
                              setIsAddMemberOpen(true);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Ubah Profil Anggota"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>

                          <button
                            id={`btn-delete-member-${m.member_id}`}
                            onClick={() => setMemberToDelete(m)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Hapus Anggota oleh Super Admin"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legalitas Documents Verification Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Verifikasi Dokumen Legalitas UMKM ({documents.length})
              </h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan Nomor Induk Berusaha (NIB) dan Sertifikat Halal binaan koperasi di Google Drive.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                    <th className="p-3">ID Dokumen</th>
                    <th className="p-3">Anggota</th>
                    <th className="p-3">Jenis Dokumen</th>
                    <th className="p-3">Nomor Legalitas</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        Tidak ada dokumen legalitas yang diunggah.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => {
                      const member = members.find((m) => m.member_id === doc.member_id);
                      return (
                        <tr key={doc.document_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-700">{doc.document_id}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{member?.nama_lengkap || doc.member_id}</p>
                            <p className="text-[10px] text-slate-500">{member?.nama_usaha}</p>
                          </td>
                          <td className="p-3 font-bold text-slate-800">{doc.document_type}</td>
                          <td className="p-3 font-mono text-slate-600">{doc.document_number}</td>
                          <td className="p-3">
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                doc.verification_status === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.verification_status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {doc.verification_status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5">
                            {doc.verification_status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApproveDocument(doc.document_id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={() => setRejectingDocId(doc.document_id)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}
                            {doc.drive_url && (
                              <a
                                href={doc.drive_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Lihat File</span>
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SAVINGS TAB */}
      {activeAdminTab === 'SAVINGS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Buku Kas Simpanan Anggota</h3>
              <p className="text-xs text-slate-500">
                Pencatatan Simpanan Pokok, Simpanan Wajib bulanan, dan Simpanan Sukarela.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSavingToEdit(null);
                  setIsAddSavingOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Setoran Simpanan</span>
              </button>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-right">
                <p className="text-[10px] font-bold text-emerald-800 uppercase">Total Kas Simpanan</p>
                <p className="text-lg font-black text-emerald-950">
                  Rp{stats.totalSemuaSimpanan.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                  <th className="p-3">ID Simpanan</th>
                  <th className="p-3">Anggota</th>
                  <th className="p-3">Jenis Simpanan</th>
                  <th className="p-3">Periode</th>
                  <th className="p-3">Nominal</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {savings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Belum ada mutasi simpanan tercatat.
                    </td>
                  </tr>
                ) : (
                  savings.map((sav) => {
                    const member = members.find((m) => m.member_id === sav.member_id);
                    return (
                      <tr key={sav.saving_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-700">{sav.saving_id}</td>
                        <td className="p-3 font-bold text-slate-900">{member?.nama_lengkap || sav.member_id}</td>
                        <td className="p-3">{sav.saving_type.replace(/_/g, ' ')}</td>
                        <td className="p-3 text-slate-500">{sav.period_month_year}</td>
                        <td className="p-3 font-black text-emerald-700">
                          Rp{sav.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {sav.payment_status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSavingToEdit(sav);
                              setIsAddSavingOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Ubah simpanan"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>
                          <button
                            onClick={() => setSavingToDelete(sav)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Hapus simpanan"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SALES REPORTS TAB */}
      {activeAdminTab === 'SALES' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Laporan Omzet Penjualan UMKM</h3>
              <p className="text-xs text-slate-500">
                Monitoring perputaran ekonomi mingguan dari stand Banuarasa Weekend Market.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSalesToEdit(null);
                  setIsAddSalesOpen(true);
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Laporan Omzet</span>
              </button>
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-right">
                <p className="text-[10px] font-bold text-blue-800 uppercase">Total Omzet UMKM</p>
                <p className="text-lg font-black text-blue-950">
                  Rp{stats.totalOmzetUMKM.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                  <th className="p-3">ID Laporan</th>
                  <th className="p-3">Tenant / Anggota</th>
                  <th className="p-3">Stand</th>
                  <th className="p-3">Omzet Kotor</th>
                  <th className="p-3">Laba Bersih</th>
                  <th className="p-3">Produk Terlaris</th>
                  <th className="p-3">Porsi Terjual</th>
                  <th className="p-3 text-right">Aksi Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Belum ada laporan omzet yang dikirimkan.
                    </td>
                  </tr>
                ) : (
                  salesReports.map((sr) => {
                    const member = members.find((m) => m.member_id === sr.member_id);
                    return (
                      <tr key={sr.sales_report_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-700">{sr.sales_report_id}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{member?.nama_usaha || sr.member_id}</p>
                          <p className="text-[10px] text-slate-500">{member?.nama_lengkap}</p>
                        </td>
                        <td className="p-3 font-black text-emerald-700">{sr.registration_id}</td>
                        <td className="p-3 font-black text-slate-900">
                          Rp{sr.gross_sales.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          Rp{sr.net_profit.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-slate-800">{sr.notes || 'Menu Utama'}</td>
                        <td className="p-3 font-semibold text-slate-600">{sr.total_items_sold} Item</td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSalesToEdit(sr);
                              setIsAddSalesOpen(true);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Ubah laporan omzet"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>
                          <button
                            onClick={() => setSalesToDelete(sr)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Hapus laporan omzet"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOGS & EXPORT TAB */}
      {activeAdminTab === 'AUDIT' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Audit Trail & Google Sheets Export</h3>
              <p className="text-xs text-slate-500">
                Rekaman histori seluruh transaksi, mutasi simpanan, dan verifikasi admin.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Data CSV</span>
            </button>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.log_id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Modul: {log.module}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">User: {log.user_id}</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">{log.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BRANDING, LOGO, BANNER & MEDIA ASSETS MANAGER TAB */}
      {activeAdminTab === 'BRANDING' && (
        <AdminMediaManager
          adminUsername={adminId}
          onShowToast={showToast}
        />
      )}

      {/* CRUD MODALS */}
      <MemberCrudModal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
        adminId={adminId}
        onSaved={showToast}
      />

      <StandCrudModal
        isOpen={isAssignStandOpen}
        onClose={() => {
          setIsAssignStandOpen(false);
          setStandToEdit(null);
        }}
        standToEdit={standToEdit}
        members={members}
        eventId={activeEvent?.event_id || 'BWM-2026-001'}
        adminId={adminId}
        onSaved={showToast}
      />

      <PaymentCrudModal
        isOpen={isAddPaymentOpen}
        onClose={() => {
          setIsAddPaymentOpen(false);
          setPaymentToEdit(null);
        }}
        paymentToEdit={paymentToEdit}
        members={members}
        adminId={adminId}
        onSaved={showToast}
      />

      <SavingCrudModal
        isOpen={isAddSavingOpen}
        onClose={() => {
          setIsAddSavingOpen(false);
          setSavingToEdit(null);
        }}
        savingToEdit={savingToEdit}
        members={members}
        adminId={adminId}
        onSaved={showToast}
      />

      <SalesReportCrudModal
        isOpen={isAddSalesOpen}
        onClose={() => {
          setIsAddSalesOpen(false);
          setSalesToEdit(null);
        }}
        salesToEdit={salesToEdit}
        members={members}
        eventId={activeEvent?.event_id || 'BWM-2026-001'}
        adminId={adminId}
        onSaved={showToast}
      />

      {/* CONFIRMATION MODAL: DELETE MEMBER */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Anggota</h3>
                <p className="text-xs text-slate-500">Tindakan Super Admin</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs space-y-2">
              <p className="text-slate-800 font-semibold">
                Anda akan menghapus data anggota:
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                <p className="font-black text-slate-900">{memberToDelete.nama_lengkap}</p>
                <p className="text-slate-500 font-mono">{memberToDelete.member_id} • {memberToDelete.nomor_anggota}</p>
                <p className="text-slate-600">{memberToDelete.nama_usaha}</p>
              </div>
              <p className="text-rose-800 font-medium leading-relaxed">
                ⚠️ Seluruh stand event yang dipesan, produk UMKM, dokumen legalitas, dan bukti pembayaran anggota ini akan ikut dibersihkan dan stand terkait akan kembali kosong.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete-member"
                onClick={handleConfirmDeleteMember}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>HAPUS SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE STAND */}
      {standToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Lepaskan Alokasi Stand</h3>
                <p className="text-xs text-slate-500">Stand {standToDelete.stand_code}</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs space-y-2">
              <p className="text-slate-800">
                Alokasi <span className="font-bold">Stand {standToDelete.stand_code}</span> untuk anggota{' '}
                <span className="font-mono font-bold">{standToDelete.member_id}</span> akan dihapus dan stand akan kembali menjadi <strong>AVAILABLE</strong>.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStandToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteStand}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Lepas Stand</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE PAYMENT */}
      {paymentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Hapus Catatan Pembayaran</h3>
                <p className="text-xs text-slate-500">ID: {paymentToDelete.payment_id}</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs space-y-2">
              <p className="text-slate-800">
                Anda akan menghapus transaksi sebesar{' '}
                <span className="font-bold text-slate-900">Rp{paymentToDelete.amount.toLocaleString('id-ID')}</span> ({paymentToDelete.payment_type}).
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPaymentToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeletePayment}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Pembayaran</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE SAVING */}
      {savingToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Hapus Catatan Simpanan</h3>
                <p className="text-xs text-slate-500">ID: {savingToDelete.saving_id}</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs space-y-2">
              <p className="text-slate-800">
                Setoran simpanan sebesar{' '}
                <span className="font-bold text-slate-900">Rp{savingToDelete.amount.toLocaleString('id-ID')}</span> ({savingToDelete.saving_type}) akan dihapus dari buku kas.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSavingToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteSaving}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Simpanan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE SALES REPORT */}
      {salesToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Hapus Laporan Omzet</h3>
                <p className="text-xs text-slate-500">ID: {salesToDelete.sales_report_id}</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs space-y-2">
              <p className="text-slate-800">
                Laporan omzet kotor sebesar{' '}
                <span className="font-bold text-slate-900">Rp{salesToDelete.gross_sales.toLocaleString('id-ID')}</span> untuk stand {salesToDelete.registration_id} akan dihapus.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSalesToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteSales}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT DOCUMENT REASON */}
      {rejectingDocId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <form
            onSubmit={handleRejectDocument}
            className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Alasan Penolakan Dokumen</h3>
                <p className="text-xs text-slate-500">ID: {rejectingDocId}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Alasan Penolakan
              </label>
              <textarea
                rows={3}
                value={docRejectReason}
                onChange={(e) => setDocRejectReason(e.target.value)}
                placeholder="Contoh: Foto NIB buram / Nomor NIB tidak terdaftar di sistem OSS..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRejectingDocId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Kirim Penolakan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
