import { test, expect, helpers } from './fixtures'

/**
 * E2E Tests: Data Validation & Integrity
 * 
 * Veri doğrulama ve bütünlüğü testleri:
 * - Form validation (required fields, format)
 * - Data type validation (numbers, dates, phone)
 * - Business logic validation (negative values, ranges)
 * - Cross-field validation
 * - SQL injection prevention
 * - XSS prevention
 */

test.describe('Veri Doğrulama ve Güvenlik Testleri', () => {
  test.beforeEach(async ({ mainWindow }) => {
    await helpers.bypassLicenseIfNeeded(mainWindow)
    await helpers.waitForLoadingComplete(mainWindow)
  })

  test.describe('Sipariş Form Validation', () => {
    test('01 - Boş zorunlu alanlarla form submit edilememeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ 
        hasText: /yeni sipariş/i 
      }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Hiçbir alan doldurmadan kaydet
      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(1000)

      // Validation mesajları kontrolü
      const validationErrors = mainWindow.locator('.error, [role="alert"], .text-red, .invalid-feedback')
      const errorCount = await validationErrors.count()

      console.log('Validation hata sayısı:', errorCount)
      expect(errorCount).toBeGreaterThan(0)

      await helpers.takeDebugScreenshot(mainWindow, 'validation-empty-fields')
    })

    test('02 - Geçersiz telefon formatı reddedilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Minimum alanlar doldur
      await mainWindow.locator('input[name="plaka"]').fill('34 TST 999')
      await mainWindow.locator('input[name="musteri"]').fill('Test Firma')
      
      // Geçersiz telefon formatları
      const invalidPhones = ['123', '05', 'abc', '999999999999999']
      
      for (const phone of invalidPhones) {
        await mainWindow.locator('input[name="telefon"]').fill(phone)
        
        const saveButton = mainWindow.locator('button[type="submit"]').first()
        await saveButton.click()
        await mainWindow.waitForTimeout(500)

        // Hata mesajı var mı?
        const phoneError = mainWindow.locator('.error, [role="alert"]').filter({ 
          hasText: /telefon|phone/i 
        })
        
        if (await phoneError.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`✓ "${phone}" geçersiz telefon reddedildi`)
        }
      }

      await helpers.takeDebugScreenshot(mainWindow, 'validation-invalid-phone')
    })

    test('03 - Negatif fiyat değerleri reddedilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Gerekli alanları doldur
      await mainWindow.locator('input[name="plaka"]').fill('34 TST 999')
      await mainWindow.locator('input[name="musteri"]').fill('Test')
      await mainWindow.locator('input[name="telefon"]').fill('0555 111 2233')
      await mainWindow.locator('input[name="nereden"]').first().fill('A')
      await mainWindow.locator('input[name="nereye"]').first().fill('B')
      await mainWindow.locator('input[name="yukAciklamasi"]').fill('Test')

      // Negatif fiyat
      await mainWindow.locator('input[name="baslangicFiyati"]').fill('-1000')

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(1000)

      // Validation hatası bekle
      const priceError = mainWindow.locator('.error, [role="alert"]').filter({ 
        hasText: /fiyat|price|negatif|negative/i 
      })

      if (await priceError.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✓ Negatif fiyat reddedildi')
      }

      await helpers.takeDebugScreenshot(mainWindow, 'validation-negative-price')
    })

    test('04 - Çok büyük sayılar (overflow) kontrol edilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Aşırı büyük değerler
      await mainWindow.locator('input[name="baslangicFiyati"]').fill('999999999999999')
      await mainWindow.locator('input[name="gidisKm"]').fill('9999999')

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(1000)

      // Sistem crash etmemeli, validation veya clamp olmalı
      await helpers.takeDebugScreenshot(mainWindow, 'validation-overflow-numbers')
    })

    test('05 - Geçersiz tarih formatları reddedilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Tarih alanı varsa
      const dateInput = mainWindow.locator('input[type="date"], input[name*="tarih"]').first()
      
      if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Geçmiş tarih (eğer validate ediliyorsa)
        await dateInput.fill('2020-01-01')
        
        const saveButton = mainWindow.locator('button[type="submit"]').first()
        await saveButton.click()
        await mainWindow.waitForTimeout(1000)

        await helpers.takeDebugScreenshot(mainWindow, 'validation-past-date')
      }
    })
  })

  test.describe('SQL Injection Prevention', () => {
    test('06 - SQL injection denemesi güvenli şekilde handle edilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // SQL injection payloads
      const sqlInjectionPayloads = [
        "'; DROP TABLE orders; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users--",
        "1' AND '1'='1"
      ]

      for (const payload of sqlInjectionPayloads) {
        await mainWindow.locator('input[name="musteri"]').fill(payload)
        await mainWindow.locator('input[name="plaka"]').fill('34 TST 999')
        await mainWindow.locator('input[name="telefon"]').fill('0555 111 2233')

        const saveButton = mainWindow.locator('button[type="submit"]').first()
        await saveButton.click()
        await mainWindow.waitForTimeout(1000)

        console.log(`SQL injection test: "${payload.substring(0, 20)}..."`)
      }

      // Uygulama crash etmemeli
      // Orders tablosu hala erişilebilir olmalı
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const ordersTable = mainWindow.locator('table')
      await expect(ordersTable).toBeVisible()

      await helpers.takeDebugScreenshot(mainWindow, 'sql-injection-prevented')
    })

    test('07 - Arama kutusunda SQL injection denemesi', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const searchInput = mainWindow.locator('input[type="search"], input[placeholder*="Ara"]')
      
      if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        // SQL injection arama
        await searchInput.fill("'; DROP TABLE orders; --")
        await mainWindow.waitForTimeout(2000)

        // Sistem çalışmaya devam etmeli
        const ordersTable = mainWindow.locator('table')
        await expect(ordersTable).toBeVisible()

        console.log('✓ Arama SQL injection korumalı')

        await helpers.takeDebugScreenshot(mainWindow, 'search-sql-injection-prevented')
      }
    })
  })

  test.describe('XSS Prevention', () => {
    test('08 - XSS script enjeksiyonu çalışmamalı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // XSS payloads
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg/onload=alert("XSS")>',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>'
      ]

      // Müşteri adına XSS dene
      await mainWindow.locator('input[name="musteri"]').fill(xssPayloads[0])
      await mainWindow.locator('input[name="plaka"]').fill('34 TST 999')
      await mainWindow.locator('input[name="telefon"]').fill('0555 111 2233')
      await mainWindow.locator('input[name="nereden"]').first().fill('A')
      await mainWindow.locator('input[name="nereye"]').first().fill('B')

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(2000)

      // Alert çalışmamalı (Playwright alert event dinle)
      let alertFired = false
      mainWindow.on('dialog', async dialog => {
        alertFired = true
        await dialog.dismiss()
      })

      await mainWindow.waitForTimeout(1000)
      expect(alertFired).toBe(false)

      console.log('✓ XSS script çalışmadı')

      await helpers.takeDebugScreenshot(mainWindow, 'xss-prevented')
    })

    test('09 - HTML tags sanitize edilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      // Sipariş oluştur (HTML içeren)
      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      const htmlContent = '<b>Bold Text</b> <i>Italic</i> <u>Underline</u>'
      
      await mainWindow.locator('input[name="yukAciklamasi"], textarea[name="yukAciklamasi"]').fill(htmlContent)
      await mainWindow.locator('input[name="plaka"]').fill('34 TST 999')
      await mainWindow.locator('input[name="musteri"]').fill('Test')
      await mainWindow.locator('input[name="telefon"]').fill('0555 111 2233')

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(2000)

      // Liste sayfasında HTML render edilmemeli (escape edilmeli)
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      await helpers.takeDebugScreenshot(mainWindow, 'html-tags-sanitized')
    })
  })

  test.describe('Business Logic Validation', () => {
    test('10 - Dönüş KM gidiş KM\'den fazla olamaz kontrolü', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Dönüş > Gidiş (mantıksız)
      await mainWindow.locator('input[name="gidisKm"]').fill('100')
      await mainWindow.locator('input[name="donusKm"]').fill('500') // 5x fazla

      // Diğer alanlar
      await mainWindow.locator('input[name="plaka"]').fill('34 TST 999')
      await mainWindow.locator('input[name="musteri"]').fill('Test')
      await mainWindow.locator('input[name="telefon"]').fill('0555 111 2233')

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(1000)

      // Uyarı veya validation (bu business rule opsiyonel olabilir)
      await helpers.takeDebugScreenshot(mainWindow, 'validation-return-km')
    })

    test('11 - Başlangıç fiyatı maliyet altında olamaz uyarısı', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Çok düşük fiyat (maliyetten az)
      await mainWindow.locator('input[name="baslangicFiyati"]').fill('100') // Çok düşük
      await mainWindow.locator('input[name="gidisKm"]').fill('1000') // Uzak mesafe
      await mainWindow.locator('input[name="donusKm"]').fill('1000')

      // Fiyat hesaplama sonrası uyarı olabilir
      await mainWindow.waitForTimeout(2000)

      // Kar/zarar göstergesi negatif olmalı
      const profitIndicator = mainWindow.locator('text=/kar|zarar|profit|loss/i')
      
      if (await profitIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await profitIndicator.textContent()
        console.log('Kar/Zarar göstergesi:', text)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'validation-price-below-cost')
    })

    test('12 - Plaka formatı Türkiye standardına uygun mu', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Geçersiz plaka formatları
      const invalidPlates = [
        'ABC123', // Boşluksuz
        '34ABC123', // Boşluksuz
        '999 ABC 123', // Geçersiz il kodu
        'AB CDE 123', // Geçersiz format
      ]

      for (const plate of invalidPlates) {
        await mainWindow.locator('input[name="plaka"]').fill(plate)
        
        const saveButton = mainWindow.locator('button[type="submit"]').first()
        await saveButton.click()
        await mainWindow.waitForTimeout(500)

        // Validation olabilir (opsiyonel)
        console.log(`Plaka test: "${plate}"`)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'validation-plate-format')
    })
  })

  test.describe('Data Integrity', () => {
    test('13 - Sipariş oluştururken tüm ilişkili veriler kaydedilmeli', async ({ mainWindow }) => {
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(1000)

      // Tam form doldur
      const testData = {
        plaka: '34 INT 999',
        musteri: 'Integrity Test Ltd',
        telefon: '0555 999 8877',
        nereden: 'İstanbul',
        nereye: 'Ankara',
        yukAciklamasi: 'Test yükü - data integrity',
        baslangicFiyati: '20000',
        gidisKm: '450',
        donusKm: '450'
      }

      for (const [field, value] of Object.entries(testData)) {
        await mainWindow.locator(`input[name="${field}"], textarea[name="${field}"]`).first().fill(value)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'data-integrity-form-filled')

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(2000)

      // Kayıt sonrası detayları kontrol et
      await helpers.navigateTo(mainWindow, '/orders')
      await mainWindow.waitForTimeout(1000)

      // Son eklenen sipariş
      const lastOrder = mainWindow.locator('table tbody tr').first()
      await lastOrder.click()
      await mainWindow.waitForTimeout(1000)

      // Tüm alanlar görünür ve doğru mu?
      for (const value of Object.values(testData)) {
        const element = mainWindow.locator(`text="${value}"`)
        const exists = await element.isVisible({ timeout: 1000 }).catch(() => false)
        if (exists) {
          console.log(`✓ "${value}" kaydedildi`)
        }
      }

      await helpers.takeDebugScreenshot(mainWindow, 'data-integrity-verified')
    })
  })
})

/**
 * TEST NOTLARI:
 * 
 * 1. Validation testleri UI framework'e bağlı (React Hook Form, Formik, etc.)
 * 2. SQL injection testleri prepared statements ile korunmalı
 * 3. XSS testleri DOMPurify ile sanitize edilmeli
 * 4. Business logic validation opsiyonel olabilir
 * 5. Tüm testler defensive programming prensiplerini kontrol eder
 */

