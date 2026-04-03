---
title: "feat: Murojaah Quran Review App"
type: feat
status: active
date: 2026-04-03
---

# feat: Murojaah Quran Review App

## Overview

Aplikasi web untuk murojaah (review hafalan) Al-Quran. User memilih scope (Juz atau Surat), mode (Quiz atau Review), urutan (random atau sequential), lalu me-review ayat satu per satu. Fokus utama: hafal ayat, hafal nomor ayat, nama surat, dan juz berapa.

Brainstorm: `docs/brainstorms/2026-04-03-murojaah-app-brainstorm.md`

## Tech Stack

- **Vite + Vue 3** (Composition API, `<script setup>`)
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, no config file)
- **Amiri** web font (Google Fonts, for Arabic text)
- **AlQuran Cloud API** (`https://api.alquran.cloud/v1/`)
- No Vue Router, no Pinia, no persistent storage

## Proposed Solution

Single Page App dengan 2 view state: **Config** dan **Murojaah**, diswitch via `v-if`. Semua data ayat di-fetch saat sesi dimulai (2 request: Arabic+audio dan terjemahan), di-cache di memory, navigasi tanpa network request tambahan.

## Technical Considerations

### API Strategy

**Editions yang digunakan:**
- Arabic + Audio: `ar.alafasy` (Mishary Alafasy, returns text + audio URLs)
- Terjemahan: `id.indonesian` (Bahasa Indonesia)

**Endpoints:**
- Per Surah: `/v1/surah/{number}/{edition}` — returns all ayahs in one request
- Per Juz: `/v1/juz/{number}/{edition}` — **paginated, max ~128 ayahs per page**, gunakan `?offset=N` untuk halaman berikutnya

**Juz pagination strategy:**
Juz endpoint mengembalikan max ~128 ayahs per request. Untuk juz besar (Juz 30 = 564 ayahs), perlu loop fetch:
```
offset=0   → ayah 1-128
offset=128 → ayah 129-248
offset=248 → ayah 249-376
...sampai response kosong atau jumlah ayah < 128
```
Fetch semua page, concat hasilnya, lalu merge dengan terjemahan (yang juga di-paginate sama).

**Merge strategy:** Match ayah dari 2 edition berdasarkan field `number` (global ayah number, konsisten antar edition).

**Ayah object fields (dari API):**
```json
{
  "number": 6236,        // global ayah number
  "text": "...",          // Arabic text atau terjemahan
  "numberInSurah": 6,    // posisi dalam surat
  "juz": 30,
  "audio": "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3",
  "surah": { "number": 114, "name": "سُورَةُ النَّاسِ", "englishName": "An-Naas" }
}
```

### Bismillah Handling

API prepends Bismillah ke teks ayah 1 untuk sebagian besar surat. Untuk hint 3 kata di Quiz mode:
- **Al-Fatiha (1):** Bismillah IS ayah 1 — tampilkan as-is
- **At-Tawbah (9):** Tidak ada Bismillah — tampilkan as-is
- **Surat lainnya:** Strip Bismillah (`بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ`) dari awal teks ayah 1 sebelum mengambil 3 kata hint

### RTL Handling

- Arabic text: `dir="rtl"` pada container
- Translation (Indonesian): `dir="ltr"`
- Layout keseluruhan: LTR (controls, labels di Bahasa Indonesia/English)

### Audio

- Gunakan native HTML `<audio>` element
- Play/pause controls
- Auto-stop saat tekan "Next"
- Tidak perlu preload ayat berikutnya (fetch on demand saat play)

## Architecture

### Component Structure

```
src/
├── App.vue                    — Root, switch antara Config dan Murojaah
├── components/
│   ├── ConfigPanel.vue        — Form setting (scope, mode, urutan)
│   ├── SurahSearch.vue        — Searchable surah dropdown (114 items)
│   ├── MurojaahView.vue       — Layar utama murojaah
│   │   ├── SessionHeader.vue  — Info surat/ayat/juz + progress + tombol kembali
│   │   ├── AyahPrompt.vue     — Tampilan prompt sesuai mode
│   │   ├── AyahDetail.vue     — Ayat lengkap + terjemahan (show/hide)
│   │   └── AudioPlayer.vue    — Play/pause audio
│   └── SessionComplete.vue    — Layar "Selesai!" + pilihan ulangi/ganti
├── composables/
│   ├── useQuranApi.js         — Fetch + merge logic (Arabic, translation, pagination)
│   └── useSession.js          — Session state (current ayah, navigation, shuffle)
├── utils/
│   └── bismillah.js           — Strip Bismillah helper
└── style.css                  — Tailwind import + Amiri font + @theme
```

### State Flow

```
[ConfigPanel] --start--> [useQuranApi.fetch()] --loaded--> [useSession.init(ayahs)]
                                                                    |
                                                          [MurojaahView]
                                                           |    |    |
                                                         show  next  audio
                                                           |    |
                                                    [AyahDetail] [next ayah or SessionComplete]
```

### Data Model (in-memory)

```js
// useSession composable
const config = ref({
  scopeType: 'surah',     // 'surah' | 'juz'
  scopeValue: 1,          // surah number (1-114) or juz number (1-30)
  mode: 'quiz',           // 'quiz' | 'review'
  order: 'sequential',    // 'sequential' | 'random'
  showHint: false,        // toggle 3-word hint (quiz mode only)
})

const ayahs = ref([])     // merged array of { arabic, translation, audio, surahName, numberInSurah, juz }
const currentIndex = ref(0)
const showDetail = ref(false)
const isComplete = ref(false)
```

## Implementation Phases

