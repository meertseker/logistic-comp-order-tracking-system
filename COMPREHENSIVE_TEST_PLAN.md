# 🚨 KRİTİK DEPLOYMENT TEST PLANI
## 1200 Şirket Kullanacak - Sıfır Hata Toleransı

> **UYARI:** Bu sistem 1200 şirketin günlük operasyonlarını yönetecek. Tek bir hata binlerce siparişi etkileyebilir, mali kayıplara yol açabilir ve şirket itibarını zedeleyebilir.

---

## 📋 İÇİNDEKİLER

1. [Test Organizasyonu](#1-test-organizasyonu)
2. [Test Türleri ve Kapsamı](#2-test-türleri-ve-kapsamı)
3. [Kritik Test Senaryoları](#3-kritik-test-senaryoları)
4. [Test Ortamları](#4-test-ortamları)
5. [Test Araçları ve Teknolojiler](#5-test-araçları-ve-teknolojiler)
6. [Deployment Checklist](#6-deployment-checklist)
7. [Acil Durum Planı](#7-acil-durum-planı)

---

## 1. TEST ORGANIZASYONU

### 1.1 Test Ekibi Yapısı

```
Test Direktörü (1)
├── Test Lideri - Backend (1)
│   ├── Backend Test Engineer (2)
│   └── Database Test Engineer (1)
├── Test Lideri - Frontend (1)
│   ├── UI/UX Test Engineer (2)
│   └── Automation Engineer (1)
├── Performance Test Engineer (1)
├── Security Test Engineer (1)
└── Manual Test Engineer (3)

TOPLAM: 13 kişi
```

### 1.2 Test Fazları ve Zaman Çizelgesi

#### Faz 1: Unit Tests (2 hafta)
- Her fonksiyon ayrı ayrı test edilecek
- Code coverage minimum %90

#### Faz 2: Integration Tests (2 hafta)
- Backend + Database entegrasyonu
- Frontend + Backend API iletişimi
- Electron + Node.js iletişimi

#### Faz 3: System Tests (3 hafta)
- End-to-end akışlar
- Tam kullanıcı senaryoları
- Gerçek veri ile test

#### Faz 4: Performance Tests (1 hafta)
- Yük testi: 1200 eşzamanlı kullanıcı
- Stress testi: Sistem limitleri
- Uzun süreli çalışma testi (72 saat)

#### Faz 5: Security Tests (1 hafta)
- Lisans güvenliği
- Data encryption
- SQL injection
- File system güvenliği

#### Faz 6: UAT - User Acceptance Testing (2 hafta)
- 10 pilot şirket ile gerçek kullanım
- Feedback toplama ve düzeltme

#### Faz 7: Pilot Deployment (1 hafta)
- 50 şirket ile sınırlı deployment
- 7/24 monitoring

#### Faz 8: Full Deployment (Aşamalı)
- Haftalık 200 şirket artırımı
- 6 hafta sürecek

**TOPLAM SÜRE: 12 HAFTA (3 ay)**

---

## 2. TEST TÜRLERİ VE KAPSAMI

### 2.1 UNIT TESTS (Birim Testleri)

#### 2.1.1 Backend (Electron Main Process)

**Test Edilecek Modüller:**

##### A. Database Operations (`electron/main/database.ts`)
```javascript
TESTS:
✓ Database initialization başarılı
✓ Tüm tablolar oluşturulmuş mu
✓ Index'ler doğru oluşturulmuş mu
✓ Foreign key constraints çalışıyor mu
✓ Migration işlemleri başarılı
✓ Default data eklenmiş mi (routes, settings)
✓ Connection pool management
✓ WAL mode aktif mi
✓ Backup compatibility

KRİTİK SENARYOLAR:
❌ Database dosyası corrupt olursa
❌ Disk doluysa
❌ Write permission yoksa
❌ SQLite version uyumsuz ise
❌ Migration sırasında hata

TEST SAYISI: 50+
```

##### B. Cost Calculator (`electron/main/professional-cost-calculator.ts`)
```javascript
TESTS:
✓ Yakıt hesaplaması doğru (lt/100km)
✓ Sürücü maliyeti doğru (günlük)
✓ HGS maliyeti database'den geliy

or
✓ Bakım maliyeti detaylı hesap doğru
✓ Etkin KM hesaplaması (gidiş+dönüş)
✓ Return load rate etkisi
✓ Kar/zarar hesaplaması doğru
✓ KDV hesaplaması doğru
✓ Önerilen fiyat mantıklı
✓ Edge cases: 0 km, negatif değerler
✓ Floating point precision

KRİTİK SENARYOLAR:
❌ Maliyet hesabı yanlış -> Şirket zarar eder
❌ KDV hesabı yanlış -> Vergi sorunu
❌ Önerilen fiyat çok düşük -> Para kaybı
❌ Önerilen fiyat çok yüksek -> Müşteri kaybı
❌ Division by zero hatası
❌ Null/undefined parametreler

TEST SAYISI: 100+
OTOMASYONLU KARŞILAŞTIRMA:
- 1000 farklı senaryo ile manuel hesap vs sistem hesabı
- Fark toleransı: 0.01 TL
```

##### C. License Manager (`electron/main/advanced-license-manager.ts`)
```javascript
TESTS:
✓ Hardware fingerprint unique
✓ Lisans aktivasyonu başarılı
✓ Lisans doğrulama başarılı
✓ Yanlış lisans reddediliyor
✓ Başka makineden lisans reddediliyor
✓ Süreli lisans expire oluyor
✓ Tamper detection çalışıyor
✓ Encryption/decryption doğru
✓ Offline validation çalışıyor
✓ License file corrupt olursa hata

KRİTİK SENARYOLAR:
❌ Lisans bypass edilebilir mi?
❌ Lisans dosyası kopyalanıp başka PC'ye taşınırsa?
❌ License.dat manuel değiştirilirse?
❌ Hardware değişikliği olursa (RAM, HDD değişimi)
❌ VM üzerinde çalışırsa farklı makinelerde aynı ID mi?
❌ Machine ID spoof edilebilir mi?

TEST SAYISI: 80+
GÜVENLÍK TESTİ:
- Penetration testing ile lisans kırılmaya çalışılacak
- 3. parti güvenlik firması tarafından audit
```

##### D. Mail Service (`electron/main/mail-service.ts`)
```javascript
TESTS:
✓ SMTP bağlantısı test
✓ Mail gönderimi başarılı
✓ HTML template doğru render
✓ Attachment (PDF) ekleniyor
✓ Mail logs kaydediliyor
✓ Hatalı mail retry mechanism
✓ Farklı SMTP provider'lar test (Gmail, Outlook, Yandex)
✓ TLS/SSL connection
✓ Authentication başarısız ise hata
✓ Rate limiting

KRİTİK SENARYOLAR:
❌ İnternet yoksa ne olur?
❌ SMTP şifresi yanlışsa?
❌ Alıcı email geçersizse?
❌ Attachment çok büyükse?
❌ Mail queue doluysa?
❌ Spam olarak işaretlenirse?

TEST SAYISI: 60+
```

##### E. IPC Handlers (electron/main/index.ts)
```javascript
TESTS (her IPC handler için):
✓ db:getOrders - filtreleme çalışıyor
✓ db:createOrder - validation var
✓ db:updateOrder - concurrency safe
✓ db:deleteOrder - cascade delete
✓ db:getVehicles - aktif olanlar geliyor
✓ db:saveVehicle - duplicate check
✓ cost:analyze - doğru hesap
✓ license:validate - güvenli
✓ mail:sendOrderEmail - async handling

KRİTİK SENARYOLAR:
❌ SQL injection denemeleri
❌ XSS attack denemeleri
❌ Invalid input handling
❌ Race condition (2 user aynı anda güncelleme)
❌ Large payload (10MB sipariş verisi)
❌ Timeout handling
❌ Error propagation

TEST SAYISI: 150+
```

#### 2.1.2 Frontend (React Components)

##### A. Form Components
```javascript
TESTS:
✓ CreateOrderFixed - tüm alanlar validation
✓ EditOrder - değişiklikler kaydediliyor
✓ VehiclesProfessional - araç ekleme/düzenleme
✓ Routes - güzergah yönetimi
✓ Settings - ayarlar kaydediliyor

KRİTİK SENARYOLAR:
❌ Boş form submit edilirse
❌ Negatif sayılar girilirse
❌ Çok uzun text girilirse (SQL limit)
❌ Özel karakterler girilirse
❌ XSS denemeleri (script tag)
❌ Format hataları (email, telefon)

TEST SAYISI: 120+
```

##### B. Data Display Components
```javascript
TESTS:
✓ Dashboard - doğru istatistikler
✓ Orders - filtreleme, sıralama, pagination
✓ Reports - grafik doğru çiziyor
✓ OrderDetail - tüm bilgiler görünüyor
✓ VehiclePerformance - hesaplar doğru

KRİTİK SENARYOLAR:
❌ 10,000+ sipariş varsa performans
❌ Çok büyük sayılar (999,999,999 TL)
❌ Çok küçük sayılar (0.0001 TL)
❌ Tarih format hataları
❌ Null/undefined data handling
❌ Empty state görünüyor mu

TEST SAYISI: 80+
```

##### C. Export Components (PDF, Excel)
```javascript
TESTS:
✓ PDF export doğru format
✓ Excel export doğru format
✓ Türkçe karakterler bozulmuyor
✓ Büyük data export (5000 satır)
✓ Grafik export (chart to PDF)

KRİTİK SENARYOLAR:
❌ Export sırasında crash
❌ Dosya yazılamazsa
❌ Disk doluysa
❌ Unicode karakterler
❌ Çok büyük dosya (100MB+)

TEST SAYISI: 40+
```

---

### 2.2 INTEGRATION TESTS (Entegrasyon Testleri)

```javascript
TESTS:
✓ Frontend -> IPC -> Backend -> Database chain
✓ Sipariş oluştur -> Maliyet hesapla -> Database kaydet -> UI'da göster
✓ Araç ekle -> Maliyet parametreleri güncelle -> Sipariş hesabında kullan
✓ Güzergah kaydet -> Sipariş oluştururken otomatik doldur
✓ Backup oluştur -> Restore et -> Data integrity check
✓ License aktive et -> Periyodik validation -> Expire handling
✓ Mail ayarla -> Test et -> Sipariş maili gönder

KRİTİK SENARYOLAR:
❌ Database lock sırasında sipariş oluşturma
❌ IPC timeout
❌ Backend crash olursa frontend ne yapar?
❌ Database migration sırasında kullanıcı işlem yaparsa
❌ Concurrent operations (2 sipariş aynı anda)

TEST SAYISI: 100+
```

---

### 2.3 END-TO-END TESTS (Kullanıcı Senaryoları)

#### Senaryo 1: Yeni Kullanıcı İlk Kurulum
```
ADIMLAR:
1. Uygulamayı indir ve kur
2. Lisans aktivasyonu yap
3. İlk aracı ekle
4. İlk güzergahı ekle
5. İlk siparişi oluştur
6. Dashboard'da görüntüle
7. Rapor al (PDF, Excel)
8. Mail ayarla ve test et

BEKLENİLEN SÜRE: 15 dakika
TEST SAYISI: 10 farklı kullanıcı profili ile
```

#### Senaryo 2: Günlük Operasyon
```
ADIMLAR:
1. Uygulamayı aç
2. Dashboard kontrol et
3. 10 yeni sipariş gir
4. Mevcut siparişleri güncelle (status değişikliği)
5. Gider ekle
6. Rapor kontrol et
7. Müşteriye mail gönder
8. Backup al

BEKLENİLEN SÜRE: 30 dakika
TEST SAYISI: 7 gün boyunca tekrar et
```

#### Senaryo 3: Aylık Kapanış
```
ADIMLAR:
1. Ay sonu raporunu çıkar
2. Tüm siparişleri kontrol et
3. Excel export al
4. Muhasebeye gönder
5. Backup al
6. Yeni aya başla

BEKLENİLEN SÜRE: 1 saat
TEST SAYISI: 12 aylık simülasyon
```

#### Senaryo 4: Acil Durum
```
ADIMLAR:
1. Uygulama crash olursa -> Restart -> Data loss var mı?
2. Database corrupt olursa -> Backup'tan restore
3. Lisans expire olursa -> Yenileme süreci
4. Disk dolursa -> Hata mesajı ve öneri
5. İnternet kesilirse -> Offline çalışma

TEST SAYISI: 50+ hata senaryosu
```

---

### 2.4 PERFORMANCE TESTS (Performans Testleri)

#### Test 1: Data Volume
```
TEST EDİLECEK:
- 100 sipariş: < 100ms response
- 1,000 sipariş: < 500ms response
- 10,000 sipariş: < 2s response
- 100,000 sipariş: < 10s response

DATABASE BOYUTU:
- 100 sipariş: ~1 MB
- 10,000 sipariş: ~100 MB
- 100,000 sipariş: ~1 GB

MEMORY USAGE:
- İdeal: < 300 MB
- Maksimum: < 500 MB
- Leak check: 24 saat sürekli çalışma
```

#### Test 2: Concurrent Operations
```
SENARYO:
- 5 sipariş aynı anda oluşturulsun
- Database lock handling
- UI responsive kalsın
- No data corruption

TOOL: custom stress test script
```

#### Test 3: Startup Performance
```
- İlk açılış: < 5 saniye
- Sonraki açılışlar: < 2 saniye
- 10,000 siparişle açılış: < 10 saniye
- Memory footprint after startup: < 250 MB
```

#### Test 4: Search/Filter Performance
```
- 10,000 sipariş içinde arama: < 300ms
- Filtreleme: < 200ms
- Sıralama: < 200ms
- Pagination: < 100ms
```

---

### 2.5 SECURITY TESTS (Güvenlik Testleri)

#### Test 1: License Security
```
ATTACK SCENARIOS:
❌ License file kopyalama
❌ Machine ID spoofing
❌ Lisans dosyasını hex editor ile değiştirme
❌ DLL injection
❌ Memory manipulation
❌ Debugger ile lisans bypass
❌ VM snapshot ile lisans çoğaltma
❌ Time manipulation (sistem saatini değiştirme)

TOOL: Professional pentest team
```

#### Test 2: Data Security
```
CHECKS:
✓ Database encryption (if applicable)
✓ Password storage (never plain text)
✓ SMTP credentials encryption
✓ File permissions (database, backups)
✓ Temp file cleaning
✓ Log file sanitization (no passwords)
```

#### Test 3: Input Validation
```
ATTACK SCENARIOS:
❌ SQL Injection: ' OR '1'='1
❌ XSS: <script>alert('xss')</script>
❌ Path Traversal: ../../etc/passwd
❌ Command Injection: ; rm -rf /
❌ Buffer Overflow: 10,000 karakter input
❌ Unicode attacks: ../../etc/passwd (Unicode)
❌ CRLF Injection: \r\n Header: malicious

TOOL: OWASP ZAP, Burp Suite
```

#### Test 4: Electron Security
```
CHECKS:
✓ contextIsolation: true
✓ nodeIntegration: false
✓ sandbox: true
✓ webSecurity: true
✓ allowRunningInsecureContent: false
✓ Remote code execution prevention
✓ IPC whitelist validation

TOOL: Electronegativity
```

---

### 2.6 COMPATIBILITY TESTS (Uyumluluk Testleri)

#### Windows Versions
```
TEST EDİLECEK:
✓ Windows 10 (1909, 2004, 20H2, 21H1, 21H2, 22H2)
✓ Windows 11 (21H2, 22H2, 23H2)
✓ Windows Server 2019
✓ Windows Server 2022

32-bit vs 64-bit:
- Sadece 64-bit destekleniyor mu?
- 32-bit'te çalışır mı?
```

#### Hardware Compatibility
```
MINIMUM SPECS:
- CPU: Intel i3 / AMD Ryzen 3 (2 core)
- RAM: 4 GB
- Disk: 1 GB boş alan
- Screen: 1280x720

RECOMMENDED:
- CPU: Intel i5 / AMD Ryzen 5 (4 core)
- RAM: 8 GB
- Disk: 10 GB (backup için)
- Screen: 1920x1080

EXTREME (en düşük):
- CPU: Intel Celeron
- RAM: 2 GB
- Disk: 500 MB
- Screen: 1024x768

TEST: Her konfigürasyonda çalışsın
```

#### Screen Resolutions
```
TEST:
- 1024x768 (eski laptop)
- 1280x720 (HD)
- 1366x768 (netbook)
- 1920x1080 (Full HD) - standard
- 2560x1440 (QHD)
- 3840x2160 (4K)

UI TESTI:
- Scrollbar gerekli mi?
- Responsive mı?
- Kırılma var mı?
- Font okunabiliyor mu?
```

#### Regional Settings
```
TEST:
- Türkçe Windows
- İngilizce Windows
- Tarih formatı (DD/MM/YYYY vs MM/DD/YYYY)
- Sayı formatı (1.000,00 vs 1,000.00)
- Ondalık ayracı (virgül vs nokta)
- Para birimi sembolü (₺ vs TL)
- Klavye layout (Q vs F)
```

---

### 2.7 USABILITY TESTS (Kullanılabilirlik Testleri)

#### Test 1: İlk Kullanıcı Deneyimi
```
HEDEF: Teknik bilgisi olmayan kullanıcı

SENARYO:
- Kullanıcıya hiçbir talimat verilmeden uygulamayı kullanması istenir
- Gözlemlenir:
  * Ne kadar sürede ilk siparişi oluşturabildi?
  * Hangi noktalarda takıldı?
  * Hangi butonları aramak zorunda kaldı?
  * Hata mesajlarını anlayabildi mi?

BEKLENTİ:
- İlk sipariş: < 5 dakika
- Hiçbir kritik hata yapmamalı
- Yardım belgesine bakmadan temel işlemleri yapabilmeli

TEST SAYISI: 20 farklı kullanıcı
```

#### Test 2: Error Messages
```
KONTROLLER:
✓ Hata mesajları Türkçe
✓ Teknik jargon yok
✓ Çözüm önerisi var
✓ Panik yaratmıyor
✓ İletişim bilgisi var (destek)

ÖRNEKLER:
❌ KÖTÜ: "Database integrity constraint violation on FK_orders_vehicles"
✓ İYİ: "Bu plaka sisteme kayıtlı değil. Lütfen önce 'Araçlar' sayfasından aracı ekleyin."

❌ KÖTÜ: "SMTP AUTH failed (535)"
✓ İYİ: "Mail gönderilemedi. SMTP kullanıcı adı veya şifre hatalı. Lütfen Ayarlar > Mail bölümünden kontrol edin."
```

#### Test 3: Workflow Efficiency
```
TEST:
- Sipariş oluşturmak kaç tıklama?
- Rapor almak kaç tıklama?
- En çok kullanılan işlemler kolay erişilebilir mi?
- Kısa yollar (keyboard shortcuts) var mı?
- Autocomplete, dropdown gibi kolaylıklar var mı?

BEKLENTİ:
- Sipariş oluştur: maksimum 10 tıklama
- Tekrarlayan işlemler için "Son kullanılanlar" önerisi
- Tab key ile form navigation
```

---

## 3. KRİTİK TEST SENARYOLARI

### 3.1 VERI BÜTÜNLÜĞÜ (Data Integrity)

#### Senaryo 1: Para Kayıpı Riski
```
PROBLEM: Maliyet hesabı yanlış olursa şirket para kaybeder

TEST:
1. 100 farklı güzergah için manuel hesap yap
2. Sistem hesabı ile karşılaştır
3. Fark toleransı: maksimum 1 TL

ÖRNEK:
Manuel Hesap:
- Yakıt: 6,840 TL
- Sürücü: 3,200 TL
- HGS: 600 TL
- Bakım: 1,147 TL
- TOPLAM: 11,787 TL

Sistem Hesabı: 11,787 TL ✓
Fark: 0 TL ✓

EĞER FARK > 1 TL ise: ❌ KRİTİK HATA - DEPLOYMENT DURDUR
```

#### Senaryo 2: Sipariş Kaybı
```
PROBLEM: Database hata verirse sipariş kaybolabilir

TEST:
1. 1000 sipariş oluştur
2. Random zamanlarda uygulama crash ettir
3. Restart sonrası kontrol et:
   - Kaç sipariş kayıtlı?
   - Data corruption var mı?
   - Orphan records var mı?

BEKLENTİ:
- Hiçbir sipariş kaybolmamalı
- En son commit edilen transaction'a kadar data intact olmalı
- WAL mode sayesinde crash-safe olmalı
```

#### Senaryo 3: Yedekleme ve Geri Yükleme
```
TEST:
1. 5000 sipariş, 20 araç, 50 güzergah, 100 gider oluştur
2. Backup al
3. Database'i sil
4. Backup'tan restore et
5. Tüm dataları kontrol et

BEKLENTİ:
- %100 data recovery
- Hiçbir kayıt bozulmamalı
- İlişkiler (foreign keys) korunmalı
- İndexler yeniden oluşmalı
```

---

### 3.2 PERFORMANS KRİTİK NOKTALAR

#### Test 1: Dashboard Açılış Süresi
```
SENARYO:
- 10,000 sipariş var
- User dashboard'u açıyor

BEKLENTİ:
- İlk render: < 1 saniye
- Grafikler çizilsin: < 3 saniye
- Tüm istatistikler yüklensin: < 5 saniye

EĞER > 10 saniye ise: UI freeze problemi, optimizasyon gerekli
```

#### Test 2: Rapor Oluşturma
```
SENARYO:
- 12 aylık rapor (10,000+ sipariş)
- Excel export

BEKLENTİ:
- Hesaplama: < 5 saniye
- Excel dosyası oluşturma: < 10 saniye
- Dosya boyutu: < 5 MB

EĞER > 30 saniye ise: Background job veya progress bar gerekli
```

---

### 3.3 GÜVENLİK KRİTİK NOKTALAR

#### Test 1: Lisans Bypass Denemesi
```
SENARYO:
Hacker uygulamayı kırmaya çalışıyor

DENEME 1: license.dat dosyasını başka PC'ye kopyala
SONUÇ: ❌ Makine ID uyuşmuyor, çalışmıyor

DENEME 2: Hex editor ile license.dat'ı değiştir
SONUÇ: ❌ Checksum uyuşmuyor, corrupt olduğunu anl

ıyor

DENEME 3: Debugger ile lisans kontrolünü atla
SONUÇ: ❌ Anti-debug mekanizması devrede

DENEME 4: VM snapshot ile lisansı çoğalt
SONUÇ: ❌ Hardware fingerprint farklı

DENEME 5: Sistem saatini geri al (süreli lisans için)
SONUÇ: ❌ NTP sunucudan gerçek zaman kontrolü yapılıyor

BEKLENTİ: HİÇBİR YÖNTEM ÇALIŞMASIN
```

---

## 4. TEST ORTAMLARI

### 4.1 Development Environment
```
AMAÇ: Hızlı iterasyon, hata ayıklama
ÖZELLIKLER:
- Hot reload aktif
- DevTools açık
- Verbose logging
- Mock data kullanımı
- Test database (kopyalanabilir)
```

### 4.2 Staging Environment
```
AMAÇ: Production benzeri test
ÖZELLIKLER:
- Production build
- Gerçek lisans sistemi
- Gerçek database
- Monitoring aktif
- Log aggregation
```

### 4.3 Production-Like Environment
```
AMAÇ: Son deployment öncesi doğrulama
ÖZELLIKLER:
- Farklı Windows versiyonları
- Farklı hardware konfigürasyonları
- Yavaş internet bağlantısı simülasyonu
- Disk dolu senaryosu
- 7/24 çalışma senaryosu
```

---

## 5. TEST ARAÇLARI VE TEKNOLOJİLER

### 5.1 Unit Testing
```
FRAMEWORK: Jest
COVERAGE TOOL: Istanbul

COMMANDS:
npm install --save-dev jest @types/jest ts-jest
npm test -- --coverage

HEDEF: Minimum %90 code coverage
```

### 5.2 Integration Testing
```
FRAMEWORK: Jest + Supertest (IPC testing için custom wrapper)

MOCK TOOLS:
- better-sqlite3 mock
- Electron IPC mock
- File system mock
```

### 5.3 E2E Testing
```
FRAMEWORK: Playwright (Electron için)

SETUP:
npm install --save-dev @playwright/test playwright-electron

TEST SCRIPT:
- Her senaryo için ayrı test dosyası
- Paralel çalıştırma
- Screenshot + video kayıt
```

### 5.4 Performance Testing
```
TOOL: Custom Node.js script
- Database'e 10,000 sipariş ekle
- Her operasyonu time'la
- Memory profiling
- CPU profiling

TOOL: Lighthouse (Electron için)
```

### 5.5 Security Testing
```
TOOLS:
- Electronegativity (Electron güvenlik taraması)
- npm audit (dependency vulnerability)
- Snyk (real-time vulnerability monitoring)
- OWASP ZAP (dynamic security testing)
- Manual penetration testing
```

### 5.6 UI/UX Testing
```
TOOLS:
- Percy (visual regression testing)
- Chromatic (UI component testing)
- Hotjar benzeri user behavior analizi (özel tool)

METRICS:
- Time to first interaction
- Task completion rate
- Error rate
- User satisfaction score (survey)
```

---

## 6. DEPLOYMENT CHECKLIST

### 6.1 Pre-Deployment (Deploy Öncesi)

#### Kod Kalitesi
```
✓ Tüm unit testler geçti (%90+ coverage)
✓ Tüm integration testler geçti
✓ Tüm E2E testler geçti
✓ Performance testler başarılı
✓ Security audit temiz
✓ Code review tamamlandı
✓ Documentation güncel
✓ Changelog hazırlandı
```

#### Build Kontrolü
```
✓ Production build başarılı
✓ Electron builder hatasız çalıştı
✓ Setup.exe boyutu makul (< 150 MB)
✓ Setup test edildi (yükleme/kaldırma)
✓ Auto-update mekanizması test edildi
✓ Code signing yapıldı (eğer varsa)
✓ Installer farklı Windows versiyonlarında çalışıyor
```

#### Dokümantasyon
```
✓ Kullanıcı kılavuzu hazır
✓ Teknik dokümantasyon güncel
✓ API dokümantasyonu güncel
✓ Troubleshooting guide hazır
✓ FAQ hazır
✓ Video tutorial hazır (opsiyonel)
```

### 6.2 Pilot Deployment (İlk 50 Şirket)

#### Seçim Kriterleri
```
- Farklı sektörlerden
- Farklı şirket büyüklüklerinden (küçük, orta, büyük)
- Farklı coğrafi bölgelerden
- Teknoloji altyapısı farklı
- IT desteği olan ve olmayan firmalar
```

#### Monitoring
```
✓ 7/24 monitoring sistemi aktif
✓ Error tracking (Sentry benzeri)
✓ Performance monitoring
✓ User analytics
✓ Support ticket sistemi hazır
✓ Hotline telefon aktif
```

#### Geri Bildirim Toplama
```
ARAÇLAR:
- Aylık anket
- Haftalık kullanıcı görüşmesi
- In-app feedback formu
- Support ticket analizi
- Usage analytics

METRIKLER:
- Daily Active Users (DAU)
- Feature usage rates
- Error rates
- Support ticket count
- User satisfaction score
```

### 6.3 Full Deployment (Aşamalı)

#### Hafta 1: 200 şirket
```
HEDEF: Sistem kararlılığını doğrula
MONITORING: Yoğun, günlük raporlar
SUPPORT: 24/7 hazır bekle
```

#### Hafta 2: +200 şirket (Toplam 400)
```
HEDEF: Support yükünü değerlendir
KONTROL: Error rate artıyor mu?
```

#### Hafta 3-6: Her hafta +200 şirket
```
HEDEF: 1200 şirkete ulaş
KONTROL: Performance degradation var mı?
```

#### Post-Deployment
```
✓ İlk ay her gün monitoring
✓ İlk 3 ay haftalık raporlar
✓ 6. ayda major review
✓ Sürekli iyileştirme (feedback bazlı)
```

---

## 7. ACİL DURUM PLANI

### 7.1 Kritik Hata Senaryoları

#### Senaryo 1: Toplu Data Kaybı
```
PROBLEM: Bir bug yüzünden kullanıcılar veri kaybediyor

ACİL MÜDAHALE (0-2 saat):
1. Tüm yeni deploymentları DURDUR
2. Etkilenen kullanıcıları tespit et
3. Backup'lardan restore planı hazırla
4. Kullanıcılara acil mail gönder

ÇÖZÜM (2-24 saat):
1. Bug'ı bul ve düzelt
2. Hotfix release hazırla
3. Test et (express test suite)
4. Deploy et
5. Etkilenen kullanıcılara manual destek

ÖNLEME:
- Database transaction'ları gözden geçir
- Backup frequency arttır (her 6 saatte bir)
- Data integrity check'leri ekle
```

#### Senaryo 2: Lisans Sistemi Çökmesi
```
PROBLEM: Lisans validation hata veriyor, kimse giriş yapamıyor

ACİL MÜDAHALE (0-1 saat):
1. Lisans sunucusu var mı kontrol et (offline sistem ise bu senaryo farklı)
2. Geçici bypass kodu yayınla (risk kabul belgesi ile)
3. Kullanıcılara acil duyuru

ÇÖZÜM (1-8 saat):
1. Hatayı tespit et
2. Düzelt ve test et
3. Hotfix release
4. Bypass kodunu iptal et

ÖNLEME:
- Lisans sistemi offline çalışmalı (şu anki sistem zaten offline)
- Grace period ekle (5 günlük)
- Emergency bypass mekanizması
```

#### Senaryo 3: Performance Degradation
```
PROBLEM: 500+ şirket aynı anda kullanıyor, sistem yavaşlıyor

ACİL MÜDAHALE (0-4 saat):
1. Performance profiling yap
2. Bottleneck'leri tespit et
3. Geçici optimizasyonlar (cache, indexing)
4. Load balancing (eğer server-side component varsa)

ÇÖZÜM (4-48 saat):
1. Database query optimizasyonu
2. Frontend rendering optimizasyonu
3. Lazy loading ekle
4. Pagination/virtualization
5. Test ve deploy

ÖNLEME:
- Regular performance testing
- Profiling tools her release'de
- Benchmark suite oluştur
```

### 7.2 İletişim Planı

#### Kullanıcılara Bildirm
```
KANAL 1: In-App Notification
- Uygulama içi banner
- Kritik hata: Kırmızı
- Uyarı: Sarı
- Bilgi: Mavi

KANAL 2: Email
- Acil durumlar için toplu mail
- Template hazır olmalı
- Otomatik gönderim sistemi

KANAL 3: SMS (Kritik Durumlarda)
- Sadece total outage durumunda
- Firma sahibi ve IT sorumlusuna

KANAL 4: WhatsApp Business (Opsiyonel)
- Hızlı destek için
```

#### Destek Ekibi Protokolü
```
SEVİYE 1 (Düşük - Normal saatlerde çözülebilir):
- Küçük UI bug'ları
- Dokümantasyon hataları
- Feature istekleri

SEVİYE 2 (Orta - 24 saat içinde çözülmeli):
- Kullanıcı bazlı problemler
- Performance sorunları
- Export hataları

SEVİYE 3 (Yüksek - 8 saat içinde çözülmeli):
- Maliyet hesaplama hataları
- Data sync problemleri
- Lisans sorunları

SEVİYE 4 (Kritik - Anında müdahale):
- Toplu data kaybı
- Security breach
- Total application failure
```

---

## 8. TEST OTOMASYON YAPI TASARIMI

### 8.1 Klasör Yapısı
```
tests/
├── unit/
│   ├── backend/
│   │   ├── database.test.ts
│   │   ├── cost-calculator.test.ts
│   │   ├── license-manager.test.ts
│   │   └── mail-service.test.ts
│   └── frontend/
│       ├── components/
│       ├── utils/
│       └── hooks/
├── integration/
│   ├── ipc-handlers.test.ts
│   ├── database-backend.test.ts
│   └── frontend-backend.test.ts
├── e2e/
│   ├── user-journey-1.test.ts
│   ├── user-journey-2.test.ts
│   └── critical-flows.test.ts
├── performance/
│   ├── load-test.ts
│   ├── stress-test.ts
│   └── memory-leak-test.ts
├── security/
│   ├── license-bypass.test.ts
│   ├── sql-injection.test.ts
│   └── xss-attacks.test.ts
├── compatibility/
│   ├── windows-versions.test.ts
│   └── screen-resolutions.test.ts
└── fixtures/
    ├── mock-data.ts
    ├── test-database.ts
    └── sample-orders.ts
```

### 8.2 Test Script Örnekleri

#### Cost Calculator Test (Unit)
```typescript
// tests/unit/backend/cost-calculator.test.ts

import { ProfessionalCostCalculator, DEFAULT_PROFESSIONAL_PARAMS } from '@/electron/main/professional-cost-calculator'

describe('ProfessionalCostCalculator', () => {
  let calculator: ProfessionalCostCalculator

  beforeEach(() => {
    calculator = new ProfessionalCostCalculator(DEFAULT_PROFESSIONAL_PARAMS)
  })

  describe('Yakıt Hesaplaması', () => {
    it('900 km için doğru litre hesaplamalı', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(900)
      
      // 900 km / 100 * 25 lt/100km = 225 lt
      expect(litre).toBe(225)
      
      // 225 lt * 40 TL/lt = 9000 TL
      expect(maliyet).toBe(9000)
    })

    it('0 km için 0 maliyet dönmeli', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(0)
      expect(litre).toBe(0)
      expect(maliyet).toBe(0)
    })

    it('negatif km için hata fırlatmamalı (abs almalı veya 0 dönmeli)', () => {
      expect(() => calculator.calculateFuelCost(-100)).not.toThrow()
    })

    it('çok büyük km (100,000) için overflow olmamalı', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(100000)
      expect(litre).toBeGreaterThan(0)
      expect(maliyet).toBeGreaterThan(0)
      expect(Number.isFinite(litre)).toBe(true)
      expect(Number.isFinite(maliyet)).toBe(true)
    })
  })

  describe('Detaylı Maliyet Analizi', () => {
    it('İstanbul-Ankara gidiş-dönüş doğru hesaplanmalı', () => {
      const route = {
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 450,
        donusKm: 450,
        returnLoadRate: 0,
        tahminiGun: 2
      }

      const analysis = calculator.analyzeDetailedCost(route, 21208)

      expect(analysis.etkinKm).toBe(900) // 450 + 450
      expect(analysis.costBreakdown.yakitLitre).toBeCloseTo(225, 1)
      expect(analysis.costBreakdown.yakitMaliyet).toBeCloseTo(9000, 1)
      expect(analysis.costBreakdown.surucuMaliyet).toBe(3200) // 2 gün * 1600
      expect(analysis.costBreakdown.yemekMaliyet).toBe(300) // 2 gün * 150
      
      // Kar/Zarar kontrolü
      expect(analysis.karZarar).toBeGreaterThan(0) // Karlı olmalı
    })

    it('maliyet hesabı manuel hesapla uyumlu olmalı', () => {
      // Manuel hesap:
      const manuelYakit = (900 / 100) * 25 * 40 // 9000 TL
      const manuelSurucu = 2 * 1600 // 3200 TL
      const manuelYemek = 2 * 150 // 300 TL
      const manuelHGS = 600 // TL (İstanbul-Ankara)
      const manuelBakim = 
        (900 / 5000) * 500 + // Yağ
        (900 / 50000) * 8000 + // Lastik
        (900 / 15000) * 3000 // Büyük bakım
      
      const manuelToplam = manuelYakit + manuelSurucu + manuelYemek + manuelHGS + manuelBakim

      const route = {
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 450,
        donusKm: 450,
        returnLoadRate: 0,
        tahminiGun: 2
      }

      const analysis = calculator.analyzeDetailedCost(route, 0, {
        hgs_maliyet: 450,
        kopru_maliyet: 150
      })

      // 1 TL tolerans ile karşılaştır
      expect(Math.abs(analysis.toplamMaliyet - manuelToplam)).toBeLessThan(1)
    })
  })

  describe('Edge Cases', () => {
    it('null/undefined parametreler default değer almalı', () => {
      const route = {
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 450,
        donusKm: 0,
        returnLoadRate: 0,
        tahminiGun: undefined as any
      }

      expect(() => calculator.analyzeDetailedCost(route, 0)).not.toThrow()
    })

    it('çok küçük mesafe (1 km) için hesap doğru olmalı', () => {
      const route = {
        nereden: 'Test',
        nereye: 'Test',
        gidisKm: 1,
        donusKm: 0,
        returnLoadRate: 0,
        tahminiGun: 1
      }

      const analysis = calculator.analyzeDetailedCost(route, 0)
      expect(analysis.costBreakdown.yakitMaliyet).toBeCloseTo(10, 1) // ~10 TL
    })

    it('returnLoadRate %100 olursa dönüş maliyetsiz sayılmalı', () => {
      const route = {
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 450,
        donusKm: 450,
        returnLoadRate: 1.0, // %100
        tahminiGun: 2
      }

      const analysis = calculator.analyzeDetailedCost(route, 0)
      expect(analysis.etkinKm).toBe(450) // Sadece gidiş
    })
  })
})
```

#### IPC Handler Test (Integration)
```typescript
// tests/integration/ipc-handlers.test.ts

import { ipcMain } from 'electron'
import { initDatabase, getDB } from '@/electron/main/database'

describe('IPC Handlers - Database Operations', () => {
  beforeAll(() => {
    // Test database oluştur
    initDatabase()
  })

  afterEach(() => {
    // Her test sonrası database temizle
    const db = getDB()
    db.exec('DELETE FROM orders')
    db.exec('DELETE FROM vehicles')
    db.exec('DELETE FROM routes')
  })

  describe('db:createOrder', () => {
    it('yeni sipariş oluşturmalı', async () => {
      const orderData = {
        plaka: '34 ABC 123',
        musteri: 'Test Müşteri',
        telefon: '0555 123 4567',
        nereden: 'İstanbul',
        nereye: 'Ankara',
        yukAciklamasi: 'Test yük',
        baslangicFiyati: 21208,
        gidisKm: 450,
        donusKm: 450,
        etkinKm: 900,
        tahminiGun: 2,
        toplamMaliyet: 12188,
        karZarar: 6581
      }

      // Simulate IPC call
      const result = await ipcMain.emit('db:createOrder', {}, orderData)
      
      expect(result.success).toBe(true)
      expect(result.id).toBeDefined()

      // Database'den kontrol et
      const db = getDB()
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.id)
      expect(order).toBeDefined()
      expect(order.musteri).toBe('Test Müşteri')
    })

    it('geçersiz veri ile hata vermeli', async () => {
      const invalidData = {
        plaka: '', // Boş plaka
        musteri: 'Test',
        // eksik alanlar...
      }

      await expect(
        ipcMain.emit('db:createOrder', {}, invalidData)
      ).rejects.toThrow()
    })

    it('SQL injection denemesini engellemeli', async () => {
      const maliciousData = {
        plaka: "'; DROP TABLE orders; --",
        musteri: 'Test',
        telefon: '0555',
        nereden: 'A',
        nereye: 'B',
        baslangicFiyati: 1000
      }

      await ipcMain.emit('db:createOrder', {}, maliciousData)
      
      // Orders tablosu hala var olmalı
      const db = getDB()
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'").get()
      expect(tableExists).toBeDefined()
    })
  })

  describe('db:getOrders - Filtering', () => {
    beforeEach(async () => {
      // Test data ekle
      const orders = [
        { plaka: '34 ABC 123', musteri: 'Müşteri A', telefon: '0555 111', status: 'Bekliyor' },
        { plaka: '06 DEF 456', musteri: 'Müşteri B', telefon: '0555 222', status: 'Yolda' },
        { plaka: '35 GHI 789', musteri: 'Müşteri C', telefon: '0555 333', status: 'Teslim Edildi' },
      ]

      for (const order of orders) {
        await ipcMain.emit('db:createOrder', {}, {
          ...order,
          nereden: 'İstanbul',
          nereye: 'Ankara',
          baslangicFiyati: 10000
        })
      }
    })

    it('durum filtrelemesi çalışmalı', async () => {
      const result = await ipcMain.emit('db:getOrders', {}, { status: 'Yolda' })
      expect(result.length).toBe(1)
      expect(result[0].musteri).toBe('Müşteri B')
    })

    it('arama (search) çalışmalı', async () => {
      const result = await ipcMain.emit('db:getOrders', {}, { search: 'Müşteri A' })
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].musteri).toContain('Müşteri A')
    })

    it('filtre ve arama birlikte çalışmalı', async () => {
      const result = await ipcMain.emit('db:getOrders', {}, { 
        status: 'Bekliyor',
        search: '34 ABC'
      })
      expect(result.length).toBe(1)
    })
  })
})
```

### 8.3 CI/CD Pipeline

```yaml
# .github/workflows/test.yml

name: Comprehensive Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-2019, windows-2022]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit --audit-level=moderate
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## 9. BAŞARI KRİTERLERİ

### 9.1 Test Geçiş Kriterleri
```
✓ Unit Test Coverage: > %90
✓ Integration Tests: %100 geçti
✓ E2E Tests: %100 geçti
✓ Performance Tests: Tüm metrikler hedefte
✓ Security Tests: Hiçbir kritik vulnerability yok
✓ UAT: Pilot kullanıcı memnuniyet skoru > 4/5
✓ Zero critical bugs
✓ Maximum 5 minor bugs (düzeltilebilir)
```

### 9.2 Production Hazırlık Kriterleri
```
✓ Tüm dokümantasyon tamamlandı
✓ Support ekibi eğitildi
✓ Monitoring sistemleri aktif
✓ Backup otomasyonu çalışıyor
✓ Rollback planı hazır
✓ Emergency hotfix prosedürü hazır
✓ Customer communication planı hazır
```

### 9.3 Post-Deployment Metrikleri (İlk 30 Gün)
```
HEDEF:
- Crash rate: < %0.1
- Critical bug count: 0
- Average response time: < 500ms
- Support ticket resolution time: < 24 saat
- User satisfaction: > 4.5/5
- Daily Active Users: > %80 (1200'ün %80'i = 960 aktif kullanıcı)
```

---

## 10. SONUÇ VE TAVSİYELER

### 10.1 Kritik Başarı Faktörleri

1. **ASLA ACELEYİ ETME**: 1200 şirketin kullanacağı bir sistem için zaman kayıptan önemli değil, kalite her şeyden önemli

2. **PILOT TEST MUTLAKA OLSUN**: En az 50 şirket ile 2 hafta real-world kullanım

3. **MONİTORİNG HER ZAMAN AKTİF**: Deployment sonrası ilk 30 gün 24/7 monitoring

4. **ACİL DURUM PLANI HAZIR**: Rollback, hotfix, backup restore senaryoları prova edilmiş olsun

5. **KULLANICI EĞİTİMİ**: Her şirkete onboarding desteği, ilk kullanımda yanlarında olun

### 10.2 Risk Azaltma Stratejileri

#### Yüksek Riskli Alanlar:
1. **Maliyet Hesaplama Modülü**: En kritik, para kaybı riski
   - ÇÖZÜM: 1000+ senaryo ile test, muhasebeci onayı

2. **Lisans Sistemi**: Kırılırsa gelir kaybı
   - ÇÖZÜM: 3. parti security audit, pentest

3. **Database Operations**: Data kaybı riski
   - ÇÖZÜM: Otomatik backup, transaction safety, WAL mode

4. **Performance**: 1200 kullanıcı ile yavaşlama riski
   - ÇÖZÜM: Load testing, profiling, optimization

### 10.3 Final Deployment Kararı

**Deployment yapılabilir MI?**

Bu sorular EVET ise devam et:
- [ ] Tüm testler geçti mi?
- [ ] Pilot test başarılı mı?
- [ ] Dokümantasyon hazır mı?
- [ ] Support ekibi hazır mı?
- [ ] Rollback planı var mı?
- [ ] Monitoring aktif mi?
- [ ] Acil durum ekibi hazırda mı?
- [ ] CEO/CTO onayı var mı?

**Bu sorulardan biri bile HAYIR ise: DEPLOYMENT ERTELENMELİ**

---

## EKLER

### EK-A: Test Veri Setleri
- 100 örnek sipariş (farklı güzergahlar)
- 20 araç profili (farklı parametreler)
- 50 güzergah
- 1000 rastgele sipariş (load testing için)

### EK-B: Test Script Şablonları
- Unit test template
- Integration test template
- E2E test template
- Performance test script

### EK-C: Bug Report Template
- Başlık
- Severity (Critical/High/Medium/Low)
- Adımlar (reproduce)
- Beklenen davranış
- Gerçek davranış
- Screenshots/videos
- System info

### EK-D: Release Checklist
- Pre-release checklist
- During release checklist
- Post-release monitoring checklist

---

**Hazırlayan:** Test Departmanı  
**Tarih:** {{ BUGÜN }}  
**Versiyon:** 1.0  
**Durum:** Onay Bekliyor

**Onaylayanlar:**
- [ ] CTO
- [ ] Lead Developer
- [ ] QA Manager
- [ ] Product Owner

