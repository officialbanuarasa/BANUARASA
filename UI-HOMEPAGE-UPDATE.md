# Homepage UX Update

Perubahan homepage dibuat konservatif, tanpa mengganti arsitektur atau alur aplikasi yang sudah ada.

## UX yang ditambahkan
- Area **Mulai di sini** tepat setelah carousel produk.
- 4 jalur utama berbasis ikon: Pesan Stand, Cari Produk, Jadi Anggota, Jadwal & Lokasi.
- Tombol **Menu lainnya** membuka dropdown berisi informasi tambahan: Wisata Gastronomi, Kenali Bara, Tentang Koperasi, dan Panduan Pemula.
- Dropdown menyediakan tombol **Lihat semua fitur aplikasi** untuk menuju seluruh menu fitur.
- Semua aksi menggunakan handler yang sudah ada (`onOpenStandMap`, `onOpenAuthModal`, `openEditorial`, dan scroll ke menu fitur), sehingga tidak membuat sistem navigasi baru.
- Responsif untuk desktop dan mobile.

## Prinsip desain
1. Pengguna baru melihat tindakan utama sebelum membaca informasi panjang.
2. Menu primer hanya 4 pilihan agar tidak terasa penuh.
3. Informasi sekunder dipindahkan ke dropdown.
4. Ikon + label pendek dipakai sebagai petunjuk visual.
5. Tidak mengubah database, API, autentikasi, atau struktur halaman lain.
