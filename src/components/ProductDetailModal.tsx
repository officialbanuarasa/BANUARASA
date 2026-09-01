import React from 'react';
import { Product, Member } from '../types';
import { storage } from '../services/storage';
import { X, Store, Phone, MapPin, Tag, ShieldCheck } from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!isOpen || !product) return null;

  const member = storage.getMemberById(product.member_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header Image */}
        <div className="relative h-64 bg-slate-100">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="absolute bottom-4 left-4 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">{product.product_name}</h3>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              Rp{product.price.toLocaleString('id-ID')}
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
            {product.description || 'Produk lokal berkualitas dari tenant binaan Koperasi Berau Melangkah Bersama.'}
          </p>

          {/* Merchant Profile */}
          {member && (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Profil Tenant UMKM
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {member.nomor_anggota}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-600" />
                  {member.nama_usaha}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{member.nama_lengkap}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {member.alamat}
                </p>
              </div>
            </div>
          )}

          {/* WhatsApp Direct Order Button */}
          <div className="pt-2">
            <a
              href={`https://wa.me/${String(member?.whatsapp || member?.nomor_hp || '').replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(
                member?.nama_usaha || ''
              )},%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(
                product.product_name
              )}%20di%20Banuarasa%20Weekend%20Market.`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>PESAN LANGSUNG VIA WHATSAPP TENANT</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
