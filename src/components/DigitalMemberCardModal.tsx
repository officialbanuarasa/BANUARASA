import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Member, MemberCardDesignConfig, MemberCardElement, MemberCardSide } from '../types';
import { storage } from '../services/storage';
import { generateQrCodeDataUrl, renderBarcodeToElement } from '../utils/barcode';
import { Check, Printer, X } from 'lucide-react';

interface DigitalMemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onPhotoUpdated?: (updatedMember: Member) => void;
}

const THEMES: Record<string, { background: string; text: string; accent: string; border: string }> = {
  LUXURY_SLATE: { background: 'linear-gradient(135deg,#020617 0%,#0f172a 48%,#064e3b 100%)', text: '#fff', accent: '#10b981', border: '#10b981' },
  EMERALD_GOLD: { background: 'linear-gradient(135deg,#064e3b 0%,#042f2e 55%,#0f172a 100%)', text: '#fff', accent: '#fbbf24', border: '#fbbf24' },
  ROYAL_PURPLE: { background: 'linear-gradient(135deg,#3b0764 0%,#1e1b4b 55%,#0f172a 100%)', text: '#fff', accent: '#c084fc', border: '#c084fc' },
  OCEAN_BLUE: { background: 'linear-gradient(135deg,#082f49 0%,#1e3a8a 55%,#0f172a 100%)', text: '#fff', accent: '#22d3ee', border: '#22d3ee' },
  MINIMAL_LIGHT: { background: 'linear-gradient(135deg,#f8fafc 0%,#ecfdf5 55%,#e2e8f0 100%)', text: '#0f172a', accent: '#059669', border: '#059669' },
};

function legacyElements(d: MemberCardDesignConfig): MemberCardElement[] {
  if (d.elements?.length) return d.elements;
  const t = THEMES[d.theme] || THEMES.LUXURY_SLATE;
  return [
    { id: 'org', side: 'FRONT', type: 'TEXT', label: 'Nama Organisasi', content: d.organizationName, x: 19, y: 7, width: 58, height: 7, fontSize: 5.2, fontWeight: 800, color: t.text, visible: true },
    { id: 'title', side: 'FRONT', type: 'TEXT', label: 'Judul Kartu', content: d.cardTitle, x: 19, y: 15, width: 58, height: 8, fontSize: 4.6, fontWeight: 800, color: t.text, visible: true },
    { id: 'photo', side: 'FRONT', type: 'PHOTO', label: 'Foto Anggota', x: 5, y: 29, width: 22, height: 42, radius: 4, visible: d.showPhoto },
    { id: 'number', side: 'FRONT', type: 'FIELD', label: 'Nomor Anggota', field: 'nomor_anggota', x: 31, y: 30, width: 38, height: 7, fontSize: 4.4, fontWeight: 700, color: t.accent, visible: true },
    { id: 'name', side: 'FRONT', type: 'FIELD', label: 'Nama Lengkap', field: 'nama_lengkap', x: 31, y: 39, width: 43, height: 9, fontSize: 6.2, fontWeight: 800, color: t.text, visible: true },
    { id: 'business', side: 'FRONT', type: 'FIELD', label: 'Nama Usaha', field: 'nama_usaha', x: 31, y: 50, width: 42, height: 8, fontSize: 4.4, fontWeight: 700, color: t.accent, visible: d.showBusinessName },
    { id: 'category', side: 'FRONT', type: 'FIELD', label: 'Kategori Usaha', field: 'kategori_usaha', x: 31, y: 59, width: 38, height: 9, fontSize: 3.7, fontWeight: 600, color: t.text, visible: d.showCategory },
    { id: 'qr', side: 'FRONT', type: 'QR', label: 'QR Profil Anggota', x: 76, y: 28, width: 18, height: 18, visible: d.showQrCode },
    { id: 'badge', side: 'FRONT', type: 'TEXT', label: 'Badge Status', content: d.badgeText, x: 76, y: 48, width: 18, height: 7, fontSize: 3.2, fontWeight: 800, color: t.accent, align: 'center', visible: true },
    { id: 'join', side: 'FRONT', type: 'FIELD', label: 'Tanggal Bergabung', field: 'tanggal_bergabung', x: 31, y: 71, width: 38, height: 7, fontSize: 3.5, fontWeight: 600, color: t.text, visible: d.showJoinDate },
    { id: 'back-title', side: 'BACK', type: 'TEXT', label: 'Judul Belakang', content: d.cardTitle, x: 5, y: 7, width: 90, height: 8, fontSize: 5, fontWeight: 800, color: t.text, visible: true },
    { id: 'back-org', side: 'BACK', type: 'TEXT', label: 'Organisasi Belakang', content: d.organizationName, x: 5, y: 16, width: 90, height: 7, fontSize: 4.2, fontWeight: 700, color: t.accent, visible: true },
    { id: 'officer', side: 'BACK', type: 'TEXT', label: 'Pejabat Penandatangan', content: `${d.authorizedOfficerName}\n${d.authorizedOfficerTitle}\n${d.authorizedOfficerNip || ''}`, x: 5, y: 58, width: 48, height: 17, fontSize: 3.8, fontWeight: 700, color: t.text, lineHeight: 1.25, visible: true },
    { id: 'disclaimer', side: 'BACK', type: 'TEXT', label: 'Ketentuan', content: d.disclaimerNotes, x: 5, y: 77, width: 90, height: 14, fontSize: 3.2, color: t.text, lineHeight: 1.3, visible: true },
    { id: 'barcode', side: 'BACK', type: 'BARCODE', label: 'Barcode Member ID', x: 58, y: 54, width: 35, height: 20, visible: d.showBarcode !== false },
  ];
}

