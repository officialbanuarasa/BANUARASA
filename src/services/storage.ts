// ========================================================
// BANUARASA WEEKEND MARKET - STORAGE & DATA SERVICE v2
// Single Source of Truth & Local Cache Management
// ========================================================

import {
  Member,
  EventItem,
  Registration,
  Payment,
  Saving,
  SalesReport,
  Product,
  DocumentRecord,
  AuditLog,
  AppNotification,
  AuthSession,
  MasterStand,
  EventStand,
  Role,
  StandCategory,
  StandZone
} from '../types';

import {
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_PRODUCTS
} from '../data/initialData';

const SESSION_KEY = 'banuarasa_auth_session';
const APP_CACHE_KEY = 'banuarasa_app_cache_v2';

// Generator Master 64 Stand Banuarasa
const generateDefaultMasterStands = (): MasterStand[] => {
  return Array.from({ length: 64 }, (_, i) => {
    const standNumber = i + 1;
    const standCode = `A-${String(standNumber).padStart(2, '0')}`;
    let zone: StandZone = 'ZONA_A';
    let category: StandCategory = 'KULINER';

    if (standNumber > 20 && standNumber <= 40) {
      zone = 'ZONA_B';
      category = 'KERAJINAN';
    } else if (standNumber > 40 && standNumber <= 54) {
      zone = 'ZONA_C';
      category = 'FASHION';
    } else if (standNumber > 54) {
      zone = 'TENGAH';
      category = 'UMUM';
    }

    return {
      stand_id: `STD-${String(standNumber).padStart(2, '0')}`,
      stand_code: standCode,
      stand_number: standNumber,
      category,
      zone,
      base_price: 150000,
      status: 'ACTIVE'
    };
  });
};

export interface AppStateData {
  members: Member[];
  events: EventItem[];
  stands: MasterStand[];
  event_stands: EventStand[];
  registrations: Registration[];
  payments: Payment[];
  savings: Saving[];
  sales_reports: SalesReport[];
  products: Product[];
  documents: DocumentRecord[];
  audit_logs: AuditLog[];
  notifications: AppNotification[];
}

class StorageService {
  private memoryCache: AppStateData;

  constructor() {
    this.memoryCache = this.loadInitialCache();
  }

