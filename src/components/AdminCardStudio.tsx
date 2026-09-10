import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Member, MemberCardDesignConfig, MemberCardElement, MemberCardSide, MemberCardTheme } from '../types';
import { storage } from '../services/storage';
import { googleWorkspaceSync } from '../services/googleWorkspaceSync';
import { generateQrCodeDataUrl, renderBarcodeToElement, formatVerificationUrl } from '../utils/barcode';
import { Check, Eye, GripVertical, Image as ImageIcon, Layers, Plus, QrCode, RotateCw, Save, Settings2, Trash2, Type, UserRound, Barcode as BarcodeIcon } from 'lucide-react';

interface AdminCardStudioProps { adminUsername?: string; onSaved?: () => void; }

type DragState = { id: string; side: MemberCardSide; startX: number; startY: number; originX: number; originY: number } | null;

const THEMES: Record<MemberCardTheme, { name: string; background: string; text: string; accent: string; border: string }> = {
  LUXURY_SLATE: { name: 'Luxury Slate & Gold', background: 'linear-gradient(135deg,#020617 0%,#0f172a 48%,#064e3b 100%)', text: '#fff', accent: '#10b981', border: '#10b981' },
  EMERALD_GOLD: { name: 'Emerald Berau Royalti', background: 'linear-gradient(135deg,#064e3b 0%,#042f2e 55%,#0f172a 100%)', text: '#fff', accent: '#fbbf24', border: '#fbbf24' },
  ROYAL_PURPLE: { name: 'Teratai Ungu Keraton', background: 'linear-gradient(135deg,#3b0764 0%,#1e1b4b 55%,#0f172a 100%)', text: '#fff', accent: '#c084fc', border: '#c084fc' },
  OCEAN_BLUE: { name: 'Bahari Derawan Blue', background: 'linear-gradient(135deg,#082f49 0%,#1e3a8a 55%,#0f172a 100%)', text: '#fff', accent: '#22d3ee', border: '#22d3ee' },
  MINIMAL_LIGHT: { name: 'Modern Executive Light', background: 'linear-gradient(135deg,#f8fafc 0%,#ecfdf5 55%,#e2e8f0 100%)', text: '#0f172a', accent: '#059669', border: '#059669' },
};

const SAMPLE_MEMBER: Member = {
  member_id: 'BM-2026-000123',
  nomor_anggota: 'KBMB-2026-0042',
  nama_lengkap: 'Siti Dahlia Rahmawati',
  nama_usaha: 'Dapur Dahlia Kuliner Berau',
  kategori_usaha: 'Kuliner & Makanan Khas',
  alamat: 'Jl. Pemuda No. 14, Tanjung Redeb, Berau',
  alamat_usaha: 'Jl. Pemuda No. 14, Tanjung Redeb, Berau',
  tanggal_bergabung: '2026-01-15',
  status_keanggotaan: 'ACTIVE',
  foto_profil_url: '',
} as Member;

const fieldOptions = [
  ['member_id', 'Member ID'], ['nomor_anggota', 'Nomor Anggota'], ['nama_lengkap', 'Nama Lengkap'], ['nik', 'NIK'],
  ['tempat_lahir', 'Tempat Lahir'], ['tanggal_lahir', 'Tanggal Lahir'], ['jenis_kelamin', 'Jenis Kelamin'],
  ['alamat', 'Alamat'], ['nomor_hp', 'Nomor HP'], ['whatsapp', 'WhatsApp'], ['email', 'Email'],
  ['nama_usaha', 'Nama Usaha'], ['kategori_usaha', 'Kategori Usaha'], ['alamat_usaha', 'Alamat Usaha'],
  ['status_keanggotaan', 'Status Keanggotaan'], ['tanggal_bergabung', 'Tanggal Bergabung'],
] as const;

