import React, { useState, useEffect } from 'react';
import { MemberProductAd, Sponsor, Member } from '../types';
import { storage } from '../services/storage';
import { convertGoogleDriveUrl, fileToDataUrl } from '../utils/mediaUtils';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Link,
  Store,
  Building2,
  Sparkles,
  ExternalLink,
  Check,
  AlertCircle,
  ShoppingBag,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminCarouselsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'PRODUCT_ADS' | 'PARTNER_LOGOS';
  adminUsername?: string;
  onShowToast?: (message: string) => void;
}

export const AdminCarouselsManagerModal: React.FC<AdminCarouselsManagerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'PRODUCT_ADS',
  adminUsername = 'SUPER_ADMIN',
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'PRODUCT_ADS' | 'PARTNER_LOGOS'>(initialTab);
  const [ads, setAds] = useState<MemberProductAd[]>([]);
  const [partners, setPartners] = useState<Sponsor[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Product Ad Form State
  const [isAdFormOpen, setIsAdFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<MemberProductAd | null>(null);
  const [adTitle, setAdTitle] = useState('');
  const [adProductName, setAdProductName] = useState('');
  const [adStoreName, setAdStoreName] = useState('');
  const [adStandCode, setAdStandCode] = useState('');
  const [adPrice, setAdPrice] = useState<number | ''>('');
  const [adPromoText, setAdPromoText] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [adSourceType, setAdSourceType] = useState<'UPLOAD' | 'URL' | 'GOOGLE_DRIVE'>('UPLOAD');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adDriveUrl, setAdDriveUrl] = useState('');
  const [adIsActive, setAdIsActive] = useState(true);

  // Partner Logo Form State
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Sponsor | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerCategory, setPartnerCategory] = useState('Pemerintah Daerah');
  const [partnerTier, setPartnerTier] = useState<'PLATINUM' | 'GOLD' | 'SILVER' | 'PARTNER'>('PLATINUM');
  const [partnerSourceType, setPartnerSourceType] = useState<'UPLOAD' | 'URL' | 'GOOGLE_DRIVE'>('UPLOAD');
  const [partnerLogoUrl, setPartnerLogoUrl] = useState('');
  const [partnerDriveUrl, setPartnerDriveUrl] = useState('');
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState('');
  const [partnerDescription, setPartnerDescription] = useState('');
  const [partnerIsActive, setPartnerIsActive] = useState(true);

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'AD' | 'PARTNER';
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const refreshData = () => {
      setAds(storage.getProductAds());
      setPartners(storage.getSponsors());
      setMembers(storage.getMembers());
    };

    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, []);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  // Reset ad form
  const resetAdForm = () => {
    setEditingAd(null);
    setAdTitle('');
    setAdProductName('');
    setAdStoreName('');
    setAdStandCode('');
    setAdPrice('');
    setAdPromoText('');
    setAdTargetUrl('');
    setAdSourceType('UPLOAD');
    setAdImageUrl('');
    setAdDriveUrl('');
    setAdIsActive(true);
    setIsAdFormOpen(false);
  };

  const handleOpenEditAd = (ad: MemberProductAd) => {
    setEditingAd(ad);
    setAdTitle(ad.title);
    setAdProductName(ad.product_name);
    setAdStoreName(ad.store_name);
    setAdStandCode(ad.stand_code || '');
    setAdPrice(ad.price || '');
    setAdPromoText(ad.promo_text || '');
    setAdTargetUrl(ad.target_url || '');
    setAdSourceType(ad.source_type);
    setAdImageUrl(ad.image_url);
    setAdDriveUrl(ad.source_type === 'GOOGLE_DRIVE' ? ad.image_url : '');
    setAdIsActive(ad.is_active);
    setIsAdFormOpen(true);
  };

  const handleFileUploadAd = async (file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      setAdImageUrl(dataUrl);
      notify('Foto produk anggota berhasil diunggah!');
    } catch (err) {
      alert('Gagal membaca berkas gambar.');
    }
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = adImageUrl.trim();
    if (adSourceType === 'GOOGLE_DRIVE') {
      finalImageUrl = convertGoogleDriveUrl(adDriveUrl);
    }

    if (!finalImageUrl) {
      alert('Harap masukkan gambar produk (upload atau URL link).');
      return;
    }

    if (editingAd) {
      storage.updateProductAd(
        editingAd.ad_id,
        {
          title: adTitle,
          product_name: adProductName,
          store_name: adStoreName,
          stand_code: adStandCode.toUpperCase(),
          price: adPrice ? Number(adPrice) : undefined,
          promo_text: adPromoText,
          target_url: adTargetUrl,
          source_type: adSourceType,
          image_url: finalImageUrl,
          is_active: adIsActive,
        },
        adminUsername
      );
      notify('Iklan produk berhasil diperbarui!');
    } else {
      storage.addProductAd(
        {
          title: adTitle,
          product_name: adProductName,
          store_name: adStoreName,
          stand_code: adStandCode.toUpperCase(),
          price: adPrice ? Number(adPrice) : undefined,
          promo_text: adPromoText,
          target_url: adTargetUrl,
          source_type: adSourceType,
          image_url: finalImageUrl,
          is_active: adIsActive,
          order: ads.length + 1,
        },
        adminUsername
      );
      notify('Iklan produk anggota baru berhasil ditambahkan ke Hero Carousel!');
    }

    resetAdForm();
  };

  // Reset partner form
  const resetPartnerForm = () => {
    setEditingPartner(null);
    setPartnerName('');
    setPartnerCategory('Pemerintah Daerah');
    setPartnerTier('PLATINUM');
    setPartnerSourceType('UPLOAD');
    setPartnerLogoUrl('');
    setPartnerDriveUrl('');
    setPartnerWebsiteUrl('');
    setPartnerDescription('');
    setPartnerIsActive(true);
    setIsPartnerFormOpen(false);
  };

  const handleOpenEditPartner = (p: Sponsor) => {
    setEditingPartner(p);
    setPartnerName(p.sponsor_name);
    setPartnerCategory(p.category || 'Pemerintah Daerah');
    setPartnerTier(p.tier || 'PLATINUM');
    setPartnerLogoUrl(p.logo_url);
    setPartnerWebsiteUrl(p.website_url || '');
    setPartnerDescription(p.description || '');
    setPartnerIsActive(p.is_active);
    setIsPartnerFormOpen(true);
  };

  const handleFileUploadPartner = async (file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      setPartnerLogoUrl(dataUrl);
      notify('Logo perusahaan berhasil diunggah!');
    } catch (err) {
      alert('Gagal membaca berkas logo.');
    }
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();

    let finalLogoUrl = partnerLogoUrl.trim();
    if (partnerSourceType === 'GOOGLE_DRIVE') {
      finalLogoUrl = convertGoogleDriveUrl(partnerDriveUrl);
    }

    if (!finalLogoUrl) {
      alert('Harap sertakan logo perusahaan.');
      return;
    }

    if (editingPartner) {
      storage.updateSponsor(
        editingPartner.sponsor_id,
        {
          sponsor_name: partnerName,
          category: partnerCategory,
          tier: partnerTier,
          logo_url: finalLogoUrl,
          website_url: partnerWebsiteUrl,
          description: partnerDescription,
          is_active: partnerIsActive,
        },
        adminUsername
      );
      notify('Data logo perusahaan berhasil diperbarui!');
    } else {
      storage.addSponsor(
        {
          sponsor_name: partnerName,
          category: partnerCategory,
          tier: partnerTier,
          logo_url: finalLogoUrl,
          website_url: partnerWebsiteUrl,
          description: partnerDescription,
          is_active: partnerIsActive,
          order: partners.length + 1,
        },
        adminUsername
      );
      notify('Logo perusahaan berhasil ditambahkan ke Carousel Pentahelix!');
    }

    resetPartnerForm();
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'AD') {
      storage.deleteProductAd(deleteConfirmTarget.id, adminUsername);
      notify(`Iklan "${deleteConfirmTarget.name}" berhasil dihapus.`);
    } else {
      storage.deleteSponsor(deleteConfirmTarget.id, adminUsername);
      notify(`Logo mitra "${deleteConfirmTarget.name}" berhasil dihapus.`);
    }

    setDeleteConfirmTarget(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Pengelolaan Carousel & Iklan Beranda
              </h3>
              <p className="text-xs text-slate-500">
                Otoritas Superadmin untuk mengatur Iklan Produk Anggota & Logo Kolaborasi Pentahelix.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab('PRODUCT_ADS');
              setIsAdFormOpen(false);
            }}
            className={`py-3.5 px-4 font-black text-xs border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'PRODUCT_ADS'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Iklan Gambar Produk Anggota ({ads.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('PARTNER_LOGOS');
              setIsPartnerFormOpen(false);
            }}
            className={`py-3.5 px-4 font-black text-xs border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'PARTNER_LOGOS'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Carousel Logo Perusahaan ({partners.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PRODUCT ADS MANAGER */}
          {activeTab === 'PRODUCT_ADS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    Hero Carousel Paling Atas (Produk UMKM Anggota)
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Otomatis berjalan dari kiri ke kanan. Superadmin dapat mengunggah gambar produk anggota atau menggunakan URL link langsung.
                  </p>
                </div>

                {!isAdFormOpen && (
                  <button
                    onClick={() => {
                      resetAdForm();
                      setIsAdFormOpen(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Iklan Produk</span>
                  </button>
                )}
              </div>

              {/* Form Input Ad */}
              {isAdFormOpen && (
                <form
                  onSubmit={handleSaveAd}
                  className="bg-white border-2 border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h5 className="text-sm font-black text-slate-900">
                      {editingAd ? 'Ubah Iklan Produk' : 'Tambah Iklan Produk Baru'}
                    </h5>
                    <button
                      type="button"
                      onClick={resetAdForm}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Promo / Headline Iklan *
                      </label>
                      <input
                        type="text"
                        required
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="Contoh: Madu Kelulut Murni Hutan Berau"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Usaha / Tenant *
                      </label>
                      <input
                        type="text"
                        required
                        value={adStoreName}
                        onChange={(e) => setAdStoreName(e.target.value)}
                        placeholder="Contoh: Dapoer Kiki"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Produk & Spesifikasi *
                      </label>
                      <input
                        type="text"
                        required
                        value={adProductName}
                        onChange={(e) => setAdProductName(e.target.value)}
                        placeholder="Contoh: Madu Kelulut 250ml Kemasan Botol Kaca"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Kode Stand (Opsional)
                        </label>
                        <input
                          type="text"
                          value={adStandCode}
                          onChange={(e) => setAdStandCode(e.target.value)}
                          placeholder="B / A / 12"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Harga (Rp)
                        </label>
                        <input
                          type="number"
                          value={adPrice}
                          onChange={(e) => setAdPrice(e.target.value ? Number(e.target.value) : '')}
                          placeholder="85000"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Highlight Badge / Promo
                      </label>
                      <input
                        type="text"
                        value={adPromoText}
                        onChange={(e) => setAdPromoText(e.target.value)}
                        placeholder="Contoh: Promo Spesial Stand VIP"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Link URL Pemesanan / WhatsApp (Opsional)
                      </label>
                      <input
                        type="url"
                        value={adTargetUrl}
                        onChange={(e) => setAdTargetUrl(e.target.value)}
                        placeholder="https://wa.me/6281234567890"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Image Input Selection */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                      Sumber Gambar Iklan Produk *
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAdSourceType('UPLOAD')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          adSourceType === 'UPLOAD'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Gambar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdSourceType('URL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          adSourceType === 'URL'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Link className="w-3.5 h-3.5" />
                        <span>URL Link Langsung</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdSourceType('GOOGLE_DRIVE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          adSourceType === 'GOOGLE_DRIVE'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>Google Drive Link</span>
                      </button>
                    </div>

                    {adSourceType === 'UPLOAD' && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUploadAd(e.target.files[0]);
                            }
                          }}
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                        />
                      </div>
                    )}

                    {adSourceType === 'URL' && (
                      <input
                        type="url"
                        value={adImageUrl}
                        onChange={(e) => setAdImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... atau URL gambar produk"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    )}

                    {adSourceType === 'GOOGLE_DRIVE' && (
                      <input
                        type="url"
                        value={adDriveUrl}
                        onChange={(e) => setAdDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    )}

                    {adImageUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden border border-slate-200 shrink-0">
                          <img
                            src={adSourceType === 'GOOGLE_DRIVE' ? convertGoogleDriveUrl(adDriveUrl) : adImageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-emerald-700 font-bold">Gambar siap ditampilkan</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={adIsActive}
                        onChange={(e) => setAdIsActive(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tampilkan Iklan ini di Beranda</span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={resetAdForm}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        Simpan Iklan
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* List of Ads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ads.map((ad) => (
                  <div
                    key={ad.ad_id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-start justify-between shadow-xs hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {ad.store_name}
                        </span>
                        {ad.stand_code && (
                          <span className="text-[10px] font-extrabold text-slate-500">
                            Stand {ad.stand_code}
                          </span>
                        )}
                        {!ad.is_active && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-black text-slate-900 truncate">{ad.title}</h5>
                      <p className="text-[11px] text-slate-500 truncate">{ad.product_name}</p>
                      {ad.price && (
                        <p className="text-xs font-bold text-amber-600 font-mono">
                          Rp{ad.price.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditAd(ad)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Ubah iklan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmTarget({
                            type: 'AD',
                            id: ad.ad_id,
                            name: ad.title,
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus iklan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PARTNER LOGOS MANAGER */}
          {activeTab === 'PARTNER_LOGOS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 border border-blue-200 p-4 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                    Carousel Logo Mitra Kolaborasi Pentahelix
                  </h4>
                  <p className="text-xs text-blue-800">
                    Menampilkan logo perusahaan pendukung (Pemerintah, BUMN, Perbankan, Korporasi Swasta, Akademisi). Dapat diubah, diedit, dan dihapus oleh superadmin.
                  </p>
                </div>

                {!isPartnerFormOpen && (
                  <button
                    onClick={() => {
                      resetPartnerForm();
                      setIsPartnerFormOpen(true);
                    }}
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Logo Perusahaan</span>
                  </button>
                )}
              </div>

              {/* Form Input Partner */}
              {isPartnerFormOpen && (
                <form
                  onSubmit={handleSavePartner}
                  className="bg-white border-2 border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h5 className="text-sm font-black text-slate-900">
                      {editingPartner ? 'Ubah Logo Perusahaan' : 'Tambah Logo Perusahaan Mitra'}
                    </h5>
                    <button
                      type="button"
                      onClick={resetPartnerForm}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Perusahaan / Institusi *
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="Contoh: PT Berau Coal / Bank Kaltimtara"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kategori Mitra / Sektor *
                      </label>
                      <select
                        value={partnerCategory}
                        onChange={(e) => setPartnerCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="Pemerintah Daerah">Pemerintah Daerah (Pemkab/Dinas)</option>
                        <option value="Perbankan Daerah">Perbankan Daerah</option>
                        <option value="Perbankan Nasional">Perbankan Nasional</option>
                        <option value="Perbankan Syariah">Perbankan Syariah</option>
                        <option value="Korporasi Swasta / CSR">Korporasi Swasta / CSR</option>
                        <option value="BUMN / BUMD">BUMN / BUMD</option>
                        <option value="Akademisi & Vokasi">Akademisi & Pendidikan</option>
                        <option value="Media & Komunitas">Media Partner & Komunitas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tingkat Kemitraan (Tier)
                      </label>
                      <select
                        value={partnerTier}
                        onChange={(e) =>
                          setPartnerTier(e.target.value as 'PLATINUM' | 'GOLD' | 'SILVER' | 'PARTNER')
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="PLATINUM">Platinum Sponsor</option>
                        <option value="GOLD">Gold Sponsor</option>
                        <option value="SILVER">Silver Sponsor</option>
                        <option value="PARTNER">Strategic Partner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Link Website Resmi (Opsional)
                      </label>
                      <input
                        type="url"
                        value={partnerWebsiteUrl}
                        onChange={(e) => setPartnerWebsiteUrl(e.target.value)}
                        placeholder="https://perusahaan.co.id"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Deskripsi Singkat Peran Kemitraan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={partnerDescription}
                        onChange={(e) => setPartnerDescription(e.target.value)}
                        placeholder="Contoh: Dukungan fasilitas tenda dan digitalisasi kasir UMKM"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Logo Source Selection */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                      Sumber Logo Perusahaan *
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPartnerSourceType('UPLOAD')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          partnerSourceType === 'UPLOAD'
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPartnerSourceType('URL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          partnerSourceType === 'URL'
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Link className="w-3.5 h-3.5" />
                        <span>URL Link Langsung</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPartnerSourceType('GOOGLE_DRIVE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          partnerSourceType === 'GOOGLE_DRIVE'
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>Google Drive Link</span>
                      </button>
                    </div>

                    {partnerSourceType === 'UPLOAD' && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUploadPartner(e.target.files[0]);
                          }
                        }}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                      />
                    )}

                    {partnerSourceType === 'URL' && (
                      <input
                        type="url"
                        value={partnerLogoUrl}
                        onChange={(e) => setPartnerLogoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... atau URL logo perusahaan"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    )}

                    {partnerSourceType === 'GOOGLE_DRIVE' && (
                      <input
                        type="url"
                        value={partnerDriveUrl}
                        onChange={(e) => setPartnerDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    )}

                    {partnerLogoUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg bg-white p-1 border border-slate-200 shrink-0 flex items-center justify-center">
                          <img
                            src={
                              partnerSourceType === 'GOOGLE_DRIVE'
                                ? convertGoogleDriveUrl(partnerDriveUrl)
                                : partnerLogoUrl
                            }
                            alt="Logo Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] text-blue-700 font-bold">Logo siap ditampilkan</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={partnerIsActive}
                        onChange={(e) => setPartnerIsActive(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Tampilkan Logo di Carousel Kemitraan</span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={resetPartnerForm}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        Simpan Logo
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* List of Partner Logos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {partners.map((partner) => (
                  <div
                    key={partner.sponsor_id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-blue-500/40 transition-colors"
                  >
                    <div className="w-full h-16 bg-slate-50 rounded-xl p-2 flex items-center justify-center border border-slate-200">
                      <img
                        src={partner.logo_url}
                        alt={partner.sponsor_name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=300&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full uppercase">
                        {partner.category || partner.tier}
                      </span>
                      <h5 className="text-xs font-black text-slate-900 truncate">
                        {partner.sponsor_name}
                      </h5>
                      {partner.description && (
                        <p className="text-[10px] text-slate-500 line-clamp-2">
                          {partner.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          partner.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {partner.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEditPartner(partner)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Ubah logo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmTarget({
                              type: 'PARTNER',
                              id: partner.sponsor_id,
                              name: partner.sponsor_name,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 font-medium">
            Perubahan langsung tersinkronkan ke halaman depan untuk seluruh pengunjung.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Hapus {deleteConfirmTarget.type === 'AD' ? 'Iklan Produk' : 'Logo Perusahaan'}?
                </h4>
                <p className="text-xs text-slate-500">{deleteConfirmTarget.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus item ini dari tampilan publik?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
