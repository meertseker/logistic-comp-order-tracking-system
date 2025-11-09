# 🚀 TEST EXECUTION GUIDE
## Seymen Transport - Comprehensive Testing

Bu dokümanda testlerin nasıl çalıştırılacağı, sonuçların nasıl değerlendirileceği ve deployment öncesi yapılması gerekenler adım adım anlatılmaktadır.

---

## 📦 KURULUM

### 1. Test Bağımlılıklarını Yükle

```bash
# Jest ve TypeScript test araçları
npm install --save-dev jest ts-jest @types/jest

# Electron test araçları
npm install --save-dev @playwright/test playwright-electron

# Coverage tools
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Mock araçları
npm install --save-dev jest-mock-extended

# Security tools
npm install --save-dev @electron/electronnegativity snyk
```

### 2. Test Configuration Kontrolü

```bash
# jest.config.js dosyası var mı?
ls -la jest.config.js

# tests/ klasörü oluşturulmuş mu?
ls -la tests/
```

---

## 🧪 TEST ÇALIŞTIRMA

### Tüm Testler

```bash
# Tüm testleri çalıştır
npm test

# Coverage ile birlikte
npm test -- --coverage

# Verbose mode (detaylı çıktı)
npm test -- --verbose

# Watch mode (değişiklik algıla)
npm test -- --watch
```

### Belirli Test Grupları

```bash
# Sadece unit testler
npm test -- tests/unit

# Sadece integration testler
npm test -- tests/integration

# Sadece e2e testler
npm test -- tests/e2e

# Sadece cost calculator testleri
npm test -- tests/unit/backend/cost-calculator.test.ts

# Sadece database testleri
npm test -- tests/unit/backend/database.test.ts
```

### Test Pattern ile Filtreleme

```bash
# İsimde "maliyet" geçen testler
npm test -- -t "maliyet"

# İsimde "İstanbul-Ankara" geçen testler
npm test -- -t "İstanbul-Ankara"

# Sadece KRİTİK testler
npm test -- -t "KRİTİK"
```

---

## 📊 TEST SONUÇLARINI DEĞERLENDIRME

### Coverage Raporu

```bash
# Coverage raporu oluştur
npm test -- --coverage

# HTML raporu aç (browser)
open coverage/index.html
```

**Beklenen Coverage Değerleri:**
- **Lines:** ≥ 90%
- **Functions:** ≥ 85%
- **Branches:** ≥ 85%
- **Statements:** ≥ 90%

### Test Başarı Kriterleri

#### ✅ DEPLOY İÇİN GEREKLİ KOŞULLAR

```
[ ] Tüm unit testler PASSED
[ ] Tüm integration testler PASSED
[ ] Tüm e2e testler PASSED
[ ] Coverage ≥ 90%
[ ] 0 critical bugs
[ ] Max 5 minor bugs
[ ] Performance testleri geçti
[ ] Security audit temiz
[ ] Manual test tamamlandı
```

#### ❌ DEPLOY DURDURULMALI (RED FLAGS)

```
❌ Herhangi bir test FAILED
❌ Coverage < 85%
❌ Cost calculator testi fail
❌ Database integrity testi fail
❌ License test fail
❌ Kritik bug var
❌ Security vulnerability var
❌ Performance hedefleri tutturulmadı
```

---

## 🔍 TEST DETAYLARI

### 1. Cost Calculator Tests (KRİTİK!)

**Dosya:** `tests/unit/backend/cost-calculator.test.ts`

**Çalıştırma:**
```bash
npm test -- tests/unit/backend/cost-calculator.test.ts --verbose
```

**Kontrol Edilecekler:**
- ✓ Manuel hesap vs sistem hesabı farkı < 1 TL
- ✓ İstanbul-Ankara örneği %100 doğru
- ✓ 1000 rastgele senaryo geçti
- ✓ Edge cases (0 km, çok büyük km, negatif) handle ediliyor
- ✓ Floating point precision problemi yok

**EĞER BU TEST FAIL EDİYORSA:**
```
⚠️ ACİL!
1. Testi tekrar çalıştır
2. Fail eden senaryoyu logla
3. Manuel hesap yap
4. Kodu düzelt
5. Tekrar test et
6. Muhasebeciyle kontrol ettir
```

