<script setup>
defineProps({
  total: { type: Number, required: true },
})
defineEmits(['restart', 'changeSetting'])
</script>

<template>
  <div class="text-center py-12">
    <div class="text-5xl mb-4">&#127881;</div>
    <h2 class="text-xl font-bold text-[var(--color-primary)] mb-2">Selesai!</h2>
    <p class="text-sm text-[var(--color-text-muted)] mb-8">
      Kamu telah menyelesaikan {{ total }} ayat. MasyaAllah!
    </p>
    <div class="flex gap-3 justify-center">
      <button
        @click="$emit('restart')"
        class="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors"
      >
        Ulangi
      </button>
      <button
        @click="$emit('changeSetting')"
        class="px-6 py-2.5 bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors"
      >
        Ganti Setting
      </button>
    </div>
  </div>
</template>
