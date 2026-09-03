import React, { useState } from 'react';
import { Member, EventItem, EventRegistration, Product, SalesReport, Saving, MemberDocument } from '../types';
import { storage } from '../services/storage';
import {
  Calendar,
  Store,
  Wallet,
  QrCode,
  TrendingUp,
  Plus,
  Trash2,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Building,
  Info,
  KeyRound,
  Edit3,
  User,
  Camera,
} from 'lucide-react';
import { MemberProfileEditModal } from './MemberProfileEditModal';

interface MemberDashboardProps {
  member: Member;
  onOpenStandMap: (event: EventItem) => void;
  onOpenPaymentModal: (params: { registration?: EventRegistration; paymentType?: any; defaultAmount?: number }) => void;
  onOpenDigitalCard: () => void;
  onOpenChangePassword?: () => void;
  onOpenBarcodeModal?: (member?: Member | null) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  member,
  onOpenStandMap,
  onOpenPaymentModal,
  onOpenDigitalCard,
  onOpenChangePassword,
  onOpenBarcodeModal,
}) => {
  const [, setVersion] = useState(0);

  // Subscribe to storage updates
  React.useEffect(() => {
    const unsub = storage.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const events = storage.getEvents();
  const activeEvent = events[0];
  const liveMember = storage.getMemberById(member.member_id) || member;
  const registrations = storage.getRegistrations().filter((r) => r.member_id === liveMember.member_id);
  const products = storage.getProducts(liveMember.member_id);
  const salesReports = storage.getSalesReports(liveMember.member_id);
  const documents = storage.getDocuments(liveMember.member_id);
  const savingsSummary = storage.getMemberSavingsSummary(liveMember.member_id);

  // States for Modals/Forms
  const [showProductForm, setShowProductForm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'KULINER' | 'FASHION' | 'KRIYA' | 'JASA'>('KULINER');
  const [newProductPrice, setNewProductPrice] = useState<number>(25000);
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImage, setNewProductImage] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  );

  // Sales Report Form State
  const [salesGross, setSalesGross] = useState<number>(1500000);
  const [salesCost, setSalesCost] = useState<number>(800000);
  const [salesItemsSold, setSalesItemsSold] = useState<number>(45);
  const [salesBestSeller, setSalesBestSeller] = useState('Sambal Raja Berau');
  const [salesNotes, setSalesNotes] = useState('Stand ramai pengunjung sore hari.');

  // Document Upload State
  const [docType, setDocType] = useState<MemberDocument['document_type']>('NIB');
  const [docNumber, setDocNumber] = useState('');
  const [docFileName, setDocFileName] = useState('dokumen-legalitas.pdf');

  // Active registration for this event
  const currentEventRegistration = registrations.find((r) => r.event_id === activeEvent?.event_id);

  // Handle Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    storage.addProduct({
      member_id: liveMember.member_id,
      product_name: newProductName,
      category: newProductCategory === 'KULINER' ? 'Kuliner' : newProductCategory === 'FASHION' ? 'Fashion' : 'Kriya',
      price: Number(newProductPrice),
      description: newProductDesc,
      image_url: newProductImage,
      featured: false,
      status: 'ACTIVE',
    });

    setNewProductName('');
    setNewProductDesc('');
    setShowProductForm(false);
  };

  // Handle Submit Sales Report
  const handleSubmitSalesReport = (e: React.FormEvent) => {
    e.preventDefault();
    const netProfit = Number(salesGross) - Number(salesCost);

    storage.submitSalesReport({
      event_id: activeEvent?.event_id || 'BWM-2026-001',
      member_id: liveMember.member_id,
      registration_id: currentEventRegistration?.registration_id || `REG-${activeEvent?.event_id || 'BWM-001'}-STAND-A`,
      total_transactions: 1,
      gross_sales: Number(salesGross),
      cost: Number(salesCost),
      net_profit: netProfit,
      total_items_sold: Number(salesItemsSold),
      notes: `${salesBestSeller} - ${salesNotes}`,
    });

    setShowSalesForm(false);
  };

  // Handle Document Upload
  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    storage.uploadDocument({
      member_id: liveMember.member_id,
      document_type: docType,
      document_number: docNumber,
      file_name: docFileName,
      drive_file_id: `DriveDoc_${Date.now()}`,
      drive_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    });
    setDocNumber('');
    setShowDocForm(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Bento Grid Top Section: Hero Event Card + Simpanan & Digital Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hero Event Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  Event Aktif
                </span>
                <span className="text-xs text-slate-400 font-bold">• {activeEvent?.event_date}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeEvent?.event_name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeEvent?.location} ({activeEvent?.start_time} - {activeEvent?.end_time} WITA)
              </p>
            </div>

            {/* User Registration Status Badge */}
            {currentEventRegistration ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {currentEventRegistration.stand_code}
                </div>
                <div className="text-left">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Stand Anda</p>
                  <p className="text-xs font-black text-slate-800">
                    Stand {currentEventRegistration.stand_code}
                  </p>
                  <span
                    className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                      currentEventRegistration.registration_status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentEventRegistration.registration_status === 'WAITING_PAYMENT'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {currentEventRegistration.registration_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 self-start sm:self-center">
                Belum Terdaftar di Event Ini
              </span>
            )}
          </div>

          {/* Action Area based on registration state */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>64 Stand Tersedia untuk Anggota Koperasi Berau</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Kategori 1 (A sampai J) Rp50.000 / Event • Kategori 2 (1 sampai 43) Rp50.000 / Event • Kategori 3 (44 sampai 54) Rp35.000 / Event
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {!currentEventRegistration ? (
                <button
                  onClick={() => activeEvent && onOpenStandMap(activeEvent)}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>PILIH STAND SEKARANG</span>
                </button>
              ) : currentEventRegistration.registration_status === 'WAITING_PAYMENT' ? (
                <button
                  onClick={() =>
                    onOpenPaymentModal({
                      registration: currentEventRegistration,
                      paymentType: 'EVENT_PARTICIPATION',
                      defaultAmount: currentEventRegistration.stand_price,
                    })
                  }
                  className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>UPLOAD BUKTI TRANSFER (RP{currentEventRegistration.stand_price.toLocaleString('id-ID')})</span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Stand Terkonfirmasi Resmi</span>
                  </span>
                  {onOpenBarcodeModal && (
                    <button
                      type="button"
                      onClick={() => onOpenBarcodeModal(liveMember)}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Lihat Barcode Stand & KTA untuk Verifikasi Cepat"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Barcode Tiket & KTA</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Digital Card Bento (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                Kartu Anggota Digital
              </span>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/20 transition-colors"
                title="Lengkapi & Ubah Biodata / Foto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Biodata</span>
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="relative group shrink-0">
                <img
                  src={
                    liveMember.foto_profil_url ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={liveMember.nama_lengkap}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-md bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full shadow-xs cursor-pointer"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-mono font-bold text-emerald-300 tracking-wider truncate">
                  {liveMember.nomor_anggota}
                </h3>
                <p className="text-sm font-black text-white truncate mt-0.5">{liveMember.nama_lengkap}</p>
                <p className="text-xs font-semibold text-slate-300 truncate">{liveMember.nama_usaha}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400 font-mono">ID: {liveMember.member_id}</span>
            <div className="flex items-center gap-1.5">
              {onOpenBarcodeModal && (
                <button
                  type="button"
                  onClick={() => onOpenBarcodeModal(liveMember)}
                  className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-amber-500/30"
                  title="Generate Barcode & QR Code KTA untuk Verifikasi"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Barcode</span>
                </button>
              )}
              {onOpenChangePassword && (
                <button
                  type="button"
                  onClick={onOpenChangePassword}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-emerald-500/20"
                  title="Rubah Kata Sandi Akun"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Sandi</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenDigitalCard}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Buka KTA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Section 2: Ringkasan Simpanan & Omzet Penjualan */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Buku Kas Simpanan Bento Card (6 cols) */}
        <div className="md:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Buku Simpanan
                </span>
                <span className="text-xs text-slate-400 font-bold">• Kas Koperasi</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  savingsSummary.isWajibCurrentMonthPaid
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {savingsSummary.isWajibCurrentMonthPaid ? 'Simpanan Bulan Ini Lunas' : 'Ada Tagihan'}
              </span>
            </div>

            <h3 className="text-base font-black text-slate-900">
              Total Simpanan Terkumpul
            </h3>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              Rp{savingsSummary.totalSimpanan.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase font-bold">Pokok</p>
              <p className="font-bold text-slate-800">
                Rp{savingsSummary.simpananPokok.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase font-bold">Wajib</p>
              <p className="font-bold text-slate-800">
                Rp{savingsSummary.simpananWajib.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase font-bold">Sukarela</p>
              <p className="font-bold text-slate-800">
                Rp{savingsSummary.simpananSukarela.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() =>
                onOpenPaymentModal({
                  paymentType: 'SIMPANAN_WAJIB',
                  defaultAmount: 25000,
                })
              }
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>SETOR SIMPANAN WAJIB / SUKARELA</span>
            </button>
          </div>
        </div>

        {/* Laporan Omzet Penjualan UMKM (6 cols) */}
        <div className="md:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Data Omzet UMKM
                </span>
                <span className="text-xs text-slate-400 font-bold">• Terpisah dari Kas</span>
              </div>
              <button
                onClick={() => setShowSalesForm(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Laporan</span>
              </button>
            </div>

            <h3 className="text-base font-black text-slate-900">
              Total Omzet Penjualan Event
            </h3>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Rp
              {salesReports
                .reduce((sum, r) => sum + r.gross_sales, 0)
                .toLocaleString('id-ID')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <p className="text-[9px] text-emerald-800 uppercase font-bold">Total Laba Bersih</p>
              <p className="font-bold text-emerald-950">
                Rp
                {salesReports
                  .reduce((sum, r) => sum + r.net_profit, 0)
                  .toLocaleString('id-ID')}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase font-bold">Produk Terjual</p>
              <p className="font-bold text-slate-800">
                {salesReports.reduce((sum, r) => sum + r.total_items_sold, 0)} Porsi/Item
              </p>
            </div>
          </div>

          {/* Quick Item List or CTA */}
          <div className="pt-2">
            <button
              onClick={() => setShowSalesForm(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>LAPORKAN OMZET EVENT TERAKHIR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento Section 3: Manajemen Produk & Legalitas Dokumen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Kelola Produk UMKM (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Katalog Produk ({products.length})
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Daftar Produk Usaha Anda
              </h3>
            </div>
            <button
              onClick={() => setShowProductForm(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Produk</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {products.map((p) => (
              <div
                key={p.product_id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.image_url}
                    alt={p.product_name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-emerald-700 uppercase">
                      {p.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {p.product_name}
                    </h4>
                    <p className="text-xs font-black text-slate-800">
                      Rp{p.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => storage.deleteProduct(p.product_id, member.member_id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Hapus Produk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dokumen Legalitas (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Legalitas Usaha
              </span>
              <button
                onClick={() => setShowDocForm(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Dokumen</span>
              </button>
            </div>
            <h3 className="text-base font-black text-slate-900">Arsip Legalitas Google Drive</h3>
            <p className="text-xs text-slate-500">
              Dokumen tersimpan aman di folder <code className="font-mono text-[10px]">01_ANGGOTA/{member.member_id}/Legalitas</code>
            </p>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.document_id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-800">{doc.document_type}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        doc.verification_status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.verification_status === 'PENDING'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {doc.verification_status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {doc.document_number || doc.file_name}
                  </p>
                </div>
                <FileCheck className="w-4 h-4 text-emerald-600" />
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowDocForm(true)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>UNGGAH NIB / HALAL / PIRT BARU</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Produk */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-3">Tambah Produk UMKM Baru</h3>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Produk</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Contoh: Sate Ikan Berau Bumbu Kacang"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="KULINER">Kuliner</option>
                    <option value="FASHION">Fashion</option>
                    <option value="KRIYA">Kriya & Kerajinan</option>
                    <option value="JASA">Jasa</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Bahan lokal pilihan tanpa pengawet..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden h-20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Foto Produk (URL)</label>
                <input
                  type="text"
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Input Laporan Omzet Penjualan */}
      {showSalesForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">Laporan Penjualan Event UMKM</h3>
            <p className="text-xs text-slate-500 mb-3">
              Data omzet ini murni milik tenant UMKM untuk monitoring perkembangan usaha.
            </p>

            <form onSubmit={handleSubmitSalesReport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Omzet Kotor (Rp)</label>
                  <input
                    type="number"
                    value={salesGross}
                    onChange={(e) => setSalesGross(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Modal / HPP (Rp)</label>
                  <input
                    type="number"
                    value={salesCost}
                    onChange={(e) => setSalesCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Porsi Terjual</label>
                  <input
                    type="number"
                    value={salesItemsSold}
                    onChange={(e) => setSalesItemsSold(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Produk Paling Laris</label>
                  <input
                    type="text"
                    value={salesBestSeller}
                    onChange={(e) => setSalesBestSeller(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / Evaluasi Tenant</label>
                <textarea
                  value={salesNotes}
                  onChange={(e) => setSalesNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden h-16"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Estimasi Laba Bersih:</span>
                <p className="text-base font-black text-emerald-950">
                  Rp{(Number(salesGross) - Number(salesCost)).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSalesForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Dokumen Legalitas */}
      {showDocForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-3">Upload Dokumen Legalitas</h3>
            <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Dokumen</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="NIB">NIB (Nomor Induk Berusaha)</option>
                  <option value="HALAL">Sertifikat Halal BPJPH</option>
                  <option value="PIRT">P-IRT Dinas Kesehatan</option>
                  <option value="NPWP">NPWP Badan / Pribadi</option>
                  <option value="KTP">KTP Pengurus</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Registrasi Dokumen</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Contoh: 1209230008892"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama File</label>
                <input
                  type="text"
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  Unggah ke Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Profile & Photo Edit Modal */}
      <MemberProfileEditModal
        isOpen={isEditProfileOpen}
        member={liveMember}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};
