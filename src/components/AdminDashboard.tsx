import React, { useState, useMemo } from 'react';
import { 
  AuthSession, 
  Member, 
  EventItem, 
  Registration, 
  Payment, 
  Saving, 
  SalesReport, 
  DocumentRecord, 
  AuditLog,
  MasterStand,
  EditorialArticle,
  StandCategory,
  StandZone,
  EventStatus
} from '../types';
import { storage } from '../services/storage';

export type BarcodePosition = 'BOTTOM_RIGHT' | 'TOP_RIGHT' | 'BOTTOM_CENTER' | 'LEFT_PANEL';
export type BarcodeShape = 'SQUARE' | 'ROUNDED' | 'MINIMAL';

export interface KTADesignConfig {
  themePreset: 'EMERALD' | 'BERAU_HERITAGE' | 'DARK_VIP' | 'SLATE_CLEAN' | 'CUSTOM';
  bgImageUrl: string;
  bgOpacity: number;
  overlayColor: 'DARK' | 'LIGHT' | 'EMERALD';
  barcodePos: BarcodePosition;
  barcodeShape: BarcodeShape;
  showCategory: boolean;
  showAddress: boolean;
  showRegId: boolean;
  customTitle: string;
}

const DEFAULT_KTA_CONFIG: KTADesignConfig = {
  themePreset: 'EMERALD',
  bgImageUrl: '',
  bgOpacity: 85,
  overlayColor: 'DARK',
  barcodePos: 'BOTTOM_RIGHT',
  barcodeShape: 'SQUARE',
  showCategory: true,
  showAddress: false,
  showRegId: true,
  customTitle: 'KARTU TANDA ANGGOTA UMKM'
};

