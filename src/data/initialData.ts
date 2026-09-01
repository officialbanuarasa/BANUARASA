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
} from '../types';

export const SUPER_ADMIN_ACCOUNT = {
  id: 'ADM-SUPER',
  username: 'superadmin',
  password: 'admin123',
  email: 'admin@koperasiberau.id',
  nama_lengkap: 'Super Admin Pengurus Koperasi',
  role: 'SUPER_ADMIN' as const,
  foto_profil_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
};

export const MEMBER_DEFAULT_PASSWORD = '123456';

export const INITIAL_MEMBERS: Member[] = [
  {
    member_id: 'BM-00241',
    nomor_anggota: 'KBM/2026/01/0241',
    nama_lengkap: 'Ahmad Zulkarnain',
    nik: '6403011405880002',
    tempat_lahir: 'Tanjung Redeb',
    tanggal_lahir: '1988-05-14',
    jenis_kelamin: 'L',
    alamat: 'Jl. Pemuda No. 42, RT 08, Tanjung Redeb, Berau',
    nomor_hp: '081255443321',
    email: 'zulkarnain.berau@gmail.com',
    foto_profil_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    nama_usaha: 'Sate Ikan & Kuliner Pesisir Berau',
    deskripsi_usaha: 'Olahan khas ikan laut segar perairan Berau dengan bumbu rempah warisan leluhur',
    kategori_usaha: 'Kuliner',
    alamat_usaha: 'Jl. Pulau Derawan No. 15, Tanjung Redeb',
    instagram: '@sateikanberau.id',
    whatsapp: '081255443321',
    status_keanggotaan: 'ACTIVE',
    tanggal_bergabung: '2023-01-15',
    created_at: '2023-01-15T08:00:00Z',
    updated_at: '2026-08-30T10:00:00Z',
  }
];

export const INITIAL_DOCUMENTS: MemberDocument[] = [
  {
    document_id: 'DOC-001',
    member_id: 'BM-00241',
    document_type: 'NIB',
    document_number: '9120008472911',
    file_name: 'BM-00241_NIB_20260115_001.pdf',
    drive_file_id: '1xNIBDrive_241',
    drive_url: 'https://drive.google.com/file/d/1xNIBDrive_241/view',
    upload_date: '2026-01-15',
    verification_status: 'VERIFIED',
    verified_by: 'ADM-SUPER',
    verified_at: '2026-01-16T10:00:00Z',
  },
  {
    document_id: 'DOC-002',
    member_id: 'BM-00241',
    document_type: 'HALAL',
    document_number: 'ID6411000049281',
    file_name: 'BM-00241_HALAL_20260210_001.pdf',
    drive_file_id: '1xHalalDrive_241',
    drive_url: 'https://drive.google.com/file/d/1xHalalDrive_241/view',
    upload_date: '2026-02-10',
    verification_status: 'VERIFIED',
    verified_by: 'ADM-SUPER',
    verified_at: '2026-02-11T09:15:00Z',
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    product_id: 'PRD-001',
    member_id: 'BM-00241',
    product_name: 'Sate Ikan Khas Berau (Porsi 10 Tusuk)',
    category: 'Kuliner',
    description: 'Sate daging ikan laut segar berbumbu rempah kemiri, kelapa sangrai, dan sambal belacan',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
    featured: true,
    status: 'ACTIVE',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-08-30T10:00:00Z',
  },
  {
    product_id: 'PRD-002',
    member_id: 'BM-00241',
    product_name: 'Otak-otak Ikan Tenggiri Bakar Daun',
    category: 'Kuliner',
    description: 'Otak-otak gurih beraroma daun pisang bakar disajikan dengan kuah cuka kacang',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80',
    featured: true,
    status: 'ACTIVE',
    created_at: '2026-02-14T09:00:00Z',
    updated_at: '2026-08-30T10:00:00Z',
  }
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    event_id: 'BWM-2026-001',
    event_number: 1,
    event_name: 'BANUARASA WEEKEND MARKET #1',
    event_date: '2026-09-06',
    start_time: '08:00',
    end_time: '17:00',
    location: 'Gedung UMKM Berau, Jl. Pemuda, Tanjung Redeb',
    description: 'Pekan Raya Pasar Akhir Pekan UMKM Kuliner, Kriya, & Fashion Berau dengan Tagline "Rasa Lokal, Cerita Global". Dimeriahkan 64 Tenant UMKM, Live Akustik, & Cooking Demo.',
    banner_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1200&auto=format&fit=crop&q=80',
    registration_open: '2026-08-28T08:00:00Z',
    registration_close: '2026-09-04T18:00:00Z',
    event_status: 'OPEN_REGISTRATION',
    created_at: '2026-08-25T08:00:00Z',
    updated_at: '2026-08-31T03:00:00Z',
  },
  {
    event_id: 'BWM-2026-002',
    event_number: 2,
    event_name: 'BANUARASA WEEKEND MARKET #2 (Edisi Kuliner Tradisi)',
    event_date: '2026-09-13',
    start_time: '08:00',
    end_time: '17:00',
    location: 'Tepian Teratai, Tanjung Redeb, Berau',
    description: 'Festival kuliner pesisir dan kudapan manis kesultanan Berau bersama 64 stand pelaku usaha.',
    banner_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    registration_open: '2026-09-05T08:00:00Z',
    registration_close: '2026-09-11T18:00:00Z',
    event_status: 'DRAFT',
    created_at: '2026-08-26T09:00:00Z',
    updated_at: '2026-08-31T03:00:00Z',
  }
];

