export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT (Code.gs)
 * SISTEM INFORMASI TERPADU BANUARASA WEEKEND MARKET & KOPERASI BERAU MELANGKAH BERSAMA
 * 
 * Petunjuk Pemasangan di Google Workspace:
 * 1. Buka Google Spreadsheet: https://docs.google.com/spreadsheets/d/1ahwiRQRMTqneZhfFbcLTYyuO4No_Y_rOC61ALPSq2KE/edit
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'.
 * 3. Hapus kode default, lalu tempel (paste) seluruh isi file ini ke 'Code.gs'.
 * 4. Klik ikon Simpan (Save).
 * 5. Klik tombol 'Deploy' (Terapkan) > 'New deployment' (Penerapan baru).
 * 6. Pilih tipe 'Web app'.
 *    - Description: "Banuarasa Backend Bridge v3"
 *    - Execute as: "Me" (Saya / officialbanuarasa@gmail.com)
 *    - Who has access: "Anyone" (Siapa saja - agar aplikasi web dapat mengirim & menerima data)
 * 7. Klik 'Deploy' dan salin 'Web App URL' ke pengaturan aplikasi Banuarasa.
 * 
 * CATATAN PENTING:
 * Script ini TIDAK BERISI DATA DUMMY/DEMO. Script ini mengelola data murni dari database Google Spreadsheet
 * dan Google Drive secara real-time.
 */

// ID Google Drive Folder Utama untuk seluruh berkas Banuarasa
const ROOT_DRIVE_FOLDER_ID = "1dwivnfJ6mIFFXwYjB__RBh5JLewwfZLN";

// Nama-Nama Sheet Basis Data Utama
const SHEETS = {
  ANGGOTA: "SHEET_ANGGOTA_KOPERASI",
  STANDS: "SHEET_REGISTRASI_STAND",
  PEMBAYARAN: "SHEET_PEMBAYARAN",
  SIMPANAN: "SHEET_SIMPANAN",
  OMZET: "SHEET_OMZET_PENJUALAN",
  LEGALITAS: "SHEET_DOKUMEN_LEGALITAS",
  PRODUK: "SHEET_PRODUK_UMKM",
  AUDIT: "SHEET_AUDIT_LOGS",
  EVENT: "SHEET_EVENT_MARKET"
};

// Header Kolom Masing-Masing Sheet
const HEADERS = {
  [SHEETS.ANGGOTA]: [
    "member_id", "nomor_anggota", "nik", "nama_lengkap", "tempat_lahir", "tanggal_lahir",
    "jenis_kelamin", "alamat", "nomor_hp", "whatsapp", "email", "nama_usaha",
    "kategori_usaha", "alamat_usaha", "deskripsi_usaha", "foto_profil_url",
    "status_keanggotaan", "tanggal_bergabung", "created_at", "updated_at"
  ],
  [SHEETS.STANDS]: [
    "registration_id", "event_id", "member_id", "stand_code", "stand_price",
    "registration_date", "registration_status", "payment_status", "payment_deadline",
    "check_in_status", "check_in_time", "notes", "created_at", "updated_at"
  ],
  [SHEETS.PEMBAYARAN]: [
    "payment_id", "registration_id", "member_id", "payment_type", "amount",
    "payment_method", "payment_date", "proof_file_id", "proof_file_url",
    "verification_status", "verified_by", "verified_at", "rejection_reason",
    "created_at", "updated_at"
  ],
  [SHEETS.SIMPANAN]: [
    "saving_id", "member_id", "saving_type", "period_month_year", "amount",
    "payment_status", "payment_date", "notes", "created_at", "updated_at"
  ],
  [SHEETS.OMZET]: [
    "sales_report_id", "event_id", "member_id", "registration_id", "gross_sales",
    "cost", "net_profit", "total_items_sold", "total_transactions", "notes",
    "report_status", "submitted_at", "verified_by", "verified_at"
  ],
  [SHEETS.LEGALITAS]: [
    "document_id", "member_id", "document_type", "document_number", "file_name",
    "drive_file_id", "drive_url", "upload_date", "verification_status",
    "verified_by", "verified_at", "rejection_reason"
  ],
  [SHEETS.PRODUK]: [
    "product_id", "member_id", "product_name", "category", "description",
    "price", "image_url", "featured", "status", "created_at", "updated_at"
  ],
  [SHEETS.AUDIT]: [
    "log_id", "timestamp", "user_id", "user_role", "action", "module",
    "reference_id", "description", "ip_address", "user_agent", "result"
  ],
  [SHEETS.EVENT]: [
    "event_id", "event_name", "event_date", "start_time", "end_time",
    "location", "description", "banner_image_url", "status", "total_stands",
    "created_at", "updated_at"
  ]
};

