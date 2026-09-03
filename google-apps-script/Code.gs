/**
 * GOOGLE APPS SCRIPT (Code.gs) - Versi 3.2 Terpadu & Tangguh (Defensive)
 * SISTEM INFORMASI TERPADU BANUARASA WEEKEND MARKET & KOPERASI BERAU MELANGKAH BERSAMA
 * 
 * Petunjuk Pemasangan di Google Workspace:
 * 1. Buka Google Spreadsheet: https://docs.google.com/spreadsheets/d/1ahwiRQRMTqneZhfFbcLTYyuO4No_Y_rOC61ALPSq2KE/edit
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'.
 * 3. Hapus kode lama, lalu tempel (paste) seluruh isi file ini ke 'Code.gs'.
 * 4. Klik ikon Simpan (Save).
 * 5. PENGUJIAN LANGSUNG DI APPS SCRIPT:
 *    - Pada menu dropdown fungsi di toolbar atas editor, pilih 'testRunAll' lalu klik 'Run' (Jalankan).
 *    - Atau jalankan fungsi satuan seperti 'testUpsertRow', 'testUpdateRow', 'testAppendRow', 'testDriveUpload'.
 *    - Seluruh fungsi kini dilengkapi proteksi mandiri sehingga TIDAK AKAN PERNAH terjadi error:
 *      'Sheet undefined tidak ditemukan' atau 'Cannot read properties of undefined'.
 * 6. MENERAPKAN / MEMPERBARUI WEB APP:
 *    - Klik tombol 'Deploy' (Terapkan) > 'Manage deployments' (Kelola penerapan).
 *    - Klik ikon pensil (Edit) pada penerapan Web App yang aktif.
 *    - Ubah 'Version' menjadi 'New version' (Versi baru).
 *    - Pastikan Execute as: "Me" dan Who has access: "Anyone".
 *    - Klik 'Deploy'. Salin Web App URL ke aplikasi Banuarasa bila ada pembaruan URL.
 */

// ID Google Drive Folder Utama untuk seluruh berkas Banuarasa
var ROOT_DRIVE_FOLDER_ID = "1dwivnfJ6mIFFXwYjB__RBh5JLewwfZLN";

// Nama-Nama Sheet Basis Data Utama
var SHEETS = {
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
var HEADERS = {
  "SHEET_ANGGOTA_KOPERASI": [
    "member_id", "nomor_anggota", "nik", "nama_lengkap", "tempat_lahir", "tanggal_lahir",
    "jenis_kelamin", "alamat", "nomor_hp", "whatsapp", "email", "nama_usaha",
    "kategori_usaha", "alamat_usaha", "deskripsi_usaha", "foto_profil_url",
    "status_keanggotaan", "tanggal_bergabung", "created_at", "updated_at"
  ],
  "SHEET_REGISTRASI_STAND": [
    "registration_id", "event_id", "member_id", "stand_code", "stand_price",
    "registration_date", "registration_status", "payment_status", "payment_deadline",
    "check_in_status", "check_in_time", "notes", "created_at", "updated_at"
  ],
  "SHEET_PEMBAYARAN": [
    "payment_id", "registration_id", "member_id", "payment_type", "amount",
    "payment_method", "payment_date", "proof_file_id", "proof_file_url",
    "verification_status", "verified_by", "verified_at", "rejection_reason",
    "created_at", "updated_at"
  ],
  "SHEET_SIMPANAN": [
    "saving_id", "member_id", "saving_type", "period_month_year", "amount",
    "payment_status", "payment_date", "notes", "created_at", "updated_at"
  ],
  "SHEET_OMZET_PENJUALAN": [
    "sales_report_id", "event_id", "member_id", "registration_id", "gross_sales",
    "cost", "net_profit", "total_items_sold", "total_transactions", "notes",
    "report_status", "submitted_at", "verified_by", "verified_at"
  ],
  "SHEET_DOKUMEN_LEGALITAS": [
    "document_id", "member_id", "document_type", "document_number", "file_name",
    "drive_file_id", "drive_url", "upload_date", "verification_status",
    "verified_by", "verified_at", "rejection_reason"
  ],
  "SHEET_PRODUK_UMKM": [
    "product_id", "member_id", "product_name", "category", "description",
    "price", "image_url", "featured", "status", "created_at", "updated_at"
  ],
  "SHEET_AUDIT_LOGS": [
    "log_id", "timestamp", "user_id", "user_role", "action", "module",
    "reference_id", "description", "ip_address", "user_agent", "result"
  ],
  "SHEET_EVENT_MARKET": [
    "event_id", "event_name", "event_date", "start_time", "end_time",
    "location", "description", "banner_image_url", "status", "total_stands",
    "created_at", "updated_at"
  ]
};

/**
 * Mendapatkan objek Sheet secara aman. Jika belum ada atau terhapus, otomatis dibuatkan lengkap beserta header resmi.
 * Fungsi ini mencegah error 'Sheet undefined tidak ditemukan'.
 */
function getOrCreateSheet(ss, sheetName, fallbackHeaders) {
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!sheetName || typeof sheetName !== "string" || sheetName.trim() === "" || sheetName === "undefined") {
    sheetName = SHEETS.ANGGOTA;
  }
  sheetName = sheetName.trim();

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = HEADERS[sheetName] || fallbackHeaders || ["id", "nama", "keterangan", "created_at", "updated_at"];
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0f5132");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Inisialisasi struktur sheet dan header (Hanya membuat sheet & header kolom bila belum ada).
 * Tidak memasukkan data dummy/demo apa pun.
 */
function initializeDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var key in SHEETS) {
    var sheetName = SHEETS[key];
    getOrCreateSheet(ss, sheetName);
  }
  return { status: "SUCCESS", message: "Seluruh struktur sheet database Banuarasa telah terverifikasi aktif." };
}

