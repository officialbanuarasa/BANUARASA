import React, { useState } from 'react';
import { 
  AuthSession, 
  Member, 
  Registration, 
  Payment, 
  Saving, 
  SalesReport, 
  Product, 
  DocumentRecord 
} from '../types';
import { storage } from '../services/storage';

interface MemberDashboardProps {
  session: AuthSession;
  member: Member | null;
  registrations: Registration[];
  payments: Payment[];
  savings: Saving[];
  salesReports: SalesReport[];
  products: Product[];
  documents: DocumentRecord[];
  onOpenStandMap: () => void;
  onOpenPayment: () => void;
  onOpenCardModal: () => void;
  onOpenChangePassword: () => void;
  onDataUpdated: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  session,
  member,
  registrations,
  payments,
  savings,
  salesReports,
  products,
  documents,
  onOpenStandMap,
  onOpenPayment,
  onOpenCardModal,
  onOpenChangePassword,
  onDataUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'stands' | 'savings' | 'sales' | 'products' | 'documents'>('stands');
  
  const [turnoverAmount, setTurnoverAmount] = useState<string>('');
  const [selectedStandCode, setSelectedStandCode] = useState<string>('');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [reportMessage, setReportMessage] = useState<string>('');

  const totalSimpanan = savings.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalOmzetPribadi = salesReports.reduce((sum, r) => sum + (r.total_turnover || 0), 0);