interface AdminDashboardProps {
  session: AuthSession;
  members?: Member[];
  events?: EventItem[];
  registrations?: Registration[];
  payments?: Payment[];
  savings?: Saving[];
  salesReports?: SalesReport[];
  documents?: DocumentRecord[];
  auditLogs?: AuditLog[];
  onDataUpdated: () => void;
  onOpenScanner?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  members = [],
  events = [],
  registrations = [],
  payments = [],
  savings = [],
  salesReports = [],
  documents = [],
  auditLogs = [],
  onDataUpdated,
  onOpenScanner
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'events' | 'stands' | 'payments' | 'savings' | 'reports' | 'editorials' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Safe Fallbacks
  const safeMembers = Array.isArray(members) ? members : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const safeRegistrations = Array.isArray(registrations) ? registrations : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  const safeSavings = Array.isArray(savings) ? savings : [];
  const safeSalesReports = Array.isArray(salesReports) ? salesReports : [];
  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];
  const safeArticles: EditorialArticle[] = Array.isArray(storage.getArticles?.()) ? storage.getArticles() : [];
  const safeStands: MasterStand[] = Array.isArray(storage.getStands?.()) ? storage.getStands() : [];

  // Filter Khusus Laporan Penjualan Mingguan
  const [filterEventTitle, setFilterEventTitle] = useState<string>('ALL');
  const [filterStandCode, setFilterStandCode] = useState<string>('ALL');

  // Modal States
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState({
    nama_lengkap: '',
    nama_usaha: '',
    kategori_usaha: 'KULINER' as StandCategory,
    nomor_hp: '',
    email: '',
    alamat: ''
  });

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '06:00',
    end_time: '12:00',
    location: 'Tepian Sambaliung, Berau',
    status: 'UPCOMING' as EventStatus,
    total_stands: 64
  });

  const [isStandModalOpen, setIsStandModalOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<MasterStand | null>(null);
  const [standForm, setStandForm] = useState({
    stand_code: '',
    category: 'KULINER' as StandCategory,
    zone: 'ZONA_A' as StandZone,
    base_price: 150000
  });

  const [isAssistBookingOpen, setIsAssistBookingOpen] = useState(false);
  const [assistForm, setAssistForm] = useState({
    member_id: '',
    stand_id: '',
    event_id: safeEvents[0]?.event_id || 'EVT-2026-001',
    instant_confirm: true
  });

  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [savingForm, setSavingForm] = useState({
    member_id: '',
    saving_type: 'SIMPANAN_WAJIB' as 'SIMPANAN_POKOK' | 'SIMPANAN_WAJIB' | 'SIMPANAN_SUKARELA',
    amount: 50000
  });

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<EditorialArticle | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    tag: 'Budaya & Kuliner',
    excerpt: '',
    content: '',
    cover_image: '',
    author: session?.user?.nama_lengkap || 'Redaksi Banuarasa',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT'
  });

  const [selectedMemberForKTA, setSelectedMemberForKTA] = useState<Member | null>(null);
  const [ktaDesignConfig, setKtaDesignConfig] = useState<KTADesignConfig>(DEFAULT_KTA_CONFIG);
  const [ktaActiveControlTab, setKtaActiveControlTab] = useState<'background' | 'barcode' | 'elements' | 'profile'>('background');
  const [ktaSaveAlert, setKtaSaveAlert] = useState<string>('');

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  // ----------------------------------------------------
  // REKAP ANALITIK SUPERADMIN: SIMPANAN POKOK, WAJIB & OMZET
  // ----------------------------------------------------
  const stats = useMemo(() => {
    // 1. Total Pemasukan Simpanan Pokok
    const totalSimpananPokok = safeSavings
      .filter(s => s?.saving_type === 'SIMPANAN_POKOK')
      .reduce((sum, s) => sum + (Number(s?.amount) || 0), 0);

    // 2. Total Pemasukan Simpanan Wajib
    const totalSimpananWajib = safeSavings
      .filter(s => s?.saving_type === 'SIMPANAN_WAJIB')
      .reduce((sum, s) => sum + (Number(s?.amount) || 0), 0);

    // 3. Total Simpanan Sukarela / Lainnya
    const totalSimpananSukarela = safeSavings
      .filter(s => s?.saving_type === 'SIMPANAN_SUKARELA')
      .reduce((sum, s) => sum + (Number(s?.amount) || 0), 0);

    const totalOmzet = safeSalesReports.reduce((sum, r) => sum + (Number(r?.total_turnover) || 0), 0);
    const pendingPayments = safePayments.filter(p => p?.verification_status === 'PENDING').length;
    const confirmedStands = safeRegistrations.filter(r => r?.status === 'CONFIRMED').length;

    return {
      totalMembers: safeMembers.length,
      totalEvents: safeEvents.length,
      confirmedStands,
      pendingPayments,
      totalSimpananPokok,
      totalSimpananWajib,
      totalSimpananSukarela,
      grandTotalSimpanan: totalSimpananPokok + totalSimpananWajib + totalSimpananSukarela,
      totalOmzet
    };
  }, [safeMembers, safeEvents, safeRegistrations, safePayments, safeSavings, safeSalesReports]);

  // Filter Data Laporan Penjualan Mingguan
  const filteredSalesReports = useMemo(() => {
    return safeSalesReports.filter(report => {
      const matchEvent = filterEventTitle === 'ALL' || report.event_title === filterEventTitle;
      const matchStand = filterStandCode === 'ALL' || report.stand_code === filterStandCode;
      return matchEvent && matchStand;
    });
  }, [safeSalesReports, filterEventTitle, filterStandCode]);

  // Daftar unik Event & Stand untuk filter dropdown
  const uniqueEventsList = useMemo(() => {
    return Array.from(new Set(safeSalesReports.map(r => r.event_title).filter(Boolean)));
  }, [safeSalesReports]);

  const uniqueStandsList = useMemo(() => {
    return Array.from(new Set(safeSalesReports.map(r => r.stand_code).filter(Boolean)));
  }, [safeSalesReports]);

  // Handlers KTA Studio
  const handleOpenKTAStudio = (m: Member) => {
    setSelectedMemberForKTA({ ...m });
    setKtaDesignConfig(DEFAULT_KTA_CONFIG);
    setKtaActiveControlTab('background');
    setKtaSaveAlert('');
  };

  const handleKtaPresetSelect = (preset: KTADesignConfig['themePreset']) => {
    let bgUrl = '';
    let opacity = 85;
    let overlay: KTADesignConfig['overlayColor'] = 'DARK';

    if (preset === 'BERAU_HERITAGE') {
      bgUrl = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=80';
      opacity = 40;
      overlay = 'DARK';
    } else if (preset === 'DARK_VIP') {
      bgUrl = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80';
      opacity = 60;
      overlay = 'DARK';
    } else if (preset === 'SLATE_CLEAN') {
      bgUrl = '';
      opacity = 95;
      overlay = 'LIGHT';
    }

    setKtaDesignConfig(prev => ({
      ...prev,
      themePreset: preset,
      bgImageUrl: bgUrl,
      bgOpacity: opacity,
      overlayColor: overlay
    }));
  };

  const handleKtaBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setKtaDesignConfig(prev => ({
          ...prev,
          themePreset: 'CUSTOM',
          bgImageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKtaMemberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedMemberForKTA) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedMemberForKTA({
          ...selectedMemberForKTA,
          avatar_url: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveKTAStudio = () => {
    if (!selectedMemberForKTA) return;
    storage.saveMember(selectedMemberForKTA);
    setKtaSaveAlert('Desain KTA & Profil Anggota Berhasil Disimpan!');
    onDataUpdated();
    setTimeout(() => {
      setKtaSaveAlert('');
      setSelectedMemberForKTA(null);
    }, 1200);
  };

  // Handlers Berita
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setArticleForm({
      title: '',
      tag: 'Budaya & Kuliner',
      excerpt: '',
      content: '',
      cover_image: '',
      author: session?.user?.nama_lengkap || 'Redaksi Banuarasa',
      status: 'PUBLISHED'
    });
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticle = (art: EditorialArticle) => {
    setEditingArticle(art);
    setArticleForm({
      title: art.title || '',
      tag: art.tag || 'Budaya & Kuliner',
      excerpt: art.excerpt || '',
      content: art.content || '',
      cover_image: art.cover_image || '',
      author: art.author || '',
      status: art.status || 'PUBLISHED'
    });
    setIsArticleModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setArticleForm(prev => ({ ...prev, cover_image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const articleData: EditorialArticle = {
      article_id: editingArticle?.article_id || `art-${Date.now()}`,
      title: articleForm.title,
      tag: articleForm.tag,
      excerpt: articleForm.excerpt,
      content: articleForm.content,
      cover_image: articleForm.cover_image,
      author: articleForm.author,
      published_at: editingArticle?.published_at || new Date().toISOString().split('T')[0],
      status: articleForm.status
    };

    storage.saveArticle(articleData);
    setIsArticleModalOpen(false);
    onDataUpdated();
  };

  const handleDeleteArticle = (articleId: string, title: string) => {
    if (!window.confirm(`Hapus berita: "${title}"?`)) return;
    storage.deleteArticle(articleId, title);
    onDataUpdated();
  };

  // Handlers Stand
  const handleOpenAddStand = () => {
    setEditingStand(null);
    setStandForm({
      stand_code: '',
      category: 'KULINER',
      zone: 'ZONA_A',
      base_price: 150000
    });
    setIsStandModalOpen(true);
  };

  const handleOpenEditStand = (stand: MasterStand) => {
    setEditingStand(stand);
    setStandForm({
      stand_code: stand.stand_code,
      category: stand.category,
      zone: stand.zone,
      base_price: stand.base_price
    });
    setIsStandModalOpen(true);
  };

  const handleSaveStand = (e: React.FormEvent) => {
    e.preventDefault();
    const allStands = storage.getStands();

    if (editingStand) {
      const idx = allStands.findIndex(s => s.stand_id === editingStand.stand_id);
      if (idx >= 0) {
        allStands[idx] = {
          ...allStands[idx],
          stand_code: standForm.stand_code.toUpperCase(),
          category: standForm.category,
          zone: standForm.zone,
          base_price: Number(standForm.base_price) || 150000
        };
      }
    } else {
      const newNumber = allStands.length + 1;
      const newStand: MasterStand = {
        stand_id: `STD-${String(newNumber).padStart(2, '0')}`,
        stand_code: standForm.stand_code.toUpperCase(),
        stand_number: newNumber,
        category: standForm.category,
        zone: standForm.zone,
        base_price: Number(standForm.base_price) || 150000,
        status: 'ACTIVE'
      };
      allStands.push(newStand);
    }

    setIsStandModalOpen(false);
    onDataUpdated();
  };

  const handleDeleteStand = (standId: string, code: string) => {
    if (!window.confirm(`Hapus master stand ${code}?`)) return;
    const allStands = storage.getStands();
    const idx = allStands.findIndex(s => s.stand_id === standId);
    if (idx >= 0) {
      allStands.splice(idx, 1);
      onDataUpdated();
    }
  };

  const handleToggleStandBookingStatus = (registrationId: string, currentStatus: string, standCode: string) => {
    const allRegistrations = storage.getRegistrations();
    const reg = allRegistrations.find(r => r.registration_id === registrationId);
    if (!reg) return;

    if (currentStatus === 'CONFIRMED' || currentStatus === 'RESERVED') {
      if (window.confirm(`Lepaskan stand ${standCode}? Stand ini akan kembali TERSEDIA untuk umum.`)) {
        reg.status = 'AVAILABLE';
      }
    } else {
      reg.status = 'CONFIRMED';
    }
    onDataUpdated();
  };

  const handleAssistBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = safeMembers.find(m => m.member_id === assistForm.member_id);
    const targetStand = safeStands.find(s => s.stand_id === assistForm.stand_id);
    const targetEvent = safeEvents.find(ev => ev.event_id === assistForm.event_id) || safeEvents[0];

    if (!targetMember || !targetStand || !targetEvent) {
      alert('Pilih member, stand, dan event secara lengkap.');
      return;
    }

    const bookingResult = storage.bookStand(targetEvent.event_id, targetStand.stand_id, targetMember);
    if (!bookingResult.success) {
      alert(bookingResult.message);
      return;
    }

    if (assistForm.instant_confirm && bookingResult.registration) {
      bookingResult.registration.status = 'CONFIRMED';
    }

    alert(`Stand ${targetStand.stand_code} berhasil dipesankan untuk ${targetMember.nama_lengkap}!`);
    setIsAssistBookingOpen(false);
    onDataUpdated();
  };

  // Handlers Anggota
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberForm({
      nama_lengkap: '',
      nama_usaha: '',
      kategori_usaha: 'KULINER',
      nomor_hp: '',
      email: '',
      alamat: ''
    });
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (m: Member) => {
    setEditingMember(m);
    setMemberForm({
      nama_lengkap: m.nama_lengkap || '',
      nama_usaha: m.nama_usaha || '',
      kategori_usaha: m.kategori_usaha || 'KULINER',
      nomor_hp: m.nomor_hp || '',
      email: m.email || '',
      alamat: m.alamat || ''
    });
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      storage.saveMember({
        ...editingMember,
        ...memberForm,
        nik: ''
      });
    } else {
      const newId = `MBR-${String(safeMembers.length + 1).padStart(4, '0')}`;
      storage.saveMember({
        member_id: newId,
        nik: '',
        ...memberForm,
        whatsapp: memberForm.nomor_hp,
        status_keanggotaan: 'ACTIVE',
        created_at: new Date().toISOString()
      });
    }
    setIsMemberModalOpen(false);
    onDataUpdated();
  };

  const handleDeleteMember = (memberId: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus data anggota: ${name}?`)) return;
    const allMembers = storage.getMembers();
    const idx = allMembers.findIndex(m => m.member_id === memberId);
    if (idx >= 0) {
      allMembers.splice(idx, 1);
      onDataUpdated();
    }
  };

  // Handlers Event
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      event_date: new Date().toISOString().split('T')[0],
      start_time: '06:00',
      end_time: '12:00',
      location: 'Tepian Sambaliung, Berau',
      status: 'UPCOMING',
      total_stands: 64
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev: EventItem) => {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title || '',
      description: ev.description || '',
      event_date: ev.event_date || '',
      start_time: ev.start_time || '06:00',
      end_time: ev.end_time || '12:00',
      location: ev.location || '',
      status: ev.status || 'UPCOMING',
      total_stands: ev.total_stands || 64
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const allEvents = storage.getEvents();
    if (editingEvent) {
      const idx = allEvents.findIndex(ev => ev.event_id === editingEvent.event_id);
      if (idx >= 0) {
        allEvents[idx] = { ...allEvents[idx], ...eventForm };
      }
    } else {
      const newEvent: EventItem = {
        event_id: `EVT-${Date.now()}`,
        ...eventForm,
        timezone: 'Asia/Makassar',
        created_at: new Date().toISOString()
      };
      allEvents.push(newEvent);
    }
    setIsEventModalOpen(false);
    onDataUpdated();
  };

  const handleDeleteEvent = (eventId: string, title: string) => {
    if (!window.confirm(`Hapus event "${title}"?`)) return;
    const allEvents = storage.getEvents();
    const idx = allEvents.findIndex(ev => ev.event_id === eventId);
    if (idx >= 0) {
      allEvents.splice(idx, 1);
      onDataUpdated();
    }
  };

  const handleSaveSaving = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = safeMembers.find(m => m.member_id === savingForm.member_id);
    if (!targetMember) return;

    storage.addSaving({
      member_id: targetMember.member_id,
      member_name: targetMember.nama_lengkap,
      saving_type: savingForm.saving_type,
      amount: Number(savingForm.amount) || 0
    });
    setIsSavingModalOpen(false);
    onDataUpdated();
  };

  const handleVerifyPayment = (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
    storage.verifyPayment(
      paymentId, 
      session?.user?.nama_lengkap || session?.user?.username || 'Admin', 
      status, 
      status === 'REJECTED' ? rejectReason : undefined
    );
    setSelectedPayment(null);
    setRejectReason('');
    onDataUpdated();
  };

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16 font-sans">
      {/* Top Banner Admin */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {session?.user?.role || 'SUPER_ADMIN'}
                </span>
                <span className="text-slate-400 text-xs">• WITA (Berau)</span>
              </div>
              <h1 className="text-2xl font-bold mt-1 text-slate-100">
                Pusat Kendali Operasional Banuarasa
              </h1>
              <p className="text-sm text-slate-400">
                Super Admin: <strong className="text-slate-200">{session?.user?.nama_lengkap || session?.user?.username || 'Super Admin'}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isSuperAdmin && (
                <>
                  <button
                    onClick={handleOpenAddArticle}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>📰</span>
                    <span>Tulis Berita</span>
                  </button>
                  <button
                    onClick={() => setIsAssistBookingOpen(true)}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>⚡</span>
                    <span>Pesan Stand Tenant</span>
                  </button>
                </>
              )}

              {onOpenScanner && (
                <button
                  onClick={onOpenScanner}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  📷 Scan Barcode
                </button>
              )}
            </div>
          </div>

          {/* Navigasi Tab */}
          <div className="flex overflow-x-auto gap-2 mt-6 pt-2 border-t border-slate-800 text-sm">
            {[
              { id: 'overview', label: 'Ringkasan Eksekutif' },
              { id: 'savings', label: 'Keuangan Simpanan (Pokok & Wajib)' },
              { id: 'reports', label: 'Rekap Penjualan Stand & Event' },
              { id: 'members', label: `Anggota & KTA (${safeMembers.length})` },
              { id: 'stands', label: `Stand & Booking Tenant` },
              { id: 'payments', label: `Verifikasi Bayar (${safePayments.length})` },
              { id: 'editorials', label: `Kabar Berita (${safeArticles.length})` },
              { id: 'events', label: `Kelola Event (${safeEvents.length})` },
              { id: 'audit', label: 'Audit Trail' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Konten Tab */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* TAB 1: OVERVIEW EKSEKUTIF */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Widget Metrik Keuangan Koperasi & Penjualan */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500">Simpanan Pokok</span>
                <p className="text-xl font-black text-indigo-700 mt-1">
                  Rp {(stats.totalSimpananPokok / 1000).toLocaleString('id-ID')}k
                </p>
                <span className="text-[10px] text-slate-400">Total modal awal anggota</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500">Simpanan Wajib</span>
                <p className="text-xl font-black text-indigo-600 mt-1">
                  Rp {(stats.totalSimpananWajib / 1000).toLocaleString('id-ID')}k
                </p>
                <span className="text-[10px] text-slate-400">Akumulasi iuran bulanan</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500">Total Omzet Event</span>
                <p className="text-xl font-black text-emerald-600 mt-1">
                  Rp {(stats.totalOmzet / 1000).toLocaleString('id-ID')}k
                </p>
                <span className="text-[10px] text-slate-400">Seluruh stand & event</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500">Stand Terisi</span>
                <p className="text-xl font-black text-slate-800 mt-1">{stats.confirmedStands} Stand</p>
                <span className="text-[10px] text-slate-400">Status terkonfirmasi</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500">Verifikasi Bayar</span>
                <p className="text-xl font-black text-amber-600 mt-1">{stats.pendingPayments} Antrean</p>
                <span className="text-[10px] text-slate-400">Perlu disetujui</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500">Total Anggota</span>
                <p className="text-xl font-black text-slate-800 mt-1">{stats.totalMembers} UMKM</p>
                <span className="text-[10px] text-slate-400">Terdaftar di sistem</span>
              </div>
            </div>

            {/* Antrean Cepat Verifikasi */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-base font-bold text-slate-800">Menunggu Verifikasi Pembayaran & Bukti Transfer</h2>
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  {safePayments.filter(p => p?.verification_status === 'PENDING').length} Antrean
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {safePayments.filter(p => p?.verification_status === 'PENDING').length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">Tidak ada bukti transfer yang perlu diverifikasi saat ini.</p>
                ) : (
                  safePayments.filter(p => p?.verification_status === 'PENDING').map(pay => (
                    <div key={pay.payment_id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{pay.member_name}</span>
                          <span className="text-xs text-slate-400">({pay.payment_id})</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-0.5">
                          Tipe: <strong className="text-slate-800">{pay.payment_type}</strong> — Rp {(pay.amount || 0).toLocaleString('id-ID')} via {pay.payment_method}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Tanggal: {pay.payment_date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPayment(pay)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                          Lihat Bukti
                        </button>
                        <button
                          onClick={() => handleVerifyPayment(pay.payment_id, 'VERIFIED')}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                        >
                          Setujui
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KEUANGAN SIMPANAN POKOK & WAJIB (SUPERADMIN VIEW) */}
        {activeTab === 'savings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pemasukan Simpanan Pokok</span>
                <p className="text-2xl font-black text-indigo-700 mt-1">Rp {stats.totalSimpananPokok.toLocaleString('id-ID')}</p>
                <p className="text-[11px] text-slate-500 mt-1">Simpanan awal wajib saat anggota baru bergabung</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pemasukan Simpanan Wajib</span>
                <p className="text-2xl font-black text-indigo-600 mt-1">Rp {stats.totalSimpananWajib.toLocaleString('id-ID')}</p>
                <p className="text-[11px] text-slate-500 mt-1">Iuran berkala bulanan seluruh anggota UMKM</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kas Dana Koperasi</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">Rp {stats.grandTotalSimpanan.toLocaleString('id-ID')}</p>
                <p className="text-[11px] text-slate-500 mt-1">Gabungan Simpanan Pokok, Wajib, dan Sukarela</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Rincian Transaksi Simpanan Anggota</h2>
                  <p className="text-xs text-slate-400">Seluruh pencatatan simpanan pokok dan simpanan wajib</p>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => setIsSavingModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    + Catat Simpanan Manual
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">ID Transaksi</th>
                      <th className="px-4 py-3">Nama Anggota</th>
                      <th className="px-4 py-3">Jenis Simpanan</th>
                      <th className="px-4 py-3">Jumlah Masuk</th>
                      <th className="px-4 py-3">Tanggal Pencatatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeSavings.map(s => (
                      <tr key={s.saving_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{s.saving_id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{s.member_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            s.saving_type === 'SIMPANAN_POKOK'
                              ? 'bg-blue-100 text-blue-800'
                              : s.saving_type === 'SIMPANAN_WAJIB'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {s.saving_type === 'SIMPANAN_POKOK' ? 'SIMPANAN POKOK' : s.saving_type === 'SIMPANAN_WAJIB' ? 'SIMPANAN WAJIB' : 'SUKARELA'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-black text-indigo-700">Rp {(s.amount || 0).toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {s.created_at ? new Date(s.created_at).toLocaleString('id-ID') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REKAP LAPORAN PENJUALAN MINGGUAN (STAND & EVENT) */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Rekapitulasi Penjualan Berdasarkan Stand & Event Mingguan</h2>
                  <p className="text-xs text-slate-500">Pantau omzet kumulatif dan performa penjualan mingguan UMKM</p>
                </div>

                {/* Filter Dropdown Stand & Event */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={filterEventTitle}
                    onChange={e => setFilterEventTitle(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-semibold focus:outline-emerald-500"
                  >
                    <option value="ALL">Semua Event Mingguan</option>
                    {uniqueEventsList.map(ev => (
                      <option key={ev} value={ev}>{ev}</option>
                    ))}
                  </select>

                  <select
                    value={filterStandCode}
                    onChange={e => setFilterStandCode(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-semibold focus:outline-emerald-500"
                  >
                    <option value="ALL">Semua Nomor Stand</option>
                    {uniqueStandsList.map(st => (
                      <option key={st} value={st}>Stand {st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tabel Penjualan Terfilter */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Event Mingguan</th>
                      <th className="px-4 py-3">Kode Stand</th>
                      <th className="px-4 py-3">Tenant / Anggota</th>
                      <th className="px-4 py-3">Tanggal Penjualan</th>
                      <th className="px-4 py-3">Total Omzet</th>
                      <th className="px-4 py-3">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSalesReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-400">Tidak ada data penjualan yang cocok dengan filter.</td>
                      </tr>
                    ) : (
                      filteredSalesReports.map(rep => (
                        <tr key={rep.sales_report_id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900">{rep.event_title}</td>
                          <td className="px-4 py-3 font-black text-emerald-600 text-base">{rep.stand_code}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{rep.member_name}</div>
                            <div className="text-[11px] text-slate-400">ID: {rep.member_id}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">{rep.report_date}</td>
                          <td className="px-4 py-3 font-black text-slate-900 text-base">
                            Rp {(rep.total_turnover || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{rep.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MEMBERS & KTA STUDIO */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
              <input
                type="text"
                placeholder="Cari nama anggota / usaha / ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-emerald-500 w-full sm:w-80"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isSuperAdmin && (
                  <button
                    onClick={handleOpenAddMember}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    + Tambah Anggota
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">ID Anggota</th>
                    <th className="px-4 py-3">Nama Lengkap</th>
                    <th className="px-4 py-3">Nama Usaha UMKM</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Kontak HP/Email</th>
                    <th className="px-4 py-3">Status</th>
                    {isSuperAdmin && <th className="px-4 py-3 text-right">Aksi & Desain KTA</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeMembers
                    .filter(m => 
                      (m?.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (m?.nama_usaha || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (m?.member_id || '').toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(m => (
                      <tr key={m.member_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">
                          {m.member_id}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{m.nama_lengkap}</td>
                        <td className="px-4 py-3">{m.nama_usaha}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {m.kategori_usaha}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div>{m.nomor_hp}</div>
                          <div className="text-slate-400">{m.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            m.status_keanggotaan === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {m.status_keanggotaan}
                          </span>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleOpenKTAStudio(m)}
                              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                              title="Buka Studio Desain KTA & Edit Profil"
                            >
                              🎴 Desain KTA
                            </button>
                            <button
                              onClick={() => handleOpenEditMember(m)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m.member_id, m.nama_lengkap)}
                              className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                            >
                              Hapus
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: STANDS & BOOKING */}
        {activeTab === 'stands' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Master Stand & Harga Sewa</h2>
                  <p className="text-xs text-slate-500">Super Admin dapat memberi nama, mengatur zona, dan menentukan harga tiap stand</p>
                </div>
                <div className="flex items-center gap-2">
                  {isSuperAdmin && (
                    <>
                      <button
                        onClick={() => setIsAssistBookingOpen(true)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs transition"
                      >
                        ⚡ Bookingkan untuk Tenant
                      </button>
                      <button
                        onClick={handleOpenAddStand}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                      >
                        + Tambah Stand Baru
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Nama / Kode Stand</th>
                      <th className="px-4 py-3">Zona</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Harga Sewa Stand</th>
                      <th className="px-4 py-3">Status</th>
                      {isSuperAdmin && <th className="px-4 py-3 text-right">Aksi Superadmin</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeStands.map(s => (
                      <tr key={s.stand_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900 text-base">{s.stand_code}</td>
                        <td className="px-4 py-3 text-xs">{s.zone}</td>
                        <td className="px-4 py-3 text-xs">{s.category}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600 text-sm">
                          Rp {(s.base_price || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">{s.status}</span>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditStand(s)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            >
                              ✏️ Atur Nama & Harga
                            </button>
                            <button
                              onClick={() => handleDeleteStand(s.stand_id, s.stand_code)}
                              className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                            >
                              Hapus
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-base font-bold text-slate-800">Status Booking Stand Tenant</h2>
                <p className="text-xs text-slate-500">Super Admin dapat mengonfirmasi stand langsung atau melepaskannya kembali ke publik</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Stand</th>
                      <th className="px-4 py-3">Nama Tenant / Usaha</th>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Biaya</th>
                      <th className="px-4 py-3">Status Saat Ini</th>
                      {isSuperAdmin && <th className="px-4 py-3 text-right">Kontrol Status</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">Belum ada tenant yang memesan stand.</td>
                      </tr>
                    ) : (
                      safeRegistrations.map(r => (
                        <tr key={r.registration_id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-emerald-600 text-base">{r.stand_code}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{r.member_name}</div>
                            <div className="text-xs text-slate-400">{r.nama_usaha}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">{r.event_title}</td>
                          <td className="px-4 py-3 font-medium">Rp {(r.total_fee || 0).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              r.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'RESERVED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          {isSuperAdmin && (
                            <td className="px-4 py-3 text-right">
                              {r.status === 'CONFIRMED' || r.status === 'RESERVED' ? (
                                <button
                                  onClick={() => handleToggleStandBookingStatus(r.registration_id, r.status, r.stand_code)}
                                  className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
                                >
                                  Lepaskan Stand
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleStandBookingStatus(r.registration_id, r.status, r.stand_code)}
                                  className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                                >
                                  Set Terkonfirmasi
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Seluruh Riwayat Pembayaran</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">ID Pembayaran</th>
                    <th className="px-4 py-3">Nama Anggota</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Nominal</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Verifikator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safePayments.map(p => (
                    <tr key={p.payment_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{p.payment_id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.member_name}</td>
                      <td className="px-4 py-3 text-xs">{p.payment_type}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">Rp {(p.amount || 0).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-xs">{p.payment_method}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.verification_status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.verification_status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {p.verification_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{p.verified_by || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: BERITA & EDITORIAL */}
        {activeTab === 'editorials' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-800">Manajemen Kabar & Editorial Banuarasa</h2>
                <p className="text-xs text-slate-500">Kelola artikel publikasi untuk pengunjung website</p>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={handleOpenAddArticle}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  + Tulis Artikel Baru
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {safeArticles.map(art => (
                <div key={art.article_id} className="p-5 flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{art.tag}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{art.title}</h3>
                    <p className="text-xs text-slate-400">{art.published_at} • {art.author}</p>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEditArticle(art)} className="px-3 py-1 text-xs bg-slate-100 rounded-lg">Edit</button>
                      <button onClick={() => handleDeleteArticle(art.article_id, art.title)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg">Hapus</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: EVENTS */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Daftar Agenda Acara Banuarasa</h2>
              {isSuperAdmin && (
                <button onClick={handleOpenAddEvent} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                  + Tambah Event Baru
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {safeEvents.map(ev => (
                <div key={ev.event_id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900">{ev.title}</h3>
                    <p className="text-xs text-slate-400">{ev.event_date} • {ev.location} • {ev.total_stands} Stand</p>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEditEvent(ev)} className="px-3 py-1 text-xs bg-slate-100 rounded-lg">Edit</button>
                      <button onClick={() => handleDeleteEvent(ev.event_id, ev.title)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg">Hapus</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Audit Trail (Aktivitas Sistem)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Waktu (WITA)</th>
                    <th className="px-4 py-3">Pelaku</th>
                    <th className="px-4 py-3">Aksi</th>
                    <th className="px-4 py-3">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {safeAuditLogs.map(log => (
                    <tr key={log.log_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{log.timestamp_wita}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 font-sans">{log.actor_name}</td>
                      <td className="px-4 py-3 text-emerald-700 font-bold">{log.action}</td>
                      <td className="px-4 py-3 text-slate-600 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL STUDIO KTA */}
      {selectedMemberForKTA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col lg:flex-row max-h-[92vh]">
            {/* Preview KTA */}
            <div className="lg:w-7/12 p-6 sm:p-8 bg-slate-100/80 border-r border-slate-200 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    KTA Studio Preview
                  </span>
                  <button onClick={() => window.print()} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-2xs">
                    🖨️ Cetak Kartu
                  </button>
                </div>

                <div 
                  id="kta-canvas-preview"
                  style={{
                    background: 
                      ktaDesignConfig.themePreset === 'EMERALD'
                        ? 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)'
                        : ktaDesignConfig.themePreset === 'DARK_VIP'
                        ? 'linear-gradient(135deg, #1e1b4b 0%, #09090b 100%)'
                        : ktaDesignConfig.themePreset === 'SLATE_CLEAN'
                        ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                        : 'linear-gradient(135deg, #022c22 0%, #0f172a 100%)'
                  }}
                  className={`relative w-full rounded-2xl p-6 shadow-2xl border transition-all duration-300 overflow-hidden min-h-[260px] flex flex-col justify-between ${
                    ktaDesignConfig.themePreset === 'SLATE_CLEAN' ? 'text-slate-900 border-slate-300' : 'text-white border-white/15'
                  }`}
                >
                  {ktaDesignConfig.bgImageUrl && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-200"
                      style={{ backgroundImage: `url(${ktaDesignConfig.bgImageUrl})`, opacity: ktaDesignConfig.bgOpacity / 100 }}
                    />
                  )}

                  <div className={`absolute inset-0 pointer-events-none ${ktaDesignConfig.overlayColor === 'DARK' ? 'bg-black/35' : 'bg-white/20'}`} />

                  <div className="relative z-10 flex items-center justify-between border-b border-current/15 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center font-black text-slate-950 text-sm shadow-xs">B</div>
                      <div>
                        <span className="text-xs font-black tracking-wider uppercase block leading-tight">BANUARASA</span>
                        <span className="text-[9px] font-semibold opacity-75 tracking-wider block">{ktaDesignConfig.customTitle}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {selectedMemberForKTA.status_keanggotaan}
                      </span>
                      {ktaDesignConfig.showRegId && (
                        <span className="block text-[9px] font-mono opacity-60 mt-0.5">{selectedMemberForKTA.member_id}</span>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 flex items-center gap-5">
                    <div className="w-20 h-24 rounded-xl border-2 border-current/30 overflow-hidden bg-slate-800/40 flex items-center justify-center flex-shrink-0">
                      {selectedMemberForKTA.avatar_url ? (
                        <img src={selectedMemberForKTA.avatar_url} alt="Foto" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black opacity-40">{(selectedMemberForKTA.nama_lengkap || 'M').charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <h4 className="text-base font-black leading-snug">{selectedMemberForKTA.nama_lengkap}</h4>
                      <p className="text-xs font-bold opacity-90">{selectedMemberForKTA.nama_usaha}</p>
                      <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                        {ktaDesignConfig.showCategory && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10 font-semibold">🏷️ {selectedMemberForKTA.kategori_usaha}</span>
                        )}
                        {ktaDesignConfig.showAddress && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10">📍 {selectedMemberForKTA.alamat}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 bg-white p-1.5 rounded-xl shadow-md flex flex-col items-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          JSON.stringify({ id: selectedMemberForKTA.member_id, nama: selectedMemberForKTA.nama_lengkap, usaha: selectedMemberForKTA.nama_usaha, app: 'BANUARASA' })
                        )}`} 
                        alt="QR Code" 
                        className="w-16 h-16 object-contain" 
                      />
                      <span className="text-[7px] font-mono text-slate-800 font-bold mt-0.5">SCAN KTA</span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 pt-2 border-t border-current/15 flex items-center justify-between text-[8px] opacity-70">
                    <span>Kabupaten Berau • Kalimantan Timur</span>
                    <span>Pindai barcode untuk memeriksa keabsahan data</span>
                  </div>
                </div>
              </div>

              {ktaSaveAlert && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
                  {ktaSaveAlert}
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button onClick={() => setSelectedMemberForKTA(null)} className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-200 rounded-xl">
                  Tutup
                </button>
                <button onClick={handleSaveKTAStudio} className="flex-1 py-2.5 text-xs font-black text-white bg-emerald-600 rounded-xl shadow-md">
                  💾 Simpan Perubahan KTA
                </button>
              </div>
            </div>

            {/* Panel Kontrol KTA */}
            <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <h3 className="text-base font-black text-slate-800 mb-4">Pengaturan Studio KTA</h3>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold text-slate-600 mb-5">
                  {[
                    { id: 'background', label: '🎨 Latar' },
                    { id: 'barcode', label: '📱 Barcode' },
                    { id: 'elements', label: '📋 Elemen' },
                    { id: 'profile', label: '👤 Data' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setKtaActiveControlTab(t.id as any)}
                      className={`py-1.5 rounded-lg transition ${
                        ktaActiveControlTab === t.id ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {ktaActiveControlTab === 'background' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Preset Tema Latar Belakang</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['EMERALD', 'BERAU_HERITAGE', 'DARK_VIP', 'SLATE_CLEAN'].map(preset => (
                          <button
                            key={preset}
                            onClick={() => handleKtaPresetSelect(preset as any)}
                            className={`p-2 rounded-xl text-left border font-semibold ${ktaDesignConfig.themePreset === preset ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200'}`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between">
                        <label className="font-bold text-slate-700">Transparansi Latar Belakang</label>
                        <span className="font-mono font-bold text-emerald-600">{ktaDesignConfig.bgOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={ktaDesignConfig.bgOpacity}
                        onChange={e => setKtaDesignConfig({ ...ktaDesignConfig, bgOpacity: Number(e.target.value) })}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Upload Gambar Latar Custom</label>
                      <input type="file" accept="image/*" onChange={handleKtaBgUpload} className="w-full text-xs" />
                    </div>
                  </div>
                )}

                {ktaActiveControlTab === 'profile' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ganti Foto Profil Anggota</label>
                      <input type="file" accept="image/*" onChange={handleKtaMemberPhotoUpload} className="w-full text-xs" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={selectedMemberForKTA.nama_lengkap || ''}
                        onChange={e => setSelectedMemberForKTA({ ...selectedMemberForKTA, nama_lengkap: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Nama Usaha UMKM</label>
                      <input
                        type="text"
                        value={selectedMemberForKTA.nama_usaha || ''}
                        onChange={e => setSelectedMemberForKTA({ ...selectedMemberForKTA, nama_usaha: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI PEMBAYARAN */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Verifikasi Pembayaran</h3>
            <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p>Nama Anggota: <strong className="text-slate-800">{selectedPayment.member_name}</strong></p>
              <p>Tipe: <strong className="text-slate-800">{selectedPayment.payment_type}</strong></p>
              <p>Jumlah: <strong className="text-slate-800">Rp {(selectedPayment.amount || 0).toLocaleString('id-ID')}</strong></p>
            </div>
            {selectedPayment.proof_url && (
              <div className="mt-3 text-center">
                <a href={selectedPayment.proof_url} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 underline font-bold">
                  Buka Gambar Bukti Transfer di Tab Baru
                </a>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setSelectedPayment(null)} className="flex-1 py-2 bg-slate-100 text-xs font-bold rounded-xl">Tutup</button>
              <button onClick={() => handleVerifyPayment(selectedPayment.payment_id, 'REJECTED')} className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">Tolak</button>
              <button onClick={() => handleVerifyPayment(selectedPayment.payment_id, 'VERIFIED')} className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">Setujui</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