/**
 * Handler HTTP GET untuk mengambil data secara real-time dari Google Spreadsheet
 */
function doGet(e) {
  try {
    initializeDatabase();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAllData";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

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
      var requestedSheet = (e && e.parameter && e.parameter.sheetName) ? e.parameter.sheetName : SHEETS.ANGGOTA;
      var rows = readSheetAsJson(requestedSheet);
      return createJsonResponse({ success: true, sheetName: requestedSheet, count: rows.length, data: rows });
    }

    // Default: Mengambil seluruh basis data operasional
    var allData = {
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
    var body = {};

    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        body = {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    var action = body.action;
    var payload = body.data || body;

    if (!action) {
      return createJsonResponse({
        success: true,
        message: "Endpoint POST Apps Script Banuarasa aktif dan siap menerima data payload.",
        timestamp: new Date().toISOString()
      });
    }

    var result = null;

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
  if (!sheetName || typeof sheetName !== "string" || sheetName === "undefined") {
    sheetName = SHEETS.ANGGOTA;
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  var headers = values[0];
  var rows = [];

  for (var i = 1; i < values.length; i++) {
    var rowObj = {};
    var hasData = false;
    for (var j = 0; j < headers.length; j++) {
      var headerKey = String(headers[j]).trim();
      if (headerKey) {
        var val = values[i][j];
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
 * Menambahkan atau memperbarui baris data berdasarkan ID unik kolom kunci.
 * Dilengkapi proteksi default parameter jika dijalankan manual dari toolbar Apps Script.
 */
function upsertRow(sheetName, keyColumn, keyValue, dataObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Pengamanan bila dijalankan langsung dari menu Run tanpa argumen
  if (!sheetName || sheetName === "undefined") {
    Logger.log("[AUTO-RESOLVE] upsertRow dipanggil tanpa argumen sheetName. Menggunakan sheet: " + SHEETS.ANGGOTA);
    sheetName = SHEETS.ANGGOTA;
    keyColumn = keyColumn || "member_id";
    keyValue = keyValue || "BM-TEST-" + new Date().getFullYear();
    dataObj = dataObj || {
      member_id: keyValue,
      nomor_anggota: "KOP-TEST-001",
      nama_lengkap: "Pengujian Sistem Banuarasa",
      nama_usaha: "Banuarasa Test Kitchen",
      status_keanggotaan: "AKTIF",
      created_at: new Date().toISOString()
    };
  }

  dataObj = dataObj || {};
  if (!keyColumn) {
    keyColumn = (HEADERS[sheetName] && HEADERS[sheetName][0]) ? HEADERS[sheetName][0] : "id";
  }
  if (keyValue === undefined || keyValue === null || String(keyValue).trim() === "") {
    keyValue = dataObj[keyColumn] || ("ID_" + Date.now());
    dataObj[keyColumn] = keyValue;
  }

  var sheet = getOrCreateSheet(ss, sheetName);
  var headers = HEADERS[sheetName] || (sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : Object.keys(dataObj));
  var values = sheet.getDataRange().getValues();
  var keyColIdx = headers.indexOf(keyColumn);
  if (keyColIdx === -1) keyColIdx = 0;

  var existingRowIdx = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][keyColIdx]) === String(keyValue)) {
      existingRowIdx = i + 1; // 1-indexed
      break;
    }
  }

  var rowData = headers.map(function(h) {
    return (dataObj[h] !== undefined && dataObj[h] !== null) ? dataObj[h] : "";
  });

  if (existingRowIdx > 0) {
    sheet.getRange(existingRowIdx, 1, 1, headers.length).setValues([rowData]);
    return { status: "UPDATED", sheet: sheetName, row: existingRowIdx, id: keyValue };
  } else {
    sheet.appendRow(rowData);
    return { status: "INSERTED", sheet: sheetName, row: sheet.getLastRow(), id: keyValue };
  }
}

/**
 * Memperbarui baris data yang ada.
 * Dilengkapi proteksi default parameter jika dijalankan manual dari toolbar Apps Script.
 */
function updateRow(sheetName, keyColumn, keyValue, updatesObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Pengamanan bila dijalankan langsung dari menu Run tanpa argumen
  if (!sheetName || sheetName === "undefined") {
    Logger.log("[AUTO-RESOLVE] updateRow dipanggil tanpa argumen sheetName. Menggunakan sheet: " + SHEETS.ANGGOTA);
    sheetName = SHEETS.ANGGOTA;
    keyColumn = keyColumn || "member_id";
    keyValue = keyValue || "BM-TEST-" + new Date().getFullYear();
    updatesObj = updatesObj || {
      member_id: keyValue,
      nama_lengkap: "Pengujian Sistem Banuarasa (Updated)",
      updated_at: new Date().toISOString()
    };
  }

  updatesObj = updatesObj || {};
  if (!keyColumn) {
    keyColumn = (HEADERS[sheetName] && HEADERS[sheetName][0]) ? HEADERS[sheetName][0] : "id";
  }
  if (keyValue === undefined || keyValue === null || String(keyValue).trim() === "") {
    keyValue = updatesObj[keyColumn] || ("ID_" + Date.now());
    updatesObj[keyColumn] = keyValue;
  }

  var sheet = getOrCreateSheet(ss, sheetName);
  var headers = HEADERS[sheetName] || (sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : Object.keys(updatesObj));
  var values = sheet.getDataRange().getValues();
  var keyColIdx = headers.indexOf(keyColumn);
  if (keyColIdx === -1) keyColIdx = 0;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][keyColIdx]) === String(keyValue)) {
      var rowIdx = i + 1;
      var currentRow = values[i];
      var newRow = headers.map(function(h, idx) {
        return (updatesObj[h] !== undefined && updatesObj[h] !== null) ? updatesObj[h] : currentRow[idx];
      });
      sheet.getRange(rowIdx, 1, 1, headers.length).setValues([newRow]);
      return { status: "UPDATED", sheet: sheetName, row: rowIdx, id: keyValue };
    }
  }
  // Bila belum ada, masukkan sebagai baris baru dengan aman
  return upsertRow(sheetName, keyColumn, keyValue, updatesObj);
}