export const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    registration_id: 'REG-20260906-0001',
    event_id: 'BWM-2026-001',
    member_id: 'BM-00241',
    stand_code: 'A',
    stand_price: 50000,
    registration_date: '2026-08-29T08:30:00Z',
    registration_status: 'CONFIRMED',
    payment_status: 'PAID',
    payment_deadline: '2026-08-29T10:30:00Z',
    check_in_status: 'NOT_CHECKED_IN',
    notes: 'Stand kuliner sate ikan — butuh akses listrik 450W',
    created_at: '2026-08-29T08:30:00Z',
    updated_at: '2026-08-29T09:15:00Z',
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    payment_id: 'PAY-20260829-0001',
    registration_id: 'REG-20260906-0001',
    member_id: 'BM-00241',
    payment_type: 'EVENT_PARTICIPATION',
    amount: 50000,
    payment_method: 'TRANSFER_BANK',
    payment_date: '2026-08-29',
    proof_file_id: '1Proof_Ahmad_241',
    proof_file_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    verification_status: 'VERIFIED',
    verified_by: 'ADM-SUPER',
    verified_at: '2026-08-29T09:15:00Z',
    created_at: '2026-08-29T08:45:00Z',
    updated_at: '2026-08-29T09:15:00Z',
  },
  {
    payment_id: 'PAY-20260810-0004',
    member_id: 'BM-00241',
    payment_type: 'SIMPANAN_WAJIB',
    amount: 50000,
    payment_method: 'TRANSFER_BANK',
    payment_date: '2026-08-10',
    proof_file_id: '1Proof_Simpanan_241',
    proof_file_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    verification_status: 'VERIFIED',
    verified_by: 'ADM-SUPER',
    verified_at: '2026-08-10T11:00:00Z',
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T11:00:00Z',
  }
];

export const INITIAL_SAVINGS: Saving[] = [
  {
    saving_id: 'SAV-001',
    member_id: 'BM-00241',
    saving_type: 'SIMPANAN_POKOK',
    amount: 500000,
    payment_id: 'PAY-POKOK-241',
    payment_status: 'PAID',
    payment_date: '2023-01-15',
    period_month_year: '2023-01',
    notes: 'Simpanan Pokok Anggota Awal',
    created_at: '2023-01-15T08:00:00Z',
  },
  {
    saving_id: 'SAV-002',
    member_id: 'BM-00241',
    saving_type: 'SIMPANAN_WAJIB',
    amount: 1250000,
    payment_id: 'PAY-WAJIB-241',
    payment_status: 'PAID',
    payment_date: '2026-08-10',
    period_month_year: '2026-08',
    notes: 'Total Akumulasi Simpanan Wajib Bulanan (Lunas s/d Agustus 2026)',
    created_at: '2026-08-10T10:00:00Z',
  }
];

