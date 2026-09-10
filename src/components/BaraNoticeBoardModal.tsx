import React, { useState, useEffect } from 'react';
import { Announcement, AuthUser } from '../types';
import { storage } from '../services/storage';
import { BARA_ASSETS } from '../assets/baraAssets';
import {
  Megaphone,
  X,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  Store,
  Info,
  Search,
  CheckCircle2,
  ShieldCheck,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';

interface BaraNoticeBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onOpenAuthModal?: (mode: 'MEMBER_LOGIN' | 'ADMIN_LOGIN' | 'REGISTER') => void;
}

export const BaraNoticeBoardModal: React.FC<BaraNoticeBoardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuthModal,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Superadmin Editorial State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'EVENT' | 'SIMPANAN' | 'UMKM' | 'GENERAL'>('EVENT');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [formPublishDate, setFormPublishDate] = useState('');

  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  useEffect(() => {
    setAnnouncements(storage.getAnnouncements());
    const unsub = storage.subscribe(() => {
      setAnnouncements(storage.getAnnouncements());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Open Form to Create New Announcement
  const handleOpenCreateForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('EVENT');
    setFormContent('');
    setFormImageUrl('');
    setFormStatus('PUBLISHED');
    setFormPublishDate(new Date().toISOString().split('T')[0]);
    setIsEditing(true);
  };

  // Open Form to Edit Existing Announcement
  const handleOpenEditForm = (item: Announcement) => {
    setEditingId(item.announcement_id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormContent(item.content);
    setFormImageUrl(item.image_url || '');
    setFormStatus(item.status === 'ARCHIVED' ? 'DRAFT' : item.status);
    setFormPublishDate(item.publish_date || new Date().toISOString().split('T')[0]);
    setIsEditing(true);
  };

  // Save changes (Create or Update)
  const handleSaveEditorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    const adminId = currentUser?.id || 'SUPER_ADMIN';

    if (editingId) {
      // Update existing
      storage.updateAnnouncement(
        editingId,
        {
          title: formTitle.trim(),
          category: formCategory,
          content: formContent.trim(),
          image_url: formImageUrl.trim() || undefined,
          status: formStatus,
          publish_date: formPublishDate || new Date().toISOString().split('T')[0],
        },
        adminId
      );
      showToast(`Redaksi pengumuman berhasil diperbarui!`);
    } else {
      // Create new
      storage.addAnnouncement(
        {
          title: formTitle.trim(),
          category: formCategory,
          content: formContent.trim(),
          image_url: formImageUrl.trim() || undefined,
          status: formStatus,
          publish_date: formPublishDate || new Date().toISOString().split('T')[0],
          created_by: adminId,
        },
        adminId
      );
      showToast('Pengumuman baru berhasil diterbitkan di Papan Bara!');
    }

    setIsEditing(false);
    setEditingId(null);
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengumuman "${title}"?`)) {
      storage.deleteAnnouncement(id, currentUser?.id || 'SUPER_ADMIN');
      showToast('Pengumuman berhasil dihapus.');
      if (expandedId === id) setExpandedId(null);
    }
  };

  // Share to WhatsApp
  const handleShareToWhatsApp = (item: Announcement) => {
    const text = `📢 *PENGUMUMAN RESMI BARA (Banuarasa Weekend Market & KBMB)*\n\n*${item.title}*\n_${item.category}_\n\n${item.content}\n\nInfo selengkapnya kunjungi aplikasi resmi Banuarasa.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtered List
  const filteredAnnouncements = announcements.filter((item) => {
    // Only superadmin sees draft
    if (!isSuperAdmin && item.status !== 'PUBLISHED') return false;

    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'EVENT':
        return {
          label: 'Agenda Pasar & Event',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: Calendar,
        };
      case 'SIMPANAN':
        return {
          label: 'Iuran & Simpanan Koperasi',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: DollarSign,
        };
      case 'UMKM':
        return {
          label: 'Stand & UMKM Kreatif',
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Store,
        };
      case 'GENERAL':
      default:
        return {
          label: 'Pengumuman Umum',
          color: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: Info,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-amber-400/80 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header with Bara Visual Mascot */}
        <div className="relative bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mascot Avatar with Ring */}
            <div className="relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-amber-400 opacity-25" />
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 bg-emerald-950 p-0.5 shadow-md flex items-center justify-center">
                <img
                  src={BARA_ASSETS.mascot}
                  alt="Maskot Bara"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 tracking-wider uppercase">
                  Papan Pemberitahuan Resmi
                </span>
                {isSuperAdmin && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Mode Redaksi Aktif</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 truncate tracking-tight">
                PAPAN BARA • MAKLUMAT & INFORMASI
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                Koperasi Berau Melangkah Bersama & Banuarasa Weekend Market
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
              title="Tutup Papan Pemberitahuan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Action Notice */}
        {toastNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{toastNotice}</span>
            </div>
            <button onClick={() => setToastNotice(null)} className="text-emerald-100 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Superadmin Quick Editorial Trigger Bar */}
        {isSuperAdmin && !isEditing && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Otoritas Super Admin: Anda dapat menyunting teks/redaksi atau menambah pengumuman.</span>
            </div>
            <button
              onClick={handleOpenCreateForm}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Pengumuman Baru</span>
            </button>
          </div>
        )}

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* EDITORIAL FORM MODAL (SUPER ADMIN) */}
          {isEditing ? (
            <div className="bg-slate-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-black text-slate-900">
                    {editingId ? 'Sunting Redaksi Pengumuman' : 'Tulis Pengumuman Baru'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleSaveEditorial} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Judul Pengumuman *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Ketentuan Operasional Stand Akhir Pekan Ini..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Kategori Pengumuman *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="EVENT">Agenda Pasar & Event</option>
                      <option value="SIMPANAN">Iuran & Simpanan Koperasi</option>
                      <option value="UMKM">Stand & UMKM Kreatif</option>
                      <option value="GENERAL">Informasi Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Status Publikasi
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="PUBLISHED">Tayang (Published)</option>
                      <option value="DRAFT">Draf (Hanya Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Tanggal Tayang
                    </label>
                    <input
                      type="date"
                      value={formPublishDate}
                      onChange={(e) => setFormPublishDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    URL Gambar Pendukung (Opsional)
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... atau link Drive"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Isi Redaksi Pengumuman *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Tuliskan isi maklumat secara lengkap, jelas, dan santun..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Gunakan pemisah baris untuk membuat paragraf yang rapi dan mudah dibaca oleh anggota UMKM.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simpan Redaksi Pengumuman</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Filter & Search Bar (Mobile & Tablet Friendly) */}
              <div className="space-y-2.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pengumuman, agenda, simpanan, atau kata kunci..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
                  {[
                    { id: 'ALL', label: 'Semua Maklumat', icon: Megaphone },
                    { id: 'EVENT', label: 'Agenda Pasar', icon: Calendar },
                    { id: 'SIMPANAN', label: 'Iuran Koperasi', icon: DollarSign },
                    { id: 'UMKM', label: 'Stand UMKM', icon: Store },
                    { id: 'GENERAL', label: 'Umum', icon: Info },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-amber-300 shadow-xs font-extrabold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Announcements Feed List */}
              {filteredAnnouncements.length === 0 ? (
                <div className="py-12 px-4 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">Tidak Ada Pengumuman Ditemukan</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ada pengumuman yang cocok dengan pencarian "${searchQuery}". Coba kata kunci lain.`
                      : 'Belum ada maklumat baru untuk kategori ini. Periksa kembali secara berkala.'}
                  </p>
                  {isSuperAdmin && (
                    <button
                      onClick={handleOpenCreateForm}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Pengumuman Baru</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredAnnouncements.map((item) => {
                    const badge = getCategoryBadge(item.category);
                    const CategoryIcon = badge.icon;
                    const isExpanded = expandedId === item.announcement_id;
                    const isLongText = item.content.length > 180;

                    return (
                      <article
                        key={item.announcement_id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 p-4 sm:p-5 shadow-xs transition-all space-y-3"
                      >
                        {/* Card Header: Category Badge + Date + Super Admin Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}
                            >
                              <CategoryIcon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>

                            {item.status === 'DRAFT' && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                DRAF
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{item.publish_date || item.created_at.split('T')[0]}</span>
                            </span>

                            {/* Super Admin Editorial Tools */}
                            {isSuperAdmin && (
                              <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditForm(item)}
                                  className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Redaksi Pengumuman"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteAnnouncement(item.announcement_id, item.title)
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Pengumuman"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          {item.title}
                        </h4>

                        {/* Optional Banner Image */}
                        {item.image_url && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Content text */}
                        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          {isLongText && !isExpanded ? (
                            <p>{item.content.slice(0, 180)}...</p>
                          ) : (
                            <p>{item.content}</p>
                          )}
                        </div>

                        {/* Card Bottom: Expand/Collapse & WhatsApp Share */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          {isLongText ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : item.announcement_id)
                              }
                              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Ringkas Redaksi' : 'Baca Selengkapnya'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Maklumat Resmi</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleShareToWhatsApp(item)}
                            className="px-2.5 py-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Bagikan via WhatsApp"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Bagikan</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 shrink-0">
          <p className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Papan pengumuman diperbarui secara langsung oleh Pengurus Koperasi Berau.</span>
          </p>

          {!currentUser && onOpenAuthModal && (
            <button
              onClick={() => {
                onClose();
                onOpenAuthModal('MEMBER_LOGIN');
              }}
              className="text-emerald-700 font-bold hover:underline"
            >
              Masuk Akun Anggota
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
