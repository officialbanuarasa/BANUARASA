import React, { useState } from 'react';

export const BaraMascotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tipsIndex, setTipsIndex] = useState(0);

  const tips = [
    'Halo! Aku Bara, maskot Banuarasa. Jangan lupa konfirmasi pesanan stand sebelum 15 menit ya!',
    'Tahukah kamu? UMKM kuliner di Berau bisa mendaftarkan produk autentiknya langsung ke koperasi.',
    'Pastikan upload bukti transfer QRIS atau transfer bank dengan gambar yang jelas agar cepat diverifikasi admin.',
    'Pantau omzet harian stand kamu di dashboard anggota untuk rekapan berkala akhir pekan.'
  ];

  const handleNextTip = () => {
    setTipsIndex((prev) => (prev + 1) % tips.length);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-72 rounded-2xl bg-white p-4 shadow-xl border border-slate-200 transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Bara si Maskot</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">Tips UMKM</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
            {tips[tipsIndex]}
          </p>
          <div className="mt-3 flex justify-between items-center pt-2 border-t border-slate-100 text-[10px]">
            <span className="text-slate-400">{tipsIndex + 1} dari {tips.length}</span>
            <button
              onClick={handleNextTip}
              className="text-emerald-600 hover:text-emerald-700 font-bold"
            >
              Tips Berikutnya →
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition"
        title="Tanya Bara"
      >
        <span className="text-2xl transition group-hover:rotate-12">🦔</span>
      </button>
    </div>
  );
};

export default BaraMascotWidget;
