import React, { useState, useRef } from 'react';
import {
  AppBrandingConfig,
  MediaAssetItem,
  CustomBannerItem,
  MediaSourceType,
  MediaAssetCategory,
} from '../types';
import { storage, DEFAULT_BRANDING_CONFIG } from '../services/storage';
import {
  convertGoogleDriveUrl,
  isGoogleDriveLink,
  fileToDataUrl,
  extractDriveFileId,
} from '../utils/mediaUtils';
import {
  Image,
  Upload,
  Link,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  Plus,
  HelpCircle,
  ExternalLink,
  FolderOpen,
  Copy,
  Check,
  X,
  AlertCircle,
  Layers,
  Layout,
  Crown,
  FileImage,
  Sliders,
  Maximize2,
} from 'lucide-react';

interface AdminMediaManagerProps {
  adminUsername?: string;
  onShowToast: (message: string) => void;
}

export const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({
  adminUsername = 'SUPER_ADMIN',
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<'LOGO' | 'BANNER' | 'MASCOT' | 'LIBRARY' | 'DRIVE_HELPER'>(
    'LOGO'
  );

  // Dynamic branding config from storage
  const branding = storage.getBrandingConfig();

  // Active state for editing logo form
  const [logoInputType, setLogoInputType] = useState<'UPLOAD' | 'GOOGLE_DRIVE' | 'URL'>('UPLOAD');
  const [logoDriveUrl, setLogoDriveUrl] = useState(branding.logoDriveLink || '');
  const [logoDirectUrl, setLogoDirectUrl] = useState(branding.logoUrl || '');
  const [logoAltText, setLogoAltText] = useState(branding.logoAlt || 'Logo Resmi Banua Rasa Weekend Market');
  const [taglineText, setTaglineText] = useState(branding.tagline || 'Rasa Lokal, Cerita Global');
  const [subTaglineText, setSubTaglineText] = useState(branding.subTagline || '');

  // Active state for editing hero banner form
  const [heroInputType, setHeroInputType] = useState<'UPLOAD' | 'GOOGLE_DRIVE' | 'URL'>('UPLOAD');
  const [heroDriveUrl, setHeroDriveUrl] = useState(branding.heroBannerDriveLink || '');
  const [heroDirectUrl, setHeroDirectUrl] = useState(branding.heroBannerUrl || '');
  const [heroTitle, setHeroTitle] = useState(branding.heroBannerTitle || 'BANUARASA WEEKEND MARKET');
  const [heroSubtitle, setHeroSubtitle] = useState(branding.heroBannerSubtitle || '');

  // Active state for mascot form
  const [mascotInputType, setMascotInputType] = useState<'UPLOAD' | 'GOOGLE_DRIVE' | 'URL'>('UPLOAD');
  const [mascotDriveUrl, setMascotDriveUrl] = useState(branding.mascotDriveLink || '');
  const [mascotDirectUrl, setMascotDirectUrl] = useState(branding.mascotUrl || '');

  // Modal / Form states for Media Library
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<MediaAssetCategory>('BANNER_PROMO');
  const [newMediaSourceType, setNewMediaSourceType] = useState<MediaSourceType>('UPLOAD');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaDriveUrl, setNewMediaDriveUrl] = useState('');
  const [newMediaDescription, setNewMediaDescription] = useState('');
  const [uploadedPreviewData, setUploadedPreviewData] = useState<{
    dataUrl: string;
    sizeText: string;
    dimension: string;
  } | null>(null);

  // Edit media modal
  const [editingMedia, setEditingMedia] = useState<MediaAssetItem | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<MediaAssetItem | null>(null);
  const [previewingImageUrl, setPreviewingImageUrl] = useState<{ url: string; title: string } | null>(null);

  // Custom Banner Modal
  const [isAddBannerModalOpen, setIsAddBannerModalOpen] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerCategory, setNewBannerCategory] = useState('PROMO');
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [newBannerDriveUrl, setNewBannerDriveUrl] = useState('');
  const [newBannerSourceType, setNewBannerSourceType] = useState<MediaSourceType>('UPLOAD');
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);

  // Google Drive Helper dedicated tool state
  const [driveTesterInput, setDriveTesterInput] = useState('');
  const [driveTesterResult, setDriveTesterResult] = useState<{
    raw: string;
    converted: string;
    fileId: string | null;
  } | null>(null);

  // Filter for media library
  const [libraryFilter, setLibraryFilter] = useState<'ALL' | MediaAssetCategory>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const mascotFileInputRef = useRef<HTMLInputElement>(null);
  const newMediaFileInputRef = useRef<HTMLInputElement>(null);
  const newBannerFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Copy URL
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    onShowToast('Tautan gambar berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- LOGO HANDLERS ---
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await fileToDataUrl(file, 800, 800, 0.9);
      setLogoDirectUrl(dataUrl);
      storage.setLogo(dataUrl, 'UPLOAD', undefined, logoAltText, adminUsername);
      onShowToast('Logo berhasil diupload dan diterapkan!');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal memproses file gambar logo.');
    }
  };

  const handleApplyLogoDriveUrl = () => {
    if (!logoDriveUrl.trim()) {
      onShowToast('Silakan masukkan tautan Google Drive gambar logo.');
      return;
    }
    const converted = convertGoogleDriveUrl(logoDriveUrl);
    setLogoDirectUrl(converted);
    storage.setLogo(converted, 'GOOGLE_DRIVE', logoDriveUrl, logoAltText, adminUsername);
    onShowToast('Logo dari Google Drive berhasil diterapkan!');
  };

  const handleApplyLogoDirectUrl = () => {
    if (!logoDirectUrl.trim()) {
      onShowToast('Silakan masukkan tautan gambar logo.');
      return;
    }
    storage.setLogo(logoDirectUrl, 'EXTERNAL_URL', undefined, logoAltText, adminUsername);
    onShowToast('Logo dari link eksternal berhasil diterapkan!');
  };

  const handleSaveLogoTextSettings = () => {
    storage.updateBrandingConfig(
      {
        logoAlt: logoAltText,
        tagline: taglineText,
        subTagline: subTaglineText,
      },
      adminUsername
    );
    onShowToast('Identitas dan slogan logo berhasil disimpan.');
  };

  const handleResetLogo = () => {
    storage.setLogo(
      DEFAULT_BRANDING_CONFIG.logoUrl,
      'DEFAULT',
      undefined,
      DEFAULT_BRANDING_CONFIG.logoAlt,
      adminUsername
    );
    setLogoDirectUrl(DEFAULT_BRANDING_CONFIG.logoUrl);
    setLogoDriveUrl('');
    onShowToast('Logo dikembalikan ke emblem resmi default.');
  };

  // --- HERO BANNER HANDLERS ---
  const handleHeroBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await fileToDataUrl(file, 1600, 1000, 0.88);
      setHeroDirectUrl(dataUrl);
      storage.setHeroBanner(dataUrl, 'UPLOAD', undefined, heroTitle, heroSubtitle, adminUsername);
      onShowToast('Hero Banner berhasil diupload dan diperbarui!');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal memproses file banner.');
    }
  };

  const handleApplyHeroDriveUrl = () => {
    if (!heroDriveUrl.trim()) {
      onShowToast('Silakan masukkan link Google Drive untuk hero banner.');
      return;
    }
    const converted = convertGoogleDriveUrl(heroDriveUrl);
    setHeroDirectUrl(converted);
    storage.setHeroBanner(converted, 'GOOGLE_DRIVE', heroDriveUrl, heroTitle, heroSubtitle, adminUsername);
    onShowToast('Hero Banner dari Google Drive berhasil diterapkan!');
  };

  const handleSaveHeroText = () => {
    storage.updateBrandingConfig(
      {
        heroBannerTitle: heroTitle,
        heroBannerSubtitle: heroSubtitle,
      },
      adminUsername
    );
    onShowToast('Judul dan keterangan banner berhasil disimpan.');
  };

  const handleResetHeroBanner = () => {
    storage.setHeroBanner(
      DEFAULT_BRANDING_CONFIG.heroBannerUrl,
      'DEFAULT',
      undefined,
      DEFAULT_BRANDING_CONFIG.heroBannerTitle,
      DEFAULT_BRANDING_CONFIG.heroBannerSubtitle,
      adminUsername
    );
    setHeroDirectUrl(DEFAULT_BRANDING_CONFIG.heroBannerUrl);
    setHeroDriveUrl('');
    onShowToast('Hero Banner dikembalikan ke banner resmi default.');
  };

  // --- MASCOT HANDLERS ---
  const handleMascotFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await fileToDataUrl(file, 1000, 1000, 0.9);
      setMascotDirectUrl(dataUrl);
      storage.setMascot(dataUrl, 'UPLOAD', undefined, adminUsername);
      onShowToast('Pose Maskot Bara berhasil diupload dan diperbarui!');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal memproses gambar maskot.');
    }
  };

  const handleApplyMascotDriveUrl = () => {
    if (!mascotDriveUrl.trim()) {
      onShowToast('Silakan masukkan tautan Google Drive gambar maskot.');
      return;
    }
    const converted = convertGoogleDriveUrl(mascotDriveUrl);
    setMascotDirectUrl(converted);
    storage.setMascot(converted, 'GOOGLE_DRIVE', mascotDriveUrl, adminUsername);
    onShowToast('Gambar Maskot Bara dari Google Drive berhasil diterapkan!');
  };

  const handleResetMascot = () => {
    storage.setMascot(DEFAULT_BRANDING_CONFIG.mascotUrl, 'DEFAULT', undefined, adminUsername);
    setMascotDirectUrl(DEFAULT_BRANDING_CONFIG.mascotUrl);
    setMascotDriveUrl('');
    onShowToast('Maskot Bara dikembalikan ke pose resmi default (shot-2).');
  };

  // --- MEDIA ASSETS LIBRARY HANDLERS ---
  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = '';

    if (newMediaSourceType === 'UPLOAD') {
      if (!uploadedPreviewData?.dataUrl) {
        onShowToast('Silakan pilih file gambar untuk diunggah.');
        return;
      }
      finalUrl = uploadedPreviewData.dataUrl;
    } else if (newMediaSourceType === 'GOOGLE_DRIVE') {
      if (!newMediaDriveUrl.trim()) {
        onShowToast('Silakan masukkan link sharing Google Drive.');
        return;
      }
      finalUrl = convertGoogleDriveUrl(newMediaDriveUrl);
    } else {
      if (!newMediaUrl.trim()) {
        onShowToast('Silakan masukkan URL gambar.');
        return;
      }
      finalUrl = newMediaUrl.trim();
    }

    storage.addMediaAsset(
      {
        title: newMediaTitle.trim() || 'Gambar Media Baru',
        category: newMediaCategory,
        url: finalUrl,
        sourceType: newMediaSourceType,
        rawDriveLink: newMediaSourceType === 'GOOGLE_DRIVE' ? newMediaDriveUrl.trim() : undefined,
        description: newMediaDescription.trim(),
        file_size: uploadedPreviewData?.sizeText,
        dimension: uploadedPreviewData?.dimension,
        is_active: true,
      },
      adminUsername
    );

    setIsAddMediaModalOpen(false);
    setNewMediaTitle('');
    setNewMediaUrl('');
    setNewMediaDriveUrl('');
    setNewMediaDescription('');
    setUploadedPreviewData(null);
    onShowToast('Gambar baru berhasil ditambahkan ke Galeri Media!');
  };

  const handleEditMediaSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    storage.updateMediaAsset(
      editingMedia.id,
      {
        title: editingMedia.title,
        category: editingMedia.category,
        description: editingMedia.description,
        url: editingMedia.url,
        is_active: editingMedia.is_active,
      },
      adminUsername
    );

    setEditingMedia(null);
    onShowToast('Informasi gambar media berhasil diperbarui.');
  };

  const handleDeleteMediaConfirm = () => {
    if (!deletingMedia) return;
    storage.deleteMediaAsset(deletingMedia.id, adminUsername);
    setDeletingMedia(null);
    onShowToast('Gambar berhasil dihapus dari galeri.');
  };

  // --- CUSTOM BANNER HANDLERS ---
  const handleAddBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = '';

    if (newBannerSourceType === 'UPLOAD') {
      if (!uploadedPreviewData?.dataUrl) {
        onShowToast('Silakan unggah gambar banner.');
        return;
      }
      finalUrl = uploadedPreviewData.dataUrl;
    } else if (newBannerSourceType === 'GOOGLE_DRIVE') {
      if (!newBannerDriveUrl.trim()) {
        onShowToast('Silakan masukkan tautan Google Drive banner.');
        return;
      }
      finalUrl = convertGoogleDriveUrl(newBannerDriveUrl);
    } else {
      if (!newBannerUrl.trim()) {
        onShowToast('Silakan masukkan tautan URL gambar banner.');
        return;
      }
      finalUrl = newBannerUrl.trim();
    }

    storage.addCustomBanner(
      {
        title: newBannerTitle.trim() || 'Banner Promosi Baru',
        subtitle: newBannerSubtitle.trim(),
        category: newBannerCategory,
        image_url: finalUrl,
        sourceType: newBannerSourceType,
        rawDriveLink: newBannerSourceType === 'GOOGLE_DRIVE' ? newBannerDriveUrl.trim() : undefined,
        is_active: true,
        order: branding.customBanners.length + 1,
      },
      adminUsername
    );

    setIsAddBannerModalOpen(false);
    setNewBannerTitle('');
    setNewBannerSubtitle('');
    setNewBannerUrl('');
    setNewBannerDriveUrl('');
    setUploadedPreviewData(null);
    onShowToast('Banner promosi baru berhasil ditambahkan!');
  };

  const handleDeleteBannerConfirm = () => {
    if (!deletingBannerId) return;
    storage.deleteCustomBanner(deletingBannerId, adminUsername);
    setDeletingBannerId(null);
    onShowToast('Banner berhasil dihapus.');
  };

  // --- DRIVE TESTER HELPER ---
  const handleTestDriveLink = () => {
    if (!driveTesterInput.trim()) return;
    const converted = convertGoogleDriveUrl(driveTesterInput);
    const fileId = extractDriveFileId(driveTesterInput);
    setDriveTesterResult({
      raw: driveTesterInput.trim(),
      converted,
      fileId,
    });
  };

  // Filtered media items
  const mediaList = branding.mediaAssets.filter((item) => {
    if (libraryFilter === 'ALL') return true;
    return item.category === libraryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-md border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Super Admin Otoritas Penuh
              </span>
              <span className="text-xs text-slate-300 font-bold">• Pengaturan Logo, Banner & Media</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Manajemen Logo Resmi, Banner & Media Aset
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              Unggah file dari perangkat lokal, hubungkan langsung gambar dari link Google Drive, atau kelola
              koleksi banner untuk halaman utama dan promosi.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (window.confirm('Kembalikan semua logo, hero banner, dan maskot ke aset standar default?')) {
                  storage.resetBrandingToDefault(adminUsername);
                  onShowToast('Semua aset branding dikembalikan ke default resmi.');
                }
              }}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Semua ke Default</span>
            </button>
            <button
              onClick={() => setIsAddMediaModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Gambar / Media</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 pt-6 overflow-x-auto border-t border-slate-800/80 mt-5">
          {[
            { id: 'LOGO', label: 'Logo Resmi & Identitas', icon: Crown },
            { id: 'BANNER', label: 'Hero & Promo Banners', icon: Layout },
            { id: 'MASCOT', label: 'Maskot Bara & Avatar', icon: Sparkles },
            { id: 'LIBRARY', label: `Galeri Media (${branding.mediaAssets.length})`, icon: FolderOpen },
            { id: 'DRIVE_HELPER', label: 'Alat Link Google Drive', icon: Link },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: LOGO UTAMA & IDENTITAS */}
      {/* ========================================================================= */}
      {subTab === 'LOGO' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Logo Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  Pratinjau Logo Aktif Saat Ini
                </h4>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    branding.logoSourceType === 'GOOGLE_DRIVE'
                      ? 'bg-blue-100 text-blue-800'
                      : branding.logoSourceType === 'UPLOAD'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  Sumber: {branding.logoSourceType}
                </span>
              </div>

              {/* Logo Box Display */}
              <div className="bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center border-2 border-amber-400/40 relative overflow-hidden group shadow-inner">
                <div className="w-36 h-36 rounded-2xl overflow-hidden p-2 flex items-center justify-center bg-slate-900 border border-slate-800 shadow-xl">
                  <img
                    src={branding.logoUrl}
                    alt={branding.logoAlt}
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_BRANDING_CONFIG.logoUrl;
                    }}
                  />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-black text-amber-400">BANUARASA</p>
                  <p className="text-[11px] font-bold text-slate-300">{branding.tagline}</p>
                </div>

                <button
                  onClick={() =>
                    setPreviewingImageUrl({
                      url: branding.logoUrl,
                      title: branding.logoAlt,
                    })
                  }
                  className="absolute bottom-3 right-3 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Lihat Resolusi Penuh"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Meta Info */}
              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Alt / Deskripsi:</span>
                  <span className="font-bold text-slate-800">{branding.logoAlt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slogan Utama:</span>
                  <span className="font-bold text-amber-800">"{branding.tagline}"</span>
                </div>
                {branding.logoDriveLink && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-1">Tautan Asli Google Drive:</span>
                    <a
                      href={branding.logoDriveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-mono text-[10px] break-all flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span>{branding.logoDriveLink}</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResetLogo}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset ke Logo Default</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Update Logo Form */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h4 className="text-base font-black text-slate-900">Ubah / Ganti Gambar Logo</h4>
                <p className="text-xs text-slate-500">
                  Pilih metode penggantian logo: upload file gambar baru atau masukkan tautan sharing Google Drive.
                </p>
              </div>

              {/* Mode Switcher Buttons */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setLogoInputType('UPLOAD')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    logoInputType === 'UPLOAD'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Upload File</span>
                </button>
                <button
                  onClick={() => setLogoInputType('GOOGLE_DRIVE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    logoInputType === 'GOOGLE_DRIVE'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Drive</span>
                </button>
                <button
                  onClick={() => setLogoInputType('URL')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    logoInputType === 'URL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileImage className="w-3.5 h-3.5 text-purple-600" />
                  <span>Link URL</span>
                </button>
              </div>

              {/* Option 1: Upload File */}
              {logoInputType === 'UPLOAD' && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoFileUpload}
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-3"
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Klik untuk memilih file logo baru
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Format didukung: PNG (transparan disarankan), JPG, SVG, WebP. Maks 5MB.
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                      Pilih dari Komputer / HP
                    </span>
                  </div>
                </div>
              )}

              {/* Option 2: Google Drive Link */}
              {logoInputType === 'GOOGLE_DRIVE' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Cara Memasang Logo dari Google Drive:</span>
                    </div>
                    <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-1">
                      <li>Buka file gambar di Google Drive Anda.</li>
                      <li>
                        Klik <strong>Bagikan (Share)</strong> &gt; ubah Akses Umum menjadi{' '}
                        <strong>"Siapa saja yang memiliki tautan" (Anyone with link)</strong>.
                      </li>
                      <li>Salin link dan tempelkan pada kolom di bawah ini.</li>
                    </ol>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Tautan Google Drive Gambar Logo
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={logoDriveUrl}
                        onChange={(e) => setLogoDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-emerald-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyLogoDriveUrl}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Pasang Logo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Option 3: Direct URL */}
              {logoInputType === 'URL' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      URL Gambar Logo (HTTPS / Direct Link)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={logoDirectUrl}
                        onChange={(e) => setLogoDirectUrl(e.target.value)}
                        placeholder="https://example.com/logo-banuarasa.png"
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-emerald-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyLogoDirectUrl}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Terapkan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Text & Meta Customization */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Kustomisasi Teks & Slogan Logo
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Teks Alternatif (Alt)</label>
                    <input
                      type="text"
                      value={logoAltText}
                      onChange={(e) => setLogoAltText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Slogan Resmi (Tagline)</label>
                    <input
                      type="text"
                      value={taglineText}
                      onChange={(e) => setTaglineText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveLogoTextSettings}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Simpan Teks & Slogan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: HERO & PROMO BANNERS */}
      {/* ========================================================================= */}
      {subTab === 'BANNER' && (
        <div className="space-y-6">
          {/* Main Hero Banner Editor Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-emerald-600" />
                  Hero Banner Utama (Halaman Depan / Landing Page)
                </h4>
                <p className="text-xs text-slate-500">
                  Banner panorama yang muncul di bagian paling atas beranda pengunjung.
                </p>
              </div>

              <button
                onClick={handleResetHeroBanner}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset ke Banner Default</span>
              </button>
            </div>

            {/* Live Hero Banner Preview Box */}
            <div className="relative rounded-2xl overflow-hidden aspect-[21/9] sm:aspect-[24/8] border border-slate-200 shadow-lg group">
              <img
                src={branding.heroBannerUrl}
                alt="Banner Utama"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_BRANDING_CONFIG.heroBannerUrl;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase self-start mb-2">
                  Preview Hero Banner
                </span>
                <h3 className="text-lg sm:text-2xl font-black">{branding.heroBannerTitle}</h3>
                <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl">
                  {branding.heroBannerSubtitle}
                </p>
              </div>

              <button
                onClick={() =>
                  setPreviewingImageUrl({
                    url: branding.heroBannerUrl,
                    title: branding.heroBannerTitle,
                  })
                }
                className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs backdrop-blur-xs transition-colors cursor-pointer"
                title="Lihat Gambar Penuh"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Controls for Hero Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Left: Upload / Drive Input */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setHeroInputType('UPLOAD')}
                    className={`py-1.5 rounded-lg transition-all ${
                      heroInputType === 'UPLOAD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Upload Gambar
                  </button>
                  <button
                    onClick={() => setHeroInputType('GOOGLE_DRIVE')}
                    className={`py-1.5 rounded-lg transition-all ${
                      heroInputType === 'GOOGLE_DRIVE' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Link Google Drive
                  </button>
                </div>

                {heroInputType === 'UPLOAD' ? (
                  <div>
                    <input
                      type="file"
                      ref={heroFileInputRef}
                      onChange={handleHeroBannerFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => heroFileInputRef.current?.click()}
                      className="w-full py-6 border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-6 h-6 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Pilih File Gambar Banner dari Perangkat
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Disarankan resolusi 1920 × 800 px (Landscape)
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Link Google Drive Hero Banner
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={heroDriveUrl}
                        onChange={(e) => setHeroDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view"
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyHeroDriveUrl}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl whitespace-nowrap cursor-pointer"
                      >
                        Pasang Banner
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Titles and Subtitles */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Judul Teks Banner</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Keterangan / Subtitle</label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveHeroText}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Simpan Teks Banner
                </button>
              </div>
            </div>
          </div>

          {/* Custom Banners Carousel List */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  Daftar Banner Promosi & Event Lainnya
                </h4>
                <p className="text-xs text-slate-500">
                  Banner sekunder untuk pengumuman bazar, promo kuliner, dan sponsor mingguan.
                </p>
              </div>
              <button
                onClick={() => setIsAddBannerModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Banner Promosi</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {branding.customBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between group"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase">
                      {banner.category}
                    </span>
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md">
                      {banner.sourceType}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">{banner.title}</h5>
                      {banner.subtitle && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{banner.subtitle}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() =>
                          storage.setHeroBanner(
                            banner.image_url,
                            banner.sourceType,
                            banner.rawDriveLink,
                            banner.title,
                            banner.subtitle,
                            adminUsername
                          )
                        }
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Jadikan Hero</span>
                      </button>

                      <button
                        onClick={() => setDeletingBannerId(banner.id)}
                        className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Hapus Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: MASKOT BARA & AVATAR */}
      {/* ========================================================================= */}
      {subTab === 'MASCOT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Mascot Live Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Pratinjau Maskot Bara Aktif
                </h4>
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                  {branding.mascotSourceType}
                </span>
              </div>

              <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center border-2 border-emerald-500/40 relative shadow-inner">
                <div className="w-44 h-44 rounded-2xl overflow-hidden p-2 flex items-center justify-center bg-slate-900/60 border border-slate-800">
                  <img
                    src={branding.mascotUrl}
                    alt="Maskot Bara"
                    className="w-full h-full object-contain filter drop-shadow-xl"
                  />
                </div>
                <div className="mt-3">
                  <h5 className="text-sm font-black text-white">BARA SI KERANG LAUT</h5>
                  <p className="text-xs text-amber-400 font-bold">Maskot Resmi Banuarasa Weekend Market</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResetMascot}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset ke Pose Default (shot-2)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Update Mascot Options */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h4 className="text-base font-black text-slate-900">Ubah Gambar / Pose Maskot Bara</h4>
                <p className="text-xs text-slate-500">
                  Perbarui gambar maskot Bara yang tampil di widget interaktif, modal intro sambutan, dan KTA
                  digital anggota.
                </p>
              </div>

              {/* Toggle upload vs drive */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setMascotInputType('UPLOAD')}
                  className={`py-2 rounded-xl transition-all ${
                    mascotInputType === 'UPLOAD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Upload File Gambar Baru
                </button>
                <button
                  onClick={() => setMascotInputType('GOOGLE_DRIVE')}
                  className={`py-2 rounded-xl transition-all ${
                    mascotInputType === 'GOOGLE_DRIVE' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Link Google Drive Maskot
                </button>
              </div>

              {mascotInputType === 'UPLOAD' ? (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={mascotFileInputRef}
                    onChange={handleMascotFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => mascotFileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-50 rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-3"
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Klik untuk memilih pose gambar maskot baru
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PNG dengan background transparan disarankan.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Tautan Google Drive Gambar Maskot
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={mascotDriveUrl}
                      onChange={(e) => setMascotDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyMascotDriveUrl}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer whitespace-nowrap"
                    >
                      Pasang Maskot
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: GALERI MEDIA ASSETS (MEDIA LIBRARY) */}
      {/* ========================================================================= */}
      {subTab === 'LIBRARY' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-emerald-600" />
                Koleksi Repositori Media & Branding
              </h4>
              <p className="text-xs text-slate-500">
                Seluruh aset gambar (Logo, Hero Banner, Maskot Bara, Promo, Sponsor) yang tersimpan di sistem.
              </p>
            </div>

            <button
              onClick={() => setIsAddMediaModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Media Baru</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: `Semua (${branding.mediaAssets.length})` },
              {
                id: 'LOGO',
                label: `Logo (${branding.mediaAssets.filter((m) => m.category === 'LOGO').length})`,
              },
              {
                id: 'BANNER_HERO',
                label: `Hero Banner (${branding.mediaAssets.filter((m) => m.category === 'BANNER_HERO').length})`,
              },
              {
                id: 'BANNER_PROMO',
                label: `Promo (${branding.mediaAssets.filter((m) => m.category === 'BANNER_PROMO').length})`,
              },
              {
                id: 'MASCOT',
                label: `Maskot (${branding.mediaAssets.filter((m) => m.category === 'MASCOT').length})`,
              },
              {
                id: 'SPONSOR',
                label: `Sponsor (${branding.mediaAssets.filter((m) => m.category === 'SPONSOR').length})`,
              },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setLibraryFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  libraryFilter === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Media Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaList.map((media) => (
              <div
                key={media.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
              >
                {/* Media Image Box */}
                <div className="relative aspect-video sm:aspect-square bg-slate-950 overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={media.url}
                    alt={media.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_BRANDING_CONFIG.logoUrl;
                    }}
                  />

                  {/* Top Badges */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-black rounded-md uppercase">
                    {media.category}
                  </span>

                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-black rounded-md ${
                      media.sourceType === 'GOOGLE_DRIVE'
                        ? 'bg-blue-600 text-white'
                        : media.sourceType === 'UPLOAD'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    {media.sourceType}
                  </span>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      onClick={() =>
                        setPreviewingImageUrl({
                          url: media.url,
                          title: media.title,
                        })
                      }
                      className="p-2 bg-white/20 hover:bg-white text-slate-200 hover:text-slate-900 rounded-xl text-xs transition-colors cursor-pointer"
                      title="Lihat Gambar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(media.url, media.id)}
                      className="p-2 bg-white/20 hover:bg-white text-slate-200 hover:text-slate-900 rounded-xl text-xs transition-colors cursor-pointer"
                      title="Salin Link Gambar"
                    >
                      {copiedId === media.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Media Details */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {media.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {media.description || 'Tanpa keterangan'}
                    </p>
                    {media.file_size && (
                      <span className="inline-block text-[10px] text-slate-400 font-mono mt-1">
                        {media.dimension} • {media.file_size}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-1 text-[11px]">
                    <div className="flex items-center gap-1">
                      {media.category === 'LOGO' && (
                        <button
                          onClick={() =>
                            storage.setLogo(
                              media.url,
                              media.sourceType,
                              media.rawDriveLink,
                              media.title,
                              adminUsername
                            )
                          }
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg cursor-pointer"
                        >
                          Set Logo
                        </button>
                      )}
                      {media.category === 'BANNER_HERO' && (
                        <button
                          onClick={() =>
                            storage.setHeroBanner(
                              media.url,
                              media.sourceType,
                              media.rawDriveLink,
                              media.title,
                              media.description,
                              adminUsername
                            )
                          }
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg cursor-pointer"
                        >
                          Set Hero
                        </button>
                      )}
                      {media.category === 'MASCOT' && (
                        <button
                          onClick={() =>
                            storage.setMascot(
                              media.url,
                              media.sourceType,
                              media.rawDriveLink,
                              adminUsername
                            )
                          }
                          className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded-lg cursor-pointer"
                        >
                          Set Maskot
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingMedia(media)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg cursor-pointer"
                        title="Edit Info"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingMedia(media)}
                        className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer"
                        title="Hapus Media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: GOOGLE DRIVE LINK HELPER TOOL */}
      {/* ========================================================================= */}
      {subTab === 'DRIVE_HELPER' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Link className="w-5 h-5 text-blue-600" />
              Alat Konversi & Tester Tautan Google Drive
            </h4>
            <p className="text-xs text-slate-500">
              Uji coba link Google Drive Anda dan terapkan langsung sebagai Logo, Hero Banner, atau Maskot.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input and Instructions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Tempelkan Tautan Google Drive di Sini:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={driveTesterInput}
                    onChange={(e) => setDriveTesterInput(e.target.value)}
                    placeholder="https://drive.google.com/file/d/1A2b3C4d.../view?usp=sharing"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-blue-600"
                  />
                  <button
                    onClick={handleTestDriveLink}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Uji & Pratinjau
                  </button>
                </div>
              </div>

              {/* Instructions Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Panduan Membagikan File dari Google Drive:</span>
                </div>
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <p>Buka Google Drive &gt; Cari file gambar logo/banner Anda.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <p>
                      Klik kanan pada file &gt; Pilih <strong>Bagikan (Share)</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <p>
                      Pada bagian Akses Umum, pilih <strong>"Siapa saja yang memiliki tautan"</strong> (Anyone
                      with the link) dengan hak akses <strong>Pelihat (Viewer)</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      4
                    </span>
                    <p>Klik <strong>Salin Tautan (Copy Link)</strong> lalu tempel di form ini.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Result and Action Buttons */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Hasil Konversi Langsung
                </h5>

                {driveTesterResult ? (
                  <div className="space-y-4">
                    {/* Live Preview from Drive */}
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex items-center justify-center p-2 relative group">
                      <img
                        src={driveTesterResult.converted}
                        alt="Test Drive Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          onShowToast(
                            'Gambar tidak dapat dimuat. Pastikan izin akses Google Drive disetel ke "Siapa saja yang memiliki link" (Public).'
                          );
                        }}
                      />
                    </div>

                    <div className="space-y-1 text-[11px] font-mono text-slate-300">
                      <p>
                        <span className="text-slate-500">File ID:</span> {driveTesterResult.fileId || 'N/A'}
                      </p>
                      <p className="truncate">
                        <span className="text-slate-500">Direct CDN:</span> {driveTesterResult.converted}
                      </p>
                    </div>

                    {/* Action Set Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          storage.setLogo(
                            driveTesterResult.converted,
                            'GOOGLE_DRIVE',
                            driveTesterResult.raw,
                            branding.logoAlt,
                            adminUsername
                          );
                          onShowToast('Logo berhasil disetel dari Google Drive!');
                        }}
                        className="px-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Pasang Logo
                      </button>
                      <button
                        onClick={() => {
                          storage.setHeroBanner(
                            driveTesterResult.converted,
                            'GOOGLE_DRIVE',
                            driveTesterResult.raw,
                            branding.heroBannerTitle,
                            branding.heroBannerSubtitle,
                            adminUsername
                          );
                          onShowToast('Hero Banner berhasil disetel dari Google Drive!');
                        }}
                        className="px-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Pasang Hero
                      </button>
                      <button
                        onClick={() => {
                          storage.setMascot(
                            driveTesterResult.converted,
                            'GOOGLE_DRIVE',
                            driveTesterResult.raw,
                            adminUsername
                          );
                          onShowToast('Maskot Bara berhasil disetel dari Google Drive!');
                        }}
                        className="px-2 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Pasang Maskot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <Link className="w-8 h-8 mx-auto text-slate-700" />
                    <p className="text-xs">
                      Masukkan tautan Google Drive dan klik <strong>Uji & Pratinjau</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH MEDIA BARU */}
      {/* ========================================================================= */}
      {isAddMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Tambah Gambar Media Baru
              </h4>
              <button
                onClick={() => {
                  setIsAddMediaModalOpen(false);
                  setUploadedPreviewData(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMediaSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Nama / Judul Gambar</label>
                <input
                  type="text"
                  required
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  placeholder="Contoh: Logo Resmi 2026, Banner Festival Kuliner"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Kategori</label>
                  <select
                    value={newMediaCategory}
                    onChange={(e) => setNewMediaCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-emerald-600"
                  >
                    <option value="LOGO">Logo Utama</option>
                    <option value="BANNER_HERO">Banner Hero</option>
                    <option value="BANNER_PROMO">Banner Promo / Acara</option>
                    <option value="MASCOT">Maskot Bara</option>
                    <option value="SPONSOR">Logo Sponsor</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Metode Sumber</label>
                  <select
                    value={newMediaSourceType}
                    onChange={(e) => setNewMediaSourceType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-emerald-600"
                  >
                    <option value="UPLOAD">Upload File Komputer</option>
                    <option value="GOOGLE_DRIVE">Link Google Drive</option>
                    <option value="EXTERNAL_URL">Link URL Web</option>
                  </select>
                </div>
              </div>

              {/* Source Mode Details */}
              {newMediaSourceType === 'UPLOAD' && (
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={newMediaFileInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const preview = await fileToDataUrl(file, 1600, 1200, 0.88);
                        setUploadedPreviewData(preview);
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => newMediaFileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2"
                  >
                    {uploadedPreviewData ? (
                      <div className="space-y-2">
                        <img
                          src={uploadedPreviewData.dataUrl}
                          alt="Preview"
                          className="h-28 mx-auto object-contain rounded-lg border border-emerald-300"
                        />
                        <p className="text-xs font-bold text-emerald-800">
                          {uploadedPreviewData.dimension} • {uploadedPreviewData.sizeText}
                        </p>
                        <span className="text-[10px] text-slate-500">Klik untuk ganti file</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">Klik untuk memilih gambar</p>
                        <p className="text-[10px] text-slate-400">PNG, JPG, WebP, SVG</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {newMediaSourceType === 'GOOGLE_DRIVE' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Tautan Google Drive</label>
                  <input
                    type="url"
                    required
                    value={newMediaDriveUrl}
                    onChange={(e) => setNewMediaDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Otomatis dikonversi ke direct link berkecepatan tinggi.
                  </p>
                </div>
              )}

              {newMediaSourceType === 'EXTERNAL_URL' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">URL Gambar (HTTPS)</label>
                  <input
                    type="url"
                    required
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Deskripsi / Keterangan</label>
                <textarea
                  rows={2}
                  value={newMediaDescription}
                  onChange={(e) => setNewMediaDescription(e.target.value)}
                  placeholder="Catatan tambahan..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMediaModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Simpan Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH BANNER PROMOSI */}
      {/* ========================================================================= */}
      {isAddBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Tambah Banner Promosi Baru
              </h4>
              <button
                onClick={() => {
                  setIsAddBannerModalOpen(false);
                  setUploadedPreviewData(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBannerSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Judul Banner</label>
                <input
                  type="text"
                  required
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  placeholder="Contoh: Bazar Kuliner Nusantara"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Sub-judul / Keterangan</label>
                <input
                  type="text"
                  value={newBannerSubtitle}
                  onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  placeholder="Contoh: Nikmati diskon dan promo menarik..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Kategori Tag</label>
                  <input
                    type="text"
                    value={newBannerCategory}
                    onChange={(e) => setNewBannerCategory(e.target.value)}
                    placeholder="PROMO, EVENT, SPONSOR"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Metode Sumber</label>
                  <select
                    value={newBannerSourceType}
                    onChange={(e) => setNewBannerSourceType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="UPLOAD">Upload Gambar</option>
                    <option value="GOOGLE_DRIVE">Google Drive</option>
                    <option value="EXTERNAL_URL">Link Web</option>
                  </select>
                </div>
              </div>

              {newBannerSourceType === 'UPLOAD' ? (
                <div>
                  <input
                    type="file"
                    ref={newBannerFileInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const preview = await fileToDataUrl(file, 1600, 1000, 0.88);
                        setUploadedPreviewData(preview);
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => newBannerFileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-400 bg-purple-50/50 hover:bg-purple-50 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2"
                  >
                    {uploadedPreviewData ? (
                      <div className="space-y-2">
                        <img
                          src={uploadedPreviewData.dataUrl}
                          alt="Banner Preview"
                          className="h-28 mx-auto object-cover rounded-lg border border-purple-300"
                        />
                        <p className="text-xs font-bold text-purple-900">
                          {uploadedPreviewData.dimension} • {uploadedPreviewData.sizeText}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-purple-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">Klik untuk upload gambar banner</p>
                        <p className="text-[10px] text-slate-400">Landscape 16:9 disarankan</p>
                      </>
                    )}
                  </div>
                </div>
              ) : newBannerSourceType === 'GOOGLE_DRIVE' ? (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Link Google Drive</label>
                  <input
                    type="url"
                    required
                    value={newBannerDriveUrl}
                    onChange={(e) => setNewBannerDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">URL Gambar</label>
                  <input
                    type="url"
                    required
                    value={newBannerUrl}
                    onChange={(e) => setNewBannerUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBannerModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Tambahkan Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT MEDIA ITEM */}
      {/* ========================================================================= */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                Edit Detail Gambar Media
              </h4>
              <button
                onClick={() => setEditingMedia(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditMediaSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Judul Gambar</label>
                <input
                  type="text"
                  required
                  value={editingMedia.title}
                  onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Kategori</label>
                <select
                  value={editingMedia.category}
                  onChange={(e) => setEditingMedia({ ...editingMedia, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="LOGO">Logo Utama</option>
                  <option value="BANNER_HERO">Banner Hero</option>
                  <option value="BANNER_PROMO">Banner Promo / Acara</option>
                  <option value="MASCOT">Maskot Bara</option>
                  <option value="SPONSOR">Logo Sponsor</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Deskripsi / Keterangan</label>
                <textarea
                  rows={2}
                  value={editingMedia.description || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KONFIRMASI HAPUS MEDIA */}
      {/* ========================================================================= */}
      {deletingMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">Hapus Gambar Media?</h4>
              <p className="text-xs text-slate-500">
                Anda akan menghapus aset gambar <strong>"{deletingMedia.title}"</strong>. Tindakan ini tidak dapat
                dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingMedia(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMediaConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KONFIRMASI HAPUS BANNER */}
      {/* ========================================================================= */}
      {deletingBannerId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">Hapus Banner Ini?</h4>
              <p className="text-xs text-slate-500">Banner promosi akan dihapus dari daftar.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingBannerId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteBannerConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Hapus Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL RESOLUTION IMAGE PREVIEW LIGHTBOX */}
      {/* ========================================================================= */}
      {previewingImageUrl && (
        <div
          onClick={() => setPreviewingImageUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <span className="text-xs font-bold text-amber-400">{previewingImageUrl.title}</span>
              <button
                onClick={() => setPreviewingImageUrl(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 flex items-center justify-center bg-slate-950/60 overflow-auto">
              <img
                src={previewingImageUrl.url}
                alt={previewingImageUrl.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
