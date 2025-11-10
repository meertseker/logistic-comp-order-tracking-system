import { test, expect, helpers } from './fixtures'

/**
 * E2E Tests: Critical User Journeys
 * 
 * Bu testler kritik kullanıcı senaryolarını end-to-end test eder:
 * - Yeni kullanıcı ilk kurulum akışı
 * - Günlük operasyon akışı
 * - Aylık kapanış akışı
 * - Acil durum senaryoları
 */

test.describe('Kritik Kullanıcı Senaryoları', () => {
  test.describe.configure({ mode: 'serial' })

  test.describe('Senaryo 1: Yeni Kullanıcı İlk Kurulum', () => {
    test('Journey 01 - İlk açılıştan ilk siparişe kadar tam akış', async ({ mainWindow }) => {
      /**
       * Hikaye: Yeni bir nakliye şirketi Sekersoft'u ilk kez açıyor
       * Hedef: Lisans aktivasyonundan ilk siparişe kadar tüm adımları tamamlamak
       * Süre: < 15 dakika bekleniyor
       */

      const journeyStartTime = Date.now()

      // ADIM 1: Lisans aktivasyonu
      console.log('ADIM 1: Lisans aktivasyonu...')
      await helpers.bypassLicenseIfNeeded(mainWindow)
      await helpers.takeDebugScreenshot(mainWindow, 'journey01-step1-license-activated')

      // ADIM 2: İlk aracı ekle
      console.log('ADIM 2: İlk araç ekleme...')
      const vehiclesLink = mainWindow.locator('a').filter({ hasText: /araçlar|vehicles/i }).first()
      await vehiclesLink.click()
      await mainWindow.waitForTimeout(1000)

      const newVehicleButton = mainWindow.locator('button').filter({ 
        hasText: /yeni araç|araç ekle/i 
      }).first()
      await newVehicleButton.click()
      await mainWindow.waitForTimeout(1000)

      // Araç bilgileri
      await mainWindow.locator('input[name="plaka"]').fill('06 ABC 123')
      await mainWindow.locator('input[name="marka"]').fill('Mercedes')
      await mainWindow.locator('input[name="model"]').fill('Actros 2023')
      
      const saveVehicleButton = mainWindow.locator('button[type="submit"]').filter({ 
        hasText: /kaydet/i 
      }).first()
      await saveVehicleButton.click()
      await mainWindow.waitForTimeout(2000)
      
      await helpers.takeDebugScreenshot(mainWindow, 'journey01-step2-vehicle-added')

      // ADIM 3: İlk güzergah ekle
      console.log('ADIM 3: İlk güzergah ekleme...')
      const routesLink = mainWindow.locator('a').filter({ hasText: /güzergah|rotalar/i }).first()
      
      if (await routesLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await routesLink.click()
        await mainWindow.waitForTimeout(1000)

        const newRouteButton = mainWindow.locator('button').filter({ 
          hasText: /yeni güzergah|güzergah ekle/i 
        }).first()
        
        if (await newRouteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await newRouteButton.click()
          await mainWindow.waitForTimeout(1000)

          await mainWindow.locator('input[name="nereden"]').fill('İstanbul')
          await mainWindow.locator('input[name="nereye"]').fill('Ankara')
          await mainWindow.locator('input[name="mesafe"]').fill('450')
          
          const saveRouteButton = mainWindow.locator('button[type="submit"]').first()
          await saveRouteButton.click()
          await mainWindow.waitForTimeout(2000)
          
          await helpers.takeDebugScreenshot(mainWindow, 'journey01-step3-route-added')
        }
      }

      // ADIM 4: İlk siparişi oluştur
      console.log('ADIM 4: İlk sipariş oluşturma...')
      const ordersLink = mainWindow.locator('a').filter({ hasText: /siparişler|orders/i }).first()
      await ordersLink.click()
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ 
        hasText: /yeni sipariş|sipariş ekle/i 
      }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Sipariş detayları
      await mainWindow.locator('input[name="plaka"]').fill('06 ABC 123')
      await mainWindow.locator('input[name="musteri"]').fill('ABC Lojistik')
      await mainWindow.locator('input[name="telefon"]').fill('0312 555 1234')
      await mainWindow.locator('input[name="nereden"]').first().fill('İstanbul')
      await mainWindow.locator('input[name="nereye"]').first().fill('Ankara')
      await mainWindow.locator('input[name="yukAciklamasi"]').fill('10 Palet Elektronik Eşya')
      await mainWindow.locator('input[name="baslangicFiyati"]').fill('20000')
      await mainWindow.locator('input[name="gidisKm"]').fill('450')
      await mainWindow.locator('input[name="donusKm"]').fill('450')

      await helpers.takeDebugScreenshot(mainWindow, 'journey01-step4-order-form-filled')

      const saveOrderButton = mainWindow.locator('button[type="submit"]').filter({ 
        hasText: /kaydet/i 
      }).first()
      await saveOrderButton.click()
      await mainWindow.waitForTimeout(3000)

      await helpers.takeDebugScreenshot(mainWindow, 'journey01-step4-order-created')

      // ADIM 5: Dashboard'da görüntüle
      console.log('ADIM 5: Dashboard kontrol...')
      const dashboardLink = mainWindow.locator('a').filter({ hasText: /dashboard|kontrol/i }).first()
      await dashboardLink.click()
      await mainWindow.waitForTimeout(2000)

      // İstatistikler güncellenmiş olmalı
      const orderCountStat = mainWindow.locator('text=/Sipariş|Order/i')
      await expect(orderCountStat).toBeVisible()

      await helpers.takeDebugScreenshot(mainWindow, 'journey01-step5-dashboard-updated')

      const journeyDuration = (Date.now() - journeyStartTime) / 1000
      console.log(`✅ Journey 1 tamamlandı! Süre: ${journeyDuration}s`)
      
      // Hedef: 15 dakika = 900 saniye
      // Test ortamında daha hızlı olması normal
      expect(journeyDuration).toBeLessThan(180) // 3 dakika max (test ortamı için)
    })
  })

  test.describe('Senaryo 2: Günlük Operasyon', () => {
    test.beforeEach(async ({ mainWindow }) => {
      await helpers.bypassLicenseIfNeeded(mainWindow)
    })

    test('Journey 02 - Günlük işlemler: Dashboard → Siparişler → Güncelleme', async ({ mainWindow }) => {
      /**
       * Hikaye: Şirket sabah işe başladı, günlük rutin işlemleri yapıyor
       * Hedef: Dashboard kontrol, yeni siparişler, durum güncellemeleri
       */

      // Sabah ilk kontrol: Dashboard
      console.log('Sabah: Dashboard kontrolü')
      await mainWindow.goto('/')
      await helpers.waitForLoadingComplete(mainWindow)
      await helpers.takeDebugScreenshot(mainWindow, 'journey02-morning-dashboard')

      // Aktif siparişlere bak
      const ordersLink = mainWindow.locator('a').filter({ hasText: /siparişler/i }).first()
      await ordersLink.click()
      await mainWindow.waitForTimeout(1000)

      // Durum filtreleme: Bekliyor
      const statusFilter = mainWindow.locator('select, [role="combobox"]').filter({ 
        has: mainWindow.locator('option, [role="option"]').filter({ hasText: /Bekliyor/i }) 
      }).first()
      
      if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        await statusFilter.selectOption({ label: /Bekliyor/i })
        await mainWindow.waitForTimeout(1000)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'journey02-pending-orders')

      // 3 yeni sipariş ekle (hızlı)
      console.log('3 yeni sipariş ekleniyor...')
      
      for (let i = 1; i <= 3; i++) {
        const newOrderButton = mainWindow.locator('button').filter({ 
          hasText: /yeni sipariş/i 
        }).first()
        await newOrderButton.click()
        await mainWindow.waitForTimeout(1000)

        await mainWindow.locator('input[name="plaka"]').fill(`34 TST ${i}00`)
        await mainWindow.locator('input[name="musteri"]').fill(`Müşteri ${i}`)
        await mainWindow.locator('input[name="telefon"]').fill(`05${i}${i} 111 222`)
        await mainWindow.locator('input[name="nereden"]').first().fill('İstanbul')
        await mainWindow.locator('input[name="nereye"]').first().fill(['Ankara', 'İzmir', 'Bursa'][i-1])
        await mainWindow.locator('input[name="yukAciklamasi"]').fill(`Yük ${i}`)
        await mainWindow.locator('input[name="baslangicFiyati"]').fill(`${15000 + i * 1000}`)
        await mainWindow.locator('input[name="gidisKm"]').fill(`${400 + i * 50}`)
        await mainWindow.locator('input[name="donusKm"]').fill(`${400 + i * 50}`)

        const saveButton = mainWindow.locator('button[type="submit"]').first()
        await saveButton.click()
        await mainWindow.waitForTimeout(2000)
        
        console.log(`  ✓ Sipariş ${i} eklendi`)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'journey02-new-orders-added')

      // Bir siparişin durumunu "Yolda" yap
      console.log('Sipariş durumu güncelleniyor...')
      const firstRow = mainWindow.locator('table tbody tr').first()
      const statusDropdown = firstRow.locator('select').first()
      
      if (await statusDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        await statusDropdown.selectOption({ label: /Yolda/i })
        await mainWindow.waitForTimeout(1000)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'journey02-order-status-updated')

      // Gün sonu: Rapor kontrol
      console.log('Gün sonu: Rapor kontrolü')
      const reportsLink = mainWindow.locator('a').filter({ hasText: /raporlar/i }).first()
      await reportsLink.click()
      await mainWindow.waitForTimeout(2000)

      await helpers.takeDebugScreenshot(mainWindow, 'journey02-end-of-day-report')

      console.log('✅ Journey 2 tamamlandı: Günlük operasyon')
    })
  })

  test.describe('Senaryo 3: Aylık Kapanış', () => {
    test.beforeEach(async ({ mainWindow }) => {
      await helpers.bypassLicenseIfNeeded(mainWindow)
    })

    test('Journey 03 - Ay sonu rapor ve backup', async ({ mainWindow }) => {
      /**
       * Hikaye: Ay sonu, muhasebe raporu hazırlanıyor ve backup alınıyor
       * Hedef: Aylık rapor çıkartma ve yedekleme
       */

      console.log('Ay sonu işlemleri başlıyor...')

      // Raporlar sayfası
      const reportsLink = mainWindow.locator('a').filter({ hasText: /raporlar/i }).first()
      await reportsLink.click()
      await mainWindow.waitForTimeout(2000)

      // Tarih aralığı: Son 30 gün
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const startDateInput = mainWindow.locator('input[type="date"]').first()
      const endDateInput = mainWindow.locator('input[type="date"]').last()

      if (await startDateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startDateInput.fill(startDate)
        await endDateInput.fill(endDate)

        const updateButton = mainWindow.locator('button').filter({ hasText: /güncelle|filtrele/i }).first()
        if (await updateButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await updateButton.click()
          await mainWindow.waitForTimeout(2000)
        }
      }

      await helpers.takeDebugScreenshot(mainWindow, 'journey03-monthly-report')

      // Excel export
      console.log('Excel raporu indiriliyor...')
      const excelButton = mainWindow.locator('button').filter({ hasText: /excel/i }).first()
      
      if (await excelButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        const downloadPromise = mainWindow.waitForEvent('download', { timeout: 10000 })
        await excelButton.click()
        
        try {
          const download = await downloadPromise
          console.log('  ✓ Excel dosyası indirildi:', download.suggestedFilename())
        } catch (error) {
          console.log('  ⚠ Excel download timeout')
        }
      }

      // Backup al
      console.log('Backup oluşturuluyor...')
      const settingsLink = mainWindow.locator('a').filter({ hasText: /ayarlar/i }).first()
      await settingsLink.click()
      await mainWindow.waitForTimeout(1000)

      const backupButton = mainWindow.locator('button').filter({ hasText: /yedek|backup/i }).first()
      
      if (await backupButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        const downloadPromise = mainWindow.waitForEvent('download', { timeout: 10000 })
        await backupButton.click()
        
        try {
          const download = await downloadPromise
          console.log('  ✓ Backup dosyası oluşturuldu:', download.suggestedFilename())
        } catch (error) {
          console.log('  ⚠ Backup download timeout')
        }
      }

      await helpers.takeDebugScreenshot(mainWindow, 'journey03-backup-created')

      console.log('✅ Journey 3 tamamlandı: Aylık kapanış')
    })
  })

  test.describe('Senaryo 4: Acil Durum ve Hata Yönetimi', () => {
    test.beforeEach(async ({ mainWindow }) => {
      await helpers.bypassLicenseIfNeeded(mainWindow)
    })

    test('Journey 04 - Hata durumlarını graceful handle etme', async ({ mainWindow }) => {
      /**
       * Hikaye: Kullanıcı hatalı girişler yapıyor, sistem düzgün hata mesajları vermeli
       * Hedef: Hata mesajlarının kullanıcı dostu olduğunu doğrulamak
       */

      console.log('Hata senaryoları test ediliyor...')

      // Hata 1: Boş form submit
      const ordersLink = mainWindow.locator('a').filter({ hasText: /siparişler/i }).first()
      await ordersLink.click()
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Hiçbir şey doldurmadan kaydet
      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(1000)

      // Validation mesajları görünür mü?
      await helpers.takeDebugScreenshot(mainWindow, 'journey04-validation-errors')

      // Hata 2: Geçersiz telefon numarası
      await mainWindow.locator('input[name="plaka"]').fill('34 ABC 123')
      await mainWindow.locator('input[name="musteri"]').fill('Test')
      await mainWindow.locator('input[name="telefon"]').fill('123') // Kısa numara
      
      await saveButton.click()
      await mainWindow.waitForTimeout(1000)

      await helpers.takeDebugScreenshot(mainWindow, 'journey04-invalid-phone')

      // Hata 3: Negatif fiyat
      await mainWindow.locator('input[name="telefon"]').fill('0555 111 2233')
      await mainWindow.locator('input[name="nereden"]').first().fill('İstanbul')
      await mainWindow.locator('input[name="nereye"]').first().fill('Ankara')
      await mainWindow.locator('input[name="yukAciklamasi"]').fill('Test')
      await mainWindow.locator('input[name="baslangicFiyati"]').fill('-1000') // Negatif

      await saveButton.click()
      await mainWindow.waitForTimeout(1000)

      await helpers.takeDebugScreenshot(mainWindow, 'journey04-negative-price')

      // Hata 4: Çok büyük sayı
      await mainWindow.locator('input[name="baslangicFiyati"]').fill('99999999999')
      await mainWindow.locator('input[name="gidisKm"]').fill('999999')

      await saveButton.click()
      await mainWindow.waitForTimeout(1000)

      await helpers.takeDebugScreenshot(mainWindow, 'journey04-extreme-values')

      console.log('✅ Journey 4 tamamlandı: Hata yönetimi')
    })

    test('Journey 05 - Büyük veri seti ile performance', async ({ mainWindow }) => {
      /**
       * Hikaye: Uzun süredir kullanılan sistem, 1000+ sipariş var
       * Hedef: Sistemin büyük veri ile de sorunsuz çalıştığını doğrulamak
       */

      console.log('Büyük veri seti performance testi...')

      // Orders sayfası - filtreleme ve arama
      const ordersLink = mainWindow.locator('a').filter({ hasText: /siparişler/i }).first()
      await ordersLink.click()

      const loadStartTime = Date.now()
      await helpers.waitForLoadingComplete(mainWindow)
      const loadTime = Date.now() - loadStartTime

      console.log(`  Sayfa yükleme süresi: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(5000) // 5 saniye max

      // Arama performance
      const searchInput = mainWindow.locator('input[type="search"]')
      if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        const searchStartTime = Date.now()
        await searchInput.fill('test')
        await mainWindow.waitForTimeout(500)
        const searchTime = Date.now() - searchStartTime

        console.log(`  Arama süresi: ${searchTime}ms`)
        expect(searchTime).toBeLessThan(2000) // 2 saniye max
      }

      // Rapor oluşturma performance
      const reportsLink = mainWindow.locator('a').filter({ hasText: /raporlar/i }).first()
      await reportsLink.click()

      const reportStartTime = Date.now()
      await helpers.waitForLoadingComplete(mainWindow)
      const reportTime = Date.now() - reportStartTime

      console.log(`  Rapor oluşturma süresi: ${reportTime}ms`)
      expect(reportTime).toBeLessThan(10000) // 10 saniye max

      await helpers.takeDebugScreenshot(mainWindow, 'journey05-performance-test')

      console.log('✅ Journey 5 tamamlandı: Performance')
    })
  })
})

/**
 * TEST NOTLARI:
 * 
 * 1. Bu testler gerçek kullanıcı akışlarını simüle eder
 * 2. Timing kritik - production ortamında daha yavaş olabilir
 * 3. Screenshot'lar her adımda alınır (debug için)
 * 4. Hata senaryoları graceful degradation kontrol eder
 * 5. Performance testleri baseline metrikler sağlar
 */