function makeExistingElements(d: MemberCardDesignConfig): MemberCardElement[] {
  if (Array.isArray(d.elements) && d.elements.length) return d.elements;
  const white = d.theme === 'MINIMAL_LIGHT' ? '#0f172a' : '#ffffff';
  const accent = d.cardAccentColor || THEMES[d.theme]?.accent || '#10b981';
  const els: MemberCardElement[] = [
    { id: 'org', side: 'FRONT', type: 'TEXT', label: 'Nama Organisasi', content: d.organizationName, x: 19, y: 7, width: 58, height: 7, fontFamily: 'Arial', fontSize: 5.2, fontWeight: 800, color: white, align: 'left', visible: true },
    { id: 'title', side: 'FRONT', type: 'TEXT', label: 'Judul Kartu', content: d.cardTitle, x: 19, y: 15, width: 58, height: 8, fontFamily: 'Arial', fontSize: 4.6, fontWeight: 800, color: white, align: 'left', visible: true },
    { id: 'photo', side: 'FRONT', type: 'PHOTO', label: 'Foto Anggota', x: 5, y: 29, width: 22, height: 42, radius: 4, visible: d.showPhoto },
    { id: 'number', side: 'FRONT', type: 'FIELD', label: 'Nomor Anggota', field: 'nomor_anggota', x: 31, y: 30, width: 38, height: 7, fontFamily: 'Arial', fontSize: 4.4, fontWeight: 700, color: accent, align: 'left', visible: true },
    { id: 'name', side: 'FRONT', type: 'FIELD', label: 'Nama Lengkap', field: 'nama_lengkap', x: 31, y: 39, width: 43, height: 9, fontFamily: 'Arial', fontSize: 6.2, fontWeight: 800, color: white, align: 'left', visible: true },
    { id: 'business', side: 'FRONT', type: 'FIELD', label: 'Nama Usaha', field: 'nama_usaha', x: 31, y: 50, width: 42, height: 8, fontFamily: 'Arial', fontSize: 4.4, fontWeight: 700, color: accent, align: 'left', visible: d.showBusinessName },
    { id: 'category', side: 'FRONT', type: 'FIELD', label: 'Kategori Usaha', field: 'kategori_usaha', x: 31, y: 59, width: 38, height: 9, fontFamily: 'Arial', fontSize: 3.7, fontWeight: 600, color: white, align: 'left', visible: d.showCategory },
    { id: 'qr', side: 'FRONT', type: 'QR', label: 'QR Profil Anggota', x: 76, y: 28, width: 18, height: 18, visible: d.showQrCode },
    { id: 'badge', side: 'FRONT', type: 'TEXT', label: 'Badge Status', content: d.badgeText, x: 76, y: 48, width: 18, height: 7, fontFamily: 'Arial', fontSize: 3.2, fontWeight: 800, color: accent, align: 'center', visible: true },
    { id: 'join', side: 'FRONT', type: 'FIELD', label: 'Tanggal Bergabung', field: 'tanggal_bergabung', x: 31, y: 71, width: 38, height: 7, fontFamily: 'Arial', fontSize: 3.5, fontWeight: 600, color: white, align: 'left', visible: d.showJoinDate },
    { id: 'back-title', side: 'BACK', type: 'TEXT', label: 'Judul Belakang', content: d.cardTitle, x: 5, y: 7, width: 90, height: 8, fontFamily: 'Arial', fontSize: 5, fontWeight: 800, color: white, align: 'left', visible: true },
    { id: 'back-org', side: 'BACK', type: 'TEXT', label: 'Organisasi Belakang', content: d.organizationName, x: 5, y: 16, width: 90, height: 7, fontFamily: 'Arial', fontSize: 4.2, fontWeight: 700, color: accent, align: 'left', visible: true },
    { id: 'officer', side: 'BACK', type: 'TEXT', label: 'Pejabat Penandatangan', content: `${d.authorizedOfficerName}\n${d.authorizedOfficerTitle}\n${d.authorizedOfficerNip || ''}`, x: 5, y: 58, width: 48, height: 17, fontFamily: 'Arial', fontSize: 3.8, fontWeight: 700, color: white, align: 'left', lineHeight: 1.25, visible: true },
    { id: 'disclaimer', side: 'BACK', type: 'TEXT', label: 'Ketentuan', content: d.disclaimerNotes, x: 5, y: 77, width: 90, height: 14, fontFamily: 'Arial', fontSize: 3.2, fontWeight: 500, color: white, align: 'left', lineHeight: 1.3, visible: true },
    { id: 'barcode', side: 'BACK', type: 'BARCODE', label: 'Barcode Member ID', x: 58, y: 54, width: 35, height: 20, visible: d.showBarcode !== false },
  ];
  return els;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const AdminCardStudio: React.FC<AdminCardStudioProps> = ({ adminUsername = 'SUPER_ADMIN', onSaved }) => {
  const initial = storage.getMemberCardDesign();
  const [design, setDesign] = useState<MemberCardDesignConfig>(() => ({ ...initial, elements: makeExistingElements(initial) }));
  const [activeSide, setActiveSide] = useState<MemberCardSide>('FRONT');
  const [activeId, setActiveId] = useState('name');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [qr, setQr] = useState('');
  const [drag, setDrag] = useState<DragState>(null);
  const [selectedPreviewMember] = useState<Member>(SAMPLE_MEMBER);
  const canvasRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const elements = design.elements || [];
  const visibleElements = useMemo(() => elements.filter(e => e.side === activeSide && e.visible), [elements, activeSide]);
  const active = elements.find(e => e.id === activeId) || visibleElements[0] || elements.find(e => e.side === activeSide);
  const theme = THEMES[design.theme] || THEMES.LUXURY_SLATE;

  useEffect(() => {
    const id = active?.id || visibleElements[0]?.id;
    if (id && id !== activeId) setActiveId(id);
  }, [activeSide, elements.length]);

  useEffect(() => {
    generateQrCodeDataUrl(formatVerificationUrl(selectedPreviewMember.member_id), { width: 240, margin: 1 }).then(setQr);
  }, [selectedPreviewMember.member_id]);

  useEffect(() => {
    if (!barcodeRef.current) return;
    const barcode = visibleElements.find(e => e.type === 'BARCODE');
    if (barcode) renderBarcodeToElement(barcodeRef.current, selectedPreviewMember.member_id, { height: 42, width: 1.4, displayValue: true, fontSize: 8, margin: 2 });
  }, [visibleElements, selectedPreviewMember.member_id]);

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dx = ((event.clientX - drag.startX) / rect.width) * 100;
      const dy = ((event.clientY - drag.startY) / rect.height) * 100;
      setDesign(prev => ({ ...prev, elements: (prev.elements || []).map(e => e.id === drag.id ? { ...e, x: clamp(drag.originX + dx, 0, 100 - e.width), y: clamp(drag.originY + dy, 0, 100 - e.height) } : e) }));
    };
    const up = () => setDrag(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [drag]);

  const updateElement = (id: string, patch: Partial<MemberCardElement>) => {
    setDesign(prev => ({ ...prev, elements: (prev.elements || []).map(e => e.id === id ? { ...e, ...patch } : e) }));
    setSaveState('idle');
  };

  const addElement = (type: MemberCardElement['type']) => {
    const id = `${type.toLowerCase()}-${Date.now()}`;
    const defaults: MemberCardElement = type === 'TEXT'
      ? { id, side: activeSide, type, label: 'Teks Baru', content: 'Teks baru', x: 10, y: 20, width: 45, height: 10, fontFamily: 'Arial', fontSize: 5, fontWeight: 700, color: theme.text, align: 'left', visible: true }
      : type === 'FIELD'
        ? { id, side: activeSide, type, label: 'Data Nama', field: 'nama_lengkap', x: 10, y: 30, width: 45, height: 10, fontFamily: 'Arial', fontSize: 5, fontWeight: 700, color: theme.text, align: 'left', visible: true }
        : { id, side: activeSide, type, label: type === 'PHOTO' ? 'Foto Anggota' : type === 'LOGO' ? 'Logo' : type === 'QR' ? 'QR Profil Anggota' : type === 'BARCODE' ? 'Barcode Member ID' : 'Shape', x: 10, y: 25, width: type === 'QR' ? 18 : 25, height: type === 'QR' ? 18 : 18, color: theme.accent, visible: true };
    setDesign(prev => ({ ...prev, elements: [...(prev.elements || []), defaults] }));
    setActiveId(id);
  };

  const removeElement = () => {
    if (!active) return;
    setDesign(prev => ({ ...prev, elements: (prev.elements || []).filter(e => e.id !== active.id) }));
    setActiveId('');
  };

  const uploadAsset = async (file: File, kind: 'logo' | 'background') => {
    const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    const response: any = await googleWorkspaceSync.uploadFile(file, `KTA_${kind.toUpperCase()}`, 'KTA-DESIGN', adminUsername);
    const remote = response?.result ?? response?.data ?? response;
    if (!response?.success || !remote?.driveUrl) throw new Error(remote?.message || response?.error || 'Aset gagal diunggah ke Google Drive.');
    return remote.driveUrl as string;
  };

  const save = async () => {
    setSaveState('saving'); setSaveError('');
    try {
      await storage.updateMemberCardDesign({ ...design, elements }, adminUsername);
      setSaveState('saved');
      onSaved?.();
      window.setTimeout(() => setSaveState('idle'), 3000);
    } catch (error: any) {
      setSaveState('error'); setSaveError(error?.message || 'Desain KTA gagal disimpan ke Google Spreadsheet.');
    }
  };

  const contentStyle = (e: MemberCardElement): React.CSSProperties => ({
    width: '100%', height: '100%', fontFamily: e.fontFamily || 'Arial',
    fontSize: `${Math.max(2.5, e.fontSize || 5)}px`, fontWeight: e.fontWeight || 500,
    color: e.color || theme.text, textAlign: e.align || 'left', lineHeight: e.lineHeight || 1.15,
    opacity: e.opacity ?? 1, transform: `rotate(${e.rotation || 0}deg)`,
    borderRadius: `${e.radius || 0}px`, overflow: 'hidden',
  });

  const renderPreviewElement = (e: MemberCardElement) => {
    if (!e.visible || e.side !== activeSide) return null;
    const value = e.field ? String((selectedPreviewMember as any)[e.field] ?? '') : '';
    if (e.type === 'PHOTO') return <div style={contentStyle(e)} className="bg-slate-700/60 border border-white/30"><img src={selectedPreviewMember.foto_profil_url || ''} className="w-full h-full object-cover" alt="Foto anggota" /><div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white/60">FOTO</div></div>;
    if (e.type === 'LOGO') return <img src={e.url || design.customLogoUrl} style={contentStyle(e)} className="object-contain" alt="Logo" />;
    if (e.type === 'QR') return <div style={contentStyle(e)} className="bg-white p-[2%] flex items-center justify-center"><img src={qr} className="w-full h-full object-contain" alt="QR" /></div>;
    if (e.type === 'BARCODE') return <div style={contentStyle(e)} className="bg-white flex items-center justify-center p-1"><svg ref={barcodeRef} className="w-full h-full" /></div>;
    if (e.type === 'SHAPE') return <div style={{ ...contentStyle(e), background: e.color || theme.accent }} />;
    return <div style={{ ...contentStyle(e), whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{e.type === 'FIELD' ? value : (e.content || '')}</div>;
  };

  const startDrag = (event: React.PointerEvent, e: MemberCardElement) => {
    event.preventDefault(); event.stopPropagation();
    setActiveId(e.id);
    setDrag({ id: e.id, side: activeSide, startX: event.clientX, startY: event.clientY, originX: e.x, originY: e.y });
  };

  const panelInput = 'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';
  const num = (value: number | undefined, onChange: (n: number) => void) => <input type="number" step="0.5" value={value ?? 0} onChange={e => onChange(Number(e.target.value))} className={panelInput} />;

  return <div className="space-y-4">
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div><div className="text-xs font-black text-emerald-700 uppercase tracking-wider">KTA Layout Studio</div><h2 className="text-lg font-black text-slate-900">Edit desain KTA yang sudah ada</h2><p className="text-xs text-slate-500 mt-1">Tidak membuat kartu dari nol. Semua elemen template existing tetap dipertahankan dan dapat dipindah/edit.</p></div>
      <div className="flex gap-2"><button onClick={() => setActiveSide('FRONT')} className={`px-4 py-2 rounded-lg text-xs font-black ${activeSide === 'FRONT' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>DEPAN</button><button onClick={() => setActiveSide('BACK')} className={`px-4 py-2 rounded-lg text-xs font-black ${activeSide === 'BACK' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>BELAKANG</button><button onClick={save} disabled={saveState === 'saving'} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 disabled:opacity-60"><Save className="w-4 h-4" />{saveState === 'saving' ? 'Menyimpan...' : saveState === 'saved' ? 'Tersimpan' : 'Simpan ke Spreadsheet'}</button></div>
    </div>

    {saveError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{saveError}</div>}
    {saveState === 'saved' && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2"><Check className="w-4 h-4" />Desain berhasil disimpan ke Google Spreadsheet.</div>}

    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-4 items-start">
      <div className="space-y-4 min-w-0">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-black text-sm text-slate-900">1. Tema & Palet Existing</h3><span className="text-[10px] text-slate-400">Tema hanya mengubah palet, bukan menghapus elemen.</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{(Object.keys(THEMES) as MemberCardTheme[]).map(id => { const t = THEMES[id]; const selected = design.theme === id; return <button key={id} onClick={() => setDesign(p => ({ ...p, theme: id }))} className={`text-left rounded-xl border p-3 transition ${selected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'}`}><div className="h-10 rounded-lg flex items-center justify-between px-3 text-[10px] font-black" style={{ background: t.background, color: t.text }}><span>{t.name}</span><span style={{ color: t.accent }}>#64</span></div><div className="text-[10px] text-slate-500 mt-2">{selected ? 'Aktif — elemen existing tetap dipertahankan.' : 'Pilih palet tanpa mereset layout.'}</div></button>; })}</div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-black text-sm text-slate-900">2. Elemen {activeSide}</h3><span className="text-[10px] text-slate-400">Klik lalu drag langsung pada kartu</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">{elements.filter(e => e.side === activeSide).map(e => <button key={e.id} onClick={() => setActiveId(e.id)} className={`rounded-xl border px-2.5 py-2 text-left flex items-center gap-2 ${active?.id === e.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}><GripVertical className="w-3.5 h-3.5 text-slate-400" /><span className="truncate text-[10px] font-bold text-slate-700">{e.label}</span><span className="ml-auto text-[9px] text-slate-400">{e.type}</span></button>)}</div>
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100"><button onClick={() => addElement('TEXT')} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-black flex items-center gap-1"><Type className="w-3.5 h-3.5" />Teks</button><button onClick={() => addElement('FIELD')} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center gap-1"><UserRound className="w-3.5 h-3.5" />Data</button><button onClick={() => addElement('PHOTO')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />Foto</button><button onClick={() => addElement('LOGO')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-black">Logo</button><button onClick={() => addElement('QR')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center gap-1"><QrCode className="w-3.5 h-3.5" />QR</button><button onClick={() => addElement('BARCODE')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center gap-1"><BarcodeIcon className="w-3.5 h-3.5" />Barcode</button></div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 xl:sticky xl:top-4">
        <div className="flex items-center justify-between mb-3"><div><h3 className="font-black text-sm text-slate-900">3. Live Preview</h3><p className="text-[10px] text-slate-400">85,6 × 53,98 mm • {activeSide}</p></div><Eye className="w-4 h-4 text-emerald-600" /></div>
        <div ref={canvasRef} className="relative w-full aspect-[85.6/53.98] overflow-hidden rounded-xl border-2 shadow-lg select-none touch-none" style={{ background: activeSide === 'FRONT' ? (design.frontBackgroundUrl ? `url(${design.frontBackgroundUrl}) center/cover no-repeat` : theme.background) : (design.backBackgroundUrl ? `url(${design.backBackgroundUrl}) center/cover no-repeat` : theme.background), borderColor: theme.border }}>
          {elements.filter(e => e.side === activeSide).map(e => <div key={e.id} onPointerDown={ev => startDrag(ev, e)} onClick={ev => { ev.stopPropagation(); setActiveId(e.id); }} className={`${active?.id === e.id ? 'ring-2 ring-emerald-400 ring-offset-1' : ''} cursor-move`} style={{ position: 'absolute', left: `${e.x}%`, top: `${e.y}%`, width: `${e.width}%`, height: `${e.height}%`, zIndex: e.type === 'SHAPE' ? 1 : 10 }}>
            {renderPreviewElement(e)}
          </div>)}
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-[10px] text-slate-600"><b>Tip:</b> pilih elemen lalu seret langsung di kartu. Untuk posisi presisi gunakan X/Y di panel properti.</div>
      </section>
    </div>

    {active && <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-emerald-600" /><div><h3 className="font-black text-sm text-slate-900">4. Properti: {active.label}</h3><p className="text-[10px] text-slate-400">Semua perubahan hanya mengubah elemen yang dipilih.</p></div></div><button onClick={removeElement} className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-black flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Hapus</button></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <label className="text-[10px] font-bold text-slate-500">X % {num(active.x, n => updateElement(active.id, { x: clamp(n, 0, 100 - active.width) }))}</label>
        <label className="text-[10px] font-bold text-slate-500">Y % {num(active.y, n => updateElement(active.id, { y: clamp(n, 0, 100 - active.height) }))}</label>
        <label className="text-[10px] font-bold text-slate-500">Lebar % {num(active.width, n => updateElement(active.id, { width: clamp(n, 1, 100 - active.x) }))}</label>
        <label className="text-[10px] font-bold text-slate-500">Tinggi % {num(active.height, n => updateElement(active.id, { height: clamp(n, 1, 100 - active.y) }))}</label>
        <label className="text-[10px] font-bold text-slate-500">Font {<select value={active.fontFamily || 'Arial'} onChange={e => updateElement(active.id, { fontFamily: e.target.value })} className={panelInput}><option>Arial</option><option>Inter</option><option>Georgia</option><option>Times New Roman</option><option>Courier New</option></select>}</label>
        <label className="text-[10px] font-bold text-slate-500">Ukuran {num(active.fontSize, n => updateElement(active.id, { fontSize: clamp(n, 2, 30) }))}</label>
        <label className="text-[10px] font-bold text-slate-500">Weight {<select value={String(active.fontWeight || 500)} onChange={e => updateElement(active.id, { fontWeight: e.target.value })} className={panelInput}><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option><option value="800">Extra Bold</option></select>}</label>
        <label className="text-[10px] font-bold text-slate-500">Align {<select value={active.align || 'left'} onChange={e => updateElement(active.id, { align: e.target.value as any })} className={panelInput}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select>}</label>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
        {active.type === 'TEXT' && <label className="text-[10px] font-bold text-slate-500 lg:col-span-2">Isi Teks<textarea value={active.content || ''} onChange={e => updateElement(active.id, { content: e.target.value })} rows={3} className={`${panelInput} resize-y`} /></label>}
        {active.type === 'FIELD' && <label className="text-[10px] font-bold text-slate-500">Data Anggota<select value={active.field || 'nama_lengkap'} onChange={e => updateElement(active.id, { field: e.target.value, label: fieldOptions.find(x => x[0] === e.target.value)?.[1] || 'Data Anggota' })} className={panelInput}>{fieldOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>}
        <label className="text-[10px] font-bold text-slate-500">Label<input value={active.label} onChange={e => updateElement(active.id, { label: e.target.value })} className={panelInput} /></label>
        {(active.type === 'TEXT' || active.type === 'FIELD' || active.type === 'SHAPE') && <label className="text-[10px] font-bold text-slate-500">Warna<input type="color" value={active.color || theme.text} onChange={e => updateElement(active.id, { color: e.target.value })} className="h-9 w-full rounded-lg border border-slate-200 bg-white" /></label>}
        <label className="text-[10px] font-bold text-slate-500">Opacity {num(active.opacity === undefined ? 1 : active.opacity, n => updateElement(active.id, { opacity: clamp(n, 0, 1) }))}</label>
        <label className="text-[10px] font-bold text-slate-500">Rotation {num(active.rotation || 0, n => updateElement(active.id, { rotation: n }))}</label>
        <label className="text-[10px] font-bold text-slate-500">Radius {num(active.radius || 0, n => updateElement(active.id, { radius: clamp(n, 0, 50) }))}</label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 pt-5"><input type="checkbox" checked={active.visible} onChange={e => updateElement(active.id, { visible: e.target.checked })} /> Tampilkan elemen</label>
      </div>
      {active.type === 'LOGO' && <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2"><input value={active.url || design.customLogoUrl || ''} onChange={e => updateElement(active.id, { url: e.target.value })} placeholder="URL logo" className={panelInput} /><label className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold cursor-pointer text-center">Upload Logo<input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { const url = await uploadAsset(f, 'logo'); updateElement(active.id, { url }); } catch (err: any) { setSaveError(err?.message || 'Upload logo gagal.'); } e.target.value = ''; }} /></label></div>}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2"><label className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold cursor-pointer">Background {activeSide}<input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { const url = await uploadAsset(f, 'background'); setDesign(p => activeSide === 'FRONT' ? { ...p, frontBackgroundUrl: url } : { ...p, backBackgroundUrl: url }); } catch (err: any) { setSaveError(err?.message || 'Upload background gagal.'); } e.target.value = ''; }} /></label><button onClick={() => setDesign(p => activeSide === 'FRONT' ? { ...p, frontBackgroundUrl: undefined } : { ...p, backBackgroundUrl: undefined })} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">Hapus Background</button></div>
    </section>}

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] text-slate-600 flex items-start gap-2"><Layers className="w-4 h-4 shrink-0 text-emerald-600" /><span><b>Desain existing aman:</b> saat editor dibuka, jika template lama belum memiliki daftar elemen, sistem membuat representasi elemen dari konfigurasi KTA lama. Jika daftar elemen sudah ada, daftar tersebut dipakai apa adanya. Menekan tombol simpan tidak mereset posisi elemen.</span></div>
  </div>;
};

export default AdminCardStudio;
