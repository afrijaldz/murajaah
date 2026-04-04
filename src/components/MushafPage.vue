<script setup>
import { ref, watch } from 'vue'
import { useQuranApi } from '../composables/useQuranApi.js'

const FONT_URL = 'https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2'
let fontLoaded = false

const props = defineProps({
  pageNumber: { type: Number, required: true },
  highlightVerse: { type: String, default: '' },
})

const { fetchMushafPage } = useQuranApi()
const pageData = ref(null)
const loading = ref(false)
const cache = new Map()

async function loadFont() {
  if (fontLoaded) return
  try {
    const fontFace = new FontFace('UthmanicHafs', `url('${FONT_URL}')`)
    fontFace.display = 'swap'
    await fontFace.load()
    document.fonts.add(fontFace)
    fontLoaded = true
  } catch {
    // Font load failed — will use fallback serif
  }
}

async function loadPage(pageNum) {
  if (cache.has(pageNum)) {
    pageData.value = cache.get(pageNum)
    return
  }
  loading.value = true

  const [data] = await Promise.all([
    fetchMushafPage(pageNum),
    loadFont(),
  ])

  if (data) {
    cache.set(pageNum, data)
    pageData.value = data
  }
  loading.value = false
}

watch(() => props.pageNumber, (val) => loadPage(val), { immediate: true })

function isHighlighted(verseKey) {
  return verseKey === props.highlightVerse
}

function isDimmed(verseKey) {
  return props.highlightVerse && verseKey !== props.highlightVerse
}

</script>

<template>
  <div class="mushaf-page bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
    <!-- Page number -->
    <div class="text-center py-2">
      <span class="text-xs text-[var(--color-text-muted)]">
        Hal. {{ pageNumber }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block w-6 h-6 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Mushaf lines -->
    <div v-else-if="pageData" class="mushaf-content px-5 pb-5">
      <div
        v-for="line in pageData.lines"
        :key="line.lineNum"
        class="mushaf-line"
        dir="rtl"
      >
        <span
          v-for="(word, idx) in line.words"
          :key="idx"
          class="mushaf-word"
          :class="{
            'highlighted': isHighlighted(word.verseKey),
            'dimmed': isDimmed(word.verseKey),
            'verse-end': word.charType === 'end',
          }"
        >{{ word.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mushaf-content {
  max-width: 100%;
  margin: 0 auto;
}

.mushaf-line {
  text-align: center;
  direction: rtl;
  line-height: 2.6;
}

.mushaf-word {
  font-family: 'UthmanicHafs', 'Amiri', serif;
  font-size: 26px;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.mushaf-word.highlighted {
  color: var(--color-primary);
}

.mushaf-word.dimmed {
  opacity: 0.15;
}

.mushaf-word.verse-end {
  font-size: 18px;
  opacity: 0.6;
}


@media (max-width: 480px) {
  .mushaf-word {
    font-size: 20px;
  }
  .mushaf-word.verse-end {
    font-size: 14px;
  }
  .mushaf-line {
    line-height: 2.4;
  }
}
</style>