/**
 * Inisialisasi struktur sheet dan header (Hanya membuat sheet & header kolom bila belum ada).
 * Tidak memasukkan data dummy/demo apa pun.
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const sheetKey in SHEETS) {
    const sheetName = SHEETS[sheetKey];
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      const headers = HEADERS[sheetName];
      if (headers && headers.length > 0) {
        sheet.appendRow(headers);
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setBackground("#0f5132");
        headerRange.setFontColor("#ffffff");
        headerRange.setFontWeight("bold");
        sheet.setFrozenRows(1);
      }
    }
  }
}

/**
 * Handler HTTP GET untuk mengambil data secara real-time dari Google Spreadsheet
 */
function doGet(e) {
  try {
    initializeDatabase();
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAllData";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "ping") {
      return createJsonResponse({
        success: true,
        status: "ONLINE",
        timestamp: new Date().toISOString(),
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        driveFolderId: ROOT_DRIVE_FOLDER_ID
      });
    }

    if (action === "getSheet") {
      const sheetName = e.parameter.sheetName;
      if (!sheetName) throw new Error("Parameter sheetName diperlukan");
      const rows = readSheetAsJson(sheetName);
      return createJsonResponse({ success: true, sheetName: sheetName, count: rows.length, data: rows });
    }

    // Default: Mengambil seluruh basis data operasional
    const allData = {
      members: readSheetAsJson(SHEETS.ANGGOTA),
      registrations: readSheetAsJson(SHEETS.STANDS),
      payments: readSheetAsJson(SHEETS.PEMBAYARAN),
      savings: readSheetAsJson(SHEETS.SIMPANAN),
      salesReports: readSheetAsJson(SHEETS.OMZET),
      documents: readSheetAsJson(SHEETS.LEGALITAS),
      products: readSheetAsJson(SHEETS.PRODUK),
      auditLogs: readSheetAsJson(SHEETS.AUDIT),
      events: readSheetAsJson(SHEETS.EVENT)
    };

    return createJsonResponse({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        members: allData.members.length,
        registrations: allData.registrations.length,
        payments: allData.payments.length,
        savings: allData.savings.length,
        salesReports: allData.salesReports.length,
        documents: allData.documents.length,
        products: allData.products.length
      },
      data: allData
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handler HTTP POST untuk menyimpan/mengubah/menghapus data & upload file ke Google Drive
 */
function doPost(e) {
  try {
    initializeDatabase();
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        body = {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    const action = body.action || (e && e.parameter && e.parameter.action);
    let payload = (body.data !== undefined && body.data !== null) ? body.data : body;
    if (!payload || typeof payload !== "object") {
      payload = {};
    }

    if (!action) {
      throw new Error("Field 'action' wajib disertakan dalam request POST.");
    }

    let result = null;

    switch (action) {
      // 1. MANAJEMEN ANGGOTA
      case "createMember":
      case "addMember":
        result = upsertRow(SHEETS.ANGGOTA, "member_id", payload.member_id, payload);
        break;
      case "updateMember":
        result = updateRow(SHEETS.ANGGOTA, "member_id", payload.member_id, payload);
        break;
      case "deleteMember":
        result = deleteRow(SHEETS.ANGGOTA, "member_id", payload.member_id);
        break;

      // 2. MANAJEMEN REGISTRASI 64 STAND
      case "bookStand":
      case "createRegistration":
        result = upsertRow(SHEETS.STANDS, "registration_id", payload.registration_id, payload);
        break;
      case "updateStand":
      case "updateRegistration":
        result = updateRow(SHEETS.STANDS, "registration_id", payload.registration_id, payload);
        break;
      case "deleteStand":
      case "deleteRegistration":
        result = deleteRow(SHEETS.STANDS, "registration_id", payload.registration_id);
        break;

      // 3. MANAJEMEN PEMBAYARAN
      case "createPayment":
        result = upsertRow(SHEETS.PEMBAYARAN, "payment_id", payload.payment_id, payload);
        break;
      case "updatePayment":
      case "verifyPayment":
        result = updateRow(SHEETS.PEMBAYARAN, "payment_id", payload.payment_id, payload);
        break;
      case "deletePayment":
        result = deleteRow(SHEETS.PEMBAYARAN, "payment_id", payload.payment_id);
        break;

      // 4. MANAJEMEN SIMPANAN KAS KOPERASI
      case "createSaving":
        result = upsertRow(SHEETS.SIMPANAN, "saving_id", payload.saving_id, payload);
        break;
      case "updateSaving":
        result = updateRow(SHEETS.SIMPANAN, "saving_id", payload.saving_id, payload);
        break;
      case "deleteSaving":
        result = deleteRow(SHEETS.SIMPANAN, "saving_id", payload.saving_id);
        break;

      // 5. MANAJEMEN LAPORAN OMZET UMKM
      case "createSalesReport":
      case "submitSalesReport":
        result = upsertRow(SHEETS.OMZET, "sales_report_id", payload.sales_report_id, payload);
        break;
      case "updateSalesReport":
        result = updateRow(SHEETS.OMZET, "sales_report_id", payload.sales_report_id, payload);
        break;
      case "deleteSalesReport":
        result = deleteRow(SHEETS.OMZET, "sales_report_id", payload.sales_report_id);
        break;

      // 6. UPLOAD BERKAS/GAMBAR KE GOOGLE DRIVE
      case "uploadFileToDrive":
        result = handleDriveFileUpload(payload);
        break;

      // 7. BATCH SYNC DARI APLIKASI
      case "batchSync":
        result = handleBatchSync(payload);
        break;

      // 8. AUDIT LOGGING
      case "logAudit":
        result = appendRow(SHEETS.AUDIT, payload);
        break;

      // 9. EVENT MANAGEMENT
      case "createEvent":
      case "updateEvent":
        result = upsertRow(SHEETS.EVENT, "event_id", payload.event_id, payload);
        break;

      default:
        throw new Error("Action '" + action + "' tidak dikenali.");
    }

    return createJsonResponse({ success: true, action: action, result: result });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Membaca data sheet menjadi array objek JSON berdasarkan header baris pertama
 */
function readSheetAsJson(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  const rows = [];

  for (let i = 1; i < values.length; i++) {
    const rowObj = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      const headerKey = String(headers[j]).trim();
      if (headerKey) {
        let val = values[i][j];
        if (val instanceof Date) {
          val = val.toISOString();
        }
        rowObj[headerKey] = val;
        if (val !== "" && val !== null && val !== undefined) {
          hasData = true;
        }
      }
    }
    if (hasData) {
      rows.push(rowObj);
    }
  }
  return rows;
}

/**
 * Menambahkan atau memperbarui baris data berdasarkan ID unik kolom kunci
 */
function upsertRow(sheetName, keyColumn, keyValue, dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan");

  const headers = HEADERS[sheetName] || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getDataRange().getValues();
  let keyColIdx = headers.indexOf(keyColumn);
  if (keyColIdx === -1) keyColIdx = 0;

  let existingRowIdx = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][keyColIdx]) === String(keyValue)) {
      existingRowIdx = i + 1; // 1-indexed
      break;
    }
  }

  const rowData = headers.map(function(h) {
    return dataObj[h] !== undefined ? dataObj[h] : "";
  });

  if (existingRowIdx > 0) {
    sheet.getRange(existingRowIdx, 1, 1, headers.length).setValues([rowData]);
    return { status: "UPDATED", row: existingRowIdx, id: keyValue };
  } else {
    sheet.appendRow(rowData);
    return { status: "INSERTED", row: sheet.getLastRow(), id: keyValue };
  }
}

