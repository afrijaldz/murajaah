<script setup>
import { ref } from 'vue'
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

        <!-- Action buttons -->
        <div class="flex items-center justify-center gap-3 mt-6">
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
