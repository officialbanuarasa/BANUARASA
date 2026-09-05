import React, { useState } from 'react';
import { EventItem, Product } from '../types';

interface LandingPageProps {
  events: EventItem[];
  products: Product[];
  onOpenStandMap: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectEditorial: (id: string) => void;
  onOpenRegisterMember: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  events,
  products,
  onOpenStandMap,
  onSelectProduct,
  onSelectEditorial,
  onOpenRegisterMember,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredProducts = products.filter(p => 
    selectedCategory === 'ALL' ? true : p.category === selectedCategory
  );

  const activeEvent = events.find(e => e.status === 'UPCOMING' || e.status === 'ONGOING') || events[0];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-xs">
            <span>✨</span>
            <span>Pasar Akhir Pekan Kuliner & Kreatif Terbesar di Berau</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Rayakan Cita Rasa & Kreativitas Lokal di{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Banuarasa
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Wadah kolaborasi UMKM binaan Koperasi Banuarasa. Akses produk lokal autentik, reservasi stand event berkala, dan bertransaksi langsung secara transparan.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={onOpenStandMap}
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition hover:-translate-y-0.5"
            >
              Lihat Denah Stand Event
            </button>
            <button
              onClick={onOpenRegisterMember}
              className="px-6 py-3.5 rounded-xl font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition hover:-translate-y-0.5"
            >
              Daftar Jadi Anggota UMKM
            </button>
          </div>
        </div>
      </section>

      {/* Highlight Acara Aktif */}
      {activeEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {activeEvent.status}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeEvent.timezone || 'WITA (Berau)'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{activeEvent.title}</h2>
              <p className="text-sm text-slate-600 max-w-xl">{activeEvent.description}</p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 pt-2">
                <span>📅 {activeEvent.event_date}</span>
                <span>⏰ {activeEvent.start_time} - {activeEvent.end_time}</span>
                <span>📍 {activeEvent.location}</span>
              </div>
            </div>

            <button
              onClick={onOpenStandMap}
              className="w-full md:w-auto whitespace-nowrap px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md transition"
            >
              Reservasi Stand ({activeEvent.available_stands ?? 64} Tersisa)
            </button>
          </div>
        </section>
      )}

      {/* Etalase Produk UMKM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Etalase Produk Unggulan</h2>
            <p className="text-sm text-slate-500">Produk lokal berkualitas karya anggota Koperasi Banuarasa</p>
          </div>

          {/* Filter Kategori */}
          <div className="flex overflow-x-auto gap-2 text-xs font-semibold">
            {['ALL', 'KULINER', 'KERAJINAN', 'FASHION', 'JASA'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'Semua' : cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            Belum ada produk terdaftar di kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.product_id}
                onClick={() => onSelectProduct(p)}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col"
              >
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl font-black">
                      B
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-700 shadow-xs">
                    {p.category}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{p.member_name}</p>
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-emerald-600">
                    Rp {p.price.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pojok Edukasi & Liputan Editorial */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Kabar & Editorial Banuarasa</h2>
          <p className="text-sm text-slate-500">Wawasan pengembangan usaha, sejarah gastronomi, dan agenda komunitas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 'gastronomi-berau',
              title: 'Menyusuri Jejak Rempah Gastronomi Kesultanan Berau',
              excerpt: 'Eksplorasi resep kuliner warisan pesisir yang kini menjadi daya tarik utama pasar akhir pekan Banuarasa.',
              tag: 'Budaya & Kuliner'
            },
            {
              id: 'koperasi-digital',
              title: 'Transformasi Koperasi Banuarasa Menuju Ekosistem Digital',
              excerpt: 'Bagaimana pencatatan simpanan dan alokasi stand digital membantu UMKM Berau naik kelas secara akuntabel.',
              tag: 'Ekonomi UMKM'
            },
            {
              id: 'tips-stand-weekend',
              title: '5 Tips Mengoptimalkan Omzet Stand di Akhir Pekan',
              excerpt: 'Strategi visual merchandise, penataan display produk, hingga alur transaksi digital cepat QRIS.',
              tag: 'Panduan Usaha'
            }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectEditorial(item.id)}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {item.tag}
                </span>
                <h3 className="text-base font-bold text-slate-900 hover:text-emerald-600 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.excerpt}</p>
              </div>

              <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
                Baca Selengkapnya →
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