export const INITIAL_SALES_REPORTS: SalesReport[] = [
  {
    sales_report_id: 'SLR-20260824-001',
    event_id: 'BWM-2026-001',
    member_id: 'BM-00241',
    registration_id: 'REG-20260906-0001',
    total_transactions: 94,
    total_items_sold: 168,
    gross_sales: 4750000,
    cost: 2100000,
    net_profit: 2650000,
    report_status: 'VERIFIED',
    submitted_at: '2026-08-24T22:30:00Z',
    verified_by: 'ADM-SUPER',
    verified_at: '2026-08-25T08:00:00Z',
    notes: 'Event uji coba pasar Tepian Teratai — sate ikan ludes sebelum pukul 16:00',
    details: [
      {
        sales_detail_id: 'SLD-001',
        sales_report_id: 'SLR-20260824-001',
        product_id: 'PRD-001',
        product_name: 'Sate Ikan Khas Berau (Porsi 10 Tusuk)',
        quantity: 110,
        price: 30000,
        total: 3300000,
      },
      {
        sales_detail_id: 'SLD-002',
        sales_report_id: 'SLR-20260824-001',
        product_id: 'PRD-002',
        product_name: 'Otak-otak Ikan Tenggiri Bakar Daun',
        quantity: 58,
        price: 25000,
        total: 1450000,
      }
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    announcement_id: 'ANN-001',
    title: 'Rapat Anggota Tahunan (RAT) 2026: Transformasi Digital UMKM & Koperasi',
    content: 'Diberitahukan kepada seluruh anggota resmi Koperasi Berau Melangkah Bersama bahwa RAT 2026 akan diselenggarakan pada akhir bulan September 2026 di Balai Pertemuan Pemkab Berau.',
    category: 'GENERAL',
    publish_date: '2026-08-24',
    status: 'PUBLISHED',
    created_by: 'ADM-SUPER',
    created_at: '2026-08-24T08:00:00Z',
  },
  {
    announcement_id: 'ANN-002',
    title: 'Update Business Matching Sponsor Perbankan untuk Tenant Banuarasa Market',
    content: 'Telah terjalin kerjasama fasilitas pembiayaan KUR UMKM Bunga Rendah dan QRIS Dinamis Gratis Biaya Transaksi bagi tenant aktif yang terverifikasi di Banuarasa Weekend Market.',
    category: 'UMKM',
    publish_date: '2026-08-20',
    status: 'PUBLISHED',
    created_by: 'ADM-SUPER',
    created_at: '2026-08-20T09:30:00Z',
  },
  {
    announcement_id: 'ANN-003',
    title: 'Ketentuan Kebersihan & Bebas Sampah Plastik Sekali Pakai di Area Event',
    content: 'Sesuai komitmen Berau Hijau, seluruh tenant diwajibkan menyediakan kantong ramah lingkungan (cassava bag/kertas) dan menjaga radius 2 meter di sekitar stand masing-masing tetap bersih.',
    category: 'EVENT',
    publish_date: '2026-08-28',
    status: 'PUBLISHED',
    created_by: 'ADM-SUPER',
    created_at: '2026-08-28T10:00:00Z',
  }
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    news_id: 'NEWS-001',
    title: 'Banuarasa Weekend Market: Mengangkat Kuliner Warisan Berau ke Kancah Nasional',
    summary: 'Pasar akhir pekan yang diinisiasi Koperasi Berau Melangkah Bersama siap menjadi magnet wisata kuliner dan ekonomi kreatif baru di Tanjung Redeb.',
    content: 'Banuarasa Weekend Market hadir sebagai wadah terintegrasi bagi para pelaku UMKM Berau untuk unjuk kualitas produk lokal. Mengusung tagline "Rasa Lokal, Cerita Global", event mingguan ini menargetkan ribuan pengunjung setiap akhir pekannya.',
    category: 'Event & Komunitas',
    author: 'Humas Koperasi Berau',
    cover_image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80',
    published_at: '2026-08-25',
  },
  {
    news_id: 'NEWS-002',
    title: 'Pelatihan Sertifikasi Halal & NIB Gratis Bagi 100 Anggota UMKM Binaan',
    summary: 'Koperasi bekerjasama dengan Dinas Koperasi, Perindustrian, dan Perdagangan Kabupaten Berau mempercepat legalitas usaha anggota.',
    content: 'Legalitas usaha adalah kunci bagi produk lokal Berau untuk menembus pasar ritel modern dan ekspor. Melalui fasilitas pendampingan terpadu, proses perolehan NIB dan Sertifikat Halal kini dapat diselesaikan langsung di portal anggota.',
    category: 'UMKM Naik Kelas',
    author: 'Divisi Pemberdayaan UMKM',
    cover_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
    published_at: '2026-08-27',
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    gallery_id: 'GAL-001',
    title: 'Suasana Antusiasme Pengunjung di Stand Kuliner Tradisional',
    year: 2026,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    caption: 'Pengunjung menikmati sajian sate ikan khas Berau dan kudapan manis tradisi.',
    created_at: '2026-08-24T18:00:00Z',
  },
  {
    gallery_id: 'GAL-002',
    title: 'Pameran Batik Rutun dan Kerajinan Dayak Gaai Berau',
    year: 2026,
    image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80',
    caption: 'Koleksi kain batik tulis pewarna alam khas motif biota laut Kepulauan Derawan.',
    created_at: '2026-08-24T18:30:00Z',
  },
  {
    gallery_id: 'GAL-003',
    title: 'Live Akustik & Temu Komunitas Kreatif Banuarasa',
    year: 2026,
    image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    caption: 'Panggung hiburan akhir pekan menyemarakkan suasana belanja keluarga di Berau.',
    created_at: '2026-08-24T20:00:00Z',
  }
];

