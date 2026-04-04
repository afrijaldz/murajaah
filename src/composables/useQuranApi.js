import { ref } from 'vue'

const API_BASE = 'https://api.quran.com/api/v4'
const TRANSLATION_ID = 33 // Indonesian Islamic Affairs Ministry
const RECITER_ID = 7 // Mishary Alafasy
const AUDIO_BASE = 'https://verses.quran.com/'

async function fetchAllPages(url) {
  const allVerses = []
  let page = 1
  while (true) {
    const separator = url.includes('?') ? '&' : '?'
    const res = await fetch(`${url}${separator}page=${page}&per_page=50`)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const json = await res.json()

    const verses = json.verses
    if (!verses || verses.length === 0) break
    allVerses.push(...verses)

    if (!json.pagination || page >= json.pagination.total_pages) break
    page++
  }
  return allVerses
}

function mapVerses(verses, chapters) {
  const chapterMap = new Map()
  if (chapters) {
    for (const ch of chapters) {
      chapterMap.set(ch.id, ch)
    }
  }

  return verses.map(v => {
    const [surahNum, ayahNum] = v.verse_key.split(':').map(Number)
    const chapter = chapterMap.get(surahNum)
    const translation = v.translations?.[0]?.text || ''

    return {
      number: v.id,
      arabic: v.text_uthmani,
      translation: translation.replace(/<[^>]*>/g, ''),
      audio: v.audio?.url ? `${AUDIO_BASE}${v.audio.url}` : '',
      numberInSurah: ayahNum,
      juz: v.juz_number,
      surahNumber: surahNum,
      surahName: chapter?.name_arabic || '',
      surahEnglishName: chapter?.name_simple || '',
    }
  })
}

export function useQuranApi() {
  const loading = ref(false)
  const error = ref(null)
  const chaptersCache = ref(null)

  async function getChapters() {
    if (chaptersCache.value) return chaptersCache.value
    const res = await fetch(`${API_BASE}/chapters?language=id`)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const json = await res.json()
    chaptersCache.value = json.chapters
    return json.chapters
  }

  async function fetchAyahs(scopeType, scopeValue) {
    loading.value = true
    error.value = null

    try {
      const endpoint = scopeType === 'surah' ? 'by_chapter' : 'by_juz'
      const url = `${API_BASE}/verses/${endpoint}/${scopeValue}?language=id&translations=${TRANSLATION_ID}&fields=text_uthmani&audio=${RECITER_ID}`

      const [verses, chapters] = await Promise.all([
        fetchAllPages(url),
        getChapters(),
      ])

      return mapVerses(verses, chapters)
    } catch (err) {
      error.value = err.message || 'Gagal memuat ayat. Periksa koneksi internet.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchSurahList() {
    try {
      const chapters = await getChapters()
      return chapters.map(ch => ({
        number: ch.id,
        name: ch.name_arabic,
        englishName: ch.name_simple,
        englishNameTranslation: ch.translated_name?.name || '',
        numberOfAyahs: ch.verses_count,
      }))
    } catch {
      return null
    }
  }

  return { fetchAyahs, fetchSurahList, loading, error }
}
