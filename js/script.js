// ===== HELPER =====
const $ = (id) => document.getElementById(id);
const rupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const parseRp = (s) => (typeof s === "number" ? s : Number(String(s).replace(/\D/g, "")));
const simpan = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const ambil = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
const halaman = document.body.dataset.page;
const userAktif = ambil("userAktif", null);
const emailValid = (s) => /^\S+@\S+\.\S+$/.test(s);

// Data dari data.js dosen diubah ke bentuk yang dipakai aplikasi (harga jadi angka)
const katalogAwal = () => dataKatalogBuku.map((b) => ({
  kode: b.kodeBarang, judul: b.namaBarang, jenis: b.jenisBarang,
  edisi: b.edisi, harga: parseRp(b.harga), stok: b.stok, cover: b.cover
}));

// Tampilkan/hapus pesan error di bawah input. Mengembalikan true jika valid.
function tampilError(idInput, pesan) {
  const el = $(idInput + "Err");
  if (el) el.textContent = pesan;
  $(idInput)?.classList.toggle("invalid", !!pesan);
  return !pesan;
}
const bukaModal = (id) => $(id).classList.add("open");
const tutupModal = (id) => $(id).classList.remove("open");
const pasangTutupModal = () =>
  document.querySelectorAll("[data-tutup]").forEach((b) => b.addEventListener("click", () => tutupModal(b.dataset.tutup)));

// Guard: semua halaman selain login butuh login
if (halaman !== "login") {
  if (!userAktif) location.href = "index.html";
  $("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("userAktif");
    location.href = "index.html";
  });
  if ($("namaUser") && userAktif) $("namaUser").textContent = userAktif.nama + " (" + (userAktif.role || "User") + ")";
}

// ===== LOGIN =====
function initLogin() {
  const users = () => ambil("penggunaV2", dataPengguna);

  $("formLogin").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("email").value.trim();
    const pass = $("password").value;
    let ok = tampilError("email", emailValid(email) ? "" : "Format email tidak valid.");
    ok = tampilError("password", pass ? "" : "Password wajib diisi.") && ok;
    if (!ok) return;
    const user = users().find((u) => u.email === email && u.password === pass);
    if (!user) { alert("Email/password yang anda masukkan salah"); return; }
    simpan("userAktif", user);
    location.href = "dashboard.html";
  });

  $("btnLupa").addEventListener("click", () => bukaModal("modalLupa"));
  $("btnDaftar").addEventListener("click", () => bukaModal("modalDaftar"));
  pasangTutupModal();

  $("formLupa").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("emailLupa").value.trim();
    if (!tampilError("emailLupa", emailValid(email) ? "" : "Format email tidak valid.")) return;
    const ada = users().some((u) => u.email === email);
    alert(ada ? "Tautan reset password telah dikirim ke " + email : "Email belum terdaftar.");
    if (ada) tutupModal("modalLupa");
  });

  $("formDaftar").addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = $("namaDaftar").value.trim();
    const email = $("emailDaftar").value.trim();
    const pass = $("passDaftar").value;
    let ok = tampilError("namaDaftar", nama ? "" : "Nama wajib diisi.");
    ok = tampilError("emailDaftar", emailValid(email) ? "" : "Format email tidak valid.") && ok;
    ok = tampilError("passDaftar", pass.length >= 6 ? "" : "Password minimal 6 karakter.") && ok;
    if (!ok) return;
    const daftar = users();
    if (daftar.some((u) => u.email === email)) { alert("Email sudah terdaftar."); return; }
    daftar.push({ id: daftar.length + 1, nama, email, password: pass, role: "User" });
    simpan("penggunaV2", daftar);
    alert("Pendaftaran berhasil! Silakan login.");
    e.target.reset();
    tutupModal("modalDaftar");
  });
}

