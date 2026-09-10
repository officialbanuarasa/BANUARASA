import React, { useEffect, useRef, useState } from 'react';
import { MemberCardDesignConfig, MemberCardTheme, MemberCardElement } from '../types';
import { storage } from '../services/storage';
import { googleWorkspaceSync } from '../services/googleWorkspaceSync';
import { BANUARASA_ASSETS } from '../assets/baraAssets';
import { generateQrCodeDataUrl, renderBarcodeToElement, formatVerificationUrl } from '../utils/barcode';
import {
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Palette,
  Eye,
  RotateCw,
  Save,
  QrCode,
  Building2,
  Calendar,
  UserCheck,
  Award,
  Layers,
  FileText,
  Check,
} from 'lucide-react';

interface AdminCardStudioProps {
  adminUsername?: string;
  onSaved?: () => void;
}

const THEME_OPTIONS: {
  id: MemberCardTheme;
  name: string;
  desc: string;
  bgGradient: string;
  borderColor: string;
  accentBadge: string;
  sampleTextColor: string;
}[] = [
  {
    id: 'LUXURY_SLATE',
    name: 'Luxury Slate & Gold',
    desc: 'Nuansa gelap elegan berkelas dengan aksen emas zamrud.',
    bgGradient: 'from-slate-950 via-slate-900 to-emerald-950',
    borderColor: 'border-emerald-500/40',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    sampleTextColor: 'text-white',
  },
  {
    id: 'EMERALD_GOLD',
    name: 'Emerald Berau Royalti',
    desc: 'Warna hijau zamrud khas Koperasi Berau dengan kemewahan emas.',
    bgGradient: 'from-emerald-900 via-teal-950 to-slate-900',
    borderColor: 'border-amber-400/50',
    accentBadge: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
    sampleTextColor: 'text-amber-50',
  },
  {
    id: 'ROYAL_PURPLE',
    name: 'Teratai Ungu Keraton',
    desc: 'Paduan royal violet dan ornamen emas khas kebangsawanan.',
    bgGradient: 'from-purple-950 via-indigo-950 to-slate-900',
    borderColor: 'border-purple-400/40',
    accentBadge: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
    sampleTextColor: 'text-purple-50',
  },
  {
    id: 'OCEAN_BLUE',
    name: 'Bahari Derawan Blue',
    desc: 'Nuansa biru laut pesisir Borneo yang dinamis dan segar.',
    bgGradient: 'from-sky-950 via-blue-950 to-slate-900',
    borderColor: 'border-cyan-400/40',
    accentBadge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30',
    sampleTextColor: 'text-cyan-50',
  },
  {
    id: 'MINIMAL_LIGHT',
    name: 'Modern Executive Light',
    desc: 'Latar terang bersih minimalis dengan list emerald premium.',
    bgGradient: 'from-slate-50 via-emerald-50/40 to-slate-100',
    borderColor: 'border-emerald-300',
    accentBadge: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    sampleTextColor: 'text-slate-900',
  },
];

