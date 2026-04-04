import { ref } from 'vue'

const API_BASE = 'https://api.quran.com/api/v4'
const TRANSLATION_ID = 33 // Indonesian Islamic Affairs Ministry
const RECITER_ID = 7 // Mishary Alafasy
const AUDIO_BASE = 'https://verses.quran.com/'
const CLIENT_ID = import.meta.env.VITE_QURAN_CLIENT_ID || ''
const CLIENT_SECRET = import.meta.env.VITE_QURAN_CLIENT_SECRET || ''
const OAUTH_URL = import.meta.env.VITE_QURAN_OAUTH_URL || 'https://oauth2.quran.foundation'

let accessToken = null
let tokenExpiry = 0

async function getToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken
  if (!CLIENT_ID || !CLIENT_SECRET) return null

  try {
    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    const res = await fetch(`${OAUTH_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=content',
    })
    if (!res.ok) return null
    const data = await res.json()
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return accessToken
  } catch {
    // OAuth might fail due to CORS in browser — continue without auth
    return null
  }
}

function buildHeaders(token) {
  if (!token) return {}
  return { 'x-auth-token': token, 'x-client-id': CLIENT_ID }
}

async function fetchAllPages(url) {
  const token = await getToken()
  const headers = buildHeaders(token)
  const allVerses = []
  let page = 1
  while (true) {
    const separator = url.includes('?') ? '&' : '?'
    const res = await fetch(`${url}${separator}page=${page}&per_page=50`, { headers })
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
      page: v.page_number,
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
    const token = await getToken()
    const res = await fetch(`${API_BASE}/chapters?language=id`, { headers: buildHeaders(token) })
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
      const url = `${API_BASE}/verses/${endpoint}/${scopeValue}?language=id&translations=${TRANSLATION_ID}&fields=text_uthmani,page_number&audio=${RECITER_ID}`

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

  async function fetchMushafPage(pageNumber) {
    try {
      const token = await getToken()
      const headers = buildHeaders(token)
      const res = await fetch(
        `${API_BASE}/verses/by_page/${pageNumber}?language=id&words=true&word_fields=text_uthmani&translations=${TRANSLATION_ID}&fields=text_uthmani&per_page=50`,
        { headers }
      )
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const json = await res.json()

      // Build lines from word data
      const lines = new Map()
      for (const verse of json.verses) {
        for (const word of verse.words || []) {
          const lineNum = word.line_number
          if (!lines.has(lineNum)) lines.set(lineNum, [])
          lines.get(lineNum).push({
            text: word.text_uthmani || word.text,
            verseKey: verse.verse_key,
            charType: word.char_type_name,
            position: word.position,
          })
        }
      }

      // Convert to sorted array
      const sortedLines = [...lines.entries()]
        .sort(([a], [b]) => a - b)
        .map(([lineNum, words]) => ({ lineNum, words }))

      return {
        page: pageNumber,
        lines: sortedLines,
        verses: json.verses.map(v => v.verse_key),
      }
    } catch {
      return null
    }
  }

  return { fetchAyahs, fetchSurahList, fetchMushafPage, loading, error }
}
