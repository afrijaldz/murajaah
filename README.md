# Murojaah

Aplikasi web untuk murojaah (review hafalan) Al-Quran. Pilih surat atau juz, lalu review ayat satu per satu.

## Fitur

- **Quiz Mode** — Tampilkan info surat dan nomor ayat, ingat ayatnya dari hafalan. Opsional: hint 3 kata awal.
- **Review Mode** — Tampilkan ayat Arab lengkap beserta terjemahan.
- **Audio** — Dengarkan bacaan setiap ayat (Mishary Alafasy).
- **Pilih Surat atau Juz** — Searchable dropdown untuk 114 surat, atau pilih juz 1-30.
- **Urutan Acak / Urut** — Shuffle ayat secara random atau review berurutan.
- **Mobile-first** — Dioptimalkan untuk layar HP.

## Tech Stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [AlQuran Cloud API](https://alquran.cloud/api)
- [Amiri](https://fonts.google.com/specimen/Amiri) web font

## Setup

```bash
git clone https://github.com/afrijaldz/murajaah.git
cd murajaah
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

## Build

```bash
npm run build
npm run preview
```

## Kontribusi

Kontribusi sangat diterima! Berikut cara berkontribusi:

1. **Fork** repo ini
2. **Clone** fork kamu:
   ```bash
   git clone https://github.com/<username-kamu>/murajaah.git
   ```
3. Buat **branch** baru:
   ```bash
   git checkout -b feat/fitur-baru
   ```
4. Lakukan perubahan, pastikan build berhasil:
   ```bash
   npm run build
   ```
5. **Commit** dengan pesan yang jelas:
   ```bash
   git commit -m "feat: deskripsi singkat perubahan"
   ```
6. **Push** dan buat **Pull Request**:
   ```bash
   git push origin feat/fitur-baru
   ```

### Ide Kontribusi

- Tambah dark mode
- Simpan progress di localStorage
- Pilih qari (reciter) selain Alafasy
- Tambah transliterasi Latin
- Deploy ke Vercel / Netlify
- Perbaiki bug atau improve UI/UX

### Panduan

- Gunakan [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, dll.)
- Pastikan `npm run build` berjalan tanpa error sebelum submit PR
- Satu PR untuk satu fitur/perbaikan

## Lisensi

MIT