const fieldValue = (member: Member, field?: string) => {
  if (!field) return '';
  const value = (member as any)[field];
  return value == null ? '' : String(value);
};

export const DigitalMemberCardModal: React.FC<DigitalMemberCardModalProps> = ({ isOpen, onClose, member, onPhotoUpdated }) => {
  const [design, setDesign] = useState<MemberCardDesignConfig>(() => storage.getMemberCardDesign());
  const [side, setSide] = useState<MemberCardSide>('FRONT');
  const [qr, setQr] = useState('');
  const [photo, setPhoto] = useState(member.foto_profil_url || member.avatar_url || '');
  const [message, setMessage] = useState('');
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => { setPhoto(member.foto_profil_url || member.avatar_url || ''); }, [member]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    storage.refreshMemberCardDesignFromSpreadsheet().then(remote => { if (!cancelled) setDesign(remote); }).catch(() => { if (!cancelled) setDesign(storage.getMemberCardDesign()); });
    return () => { cancelled = true; };
  }, [isOpen]);

  const elements = useMemo(() => legacyElements(design), [design]);
  const sideElements = useMemo(() => elements.filter(e => e.side === side && e.visible), [elements, side]);
  const theme = THEMES[design.theme] || THEMES.LUXURY_SLATE;
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/?view=member-profile&id=${encodeURIComponent(member.member_id)}` : `/?view=member-profile&id=${encodeURIComponent(member.member_id)}`;

  useEffect(() => { generateQrCodeDataUrl(publicUrl, { width: 400, margin: 1 }).then(setQr); }, [publicUrl]);
  useEffect(() => {
    const el = sideElements.find(e => e.type === 'BARCODE');
    if (barcodeRef.current && el) renderBarcodeToElement(barcodeRef.current, publicUrl, { height: 50, width: 1.5, displayValue: false, margin: 2 });
  }, [sideElements, publicUrl]);

  if (!isOpen) return null;

  const style = (e: MemberCardElement): React.CSSProperties => ({
    position: 'absolute', left: `${e.x}%`, top: `${e.y}%`, width: `${e.width}%`, height: `${e.height}%`,
    fontFamily: e.fontFamily || 'Arial', fontSize: `${Math.max(2, e.fontSize || 5)}px`, fontWeight: e.fontWeight || 500,
    color: e.color || theme.text, textAlign: e.align || 'left', lineHeight: e.lineHeight || 1.15,
    opacity: e.opacity ?? 1, transform: `rotate(${e.rotation || 0}deg)`, borderRadius: `${e.radius || 0}px`,
    overflow: 'hidden', zIndex: e.type === 'SHAPE' ? 1 : 10,
  });

  const render = (e: MemberCardElement) => {
    if (e.type === 'PHOTO') return <div style={style(e)} className="bg-slate-200/40 border border-white/30"><img src={photo} alt="Foto anggota" className="w-full h-full object-cover" />{!photo && <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400">FOTO</div>}</div>;
    if (e.type === 'LOGO') return <img src={e.url || design.customLogoUrl} alt="Logo" style={style(e)} className="object-contain" />;
    if (e.type === 'QR') return <div style={style(e)} className="bg-white p-[2%] flex items-center justify-center"><img src={qr} alt="QR profil anggota" className="w-full h-full object-contain" /></div>;
    if (e.type === 'BARCODE') return <div style={style(e)} className="bg-white p-1 flex items-center justify-center"><svg ref={barcodeRef} className="w-full h-full" /></div>;
    if (e.type === 'SHAPE') return <div style={{ ...style(e), background: e.color || theme.accent }} />;
    return <div style={{ ...style(e), whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{e.type === 'FIELD' ? fieldValue(member, e.field) : e.content || ''}</div>;
  };

  const savePhoto = (url: string) => {
    const updated: Member = { ...member, foto_profil_url: url, avatar_url: url, updated_at: new Date().toISOString() };
    storage.saveMember(updated);
    setPhoto(url); onPhotoUpdated?.(updated); setMessage('Foto profil diperbarui.');
    window.setTimeout(() => setMessage(''), 2500);
  };

  return <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
    <style>{`@media print { body *{visibility:hidden!important} #print-area-kta,#print-area-kta *{visibility:visible!important} #print-area-kta{position:fixed!important;left:0!important;top:0!important;width:85.6mm!important;height:53.98mm!important;margin:0!important;padding:0!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important} }`}</style>
    <div className="mx-auto my-4 w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><div><div className="text-[10px] font-black tracking-widest text-emerald-700">KTA DIGITAL</div><h2 className="text-lg font-black text-slate-900">{member.nama_lengkap}</h2><p className="text-xs text-slate-500 font-mono">{member.member_id} • {member.nomor_anggota}</p></div><button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-600"><X className="w-5 h-5" /></button></div>
      <div className="p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5">
        <div>
          <div className="flex gap-2 mb-3"><button onClick={() => setSide('FRONT')} className={`px-4 py-2 rounded-lg text-xs font-black ${side === 'FRONT' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>DEPAN</button><button onClick={() => setSide('BACK')} className={`px-4 py-2 rounded-lg text-xs font-black ${side === 'BACK' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>BELAKANG</button></div>
          <div id="print-area-kta" className="relative mx-auto w-full max-w-2xl aspect-[85.6/53.98] rounded-2xl overflow-hidden shadow-xl border-2" style={{ background: side === 'FRONT' ? (design.frontBackgroundUrl ? `url(${design.frontBackgroundUrl}) center/cover no-repeat` : theme.background) : (design.backBackgroundUrl ? `url(${design.backBackgroundUrl}) center/cover no-repeat` : theme.background), borderColor: theme.border }}>
            {sideElements.map(e => <React.Fragment key={e.id}>{render(e)}</React.Fragment>)}
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4"><div className="text-xs font-black text-slate-800 mb-2">Status desain</div><div className="text-[11px] text-slate-500">KTA menggunakan template yang disimpan Super Admin. Posisi, teks, foto, logo, QR dan barcode mengikuti konfigurasi FRONT/BACK.</div></div>
          <div className="rounded-2xl border border-slate-200 p-4"><div className="text-xs font-black text-slate-800 mb-2">Profil QR / Barcode</div><div className="text-[10px] text-slate-500 break-all">{publicUrl}</div></div>
          {message && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 flex gap-2"><Check className="w-4 h-4" />{message}</div>}
          <label className="block rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold cursor-pointer text-center">Ganti Foto Anggota<input type="file" accept="image/*" className="hidden" onChange={e => { const file=e.target.files?.[0]; if(!file) return; if(file.size>2*1024*1024){setMessage('Ukuran foto maksimal 2 MB.');return;} const r=new FileReader(); r.onload=()=>savePhoto(String(r.result)); r.readAsDataURL(file); e.target.value=''; }} /></label>
          <button onClick={() => window.print()} className="w-full rounded-xl bg-slate-900 text-white py-3 text-xs font-black flex items-center justify-center gap-2"><Printer className="w-4 h-4" />Cetak KTA 85,6 × 53,98 mm</button>
        </div>
      </div>
    </div>
  </div>;
};

export default DigitalMemberCardModal;
