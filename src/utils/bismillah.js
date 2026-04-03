const BISMILLAH_PATTERN = /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/

export function stripBismillah(text, surahNumber) {
  // Al-Fatiha: Bismillah IS ayah 1, keep as-is
  if (surahNumber === 1) return text
  // At-Tawbah: no Bismillah
  if (surahNumber === 9) return text
  // Other surahs: strip Bismillah from ayah 1
  return text.replace(BISMILLAH_PATTERN, '').trim()
}

export function getHintWords(text, surahNumber, numberInSurah, wordCount = 3) {
  // Only strip Bismillah from ayah 1
  const cleanText = numberInSurah === 1 ? stripBismillah(text, surahNumber) : text
  const words = cleanText.split(/\s+/)
  return words.slice(0, wordCount).join(' ')
}
