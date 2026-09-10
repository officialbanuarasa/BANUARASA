import React, { useState, useEffect, useRef } from 'react';
import { Sponsor } from '../types';
import { storage } from '../services/storage';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Building2,
  Sliders,
  ShieldCheck,
  Pause,
  Play,
} from 'lucide-react';

interface PartnerLogoCarouselProps {
  onManagePartners?: () => void;
  isSuperAdmin?: boolean;
}

export const PartnerLogoCarousel: React.FC<PartnerLogoCarouselProps> = ({
  onManagePartners,
  isSuperAdmin = false,
}) => {
  const [partners, setPartners] = useState<Sponsor[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPartners = () => {
      const all = storage.getSponsors().filter((s) => s.is_active);
      // sort by order if available
      all.sort((a, b) => (a.order || 99) - (b.order || 99));
      setPartners(all);
    };

    loadPartners();
    const unsub = storage.subscribe(loadPartners);
    return unsub;
  }, []);

  // Auto-scroll track continuously or step-by-step
  useEffect(() => {
    if (isPaused || partners.length <= 2) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 240, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, partners.length]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  if (partners.length === 0) return null;

  return (
    <section
      id="pentahelix-partner-carousel-section"
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
    >
      {/* Header & Superadmin Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <Building2 className="w-3.5 h-3.5" />
            </span>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              Didukung Kolaborasi Pentahelix & Mitra Perusahaan
            </p>
          </div>
          <h4 className="text-base font-black text-slate-900">
            Ekosistem Kemitraan Pemerintah, BUMN, Perbankan, Swasta & Akademisi Kab. Berau
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title={isPaused ? 'Lanjutkan Auto-scroll' : 'Jeda Auto-scroll'}
            aria-label="Toggle pause auto-scroll"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Prev / Next buttons */}
          <button
            onClick={handleScrollLeft}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            aria-label="Scroll logo ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleScrollRight}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            aria-label="Scroll logo ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {isSuperAdmin && onManagePartners && (
            <button
              onClick={onManagePartners}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Kelola Daftar Logo Perusahaan & Kemitraan Pentahelix"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Kelola Logo Mitra</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex items-stretch gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {partners.map((partner) => (
          <div
            key={partner.sponsor_id}
            className="shrink-0 w-64 sm:w-72 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/90 hover:border-emerald-500/40 p-4 flex flex-col justify-between space-y-3 transition-all duration-200 hover:shadow-md group"
          >
            {/* Logo Container */}
            <div className="w-full h-20 bg-white rounded-xl border border-slate-200/70 p-3 flex items-center justify-center overflow-hidden">
              <img
                src={partner.logo_url}
                alt={partner.sponsor_name}
                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=300&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            {/* Info Container */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider truncate">
                  {partner.category || partner.tier || 'Mitra Strategis'}
                </span>
                {partner.website_url && (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                    title={`Kunjungi situs ${partner.sponsor_name}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <h5 className="text-xs font-black text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                {partner.sponsor_name}
              </h5>

              {partner.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {partner.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
