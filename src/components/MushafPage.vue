<script setup>
import { ref, watch } from 'vue'
import { useQuranApi } from '../composables/useQuranApi.js'

const QCF_CDN = 'https://verses.quran.foundation/fonts/quran/hafs/v2/woff2'
const loadedFonts = new Set()

const props = defineProps({
  pageNumber: { type: Number, required: true },
  highlightVerse: { type: String, default: '' },
})

const { fetchMushafPage } = useQuranApi()
const pageData = ref(null)
const loading = ref(false)
const fontReady = ref(false)
const cache = new Map()

async function loadFont(pageNum) {
  const fontName = `p${pageNum}-v2`
  if (loadedFonts.has(fontName)) return fontName
  try {
    const fontFace = new FontFace(fontName, `url('${QCF_CDN}/p${pageNum}.woff2')`)
    fontFace.display = 'block'
    await fontFace.load()
    document.fonts.add(fontFace)
    loadedFonts.add(fontName)
  } catch {
    // Font load failed — will use fallback
  }
  return fontName
}

async function loadPage(pageNum) {
  if (cache.has(pageNum)) {
    pageData.value = cache.get(pageNum)
    fontReady.value = loadedFonts.has(`p${pageNum}-v2`)
    if (!fontReady.value) {
      await loadFont(pageNum)
      fontReady.value = true
    }
    return
  }
  loading.value = true
  fontReady.value = false

  const [data] = await Promise.all([
    fetchMushafPage(pageNum),
    loadFont(pageNum),
  ])

  if (data) {
    cache.set(pageNum, data)
    pageData.value = data
  }
  fontReady.value = true
  loading.value = false
}

watch(() => props.pageNumber, (val) => loadPage(val), { immediate: true })

function isHighlighted(verseKey) {
  return verseKey === props.highlightVerse
}

function isDimmed(verseKey) {
  return props.highlightVerse && verseKey !== props.highlightVerse
}

function fontFamily(pageNum) {
  return fontReady.value ? `p${pageNum}-v2` : 'serif'
}
</script>

<template>
  <div class="mushaf-page bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 overflow-hidden">
    <!-- Page number -->
    <div class="text-center mb-3">
      <span class="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg)] px-3 py-1 rounded-full">
        Hal. {{ pageNumber }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      <div class="inline-block w-6 h-6 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Mushaf lines -->
    <div v-else-if="pageData" class="mushaf-content space-y-0">
      <div
        v-for="line in pageData.lines"
        :key="line.lineNum"
        class="mushaf-line flex justify-center gap-0 flex-wrap"
        dir="rtl"
      >
        <span
          v-for="(word, idx) in line.words"
          :key="idx"
          class="leading-[2.5] transition-opacity duration-200 inline"
          :class="{
            'text-[var(--color-primary)]': isHighlighted(word.verseKey),
            'opacity-20': isDimmed(word.verseKey),
          }"
          :style="{ fontFamily: word.charType === 'end' ? 'serif' : fontFamily(pageNumber), fontSize: word.charType === 'end' ? '16px' : '28px' }"
          v-html="word.code"
        ></span>
      </div>
    </div>
  </div>
</template>
