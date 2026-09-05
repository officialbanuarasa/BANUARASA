import React, { useState, useRef } from 'react';
import { 
  AuthSession, 
  Member, 
  Registration, 
  Payment, 
  Saving, 
  SalesReport, 
  Product, 
  DocumentRecord,
  StandCategory,
  PaymentType,
  PaymentMethod
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
  registrations = [],
  payments = [],
  savings = [],
  salesReports = [],
  products = [],
  documents = [],
  onOpenStandMap,
  onOpenCardModal,
  onOpenChangePassword,
  onDataUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'payments' | 'sales' | 'stands' | 'savings'>('products');
  const fileAvatarRef = useRef<HTMLInputElement>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [uiMessage, setUiMessage] = useState<string>('');

  // ----------------------------------------------------
  // STATE: MANAJEMEN PRODUK ANGGOTA
  // ----------------------------------------------------
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'KULINER' as StandCategory,
    price: '',
    description: '',
    image_url: ''
  });

  // ----------------------------------------------------
  // STATE: FORM PEMBAYARAN & BUKTI TRANSFER (STAND & SIMPANAN)
  // ----------------------------------------------------
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    payment_type: 'STAND_REGISTRATION' as PaymentType,
    registration_id: '',
    amount: '',
    payment_method: 'QRIS' as PaymentMethod,
    proof_url: ''
  });

  // ----------------------------------------------------
  // STATE: LAPORAN PENJUALAN EVENT MINGGUAN
  // ----------------------------------------------------
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [salesForm, setSalesForm] = useState({
    stand_code: '',
    event_title: 'Banuarasa Weekend Market — Edisi Mingguan',
    total_turnover: '',
    notes: '',
    report_date: new Date().toISOString().split('T')[0]
  });

  // Akumulasi Simpanan Pribadi
  const totalPokok = savings.filter(s => s.saving_type === 'SIMPANAN_POKOK').reduce((a, b) => a + (b.amount || 0), 0);
  const totalWajib = savings.filter(s => s.saving_type === 'SIMPANAN_WAJIB').reduce((a, b) => a + (b.amount || 0), 0);
  const totalSimpanan = totalPokok + totalWajib;
  const totalOmzetPribadi = salesReports.reduce((sum, r) => sum + (Number(r.total_turnover) || 0), 0);

  // ----------------------------------------------------
  // HANDLERS FOTO PROFIL ANGGOTA (UPLOAD / URL)
  // ----------------------------------------------------
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && member) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        saveAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrlInput.trim() || !member) return;
    saveAvatar(avatarUrlInput.trim());
    setAvatarUrlInput('');
  };

  const saveAvatar = (newUrl: string) => {
    if (!member) return;
    const updatedMember: Member = {
      ...member,
      avatar_url: newUrl,
      updated_at: new Date().toISOString()
    };
    storage.saveMember(updatedMember);
    setIsEditingAvatar(false);
    setUiMessage('Foto profil berhasil diperbarui!');
    setTimeout(() => setUiMessage(''), 2500);
    onDataUpdated();
  };

  // ----------------------------------------------------
  // HANDLERS TAMBAH PRODUK
  // ----------------------------------------------------
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProductForm(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    const newProd: Product = {
      product_id: `PRD-${Date.now()}`,
      member_id: member.member_id,
      member_name: member.nama_lengkap,
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      price: Number(productForm.price) || 0,
      image_url: productForm.image_url,
      is_available: true,
      created_at: new Date().toISOString()
    };

    storage.saveProduct(newProd);
    storage.logActivity('ADD_PRODUCT', 'MEMBER', `Menambahkan produk baru "${newProd.name}" seharga Rp ${newProd.price}`, newProd.product_id);

    setIsProductModalOpen(false);
    setProductForm({ name: '', category: 'KULINER', price: '', description: '', image_url: '' });
    setUiMessage('Produk berhasil ditambahkan ke etalase!');
    setTimeout(() => setUiMessage(''), 2500);
    onDataUpdated();
  };

  // ----------------------------------------------------
  // HANDLERS PEMBAYARAN & BUKTI TRANSFER
  // ----------------------------------------------------
  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPaymentForm(prev => ({ ...prev, proof_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    const nominal = Number(paymentForm.amount);
    if (!nominal || nominal <= 0) {
      alert('Masukkan nominal pembayaran yang valid.');
      return;
    }

    storage.submitPayment({
      member_id: member.member_id,
      member_name: member.nama_lengkap,
      payment_type: paymentForm.payment_type,
      registration_id: paymentForm.payment_type === 'STAND_REGISTRATION' ? paymentForm.registration_id : undefined,
      amount: nominal,
      payment_method: paymentForm.payment_method,
      payment_date: new Date().toISOString().split('T')[0],
      proof_url: paymentForm.proof_url
    });

    setIsPaymentModalOpen(false);
    setPaymentForm({ payment_type: 'STAND_REGISTRATION', registration_id: '', amount: '', payment_method: 'QRIS', proof_url: '' });
    setUiMessage('Bukti pembayaran berhasil diunggah dan menunggu verifikasi Admin!');
    setTimeout(() => setUiMessage(''), 3000);
    onDataUpdated();
  };

  // ----------------------------------------------------
  // HANDLERS LAPORAN PENJUALAN EVENT
  // ----------------------------------------------------
  const handleSubmitSales = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    storage.submitSalesReport({
      event_id: 'EVT-WEEKLY',
      event_title: salesForm.event_title,
      member_id: member.member_id,
      member_name: member.nama_lengkap,
      stand_code: salesForm.stand_code.toUpperCase(),
      report_date: salesForm.report_date,
      total_turnover: Number(salesForm.total_turnover) || 0,
      notes: salesForm.notes
    });

    setIsSalesModalOpen(false);
    setSalesForm({ stand_code: '', event_title: 'Banuarasa Weekend Market — Edisi Mingguan', total_turnover: '', notes: '', report_date: new Date().toISOString().split('T')[0] });
    setUiMessage('Laporan penjualan event berhasil dicatat!');
    setTimeout(() => setUiMessage(''), 2500);
    onDataUpdated();
  };

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16 font-sans">
      {/* Profil Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            {/* Foto & Identitas */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-emerald-500 overflow-hidden shadow-md flex items-center justify-center">
                  {member?.avatar_url ? (
                    <img src={member.avatar_url} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-black">
                      {(member?.nama_lengkap || 'M').charAt(0)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                  className="absolute -bottom-2 -right-2 p-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-full shadow-lg text-xs font-bold transition"
                  title="Ganti Foto Profil"
                >
                  📷
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">
                    {member?.nama_lengkap || session.user.nama_lengkap}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    {member?.status_keanggotaan || 'ACTIVE'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                  {member?.nama_usaha} • <span className="text-slate-400">{member?.kategori_usaha || 'KULINER'}</span>
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID Anggota: {member?.member_id || session.user.member_id}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>➕</span>
                <span>Tambah Produk</span>
              </button>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>💳</span>
                <span>Bayar Stand / Simpanan</span>
              </button>
              <button
                onClick={() => setIsSalesModalOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>📊</span>
                <span>Lapor Omzet Event</span>
              </button>
              <button
                onClick={onOpenCardModal}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Kartu KTA
              </button>
              <button
                onClick={onOpenChangePassword}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition"
              >
                Ganti Sandi
              </button>
            </div>
          </div>

          {/* Panel Ganti Foto Profil Anggota */}
          {isEditingAvatar && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 max-w-lg text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Perbarui Foto Profil Saya</span>
                <button onClick={() => setIsEditingAvatar(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="file"
                  ref={fileAvatarRef}
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileAvatarRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Pilih File Foto
                </button>
                <span className="text-slate-400">atau</span>
                <form onSubmit={handleAvatarUrlSubmit} className="flex-1 flex gap-2 w-full">
                  <input
                    type="url"
                    placeholder="Tempel link URL foto..."
                    value={avatarUrlInput}
                    onChange={e => setAvatarUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  />
                  <button type="submit" className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl">
                    Pasang
                  </button>
                </form>
              </div>
            </div>
          )}

          {uiMessage && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
              {uiMessage}
            </div>
          )}

          {/* Kartu Ringkasan Keuangan Anggota */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Simpanan Pokok</span>
              <p className="text-xl font-black text-indigo-700 mt-1">Rp {totalPokok.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Simpanan Wajib</span>
              <p className="text-xl font-black text-indigo-600 mt-1">Rp {totalWajib.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Total Omzet Penjualan</span>
              <p className="text-xl font-black text-emerald-600 mt-1">Rp {totalOmzetPribadi.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Produk Terdaftar</span>
              <p className="text-xl font-black text-slate-800 mt-1">{products.length} Menu / Item</p>
            </div>
          </div>
        </div>
      </div>

      {/* Konten Tab Anggota */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-b border-slate-200 overflow-x-auto gap-4 text-sm font-semibold mb-6">
          {[
            { id: 'products', label: `Produk Jualan Saya (${products.length})` },
            { id: 'payments', label: `Riwayat Pembayaran & Bukti (${payments.length})` },
            { id: 'sales', label: `Laporan Penjualan Event (${salesReports.length})` },
            { id: 'stands', label: `Stand Saya (${registrations.length})` },
            { id: 'savings', label: `Mutasi Simpanan Koperasi (${savings.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PRODUK ANGGOTA */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Daftar produk, menu makanan, atau karya yang Anda jual di event</p>
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Tambah Menu / Produk
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Belum ada produk jualan yang Anda masukkan.</p>
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Masukkan Produk Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map(prod => (
                  <div key={prod.product_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between p-3">
                    <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative">
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-300">B</div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-white/90 text-slate-800">
                        {prod.category}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{prod.description || 'Produk lokal binaan Banuarasa'}</p>
                      <p className="text-sm font-black text-emerald-600 mt-1">Rp {prod.price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RIWAYAT PEMBAYARAN & BUKTI */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">Bukti Pembayaran Stand & Simpanan</h2>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
              >
                + Upload Pembayaran Baru
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">ID Bayar</th>
                    <th className="px-4 py-3">Jenis Pembayaran</th>
                    <th className="px-4 py-3">Nominal</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-4 py-3">Bukti Transfer</th>
                    <th className="px-4 py-3">Status Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">Belum ada transaksi pembayaran tercatat.</td>
                    </tr>
                  ) : (
                    payments.map(p => (
                      <tr key={p.payment_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs">{p.payment_id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {p.payment_type === 'STAND_REGISTRATION' ? 'Sewa Stand Event' : p.payment_type === 'SIMPANAN_POKOK' ? 'Simpanan Pokok Koperasi' : 'Simpanan Wajib Bulanan'}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">Rp {p.amount.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-xs">{p.payment_method}</td>
                        <td className="px-4 py-3 text-xs">
                          {p.proof_url ? (
                            <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-emerald-600 underline font-bold">
                              Lihat Bukti Foto
                            </a>
                          ) : (
                            <span className="text-slate-400">Tidak ada file</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            p.verification_status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.verification_status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
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
        )}

        {/* TAB 3: LAPORAN PENJUALAN EVENT */}
        {activeTab === 'sales' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-800">Catatan Penjualan & Omzet Event</h2>
                <p className="text-xs text-slate-400">Total Omzet: Rp {totalOmzetPribadi.toLocaleString('id-ID')}</p>
              </div>
              <button
                onClick={() => setIsSalesModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl"
              >
                + Kirim Laporan Omzet
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Tanggal Laporan</th>
                    <th className="px-4 py-3">Nama Event</th>
                    <th className="px-4 py-3">Kode Stand</th>
                    <th className="px-4 py-3">Total Omzet Penjualan</th>
                    <th className="px-4 py-3">Catatan Tambahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">Belum ada laporan penjualan yang dikirim.</td>
                    </tr>
                  ) : (
                    salesReports.map(sr => (
                      <tr key={sr.sales_report_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{sr.report_date}</td>
                        <td className="px-4 py-3 text-xs">{sr.event_title}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600">{sr.stand_code}</td>
                        <td className="px-4 py-3 font-extrabold text-slate-900">Rp {sr.total_turnover.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{sr.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: STAND SAYA */}
        {activeTab === 'stands' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Stand yang telah Anda pilih atau pesan di event Banuarasa</p>
              <button
                onClick={onOpenStandMap}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
              >
                + Pilih / Pesan Stand Baru
              </button>
            </div>
            {registrations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Anda belum memiliki pesanan stand aktif.</p>
                <button
                  onClick={onOpenStandMap}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Buka Denah Stand
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {registrations.map(reg => (
                  <div key={reg.registration_id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">{reg.event_title}</span>
                      <h3 className="text-xl font-black text-slate-900 mt-0.5">Stand {reg.stand_code}</h3>
                      <p className="text-xs font-bold text-emerald-600 mt-1">Biaya Sewa: Rp {reg.total_fee.toLocaleString('id-ID')}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      reg.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MUTASI SIMPANAN KOPERASI */}
        {activeTab === 'savings' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-800">Buku Tabungan Simpanan Koperasi</h2>
                <p className="text-xs text-indigo-700 font-bold">Total Saldo: Rp {totalSimpanan.toLocaleString('id-ID')}</p>
              </div>
              <button
                onClick={() => {
                  setPaymentForm(prev => ({ ...prev, payment_type: 'SIMPANAN_WAJIB', amount: '50000' }));
                  setIsPaymentModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
              >
                + Setor Simpanan Wajib
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {savings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Belum ada mutasi simpanan tercatat.</div>
              ) : (
                savings.map(s => (
                  <div key={s.saving_id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-800 block text-sm">
                        {s.saving_type === 'SIMPANAN_POKOK' ? 'Simpanan Pokok Anggota' : 'Simpanan Wajib Bulanan'}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <span className="font-black text-indigo-600 text-base">+ Rp {s.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------- */}
      {/* MODAL 1: INPUT PRODUK BARU                         */}
      {/* -------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Tambah Produk / Menu Jualan</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Produk / Makanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nasi Bakar Cumi Pedas"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Jenis / Kategori</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value as StandCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500 font-semibold"
                  >
                    <option value="KULINER">KULINER</option>
                    <option value="KERAJINAN">KERAJINAN</option>
                    <option value="FASHION">FASHION</option>
                    <option value="JASA">JASA</option>
                    <option value="UMUM">UMUM</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 25000"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Deskripsi Singkat Produk</label>
                <textarea
                  rows={2}
                  placeholder="Bahan segar, porsi kenyang, dsb."
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Foto Produk (Upload / URL)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  className="w-full mb-1.5 px-2 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-[11px]"
                />
                <input
                  type="url"
                  placeholder="Atau tempel tautan link gambar..."
                  value={productForm.image_url}
                  onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* MODAL 2: FORM PEMBAYARAN & UPLOAD BUKTI TRANSFER   */}
      {/* -------------------------------------------------- */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload Pembayaran & Simpanan</h3>
                <p className="text-[11px] text-slate-400">Bayar stand event atau setoran simpanan koperasi</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Transaksi</label>
                <select
                  value={paymentForm.payment_type}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_type: e.target.value as PaymentType })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold focus:outline-emerald-500"
                >
                  <option value="STAND_REGISTRATION">Pembayaran Sewa Stand Event</option>
                  <option value="SIMPANAN_POKOK">Setoran Simpanan Pokok (Awal Masuk)</option>
                  <option value="SIMPANAN_WAJIB">Setoran Simpanan Wajib (Bulanan)</option>
                </select>
              </div>

              {paymentForm.payment_type === 'STAND_REGISTRATION' && (
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Pilih Stand yang Dibayar</label>
                  <select
                    value={paymentForm.registration_id}
                    onChange={e => setPaymentForm({ ...paymentForm, registration_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500"
                  >
                    <option value="">-- Pilih Stand Pesanan --</option>
                    {registrations.map(r => (
                      <option key={r.registration_id} value={r.registration_id}>
                        Stand {r.stand_code} — Rp {r.total_fee.toLocaleString('id-ID')} ({r.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Nominal Pembayaran (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 150000"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Metode Transfer</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-emerald-500"
                  >
                    <option value="QRIS">QRIS Statis/Dinamis</option>
                    <option value="TRANSFER_BANK">Transfer Rekening Bank</option>
                    <option value="TUNAI">Tunai di Meja Pengurus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Upload Bukti Transfer (Struk/Screenshot)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofUpload}
                  className="w-full mb-1.5 px-2 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-[11px]"
                />
                <input
                  type="url"
                  placeholder="Atau tempel link URL bukti transfer..."
                  value={paymentForm.proof_url}
                  onChange={e => setPaymentForm({ ...paymentForm, proof_url: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-xs"
                >
                  Kirim Bukti Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* MODAL 3: LAPORAN PENJUALAN EVENT MINGGUAN          */}
      {/* -------------------------------------------------- */}
      {isSalesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Lapor Penjualan & Omzet Event</h3>
                <p className="text-[11px] text-slate-400">Rekap pemasukan stand Anda untuk arsip koperasi</p>
              </div>
              <button onClick={() => setIsSalesModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitSales} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Event</label>
                <input
                  type="text"
                  required
                  value={salesForm.event_title}
                  onChange={e => setSalesForm({ ...salesForm, event_title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kode Stand</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: A-01"
                    value={salesForm.stand_code}
                    onChange={e => setSalesForm({ ...salesForm, stand_code: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Tanggal Event</label>
                  <input
                    type="date"
                    required
                    value={salesForm.report_date}
                    onChange={e => setSalesForm({ ...salesForm, report_date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Omzet Penjualan (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 1500000"
                  value={salesForm.total_turnover}
                  onChange={e => setSalesForm({ ...salesForm, total_turnover: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono text-sm font-extrabold text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Menu paling laris, kendala stok, dll."
                  value={salesForm.notes}
                  onChange={e => setSalesForm({ ...salesForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-emerald-500"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSalesModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
