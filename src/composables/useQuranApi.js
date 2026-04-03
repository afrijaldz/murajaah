import { ref } from 'vue'

const API_BASE = 'https://api.alquran.cloud/v1'
const ARABIC_EDITION = 'ar.alafasy'
const TRANSLATION_EDITION = 'id.indonesian'

async function fetchAllPages(endpoint) {
  const allAyahs = []
  let offset = 0
  while (true) {
    const url = `${API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}offset=${offset}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const json = await res.json()
    const ayahs = json.data.ayahs
    if (!ayahs || ayahs.length === 0) break
    allAyahs.push(...ayahs)
    if (ayahs.length < 128) break
    offset += ayahs.length
  }
  return allAyahs
}

function mergeAyahs(arabicAyahs, translationAyahs) {
  const translationMap = new Map()
  for (const ayah of translationAyahs) {
    translationMap.set(ayah.number, ayah.text)
  }

  return arabicAyahs.map(ayah => ({
    number: ayah.number,
    arabic: ayah.text,
    translation: translationMap.get(ayah.number) || '',
    audio: ayah.audio,
    numberInSurah: ayah.numberInSurah,
    juz: ayah.juz,
    surahNumber: ayah.surah?.number || ayah.surah,
    surahName: ayah.surah?.name || '',
    surahEnglishName: ayah.surah?.englishName || '',
  }))
}

export function useQuranApi() {
  const loading = ref(false)
  const error = ref(null)

  async function fetchAyahs(scopeType, scopeValue) {
    loading.value = true
    error.value = null

    try {
      const endpoint = scopeType === 'surah' ? '/surah' : '/juz'
      const [arabicAyahs, translationAyahs] = await Promise.all([
        fetchAllPages(`${endpoint}/${scopeValue}/${ARABIC_EDITION}`),
        fetchAllPages(`${endpoint}/${scopeValue}/${TRANSLATION_EDITION}`),
      ])

      return mergeAyahs(arabicAyahs, translationAyahs)
    } catch (err) {
      error.value = err.message || 'Gagal memuat ayat. Periksa koneksi internet.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchSurahList() {
    try {
      const res = await fetch(`${API_BASE}/surah`)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const json = await res.json()
      return json.data.map(s => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        englishNameTranslation: s.englishNameTranslation,
        numberOfAyahs: s.numberOfAyahs,
      }))
    } catch {
      return null
    }
  }

  return { fetchAyahs, fetchSurahList, loading, error }
}
