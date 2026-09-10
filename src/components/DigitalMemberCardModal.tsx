import React, { useEffect, useRef, useState } from 'react';
import { Member, MemberCardDesignConfig } from '../types';
import { storage } from '../services/storage';
import { googleWorkspaceSync } from '../services/googleWorkspaceSync';
import { generateQrCodeDataUrl, renderBarcodeToElement, formatVerificationUrl } from '../utils/barcode';
import { BANUARASA_ASSETS } from '../assets/baraAssets';
import { X, Printer, Upload, CheckCircle2, QrCode as QrIcon } from 'lucide-react';

interface DigitalMemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onPhotoUpdated?: (updatedMember: Member) => void;
  onOpenBarcodeModal?: (member: Member) => void;
}

export const DigitalMemberCardModal: React.FC<DigitalMemberCardModalProps> = ({ isOpen, onClose, member, onPhotoUpdated, onOpenBarcodeModal }) => {
  const [design, setDesign] = useState<MemberCardDesignConfig>(() => storage.getMemberCardDesign());
  const [side, setSide] = useState<'FRONT'|'BACK'>('FRONT');
  const [qr, setQr] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const photoInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setDesign(storage.getMemberCardDesign());
    storage.refreshMemberCardDesignFromSpreadsheet().then((remote) => { if (active) setDesign(remote); }).catch(() => { /* fallback ke cache lokal */ });
    generateQrCodeDataUrl(formatVerificationUrl(member.member_id), { width: 260, margin: 1 }).then(setQr);
    return () => { active = false; };
  }, [isOpen, member.member_id]);

  useEffect(() => {
    const el = (design.elements || []).find(e => e.side === side && e.type === 'BARCODE' && e.visible);
    if (el && barcodeRef.current) {
      renderBarcodeToElement(barcodeRef.current, member.member_id, { height: 42, width: 1.5, displayValue: true, fontSize: 8, margin: 2 });
    }
  }, [design, side, member.member_id]);

  if (!isOpen) return null;

  const valueFor = (field?: string) => String((member as any)[field || ''] ?? '');
  const elements = (design.elements || []).filter(e => e.side === side && e.visible);
  const background = side === 'FRONT' ? design.frontBackgroundUrl : design.backBackgroundUrl;

  const saveUpdatedPhoto = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) { setPhotoMessage('Foto maksimal 2 MB.'); return; }
    try {
      const result: any = await googleWorkspaceSync.uploadMemberPhoto(file, member.member_id, member.nama_lengkap);
      const remote = result?.result ?? result?.data ?? result;
      if (!result?.success || !remote?.driveUrl) throw new Error(result?.error || result?.message || 'Upload foto gagal.');
      const updated = { ...member, foto_profil_url: remote.driveUrl, updated_at: new Date().toISOString() };
      await storage.saveMemberAndWait(updated);
      setPhotoMessage('Foto berhasil disimpan ke Google Drive & Spreadsheet.');
      onPhotoUpdated?.(updated);
    } catch (e:any) { setPhotoMessage(e?.message || 'Foto gagal disimpan.'); }
  };

  const handlePrint = () => window.print();

  return <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
    <style>{`@media print { body *{visibility:hidden!important} #kta-print,#kta-print *{visibility:visible!important} #kta-print{position:fixed!important;left:0;top:0;width:85.6mm!important;height:53.98mm!important;margin:0!important} }`}</style>
    <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
        <div><p className="text-[10px] font-bold text-emerald-300 tracking-widest">KTA DIGITAL</p><h2 className="text-xl font-black">{design.cardTitle}</h2><p className="text-xs text-slate-400">{member.nama_lengkap} · {member.member_id}</p></div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><X/></button>
      </div>
      <div className="p-5 sm:p-7 grid lg:grid-cols-[1fr_280px] gap-6">
        <div>
          <div className="flex gap-2 mb-4"><button onClick={()=>setSide('FRONT')} className={`px-4 py-2 rounded-xl text-xs font-black ${side==='FRONT'?'bg-emerald-600 text-white':'bg-slate-100'}`}>DEPAN</button><button onClick={()=>setSide('BACK')} className={`px-4 py-2 rounded-xl text-xs font-black ${side==='BACK'?'bg-emerald-600 text-white':'bg-slate-100'}`}>BELAKANG</button></div>
          <div id="kta-print" className="relative w-full max-w-3xl mx-auto aspect-[1.586/1] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
            {background ? <img src={background} className="absolute inset-0 w-full h-full object-cover" alt="Background KTA"/> : <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950"/>}
            <div className="absolute inset-0 bg-black/15"/>
            {elements.map(e=>{
              const style: React.CSSProperties = { position:'absolute', left:`${e.x}%`, top:`${e.y}%`, width:`${e.width}%`, height:`${e.height}%`, fontFamily:e.fontFamily||'Arial', fontSize:`${Math.max(5,(e.fontSize||8)*0.9)}px`, fontWeight:e.fontWeight||600, color:e.color||'#fff', textAlign:e.align||'left', opacity:e.opacity??1, lineHeight:e.lineHeight||1.15, transform:`rotate(${e.rotation||0}deg)` };
              if(e.type==='PHOTO') return <img key={e.id} src={member.foto_profil_url||''} alt={member.nama_lengkap} style={{...style,objectFit:'cover',borderRadius:e.radius||8,border:'2px solid rgba(255,255,255,.7)'}}/>;
              if(e.type==='LOGO') return <img key={e.id} src={e.url||design.customLogoUrl||BANUARASA_ASSETS.logo} alt="Logo" style={{...style,objectFit:'contain'}}/>;
              if(e.type==='QR') return qr ? <img key={e.id} src={qr} alt="QR Profil Anggota" style={{...style,objectFit:'contain',background:'#fff',padding:3,borderRadius:5}}/> : null;
              if(e.type==='BARCODE') return <svg key={e.id} ref={barcodeRef} style={style}/>;
              const content = e.type==='FIELD' ? valueFor(e.field) : (e.content||'');
              return <div key={e.id} style={{...style,whiteSpace:'pre-wrap',overflow:'hidden'}}>{content}</div>;
            })}
          </div>
          <div className="flex justify-center gap-2 mt-4"><button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2"><Printer className="w-4 h-4"/> Cetak</button>{onOpenBarcodeModal&&<button onClick={()=>onOpenBarcodeModal(member)} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2"><QrIcon className="w-4 h-4"/> QR / Barcode</button>}</div>
        </div>
        <aside className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200"><h3 className="font-black text-sm">Identitas</h3><p className="text-xs mt-2"><b>Member ID:</b> {member.member_id}</p><p className="text-xs mt-1"><b>Nomor:</b> {member.nomor_anggota}</p></div>
          <div className="p-4 rounded-2xl border border-slate-200"><h3 className="font-black text-sm mb-3">Foto KTA</h3><input ref={photoInput} type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files?.[0];if(f)saveUpdatedPhoto(f)}}/><button onClick={()=>photoInput.current?.click()} className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2"><Upload className="w-4 h-4"/> Ganti Foto</button>{photoMessage&&<p className="text-[10px] mt-2 text-emerald-700 flex gap-1"><CheckCircle2 className="w-3 h-3"/>{photoMessage}</p>}</div>
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 text-[11px]">QR Code mengarah ke profil anggota resmi. Barcode membaca <b>member_id</b> yang sama sehingga identitas tidak terputus.</div>
        </aside>
      </div>
    </div>
  </div>;
};
