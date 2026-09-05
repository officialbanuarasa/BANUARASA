// ========================================================
// BANUARASA WEEKEND MARKET - DATA CONTRACT & TYPES v2
// Single Source of Truth Types
// ========================================================

export type Role = 
  | 'SUPER_ADMIN' 
  | 'ADMIN_KOPERASI' 
  | 'ADMIN_EVENT' 
  | 'MEMBER' 
  | 'PUBLIC';

export type StandCategory = 'KULINER' | 'KERAJINAN' | 'FASHION' | 'JASA' | 'UMUM';
export type StandZone = 'ZONA_A' | 'ZONA_B' | 'ZONA_C' | 'ZONA_D' | 'TENGAH';
export type StandBookingStatus = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'WAITING_PAYMENT' 
  | 'WAITING_VERIFICATION' 
  | 'CONFIRMED' 
  | 'BLOCKED';

export type PaymentMethod = 'TRANSFER_BANK' | 'QRIS' | 'TUNAI';
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type PaymentType = 'STAND_REGISTRATION' | 'SIMPANAN_POKOK' | 'SIMPANAN_WAJIB' | 'SIMPANAN_SUKARELA';

export type EventStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type MemberStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'INACTIVE';
export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

// --------------------------------------------------------
// ENTITY SCHEMAS (Matches Database / Google Spreadsheet)
// --------------------------------------------------------

export interface UserAccount {
  user_id: string;
  member_id?: string;
  username: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface Member {
  member_id: string;
  nik: string;
  nama_lengkap: string;
  nama_usaha: string;
  kategori_usaha: StandCategory;
  alamat: string;
  nomor_hp: string;
  whatsapp: string;
  email: string;
  status_keanggotaan: MemberStatus;
  avatar_url?: string;
  avatar_file_id?: string;
  barcode_data?: string;
  created_at: string;
  updated_at?: string;
}

export interface EventItem {
  event_id: string;
  title: string;
  description: string;
  event_date: string;       // Format: YYYY-MM-DD
  start_time: string;       // Format: HH:mm (WITA)
  end_time: string;         // Format: HH:mm (WITA)
  timezone: string;         // Default: 'Asia/Makassar'
  location: string;
  status: EventStatus;
  banner_url?: string;
  banner_file_id?: string;
  total_stands: number;
  available_stands?: number;
  created_at: string;
}

export interface MasterStand {
  stand_id: string;
  stand_code: string;       // Contoh: A-01, B-12
  stand_number: number;
  category: StandCategory;
  zone: StandZone;
  base_price: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface EventStand {
  event_stand_id: string;
  event_id: string;
  stand_id: string;
  stand_code: string;
  assigned_price: number;
  booking_status: StandBookingStatus;
  booked_by_member_id?: string;
  booked_by_member_name?: string;
  lock_expires_at?: string; // ISO String untuk batas 15 menit
}

export interface Registration {
  registration_id: string;
  event_id: string;
  event_title: string;
  stand_id: string;
  stand_code: string;
  member_id: string;
  member_name: string;
  nama_usaha: string;
  status: StandBookingStatus;
  total_fee: number;
  created_at: string;
  expires_at?: string;
}

export interface Payment {
  payment_id: string;
  registration_id?: string;
  member_id: string;
  member_name: string;
  payment_type: PaymentType;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  proof_url?: string;
  proof_file_id?: string;
  verification_status: PaymentStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface Saving {
  saving_id: string;
  member_id: string;
  member_name: string;
  saving_type: 'SIMPANAN_POKOK' | 'SIMPANAN_WAJIB' | 'SIMPANAN_SUKARELA';
  amount: number;
  payment_id?: string;
  created_at: string;
}

export interface SalesReport {
  sales_report_id: string;
  event_id: string;
  event_title: string;
  member_id: string;
  member_name: string;
  stand_code: string;
  report_date: string;
  total_turnover: number;
  notes?: string;
  submitted_at: string;
}

export interface Product {
  product_id: string;
  member_id: string;
  member_name: string;
  name: string;
  description: string;
  category: StandCategory;
  price: number;
  image_url?: string;
  image_file_id?: string;
  is_available: boolean;
  created_at: string;
}

export interface DocumentRecord {
  document_id: string;
  member_id: string;
  member_name: string;
  document_type: 'KTP' | 'NIB' | 'SERTIFIKAT_HALAL' | 'PIRT' | 'LAINNYA';
  document_number: string;
  file_url?: string;
  file_id?: string;
  verification_status: DocumentStatus;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface AuditLog {
  log_id: string;
  timestamp_wita: string;
  actor_user_id: string;
  actor_name: string;
  actor_role: Role;
  action: string;
  module: 'AUTH' | 'STAND' | 'PAYMENT' | 'MEMBER' | 'EVENT' | 'SALES' | 'DOCUMENT';
  reference_id?: string;
  details: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface AppNotification {
  notification_id: string;
  recipient_role: Role | 'ALL';
  recipient_member_id?: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// --------------------------------------------------------
// AUTH & SESSION STATE
// --------------------------------------------------------

export interface AuthSession {
  token: string;
  user: {
    user_id: string;
    username: string;
    role: Role;
    member_id?: string;
    nama_lengkap?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
