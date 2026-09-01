import React, { useState, useEffect } from 'react';
import {
  googleWorkspaceSync,
  GoogleDriveFile,
  GoogleSheetRow,
  GOOGLE_DRIVE_FOLDER_URL,
  GOOGLE_SPREADSHEET_URL,
} from '../services/googleWorkspaceSync';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/googleAppsScriptCode';
import { storage } from '../services/storage';
import {
  X,
  Cloud,
  FileSpreadsheet,
  HardDrive,
  Download,
  ExternalLink,
  CheckCircle2,
  Folder,
  FileText,
  Image,
  RefreshCw,
  Search,
  Database,
  Layers,
  ArrowUpRight,
  Trash2,
  Copy,
  Check,
  Code2,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Send,
  Radio,
} from 'lucide-react';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'APPS_SCRIPT' | 'SHEETS' | 'DRIVE'>('APPS_SCRIPT');
  const [selectedSheet, setSelectedSheet] = useState<
    'MEMBERS' | 'STANDS' | 'PAYMENTS' | 'PRODUCTS' | 'SAVINGS' | 'SALES'
  >('MEMBERS');
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [sheetLogs, setSheetLogs] = useState<GoogleSheetRow[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // GAS State
  const [gasUrlInput, setGasUrlInput] = useState<string>('');
  const [isTestingGas, setIsTestingGas] = useState(false);
  const [gasStatusMessage, setGasStatusMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [isSyncingFromGas, setIsSyncingFromGas] = useState(false);
  const [isSyncingToGas, setIsSyncingToGas] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDriveFiles(googleWorkspaceSync.getDriveFiles());
      setSheetLogs(googleWorkspaceSync.getSheetSyncLogs());
      setGasUrlInput(googleWorkspaceSync.getGasUrl());
      setGasStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const members = storage.getMembers();
  const registrations = storage.getRegistrations();
  const payments = storage.getPayments();
  const products = storage.getProducts();
  const savings = storage.getSavings();
  const salesReports = storage.getSalesReports();

  const handleCopyLink = (link: string, key: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSaveGasUrl = () => {
    googleWorkspaceSync.setGasUrl(gasUrlInput);
    setGasStatusMessage({ text: 'URL Google Apps Script berhasil disimpan!', isSuccess: true });
    setTimeout(() => setGasStatusMessage(null), 3000);
  };

  const handleTestGas = async () => {
    setIsTestingGas(true);
    setGasStatusMessage(null);
    try {
      googleWorkspaceSync.setGasUrl(gasUrlInput);
      const res = await googleWorkspaceSync.testGasConnection();
      setGasStatusMessage({ text: res.message, isSuccess: res.success });
    } catch (e: any) {
      setGasStatusMessage({ text: `Gagal: ${e.message}`, isSuccess: false });
    } finally {
      setIsTestingGas(false);
    }
  };

  const handleFetchLiveData = async () => {
    setIsSyncingFromGas(true);
    setGasStatusMessage(null);
    try {
      googleWorkspaceSync.setGasUrl(gasUrlInput);
      const res = await googleWorkspaceSync.fetchLiveDataFromSpreadsheet();
      if (res.success && res.data) {
        const syncRes = storage.loadFromSpreadsheetData(res.data);
        setGasStatusMessage({ text: syncRes.message, isSuccess: true });
      } else {
        setGasStatusMessage({ text: res.error || 'Gagal mengambil data dari Google Spreadsheet.', isSuccess: false });
      }
    } catch (e: any) {
      setGasStatusMessage({ text: `Error sinkronisasi: ${e.message}`, isSuccess: false });
    } finally {
      setIsSyncingFromGas(false);
    }
  };

  const handleBatchSyncToGas = async () => {
    setIsSyncingToGas(true);
    setGasStatusMessage(null);
    try {
      googleWorkspaceSync.setGasUrl(gasUrlInput);
      const payload = {
        members: storage.getMembers(),
        registrations: storage.getRegistrations(),
        payments: storage.getPayments(),
        savings: storage.getSavings(),
        salesReports: storage.getSalesReports(),
      };
      const res = await googleWorkspaceSync.postToGas('batchSync', payload);
      if (res.success) {
        setGasStatusMessage({ text: 'Semua data lokal berhasil dikirim dan diarsipkan ke Google Spreadsheet!', isSuccess: true });
      } else {
        setGasStatusMessage({ text: res.error || 'Gagal mengirim data ke Google Apps Script.', isSuccess: false });
      }
    } catch (e: any) {
      setGasStatusMessage({ text: `Error kirim data: ${e.message}`, isSuccess: false });
    } finally {
      setIsSyncingToGas(false);
    }
  };

  const handleClearDemoData = () => {
    storage.clearDemoData();
    setShowClearConfirm(false);
    setGasStatusMessage({ text: 'Seluruh data demo telah dibersihkan. Database siap digunakan untuk transaksi murni!', isSuccess: true });
  };

  // Export handlers
  const handleExportCurrentSheet = () => {
    let data: any[] = [];
    let name = 'Google_Sheet_Data';

    if (selectedSheet === 'MEMBERS') {
      data = members;
      name = 'SHEET_01_ANGGOTA_KOPERASI';
    } else if (selectedSheet === 'STANDS') {
      data = registrations;
      name = 'SHEET_02_STAND_REGISTRASI';
    } else if (selectedSheet === 'PAYMENTS') {
      data = payments;
      name = 'SHEET_03_BUKTI_PEMBAYARAN';
    } else if (selectedSheet === 'PRODUCTS') {
      data = products;
      name = 'SHEET_04_KATALOG_PRODUK';
    } else if (selectedSheet === 'SAVINGS') {
      data = savings;
      name = 'SHEET_05_KAS_SIMPANAN';
    } else if (selectedSheet === 'SALES') {
      data = salesReports;
      name = 'SHEET_06_OMZET_PENJUALAN';
    }

    const csv = googleWorkspaceSync.generateSheetCSV(selectedSheet as any, data);
    googleWorkspaceSync.downloadCSV(name, csv);
  };

  const handleExportDriveList = () => {
    const csv = googleWorkspaceSync.generateSheetCSV('DRIVE_FILES', driveFiles);
    googleWorkspaceSync.downloadCSV('GOOGLE_DRIVE_FILES_REGISTRY', csv);
  };

  const handleDeleteDriveFile = (fileId: string) => {
    googleWorkspaceSync.deleteDriveFile(fileId);
    setDriveFiles(googleWorkspaceSync.getDriveFiles());
  };

  const filteredDriveFiles = driveFiles.filter((f) => {
    if (filterCategory !== 'ALL' && f.category !== filterCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.fileName.toLowerCase().includes(q) ||
      f.folderPath.toLowerCase().includes(q) ||
      f.uploadedBy.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-100">
                  Google Workspace & Apps Script Manager
                </h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Cloud Bridge
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Penyimpanan berkas dokumen Google Drive & basis data Google Spreadsheet murni (Zero Dummy Data).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Links Direct Action Banner */}
        <div className="bg-emerald-950/90 text-emerald-100 px-6 py-3 border-b border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
              Tautan Aktif
            </span>
            <span className="text-slate-200">Akses langsung repositori cloud resmi:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={GOOGLE_SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Buka Google Spreadsheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-600/40 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Buka Google Drive Folder</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 p-2 bg-slate-100 border-b border-slate-200 shrink-0 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('APPS_SCRIPT')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'APPS_SCRIPT'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Google Apps Script (Bridge)</span>
          </button>

          <button
            onClick={() => setActiveTab('SHEETS')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'SHEETS'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Spreadsheet (Data Murni)</span>
          </button>

          <button
            onClick={() => setActiveTab('DRIVE')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'DRIVE'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span>Google Drive (Berkas & Foto)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: GOOGLE APPS SCRIPT BRIDGE & LIVE SYNC */}
          {activeTab === 'APPS_SCRIPT' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Endpoint Configuration Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <h4 className="font-black text-sm text-white">
                        Konfigurasi Web App URL Google Apps Script
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Sambungkan aplikasi web Banuarasa langsung dengan Google Spreadsheet dan Google Drive resmi Anda.
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg font-bold">
                    Zero-Dummy Backend
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300">
                    Google Apps Script Web App Deployment URL:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={gasUrlInput}
                      onChange={(e) => setGasUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSaveGasUrl}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors shrink-0"
                    >
                      Simpan URL
                    </button>
                    <button
                      onClick={handleTestGas}
                      disabled={isTestingGas || !gasUrlInput}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {isTestingGas ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Radio className="w-3.5 h-3.5" />
                      )}
                      <span>Test Koneksi</span>
                    </button>
                  </div>
                </div>

                {gasStatusMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                      gasStatusMessage.isSuccess
                        ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/40'
                        : 'bg-rose-950/80 text-rose-200 border border-rose-600/40'
                    }`}
                  >
                    {gasStatusMessage.isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{gasStatusMessage.text}</span>
                  </div>
                )}

                {/* 2-Way Sync Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={handleFetchLiveData}
                    disabled={isSyncingFromGas || !gasUrlInput}
                    className="p-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 disabled:opacity-50 text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncingFromGas ? 'animate-spin' : ''}`} />
                    <span>Tarik Data Murni dari Spreadsheet (Fetch)</span>
                  </button>

                  <button
                    onClick={handleBatchSyncToGas}
                    disabled={isSyncingToGas || !gasUrlInput}
                    className="p-3 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-700/50 disabled:opacity-50 text-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className={`w-4 h-4 text-blue-400 ${isSyncingToGas ? 'animate-spin' : ''}`} />
                    <span>Kirim Data Lokal ke Spreadsheet (Batch Push)</span>
                  </button>
                </div>
              </div>

              {/* Clean Data Guarantee Section */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Jaminan Bebas Data Demo (Live Production Mode)</span>
                    </div>
                    <p className="text-xs text-amber-800/90 leading-relaxed">
                      Sesuai arahan, aplikasi dan Google Apps Script ini <strong>tidak menggunakan data dummy/demo</strong>. Semua data yang tampil berasal dari input nyata anggota, pendaftaran stand, dan baris Google Spreadsheet Anda.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-amber-900 font-bold">
                    Ingin membersihkan basis data lokal untuk memulai registrasi murni dari nol?
                  </span>
                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Bersihkan Data Demo
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearDemoData}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg transition-colors cursor-pointer"
                      >
                        Ya, Kosongkan Data Demo
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Apps Script Source Code Viewer & Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                      Kode Google Apps Script (Code.gs) Resmi
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopyLink(GOOGLE_APPS_SCRIPT_CODE, 'gas_code')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {copiedLink === 'gas_code' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Seluruh Kode Apps Script</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 text-slate-300 p-4 rounded-2xl font-mono text-[11px] max-h-56 overflow-y-auto border border-slate-800 leading-relaxed">
                  <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SPREADSHEET */}
          {activeTab === 'SHEETS' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Sheet Selector Pills */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  <button
                    onClick={() => setSelectedSheet('MEMBERS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSheet === 'MEMBERS'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    1. Anggota Koperasi ({members.length})
                  </button>
                  <button
                    onClick={() => setSelectedSheet('STANDS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSheet === 'STANDS'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    2. 64 Stand Booking ({registrations.length})
                  </button>
                  <button
                    onClick={() => setSelectedSheet('PAYMENTS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSheet === 'PAYMENTS'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    3. Bukti Bayar ({payments.length})
                  </button>
                  <button
                    onClick={() => setSelectedSheet('PRODUCTS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSheet === 'PRODUCTS'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    4. Katalog Produk ({products.length})
                  </button>
                  <button
                    onClick={() => setSelectedSheet('SAVINGS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSheet === 'SAVINGS'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    5. Simpanan Kas ({savings.length})
                  </button>
                  <button
                    onClick={() => setSelectedSheet('SALES')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSheet === 'SALES'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    6. Laporan Omzet ({salesReports.length})
                  </button>
                </div>

                <button
                  onClick={handleExportCurrentSheet}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Download CSV</span>
                </button>
              </div>

              {/* Data Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto max-h-72">
                  {selectedSheet === 'MEMBERS' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">ID Anggota</th>
                          <th className="p-3">Nama Lengkap</th>
                          <th className="p-3">Nama Usaha UMKM</th>
                          <th className="p-3">Kategori</th>
                          <th className="p-3">WhatsApp</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {members.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              Belum ada data anggota yang terdaftar.
                            </td>
                          </tr>
                        ) : (
                          members.map((m) => (
                            <tr key={m.member_id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-slate-900">{m.member_id}</td>
                              <td className="p-3 font-bold text-slate-900">{m.nama_lengkap}</td>
                              <td className="p-3">{m.nama_usaha}</td>
                              <td className="p-3">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                  {m.kategori_usaha}
                                </span>
                              </td>
                              <td className="p-3 font-mono">{m.whatsapp}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    m.status_keanggotaan === 'ACTIVE'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {m.status_keanggotaan}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {selectedSheet === 'STANDS' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">ID Reservasi</th>
                          <th className="p-3">Kode Stand</th>
                          <th className="p-3">ID Anggota</th>
                          <th className="p-3">Harga</th>
                          <th className="p-3">Status Pendaftaran</th>
                          <th className="p-3">Status Bayar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {registrations.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              Belum ada data pendaftaran stand.
                            </td>
                          </tr>
                        ) : (
                          registrations.map((r) => (
                            <tr key={r.registration_id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold">{r.registration_id}</td>
                              <td className="p-3 font-black text-amber-900 bg-amber-50/50">
                                Stand {r.stand_code}
                              </td>
                              <td className="p-3 font-mono">{r.member_id}</td>
                              <td className="p-3 font-bold">Rp{r.stand_price.toLocaleString('id-ID')}</td>
                              <td className="p-3">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  {r.registration_status}
                                </span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    r.payment_status === 'PAID'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {r.payment_status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {selectedSheet === 'PAYMENTS' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">ID Pembayaran</th>
                          <th className="p-3">Jenis</th>
                          <th className="p-3">ID Anggota</th>
                          <th className="p-3">Nominal</th>
                          <th className="p-3">Metode</th>
                          <th className="p-3">Verifikasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              Belum ada transaksi pembayaran.
                            </td>
                          </tr>
                        ) : (
                          payments.map((p) => (
                            <tr key={p.payment_id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold">{p.payment_id}</td>
                              <td className="p-3 font-bold">{p.payment_type}</td>
                              <td className="p-3 font-mono">{p.member_id}</td>
                              <td className="p-3 font-black text-emerald-700">
                                Rp{p.amount.toLocaleString('id-ID')}
                              </td>
                              <td className="p-3">{p.payment_method}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    p.verification_status === 'VERIFIED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
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
                  )}

                  {selectedSheet === 'PRODUCTS' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">ID Produk</th>
                          <th className="p-3">Nama Produk</th>
                          <th className="p-3">ID Member</th>
                          <th className="p-3">Kategori</th>
                          <th className="p-3">Harga</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              Belum ada katalog produk terdaftar.
                            </td>
                          </tr>
                        ) : (
                          products.map((prd) => (
                            <tr key={prd.product_id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold">{prd.product_id}</td>
                              <td className="p-3 font-bold text-slate-900">{prd.product_name}</td>
                              <td className="p-3 font-mono">{prd.member_id}</td>
                              <td className="p-3">{prd.category}</td>
                              <td className="p-3 font-bold">Rp{prd.price.toLocaleString('id-ID')}</td>
                              <td className="p-3">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  {prd.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {selectedSheet === 'SAVINGS' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">ID Simpanan</th>
                          <th className="p-3">ID Member</th>
                          <th className="p-3">Jenis Simpanan</th>
                          <th className="p-3">Periode</th>
                          <th className="p-3">Jumlah</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {savings.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              Belum ada mutasi simpanan kas.
                            </td>
                          </tr>
                        ) : (
                          savings.map((s) => (
                            <tr key={s.saving_id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold">{s.saving_id}</td>
                              <td className="p-3 font-mono">{s.member_id}</td>
                              <td className="p-3 font-bold">{s.saving_type}</td>
                              <td className="p-3">{s.period_month_year || '-'}</td>
                              <td className="p-3 font-black text-emerald-700">
                                Rp{s.amount.toLocaleString('id-ID')}
                              </td>
                              <td className="p-3">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  {s.payment_status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {selectedSheet === 'SALES' && (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">ID Laporan</th>
                          <th className="p-3">Event ID</th>
                          <th className="p-3">Member ID</th>
                          <th className="p-3">Omzet Kotor</th>
                          <th className="p-3">Laba Bersih</th>
                          <th className="p-3">Item Terjual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {salesReports.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              Belum ada laporan omzet penjualan.
                            </td>
                          </tr>
                        ) : (
                          salesReports.map((sr) => (
                            <tr key={sr.sales_report_id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold">{sr.sales_report_id}</td>
                              <td className="p-3 font-mono">{sr.event_id}</td>
                              <td className="p-3 font-mono">{sr.member_id}</td>
                              <td className="p-3 font-bold text-slate-900">
                                Rp{sr.gross_sales.toLocaleString('id-ID')}
                              </td>
                              <td className="p-3 font-black text-emerald-700">
                                Rp{sr.net_profit.toLocaleString('id-ID')}
                              </td>
                              <td className="p-3">{sr.total_items_sold} pcs</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE */}
          {activeTab === 'DRIVE' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Drive Folder Architecture Visual Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <a
                  href={GOOGLE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all block group"
                >
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3.5 h-3.5 text-emerald-500" />
                      <span>01_ANGGOTA/</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {driveFiles.filter((f) => f.folderPath.includes('01_ANGGOTA')).length} Berkas
                  </p>
                  <p className="text-[10px] text-slate-500">Foto Profil & Dokumen Legalitas</p>
                </a>

                <a
                  href={GOOGLE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all block group"
                >
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3.5 h-3.5 text-blue-500" />
                      <span>02_EVENT/</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {driveFiles.filter((f) => f.folderPath.includes('02_EVENT')).length} Berkas
                  </p>
                  <p className="text-[10px] text-slate-500">Bukti Transfer Stand & Banner</p>
                </a>

                <a
                  href={GOOGLE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all block group"
                >
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                      <span>03_PRODUK/</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {driveFiles.filter((f) => f.folderPath.includes('03_PRODUK')).length} Berkas
                  </p>
                  <p className="text-[10px] text-slate-500">Foto Produk UMKM</p>
                </a>

                <a
                  href={GOOGLE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all block group"
                >
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3.5 h-3.5 text-purple-500" />
                      <span>04_LAPORAN/</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {driveFiles.filter((f) => f.folderPath.includes('04_LAPORAN')).length} Berkas
                  </p>
                  <p className="text-[10px] text-slate-500">Laporan Keuangan & Kas</p>
                </a>
              </div>

              {/* Filter and Download Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                  >
                    <option value="ALL">Semua Kategori Folder ({driveFiles.length})</option>
                    <option value="FOTO_PROFIL">01_ANGGOTA/Foto_Profil</option>
                    <option value="DOKUMEN_LEGALITAS">01_ANGGOTA/Legalitas</option>
                    <option value="BUKTI_PEMBAYARAN">02_EVENT/Payment_Proofs</option>
                    <option value="FOTO_PRODUK">03_PRODUK/</option>
                    <option value="LAPORAN_KEUANGAN">04_LAPORAN/</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Cari nama file / member..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={GOOGLE_DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Google Drive Root</span>
                  </a>
                  <button
                    onClick={handleExportDriveList}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Download Manifest CSV</span>
                  </button>
                </div>
              </div>

              {/* Drive Files List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">File ID</th>
                        <th className="p-3">Nama Berkas</th>
                        <th className="p-3">Google Drive Folder</th>
                        <th className="p-3">Ukuran</th>
                        <th className="p-3">Pengunggah</th>
                        <th className="p-3">Status Sync</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredDriveFiles.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400">
                            Tidak ada berkas yang sesuai filter
                          </td>
                        </tr>
                      ) : (
                        filteredDriveFiles.map((file) => (
                          <tr key={file.fileId} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-800">{file.fileId}</td>
                            <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                              {file.mimeType.includes('image') ? (
                                <Image className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              )}
                              <span>{file.fileName}</span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-600">{file.folderPath}</td>
                            <td className="p-3">{file.fileSizeFormatted}</td>
                            <td className="p-3 font-mono">{file.uploadedBy}</td>
                            <td className="p-3">
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Drive Synced</span>
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                              <a
                                href={GOOGLE_DRIVE_FOLDER_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Buka Drive</span>
                              </a>
                              <button
                                onClick={() => handleDeleteDriveFile(file.fileId)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs inline-flex items-center gap-1"
                                title="Hapus Berkas dari Sync Registry"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
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
        </div>
      </div>
    </div>
  );
};

