<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
})

const audioRef = ref(null)
const isPlaying = ref(false)

function toggle() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
}

function stop() {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
  isPlaying.value = false
}

watch(() => props.src, () => {
  stop()
})

defineExpose({ stop })
</script>

<template>
  <div>
    <audio
      ref="audioRef"
      :src="src"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="isPlaying = false"
      preload="none"
    ></audio>
    <button
      @click="toggle"
      class="px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors"
      :class="isPlaying
        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
        : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'"
    >
      {{ isPlaying ? 'Pause' : 'Play Audio' }}
    </button>
  </div>
</template>