### Phase 1: Project Setup + Config UI

- [ ] Scaffold Vite + Vue 3 project (`npm create vite@latest murajaah -- --template vue`)
- [ ] Install Tailwind CSS v4 (`npm install tailwindcss @tailwindcss/vite`)
- [ ] Configure `vite.config.js` with Vue + Tailwind plugins
- [ ] Setup `src/style.css` with Tailwind import, Amiri font, `@theme` config
- [ ] Build `ConfigPanel.vue` — scope selector (Juz/Surat radio), mode selector, order selector, hint toggle
- [ ] Build `SurahSearch.vue` — searchable dropdown with 114 surahs (filter by name as user types). Surah list fetched from `/v1/surah` at app init and cached.
- [ ] Wire up `App.vue` — show ConfigPanel, handle "Start" button. Preserve config selections when returning via "Ganti Setting".

**Files:** `vite.config.js`, `src/style.css`, `src/App.vue`, `src/components/ConfigPanel.vue`, `src/components/SurahSearch.vue`

### Phase 2: API Integration

- [ ] Build `useQuranApi.js` composable:
  - `fetchSurah(number)` — fetch Arabic+audio + Indonesian translation, merge by `number`
  - `fetchJuz(number)` — same but with pagination loop (offset-based)
  - Return merged ayah array + loading + error state
- [ ] Build `bismillah.js` — `stripBismillah(text)` utility
- [ ] Add loading state UI (spinner + "Memuat ayat...")
- [ ] Add error state UI (pesan error + tombol "Coba Lagi")

**Files:** `src/composables/useQuranApi.js`, `src/utils/bismillah.js`

### Phase 3: Murojaah Session

- [ ] Build `useSession.js` composable:
  - Init with ayah array + config
  - Fisher-Yates shuffle for random mode
  - `next()` — advance to next ayah, reset `showDetail` to false, set `isComplete` at end
  - `toggleShow()` — reveal detail (quiz mode), one-way per ayah (resets on next)
  - `restart()` — reset index (re-shuffle if random)
- [ ] Build `MurojaahView.vue` — main session layout
- [ ] Build `SessionHeader.vue` — surah name, ayah number, juz, progress counter ("Ayat X dari Y"), tombol "Kembali"
- [ ] Build `AyahPrompt.vue`:
  - Quiz mode: show surah/ayah/juz info, optionally 3-word hint
  - Review mode: show full Arabic text + translation
- [ ] Build `AyahDetail.vue` — full Arabic text + translation (toggled by Show button)
- [ ] Build `AudioPlayer.vue` — HTML `<audio>` with play/pause, auto-stop on next
- [ ] Build `SessionComplete.vue` — "Selesai!" + "Ulangi" / "Ganti Setting" buttons

**Files:** `src/composables/useSession.js`, `src/components/MurojaahView.vue`, `src/components/SessionHeader.vue`, `src/components/AyahPrompt.vue`, `src/components/AyahDetail.vue`, `src/components/AudioPlayer.vue`, `src/components/SessionComplete.vue`

### Phase 4: Polish

- [ ] Mobile-first responsive styling (font sizes, spacing, touch targets)
- [ ] Arabic text styling (Amiri font, large size, RTL direction, proper line-height)
- [ ] Keyboard support (arrow right / space for Next, Enter for Show)
- [ ] Test all 12 config permutations (2 scope x 2 mode x 2 order + hint toggle)
- [ ] Test edge cases: Al-Fatiha (Bismillah = ayah 1), At-Tawbah (no Bismillah), Al-Baqarah (286 ayahs), Juz 30 (pagination)

## Acceptance Criteria

- [ ] User dapat memilih scope (Juz 1-30 atau Surat 1-114 via searchable dropdown)
- [ ] User dapat memilih mode (Quiz / Review), urutan (Random / Sequential), dan hint toggle
- [ ] Quiz mode: tampilkan info surat/ayat/juz, opsional hint 3 kata, tombol Show menampilkan ayat + terjemahan
- [ ] Review mode: tampilkan ayat Arab + terjemahan langsung
- [ ] Audio playback dengan play/pause, auto-stop saat Next
- [ ] Progress counter "Ayat X dari Y" selalu terlihat
- [ ] Tombol "Kembali" untuk keluar sesi kapan saja
- [ ] End of session: pesan "Selesai!" + pilihan Ulangi / Ganti Setting
- [ ] Loading state saat fetch API, error state + retry saat gagal
- [ ] Bismillah di-strip dari hint ayah 1 (kecuali Al-Fatiha)
- [ ] Mobile-first responsive layout
- [ ] Arabic text menggunakan Amiri font, RTL direction

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Juz API pagination | Perlu multiple requests, slower load | Loop fetch dengan offset, show loading progress |
| AlQuran Cloud API downtime | App tidak bisa digunakan | Error state + retry button, pesan jelas ke user |
| Bismillah inconsistency di API | Hint 3 kata bisa salah | Unit test `stripBismillah` dengan berbagai format |
| Mobile keyboard overlap | Form tertutup keyboard | Scroll into view, proper viewport meta |

## References & Research

- AlQuran Cloud API: `https://alquran.cloud/api`
- Indonesian edition: `id.indonesian` (confirmed available)
- Audio edition: `ar.alafasy` (Mishary Alafasy, 128kbps MP3)
- Tailwind CSS v4 Vite plugin: `@tailwindcss/vite`
- Amiri font: Google Fonts `https://fonts.googleapis.com/css2?family=Amiri`
- Brainstorm: `docs/brainstorms/2026-04-03-murojaah-app-brainstorm.md`
