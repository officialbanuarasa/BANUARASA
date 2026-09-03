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
  INITIAL_AUDIT_LOGS,
  SUPER_ADMIN_ACCOUNT,
  MEMBER_DEFAULT_PASSWORD,
} from '../data/initialData';
import { getStandPrice } from './standEngine';
import { googleWorkspaceSync } from './googleWorkspaceSync';
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
  AUDIT_LOGS: 'kbm_v3_audit_logs',
  NOTIFICATIONS: 'kbm_v3_notifications',
  CURRENT_USER: 'kbm_v3_current_user_session',
  BRANDING: 'kbm_v3_branding_assets',
  CARD_DESIGN: 'kbm_v3_member_card_design',
  SUPER_ADMIN_CUSTOM_PASSWORD: 'kbm_v3_super_admin_custom_pass',
  SUPER_ADMIN_CUSTOM_HASH: 'kbm_v3_super_admin_custom_hash',
  IS_DUMMY_PURGED: 'kbm_v3_is_dummy_purged',
};

export const CURRENT_DATA_VERSION = '3.2.0';

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
      if (!skipServerPersist && !this.isHydratingFromServer) {
        this.debouncedPersistToServer();
      }
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

  async persistToServer(): Promise<boolean> {
    try {
      const payload = {
        events: this.getEvents(),
        branding: this.getBrandingConfig(),
        cardDesign: this.getMemberCardDesign(),
        members: this.getMembers().filter((m) => !OBSOLETE_DUMMY_BRANDS.has(m?.nama_usaha)),
        registrations: this.getRegistrations(),
        payments: this.getPayments(),
        savings: this.getSavings(),
        salesReports: this.getSalesReports(),
        products: this.getProducts(),
        documents: this.getDocuments(),
        announcements: this.getAnnouncements(),
        notifications: this.getNotifications(),
        auditLogs: this.getAuditLogs(),
        news: this.getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS),
        gallery: this.getItem(STORAGE_KEYS.GALLERY, INITIAL_GALLERY),
        sponsors: this.getItem(STORAGE_KEYS.SPONSORS, INITIAL_SPONSORS),
        gasUrl: localStorage.getItem('kbm_gas_web_app_url_v3') || '',
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/app-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.updatedAt) {
          this.lastServerUpdatedAt = json.updatedAt;
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[StorageService] Persist to server network error:', err);
      return false;
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

    // Segera lakukan sinkronisasi dengan server agar seluruh gawai memperoleh data terkini
    this.syncWithServer(true).then(() => {
      this.syncCurrentUserWithMemberProfile();
    });
  }

  // Fungsi utilitas untuk membersihkan cookies & cache perangkat secara manual/otomatis
  purgeDeviceCookiesAndCache(): { success: boolean; message: string } {
    clearAllBrowserCookies();
    this.setItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS, true);
    this.setItem(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION, true);
    this.syncCurrentUserWithMemberProfile();
    this.syncWithServer(true).then(() => {
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

  // --- Members ---
  getMembers(): Member[] {
    const raw = this.getItem<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const existingIds = new Set(raw.map((m) => String(m.member_id || '').toLowerCase()));
    const missingInitial = INITIAL_MEMBERS.filter((m) => !existingIds.has(m.member_id.toLowerCase()));
    const combined = [...raw, ...missingInitial];

    return combined.map((m) => ({
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

  updateMember(memberId: string, updates: Partial<Member>, adminId?: string): boolean {
    const members = this.getMembers();
    const idx = members.findIndex((m) => m.member_id === memberId);
    if (idx === -1) return false;

    members[idx] = {
      ...members[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.MEMBERS, members);

    // Sync updated data to Google Spreadsheet
    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_ANGGOTA_KOPERASI', memberId, {
      member_id: members[idx].member_id,
      nomor_anggota: members[idx].nomor_anggota,
      nama_lengkap: members[idx].nama_lengkap,
      nik: members[idx].nik,
      nama_usaha: members[idx].nama_usaha,
      kategori_usaha: members[idx].kategori_usaha,
      whatsapp: members[idx].whatsapp,
      email: members[idx].email,
      status: members[idx].status_keanggotaan,
      tanggal_bergabung: members[idx].tanggal_bergabung,
    });

    this.logAudit({
      user_id: adminId || memberId,
      user_role: adminId ? 'SUPER_ADMIN' : 'MEMBER',
      action: 'UPDATE_MEMBER',
      module: 'MEMBER',
      reference_id: memberId,
      description: `Profil anggota ${members[idx].nama_lengkap} (${memberId}) diperbarui ${adminId ? 'oleh Super Admin' : ''}`,
      result: 'SUCCESS',
    });

    this.addNotification({
      title: 'Profil Anggota Diperbarui',
      message: `Data profil ${members[idx].nama_lengkap} (${memberId}) telah diperbarui oleh ${adminId ? 'Super Admin' : 'Pengurus'}.`,
      type: 'INFO',
    });
    this.persistToServer();

    return true;
  }

  addMemberManual(
    data: Partial<Member> & { nama_lengkap: string; nama_usaha: string; whatsapp: string },
    adminId: string
  ): Member {
    const members = this.getMembers();
    const nextNum = members.length + 1;
    const memberId = `MBR-${String(nextNum).padStart(4, '0')}`;
    const nomorAnggota = `KBMB-2026-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newMember: Member = {
      member_id: memberId,
      nomor_anggota: nomorAnggota,
      nik: data.nik || `640301${Date.now().toString().slice(-10)}`,
      nama_lengkap: data.nama_lengkap,
      tempat_lahir: data.tempat_lahir || 'Berau',
      tanggal_lahir: data.tanggal_lahir || '1995-01-01',
      jenis_kelamin: data.jenis_kelamin || 'L',
      alamat: data.alamat || data.alamat_usaha || 'Tanjung Redeb, Berau',
      nomor_hp: data.nomor_hp || data.whatsapp,
      whatsapp: data.whatsapp,
      email: data.email || `${data.nama_lengkap.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      nama_usaha: data.nama_usaha,
      kategori_usaha: data.kategori_usaha || 'Kuliner',
      alamat_usaha: data.alamat_usaha || 'Jl. Pemuda No. 12, Tanjung Redeb, Berau',
      deskripsi_usaha: data.deskripsi_usaha || `Usaha UMKM binaan Koperasi: ${data.nama_usaha}`,
      foto_profil_url: data.foto_profil_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
      status_keanggotaan: data.status_keanggotaan || 'ACTIVE',
      tanggal_bergabung: data.tanggal_bergabung || now.slice(0, 10),
      created_at: now,
      updated_at: now,
    };

    members.push(newMember);
    this.setItem(STORAGE_KEYS.MEMBERS, members);

    // Sync to Google Workspace
    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_ANGGOTA_KOPERASI', memberId, {
      member_id: newMember.member_id,
      nomor_anggota: newMember.nomor_anggota,
      nama_lengkap: newMember.nama_lengkap,
      nik: newMember.nik,
      nama_usaha: newMember.nama_usaha,
      kategori_usaha: newMember.kategori_usaha,
      whatsapp: newMember.whatsapp,
      email: newMember.email,
      status: newMember.status_keanggotaan,
      tanggal_bergabung: newMember.tanggal_bergabung,
    });

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'ADMIN_CREATE_MEMBER',
      module: 'MEMBER',
      reference_id: memberId,
      description: `Super Admin mendaftarkan anggota baru secara manual: ${newMember.nama_lengkap} (${newMember.nama_usaha})`,
      result: 'SUCCESS',
    });

    this.addNotification({
      title: 'Pendaftaran Anggota Baru',
      message: `Anggota baru ${newMember.nama_lengkap} (${newMember.nama_usaha}) berhasil didaftarkan oleh Super Admin.`,
      type: 'SUCCESS',
    });
    this.persistToServer();

    return newMember;
  }

  createMember(newMember: Omit<Member, 'created_at' | 'updated_at'>): Member {
    const members = this.getMembers();
    const now = new Date().toISOString();
    const member: Member = {
      ...newMember,
      created_at: now,
      updated_at: now,
    };
    members.push(member);
    this.setItem(STORAGE_KEYS.MEMBERS, members);

    // Sync profile photo to Google Drive
    if (member.foto_profil_url) {
      googleWorkspaceSync.syncFileToGoogleDrive({
        fileName: `Foto_Profil_${member.nama_lengkap.replace(/\s+/g, '_')}.jpg`,
        fileUrl: member.foto_profil_url,
        category: 'FOTO_PROFIL',
        uploadedBy: member.member_id,
        memberId: member.member_id,
      });
    }

    // Sync row to Google Spreadsheet
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
      user_id: member.member_id,
      user_role: 'MEMBER',
      action: 'CREATE_MEMBER',
      module: 'MEMBER',
      reference_id: member.member_id,
      description: `Pendaftaran anggota baru: ${member.nama_lengkap} (${member.nama_usaha}) terdata di Google Spreadsheet & Google Drive`,
      result: 'SUCCESS',
    });

    this.addNotification({
      title: 'Pendaftaran Anggota Baru',
      message: `${member.nama_lengkap} (${member.nama_usaha}) berhasil mendaftar sebagai anggota Koperasi.`,
      type: 'SUCCESS',
    });
    this.persistToServer();

    return member;
  }

  deleteMember(memberId: string, adminId: string): { success: boolean; message: string } {
    const members = this.getMembers();
    const targetMember = members.find((m) => m.member_id === memberId);
    if (!targetMember) {
      return { success: false, message: 'Anggota tidak ditemukan.' };
    }

    // 1. Remove member from list
    const updatedMembers = members.filter((m) => m.member_id !== memberId);
    this.setItem(STORAGE_KEYS.MEMBERS, updatedMembers);

    // 2. Cascade delete products
    const prods = this.getProducts().filter((p) => p.member_id !== memberId);
    this.setItem(STORAGE_KEYS.PRODUCTS, prods);

    // 3. Cascade delete documents
    const docs = this.getDocuments().filter((d) => d.member_id !== memberId);
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);

    // 4. Cascade delete registrations (this immediately frees up their Stand in the 64-stand grid!)
    const regs = this.getRegistrations().filter((r) => r.member_id !== memberId);
    this.setItem(STORAGE_KEYS.REGISTRATIONS, regs);

    // 5. Cascade delete payments
    const pays = this.getPayments().filter((p) => p.member_id !== memberId);
    this.setItem(STORAGE_KEYS.PAYMENTS, pays);

    // 6. Cascade delete savings
    const savs = this.getSavings().filter((s) => s.member_id !== memberId);
    this.setItem(STORAGE_KEYS.SAVINGS, savs);

    // 7. Cascade delete sales reports
    const slrs = this.getSalesReports().filter((s) => s.member_id !== memberId);
    this.setItem(STORAGE_KEYS.SALES_REPORTS, slrs);

    // 8. Log audit trail
    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'DELETE_MEMBER',
      module: 'MEMBER',
      reference_id: memberId,
      description: `Super Admin menghapus data anggota ${targetMember.nama_lengkap} (${memberId}). Stand dan transaksi terkait telah dibebaskan.`,
      result: 'SUCCESS',
    });

    this.addNotification({
      title: 'Anggota Dihapus oleh Super Admin',
      message: `Data anggota ${targetMember.nama_lengkap} (${memberId}) dan seluruh alokasi stand terkait telah dibebaskan.`,
      type: 'ALERT',
    });

    return {
      success: true,
      message: `Anggota ${targetMember.nama_lengkap} (${memberId}) berhasil dihapus dan stand terkait telah dikosongkan.`,
    };
  }

  // --- Documents ---
  getDocuments(memberId?: string): MemberDocument[] {
    const docs = this.getItem(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    return memberId ? docs.filter((d) => d.member_id === memberId) : docs;
  }

  uploadDocument(doc: Omit<MemberDocument, 'document_id' | 'upload_date' | 'verification_status'>): MemberDocument {
    const docs = this.getDocuments();
    const id = `DOC-${Date.now().toString().slice(-5)}`;
    
    // Sync document to Google Drive
    const driveFile = googleWorkspaceSync.syncFileToGoogleDrive({
      fileName: doc.file_name || `Dokumen_${doc.document_type}_${doc.member_id}.pdf`,
      fileUrl: doc.drive_url || 'https://drive.google.com/file/d/sample/view',
      category: 'DOKUMEN_LEGALITAS',
      uploadedBy: doc.member_id,
      memberId: doc.member_id,
      referenceId: id,
    });

    const newDoc: MemberDocument = {
      ...doc,
      document_id: id,
      drive_file_id: driveFile.fileId,
      drive_url: driveFile.driveUrl,
      upload_date: new Date().toISOString().split('T')[0],
      verification_status: 'PENDING',
    };
    docs.push(newDoc);
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);

    // Sync to Google Spreadsheet
    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_DOKUMEN_LEGALITAS', id, {
      document_id: id,
      member_id: doc.member_id,
      document_type: doc.document_type,
      document_number: doc.document_number,
      file_name: doc.file_name,
      drive_url: driveFile.driveUrl,
      verification_status: 'PENDING',
    });

    this.logAudit({
      user_id: doc.member_id,
      user_role: 'MEMBER',
      action: 'UPLOAD_DOCUMENT',
      module: 'LEGALITAS',
      reference_id: id,
      description: `Upload dokumen legalitas ${doc.document_type} (${doc.file_name}) ke Google Drive ${driveFile.folderPath} dan Google Spreadsheet`,
      result: 'SUCCESS',
    });
    return newDoc;
  }

  verifyDocument(docId: string, adminId: string, isApproved: boolean, rejectionReason?: string): boolean {
    const docs = this.getDocuments();
    const idx = docs.findIndex((d) => d.document_id === docId);
    if (idx === -1) return false;

    docs[idx] = {
      ...docs[idx],
      verification_status: isApproved ? 'VERIFIED' : 'REJECTED',
      verified_by: adminId,
      verified_at: new Date().toISOString(),
      rejection_reason: isApproved ? undefined : rejectionReason || 'Dokumen tidak memenuhi persyaratan',
    };
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);

    this.logAudit({
      user_id: adminId,
      user_role: 'ADMIN_KOPERASI',
      action: isApproved ? 'VERIFY_DOCUMENT' : 'REJECT_DOCUMENT',
      module: 'LEGALITAS',
      reference_id: docId,
      description: `Dokumen ${docs[idx].document_type} untuk ${docs[idx].member_id} ${isApproved ? 'diverifikasi' : 'ditolak: ' + rejectionReason}`,
      result: 'SUCCESS',
    });
    return true;
  }

  // --- Products ---
  getProducts(memberId?: string): Product[] {
    const prods = this.getItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return memberId ? prods.filter((p) => p.member_id === memberId) : prods;
  }

  addProduct(product: Omit<Product, 'product_id' | 'created_at' | 'updated_at'>): Product {
    const prods = this.getProducts();
    const id = `PRD-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    // Sync product image to Google Drive
    const driveFile = googleWorkspaceSync.syncFileToGoogleDrive({
      fileName: `Produk_${product.product_name.replace(/\s+/g, '_')}_${id}.jpg`,
      fileUrl: product.image_url,
      category: 'FOTO_PRODUK',
      uploadedBy: product.member_id,
      memberId: product.member_id,
      referenceId: id,
    });

    const newProd: Product = {
      ...product,
      product_id: id,
      image_file_id: driveFile.fileId,
      created_at: now,
      updated_at: now,
    };
    prods.unshift(newProd);
    this.setItem(STORAGE_KEYS.PRODUCTS, prods);

    // Sync row to Google Spreadsheet
    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_KATALOG_PRODUK', id, {
      product_id: id,
      member_id: product.member_id,
      product_name: product.product_name,
      category: product.category,
      price: product.price,
      image_drive_url: driveFile.driveUrl,
      status: product.status,
    });

    this.logAudit({
      user_id: product.member_id,
      user_role: 'MEMBER',
      action: 'ADD_PRODUCT',
      module: 'PRODUCT',
      reference_id: id,
      description: `Tambah produk UMKM: ${product.product_name} (Rp${product.price.toLocaleString('id-ID')}) tersimpan di Google Drive & Google Sheets`,
      result: 'SUCCESS',
    });
    return newProd;
  }

  deleteProduct(productId: string, memberId: string): boolean {
    const prods = this.getProducts();
    const filtered = prods.filter((p) => !(p.product_id === productId && p.member_id === memberId));
    if (filtered.length !== prods.length) {
      this.setItem(STORAGE_KEYS.PRODUCTS, filtered);
      return true;
    }
    return false;
  }

  updateProduct(productId: string, updates: Partial<Product>, updaterId: string): boolean {
    const prods = this.getProducts();
    const idx = prods.findIndex((p) => p.product_id === productId);
    if (idx === -1) return false;

    prods[idx] = {
      ...prods[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.PRODUCTS, prods);

    // Sync update to Google Spreadsheet
    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_KATALOG_PRODUK', productId, {
      product_id: productId,
      member_id: prods[idx].member_id,
      product_name: prods[idx].product_name,
      category: prods[idx].category,
      price: prods[idx].price,
      status: prods[idx].status,
    });

    this.logAudit({
      user_id: updaterId,
      user_role: updaterId.includes('ADMIN') ? 'SUPER_ADMIN' : 'MEMBER',
      action: 'UPDATE_PRODUCT',
      module: 'PRODUCT',
      reference_id: productId,
      description: `Produk ${prods[idx].product_name} (${productId}) diperbarui`,
      result: 'SUCCESS',
    });
    return true;
  }

  deleteProductAdmin(productId: string, adminId: string): boolean {
    const prods = this.getProducts();
    const target = prods.find((p) => p.product_id === productId);
    if (!target) return false;

    const filtered = prods.filter((p) => p.product_id !== productId);
    this.setItem(STORAGE_KEYS.PRODUCTS, filtered);

    googleWorkspaceSync.deleteSpreadsheetRow('SHEET_KATALOG_PRODUK', productId);

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'DELETE_PRODUCT',
      module: 'PRODUCT',
      reference_id: productId,
      description: `Super Admin menghapus produk ${target.product_name} (${productId})`,
      result: 'SUCCESS',
    });
    return true;
  }

  // --- Events ---
  getEvents(): EventItem[] {
    return this.getItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  getEventById(eventId: string): EventItem | undefined {
    return this.getEvents().find((e) => e.event_id === eventId);
  }

  createEvent(eventData: Omit<EventItem, 'event_id' | 'created_at' | 'updated_at'>, adminUsername = 'SUPER_ADMIN'): EventItem {
    const events = this.getEvents();
    const eventId = `BWM-2026-${(events.length + 1).toString().padStart(3, '0')}`;
    const now = new Date().toISOString();
    const newEvent: EventItem = {
      ...eventData,
      event_id: eventId,
      created_at: now,
      updated_at: now,
    };
    events.unshift(newEvent);
    this.setItem(STORAGE_KEYS.EVENTS, events);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_EVENT_MARKET', eventId, newEvent);

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'CREATE_EVENT',
      module: 'EVENT',
      reference_id: eventId,
      description: `Event baru dibuat: ${newEvent.event_name} (${newEvent.event_date} di ${newEvent.location})`,
      result: 'SUCCESS',
    });
    return newEvent;
  }

  updateEvent(
    eventId: string,
    updates: Partial<EventItem>,
    adminUsername = 'SUPER_ADMIN'
  ): { success: boolean; message: string; event?: EventItem } {
    const events = this.getEvents();
    const idx = events.findIndex((e) => e.event_id === eventId);
    if (idx === -1) {
      return { success: false, message: 'Event tidak ditemukan.' };
    }

    const updatedEvent: EventItem = {
      ...events[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    events[idx] = updatedEvent;
    this.setItem(STORAGE_KEYS.EVENTS, events);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_EVENT_MARKET', eventId, updatedEvent);

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_EVENT',
      module: 'EVENT',
      reference_id: eventId,
      description: `Informasi Event diperbarui: ${updatedEvent.event_name} (${updatedEvent.event_date}, ${updatedEvent.start_time}-${updatedEvent.end_time} di ${updatedEvent.location})`,
      result: 'SUCCESS',
    });

    return {
      success: true,
      message: `Informasi Event ${updatedEvent.event_name} berhasil diperbarui.`,
      event: updatedEvent,
    };
  }

  deleteEvent(eventId: string, adminUsername = 'SUPER_ADMIN'): { success: boolean; message: string } {
    const events = this.getEvents();
    const target = events.find((e) => e.event_id === eventId);
    if (!target) {
      return { success: false, message: 'Event tidak ditemukan.' };
    }

    const filtered = events.filter((e) => e.event_id !== eventId);
    this.setItem(STORAGE_KEYS.EVENTS, filtered);
    googleWorkspaceSync.deleteSpreadsheetRow('SHEET_EVENT_MARKET', eventId);

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'DELETE_EVENT',
      module: 'EVENT',
      reference_id: eventId,
      description: `Event ${target.event_name} dihapus oleh ${adminUsername}`,
      result: 'SUCCESS',
    });

    return { success: true, message: `Event ${target.event_name} berhasil dihapus.` };
  }

  // --- Registrations & Stand Booking with LockService ---
  getRegistrations(eventId?: string): EventRegistration[] {
    const rawRegs = this.getItem(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const regs: EventRegistration[] = Array.isArray(rawRegs)
      ? rawRegs.map((r: any) => ({
          ...r,
          stand_code: String(r?.stand_code ?? '').trim(),
          registration_id: String(r?.registration_id ?? '').trim(),
          member_id: String(r?.member_id ?? '').trim(),
        }))
      : [];
    return eventId ? regs.filter((r) => r.event_id === eventId) : regs;
  }

  async reserveStand(
    eventId: string,
    standCode: string,
    memberId: string,
    notes?: string
  ): Promise<{ success: boolean; message: string; registration?: EventRegistration }> {
    const cleanStandCode = String(standCode || '').trim().toUpperCase();
    const lockAcquired = await this.acquireLock(4000);
    if (!lockAcquired) {
      return {
        success: false,
        message: 'Sistem sedang sibuk memproses reservasi lain. Silakan coba kembali dalam beberapa detik.',
      };
    }

    try {
      this.cleanExpiredReservations();
      const allRegs = this.getRegistrations(eventId);

      // Check if stand already taken in this event
      const occupied = allRegs.find(
        (r) =>
          String(r.stand_code || '').trim().toUpperCase() === cleanStandCode &&
          ['RESERVED', 'WAITING_PAYMENT', 'PAYMENT_VERIFICATION', 'CONFIRMED'].includes(r.registration_status)
      );

      if (occupied) {
        return {
          success: false,
          message: 'Maaf, stand ini baru saja dipilih anggota lain. Silakan pilih stand lainnya.',
        };
      }

      // Check if member already has active registration in this event
      const existingMemberBooking = allRegs.find(
        (r) =>
          r.member_id === memberId &&
          ['WAITING_PAYMENT', 'PAYMENT_VERIFICATION', 'CONFIRMED'].includes(r.registration_status)
      );

      if (existingMemberBooking) {
        return {
          success: false,
          message: `Anda sudah terdaftar pada Stand ${existingMemberBooking.stand_code} untuk event ini.`,
        };
      }

      // Deterministic price calculation
      const standPrice = getStandPrice(standCode);
      const now = new Date();
      // Payment deadline is 2 Hours (120 min) from booking
      const deadline = new Date(now.getTime() + 120 * 60 * 1000).toISOString();
      const registrationId = `REG-${eventId.replace('BWM-', '')}-${standCode}-${Date.now().toString().slice(-4)}`;

      const newRegistration: EventRegistration = {
        registration_id: registrationId,
        event_id: eventId,
        member_id: memberId,
        stand_code: standCode.toUpperCase(),
        stand_price: standPrice,
        registration_date: now.toISOString(),
        registration_status: 'WAITING_PAYMENT',
        payment_status: 'UNPAID',
        payment_deadline: deadline,
        check_in_status: 'NOT_CHECKED_IN',
        notes: notes || `Pendaftaran Stand ${standCode.toUpperCase()} (${memberId})`,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      const registrations = this.getRegistrations();
      registrations.push(newRegistration);
      this.setItem(STORAGE_KEYS.REGISTRATIONS, registrations);

      // Sync row to Google Spreadsheet
      googleWorkspaceSync.syncRowToSpreadsheet('SHEET_STAND_REGISTRASI', registrationId, {
        registration_id: registrationId,
        event_id: eventId,
        member_id: memberId,
        stand_code: standCode.toUpperCase(),
        stand_price: standPrice,
        registration_status: 'WAITING_PAYMENT',
        payment_status: 'UNPAID',
        payment_deadline: deadline,
      });

      this.logAudit({
        user_id: memberId,
        user_role: 'MEMBER',
        action: 'RESERVE_STAND',
        module: 'STAND',
        reference_id: registrationId,
        description: `Reservasi Stand ${standCode} (Rp${standPrice.toLocaleString('id-ID')}) untuk Event ${eventId} berhasil tercatat di Google Spreadsheet. Menunggu pembayaran hingga ${new Date(deadline).toLocaleTimeString('id-ID')}`,
        result: 'SUCCESS',
      });

      const targetMember = this.getMemberById(memberId);
      const memberName = targetMember ? targetMember.nama_lengkap : memberId;
      this.addNotification({
        title: `Pesanan Stand Baru (${standCode})`,
        message: `${memberName} telah memesan Stand ${standCode} (${eventId}). Total biaya Rp${standPrice.toLocaleString('id-ID')}.`,
        type: 'SUCCESS',
      });
      this.persistToServer();

      return {
        success: true,
        message: 'Stand berhasil direservasi! Silakan selesaikan pembayaran dan unggah bukti transfer.',
        registration: newRegistration,
      };
    } finally {
      this.releaseLock();
    }
  }

  // --- Admin Stand Registration Management ---
  assignStandManual(
    params: {
      eventId: string;
      standCode: string;
      memberId: string;
      standPrice?: number;
      registrationStatus?: EventRegistration['registration_status'];
      paymentStatus?: EventRegistration['payment_status'];
      checkInStatus?: EventRegistration['check_in_status'];
      notes?: string;
    },
    adminId: string
  ): { success: boolean; message: string; registration?: EventRegistration } {
    const cleanStandCode = String(params.standCode || '').trim().toUpperCase();
    const allRegs = this.getRegistrations(params.eventId);
    const existing = allRegs.find(
      (r) =>
        String(r.stand_code || '').trim().toUpperCase() === cleanStandCode &&
        ['RESERVED', 'WAITING_PAYMENT', 'PAYMENT_VERIFICATION', 'CONFIRMED'].includes(r.registration_status)
    );
    if (existing) {
      return { success: false, message: `Stand ${params.standCode} sudah terisi oleh ${existing.member_id}.` };
    }

    const price = params.standPrice ?? getStandPrice(params.standCode);
    const now = new Date().toISOString();
    const registrationId = `REG-${params.eventId.replace('BWM-', '')}-${params.standCode.toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newReg: EventRegistration = {
      registration_id: registrationId,
      event_id: params.eventId,
      member_id: params.memberId,
      stand_code: params.standCode.toUpperCase(),
      stand_price: price,
      registration_date: now,
      registration_status: params.registrationStatus || 'CONFIRMED',
      payment_status: params.paymentStatus || 'PAID',
      payment_deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      check_in_status: params.checkInStatus || 'NOT_CHECKED_IN',
      notes: params.notes || `Penetapan manual oleh Super Admin`,
      created_at: now,
      updated_at: now,
    };

    const regs = this.getRegistrations();
    regs.push(newReg);
    this.setItem(STORAGE_KEYS.REGISTRATIONS, regs);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_STAND_REGISTRASI', registrationId, {
      registration_id: registrationId,
      event_id: params.eventId,
      member_id: params.memberId,
      stand_code: params.standCode.toUpperCase(),
      stand_price: price,
      registration_status: newReg.registration_status,
      payment_status: newReg.payment_status,
    });

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'ADMIN_ASSIGN_STAND',
      module: 'STAND',
      reference_id: registrationId,
      description: `Super Admin menetapkan Stand ${params.standCode} ke anggota ${params.memberId} (Status: ${newReg.registration_status})`,
      result: 'SUCCESS',
    });

    return { success: true, message: `Stand ${params.standCode} berhasil dialokasikan.`, registration: newReg };
  }

  updateRegistration(registrationId: string, updates: Partial<EventRegistration>, adminId: string): boolean {
    const regs = this.getRegistrations();
    const idx = regs.findIndex((r) => r.registration_id === registrationId);
    if (idx === -1) return false;

    regs[idx] = {
      ...regs[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.REGISTRATIONS, regs);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_STAND_REGISTRASI', registrationId, {
      registration_id: registrationId,
      event_id: regs[idx].event_id,
      member_id: regs[idx].member_id,
      stand_code: regs[idx].stand_code,
      stand_price: regs[idx].stand_price,
      registration_status: regs[idx].registration_status,
      payment_status: regs[idx].payment_status,
      check_in_status: regs[idx].check_in_status,
    });

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_REGISTRATION',
      module: 'STAND',
      reference_id: registrationId,
      description: `Super Admin mengubah data registrasi Stand ${regs[idx].stand_code} (${registrationId})`,
      result: 'SUCCESS',
    });
    return true;
  }

  deleteRegistration(registrationId: string, adminId: string): boolean {
    const regs = this.getRegistrations();
    const target = regs.find((r) => r.registration_id === registrationId);
    if (!target) return false;

    const filtered = regs.filter((r) => r.registration_id !== registrationId);
    this.setItem(STORAGE_KEYS.REGISTRATIONS, filtered);

    googleWorkspaceSync.deleteSpreadsheetRow('SHEET_STAND_REGISTRASI', registrationId);

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'DELETE_REGISTRATION',
      module: 'STAND',
      reference_id: registrationId,
      description: `Super Admin menghapus/mengosongkan alokasi Stand ${target.stand_code} (${registrationId})`,
      result: 'SUCCESS',
    });
    return true;
  }

  // --- Payments ---
  getPayments(memberId?: string): Payment[] {
    const pays = this.getItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    return memberId ? pays.filter((p) => p.member_id === memberId) : pays;
  }

  uploadPaymentProof(params: {
    registration_id?: string;
    member_id: string;
    payment_type: Payment['payment_type'];
    amount: number;
    payment_method: Payment['payment_method'];
    proof_file_url: string;
    proof_file_name?: string;
  }): Payment {
    const payments = this.getPayments();
    const now = new Date();
    const paymentId = `PAY-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

    // Sync payment proof photo to Google Drive
    const driveFile = googleWorkspaceSync.syncFileToGoogleDrive({
      fileName: params.proof_file_name || `Bukti_Bayar_${paymentId}_${params.member_id}.jpg`,
      fileUrl: params.proof_file_url,
      category: 'BUKTI_PEMBAYARAN',
      uploadedBy: params.member_id,
      memberId: params.member_id,
      referenceId: paymentId,
    });

    const newPayment: Payment = {
      payment_id: paymentId,
      registration_id: params.registration_id,
      member_id: params.member_id,
      payment_type: params.payment_type,
      amount: params.amount,
      payment_method: params.payment_method,
      payment_date: now.toISOString().split('T')[0],
      proof_file_id: driveFile.fileId,
      proof_file_url: params.proof_file_url,
      verification_status: 'PENDING',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    payments.unshift(newPayment);
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);

    // Sync to Google Spreadsheet
    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_BUKTI_PEMBAYARAN', paymentId, {
      payment_id: paymentId,
      member_id: params.member_id,
      registration_id: params.registration_id || '-',
      payment_type: params.payment_type,
      amount: params.amount,
      payment_method: params.payment_method,
      payment_date: newPayment.payment_date,
      proof_drive_url: driveFile.driveUrl,
      verification_status: 'PENDING',
    });

    // If for an event registration, update registration status
    if (params.registration_id) {
      const registrations = this.getRegistrations();
      const regIdx = registrations.findIndex((r) => r.registration_id === params.registration_id);
      if (regIdx !== -1) {
        registrations[regIdx] = {
          ...registrations[regIdx],
          registration_status: 'PAYMENT_VERIFICATION',
          payment_status: 'PENDING_VERIFICATION',
          updated_at: now.toISOString(),
        };
        this.setItem(STORAGE_KEYS.REGISTRATIONS, registrations);
      }
    }

    this.logAudit({
      user_id: params.member_id,
      user_role: 'MEMBER',
      action: 'UPLOAD_PAYMENT',
      module: 'PAYMENT',
      reference_id: paymentId,
      description: `Upload bukti bayar ${params.payment_type} sebesar Rp${params.amount.toLocaleString('id-ID')} (${params.payment_method}) ke Google Drive ${driveFile.folderPath} dan Google Sheets`,
      result: 'SUCCESS',
    });

    const payerMember = this.getMemberById(params.member_id);
    const payerName = payerMember ? payerMember.nama_lengkap : params.member_id;
    this.addNotification({
      title: 'Bukti Pembayaran Baru Masuk',
      message: `${payerName} mengunggah bukti transfer ${params.payment_type.replace('_', ' ')} sebesar Rp${params.amount.toLocaleString('id-ID')}. Menunggu verifikasi admin.`,
      type: 'INFO',
    });
    this.persistToServer();

    return newPayment;
  }

  verifyPayment(
    paymentId: string,
    adminId: string,
    isApproved: boolean,
    rejectionReason?: string
  ): { success: boolean; message: string } {
    const payments = this.getPayments();
    const payIdx = payments.findIndex((p) => p.payment_id === paymentId);
    if (payIdx === -1) {
      return { success: false, message: 'Pembayaran tidak ditemukan' };
    }

    const pay = payments[payIdx];
    const now = new Date().toISOString();

    payments[payIdx] = {
      ...pay,
      verification_status: isApproved ? 'VERIFIED' : 'REJECTED',
      verified_by: adminId,
      verified_at: now,
      rejection_reason: isApproved ? undefined : rejectionReason || 'Bukti transfer tidak valid atau nominal tidak sesuai',
      updated_at: now,
    };
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);

    // If linked to event registration
    if (pay.registration_id) {
      const registrations = this.getRegistrations();
      const regIdx = registrations.findIndex((r) => r.registration_id === pay.registration_id);
      if (regIdx !== -1) {
        registrations[regIdx] = {
          ...registrations[regIdx],
          registration_status: isApproved ? 'CONFIRMED' : 'REJECTED',
          payment_status: isApproved ? 'PAID' : 'REJECTED',
          updated_at: now,
        };
        this.setItem(STORAGE_KEYS.REGISTRATIONS, registrations);
      }
    }

    // If it is a savings payment and approved, record in Savings sheet
    if (isApproved && (pay.payment_type === 'SIMPANAN_POKOK' || pay.payment_type === 'SIMPANAN_WAJIB' || pay.payment_type === 'SIMPANAN_SUKARELA')) {
      const savings = this.getSavings();
      const savingId = `SAV-${now.slice(0, 7).replace('-', '')}-${Date.now().toString().slice(-4)}`;
      const newSaving: Saving = {
        saving_id: savingId,
        member_id: pay.member_id,
        saving_type: pay.payment_type,
        amount: pay.amount,
        payment_id: pay.payment_id,
        payment_status: 'PAID',
        payment_date: pay.payment_date,
        period_month_year: now.slice(0, 7),
        notes: `Setoran ${pay.payment_type.replace('_', ' ')} terverifikasi`,
        created_at: now,
      };
      savings.push(newSaving);
      this.setItem(STORAGE_KEYS.SAVINGS, savings);
    }

    this.logAudit({
      user_id: adminId,
      user_role: 'ADMIN_KOPERASI',
      action: isApproved ? 'VERIFY_PAYMENT' : 'REJECT_PAYMENT',
      module: 'PAYMENT',
      reference_id: paymentId,
      description: `Pembayaran ${paymentId} (Rp${pay.amount.toLocaleString('id-ID')}) untuk anggota ${pay.member_id} ${isApproved ? 'DIVERIFIKASI' : 'DITOLAK: ' + rejectionReason}`,
      result: 'SUCCESS',
    });

    const targetMember = this.getMemberById(pay.member_id);
    const targetName = targetMember ? targetMember.nama_lengkap : pay.member_id;
    this.addNotification({
      title: isApproved ? 'Pembayaran Diverifikasi' : 'Pembayaran Ditolak',
      message: isApproved
        ? `Pembayaran ${pay.payment_type.replace('_', ' ')} anggota ${targetName} sebesar Rp${pay.amount.toLocaleString('id-ID')} telah disetujui.`
        : `Pembayaran anggota ${targetName} ditolak. Alasan: ${rejectionReason || 'Bukti tidak sesuai'}.`,
      type: isApproved ? 'SUCCESS' : 'ALERT',
    });
    this.persistToServer();

    return {
      success: true,
      message: isApproved ? 'Pembayaran berhasil diverifikasi!' : 'Pembayaran berhasil ditolak dengan catatan alasan.',
    };
  }

  createPaymentManual(
    params: {
      member_id: string;
      registration_id?: string;
      payment_type: Payment['payment_type'];
      amount: number;
      payment_method: Payment['payment_method'];
      verification_status?: Payment['verification_status'];
      payment_date?: string;
      notes?: string;
    },
    adminId: string
  ): Payment {
    const payments = this.getPayments();
    const now = new Date();
    const paymentId = `PAY-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

    const newPayment: Payment = {
      payment_id: paymentId,
      registration_id: params.registration_id,
      member_id: params.member_id,
      payment_type: params.payment_type,
      amount: params.amount,
      payment_method: params.payment_method,
      payment_date: params.payment_date || now.toISOString().split('T')[0],
      proof_file_id: `DRV-PROOF-${Date.now().toString().slice(-4)}`,
      proof_file_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      verification_status: params.verification_status || 'VERIFIED',
      verified_by: adminId,
      verified_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    payments.unshift(newPayment);
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_BUKTI_PEMBAYARAN', paymentId, {
      payment_id: paymentId,
      member_id: params.member_id,
      registration_id: params.registration_id || '-',
      payment_type: params.payment_type,
      amount: params.amount,
      payment_method: params.payment_method,
      payment_date: newPayment.payment_date,
      verification_status: newPayment.verification_status,
    });

    if (newPayment.verification_status === 'VERIFIED' && (params.payment_type === 'SIMPANAN_POKOK' || params.payment_type === 'SIMPANAN_WAJIB' || params.payment_type === 'SIMPANAN_SUKARELA')) {
      const savings = this.getSavings();
      const savingId = `SAV-${now.toISOString().slice(0, 7).replace('-', '')}-${Date.now().toString().slice(-4)}`;
      const newSaving: Saving = {
        saving_id: savingId,
        member_id: params.member_id,
        saving_type: params.payment_type,
        amount: params.amount,
        payment_id: paymentId,
        payment_status: 'PAID',
        payment_date: newPayment.payment_date,
        period_month_year: now.toISOString().slice(0, 7),
        notes: params.notes || `Input manual kas oleh Super Admin`,
        created_at: now.toISOString(),
      };
      savings.push(newSaving);
      this.setItem(STORAGE_KEYS.SAVINGS, savings);
    }

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'ADMIN_CREATE_PAYMENT',
      module: 'PAYMENT',
      reference_id: paymentId,
      description: `Super Admin menambahkan data transaksi pembayaran manual ${paymentId} (Rp${params.amount.toLocaleString('id-ID')}) untuk anggota ${params.member_id}`,
      result: 'SUCCESS',
    });

    return newPayment;
  }

  updatePayment(paymentId: string, updates: Partial<Payment>, adminId: string): boolean {
    const payments = this.getPayments();
    const idx = payments.findIndex((p) => p.payment_id === paymentId);
    if (idx === -1) return false;

    payments[idx] = {
      ...payments[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_BUKTI_PEMBAYARAN', paymentId, {
      payment_id: paymentId,
      member_id: payments[idx].member_id,
      payment_type: payments[idx].payment_type,
      amount: payments[idx].amount,
      verification_status: payments[idx].verification_status,
      payment_method: payments[idx].payment_method,
    });

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_PAYMENT',
      module: 'PAYMENT',
      reference_id: paymentId,
      description: `Super Admin memperbarui data pembayaran ${paymentId}`,
      result: 'SUCCESS',
    });
    return true;
  }

  deletePayment(paymentId: string, adminId: string): boolean {
    const payments = this.getPayments();
    const target = payments.find((p) => p.payment_id === paymentId);
    if (!target) return false;

    const filtered = payments.filter((p) => p.payment_id !== paymentId);
    this.setItem(STORAGE_KEYS.PAYMENTS, filtered);

    googleWorkspaceSync.deleteSpreadsheetRow('SHEET_BUKTI_PEMBAYARAN', paymentId);

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'DELETE_PAYMENT',
      module: 'PAYMENT',
      reference_id: paymentId,
      description: `Super Admin menghapus data pembayaran ${paymentId} (Rp${target.amount.toLocaleString('id-ID')})`,
      result: 'SUCCESS',
    });
    return true;
  }

  // --- Savings (Buku Kas Simpanan Anggota) ---
  getSavings(memberId?: string): Saving[] {
    const savs = this.getItem(STORAGE_KEYS.SAVINGS, INITIAL_SAVINGS);
    return memberId ? savs.filter((s) => s.member_id === memberId) : savs;
  }

  createSavingManual(
    params: {
      member_id: string;
      saving_type: Saving['saving_type'];
      amount: number;
      period_month_year: string;
      payment_status?: Saving['payment_status'];
      payment_date?: string;
      notes?: string;
    },
    adminId: string
  ): Saving {
    const savings = this.getSavings();
    const now = new Date().toISOString();
    const savingId = `SAV-${params.period_month_year.replace('-', '')}-${Date.now().toString().slice(-4)}`;

    const newSaving: Saving = {
      saving_id: savingId,
      member_id: params.member_id,
      saving_type: params.saving_type,
      amount: params.amount,
      payment_status: params.payment_status || 'PAID',
      payment_date: params.payment_date || now.split('T')[0],
      period_month_year: params.period_month_year,
      notes: params.notes || `Input manual oleh Super Admin`,
      created_at: now,
    };

    savings.push(newSaving);
    this.setItem(STORAGE_KEYS.SAVINGS, savings);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_KAS_SIMPANAN', savingId, {
      saving_id: savingId,
      member_id: params.member_id,
      saving_type: params.saving_type,
      amount: params.amount,
      period: params.period_month_year,
      status: newSaving.payment_status,
    });

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'ADMIN_CREATE_SAVING',
      module: 'SAVING',
      reference_id: savingId,
      description: `Super Admin mencatat simpanan ${params.saving_type} sebesar Rp${params.amount.toLocaleString('id-ID')} untuk ${params.member_id} periode ${params.period_month_year}`,
      result: 'SUCCESS',
    });

    return newSaving;
  }

  updateSaving(savingId: string, updates: Partial<Saving>, adminId: string): boolean {
    const savings = this.getSavings();
    const idx = savings.findIndex((s) => s.saving_id === savingId);
    if (idx === -1) return false;

    savings[idx] = {
      ...savings[idx],
      ...updates,
    };
    this.setItem(STORAGE_KEYS.SAVINGS, savings);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_KAS_SIMPANAN', savingId, {
      saving_id: savingId,
      member_id: savings[idx].member_id,
      saving_type: savings[idx].saving_type,
      amount: savings[idx].amount,
      period: savings[idx].period_month_year,
      status: savings[idx].payment_status,
    });

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_SAVING',
      module: 'SAVING',
      reference_id: savingId,
      description: `Super Admin mengubah data simpanan kas ${savingId}`,
      result: 'SUCCESS',
    });
    return true;
  }

  deleteSaving(savingId: string, adminId: string): boolean {
    const savings = this.getSavings();
    const target = savings.find((s) => s.saving_id === savingId);
    if (!target) return false;

    const filtered = savings.filter((s) => s.saving_id !== savingId);
    this.setItem(STORAGE_KEYS.SAVINGS, filtered);

    googleWorkspaceSync.deleteSpreadsheetRow('SHEET_KAS_SIMPANAN', savingId);

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'DELETE_SAVING',
      module: 'SAVING',
      reference_id: savingId,
      description: `Super Admin menghapus data simpanan ${savingId} (Rp${target.amount.toLocaleString('id-ID')})`,
      result: 'SUCCESS',
    });
    return true;
  }

  getMemberSavingsSummary(memberId: string) {
    const savings = this.getSavings(memberId);
    const simpananPokok = savings
      .filter((s) => s.saving_type === 'SIMPANAN_POKOK' && s.payment_status === 'PAID')
      .reduce((sum, s) => sum + s.amount, 0);

    const simpananWajib = savings
      .filter((s) => s.saving_type === 'SIMPANAN_WAJIB' && s.payment_status === 'PAID')
      .reduce((sum, s) => sum + s.amount, 0);

    const simpananSukarela = savings
      .filter((s) => s.saving_type === 'SIMPANAN_SUKARELA' && s.payment_status === 'PAID')
      .reduce((sum, s) => sum + s.amount, 0);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const isWajibCurrentMonthPaid = savings.some(
      (s) => s.saving_type === 'SIMPANAN_WAJIB' && s.period_month_year === currentMonth && s.payment_status === 'PAID'
    );

    return {
      simpananPokok,
      simpananWajib,
      simpananSukarela,
      totalSimpanan: simpananPokok + simpananWajib + simpananSukarela,
      isWajibCurrentMonthPaid,
    };
  }

  // --- Sales Reports (Laporan Omzet Penjualan UMKM) ---
  getSalesReports(memberId?: string, eventId?: string): SalesReport[] {
    let reports = this.getItem(STORAGE_KEYS.SALES_REPORTS, INITIAL_SALES_REPORTS);
    if (memberId) {
      reports = reports.filter((r) => r.member_id === memberId);
    }
    if (eventId) {
      reports = reports.filter((r) => r.event_id === eventId);
    }
    return reports;
  }

  submitSalesReport(reportData: Omit<SalesReport, 'sales_report_id' | 'submitted_at' | 'report_status'>): SalesReport {
    const reports = this.getSalesReports();
    const id = `SLR-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newReport: SalesReport = {
      ...reportData,
      sales_report_id: id,
      report_status: 'SUBMITTED',
      submitted_at: now,
    };

    reports.unshift(newReport);
    this.setItem(STORAGE_KEYS.SALES_REPORTS, reports);

    // Sync to Google Spreadsheet
    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_OMZET_PENJUALAN', id, {
      sales_report_id: id,
      event_id: reportData.event_id,
      member_id: reportData.member_id,
      gross_sales: reportData.gross_sales,
      cost: reportData.cost,
      net_profit: reportData.net_profit,
      total_items_sold: reportData.total_items_sold,
      submitted_at: now,
    });

    this.logAudit({
      user_id: reportData.member_id,
      user_role: 'MEMBER',
      action: 'SUBMIT_SALES_REPORT',
      module: 'SALES_REPORT',
      reference_id: id,
      description: `Laporan penjualan event ${reportData.event_id} dikirim: Omzet Rp${reportData.gross_sales.toLocaleString('id-ID')}, Laba Bersih Rp${reportData.net_profit.toLocaleString('id-ID')}`,
      result: 'SUCCESS',
    });

    this.addNotification({
      title: 'Laporan Penjualan Diterima',
      message: `Terima kasih telah melaporkan omzet sebesar Rp${reportData.gross_sales.toLocaleString('id-ID')}. Data telah tersimpan di sistem UMKM.`,
      type: 'SUCCESS',
    });

    return newReport;
  }

  createSalesReportManual(
    params: {
      event_id: string;
      member_id: string;
      registration_id?: string;
      gross_sales: number;
      cost: number;
      net_profit: number;
      total_items_sold: number;
      top_selling_product?: string;
      notes?: string;
    },
    adminId: string
  ): SalesReport {
    const reports = this.getSalesReports();
    const id = `SLR-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newReport: SalesReport = {
      sales_report_id: id,
      event_id: params.event_id,
      member_id: params.member_id,
      registration_id: params.registration_id || '-',
      total_transactions: params.total_items_sold,
      total_items_sold: params.total_items_sold,
      gross_sales: params.gross_sales,
      cost: params.cost,
      net_profit: params.net_profit,
      report_status: 'VERIFIED',
      submitted_at: now,
      verified_by: adminId,
      verified_at: now,
      notes: params.notes || (params.top_selling_product ? `Produk Terlaris: ${params.top_selling_product}` : undefined),
    };

    reports.unshift(newReport);
    this.setItem(STORAGE_KEYS.SALES_REPORTS, reports);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_OMZET_PENJUALAN', id, {
      sales_report_id: id,
      event_id: params.event_id,
      member_id: params.member_id,
      gross_sales: params.gross_sales,
      cost: params.cost,
      net_profit: params.net_profit,
      total_items_sold: params.total_items_sold,
      submitted_at: now,
    });

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'ADMIN_CREATE_SALES_REPORT',
      module: 'SALES_REPORT',
      reference_id: id,
      description: `Super Admin input laporan omzet ${params.member_id}: Rp${params.gross_sales.toLocaleString('id-ID')} (Laba Rp${params.net_profit.toLocaleString('id-ID')})`,
      result: 'SUCCESS',
    });

    return newReport;
  }

  updateSalesReport(reportId: string, updates: Partial<SalesReport>, adminId: string): boolean {
    const reports = this.getSalesReports();
    const idx = reports.findIndex((r) => r.sales_report_id === reportId);
    if (idx === -1) return false;

    reports[idx] = {
      ...reports[idx],
      ...updates,
    };
    this.setItem(STORAGE_KEYS.SALES_REPORTS, reports);

    googleWorkspaceSync.syncRowToSpreadsheet('SHEET_OMZET_PENJUALAN', reportId, {
      sales_report_id: reportId,
      event_id: reports[idx].event_id,
      member_id: reports[idx].member_id,
      gross_sales: reports[idx].gross_sales,
      cost: reports[idx].cost,
      net_profit: reports[idx].net_profit,
      total_items_sold: reports[idx].total_items_sold,
    });

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_SALES_REPORT',
      module: 'SALES_REPORT',
      reference_id: reportId,
      description: `Super Admin memperbarui laporan omzet ${reportId}`,
      result: 'SUCCESS',
    });
    return true;
  }

  deleteSalesReport(reportId: string, adminId: string): boolean {
    const reports = this.getSalesReports();
    const target = reports.find((r) => r.sales_report_id === reportId);
    if (!target) return false;

    const filtered = reports.filter((r) => r.sales_report_id !== reportId);
    this.setItem(STORAGE_KEYS.SALES_REPORTS, filtered);

    googleWorkspaceSync.deleteSpreadsheetRow('SHEET_OMZET_PENJUALAN', reportId);

    this.logAudit({
      user_id: adminId,
      user_role: 'SUPER_ADMIN',
      action: 'DELETE_SALES_REPORT',
      module: 'SALES_REPORT',
      reference_id: reportId,
      description: `Super Admin menghapus laporan omzet ${reportId} (Rp${target.gross_sales.toLocaleString('id-ID')})`,
      result: 'SUCCESS',
    });
    return true;
  }

  // --- Check-in & KTA Verification via Barcode / QR Code ---
  processEventCheckIn(
    scannedText: string,
    eventId: string,
    adminId: string
  ): {
    success: boolean;
    message: string;
    isMemberVerified?: boolean;
    registration?: EventRegistration;
    member?: Member;
  } {
    const raw = scannedText.trim();
    if (!raw) {
      return { success: false, message: 'Kode barcode / QR kosong.' };
    }

    // Extract ID from URL if formatted like https://...?id=BM-0001
    let cleanCode = raw;
    try {
      if (raw.includes('http://') || raw.includes('https://')) {
        const parsed = new URL(raw);
        const queryId = parsed.searchParams.get('id');
        if (queryId) cleanCode = queryId.trim();
      } else if (raw.startsWith('{') && raw.endsWith('}')) {
        const json = JSON.parse(raw);
        if (json.member_id) cleanCode = json.member_id;
        else if (json.id) cleanCode = json.id;
      }
    } catch {
      // Use raw if parsing fails
    }

    const cleanUpper = cleanCode.toUpperCase();
    const members = this.getMembers();
    const registrations = this.getRegistrations(eventId);

    // 1. Find Member from Spreadsheet database
    const matchedMember = members.find((m) => {
      const mId = String(m.member_id || '').toUpperCase();
      const mNomor = String(m.nomor_anggota || '').toUpperCase();
      const mNik = String(m.nik || '');
      const mEmail = String(m.email || '').toLowerCase();
      const mPhone = String(m.whatsapp || m.nomor_hp || '').replace(/[^0-9]/g, '');
      const rawDigits = cleanCode.replace(/[^0-9]/g, '');

      return (
        mId === cleanUpper ||
        mNomor === cleanUpper ||
        (mNik && mNik === cleanCode) ||
        (mEmail && mEmail === cleanCode.toLowerCase()) ||
        (rawDigits.length >= 6 && mPhone.includes(rawDigits))
      );
    });

    // 2. Find Event Registration (Stand)
    const targetMemberId = matchedMember ? matchedMember.member_id : cleanCode;
    const targetMemberUpper = String(targetMemberId || '').toUpperCase();
    const reg = registrations.find(
      (r) =>
        String(r.member_id || '').toUpperCase() === targetMemberUpper ||
        String(r.registration_id || '').toUpperCase() === cleanUpper ||
        String(r.stand_code || '').toUpperCase() === cleanUpper
    );

    // Case A: Member found and has stand registration in this event
    if (reg) {
      const member = matchedMember || this.getMemberById(reg.member_id);

      if (reg.check_in_status === 'CHECKED_IN') {
        return {
          success: true,
          isMemberVerified: true,
          message: `Anggota ${member?.nama_lengkap || reg.member_id} (${member?.nama_usaha || 'Stand ' + reg.stand_code}) sudah check-in sebelumnya pada ${new Date(
            reg.check_in_time || ''
          ).toLocaleTimeString('id-ID')}. Data tersinkron dengan Google Spreadsheet.`,
          registration: reg,
          member,
        };
      }

      if (reg.registration_status === 'CONFIRMED') {
        const now = new Date().toISOString();
        const allRegs = this.getRegistrations();
        const idx = allRegs.findIndex((r) => r.registration_id === reg.registration_id);
        if (idx !== -1) {
          allRegs[idx] = {
            ...allRegs[idx],
            check_in_status: 'CHECKED_IN',
            check_in_time: now,
            updated_at: now,
          };
          this.setItem(STORAGE_KEYS.REGISTRATIONS, allRegs);

          // Update spreadsheet
          googleWorkspaceSync.syncRowToSpreadsheet('SHEET_STAND_REGISTRASI', reg.registration_id, {
            check_in_status: 'CHECKED_IN',
            check_in_time: now,
          });
        }

        this.logAudit({
          user_id: adminId,
          user_role: 'ADMIN_EVENT',
          action: 'CHECK_IN_TENANT',
          module: 'EVENT',
          reference_id: reg.registration_id,
          description: `Check-in barcode tenant ${member?.nama_lengkap} di Stand ${reg.stand_code} berhasil terverifikasi.`,
          result: 'SUCCESS',
        });

        return {
          success: true,
          isMemberVerified: true,
          message: `Check-in Berhasil! Anggota ${member?.nama_lengkap} (${member?.nama_usaha}) terverifikasi di Stand ${reg.stand_code}.`,
          registration: allRegs[idx] || reg,
          member,
        };
      } else {
        return {
          success: true,
          isMemberVerified: true,
          message: `KTA Anggota Valid (${member?.nama_lengkap}). Namun alokasi Stand ${reg.stand_code} saat ini berstatus: ${reg.registration_status} (Belum Terkonfirmasi Lunas).`,
          registration: reg,
          member,
        };
      }
    }

    // Case B: Member is registered in Spreadsheet Koperasi, but no stand in this event
    if (matchedMember) {
      return {
        success: true,
        isMemberVerified: true,
        message: `KTA Terverifikasi Sah di Google Sheets! Anggota: ${matchedMember.nama_lengkap} (${matchedMember.nama_usaha}) - No. Anggota: ${matchedMember.nomor_anggota}. Belum melakukan pemesanan stand pada event ini.`,
        member: matchedMember,
      };
    }

    // Case C: Neither member nor registration found
    return {
      success: false,
      isMemberVerified: false,
      message: `Barcode / QR Code "${cleanCode}" tidak terdaftar di database Google Sheets Koperasi Berau Melangkah Bersama.`,
    };
  }

  // --- Financial & Statistics Separator (CRITICAL BUSINESS RULE) ---
  getAggregatedStats() {
    const members = this.getMembers();
    const registrations = this.getRegistrations();
    const payments = this.getPayments();
    const savings = this.getSavings();
    const salesReports = this.getSalesReports();

    // 1. PENDAPATAN KAS KOPERASI
    const confirmedEventRegs = registrations.filter((r) => r.registration_status === 'CONFIRMED' || r.payment_status === 'PAID');
    const totalPendapatanPartisipasiStand = confirmedEventRegs.reduce((sum, r) => sum + r.stand_price, 0);

    const verifiedSavings = savings.filter((s) => s.payment_status === 'PAID');
    const totalSimpananPokok = verifiedSavings
      .filter((s) => s.saving_type === 'SIMPANAN_POKOK')
      .reduce((sum, s) => sum + s.amount, 0);
    const totalSimpananWajib = verifiedSavings
      .filter((s) => s.saving_type === 'SIMPANAN_WAJIB')
      .reduce((sum, s) => sum + s.amount, 0);
    const totalSimpananSukarela = verifiedSavings
      .filter((s) => s.saving_type === 'SIMPANAN_SUKARELA')
      .reduce((sum, s) => sum + s.amount, 0);
    const totalSemuaSimpanan = totalSimpananPokok + totalSimpananWajib + totalSimpananSukarela;

    const totalKasMasukKoperasi = totalPendapatanPartisipasiStand + totalSemuaSimpanan;

    // 2. OMZET PENJUALAN UMKM (TERPISAH DARI KAS KOPERASI)
    const totalOmzetUMKM = salesReports.reduce((sum, r) => sum + r.gross_sales, 0);
    const totalLabaBersihUMKM = salesReports.reduce((sum, r) => sum + r.net_profit, 0);
    const totalProdukTerjual = salesReports.reduce((sum, r) => sum + r.total_items_sold, 0);
    const rataRataOmzetPerTenant = salesReports.length > 0 ? Math.round(totalOmzetUMKM / salesReports.length) : 0;

    // Stand Occupancy for active event
    const activeEvent = this.getEvents()[0];
    const activeRegs = registrations.filter((r) => r.event_id === activeEvent?.event_id);
    const standTerisi = activeRegs.filter((r) => ['CONFIRMED', 'PAYMENT_VERIFICATION', 'WAITING_PAYMENT'].includes(r.registration_status)).length;
    const standAvailable = 64 - standTerisi;

    return {
      // Cooperative Finances
      totalPendapatanPartisipasiStand,
      totalSemuaSimpanan,
      totalSimpananPokok,
      totalSimpananWajib,
      totalSimpananSukarela,
      totalKasMasukKoperasi,
      pembayaranPendingCount: payments.filter((p) => p.verification_status === 'PENDING').length,

      // UMKM Merchant Metrics
      totalOmzetUMKM,
      totalLabaBersihUMKM,
      totalProdukTerjual,
      rataRataOmzetPerTenant,

      // Member & Event Counts
      totalAnggota: members.length,
      anggotaAktif: members.filter((m) => m.status_keanggotaan === 'ACTIVE').length,
      standTerisi,
      standAvailable,
      standTotal: 64,
    };
  }

  // --- Announcements, News, Gallery, Sponsors, Audit ---
  getAnnouncements(): Announcement[] {
    return this.getItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }

  addAnnouncement(ann: Omit<Announcement, 'announcement_id' | 'created_at'>): Announcement {
    const anns = this.getAnnouncements();
    const id = `ANN-${Date.now().toString().slice(-4)}`;
    const newAnn: Announcement = {
      ...ann,
      announcement_id: id,
      created_at: new Date().toISOString(),
    };
    anns.unshift(newAnn);
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, anns);
    return newAnn;
  }

  getNews(): NewsItem[] {
    return this.getItem(STORAGE_KEYS.NEWS, INITIAL_NEWS);
  }

  getGallery(): GalleryItem[] {
    return this.getItem(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
  }

  getSponsors(): Sponsor[] {
    return this.getItem(STORAGE_KEYS.SPONSORS, INITIAL_SPONSORS);
  }

  getAuditLogs(): AuditLog[] {
    return this.getItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  logAudit(log: Omit<AuditLog, 'log_id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      log_id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // --- In-App Notifications ---
  getNotifications(): AppNotification[] {
    return this.getItem(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'NOTIF-1',
        title: 'Pendaftaran Stand Banuarasa #1 Dibuka!',
        message: 'Pilih dan amankan stand Anda sekarang sebelum kehabisan.',
        type: 'INFO',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ]);
  }

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifs.unshift(newNotif);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  markNotificationsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // --- Live Google Spreadsheet & Clean State Synchronization ---
  loadFromSpreadsheetData(data: any): { success: boolean; message: string; counts: Record<string, number> } {
    if (!data) return { success: false, message: 'Data Google Spreadsheet kosong.', counts: {} };

    const counts: Record<string, number> = {};

    if (Array.isArray(data.members)) {
      this.setItem(STORAGE_KEYS.MEMBERS, data.members);
      counts.members = data.members.length;
    }
    if (Array.isArray(data.registrations)) {
      this.setItem(STORAGE_KEYS.REGISTRATIONS, data.registrations);
      counts.registrations = data.registrations.length;
    }
    if (Array.isArray(data.payments)) {
      this.setItem(STORAGE_KEYS.PAYMENTS, data.payments);
      counts.payments = data.payments.length;
    }
    if (Array.isArray(data.savings)) {
      this.setItem(STORAGE_KEYS.SAVINGS, data.savings);
      counts.savings = data.savings.length;
    }
    if (Array.isArray(data.salesReports)) {
      this.setItem(STORAGE_KEYS.SALES_REPORTS, data.salesReports);
      counts.salesReports = data.salesReports.length;
    }
    if (Array.isArray(data.documents)) {
      this.setItem(STORAGE_KEYS.DOCUMENTS, data.documents);
      counts.documents = data.documents.length;
    }
    if (Array.isArray(data.products)) {
      this.setItem(STORAGE_KEYS.PRODUCTS, data.products);
      counts.products = data.products.length;
    }
    if (Array.isArray(data.events) && data.events.length > 0) {
      this.setItem(STORAGE_KEYS.EVENTS, data.events);
      counts.events = data.events.length;
    }

    this.logAudit({
      user_id: this.getCurrentUser()?.id || 'SUPER_ADMIN',
      user_role: 'SUPER_ADMIN',
      action: 'SYNC_FROM_SPREADSHEET',
      module: 'GOOGLE_SYNC',
      reference_id: 'GOOGLE_SHEET',
      description: `Sinkronisasi data real-time dari Google Spreadsheet berhasil (${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ')})`,
      result: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Seluruh data berhasil disinkronkan langsung dari Google Spreadsheet!',
      counts,
    };
  }

  clearDemoData(): void {
    // Clear all dummy/demo rows, leaving a clean production-ready database
    this.setItem(STORAGE_KEYS.MEMBERS, []);
    this.setItem(STORAGE_KEYS.DOCUMENTS, []);
    this.setItem(STORAGE_KEYS.PRODUCTS, []);
    this.setItem(STORAGE_KEYS.REGISTRATIONS, []);
    this.setItem(STORAGE_KEYS.PAYMENTS, []);
    this.setItem(STORAGE_KEYS.SAVINGS, []);
    this.setItem(STORAGE_KEYS.SALES_REPORTS, []);
    this.setItem(STORAGE_KEYS.VERSION, '3.0.0_CLEAN');

    this.logAudit({
      user_id: this.getCurrentUser()?.id || 'SUPER_ADMIN',
      user_role: 'SUPER_ADMIN',
      action: 'CLEAR_DEMO_DATA',
      module: 'DATABASE',
      reference_id: 'CLEAN_PROD',
      description: 'Database dibersihkan dari seluruh data demo untuk kesiapan operasional murni (Live Production)',
      result: 'SUCCESS',
    });
  }

  // --- BRANDING & MEDIA ASSETS MANAGEMENT (SUPER ADMIN) ---
  getBrandingConfig(): AppBrandingConfig {
    const stored = this.getItem<AppBrandingConfig | null>(STORAGE_KEYS.BRANDING, null);
    if (!stored) {
      return DEFAULT_BRANDING_CONFIG;
    }
    // Ensure all required fields exist
    return {
      ...DEFAULT_BRANDING_CONFIG,
      ...stored,
      customBanners: Array.isArray(stored.customBanners) ? stored.customBanners : DEFAULT_BRANDING_CONFIG.customBanners,
      mediaAssets: Array.isArray(stored.mediaAssets) ? stored.mediaAssets : DEFAULT_BRANDING_CONFIG.mediaAssets,
    };
  }

  updateBrandingConfig(
    updates: Partial<AppBrandingConfig>,
    adminUsername = 'SUPER_ADMIN'
  ): { success: boolean; message: string } {
    const current = this.getBrandingConfig();
    const updated: AppBrandingConfig = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: adminUsername,
    };

    this.setItem(STORAGE_KEYS.BRANDING, updated);

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_BRANDING_CONFIG',
      module: 'BRANDING_MEDIA',
      reference_id: 'BRANDING_CONFIG',
      description: `Pembaruan aset branding & gambar aplikasi oleh ${adminUsername}`,
      result: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Pengaturan branding & gambar berhasil disimpan.',
    };
  }

  resetBrandingToDefault(adminUsername = 'SUPER_ADMIN'): { success: boolean; message: string } {
    this.setItem(STORAGE_KEYS.BRANDING, {
      ...DEFAULT_BRANDING_CONFIG,
      updated_at: new Date().toISOString(),
      updated_by: adminUsername,
    });

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'RESET_BRANDING_DEFAULT',
      module: 'BRANDING_MEDIA',
      reference_id: 'BRANDING_DEFAULT',
      description: `Reset logo, banner, dan maskot ke aset standar default oleh ${adminUsername}`,
      result: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Logo dan banner telah dikembalikan ke pengaturan default resmi.',
    };
  }

  // --- Active Logo Management ---
  setLogo(
    imageUrl: string,
    sourceType: MediaSourceType,
    rawDriveLink?: string,
    altText?: string,
    adminUsername = 'SUPER_ADMIN'
  ): boolean {
    const current = this.getBrandingConfig();
    const convertedUrl = sourceType === 'GOOGLE_DRIVE' ? convertGoogleDriveUrl(imageUrl) : imageUrl;

    const mediaList = [...current.mediaAssets];
    const newMediaId = `MEDIA-LOGO-${Date.now()}`;

    // Add to media assets archive
    mediaList.unshift({
      id: newMediaId,
      title: altText || 'Logo Banuarasa Weekend Market',
      category: 'LOGO',
      url: convertedUrl,
      sourceType,
      rawDriveLink: rawDriveLink || (sourceType === 'GOOGLE_DRIVE' ? imageUrl : undefined),
      description: `Diperbarui pada ${new Date().toLocaleDateString('id-ID')}`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: adminUsername,
    });

    this.updateBrandingConfig(
      {
        logoUrl: convertedUrl,
        logoSourceType: sourceType,
        logoDriveLink: rawDriveLink || (sourceType === 'GOOGLE_DRIVE' ? imageUrl : undefined),
        logoAlt: altText || current.logoAlt,
        mediaAssets: mediaList,
      },
      adminUsername
    );

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'SET_ACTIVE_LOGO',
      module: 'BRANDING_MEDIA',
      reference_id: newMediaId,
      description: `Logo resmi aplikasi berhasil diganti (${sourceType})`,
      result: 'SUCCESS',
    });

    return true;
  }

  // --- Active Hero Banner Management ---
  setHeroBanner(
    imageUrl: string,
    sourceType: MediaSourceType,
    rawDriveLink?: string,
    title?: string,
    subtitle?: string,
    adminUsername = 'SUPER_ADMIN'
  ): boolean {
    const current = this.getBrandingConfig();
    const convertedUrl = sourceType === 'GOOGLE_DRIVE' ? convertGoogleDriveUrl(imageUrl) : imageUrl;

    const mediaList = [...current.mediaAssets];
    const newMediaId = `MEDIA-BANNER-${Date.now()}`;

    mediaList.unshift({
      id: newMediaId,
      title: title || 'Hero Banner Wisata Gastronomi',
      category: 'BANNER_HERO',
      url: convertedUrl,
      sourceType,
      rawDriveLink: rawDriveLink || (sourceType === 'GOOGLE_DRIVE' ? imageUrl : undefined),
      description: subtitle || 'Banner utama landing page',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: adminUsername,
    });

    this.updateBrandingConfig(
      {
        heroBannerUrl: convertedUrl,
        heroBannerSourceType: sourceType,
        heroBannerDriveLink: rawDriveLink || (sourceType === 'GOOGLE_DRIVE' ? imageUrl : undefined),
        heroBannerTitle: title || current.heroBannerTitle,
        heroBannerSubtitle: subtitle || current.heroBannerSubtitle,
        mediaAssets: mediaList,
      },
      adminUsername
    );

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'SET_ACTIVE_HERO_BANNER',
      module: 'BRANDING_MEDIA',
      reference_id: newMediaId,
      description: `Hero banner utama berhasil diperbarui (${sourceType})`,
      result: 'SUCCESS',
    });

    return true;
  }

  // --- Active Mascot Management ---
  setMascot(
    imageUrl: string,
    sourceType: MediaSourceType,
    rawDriveLink?: string,
    adminUsername = 'SUPER_ADMIN'
  ): boolean {
    const current = this.getBrandingConfig();
    const convertedUrl = sourceType === 'GOOGLE_DRIVE' ? convertGoogleDriveUrl(imageUrl) : imageUrl;

    const mediaList = [...current.mediaAssets];
    const newMediaId = `MEDIA-MASCOT-${Date.now()}`;

    mediaList.unshift({
      id: newMediaId,
      title: 'Pose Maskot Bara Baru',
      category: 'MASCOT',
      url: convertedUrl,
      sourceType,
      rawDriveLink: rawDriveLink || (sourceType === 'GOOGLE_DRIVE' ? imageUrl : undefined),
      description: 'Gambar maskot Bara aktif',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: adminUsername,
    });

    this.updateBrandingConfig(
      {
        mascotUrl: convertedUrl,
        mascotAvatarUrl: convertedUrl,
        mascotSourceType: sourceType,
        mascotDriveLink: rawDriveLink || (sourceType === 'GOOGLE_DRIVE' ? imageUrl : undefined),
        mediaAssets: mediaList,
      },
      adminUsername
    );

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'SET_ACTIVE_MASCOT',
      module: 'BRANDING_MEDIA',
      reference_id: newMediaId,
      description: `Aset maskot Bara berhasil diperbarui (${sourceType})`,
      result: 'SUCCESS',
    });

    return true;
  }

  // --- Media Assets CRUD ---
  getMediaAssets(): MediaAssetItem[] {
    return this.getBrandingConfig().mediaAssets;
  }

  addMediaAsset(
    asset: Omit<MediaAssetItem, 'id' | 'created_at' | 'updated_at'>,
    adminUsername = 'SUPER_ADMIN'
  ): MediaAssetItem {
    const current = this.getBrandingConfig();
    const convertedUrl =
      asset.sourceType === 'GOOGLE_DRIVE' ? convertGoogleDriveUrl(asset.url) : asset.url;

    const newItem: MediaAssetItem = {
      ...asset,
      url: convertedUrl,
      id: `MEDIA-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: adminUsername,
    };

    const mediaAssets = [newItem, ...current.mediaAssets];
    this.updateBrandingConfig({ mediaAssets }, adminUsername);

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'ADD_MEDIA_ASSET',
      module: 'BRANDING_MEDIA',
      reference_id: newItem.id,
      description: `Menambahkan media gambar baru: ${newItem.title} (${newItem.category})`,
      result: 'SUCCESS',
    });

    return newItem;
  }

  updateMediaAsset(
    assetId: string,
    updates: Partial<MediaAssetItem>,
    adminUsername = 'SUPER_ADMIN'
  ): boolean {
    const current = this.getBrandingConfig();
    let found = false;

    const mediaAssets = current.mediaAssets.map((item) => {
      if (item.id === assetId) {
        found = true;
        const newUrl =
          updates.url && (updates.sourceType === 'GOOGLE_DRIVE' || item.sourceType === 'GOOGLE_DRIVE')
            ? convertGoogleDriveUrl(updates.url)
            : updates.url || item.url;

        return {
          ...item,
          ...updates,
          url: newUrl,
          updated_at: new Date().toISOString(),
          updated_by: adminUsername,
        };
      }
      return item;
    });

    if (!found) return false;

    this.updateBrandingConfig({ mediaAssets }, adminUsername);

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_MEDIA_ASSET',
      module: 'BRANDING_MEDIA',
      reference_id: assetId,
      description: `Memperbarui detail media ${assetId}`,
      result: 'SUCCESS',
    });

    return true;
  }

  deleteMediaAsset(assetId: string, adminUsername = 'SUPER_ADMIN'): boolean {
    const current = this.getBrandingConfig();
    const target = current.mediaAssets.find((m) => m.id === assetId);
    if (!target) return false;

    const mediaAssets = current.mediaAssets.filter((m) => m.id !== assetId);
    this.updateBrandingConfig({ mediaAssets }, adminUsername);

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'DELETE_MEDIA_ASSET',
      module: 'BRANDING_MEDIA',
      reference_id: assetId,
      description: `Menghapus media gambar: ${target.title}`,
      result: 'SUCCESS',
    });

    return true;
  }

  // --- Custom Banners CRUD ---
  getCustomBanners(): CustomBannerItem[] {
    return this.getBrandingConfig().customBanners;
  }

  addCustomBanner(
    banner: Omit<CustomBannerItem, 'id' | 'created_at'>,
    adminUsername = 'SUPER_ADMIN'
  ): CustomBannerItem {
    const current = this.getBrandingConfig();
    const convertedUrl =
      banner.sourceType === 'GOOGLE_DRIVE' ? convertGoogleDriveUrl(banner.image_url) : banner.image_url;

    const newBanner: CustomBannerItem = {
      ...banner,
      image_url: convertedUrl,
      id: `BANNER-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const customBanners = [...current.customBanners, newBanner];
    this.updateBrandingConfig({ customBanners }, adminUsername);

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'ADD_CUSTOM_BANNER',
      module: 'BRANDING_MEDIA',
      reference_id: newBanner.id,
      description: `Menambahkan banner promosi baru: ${newBanner.title}`,
      result: 'SUCCESS',
    });

    return newBanner;
  }

  deleteCustomBanner(bannerId: string, adminUsername = 'SUPER_ADMIN'): boolean {
    const current = this.getBrandingConfig();
    const target = current.customBanners.find((b) => b.id === bannerId);
    if (!target) return false;

    const customBanners = current.customBanners.filter((b) => b.id !== bannerId);
    this.updateBrandingConfig({ customBanners }, adminUsername);

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'DELETE_CUSTOM_BANNER',
      module: 'BRANDING_MEDIA',
      reference_id: bannerId,
      description: `Menghapus banner: ${target.title}`,
      result: 'SUCCESS',
    });

    return true;
  }

  // --- Member Card Template & Design Studio ---
  getMemberCardDesign(): MemberCardDesignConfig {
    return this.getItem<MemberCardDesignConfig>(
      STORAGE_KEYS.CARD_DESIGN,
      DEFAULT_MEMBER_CARD_DESIGN
    );
  }

  updateMemberCardDesign(
    updates: Partial<MemberCardDesignConfig>,
    adminUsername = 'SUPER_ADMIN'
  ): MemberCardDesignConfig {
    const current = this.getMemberCardDesign();
    const updated: MemberCardDesignConfig = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: adminUsername,
    };

    this.setItem(STORAGE_KEYS.CARD_DESIGN, updated);
    this.notify();
    this.persistToServer();

    this.logAudit({
      user_id: adminUsername,
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_CARD_DESIGN',
      module: 'CARD_STUDIO',
      reference_id: 'KTA-DESIGN',
      description: `Desain Kartu Anggota (KTA Digital) diperbarui ke tema ${updated.theme}`,
      result: 'SUCCESS',
    });

    this.addNotification({
      title: 'Desain KTA Digital Diperbarui',
      message: `Super Admin telah memperbarui layout desain kartu anggota resmi ke tema ${updated.theme}.`,
      type: 'INFO',
    });

    return updated;
  }

  // --- Member Profile & Biodata Update by Member / Admin ---
  updateMemberProfile(
    memberId: string,
    profileData: Partial<Member>
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
}

export const storage = new StorageService();
