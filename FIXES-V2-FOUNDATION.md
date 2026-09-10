# Banuarasa V2 Foundation — Fixed

Perbaikan yang diterapkan tanpa mengubah konsep utama aplikasi:
1. Memperbaiki export/import `googleWorkspaceSync` yang menyebabkan build gagal.
2. Menambahkan bridge Google Apps Script yang konsisten, termasuk alias nama sheet lama -> nama sheet V2.
3. Memperbaiki format payload frontend -> Apps Script (`data`).
4. Menambahkan operasi generic `upsertRow`, `updateRow`, dan `deleteRow` pada `Code.gs`.
5. Memperbaiki autentikasi UI agar menggunakan `storage.login()` dan tipe `AuthUser` yang sudah dipakai aplikasi.
6. Memperbaiki kontrak data `Member` pada pendaftaran anggota.
7. Menambahkan kompatibilitas `saveMember()` dan `logActivity()` untuk komponen lama.
8. Memperbaiki harga/kode 64 stand pada endpoint public server sesuai aturan A-J, 1-43, 44-54.
9. Menghapus dependensi `cors` yang tidak dipakai dari server.
10. Menambahkan konstanta URL Spreadsheet dan Drive yang memang dipakai `AdminDashboard`.

Catatan verifikasi:
- Struktur dan error TypeScript yang berasal dari kode aplikasi sudah diaudit setelah patch.
- Build penuh belum dapat dieksekusi di lingkungan pemeriksaan ini karena `node_modules` tidak tersedia dan instalasi paket melalui npm mengalami timeout jaringan.
- Jalankan `bun install` lalu `bun run build` di Google AI Studio/lingkungan lokal setelah ZIP ini dibuka.
