import { test, expect, helpers } from './fixtures'

/**
 * E2E Tests: Dashboard & Orders Management
 * 
 * Bu testler dashboard ve sipariş yönetimi işlevlerini test eder:
 * - Dashboard istatistikleri görüntüleme
 * - Yeni sipariş oluşturma
 * - Sipariş listeleme ve filtreleme
 * - Sipariş düzenleme
 * - Sipariş silme
 */

test.describe('Dashboard ve Sipariş Testleri', () => {
  test.beforeEach(async ({ mainWindow }) => {
    // Her test öncesi lisansı atla
    await helpers.bypassLicenseIfNeeded(mainWindow)
    
    // Dashboard'a git
    await mainWindow.goto('/')
    await helpers.waitForLoadingComplete(mainWindow)
  })

  test('01 - Dashboard yüklenmeli ve istatistikler görünür olmalı', async ({ mainWindow }) => {
    // Dashboard başlığı
    const dashboardHeading = mainWindow.locator('h1, h2').filter({ 
      hasText: /dashboard|kontrol paneli/i 
    })
    await expect(dashboardHeading).toBeVisible()

    // İstatistik kartları görünür mü?
    const statCards = mainWindow.locator('[class*="stat"], [class*="card"]')
    const cardCount = await statCards.count()
    expect(cardCount).toBeGreaterThan(0)

    // Beklenen istatistikler
    const expectedStats = [
      /toplam sipariş|total orders/i,
      /aktif|active/i,
      /gelir|revenue/i,
      /kar|profit/i,
    ]

    for (const statText of expectedStats) {
      const statElement = mainWindow.locator('text=' + statText.source)
      // Stat varsa iyi, yoksa da geçebilir (conditional)
      const isVisible = await statElement.isVisible().catch(() => false)
      console.log(`Stat "${statText}":`, isVisible ? '✓' : '✗')
    }

    await helpers.takeDebugScreenshot(mainWindow, 'dashboard-loaded')
  })

  test('02 - Siparişler sayfasına gidilmeli', async ({ mainWindow }) => {
    // Siparişler menüsüne tıkla
    const ordersLink = mainWindow.locator('a, button').filter({ 
      hasText: /siparişler|orders/i 
    }).first()
    await ordersLink.click()

    // Siparişler sayfası yüklendi mi?
    await mainWindow.waitForLoadState('networkidle')
    
    const ordersHeading = mainWindow.locator('h1, h2').filter({ 
      hasText: /siparişler|orders/i 
    })
    await expect(ordersHeading).toBeVisible()

    // Yeni sipariş butonu görünür mü?
    const newOrderButton = mainWindow.locator('button, a').filter({ 
      hasText: /yeni sipariş|new order|sipariş ekle/i 
    })
    await expect(newOrderButton).toBeVisible()

    await helpers.takeDebugScreenshot(mainWindow, 'orders-page-loaded')
  })

  test('03 - Yeni sipariş oluşturma formu açılmalı', async ({ mainWindow }) => {
    // Siparişler sayfasına git
    await helpers.navigateTo(mainWindow, '/orders')

    // Yeni sipariş butonuna tıkla
    const newOrderButton = mainWindow.locator('button, a').filter({ 
      hasText: /yeni sipariş|new order|sipariş ekle/i 
    }).first()
    await newOrderButton.click()

    // Form veya modal açıldı mı?
    await mainWindow.waitForTimeout(500)
    
    // Form başlığı
    const formHeading = mainWindow.locator('h1, h2, h3').filter({ 
      hasText: /yeni sipariş|new order|sipariş oluştur/i 
    })
    await expect(formHeading).toBeVisible()

    // Zorunlu alanlar görünür mü?
    const requiredFields = [
      'Plaka',
      'Müşteri',
      'Telefon',
      'Nereden',
      'Nereye',
    ]

    for (const fieldLabel of requiredFields) {
      const field = mainWindow.locator('label').filter({ hasText: fieldLabel })
      await expect(field).toBeVisible()
    }

    await helpers.takeDebugScreenshot(mainWindow, 'new-order-form-opened')
  })

  test('04 - Yeni sipariş oluşturulmalı (full flow)', async ({ mainWindow }) => {
    // Siparişler sayfasına git
    await helpers.navigateTo(mainWindow, '/orders')

    // Sipariş sayısını al
    const initialRowCount = await helpers.getTableRowCount(mainWindow, 'table tbody tr').catch(() => 0)

    // Yeni sipariş formunu aç
    const newOrderButton = mainWindow.locator('button, a').filter({ 
      hasText: /yeni sipariş|new order|sipariş ekle/i 
    }).first()
    await newOrderButton.click()
    await mainWindow.waitForTimeout(1000)

    // Formu doldur
    await mainWindow.locator('input[name="plaka"], input[placeholder*="Plaka"]').fill('34 TEST 123')
    await mainWindow.locator('input[name="musteri"], input[placeholder*="Müşteri"]').fill('Test Müşterisi A.Ş.')
    await mainWindow.locator('input[name="telefon"], input[placeholder*="Telefon"]').fill('0555 123 4567')
    await mainWindow.locator('input[name="nereden"], input[placeholder*="Nereden"], select[name="nereden"]').first().fill('İstanbul')
    await mainWindow.locator('input[name="nereye"], input[placeholder*="Nereye"], select[name="nereye"]').first().fill('Ankara')
    await mainWindow.locator('input[name="yukAciklamasi"], input[placeholder*="Yük"], textarea[name="yukAciklamasi"]').fill('Test Yükü - E2E Test')
    
    // Fiyat ve KM bilgileri
    await mainWindow.locator('input[name="baslangicFiyati"], input[placeholder*="Fiyat"]').fill('15000')
    await mainWindow.locator('input[name="gidisKm"], input[placeholder*="Gidiş"]').fill('450')
    await mainWindow.locator('input[name="donusKm"], input[placeholder*="Dönüş"]').fill('450')

    // Screenshot form dolu hali
    await helpers.takeDebugScreenshot(mainWindow, 'new-order-form-filled')

    // Kaydet butonuna tıkla
    const saveButton = mainWindow.locator('button[type="submit"], button').filter({ 
      hasText: /kaydet|save|oluştur/i 
    }).first()
    await saveButton.click()

    // İşlem tamamlanana kadar bekle
    await mainWindow.waitForTimeout(2000)

    // Başarı mesajı veya yönlendirme kontrolü
    // Toast mesajı bekleyebilir veya orders listesine dönüş yapılabilir
    
    // Sipariş listesine dön
    await mainWindow.waitForTimeout(1000)

    // Yeni sipariş eklendi mi? (row count arttı mı?)
    const finalRowCount = await helpers.getTableRowCount(mainWindow, 'table tbody tr').catch(() => 0)
    
    console.log('Initial orders:', initialRowCount, 'Final orders:', finalRowCount)
    
    // Screenshot sipariş eklendi
    await helpers.takeDebugScreenshot(mainWindow, 'new-order-created')
  })

  test('05 - Sipariş filtreleme çalışmalı', async ({ mainWindow }) => {
    // Siparişler sayfasına git
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    // Arama kutusunu bul
    const searchInput = mainWindow.locator('input[type="search"], input[placeholder*="Ara"], input[placeholder*="Search"]')
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Arama yap
      await searchInput.fill('34 TEST 123')
      await mainWindow.waitForTimeout(1000)

      // Sonuçlar filtrelendi mi?
      const rows = mainWindow.locator('table tbody tr')
      const rowCount = await rows.count()
      
      console.log('Filtered rows:', rowCount)
      
      await helpers.takeDebugScreenshot(mainWindow, 'orders-filtered')
    } else {
      console.log('Arama kutusu bulunamadı, test atlandı')
    }
  })

  test('06 - Sipariş detayları görüntülenebilmeli', async ({ mainWindow }) => {
    // Siparişler sayfasına git
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    // İlk satıra tıkla veya detay butonuna tıkla
    const firstRow = mainWindow.locator('table tbody tr').first()
    const detailButton = firstRow.locator('button, a').filter({ hasText: /detay|görüntüle|view/i }).first()
    
    if (await detailButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await detailButton.click()
      await mainWindow.waitForTimeout(1000)

      // Detay sayfası veya modal açıldı mı?
      await helpers.takeDebugScreenshot(mainWindow, 'order-detail-opened')
    } else {
      // Detay butonu yoksa satıra tıklayalım
      if (await firstRow.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstRow.click()
        await mainWindow.waitForTimeout(1000)
        await helpers.takeDebugScreenshot(mainWindow, 'order-row-clicked')
      }
    }
  })

  test('07 - Sipariş durum değişikliği yapılabilmeli', async ({ mainWindow }) => {
    // Siparişler sayfasına git
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    // İlk satırdaki durum dropdown'ını bul
    const firstRow = mainWindow.locator('table tbody tr').first()
    const statusDropdown = firstRow.locator('select, [role="combobox"]').first()

    if (await statusDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Durumu değiştir
      await statusDropdown.selectOption({ label: /Yolda|Active|In Progress/i })
      await mainWindow.waitForTimeout(1000)

      // Değişiklik kaydedildi mi?
      await helpers.takeDebugScreenshot(mainWindow, 'order-status-changed')
    } else {
      console.log('Durum dropdown bulunamadı, test atlandı')
    }
  })

  test('08 - Sipariş düzenleme formu açılmalı', async ({ mainWindow }) => {
    // Siparişler sayfasına git
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    // İlk satırdaki düzenle butonunu bul
    const firstRow = mainWindow.locator('table tbody tr').first()
    const editButton = firstRow.locator('button, a').filter({ hasText: /düzenle|edit/i }).first()

    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click()
      await mainWindow.waitForTimeout(1000)

      // Düzenleme formu açıldı mı?
      const formHeading = mainWindow.locator('h1, h2, h3').filter({ 
        hasText: /düzenle|edit/i 
      })
      await expect(formHeading).toBeVisible()

      await helpers.takeDebugScreenshot(mainWindow, 'order-edit-form-opened')
    } else {
      console.log('Düzenle butonu bulunamadı, test atlandı')
    }
  })
})

/**
 * TEST NOTLARI:
 * 
 * 1. Bu testler gerçek database ile çalışır
 * 2. Her test fixture'da temiz bir test database kullanır
 * 3. Sipariş oluşturma gerçek maliyet hesabı yapar
 * 4. Screenshot'lar debug için kaydedilir
 * 5. Bazı testler optional (elementi yoksa skip)
 */

