<script setup>
import { ref, watch, computed } from 'vue'
import { useQuranApi } from '../composables/useQuranApi.js'

const FONT_URL = 'https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2'
let fontLoaded = false

const props = defineProps({
  pageNumber: { type: Number, required: true },
  highlightVerse: { type: String, default: '' },
  // 'hint' = all blank, show 1 word + location highlight
  // 'reveal' = full text visible, highlight location
  // 'full' = full text, no highlight (review mode)
  mode: { type: String, default: 'full' },
})

const { fetchMushafPage } = useQuranApi()
const pageData = ref(null)
const loading = ref(false)
const cache = new Map()

// Track the first word of the highlighted verse by unique ID
const firstWordId = computed(() => {
  if (!pageData.value || !props.highlightVerse) return null
  for (const line of pageData.value.lines) {
    for (const word of line.words) {
      if (word.verseKey === props.highlightVerse && word.charType !== 'end') {
        return word.id
      }
    }
  }
  return null
})

async function loadFont() {
  if (fontLoaded) return
  try {
    const fontFace = new FontFace('UthmanicHafs', `url('${FONT_URL}')`)
    fontFace.display = 'swap'
    await fontFace.load()
    document.fonts.add(fontFace)
    fontLoaded = true
  } catch {}
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

function wordClass(word) {
  const isTarget = word.verseKey === props.highlightVerse
  const isFirstWord = word.id === firstWordId.value

  if (props.mode === 'hint') {
    // Hint: everything invisible except first word of target verse
    if (isFirstWord) return 'hint-visible'
    if (isTarget && word.charType !== 'end') return 'hint-highlight-bg'
    return 'hint-hidden'
  }

  if (props.mode === 'reveal') {
    // Reveal: target verse normal color, others dimmed
    if (isTarget) return 'reveal-target'
    return 'dimmed'
  }

  // Full: all visible, target highlighted
  if (isTarget) return 'highlighted'
  return ''
}
</script>

<template>
  <div class="mushaf-page bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
    <div class="text-center py-2">
      <span class="text-xs text-[var(--color-text-muted)]">
        Hal. {{ pageNumber }}
      </span>
    </div>

    <div v-if="loading" class="text-center py-16">
      <div class="inline-block w-6 h-6 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>

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
          :class="[
            wordClass(word),
            { 'verse-end': word.charType === 'end' },
          ]"
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
  transition: all 0.2s;
  white-space: nowrap;
}

/* Hint mode: all text invisible */
.mushaf-word.hint-hidden {
  color: transparent;
}

/* Hint mode: target verse area shown as subtle background */
.mushaf-word.hint-highlight-bg {
  color: transparent;
  background: var(--color-primary);
  opacity: 0.08;
  border-radius: 4px;
}

/* Hint mode: first word visible */
.mushaf-word.hint-visible {
  color: var(--color-primary);
  font-weight: bold;
}

/* Reveal mode: target verse stands out, others dimmed */
.mushaf-word.reveal-target {
  color: var(--color-primary);
}

.mushaf-word.dimmed {
  opacity: 0.2;
}

/* Full / Review mode: highlighted verse */
.mushaf-word.highlighted {
  color: var(--color-primary);
}

.mushaf-word.verse-end {
  font-size: 18px;
}

.mushaf-word.hint-hidden.verse-end,
.mushaf-word.hint-highlight-bg.verse-end {
  background: none;
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
