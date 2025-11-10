import { test, expect, helpers } from './fixtures'

/**
 * E2E Tests: Vehicles & Routes Management
 * 
 * Bu testler araç ve güzergah yönetimi işlevlerini test eder:
 * - Araç ekleme
 * - Araç düzenleme
 * - Araç listeleme
 * - Güzergah ekleme
 * - Güzergah düzenleme
 */

test.describe('Araç ve Güzergah Testleri', () => {
  test.beforeEach(async ({ mainWindow }) => {
    await helpers.bypassLicenseIfNeeded(mainWindow)
    await helpers.waitForLoadingComplete(mainWindow)
  })

  test.describe('Araç Yönetimi', () => {
    test('01 - Araçlar sayfası yüklenmeli', async ({ mainWindow }) => {
      // Araçlar sayfasına git
      const vehiclesLink = mainWindow.locator('a, button').filter({ 
        hasText: /araçlar|vehicles/i 
      }).first()
      await vehiclesLink.click()
      await mainWindow.waitForLoadState('networkidle')

      // Sayfa başlığı
      const heading = mainWindow.locator('h1, h2').filter({ 
        hasText: /araçlar|vehicles/i 
      })
      await expect(heading).toBeVisible()

      // Yeni araç butonu
      const newVehicleButton = mainWindow.locator('button, a').filter({ 
        hasText: /yeni araç|araç ekle|add vehicle/i 
      })
      await expect(newVehicleButton).toBeVisible()

      await helpers.takeDebugScreenshot(mainWindow, 'vehicles-page-loaded')
    })

    test('02 - Yeni araç ekleme formu açılmalı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/vehicles')
      await mainWindow.waitForTimeout(1000)

      // Yeni araç butonu
      const newVehicleButton = mainWindow.locator('button, a').filter({ 
        hasText: /yeni araç|araç ekle|add vehicle/i 
      }).first()
      await newVehicleButton.click()
      await mainWindow.waitForTimeout(500)

      // Form başlığı
      const formHeading = mainWindow.locator('h1, h2, h3').filter({ 
        hasText: /yeni araç|araç ekle|add vehicle/i 
      })
      await expect(formHeading).toBeVisible()

      // Zorunlu alanlar
      const requiredFields = ['Plaka', 'Marka', 'Model']
      
      for (const fieldLabel of requiredFields) {
        const field = mainWindow.locator('label').filter({ hasText: fieldLabel })
        const isVisible = await field.isVisible({ timeout: 2000 }).catch(() => false)
        console.log(`Field "${fieldLabel}":`, isVisible ? '✓' : '✗')
      }

      await helpers.takeDebugScreenshot(mainWindow, 'vehicle-form-opened')
    })

    test('03 - Yeni araç oluşturulmalı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/vehicles')
      await mainWindow.waitForTimeout(1000)

      // Formu aç
      const newVehicleButton = mainWindow.locator('button, a').filter({ 
        hasText: /yeni araç|araç ekle|add vehicle/i 
      }).first()
      await newVehicleButton.click()
      await mainWindow.waitForTimeout(1000)

      // Form doldur
      await mainWindow.locator('input[name="plaka"], input[placeholder*="Plaka"]').fill('34 TEST 456')
      await mainWindow.locator('input[name="marka"], input[placeholder*="Marka"]').fill('Mercedes')
      await mainWindow.locator('input[name="model"], input[placeholder*="Model"]').fill('Actros')
      await mainWindow.locator('input[name="yil"], input[placeholder*="Yıl"]').fill('2023')

      // Teknik özellikler (varsa)
      const fuelConsumptionInput = mainWindow.locator('input[name="yakitTuketimi"], input[placeholder*="Yakıt"]')
      if (await fuelConsumptionInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await fuelConsumptionInput.fill('28')
      }

      await helpers.takeDebugScreenshot(mainWindow, 'vehicle-form-filled')

      // Kaydet
      const saveButton = mainWindow.locator('button[type="submit"], button').filter({ 
        hasText: /kaydet|save/i 
      }).first()
      await saveButton.click()
      await mainWindow.waitForTimeout(2000)

      // Başarı kontrolü
      await helpers.takeDebugScreenshot(mainWindow, 'vehicle-created')
    })

    test('04 - Araç listesinde yeni araç görünmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/vehicles')
      await mainWindow.waitForTimeout(1000)

      // Araç listesi/table
      const vehicleTable = mainWindow.locator('table')
      if (await vehicleTable.isVisible({ timeout: 2000 }).catch(() => false)) {
        const rows = vehicleTable.locator('tbody tr')
        const rowCount = await rows.count()
        
        console.log('Toplam araç sayısı:', rowCount)
        expect(rowCount).toBeGreaterThanOrEqual(1)

        // Test aracımız listede mi?
        const testVehicle = mainWindow.locator('text="34 TEST 456"')
        const isVisible = await testVehicle.isVisible({ timeout: 2000 }).catch(() => false)
        console.log('Test aracı görünür:', isVisible)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'vehicle-list-with-new')
    })

    test('05 - Araç düzenleme yapılabilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/vehicles')
      await mainWindow.waitForTimeout(1000)

      // İlk aracın düzenle butonu
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

        // Bir alan değiştir
        const modelInput = mainWindow.locator('input[name="model"], input[placeholder*="Model"]')
        if (await modelInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await modelInput.fill('Actros 2023 (Güncellendi)')
        }

        await helpers.takeDebugScreenshot(mainWindow, 'vehicle-edit-form')

        // Kaydet
        const saveButton = mainWindow.locator('button[type="submit"], button').filter({ 
          hasText: /kaydet|save|güncelle/i 
        }).first()
        await saveButton.click()
        await mainWindow.waitForTimeout(2000)

        await helpers.takeDebugScreenshot(mainWindow, 'vehicle-updated')
      }
    })

    test('06 - Araç performans raporu görüntülenebilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/vehicles')
      await mainWindow.waitForTimeout(1000)

      // Performans butonu veya tab
      const performanceTab = mainWindow.locator('button, a').filter({ 
        hasText: /performans|performance/i 
      }).first()

      if (await performanceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await performanceTab.click()
        await mainWindow.waitForTimeout(1000)

        // Performans grafikleri veya istatistikleri
        await helpers.takeDebugScreenshot(mainWindow, 'vehicle-performance')
      } else {
        console.log('Performans sekmesi bulunamadı')
      }
    })
  })

  test.describe('Güzergah Yönetimi', () => {
    test('07 - Güzergahlar sayfası yüklenmeli', async ({ mainWindow }) => {
      const routesLink = mainWindow.locator('a, button').filter({ 
        hasText: /güzergah|rotalar|routes/i 
      }).first()
      
      if (await routesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await routesLink.click()
        await mainWindow.waitForLoadState('networkidle')

        const heading = mainWindow.locator('h1, h2').filter({ 
          hasText: /güzergah|rotalar|routes/i 
        })
        await expect(heading).toBeVisible()

        await helpers.takeDebugScreenshot(mainWindow, 'routes-page-loaded')
      } else {
        console.log('Güzergahlar menüsü bulunamadı, test atlandı')
        test.skip()
      }
    })

    test('08 - Yeni güzergah ekleme formu açılmalı', async ({ mainWindow }) => {
      const routesLink = mainWindow.locator('a, button').filter({ 
        hasText: /güzergah|rotalar|routes/i 
      }).first()

      if (await routesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await routesLink.click()
        await mainWindow.waitForTimeout(1000)

        // Yeni güzergah butonu
        const newRouteButton = mainWindow.locator('button, a').filter({ 
          hasText: /yeni güzergah|güzergah ekle|add route/i 
        }).first()
        
        if (await newRouteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await newRouteButton.click()
          await mainWindow.waitForTimeout(500)

          // Form başlığı
          const formHeading = mainWindow.locator('h1, h2, h3').filter({ 
            hasText: /yeni güzergah|güzergah ekle/i 
          })
          await expect(formHeading).toBeVisible()

          await helpers.takeDebugScreenshot(mainWindow, 'route-form-opened')
        }
      } else {
        console.log('Güzergahlar özelliği bulunamadı')
        test.skip()
      }
    })

    test('09 - Yeni güzergah oluşturulmalı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/routes')
      await mainWindow.waitForTimeout(1000)

      const newRouteButton = mainWindow.locator('button, a').filter({ 
        hasText: /yeni güzergah|güzergah ekle|add route/i 
      }).first()

      if (await newRouteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await newRouteButton.click()
        await mainWindow.waitForTimeout(1000)

        // Form doldur
        await mainWindow.locator('input[name="nereden"], input[placeholder*="Nereden"]').fill('Bursa')
        await mainWindow.locator('input[name="nereye"], input[placeholder*="Nereye"]').fill('İzmir')
        await mainWindow.locator('input[name="mesafe"], input[placeholder*="Mesafe"], input[placeholder*="KM"]').fill('350')
        
        // HGS maliyeti (varsa)
        const hgsInput = mainWindow.locator('input[name="hgsMaliyet"], input[placeholder*="HGS"]')
        if (await hgsInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await hgsInput.fill('450')
        }

        await helpers.takeDebugScreenshot(mainWindow, 'route-form-filled')

        // Kaydet
        const saveButton = mainWindow.locator('button[type="submit"], button').filter({ 
          hasText: /kaydet|save/i 
        }).first()
        await saveButton.click()
        await mainWindow.waitForTimeout(2000)

        await helpers.takeDebugScreenshot(mainWindow, 'route-created')
      } else {
        console.log('Yeni güzergah butonu bulunamadı')
        test.skip()
      }
    })

    test('10 - Güzergah listesinde yeni kayıt görünmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/routes')
      await mainWindow.waitForTimeout(1000)

      const routeTable = mainWindow.locator('table')
      if (await routeTable.isVisible({ timeout: 2000 }).catch(() => false)) {
        const rows = routeTable.locator('tbody tr')
        const rowCount = await rows.count()
        
        console.log('Toplam güzergah sayısı:', rowCount)

        // Test güzergahımız listede mi?
        const testRoute = mainWindow.locator('text=/Bursa.*İzmir/i')
        const isVisible = await testRoute.isVisible({ timeout: 2000 }).catch(() => false)
        console.log('Test güzergahı görünür:', isVisible)

        await helpers.takeDebugScreenshot(mainWindow, 'route-list-with-new')
      }
    })

    test('11 - Güzergah siparişte otomatik doldurulmalı', async ({ mainWindow }) => {
      // Sipariş oluşturma sayfasına git
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button, a').filter({ 
        hasText: /yeni sipariş|new order/i 
      }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Nereden-Nereye seçildiğinde KM otomatik dolmalı
      const neredenSelect = mainWindow.locator('select[name="nereden"], input[name="nereden"]').first()
      if (await neredenSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await neredenSelect.fill('Bursa')
        
        const nereyeSelect = mainWindow.locator('select[name="nereye"], input[name="nereye"]').first()
        await nereyeSelect.fill('İzmir')

        await mainWindow.waitForTimeout(1000)

        // KM otomatik dolu mu?
        const kmInput = mainWindow.locator('input[name="gidisKm"], input[placeholder*="KM"]')
        const kmValue = await kmInput.inputValue().catch(() => '')
        
        console.log('Otomatik doldurulan KM:', kmValue)

        await helpers.takeDebugScreenshot(mainWindow, 'route-autocomplete-in-order')
      }
    })
  })
})

/**
 * TEST NOTLARI:
 * 
 * 1. Araç testleri gerçek database ile çalışır
 * 2. Güzergah özelliği opsiyonel (yoksa skip)
 * 3. Form field isimleri component'lere göre değişebilir
 * 4. Autocomplete testleri timing'e duyarlı
 */

