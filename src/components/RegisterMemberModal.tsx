import React, { useState } from 'react';
import { storage } from '../services/storage';
import { Member } from '../types';
import { X, Store, User, Phone, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

interface RegisterMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMember: Member) => void;
}

export const RegisterMemberModal: React.FC<RegisterMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<'KULINER' | 'FASHION' | 'KRIYA' | 'JASA' | 'AGROBISNIS'>('KULINER');
  const [nik, setNik] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const members = storage.getMembers();
    const newSeq = (members.length + 1).toString().padStart(3, '0');
    const memberId = `BM-${newSeq}`;
    const nomorAnggota = `KBM-${new Date().getFullYear()}-${newSeq}`;

    const member = storage.createMember({
      member_id: memberId,
      nomor_anggota: nomorAnggota,
      nama_lengkap: fullName,
      nik: nik,
      tempat_lahir: 'Tanjung Redeb',
      tanggal_lahir: '1990-01-01',
      jenis_kelamin: 'L',
      alamat: address,
      nomor_hp: whatsapp,
      email: email || `${memberId.toLowerCase()}@koperasiberau.id`,
      foto_profil_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      nama_usaha: businessName,
      deskripsi_usaha: `Usaha ${category.toLowerCase()} binaan Koperasi Berau Melangkah Bersama`,
      kategori_usaha: category === 'KULINER' ? 'Kuliner' : category === 'FASHION' ? 'Fashion' : category === 'KRIYA' ? 'Kriya' : 'Jasa',
      alamat_usaha: address,
      whatsapp: whatsapp,
      status_keanggotaan: 'ACTIVE',
      tanggal_bergabung: new Date().toISOString().split('T')[0],
    });

    setIsSubmitting(false);
    onSuccess(member);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Form Pendaftaran
            </span>
            <h2 className="text-lg font-black tracking-tight mt-1">
              Daftar Anggota UMKM Koperasi Berau
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Sesuai KTP</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Rahmat Hidayat"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Usaha / Brand</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Contoh: Dapur Rasa Berau"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Kategori Usaha</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="KULINER">Kuliner & Makanan</option>
                <option value="FASHION">Fashion & Tekstil</option>
                <option value="KRIYA">Kriya & Kerajinan</option>
                <option value="AGROBISNIS">Agrobisnis & Perikanan</option>
                <option value="JASA">Jasa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Induk Kependudukan (NIK)</label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="640301xxxxxxxxxx"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Aktif</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Alamat Tempat Usaha / Domisili Berau</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Pulau Derawan, Tanjung Redeb, Berau..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden h-16"
              required
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-tight">
              Dengan mendaftar, Anda menyetujui AD/ART Koperasi Berau Melangkah Bersama dan berhak mengikuti seleksi stand mingguan.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <span>DAFTAR SEKARANG</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
