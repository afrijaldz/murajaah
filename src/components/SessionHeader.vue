<script setup>
defineProps({
  surahName: String,
  surahEnglishName: String,
  numberInSurah: Number,
  juz: Number,
  progress: Number,
  total: Number,
})
defineEmits(['back'])
</script>

<template>
  <div class="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <button
        @click="$emit('back')"
        class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        &larr; Kembali
      </button>
      <span class="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg)] px-2 py-1 rounded-full">
        Ayat {{ progress }} dari {{ total }}
      </span>
    </div>

    <div class="text-center">
      <p class="text-xs text-[var(--color-text-muted)]">Juz {{ juz }}</p>
      <p class="font-amiri text-lg mt-3 mb-1">{{ surahName }}</p>
      <p class="text-2xl font-bold">{{ surahEnglishName }} : {{ numberInSurah }}</p>
    </div>

    <!-- Progress bar -->
    <div class="mt-3 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
      <div
        class="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
        :style="{ width: `${(progress / total) * 100}%` }"
      ></div>
    </div>
  </div>
</template>
