import { test, expect } from '@playwright/test'

test.describe('Config Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for surah list to load from API before interacting
    await page.locator('button', { hasText: 'Al-Fatihah' }).waitFor({ timeout: 10000 })
  })

  test('should show app title and config panel', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Murojaah')
    await expect(page.getByText('Pilih Berdasarkan')).toBeVisible()
    await expect(page.getByText('Mulai Murojaah')).toBeVisible()
  })

  test('should switch to Juz scope', async ({ page }) => {
    await expect(page.getByText('Pilih Surat')).toBeVisible()
    // Click "Juz" button (second button on page)
    await page.locator('button').nth(1).click()
    await expect(page.getByText('Pilih Juz')).toBeVisible({ timeout: 5000 })
    // Juz selector should show
    await expect(page.locator('select')).toBeVisible()
  })

  test('should toggle between Quiz and Review mode', async ({ page }) => {
    // Default is Quiz
    await expect(page.getByText('Hanya tampilkan nama surat dan nomor ayat')).toBeVisible()

    // Switch to Review
    await page.getByRole('button', { name: 'Review' }).click()
    await expect(page.getByText('Tampilkan ayat lengkap beserta terjemahan')).toBeVisible()
  })

  test('should toggle between Urut and Acak order', async ({ page }) => {
    await expect(page.getByText('Ayat ditampilkan sesuai urutan dalam mushaf')).toBeVisible()

    await page.getByRole('button', { name: 'Acak' }).click()
    await expect(page.getByText('Ayat diacak untuk menguji hafalan')).toBeVisible()
  })

  test('should show ayah range toggle for surah scope', async ({ page }) => {
    await expect(page.getByText('Rentang Ayat')).toBeVisible()

    // Switch to Juz — range should disappear
    await page.getByRole('button', { name: 'Juz' }).click()
    await expect(page.getByText('Rentang Ayat')).not.toBeVisible()
  })
})

test.describe('Surah Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load surah list and allow searching', async ({ page }) => {
    // Wait for surah list to load from API
    const surahButton = page.locator('button', { hasText: 'Al-Fatihah' })
    await expect(surahButton).toBeVisible({ timeout: 10000 })

    // Click to open search
    await surahButton.click()
    const searchInput = page.getByPlaceholder('Cari surat...')
    await expect(searchInput).toBeVisible()

    // Search for a surah
    await searchInput.fill('Baqarah')
    await expect(page.locator('li', { hasText: 'Al-Baqarah' })).toBeVisible()
  })
})

