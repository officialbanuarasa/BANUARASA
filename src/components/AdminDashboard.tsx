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
  AuditLog 
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
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'stands' | 'payments' | 'savings' | 'reports' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Ringkasan Statistik Utama
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

  // Handler Verifikasi Pembayaran
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

            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-sm transition"
              >
                <span>📷 Scan Barcode / Tiket</span>
              </button>
            )}
          </div>

          {/* Navigasi Tab */}
          <div className="flex overflow-x-auto gap-2 mt-6 pt-2 border-t border-slate-800 text-sm">
            {[
              { id: 'overview', label: 'Ringkasan' },
              { id: 'members', label: `Anggota (${members.length})` },
              { id: 'stands', label: `Stand & Registrasi (${registrations.length})` },
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
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-3 bg-slate-50/50">
              <input
                type="text"
                placeholder="Cari nama anggota / usaha / NIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-emerald-500 w-full sm:w-80"
              />
              <span className="text-xs text-slate-500 self-center">Total: {members.length} Anggota</span>
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
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STANDS & REGISTRATIONS */}
        {activeTab === 'stands' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Daftar Pendaftaran & Reservasi Stand</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Kode Stand</th>
                    <th className="px-4 py-3">Peserta / Usaha</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Biaya</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Waktu Daftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">Belum ada data pendaftaran stand.</td>
                    </tr>
                  ) : (
                    registrations.map(r => (
                      <tr key={r.registration_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-emerald-600">{r.stand_code}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{r.member_name}</div>
                          <div className="text-xs text-slate-400">{r.nama_usaha}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">{r.event_title}</td>
                        <td className="px-4 py-3 font-medium">Rp {r.total_fee.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            r.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'RESERVED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {new Date(r.created_at).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENTS */}
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
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">Belum ada catatan pembayaran.</td>
                    </tr>
                  ) : (
                    payments.map(p => (
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
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {p.verified_by || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SAVINGS */}
        {activeTab === 'savings' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Mutasi Simpanan Koperasi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">ID Simpanan</th>
                    <th className="px-4 py-3">Anggota</th>
                    <th className="px-4 py-3">Jenis Simpanan</th>
                    <th className="px-4 py-3">Jumlah</th>
                    <th className="px-4 py-3">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {savings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">Belum ada transaksi simpanan tercatat.</td>
                    </tr>
                  ) : (
                    savings.map(s => (
                      <tr key={s.saving_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{s.saving_id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{s.member_name}</td>
                        <td className="px-4 py-3 text-xs">{s.saving_type}</td>
                        <td className="px-4 py-3 font-bold text-indigo-600">Rp {s.amount.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{new Date(s.created_at).toLocaleString('id-ID')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS */}
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
                  {salesReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">Belum ada laporan omzet masuk.</td>
                    </tr>
                  ) : (
                    salesReports.map(rep => (
                      <tr key={rep.sales_report_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-emerald-600">{rep.stand_code}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{rep.member_name}</td>
                        <td className="px-4 py-3 text-xs">{rep.event_title}</td>
                        <td className="px-4 py-3 text-xs">{rep.report_date}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">Rp {rep.total_turnover.toLocaleString('id-ID')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT TRAIL */}
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
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-sans">Belum ada aktivitas tercatat.</td>
                    </tr>
                  ) : (
                    auditLogs.map(log => (
                      <tr key={log.log_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{log.timestamp_wita}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 font-sans">{log.actor_name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.actor_role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-emerald-700 font-bold">{log.action}</td>
                        <td className="px-4 py-3 text-slate-600 font-sans">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Verifikasi Pembayaran */}
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