// ===== DASHBOARD =====
function initDashboard() {
  const jam = new Date().getHours();
  let sapa = "Selamat malam";
  if (jam >= 5 && jam < 11) sapa = "Selamat pagi";
  else if (jam >= 11 && jam < 15) sapa = "Selamat siang";
  else if (jam >= 15 && jam < 18) sapa = "Selamat sore";
  $("greeting").textContent = sapa + ", " + userAktif.nama + "!";
  $("tanggal").textContent = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ===== STOK =====
function initStok() {
  const katalog = ambil("katalogV2", katalogAwal());
  const tbody = $("tbodyStok");

  const badgeStok = (s) =>
    s === 0 ? '<span class="badge habis">Habis</span>'
    : s < 200 ? '<span class="badge tipis">Menipis</span>'
    : '<span class="badge aman">Tersedia</span>';

  // Gambar sampul; kalau tidak ada, tampilkan kotak berisi huruf pertama judul
  const gambarCover = (b) => b.cover
    ? `<img class="cover" src="${b.cover}" alt="Sampul ${b.judul}">`
    : `<span class="cover kosong">${b.judul.charAt(0)}</span>`;

  function render(filter = "") {
    tbody.innerHTML = "";
    const data = katalog.filter((b) => (b.judul + b.jenis + b.kode).toLowerCase().includes(filter.toLowerCase()));
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="8" class="kosong">Buku tidak ditemukan.</td></tr>'; return; }
    data.forEach((b) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${gambarCover(b)}${b.kode}</td>
        <td>${b.judul}</td><td>${b.jenis}</td><td>${b.edisi}</td>
        <td>${rupiah(b.harga)}</td><td>${b.stok}</td><td>${badgeStok(b.stok)}</td>
        <td><button class="btn kecil bahaya" data-hapus="${b.kode}">Hapus</button></td>`;
      tbody.appendChild(tr);
    });
  }
  render();

  $("cari").addEventListener("input", (e) => render(e.target.value));
  tbody.addEventListener("click", (e) => {
    const kode = e.target.dataset.hapus;
    if (kode && confirm("Hapus buku " + kode + " dari katalog?")) {
      katalog.splice(katalog.findIndex((b) => b.kode === kode), 1);
      simpan("katalogV2", katalog);
      render($("cari").value);
    }
  });

  // Tambah baris stok baru (DOM)
  $("formStok").addEventListener("submit", (e) => {
    e.preventDefault();
    const kode = $("kode").value.trim().toUpperCase();
    const judul = $("judul").value.trim();
    const jenis = $("jenis").value.trim();
    const edisi = $("edisi").value.trim();
    const harga = Number($("harga").value);
    const stokRaw = $("stok").value;
    const stok = Number(stokRaw);
    let ok = tampilError("kode", !kode ? "Kode wajib diisi." : katalog.some((b) => b.kode === kode) ? "Kode sudah dipakai." : "");
    ok = tampilError("judul", judul ? "" : "Judul wajib diisi.") && ok;
    ok = tampilError("jenis", jenis ? "" : "Jenis wajib diisi.") && ok;
    ok = tampilError("edisi", edisi ? "" : "Edisi wajib diisi.") && ok;
    ok = tampilError("harga", harga > 0 ? "" : "Harga harus lebih dari 0.") && ok;
    ok = tampilError("stok", stokRaw !== "" && Number.isInteger(stok) && stok >= 0 ? "" : "Stok harus angka 0 atau lebih.") && ok;
    if (!ok) return;
    katalog.push({ kode, judul, jenis, edisi, harga, stok, cover: "" });
    simpan("katalogV2", katalog);
    render();
    e.target.reset();
    alert('Buku "' + judul + '" berhasil ditambahkan.');
  });
}

// ===== CHECKOUT =====
function initCheckout() {
  const katalog = ambil("katalogV2", katalogAwal());
  let keranjang = ambil("keranjang", []);
  let indexEdit = -1;

  $("pilihBuku").innerHTML = '<option value="">-- Pilih buku --</option>' +
    katalog.filter((b) => b.stok > 0).map((b) => `<option value="${b.kode}">${b.judul} - Edisi ${b.edisi} (${rupiah(b.harga)})</option>`).join("");

  function render() {
    const tbody = $("tbodyKeranjang");
    tbody.innerHTML = keranjang.length ? "" : '<tr><td colspan="5" class="kosong">Pesanan masih kosong. Pilih buku di atas.</td></tr>';
    keranjang.forEach((item, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${item.judul}</td><td>${rupiah(item.harga)}</td><td>${item.jumlah}</td>
        <td>${rupiah(item.harga * item.jumlah)}</td>
        <td><button class="btn kecil" data-ubah="${i}">Ubah</button> <button class="btn kecil bahaya" data-hapus="${i}">Hapus</button></td>`;
      tbody.appendChild(tr);
    });
    $("totalBayar").textContent = rupiah(keranjang.reduce((t, x) => t + x.harga * x.jumlah, 0));
    $("btnTambah").textContent = indexEdit >= 0 ? "Simpan perubahan" : "Tambah ke pesanan";
    simpan("keranjang", keranjang);
  }
  render();

  $("formItem").addEventListener("submit", (e) => {
    e.preventDefault();
    const buku = katalog.find((b) => b.kode === $("pilihBuku").value);
    const jml = Number($("jumlah").value);
    let ok = tampilError("pilihBuku", buku ? "" : "Pilih buku terlebih dahulu.");
    const pesanJumlah = !(jml >= 1 && Number.isInteger(jml)) ? "Jumlah minimal 1." : buku && jml > buku.stok ? "Stok hanya " + buku.stok + "." : "";
    ok = tampilError("jumlah", pesanJumlah) && ok;
    if (!ok) return;
    const item = { kode: buku.kode, judul: buku.judul, harga: buku.harga, jumlah: jml };
    if (indexEdit >= 0) { keranjang[indexEdit] = item; indexEdit = -1; }
    else {
      const ada = keranjang.find((x) => x.kode === buku.kode);
      if (ada) ada.jumlah += jml; else keranjang.push(item);
    }
    e.target.reset();
    render();
  });

  $("tbodyKeranjang").addEventListener("click", (e) => {
    const { ubah, hapus } = e.target.dataset;
    if (ubah !== undefined) {
      indexEdit = Number(ubah);
      $("pilihBuku").value = keranjang[indexEdit].kode;
      $("jumlah").value = keranjang[indexEdit].jumlah;
      render();
      $("jumlah").focus();
    }
    if (hapus !== undefined) { keranjang.splice(Number(hapus), 1); indexEdit = -1; render(); }
  });

  $("formPesan").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!keranjang.length) { alert("Tambahkan minimal satu buku ke pesanan."); return; }
    const nama = $("nama").value.trim(), hp = $("hp").value.trim(), alamat = $("alamat").value.trim();
    const ekspedisi = $("ekspedisi").value, bayar = $("bayar").value;
    let ok = tampilError("nama", nama ? "" : "Nama pemesan wajib diisi.");
    ok = tampilError("hp", /^(08|\+628)\d{8,11}$/.test(hp) ? "" : "Nomor HP tidak valid (contoh: 08123456789).") && ok;
    ok = tampilError("alamat", alamat.length >= 10 ? "" : "Alamat minimal 10 karakter.") && ok;
    ok = tampilError("ekspedisi", ekspedisi ? "" : "Pilih ekspedisi.") && ok;
    ok = tampilError("bayar", bayar ? "" : "Pilih metode pembayaran.") && ok;
    if (!ok) return;
    const nomorDO = Date.now().toString().slice(-8);
    const sekarang = new Date();
    const pesanan = ambil("pesananV2", []);
    pesanan.push({
      nomorDO, nama, status: "Diproses", ekspedisi,
      tanggalKirim: sekarang.toISOString().slice(0, 10),
      paket: keranjang.length + " jenis buku",
      total: rupiah(keranjang.reduce((t, x) => t + x.harga * x.jumlah, 0)),
      perjalanan: [{ waktu: sekarang.toLocaleString("id-ID"), keterangan: "Pesanan dibuat dan sedang diproses" }]
    });
    simpan("pesananV2", pesanan);
    keranjang = []; indexEdit = -1;
    $("noDOBaru").textContent = nomorDO;
    bukaModal("modalSukses");
    e.target.reset();
    render();
  });
  pasangTutupModal();
}

