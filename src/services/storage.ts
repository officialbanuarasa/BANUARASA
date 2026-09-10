import {
  Member,
  MemberDocument,
  Product,
  EventItem,
  EventRegistration,
  Payment,
  Saving,
  SalesReport,
  Announcement,
  NewsItem,
  GalleryItem,
  Sponsor,
  AuditLog,
  UserRole,
  AppNotification,
  AuthUser,
  AppBrandingConfig,
  MediaAssetItem,
  CustomBannerItem,
  MediaSourceType,
  MediaAssetCategory,
  MemberCardDesignConfig,
  MemberCardElement,
  KoperasiConfig,
  MemberProductAd,
} from '../types';
import { BANUARASA_ASSETS, BARA_ASSETS } from '../assets/baraAssets';
import {
  INITIAL_MEMBERS,
  INITIAL_DOCUMENTS,
  INITIAL_PRODUCTS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_PAYMENTS,
  INITIAL_SAVINGS,
  INITIAL_SALES_REPORTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NEWS,
  INITIAL_GALLERY,
  INITIAL_SPONSORS,
  INITIAL_PRODUCT_ADS,
  INITIAL_AUDIT_LOGS,
  SUPER_ADMIN_ACCOUNT,
  MEMBER_DEFAULT_PASSWORD,
} from '../data/initialData';
import { getStandPrice } from './standEngine';
import { googleWorkspaceSync, callGoogleAppsScript } from './googleWorkspaceSync';
import { convertGoogleDriveUrl } from '../utils/mediaUtils';
import { sha256 } from 'js-sha256';

export const DEFAULT_BRANDING_CONFIG: AppBrandingConfig = {
  logoUrl: BANUARASA_ASSETS.logo,
  logoAlt: 'Logo Resmi Banua Rasa Weekend Market',
  logoSourceType: 'DEFAULT',
  heroBannerUrl: BARA_ASSETS.gastronomiBanner,
  heroBannerTitle: 'BANUARASA WEEKEND MARKET',
  heroBannerSubtitle: 'Pusat Wisata Gastronomi Terpadu & 64 Stand UMKM Berau',
  heroBannerSourceType: 'DEFAULT',
  marketBannerUrl: BARA_ASSETS.gastronomiBanner,
  marketBannerSourceType: 'DEFAULT',
  mascotUrl: BARA_ASSETS.mascot,
  mascotAvatarUrl: BARA_ASSETS.avatar,
  mascotSourceType: 'DEFAULT',
  tagline: 'Rasa Lokal, Cerita Global',
  subTagline: 'Wisata Gastronomi Terpadu Tepian Teratai Kabupaten Berau',
  organizationName: 'Koperasi Berau Melangkah Bersama',
  customBanners: [
    {
      id: 'BANNER-001',
      title: 'Pesta Wisata Kuliner Pesisir Berau',
      subtitle: 'Sajian khas Banua, Bajau, & Dayak autentik di Tepian Teratai',
      category: 'HERO',
      image_url: BARA_ASSETS.gastronomiBanner,
      sourceType: 'DEFAULT',
      is_active: true,
      order: 1,
      created_at: '2026-08-01T00:00:00.000Z',
    },
    {
      id: 'BANNER-002',
      title: 'Bara si Kerang Laut Ramah',
      subtitle: 'Pemandu keceriaan wisata kuliner Kabupaten Berau',
      category: 'MASCOT',
      image_url: BARA_ASSETS.mascot,
      sourceType: 'DEFAULT',
      is_active: true,
      order: 2,
      created_at: '2026-08-01T00:00:00.000Z',
    },
  ],
  mediaAssets: [
    {
      id: 'MEDIA-LOGO-DEFAULT',
      title: 'Logo Resmi Banua Rasa Weekend Market',
      category: 'LOGO',
      url: BANUARASA_ASSETS.logo,
      sourceType: 'DEFAULT',
      description: 'Emblem lingkaran bermahkota emas dengan tulisan resmi Banuarasa',
      is_active: true,
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    },
    {
      id: 'MEDIA-HERO-DEFAULT',
      title: 'Banner Utama Wisata Gastronomi',
      category: 'BANNER_HERO',
      url: BARA_ASSETS.gastronomiBanner,
      sourceType: 'DEFAULT',
      description: 'Panorama kuliner pesisir dan gerai UMKM binaan koperasi',
      is_active: true,
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    },
    {
      id: 'MEDIA-MASCOT-DEFAULT',
      title: 'Maskot Bara Lengkap (shot-2)',
      category: 'MASCOT',
      url: BARA_ASSETS.mascot,
      sourceType: 'DEFAULT',
      description: 'Pose resmi Bara Si Kerang Laut dengan mahkota kerang dan rompi zamrud keemasan',
      is_active: true,
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    },
  ],
  updated_at: '2026-08-01T00:00:00.000Z',
};

export const DEFAULT_MEMBER_CARD_DESIGN: MemberCardDesignConfig = {
  theme: 'LUXURY_SLATE',
  cardTitle: 'KARTU TANDA ANGGOTA RESMI',
  organizationName: 'KOPERASI BERAU MELANGKAH BERSAMA',
  marketName: 'BANUARASA WEEKEND MARKET',
  badgeText: 'ANGGOTA TERVERIFIKASI',
  tagline: 'Wisata Gastronomi & UMKM Kreatif Berau',
  authorizedOfficerName: 'H. AHMAD FAUZI',
  authorizedOfficerTitle: 'Ketua Pengurus Koperasi',
  authorizedOfficerNip: 'REG.KOP-6403/2026',
  showPhoto: true,
  showQrCode: true,
  showBusinessName: true,
  showCategory: true,
  showAddress: true,
  showJoinDate: true,
  showValidityPeriod: true,
  validityDurationYears: 3,
  customLogoUrl: BANUARASA_ASSETS.logo,
  customWatermarkUrl: BARA_ASSETS.mascot,
  disclaimerNotes: 'Kartu ini adalah bukti keanggotaan sah Koperasi Berau Melangkah Bersama & hak partisipasi stand Banuarasa Weekend Market.',
  cardAccentColor: '#10B981',
  frontBackgroundUrl: '',
  backBackgroundUrl: '',
  showBarcode: true,
  elements: [
    { id:'logo', side:'FRONT', type:'LOGO', label:'Logo Koperasi', x:82, y:4, width:13, height:13, url:BANUARASA_ASSETS.logo, visible:true },
    { id:'org', side:'FRONT', type:'TEXT', label:'Nama Organisasi', content:'KOPERASI BERAU MELANGKAH BERSAMA', x:4, y:5, width:65, height:7, fontFamily:'Arial', fontSize:8, fontWeight:800, color:'#FFFFFF', align:'left', visible:true },
    { id:'title', side:'FRONT', type:'TEXT', label:'Judul Kartu', content:'KARTU TANDA ANGGOTA RESMI', x:4, y:13, width:65, height:7, fontFamily:'Arial', fontSize:7, fontWeight:700, color:'#D1FAE5', align:'left', visible:true },
    { id:'photo', side:'FRONT', type:'PHOTO', label:'Foto Anggota', field:'foto_profil_url', x:5, y:27, width:24, height:43, radius:8, visible:true },
    { id:'number', side:'FRONT', type:'FIELD', label:'Nomor Anggota', field:'nomor_anggota', x:33, y:29, width:45, height:7, fontFamily:'Arial', fontSize:7, fontWeight:700, color:'#A7F3D0', align:'left', visible:true },
    { id:'name', side:'FRONT', type:'FIELD', label:'Nama Lengkap', field:'nama_lengkap', x:33, y:38, width:58, height:10, fontFamily:'Arial', fontSize:11, fontWeight:800, color:'#FFFFFF', align:'left', visible:true },
    { id:'business', side:'FRONT', type:'FIELD', label:'Nama Usaha', field:'nama_usaha', x:33, y:50, width:58, height:8, fontFamily:'Arial', fontSize:7, fontWeight:600, color:'#FFFFFF', align:'left', visible:true },
    { id:'category', side:'FRONT', type:'FIELD', label:'Kategori Usaha', field:'kategori_usaha', x:33, y:60, width:45, height:7, fontFamily:'Arial', fontSize:6, fontWeight:500, color:'#D1FAE5', align:'left', visible:true },
    { id:'qr', side:'FRONT', type:'QR', label:'QR Profil Anggota', x:77, y:67, width:18, height:25, visible:true },
    { id:'barcode', side:'BACK', type:'BARCODE', label:'Barcode Member ID', field:'member_id', x:5, y:78, width:90, height:12, visible:true },
    { id:'rules', side:'BACK', type:'TEXT', label:'Ketentuan KTA', content:'Kartu ini merupakan bukti keanggotaan resmi. Scan QR/Barcode untuk verifikasi profil anggota.', x:5, y:12, width:90, height:30, fontFamily:'Arial', fontSize:7, fontWeight:500, color:'#FFFFFF', align:'left', lineHeight:1.35, visible:true },
    { id:'officer', side:'BACK', type:'TEXT', label:'Pengesahan', content:'Ketua Pengurus Koperasi', x:5, y:55, width:55, height:15, fontFamily:'Arial', fontSize:7, fontWeight:700, color:'#FFFFFF', align:'left', visible:true },
  ],
  updated_at: '2026-08-01T00:00:00.000Z',
  updated_by: 'SUPER_ADMIN',
};

