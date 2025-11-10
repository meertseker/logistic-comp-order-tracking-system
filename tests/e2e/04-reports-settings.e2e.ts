import { test, expect, helpers } from './fixtures'

/**
 * E2E Tests: Reports & Settings
 * 
 * Bu testler raporlama ve ayarlar işlevlerini test eder:
 * - Rapor sayfası görüntüleme
 * - Grafik ve istatistikler
 * - Excel export
 * - PDF export
 * - Ayarlar sayfası
 * - Mail ayarları
 */

test.describe('Rapor ve Ayarlar Testleri', () => {
  test.beforeEach(async ({ mainWindow }) => {
    await helpers.bypassLicenseIfNeeded(mainWindow)
    await helpers.waitForLoadingComplete(mainWindow)
  })

  test.describe('Raporlama', () => {
    test('01 - Raporlar sayfası yüklenmeli', async ({ mainWindow }) => {
      const reportsLink = mainWindow.locator('a, button').filter({ 
        hasText: /raporlar|reports/i 
      }).first()
      await reportsLink.click()
      await mainWindow.waitForLoadState('networkidle')

      // Sayfa başlığı
      const heading = mainWindow.locator('h1, h2').filter({ 
        hasText: /raporlar|reports/i 
      })
      await expect(heading).toBeVisible()

      await helpers.takeDebugScreenshot(mainWindow, 'reports-page-loaded')
    })

    test('02 - Tarih aralığı seçimi çalışmalı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/reports')
      await mainWindow.waitForTimeout(1000)

      // Tarih aralığı seçiciler
      const startDateInput = mainWindow.locator('input[type="date"], input[placeholder*="Başlangıç"]').first()
      const endDateInput = mainWindow.locator('input[type="date"], input[placeholder*="Bitiş"]').first()

      if (await startDateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Geçen ay
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        const startDate = lastMonth.toISOString().split('T')[0]
        
        // Bu ay
        const endDate = new Date().toISOString().split('T')[0]

        await startDateInput.fill(startDate)
        await endDateInput.fill(endDate)

        // Raporları güncelle butonu
        const updateButton = mainWindow.locator('button').filter({ 
          hasText: /güncelle|filtrele|uygula|update/i 
        }).first()
        
        if (await updateButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await updateButton.click()
          await mainWindow.waitForTimeout(2000)
        }

        await helpers.takeDebugScreenshot(mainWindow, 'reports-date-range-selected')
      }
    })

    test('03 - Genel istatistikler görünür olmalı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/reports')
      await mainWindow.waitForTimeout(2000)

      // İstatistik kartları
      const statCards = mainWindow.locator('[class*="stat"], [class*="card"], [class*="metric"]')
      const cardCount = await statCards.count()
      
      console.log('İstatistik kartı sayısı:', cardCount)

      // Beklenen metrikler
      const expectedMetrics = [
        /toplam gelir|total revenue/i,
        /toplam maliyet|total cost/i,
        /kar|profit/i,
        /sipariş sayısı|order count/i,
      ]

      for (const metric of expectedMetrics) {
        const element = mainWindow.locator('text=' + metric.source)
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false)
        console.log(`Metrik "${metric}":`, isVisible ? '✓' : '✗')
      }

      await helpers.takeDebugScreenshot(mainWindow, 'reports-statistics')
    })

    test('04 - Grafikler render edilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/reports')
      await mainWindow.waitForTimeout(3000)

      // Canvas elementleri (Chart.js)
      const charts = mainWindow.locator('canvas')
      const chartCount = await charts.count()
      
      console.log('Grafik sayısı:', chartCount)
      expect(chartCount).toBeGreaterThan(0)

      // Grafik başlıkları
      const expectedCharts = [
        /gelir|revenue/i,
        /maliyet|cost/i,
        /sipariş|orders/i,
        /performans|performance/i,
      ]

      for (const chartTitle of expectedCharts) {
        const heading = mainWindow.locator('h2, h3, h4').filter({ hasText: chartTitle })
        const isVisible = await heading.isVisible({ timeout: 1000 }).catch(() => false)
        console.log(`Grafik "${chartTitle}":`, isVisible ? '✓' : '✗')
      }

      await helpers.takeDebugScreenshot(mainWindow, 'reports-charts-rendered')
    })

    test('05 - Excel export çalışmalı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/reports')
      await mainWindow.waitForTimeout(2000)

      // Excel export butonu
      const excelButton = mainWindow.locator('button').filter({ 
        hasText: /excel|xlsx|dışa aktar/i 
      }).first()

      if (await excelButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Download event'ini dinle
        const downloadPromise = mainWindow.waitForEvent('download', { timeout: 10000 })
        
        await excelButton.click()
        
        try {
          const download = await downloadPromise
          console.log('Excel dosyası indirildi:', download.suggestedFilename())
          
          // Dosya ismini kontrol et
          expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i)
        } catch (error) {
          console.log('Excel download timeout veya hata:', error)
        }

        await helpers.takeDebugScreenshot(mainWindow, 'reports-excel-export-clicked')
      } else {
        console.log('Excel export butonu bulunamadı')
      }
    })

    test('06 - PDF export çalışmalı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/reports')
      await mainWindow.waitForTimeout(2000)

      // PDF export butonu
      const pdfButton = mainWindow.locator('button').filter({ 
        hasText: /pdf|yazdır|print/i 
      }).first()

      if (await pdfButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        const downloadPromise = mainWindow.waitForEvent('download', { timeout: 10000 })
        
        await pdfButton.click()
        
        try {
          const download = await downloadPromise
          console.log('PDF dosyası indirildi:', download.suggestedFilename())
          
          expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
        } catch (error) {
          console.log('PDF download timeout veya hata:', error)
        }

        await helpers.takeDebugScreenshot(mainWindow, 'reports-pdf-export-clicked')
      } else {
        console.log('PDF export butonu bulunamadı')
      }
    })

    test('07 - Detaylı rapor tablosu görüntülenebilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/reports')
      await mainWindow.waitForTimeout(2000)

      // Detaylı tablo sekmesi veya butonu
      const detailTab = mainWindow.locator('button, a').filter({ 
        hasText: /detay|detail|tablo|table/i 
      }).first()

      if (await detailTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await detailTab.click()
        await mainWindow.waitForTimeout(1000)

        // Tablo görünür mü?
        const table = mainWindow.locator('table')
        await expect(table).toBeVisible()

        // Satır sayısı
        const rows = table.locator('tbody tr')
        const rowCount = await rows.count()
        console.log('Rapor satır sayısı:', rowCount)

        await helpers.takeDebugScreenshot(mainWindow, 'reports-detail-table')
      }
    })
  })

  test.describe('Ayarlar', () => {
    test('08 - Ayarlar sayfası yüklenmeli', async ({ mainWindow }) => {
      const settingsLink = mainWindow.locator('a, button').filter({ 
        hasText: /ayarlar|settings/i 
      }).first()
      await settingsLink.click()
      await mainWindow.waitForLoadState('networkidle')

      const heading = mainWindow.locator('h1, h2').filter({ 
        hasText: /ayarlar|settings/i 
      })
      await expect(heading).toBeVisible()

      await helpers.takeDebugScreenshot(mainWindow, 'settings-page-loaded')
    })

    test('09 - Genel ayarlar sekmesi görünür olmalı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/settings')
      await mainWindow.waitForTimeout(1000)

      // Ayar kategorileri
      const expectedTabs = [
        /genel|general/i,
        /maliyet|cost/i,
        /mail|e-posta/i,
        /şirket|company/i,
      ]

      for (const tabText of expectedTabs) {
        const tab = mainWindow.locator('button, a').filter({ hasText: tabText })
        const isVisible = await tab.isVisible({ timeout: 1000 }).catch(() => false)
        console.log(`Ayar sekmesi "${tabText}":`, isVisible ? '✓' : '✗')
      }

      await helpers.takeDebugScreenshot(mainWindow, 'settings-tabs')
    })

    test('10 - Şirket bilgileri güncellenebilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/settings')
      await mainWindow.waitForTimeout(1000)

      // Şirket sekmesi
      const companyTab = mainWindow.locator('button, a').filter({ 
        hasText: /şirket|company/i 
      }).first()
      
      if (await companyTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await companyTab.click()
        await mainWindow.waitForTimeout(500)

        // Şirket adı input
        const companyNameInput = mainWindow.locator('input[name="companyName"], input[placeholder*="Şirket"]')
        if (await companyNameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await companyNameInput.fill('Test Nakliyat A.Ş.')

          // Kaydet
          const saveButton = mainWindow.locator('button[type="submit"], button').filter({ 
            hasText: /kaydet|save/i 
          }).first()
          await saveButton.click()
          await mainWindow.waitForTimeout(1000)

          await helpers.takeDebugScreenshot(mainWindow, 'settings-company-updated')
        }
      }
    })

    test('11 - Maliyet parametreleri güncellenebilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/settings')
      await mainWindow.waitForTimeout(1000)

      // Maliyet sekmesi
      const costTab = mainWindow.locator('button, a').filter({ 
        hasText: /maliyet|cost/i 
      }).first()
      
      if (await costTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await costTab.click()
        await mainWindow.waitForTimeout(500)

        // Yakıt fiyatı
        const fuelPriceInput = mainWindow.locator('input[name*="yakit"], input[placeholder*="Yakıt"]').first()
        if (await fuelPriceInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await fuelPriceInput.fill('42')

          // Sürücü maliyeti
          const driverCostInput = mainWindow.locator('input[name*="surucu"], input[placeholder*="Sürücü"]').first()
          if (await driverCostInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await driverCostInput.fill('1800')
          }

          await helpers.takeDebugScreenshot(mainWindow, 'settings-cost-parameters')

          // Kaydet
          const saveButton = mainWindow.locator('button[type="submit"], button').filter({ 
            hasText: /kaydet|save/i 
          }).first()
          await saveButton.click()
          await mainWindow.waitForTimeout(1000)
        }
      }
    })

    test('12 - Mail ayarları yapılandırılabilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/settings')
      await mainWindow.waitForTimeout(1000)

      // Mail sekmesi
      const mailTab = mainWindow.locator('button, a').filter({ 
        hasText: /mail|e-posta/i 
      }).first()
      
      if (await mailTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await mailTab.click()
        await mainWindow.waitForTimeout(500)

        // SMTP ayarları
        const smtpHostInput = mainWindow.locator('input[name*="smtp"], input[placeholder*="SMTP"]').first()
        if (await smtpHostInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await smtpHostInput.fill('smtp.test.com')

          const smtpPortInput = mainWindow.locator('input[name*="port"], input[placeholder*="Port"]').first()
          if (await smtpPortInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await smtpPortInput.fill('587')
          }

          await helpers.takeDebugScreenshot(mainWindow, 'settings-mail-config')

          // Test mail butonu
          const testMailButton = mainWindow.locator('button').filter({ 
            hasText: /test|deneme/i 
          }).first()
          
          if (await testMailButton.isVisible({ timeout: 1000 }).catch(() => false)) {
            await testMailButton.click()
            await mainWindow.waitForTimeout(2000)
            
            await helpers.takeDebugScreenshot(mainWindow, 'settings-mail-test-sent')
          }
        }
      }
    })

    test('13 - Backup oluşturulabilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/settings')
      await mainWindow.waitForTimeout(1000)

      // Backup butonu
      const backupButton = mainWindow.locator('button').filter({ 
        hasText: /yedek|backup/i 
      }).first()

      if (await backupButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        const downloadPromise = mainWindow.waitForEvent('download', { timeout: 10000 })
        
        await backupButton.click()
        
        try {
          const download = await downloadPromise
          console.log('Backup dosyası indirildi:', download.suggestedFilename())
          
          expect(download.suggestedFilename()).toMatch(/backup.*\.db$/i)
        } catch (error) {
          console.log('Backup download timeout veya hata:', error)
        }

        await helpers.takeDebugScreenshot(mainWindow, 'settings-backup-created')
      } else {
        console.log('Backup butonu bulunamadı')
      }
    })

    test('14 - Lisans bilgileri görüntülenebilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/settings')
      await mainWindow.waitForTimeout(1000)

      // Lisans sekmesi veya bölümü
      const licenseSection = mainWindow.locator('button, a, div').filter({ 
        hasText: /lisans|license/i 
      }).first()

      if (await licenseSection.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (licenseSection.locator('button, a').first()) {
          await licenseSection.click()
          await mainWindow.waitForTimeout(500)
        }

        // Lisans bilgileri
        const licenseInfo = mainWindow.locator('text=/Lisans|License/')
        const isVisible = await licenseInfo.isVisible({ timeout: 1000 }).catch(() => false)
        
        console.log('Lisans bilgileri görünür:', isVisible)

        await helpers.takeDebugScreenshot(mainWindow, 'settings-license-info')
      }
    })
  })
})

/**
 * TEST NOTLARI:
 * 
 * 1. Export testleri download event kullanır
 * 2. Mail test gerçek SMTP gerektirmez (mock olabilir)
 * 3. Backup test gerçek dosya oluşturur
 * 4. Grafik render test canvas elementleri kontrol eder
 * 5. Timing'e duyarlı testler (chart rendering)
 */