  private loadInitialCache(): AppStateData {
    try {
      const cached = localStorage.getItem(APP_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!parsed.stands || parsed.stands.length === 0) {
          parsed.stands = generateDefaultMasterStands();
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca cache lokal, memuat data default.', e);
    }

    return {
      members: (INITIAL_MEMBERS || []) as Member[],
      events: (INITIAL_EVENTS || []) as EventItem[],
      stands: generateDefaultMasterStands(),
      event_stands: [],
      registrations: [],
      payments: [],
      savings: [],
      sales_reports: [],
      products: (INITIAL_PRODUCTS || []) as Product[],
      documents: [],
      audit_logs: [],
      notifications: []
    };
  }

  private persistCache() {
    try {
      localStorage.setItem(APP_CACHE_KEY, JSON.stringify(this.memoryCache));
    } catch (e) {
      console.error('Penyimpanan cache lokal penuh:', e);
    }
  }

  // --------------------------------------------------------
  // SESSION & AUTH
  // --------------------------------------------------------

  public getSession(): AuthSession | null {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch {
      return null;
    }
  }

  public setSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  public clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  // --------------------------------------------------------
  // AUDIT LOGGING
  // --------------------------------------------------------

  public logActivity(
    action: string,
    module: AuditLog['module'],
    details: string,
    referenceId?: string,
    status: 'SUCCESS' | 'FAILED' = 'SUCCESS'
  ): void {
    const session = this.getSession();
    const now = new Date();
    const timestampWita = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Makassar',
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(now).replace(' ', 'T') + '+08:00';

    const log: AuditLog = {
      log_id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp_wita: timestampWita,
      actor_user_id: session?.user?.user_id || 'GUEST',
      actor_name: session?.user?.nama_lengkap || session?.user?.username || 'Pengunjung',
      actor_role: session?.user?.role || 'PUBLIC',
      action,
      module,
      reference_id: referenceId,
      details,
      status
    };

    this.memoryCache.audit_logs.unshift(log);
    this.persistCache();
  }

  // --------------------------------------------------------
  // MEMBERS API
  // --------------------------------------------------------

  public getMembers(): Member[] {
    return this.memoryCache.members;
  }

  public getMemberById(memberId: string): Member | undefined {
    return this.memoryCache.members.find(m => m.member_id === memberId);
  }

  public saveMember(member: Member): void {
    const index = this.memoryCache.members.findIndex(m => m.member_id === member.member_id);
    if (index >= 0) {
      this.memoryCache.members[index] = { ...member, updated_at: new Date().toISOString() };
      this.logActivity('UPDATE_MEMBER', 'MEMBER', `Memperbarui profil anggota ${member.nama_lengkap}`, member.member_id);
    } else {
      this.memoryCache.members.push({ ...member, created_at: new Date().toISOString() });
      this.logActivity('REGISTER_MEMBER', 'MEMBER', `Mendaftarkan anggota baru ${member.nama_lengkap}`, member.member_id);
    }
    this.persistCache();
  }

  // --------------------------------------------------------
  // EVENTS & STANDS
  // --------------------------------------------------------

  public getEvents(): EventItem[] {
    return this.memoryCache.events;
  }

  public getStands(): MasterStand[] {
    return this.memoryCache.stands;
  }

  public getEventStands(eventId: string): EventStand[] {
    return this.memoryCache.event_stands.filter(es => es.event_id === eventId);
  }

  public bookStand(eventId: string, standId: string, member: Member): { success: boolean; message: string; registration?: Registration } {
    const masterStand = this.memoryCache.stands.find(s => s.stand_id === standId);
    if (!masterStand) {
      return { success: false, message: 'Stand tidak ditemukan dalam sistem.' };
    }

    const existingBooking = this.memoryCache.event_stands.find(
      es => es.event_id === eventId && es.stand_id === standId
    );

    const now = new Date().getTime();
    if (existingBooking) {
      const isLocked = existingBooking.lock_expires_at && new Date(existingBooking.lock_expires_at).getTime() > now;
      if (existingBooking.booking_status === 'CONFIRMED' || (isLocked && existingBooking.booked_by_member_id !== member.member_id)) {
        return { success: false, message: 'Stand ini sudah dipesan oleh peserta lain.' };
      }
    }

    const lockExpiresAt = new Date(now + 15 * 60 * 1000).toISOString();
    const eventStandRecord: EventStand = {
      event_stand_id: existingBooking?.event_stand_id || `ES-${Date.now()}`,
      event_id: eventId,
      stand_id: standId,
      stand_code: masterStand.stand_code,
      assigned_price: masterStand.base_price,
      booking_status: 'RESERVED',
      booked_by_member_id: member.member_id,
      booked_by_member_name: member.nama_lengkap,
      lock_expires_at: lockExpiresAt
    };

    if (existingBooking) {
      Object.assign(existingBooking, eventStandRecord);
    } else {
      this.memoryCache.event_stands.push(eventStandRecord);
    }

    const targetEvent = this.memoryCache.events.find(e => e.event_id === eventId);
    const newRegistration: Registration = {
      registration_id: `REG-${Date.now()}`,
      event_id: eventId,
      event_title: targetEvent?.title || 'Event Banuarasa',
      stand_id: standId,
      stand_code: masterStand.stand_code,
      member_id: member.member_id,
      member_name: member.nama_lengkap,
      nama_usaha: member.nama_usaha,
      status: 'RESERVED',
      total_fee: masterStand.base_price,
      created_at: new Date().toISOString(),
      expires_at: lockExpiresAt
    };

    this.memoryCache.registrations.push(newRegistration);
    this.persistCache();

    this.logActivity('BOOK_STAND', 'STAND', `Reservasi stand ${masterStand.stand_code} oleh ${member.nama_lengkap}`, newRegistration.registration_id);

    return {
      success: true,
      message: 'Stand berhasil dipesan sementara. Harap selesaikan pembayaran dalam 15 menit.',
      registration: newRegistration
    };
  }

  // --------------------------------------------------------
  // REGISTRATIONS & PAYMENTS
  // --------------------------------------------------------

  public getRegistrations(): Registration[] {
    return this.memoryCache.registrations;
  }

  public getPayments(): Payment[] {
    return this.memoryCache.payments;
  }

  public submitPayment(paymentData: Omit<Payment, 'payment_id' | 'created_at' | 'verification_status'>): Payment {
    const newPayment: Payment = {
      ...paymentData,
      payment_id: `PAY-${Date.now()}`,
      verification_status: 'PENDING',
      created_at: new Date().toISOString()
    };

    this.memoryCache.payments.push(newPayment);

    if (newPayment.registration_id) {
      const reg = this.memoryCache.registrations.find(r => r.registration_id === newPayment.registration_id);
      if (reg) {
        reg.status = 'WAITING_VERIFICATION';
        const es = this.memoryCache.event_stands.find(item => item.event_id === reg.event_id && item.stand_id === reg.stand_id);
        if (es) {
          es.booking_status = 'WAITING_VERIFICATION';
        }
      }
    }

    this.persistCache();
    this.logActivity('SUBMIT_PAYMENT', 'PAYMENT', `Upload bukti bayar ${newPayment.payment_type} senilai Rp ${newPayment.amount.toLocaleString('id-ID')}`, newPayment.payment_id);
    return newPayment;
  }

  public verifyPayment(paymentId: string, adminName: string, status: 'VERIFIED' | 'REJECTED', reason?: string): void {
    const payment = this.memoryCache.payments.find(p => p.payment_id === paymentId);
    if (!payment) return;

    payment.verification_status = status;
    payment.verified_by = adminName;
    payment.verified_at = new Date().toISOString();
    if (reason) payment.rejection_reason = reason;

    if (payment.registration_id) {
      const reg = this.memoryCache.registrations.find(r => r.registration_id === payment.registration_id);
      if (reg) {
        reg.status = status === 'VERIFIED' ? 'CONFIRMED' : 'WAITING_PAYMENT';
        const es = this.memoryCache.event_stands.find(item => item.event_id === reg.event_id && item.stand_id === reg.stand_id);
        if (es) {
          es.booking_status = status === 'VERIFIED' ? 'CONFIRMED' : 'WAITING_PAYMENT';
        }
      }
    }

    this.persistCache();
    this.logActivity(
      status === 'VERIFIED' ? 'VERIFY_PAYMENT_SUCCESS' : 'REJECT_PAYMENT',
      'PAYMENT',
      `Verifikasi pembayaran ${payment.payment_id} oleh ${adminName}: ${status}`,
      payment.payment_id
    );
  }

  // --------------------------------------------------------
  // SAVINGS
  // --------------------------------------------------------

  public getSavings(): Saving[] {
    return this.memoryCache.savings;
  }

  public addSaving(saving: Omit<Saving, 'saving_id' | 'created_at'>): Saving {
    const newSaving: Saving = {
      ...saving,
      saving_id: `SAV-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.memoryCache.savings.push(newSaving);
    this.persistCache();
    this.logActivity('ADD_SAVING', 'MEMBER', `Pencatatan simpanan ${newSaving.saving_type} senilai Rp ${newSaving.amount.toLocaleString('id-ID')}`, newSaving.saving_id);
    return newSaving;
  }

  // --------------------------------------------------------
  // SALES REPORTS
  // --------------------------------------------------------

  public getSalesReports(): SalesReport[] {
    return this.memoryCache.sales_reports;
  }

  public submitSalesReport(report: Omit<SalesReport, 'sales_report_id' | 'submitted_at'>): SalesReport {
    const newReport: SalesReport = {
      ...report,
      sales_report_id: `REP-${Date.now()}`,
      submitted_at: new Date().toISOString()
    };
    this.memoryCache.sales_reports.push(newReport);
    this.persistCache();
    this.logActivity('SUBMIT_SALES_REPORT', 'SALES', `Laporan omzet Rp ${newReport.total_turnover.toLocaleString('id-ID')} pada stand ${newReport.stand_code}`, newReport.sales_report_id);
    return newReport;
  }

  // --------------------------------------------------------
  // PRODUCTS & DOCUMENTS
  // --------------------------------------------------------

  public getProducts(): Product[] {
    return this.memoryCache.products;
  }

  public saveProduct(product: Product): void {
    const index = this.memoryCache.products.findIndex(p => p.product_id === product.product_id);
    if (index >= 0) {
      this.memoryCache.products[index] = product;
    } else {
      this.memoryCache.products.push(product);
    }
    this.persistCache();
  }

  public getDocuments(): DocumentRecord[] {
    return this.memoryCache.documents;
  }

  public getAuditLogs(): AuditLog[] {
    return this.memoryCache.audit_logs;
  }

  public getNotifications(): AppNotification[] {
    return this.memoryCache.notifications;
  }
}

export const storage = new StorageService();
