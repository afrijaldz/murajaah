<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SessionHeader from './SessionHeader.vue'
import AyahPrompt from './AyahPrompt.vue'
import AyahDetail from './AyahDetail.vue'
import AudioPlayer from './AudioPlayer.vue'
import SessionComplete from './SessionComplete.vue'

const props = defineProps({
  session: { type: Object, required: true },
  config: { type: Object, required: true },
})
const emit = defineEmits(['back', 'restart', 'changeSetting'])

const audioPlayerRef = ref(null)

function handleNext() {
  audioPlayerRef.value?.stop()
  props.session.next()
}

function handleKeydown(e) {
  if (props.session.isComplete.value) return
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault()
    handleNext()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (props.config.mode === 'quiz' && !props.session.showDetail.value) {
      props.session.show()
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div>
    <!-- Session Complete -->
    <SessionComplete
      v-if="session.isComplete.value"
      :total="session.total.value"
      @restart="$emit('restart')"
      @change-setting="$emit('changeSetting')"
    />

    <!-- Active Session -->
    <template v-else-if="session.currentAyah.value">
      <SessionHeader
        :surah-name="session.currentAyah.value.surahName"
        :surah-english-name="session.currentAyah.value.surahEnglishName"
        :number-in-surah="session.currentAyah.value.numberInSurah"
        :juz="session.currentAyah.value.juz"
        :progress="session.progress.value"
        :total="session.total.value"
        @back="$emit('back')"
      />

      <div class="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
        <AyahPrompt
          :ayah="session.currentAyah.value"
          :mode="config.mode"
          :show-hint="config.showHint"
        />

        <!-- Show detail (Quiz mode only) -->
        <AyahDetail
          v-if="config.mode === 'quiz'"
          :ayah="session.currentAyah.value"
          :visible="session.showDetail.value"
        />

        <!-- Hint toggle (Quiz mode only) -->
        <div v-if="config.mode === 'quiz'" class="flex items-center justify-center gap-2 mt-4">
          <button
            @click="config.showHint = !config.showHint"
            class="text-xs px-3 py-1.5 rounded-full border transition-colors"
            :class="config.showHint
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)] border-[var(--color-border)]'"
          >
            {{ config.showHint ? 'Hint: ON' : 'Hint: OFF' }}
          </button>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-center gap-3 mt-4">
          <button
            v-if="config.mode === 'quiz' && !session.showDetail.value"
            @click="session.show()"
            class="px-5 py-2.5 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Tampilkan
          </button>

          <AudioPlayer
            ref="audioPlayerRef"
            :src="session.currentAyah.value.audio"
          />

          <button
            @click="handleNext"
            class="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors"
          >
            Lanjut
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
