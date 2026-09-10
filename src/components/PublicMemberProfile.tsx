import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Store, UserRound } from 'lucide-react';
import { Member } from '../types';
import { callGoogleAppsScript } from '../services/googleWorkspaceSync';

export const PublicMemberProfile: React.FC<{ memberId: string }> = ({ memberId }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError('');
      const result = await callGoogleAppsScript('getMemberProfile', { member_id: memberId });
      const data: any = result?.result ?? result?.data;
      if (cancelled) return;
      if (!result.success || !data?.member) {
        setError(data?.message || result.error || 'Profil anggota tidak ditemukan.');
      } else {
        setMember(data.member as Member);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [memberId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Memverifikasi profil anggota...</div>;
  if (error || !member) return <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6"><div className="max-w-md w-full bg-white rounded-3xl p-8 text-center"><ShieldCheck className="w-12 h-12 mx-auto text-red-500 mb-3"/><h1 className="font-black text-xl">Profil tidak ditemukan</h1><p className="text-sm text-slate-500 mt-2">{error}</p></div></div>;

  return <div className="min-h-screen bg-slate-950 p-4 sm:p-8 flex items-center justify-center">
    <div className="w-full max-w-xl bg-white rounded-[2rem] overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-7 text-white">
        <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center"><ShieldCheck className="w-7 h-7 text-slate-950"/></div><div><p className="text-[10px] font-bold tracking-[.2em] text-emerald-300">VERIFIKASI KTA</p><h1 className="text-xl font-black">Profil Anggota Resmi</h1></div></div>
      </div>
      <div className="p-7">
        <div className="flex gap-5 items-center">
          {member.foto_profil_url ? <img src={member.foto_profil_url} className="w-24 h-24 rounded-2xl object-cover border-4 border-emerald-50" alt={member.nama_lengkap}/> : <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center"><UserRound className="w-10 h-10 text-slate-400"/></div>}
          <div><h2 className="text-xl font-black text-slate-900">{member.nama_lengkap}</h2><p className="font-mono text-sm text-emerald-700 mt-1">{member.member_id}</p><span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black"><CheckCircle2 className="w-3.5 h-3.5"/> {member.status_keanggotaan}</span></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
          <div className="p-4 rounded-2xl bg-slate-50"><p className="text-[10px] uppercase font-bold text-slate-400">Nomor Anggota</p><p className="font-bold mt-1">{member.nomor_anggota || '-'}</p></div>
          <div className="p-4 rounded-2xl bg-slate-50"><p className="text-[10px] uppercase font-bold text-slate-400">Usaha</p><p className="font-bold mt-1 flex gap-1 items-center"><Store className="w-4 h-4 text-emerald-600"/>{member.nama_usaha || '-'}</p></div>
          <div className="p-4 rounded-2xl bg-slate-50"><p className="text-[10px] uppercase font-bold text-slate-400">Kategori</p><p className="font-bold mt-1">{member.kategori_usaha || '-'}</p></div>
          <div className="p-4 rounded-2xl bg-slate-50"><p className="text-[10px] uppercase font-bold text-slate-400">Bergabung</p><p className="font-bold mt-1">{member.tanggal_bergabung || '-'}</p></div>
        </div>
        <div className="mt-5 p-4 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-900 text-xs font-semibold">Profil ini diambil langsung dari database Google Spreadsheet pada saat QR/Barcode diverifikasi.</div>
      </div>
    </div>
  </div>;
};
