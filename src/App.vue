<script setup>
import { ref, reactive } from 'vue'
import ConfigPanel from './components/ConfigPanel.vue'
import MurojaahView from './components/MurojaahView.vue'
import { useQuranApi } from './composables/useQuranApi.js'
import { useSession } from './composables/useSession.js'

const appState = ref('config') // 'config' | 'loading' | 'session'

const config = reactive({
  scopeType: 'surah',
  scopeValue: 1,
  mode: 'quiz',
  order: 'sequential',
  showHint: false,
  ayahFrom: null,
  ayahTo: null,
})

const { fetchAyahs, loading, error } = useQuranApi()
const session = useSession()

async function startSession(userConfig) {
  Object.assign(config, userConfig)
  appState.value = 'loading'

  let ayahs = await fetchAyahs(config.scopeType, config.scopeValue)
  if (ayahs && config.ayahFrom && config.ayahTo) {
    ayahs = ayahs.filter(a => a.numberInSurah >= config.ayahFrom && a.numberInSurah <= config.ayahTo)
  }
  if (ayahs && ayahs.length > 0) {
    session.init(ayahs, config)
    appState.value = 'session'
  } else {
    appState.value = 'config'
  }
}

function backToConfig() {
  appState.value = 'config'
}

function restart() {
  session.restart()
}

function retry() {
  startSession(config)
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <div class="max-w-lg mx-auto px-4 py-6">
      <header class="text-center mb-6">
        <h1 class="text-2xl font-bold text-[var(--color-primary)]">Murojaah</h1>
        <p class="text-sm text-[var(--color-text-muted)]">Review Hafalan Al-Quran</p>
      </header>

      <ConfigPanel
        v-if="appState === 'config'"
        :initial-config="config"
        @start="startSession"
      />

      <div v-else-if="appState === 'loading'" class="text-center py-20">
        <div class="inline-block w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-[var(--color-text-muted)]">Memuat ayat...</p>
        <p v-if="error" class="mt-4 text-red-600 text-sm">{{ error }}</p>
        <button v-if="error" @click="retry" class="mt-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm">
          Coba Lagi
        </button>
      </div>

      <MurojaahView
        v-else-if="appState === 'session'"
        :session="session"
        :config="config"
        @back="backToConfig"
        @restart="restart"
        @change-setting="backToConfig"
      />

      <footer class="text-center mt-8 pb-4 flex items-center justify-center gap-3 text-xs text-[var(--color-text-muted)]">
        <span>v1</span>
        <span>&middot;</span>
        <a href="https://murajaah.afrijal.dev" target="_blank" rel="noopener" class="hover:text-[var(--color-text)] transition-colors">
          v2
        </a>
        <span>&middot;</span>
        <a href="https://github.com/afrijaldz/murajaah" target="_blank" rel="noopener" class="hover:text-[var(--color-text)] transition-colors">
          GitHub
        </a>
      </footer>
    </div>
  </div>
</template>