// ===== TRACKING =====
function initTracking() {
  const langkah = ["Diproses", "Dikemas", "Dalam Pengiriman", "Diterima"];
  // Ubah status teks dari data menjadi posisi pada progress bar (0-3)
  function posisi(d) {
    const akhir = d.perjalanan?.[d.perjalanan.length - 1]?.keterangan || "";
    if (/^selesai/i.test(akhir) || d.status === "Terkirim") return 3;
    if (d.status === "Dikirim" || d.status === "Dalam Perjalanan") return 2;
    if (d.status === "Dikemas") return 1;
    return 0;
  }

  $("formCari").addEventListener("submit", (e) => {
    e.preventDefault();
    const no = $("noDO").value.trim();
    if (!tampilError("noDO", no ? "" : "Masukkan nomor Delivery Order.")) return;
    const hasil = dataTracking[no] || ambil("pesananV2", []).find((d) => d.nomorDO === no);
    const box = $("hasil");
    if (!hasil) { box.innerHTML = `<p class="kosong">Nomor <strong>${no}</strong> tidak ditemukan. Coba 20230012.</p>`; return; }
    const pos = posisi(hasil);
    const persen = Math.round((pos / 3) * 100);
    box.innerHTML = `
      <h2>DO ${hasil.nomorDO}</h2>
      <p class="status-teks">${hasil.status}</p>
      <div class="progress" role="progressbar" aria-valuenow="${persen}" aria-valuemin="0" aria-valuemax="100"><div style="width:${persen}%"></div></div>
      <ol class="langkah">${langkah.map((l, i) => `<li class="${i <= pos ? "selesai" : ""}">${l}</li>`).join("")}</ol>
      <dl class="detail">
        <dt>Nama pemesan</dt><dd>${hasil.nama}</dd>
        <dt>Ekspedisi</dt><dd>${hasil.ekspedisi}</dd>
        <dt>Tanggal kirim</dt><dd>${new Date(hasil.tanggalKirim).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</dd>
        <dt>Jenis paket</dt><dd>${hasil.paket}</dd>
        <dt>Total pembayaran</dt><dd>${hasil.total}</dd>
      </dl>
      <h3 style="margin-top:1.5rem">Riwayat perjalanan</h3>
      <ul class="riwayat">${hasil.perjalanan.map((p) => `<li><time>${p.waktu}</time><span>${p.keterangan}</span></li>`).join("")}</ul>`;
  });
}

({ login: initLogin, dashboard: initDashboard, stok: initStok, checkout: initCheckout, tracking: initTracking })[halaman]?.();
