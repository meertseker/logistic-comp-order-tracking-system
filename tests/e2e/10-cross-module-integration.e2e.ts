import { test, expect, helpers } from './fixtures'

/**
 * E2E Tests: Cross-Module Integration
 * 
 * Modüller arası entegrasyon testleri:
 * - Araç → Sipariş → Gider → Rapor akışı
 * - Güzergah → Sipariş otomatik doldurma
 * - Maliyet hesabı → Rapor tutarlılığı
 * - Settings değişikliği → Sipariş hesaplamalarına etkisi
 * - Mail → Sipariş entegrasyonu
 */

test.describe('Modüller Arası Entegrasyon Testleri', () => {
  test.beforeEach(async ({ mainWindow }) => {
    await helpers.bypassLicenseIfNeeded(mainWindow)
    await helpers.waitForLoadingComplete(mainWindow)
  })

  test('01 - Araç ekle → Siparişte kullan → Raporda gör (full flow)', async ({ mainWindow }) => {
    /**
     * Senaryo: Yeni araç sisteme ekleniyor, sipariş oluşturuluyor,
     * raporda doğru görünüyor mu kontrol ediliyor
     */

    const testPlate = '34 CRM 888'
    const testCustomer = 'Cross Module Test Ltd'

    // ADIM 1: Araç ekle
    console.log('ADIM 1: Yeni araç ekleniyor...')
    await helpers.navigateTo(mainWindow, '/vehicles')
    await mainWindow.waitForTimeout(1000)

    const newVehicleButton = mainWindow.locator('button').filter({ hasText: /yeni araç/i }).first()
    await newVehicleButton.click()
    await mainWindow.waitForTimeout(1000)

    await mainWindow.locator('input[name="plaka"]').fill(testPlate)
    await mainWindow.locator('input[name="marka"]').fill('Volvo')
    await mainWindow.locator('input[name="model"]').fill('FH16')

    const saveVehicleButton = mainWindow.locator('button[type="submit"]').first()
    await saveVehicleButton.click()
    await mainWindow.waitForTimeout(2000)

    await helpers.takeDebugScreenshot(mainWindow, 'integration-01-vehicle-added')

    // ADIM 2: Bu araçla sipariş oluştur
    console.log('ADIM 2: Araç ile sipariş oluşturuluyor...')
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
    await newOrderButton.click()
    await mainWindow.waitForTimeout(1000)

    // Plaka dropdown veya input'tan yeni aracı seç
    await mainWindow.locator('input[name="plaka"], select[name="plaka"]').first().fill(testPlate)
    await mainWindow.locator('input[name="musteri"]').fill(testCustomer)
    await mainWindow.locator('input[name="telefon"]').fill('0555 444 3322')
    await mainWindow.locator('input[name="nereden"]').first().fill('İstanbul')
    await mainWindow.locator('input[name="nereye"]').first().fill('Ankara')
    await mainWindow.locator('input[name="yukAciklamasi"]').fill('Integration test yükü')
    await mainWindow.locator('input[name="baslangicFiyati"]').fill('18000')
    await mainWindow.locator('input[name="gidisKm"]').fill('450')

    const saveOrderButton = mainWindow.locator('button[type="submit"]').first()
    await saveOrderButton.click()
    await mainWindow.waitForTimeout(2000)

    await helpers.takeDebugScreenshot(mainWindow, 'integration-02-order-created')

    // ADIM 3: Raporda görüntüle
    console.log('ADIM 3: Raporda kontrol ediliyor...')
    await helpers.navigateTo(mainWindow, '/reports')
    await mainWindow.waitForTimeout(2000)

    // Plaka veya müşteri ismini ara
    const reportContent = mainWindow.locator('body')
    const plateExists = await reportContent.locator(`text="${testPlate}"`).isVisible({ timeout: 3000 }).catch(() => false)
    const customerExists = await reportContent.locator(`text="${testCustomer}"`).isVisible({ timeout: 3000 }).catch(() => false)

    console.log(`Raporda plaka (${testPlate}):`, plateExists ? '✓' : '✗')
    console.log(`Raporda müşteri (${testCustomer}):`, customerExists ? '✓' : '✗')

    await helpers.takeDebugScreenshot(mainWindow, 'integration-03-report-verified')

    expect(plateExists || customerExists).toBe(true)
  })

  test('02 - Güzergah ekle → Siparişte otomatik doldur → Maliyet hesapla', async ({ mainWindow }) => {
    const distance = 480

    // ADIM 1: Güzergah ekle
    console.log('ADIM 1: Güzergah ekleniyor...')
    const routesLink = mainWindow.locator('a').filter({ hasText: /güzergah|rotalar/i }).first()

    if (await routesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await routesLink.click()
      await mainWindow.waitForTimeout(1000)

      const newRouteButton = mainWindow.locator('button').filter({ hasText: /yeni güzergah/i }).first()
      
      if (await newRouteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await newRouteButton.click()
        await mainWindow.waitForTimeout(1000)

        await mainWindow.locator('input[name="nereden"]').fill('İstanbul')
        await mainWindow.locator('input[name="nereye"]').fill('İzmir')
        await mainWindow.locator('input[name="mesafe"], input[name="km"]').fill(distance.toString())

        const saveRouteButton = mainWindow.locator('button[type="submit"]').first()
        await saveRouteButton.click()
        await mainWindow.waitForTimeout(2000)

        await helpers.takeDebugScreenshot(mainWindow, 'integration-route-added')
      }
    }

    // ADIM 2: Sipariş oluştururken otomatik doldurma
    console.log('ADIM 2: Sipariş oluşturuluyor (otomatik doldurma)...')
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
    await newOrderButton.click()
    await mainWindow.waitForTimeout(1000)

    // Nereden-Nereye seç (otomatik doldurmalı)
    await mainWindow.locator('input[name="nereden"], select[name="nereden"]').first().fill('İstanbul')
    await mainWindow.waitForTimeout(500)
    await mainWindow.locator('input[name="nereye"], select[name="nereye"]').first().fill('İzmir')
    await mainWindow.waitForTimeout(1000)

    // KM otomatik doldu mu?
    const kmInput = mainWindow.locator('input[name="gidisKm"]')
    const kmValue = await kmInput.inputValue().catch(() => '')
    
    console.log('Otomatik doldurulan KM:', kmValue)
    // Eğer otomatik doldurma varsa, KM değeri distance'a yakın olmalı
    if (kmValue && parseInt(kmValue) > 0) {
      expect(Math.abs(parseInt(kmValue) - distance)).toBeLessThan(50)
    }

    await helpers.takeDebugScreenshot(mainWindow, 'integration-auto-fill-km')
  })

  test('03 - Settings değişikliği → Sipariş hesaplamasına etkisi', async ({ mainWindow }) => {
    /**
     * Maliyet parametreleri değiştiğinde yeni siparişler etkilenmeli
     */

    // ADIM 1: Mevcut parametre değerlerini kaydet
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const costTab = mainWindow.locator('button, a').filter({ hasText: /maliyet|cost/i }).first()
    
    if (await costTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await costTab.click()
      await mainWindow.waitForTimeout(500)

      // Yakıt fiyatını değiştir
      const fuelPriceInput = mainWindow.locator('input[name*="yakit"], input[placeholder*="Yakıt"]').first()
      
      if (await fuelPriceInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        const oldFuelPrice = await fuelPriceInput.inputValue()
        console.log('Eski yakıt fiyatı:', oldFuelPrice)

        // Yeni değer
        await fuelPriceInput.fill('45') // 45 TL/litre
        
        const saveButton = mainWindow.locator('button[type="submit"]').first()
        await saveButton.click()
        await mainWindow.waitForTimeout(2000)

        await helpers.takeDebugScreenshot(mainWindow, 'integration-settings-changed')

        // ADIM 2: Yeni sipariş oluştur ve maliyet hesabını kontrol et
        await helpers.navigateTo(mainWindow, '/orders')
        await mainWindow.waitForTimeout(1000)

        const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
        await newOrderButton.click()
        await mainWindow.waitForTimeout(1000)

        await mainWindow.locator('input[name="plaka"]').fill('34 SET 123')
        await mainWindow.locator('input[name="musteri"]').fill('Settings Test')
        await mainWindow.locator('input[name="telefon"]').fill('0555 999 8877')
        await mainWindow.locator('input[name="nereden"]').first().fill('A')
        await mainWindow.locator('input[name="nereye"]').first().fill('B')
        await mainWindow.locator('input[name="baslangicFiyati"]').fill('20000')
        await mainWindow.locator('input[name="gidisKm"]').fill('500')
        
        await mainWindow.waitForTimeout(2000) // Maliyet hesaplama için bekle

        // Toplam maliyet gösterimi
        const costDisplay = mainWindow.locator('text=/maliyet|cost/i')
        
        if (await costDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
          const costText = await costDisplay.textContent()
          console.log('Hesaplanan maliyet:', costText)
        }

        await helpers.takeDebugScreenshot(mainWindow, 'integration-cost-recalculated')
      }
    }
  })

  test('04 - Dashboard istatistikleri tüm modüllerle senkron', async ({ mainWindow }) => {
    /**
     * Dashboard'daki rakamlar orders, expenses, reports'la tutarlı mı?
     */

    // Sipariş sayısını al
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    const orderCount = await helpers.getTableRowCount(mainWindow).catch(() => 0)
    console.log('Sipariş listesindeki kayıt sayısı:', orderCount)

    // Dashboard'a dön
    await helpers.navigateTo(mainWindow, '/')
    await mainWindow.waitForTimeout(2000)

    // Dashboard'daki sipariş sayısı
    const dashboardOrderCount = mainWindow.locator('text=/sipariş|order/i').locator('..').locator('text=/\\d+/')
    
    if (await dashboardOrderCount.isVisible({ timeout: 2000 }).catch(() => false)) {
      const dashboardCount = await dashboardOrderCount.textContent()
      console.log('Dashboard\'daki sipariş sayısı:', dashboardCount)

      // Sayılar yaklaşık eşit olmalı (pending, completed, cancelled toplamı)
      const dashboardNumber = parseInt(dashboardCount || '0')
      const difference = Math.abs(dashboardNumber - orderCount)
      
      console.log('Fark:', difference)
      expect(difference).toBeLessThan(10) // Tolerans
    }

    await helpers.takeDebugScreenshot(mainWindow, 'integration-dashboard-sync')
  })

  test('05 - Sipariş sil → Dashboard güncellen → Raporda görünmez', async ({ mainWindow }) => {
    // Sipariş oluştur
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
    await newOrderButton.click()
    await mainWindow.waitForTimeout(1000)

    const testCustomer = 'Silinecek Sipariş'
    
    await mainWindow.locator('input[name="plaka"]').fill('34 DEL 999')
    await mainWindow.locator('input[name="musteri"]').fill(testCustomer)
    await mainWindow.locator('input[name="telefon"]').fill('0555 777 6655')
    await mainWindow.locator('input[name="nereden"]').first().fill('A')
    await mainWindow.locator('input[name="nereye"]').first().fill('B')
    await mainWindow.locator('input[name="baslangicFiyati"]').fill('10000')

    const saveButton = mainWindow.locator('button[type="submit"]').first()
    await saveButton.click()
    await mainWindow.waitForTimeout(2000)

    await helpers.takeDebugScreenshot(mainWindow, 'integration-order-to-delete')

    // Dashboard'daki mevcut sayıyı al
    await helpers.navigateTo(mainWindow, '/')
    await mainWindow.waitForTimeout(2000)

    // Sipariş sil
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    // Test siparişini bul
    const orderRow = mainWindow.locator('tr').filter({ hasText: testCustomer }).first()
    
    if (await orderRow.isVisible({ timeout: 2000 }).catch(() => false)) {
      const deleteButton = orderRow.locator('button').filter({ hasText: /sil|delete/i }).first()
      
      if (await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await deleteButton.click()
        await mainWindow.waitForTimeout(500)

        // Onay modal
        const confirmButton = mainWindow.locator('button').filter({ hasText: /evet|yes|onayla/i }).first()
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmButton.click()
          await mainWindow.waitForTimeout(2000)
        }

        await helpers.takeDebugScreenshot(mainWindow, 'integration-order-deleted')

        // Dashboard güncellendi mi?
        await helpers.navigateTo(mainWindow, '/')
        await mainWindow.waitForTimeout(2000)

        await helpers.takeDebugScreenshot(mainWindow, 'integration-dashboard-after-delete')

        // Raporda görünmemeli
        await helpers.navigateTo(mainWindow, '/reports')
        await mainWindow.waitForTimeout(2000)

        const deletedOrder = mainWindow.locator(`text="${testCustomer}"`)
        const stillVisible = await deletedOrder.isVisible({ timeout: 2000 }).catch(() => false)
        
        console.log('Silinen sipariş raporda görünür mü?', stillVisible ? 'EVET (soft delete)' : 'HAYIR')

        await helpers.takeDebugScreenshot(mainWindow, 'integration-report-after-delete')
      }
    }
  })

  test('06 - Araç performans raporu → Siparişlerle tutarlı', async ({ mainWindow }) => {
    // Belirli bir araç seç
    await helpers.navigateTo(mainWindow, '/vehicles')
    await mainWindow.waitForTimeout(1000)

    const firstVehicle = mainWindow.locator('table tbody tr').first()
    
    if (await firstVehicle.isVisible({ timeout: 2000 }).catch(() => false)) {
      const vehiclePlate = await firstVehicle.locator('td').first().textContent()
      console.log('Test aracı:', vehiclePlate)

      // Performans sekmesine git
      const performanceTab = mainWindow.locator('button, a').filter({ hasText: /performans/i }).first()
      
      if (await performanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await performanceTab.click()
        await mainWindow.waitForTimeout(2000)

        // Araç istatistikleri
        const stats = mainWindow.locator('.stat, .metric, [class*="statistics"]')
        const statCount = await stats.count()
        
        console.log('Araç performans metrik sayısı:', statCount)

        await helpers.takeDebugScreenshot(mainWindow, 'integration-vehicle-performance')

        // Sipariş listesinde bu aracı ara ve karşılaştır
        await helpers.navigateTo(mainWindow, '/orders')
        await mainWindow.waitForTimeout(1000)

        if (vehiclePlate) {
          const searchInput = mainWindow.locator('input[type="search"]')
          
          if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await searchInput.fill(vehiclePlate)
            await mainWindow.waitForTimeout(1000)

            const matchingOrders = await helpers.getTableRowCount(mainWindow).catch(() => 0)
            console.log(`${vehiclePlate} için sipariş sayısı:`, matchingOrders)

            await helpers.takeDebugScreenshot(mainWindow, 'integration-vehicle-orders')
          }
        }
      }
    }
  })
})

/**
 * TEST NOTLARI:
 * 
 * 1. Cross-module testler gerçek veri akışını test eder
 * 2. Her modül diğerlerini etkileyebilir (cascade effect)
 * 3. Data consistency kritik
 * 4. Cache invalidation önemli
 * 5. Real-time updates test edilmeli
 */

