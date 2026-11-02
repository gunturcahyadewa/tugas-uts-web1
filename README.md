# Rak Pustaka - Aplikasi Pemesanan Buku Online

Tugas UTS Pemrograman Web 1. Aplikasi web pemesanan buku untuk toko online, dibuat dengan **HTML, CSS, dan JavaScript** murni. Proyek ini berfokus pada sisi front-end, sehingga tidak memakai server atau database. Seluruh data awal diambil dari variabel pada file `js/data.js`.

## Identitas

| | |
|---|---|
| Nama | Guntur Cahyadewangga |
| NIM | 312510265 |
| Kelas | I251C |
| Mata kuliah | Pemrograman Web 1 |

## Video Penjelasan

Video penjelasan proyek (maksimal 15 menit): **[https://youtu.be/j3g97ojC444]**

Dokumen ini mengikuti urutan penjelasan pada video, ditambah penjelasan kode tiap halaman.

## Daftar Isi

1. [Pembukaan](#1-pembukaan)
2. [Struktur Folder](#2-struktur-folder-dan-alasannya)
3. [Data pada data.js](#3-data-pada-datajs)
4. [HTML Semantik](#4-html-semantik)
5. [CSS: Inline, Internal, Eksternal](#5-css-inline-internal-eksternal)
6. [Halaman Login](#6-halaman-login)
7. [Dashboard](#7-dashboard)
8. [Informasi Stok](#8-informasi-stok)
9. [Pemesanan](#9-pemesanan)
10. [Tracking Pengiriman](#10-tracking-pengiriman)
11. [Penutup](#11-penutup)
12. [Cara Menjalankan](#cara-menjalankan)

## 1. Pembukaan

Rak Pustaka adalah toko buku online fiktif. Pengguna dapat masuk ke akun, melihat stok katalog, membuat pesanan, dan melacak pengiriman dengan nomor Delivery Order. Aplikasi terdiri dari lima halaman: login, dashboard, stok, pemesanan, dan tracking.

Proyek ini dibuat untuk memenuhi tiga indikator penilaian:

1. Merancang struktur HTML yang semantik dan valid.
2. Mengelola gaya antarmuka dengan CSS (inline, internal, dan external).
3. Menggunakan JavaScript untuk manipulasi DOM, validasi form, manipulasi data tabel, dan interaksi UI (pop-up, modal box, alert box).

## 2. Struktur Folder dan Alasannya

```
tugas-uts-web1/
|-- index.html          (halaman login)
|-- dashboard.html
|-- stok.html
|-- checkout.html
|-- tracking.html
|-- README.md
|-- css/
|   |-- style.css
|-- js/
|   |-- script.js
|   |-- data.js
|-- assets/
|   |-- logo.png        (opsional)
|-- img/
    |-- (gambar sampul buku)
```

Struktur mengikuti soal. Pemisahan folder menerapkan pemisahan tanggung jawab: HTML untuk struktur, CSS untuk tampilan, JavaScript untuk perilaku, dan data dipisah supaya mudah diganti tanpa menyentuh logika. Halaman login diberi nama `index.html` karena menjadi halaman pertama yang dibuka, dan halaman pemesanan diberi nama `checkout.html`.

Alur kerja secara umum:

```
data.js  -->  script.js  -->  halaman HTML  -->  tampilan (style.css)
(data awal)   (logika)        (struktur)
                 |
                 v
            localStorage (data tambahan: pengguna baru, buku baru, pesanan)
```

## 3. Data pada data.js

`js/data.js` berisi tiga variabel:

| Variabel | Bentuk | Dipakai untuk |
|---|---|---|
| `dataPengguna` | array of object | Login dan pendaftaran |
| `dataKatalogBuku` | array of object | Halaman stok dan pemesanan |
| `dataTracking` | object dengan kunci nomor DO | Halaman tracking |

Karena bentuknya berbeda, cara mengambil datanya juga berbeda. Array dibaca dengan `.find()` atau `.forEach()`, sedangkan object dibaca langsung dengan `dataTracking[nomor]`.

Harga pada data berbentuk teks (misalnya `"Rp 180.000"`), sehingga tidak bisa dijumlahkan. Fungsi `parseRp` di `script.js` membuang semua karakter bukan angka lalu mengubahnya menjadi angka. Fungsi `katalogAwal` memakainya untuk menyiapkan data katalog, dan fungsi `rupiah` memformat angka kembali ke bentuk Rp saat ditampilkan.

## 4. HTML Semantik

Struktur halaman memakai tag semantik, bukan `div` untuk semuanya:

- `header` untuk bagian atas, `nav` untuk menu, `main` untuk isi utama, `section` untuk tiap blok konten, dan `footer` di bawah.
- Tabel memakai `thead` dan `tbody`.
- Setiap input punya `label` yang terhubung lewat atribut `for` dan `id`.

Semua halaman memiliki atribut `data-page` pada tag `body`. Atribut ini menandai halaman yang sedang terbuka, sehingga satu file `script.js` dapat melayani semua halaman. Bagian paling bawah file memilih fungsi yang sesuai (`initLogin`, `initDashboard`, `initStok`, `initCheckout`, atau `initTracking`).

## 5. CSS: Inline, Internal, Eksternal

Ketiga cara CSS dipakai:

| Jenis | Lokasi | Contoh |
|---|---|---|
| Inline | `index.html` | Atribut `style` pada paragraf |
| Internal | `index.html` | Blok `<style>` di dalam `<head>` untuk gaya khusus login |
| Eksternal | `css/style.css` | Dipakai oleh semua halaman |

Pada `style.css`, warna dan font disimpan sebagai variabel CSS di `:root`, sehingga tema dapat diganti dari satu tempat. Tata letak memakai flexbox dan grid, dengan media query agar tampilan menyesuaikan layar kecil. Tema toko buku memakai hijau tua untuk navigasi serta kuning dan merah bata sebagai aksen.

## 6. Halaman Login

File: `index.html`. Fungsi: `initLogin`.

Saat form dikirim, `preventDefault()` mencegah halaman refresh. Email dan password divalidasi lebih dulu (format email dan kolom tidak kosong), dengan pesan error di bawah kolom. Jika valid, program mencari pengguna di `dataPengguna` memakai `.find()`. Jika tidak cocok, muncul `alert` berisi "Email/password yang anda masukkan salah". Jika cocok, data pengguna disimpan di `localStorage` dengan nama `userAktif`, lalu halaman pindah ke dashboard.

Tombol **Lupa Password** dan **Daftar** membuka modal box. Modal adalah elemen `div` yang disembunyikan dengan CSS dan ditampilkan dengan menambah class `open`. Pengguna baru dari modal Daftar ditambahkan ke array dan disimpan, sehingga dapat dipakai untuk login.

## 7. Dashboard

File: `dashboard.html`. Fungsi: `initDashboard`.

Greeting dihitung dari `new Date().getHours()`: pukul 05.00 sampai 10.59 pagi, 11.00 sampai 14.59 siang, 15.00 sampai 17.59 sore, selain itu malam. Terdapat empat tombol menu sesuai soal. Karena soal meminta lima halaman, **Laporan Pemesanan** mengarah ke halaman pemesanan dan **History Transaksi** mengarah ke halaman tracking.

Setiap halaman selain login memeriksa `userAktif` saat dibuka. Pengguna yang belum login diarahkan kembali ke halaman login, dan tombol Keluar menghapus data tersebut.

## 8. Informasi Stok

File: `stok.html`. Fungsi: `initStok`.

Tabel katalog dibuat secara dinamis dari `dataKatalogBuku`, tanpa baris tabel yang ditulis manual di HTML. Fungsi `render()` mengosongkan `tbody`, lalu membuat elemen `tr` untuk tiap buku dengan `createElement` dan memasukkannya dengan `appendChild`. Status stok berubah otomatis: Tersedia, Menipis (di bawah 200), dan Habis (nol). Kolom pencarian memanggil `render()` ulang dengan filter.

Form tambah buku memvalidasi kode (wajib dan tidak boleh sama dengan yang sudah ada), judul, jenis, edisi, harga, dan stok sebelum menambahkan baris baru. Data tersimpan di `localStorage`, sehingga tidak hilang saat halaman di-refresh. Buku tanpa gambar menampilkan kotak berisi huruf pertama judul.

## 9. Pemesanan

File: `checkout.html`. Fungsi: `initCheckout`.

Halaman terdiri dari dua bagian. Bagian pertama untuk memilih buku dan jumlah. Daftar pilihan dibuat dari katalog, dan buku yang stoknya nol tidak ditampilkan. Item masuk ke array `keranjang`; tiap baris memiliki tombol **Ubah** dan **Hapus**, dan total dihitung otomatis dengan `reduce`. Jumlah yang melebihi stok ditolak dengan pesan error.

Bagian kedua adalah data pemesan dan pembayaran: nama, nomor HP (divalidasi dengan regular expression), alamat (minimal 10 karakter), ekspedisi, dan metode pembayaran. Jika semua valid, program membuat nomor Delivery Order, menyimpan pesanan, dan menampilkan modal berisi nomor tersebut. Nomor itu dapat dipakai di halaman tracking.

## 10. Tracking Pengiriman

File: `tracking.html`. Fungsi: `initTracking`.

Pengguna memasukkan nomor Delivery Order lalu menekan **Cari**. Program mengambil data dengan `dataTracking[nomor]`; jika tidak ada, program mencari di pesanan yang dibuat dari halaman pemesanan. Hasil yang ditampilkan: nama pemesan, status pengiriman (progress bar), ekspedisi, tanggal kirim, jenis paket, total pembayaran, dan riwayat perjalanan paket.

Status dari data berupa teks (misalnya "Dalam Perjalanan"). Fungsi `posisi` mengubahnya menjadi tahap 0 sampai 3, lalu lebar progress bar dihitung dari tahap tersebut. Nomor yang tidak ditemukan menampilkan pesan bahwa nomor tidak ditemukan.

Nomor untuk mencoba: `20230012` dan `20230013`.

## 11. Penutup

Ringkasan yang dicapai:

- HTML dibuat semantik dan lengkap.
- CSS memakai inline, internal, dan eksternal dengan tema yang konsisten.
- JavaScript memanipulasi DOM, mengelola data, memvalidasi form, serta menampilkan alert dan modal.
- File dipisah dan modular: satu `script.js` dengan fungsi terpisah untuk tiap halaman.

Fitur tambahan: pencarian katalog, sesi login yang tersimpan, riwayat perjalanan paket, status stok otomatis, dan tampilan responsif.

Keterbatasan: data tambahan (pengguna baru, buku baru, pesanan) hanya tersimpan di `localStorage` browser karena tidak ada backend, dan JavaScript di browser tidak dapat menulis ke file `data.js`. Pada pengembangan lebih lanjut, bagian ini dapat diganti dengan API dan database. Untuk mengembalikan data awal, hapus data situs lewat DevTools (F12 > Application > Clear site data).

## Cara Menjalankan

1. Unduh atau clone repository ini.
2. Buka file `index.html` di browser (Chrome, Edge, atau Firefox). Tidak perlu instalasi apa pun.
3. Login dengan salah satu akun uji berikut.

| Email | Password | Role |
|---|---|---|
| rina@gmail.com | rina123 | User |
| agus@gmail.com | agus123 | User |
| siti@gmail.com | siti123 | Admin |

Font diambil dari Google Fonts sehingga membutuhkan internet; tanpa internet, font cadangan sistem dipakai.