### 2. Database Tests

**Dosya:** `tests/unit/backend/database.test.ts`

**Çalıştırma:**
```bash
npm test -- tests/unit/backend/database.test.ts --verbose
```

**Kontrol Edilecekler:**
- ✓ Tüm tablolar oluşturuldu
- ✓ Foreign key constraints çalışıyor
- ✓ Transaction rollback güvenli
- ✓ SQL injection korumalı
- ✓ 1000 sipariş ile performance OK (< 100ms)
- ✓ WAL mode aktif

**EĞER BU TEST FAIL EDİYORSA:**
```
⚠️ DATA LOSS RİSKİ!
1. Database schema kontrolü
2. Migration script kontrol
3. Constraint validation
4. Test database ile tekrar dene
5. Production-like data ile test
```

### 3. Security Tests

```bash
# Electron security scan
npx @electron/electronnegativity .

# NPM audit
npm audit --audit-level=moderate

# Snyk scan
npx snyk test
```

**Beklenen Sonuç:**
```
✓ 0 critical vulnerabilities
✓ 0 high vulnerabilities
✓ Max 5 medium vulnerabilities (değerlendirilmeli)
```

**EĞER VULNERABILITY VARSA:**
```
1. Detayları oku
2. CVE numarasını araştır
3. Exploitable mi kontrol et
4. Patch varsa uygula
5. Alternatif library araştır
6. Risk kabul belgesi hazırla (gerekirse)
```

### 4. Performance Tests

```bash
# Performance test script (custom)
node tests/performance/load-test.js
```

**Beklenen Metrikler:**
- Dashboard açılış: < 1s
- 10,000 sipariş ile search: < 300ms
- Rapor oluşturma: < 5s
- Memory usage: < 300 MB
- CPU usage: < 50% (idle), < 80% (peak)

### 5. E2E Tests (Playwright)

```bash
# E2E testleri çalıştır
npm run test:e2e

# Headed mode (browser görünür)
npm run test:e2e -- --headed

# Debug mode
npm run test:e2e -- --debug
```

**Test Senaryoları:**
- ✓ Yeni kullanıcı ilk kurulum (0->ilk sipariş)
- ✓ Günlük operasyon (10 sipariş gir)
- ✓ Rapor al ve export et
- ✓ Mail gönder
- ✓ Backup al/restore et

---

## 🛠️ TEST HATALARI GİDERME

### Test Fail Olduğunda

#### 1. Hatayı İzole Et

```bash
# Sadece fail olan testi çalıştır
npm test -- -t "fail olan test ismi"

# Verbose + coverage
npm test -- -t "fail olan test ismi" --verbose --coverage
```

#### 2. Debug Mode

```javascript
// Test dosyasına ekle:
test.only('bu testi debug et', () => {
  console.log('Debug bilgisi:', someVariable)
  debugger // Node.js debugger
  expect(someValue).toBe(expectedValue)
})
```

```bash
# Debug mode ile çalıştır
node --inspect-brk node_modules/.bin/jest --runInBand tests/unit/...
```

#### 3. Mock Kontrolü

```javascript
// Mock'lar doğru çalışıyor mu?
console.log('Mock called:', mockFunction.mock.calls)
console.log('Mock results:', mockFunction.mock.results)
```

#### 4. Environment Problemi

```bash
# Node version kontrolü
node --version  # 18.x veya üzeri olmalı

# Clean install
rm -rf node_modules
rm package-lock.json
npm install

# Cache temizle
npm test -- --clearCache
```

### Sık Karşılaşılan Sorunlar

#### Problem: "Cannot find module"
```bash
# Solution:
npm install
npm run build
```

#### Problem: "SQLITE_CANTOPEN"
```bash
# Solution: Permission problemi
chmod 755 tests/
rm tests/*.db
npm test
```

#### Problem: "Timeout exceeded"
```javascript
// jest.config.js
testTimeout: 30000 // 30 saniye
```

#### Problem: "Memory leak"
```bash
# Node max memory artır
NODE_OPTIONS=--max-old-space-size=4096 npm test
```

---

## 📈 CI/CD ENTEGRASYONU

