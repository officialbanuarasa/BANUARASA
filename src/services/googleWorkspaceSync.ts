import {
  Member,
  Product,
  MemberDocument,
  EventRegistration,
  Payment,
  Saving,
  SalesReport,
  EventItem,
} from '../types';

export const GOOGLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1dwivnfJ6mIFFXwYjB__RBh5JLewwfZLN?usp=sharing';

export const GOOGLE_SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ahwiRQRMTqneZhfFbcLTYyuO4No_Y_rOC61ALPSq2KE/edit?usp=sharing';

export const DEFAULT_GAS_DEPLOYMENT_URL =
  'https://script.google.com/macros/s/AKfycbz_placeholder_banuarasa_backend/exec';

export interface GoogleDriveFile {
  fileId: string;
  fileName: string;
  folderPath: string;
  fileSizeFormatted: string;
  mimeType: string;
  driveUrl: string;
  directImageUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  category: 'FOTO_PROFIL' | 'DOKUMEN_LEGALITAS' | 'BUKTI_PEMBAYARAN' | 'FOTO_PRODUK' | 'BANNER_EVENT' | 'LAPORAN_KEUANGAN';
  syncStatus: 'SYNCED_TO_DRIVE' | 'PENDING' | 'ERROR';
}

export interface GoogleSheetRow {
  sheetName: string;
  rowId: string;
  data: Record<string, string | number | boolean>;
  syncedAt: string;
}

const DRIVE_FILES_STORAGE_KEY = 'kbm_google_drive_files_v3';
const SHEET_SYNC_LOG_KEY = 'kbm_google_sheets_sync_log_v3';
const GAS_URL_KEY = 'kbm_gas_web_app_url_v3';

class GoogleWorkspaceSyncService {
  private driveFiles: GoogleDriveFile[] = [];
  private sheetSyncLogs: GoogleSheetRow[] = [];
  private gasUrl: string = '';
  private isOnlineSyncing: boolean = false;

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedUrl = localStorage.getItem(GAS_URL_KEY);
      if (storedUrl) {
        this.gasUrl = storedUrl;
      }

      const storedFiles = localStorage.getItem(DRIVE_FILES_STORAGE_KEY);
      if (storedFiles) {
        this.driveFiles = JSON.parse(storedFiles);
      } else {
        // Start clean with no dummy files
        this.driveFiles = [];
        this.saveState();
      }