/**
 * Memperbarui baris data yang ada
 */
function updateRow(sheetName, keyColumn, keyValue, updatesObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan");

  const headers = HEADERS[sheetName] || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getDataRange().getValues();
  const keyColIdx = headers.indexOf(keyColumn);

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][keyColIdx]) === String(keyValue)) {
      const rowIdx = i + 1;
      const currentRow = values[i];
      const newRow = headers.map(function(h, idx) {
        return updatesObj[h] !== undefined ? updatesObj[h] : currentRow[idx];
      });
      sheet.getRange(rowIdx, 1, 1, headers.length).setValues([newRow]);
      return { status: "UPDATED", row: rowIdx, id: keyValue };
    }
  }
  // Bila belum ada, masukkan sebagai baris baru
  return upsertRow(sheetName, keyColumn, keyValue, updatesObj);
}

/**
 * Menghapus baris berdasarkan ID kunci
 */
function deleteRow(sheetName, keyColumn, keyValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: "NOT_FOUND" };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const keyColIdx = headers.indexOf(keyColumn);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][keyColIdx]) === String(keyValue)) {
      sheet.deleteRow(i + 1);
      return { status: "DELETED", id: keyValue, row: i + 1 };
    }
  }
  return { status: "NOT_FOUND", id: keyValue };
}

/**
 * Menambahkan 1 baris baru ke sheet
 */
function appendRow(sheetName, dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet " + sheetName + " tidak ditemukan");

  const headers = HEADERS[sheetName] || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(function(h) {
    return dataObj[h] !== undefined ? dataObj[h] : "";
  });
  sheet.appendRow(rowData);
  return { status: "APPENDED", row: sheet.getLastRow() };
}

/**
 * Menyimpan berkas/gambar Base64 langsung ke struktur folder Google Drive
 */