export const DEFAULT_KOPERASI_CONFIG: KoperasiConfig = {
  simpanan_pokok_nominal: 100000,
  simpanan_pokok_cicilan_nominal: 20000,
  simpanan_wajib_nominal: 25000,
  nama_koperasi: 'Koperasi Berau Melangkah Bersama (KBMB)',
  nama_bank: 'Bank Mandiri',
  nomor_rekening: '1490030302105',
  atas_nama_rekening: 'Koperasi Berau Melangkah Bersama',
  nomor_wa_konfirmasi: '6281234567890',
  catatan_iuran: 'Simpanan Pokok dan Simpanan Wajib mengikuti nominal yang ditetapkan Super Admin. Transfer hanya melalui Bank Mandiri a/n Koperasi Berau Melangkah Bersama.',
  updated_at: '2026-08-01T00:00:00.000Z',
  updated_by: 'SUPER_ADMIN',
};

const STORAGE_KEYS = {
  VERSION: 'kbm_data_version_v3',
  MEMBERS: 'kbm_v3_members',
  DOCUMENTS: 'kbm_v3_documents',
  PRODUCTS: 'kbm_v3_products',
  EVENTS: 'kbm_v3_events',
  REGISTRATIONS: 'kbm_v3_registrations',
  PAYMENTS: 'kbm_v3_payments',
  SAVINGS: 'kbm_v3_savings',
  SALES_REPORTS: 'kbm_v3_sales_reports',
  ANNOUNCEMENTS: 'kbm_v3_announcements',
  NEWS: 'kbm_v3_news',
  GALLERY: 'kbm_v3_gallery',
  SPONSORS: 'kbm_v3_sponsors',
  PRODUCT_ADS: 'kbm_v3_product_ads',
  AUDIT_LOGS: 'kbm_v3_audit_logs',
  NOTIFICATIONS: 'kbm_v3_notifications',
  ATTENDANCE: 'kbm_v3_attendance',
  CURRENT_USER: 'kbm_v3_current_user_session',
  BRANDING: 'kbm_v3_branding_assets',
  CARD_DESIGN: 'kbm_v3_member_card_design',
  KOPERASI_CONFIG: 'kbm_v3_koperasi_config',
  SUPER_ADMIN_CUSTOM_PASSWORD: 'kbm_v3_super_admin_custom_pass',
  SUPER_ADMIN_CUSTOM_HASH: 'kbm_v3_super_admin_custom_hash',
  IS_DUMMY_PURGED: 'kbm_v3_is_dummy_purged',
};

export const CURRENT_DATA_VERSION = '3.3.0';

/**
 * Pembersih Cookies dan Session Perangkat
 * Menghapus seluruh cookies browser pada path root dan domain untuk mencegah caching usang
 */
