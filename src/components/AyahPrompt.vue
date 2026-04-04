<script setup>
import { computed } from 'vue'
import MushafPage from './MushafPage.vue'

const props = defineProps({
  ayah: { type: Object, required: true },
  mode: { type: String, required: true }, // 'quiz' | 'review'
  showHint: { type: Boolean, default: false },
  showDetail: { type: Boolean, default: false },
})

const verseKey = computed(() => `${props.ayah.surahNumber}:${props.ayah.numberInSurah}`)

const mushafMode = computed(() => {
  if (props.mode === 'review') return 'reveal'
  // Quiz mode
  if (props.showDetail) return 'reveal'
  if (props.showHint) return 'hint'
  return null
})
</script>

<template>
  <div class="py-4">
    <!-- Quiz mode -->
    <div v-if="mode === 'quiz'">
      <p class="text-[var(--color-text-muted)] text-sm mb-4 text-center">Apa ayat ini?</p>

      <!-- Hint ON: mushaf page with blank text, 1 word visible -->
      <!-- Tampilkan: mushaf page full text, highlighted -->
      <MushafPage
        v-if="mushafMode && ayah.page"
        :page-number="ayah.page"
        :highlight-verse="verseKey"
        :mode="mushafMode"
      />
    </div>

    <!-- Review mode: full mushaf page with highlight -->
    <div v-else>
      <MushafPage
        v-if="ayah.page"
        :page-number="ayah.page"
        :highlight-verse="verseKey"
        mode="reveal"
      />
      <div v-else>
        <p class="font-amiri text-3xl font-bold leading-loose text-center" dir="rtl">{{ ayah.arabic }}</p>
        <p class="mt-4 text-sm text-[var(--color-text-muted)] leading-relaxed text-center" dir="ltr">{{ ayah.translation }}</p>
      </div>
    </div>
  </div>
</template>
