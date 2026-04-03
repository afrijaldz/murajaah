<script setup>
import { reactive } from 'vue'
import SurahSearch from './SurahSearch.vue'

const props = defineProps({
  initialConfig: { type: Object, required: true },
})
const emit = defineEmits(['start'])

const form = reactive({
  scopeType: props.initialConfig.scopeType,
  scopeValue: props.initialConfig.scopeValue,
  mode: props.initialConfig.mode,
  order: props.initialConfig.order,
  showHint: props.initialConfig.showHint,
})

function onScopeTypeChange(type) {
  form.scopeType = type
  form.scopeValue = type === 'surah' ? 1 : 1
}

function submit() {
  emit('start', { ...form })
}
</script>

<template>
  <div class="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-5 space-y-5">

    <!-- Scope Type -->
    <div>
      <label class="block text-sm font-medium mb-2">Pilih Berdasarkan</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="onScopeTypeChange('surah')"
          class="py-2.5 rounded-lg text-sm font-medium border transition-colors"
          :class="form.scopeType === 'surah'
            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
            : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'"
        >
          Surat
        </button>
        <button
          @click="onScopeTypeChange('juz')"
          class="py-2.5 rounded-lg text-sm font-medium border transition-colors"
          :class="form.scopeType === 'juz'
            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
            : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'"
        >
          Juz
        </button>
      </div>
    </div>

    <!-- Scope Value -->
    <div>
      <label class="block text-sm font-medium mb-2">
        {{ form.scopeType === 'surah' ? 'Pilih Surat' : 'Pilih Juz' }}
      </label>
      <SurahSearch
        v-if="form.scopeType === 'surah'"
        v-model="form.scopeValue"
      />
      <select
        v-else
        v-model.number="form.scopeValue"
        class="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-sm"
      >
        <option v-for="n in 30" :key="n" :value="n">Juz {{ n }}</option>
      </select>
    </div>

    <!-- Mode -->
    <div>
      <label class="block text-sm font-medium mb-2">Mode</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="form.mode = 'quiz'"
          class="py-2.5 rounded-lg text-sm font-medium border transition-colors"
          :class="form.mode === 'quiz'
            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
            : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'"
        >
          Quiz
        </button>
        <button
          @click="form.mode = 'review'"
          class="py-2.5 rounded-lg text-sm font-medium border transition-colors"
          :class="form.mode === 'review'
            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
            : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'"
        >
          Review
        </button>
      </div>
      <p class="text-xs text-[var(--color-text-muted)] mt-2">
        {{ form.mode === 'quiz'
          ? 'Hanya tampilkan nama surat dan nomor ayat, uji hafalanmu lalu lihat jawabannya.'
          : 'Tampilkan ayat lengkap beserta terjemahan untuk review bacaan.' }}
      </p>
    </div>

    <!-- Order -->
    <div>
      <label class="block text-sm font-medium mb-2">Urutan</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="form.order = 'sequential'"
          class="py-2.5 rounded-lg text-sm font-medium border transition-colors"
          :class="form.order === 'sequential'
            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
            : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'"
        >
          Urut
        </button>
        <button
          @click="form.order = 'random'"
          class="py-2.5 rounded-lg text-sm font-medium border transition-colors"
          :class="form.order === 'random'
            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
            : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]'"
        >
          Acak
        </button>
      </div>
      <p class="text-xs text-[var(--color-text-muted)] mt-2">
        {{ form.order === 'sequential'
          ? 'Ayat ditampilkan sesuai urutan dalam mushaf.'
          : 'Ayat diacak untuk menguji hafalan secara lebih menyeluruh.' }}
      </p>
    </div>

    <!-- Start Button -->
    <button
      @click="submit"
      class="w-full py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-primary-light)] transition-colors"
    >
      Mulai Murojaah
    </button>
  </div>
</template>