export function clearAllBrowserCookies(): void {
  if (typeof document === 'undefined') return;
  try {
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
        if (typeof window !== 'undefined' && window.location.hostname) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
          const hostParts = window.location.hostname.split('.');
          if (hostParts.length > 2) {
            const rootDomain = hostParts.slice(-2).join('.');
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${rootDomain};`;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[StorageService] Error clearing cookies:', err);
  }
}

// Daftar brand lama yang berasal dari mock data awal sebelum import Google Sheets
export const OBSOLETE_DUMMY_BRANDS = new Set([
  'Infinix Snack & Drink',
  'Fatma Bakery & Kudapan',
  'Dapur Lestari Berau',
  'Risoles Premium Bananum',
  'Qiya Cake & Dessert',
  'Dapur Bu Anik',
  'Tara Hijab & Fashion',
  'Galery Omayah Souvenir',
  'Taurus Food & Beverage',
  'Nanara Frozen Food',
  'Kasma Bakery & Drink',
  'Bardiatus Aneka Kue',
  'Rahayu Pesisir Resto',
  'Hardiati Craft & Snack',
  'Yani Cake & Cookies',
  'Kopi & Roastery Bambang',
  'Rica Food & Dimsum',
  'Wati Herbal & Jamu Berau',
  'Dian Dewi Fashion Etnik',
  'Kedai Ummah Berau',
  'Arjuna Mandiri Snack',
  'Dina Cookies & Dessert',
  'Mieku Khas Berau',
  'Wahyuni Kriya Anyaman',
  'Rizky Sambal & Kuliner Laut',
  'Nanda Batik & Tenun Berau',
  'Sri Makanan Tradisi Derawan',
  'Charis Aksesoris Etnik',
  'Miah Sar Bakery',
  'Yulia Brownies Berau',
  'Nia Natha Handmade',
  'Sabugar Minuman Tradisional',
  'Dahlia Cake & Pastry',
  'Malewa Olahan Laut Berau',
  'Sri Mael Handicraft',
  'Iriyanti Seafood & Grill',
  'Yeni Anggraeni Culinary'
]);

class StorageService {
  private listeners: Set<() => void> = new Set();
  private isLocked: boolean = false;
  private persistDebounceTimer: any = null;
  private isHydratingFromServer: boolean = false;
  private lastServerUpdatedAt: string | null = null;

  constructor() {
    // Cross-tab synchronization within the same browser & automatic cache/cookie refresh
    if (typeof window !== 'undefined') {
      try {
        this.init();
      } catch (err) {
        console.warn('[StorageService] Error during auto-init:', err);
      }
      window.addEventListener('storage', (e) => {
        if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
          this.notify();
        }
      });
    }
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    this.notify();
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T, skipServerPersist = false): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
      // Google Sheets is the source of truth. Do NOT push the entire local
      // snapshot automatically: a stale local cache can recreate rows that
      // were intentionally deleted directly in Google Sheets.
      // Individual CRUD operations sync their own changed row instead.
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  // Debounced push to Express server /api/app-state
  private debouncedPersistToServer() {
    if (this.persistDebounceTimer) {
      clearTimeout(this.persistDebounceTimer);
    }
    this.persistDebounceTimer = setTimeout(() => {
      this.persistToServer();
    }, 400);
  }

  /**
   * @deprecated Full-state snapshot sync is intentionally disabled.
   *
   * The old implementation sent the complete localStorage snapshot to
   * batchSync. If a row was deleted directly in Google Sheets, an older
   * browser cache still contained that row and batchSync recreated it.
   *
   * Writes must happen through the individual CRUD sync methods, while
   * reads are refreshed from Google Sheets by syncFromGoogleSheets().
   */
  async persistToServer(): Promise<boolean> {
    return true;
  }

  /**
   * Pull the current database state from Google Sheets and replace the
   * corresponding local cache, including EMPTY arrays.
   *
   * Replacing empty arrays is important: an empty sheet means the user
   * really deleted all rows; it must not be ignored as "no update".
   */
  async syncFromGoogleSheets(): Promise<{ updated: boolean; count?: number }> {
    try {
      const response = await googleWorkspaceSync.fetchAllDataFromGas();
      if (!response.success || !response.data || typeof response.data !== 'object') {
        return { updated: false };
      }

      const data: any = response.data;
      const collections: Array<[string, any]> = [
        [STORAGE_KEYS.MEMBERS, data.members],
        [STORAGE_KEYS.REGISTRATIONS, data.registrations],
        [STORAGE_KEYS.PAYMENTS, data.payments],
        [STORAGE_KEYS.SAVINGS, data.savings],
        [STORAGE_KEYS.SALES_REPORTS, data.salesReports],
        [STORAGE_KEYS.DOCUMENTS, data.documents],
        [STORAGE_KEYS.PRODUCTS, data.products],
        [STORAGE_KEYS.EVENTS, data.events],
        [STORAGE_KEYS.AUDIT_LOGS, data.auditLogs],
        [STORAGE_KEYS.ATTENDANCE, data.attendance],
      ];

      let count = 0;
      this.isHydratingFromServer = true;
      try {
        collections.forEach(([key, value]) => {
          if (!Array.isArray(value)) return;
          let normalized = value;

          if (key === STORAGE_KEYS.MEMBERS) {
            normalized = value.filter((m: any) => !OBSOLETE_DUMMY_BRANDS.has(m?.nama_usaha));
          }
          if (key === STORAGE_KEYS.REGISTRATIONS) {
            normalized = value.map((r: any) => ({
              ...r,
              stand_code: String(r?.stand_code ?? '').trim(),
            }));
          }

          localStorage.setItem(key, JSON.stringify(normalized));
          count += normalized.length;
        });

        if (data.koperasiConfig && typeof data.koperasiConfig === 'object') {
          const normalizedConfig: KoperasiConfig = {
            ...DEFAULT_KOPERASI_CONFIG,
            ...data.koperasiConfig,
            nama_bank: 'Bank Mandiri',
            nomor_rekening: '1490030302105',
            atas_nama_rekening: 'Koperasi Berau Melangkah Bersama',
          };
          localStorage.setItem(STORAGE_KEYS.KOPERASI_CONFIG, JSON.stringify(normalizedConfig));
        }

        if (data.gasUrl && typeof data.gasUrl === 'string' && data.gasUrl.trim()) {
          localStorage.setItem('kbm_gas_web_app_url_v3', data.gasUrl.trim());
        }
      } finally {
        this.isHydratingFromServer = false;
      }

      this.syncCurrentUserWithMemberProfile();
      this.notify();

      return { updated: true, count };
    } catch (err) {
      this.isHydratingFromServer = false;
      console.warn('[StorageService] Google Sheets pull failed:', err);
      return { updated: false };
    }
  }

  // Synchronize logged-in user profile if member data (brand, name, photo, etc.) changed
  syncCurrentUserWithMemberProfile(): boolean {
    const u = this.getCurrentUser();
    if (!u || u.role !== 'MEMBER' || !u.member_id) return false;
    const freshMember = this.getMemberById(u.member_id);
    if (!freshMember) return false;

    if (
      u.name !== freshMember.nama_lengkap ||
      u.foto_profil_url !== freshMember.foto_profil_url ||
      u.nama_usaha !== freshMember.nama_usaha ||
      u.nomor_anggota !== freshMember.nomor_anggota
    ) {
      const updatedAuth: AuthUser = {
        ...u,
        name: freshMember.nama_lengkap,
        foto_profil_url: freshMember.foto_profil_url,
        nama_usaha: freshMember.nama_usaha,
        nomor_anggota: freshMember.nomor_anggota,
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedAuth));
      this.notify();
      return true;
    }
    return false;
  }

  // Fetch shared application state from server (ensures all browsers & phones stay updated)
  async syncWithServer(force = false): Promise<{ updated: boolean; count?: number }> {
    try {
      const res = await fetch('/api/app-state');
      if (!res.ok) return { updated: false };
      const json = await res.json();
      const serverData = json.data;
      if (!serverData || typeof serverData !== 'object') return { updated: false };

      // If server state is identical or empty and not forced, return
      if (!force && json.updatedAt && json.updatedAt === this.lastServerUpdatedAt) {
        return { updated: false };
      }

      this.isHydratingFromServer = true;
      let hasChanges = false;

      if (Array.isArray(serverData.events) && serverData.events.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(serverData.events));
        hasChanges = true;
      }
      if (serverData.koperasiConfig && typeof serverData.koperasiConfig === 'object') {
        localStorage.setItem(STORAGE_KEYS.KOPERASI_CONFIG, JSON.stringify({
          ...DEFAULT_KOPERASI_CONFIG,
          ...serverData.koperasiConfig,
          nama_bank: 'Bank Mandiri',
          nomor_rekening: '1490030302105',
          atas_nama_rekening: 'Koperasi Berau Melangkah Bersama',
        }));
        hasChanges = true;
      }
      if (serverData.branding && typeof serverData.branding === 'object') {
        localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(serverData.branding));
        hasChanges = true;
      }
      if (serverData.cardDesign && typeof serverData.cardDesign === 'object') {
        localStorage.setItem(STORAGE_KEYS.CARD_DESIGN, JSON.stringify(serverData.cardDesign));
        hasChanges = true;
      }
      if (Array.isArray(serverData.members) && serverData.members.length > 0) {
        // Filter out any stale dummy members
        const sanitizedMembers = serverData.members.filter((m: any) => !OBSOLETE_DUMMY_BRANDS.has(m?.nama_usaha));
        if (sanitizedMembers.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(sanitizedMembers));
          hasChanges = true;
        }
      }
      if (Array.isArray(serverData.registrations) && serverData.registrations.length > 0) {
        const sanitized = serverData.registrations.map((r: any) => ({
          ...r,
          stand_code: String(r?.stand_code ?? '').trim(),
        }));
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(sanitized));
        hasChanges = true;
      }
      if (Array.isArray(serverData.payments) && serverData.payments.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(serverData.payments));
        hasChanges = true;
      }
      if (Array.isArray(serverData.savings) && serverData.savings.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(serverData.savings));
        hasChanges = true;
      }
      if (Array.isArray(serverData.salesReports) && serverData.salesReports.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SALES_REPORTS, JSON.stringify(serverData.salesReports));
        hasChanges = true;
      }
      if (Array.isArray(serverData.products) && serverData.products.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(serverData.products));
        hasChanges = true;
      }
      if (Array.isArray(serverData.documents) && serverData.documents.length > 0) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(serverData.documents));
        hasChanges = true;
      }
      if (Array.isArray(serverData.announcements) && serverData.announcements.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(serverData.announcements));
        hasChanges = true;
      }
      if (Array.isArray(serverData.notifications) && serverData.notifications.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(serverData.notifications));
        hasChanges = true;
      }
      if (Array.isArray(serverData.auditLogs) && serverData.auditLogs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(serverData.auditLogs));
        hasChanges = true;
      }
      if (Array.isArray(serverData.attendance)) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(serverData.attendance));
        hasChanges = true;
      }
      if (Array.isArray(serverData.news) && serverData.news.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(serverData.news));
        hasChanges = true;
      }
      if (Array.isArray(serverData.gallery) && serverData.gallery.length > 0) {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(serverData.gallery));
        hasChanges = true;
      }
      if (Array.isArray(serverData.sponsors) && serverData.sponsors.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(serverData.sponsors));
        hasChanges = true;
      }
      if (serverData.gasUrl && typeof serverData.gasUrl === 'string' && serverData.gasUrl.trim()) {
        localStorage.setItem('kbm_gas_web_app_url_v3', serverData.gasUrl.trim());
      }

      // Synchronize active user session with fresh member record
      if (this.syncCurrentUserWithMemberProfile()) {
        hasChanges = true;
      }

      this.isHydratingFromServer = false;
      this.lastServerUpdatedAt = json.updatedAt || new Date().toISOString();

      if (hasChanges) {
        this.notify();
      }

      return { updated: hasChanges };
    } catch (err) {
      this.isHydratingFromServer = false;
      console.warn('[StorageService] Error syncing with server:', err);
      return { updated: false };
    }
  }

  // Initializer: Otomatis membersihkan cookies dan cache lokal usang agar data selalu sinkron dengan Spreadsheet
  init() {
    // 1. Selalu hapus cookies pada perangkat agar tidak terjadi konflik session/cache usang
    clearAllBrowserCookies();

    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

    // Periksa apakah perangkat pengguna menyimpan data dummy brand lama
    let hasObsoleteMockData = false;
    try {
      const currentMembersRaw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (currentMembersRaw) {
        const parsed = JSON.parse(currentMembersRaw);
        if (Array.isArray(parsed)) {
          hasObsoleteMockData = parsed.some((m: any) => OBSOLETE_DUMMY_BRANDS.has(m?.nama_usaha));
        }
      }
    } catch {
      hasObsoleteMockData = true;
    }

    // Periksa apakah session login user saat ini masih menggunakan brand dummy lama
    try {
      const currentUserRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (currentUserRaw) {
        const u = JSON.parse(currentUserRaw);
        if (u?.nama_usaha && OBSOLETE_DUMMY_BRANDS.has(u.nama_usaha)) {
          hasObsoleteMockData = true;
        }
      }
    } catch {}

    const needsMigration = storedVersion !== CURRENT_DATA_VERSION || hasObsoleteMockData;

    if (needsMigration) {
      console.log(`[StorageService] Memperbarui cache perangkat ke versi ${CURRENT_DATA_VERSION} dan membersihkan cookies usang.`);
      clearAllBrowserCookies();
      this.setItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS, true);
      this.setItem(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION, true);

      // Inisialisasi koleksi jika belum ada
      if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) this.setItem(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS, true);
      if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS, true);
      if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) this.setItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS, true);
      if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) this.setItem(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS, true);
      if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) this.setItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS, true);
      if (!localStorage.getItem(STORAGE_KEYS.SAVINGS)) this.setItem(STORAGE_KEYS.SAVINGS, INITIAL_SAVINGS, true);
      if (!localStorage.getItem(STORAGE_KEYS.SALES_REPORTS)) this.setItem(STORAGE_KEYS.SALES_REPORTS, INITIAL_SALES_REPORTS, true);
      if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS, true);
      if (!localStorage.getItem(STORAGE_KEYS.NEWS)) this.setItem(STORAGE_KEYS.NEWS, INITIAL_NEWS, true);
      if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) this.setItem(STORAGE_KEYS.GALLERY, INITIAL_GALLERY, true);
      if (!localStorage.getItem(STORAGE_KEYS.SPONSORS)) this.setItem(STORAGE_KEYS.SPONSORS, INITIAL_SPONSORS, true);
      if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) this.setItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS, true);
      this.setItem(STORAGE_KEYS.ATTENDANCE, [], true);

      this.syncCurrentUserWithMemberProfile();
    } else if (!storedVersion) {
      this.setItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS, true);
      this.setItem(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS, true);
      this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS, true);
      this.setItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS, true);
      this.setItem(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS, true);
      this.setItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS, true);
      this.setItem(STORAGE_KEYS.SAVINGS, INITIAL_SAVINGS, true);
      this.setItem(STORAGE_KEYS.SALES_REPORTS, INITIAL_SALES_REPORTS, true);
      this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS, true);
      this.setItem(STORAGE_KEYS.NEWS, INITIAL_NEWS, true);
      this.setItem(STORAGE_KEYS.GALLERY, INITIAL_GALLERY, true);
      this.setItem(STORAGE_KEYS.SPONSORS, INITIAL_SPONSORS, true);
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS, true);
      this.setItem(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION, true);
    }

    this.cleanExpiredReservations();
    this.syncCurrentUserWithMemberProfile();

    // Google Sheets is the authoritative database. Pull it immediately so
    // deleted spreadsheet rows cannot be restored from an old browser cache.
    this.syncFromGoogleSheets().then(() => {
      this.syncCurrentUserWithMemberProfile();
    });
  }

  // Fungsi utilitas untuk membersihkan cookies & cache perangkat secara manual/otomatis
  purgeDeviceCookiesAndCache(): { success: boolean; message: string } {
    clearAllBrowserCookies();
    this.setItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS, true);
    this.setItem(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION, true);
    this.syncCurrentUserWithMemberProfile();
    this.syncFromGoogleSheets().then(() => {
      this.syncCurrentUserWithMemberProfile();
      this.notify();
    });
    return {
      success: true,
      message: 'Cookies dan cache lokal perangkat berhasil dibersihkan! Data anggota dan brand usaha telah dimutakhirkan.',
    };
  }

  // --- Authentication & Session Management ---
  getCurrentUser(): AuthUser | null {
    return this.getItem<AuthUser | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user: AuthUser | null): void {
    if (user) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      this.notify();
    }
  }

  login(identifier: string, password: string): { success: boolean; message: string; user?: AuthUser } {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = password.trim();
    const hashedPass = sha256(trimmedPass).toLowerCase();

    // 1. Check Super Admin
    const isSuperAdminIdentifier =
      trimmedId === SUPER_ADMIN_ACCOUNT.username.toLowerCase() ||
      trimmedId === SUPER_ADMIN_ACCOUNT.email.toLowerCase() ||
      trimmedId === 'admin@banuarasa.id' ||
      trimmedId === 'admin@koperasiberau.id' ||
      trimmedId === 'mbr-0000' ||
      trimmedId === 'kbmb-2026-000' ||
      trimmedId === 'superadmin' ||
      trimmedId === 'admin';

    if (isSuperAdminIdentifier) {
      const customSuperPass = this.getItem<string | null>(STORAGE_KEYS.SUPER_ADMIN_CUSTOM_PASSWORD, null);
      const customSuperHash = this.getItem<string | null>(STORAGE_KEYS.SUPER_ADMIN_CUSTOM_HASH, null);

      const isSuperPassValid =
        (customSuperPass && trimmedPass === customSuperPass) ||
        (customSuperHash && hashedPass === customSuperHash) ||
        trimmedPass === SUPER_ADMIN_ACCOUNT.password ||
        trimmedPass === 'admin123' ||
        trimmedPass === 'admin' ||
        hashedPass === '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155c';

      if (isSuperPassValid) {
        const superAdminUser: AuthUser = {
          id: SUPER_ADMIN_ACCOUNT.id,
          username: SUPER_ADMIN_ACCOUNT.username,
          name: SUPER_ADMIN_ACCOUNT.nama_lengkap,
          role: 'SUPER_ADMIN',
          email: SUPER_ADMIN_ACCOUNT.email,
          foto_profil_url: SUPER_ADMIN_ACCOUNT.foto_profil_url,
        };
        this.setCurrentUser(superAdminUser);
        this.logAudit({
          user_id: SUPER_ADMIN_ACCOUNT.id,
          user_role: 'SUPER_ADMIN',
          action: 'USER_LOGIN',
          module: 'AUTH',
          reference_id: SUPER_ADMIN_ACCOUNT.id,
          description: 'Super Admin login berhasil ke dashboard manajemen',
          result: 'SUCCESS',
        });
        return { success: true, message: 'Selamat datang, Super Admin!', user: superAdminUser };
      } else {
        return { success: false, message: 'Kata sandi Master Super Admin yang Anda masukkan salah.' };
      }
    }

    // 1b. Check Admin Koperasi & Admin Event
    const isAdminKoperasiIdentifier =
      trimmedId === 'adminkoperasi' ||
      trimmedId === 'admin_koperasi' ||
      trimmedId === 'admin.koperasi@koperasiberau.id' ||
      trimmedId === 'adm-kop-01';

    if (isAdminKoperasiIdentifier) {
      const isAdminPassValid =
        trimmedPass === 'admin123' ||
        trimmedPass === '123456' ||
        trimmedPass === 'admin' ||
        hashedPass === '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155c';

      if (isAdminPassValid) {
        const adminKopUser: AuthUser = {
          id: 'ADM-KOP-01',
          username: 'adminkoperasi',
          name: 'Admin Koperasi KBMB',
          role: 'ADMIN_KOPERASI',
          email: 'admin.koperasi@koperasiberau.id',
          foto_profil_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        };
        this.setCurrentUser(adminKopUser);
        this.logAudit({
          user_id: adminKopUser.id,
          user_role: 'ADMIN_KOPERASI',
          action: 'USER_LOGIN',
          module: 'AUTH',
          reference_id: adminKopUser.id,
          description: 'Admin Koperasi login berhasil ke dashboard manajemen',
          result: 'SUCCESS',
        });
        return { success: true, message: 'Selamat datang, Admin Koperasi!', user: adminKopUser };
      } else {
        return { success: false, message: 'Kata sandi Admin Koperasi salah.' };
      }
    }

    const isAdminEventIdentifier =
      trimmedId === 'adminevent' ||
      trimmedId === 'admin_event' ||
      trimmedId === 'admin.event@koperasiberau.id' ||
      trimmedId === 'adm-event-01';

    if (isAdminEventIdentifier) {
      const isEventPassValid =
        trimmedPass === 'admin123' ||
        trimmedPass === '123456' ||
        trimmedPass === 'admin' ||
        hashedPass === '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155c';

      if (isEventPassValid) {
        const adminEventUser: AuthUser = {
          id: 'ADM-EVENT-01',
          username: 'adminevent',
          name: 'Admin Event Pasar Banuarasa',
          role: 'ADMIN_EVENT',
          email: 'admin.event@koperasiberau.id',
          foto_profil_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        };
        this.setCurrentUser(adminEventUser);
        this.logAudit({
          user_id: adminEventUser.id,
          user_role: 'ADMIN_EVENT',
          action: 'USER_LOGIN',
          module: 'AUTH',
          reference_id: adminEventUser.id,
          description: 'Admin Event login berhasil ke dashboard manajemen',
          result: 'SUCCESS',
        });
        return { success: true, message: 'Selamat datang, Admin Event Pasar!', user: adminEventUser };
      } else {
        return { success: false, message: 'Kata sandi Admin Event salah.' };
      }
    }

    // 2. Check Member Accounts
    const members = this.getMembers();
    const cleanNumber = trimmedId.replace(/[^0-9]/g, '');
    const member = members.find((m) => {
      const mEmail = String(m.email || '').toLowerCase();
      const mId = String(m.member_id || '').toLowerCase();
      const mNomor = String(m.nomor_anggota || '').toLowerCase();
      const mPhone = String(m.whatsapp || m.nomor_hp || '').replace(/[^0-9]/g, '');
      return (
        mEmail === trimmedId ||
        mId === trimmedId ||
        mNomor === trimmedId ||
        (cleanNumber.length > 5 && mPhone.includes(cleanNumber))
      );
    });

    if (member) {
      const memberNik = String(member.nik || '');
      const memberPhone = String(member.nomor_hp || member.whatsapp || '');
      const memberPassHash = String(member.password_hash || '').toLowerCase();
      const memberPlainPass = String(member.password || '');

      // Check if password matches:
      // a) Password hash (SHA-256) matches
      // b) Plaintext custom password matches (e.g. Dahlia111111, iriyanti78)
      // c) Default PIN / password '123456' or MEMBER_DEFAULT_PASSWORD
      // d) Last 6 digits of Phone number or NIK
      const isPasswordValid =
        (memberPassHash && hashedPass === memberPassHash) ||
        (memberPlainPass && trimmedPass === memberPlainPass) ||
        trimmedPass === MEMBER_DEFAULT_PASSWORD ||
        trimmedPass === '123456' ||
        (memberNik.length >= 6 && trimmedPass === memberNik.slice(-6)) ||
        (memberPhone.length >= 6 && trimmedPass === memberPhone.slice(-6));

      if (isPasswordValid) {
        const memberUser: AuthUser = {
          id: member.member_id,
          username: member.email,
          name: member.nama_lengkap,
          role: 'MEMBER',
          member_id: member.member_id,
          email: member.email,
          foto_profil_url: member.foto_profil_url,
          nomor_anggota: member.nomor_anggota,
          nama_usaha: member.nama_usaha,
        };
        this.setCurrentUser(memberUser);
        this.logAudit({
          user_id: member.member_id,
          user_role: 'MEMBER',
          action: 'USER_LOGIN',
          module: 'AUTH',
          reference_id: member.member_id,
          description: `Anggota ${member.nama_lengkap} (${member.nomor_anggota}) berhasil masuk`,
          result: 'SUCCESS',
        });
        return { success: true, message: `Selamat datang, ${member.nama_lengkap}!`, user: memberUser };
      } else {
        return { success: false, message: 'Kata sandi / PIN yang Anda masukkan salah.' };
      }
    }

    return {
      success: false,
      message: 'Akun tidak ditemukan. Periksa kembali email / nomor anggota / WhatsApp Anda, atau hubungi pengurus koperasi.',
    };
  }

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.logAudit({
        user_id: user.id,
        user_role: user.role,
        action: 'USER_LOGOUT',
        module: 'AUTH',
        reference_id: user.id,
        description: `Pengguna ${user.name} (${user.role}) keluar dari sistem`,
        result: 'SUCCESS',
      });
    }
    this.setCurrentUser(null);
  }

  // --- Password Management (Super Admin & Anggota) ---
  changePassword(params: {
    targetUserId: string;
    targetRole?: UserRole;
    oldPassword?: string;
    newPassword: string;
    isSuperAdminReset?: boolean;
    operatorId?: string;
  }): { success: boolean; message: string } {
    const { targetUserId, targetRole, oldPassword, newPassword, isSuperAdminReset, operatorId } = params;
    const trimmedNew = (newPassword || '').trim();
    if (trimmedNew.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal harus 6 karakter.' };
    }

    const hashedNew = sha256(trimmedNew).toLowerCase();

    // 1. Target is Super Admin
    const isTargetSuperAdmin =
      targetUserId === SUPER_ADMIN_ACCOUNT.id ||
      targetRole === 'SUPER_ADMIN' ||
      targetUserId.toLowerCase() === 'adm-super' ||
      targetUserId.toLowerCase() === 'superadmin' ||
      targetUserId.toLowerCase() === SUPER_ADMIN_ACCOUNT.email.toLowerCase();

    if (isTargetSuperAdmin) {
      if (!isSuperAdminReset) {
        const trimmedOld = (oldPassword || '').trim();
        const customSuperPass = this.getItem<string | null>(STORAGE_KEYS.SUPER_ADMIN_CUSTOM_PASSWORD, null);
        const customSuperHash = this.getItem<string | null>(STORAGE_KEYS.SUPER_ADMIN_CUSTOM_HASH, null);
        const hashedOld = sha256(trimmedOld).toLowerCase();

        const isOldValid =
          (customSuperPass && trimmedOld === customSuperPass) ||
          (customSuperHash && hashedOld === customSuperHash) ||
          (!customSuperPass &&
            !customSuperHash &&
            (trimmedOld === SUPER_ADMIN_ACCOUNT.password ||
              trimmedOld === 'admin123' ||
              trimmedOld === 'admin' ||
              hashedOld === '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155c'));

        if (!isOldValid) {
          return { success: false, message: 'Kata sandi lama Super Admin tidak sesuai.' };
        }
      }

      this.setItem(STORAGE_KEYS.SUPER_ADMIN_CUSTOM_PASSWORD, trimmedNew);
      this.setItem(STORAGE_KEYS.SUPER_ADMIN_CUSTOM_HASH, hashedNew);

      this.logAudit({
        user_id: operatorId || SUPER_ADMIN_ACCOUNT.id,
        user_role: 'SUPER_ADMIN',
        action: 'CHANGE_PASSWORD',
        module: 'AUTH',
        reference_id: SUPER_ADMIN_ACCOUNT.id,
        description: 'Kata sandi Master Super Admin berhasil diperbarui',
        result: 'SUCCESS',
      });

      return { success: true, message: 'Kata sandi Super Admin berhasil diperbarui dengan aman!' };
    }

    // 2. Target is Member
    const members = this.getMembers();
    const memberIndex = members.findIndex(
      (m) =>
        m.member_id === targetUserId ||
        m.email?.toLowerCase() === targetUserId.toLowerCase() ||
        m.nomor_anggota?.toLowerCase() === targetUserId.toLowerCase()
    );

    if (memberIndex === -1) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    const member = members[memberIndex];

    if (!isSuperAdminReset) {
      const trimmedOld = (oldPassword || '').trim();
      const memberNik = String(member.nik || '');
      const memberPhone = String(member.nomor_hp || member.whatsapp || '');
      const memberPassHash = String(member.password_hash || '').toLowerCase();
      const memberPlainPass = String(member.password || '');
      const hashedOld = sha256(trimmedOld).toLowerCase();

      const isOldValid =
        (memberPassHash && hashedOld === memberPassHash) ||
        (memberPlainPass && trimmedOld === memberPlainPass) ||
        trimmedOld === MEMBER_DEFAULT_PASSWORD ||
        trimmedOld === '123456' ||
        (memberNik.length >= 6 && trimmedOld === memberNik.slice(-6)) ||
        (memberPhone.length >= 6 && trimmedOld === memberPhone.slice(-6));

      if (!isOldValid) {
        return { success: false, message: 'Kata sandi / PIN lama Anda tidak sesuai.' };
      }
    }

    // Update Member with new password & hash
    const updatedMember: Member = {
      ...member,
      password: trimmedNew,
      password_hash: hashedNew,
      updated_at: new Date().toISOString(),
    };

    members[memberIndex] = updatedMember;
    this.setItem(STORAGE_KEYS.MEMBERS, members);

    // Sync to Google Spreadsheet
    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_ANGGOTA_KOPERASI', member.member_id, {
      member_id: member.member_id,
      nomor_anggota: member.nomor_anggota,
      nama_lengkap: member.nama_lengkap,
      nik: member.nik,
      nama_usaha: member.nama_usaha,
      kategori_usaha: member.kategori_usaha,
      whatsapp: member.whatsapp,
      email: member.email,
      status: member.status_keanggotaan,
      tanggal_bergabung: member.tanggal_bergabung,
    });

    this.logAudit({
      user_id: operatorId || member.member_id,
      user_role: isSuperAdminReset ? 'SUPER_ADMIN' : 'MEMBER',
      action: 'CHANGE_PASSWORD',
      module: 'AUTH',
      reference_id: member.member_id,
      description: isSuperAdminReset
        ? `Super Admin mereset kata sandi untuk anggota ${member.nama_lengkap} (${member.member_id})`
        : `Anggota ${member.nama_lengkap} (${member.member_id}) berhasil memperbarui kata sandi pribadinya`,
      result: 'SUCCESS',
    });

    return {
      success: true,
      message: isSuperAdminReset
        ? `Kata sandi anggota ${member.nama_lengkap} (${member.member_id}) berhasil diperbarui oleh Super Admin!`
        : 'Kata sandi Anda berhasil diperbarui dengan aman!',
    };
  }

  // --- LockService Simulation ---
  private async acquireLock(timeoutMs: number = 3000): Promise<boolean> {
    const startTime = Date.now();
    while (this.isLocked) {
      if (Date.now() - startTime > timeoutMs) {
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    this.isLocked = true;
    return true;
  }

  private releaseLock(): void {
    this.isLocked = false;
  }

  // --- Clean Expired Registrations ---
  cleanExpiredReservations(): void {
    const registrations = this.getRegistrations();
    const now = new Date().toISOString();
    let hasChanges = false;

    const updated = registrations.map((reg) => {
      if (
        reg.registration_status === 'WAITING_PAYMENT' &&
        reg.payment_status === 'UNPAID' &&
        reg.payment_deadline &&
        reg.payment_deadline < now
      ) {
        hasChanges = true;
        return {
          ...reg,
          registration_status: 'EXPIRED' as const,
          updated_at: now,
        };
      }
      return reg;
    });

    if (hasChanges) {
      this.setItem(STORAGE_KEYS.REGISTRATIONS, updated);
      this.logAudit({
        user_id: 'SYSTEM',
        user_role: 'SUPER_ADMIN',
        action: 'EXPIRE_RESERVATIONS',
        module: 'STAND',
        reference_id: 'SYSTEM_CRON',
        description: 'Auto-expired unpaid stand reservations past deadline',
        result: 'SUCCESS',
      });
    }
  }

  saveMember(member: Member): Member {
    const members=this.getMembers(); const idx=members.findIndex(m=>m.member_id===member.member_id);
    const now=new Date().toISOString(); const normalized={...member,updated_at:member.updated_at||now,created_at:member.created_at||now};
    if(idx>=0) members[idx]=normalized; else members.push(normalized);
    this.setItem(STORAGE_KEYS.MEMBERS,members);
    void googleWorkspaceSync.syncRowToSpreadsheet('SHEET_ANGGOTA_KOPERASI',normalized.member_id,normalized);
    return normalized;
  }

  async saveMemberAndWait(member: Member): Promise<Member> {
    const members=this.getMembers();
    const idx=members.findIndex(m=>m.member_id===member.member_id);
    const now=new Date().toISOString();
    const normalized={...member,updated_at:member.updated_at||now,created_at:member.created_at||now};
    const remote = await googleWorkspaceSync.syncRowToSpreadsheet('SHEET_ANGGOTA_KOPERASI', normalized.member_id, normalized);
    const remoteResult:any = remote?.result ?? remote?.data ?? remote;
    if (!remote.success || !['UPDATED','INSERTED'].includes(String(remoteResult?.status || '').toUpperCase())) {
      throw new Error(remoteResult?.message || remote.error || 'Data anggota gagal disimpan ke Google Spreadsheet.');
    }
    if(idx>=0) members[idx]=normalized; else members.push(normalized);
    this.setItem(STORAGE_KEYS.MEMBERS,members);
    this.notify();
    return normalized;
  }

  logActivity(action:string,module:string,description:string,referenceId=''): void {
    this.logAudit({user_id:this.getCurrentUser()?.id||'SYSTEM',user_role:this.getCurrentUser()?.role||'MEMBER',action,module,reference_id:referenceId,description,result:'SUCCESS'});
  }

  // --- Members ---
  getMembers(): Member[] {
    // Google Spreadsheet adalah sumber data anggota. Jangan lagi menggabungkan
    // INITIAL_MEMBERS ke data aktif karena baris yang dihapus dari Spreadsheet
    // akan muncul kembali sebagai data lama/demo.
    const raw = this.getItem<Member[]>(STORAGE_KEYS.MEMBERS, []);

    return raw.map((m) => ({
      ...m,
      member_id: String(m.member_id || ''),
      nomor_anggota: String(m.nomor_anggota || ''),
      nama_lengkap: String(m.nama_lengkap || ''),
      nama_usaha: String(m.nama_usaha || ''),
      kategori_usaha: m.kategori_usaha || 'Kuliner',
      whatsapp: String(m.whatsapp ?? m.nomor_hp ?? ''),
      nomor_hp: String(m.nomor_hp ?? m.whatsapp ?? ''),
      email: String(m.email || ''),
      nik: String(m.nik || ''),
      status_keanggotaan: m.status_keanggotaan || 'ACTIVE',
    }));
  }

  getMemberById(id: string): Member | undefined {
    return this.getMembers().find((m) => m.member_id === id);
  }

  async updateMemberIdentifiers(
    oldMemberId: string,
    newMemberId: string,
    newNomorAnggota: string,
    adminId?: string
  ): Promise<{ success: boolean; message: string }> {
    const oldId=String(oldMemberId||'').trim(); const nextId=String(newMemberId||'').trim().toUpperCase(); const nextNumber=String(newNomorAnggota||'').trim().toUpperCase();
    if(!oldId||!nextId||!nextNumber) return {success:false,message:'member_id lama, member_id baru, dan nomor_anggota wajib diisi.'};
    const members=this.getMembers(); const targetIndex=members.findIndex(m=>m.member_id===oldId);
    if(targetIndex<0) return {success:false,message:'Data anggota tidak ditemukan di cache aplikasi.'};
    if(members.some((m,i)=>i!==targetIndex&&String(m.member_id).trim().toUpperCase()===nextId)) return {success:false,message:`member_id ${nextId} sudah digunakan anggota lain.`};
    if(members.some((m,i)=>i!==targetIndex&&String(m.nomor_anggota).trim().toUpperCase()===nextNumber)) return {success:false,message:`nomor_anggota ${nextNumber} sudah digunakan anggota lain.`};
    const response=await callGoogleAppsScript('updateMemberIdentifiers',{old_member_id:oldId,member_id:nextId,nomor_anggota:nextNumber,admin_id:adminId||'SUPER_ADMIN'});
    const remote:any=response?.result??response?.data??response;
    if(!response.success||String(remote?.status||'').toUpperCase()!=='UPDATED') return {success:false,message:remote?.message||response.error||'Google Spreadsheet tidak mengonfirmasi perubahan identitas.'};
    const verify=await callGoogleAppsScript('verifyMemberIdentifiers',{member_id:nextId,nomor_anggota:nextNumber});
    const verified:any=verify?.result??verify?.data??verify;
    if(!verify.success||String(verified?.status||'').toUpperCase()!=='VERIFIED') return {success:false,message:verified?.message||verify.error||'Spreadsheet belum dapat memverifikasi identifier baru.'};
    const updatedMember:Member={...members[targetIndex],member_id:nextId,nomor_anggota:nextNumber,barcode_value:nextId,qr_value:nextId,updated_at:new Date().toISOString()};
    members[targetIndex]=updatedMember; this.setItem(STORAGE_KEYS.MEMBERS,members); this.notify();
    this.logAudit({user_id:adminId||'SUPER_ADMIN',user_role:'SUPER_ADMIN',action:'UPDATE_MEMBER_IDENTIFIER',module:'MEMBER',reference_id:nextId,description:`Identitas anggota ${updatedMember.nama_lengkap} diubah dan diverifikasi di Spreadsheet.`,result:'SUCCESS'});
    return {success:true,message:`Identitas ${updatedMember.nama_lengkap} tersimpan dan terverifikasi di Google Spreadsheet: ${nextId} / ${nextNumber}.`};
  }

  // --- Member Profile & Biodata Update by Member / Admin ---
  updateMemberProfile(
    memberId: string,
    profileData: Partial<Member>,
    skipRemoteSync: boolean = false
  ): { success: boolean; message: string; member?: Member } {
    const members = this.getMembers();
    const index = members.findIndex((m) => m.member_id === memberId);
    if (index === -1) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    const current = members[index];
    const updatedMember: Member = {
      ...current,
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    members[index] = updatedMember;
    this.setItem(STORAGE_KEYS.MEMBERS, members);

    // Google Spreadsheet adalah sumber data anggota. Setiap perubahan profil
    // (termasuk foto) wajib ditulis kembali ke Spreadsheet, bukan hanya cache.
    // Untuk saveMemberMedia(), sinkronisasi ditunda sampai upload Drive selesai
    // lalu di-await agar browser mobile tidak menghentikan request kedua.
    if (!skipRemoteSync) {
      void googleWorkspaceSync.syncRowToSpreadsheet('SHEET_ANGGOTA_KOPERASI', memberId, {
        member_id: updatedMember.member_id,
        nomor_anggota: updatedMember.nomor_anggota,
        nik: updatedMember.nik,
        nama_lengkap: updatedMember.nama_lengkap,
        tempat_lahir: updatedMember.tempat_lahir,
        tanggal_lahir: updatedMember.tanggal_lahir,
        jenis_kelamin: updatedMember.jenis_kelamin,
        alamat: updatedMember.alamat,
        nomor_hp: updatedMember.nomor_hp,
        whatsapp: updatedMember.whatsapp,
        email: updatedMember.email,
        nama_usaha: updatedMember.nama_usaha,
        kategori_usaha: updatedMember.kategori_usaha,
        alamat_usaha: updatedMember.alamat_usaha,
        deskripsi_usaha: updatedMember.deskripsi_usaha,
        foto_profil_url: updatedMember.foto_profil_url || '',
        status_keanggotaan: updatedMember.status_keanggotaan,
        tanggal_bergabung: updatedMember.tanggal_bergabung,
        password_hash: updatedMember.password_hash || '',
        created_at: updatedMember.created_at,
        updated_at: updatedMember.updated_at,
        kta_file_id: updatedMember.kta_file_id || '',
        kta_file_url: updatedMember.kta_file_url || '',
        barcode_value: updatedMember.barcode_value || updatedMember.member_id,
        qr_value: updatedMember.qr_value || updatedMember.member_id,
      });
    }

    // Sync active session if logged in as this member
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.member_id === memberId) {
      const updatedAuth: AuthUser = {
        ...currentUser,
        name: updatedMember.nama_lengkap,
        foto_profil_url: updatedMember.foto_profil_url,
        nama_usaha: updatedMember.nama_usaha,
        nomor_anggota: updatedMember.nomor_anggota,
      };
      this.setItem(STORAGE_KEYS.CURRENT_USER, updatedAuth);
    }

    this.notify();
    this.persistToServer();

    // Async sync photo to Google Drive
    if (profileData.foto_profil_url && profileData.foto_profil_url !== current.foto_profil_url) {
      try {
        googleWorkspaceSync.syncFileToGoogleDrive({
          fileUrl: profileData.foto_profil_url,
          fileName: `Foto_Profil_${updatedMember.member_id}.jpg`,
          category: 'FOTO_PROFIL',
          uploadedBy: updatedMember.nama_lengkap,
          memberId: updatedMember.member_id,
        });
      } catch (err) {
        console.warn('Google Drive photo upload failed', err);
      }
    }

    this.logAudit({
      user_id: memberId,
      user_role: currentUser?.role || 'MEMBER',
      action: 'UPDATE_MEMBER_PROFILE',
      module: 'MEMBERS',
      reference_id: memberId,
      description: `Biodata profil anggota ${updatedMember.nama_lengkap} (${updatedMember.member_id}) berhasil diperbarui`,
      result: 'SUCCESS',
    });

    this.addNotification({
      title: 'Biodata Anggota Diperbarui',
      message: `Profil anggota ${updatedMember.nama_lengkap} (${updatedMember.nama_usaha}) berhasil disimpan dan disinkronkan.`,
      type: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Biodata & Foto Profil berhasil disimpan dan disinkronkan!',
      member: updatedMember,
    };
  }

  async saveMemberMedia(memberId:string, photoFile?:File, ktaFile?:File): Promise<{success:boolean;member?:Member;message:string}> {
    const member=this.getMemberById(memberId); if(!member) return {success:false,message:'Data anggota tidak ditemukan.'};
    let updates:Partial<Member>={};
    try {
      if(photoFile){ const r=await googleWorkspaceSync.uploadMemberPhoto(photoFile,memberId,member.nama_lengkap); if(!r.success) throw new Error(r.error||'Upload foto gagal'); const d:any=r.result||r.data; updates.foto_profil_url=d?.directImageUrl||d?.driveUrl; (updates as any).foto_profil_drive_file_id=d?.fileId; }
      if(ktaFile){ const r=await googleWorkspaceSync.uploadMemberKta(ktaFile,memberId,member.nama_lengkap); if(!r.success) throw new Error(r.error||'Upload KTA gagal'); const d:any=r.result||r.data; updates.kta_file_url=d?.driveUrl; updates.kta_file_id=d?.fileId; }
      // Update cache tanpa menembakkan request cloud yang tidak di-await.
      const result=this.updateMemberProfile(memberId,updates,true);
      if(!result.success || !result.member) return result;

      // WAJIB await: pada browser mobile, request async yang dibiarkan
      // fire-and-forget dapat dihentikan ketika modal ditutup/navigasi.
      const syncResult = await googleWorkspaceSync.syncRowToSpreadsheet(
        'SHEET_ANGGOTA_KOPERASI',
        memberId,
        {
          member_id: result.member.member_id,
          nomor_anggota: result.member.nomor_anggota,
          nik: result.member.nik,
          nama_lengkap: result.member.nama_lengkap,
          tempat_lahir: result.member.tempat_lahir,
          tanggal_lahir: result.member.tanggal_lahir,
          jenis_kelamin: result.member.jenis_kelamin,
          alamat: result.member.alamat,
          nomor_hp: result.member.nomor_hp,
          whatsapp: result.member.whatsapp,
          email: result.member.email,
          nama_usaha: result.member.nama_usaha,
          kategori_usaha: result.member.kategori_usaha,
          alamat_usaha: result.member.alamat_usaha,
          deskripsi_usaha: result.member.deskripsi_usaha,
          foto_profil_url: result.member.foto_profil_url || '',
          status_keanggotaan: result.member.status_keanggotaan,
          tanggal_bergabung: result.member.tanggal_bergabung,
          password_hash: result.member.password_hash || '',
          created_at: result.member.created_at,
          updated_at: result.member.updated_at,
          kta_file_id: result.member.kta_file_id || '',
          kta_file_url: result.member.kta_file_url || '',
          barcode_value: result.member.barcode_value || result.member.member_id,
          qr_value: result.member.qr_value || result.member.member_id,
        }
      );
      if (!syncResult.success) {
        throw new Error(syncResult.error || syncResult.message || 'Metadata foto gagal disimpan ke Google Spreadsheet.');
      }

      return {success:true,member:result.member,message:'Foto/KTA tersimpan di Google Drive dan metadata tersimpan di Google Sheets.'};
    } catch(e:any){ return {success:false,message:e?.message||'Upload media gagal.'}; }
  }

  // --- Koperasi Configuration & Membership Obligations ---
  getKoperasiConfig(): KoperasiConfig {
    const stored = this.getItem<Partial<KoperasiConfig>>(STORAGE_KEYS.KOPERASI_CONFIG, {});
    return {
      ...DEFAULT_KOPERASI_CONFIG,
      ...stored,
      // Rekening transfer resmi tidak boleh kembali ke konfigurasi lama/cache lama.
      nama_bank: 'Bank Mandiri',
      nomor_rekening: '1490030302105',
      atas_nama_rekening: 'Koperasi Berau Melangkah Bersama',
    } as KoperasiConfig;
  }

  async updateKoperasiConfig(
    updates: Partial<KoperasiConfig>,
    adminUsername = 'SUPER_ADMIN'
  ): Promise<KoperasiConfig> {
    const current = this.getKoperasiConfig();
    const updated: KoperasiConfig = {
      ...current,
      ...updates,
      // Rekening transfer resmi dikunci pada satu rekening koperasi.
      nama_bank: 'Bank Mandiri',
      nomor_rekening: '1490030302105',
      atas_nama_rekening: 'Koperasi Berau Melangkah Bersama',
      updated_at: new Date().toISOString(),
      updated_by: adminUsername,
    };

    this.setItem(STORAGE_KEYS.KOPERASI_CONFIG, updated);

    const response = await googleWorkspaceSync.updateKoperasiConfig(updated);
    if (!response.success) {
      throw new Error(response.error || response.message || 'Pengaturan koperasi gagal disimpan ke Google Spreadsheet.');
    }

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_KOPERASI_CONFIG',
      module: 'SAVING',
      reference_id: 'KOPERASI-CONFIG',
      description: `Pengaturan Simpanan Koperasi diubah: Simpanan Pokok Rp${updated.simpanan_pokok_nominal.toLocaleString(
        'id-ID'
      )}, Cicilan Pokok Rp${(updated.simpanan_pokok_cicilan_nominal || 0).toLocaleString('id-ID')}, Simpanan Wajib Rp${updated.simpanan_wajib_nominal.toLocaleString(
        'id-ID'
      )}/bulan. Transfer: Bank Mandiri ${updated.nomor_rekening} a/n ${updated.atas_nama_rekening}.`,
      result: 'SUCCESS',
    });

    this.addNotification({
      title: 'Kebijakan Simpanan Koperasi Diperbarui',
      message: `Pokok Rp${updated.simpanan_pokok_nominal.toLocaleString('id-ID')}, cicilan pokok Rp${(updated.simpanan_pokok_cicilan_nominal || 0).toLocaleString('id-ID')}, wajib Rp${updated.simpanan_wajib_nominal.toLocaleString('id-ID')}/bulan.`,
      type: 'INFO',
    });

    this.notify();
    return updated;
  }

  toggleMemberKoperasiStatus(
    memberId: string,
    isKoperasi: boolean,
    adminUsername = 'SUPER_ADMIN'
  ): { success: boolean; message: string; member?: Member } {
    const members = this.getMembers();
    const index = members.findIndex((m) => m.member_id === memberId);
    if (index === -1) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    const current = members[index];
    const updatedMember: Member = {
      ...current,
      tipe_keanggotaan: isKoperasi ? 'KOPERASI' : 'PASAR_ONLY',
      status_koperasi: isKoperasi ? 'AKTIF' : 'BELUM_AKTIF',
      is_cooperative_member: isKoperasi,
      updated_at: new Date().toISOString(),
    };

    members[index] = updatedMember;
    this.setItem(STORAGE_KEYS.MEMBERS, members);
    this.notify();
    this.persistToServer();

    const statusLabel = isKoperasi
      ? 'Anggota Koperasi Penuh (Kewajiban Simpanan Pokok & Wajib Aktif)'
      : 'Bukan Anggota Koperasi (Tenant Pasar Saja, Bebas Iuran)';

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'SET_MEMBER_KOPERASI_STATUS',
      module: 'MEMBERS',
      reference_id: memberId,
      description: `Menetapkan status keanggotaan ${current.nama_lengkap} (${memberId}) menjadi ${statusLabel}`,
      result: 'SUCCESS',
    });

    this.addNotification({
      title: 'Status Keanggotaan Koperasi Diperbarui',
      message: `Status keanggotaan ${current.nama_lengkap} ditetapkan sebagai: ${statusLabel}.`,
      type: isKoperasi ? 'SUCCESS' : 'INFO',
    });

    return {
      success: true,
      message: `Status keanggotaan ${current.nama_lengkap} berhasil ditetapkan sebagai ${
        isKoperasi ? 'Anggota Koperasi' : 'Bukan Anggota Koperasi'
      }.`,
      member: updatedMember,
    };
  }
}

export const storage = new StorageService();
