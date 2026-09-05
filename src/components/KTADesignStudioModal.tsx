import React, { useState } from 'react';
import { Member } from '../types';
import { storage } from '../services/storage';

interface KTADesignStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onMemberUpdated: (updated: Member) => void;
}

export type BarcodePosition = 'BOTTOM_RIGHT' | 'TOP_RIGHT' | 'BOTTOM_CENTER' | 'LEFT_PANEL';
export type BarcodeShape = 'SQUARE' | 'ROUNDED' | 'MINIMAL';

export interface KTADesignConfig {
  themePreset: 'EMERALD' | 'BERAU_HERITAGE' | 'DARK_VIP' | 'SLATE_CLEAN' | 'CUSTOM';
  bgImageUrl: string;
  bgOpacity: number; // 0 - 100
  overlayColor: 'DARK' | 'LIGHT' | 'EMERALD';
  cardOrientation: 'HORIZONTAL';
  barcodePos: BarcodePosition;
  barcodeShape: BarcodeShape;
  showNik: boolean;
  showCategory: boolean;
  showAddress: boolean;
  showRegId: boolean;
  customTitle: string;
}

const DEFAULT_CONFIG: KTADesignConfig = {
  themePreset: 'EMERALD',
  bgImageUrl: '',
  bgOpacity: 85,
  overlayColor: 'DARK',
  cardOrientation: 'HORIZONTAL',
  barcodePos: 'BOTTOM_RIGHT',
  barcodeShape: 'SQUARE',
  showNik: true,
  showCategory: true,
  showAddress: false,
  showRegId: true,
  customTitle: 'KARTU TANDA ANGGOTA UMKM'
};

