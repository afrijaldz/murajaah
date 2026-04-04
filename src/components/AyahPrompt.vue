<script setup>
import { computed } from 'vue'
import { getHintWords } from '../utils/bismillah.js'
import MushafPage from './MushafPage.vue'

const props = defineProps({
  ayah: { type: Object, required: true },
  mode: { type: String, required: true },
  showHint: { type: Boolean, default: false },
})

const hintText = computed(() => {
  if (!props.showHint || props.mode !== 'quiz') return ''
  return getHintWords(props.ayah.arabic, props.ayah.surahNumber, props.ayah.numberInSurah)
})

const verseKey = computed(() => `${props.ayah.surahNumber}:${props.ayah.numberInSurah}`)
</script>

<template>
  <div class="py-4">
    <!-- Quiz mode: show mushaf page with hint -->
    <div v-if="mode === 'quiz'">
      <p class="text-[var(--color-text-muted)] text-sm mb-4 text-center">Apa ayat ini?</p>

      <!-- Mushaf hint: show page with only the target verse highlighted -->
      <div v-if="showHint && ayah.page">
        <MushafPage :page-number="ayah.page" :highlight-verse="verseKey" />
      </div>

      <!-- Text hint fallback when mushaf hint is off -->
      <div v-else-if="showHint && hintText" class="text-center mt-4">
        <p class="text-xs text-[var(--color-text-muted)] mb-2">Petunjuk:</p>
        <p class="font-amiri text-3xl font-bold leading-relaxed" dir="rtl">{{ hintText }}...</p>
      </div>
    </div>

    <!-- Review mode: show mushaf page with full context -->
    <div v-else>
      <MushafPage
        v-if="ayah.page"
        :page-number="ayah.page"
        :highlight-verse="verseKey"
      />
      <div v-else>
        <p class="font-amiri text-3xl font-bold leading-loose text-center" dir="rtl">{{ ayah.arabic }}</p>
        <p class="mt-4 text-sm text-[var(--color-text-muted)] leading-relaxed text-center" dir="ltr">{{ ayah.translation }}</p>
      </div>
    </div>
  </div>
</template>
