<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuranApi } from '../composables/useQuranApi.js'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
})
const emit = defineEmits(['update:modelValue'])

const { fetchSurahList } = useQuranApi()
const surahList = ref([])
const search = ref('')
const isOpen = ref(false)
const inputRef = ref(null)

const selected = computed(() =>
  surahList.value.find(s => s.number === props.modelValue)
)

const filtered = computed(() => {
  if (!search.value) return surahList.value
  const q = search.value.toLowerCase()
  return surahList.value.filter(s =>
    s.englishName.toLowerCase().includes(q) ||
    s.name.includes(q) ||
    String(s.number).includes(q)
  )
})

function select(surah) {
  emit('update:modelValue', surah.number)
  search.value = ''
  isOpen.value = false
}

function openDropdown() {
  isOpen.value = true
  search.value = ''
  setTimeout(() => inputRef.value?.focus(), 0)
}

function closeDropdown() {
  setTimeout(() => { isOpen.value = false }, 150)
}

onMounted(async () => {
  const list = await fetchSurahList()
  if (list) surahList.value = list
})
</script>

<template>
  <div class="relative">
    <button
      v-if="!isOpen"
      @click="openDropdown"
      class="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-left text-sm"
    >
      <span v-if="selected">
        {{ selected.number }}. {{ selected.englishName }}
        <span class="text-[var(--color-text-muted)] font-amiri">{{ selected.name }}</span>
      </span>
      <span v-else class="text-[var(--color-text-muted)]">Pilih surat...</span>
    </button>

    <div v-if="isOpen" class="relative">
      <input
        ref="inputRef"
        v-model="search"
        @blur="closeDropdown"
        type="text"
        placeholder="Cari surat..."
        class="w-full px-3 py-2.5 border border-[var(--color-primary)] rounded-lg bg-[var(--color-surface)] text-sm outline-none"
      />
      <ul class="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg">
        <li
          v-for="surah in filtered"
          :key="surah.number"
          @mousedown.prevent="select(surah)"
          class="px-3 py-2 text-sm cursor-pointer hover:bg-[var(--color-primary)]/10 flex justify-between items-center"
          :class="{ 'bg-[var(--color-primary)]/5': surah.number === modelValue }"
        >
          <span>{{ surah.number }}. {{ surah.englishName }}</span>
          <span class="font-amiri text-[var(--color-text-muted)]">{{ surah.name }}</span>
        </li>
        <li v-if="filtered.length === 0" class="px-3 py-2 text-sm text-[var(--color-text-muted)]">
          Tidak ditemukan
        </li>
      </ul>
    </div>
  </div>
</template>
