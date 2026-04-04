<script setup>
import { ref, watch, computed } from 'vue'
import { useQuranApi } from '../composables/useQuranApi.js'

const props = defineProps({
  pageNumber: { type: Number, required: true },
  highlightVerse: { type: String, default: '' }, // e.g. "2:255"
})

const { fetchMushafPage } = useQuranApi()
const pageData = ref(null)
const loading = ref(false)
const cache = new Map()

async function loadPage(pageNum) {
  if (cache.has(pageNum)) {
    pageData.value = cache.get(pageNum)
    return
  }
  loading.value = true
  const data = await fetchMushafPage(pageNum)
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
    <div v-else-if="pageData" class="mushaf-content space-y-1">
      <div
        v-for="line in pageData.lines"
        :key="line.lineNum"
        class="mushaf-line flex justify-center gap-[3px] flex-wrap"
        dir="rtl"
      >
        <span
          v-for="(word, idx) in line.words"
          :key="idx"
          class="font-amiri text-xl leading-[2.2] transition-opacity duration-200"
          :class="{
            'text-[var(--color-primary)] font-bold': isHighlighted(word.verseKey),
            'opacity-25': isDimmed(word.verseKey),
            'text-[var(--color-accent)] text-sm align-super': word.charType === 'end',
          }"
        >{{ word.text }}</span>
      </div>
    </div>
  </div>
</template>
