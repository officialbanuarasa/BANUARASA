// BANUARASA - Google Workspace / Apps Script client
// Google Sheets = system of record. localStorage is cache/session only.

const APPS_SCRIPT_URL_KEY = 'banuarasa_gas_url';
const LEGACY_GAS_URL_KEY = 'kbm_gas_web_app_url_v3';

// URL Web App Apps Script resmi BANUARASA.
// Dipakai sebagai fallback agar browser/HP baru tidak bergantung pada localStorage.
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxGf-7guiIALE29-2lib-L0coaEjjpLLt-QPHDBaL9aROKw2fI_KRusREPVW1yVJiqV/exec';
export const GOOGLE_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1ahwiRQRMTqneZhfFbcLTYyuO4No_Y_rOC61ALPSq2KE/edit';
export const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1dwivnfJ6mIFFXwYjB__RBh5JLewwfZLN';

export interface GasResponse<T = any> { success: boolean; message?: string; data?: T; result?: T; error?: string; }

const getUrl = () => (localStorage.getItem(APPS_SCRIPT_URL_KEY) || localStorage.getItem(LEGACY_GAS_URL_KEY) || DEFAULT_GAS_URL).trim();
const getCandidateUrls = (): string[] => {
  const saved = getUrl();
  return Array.from(new Set([saved, DEFAULT_GAS_URL].filter(Boolean)));
};
export const getSavedGasUrl = (): string => getUrl();
export const saveGasUrl = (url: string): void => { localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim()); localStorage.setItem(LEGACY_GAS_URL_KEY, url.trim()); };

export async function callGoogleAppsScript<T = any>(action: string, data: any = {}): Promise<GasResponse<T>> {
  const endpoints = getCandidateUrls();
  if (!endpoints.length) return { success: false, error: 'URL Google Apps Script belum dikonfigurasi.' };
  let lastError = 'Network error';
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({action, data}) });
      const json = await response.json();
      if (!response.ok) { lastError = `HTTP ${response.status}`; continue; }
      if (json && json.success !== false) {
        if (endpoint !== getUrl()) saveGasUrl(endpoint);
        return json;
      }
      lastError = json?.error || json?.message || 'Apps Script menolak permintaan.';
    } catch (error:any) {
      lastError = error?.message || 'Network error';
    }
  }
  return { success:false, error:lastError };
}

export async function fetchAllDataFromGas(): Promise<GasResponse> {
  const endpoint=getUrl();
  if(!endpoint) return {success:false,error:'URL Google Apps Script belum dikonfigurasi.'};
  try { const separator = endpoint.includes('?') ? '&' : '?';
    const r=await fetch(endpoint+separator+'action=getAllData&_ts='+Date.now(), { cache: 'no-store' }); const j=await r.json(); return j; }
  catch(e:any){ return {success:false,error:e?.message||'Gagal mengambil data Google Sheets'}; }
}

export async function syncRowToSpreadsheet(sheetName:string, id:string, data:any):Promise<GasResponse> {
  const actionMap:any={SHEET_ANGGOTA_KOPERASI:'updateMember',SHEET_REGISTRASI_STAND:'updateRegistration',SHEET_PEMBAYARAN:'updatePayment',SHEET_SIMPANAN:'updateSaving',SHEET_OMZET_PENJUALAN:'updateSalesReport',SHEET_DOKUMEN_LEGALITAS:'upsertDocument',SHEET_PRODUK_UMKM:'upsertProduct',SHEET_EVENT_MARKET:'updateEvent',SHEET_AUDIT_LOGS:'logAudit',SHEET_KEHADIRAN_EVENT:'upsertAttendance'};
  const action=actionMap[sheetName] || 'upsertRow';
  const payload={...data};
  if(id && !payload.member_id && sheetName==='SHEET_ANGGOTA_KOPERASI') payload.member_id=id;
  if(id && !payload.registration_id && sheetName==='SHEET_REGISTRASI_STAND') payload.registration_id=id;
  if(id && !payload.payment_id && sheetName==='SHEET_PEMBAYARAN') payload.payment_id=id;
  if(id && !payload.saving_id && sheetName==='SHEET_SIMPANAN') payload.saving_id=id;
  if(id && !payload.sales_report_id && sheetName==='SHEET_OMZET_PENJUALAN') payload.sales_report_id=id;
  if(id && !payload.event_id && sheetName==='SHEET_EVENT_MARKET') payload.event_id=id;
  if(id && !payload.attendance_id && sheetName==='SHEET_KEHADIRAN_EVENT') payload.attendance_id=id;
  return callGoogleAppsScript(action,payload);
}