export const KTADesignStudioModal: React.FC<KTADesignStudioModalProps> = ({
  isOpen,
  onClose,
  member,
  onMemberUpdated
}) => {
  // State Edit Data Anggota di KTA
  const [editedMember, setEditedMember] = useState<Member>({ ...member });
  
  // State Konfigurasi Visual KTA
  const [designConfig, setDesignConfig] = useState<KTADesignConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'profile' | 'background' | 'barcode' | 'elements'>('background');
  const [saveAlert, setSaveAlert] = useState<string>('');

  if (!isOpen) return null;

  // URL QR Code / Barcode Dinamis
  const barcodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    JSON.stringify({
      id: editedMember.member_id,
      nik: editedMember.nik,
      nama: editedMember.nama_lengkap,
      usaha: editedMember.nama_usaha,
      status: editedMember.status_keanggotaan,
      app: 'BANUARASA_WEEKEND_MARKET'
    })
  )}`;

  // Handler Ganti Preset Tema Latar Belakang
  const handlePresetSelect = (preset: KTADesignConfig['themePreset']) => {
    let bgUrl = '';
    let opacity = 85;
    let overlay: KTADesignConfig['overlayColor'] = 'DARK';

    if (preset === 'BERAU_HERITAGE') {
      // Motif Tenun / Ornamen Pesisir Berau
      bgUrl = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=80';
      opacity = 40;
      overlay = 'DARK';
    } else if (preset === 'DARK_VIP') {
      bgUrl = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80';
      opacity = 60;
      overlay = 'DARK';
    } else if (preset === 'SLATE_CLEAN') {
      bgUrl = '';
      opacity = 95;
      overlay = 'LIGHT';
    }

    setDesignConfig(prev => ({
      ...prev,
      themePreset: preset,
      bgImageUrl: bgUrl,
      bgOpacity: opacity,
      overlayColor: overlay
    }));
  };

  // Upload Custom Background Image
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDesignConfig(prev => ({
          ...prev,
          themePreset: 'CUSTOM',
          bgImageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Foto Profil Anggota
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedMember(prev => ({ ...prev, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Simpan Perubahan Data & KTA
  const handleSaveAll = () => {
    storage.saveMember(editedMember);
    storage.logActivity(
      'SUPERADMIN_KTA_EDIT',
      'MEMBER',
      `Superadmin mendesain ulang KTA & memperbarui profil anggota ${editedMember.nama_lengkap} (${editedMember.member_id})`,
      editedMember.member_id
    );
    onMemberUpdated(editedMember);
    setSaveAlert('Perubahan KTA & Profil Anggota Berhasil Disimpan!');
    setTimeout(() => {
      setSaveAlert('');
      onClose();
    }, 1500);
  };

  // Helper Style Background berdasarkan konfigurasi
  const getCardBgStyle = () => {
    const baseGradient = 
      designConfig.themePreset === 'EMERALD'
        ? 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)'
        : designConfig.themePreset === 'DARK_VIP'
        ? 'linear-gradient(135deg, #1e1b4b 0%, #09090b 100%)'
        : designConfig.themePreset === 'SLATE_CLEAN'
        ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        : 'linear-gradient(135deg, #022c22 0%, #0f172a 100%)';

    return {
      background: baseGradient
    };
  };

  const isLightMode = designConfig.themePreset === 'SLATE_CLEAN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* PANEL KIRI: PREVIEW KTA WYSIWYG */}
        <div className="lg:w-7/12 p-6 sm:p-8 bg-slate-100/80 border-r border-slate-200 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Live Preview Studio
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Desain Kartu Tanda Anggota (KTA)
                </h3>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition shadow-2xs"
              >
                🖨️ Cetak Kartu
              </button>
            </div>

            {/* -------------------------------------------------- */}
            {/* CANVAS FISIK KARTU KTA (INTERAKTIF)                 */}
            {/* -------------------------------------------------- */}
            <div 
              id="kta-canvas-preview"
              style={getCardBgStyle()}
              className={`relative w-full rounded-2xl p-6 shadow-2xl border transition-all duration-300 overflow-hidden min-h-[260px] flex flex-col justify-between ${
                isLightMode ? 'text-slate-900 border-slate-300' : 'text-white border-white/15'
              }`}
            >
              {/* Layer Gambar Latar Belakang dengan Slider Opacity */}
              {designConfig.bgImageUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-200"
                  style={{ 
                    backgroundImage: `url(${designConfig.bgImageUrl})`,
                    opacity: designConfig.bgOpacity / 100 
                  }}
                />
              )}

              {/* Tint Overlay Gelap/Terang */}
              <div 
                className={`absolute inset-0 pointer-events-none ${
                  designConfig.overlayColor === 'DARK'
                    ? 'bg-black/30'
                    : designConfig.overlayColor === 'EMERALD'
                    ? 'bg-emerald-950/40'
                    : 'bg-white/20'
                }`}
              />

              {/* HEADER KTA */}
              <div className="relative z-10 flex items-center justify-between border-b border-current/15 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center font-black text-slate-950 text-sm shadow-xs">
                    B
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-wider uppercase block leading-tight">
                      BANUARASA
                    </span>
                    <span className="text-[9px] font-semibold opacity-75 tracking-wider block">
                      {designConfig.customTitle}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {editedMember.status_keanggotaan}
                  </span>
                  {designConfig.showRegId && (
                    <span className="block text-[9px] font-mono opacity-60 mt-0.5">
                      {editedMember.member_id}
                    </span>
                  )}
                </div>
              </div>

              {/* BODY KTA: FOTO, BIODATA, & BARCODE */}
              <div className={`relative z-10 mt-4 flex items-center gap-5 ${
                designConfig.barcodePos === 'LEFT_PANEL' ? 'flex-row-reverse' : ''
              }`}>
                {/* Foto Profil Anggota */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-24 rounded-xl border-2 border-current/30 overflow-hidden bg-slate-800/40 shadow-md flex items-center justify-center">
                    {editedMember.avatar_url ? (
                      <img src={editedMember.avatar_url} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black opacity-40">
                        {editedMember.nama_lengkap.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Data Anggota */}
                <div className="flex-1 space-y-1">
                  <h4 className="text-base font-black leading-snug">
                    {editedMember.nama_lengkap}
                  </h4>
                  <p className="text-xs font-bold opacity-90">
                    {editedMember.nama_usaha}
                  </p>

                  <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                    {designConfig.showCategory && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10 font-semibold">
                        🏷️ {editedMember.kategori_usaha}
                      </span>
                    )}
                    {designConfig.showNik && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono">
                        NIK: {editedMember.nik}
                      </span>
                    )}
                    {designConfig.showAddress && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10">
                        📍 {editedMember.alamat}
                      </span>
                    )}
                  </div>
                </div>

                {/* Komponen Barcode / QR Code */}
                {(designConfig.barcodePos === 'BOTTOM_RIGHT' || designConfig.barcodePos === 'LEFT_PANEL') && (
                  <div className={`flex-shrink-0 bg-white p-1.5 shadow-md flex flex-col items-center ${
                    designConfig.barcodeShape === 'ROUNDED' 
                      ? 'rounded-2xl border-2 border-emerald-500' 
                      : designConfig.barcodeShape === 'MINIMAL'
                      ? 'rounded-none border-b-2 border-slate-900'
                      : 'rounded-xl'
                  }`}>
                    <img src={barcodeApiUrl} alt="Barcode" className="w-16 h-16 object-contain" />
                    <span className="text-[7px] font-mono text-slate-800 font-bold mt-0.5">SCAN VERIFIKASI</span>
                  </div>
                )}
              </div>

              {/* Posisi Barcode Alternatif: Top Right / Bottom Center */}
              {designConfig.barcodePos === 'TOP_RIGHT' && (
                <div className="absolute top-14 right-6 z-20 bg-white p-1 rounded-lg shadow-md">
                  <img src={barcodeApiUrl} alt="Barcode" className="w-14 h-14" />
                </div>
              )}

              {/* FOOTER KTA */}
              <div className="relative z-10 mt-4 pt-2 border-t border-current/15 flex items-center justify-between text-[8px] opacity-70">
                <span>Kabupaten Berau • Kalimantan Timur</span>
                <span>Pindai barcode untuk cek keaslian di Google Spreadsheet</span>
              </div>
            </div>
          </div>

          {/* Notifikasi Penyimpanan */}
          {saveAlert && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
              {saveAlert}
            </div>
          )}

          {/* Tombol Simpan Final */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition"
            >
              Tutup
            </button>
            <button
              onClick={handleSaveAll}
              className="flex-1 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition"
            >
              💾 Simpan Desain & Profil
            </button>
          </div>
        </div>

        {/* PANEL KANAN: KONTROL PENGATURAN SUPER ADMIN */}
        <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Panel Kontrol Studio</h3>
                <p className="text-xs text-slate-500">Atur elemen visual, transparansi, dan data</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                {member.member_id}
              </span>
            </div>

            {/* Navigasi Tab Pengaturan */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold text-slate-600 mb-5">
              {[
                { id: 'background', label: '🎨 Latar' },
                { id: 'barcode', label: '📱 Barcode' },
                { id: 'elements', label: '📋 Elemen' },
                { id: 'profile', label: '👤 Data' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`py-1.5 rounded-lg transition ${
                    activeTab === t.id ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: LATAR BELAKANG & TRANSPARANSI */}
            {activeTab === 'background' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Preset Tema Latar Belakang</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'EMERALD', label: 'Emerald Modern' },
                      { id: 'BERAU_HERITAGE', label: 'Tenun Berau' },
                      { id: 'DARK_VIP', label: 'Midnight VIP' },
                      { id: 'SLATE_CLEAN', label: 'Clean White' },
                    ].map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(preset.id as any)}
                        className={`p-2 rounded-xl text-left border font-semibold transition ${
                          designConfig.themePreset === preset.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider Pengatur Transparansi Layer (Opacity) */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">Transparansi Latar Belakang</label>
                    <span className="font-mono font-bold text-emerald-600">{designConfig.bgOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={designConfig.bgOpacity}
                    onChange={(e) => setDesignConfig({ ...designConfig, bgOpacity: Number(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    Geser untuk mempertegas atau memudarkan motif gambar latar belakang KTA.
                  </p>
                </div>

                {/* Upload Custom Gambar Latar */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload Gambar Latar Custom</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgUpload}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-600 bg-slate-50 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-100 file:text-emerald-800"
                  />
                </div>

                {/* Link URL Gambar Latar */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Atau Tempel URL Gambar Latar</label>
                  <input
                    type="url"
                    placeholder="https://example.com/background.jpg"
                    value={designConfig.bgImageUrl}
                    onChange={(e) => setDesignConfig({ ...designConfig, bgImageUrl: e.target.value, themePreset: 'CUSTOM' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: BARCODE & POSISI */}
            {activeTab === 'barcode' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Posisi Barcode / QR Code</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'BOTTOM_RIGHT', label: '↘ Pojok Kanan Bawah' },
                      { id: 'TOP_RIGHT', label: '↗ Pojok Kanan Atas' },
                      { id: 'LEFT_PANEL', label: '↙ Pojok Kiri Bawah' },
                    ].map(pos => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setDesignConfig({ ...designConfig, barcodePos: pos.id as any })}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition ${
                          designConfig.barcodePos === pos.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Bentuk / Gaya Barcode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'SQUARE', label: 'Persegi Tegas' },
                      { id: 'ROUNDED', label: 'Rounded Dots' },
                      { id: 'MINIMAL', label: 'Minimalis' },
                    ].map(shape => (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => setDesignConfig({ ...designConfig, barcodeShape: shape.id as any })}
                        className={`p-2 rounded-xl border text-center font-semibold text-[11px] transition ${
                          designConfig.barcodeShape === shape.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {shape.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VISIBILITAS ELEMEN */}
            {activeTab === 'elements' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Sub-Header Kartu</label>
                  <input
                    type="text"
                    value={designConfig.customTitle}
                    onChange={(e) => setDesignConfig({ ...designConfig, customTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block font-bold text-slate-700 mb-1">Tampilkan Data di KTA</label>
                  
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <span className="font-semibold text-slate-700">Tampilkan NIK (KTP)</span>
                    <input
                      type="checkbox"
                      checked={designConfig.showNik}
                      onChange={(e) => setDesignConfig({ ...designConfig, showNik: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <span className="font-semibold text-slate-700">Tampilkan Kategori Usaha</span>
                    <input
                      type="checkbox"
                      checked={designConfig.showCategory}
                      onChange={(e) => setDesignConfig({ ...designConfig, showCategory: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <span className="font-semibold text-slate-700">Tampilkan Alamat Kecamatan</span>
                    <input
                      type="checkbox"
                      checked={designConfig.showAddress}
                      onChange={(e) => setDesignConfig({ ...designConfig, showAddress: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <span className="font-semibold text-slate-700">Tampilkan No. Registrasi Anggota</span>
                    <input
                      type="checkbox"
                      checked={designConfig.showRegId}
                      onChange={(e) => setDesignConfig({ ...designConfig, showRegId: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: EDIT DATA PROFIL ANGGOTA */}
            {activeTab === 'profile' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ganti Foto Profil Anggota</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editedMember.nama_lengkap}
                    onChange={(e) => setEditedMember({ ...editedMember, nama_lengkap: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Nama Usaha UMKM</label>
                  <input
                    type="text"
                    value={editedMember.nama_usaha}
                    onChange={(e) => setEditedMember({ ...editedMember, nama_usaha: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    value={editedMember.nik}
                    onChange={(e) => setEditedMember({ ...editedMember, nik: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Status Keanggotaan</label>
                  <select
                    value={editedMember.status_keanggotaan}
                    onChange={(e) => setEditedMember({ ...editedMember, status_keanggotaan: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="ACTIVE">ACTIVE (Aktif)</option>
                    <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                    <option value="SUSPENDED">SUSPENDED (Ditangguhkan)</option>
                    <option value="INACTIVE">INACTIVE (Non-Aktif)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default KTADesignStudioModal;
