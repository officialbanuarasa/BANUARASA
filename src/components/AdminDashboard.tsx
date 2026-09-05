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
  StandCategory,
  StandZone,
  EventStatus
} from '../types';
import { storage } from '../services/storage';

interface AdminDashboardProps {
  session: AuthSession;
  members: Member[];
  events: EventItem[];
  registrations: Registration[];
  payments: Payment[];
  savings: Saving[];
  salesReports: SalesReport[];
  documents: DocumentRecord[];
  auditLogs: AuditLog[];
  onDataUpdated: () => void;
  onOpenScanner?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  members,
  events,
  registrations,
  payments,
  savings,
  salesReports,
  documents,
  auditLogs,
  onDataUpdated,
  onOpenScanner
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'events' | 'stands' | 'payments' | 'savings' | 'reports' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal Verifikasi Pembayaran
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Modal CRUD: Member
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState({
    nik: '',
    nama_lengkap: '',
    nama_usaha: '',
    kategori_usaha: 'KULINER' as StandCategory,
    nomor_hp: '',
    email: '',
    alamat: ''
  });

  // Modal CRUD: Event
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

  // Modal CRUD: Stand Baru / Edit Stand
  const [isStandModalOpen, setIsStandModalOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<MasterStand | null>(null);
  const [standForm, setStandForm] = useState({
    stand_code: '',
    category: 'KULINER' as StandCategory,
    zone: 'ZONA_A' as StandZone,
    base_price: 150000
  });

  // Modal Khusus: Bookingkan Stand untuk Tenant yang Terkendala
  const [isAssistBookingOpen, setIsAssistBookingOpen] = useState(false);
  const [assistForm, setAssistForm] = useState({
    member_id: '',
    stand_id: '',
    event_id: events[0]?.event_id || 'EVT-2026-001',
    instant_confirm: true
  });

  // Modal CRUD: Tambah Simpanan Manual
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [savingForm, setSavingForm] = useState({
    member_id: '',
    saving_type: 'SIMPANAN_WAJIB' as 'SIMPANAN_POKOK' | 'SIMPANAN_WAJIB' | 'SIMPANAN_SUKARELA',
    amount: 50000
  });

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

  // Ringkasan Statistik
  const stats = useMemo(() => {
    const totalOmzet = salesReports.reduce((sum, r) => sum + (r.total_turnover || 0), 0);
    const totalSimpanan = savings.reduce((sum, s) => sum + (s.amount || 0), 0);
    const pendingPayments = payments.filter(p => p.verification_status === 'PENDING').length;
    const confirmedStands = registrations.filter(r => r.status === 'CONFIRMED').length;

    return {
      totalMembers: members.length,
      totalEvents: events.length,
      confirmedStands,
      pendingPayments,
      totalSimpanan,
      totalOmzet
    };
  }, [members, events, registrations, payments, savings, salesReports]);

  // ----------------------------------------------------
  // HANDLER STAND: TAMBAH, EDIT HARGA/NAMA, & OVERRIDE STATUS
  // ----------------------------------------------------
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
        storage.logActivity('UPDATE_STAND', 'STAND', `Super Admin mengubah nama/harga stand ${standForm.stand_code.toUpperCase()} (Rp ${standForm.base_price})`, editingStand.stand_id);
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
      storage.logActivity('CREATE_STAND', 'STAND', `Super Admin menambah master stand ${newStand.stand_code} seharga Rp ${newStand.base_price}`);
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
      storage.logActivity('DELETE_STAND', 'STAND', `Menghapus stand ${code}`, standId);
      onDataUpdated();
    }
  };

  // Lepaskan Booking (Jadikan Available) atau Kunci Stand Langsung
  const handleToggleStandBookingStatus = (registrationId: string, currentStatus: string, standCode: string) => {
    const allRegistrations = storage.getRegistrations();
    const reg = allRegistrations.find(r => r.registration_id === registrationId);
    if (!reg) return;

    if (currentStatus === 'CONFIRMED' || currentStatus === 'RESERVED') {
      if (window.confirm(`Lepaskan stand ${standCode}? Stand ini akan kembali TERSEDIA untuk umum.`)) {
        reg.status = 'AVAILABLE';
        storage.logActivity('RELEASE_STAND', 'STAND', `Superadmin melepaskan booking stand ${standCode}`, registrationId);
      }
    } else {
      reg.status = 'CONFIRMED';
      storage.logActivity('FORCE_CONFIRM_STAND', 'STAND', `Superadmin mengonfirmasi langsung stand ${standCode}`, registrationId);
    }
    onDataUpdated();
  };

  // ----------------------------------------------------
  // HANDLER: MEMESANKAN STAND UNTUK TENANT YANG TERKENDALA
  // ----------------------------------------------------
  const handleAssistBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find(m => m.member_id === assistForm.member_id);
    const targetStand = storage.getStands().find(s => s.stand_id === assistForm.stand_id);
    const targetEvent = events.find(ev => ev.event_id === assistForm.event_id) || events[0];

    if (!targetMember || !targetStand || !targetEvent) {
      alert('Pilih member, stand, dan event secara lengkap.');
      return;
    }

    const bookingResult = storage.bookStand(targetEvent.event_id, targetStand.stand_id, targetMember);
    if (!bookingResult.success) {
      alert(bookingResult.message);
      return;
    }

    // Jika Super Admin memilih langsung konfirmasi tanpa perlu tenant transfer
    if (assistForm.instant_confirm && bookingResult.registration) {
      bookingResult.registration.status = 'CONFIRMED';
      storage.logActivity(
        'ASSISTED_BOOKING_CONFIRMED', 
        'STAND', 
        `Superadmin memesankan dan mengonfirmasi Stand ${targetStand.stand_code} untuk tenant ${targetMember.nama_lengkap} (${targetMember.nama_usaha})`, 
        bookingResult.registration.registration_id
      );
    }

    alert(`Stand ${targetStand.stand_code} berhasil dipesankan untuk ${targetMember.nama_lengkap}!`);
    setIsAssistBookingOpen(false);
    onDataUpdated();
  };

  // ----------------------------------------------------
  // HANDLER CRUD MEMBER
  // ----------------------------------------------------
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberForm({
      nik: '',
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
      nik: m.nik,
      nama_lengkap: m.nama_lengkap,
      nama_usaha: m.nama_usaha,
      kategori_usaha: m.kategori_usaha,
      nomor_hp: m.nomor_hp,
      email: m.email,
      alamat: m.alamat
    });
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      storage.saveMember({
        ...editingMember,
        ...memberForm
      });
    } else {
      const newId = `MBR-${String(members.length + 1).padStart(4, '0')}`;
      storage.saveMember({
        member_id: newId,
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
      storage.logActivity('DELETE_MEMBER', 'MEMBER', `Menghapus anggota ${name}`, memberId);
      onDataUpdated();
    }
  };

  // ----------------------------------------------------
  // HANDLER CRUD EVENT
  // ----------------------------------------------------
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
      title: ev.title,
      description: ev.description,
      event_date: ev.event_date,
      start_time: ev.start_time,
      end_time: ev.end_time,
      location: ev.location,
      status: ev.status,
      total_stands: ev.total_stands
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
        storage.logActivity('UPDATE_EVENT', 'EVENT', `Mengedit event ${eventForm.title}`, editingEvent.event_id);
      }
    } else {
      const newEvent: EventItem = {
        event_id: `EVT-${Date.now()}`,
        ...eventForm,
        timezone: 'Asia/Makassar',
        created_at: new Date().toISOString()
      };
      allEvents.push(newEvent);
      storage.logActivity('CREATE_EVENT', 'EVENT', `Membuat event baru ${newEvent.title}`, newEvent.event_id);
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
      storage.logActivity('DELETE_EVENT', 'EVENT', `Menghapus event ${title}`, eventId);
      onDataUpdated();
    }
  };

  const handleSaveSaving = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find(m => m.member_id === savingForm.member_id);
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
      session.user.nama_lengkap || session.user.username, 
      status, 
      status === 'REJECTED' ? rejectReason : undefined
    );
    setSelectedPayment(null);
    setRejectReason('');
    onDataUpdated();
  };

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16">
      {/* Top Banner Admin */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {session.user.role}
                </span>
                <span className="text-slate-400 text-xs">• WITA (Berau)</span>
              </div>
              <h1 className="text-2xl font-bold mt-1 text-slate-100">
                Pusat Kendali Operasional Banuarasa
              </h1>
              <p className="text-sm text-slate-400">
                Pengelola: <strong className="text-slate-200">{session.user.nama_lengkap || session.user.username}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isSuperAdmin && (
                <button
                  onClick={() => setIsAssistBookingOpen(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>Pesan Stand untuk Tenant</span>
                </button>
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
              { id: 'overview', label: 'Ringkasan' },
              { id: 'members', label: `Anggota (${members.length})` },
              { id: 'events', label: `Kelola Event (${events.length})` },
              { id: 'stands', label: `Stand & Booking Tenant` },
              { id: 'payments', label: `Pembayaran (${payments.length})` },
              { id: 'savings', label: 'Simpanan Koperasi' },
              { id: 'reports', label: 'Laporan Omzet' },
              { id: 'audit', label: 'Audit Trail' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Total Anggota</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalMembers}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Stand Terisi</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.confirmedStands}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Verifikasi Tertunda</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingPayments}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Total Event</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalEvents}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Dana Simpanan</span>
                <p className="text-lg font-bold text-indigo-600 mt-1">
                  Rp {(stats.totalSimpanan / 1000).toLocaleString('id-ID')}k
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500">Total Omzet UMKM</span>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  Rp {(stats.totalOmzet / 1000).toLocaleString('id-ID')}k
                </p>
              </div>
            </div>

            {/* Antrean Verifikasi Cepat */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-base font-bold text-slate-800">Menunggu Verifikasi Pembayaran</h2>
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  {payments.filter(p => p.verification_status === 'PENDING').length} Antrean
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {payments.filter(p => p.verification_status === 'PENDING').length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">Tidak ada bukti transfer yang perlu diverifikasi saat ini.</p>
                ) : (
                  payments.filter(p => p.verification_status === 'PENDING').map(pay => (
                    <div key={pay.payment_id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{pay.member_name}</span>
                          <span className="text-xs text-slate-400">({pay.payment_id})</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-0.5">
                          Tipe: <strong className="text-slate-800">{pay.payment_type}</strong> — Rp {pay.amount.toLocaleString('id-ID')} via {pay.payment_method}
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

        {/* TAB 2: MEMBERS */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
              <input
                type="text"
                placeholder="Cari nama anggota / usaha / NIK..."
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
                    <th className="px-4 py-3">ID / NIK</th>
                    <th className="px-4 py-3">Nama Anggota</th>
                    <th className="px-4 py-3">Nama Usaha</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Kontak</th>
                    <th className="px-4 py-3">Status</th>
                    {isSuperAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members
                    .filter(m => 
                      m.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      m.nama_usaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      m.nik.includes(searchQuery)
                    )
                    .map(m => (
                      <tr key={m.member_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">
                          <div className="font-bold text-slate-800">{m.member_id}</div>
                          <div className="text-slate-400">{m.nik}</div>
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

        {/* TAB 3: EVENTS */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Daftar Agenda Acara Banuarasa</h2>
              {isSuperAdmin && (
                <button
                  onClick={handleOpenAddEvent}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  + Tambah Event Baru
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Nama Event</th>
                    <th className="px-4 py-3">Tanggal & Waktu</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Total Stand</th>
                    <th className="px-4 py-3">Status</th>
                    {isSuperAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map(ev => (
                    <tr key={ev.event_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{ev.title}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{ev.description}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-semibold text-slate-700">{ev.event_date}</div>
                        <div className="text-slate-400">{ev.start_time} - {ev.end_time} WITA</div>
                      </td>
                      <td className="px-4 py-3 text-xs">{ev.location}</td>
                      <td className="px-4 py-3 font-semibold">{ev.total_stands} Stand</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {ev.status}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditEvent(ev)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.event_id, ev.title)}
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

        {/* TAB 4: STANDS & BOOKING MANAGEMENT (FITUR SUPERADMIN LENGKAP) */}
        {activeTab === 'stands' && (
          <div className="space-y-6">
            
            {/* 1. MASTER STAND: EDIT NAMA & TENTUKAN HARGA STAND */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Master Pengaturan Stand & Harga Sewa</h2>
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
                    {storage.getStands().map(s => (
                      <tr key={s.stand_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900 text-base">{s.stand_code}</td>
                        <td className="px-4 py-3 text-xs">{s.zone}</td>
                        <td className="px-4 py-3 text-xs">{s.category}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600 text-sm">
                          Rp {s.base_price.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">{s.status}</span>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditStand(s)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                              title="Ubah nama atau tentukan harga stand ini"
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

            {/* 2. OVERRIDE STATUS: TENTUKAN SUDAH DIBOOKING / DILEPASKAN */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Status Booking Stand Tenant</h2>
                  <p className="text-xs text-slate-500">Super Admin dapat mengonfirmasi stand langsung atau melepaskannya kembali ke publik</p>
                </div>
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
                      {isSuperAdmin && <th className="px-4 py-3 text-right">Kontrol Status (Super Admin)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">Belum ada tenant yang memesan stand.</td>
                      </tr>
                    ) : (
                      registrations.map(r => (
                        <tr key={r.registration_id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-emerald-600 text-base">{r.stand_code}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{r.member_name}</div>
                            <div className="text-xs text-slate-400">{r.nama_usaha}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">{r.event_title}</td>
                          <td className="px-4 py-3 font-medium">Rp {r.total_fee.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              r.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'RESERVED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {r.status === 'CONFIRMED' ? 'DIBOOKING (PAID)' : r.status === 'RESERVED' ? 'LOCK SEMENTARA' : r.status}
                            </span>
                          </td>
                          {isSuperAdmin && (
                            <td className="px-4 py-3 text-right">
                              {r.status === 'CONFIRMED' || r.status === 'RESERVED' ? (
                                <button
                                  onClick={() => handleToggleStandBookingStatus(r.registration_id, r.status, r.stand_code)}
                                  className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
                                  title="Batalkan dan bebaskan stand ini"
                                >
                                  Lepaskan Stand (Bebaskan)
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleStandBookingStatus(r.registration_id, r.status, r.stand_code)}
                                  className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                                >
                                  Set Terkonfirmasi (Booking)
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

        {/* TAB 5: PAYMENTS */}
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
                  {payments.map(p => (
                    <tr key={p.payment_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{p.payment_id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.member_name}</td>
                      <td className="px-4 py-3 text-xs">{p.payment_type}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">Rp {p.amount.toLocaleString('id-ID')}</td>
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

        {/* TAB 6: SAVINGS */}
        {activeTab === 'savings' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-800">Catatan Simpanan Koperasi</h2>
                <p className="text-xs text-indigo-600 font-bold">Total Dana: Rp {stats.totalSimpanan.toLocaleString('id-ID')}</p>
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
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nama Anggota</th>
                    <th className="px-4 py-3">Jenis Simpanan</th>
                    <th className="px-4 py-3">Jumlah</th>
                    <th className="px-4 py-3">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {savings.map(s => (
                    <tr key={s.saving_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{s.saving_id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{s.member_name}</td>
                      <td className="px-4 py-3 text-xs">{s.saving_type}</td>
                      <td className="px-4 py-3 font-bold text-indigo-600">Rp {s.amount.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(s.created_at).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Laporan Omzet Penjualan Stand UMKM</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Kode Stand</th>
                    <th className="px-4 py-3">Nama Anggota</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Tanggal Laporan</th>
                    <th className="px-4 py-3">Total Omzet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesReports.map(rep => (
                    <tr key={rep.sales_report_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-emerald-600">{rep.stand_code}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{rep.member_name}</td>
                      <td className="px-4 py-3 text-xs">{rep.event_title}</td>
                      <td className="px-4 py-3 text-xs">{rep.report_date}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">Rp {rep.total_turnover.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Audit Trail (Immutable Activity Log)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Waktu (WITA)</th>
                    <th className="px-4 py-3">Pelaku</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Aksi</th>
                    <th className="px-4 py-3">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {auditLogs.map(log => (
                    <tr key={log.log_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{log.timestamp_wita}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 font-sans">{log.actor_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{log.actor_role}</span>
                      </td>
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

      {/* -------------------------------------------------- */}
      {/* MODAL: PESAN STAND UNTUK TENANT YANG TERKENDALA     */}
      {/* -------------------------------------------------- */}
      {isAssistBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-600">
              <span className="text-xl">⚡</span>
              <h3 className="text-lg font-bold text-slate-900">Bantu Booking Stand Tenant</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan fitur ini untuk membantu peserta/tenant yang kesulitan memesan mandiri di website.
            </p>

            <form onSubmit={handleAssistBooking} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Tenant / Anggota UMKM</label>
                <select
                  required
                  value={assistForm.member_id}
                  onChange={e => setAssistForm({ ...assistForm, member_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500"
                >
                  <option value="">-- Pilih Tenant --</option>
                  {members.map(m => (
                    <option key={m.member_id} value={m.member_id}>
                      {m.nama_lengkap} — {m.nama_usaha} ({m.member_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Stand yang Ingin Diberikan</label>
                <select
                  required
                  value={assistForm.stand_id}
                  onChange={e => setAssistForm({ ...assistForm, stand_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500"
                >
                  <option value="">-- Pilih Stand --</option>
                  {storage.getStands().map(s => (
                    <option key={s.stand_id} value={s.stand_id}>
                      Stand {s.stand_code} ({s.zone} - Rp {s.base_price.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Tujuan</label>
                <select
                  value={assistForm.event_id}
                  onChange={e => setAssistForm({ ...assistForm, event_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500"
                >
                  {events.map(ev => (
                    <option key={ev.event_id} value={ev.event_id}>
                      {ev.title} ({ev.event_date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    checked={assistForm.instant_confirm}
                    onChange={e => setAssistForm({ ...assistForm, instant_confirm: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-800 font-semibold text-[11px]">
                    Langsung Konfirmasi Penuh (Tandai Lunas/Disetujui)
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAssistBookingOpen(false)}
                  className="flex-1 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl font-black shadow-xs transition"
                >
                  Pesan Stand Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* MODAL: TAMBAH / ATUR NAMA & HARGA STAND            */}
      {/* -------------------------------------------------- */}
      {isStandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">
              {editingStand ? 'Atur Nama & Harga Stand' : 'Tambah Master Stand Baru'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan penamaan kode stand dan nominal harga sewa resminya.
            </p>

            <form onSubmit={handleSaveStand} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama / Kode Stand</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: A-01, B-12, KULINER-05"
                  value={standForm.stand_code}
                  onChange={e => setStandForm({ ...standForm, stand_code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold uppercase focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Zona Stand</label>
                <select
                  value={standForm.zone}
                  onChange={e => setStandForm({ ...standForm, zone: e.target.value as StandZone })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500"
                >
                  <option value="ZONA_A">ZONA_A (Utama)</option>
                  <option value="ZONA_B">ZONA_B (Kuliner Pesisir)</option>
                  <option value="ZONA_C">ZONA_C (Kriya & Fashion)</option>
                  <option value="TENGAH">TENGAH (Atrium / Panggung)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Kategori Stand</label>
                <select
                  value={standForm.category}
                  onChange={e => setStandForm({ ...standForm, category: e.target.value as StandCategory })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500"
                >
                  <option value="KULINER">KULINER</option>
                  <option value="KERAJINAN">KERAJINAN</option>
                  <option value="FASHION">FASHION</option>
                  <option value="JASA">JASA</option>
                  <option value="UMUM">UMUM</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tentukan Harga Sewa Stand (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="150000"
                  value={standForm.base_price}
                  onChange={e => setStandForm({ ...standForm, base_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-600 text-sm focus:outline-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStandModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-xs"
                >
                  Simpan Stand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* MODAL: TAMBAH / EDIT MEMBER                        */}
      {/* -------------------------------------------------- */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">
              {editingMember ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
            </h3>
            <form onSubmit={handleSaveMember} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="text"
                  required
                  placeholder="16 digit NIK"
                  value={memberForm.nik}
                  onChange={e => setMemberForm({ ...memberForm, nik: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai KTP"
                  value={memberForm.nama_lengkap}
                  onChange={e => setMemberForm({ ...memberForm, nama_lengkap: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Usaha UMKM</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dapur Selera Berau"
                  value={memberForm.nama_usaha}
                  onChange={e => setMemberForm({ ...memberForm, nama_usaha: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Kategori Usaha</label>
                <select
                  value={memberForm.kategori_usaha}
                  onChange={e => setMemberForm({ ...memberForm, kategori_usaha: e.target.value as StandCategory })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="KULINER">KULINER</option>
                  <option value="KERAJINAN">KERAJINAN</option>
                  <option value="FASHION">FASHION</option>
                  <option value="JASA">JASA</option>
                  <option value="UMUM">UMUM</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Nomor HP / WA</label>
                  <input
                    type="text"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={memberForm.nomor_hp}
                    onChange={e => setMemberForm({ ...memberForm, nomor_hp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={memberForm.email}
                    onChange={e => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Alamat di Berau</label>
                <input
                  type="text"
                  required
                  placeholder="Kecamatan / Kelurahan"
                  value={memberForm.alamat}
                  onChange={e => setMemberForm({ ...memberForm, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-xs"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* MODAL: TAMBAH / EDIT EVENT                         */}
      {/* -------------------------------------------------- */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">
              {editingEvent ? 'Edit Acara' : 'Tambah Acara Baru'}
            </h3>
            <form onSubmit={handleSaveEvent} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Judul Event</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Banuarasa Edisi Lebaran"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  required
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                ></textarea>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tanggal Event (YYYY-MM-DD)</label>
                <input
                  type="date"
                  required
                  value={eventForm.event_date}
                  onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mulai (WITA)</label>
                  <input
                    type="time"
                    required
                    value={eventForm.start_time}
                    onChange={e => setEventForm({ ...eventForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Selesai (WITA)</label>
                  <input
                    type="time"
                    required
                    value={eventForm.end_time}
                    onChange={e => setEventForm({ ...eventForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Lokasi</label>
                <input
                  type="text"
                  required
                  value={eventForm.location}
                  onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Status Event</label>
                  <select
                    value={eventForm.status}
                    onChange={e => setEventForm({ ...eventForm, status: e.target.value as EventStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kapasitas Stand</label>
                  <input
                    type="number"
                    required
                    value={eventForm.total_stands}
                    onChange={e => setEventForm({ ...eventForm, total_stands: Number(e.target.value) || 64 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-xs"
                >
                  Simpan Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* MODAL: TAMBAH SIMPANAN MANUAL                      */}
      {/* -------------------------------------------------- */}
      {isSavingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">Catat Simpanan Anggota</h3>
            <form onSubmit={handleSaveSaving} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Pilih Anggota</label>
                <select
                  required
                  value={savingForm.member_id}
                  onChange={e => setSavingForm({ ...savingForm, member_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {members.map(m => (
                    <option key={m.member_id} value={m.member_id}>
                      {m.nama_lengkap} ({m.member_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Jenis Simpanan</label>
                <select
                  value={savingForm.saving_type}
                  onChange={e => setSavingForm({ ...savingForm, saving_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="SIMPANAN_POKOK">Simpanan Pokok (Awal Masuk)</option>
                  <option value="SIMPANAN_WAJIB">Simpanan Wajib (Bulanan)</option>
                  <option value="SIMPANAN_SUKARELA">Simpanan Sukarela</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  value={savingForm.amount}
                  onChange={e => setSavingForm({ ...savingForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSavingModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-xs"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* MODAL: VERIFIKASI PEMBAYARAN                       */}
      {/* -------------------------------------------------- */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Verifikasi Pembayaran</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p>Anggota: <strong className="text-slate-800">{selectedPayment.member_name}</strong></p>
              <p>Jumlah: <strong className="text-slate-800">Rp {selectedPayment.amount.toLocaleString('id-ID')}</strong></p>
              <p>Tipe: <strong className="text-slate-800">{selectedPayment.payment_type}</strong></p>
              <p>Metode: <strong className="text-slate-800">{selectedPayment.payment_method}</strong></p>
            </div>

            {selectedPayment.proof_url && (
              <div className="mt-4">
                <a 
                  href={selectedPayment.proof_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-emerald-600 underline hover:text-emerald-700 block text-center"
                >
                  Buka Gambar Bukti Transfer di Tab Baru
                </a>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Alasan Penolakan (Hanya jika ditolak):
              </label>
              <input
                type="text"
                placeholder="Contoh: Bukti transfer buram / nominal kurang"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedPayment(null)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleVerifyPayment(selectedPayment.payment_id, 'REJECTED')}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Tolak
              </button>
              <button
                onClick={() => handleVerifyPayment(selectedPayment.payment_id, 'VERIFIED')}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