export async function createMember(member:any):Promise<GasResponse> {
  return callGoogleAppsScript('createMember', member);
}

export async function deleteSpreadsheetRow(sheetName:string,id:string):Promise<GasResponse>{ return callGoogleAppsScript('deleteRow',{sheetName,id}); }

export interface DriveUploadInput { fileName:string; fileUrl?:string; base64Data?:string; mimeType?:string; category:string; uploadedBy?:string; memberId?:string; eventId?:string; referenceId?:string; }
export function syncFileToGoogleDrive(input:DriveUploadInput): any {
  let base64=input.base64Data;
  if(!base64 && input.fileUrl?.startsWith('data:')) base64=input.fileUrl;
  if(base64){
    const pending:any={success:true,status:'PENDING',fileId:'',driveUrl:'',folderPath:'',uploadedAt:new Date().toISOString()};
    callGoogleAppsScript('uploadFileToDrive',{...input,base64Data:base64}).then(r=>{ if(!r.success) console.warn('[Drive] Upload failed',r.error); });
    return pending;
  }
  return {success:true,status:'REFERENCE_ONLY',fileId:'',driveUrl:input.fileUrl||'',folderPath:'',uploadedAt:new Date().toISOString()};
}

export async function uploadMemberPhoto(file:File,memberId:string,memberName:string){ return uploadFile(file,'FOTO_PROFIL',memberId,memberName); }
export async function uploadMemberKta(file:File,memberId:string,memberName:string){ return uploadFile(file,'KTA_ANGGOTA',memberId,memberName); }
export async function uploadFile(file:File,category:string,memberId:string,name?:string):Promise<GasResponse> {
  const base64=await new Promise<string>((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(String(r.result));
    r.onerror=reject;
    r.readAsDataURL(file);
  });

  // IMPORTANT: jangan gunakan syncFileToGoogleDrive() di sini karena fungsi
  // tersebut bersifat fire-and-forget. Pendaftaran anggota membutuhkan hasil
  // upload yang sebenarnya agar URL foto dapat disimpan ke Spreadsheet.
  return callGoogleAppsScript('uploadFileToDrive',{
    fileName:file.name,
    fileUrl:base64,
    base64Data:base64,
    mimeType:file.type||'application/octet-stream',
    category,
    uploadedBy:name||memberId,
    memberId
  });
}


export async function saveMemberCardDesign(design:any, adminUsername='SUPER_ADMIN'):Promise<GasResponse> {
  return callGoogleAppsScript('saveMemberCardDesign', { design, admin_id: adminUsername });
}

export async function getMemberCardDesign():Promise<GasResponse> {
  return callGoogleAppsScript('getMemberCardDesign', {});
}

export async function updateKoperasiConfig(config:any):Promise<GasResponse> {
  return callGoogleAppsScript('updateKoperasiConfig', { config });
}

export async function recordAttendance(data:any){ return callGoogleAppsScript('recordAttendance',data); }
export async function verifyMemberCode(code:string,eventId?:string){ return callGoogleAppsScript('verifyMemberCode',{code,eventId}); }
export async function testGasConnection(){ return callGoogleAppsScript('ping',{}); }
export const syncWithGoogleWorkspace = testGasConnection;
export const pushStateToGAS = async (payload:any={}) => callGoogleAppsScript('batchSync',payload);
export const pullStateFromGAS = fetchAllDataFromGas;
export const getSyncStatus = () => ({connected:!!getUrl()});

export const googleWorkspaceSync = {
  callGoogleAppsScript, fetchAllDataFromGas, syncRowToSpreadsheet, createMember, deleteSpreadsheetRow, updateKoperasiConfig,
  syncFileToGoogleDrive, uploadMemberPhoto, uploadMemberKta, uploadFile, recordAttendance, saveMemberCardDesign, getMemberCardDesign,
  verifyMemberCode, testGasConnection, syncWithGoogleWorkspace:testGasConnection,
  pushStateToGAS, pullStateFromGAS, getSyncStatus,
};
