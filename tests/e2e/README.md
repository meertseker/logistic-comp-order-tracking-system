# 🎭 E2E Tests - Playwright

End-to-End testler Playwright kullanılarak Electron uygulaması için hazırlanmıştır.

## 📋 Test Dosyaları

### 01-license-activation.e2e.ts
Lisans aktivasyon sürecini test eder:
- ✅ İlk açılışta lisans ekranı
- ✅ Geçersiz lisans hata mesajı
- ✅ Geçerli lisans ile aktivasyon
- ✅ Aktivasyon sonrası navigasyon

### 02-dashboard-orders.e2e.ts
Dashboard ve sipariş yönetimi:
- ✅ Dashboard istatistikleri
- ✅ Yeni sipariş oluşturma
- ✅ Sipariş listeleme ve filtreleme
- ✅ Sipariş düzenleme ve durum değişiklikleri

### 03-vehicles-routes.e2e.ts
Araç ve güzergah yönetimi:
- ✅ Araç ekleme/düzenleme
- ✅ Araç listesi ve performans
- ✅ Güzergah ekleme/düzenleme
- ✅ Sipariş formunda otomatik doldurma

### 04-reports-settings.e2e.ts
Raporlama ve ayarlar:
- ✅ Rapor görüntüleme ve grafik rendering
- ✅ Excel ve PDF export
- ✅ Ayarlar değiştirme
- ✅ Mail konfigürasyonu
- ✅ Backup oluşturma

### 05-critical-user-journeys.e2e.ts
Kritik kullanıcı senaryoları:
- ✅ İlk kullanıcı kurulum akışı (15 dakika)
- ✅ Günlük operasyon senaryosu
- ✅ Aylık kapanış işlemleri
- ✅ Hata durumları ve validation
- ✅ Büyük veri seti performance

## 🚀 Testleri Çalıştırma

### Gereksinimler

1. **Uygulamayı build edin:**
   ```bash
   npm run build
   ```

2. **Playwright kurulumu (ilk kez):**
   ```bash
   npx playwright install
   ```

### Test Komutları

```bash
# Tüm E2E testleri çalıştır
npm run test:e2e

# Sadece belirli bir test dosyası
npx playwright test tests/e2e/01-license-activation.e2e.ts

# Headed mode (browser görünür)
npx playwright test --headed

# Debug mode (adım adım)
npx playwright test --debug

# Belirli bir test
npx playwright test -g "Journey 01"

# Paralel çalıştırma (dikkatli kullanın)
npx playwright test --workers=2
```

### Test Raporları

```bash
# HTML raporu aç
npx playwright show-report

# Test sonuçları
./playwright-report/index.html
```

## 📸 Screenshots ve Videos

Testler başarısız olduğunda otomatik olarak:
- **Screenshots**: `test-results/*/screenshot.png`
- **Videos**: `test-results/*/video.webm`
- **Traces**: `test-results/*/trace.zip`

Debug screenshots:
- `test-results/debug-screenshots/`

## 🐛 Debugging

### Visual Studio Code

`.vscode/launch.json` dosyasına ekleyin:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Playwright E2E",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:e2e", "--", "--debug"],
  "console": "integratedTerminal"
}
```

### Playwright Inspector

```bash
# Inspector ile çalıştır
npx playwright test --debug

# Belirli bir satırdan başla
npx playwright test --debug -g "Yeni sipariş"
```

### Console Logs

Test içinde:
```typescript
console.log('Debug info:', someVariable)
await helpers.takeDebugScreenshot(mainWindow, 'debug-point-1')
```

## 🔧 Test Environment

### Environment Variables

```bash
# Test mode
NODE_ENV=test

# Custom test config
TEST_MODE=true
USER_DATA_DIR=./test-data
```

### Test Database

Her test için temiz bir database kullanılır:
- Temporary directory: `./test-data/test-{timestamp}/`
- Test sonrası otomatik temizlenir

### Lisans Bypass (Test İçin)

Test ortamında lisans kontrolü atlanabilir:
```typescript
await helpers.bypassLicenseIfNeeded(mainWindow)
```

## ⚠️ Yaygın Sorunlar

### Problem: "Electron build bulunamadı"

**Çözüm:**
```bash
npm run build
```

### Problem: "Timeout exceeded"

**Çözüm 1:** Test timeout artır
```typescript
test.setTimeout(120000) // 2 dakika
```

**Çözüm 2:** `playwright.config.ts`'de global timeout:
```typescript
timeout: 60000
```

### Problem: "Element not found"

**Çözüm:** Selector'ı güncelle veya wait ekle
```typescript
await mainWindow.waitForSelector('button', { timeout: 10000 })
```

### Problem: "Tests are flaky"

**Çözüm:**
```typescript
// Daha fazla wait ekle
await mainWindow.waitForLoadState('networkidle')
await helpers.waitForLoadingComplete(mainWindow)

// Retry count artır (playwright.config.ts)
retries: 2
```

## 📊 Test Metrikleri

### Hedef Metrikler

| Metrik | Hedef | Mevcut |
|--------|-------|--------|
| Test Coverage | > %80 | - |
| Pass Rate | %100 | - |
| Execution Time | < 10 min | - |
| Flakiness | < %5 | - |

### Test Execution Stratejisi

1. **Lokal Development**: Sadece değişen testleri çalıştır
2. **Pre-Commit**: Kritik testler (journey tests)
3. **CI/CD**: Tüm E2E testler
4. **Nightly**: Full regression suite

## 🔄 CI/CD Integration

### GitHub Actions

`.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: test-results/
```

## 📝 Test Yazma Rehberi

### Yeni Test Ekleme

1. **Test dosyası oluştur:**
   ```typescript
   // tests/e2e/06-my-feature.e2e.ts
   import { test, expect, helpers } from './fixtures'
   
   test.describe('My Feature', () => {
     test.beforeEach(async ({ mainWindow }) => {
       await helpers.bypassLicenseIfNeeded(mainWindow)
     })
     
     test('should do something', async ({ mainWindow }) => {
       // Test kodunu yaz
     })
   })
   ```

2. **Best Practices:**
   - ✅ Descriptive test names
   - ✅ One assertion per test (mümkünse)
   - ✅ Use helpers for common operations
   - ✅ Take screenshots at critical points
   - ✅ Handle timing issues with waits
   - ❌ Hard-coded timeouts (use waitFor)
   - ❌ Flaky selectors (use data-testid)
   - ❌ Shared state between tests

3. **Selector Strategy:**
   ```typescript
   // ✅ İyi
   await mainWindow.locator('[data-testid="submit-button"]').click()
   await mainWindow.locator('button').filter({ hasText: 'Kaydet' }).click()
   
   // ❌ Kötü
   await mainWindow.locator('#btn_123_456').click() // Fragile ID
   await mainWindow.locator('div > div > button').click() // Deep nesting
   ```

## 📚 Kaynaklar

- [Playwright Documentation](https://playwright.dev/)
- [Electron Testing](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## 🎯 Roadmap

- [ ] Visual regression testing (Percy/Chromatic)
- [ ] Accessibility testing (axe-core)
- [ ] API mocking (MSW)
- [ ] Performance profiling
- [ ] Cross-platform testing (Mac, Linux)

---

**Hazırlayan:** Test Departmanı  
**Güncelleme:** 10 Kasım 2025  
**Versiyon:** 1.0

