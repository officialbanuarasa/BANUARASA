import React, { useState } from 'react';
import { storage } from '../services/storage';
import { getStandPrice, getStandCategory } from '../services/standEngine';
import { BANUARASA_ASSETS, BARA_ASSETS } from '../assets/baraAssets';
import { AuthUser, Member } from '../types';
import {
  Sparkles,
  Store,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  ChevronRight,
  ArrowRight,
  Cloud,
  FileSpreadsheet,
  HardDrive,
  Award,
  BookOpen,
  DollarSign,
  Coffee,
  ShoppingBag,
  ExternalLink,
  Info,
  HelpCircle,
  Phone,
  Mail,
  Heart,
  Star,
  Zap,
  Lock,
  Utensils,
  BookMarked,
  Layers,
  Compass,
  Smile,
  Check,
  Palette,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuthModal: (mode: 'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER') => void;
  onOpenGoogleModal: () => void;
  onOpenSplashIntro?: () => void;
  onSelectProduct?: (product: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuthModal,
  onOpenGoogleModal,
  onOpenSplashIntro,
  onSelectProduct,
}) => {
  const [activeStandFilter, setActiveStandFilter] = useState<'ALL' | 'VIP' | 'KAT2' | 'KAT3'>('ALL');
  const [hoveredStand, setHoveredStand] = useState<string | null>(null);
  const [activeGastronomyTab, setActiveGastronomyTab] = useState<'FOOD' | 'STORY' | 'PEOPLE' | 'EXPERIENCE'>('FOOD');
  const [bannerTheme, setBannerTheme] = useState<'EMERALD' | 'GOLD' | 'TERATAI' | 'MARITIME'>('EMERALD');

  const members = storage.getMembers();
  const events = storage.getEvents();
  const products = storage.getProducts();
  const registrations = storage.getRegistrations();
  const branding = storage.getBrandingConfig();
  const currentEvent = events[0] || {
    event_id: 'BWM-2026-001',
    event_name: 'Banuarasa Weekend Market Edisi #24',
    event_date: '2026-09-05',
    start_time: '08:00',
    end_time: '17:00',
    location: 'Kawasan Tepian Teratai & Gedung UMKM, Tanjung Redeb, Berau',
    status: 'ACTIVE',
    total_stands: 64,
  };

  // 64 Stands Definition
  const vipStands = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const kat2Stands = Array.from({ length: 43 }, (_, i) => (i + 1).toString());
  const kat3Stands = Array.from({ length: 11 }, (_, i) => (i + 44).toString());

  const getStandOccupancy = (standCode: string) => {
    const reg = registrations.find(
      (r) =>
        r.event_id === currentEvent.event_id &&
        r.stand_code.toUpperCase() === standCode.toUpperCase() &&
        ['RESERVED', 'WAITING_PAYMENT', 'PAYMENT_VERIFICATION', 'CONFIRMED'].includes(r.registration_status)
    );
    if (!reg) return { status: 'AVAILABLE', reg: null };
    return {
      status: reg.registration_status === 'CONFIRMED' ? 'CONFIRMED' : 'RESERVED',
      reg,
    };
  };

  const totalBooked = registrations.filter(
    (r) =>
      r.event_id === currentEvent.event_id &&
      ['RESERVED', 'WAITING_PAYMENT', 'PAYMENT_VERIFICATION', 'CONFIRMED'].includes(r.registration_status)
  ).length;

  const totalAvailable = 64 - totalBooked;

  // Banner theme styling presets
  const getBannerThemeClasses = () => {
    switch (bannerTheme) {
      case 'GOLD':
        return {
          wrapper: 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 border-amber-500/40',
          titleGradient: 'from-amber-200 via-yellow-300 to-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          glow1: 'bg-amber-500/25',
          glow2: 'bg-yellow-400/20',
        };
      case 'TERATAI':
        return {
          wrapper: 'bg-gradient-to-br from-purple-950 via-slate-950 to-slate-900 border-purple-500/40',
          titleGradient: 'from-fuchsia-300 via-purple-300 to-teal-300',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          glow1: 'bg-purple-600/25',
          glow2: 'bg-teal-400/20',
        };
      case 'MARITIME':
        return {
          wrapper: 'bg-gradient-to-br from-sky-950 via-slate-950 to-blue-900 border-sky-500/40',
          titleGradient: 'from-sky-300 via-cyan-300 to-emerald-300',
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          glow1: 'bg-sky-600/25',
          glow2: 'bg-emerald-400/20',
        };
      case 'EMERALD':
      default:
        return {
          wrapper: 'bg-radial from-slate-900 via-slate-900 to-slate-950 border-slate-800',
          titleGradient: 'from-amber-300 via-emerald-400 to-teal-300',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          glow1: 'bg-emerald-600/20',
          glow2: 'bg-amber-500/15',
        };
    }
  };

  const currentTheme = getBannerThemeClasses();

  return (
    <div className="space-y-12 pb-16">
      {/* 1. BENTO GRID HERO SECTION — EMPHASIZING BANUARASA WEEKEND MARKET */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Main Bento Hero Banner (7 Cols) */}
        <div className={`md:col-span-7 ${currentTheme.wrapper} text-white rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden shadow-xl border transition-all duration-300`}>
          <div className={`absolute top-0 right-0 w-80 h-80 ${currentTheme.glow1} rounded-full blur-3xl pointer-events-none`}></div>
          <div className={`absolute bottom-0 left-0 w-60 h-60 ${currentTheme.glow2} rounded-full blur-2xl pointer-events-none`}></div>

          {/* Floating Mascot Watermark Ornament in Background */}
          <div className="absolute -right-8 -bottom-8 w-52 h-52 sm:w-64 sm:h-64 opacity-15 pointer-events-none select-none">
            <img
              src={branding.mascotUrl || BARA_ASSETS.shot2}
              alt="Bara Watermark"
              className="w-full h-full object-contain filter drop-shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = BARA_ASSETS.shot2;
              }}
            />
          </div>

          <div className="space-y-5 relative z-10">
            {/* Top Badges & Banner Style Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Official Logo Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-400/50 shadow-md">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-900 shrink-0 border border-amber-400">
                    <img
                      src={branding.logoUrl || BANUARASA_ASSETS.logo}
                      alt={branding.logoAlt || 'Logo Resmi'}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = BANUARASA_ASSETS.logo;
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-black text-amber-300">Wisata Gastronomi Berau</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${currentTheme.badgeBg} text-[11px] font-bold tracking-wide border`}>
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Koperasi Berau Melangkah Bersama</span>
                </div>
              </div>

              {/* Banner Theme Variation Picker & Splash Button */}
              <div className="flex items-center gap-1.5">
                {onOpenSplashIntro && (
                  <button
                    onClick={onOpenSplashIntro}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-xl shadow-xs transition-colors cursor-pointer"
                    title="Buka Sambutan Maskot Bara"
                  >
                    <Smile className="w-3 h-3" />
                    <span>Sambutan Bara</span>
                  </button>
                )}

                <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-700/60 backdrop-blur-xs">
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 flex items-center gap-1">
                    <Palette className="w-3 h-3 text-amber-400" />
                    <span>Gaya:</span>
                  </span>
                  <button
                    onClick={() => setBannerTheme('EMERALD')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      bannerTheme === 'EMERALD'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tema Zamrud Pesisir"
                  >
                    Zamrud
                  </button>
                  <button
                    onClick={() => setBannerTheme('GOLD')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      bannerTheme === 'GOLD'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tema Keraton Emas"
                  >
                    Emas
                  </button>
                  <button
                    onClick={() => setBannerTheme('TERATAI')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      bannerTheme === 'TERATAI'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tema Pasar Malam Teratai"
                  >
                    Teratai
                  </button>
                  <button
                    onClick={() => setBannerTheme('MARITIME')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      bannerTheme === 'MARITIME'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tema Bahari Kalimantan"
                  >
                    Bahari
                  </button>
                </div>
              </div>
            </div>

            {/* Headline with Brand and Slogan */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-950 p-1 shrink-0 shadow-lg shadow-amber-500/20">
                  <img
                    src={BANUARASA_ASSETS.logo}
                    alt="Logo Banua Rasa Weekend Market"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
                    BANUARASA <br />
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.titleGradient}`}>
                      WEEKEND MARKET
                    </span>
                  </h2>
                </div>
              </div>
              <div className="flex items-center flex-wrap gap-2 pt-1">
                <span className="text-amber-400 font-extrabold text-sm sm:text-base tracking-wide">
                  "Rasa Lokal, Cerita Global"
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 text-xs sm:text-sm font-medium">
                  Ekosistem 64 Stand Kuliner, Seni & Budaya
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Pengalaman wisata gastronomi autentik yang menggabungkan cita rasa tradisional khas Berau, narasi budaya, interaksi langsung dengan pelaku UMKM, serta sistem reservasi 64 stand berbasis digital dan sinkronisasi Google Workspace.
            </p>

            {/* Mascot Bara Banner Card with shoot-2 and Mascot Icon */}
            <div className="bg-slate-800/90 border border-amber-400/40 rounded-2xl p-4 flex items-center gap-4 max-w-lg shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shrink-0 bg-emerald-950 shadow-md">
                <img
                  src={branding.mascotUrl || BARA_ASSETS.mascot}
                  alt="Bara Maskot"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = BARA_ASSETS.mascot;
                  }}
                />
              </div>
              <div className="space-y-1 relative z-10 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-300">Hai, Saya BARA!</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/30 text-emerald-200 rounded-md font-bold border border-emerald-500/40">
                      Maskot Resmi
                    </span>
                  </div>
                  {onOpenSplashIntro && (
                    <button
                      onClick={onOpenSplashIntro}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      Buka Sambutan
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  "Yuk nikmati kuliner khas Berau, pelajari filosofi masakan daerah, dan dukung 64 stand UMKM lokal binaan kami!"
                </p>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="pt-6 sm:pt-8 flex flex-wrap items-center gap-3 relative z-10 border-t border-slate-800/80 mt-6">
            <button
              id="btn-hero-login"
              onClick={() => onOpenAuthModal('MEMBER_LOGIN')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Masuk Anggota UMKM</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-hero-register"
              onClick={() => onOpenAuthModal('REGISTER')}
              className="px-5 py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Daftar UMKM Baru</span>
            </button>

            <button
              id="btn-hero-admin"
              onClick={() => onOpenAuthModal('ADMIN_LOGIN')}
              className="px-4 py-3 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 font-bold text-xs sm:text-sm rounded-xl border border-purple-800/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>


        {/* Bento Side Stats & Event Widget (5 Cols) */}
        <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
          {/* Event Live Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
                  Pendaftaran Stand Buka
                </span>
                <h3 className="text-base font-black text-slate-900 mt-2">
                  Banuarasa Weekend Market
                </h3>
                <p className="text-xs text-slate-500 font-medium">Pasar Gastronomi & Kreatif Mingguan</p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-900 shrink-0">
                <span className="text-[10px] font-bold uppercase">Sabtu-Minggu</span>
                <span className="text-sm font-black">2026</span>
              </div>
            </div>

            <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pukul 08:00 - 17:00 WITA</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate">Kawasan Tepian Teratai & Gedung UMKM Berau</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600 shrink-0" />
                <span>64 Kapasitas Stand (Tersedia: {totalAvailable} Stand)</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Mulai Rp35.000 / Hari
              </span>
              <button
                onClick={() => onOpenAuthModal('MEMBER_LOGIN')}
                className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Pilih Stand Anda</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Google Workspace Cloud Sync Badge Card */}
          <div className="bg-emerald-900 text-white rounded-3xl p-6 border border-emerald-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-extrabold">
                  <Cloud className="w-4 h-4" />
                  <span>Google Sheets & Drive Hub</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Database & Dokumen Tersinkron
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 rounded-full text-[10px] font-mono font-bold">
                Live Active
              </span>
            </div>

            <p className="text-[11px] text-emerald-200/90 leading-relaxed my-3">
              Seluruh pendaftaran anggota, transaksi 64 stand, buku kas simpanan, dan upload foto bukti transfer tercatat rapi secara real-time.
            </p>

            <button
              id="btn-open-google-workspace"
              onClick={onOpenGoogleModal}
              className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-700/80 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span>Inspeksi Google Spreadsheet & Drive</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MASKOT BARA & GASTRONOMI BERAU HIGHLIGHT SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-emerald-800/40 shadow-xl overflow-hidden relative">
        {/* Left: Bara Profile & Costume Details (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Maskot Resmi Banuarasa</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Kenalan dengan <span className="text-amber-400">BARA</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Si Kerang Laut dari Kalimantan Timur yang cinta seni, budaya, dan kreativitas. Mengenakan pakaian tradisi masyarakat Berau yang menggabungkan unsur budaya <strong>Bajau, Banua, & Dayak</strong> dengan motif khas emas-hijau.
            </p>
          </div>

          {/* Bara Traits List */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                🐚
              </div>
              <h5 className="font-bold text-amber-300 text-xs">Simbol Kelautan</h5>
              <p className="text-[11px] text-slate-300">Kekayaan alam maritim pesisir Berau Kaltim.</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold">
                ✨
              </div>
              <h5 className="font-bold text-emerald-300 text-xs">Kearifan Lokal</h5>
              <p className="text-[11px] text-slate-300">Motif etnik Banua, Bajau & Dayak.</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-blue-400/20 text-blue-400 flex items-center justify-center font-bold">
                🤝
              </div>
              <h5 className="font-bold text-blue-300 text-xs">Kolaborasi UMKM</h5>
              <p className="text-[11px] text-slate-300">Mewakili kebersamaan & gotong royong.</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-rose-400/20 text-rose-400 flex items-center justify-center font-bold">
                💛
              </div>
              <h5 className="font-bold text-rose-300 text-xs">Sahabat Wisata</h5>
              <p className="text-[11px] text-slate-300">Menyapa & memandu di setiap weekend.</p>
            </div>
          </div>
        </div>

        {/* Center/Right: Bara Image & 4 Pilar Gastronomi (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                Konsep Wisata Berbasis Pengalaman
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white mt-0.5">
                4 Elemen Gastronomi Banuarasa
              </h4>
            </div>

            {/* UNWTO Badge */}
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold">
              Standar Gastronomy Tourism UNWTO
            </span>
          </div>

          {/* Interactive 4 Pillars Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveGastronomyTab('FOOD')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                activeGastronomyTab === 'FOOD'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Utensils className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black">1. Food</span>
              <span className="text-[9px] opacity-80">Kuliner Khas</span>
            </button>

            <button
              onClick={() => setActiveGastronomyTab('STORY')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                activeGastronomyTab === 'STORY'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookMarked className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black">2. Story</span>
              <span className="text-[9px] opacity-80">Narasi Budaya</span>
            </button>

            <button
              onClick={() => setActiveGastronomyTab('PEOPLE')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                activeGastronomyTab === 'PEOPLE'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black">3. People</span>
              <span className="text-[9px] opacity-80">Pelaku UMKM</span>
            </button>

            <button
              onClick={() => setActiveGastronomyTab('EXPERIENCE')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                activeGastronomyTab === 'EXPERIENCE'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black">4. Experience</span>
              <span className="text-[9px] opacity-80">Interaksi Nyata</span>
            </button>
          </div>

          {/* Pillar Content Description */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 text-xs">
            {activeGastronomyTab === 'FOOD' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                  <Utensils className="w-4 h-4" />
                  <span>Food (Kuliner Autentik)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Makanan khas daerah yang menjadi representasi cita rasa lokal Kabupaten Berau. Menggunakan bahan alam lokal, rempah pesisir, serta teknik dan resep turun-temurun yang mencerminkan kearifan lokal. Kuliner sebagai daya tarik utama wisata.
                </p>
              </div>
            )}

            {activeGastronomyTab === 'STORY' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                  <BookMarked className="w-4 h-4" />
                  <span>Story (Narasi & Budaya)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Cerita di balik setiap hidangan: asal-usul, filosofi adat Banua, Bajau, & Dayak, hingga nilai sosial yang melekat. Wisatawan diajak memahami makna lebih dalam dari sekadar mencicipi makanan. Kuliner sebagai media narasi budaya.
                </p>
              </div>
            )}

            {activeGastronomyTab === 'PEOPLE' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                  <Users className="w-4 h-4" />
                  <span>People (Pelaku & Penjaga Identitas Rasa)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Pelaku utama di balik kuliner: UMKM, juru masak lokal, nelayan, petani, hingga tetua adat yang merawat dan mewariskan tradisi kuliner Berau. Seluruhnya terkoordinir dalam keanggotaan Koperasi Berau Melangkah Bersama.
                </p>
              </div>
            )}

            {activeGastronomyTab === 'EXPERIENCE' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                  <Compass className="w-4 h-4" />
                  <span>Experience (Interaksi & Keterlibatan Langsung)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Keterlibatan langsung wisatawan: menyaksikan live cooking kuliner khas, food tasting, mini cooking class, meet the maker (berbincang dengan pelaku UMKM), hingga pertunjukan musik etnik tradisional di area 64 stand.
                </p>
              </div>
            )}
          </div>

          {/* Wisata Gastronomi vs Wisata Kuliner Callout */}
          <div className="bg-emerald-950/70 border border-emerald-700/50 rounded-2xl p-3.5 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-emerald-200/90 leading-relaxed">
              <strong className="text-white">Perbedaan Utama:</strong> Jika wisata kuliner berhenti pada <em>"apa yang dimakan"</em>, maka wisata gastronomi Banuarasa melangkah lebih jauh ke <em>"mengapa, bagaimana, dan siapa di balik makanan tersebut."</em>
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 64-STAND LAYOUT PREVIEW */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">
                Denah Interaktif 64 Stand Banuarasa Weekend Market
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                64 Alokasi Stand
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pilih stand favorit Anda. Klik salah satu stand untuk masuk dan melakukan reservasi langsung.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveStandFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeStandFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Stand (64)
            </button>
            <button
              onClick={() => setActiveStandFilter('VIP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeStandFilter === 'VIP'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              VIP A-J (Rp50k)
            </button>
            <button
              onClick={() => setActiveStandFilter('KAT2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeStandFilter === 'KAT2'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              Stand 1-43 (Rp35k)
            </button>
            <button
              onClick={() => setActiveStandFilter('KAT3')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeStandFilter === 'KAT3'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
              }`}
            >
              Stand 44-54 (Rp35k)
            </button>
          </div>
        </div>

        {/* Visual Map Grid */}
        <div className="space-y-6">
          {/* VIP SECTION (Stand A - J) */}
          {(activeStandFilter === 'ALL' || activeStandFilter === 'VIP') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 bg-amber-50/80 px-4 py-2 rounded-xl border border-amber-200">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>Zona Utama VIP (Stand A s/d J) — Rp50.000 / Hari</span>
                </span>
                <span className="text-[11px] text-amber-800">Posisi Paling Strategis Depan Panggung Festival</span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {vipStands.map((code) => {
                  const occ = getStandOccupancy(code);
                  const isAvailable = occ.status === 'AVAILABLE';
                  return (
                    <button
                      key={code}
                      onClick={() => onOpenAuthModal('MEMBER_LOGIN')}
                      onMouseEnter={() => setHoveredStand(code)}
                      onMouseLeave={() => setHoveredStand(null)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                        isAvailable
                          ? 'bg-white hover:bg-amber-50 border-amber-200 text-slate-800 hover:border-amber-400 hover:scale-105 shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-black">Stand {code}</span>
                      <span
                        className={`text-[9px] font-bold mt-1 px-1.5 py-0.2 rounded-md ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isAvailable ? 'Tersedia' : 'Terisi'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* KATEGORI 2 (Stand 1 - 43) */}
          {(activeStandFilter === 'ALL' || activeStandFilter === 'KAT2') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 bg-emerald-50/80 px-4 py-2 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Lorong Kuliner & Kriya (Stand 1 s/d 43) — Rp35.000 / Hari</span>
                </span>
                <span className="text-[11px] text-emerald-800">Fasilitas Listrik 450W & Meja Display Gastronomi</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-14 gap-2">
                {kat2Stands.map((code) => {
                  const occ = getStandOccupancy(code);
                  const isAvailable = occ.status === 'AVAILABLE';
                  return (
                    <button
                      key={code}
                      onClick={() => onOpenAuthModal('MEMBER_LOGIN')}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                        isAvailable
                          ? 'bg-white hover:bg-emerald-50 border-slate-200 text-slate-800 hover:border-emerald-500 hover:scale-105 shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-black">{code}</span>
                      <span
                        className={`text-[8px] font-bold mt-0.5 px-1 py-0.2 rounded-md ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isAvailable ? 'Kosong' : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* KATEGORI 3 (Stand 44 - 54) */}
          {(activeStandFilter === 'ALL' || activeStandFilter === 'KAT3') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 bg-blue-50/80 px-4 py-2 rounded-xl border border-blue-200">
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-600" />
                  <span>Zona Kreatif & Fashion (Stand 44 s/d 54) — Rp35.000 / Hari</span>
                </span>
                <span className="text-[11px] text-blue-800">Dekat Pintu Masuk Timur & Pusat Pengunjung</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
                {kat3Stands.map((code) => {
                  const occ = getStandOccupancy(code);
                  const isAvailable = occ.status === 'AVAILABLE';
                  return (
                    <button
                      key={code}
                      onClick={() => onOpenAuthModal('MEMBER_LOGIN')}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                        isAvailable
                          ? 'bg-white hover:bg-blue-50 border-slate-200 text-slate-800 hover:border-blue-500 hover:scale-105 shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-black">{code}</span>
                      <span
                        className={`text-[8px] font-bold mt-0.5 px-1 py-0.2 rounded-md ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isAvailable ? 'Kosong' : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Legend & Action */}
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Tersedia ({totalAvailable} Stand)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span>Sudah Dipesan ({totalBooked} Stand)</span>
            </span>
          </div>

          <button
            onClick={() => onOpenAuthModal('MEMBER_LOGIN')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Masuk untuk Memesan Stand</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 4. KATALOG PRODUK UNGGULAN UMKM BERAU */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Katalog Produk Unggulan Gastronomi UMKM Berau
            </h3>
            <p className="text-xs text-slate-500">
              Cita rasa khas Kabupaten Berau dan produk kreatif kerajinan tangan lokal dikoordinir Koperasi Berau Melangkah Bersama.
            </p>
          </div>

          <button
            onClick={() => onOpenAuthModal('MEMBER_LOGIN')}
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Pasarkan Produk Anda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((prod) => (
            <div
              key={prod.product_id}
              onClick={() => onSelectProduct && onSelectProduct(prod)}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={prod.image_url}
                  alt={prod.product_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg">
                  {prod.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {prod.product_name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Harga</p>
                    <p className="text-sm font-black text-slate-900">
                      Rp{prod.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                    Tersedia di Market
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PROGRAM BERJENJANG (WEEKLY, MONTHLY, ANNUAL) & PENTAHELIX */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
            W
          </div>
          <h4 className="text-base font-black text-slate-900">Weekly (Aktivasi Rutin)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Kegiatan mingguan 64 stand Banuarasa Weekend Market yang berfokus pada <em>traffic building</em> dan perputaran ekonomi cepat UMKM serta interaksi langsung dengan masyarakat.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
            M
          </div>
          <h4 className="text-base font-black text-slate-900">Monthly (Showcase & Edukasi)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Program bulanan kurasi kuliner, cooking demo, fasilitasi NIB/Halal, serta penguatan kapasitas branding dan packaging pelaku usaha lokal.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
            A
          </div>
          <h4 className="text-base font-black text-slate-900">Annual (Banuarasa Expo)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Festival tahunan berskala besar yang menjadi magnet wisata nasional, melibatkan kolaborasi pentahelix lintas kementerian, perbankan, dan komunitas.
          </p>
        </div>
      </section>

      {/* 6. 4 PILAR MANFAAT ANGGOTA KOPERASI BERAU MELANGKAH BERSAMA */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
            Manfaat & Pemberdayaan Anggota
          </span>
          <h3 className="text-2xl sm:text-3xl font-black">
            Mengapa UMKM Bergabung dengan Koperasi Berau Melangkah Bersama?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Koperasi bertindak sebagai payung kelembagaan yang mengkoordinasikan stand, pendanaan simpanan, dan legalitas seluruh pelaku Banuarasa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">Prioritas 64 Stand</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hak reservasi mandiri 24/7 untuk 64 stand Banuarasa Weekend Market dengan sistem kunci lock realtime anti bentrok.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">Fasilitasi Legalitas</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pendampingan resmi NIB OSS, Sertifikasi Halal BPJPH, Izin Edar P-IRT, dan NPWP Badan Usaha UMKM.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">Buku Simpanan Anggota</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pencatatan transparan Simpanan Pokok (Rp100k), Simpanan Wajib (Rp25k/bln), dan Simpanan Sukarela dengan status verifikasi instan.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-sm text-white">Google Cloud Sync</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Seluruh data pendaftaran dan berkas foto tersimpan aman di Google Spreadsheet dan Google Drive terstruktur.
            </p>
          </div>
        </div>
      </section>

      {/* 7. MITRA STRATEGIS PENTAHELIX & FOOTER */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
            Didukung Kolaborasi Pentahelix
          </p>
          <h4 className="text-sm font-bold text-slate-800">
            Ekosistem Kemitraan Pemerintah, Swasta, Komunitas, Akademisi & Media Kab. Berau
          </h4>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-600 font-extrabold text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Dinas Koperasi & UKM Kab. Berau</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Bank Kaltimtara Tanjung Redeb</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>PT Berau Coal CSR Synergy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>BRI Kantor Cabang Berau</span>
          </div>
        </div>

        {/* Official Banuarasa Branding & Mascot Banner Card */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-950 p-1 shrink-0 shadow-md">
              <img
                src={BANUARASA_ASSETS.logo}
                alt="Logo Resmi Banua Rasa Weekend Market"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h5 className="text-sm font-black text-slate-900 leading-tight">
                BANUARASA <span className="text-emerald-600">WEEKEND MARKET</span>
              </h5>
              <p className="text-xs font-bold text-amber-700">
                "Rasa Lokal, Cerita Global" • Koperasi Berau Melangkah Bersama
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Kawasan Tepian Teratai & Gedung Pusat UMKM Tanjung Redeb, Kabupaten Berau, Kalimantan Timur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenSplashIntro && (
              <button
                onClick={onOpenSplashIntro}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-amber-500">
                  <img
                    src={BARA_ASSETS.mascot}
                    alt="Bara"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>Sambutan Bara</span>
              </button>
            )}
            <p className="text-[11px] text-slate-400 font-medium">
              © 2026 Hak Cipta Dilindungi
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