### GitHub Actions

**.github/workflows/test.yml** dosyası oluştur:

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, ubuntu-latest]
        node: [18, 20]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

### Pre-commit Hook

**.husky/pre-commit:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Testleri çalıştır
npm test -- --bail --findRelatedTests

# Coverage check
npm test -- --coverage --coverageThreshold='{"global":{"lines":90}}'
```

---

## 📋 DEPLOYMENT ÖNCESİ CHECKLIST

### 1 Hafta Önce

```bash
[ ] Tüm testler çalıştırıldı ve geçti
[ ] Coverage raporu incelendi (>90%)
[ ] Performance testleri yapıldı
[ ] Security audit temiz
[ ] Code review tamamlandı
[ ] Dokümantasyon güncel
```

### 3 Gün Önce

```bash
[ ] Pilot kullanıcılara deployment yapıldı
[ ] UAT (User Acceptance Testing) başarılı
[ ] Support ekibi eğitildi
[ ] Rollback planı hazır
[ ] Monitoring setup edildi
```

### 1 Gün Önce

```bash
[ ] Production build test edildi
[ ] Setup.exe test edildi (farklı Windows versiyonlarında)
[ ] License sistemi test edildi
[ ] Backup/restore test edildi
[ ] Emergency contact list hazır
```

### Deployment Günü

```bash
[ ] Sabah testleri tekrar çalıştır
[ ] Production build oluştur
[ ] Final smoke test
[ ] Deployment başlat
[ ] Monitoring aktif
[ ] First-hour monitoring yoğun takip
```

### Deployment Sonrası (İlk 24 Saat)

```bash
[ ] Her saat monitoring kontrol
[ ] Error logs kontrol
[ ] User feedback topla
[ ] Performance metrics kontrol
[ ] Support ticket kontrol
[ ] Hotfix hazır bekle
```

---

## 🚨 ACİL DURUM PROTOKOLİ

### Kritik Bug Bulunursa

#### İlk 30 Dakika:
1. **Hatayı Onayla:** Reproducible mi?
2. **Severity Belirle:** Critical / High / Medium / Low
3. **Impact Analizi:** Kaç kullanıcı etkilendi?
4. **Containment:** Daha fazla yayılmasını engelle

#### 1-2 Saat:
1. **Root Cause Analysis:** Hatanın kaynağını bul
2. **Hotfix Hazırla:** Minimal değişiklikle düzelt
3. **Test Et:** Express test suite çalıştır
4. **Review:** 2. göz kontrol

#### 2-4 Saat:
1. **Hotfix Deploy:** Etkilenen kullanıcılara öncelik
2. **Monitoring:** Düzeldi mi kontrol
3. **Communication:** Kullanıcıları bilgilendir
4. **Post-mortem:** Neden oldu, nasıl önleriz?

### Rollback Senaryosu

```bash
# 1. Eski versiyona dön
git checkout v1.0.0-stable
npm run build
npm run build:win

# 2. Setup.exe oluştur
# 3. Etkilenen kullanıcılara gönder
# 4. Yeni fix ile tekrar deployment planla
```

---

## 📞 DESTEK VE İLETİŞİM

### Test Ekibi İletişim

- **Test Direktörü:** [İsim] - [Email] - [Telefon]
- **Backend Test Lead:** [İsim] - [Email]
- **Frontend Test Lead:** [İsim] - [Email]
- **Security Engineer:** [İsim] - [Email]

### Escalation Protocol

1. **Level 1:** Test Engineer (Normal sorunlar)
2. **Level 2:** Test Lead (Kompleks sorunlar)
3. **Level 3:** Test Direktörü + Dev Lead (Kritik)
4. **Level 4:** CTO (Total failure)

---

## 📚 EK KAYNAKLAR

- **Jest Docs:** https://jestjs.io/docs/getting-started
- **Playwright Docs:** https://playwright.dev/
- **Electron Testing:** https://www.electronjs.org/docs/latest/tutorial/automated-testing
- **SQLite Testing:** https://www.sqlite.org/testing.html

---

**Son Güncelleme:** {{ BUGÜN }}  
**Versiyon:** 1.0  
**Hazırlayan:** Test Departmanı

