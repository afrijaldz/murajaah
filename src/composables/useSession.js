import { ref, computed } from 'vue'

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function useSession() {
  const ayahs = ref([])
  const currentIndex = ref(0)
  const showDetail = ref(false)
  const isComplete = ref(false)
  const config = ref(null)

  const currentAyah = computed(() => ayahs.value[currentIndex.value] || null)
  const total = computed(() => ayahs.value.length)
  const progress = computed(() => currentIndex.value + 1)

  function init(ayahList, sessionConfig) {
    config.value = { ...sessionConfig }
    ayahs.value = sessionConfig.order === 'random' ? shuffle(ayahList) : [...ayahList]
    currentIndex.value = 0
    showDetail.value = false
    isComplete.value = false
  }

  function next() {
    if (currentIndex.value < ayahs.value.length - 1) {
      currentIndex.value++
      showDetail.value = false
    } else {
      isComplete.value = true
    }
  }

  function show() {
    showDetail.value = true
  }

  function restart() {
    if (config.value?.order === 'random') {
      ayahs.value = shuffle(ayahs.value)
    }
    currentIndex.value = 0
    showDetail.value = false
    isComplete.value = false
  }

  return {
    ayahs,
    currentIndex,
    currentAyah,
    showDetail,
    isComplete,
    total,
    progress,
    config,
    init,
    next,
    show,
    restart,
  }
}
