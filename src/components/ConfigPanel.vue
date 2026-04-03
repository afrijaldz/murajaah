<script setup>
import { reactive, ref, computed } from 'vue'
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
  ayahFrom: props.initialConfig.ayahFrom || null,
  ayahTo: props.initialConfig.ayahTo || null,
})

const totalAyahs = ref(0)
const useRange = ref(!!(props.initialConfig.ayahFrom || props.initialConfig.ayahTo))
const rangeError = ref('')

function onScopeTypeChange(type) {
  form.scopeType = type
  form.scopeValue = type === 'surah' ? 1 : 1
  resetRange()
}

function onSurahInfo(surah) {
  totalAyahs.value = surah.numberOfAyahs
  validateRange()
}

function resetRange() {
  useRange.value = false
  form.ayahFrom = null
  form.ayahTo = null
  rangeError.value = ''
}

function toggleRange() {
  useRange.value = !useRange.value
  if (!useRange.value) {
    form.ayahFrom = null
    form.ayahTo = null
    rangeError.value = ''
  } else {
    form.ayahFrom = 1
    form.ayahTo = totalAyahs.value || 1
  }
}

function validateRange() {
  rangeError.value = ''
  if (!useRange.value) return true

  const from = Number(form.ayahFrom)
  const to = Number(form.ayahTo)
  const max = totalAyahs.value

  if (!from || !to) {
    rangeError.value = 'Isi kedua field ayat.'
    return false
  }
  if (from < 1 || to < 1) {
    rangeError.value = 'Nomor ayat minimal 1.'
    return false
  }
  if (max && (from > max || to > max)) {
    rangeError.value = `Surat ini hanya memiliki ${max} ayat.`
    return false
  }
  if (from > to) {
    rangeError.value = 'Ayat awal harus lebih kecil atau sama dengan ayat akhir.'
    return false
  }
  return true
}

function submit() {
  if (!validateRange()) return
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
        @surah-info="onSurahInfo"
      />
      <select
        v-else
        v-model.number="form.scopeValue"
        class="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-sm"
      >
        <option v-for="n in 30" :key="n" :value="n">Juz {{ n }}</option>
      </select>
    </div>

    <!-- Ayah Range (Surah only) -->
    <div v-if="form.scopeType === 'surah'">
      <div class="flex items-center justify-between">
        <div>
          <label class="text-sm font-medium">Rentang Ayat</label>
          <p class="text-xs text-[var(--color-text-muted)]">
            {{ useRange ? `Ayat ${form.ayahFrom || '?'} - ${form.ayahTo || '?'} dari ${totalAyahs}` : 'Semua ayat dalam surat' }}
          </p>
        </div>
        <button
          @click="toggleRange"
          class="relative w-11 h-6 rounded-full transition-colors"
          :class="useRange ? 'bg-[var(--color-primary)]' : 'bg-gray-300'"
        >
          <span
            class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
            :class="{ 'translate-x-5': useRange }"
          ></span>
        </button>
      </div>
      <div v-if="useRange" class="flex gap-2 mt-3">
        <div class="flex-1">
          <label class="block text-xs text-[var(--color-text-muted)] mb-1">Dari ayat</label>
          <input
            v-model.number="form.ayahFrom"
            @input="validateRange"
            type="number"
            min="1"
            :max="totalAyahs"
            class="w-full px-3 py-2 border rounded-lg bg-[var(--color-surface)] text-sm"
            :class="rangeError ? 'border-red-400' : 'border-[var(--color-border)]'"
          />
        </div>
        <div class="flex-1">
          <label class="block text-xs text-[var(--color-text-muted)] mb-1">Sampai ayat</label>
          <input
            v-model.number="form.ayahTo"
            @input="validateRange"
            type="number"
            min="1"
            :max="totalAyahs"
            class="w-full px-3 py-2 border rounded-lg bg-[var(--color-surface)] text-sm"
            :class="rangeError ? 'border-red-400' : 'border-[var(--color-border)]'"
          />
        </div>
      </div>
      <p v-if="rangeError" class="text-xs text-red-500 mt-1">{{ rangeError }}</p>
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
