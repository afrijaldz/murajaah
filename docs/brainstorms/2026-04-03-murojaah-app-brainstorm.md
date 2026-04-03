# Brainstorm: Aplikasi Murojaah Al-Quran

**Date:** 2026-04-03
**Status:** Draft

## What We're Building

Aplikasi web untuk murojaah (review hafalan) Al-Quran. User memilih scope hafalan (per Juz atau per Surat), memilih mode tampilan, lalu menjalani sesi murojaah ayat per ayat.

**Target user:** Penghafal Al-Quran (review hafalan) dan pelajar (proses menghafal).

**Fokus utama:** Hafal ayat per ayat, hafal nomor ayat, nama surat, dan juz berapa.

## Tech Stack

- **Framework:** Vite + Vue 3 (Composition API)
- **Styling:** Tailwind CSS
- **API:** AlQuran Cloud API (`https://api.alquran.cloud/v1/`)
- **State:** Reactive state (ref/reactive), tidak pakai Pinia — app cukup sederhana
- **Storage:** Tidak ada persistent storage — tanpa tracking/statistik

## Core Features

### 1. Setting / Konfigurasi Sesi

User mengatur sesi murojaah sebelum mulai:

- **Scope:** Pilih salah satu:
  - Per **Juz** (pilih nomor juz: 1-30)
  - Per **Surat** (pilih nama surat dari dropdown: 1-114)
- **Urutan:** Random atau urut (sequential)
- **Mode tampilan:** Pilih salah satu:
  - **Quiz mode** — Tampilkan "Juz X — Nama Surat : No. Ayat", user harus ingat ayatnya. Toggle opsional: tampilkan 3 kata awal sebagai hint. Tombol Show menampilkan ayat lengkap + terjemahan.
  - **Review mode** — Tampilkan ayat Arab lengkap + terjemahan langsung terlihat (mode review santai). Tombol Show tidak muncul.

### 2. Sesi Murojaah

Setelah setting dikonfigurasi, user masuk ke mode murojaah:

- Tampilkan prompt sesuai mode yang dipilih
- Info yang selalu terlihat: **Nama Surat**, **Nomor Ayat**, **Juz berapa**
- **Tombol "Show"** — Tampilkan ayat lengkap (teks Arab + terjemahan) ketika user lupa
- **Tombol "Play Audio"** — Putar audio ayat (menggunakan edition audio seperti `ar.alafasy`)
- **Tombol "Next"** — Lanjut ke ayat berikutnya (random atau urut sesuai setting)
- **End of session** — Ketika ayat terakhir tercapai, tampilkan pesan "Selesai!" dengan pilihan: "Ulangi" atau "Ganti Setting"

### 3. Konten Ayat (saat di-Show)

- Teks Arab (font besar, mudah dibaca)
- Terjemahan (Bahasa Indonesia jika tersedia, fallback ke English)
- Audio playback

## API Usage

| Kebutuhan | Endpoint | Contoh |
|-----------|----------|--------|
| Ambil ayat per surat | `/v1/surah/{number}/ar.alafasy` | `/v1/surah/2/ar.alafasy` |
| Ambil ayat per juz | `/v1/juz/{number}/ar.alafasy` | `/v1/juz/30/ar.alafasy` |
| Terjemahan Indonesia | `/v1/surah/{number}/{edition}` | Edition code TBD (lihat Open Questions) |
| Daftar edition | `/v1/edition/language/id` | Cari edition Indonesia |
| Audio | Sudah include di response audio edition | Field `audio` di ayah |

**Strategi fetch:** Fetch semua ayat untuk scope yang dipilih di awal sesi (1 request per edition). Cache di memory, navigasi ayat tanpa network request tambahan.

## Architecture

**Single Page App** — satu halaman dengan 2 state:

1. **Config state** — form setting muncul saat awal atau saat user ingin ganti setting
2. **Murojaah state** — layar murojaah dengan ayat, tombol show/next/audio

Tidak perlu Vue Router — cukup conditional rendering dengan `v-if`.

### Component Structure

```
App.vue
├── ConfigPanel.vue      — Form setting (scope, mode, urutan)
├── MurojaahView.vue     — Layar utama murojaah
│   ├── AyahPrompt.vue   — Tampilan prompt sesuai mode
│   ├── AyahDetail.vue   — Ayat lengkap + terjemahan (show/hide)
│   └── AudioPlayer.vue  — Tombol play audio
```

## Key Decisions

1. **SPA tanpa router** — App cukup sederhana, tidak butuh routing
2. **Fetch semua data di awal sesi** — Menghindari loading per ayat, navigasi instan
3. **Tanpa persistent storage** — Tidak ada tracking, statistik, atau history
4. **Pilih scope spesifik** (Juz 30 / Surat Al-Mulk), bukan rentang
5. **2 mode tampilan** — Quiz mode (dengan hint opsional) dan Review mode
6. **Info konteks selalu terlihat** — Nama surat, nomor ayat, juz selalu ditampilkan
7. **Web font Arab** — Pakai Amiri atau Scheherazade untuk readability optimal
8. **Mobile-first design** — Desain utama untuk layar kecil, responsif ke desktop

## Open Questions

1. **Edition terjemahan Indonesia** — Perlu cek API apakah ada edition `id.indonesian` atau code lain untuk terjemahan bahasa Indonesia

## Resolved Questions

1. **Font Arab** — Pakai web font khusus (Amiri/Scheherazade) untuk readability Al-Quran
2. **Responsif / Mobile** — Mobile-first design, responsif ke desktop
3. **Jumlah kata hint** — Mode "Awal ayat" pakai 3 kata pertama sebagai hint opsional (toggle on/off)
4. **End of session** — Tampilkan pesan "Selesai!" dengan pilihan "Ulangi" atau "Ganti Setting"
