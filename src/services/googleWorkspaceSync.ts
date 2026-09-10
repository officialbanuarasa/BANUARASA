// ========================================================
// BANUARASA WEEKEND MARKET - GOOGLE APPS SCRIPT BRIDGE
// Satu pintu komunikasi frontend -> Google Apps Script.
// ========================================================

const APPS_SCRIPT_URL_KEY = 'banuarasa_gas_url';

export const GOOGLE_SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ahwiRQRMTqneZhfFbcLTYyuO4No_Y_rOC61ALPSq2KE/edit';

export const GOOGLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1dwivnfJ6mIFFXwYjB__RBh5JLewwfZLN';

export interface GasResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  [key: string]: unknown;
}

export interface DriveUploadPayload {
  fileName: string;
  fileUrl?: string;
  base64Data?: string;
  mimeType?: string;
  category?: string;
  uploadedBy?: string;
  memberId?: string;
  eventId?: string;
  referenceId?: string;
}

const SHEET_ALIASES: Record<string, string> = {
  SHEET_KATALOG_PRODUK: 'SHEET_PRODUK_UMKM',
  SHEET_STAND_REGISTRASI: 'SHEET_REGISTRASI_STAND',
  SHEET_BUKTI_PEMBAYARAN: 'SHEET_PEMBAYARAN',
};

export const getSavedGasUrl = (): string => {
  return localStorage.getItem(APPS_SCRIPT_URL_KEY) ||
    localStorage.getItem('kbm_gas_web_app_url_v3') ||
    '';
};

export const saveGasUrl = (url: string): void => {
  const cleanUrl = url.trim();
  localStorage.setItem(APPS_SCRIPT_URL_KEY, cleanUrl);
  localStorage.setItem('kbm_gas_web_app_url_v3', cleanUrl);
};

async function request<T = unknown>(
  action: string,
  data: Record<string, unknown> = {}
): Promise<GasResponse<T>> {
  const endpoint = getSavedGasUrl();

  if (!endpoint) {
    return {
      success: false,
      error: 'URL Google Apps Script belum dikonfigurasi. Masukkan URL Web App pada modal Google Workspace.',
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as GasResponse<T>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    console.error('[BANUARASA GAS]', action, error);
    return {
      success: false,
      error: `Gagal menghubungi Google Apps Script: ${message}. Pastikan URL deployment berakhiran /exec.`,
    };
  }
}

export async function callGoogleAppsScript<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<GasResponse<T>> {
  return request<T>(action, payload);
}

export async function testGasConnection(): Promise<GasResponse> {
  const endpoint = getSavedGasUrl();
  if (!endpoint) {
    return { success: false, error: 'URL Google Apps Script belum dikonfigurasi.' };
  }

  try {
    const response = await fetch(`${endpoint}?action=ping`, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as GasResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, error: `Koneksi gagal: ${message}` };
  }
}

export async function fetchAllDataFromGas(): Promise<GasResponse> {
  const endpoint = getSavedGasUrl();
  if (!endpoint) return { success: false, error: 'URL Google Apps Script belum dikonfigurasi.' };

  try {
    const response = await fetch(`${endpoint}?action=getAllData`, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as GasResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, error: `Gagal mengambil data Google Sheets: ${message}` };
  }
}

/**
 * Sinkronisasi baris. Operasi dibuat fire-and-forget karena service storage
 * memanggilnya dari operasi UI yang bersifat sinkron.
 */
export function syncRowToSpreadsheet(
  sheetName: string,
  keyValue: string,
  data: object
): void {
  const actualSheet = SHEET_ALIASES[sheetName] || sheetName;
  const keyColumn =
    actualSheet === 'SHEET_ANGGOTA_KOPERASI' ? 'member_id' :
    actualSheet === 'SHEET_REGISTRASI_STAND' ? 'registration_id' :
    actualSheet === 'SHEET_PEMBAYARAN' ? 'payment_id' :
    actualSheet === 'SHEET_SIMPANAN' ? 'saving_id' :
    actualSheet === 'SHEET_OMZET_PENJUALAN' ? 'sales_report_id' :
    actualSheet === 'SHEET_DOKUMEN_LEGALITAS' ? 'document_id' :
    actualSheet === 'SHEET_PRODUK_UMKM' ? 'product_id' :
    actualSheet === 'SHEET_EVENT_MARKET' ? 'event_id' :
    actualSheet === 'SHEET_AUDIT_LOGS' ? 'log_id' : 'id';

  void request('upsertRow', {
    sheetName: actualSheet,
    keyColumn,
    keyValue,
    dataObj: { ...(data as Record<string, unknown>), [keyColumn]: keyValue },
  });
}

export const syncRowToSpreadsheetSafe = syncRowToSpreadsheet;

export function syncFileToGoogleDrive(payload: DriveUploadPayload): {
  fileId: string;
  driveUrl: string;
  directImageUrl?: string;
  folderPath?: string;
} {
  // Return a safe local fallback immediately. If the URL is a data URI,
  // it can also be uploaded asynchronously to Drive.
  const fallback = {
    fileId: '',
    driveUrl: payload.fileUrl || '',
    folderPath: payload.category || 'GENERAL',
  };

  void request('uploadFileToDrive', payload as unknown as Record<string, unknown>)
    .catch(() => undefined);

  return fallback;
}

export function deleteSpreadsheetRow(sheetName: string, keyValue: string): void {
  const actualSheet = SHEET_ALIASES[sheetName] || sheetName;
  const keyColumn =
    actualSheet === 'SHEET_ANGGOTA_KOPERASI' ? 'member_id' :
    actualSheet === 'SHEET_REGISTRASI_STAND' ? 'registration_id' :
    actualSheet === 'SHEET_PEMBAYARAN' ? 'payment_id' :
    actualSheet === 'SHEET_SIMPANAN' ? 'saving_id' :
    actualSheet === 'SHEET_OMZET_PENJUALAN' ? 'sales_report_id' :
    actualSheet === 'SHEET_DOKUMEN_LEGALITAS' ? 'document_id' :
    actualSheet === 'SHEET_PRODUK_UMKM' ? 'product_id' :
    actualSheet === 'SHEET_EVENT_MARKET' ? 'event_id' :
    actualSheet === 'SHEET_AUDIT_LOGS' ? 'log_id' : 'id';

  void request('deleteRow', {
    sheetName: actualSheet,
    keyColumn,
    keyValue,
  }).catch(() => undefined);
}

export const syncWithGoogleWorkspace = async () => testGasConnection();
export const pushStateToGAS = async () => ({ success: true });
export const pullStateFromGAS = async () => fetchAllDataFromGas();
export const getSyncStatus = () => ({ connected: !!getSavedGasUrl() });

export const googleWorkspaceSync = {
  getSavedGasUrl,
  saveGasUrl,
  callGoogleAppsScript,
  testGasConnection,
  fetchAllDataFromGas,
  syncRowToSpreadsheet: syncRowToSpreadsheetSafe,
  syncFileToGoogleDrive,
  deleteSpreadsheetRow,
  syncWithGoogleWorkspace,
  pushStateToGAS,
  pullStateFromGAS,
  getSyncStatus,
};
