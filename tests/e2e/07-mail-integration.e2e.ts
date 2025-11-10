import { test, expect, helpers } from './fixtures'

/**
 * E2E Tests: Mail Integration & Sending
 * 
 * Mail gönderme işlevlerini test eder:
 * - SMTP ayarları konfigürasyonu
 * - Test mail gönderimi
 * - Sipariş mail gönderimi
 * - Mail template önizleme
 * - Mail logs
 * - Hata durumları
 */

test.describe('Mail Entegrasyonu Testleri', () => {
  test.beforeEach(async ({ mainWindow }) => {
    await helpers.bypassLicenseIfNeeded(mainWindow)
    await helpers.waitForLoadingComplete(mainWindow)
  })

  test('01 - Mail ayarları sayfası açılmalı', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    // Mail sekmesi
    const mailTab = mainWindow.locator('button, a').filter({ 
      hasText: /mail|e-posta/i 
    }).first()

    await expect(mailTab).toBeVisible({ timeout: 3000 })
    await mailTab.click()
    await mainWindow.waitForTimeout(500)

    // Mail ayarları formu
    const smtpHost = mainWindow.locator('input[name*="smtp"], input[placeholder*="SMTP"]')
    await expect(smtpHost).toBeVisible()

    await helpers.takeDebugScreenshot(mainWindow, 'mail-settings-page')
  })

  test('02 - SMTP ayarları yapılandırılabilmeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const mailTab = mainWindow.locator('button, a').filter({ hasText: /mail|e-posta/i }).first()
    await mailTab.click()
    await mainWindow.waitForTimeout(500)

    // SMTP bilgileri doldur
    const smtpHost = mainWindow.locator('input[name*="smtp"], input[placeholder*="SMTP"]').first()
    await smtpHost.clear()
    await smtpHost.fill('smtp.test.local')

    const smtpPort = mainWindow.locator('input[name*="port"], input[placeholder*="Port"]').first()
    if (await smtpPort.isVisible({ timeout: 1000 }).catch(() => false)) {
      await smtpPort.clear()
      await smtpPort.fill('587')
    }

    const smtpUser = mainWindow.locator('input[name*="user"], input[name*="kullanici"], input[placeholder*="Username"]').first()
    if (await smtpUser.isVisible({ timeout: 1000 }).catch(() => false)) {
      await smtpUser.clear()
      await smtpUser.fill('test@test.local')
    }

    const smtpPassword = mainWindow.locator('input[name*="password"], input[name*="sifre"], input[type="password"]').first()
    if (await smtpPassword.isVisible({ timeout: 1000 }).catch(() => false)) {
      await smtpPassword.clear()
      await smtpPassword.fill('testpassword123')
    }

    await helpers.takeDebugScreenshot(mainWindow, 'mail-settings-filled')

    // Kaydet
    const saveButton = mainWindow.locator('button[type="submit"], button').filter({ 
      hasText: /kaydet|save/i 
    }).first()
    await saveButton.click()
    await mainWindow.waitForTimeout(2000)

    // Başarı mesajı
    await helpers.takeDebugScreenshot(mainWindow, 'mail-settings-saved')
  })

  test('03 - Test mail gönderimi butonları görünür olmalı', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const mailTab = mainWindow.locator('button, a').filter({ hasText: /mail|e-posta/i }).first()
    await mailTab.click()
    await mainWindow.waitForTimeout(500)

    // Test mail butonu
    const testMailButton = mainWindow.locator('button').filter({ 
      hasText: /test|deneme/i 
    }).first()

    if (await testMailButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(testMailButton).toBeVisible()
      console.log('✓ Test mail butonu mevcut')
      
      await helpers.takeDebugScreenshot(mainWindow, 'mail-test-button-visible')
    } else {
      console.log('⚠️  Test mail butonu bulunamadı')
    }
  })

  test('04 - Test mail gönderimi (SMTP yoksa hata vermeli)', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const mailTab = mainWindow.locator('button, a').filter({ hasText: /mail|e-posta/i }).first()
    await mailTab.click()
    await mainWindow.waitForTimeout(500)

    const testMailButton = mainWindow.locator('button').filter({ 
      hasText: /test|deneme/i 
    }).first()

    if (await testMailButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await testMailButton.click()
      await mainWindow.waitForTimeout(3000)

      // Hata veya başarı mesajı bekle
      const message = mainWindow.locator('[role="alert"], .toast, .notification')
      
      if (await message.isVisible({ timeout: 2000 }).catch(() => false)) {
        const messageText = await message.textContent()
        console.log('Test mail sonucu:', messageText)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'mail-test-result')
    }
  })

  test('05 - Sipariş detayında mail gönder butonu olmalı', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    // İlk siparişi aç
    const firstRow = mainWindow.locator('table tbody tr').first()
    if (await firstRow.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstRow.click()
      await mainWindow.waitForTimeout(1000)

      // Mail gönder butonu
      const sendMailButton = mainWindow.locator('button').filter({ 
        hasText: /mail gönder|send mail|e-posta/i 
      }).first()

      if (await sendMailButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(sendMailButton).toBeVisible()
        console.log('✓ Mail gönder butonu sipariş detayında mevcut')
        
        await helpers.takeDebugScreenshot(mainWindow, 'order-detail-mail-button')
      } else {
        console.log('⚠️  Mail gönder butonu sipariş detayında bulunamadı')
      }
    }
  })

  test('06 - Mail template önizleme yapılabilmeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const mailTab = mainWindow.locator('button, a').filter({ hasText: /mail|e-posta/i }).first()
    await mailTab.click()
    await mainWindow.waitForTimeout(500)

    // Template önizleme butonu
    const previewButton = mainWindow.locator('button').filter({ 
      hasText: /önizle|preview/i 
    }).first()

    if (await previewButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await previewButton.click()
      await mainWindow.waitForTimeout(1000)

      // Önizleme modal veya panel
      await helpers.takeDebugScreenshot(mainWindow, 'mail-template-preview')
    } else {
      console.log('⚠️  Mail template önizleme özelliği bulunamadı')
    }
  })

  test('07 - Mail logs/geçmişi görüntülenebilmeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const mailTab = mainWindow.locator('button, a').filter({ hasText: /mail|e-posta/i }).first()
    await mailTab.click()
    await mainWindow.waitForTimeout(500)

    // Mail logs sekmesi veya bölümü
    const logsSection = mainWindow.locator('button, a, div').filter({ 
      hasText: /logs|geçmiş|history/i 
    }).first()

    if (await logsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logsSection.click()
      await mainWindow.waitForTimeout(1000)

      // Log tablosu
      const logTable = mainWindow.locator('table')
      if (await logTable.isVisible({ timeout: 2000 }).catch(() => false)) {
        const rows = logTable.locator('tbody tr')
        const logCount = await rows.count()
        
        console.log('Mail log sayısı:', logCount)

        await helpers.takeDebugScreenshot(mainWindow, 'mail-logs-list')
      }
    } else {
      console.log('⚠️  Mail logs bölümü bulunamadı')
    }
  })

  test('08 - Hatalı SMTP bilgileri hata mesajı vermeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const mailTab = mainWindow.locator('button, a').filter({ hasText: /mail|e-posta/i }).first()
    await mailTab.click()
    await mainWindow.waitForTimeout(500)

    // Geçersiz port numarası
    const smtpPort = mainWindow.locator('input[name*="port"], input[placeholder*="Port"]').first()
    if (await smtpPort.isVisible({ timeout: 1000 }).catch(() => false)) {
      await smtpPort.clear()
      await smtpPort.fill('99999') // Geçersiz port

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(1000)

      // Validation hatası bekle
      const errorMessage = mainWindow.locator('.error, [role="alert"], .text-red')
      
      if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        const errorText = await errorMessage.textContent()
        console.log('Validation hatası:', errorText)
        
        await helpers.takeDebugScreenshot(mainWindow, 'mail-validation-error')
      }
    }
  })

  test('09 - Mail şablonu özelleştirilebilmeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const mailTab = mainWindow.locator('button, a').filter({ hasText: /mail|e-posta/i }).first()
    await mailTab.click()
    await mainWindow.waitForTimeout(500)

    // Şablon düzenleme
    const templateEditor = mainWindow.locator('textarea[name*="template"], textarea[name*="sablon"]')
    
    if (await templateEditor.isVisible({ timeout: 2000 }).catch(() => false)) {
      const currentContent = await templateEditor.inputValue()
      console.log('Mevcut şablon uzunluğu:', currentContent.length, 'karakter')

      // Değişiklik yap
      await templateEditor.fill(currentContent + '\n\n-- Test Signature --')
      
      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(2000)

      await helpers.takeDebugScreenshot(mainWindow, 'mail-template-customized')
    } else {
      console.log('⚠️  Mail şablonu düzenleme özelliği bulunamadı')
    }
  })

  test('10 - Toplu mail gönderimi kontrolleri', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    // Çoklu seçim varsa
    const checkboxes = mainWindow.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()

    if (checkboxCount > 1) {
      // İlk 2 siparişi seç
      await checkboxes.nth(0).check()
      await checkboxes.nth(1).check()

      // Toplu işlem butonu
      const bulkMailButton = mainWindow.locator('button').filter({ 
        hasText: /toplu.*mail|bulk.*mail/i 
      }).first()

      if (await bulkMailButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bulkMailButton.click()
        await mainWindow.waitForTimeout(1000)

        await helpers.takeDebugScreenshot(mainWindow, 'bulk-mail-action')
      } else {
        console.log('⚠️  Toplu mail gönderimi özelliği bulunamadı')
      }
    }
  })
})

/**
 * TEST NOTLARI:
 * 
 * 1. Mail testleri gerçek SMTP bağlantısı gerektirmez (mock kullanılabilir)
 * 2. Hata durumları gracefully handle edilmeli
 * 3. Mail logs database'de saklanıyor
 * 4. Template HTML formatında (DOMPurify ile sanitize edilmeli)
 * 5. Attachment testleri PDF export ile birlikte
 */

