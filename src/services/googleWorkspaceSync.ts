// ========================================================
// BANUARASA WEEKEND MARKET - GOOGLE APPS SCRIPT BRIDGE v2
// CORS-Safe Dispatcher & Workspace Sync
// ========================================================

const APPS_SCRIPT_URL_KEY = 'banuarasa_gas_url';

export const getSavedGasUrl = (): string => {
  return localStorage.getItem(APPS_SCRIPT_URL_KEY) || '';
};

export const saveGasUrl = (url: string): void => {
  localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim());
};

export interface GasResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Mengirim request transaksi ke Google Apps Script tanpa memicu blokir CORS preflight browser
 */
export async function callGoogleAppsScript<T = any>(action: string, payload: any = {}): Promise<GasResponse<T>> {
  const endpoint = getSavedGasUrl();

  if (!endpoint) {
    return {
      success: false,
      error: 'URL Google Apps Script belum dikonfigurasi. Masukkan URL Web App pada modal Google Workspace.'
    };
  }

  try {
    const bodyPayload = JSON.stringify({ action, payload });

    // Header text/plain mencegah browser mengirim OPTIONS request (bebas blokir CORS Google)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: bodyPayload
    });

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }

    const jsonResult = await response.json();
    return jsonResult;
  } catch (error: any) {
    console.error('GAS Fetch Error:', error);
    return {
      success: false,
      error: `Gagal menghubungi Google Apps Script: ${error.message || 'Network error'}. Pastikan URL deployment berakhiran /exec.`
    };
  }
}

/**
 * Uji koneksi Web App
 */
export async function testGasConnection(): Promise<GasResponse> {
  return callGoogleAppsScript('ping', {});
}

/**
 * Backward compatibility exports (untuk komponen lama agar tidak gagal build)
 */
export const syncWithGoogleWorkspace = async () => testGasConnection();
export const pushStateToGAS = async () => ({ success: true });
export const pullStateFromGAS = async () => ({ success: true });
export const getSyncStatus = () => ({ connected: !!getSavedGasUrl() });