export const INITIAL_SPONSORS: Sponsor[] = [
  {
    sponsor_id: 'SPS-001',
    sponsor_name: 'Bank Kaltimtara',
    tier: 'PLATINUM',
    logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80',
    website_url: 'https://bankkaltimtara.co.id',
    is_active: true,
  },
  {
    sponsor_id: 'SPS-002',
    sponsor_name: 'PT Berau Coal (Pemberdayaan Masyarakat)',
    tier: 'PLATINUM',
    logo_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=80',
    website_url: 'https://beraucoal.co.id',
    is_active: true,
  },
  {
    sponsor_id: 'SPS-003',
    sponsor_name: 'BRI Kantor Cabang Tanjung Redeb',
    tier: 'GOLD',
    logo_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&auto=format&fit=crop&q=80',
    website_url: 'https://bri.co.id',
    is_active: true,
  },
  {
    sponsor_id: 'SPS-004',
    sponsor_name: 'Dinas Koperasi & UKM Kab. Berau',
    tier: 'PARTNER',
    logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
    website_url: 'https://beraukab.go.id',
    is_active: true,
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    log_id: 'LOG-001',
    timestamp: '2026-08-29T09:15:00Z',
    user_id: 'ADM-SUPER',
    user_role: 'SUPER_ADMIN',
    action: 'VERIFY_PAYMENT',
    module: 'PAYMENT',
    reference_id: 'PAY-20260829-0001',
    description: 'Verifikasi pembayaran biaya partisipasi Stand A Rp50.000 untuk Ahmad Zulkarnain (REG-20260906-0001) berhasil disetujui.',
    result: 'SUCCESS',
  },
  {
    log_id: 'LOG-002',
    timestamp: '2026-08-10T11:00:00Z',
    user_id: 'ADM-SUPER',
    user_role: 'SUPER_ADMIN',
    action: 'VERIFY_SAVINGS',
    module: 'SAVINGS',
    reference_id: 'PAY-20260810-0004',
    description: 'Verifikasi setoran Simpanan Wajib Rp50.000 Ahmad Zulkarnain (Agustus 2026) disetujui.',
    result: 'SUCCESS',
  }
];
