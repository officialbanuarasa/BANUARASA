export type UserRole = 'SUPER_ADMIN' | 'ADMIN_KOPERASI' | 'ADMIN_EVENT' | 'MEMBER' | 'PUBLIC';

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Member {
  member_id: string; // BM-00001
  nomor_anggota: string; // KBM/2026/08/001
  nama_lengkap: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  alamat: string;
  nomor_hp: string;
  email: string;
  foto_profil_url: string;
  nama_usaha: string;
  deskripsi_usaha: string;
  kategori_usaha: 'Kuliner' | 'Kriya' | 'Fashion' | 'Pertanian' | 'Jasa' | 'Lainnya';
  alamat_usaha: string;
  instagram?: string;
  whatsapp: string;
  status_keanggotaan: MembershipStatus;
  tanggal_bergabung: string;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'NIB' | 'NPWP' | 'HALAL' | 'PIRT' | 'IZIN_USAHA' | 'KTP' | 'OTHER';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface MemberDocument {
  document_id: string;
  member_id: string;
  document_type: DocumentType;
  document_number: string;
  file_name: string;
  drive_file_id: string;
  drive_url: string;
  upload_date: string;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
}

export interface Product {
  product_id: string;
  member_id: string;
  product_name: string;
  category: 'Kuliner' | 'Kriya' | 'Fashion' | 'Pertanian' | 'Lainnya';
  description: string;
  price: number;
  image_file_id?: string;
  image_url: string;
  featured: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export type EventStatus = 'DRAFT' | 'OPEN_REGISTRATION' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface EventItem {
  event_id: string; // BWM-2026-001
  event_number: number;
  event_name: string;
  event_date: string; // YYYY-MM-DD
  start_time: string; // 16:00
  end_time: string; // 22:00
  location: string;
  description: string;
  banner_file_id?: string;
  banner_url: string;
  registration_open: string;
  registration_close: string;
  event_status: EventStatus;
  created_at: string;
  updated_at: string;
}

export type StandCategory = 'KATEGORI_1' | 'KATEGORI_2' | 'KATEGORI_3';

export interface Stand {
  stand_id: string;
  stand_code: string; // A..J, 1..43, 44..54
  stand_category: StandCategory;
  participation_price: number; // 50000 or 35000
  status: 'ACTIVE' | 'MAINTENANCE';
  zone_name: string;
}

export type RegistrationStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'WAITING_PAYMENT'
  | 'PAYMENT_VERIFICATION'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'REJECTED';

export interface EventRegistration {
  registration_id: string; // REG-20260906-0001
  event_id: string;
  member_id: string;
  stand_code: string;
  stand_price: number;
  registration_date: string;
  registration_status: RegistrationStatus;
  payment_status: PaymentStatus;
  payment_deadline: string; // ISO datetime
  check_in_status: 'NOT_CHECKED_IN' | 'CHECKED_IN';
  check_in_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentType = 'EVENT_PARTICIPATION' | 'SIMPANAN_POKOK' | 'SIMPANAN_WAJIB' | 'SIMPANAN_SUKARELA';
export type PaymentMethod = 'TRANSFER_BANK' | 'QRIS' | 'CASH';

export interface Payment {
  payment_id: string; // PAY-20260831-0001
  registration_id?: string;
  member_id: string;
  payment_type: PaymentType;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  proof_file_id: string;
  proof_file_url: string;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesReport {
  sales_report_id: string;
  event_id: string;
  member_id: string;
  registration_id: string;
  total_transactions: number;
  total_items_sold: number;
  gross_sales: number; // Omzet kotor UMKM
  cost: number; // HPP
  net_profit: number; // Keuntungan bersih UMKM
  report_status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED';
  submitted_at: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  details?: SalesDetail[];
}

export interface SalesDetail {
  sales_detail_id: string;
  sales_report_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Saving {
  saving_id: string;
  member_id: string;
  saving_type: 'SIMPANAN_POKOK' | 'SIMPANAN_WAJIB' | 'SIMPANAN_SUKARELA';
  amount: number;
  payment_id?: string;
  payment_status: 'PAID' | 'PENDING';
  payment_date: string;
  period_month_year: string; // e.g. "2026-08"
  notes?: string;
  created_at: string;
}

export interface Announcement {
  announcement_id: string;
  title: string;
  content: string;
  category: 'EVENT' | 'SIMPANAN' | 'UMKM' | 'GENERAL';
  image_url?: string;
  publish_date: string;
  expiration_date?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  created_by: string;
  created_at: string;
}

export interface NewsItem {
  news_id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  cover_image_url: string;
  published_at: string;
}

export interface GalleryItem {
  gallery_id: string;
  event_id?: string;
  title: string;
  year: number;
  image_url: string;
  caption: string;
  created_at: string;
}

export interface Sponsor {
  sponsor_id: string;
  sponsor_name: string;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'PARTNER';
  logo_url: string;
  website_url?: string;
  is_active: boolean;
}

export interface AuditLog {
  log_id: string;
  timestamp: string;
  user_id: string;
  user_role: UserRole;
  action: string;
  module: string;
  reference_id: string;
  description: string;
  ip_or_session_reference?: string;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  member_id?: string;
  email?: string;
  foto_profil_url?: string;
  nomor_anggota?: string;
  nama_usaha?: string;
}

export type MediaAssetCategory = 'LOGO' | 'BANNER_HERO' | 'BANNER_PROMO' | 'MASCOT' | 'SPONSOR' | 'OTHER';
export type MediaSourceType = 'UPLOAD' | 'GOOGLE_DRIVE' | 'EXTERNAL_URL' | 'DEFAULT';

export interface MediaAssetItem {
  id: string;
  title: string;
  category: MediaAssetCategory;
  url: string;
  sourceType: MediaSourceType;
  rawDriveLink?: string;
  description?: string;
  is_active: boolean;
  file_size?: string;
  dimension?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface CustomBannerItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  image_url: string;
  sourceType: MediaSourceType;
  rawDriveLink?: string;
  link_url?: string;
  cta_text?: string;
  is_active: boolean;
  order: number;
  created_at: string;
}

export interface AppBrandingConfig {
  logoUrl: string;
  logoAlt: string;
  logoSourceType: MediaSourceType;
  logoDriveLink?: string;

  heroBannerUrl: string;
  heroBannerTitle: string;
  heroBannerSubtitle: string;
  heroBannerSourceType: MediaSourceType;
  heroBannerDriveLink?: string;

  marketBannerUrl: string;
  marketBannerSourceType: MediaSourceType;

  mascotUrl: string;
  mascotAvatarUrl: string;
  mascotSourceType: MediaSourceType;
  mascotDriveLink?: string;

  tagline: string;
  subTagline: string;
  organizationName: string;

  customBanners: CustomBannerItem[];
  mediaAssets: MediaAssetItem[];
  updated_at: string;
  updated_by?: string;
}
