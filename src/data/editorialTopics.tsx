import React from 'react';
import {
  Store,
  Utensils,
  BookMarked,
  Users,
  Compass,
  Star,
  MapPin,
  Clock,
  Cloud,
  FileSpreadsheet,
  HardDrive,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  Award,
  DollarSign,
  Coffee,
  CheckCircle2,
  Heart,
  Smile,
} from 'lucide-react';

export interface EditorialTopic {
  id: string;
  shortTitle: string;
  badge: string;
  iconName: string;
  themeColor: 'emerald' | 'amber' | 'blue' | 'rose' | 'purple' | 'teal' | 'indigo' | 'orange';
  summary: string;
  fullTitle: string;
  content: React.ReactNode;
  actionLabel?: string;
  actionType?: 'SCROLL_STAND' | 'AUTH_LOGIN' | 'AUTH_REGISTER' | 'OPEN_GOOGLE' | 'SPLASH_BARA' | 'NONE';
}

export const EDITORIAL_TOPICS: Record<string, EditorialTopic> = {
  'pesan-stand': {
    id: 'pesan-stand',
    shortTitle: 'Pesan Stand',
    badge: 'Alokasi 64 Stand',
    iconName: 'Store',
    themeColor: 'emerald',
    summary: 'Reservasi stand mingguan untuk pelaku UMKM kuliner & kriya.',
    fullTitle: 'Panduan Lengkap Pendaftaran 64 Stand Banuarasa Weekend Market',
    actionLabel: 'Lihat Denah & Pilih Stand',
    actionType: 'SCROLL_STAND',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Banuarasa Weekend Market menyediakan <strong>64 kuota stand resmi</strong> setiap pekan yang dikurasi secara terstruktur untuk menjamin kenyamanan pengunjung dan kelancaran transaksi pelaku UMKM kuliner dan kriya.
        </p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs">
          <h5 className="font-black text-emerald-900 flex items-center gap-1.5 text-sm">
            <Store className="w-4 h-4 text-emerald-700" />
            <span>Pembagian 3 Zona Stand:</span>
          </h5>
          <ul className="space-y-1.5 list-disc list-inside text-emerald-950 font-medium">
            <li><strong>Kategori 1 (Stand VIP A - J):</strong> 10 Stand berposisi tepat di depan panggung utama dengan tenda kerucut premium (Rp50.000 / Hari).</li>
            <li><strong>Kategori 2 (Stand 1 - 43):</strong> 43 Stand di koridor utama gastronomi untuk menu makanan basah, panggangan, dan kriya etnik (Rp50.000 / Hari).</li>
            <li><strong>Kategori 3 (Stand 44 - 54):</strong> 11 Stand zona pesisir kreatif ramah kantong untuk UMKM rintisan binaan (Rp35.000 / Hari).</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Fasilitas yang Didapatkan Setiap Stand:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Titik Listrik Penerangan Resmi</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Meja Display & 2 Kursi Peserta</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Plang Nama Usaha & Nomor Stand</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kebersihan Area & Pengelolaan Sampah</span>
            </div>
          </div>
        </div>
        <p className="text-slate-500 text-xs">
          Pendaftaran dibuka setiap awal pekan dan ditutup otomatis saat kuota 64 stand terpenuhi. Sinkronisasi data berlangsung otomatis dengan Google Spreadsheet panitia.
        </p>
      </div>
    ),
  },

  'wisata-gastronomi': {
    id: 'wisata-gastronomi',
    shortTitle: 'Gastronomi',
    badge: 'Konsep Pariwisata',
    iconName: 'Utensils',
    themeColor: 'amber',
    summary: 'Eksplorasi cita rasa autentik dan filosofi budaya khas Berau.',
    fullTitle: 'Mengenal Konsep Wisata Gastronomi Kabupaten Berau',
    actionLabel: 'Eksplorasi 4 Pilar',
    actionType: 'NONE',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Wisata Gastronomi bukan sekadar wisata kuliner biasa. Jika wisata kuliner konvensional hanya berfokus pada <em>"apa yang dimakan dan di mana tempatnya"</em>, maka <strong>Wisata Gastronomi Banuarasa</strong> membawa pengunjung menyelami <em>"mengapa hidangan tersebut dimasak, bagaimana teknik pembuatannya, serta siapa tokoh lokal di balik resep turun-temurun tersebut."</em>
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs">
          <h5 className="font-black text-amber-900 text-sm">Harmoni 3 Suku Asli Berau:</h5>
          <p className="text-amber-950 font-medium">
            Kekayaan gastronomi Kabupaten Berau berakar pada perpaduan kearifan budaya <strong>Suku Banua</strong> (masakan keraton & rempah daratan), <strong>Suku Bajau</strong> (hasil laut segar & teknik pengolahan pesisir), serta <strong>Suku Dayak</strong> (bahan alami hutan tropis & fermentasi tradisional).
          </p>
        </div>
        <div className="space-y-1.5">
          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">4 Elemen Pendukung Utama (UNWTO Framework):</h5>
          <ul className="space-y-1 list-disc list-inside text-xs text-slate-600">
            <li><strong>Food (Kuliner):</strong> Puncak cita rasa pangan lokal seperti Ancur Paddas, Rutai, Tehe-tehe, dan Kima bakar.</li>
            <li><strong>Story (Narasi Budaya):</strong> Cerita sejarah asal-usul sajian adat dan filosofi acara syukuran.</li>
            <li><strong>People (Pelaku):</strong> Apresiasi langsung kepada ibu-ibu pembuat kue tradisional, petani lokal, dan nelayan.</li>
            <li><strong>Experience (Pengalaman):</strong> Demo memasak langsung, mencicipi menu musiman, dan temu wicara produsen.</li>
          </ul>
        </div>
      </div>
    ),
  },

  'maskot-bara': {
    id: 'maskot-bara',
    shortTitle: 'Maskot Bara',
    badge: 'Ikon Resmi',
    iconName: 'Smile',
    themeColor: 'rose',
    summary: 'Si Kerang Laut ramah pesisir Berau pembawa keceriaan pasar.',
    fullTitle: 'Kisah BARA: Maskot Resmi Banuarasa Weekend Market',
    actionLabel: 'Sapa Bara Sekarang',
    actionType: 'SPLASH_BARA',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center text-xl shrink-0">
            🐚
          </div>
          <div>
            <h5 className="font-black text-rose-950 text-xs sm:text-sm">Hai! Nama Saya BARA</h5>
            <p className="text-xs text-rose-800">
              Karakter kerang laut ceria yang melambangkan kekayaan pesisir bahari Kabupaten Berau, Kalimantan Timur.
            </p>
          </div>
        </div>
        <p>
          BARA mengenakan busana adat perpaduan khas masyarakat Berau yang memadukan motif etnik <strong>Banua, Bajau, dan Dayak</strong>. Warna emas mencerminkan kemakmuran dan kehormatan sejarah Kesultanan Berau, sedangkan aksen hijau melambangkan kelestarian alam hutan lindung dan mangrove pesisir.
        </p>
        <div className="space-y-2 text-xs">
          <h5 className="font-bold text-slate-900">Makna Filosofis Karakter BARA:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <strong className="text-slate-800">1. Kerang Laut (Mutiara Rasa):</strong>
              <p className="text-slate-500">Menyimpan mutiara berharga, sebagaimana pasar mingguan menyimpan kekayaan rasa kuliner autentik.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <strong className="text-slate-800">2. Senyum Terbuka:</strong>
              <p className="text-slate-500">Mencerminkan keramahan khas warga Berau dalam menyambut setiap pengunjung dan wisatawan.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <strong className="text-slate-800">3. Ikat Kepala Tradisi:</strong>
              <p className="text-slate-500">Simbol keteguhan dalam melestarikan warisan leluhur di tengah arus modernisasi global.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <strong className="text-slate-800">4. Gerak Aktif:</strong>
              <p className="text-slate-500">Menyemangati pelaku UMKM agar senantiasa kreatif, tangguh, dan terus berinovasi.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  'koperasi-berau': {
    id: 'koperasi-berau',
    shortTitle: 'Koperasi',
    badge: 'Badan Pengelola',
    iconName: 'ShieldCheck',
    themeColor: 'blue',
    summary: 'Koperasi Berau Melangkah Bersama sebagai payung legalitas & binaan.',
    fullTitle: 'Profil Koperasi Berau Melangkah Bersama',
    actionLabel: 'Daftar Anggota UMKM',
    actionType: 'AUTH_REGISTER',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Seluruh penyelenggaraan Banuarasa Weekend Market dikelola langsung di bawah badan hukum <strong>Koperasi Berau Melangkah Bersama</strong>. Koperasi ini dibentuk sebagai wadah gotong royong dan kemandirian ekonomi pelaku UMKM lokal Kabupaten Berau.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2 text-xs">
          <h5 className="font-black text-blue-900 text-sm">Ketentuan Simpanan Anggota Koperasi:</h5>
          <div className="space-y-1.5 text-blue-950 font-medium">
            <div className="flex items-center justify-between py-1 border-b border-blue-200/60">
              <span>Simpanan Pokok (Sekali saat pendaftaran):</span>
              <strong className="text-blue-900">Rp100.000</strong>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-blue-200/60">
              <span>Simpanan Wajib (Per bulan berjalan):</span>
              <strong className="text-blue-900">Rp25.000 / Bulan</strong>
            </div>
          </div>
          <p className="text-[11px] text-blue-800 pt-1">
            *Nominal simpanan dapat disesuaikan sewaktu-waktu oleh Super Administrator sesuai hasil Rapat Anggota Tahunan (RAT).
          </p>
        </div>
        <div className="space-y-1.5">
          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">Keuntungan Bergabung Menjadi Anggota Koperasi:</h5>
          <ul className="space-y-1 list-disc list-inside text-xs text-slate-600">
            <li>Prioritas alokasi pemesanan 64 stand Banuarasa Weekend Market dengan diskon anggota.</li>
            <li>Fasilitas Kartu Tanda Anggota (KTA) digital resmi lengkap dengan QR Code dan Barcode terverifikasi.</li>
            <li>Pendampingan perizinan usaha, sertifikasi halal, dan uji P-IRT makanan khas.</li>
            <li>Hak partisipasi dalam pembagian Sisa Hasil Usaha (SHU) setiap tahun buku koperasi.</li>
          </ul>
        </div>
      </div>
    ),
  },

  'jadwal-lokasi': {
    id: 'jadwal-lokasi',
    shortTitle: 'Jadwal & Rute',
    badge: 'Setiap Akhir Pekan',
    iconName: 'Clock',
    themeColor: 'purple',
    summary: 'Sabtu & Minggu pukul 06:00 - 12:00 WITA di Tanjung Redeb.',
    fullTitle: 'Jadwal Pelaksanaan & Panduan Lokasi Acara',
    actionLabel: 'Lihat Denah Stand',
    actionType: 'SCROLL_STAND',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
              <Clock className="w-4 h-4 text-purple-700" />
              <span>Waktu Operasional</span>
            </div>
            <p className="text-sm sm:text-base font-black text-purple-950">
              Setiap Sabtu & Minggu
            </p>
            <p className="text-xs text-purple-800">
              Pukul 06:00 - 12:00 WITA (Pagi sampai Tengah Hari)
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Lokasi Utama</span>
            </div>
            <p className="text-sm font-black text-slate-950">
              Kawasan Wisata Kuliner Banuarasa
            </p>
            <p className="text-xs text-slate-600">
              Jl. Dr. Murjani I, Tanjung Redeb, Kabupaten Berau, Kalimantan Timur
            </p>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <h5 className="font-bold text-slate-900">Tips Berkunjung bagi Wisatawan:</h5>
          <ul className="space-y-1 list-disc list-inside text-slate-600">
            <li>Datang lebih awal (sekitar pukul 06:30 - 08:30 WITA) untuk menikmati menu sarapan khas Banua yang masih hangat dan lengkap.</li>
            <li>Bawa tumbler atau wadah ramah lingkungan untuk mendukung program pengurangan sampah plastik pasar.</li>
            <li>Transaksi mendukung pembayaran tunai maupun non-tunai via QRIS di semua stand.</li>
            <li>Tersedia area parkir kendaraan roda dua dan empat dengan penjagaan petugas resmi.</li>
          </ul>
        </div>
      </div>
    ),
  },

  'google-cloud': {
    id: 'google-cloud',
    shortTitle: 'Google Cloud',
    badge: 'Database Real-time',
    iconName: 'Cloud',
    themeColor: 'teal',
    summary: 'Sinkronisasi Google Sheets & Drive otomatis untuk transparansi data.',
    fullTitle: 'Integrasi Google Workspace Cloud Hub',
    actionLabel: 'Buka Hub Spreadsheet',
    actionType: 'OPEN_GOOGLE',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Aplikasi Banuarasa mengadopsi teknologi cloud terintegrasi langsung dengan ekosistem <strong>Google Workspace (Google Sheets & Google Drive)</strong> untuk memastikan seluruh data transaksi, keanggotaan, dan alokasi stand tersimpan secara transparan, aman, dan mudah diinspeksi oleh pengurus koperasi.
        </p>
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-2 text-xs">
          <h5 className="font-black text-teal-950 flex items-center gap-1.5 text-sm">
            <FileSpreadsheet className="w-4 h-4 text-teal-700" />
            <span>Struktur Sinkronisasi Spreadsheet:</span>
          </h5>
          <ul className="space-y-1 list-disc list-inside text-teal-900">
            <li><strong>Sheet "Data_Anggota":</strong> Profil lengkap UMKM, NIK, No. WhatsApp, status simpanan pokok & wajib.</li>
            <li><strong>Sheet "Alokasi_Stand":</strong> Daftar 64 nomor stand, nama penyewa, tanggal event, status bayar.</li>
            <li><strong>Sheet "Keuangan_Koperasi":</strong> Catatan mutasi biaya sewa stand, kas koperasi, dan verifikasi bukti transfer.</li>
          </ul>
        </div>
        <p className="text-xs text-slate-500">
          Setiap ada pemesanan stand atau pendaftaran anggota baru, sistem secara otomatis memperbarui baris data pada Google Spreadsheet tanpa perlu input manual berulang kali.
        </p>
      </div>
    ),
  },

  'katalog-umkm': {
    id: 'katalog-umkm',
    shortTitle: 'Katalog UMKM',
    badge: 'Produk Unggulan',
    iconName: 'ShoppingBag',
    themeColor: 'orange',
    summary: 'Ragam olahan pangan lokal, kerajinan tangan, dan suvenir khas Berau.',
    fullTitle: 'Katalog Produk Unggulan Gastronomi & Kriya UMKM Berau',
    actionLabel: 'Masuk & Pasarkan Produk',
    actionType: 'AUTH_LOGIN',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Katalog ini memuat berbagai produk kurasi terbaik dari para pelaku UMKM binaan Koperasi Berau Melangkah Bersama. Mulai dari kuliner siap saji, camilan kemasan, bumbu rempah tradisional, hingga suvenir kriya khas Kalimantan Timur.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl space-y-1">
            <h6 className="font-black text-orange-950">Kuliner Tradisional Basah</h6>
            <p className="text-orange-900">Kue amparan tatak, sari muka, bingka barandam, dan olahan ikan bakar rempah pesisir.</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl space-y-1">
            <h6 className="font-black text-orange-950">Produk Kemasan Oleh-Oleh</h6>
            <p className="text-orange-900">Kerupuk ikan pipih, abon kepiting, terasi udang khas Maratua, dan madu hutan alami.</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl space-y-1">
            <h6 className="font-black text-orange-950">Minuman Tradisional & Kopi</h6>
            <p className="text-orange-900">Wedang jahe merah pesisir, sirup mangrove, dan seduhan kopi robusta lokal.</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl space-y-1">
            <h6 className="font-black text-orange-950">Kriya & Aksesoris Etnik</h6>
            <p className="text-orange-900">Anyaman manik Dayak, tas rotan motif khas Berau, dan busana batik motif kerang bara.</p>
          </div>
        </div>
      </div>
    ),
  },

  'panduan-pemula': {
    id: 'panduan-pemula',
    shortTitle: 'Panduan',
    badge: '3 Langkah Mudah',
    iconName: 'HelpCircle',
    themeColor: 'indigo',
    summary: 'Panduan praktis memesan stand bagi pemula tanpa bingung.',
    fullTitle: 'Panduan Pemula: Cara Memesan Stand dalam 3 Langkah',
    actionLabel: 'Mulai Sekarang',
    actionType: 'SCROLL_STAND',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Bagi Anda yang baru pertama kali ingin berjualan di Banuarasa Weekend Market, ikuti 3 langkah cepat dan mudah berikut ini:
        </p>
        <div className="space-y-2.5">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h6 className="font-bold text-indigo-950 text-xs sm:text-sm">Daftar / Masuk Akun UMKM</h6>
              <p className="text-xs text-indigo-800">
                Tekan tombol <strong>Daftar UMKM Baru</strong> di bagian atas. Cukup masukkan nama, nomor WhatsApp aktif, dan nama usaha Anda.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h6 className="font-bold text-indigo-950 text-xs sm:text-sm">Pilih Nomor Stand di Denah</h6>
              <p className="text-xs text-indigo-800">
                Pilih kotak lingkaran stand yang bertanda warna hijau (Tersedia). Anda bisa memilih Kategori 1 (VIP), Kategori 2, atau Kategori 3.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h6 className="font-bold text-indigo-950 text-xs sm:text-sm">Konfirmasi Pembayaran & Dapatkan E-Tiket</h6>
              <p className="text-xs text-indigo-800">
                Lakukan pembayaran sewa stand via QRIS atau transfer, unggah bukti bayar, dan unduh tanda reservasi stand Anda langsung dari dashboard!
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // Stand Category Topics
  'stand-vip': {
    id: 'stand-vip',
    shortTitle: 'Kategori 1 VIP',
    badge: 'Rp50.000 / Hari',
    iconName: 'Star',
    themeColor: 'emerald',
    summary: '10 Stand VIP tenda kerucut langsung di depan panggung utama.',
    fullTitle: 'Spesifikasi Stand Kategori 1 (VIP A sampai J)',
    actionLabel: 'Pilih Stand VIP Sekarang',
    actionType: 'SCROLL_STAND',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-900">Tarif Resmi:</span>
            <span className="text-base font-black text-emerald-800">Rp50.000 / Hari Acara</span>
          </div>
          <p className="text-xs text-emerald-800">Kapasitas: 10 Stand (Nomor A, B, C, D, E, F, G, H, I, J)</p>
        </div>
        <div className="space-y-2">
          <h6 className="font-bold text-slate-900 text-xs sm:text-sm">Keunggulan & Fasilitas:</h6>
          <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600">
            <li>Berada tepat berhadapan dengan panggung atraksi budaya dan panggung musik akustik.</li>
            <li>Tenda kerucut eksklusif ukuran 3x3 meter dengan kain pelindung anti air.</li>
            <li>Dilengkapi 2 meja display, 2 kursi peserta, dan stop kontak listrik mandiri (maks 400 Watt).</li>
            <li>Trafik pengunjung paling tinggi karena berada di pusat pertemuan jalan utama pasar.</li>
          </ul>
        </div>
      </div>
    ),
  },

  'stand-kat2': {
    id: 'stand-kat2',
    shortTitle: 'Kategori 2',
    badge: 'Rp50.000 / Hari',
    iconName: 'Store',
    themeColor: 'blue',
    summary: '43 Stand koridor utama gastronomi, kuliner autentik & kriya.',
    fullTitle: 'Spesifikasi Stand Kategori 2 (Nomor 1 sampai 43)',
    actionLabel: 'Pilih Stand Kategori 2',
    actionType: 'SCROLL_STAND',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-900">Tarif Resmi:</span>
            <span className="text-base font-black text-blue-800">Rp50.000 / Hari Acara</span>
          </div>
          <p className="text-xs text-blue-800">Kapasitas: 43 Stand (Stand 1 s/d 43)</p>
        </div>
        <div className="space-y-2">
          <h6 className="font-bold text-slate-900 text-xs sm:text-sm">Keunggulan & Fasilitas:</h6>
          <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600">
            <li>Terletak di koridor utama pejalan kaki (pedestrian walk) yang rindang dan nyaman.</li>
            <li>Cocok untuk menu makanan berat, hidangan bakar, sate, masakan sup, dan kriya cinderamata.</li>
            <li>Fasilitas: 1 meja display, 2 kursi, penerangan malam/pagi, dan jalur pembuangan air bersih.</li>
          </ul>
        </div>
      </div>
    ),
  },

  'stand-kat3': {
    id: 'stand-kat3',
    shortTitle: 'Kategori 3',
    badge: 'Rp35.000 / Hari',
    iconName: 'Coffee',
    themeColor: 'amber',
    summary: '11 Stand zona pesisir kreatif ramah kantong untuk UMKM binaan pemula.',
    fullTitle: 'Spesifikasi Stand Kategori 3 (Nomor 44 sampai 54)',
    actionLabel: 'Pilih Stand Kategori 3',
    actionType: 'SCROLL_STAND',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-900">Tarif Subsidi Ramah UMKM:</span>
            <span className="text-base font-black text-amber-800">Rp35.000 / Hari Acara</span>
          </div>
          <p className="text-xs text-amber-800">Kapasitas: 11 Stand (Stand 44 s/d 54)</p>
        </div>
        <div className="space-y-2">
          <h6 className="font-bold text-slate-900 text-xs sm:text-sm">Keunggulan & Fasilitas:</h6>
          <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600">
            <li>Dikhususkan untuk pelaku UMKM rintisan, makanan ringan kering, minuman kekinian, dan jasa kreatif.</li>
            <li>Tarif bersubsidi dari Koperasi Berau Melangkah Bersama untuk mendorong pemula berani berjualan.</li>
            <li>Fasilitas: 1 meja display, 1 kursi, dan titik sambungan listrik bersama.</li>
          </ul>
        </div>
      </div>
    ),
  },

  'pilar-food': {
    id: 'pilar-food',
    shortTitle: 'Pilar 1: Food',
    badge: 'Kuliner Autentik',
    iconName: 'Utensils',
    themeColor: 'amber',
    summary: 'Cita rasa unik dari 3 suku asli: Banua, Bajau, dan Dayak.',
    fullTitle: 'Pilar 1: Food (Eksplorasi Kuliner Autentik Berau)',
    actionLabel: 'Jelajahi Stand Kuliner',
    actionType: 'SCROLL_STAND',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Elemen <strong>Food</strong> menghadirkan hidangan khas turun-temurun Kabupaten Berau yang tidak mudah dijumpai di pasar komersial biasa:
        </p>
        <ul className="space-y-2 list-disc list-inside text-xs text-slate-700">
          <li><strong>Ancur Paddas:</strong> Bubur rempah khas Kesultanan Gunung Tabur dan Sambaliung yang dimasak dengan aneka dedaunan herbal hutan tropis Berau.</li>
          <li><strong>Rutai & Kima:</strong> Olahan kerang laut segar khas suku Bajau pesisir yang diolah dengan rempah asam manis gurih alami.</li>
          <li><strong>Kue Tradisional Banua:</strong> Amparan Tatak, Bingka Barandam, Sari Muka, dan Cucur Berau yang manis legit beraroma pandan suji asli.</li>
          <li><strong>Ikan Bakar Rempah Pesisir:</strong> Ikan kakap merah, baronang, dan bawal laut segar langsung dari tangkapan nelayan Berau.</li>
        </ul>
      </div>
    ),
  },

  'pilar-story': {
    id: 'pilar-story',
    shortTitle: 'Pilar 2: Story',
    badge: 'Narasi & Budaya',
    iconName: 'BookMarked',
    themeColor: 'purple',
    summary: 'Kisah di balik resep, filosofi rempah, dan tradisi kesultanan.',
    fullTitle: 'Pilar 2: Story (Narasi Sejarah & Filosofi Budaya)',
    actionLabel: 'Baca Kisah Budaya',
    actionType: 'NONE',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Setiap menu di Banuarasa memiliki riwayat lisan dan filosofi masa lalu. Para penjual stand didampingi untuk menceritakan kisah di balik kuliner yang mereka sajikan:
        </p>
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl space-y-1 text-xs">
          <h6 className="font-bold text-purple-950">Warisan Kesultanan Berau</h6>
          <p className="text-purple-900">
            Dua istana bersejarah—Keraton Kesultanan Gunung Tabur dan Sambaliung—mewariskan sajian perjamuan raja yang penuh etika santap dan doa keselamatan.
          </p>
        </div>
        <p className="text-xs text-slate-600">
          Melalui narasi cerita ini, wisatawan luar daerah mendapatkan pemahaman kultural mendalam tentang identitas luhur Kalimantan Timur.
        </p>
      </div>
    ),
  },

  'pilar-people': {
    id: 'pilar-people',
    shortTitle: 'Pilar 3: People',
    badge: 'Pelaku & Penjaga Rasa',
    iconName: 'Users',
    themeColor: 'blue',
    summary: 'Apresiasi kepada ibu-ibu pembuat kue, petani rempah & nelayan lokal.',
    fullTitle: 'Pilar 3: People (Penjaga Resep & Pejuang UMKM Lokal)',
    actionLabel: 'Daftar Jadi Pelaku UMKM',
    actionType: 'AUTH_REGISTER',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Pilar ini menaruh rasa hormat tertinggi kepada para <strong>figur penjaga rasa</strong>: ibu-ibu pembuat kue tradisional, petani cabai dan kunyit lokal, nelayan pesisir Tanjung Batu dan Maratua, serta perajin anyaman Dayak.
        </p>
        <p className="text-xs text-slate-600">
          Dengan bertransaksi langsung di Banuarasa Weekend Market, 100% perputaran uang mengalir langsung ke dapur keluarga para pelaku UMKM Berau tanpa perantara tengkulak.
        </p>
      </div>
    ),
  },

  'pilar-experience': {
    id: 'pilar-experience',
    shortTitle: 'Pilar 4: Experience',
    badge: 'Interaksi Nyata',
    iconName: 'Compass',
    themeColor: 'teal',
    summary: 'Live cooking, lokakarya membatik, musik etnik, dan temu wicara.',
    fullTitle: 'Pilar 4: Experience (Pengalaman Interaktif & Partisipatif)',
    actionLabel: 'Lihat Jadwal Akhir Pekan',
    actionType: 'SCROLL_STAND',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Wisatawan tidak hanya duduk makan. Setiap akhir pekan diselenggarakan:
        </p>
        <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600">
          <li><strong>Live Cooking Demo:</strong> Menyaksikan langsung racikan bumbu Ancur Paddas di atas wajan kuali tradisional.</li>
          <li><strong>Panggung Musik Akustik Etnik:</strong> Dentingan sape Dayak dan irama gambus Melayu Banua.</li>
          <li><strong>Sudut Foto Bersama Maskot BARA:</strong> Berfoto dengan kostum tradisional adat Berau.</li>
          <li><strong>Workshop Singkat Kerajinan Tangan:</strong> Belajar menganyam manik manik motif khas Berau.</li>
        </ul>
      </div>
    ),
  },

  'bara-kelautan': {
    id: 'bara-kelautan',
    shortTitle: 'Kelautan Berau',
    badge: 'Karakter Bara',
    iconName: 'Smile',
    themeColor: 'amber',
    summary: 'Simbol kekayaan alam bahari pesisir Kepulauan Derawan & Maratua.',
    fullTitle: 'Filosofi Simbol Kelautan pada Karakter Maskot BARA',
    actionLabel: 'Sapa Bara',
    actionType: 'SPLASH_BARA',
    content: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Bentuk kerang laut pada karakter BARA terinspirasi dari keanekaragaman biota laut pesisir Berau yang terkenal di mata dunia (Kepulauan Derawan, Maratua, Sangalaki, dan Kakaban). Kerang melambangkan pelindung mutiara, di mana mutiara tersebut adalah kearifan kuliner lokal yang harus dijaga keasliannya.
        </p>
      </div>
    ),
  },

  'bara-kearifan': {
    id: 'bara-kearifan',
    shortTitle: 'Kearifan Etnik',
    badge: 'Karakter Bara',
    iconName: 'Sparkles',
    themeColor: 'emerald',
    summary: 'Motif etnik perpaduan busana adat Banua, Bajau, dan Dayak.',
    fullTitle: 'Kearifan Busana Tradisional Maskot BARA',
    actionLabel: 'Lihat Motif Budaya',
    actionType: 'NONE',
    content: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Busana yang dikenakan BARA memadukan warna emas (keagungan adat Banua & Kesultanan) dan warna hijau zamrud (kemakmuran alam hutan dan mangrove Dayak & Bajau). BARA membuktikan bahwa tiga etnis besar Kabupaten Berau hidup rukun berdampingan secara harmonis.
        </p>
      </div>
    ),
  },

  'bara-kolaborasi': {
    id: 'bara-kolaborasi',
    shortTitle: 'Gotong Royong',
    badge: 'Karakter Bara',
    iconName: 'ShieldCheck',
    themeColor: 'blue',
    summary: 'Semangat koperasi dan kebersamaan 64 stand UMKM Berau.',
    fullTitle: 'Semangat Kolaborasi & Gotong Royong UMKM',
    actionLabel: 'Gabung Koperasi',
    actionType: 'AUTH_REGISTER',
    content: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Sikap tangan BARA yang terbuka ramah melambangkan semangat koperasi: maju bersama, saling mendukung antar sesama pelaku usaha kecil, dan tidak saling menjatuhkan. Pasar ini adalah panggung bersama untuk tumbuh mandiri.
        </p>
      </div>
    ),
  },

  'bara-sahabat': {
    id: 'bara-sahabat',
    shortTitle: 'Sahabat Wisata',
    badge: 'Karakter Bara',
    iconName: 'Heart',
    themeColor: 'rose',
    summary: 'Duta keramahan masyarakat Berau bagi seluruh pengunjung.',
    fullTitle: 'BARA: Sahabat Terbaik Setiap Pengunjung & Wisatawan',
    actionLabel: 'Sapa BARA di Acara',
    actionType: 'SPLASH_BARA',
    content: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          Setiap pengunjung yang datang ke Banuarasa Weekend Market akan disambut oleh senyum ramah BARA. BARA siap memandu Anda mencari stand kuliner favorit, spot foto terbaik, hingga cinderamata khas Berau.
        </p>
      </div>
    ),
  },
};