      const storedLogs = localStorage.getItem(SHEET_SYNC_LOG_KEY);
      if (storedLogs) {
        this.sheetSyncLogs = JSON.parse(storedLogs);
      }
    } catch {
      // fallback
    }
  }

  private saveState() {
    try {
      localStorage.setItem(DRIVE_FILES_STORAGE_KEY, JSON.stringify(this.driveFiles));
      localStorage.setItem(SHEET_SYNC_LOG_KEY, JSON.stringify(this.sheetSyncLogs));
      if (this.gasUrl) {
        localStorage.setItem(GAS_URL_KEY, this.gasUrl);
      }
    } catch (e) {
      console.error('Failed saving workspace sync state', e);
    }
  }

  // --- GAS URL Management ---
  getGasUrl(): string {
    return this.gasUrl || (import.meta as any).env?.VITE_GAS_API_URL || '';
  }

  setGasUrl(url: string) {
    this.gasUrl = url.trim();
    if (this.gasUrl) {
      localStorage.setItem(GAS_URL_KEY, this.gasUrl);
    } else {
      localStorage.removeItem(GAS_URL_KEY);
    }
    // Broadcast GAS URL to server so all visitors on all devices share it
    try {
      fetch('/api/gas-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gasUrl: this.gasUrl }),
      }).catch(() => {});
    } catch {}
  }

  // --- Live Google Apps Script Health Check & Data Fetching ---
  async testGasConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    const url = this.getGasUrl();
    if (!url) {
      return {
        success: false,
        message: 'URL Google Apps Script belum dikonfigurasi. Silakan masukkan Web App URL yang telah di-deploy.',
      };
    }

    try {
      const targetUrl = url.includes('?') ? `${url}&action=ping` : `${url}?action=ping`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const data = await response.json();
      if (data && (data.success || data.status === 'ONLINE')) {
        return {
          success: true,
          message: `Terhubung langsung ke Google Spreadsheet (${data.spreadsheetName || 'Aktif'}) & Drive!`,
          details: data,
        };
      }
      return {
        success: false,
        message: data.error || 'Respon Apps Script tidak valid.',
        details: data,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal menghubungi endpoint Google Apps Script: ${err.message}. Pastikan akses di-set ke 'Anyone' saat deployment.`,
      };
    }
  }

  async fetchLiveDataFromSpreadsheet(): Promise<{ success: boolean; data?: any; error?: string }> {
    const url = this.getGasUrl();
    if (!url) {
      return { success: false, error: 'Web App URL Google Apps Script belum disetel.' };
    }

    try {
      const targetUrl = url.includes('?') ? `${url}&action=getAllData` : `${url}?action=getAllData`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const res = await response.json();
      if (res && res.success && res.data) {
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error || 'Format data Google Spreadsheet tidak sesuai.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // --- Live POST to GAS ---
  async postToGas(action: string, data: any): Promise<{ success: boolean; result?: any; error?: string }> {
    const url = this.getGasUrl();
    if (!url) {
      // Local sync fallback
      return { success: true, result: { status: 'LOCAL_QUEUED' } };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // GAS handles text/plain without CORS preflight issues
        },
        body: JSON.stringify({ action, data }),
      });
      const res = await response.json();
      return res;
    } catch (err: any) {
      console.warn(`[GAS Bridge Warning] Action ${action} could not reach live server:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // --- Direct File Upload to Google Drive via GAS ---
  async uploadFileToGoogleDriveDirect(params: {
    fileDataUriOrBase64?: string;
    fileUrl?: string;
    fileName: string;
    mimeType?: string;
    category: GoogleDriveFile['category'];
    uploadedBy: string;
    memberId?: string;
    eventId?: string;
    referenceId?: string;
  }): Promise<GoogleDriveFile> {
    const fallbackFileId = `DRV_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    let folderPath = '00_GENERAL/';

    if (params.category === 'FOTO_PROFIL') {
      folderPath = `01_ANGGOTA/${params.memberId || params.uploadedBy}/Foto_Profil/`;
    } else if (params.category === 'DOKUMEN_LEGALITAS') {
      folderPath = `01_ANGGOTA/${params.memberId || params.uploadedBy}/Legalitas/`;
    } else if (params.category === 'BUKTI_PEMBAYARAN') {
      folderPath = `02_EVENT/${params.eventId || '2026'}/Payment_Proofs/`;
    } else if (params.category === 'FOTO_PRODUK') {
      folderPath = `03_PRODUK/${params.memberId || params.uploadedBy}/`;
    } else {
      folderPath = `04_LAPORAN/2026/`;
    }

    let gasDriveResult: any = null;
    const gasUrl = this.getGasUrl();
    const payloadData = params.fileDataUriOrBase64 || params.fileUrl || '';

    if (gasUrl && payloadData) {
      try {
        const res = await this.postToGas('uploadFileToDrive', {
          base64Data: payloadData,
          fileName: params.fileName,
          mimeType: params.mimeType || 'image/jpeg',
          category: params.category,
          memberId: params.memberId || params.uploadedBy,
          eventId: params.eventId,
        });
        if (res.success && res.result) {
          gasDriveResult = res.result;
        }
      } catch (e) {
        console.warn('Drive direct upload via GAS failed, falling back to local registry', e);
      }
    }

    const newDriveFile: GoogleDriveFile = {
      fileId: gasDriveResult?.fileId || fallbackFileId,
      fileName: params.fileName,
      folderPath: gasDriveResult?.folderPath || folderPath,
      fileSizeFormatted: gasDriveResult?.fileSize ? `${(gasDriveResult.fileSize / (1024 * 1024)).toFixed(2)} MB` : '1.1 MB',
      mimeType: params.mimeType || 'image/jpeg',
      driveUrl: gasDriveResult?.driveUrl || GOOGLE_DRIVE_FOLDER_URL,
      directImageUrl: gasDriveResult?.directImageUrl || (params.fileUrl || (params.fileDataUriOrBase64?.startsWith('data:') ? params.fileDataUriOrBase64 : undefined)),
      uploadedAt: new Date().toISOString(),
      uploadedBy: params.uploadedBy,
      category: params.category,
      syncStatus: gasDriveResult ? 'SYNCED_TO_DRIVE' : 'PENDING',
    };

    this.driveFiles.unshift(newDriveFile);
    this.saveState();
    return newDriveFile;
  }

  // Convenient alias matching StorageService calls
  syncFileToGoogleDrive(params: {
    fileDataUriOrBase64?: string;
    fileUrl?: string;
    fileName: string;
    mimeType?: string;
    category: GoogleDriveFile['category'];
    uploadedBy: string;
    memberId?: string;
    eventId?: string;
    referenceId?: string;
  }): GoogleDriveFile {
    const fallbackFileId = `DRV_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    let folderPath = '00_GENERAL/';

    if (params.category === 'FOTO_PROFIL') {
      folderPath = `01_ANGGOTA/${params.memberId || params.uploadedBy}/Foto_Profil/`;
    } else if (params.category === 'DOKUMEN_LEGALITAS') {
      folderPath = `01_ANGGOTA/${params.memberId || params.uploadedBy}/Legalitas/`;
    } else if (params.category === 'BUKTI_PEMBAYARAN') {
      folderPath = `02_EVENT/${params.eventId || '2026'}/Payment_Proofs/`;
    } else if (params.category === 'FOTO_PRODUK') {
      folderPath = `03_PRODUK/${params.memberId || params.uploadedBy}/`;
    } else {
      folderPath = `04_LAPORAN/2026/`;
    }

    const newDriveFile: GoogleDriveFile = {
      fileId: fallbackFileId,
      fileName: params.fileName,
      folderPath: folderPath,
      fileSizeFormatted: '1.2 MB',
      mimeType: params.mimeType || 'image/jpeg',
      driveUrl: GOOGLE_DRIVE_FOLDER_URL,
      directImageUrl: params.fileUrl || (params.fileDataUriOrBase64?.startsWith('data:') ? params.fileDataUriOrBase64 : undefined),
      uploadedAt: new Date().toISOString(),
      uploadedBy: params.uploadedBy,
      category: params.category,
      syncStatus: this.getGasUrl() ? 'SYNCED_TO_DRIVE' : 'PENDING',
    };

    this.driveFiles.unshift(newDriveFile);
    this.saveState();

    // Async background sync if GAS is configured
    if (this.getGasUrl()) {
      this.uploadFileToGoogleDriveDirect(params).catch(() => {});
    }

    return newDriveFile;
  }


  // --- Local & Live Spreadsheet Row Tracker ---
  syncRowToSpreadsheet(sheetName: string, rowId: string, data: Record<string, any>) {
    const row: GoogleSheetRow = {
      sheetName,
      rowId,
      data,
      syncedAt: new Date().toISOString(),
    };

    const idx = this.sheetSyncLogs.findIndex((r) => r.sheetName === sheetName && r.rowId === rowId);
    if (idx !== -1) {
      this.sheetSyncLogs[idx] = row;
    } else {
      this.sheetSyncLogs.unshift(row);
    }
    this.saveState();

    // If GAS URL exists, perform background async sync
    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      let actionName = 'upsertRow';
      if (sheetName.includes('ANGGOTA')) actionName = 'updateMember';
      else if (sheetName.includes('STAND')) actionName = 'updateStand';
      else if (sheetName.includes('PEMBAYARAN')) actionName = 'updatePayment';
      else if (sheetName.includes('SIMPANAN')) actionName = 'updateSaving';
      else if (sheetName.includes('OMZET')) actionName = 'updateSalesReport';
      else if (sheetName.includes('EVENT')) actionName = 'updateEvent';
      else if (sheetName.includes('PRODUK')) actionName = 'updateProduct';
      else if (sheetName.includes('LEGALITAS') || sheetName.includes('DOKUMEN')) actionName = 'updateDocument';

      this.postToGas(actionName, data).catch(() => {});
    }
  }

  deleteSpreadsheetRow(sheetName: string, rowId: string): boolean {
    const prevLen = this.sheetSyncLogs.length;
    this.sheetSyncLogs = this.sheetSyncLogs.filter(
      (r) => !(r.sheetName === sheetName && r.rowId === rowId)
    );
    if (this.sheetSyncLogs.length !== prevLen) {
      this.saveState();
    }

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      let actionName = 'deleteRow';
      let idKey = 'id';
      if (sheetName.includes('ANGGOTA')) { actionName = 'deleteMember'; idKey = 'member_id'; }
      else if (sheetName.includes('STAND')) { actionName = 'deleteStand'; idKey = 'registration_id'; }
      else if (sheetName.includes('PEMBAYARAN')) { actionName = 'deletePayment'; idKey = 'payment_id'; }
      else if (sheetName.includes('SIMPANAN')) { actionName = 'deleteSaving'; idKey = 'saving_id'; }
      else if (sheetName.includes('OMZET')) { actionName = 'deleteSalesReport'; idKey = 'sales_report_id'; }
      else if (sheetName.includes('EVENT')) { actionName = 'deleteEvent'; idKey = 'event_id'; }
      else if (sheetName.includes('PRODUK')) { actionName = 'deleteProduct'; idKey = 'product_id'; }
      else if (sheetName.includes('LEGALITAS') || sheetName.includes('DOKUMEN')) { actionName = 'deleteDocument'; idKey = 'document_id'; }

      this.postToGas(actionName, { [idKey]: rowId }).catch(() => {});
    }

    return true;
  }

  getDriveFolderUrl(): string {
    return GOOGLE_DRIVE_FOLDER_URL;
  }

  getSpreadsheetUrl(): string {
    return GOOGLE_SPREADSHEET_URL;
  }

  getDriveFiles(): GoogleDriveFile[] {
    return this.driveFiles;
  }

  getDriveFilesByMember(memberId: string): GoogleDriveFile[] {
    return this.driveFiles.filter(
      (f) => f.uploadedBy === memberId || f.folderPath.includes(memberId)
    );
  }

  deleteDriveFile(fileId: string): boolean {
    const prevLen = this.driveFiles.length;
    this.driveFiles = this.driveFiles.filter((f) => f.fileId !== fileId);
    if (this.driveFiles.length !== prevLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  clearDriveFiles(): void {
    this.driveFiles = [];
    this.sheetSyncLogs = [];
    this.saveState();
  }

  getSheetSyncLogs(): GoogleSheetRow[] {
    return this.sheetSyncLogs;
  }

  // Fetch all latest data from Google Apps Script Web App or trigger sync update
  async fetchAllDataFromGas(): Promise<{ success: boolean; message: string; updatedCount?: number }> {
    const { storage } = await import('./storage');

    // 1. Sync with server state first
    await storage.syncWithServer();

    const url = this.getGasUrl();
    if (!url) {
      // Local sync refresh - ensures all storage subscribers re-render latest local changes
      storage.notifyListeners();
      return { success: true, message: 'Data server & lokal tersinkronisasi.' };
    }

    try {
      const liveRes = await this.fetchLiveDataFromSpreadsheet();

      if (liveRes && liveRes.success && liveRes.data) {
        let count = 0;
        const data = liveRes.data;
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          localStorage.setItem('kbm_v3_events', JSON.stringify(data.events));
          count += data.events.length;
        }
        if (data.members && Array.isArray(data.members) && data.members.length > 0) {
          localStorage.setItem('kbm_v3_members', JSON.stringify(data.members));
          count += data.members.length;
        }
        if (data.registrations && Array.isArray(data.registrations) && data.registrations.length > 0) {
          localStorage.setItem('kbm_v3_registrations', JSON.stringify(data.registrations));
          count += data.registrations.length;
        }
        if (data.payments && Array.isArray(data.payments) && data.payments.length > 0) {
          localStorage.setItem('kbm_v3_payments', JSON.stringify(data.payments));
          count += data.payments.length;
        }
        if (data.savings && Array.isArray(data.savings) && data.savings.length > 0) {
          localStorage.setItem('kbm_v3_savings', JSON.stringify(data.savings));
          count += data.savings.length;
        }
        if (data.sales && Array.isArray(data.sales) && data.sales.length > 0) {
          localStorage.setItem('kbm_v3_sales_reports', JSON.stringify(data.sales));
          count += data.sales.length;
        }
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          localStorage.setItem('kbm_v3_products', JSON.stringify(data.products));
          count += data.products.length;
        }
        if (data.branding && typeof data.branding === 'object') {
          localStorage.setItem('kbm_v3_branding_assets', JSON.stringify(data.branding));
          count += 1;
        }

        // Notify storage subscribers and push to shared server
        storage.notifyListeners();
        storage.persistToServer();
        return { success: true, message: `Berhasil menyinkronkan data dari Google Spreadsheet!`, updatedCount: count };
      }

      storage.notifyListeners();
      return { success: true, message: 'Sinkronisasi selesai.' };
    } catch (err: any) {
      console.warn('Auto-refresh from Google Apps Script:', err?.message || err);
      return { success: false, message: 'Gagal menghubungi Google Apps Script.' };
    }
  }

  // Generate clean CSV for export
  generateSheetCSV(
    sheetType: 'MEMBERS' | 'STANDS' | 'PAYMENTS' | 'PRODUCTS' | 'SAVINGS' | 'SALES' | 'DRIVE_FILES',
    data: any[]
  ): string {
    if (!data || data.length === 0) return 'No data';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  downloadCSV(sheetName: string, csvContent: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${sheetName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const googleWorkspaceSync = new GoogleWorkspaceSyncService();
