import React, { useState, useEffect } from 'react';
import { Member, EventItem, EventRegistration, Product, SalesReport, Saving, MemberDocument, Payment } from '../types';
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
  Building2,
  Info,
  KeyRound,
  Edit3,
  User,
  Camera,
  ChevronRight,
  X,
  ExternalLink,
  DollarSign,
  Award,
  Check,
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

type FeatureType =
  | 'STAND'
  | 'SIMPANAN'
  | 'PEMBAYARAN'
  | 'PROFIL'
  | 'EVENT'
  | 'PRODUK'
  | 'OMZET'
  | 'LEGALITAS';

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  member,
  onOpenStandMap,
  onOpenPaymentModal,
  onOpenDigitalCard,
  onOpenChangePassword,
  onOpenBarcodeModal,
}) => {
  const [, setVersion] = useState(0);
  const [activeFeature, setActiveFeature] = useState<FeatureType | null>('STAND');

  // Subscribe to storage updates
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const events = storage.getEvents();
  const activeEvent = events[0];
  const liveMember = storage.getMemberById(member.member_id) || member;
  const registrations = storage.getRegistrations().filter((r) => r.member_id === liveMember.member_id);
  const allRegistrations = storage.getRegistrations();
  const products = storage.getProducts(liveMember.member_id);
  const salesReports = storage.getSalesReports(liveMember.member_id);
  const documents = storage.getDocuments(liveMember.member_id);
  const savingsSummary = storage.getMemberSavingsSummary(liveMember.member_id);
  const koperasiConfig = storage.getKoperasiConfig();
  const payments = storage.getPayments().filter((p) => p.member_id === liveMember.member_id);

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

  // 64 Stand Calculation
  const totalStands = 64;
  const activeEventOccupiedCount = allRegistrations.filter(
    (r) => r.event_id === activeEvent?.event_id && r.registration_status !== 'REJECTED'
  ).length;
  const standsAvailableCount = Math.max(0, totalStands - activeEventOccupiedCount);

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

  // 8 Main Features Definition for Circular Grid
  const menuFeatures = [
    {
      id: 'STAND' as FeatureType,
      title: 'Stand Pasar',
      shortDesc: '64 Stand Tersedia',
      icon: Store,
      badge: currentEventRegistration
        ? `Stand ${currentEventRegistration.stand_code}`
        : `${standsAvailableCount} Kosong`,
      badgeColor: currentEventRegistration ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900',
    },
    {
      id: 'SIMPANAN' as FeatureType,
      title: 'Simpanan',
      shortDesc: savingsSummary.isKoperasiMember ? 'Pokok & Wajib' : 'Non-Koperasi',
      icon: Wallet,
      badge: savingsSummary.isKoperasiMember
        ? savingsSummary.isPokokLunas && savingsSummary.isWajibCurrentMonthPaid
          ? 'Lunas'
          : 'Ada Tagihan'
        : 'Bebas Iuran',
      badgeColor: savingsSummary.isKoperasiMember
        ? savingsSummary.isPokokLunas && savingsSummary.isWajibCurrentMonthPaid
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-amber-100 text-amber-900'
        : 'bg-slate-100 text-slate-700',
    },
    {
      id: 'PEMBAYARAN' as FeatureType,
      title: 'Pembayaran',
      shortDesc: 'Rekening & Riwayat',
      icon: CreditCard,
      badge: `${payments.length} Transaksi`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'PROFIL' as FeatureType,
      title: 'Profil & KTA',
      shortDesc: 'Biodata & Kartu',
      icon: User,
      badge: 'KTA Aktif',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'EVENT' as FeatureType,
      title: 'Event Pasar',
      shortDesc: activeEvent?.event_date || 'Setiap Minggu',
      icon: Calendar,
      badge: 'Aktif',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'PRODUK' as FeatureType,
      title: 'Produk UMKM',
      shortDesc: 'Katalog Usaha',
      icon: ShoppingBag,
      badge: `${products.length} Produk`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'OMZET' as FeatureType,
      title: 'Lapor Omzet',
      shortDesc: 'Evaluasi Penjualan',
      icon: TrendingUp,
      badge: `${salesReports.length} Laporan`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'LEGALITAS' as FeatureType,
      title: 'Legalitas',
      shortDesc: 'Google Drive Dokumen',
      icon: FileCheck,
      badge: `${documents.length} File`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* 1. WELCOME & STATUS HEADER CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={
                  liveMember.foto_profil_url ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                }
                alt={liveMember.nama_lengkap}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-slate-800"
              />
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xs cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {liveMember.nomor_anggota}
                </span>
                {savingsSummary.isKoperasiMember ? (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Anggota Koperasi KBMB (Aktif)</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
                    <Store className="w-3 h-3 text-slate-500" />
                    <span>Tenant Pasar (Non-Koperasi)</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                {liveMember.nama_lengkap}
              </h2>
              <p className="text-xs font-medium text-slate-500 truncate">
                {liveMember.nama_usaha} • {liveMember.kategori_usaha}
              </p>
            </div>
          </div>

          {/* Action Buttons Top */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {onOpenBarcodeModal && (
              <button
                type="button"
                onClick={() => onOpenBarcodeModal(liveMember)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Lihat Barcode Stand & KTA"
              >
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>Barcode KTA</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenDigitalCard}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-900/20"
            >
              <Award className="w-4 h-4" />
              <span>Buka Kartu Digital</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PUSAT MENU FITUR UTAMA (GRID IKON LINGKARAN EMAS & HIJAU BANUARASA) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Menu Utama • Key Visual Banuarasa
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              Ketuk Ikon untuk Membuka Detail Fitur
            </h3>
          </div>
          {activeFeature && (
            <button
              type="button"
              onClick={() => setActiveFeature(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tutup Detail</span>
            </button>
          )}
        </div>

        {/* The 8 Circular Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-5 pt-2">
          {menuFeatures.map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeFeature === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveFeature(item.id)}
                className={`flex flex-col items-center gap-2 group cursor-pointer focus:outline-hidden transition-all duration-200 p-2 rounded-2xl ${
                  isSelected ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                }`}
                title={`Buka detail fitur ${item.title}`}
              >
                {/* BANUARASA KEY VISUAL CIRCLE:
                    - Warna dasar hijau: bg-gradient-to-b from-emerald-600 to-emerald-800
                    - Icon putih: text-white
                    - Lingkaran kuning emas: border-[3px] border-amber-400
                */}
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                    isSelected
                      ? 'bg-emerald-600 border-[3px] border-white ring-4 ring-amber-400 scale-105 shadow-xl shadow-amber-400/40'
                      : 'bg-gradient-to-b from-emerald-700 to-emerald-900 border-[2.5px] border-amber-400 group-hover:border-amber-300 group-hover:scale-105 group-hover:shadow-amber-400/20'
                  }`}
                >
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-xs" />
                </div>

                {/* Short Title & Status Badge Underneath */}
                <div className="text-center">
                  <span
                    className={`block text-xs sm:text-sm font-black leading-tight tracking-tight ${
                      isSelected ? 'text-emerald-900' : 'text-slate-800 group-hover:text-emerald-800'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span
                    className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-1 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. HALAMAN DETAIL FITUR (TERBUKA SAAT IKON DIKETUK) */}
      {activeFeature && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          {/* Header Detail View */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-700 border-2 border-amber-400 text-white flex items-center justify-center shadow-md shrink-0">
                {activeFeature === 'STAND' && <Store className="w-5 h-5 text-white" />}
                {activeFeature === 'SIMPANAN' && <Wallet className="w-5 h-5 text-white" />}
                {activeFeature === 'PEMBAYARAN' && <CreditCard className="w-5 h-5 text-white" />}
                {activeFeature === 'PROFIL' && <User className="w-5 h-5 text-white" />}
                {activeFeature === 'EVENT' && <Calendar className="w-5 h-5 text-white" />}
                {activeFeature === 'PRODUK' && <ShoppingBag className="w-5 h-5 text-white" />}
                {activeFeature === 'OMZET' && <TrendingUp className="w-5 h-5 text-white" />}
                {activeFeature === 'LEGALITAS' && <FileCheck className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {activeFeature === 'STAND' && 'Detail Pendaftaran & Peta 64 Stand'}
                  {activeFeature === 'SIMPANAN' && 'Buku Kas & Riwayat Simpanan Anggota'}
                  {activeFeature === 'PEMBAYARAN' && 'Pusat Pembayaran & Bukti Transfer'}
                  {activeFeature === 'PROFIL' && 'Biodata Profil & Kartu Tanda Anggota (KTA)'}
                  {activeFeature === 'EVENT' && 'Informasi Banuarasa Weekend Market Aktif'}
                  {activeFeature === 'PRODUK' && 'Katalog Produk Usaha UMKM Anda'}
                  {activeFeature === 'OMZET' && 'Laporan & Evaluasi Omzet Penjualan UMKM'}
                  {activeFeature === 'LEGALITAS' && 'Arsip Dokumen Legalitas (Google Drive)'}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeFeature === 'STAND' && 'Pilih lokasi stand favorit Anda pada event mingguan Banuarasa.'}
                  {activeFeature === 'SIMPANAN' && 'Transparansi simpanan pokok, simpanan wajib, dan simpanan sukarela koperasi.'}
                  {activeFeature === 'PEMBAYARAN' && 'Konfirmasi pembayaran sewa stand dan iuran simpanan koperasi.'}
                  {activeFeature === 'PROFIL' && 'Kelola identitas, foto profil, dan kata sandi akun Anda.'}
                  {activeFeature === 'EVENT' && 'Jadwal operasional, lokasi Tepian Teratai, dan tata tertib pedagang.'}
                  {activeFeature === 'PRODUK' && 'Daftar produk kuliner dan kriya yang ditampilkan pada etalase UMKM.'}
                  {activeFeature === 'OMZET' && 'Pencatatan omzet kotor, modal, dan estimasi laba bersih setiap event.'}
                  {activeFeature === 'LEGALITAS' && 'Kelengkapan perizinan usaha NIB, Halal BPJPH, PIRT, dan NPWP.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveFeature(null)}
              className="self-start sm:self-center px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tutup Detail</span>
            </button>
          </div>

          {/* FEATURE 1: STAND PASAR 64 */}
          {activeFeature === 'STAND' && (
            <div className="space-y-6">
              {/* Stand Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-emerald-800">Total Alokasi Stand</p>
                  <p className="text-2xl font-black text-emerald-950 mt-1">64 Stand</p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Weekend Market Tepian Teratai</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Stand Terisi / Dipesan</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{activeEventOccupiedCount} Stand</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Oleh pelaku UMKM Berau</p>
                </div>
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-amber-800">Stand Kosong Tersedia</p>
                  <p className="text-2xl font-black text-amber-950 mt-1">{standsAvailableCount} Stand</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">Siap dipilih sekarang</p>
                </div>
              </div>

              {/* Member's Current Stand Status */}
              <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Status Pendaftaran Anda:
                    </span>
                    {currentEventRegistration ? (
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                          {currentEventRegistration.stand_code}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900">
                            Stand {currentEventRegistration.stand_code} Terdaftar
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                currentEventRegistration.registration_status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : currentEventRegistration.registration_status === 'WAITING_PAYMENT'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-sky-100 text-sky-800 border border-sky-300'
                              }`}
                            >
                              {currentEventRegistration.registration_status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-black text-emerald-800">
                              Rp{currentEventRegistration.stand_price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1.5">
                        <p className="text-sm font-black text-amber-800">
                          Anda Belum Memilih Stand untuk Event Minggu Ini
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tersedia Kategori 1 (A s/d J: Rp50.000), Kategori 2 (1 s/d 43: Rp50.000), dan Kategori 3 (44 s/d 54: Rp35.000).
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions for Stand */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!currentEventRegistration ? (
                      <button
                        type="button"
                        onClick={() => activeEvent && onOpenStandMap(activeEvent)}
                        className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Store className="w-4 h-4" />
                        <span>PILIH STAND SEKARANG (BUKA DENAH 64 STAND)</span>
                      </button>
                    ) : currentEventRegistration.registration_status === 'WAITING_PAYMENT' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenPaymentModal({
                              registration: currentEventRegistration,
                              paymentType: 'EVENT_PARTICIPATION',
                              defaultAmount: currentEventRegistration.stand_price,
                            })
                          }
                          className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>UPLOAD BUKTI BAYAR (RP{currentEventRegistration.stand_price.toLocaleString('id-ID')})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => activeEvent && onOpenStandMap(activeEvent)}
                          className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Lihat Peta Stand
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-2 rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Stand Terkonfirmasi Resmi</span>
                        </span>
                        {onOpenBarcodeModal && (
                          <button
                            type="button"
                            onClick={() => onOpenBarcodeModal(liveMember)}
                            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>Barcode Stand</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => activeEvent && onOpenStandMap(activeEvent)}
                          className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Lihat Denah
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEATURE 2: SIMPANAN KOPERASI (POKOK, WAJIB, CICILAN) */}
          {activeFeature === 'SIMPANAN' && (
            <div className="space-y-6">
              {savingsSummary.isKoperasiMember ? (
                <>
                  {/* Status Info for Cooperative Members */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <p className="font-bold">Status: Anggota Penuh Koperasi Berau Melangkah Bersama (KBMB)</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Sebagai anggota koperasi, Anda berhak atas pembagian Sisa Hasil Usaha (SHU) tahunan dan fasilitas permodalan, dengan kewajiban Simpanan Pokok dan Simpanan Wajib rutin.
                      </p>
                    </div>
                  </div>

                  {/* Core Savings Cards: Simpanan Pokok & Simpanan Wajib */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Card 1: Simpanan Pokok */}
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            Simpanan Pokok
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            savingsSummary.isPokokLunas
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {savingsSummary.isPokokLunas ? 'Lunas' : 'Dalam Cicilan'}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total Simpanan Pokok Disetor:</p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-800 mt-0.5">
                          Rp{savingsSummary.simpananPokok.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Target Kewajiban: <strong>Rp{savingsSummary.targetSimpananPokok.toLocaleString('id-ID')}</strong> (1x diawal)
                        </p>
                      </div>

                      {/* Detail Cicilan Pokok */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Jumlah Cicilan yang Telah Disetor:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {savingsSummary.cicilanPokokCount} kali setoran
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Sisa Kewajiban Pokok:</span>
                          <span className="font-black text-amber-900 font-mono">
                            Rp{savingsSummary.sisaCicilanPokok.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {savingsSummary.sisaCicilanPokok > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenPaymentModal({
                              paymentType: 'SIMPANAN_POKOK',
                              defaultAmount: Math.min(
                                savingsSummary.sisaCicilanPokok,
                                koperasiConfig.simpanan_pokok_cicilan_nominal || 20000
                              ),
                            })
                          }
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>BAYAR / CICIL SIMPANAN POKOK</span>
                        </button>
                      ) : (
                        <div className="py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Simpanan Pokok Telah Lunas Penuh</span>
                        </div>
                      )}
                    </div>

                    {/* Card 2: Simpanan Wajib */}
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            Simpanan Wajib Bulanan
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            savingsSummary.isWajibCurrentMonthPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {savingsSummary.isWajibCurrentMonthPaid ? 'Lunas Bulan Ini' : 'Belum Disetor Bulan Ini'}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total Uang Simpanan Wajib Disetor:</p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-800 mt-0.5">
                          Rp{savingsSummary.simpananWajib.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Kewajiban Iuran: <strong>Rp{savingsSummary.simpananWajibNominalPerBulan.toLocaleString('id-ID')} / bulan</strong>
                        </p>
                      </div>

                      {/* Detail Akumulasi Simpanan Wajib */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Jumlah Bulan Setoran Terpenuhi:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {savingsSummary.cicilanWajibCount} bulan
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Status Bulan Berjalan:</span>
                          <span
                            className={`font-bold font-mono ${
                              savingsSummary.isWajibCurrentMonthPaid ? 'text-emerald-700' : 'text-amber-800'
                            }`}
                          >
                            {savingsSummary.isWajibCurrentMonthPaid ? 'Sudah Terbayar' : 'Harap Disetor'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenPaymentModal({
                            paymentType: 'SIMPANAN_WAJIB',
                            defaultAmount: savingsSummary.simpananWajibNominalPerBulan,
                          })
                        }
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>SETOR SIMPANAN WAJIB (RP{savingsSummary.simpananWajibNominalPerBulan.toLocaleString('id-ID')})</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Balance & Voluntary Savings */}
                  <div className="p-5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-emerald-200 font-bold uppercase">Total Kas Simpanan Anda di Koperasi</p>
                      <p className="text-3xl font-black text-white mt-1">
                        Rp{savingsSummary.totalSimpanan.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[11px] text-emerald-300 mt-1">
                        Simpanan Sukarela Anda: Rp{savingsSummary.simpananSukarela.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenPaymentModal({
                          paymentType: 'SIMPANAN_SUKARELA',
                          defaultAmount: 50000,
                        })
                      }
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      + Tambah Simpanan Sukarela
                    </button>
                  </div>

                  {/* Table Riwayat Mutasi Simpanan */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-slate-900">Buku Riwayat Setoran Simpanan Anda</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                            <th className="p-3">ID Simpanan</th>
                            <th className="p-3">Jenis Simpanan</th>
                            <th className="p-3">Periode</th>
                            <th className="p-3">Nominal</th>
                            <th className="p-3">Status Verifikasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {savingsSummary.history.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-slate-400">
                                Belum ada riwayat setoran simpanan tercatat.
                              </td>
                            </tr>
                          ) : (
                            savingsSummary.history.map((s) => (
                              <tr key={s.saving_id} className="hover:bg-slate-50/80">
                                <td className="p-3 font-mono font-bold text-slate-700">{s.saving_id}</td>
                                <td className="p-3 font-bold text-slate-900">{s.saving_type.replace(/_/g, ' ')}</td>
                                <td className="p-3 text-slate-500">{s.period_month_year}</td>
                                <td className="p-3 font-black text-emerald-800">
                                  Rp{s.amount.toLocaleString('id-ID')}
                                </td>
                                <td className="p-3">
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    {s.payment_status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* Non-Cooperative Member View */
                <div className="p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                    <Store className="w-7 h-7 text-slate-500" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="text-base font-black text-slate-900">
                      Status Anda: Tenant Pasar Banuarasa (Bukan Anggota Koperasi)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Anda saat ini berpartisipasi sebagai tenant pasar mandiri. Anda <strong>tidak memiliki kewajiban</strong> membayar Simpanan Pokok maupun Simpanan Wajib bulanan.
                    </p>
                    <p className="text-xs text-emerald-800 font-bold leading-relaxed pt-2">
                      Tertarik menjadi anggota penuh Koperasi Berau Melangkah Bersama (KBMB)?
                      Nikmati fasilitas bagi hasil Sisa Hasil Usaha (SHU), akses permodalan usaha, dan diskon sewa stand. Silakan hubungi pengurus atau Super Admin koperasi.
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${koperasiConfig.nomor_wa_konfirmasi.replace(/[^0-9]/g, '')}?text=Halo%20Admin%20KBMB,%20saya%20${encodeURIComponent(
                        liveMember.nama_lengkap
                      )}%20ingin%20mendaftar%20menjadi%20Anggota%20Penuh%20Koperasi`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Hubungi Pengurus untuk Jadi Anggota Koperasi</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FEATURE 3: PEMBAYARAN */}
          {activeFeature === 'PEMBAYARAN' && (
            <div className="space-y-6">
              {/* Rekening Resmi */}
              <div className="p-5 bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50/50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    Rekening Resmi Pembayaran & Konfirmasi
                  </span>
                  <h4 className="text-base font-black text-slate-900">
                    {koperasiConfig.nama_bank}: <span className="font-mono text-emerald-800">{koperasiConfig.nomor_rekening}</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    Atas Nama: <strong>{koperasiConfig.atas_nama_rekening}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    WhatsApp Konfirmasi: <span className="font-mono">{koperasiConfig.nomor_wa_konfirmasi}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenPaymentModal({
                      paymentType: 'EVENT_PARTICIPATION',
                      defaultAmount: 50000,
                    })
                  }
                  className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>UPLOAD BUKTI TRANSFER BARU</span>
                </button>
              </div>

              {/* Riwayat Pembayaran */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900">Riwayat Pembayaran Anda ({payments.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                        <th className="p-3">ID Bayar</th>
                        <th className="p-3">Jenis Pembayaran</th>
                        <th className="p-3">Nominal</th>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Status Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            Belum ada riwayat transaksi pembayaran.
                          </td>
                        </tr>
                      ) : (
                        payments.map((p) => (
                          <tr key={p.payment_id} className="hover:bg-slate-50/80">
                            <td className="p-3 font-mono font-bold text-slate-700">{p.payment_id}</td>
                            <td className="p-3 font-bold text-slate-900">{p.payment_type.replace(/_/g, ' ')}</td>
                            <td className="p-3 font-black text-emerald-800">
                              Rp{p.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3 text-slate-500">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                            <td className="p-3">
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                  p.verification_status === 'VERIFIED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : p.verification_status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {p.verification_status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FEATURE 4: PROFIL & KTA */}
          {activeFeature === 'PROFIL' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Biodata Summary */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm">Informasi Biodata</h4>
                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(true)}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Biodata</span>
                    </button>
                  </div>
                  <div className="space-y-2 pt-1 divide-y divide-slate-200/60">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Nama Lengkap</span>
                      <span className="font-bold text-slate-900">{liveMember.nama_lengkap}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Nomor Anggota</span>
                      <span className="font-mono font-bold text-emerald-800">{liveMember.nomor_anggota}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">NIK KTP</span>
                      <span className="font-mono text-slate-700">{liveMember.nik || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Nama Usaha</span>
                      <span className="font-bold text-slate-900">{liveMember.nama_usaha}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Kategori Usaha</span>
                      <span className="text-slate-800">{liveMember.kategori_usaha}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">No. WhatsApp</span>
                      <span className="font-mono text-slate-700">{liveMember.whatsapp}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Email</span>
                      <span className="text-slate-700">{liveMember.email || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* KTA Actions & Digital Card Preview */}
                <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                        Kartu Tanda Anggota Digital
                      </span>
                      <span className="text-xs font-mono text-slate-400">ID: {liveMember.member_id}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <img
                        src={
                          liveMember.foto_profil_url ||
                          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={liveMember.nama_lengkap}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md bg-slate-800"
                      />
                      <div>
                        <h5 className="text-sm font-black text-white">{liveMember.nama_lengkap}</h5>
                        <p className="text-xs text-emerald-300 font-bold">{liveMember.nama_usaha}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{liveMember.nomor_anggota}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                    {onOpenBarcodeModal && (
                      <button
                        type="button"
                        onClick={() => onOpenBarcodeModal(liveMember)}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Barcode & QR KTA</span>
                      </button>
                    )}
                    {onOpenChangePassword && (
                      <button
                        type="button"
                        onClick={onOpenChangePassword}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer border border-white/20"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Ganti Sandi</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onOpenDigitalCard}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <span>Buka KTA Penuh</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEATURE 5: EVENT PASAR */}
          {activeFeature === 'EVENT' && (
            <div className="space-y-5">
              <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50 via-slate-50 to-white rounded-2xl border border-emerald-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Event Aktif Berjalan
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-1">{activeEvent?.event_name}</h4>
                    <p className="text-xs text-slate-500">
                      {activeEvent?.location} • Pukul {activeEvent?.start_time} - {activeEvent?.end_time} WITA
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => activeEvent && onOpenStandMap(activeEvent)}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                  >
                    <Store className="w-4 h-4" />
                    <span>Buka Peta 64 Stand</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <span>Loading Barang</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Mulai pukul 05:00 WITA sebelum gerbang dibuka untuk pengunjung.</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Kebersihan Stand</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Wajib membawa kantong sampah sendiri dan menjaga area tetap higienis.</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      <span>Absensi Barcode</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Scan barcode tiket stand oleh petugas panitia saat check-in lokasi.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEATURE 6: PRODUK UMKM */}
          {activeFeature === 'PRODUK' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Katalog Produk UMKM Anda ({products.length})</h4>
                  <p className="text-xs text-slate-500">Kelola daftar menu dan produk yang dipasarkan di pasar mingguan.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProductForm(true)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Produk</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.length === 0 ? (
                  <div className="sm:col-span-2 lg:col-span-3 p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    Belum ada produk terdaftar. Klik 'Tambah Produk' untuk mempromosikan dagangan Anda.
                  </div>
                ) : (
                  products.map((p) => (
                    <div
                      key={p.product_id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image_url}
                          alt={p.product_name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 bg-slate-200"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-emerald-700 uppercase">{p.category}</span>
                          <h5 className="text-xs font-bold text-slate-900 truncate">{p.product_name}</h5>
                          <p className="text-xs font-black text-slate-800">Rp{p.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => storage.deleteProduct(p.product_id, liveMember.member_id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* FEATURE 7: LAPOR OMZET */}
          {activeFeature === 'OMZET' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Rekapitulasi Omzet Penjualan</h4>
                  <p className="text-xs text-slate-500">Pantau pertumbuhan dan omzet bersih usaha UMKM Anda secara mandiri.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSalesForm(true)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Input Laporan Omzet</span>
                </button>
              </div>

              {/* Stats Omzet */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Total Omzet Penjualan</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    Rp{salesReports.reduce((sum, r) => sum + r.gross_sales, 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-emerald-800">Total Estimasi Laba Bersih</p>
                  <p className="text-2xl font-black text-emerald-950 mt-1">
                    Rp{salesReports.reduce((sum, r) => sum + r.net_profit, 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Total Produk/Porsi Terjual</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {salesReports.reduce((sum, r) => sum + r.total_items_sold, 0)} Porsi
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FEATURE 8: LEGALITAS DOKUMEN */}
          {activeFeature === 'LEGALITAS' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Arsip Dokumen Legalitas (Google Drive)</h4>
                  <p className="text-xs text-slate-500">
                    Tersimpan rapi pada folder terintegrasi <code className="font-mono text-[10px] text-emerald-700">01_ANGGOTA/{liveMember.member_id}/Legalitas</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDocForm(true)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Dokumen Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.length === 0 ? (
                  <div className="sm:col-span-2 p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    Belum ada dokumen legalitas diunggah. Klik 'Upload Dokumen Baru' untuk mengunggah NIB atau Halal.
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.document_id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">{doc.document_type}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
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
                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                          No: {doc.document_number || doc.file_name}
                        </p>
                      </div>
                      <FileCheck className="w-5 h-5 text-emerald-700" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md shadow-emerald-700/20"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md shadow-emerald-700/20"
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md shadow-emerald-700/20"
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