export const AdminCardStudio: React.FC<AdminCardStudioProps> = ({
  adminUsername = 'SUPER_ADMIN',
  onSaved,
}) => {
  const currentConfig = storage.getMemberCardDesign();
  const [design, setDesign] = useState<MemberCardDesignConfig>(currentConfig);
  const [activeSide, setActiveSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeElementId, setActiveElementId] = useState<string>('name');
  const barcodePreviewRef = useRef<SVGSVGElement | null>(null);
  const [previewQr, setPreviewQr] = useState('');

  // Sample Preview Data
  const sampleMember = {
    member_id: 'BM-2026-000123',
    nomor_anggota: 'KBMB-2026-0042',
    nama_lengkap: 'Siti Dahlia Rahmawati',
    nama_usaha: 'Dapur Dahlia Kuliner Berau',
    kategori_usaha: 'Kuliner & Makanan Khas',
    alamat_usaha: 'Jl. Pemuda No. 14, Tanjung Redeb, Berau',
    tanggal_bergabung: '2026-01-15',
    foto_profil_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    status_anggota: 'ACTIVE',
    rating_stand: 4.9,
  };

  const selectedTheme = THEME_OPTIONS.find((t) => t.id === design.theme) || THEME_OPTIONS[0];

  const handleSave = async () => {
    setSaveError('');
    try {
      await storage.updateMemberCardDesign(design, adminUsername);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSaved) onSaved();
    } catch (error: any) {
      setSaveError(error?.message || 'Desain KTA gagal disimpan ke Google Spreadsheet.');
    }
  };

  const elements = design.elements || [];
  const activeElement = elements.find((e) => e.id === activeElementId) || elements[0];
  const updateElement = (id: string, patch: Partial<MemberCardElement>) => {
    setDesign((prev) => ({ ...prev, elements: (prev.elements || []).map((e) => e.id === id ? { ...e, ...patch } : e) }));
  };
  const addTextElement = () => {
    const id = `text-${Date.now()}`;
    const element: MemberCardElement = { id, side: activeSide, type:'TEXT', label:'Teks Baru', content:'Teks baru', x:10, y:20, width:50, height:10, fontFamily:'Arial', fontSize:8, fontWeight:600, color:'#FFFFFF', align:'left', visible:true };
    setDesign((prev) => ({ ...prev, elements:[...(prev.elements || []), element] }));
    setActiveElementId(id);
  };
  const addFieldElement = () => {
    const id = `field-${Date.now()}`;
    const element: MemberCardElement = { id, side: activeSide, type:'FIELD', label:'Data Nama', field:'nama_lengkap', x:10, y:35, width:55, height:10, fontFamily:'Arial', fontSize:9, fontWeight:700, color:'#FFFFFF', align:'left', visible:true };
    setDesign((prev) => ({ ...prev, elements:[...(prev.elements || []), element] }));
    setActiveElementId(id);
  };

  const uploadDesignAsset = async (file: File, kind: 'logo' | 'background') => {
    if (file.size > 4 * 1024 * 1024) throw new Error('Ukuran aset maksimal 4 MB.');
    const base64 = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload=()=>resolve(String(r.result)); r.onerror=reject; r.readAsDataURL(file); });
    const result:any = await googleWorkspaceSync.uploadFile(file, `KTA_${kind.toUpperCase()}`, 'KTA-DESIGN', adminUsername);
    const remote:any = result?.result ?? result?.data ?? result;
    if (!result?.success || !remote?.driveUrl) throw new Error(result?.error || result?.message || 'Upload aset gagal.');
    return remote.driveUrl as string;
  };
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0]; e.target.value=''; if(!file) return;
    try { const url=await uploadDesignAsset(file,'logo'); setDesign(prev=>({...prev,customLogoUrl:url,elements:(prev.elements||[]).map(x=>x.type==='LOGO'?{...x,url}:x)})); } catch(err:any){setSaveError(err?.message||'Upload logo gagal.');}
  };
  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0]; e.target.value=''; if(!file) return;
    try { const url=await uploadDesignAsset(file,'background'); setDesign(prev=>activeSide==='FRONT'?{...prev,frontBackgroundUrl:url}:{...prev,backBackgroundUrl:url}); } catch(err:any){setSaveError(err?.message||'Upload background gagal.');}
  };

  useEffect(() => {
    generateQrCodeDataUrl(formatVerificationUrl(sampleMember.member_id), { width:160, margin:1 }).then(setPreviewQr);
  }, []);
  useEffect(() => {
    if (!barcodePreviewRef.current) return;
    const el = elements.find((e) => e.side === activeSide && e.type === 'BARCODE' && e.visible);
    if (el) renderBarcodeToElement(barcodePreviewRef.current, sampleMember.nomor_anggota, { height:45, width:1.5, displayValue:true, fontSize:8, margin:2 });
  }, [activeSide, elements]);

  const handleResetToDefault = () => {
    const defaultData = storage.getMemberCardDesign();
    setDesign({
      ...defaultData,
      theme: 'LUXURY_SLATE',
      cardTitle: 'KARTU TANDA ANGGOTA RESMI',
      organizationName: 'KOPERASI BERAU MELANGKAH BERSAMA',
      marketName: 'BANUARASA WEEKEND MARKET',
      badgeText: 'ANGGOTA TERVERIFIKASI',
      tagline: 'Wisata Gastronomi & UMKM Kreatif Berau',
      authorizedOfficerName: 'H. AHMAD FAUZI',
      authorizedOfficerTitle: 'Ketua Pengurus Koperasi',
      authorizedOfficerNip: 'REG.KOP-6403/2026',
      showPhoto: true,
      showQrCode: true,
      showBusinessName: true,
      showCategory: true,
      showAddress: true,
      showJoinDate: true,
      showValidityPeriod: true,
      validityDurationYears: 3,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-emerald-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KTA Studio • Editor Desain Kartu Digital</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Desain Kartu Tanda Anggota (KTA) Resmi
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Super Admin dapat mengubah tema grafis, teks legalitas, pejabat penandatangan, dan elemen data yang ditampilkan pada kartu digital seluruh anggota UMKM.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Reset Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Desain Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Desain KTA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold">{saveError}</div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Desain KTA Digital berhasil diperbarui & otomatis diterapkan pada kartu semua anggota di perangkat manapun!
          </span>
        </div>
      )}

      {/* 2 Column Layout: Controls & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Theme Palette Selection */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Palette className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">1. Pilih Tema & Palet Visual Kartu</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = design.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setDesign({ ...design, theme: theme.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-black text-slate-900">{theme.name}</span>
                      {isSelected && (
                        <span className="p-1 bg-emerald-600 text-white rounded-full">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    {/* Mini Swatch */}
                    <div
                      className={`h-7 w-full rounded-lg bg-gradient-to-r ${theme.bgGradient} ${theme.borderColor} border flex items-center justify-between px-2.5`}
                    >
                      <span className="text-[10px] font-bold text-white/90">KTA Sample</span>
                      <span className="text-[9px] font-mono text-emerald-300">#64</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{theme.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Text & Legal Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">2. Teks & Identitas Organisasi</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Judul Kartu</label>
                <input
                  type="text"
                  value={design.cardTitle}
                  onChange={(e) => setDesign({ ...design, cardTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="KARTU TANDA ANGGOTA RESMI"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nama Organisasi / Koperasi</label>
                <input
                  type="text"
                  value={design.organizationName}
                  onChange={(e) => setDesign({ ...design, organizationName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="KOPERASI BERAU MELANGKAH BERSAMA"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nama Pasar / Program</label>
                <input
                  type="text"
                  value={design.marketName}
                  onChange={(e) => setDesign({ ...design, marketName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="BANUARASA WEEKEND MARKET"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Teks Badge Status</label>
                <input
                  type="text"
                  value={design.badgeText}
                  onChange={(e) => setDesign({ ...design, badgeText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="ANGGOTA TERVERIFIKASI"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Slogan / Tagline Kartu</label>
                <input
                  type="text"
                  value={design.tagline}
                  onChange={(e) => setDesign({ ...design, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Wisata Gastronomi & UMKM Kreatif Berau"
                />
              </div>
            </div>
          </div>

          {/* Pengesahan Pejabat & Masa Berlaku */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">3. Pejabat Pengesah & Legalitas</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nama Pejabat Penandatangan</label>
                <input
                  type="text"
                  value={design.authorizedOfficerName}
                  onChange={(e) => setDesign({ ...design, authorizedOfficerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="H. AHMAD FAUZI"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Jabatan Pengesah</label>
                <input
                  type="text"
                  value={design.authorizedOfficerTitle}
                  onChange={(e) => setDesign({ ...design, authorizedOfficerTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ketua Pengurus Koperasi"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">No. Registrasi / NIP</label>
                <input
                  type="text"
                  value={design.authorizedOfficerNip || ''}
                  onChange={(e) => setDesign({ ...design, authorizedOfficerNip: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="REG.KOP-6403/2026"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="font-bold text-slate-700">Catatan Legalitas / Disclaimer di Belakang Kartu</label>
                <textarea
                  rows={2}
                  value={design.disclaimerNotes}
                  onChange={(e) => setDesign({ ...design, disclaimerNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
                  placeholder="Kartu ini adalah bukti keanggotaan sah..."
                />
              </div>
            </div>
          </div>

          {/* Toggle Display Elements */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">4. Elemen Data yang Ditampilkan</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                {
                  key: 'showPhoto',
                  label: 'Foto Profil Anggota',
                  desc: 'Foto asli yang diunggah oleh anggota UMKM',
                },
                {
                  key: 'showQrCode',
                  label: 'QR Code Verifikasi',
                  desc: 'Dapat dipindai scanner untuk verifikasi stand',
                },
                {
                  key: 'showBusinessName',
                  label: 'Nama Usaha / Gerai UMKM',
                  desc: 'Merek kuliner / kriya anggota',
                },
                {
                  key: 'showCategory',
                  label: 'Kategori Usaha',
                  desc: 'Kategori: Kuliner, Kriya, Fashion, dll',
                },
                {
                  key: 'showAddress',
                  label: 'Alamat Anggota',
                  desc: 'Kota & domisili di Berau',
                },
                {
                  key: 'showJoinDate',
                  label: 'Tanggal Registrasi',
                  desc: 'Tanggal resmi bergabung di Koperasi',
                },
                {
                  key: 'showValidityPeriod',
                  label: 'Masa Berlaku Kartu',
                  desc: 'Durasi keaktifan kartu anggota digital',
                },
              ].map((item) => {
                const isChecked = (design as any)[item.key] ?? true;
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-white border-slate-200 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setDesign({ ...design, [item.key]: e.target.checked } as any)
                      }
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{item.label}</p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

          {/* Manual Layout Editor */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-600"/><h3 className="text-sm font-black text-slate-900">5. Layout Manual KTA — X / Y / Font / Teks</h3></div>
              <div className="flex gap-2"><button type="button" onClick={addTextElement} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold">+ Teks</button><button type="button" onClick={addFieldElement} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">+ Data</button></div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <label className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold cursor-pointer">Upload Logo<input type="file" accept="image/*" hidden onChange={handleLogoUpload}/></label>
              <label className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold cursor-pointer">Background {activeSide}<input type="file" accept="image/*" hidden onChange={handleBackgroundUpload}/></label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {elements.map((e) => <button key={e.id} type="button" onClick={() => setActiveElementId(e.id)} className={`text-left p-2.5 rounded-xl border text-[10px] font-bold ${activeElementId===e.id?'border-emerald-500 bg-emerald-50':'border-slate-200 bg-white'}`}>{e.label}<span className="block text-[9px] text-slate-400">{e.side} · {e.type}</span></button>)}
            </div>
            {activeElement && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
              <label>Side<select value={activeElement.side} onChange={e=>updateElement(activeElement.id,{side:e.target.value as any})} className="w-full mt-1 border rounded-lg p-2"><option value="FRONT">Depan</option><option value="BACK">Belakang</option></select></label>
              <label>X (%)<input type="number" value={activeElement.x} onChange={e=>updateElement(activeElement.id,{x:Number(e.target.value)})} className="w-full mt-1 border rounded-lg p-2"/></label>
              <label>Y (%)<input type="number" value={activeElement.y} onChange={e=>updateElement(activeElement.id,{y:Number(e.target.value)})} className="w-full mt-1 border rounded-lg p-2"/></label>
              <label>Lebar (%)<input type="number" value={activeElement.width} onChange={e=>updateElement(activeElement.id,{width:Number(e.target.value)})} className="w-full mt-1 border rounded-lg p-2"/></label>
              <label>Tinggi (%)<input type="number" value={activeElement.height} onChange={e=>updateElement(activeElement.id,{height:Number(e.target.value)})} className="w-full mt-1 border rounded-lg p-2"/></label>
              <label>Font<input type="text" value={activeElement.fontFamily || ''} onChange={e=>updateElement(activeElement.id,{fontFamily:e.target.value})} className="w-full mt-1 border rounded-lg p-2"/></label>
              <label>Size<input type="number" min={1} max={72} value={activeElement.fontSize || 8} onChange={e=>updateElement(activeElement.id,{fontSize:Number(e.target.value)})} className="w-full mt-1 border rounded-lg p-2"/></label>
              <label>Align<select value={activeElement.align || 'left'} onChange={e=>updateElement(activeElement.id,{align:e.target.value as any})} className="w-full mt-1 border rounded-lg p-2"><option>left</option><option>center</option><option>right</option></select></label>
              <label className="col-span-2 sm:col-span-4">Teks / Isi<textarea value={activeElement.content || ''} onChange={e=>updateElement(activeElement.id,{content:e.target.value})} rows={2} className="w-full mt-1 border rounded-lg p-2"/></label>
              <label className="col-span-2 sm:col-span-4">Data Field<input type="text" value={activeElement.field || ''} onChange={e=>updateElement(activeElement.id,{field:e.target.value})} placeholder="nama_lengkap / member_id / nama_usaha" className="w-full mt-1 border rounded-lg p-2"/></label>
            </div>}
          </div>

        {/* Right Column: Interactive Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 space-y-4">
            {/* Switch Front/Back */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Live Preview Kartu Digital</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveSide('FRONT')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeSide === 'FRONT'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tampak Depan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSide('BACK')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeSide === 'BACK'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tampak Belakang
                </button>
              </div>
            </div>

            {/* THE CARD PREVIEW */}
            <div className="relative group">
              <div className="relative aspect-[1.586/1] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900">
                {(activeSide === 'FRONT' ? design.frontBackgroundUrl : design.backBackgroundUrl) ? <img src={activeSide === 'FRONT' ? design.frontBackgroundUrl : design.backBackgroundUrl} className="absolute inset-0 w-full h-full object-cover" alt="KTA background"/> : <div className={`absolute inset-0 bg-gradient-to-br ${selectedTheme.bgGradient}`} />}
                <div className="absolute inset-0 bg-black/20" />
                {(elements.filter(e=>e.side===activeSide && e.visible)).map((e) => {
                  const value = e.type === 'FIELD' ? String((sampleMember as any)[e.field || ''] ?? '') : (e.content || '');
                  const style: React.CSSProperties = { position:'absolute', left:`${e.x}%`, top:`${e.y}%`, width:`${e.width}%`, height:`${e.height}%`, fontFamily:e.fontFamily || 'Arial', fontSize:`${Math.max(5,(e.fontSize||8)*0.75)}px`, fontWeight:e.fontWeight || 600, color:e.color || '#fff', textAlign:e.align || 'left', opacity:e.opacity ?? 1, transform:`rotate(${e.rotation || 0}deg)`, lineHeight:e.lineHeight || 1.15 };
                  if (e.type === 'PHOTO') return <img key={e.id} src={sampleMember.foto_profil_url} alt="Foto anggota" style={{...style, objectFit:'cover', borderRadius:`${e.radius || 8}px`, border:'2px solid rgba(255,255,255,.65)'}}/>;
                  if (e.type === 'LOGO') return <img key={e.id} src={e.url || design.customLogoUrl || BANUARASA_ASSETS.logo} alt="Logo" style={{...style, objectFit:'contain'}}/>;
                  if (e.type === 'QR') return previewQr ? <img key={e.id} src={previewQr} alt="QR profil" style={{...style, objectFit:'contain', background:'#fff', padding:3, borderRadius:6}}/> : null;
                  if (e.type === 'BARCODE') return <svg key={e.id} ref={activeSide===e.side ? barcodePreviewRef : undefined} style={style} />;
                  return <div key={e.id} style={{...style, overflow:'hidden', whiteSpace:e.type==='TEXT'?'pre-wrap':'nowrap'}}>{value}</div>;
                })}
              </div>
            </div>

            {/* Quick Helper */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl text-xs text-emerald-950 space-y-1.5">
              <p className="font-black flex items-center gap-1.5 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Tips Pembuatan Kartu Anggota</span>
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Desain ini akan otomatis disinkronkan ke seluruh sistem. Setiap anggota yang membuka menu <strong>Kartu Anggota</strong> akan melihat template ini dengan foto dan biodata pribadi mereka yang termutakhir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