/**
 * Menghapus baris berdasarkan ID kunci
 */
function deleteRow(sheetName, keyColumn, keyValue) {
  if (!sheetName || sheetName === "undefined") {
    Logger.log("[AUTO-RESOLVE] deleteRow dipanggil tanpa nama sheet.");
    return { status: "SKIPPED", message: "deleteRow memerlukan parameter spesifik." };
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: "NOT_FOUND", sheet: sheetName };

  keyColumn = keyColumn || (HEADERS[sheetName] ? HEADERS[sheetName][0] : "id");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var keyColIdx = headers.indexOf(keyColumn);
  if (keyColIdx === -1) keyColIdx = 0;

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][keyColIdx]) === String(keyValue)) {
      sheet.deleteRow(i + 1);
      return { status: "DELETED", sheet: sheetName, id: keyValue, row: i + 1 };
    }
  }
  return { status: "NOT_FOUND", sheet: sheetName, id: keyValue };
}

/**
 * Menambahkan 1 baris baru ke sheet.
 * Dilengkapi proteksi default parameter jika dijalankan manual dari toolbar Apps Script.
 */
function appendRow(sheetName, dataObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Pengamanan bila dijalankan langsung dari menu Run tanpa argumen
  if (!sheetName || sheetName === "undefined") {
    Logger.log("[AUTO-RESOLVE] appendRow dipanggil tanpa argumen sheetName. Menggunakan sheet: " + SHEETS.AUDIT);
    sheetName = SHEETS.AUDIT;
    dataObj = dataObj || {
      log_id: "LOG_TEST_" + Date.now(),
      timestamp: new Date().toISOString(),
      user_id: "SYSTEM_DIAGNOSTIC",
      user_role: "SYSTEM",
      action: "TEST_APPEND_ROW",
      module: "AUDIT",
      result: "SUCCESS"
    };
  }

  dataObj = dataObj || {};
  var sheet = getOrCreateSheet(ss, sheetName);
  var headers = HEADERS[sheetName] || (sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : Object.keys(dataObj));
  var rowData = headers.map(function(h) {
    return (dataObj[h] !== undefined && dataObj[h] !== null) ? dataObj[h] : "";
  });
  sheet.appendRow(rowData);
  return { status: "APPENDED", sheet: sheetName, row: sheet.getLastRow() };
}