  const handleSubmitOmzet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnoverAmount || !selectedStandCode) return;

    setIsSubmittingReport(true);
    setReportMessage('');

    try {
      storage.submitSalesReport({
        event_id: 'EVT-2026-001',
        event_title: 'Banuarasa Weekend Market — Edisi Berau',
        member_id: member?.member_id || session.user.member_id || 'MBR-0001',
        member_name: member?.nama_lengkap || session.user.nama_lengkap || 'Anggota UMKM',
        stand_code: selectedStandCode,
        report_date: new Date().toISOString().split('T')[0],
        total_turnover: parseInt(turnoverAmount.replace(/[^0-9]/g, ''), 10) || 0,
        notes: reportNotes
      });

      setTurnoverAmount('');
      setReportNotes('');
      setReportMessage('Laporan omzet berhasil dicatat.');
      onDataUpdated();
    } catch {
      setReportMessage('Gagal mencatat omzet.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16">
      {/* Profile Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl font-black shadow-md">
                {member?.nama_lengkap?.charAt(0) || 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">
                    {member?.nama_lengkap || session.user.nama_lengkap || 'Anggota UMKM'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {member?.status_keanggotaan || 'ACTIVE'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                  {member?.nama_usaha || 'Usaha Kuliner Banuarasa'} • <span className="text-slate-400">{member?.kategori_usaha || 'KULINER'}</span>
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {member?.member_id || session.user.member_id || 'MBR-0001'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={onOpenCardModal}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                💳 Kartu Anggota Digital
              </button>
              <button
                onClick={onOpenStandMap}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                🎪 Reservasi Stand
              </button>
              <button
                onClick={onOpenPayment}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Pembayaran / Simpanan
              </button>
              <button
                onClick={onOpenChangePassword}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition"
              >
                Ganti Kata Sandi
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Stand Dipesan</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{registrations.length} Stand</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Simpanan</span>
              <p className="text-xl font-bold text-indigo-600 mt-1">Rp {totalSimpanan.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Omzet Dicatat</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">Rp {totalOmzetPribadi.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Produk Terdaftar</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{products.length} Item</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-b border-slate-200 overflow-x-auto gap-4 text-sm font-semibold mb-6">
          {[
            { id: 'stands', label: `Stand Saya (${registrations.length})` },
            { id: 'savings', label: `Simpanan (${savings.length})` },
            { id: 'sales', label: `Laporan Omzet (${salesReports.length})` },
            { id: 'products', label: `Katalog Produk (${products.length})` },
            { id: 'documents', label: `Dokumen Legalitas (${documents.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: STAND SAYA */}
        {activeTab === 'stands' && (
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Anda belum memiliki pesanan stand aktif.</p>
                <button
                  onClick={onOpenStandMap}
                  className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
                >
                  Pilih Stand Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registrations.map(reg => (
                  <div key={reg.registration_id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">{reg.event_title}</span>
                        <h3 className="text-xl font-black text-slate-800 mt-0.5">Stand {reg.stand_code}</h3>
                        <p className="text-xs text-slate-500 mt-1">Biaya: Rp {reg.total_fee.toLocaleString('id-ID')}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        reg.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reg.status === 'WAITING_VERIFICATION'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {reg.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                      <span className="text-slate-400">ID: {reg.registration_id}</span>
                      {reg.status === 'RESERVED' && (
                        <button
                          onClick={onOpenPayment}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition"
                        >
                          Bayar Sekarang
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SIMPANAN */}
        {activeTab === 'savings' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800">Catatan Simpanan Koperasi</h2>
              <span className="text-xs font-bold text-indigo-700">Total: Rp {totalSimpanan.toLocaleString('id-ID')}</span>
            </div>
            <div className="divide-y divide-slate-100 text-sm">
              {savings.length === 0 ? (
                <p className="py-12 text-center text-slate-400 text-xs">Belum ada riwayat simpanan.</p>
              ) : (
                savings.map(s => (
                  <div key={s.saving_id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{s.saving_type}</span>
                      <span className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <span className="font-extrabold text-indigo-600">Rp {s.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LAPORAN OMZET */}
        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit space-y-4">
              <h2 className="text-base font-bold text-slate-800">Input Omzet Harian</h2>
              {reportMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
                  {reportMessage}
                </div>
              )}
              <form onSubmit={handleSubmitOmzet} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pilih Stand</label>
                  <select
                    value={selectedStandCode}
                    onChange={(e) => setSelectedStandCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 bg-white"
                  >
                    <option value="">-- Pilih Stand Anda --</option>
                    {registrations.map(r => (
                      <option key={r.registration_id} value={r.stand_code}>
                        Stand {r.stand_code} ({r.event_title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Total Penjualan (Rp)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 1500000"
                    value={turnoverAmount}
                    onChange={(e) => setTurnoverAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Catatan Tambahan (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="Menu paling laris, kendala stok, dll."
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Menyimpan...' : 'Kirim Laporan Omzet'}
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-800">Riwayat Laporan Omzet</h2>
              </div>
              <div className="divide-y divide-slate-100 text-sm">
                {salesReports.length === 0 ? (
                  <p className="py-12 text-center text-slate-400 text-xs">Belum ada laporan omzet yang dikirim.</p>
                ) : (
                  salesReports.map(rep => (
                    <div key={rep.sales_report_id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block">Stand {rep.stand_code}</span>
                        <span className="text-xs text-slate-400">{rep.report_date} • {rep.event_title}</span>
                      </div>
                      <span className="font-extrabold text-slate-800">Rp {rep.total_turnover.toLocaleString('id-ID')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRODUK */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                Belum ada produk yang ditambahkan ke etalase.
              </div>
            ) : (
              products.map(prod => (
                <div key={prod.product_id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">B</div>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-2 line-clamp-1">{prod.name}</h4>
                  <p className="text-xs font-extrabold text-emerald-600 mt-0.5">Rp {prod.price.toLocaleString('id-ID')}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: DOKUMEN LEGALITAS */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800">Dokumen Legalitas & Perizinan UMKM</h2>
            </div>
            <div className="divide-y divide-slate-100 text-sm">
              {documents.length === 0 ? (
                <p className="py-12 text-center text-slate-400 text-xs">Belum ada dokumen yang diunggah (KTP / NIB / Halal).</p>
              ) : (
                documents.map(doc => (
                  <div key={doc.document_id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{doc.document_type}</span>
                      <span className="text-xs text-slate-400">Nomor: {doc.document_number}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {doc.verification_status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
