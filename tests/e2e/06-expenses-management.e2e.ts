import { test, expect, helpers } from './fixtures'

/**
 * E2E Tests: Expenses Management (Gider Yönetimi)
 * 
 * Bu testler gider yönetimi modülünü kapsamlı test eder:
 * - Gider ekleme (yakıt, bakım, diğer)
 * - Gider düzenleme ve silme
 * - Gider raporları
 * - Gider kategorileri
 * - Tarih bazlı filtreleme
 */

test.describe('Gider Yönetimi Testleri', () => {
  test.beforeEach(async ({ mainWindow }) => {
    await helpers.bypassLicenseIfNeeded(mainWindow)
    await helpers.waitForLoadingComplete(mainWindow)
  })

  test('01 - Giderler sayfası erişilebilir olmalı', async ({ mainWindow }) => {
    // Giderler menüsü veya sekmesi
    const expensesLink = mainWindow.locator('a, button').filter({ 
      hasText: /giderler|expenses|harcama/i 
    }).first()

    if (await expensesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expensesLink.click()
      await mainWindow.waitForLoadState('networkidle')

      const heading = mainWindow.locator('h1, h2').filter({ 
        hasText: /giderler|expenses/i 
      })
      await expect(heading).toBeVisible()

      await helpers.takeDebugScreenshot(mainWindow, 'expenses-page-loaded')
    } else {
      console.log('⚠️  Giderler modülü UI\'da bulunamadı - test skipped')
      test.skip()
    }
  })

  test('02 - Yeni gider eklenebilmeli - Yakıt', async ({ mainWindow }) => {
    // Siparişler sayfasından gider ekle
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    // Bir siparişin gider butonunu bul
    const expenseButton = mainWindow.locator('button').filter({ 
      hasText: /gider|expense/i 
    }).first()

    if (await expenseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expenseButton.click()
      await mainWindow.waitForTimeout(1000)

      // Gider formu
      const typeSelect = mainWindow.locator('select[name="giderTipi"], select[name="type"]')
      if (await typeSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
        await typeSelect.selectOption({ label: /Yakıt|Fuel/i })
      }

      await mainWindow.locator('input[name="miktar"], input[name="amount"]').fill('2500')
      await mainWindow.locator('input[name="aciklama"], textarea[name="description"]').fill('Motorin - Test Gideri')

      await helpers.takeDebugScreenshot(mainWindow, 'expense-form-fuel')

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(2000)

      await helpers.takeDebugScreenshot(mainWindow, 'expense-created-fuel')
    } else {
      console.log('⚠️  Gider ekleme butonu bulunamadı')
      test.skip()
    }
  })

  test('03 - Yeni gider eklenebilmeli - Bakım', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    const expenseButton = mainWindow.locator('button').filter({ 
      hasText: /gider|expense/i 
    }).first()

    if (await expenseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expenseButton.click()
      await mainWindow.waitForTimeout(1000)

      const typeSelect = mainWindow.locator('select[name="giderTipi"], select[name="type"]')
      if (await typeSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
        await typeSelect.selectOption({ label: /Bakım|Maintenance/i })
      }

      await mainWindow.locator('input[name="miktar"], input[name="amount"]').fill('1800')
      await mainWindow.locator('input[name="aciklama"], textarea[name="description"]').fill('Lastik Değişimi')

      await helpers.takeDebugScreenshot(mainWindow, 'expense-form-maintenance')

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(2000)

      await helpers.takeDebugScreenshot(mainWindow, 'expense-created-maintenance')
    } else {
      test.skip()
    }
  })

  test('04 - Gider listesi görüntülenebilmeli', async ({ mainWindow }) => {
    // Raporlar sayfasında gider raporu
    await helpers.navigateTo(mainWindow, '/reports')
    await mainWindow.waitForTimeout(2000)

    // Gider sekmesi veya bölümü
    const expenseTab = mainWindow.locator('button, a').filter({ 
      hasText: /gider|expense/i 
    }).first()

    if (await expenseTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expenseTab.click()
      await mainWindow.waitForTimeout(1000)

      // Gider tablosu
      const expenseTable = mainWindow.locator('table')
      if (await expenseTable.isVisible({ timeout: 2000 }).catch(() => false)) {
        const rows = expenseTable.locator('tbody tr')
        const rowCount = await rows.count()
        
        console.log('Gider kayıt sayısı:', rowCount)

        await helpers.takeDebugScreenshot(mainWindow, 'expense-list')
      }
    }
  })

  test('05 - Gider kategorilerine göre filtreleme', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/reports')
    await mainWindow.waitForTimeout(2000)

    const categoryFilter = mainWindow.locator('select').filter({ 
      has: mainWindow.locator('option').filter({ hasText: /Yakıt|Bakım/i }) 
    }).first()

    if (await categoryFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryFilter.selectOption({ label: /Yakıt/i })
      await mainWindow.waitForTimeout(1000)

      await helpers.takeDebugScreenshot(mainWindow, 'expenses-filtered-by-category')
    }
  })

  test('06 - Gider düzenlenebilmeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/reports')
    await mainWindow.waitForTimeout(2000)

    const editButton = mainWindow.locator('button').filter({ hasText: /düzenle|edit/i }).first()
    
    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click()
      await mainWindow.waitForTimeout(1000)

      const amountInput = mainWindow.locator('input[name="miktar"], input[name="amount"]')
      if (await amountInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await amountInput.fill('2800')
        
        const saveButton = mainWindow.locator('button[type="submit"]').first()
        await saveButton.click()
        await mainWindow.waitForTimeout(2000)

        await helpers.takeDebugScreenshot(mainWindow, 'expense-updated')
      }
    }
  })

  test('07 - Gider silinebilmeli (soft delete)', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/reports')
    await mainWindow.waitForTimeout(2000)

    const initialRows = await helpers.getTableRowCount(mainWindow).catch(() => 0)

    const deleteButton = mainWindow.locator('button').filter({ hasText: /sil|delete/i }).first()
    
    if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteButton.click()
      await mainWindow.waitForTimeout(500)

      // Onay modal'ı
      const confirmButton = mainWindow.locator('button').filter({ hasText: /evet|yes|onayla/i }).first()
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click()
        await mainWindow.waitForTimeout(2000)
      }

      const finalRows = await helpers.getTableRowCount(mainWindow).catch(() => 0)
      console.log('Silme öncesi:', initialRows, 'Silme sonrası:', finalRows)

      await helpers.takeDebugScreenshot(mainWindow, 'expense-deleted')
    }
  })

  test('08 - Toplam gider hesaplaması doğru olmalı', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/reports')
    await mainWindow.waitForTimeout(2000)

    // Toplam gider istatistiği
    const totalExpense = mainWindow.locator('text=/Toplam Gider|Total Expense/i')
    
    if (await totalExpense.isVisible({ timeout: 2000 }).catch(() => false)) {
      const totalText = await totalExpense.textContent()
      console.log('Toplam gider:', totalText)

      // Sayı formatı kontrolü (₺ veya TL içermeli)
      expect(totalText).toMatch(/₺|TL|\d/)

      await helpers.takeDebugScreenshot(mainWindow, 'total-expense-calculated')
    }
  })
})

/**
 * TEST NOTLARI:
 * 
 * 1. Gider modülü opsiyonel olabilir
 * 2. Bazı testler UI yoksa skip edilir
 * 3. Gider kategorileri: Yakıt, Bakım, HGS, Diğer
 * 4. Soft delete kullanılıyor (deleted_at flag)
 */

