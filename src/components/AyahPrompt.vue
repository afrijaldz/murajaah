<script setup>
import { computed } from 'vue'
import { getHintWords } from '../utils/bismillah.js'

const props = defineProps({
  ayah: { type: Object, required: true },
  mode: { type: String, required: true },
  showHint: { type: Boolean, default: false },
})

const hintText = computed(() => {
  if (!props.showHint || props.mode !== 'quiz') return ''
  return getHintWords(props.ayah.arabic, props.ayah.surahNumber, props.ayah.numberInSurah)
})
</script>

<template>
  <div class="text-center py-6">
    <!-- Quiz mode: show info + optional hint -->
    <div v-if="mode === 'quiz'">
      <p class="text-[var(--color-text-muted)] text-sm mb-6">Apa ayat ini?</p>
      <div v-if="showHint && hintText" class="mt-4">
        <p class="text-xs text-[var(--color-text-muted)] mb-2">Petunjuk:</p>
        <p class="font-amiri text-2xl leading-relaxed" dir="rtl">{{ hintText }}...</p>
      </div>
    </div>

    <!-- Review mode: show full ayah -->
    <div v-else>
      <p class="font-amiri text-2xl leading-loose" dir="rtl">{{ ayah.arabic }}</p>
      <p class="mt-4 text-sm text-[var(--color-text-muted)] leading-relaxed" dir="ltr">{{ ayah.translation }}</p>
    </div>
  </div>
</template>