function handleDriveFileUpload(payload) {
  let rootFolder;
  try {
    rootFolder = DriveApp.getFolderById(ROOT_DRIVE_FOLDER_ID);
  } catch (e) {
    rootFolder = DriveApp.getRootFolder();
  }

  let targetFolder = rootFolder;
  const category = payload.category || "GENERAL";
  const subName = payload.memberId || payload.eventId || "DOCS";

  if (category === "FOTO_PROFIL" || category === "DOKUMEN_LEGALITAS") {
    const parentFolder = getOrCreateSubfolder(rootFolder, "01_ANGGOTA");
    targetFolder = getOrCreateSubfolder(parentFolder, subName);
  } else if (category === "BUKTI_PEMBAYARAN" || category === "BANNER_EVENT") {
    const parentFolder = getOrCreateSubfolder(rootFolder, "02_EVENT");
    targetFolder = getOrCreateSubfolder(parentFolder, subName);
  } else if (category === "FOTO_PRODUK") {
    const parentFolder = getOrCreateSubfolder(rootFolder, "03_PRODUK");
    targetFolder = getOrCreateSubfolder(parentFolder, subName);
  } else {
    targetFolder = getOrCreateSubfolder(rootFolder, "04_LAPORAN");
  }

  let rawBase64 = payload.base64Data || "";
  if (rawBase64.indexOf(",") !== -1) {
    rawBase64 = rawBase64.split(",")[1];
  }

  const decodedBytes = Utilities.base64Decode(rawBase64);
  const mimeType = payload.mimeType || (payload.fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
  const blob = Utilities.newBlob(decodedBytes, mimeType, payload.fileName);

  const file = targetFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId = file.getId();
  const driveUrl = file.getUrl();
  const directImageUrl = "https://lh3.googleusercontent.com/d/" + fileId;

  return {
    fileId: fileId,
    fileName: file.getName(),
    fileSize: file.getSize(),
    mimeType: mimeType,
    driveUrl: driveUrl,
    directImageUrl: directImageUrl,
    folderPath: targetFolder.getName(),
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Mencari atau membuat subfolder di dalam folder induk
 */
function getOrCreateSubfolder(parentFolder, subfolderName) {
  const folders = parentFolder.getFoldersByName(subfolderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(subfolderName);
}

/**
 * Sinkronisasi kumpulan data sekaligus (Batch Sync)
 */
function handleBatchSync(payload) {
  if (!payload || typeof payload !== "object") {
    payload = {};
  }
  const results = {};

  if (payload.members && Array.isArray(payload.members)) {
    payload.members.forEach(function(m) {
      if (m && m.member_id) {
        upsertRow(SHEETS.ANGGOTA, "member_id", m.member_id, m);
      }
    });
    results.membersSynced = payload.members.length;
  }

  if (payload.registrations && Array.isArray(payload.registrations)) {
    payload.registrations.forEach(function(r) {
      if (r && r.registration_id) {
        upsertRow(SHEETS.STANDS, "registration_id", r.registration_id, r);
      }
    });
    results.registrationsSynced = payload.registrations.length;
  }

  if (payload.payments && Array.isArray(payload.payments)) {
    payload.payments.forEach(function(p) {
      if (p && p.payment_id) {
        upsertRow(SHEETS.PEMBAYARAN, "payment_id", p.payment_id, p);
      }
    });
    results.paymentsSynced = payload.payments.length;
  }

  if (payload.savings && Array.isArray(payload.savings)) {
    payload.savings.forEach(function(s) {
      if (s && s.saving_id) {
        upsertRow(SHEETS.SIMPANAN, "saving_id", s.saving_id, s);
      }
    });
    results.savingsSynced = payload.savings.length;
  }

  if (payload.salesReports && Array.isArray(payload.salesReports)) {
    payload.salesReports.forEach(function(sr) {
      if (sr && sr.sales_report_id) {
        upsertRow(SHEETS.OMZET, "sales_report_id", sr.sales_report_id, sr);
      }
    });
    results.salesReportsSynced = payload.salesReports.length;
  }

  if (payload.events && Array.isArray(payload.events)) {
    payload.events.forEach(function(ev) {
      if (ev && ev.event_id) {
        upsertRow(SHEETS.EVENT, "event_id", ev.event_id, ev);
      }
    });
    results.eventsSynced = payload.events.length;
  }

  if (payload.products && Array.isArray(payload.products)) {
    payload.products.forEach(function(prod) {
      if (prod && prod.product_id) {
        upsertRow(SHEETS.PRODUK, "product_id", prod.product_id, prod);
      }
    });
    results.productsSynced = payload.products.length;
  }

  return results;
}

/**
 * Utility output JSON dengan header CORS lengkap
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
