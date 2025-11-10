# 🚀 E2E Tests - Quick Start Guide

## Hızlı Başlangıç (5 Dakika)

### Adım 1: Build Uygulamayı
```bash
npm run build
```

**Beklenen:** `dist-electron/main/index.cjs` oluşmalı

---

### Adım 2: Playwright'i Kur (İlk Kez)
```bash
npx playwright install
```

**Beklenen:** "chromium, firefox, webkit installed" mesajı

---

### Adım 3: Testleri Çalıştır
```bash
npm run test:e2e
```

**Beklenen:** 43 test çalışacak, ~5-10 dakika sürecek

---

## 📊 Ne Beklemeli?

### İlk Çalıştırmada

**Başarılı Senaryo:**
```
✅ 43/43 test passed
⏱️  Süre: 5-10 dakika
📊 Rapor: playwright-report/index.html
```

**Kısmi Başarı (Normal):**
```
⚠️  Bazı testler skip olabilir:
   - Lisans testleri (gerçek lisans gerekir)
   - Mail testleri (SMTP ayarı gerekir)
   - Export testleri (timing issues)

✅ Core testler pass olmalı
```

**Sorunlu Senaryo:**
```
❌ Electron build bulunamadı
🔧 Çözüm: npm run build

❌ Timeout hatası
🔧 Çözüm: playwright.config.ts'de timeout artır
```

---

## 🎯 Test Kapsamı

```
📁 5 Test Dosyası
🧪 43 Test Senaryosu

Modüller:
├─ 01-license-activation      (5 tests)
├─ 02-dashboard-orders         (8 tests)
├─ 03-vehicles-routes          (11 tests)
├─ 04-reports-settings         (14 tests)
└─ 05-critical-user-journeys   (5 journeys)
```

---

## 🐛 Hata Giderme

### Problem: "ECONNREFUSED"
```bash
# Build'i kontrol et
ls dist-electron/main/index.cjs

# Yoksa:
npm run build
```

### Problem: "Timeout exceeded"
```bash
# playwright.config.ts'de timeout artır
timeout: 120000  # 2 dakika
```

### Problem: "Element not found"
```bash
# Normal - UI değişikliği olabilir
# Test selector'ları güncelle
```

---

## 📸 Test Çıktıları

### Başarılı Test
```
test-results/
  debug-screenshots/
    ✅ dashboard-loaded.png
    ✅ order-created.png
```

### Başarısız Test
```
test-results/
  01-license-activation-chromium/
    ❌ screenshot.png
    📹 video.webm
    🔍 trace.zip
```

---

## 🎬 İleri Komutlar

```bash
# Headed mode (görerek)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Belirli test
npx playwright test -g "Journey 01"

# Rapor aç
npm run test:e2e:report
```

---

## ✅ Başarı Kriterleri

**Minimum Başarı:**
- [ ] En az %70 test pass
- [ ] Core flows çalışıyor (order, vehicle)
- [ ] Kritik hatalar yok

**İdeal Başarı:**
- [ ] %100 test pass
- [ ] Tüm user journeys tamamlanıyor
- [ ] Performance hedefleri tutturuluyor

---

## 📞 Yardım

**Daha fazla bilgi için:**
- `tests/e2e/README.md` - Detaylı rehber
- `E2E_TESTS_COMPLETE.md` - Tam dokümantasyon
- [Playwright Docs](https://playwright.dev/)

---

**🎉 Testleri çalıştırmaya hazırsınız!**

```bash
npm run test:e2e
```

