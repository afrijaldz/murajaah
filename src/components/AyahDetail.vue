<script setup>
defineProps({
  ayah: { type: Object, required: true },
  visible: { type: Boolean, default: false },
})
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
      <p class="font-amiri text-3xl font-bold leading-loose text-center" dir="rtl">{{ ayah.arabic }}</p>
      <hr class="my-4 border-[var(--color-border)]" />
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed text-center" dir="ltr">{{ ayah.translation }}</p>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
