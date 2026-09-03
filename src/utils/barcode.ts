import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export interface BarcodeData {
  member_id: string;
  nomor_anggota: string;
  nama_lengkap: string;
  nama_usaha: string;
  nik?: string;
  status?: string;
  verification_url?: string;
}

/**
 * Generate standard verification text encoded in barcode / QR code
 */
export function formatBarcodeValue(memberId: string): string {
  return memberId.trim().toUpperCase();
}

export function formatVerificationUrl(memberId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://banuarasa.web.app';
  return `${origin}/verify?id=${encodeURIComponent(memberId.trim().toUpperCase())}`;
}

/**
 * Render Barcode (Code 128) onto an SVG or Canvas element
 */
export function renderBarcodeToElement(
  element: SVGElement | HTMLCanvasElement,
  value: string,
  options?: {
    height?: number;
    width?: number;
    displayValue?: boolean;
    fontSize?: number;
    font?: string;
    background?: string;
    lineColor?: string;
    margin?: number;
  }
): boolean {
  try {
    JsBarcode(element, value, {
      format: 'CODE128',
      height: options?.height ?? 50,
      width: options?.width ?? 2,
      displayValue: options?.displayValue ?? true,
      fontSize: options?.fontSize ?? 12,
      font: options?.font ?? 'monospace',
      background: options?.background ?? '#ffffff',
      lineColor: options?.lineColor ?? '#0f172a',
      margin: options?.margin ?? 8,
    });
    return true;
  } catch (err) {
    console.error('Failed to render barcode:', err);
    return false;
  }
}

/**
 * Generate QR Code as Data URL
 */
export async function generateQrCodeDataUrl(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
  }
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options?.width ?? 240,
      margin: options?.margin ?? 1,
      color: {
        dark: options?.color?.dark ?? '#0f172a',
        light: options?.color?.light ?? '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return '';
  }
}
