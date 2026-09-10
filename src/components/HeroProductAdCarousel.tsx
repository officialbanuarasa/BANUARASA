import React, { useState, useEffect, useRef } from 'react';
import { MemberProductAd } from '../types';
import { storage } from '../services/storage';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Store,
  Tag,
  ExternalLink,
  ShoppingBag,
  Pause,
  Play,
  Sliders,
} from 'lucide-react';

interface HeroProductAdCarouselProps {
  onSelectStand?: (standCode: string) => void;
  onOpenAdminManage?: () => void;
  isSuperAdmin?: boolean;
}

export const HeroProductAdCarousel: React.FC<HeroProductAdCarouselProps> = ({
  onSelectStand,
  onOpenAdminManage,
  isSuperAdmin = false,
}) => {
  const [ads, setAds] = useState<MemberProductAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const loadAds = () => {
      const allAds = storage.getProductAds().filter((ad) => ad.is_active);
      setAds(allAds);
    };

    loadAds();
    const unsub = storage.subscribe(loadAds);
    return unsub;
  }, []);

  // Auto-advance carousel: berjalan otomatis dari kiri ke kanan (moving forward)
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [ads.length, isPaused]);

  if (ads.length === 0) return null;

  const currentAd = ads[currentIndex] || ads[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      id="hero-product-ads-carousel"
      className="relative w-full rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-slate-950 to-teal-950 text-white shadow-xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Banner Tagline & Superadmin Access */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-black/40 border-b border-emerald-500/20 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider shrink-0">
            Iklan Produk Unggulan Anggota
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-300 text-[11px] truncate">
            Pasar Mingguan Banuarasa Weekend Market
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
            title={isPaused ? 'Lanjutkan Putar Otomatis' : 'Jeda Carousel'}
            aria-label="Toggle pause"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {isSuperAdmin && onOpenAdminManage && (
            <button
              onClick={onOpenAdminManage}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-black transition-all cursor-pointer"
              title="Kelola Iklan Gambar Produk Anggota (Khusus Superadmin)"
            >
              <Sliders className="w-3 h-3" />
              <span>Kelola Iklan</span>
            </button>
          )}

          <div className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            {currentIndex + 1} / {ads.length}
          </div>
        </div>
      </div>

      {/* Main Carousel Display */}
      <div className="relative p-4 sm:p-6 lg:p-7 flex flex-col md:flex-row items-center gap-5 sm:gap-7">
        {/* Left Side: Product Image Showcase */}
        <div className="relative w-full md:w-5/12 max-w-sm shrink-0 rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-slate-900 border border-slate-700/60 shadow-lg group-hover:border-emerald-500/40 transition-colors">
          <img
            key={currentAd.ad_id}
            src={currentAd.image_url}
            alt={currentAd.title}
            className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
            }}
          />
          {currentAd.stand_code && (
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-emerald-400 px-3 py-1 rounded-xl text-xs font-black border border-emerald-500/40 flex items-center gap-1.5 shadow-md">
              <Store className="w-3.5 h-3.5" />
              <span>Stand {currentAd.stand_code}</span>
            </div>
          )}

          {currentAd.promo_text && (
            <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-r from-amber-600/90 to-orange-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span className="truncate">{currentAd.promo_text}</span>
            </div>
          )}
        </div>

        {/* Right Side: Product Details & CTA */}
        <div className="w-full md:w-7/12 flex flex-col justify-between space-y-3 sm:space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                {currentAd.store_name}
              </span>
              {currentAd.stand_code && (
                <span className="text-slate-400 text-xs font-semibold">
                  Lokasi Stand: <strong className="text-slate-200">{currentAd.stand_code}</strong>
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {currentAd.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
              {currentAd.product_name}
            </p>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 pt-1">
            {currentAd.price ? (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Harga Spesial</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  Rp{currentAd.price.toLocaleString('id-ID')}
                </span>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {currentAd.stand_code && onSelectStand && (
              <button
                onClick={() => onSelectStand(currentAd.stand_code || '')}
                className="px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Lihat Stand {currentAd.stand_code} di Peta</span>
              </button>
            )}

            {currentAd.target_url && (
              <a
                href={currentAd.target_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Pesan / Beli Produk</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls: Arrows & Indicators */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-950/60 border-t border-slate-800/80">
        {/* Navigation Dots */}
        <div className="flex items-center gap-1.5">
          {ads.map((ad, idx) => (
            <button
              key={ad.ad_id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-emerald-400'
                  : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              title={`Lihat slide iklan: ${ad.title}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Iklan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Iklan Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