test.describe('Murojaah Session - Quiz Mode', () => {
  test('should start session and show quiz prompt', async ({ page }) => {
    await page.goto('/')

    // Wait for surah list to load
    await page.locator('button', { hasText: 'Al-Fatihah' }).waitFor({ timeout: 10000 })

    // Start with default config (Al-Fatihah, Quiz, Sequential)
    await page.getByText('Mulai Murojaah').click()

    // Wait for loading to finish and session to appear
    await expect(page.getByText('Apa ayat ini?')).toBeVisible({ timeout: 15000 })

    // Should show surah info in header
    await expect(page.getByText('Al-Fatihah')).toBeVisible()
    await expect(page.getByText('Ayat 1 dari 7')).toBeVisible()

    // Should show action buttons
    await expect(page.getByText('Tampilkan')).toBeVisible()
    await expect(page.getByText('Play Audio')).toBeVisible()
    await expect(page.getByText('Lanjut')).toBeVisible()
  })

  test('should show ayah detail when Tampilkan is clicked', async ({ page }) => {
    await page.goto('/')
    await page.locator('button', { hasText: 'Al-Fatihah' }).waitFor({ timeout: 10000 })
    await page.getByText('Mulai Murojaah').click()
    await expect(page.getByText('Apa ayat ini?')).toBeVisible({ timeout: 15000 })

    // Click Tampilkan
    await page.getByText('Tampilkan').click()

    // Should show Arabic text and translation
    await expect(page.locator('[dir="rtl"]')).toBeVisible()
  })

  test('should advance to next ayah', async ({ page }) => {
    await page.goto('/')
    await page.locator('button', { hasText: 'Al-Fatihah' }).waitFor({ timeout: 10000 })
    await page.getByText('Mulai Murojaah').click()
    await expect(page.getByText('Ayat 1 dari 7')).toBeVisible({ timeout: 15000 })

    // Click Lanjut
    await page.getByText('Lanjut').click()
    await expect(page.getByText('Ayat 2 dari 7')).toBeVisible()
  })

  test('should show completion screen after last ayah', async ({ page }) => {
    await page.goto('/')
    await page.locator('button', { hasText: 'Al-Fatihah' }).waitFor({ timeout: 10000 })
    await page.getByText('Mulai Murojaah').click()
    await expect(page.getByText('Ayat 1 dari 7')).toBeVisible({ timeout: 15000 })

    // Click through all 7 ayahs
    for (let i = 0; i < 7; i++) {
      await page.getByText('Lanjut').click()
    }

    // Should show completion
    await expect(page.getByText('Selesai!')).toBeVisible()
    await expect(page.getByText('Ulangi')).toBeVisible()
    await expect(page.getByText('Ganti Setting')).toBeVisible()
  })

  test('should go back to config via Kembali button', async ({ page }) => {
    await page.goto('/')
    await page.locator('button', { hasText: 'Al-Fatihah' }).waitFor({ timeout: 10000 })
    await page.getByText('Mulai Murojaah').click()
    await expect(page.getByText('Apa ayat ini?')).toBeVisible({ timeout: 15000 })

    await page.getByText('← Kembali').click()
    await expect(page.getByText('Mulai Murojaah')).toBeVisible()
  })
})

test.describe('Murojaah Session - Review Mode', () => {
  test('should show full ayah in review mode', async ({ page }) => {
    await page.goto('/')
    await page.locator('button', { hasText: 'Al-Fatihah' }).waitFor({ timeout: 10000 })

    // Switch to Review mode
    await page.getByRole('button', { name: 'Review' }).click()
    await page.getByText('Mulai Murojaah').click()

    // Should show Arabic text directly (no "Apa ayat ini?" prompt)
    await expect(page.getByText('Apa ayat ini?')).not.toBeVisible({ timeout: 15000 })
    await expect(page.locator('[dir="rtl"]')).toBeVisible({ timeout: 15000 })

    // Should NOT show Tampilkan button in review mode
    await expect(page.getByText('Tampilkan')).not.toBeVisible()
  })
})

test.describe('Session Complete Actions', () => {
  test('should restart session with Ulangi', async ({ page }) => {
    await page.goto('/')
    await page.locator('button', { hasText: 'Al-Fatihah' }).waitFor({ timeout: 10000 })
    await page.getByText('Mulai Murojaah').click()
    await expect(page.getByText('Ayat 1 dari 7')).toBeVisible({ timeout: 15000 })

    // Skip to end
    for (let i = 0; i < 7; i++) {
      await page.getByText('Lanjut').click()
    }
    await expect(page.getByText('Selesai!')).toBeVisible()

    // Click Ulangi
    await page.getByText('Ulangi').click()
    await expect(page.getByText('Ayat 1 dari 7')).toBeVisible()
  })

  test('should go back to config with Ganti Setting', async ({ page }) => {
    await page.goto('/')
    await page.locator('button', { hasText: 'Al-Fatihah' }).waitFor({ timeout: 10000 })
    await page.getByText('Mulai Murojaah').click()
    await expect(page.getByText('Ayat 1 dari 7')).toBeVisible({ timeout: 15000 })

    for (let i = 0; i < 7; i++) {
      await page.getByText('Lanjut').click()
    }
    await expect(page.getByText('Selesai!')).toBeVisible()

    await page.getByText('Ganti Setting').click()
    await expect(page.getByText('Mulai Murojaah')).toBeVisible()
  })
})