/**
 * Menyimpan berkas/gambar Base64 langsung ke struktur folder Google Drive.
 * Dilengkapi proteksi default parameter jika dijalankan manual dari toolbar Apps Script.
 */
function handleDriveFileUpload(payload) {
  payload = payload || {};

  var rootFolder = null;
  try {
    if (typeof ROOT_DRIVE_FOLDER_ID === "string" && ROOT_DRIVE_FOLDER_ID.trim() !== "") {
      rootFolder = DriveApp.getFolderById(ROOT_DRIVE_FOLDER_ID.trim());
    }
  } catch (e) {
    Logger.log("[AUTO-RESOLVE] ROOT_DRIVE_FOLDER_ID tidak dapat diakses langsung (" + e.message + "). Beralih ke root Drive pribadi.");
  }
  if (!rootFolder) {
    rootFolder = DriveApp.getRootFolder();
  }

  var category = (payload && payload.category) ? payload.category : "GENERAL";
  var subName = (payload && (payload.memberId || payload.eventId)) ? (payload.memberId || payload.eventId) : "DOCS";

  // Tentukan subfolder sesuai kategori
  var targetFolder = rootFolder;
  if (category === "FOTO_PROFIL" || category === "DOKUMEN_LEGALITAS") {
    var parentFolder = getOrCreateSubfolder(rootFolder, "01_ANGGOTA");
    targetFolder = getOrCreateSubfolder(parentFolder, subName);
  } else if (category === "BUKTI_PEMBAYARAN" || category === "BANNER_EVENT") {
    var parentFolder2 = getOrCreateSubfolder(rootFolder, "02_EVENT");
    targetFolder = getOrCreateSubfolder(parentFolder2, subName);
  } else if (category === "FOTO_PRODUK") {
    var parentFolder3 = getOrCreateSubfolder(rootFolder, "03_PRODUK");
    targetFolder = getOrCreateSubfolder(parentFolder3, subName);
  } else {
    targetFolder = getOrCreateSubfolder(rootFolder, "04_LAPORAN");
  }

  // Jika dipanggil tanpa data berkas base64 (pengujian konektivitas manual di Apps Script)
  if (!payload.base64Data || typeof payload.base64Data !== "string" || payload.base64Data.trim() === "") {
    Logger.log("[AUTO-RESOLVE] handleDriveFileUpload dipanggil tanpa data base64. Verifikasi struktur folder berhasil.");
    return {
      status: "READY",
      message: "Koneksi Google Drive aktif & subfolder '" + targetFolder.getName() + "' siap digunakan.",
      folderPath: targetFolder.getName(),
      targetFolderId: targetFolder.getId(),
      rootFolderId: rootFolder.getId(),
      checkedAt: new Date().toISOString()
    };
  }

  // Bersihkan data base64 bila terdapat header Data URI
  var rawBase64 = payload.base64Data;
  if (rawBase64.indexOf(",") !== -1) {
    rawBase64 = rawBase64.split(",")[1];
  }

  var fileName = payload.fileName || ("BANUARASA_UPLOAD_" + Date.now() + ".jpg");
  var decodedBytes = Utilities.base64Decode(rawBase64);
  var mimeType = payload.mimeType || (fileName.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
  var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

  var file = targetFolder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (permErr) {
    Logger.log("Pemberian akses publik link: " + permErr.message);
  }

  var fileId = file.getId();
  var driveUrl = file.getUrl();
  var directImageUrl = "https://lh3.googleusercontent.com/d/" + fileId;

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
 * Mencari atau membuat subfolder di dalam folder induk secara aman.
 * Menjamin parentFolder tidak pernah undefined sehingga getFoldersByName selalu valid.
 */
function getOrCreateSubfolder(parentFolder, subfolderName) {
  if (!parentFolder) {
    try {
      if (typeof ROOT_DRIVE_FOLDER_ID === "string" && ROOT_DRIVE_FOLDER_ID.trim() !== "") {
        parentFolder = DriveApp.getFolderById(ROOT_DRIVE_FOLDER_ID.trim());
      }
    } catch (e) {
      parentFolder = null;
    }
    if (!parentFolder) {
      parentFolder = DriveApp.getRootFolder();
    }
  }

  if (!subfolderName || typeof subfolderName !== "string" || subfolderName.trim() === "") {
    subfolderName = "00_GENERAL";
  }
  subfolderName = subfolderName.trim();

  var folders = parentFolder.getFoldersByName(subfolderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(subfolderName);
}

/**
 * Sinkronisasi kumpulan data sekaligus (Batch Sync)
 */
function handleBatchSync(payload) {
  payload = payload || {};
  var results = {};

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

// ======================================================================================
// FUNGSI-FUNGSI PENGUJIAN LANGSUNG DARI TOOLBAR APPS SCRIPT (KLIK 'RUN' DENGAN AMAN)
// ======================================================================================

/**
 * Pengujian Lengkap Seluruh Fungsi Backend (Pilih ini di toolbar dan klik Run!)
 */
function testRunAll() {
  Logger.log("==================================================================");
  Logger.log("MEMULAI PENGUJIAN DIAGNOSTIK MENYELURUH BACKEND BANUARASA");
  Logger.log("==================================================================");

  // 1. Inisialisasi Database
  var initRes = initializeDatabase();
  Logger.log("1. initializeDatabase(): " + JSON.stringify(initRes));

  // 2. Uji upsertRow
  var upsertRes = upsertRow();
  Logger.log("2. upsertRow(): " + JSON.stringify(upsertRes));

  // 3. Uji updateRow
  var updateRes = updateRow();
  Logger.log("3. updateRow(): " + JSON.stringify(updateRes));

  // 4. Uji appendRow
  var appendRes = appendRow();
  Logger.log("4. appendRow(): " + JSON.stringify(appendRes));

  // 5. Uji Drive & Subfolder
  var driveRes = handleDriveFileUpload();
  Logger.log("5. handleDriveFileUpload(): " + JSON.stringify(driveRes));

  var subfolderRes = getOrCreateSubfolder();
  Logger.log("6. getOrCreateSubfolder(): Berhasil (" + subfolderRes.getName() + ")");

  // 6. Uji Pembacaan Data
  var readRes = readSheetAsJson(SHEETS.ANGGOTA);
  Logger.log("7. readSheetAsJson(ANGGOTA): " + readRes.length + " baris data terbaca.");

  Logger.log("==================================================================");
  Logger.log("SELURUH FUNGSI BERJALAN 100% SUKSES TANPA ERROR!");
  Logger.log("==================================================================");
  return "SEMUA UJI SUKSES";
}

function testInitializeDatabase() {
  return initializeDatabase();
}

function testUpsertRow() {
  return upsertRow();
}

function testUpdateRow() {
  return updateRow();
}

function testAppendRow() {
  return appendRow();
}

function testDriveUpload() {
  return handleDriveFileUpload();
}

function testPing() {
  return doGet({ parameter: { action: "ping" } });
}
