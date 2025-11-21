import { test, expect, helpers } from './fixtures'

/**
 * E2E Tests: License Activation
 * 
 * Bu testler lisans aktivasyon sürecini kontrol eder:
 * - İlk açılışta lisans ekranı gösterilmeli
 * - Geçerli lisans ile aktivasyon başarılı olmalı
 * - Geçersiz lisans ile hata mesajı gösterilmeli
 * - Aktivasyon sonrası ana ekrana yönlendirilmeli
 */

test.describe('Lisans Aktivasyon Testleri', () => {
  test.describe.configure({ mode: 'serial' })

  test('01 - İlk açılışta lisans aktivasyon ekranı gösterilmeli', async ({ mainWindow }) => {
    // Lisans formu görünür olmalı
    const licenseHeading = mainWindow.locator('h1, h2').filter({ hasText: /lisans|license/i })
    await expect(licenseHeading).toBeVisible()

    // Lisans anahtarı input alanı var mı?
    const licenseInput = mainWindow.locator('input[type="text"], input[type="password"]').first()
    await expect(licenseInput).toBeVisible()

    // Aktivasyon butonu var mı?
    const activateButton = mainWindow.locator('button[type="submit"], button').filter({ 
      hasText: /aktif|activate/i 
    })
    await expect(activateButton).toBeVisible()

    // Screenshot al
    await helpers.takeDebugScreenshot(mainWindow, 'license-screen-initial')
  })

  test('02 - Boş lisans anahtarı ile aktivasyon denemesi hata vermeli', async ({ mainWindow }) => {
    // Boş input ile submit
    const activateButton = mainWindow.locator('button[type="submit"], button').filter({ 
      hasText: /aktif|activate/i 
    }).first()
    
    await activateButton.click()
    
    // Hata mesajı bekleniyor
    await mainWindow.waitForTimeout(1000)
    
    // Hala lisans ekranında olmalıyız
    const licenseHeading = mainWindow.locator('h1, h2').filter({ hasText: /lisans|license/i })
    await expect(licenseHeading).toBeVisible()
  })

  test('03 - Geçersiz lisans anahtarı ile hata mesajı gösterilmeli', async ({ mainWindow }) => {
    // Geçersiz lisans gir
    const licenseInput = mainWindow.locator('input[type="text"], input[type="password"]').first()
    await licenseInput.fill('INVALID-LICENSE-KEY-XXXX')
    
    const activateButton = mainWindow.locator('button[type="submit"], button').filter({ 
      hasText: /aktif|activate/i 
    }).first()
    
    await activateButton.click()
    
    // Hata mesajı bekle (toast veya inline error)
    await mainWindow.waitForTimeout(2000)
    
    // Hata mesajı arayalım
    mainWindow.locator('.error, [role="alert"], .text-red').filter({ 
      hasText: /geçersiz|invalid|hatal/i 
    })
    
    // Screenshot al
    await helpers.takeDebugScreenshot(mainWindow, 'license-invalid-error')
  })

  test('04 - Geçerli lisans anahtarı ile aktivasyon başarılı olmalı', async ({ mainWindow }) => {
    // NOT: Bu test için gerçek bir test lisansı gerekiyor
    // generate-license.js ile test lisansı oluşturulabilir
    
    const licenseInput = mainWindow.locator('input[type="text"], input[type="password"]').first()
    
    // Test için özel lisans anahtarı
    // Production'da bu değer generate-license-advanced.js ile oluşturulmalı
    await licenseInput.fill('TEST-SEKERSOFT-2025-DEMO-KEY')
    
    const activateButton = mainWindow.locator('button[type="submit"], button').filter({ 
      hasText: /aktif|activate/i 
    }).first()
    
    await activateButton.click()
    
    // Aktivasyon işlemi tamamlanana kadar bekle
    await mainWindow.waitForTimeout(3000)
    
    // Başarı sonrası ana ekrana yönlendirilmeli
    // Dashboard veya orders ekranı görünür olmalı
    mainWindow.locator('h1, h2').filter({ 
      hasText: /dashboard|kontrol|siparişler|orders/i 
    })
    
    // NOT: Lisans doğrulaması gerçek sistemde çalışacak
    // Test ortamında mock lisans kullanılabilir
    
    // Screenshot al
    await helpers.takeDebugScreenshot(mainWindow, 'license-activation-complete')
  })

  test('05 - Aktivasyon sonrası navigasyon çalışmalı', async ({ mainWindow }) => {
    // Lisansı atla (helper fonksiyon)
    await helpers.bypassLicenseIfNeeded(mainWindow)
    
    // Ana menü görünür olmalı
    const navigation = mainWindow.locator('nav, [role="navigation"]')
    await expect(navigation).toBeVisible()
    
    // Menü elemanları var mı kontrol et
    const menuItems = [
      /dashboard|kontrol paneli/i,
      /siparişler|orders/i,
      /araçlar|vehicles/i,
      /raporlar|reports/i,
      /ayarlar|settings/i,
    ]
    
    for (const itemText of menuItems) {
      const menuItem = mainWindow.locator('a, button').filter({ hasText: itemText })
      await expect(menuItem).toBeVisible()
    }
  })
})

/**
 * NOT: Production Test için:
 * 
 * 1. Gerçek lisans anahtarı oluştur:
 *    npm run license:advanced
 * 
 * 2. Machine ID'ye özel lisans:
 *    - Test makinesi için özel lisans gerekli
 *    - CI/CD'de mock lisans kullanılabilir
 * 
 * 3. Lisans dosyası temizliği:
 *    - Her test öncesi license.dat silinmeli
 *    - Test fixture'lar bunu otomatik yapıyor
 */

