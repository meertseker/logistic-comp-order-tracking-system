# 🚨 KRİTİK BUG PROTOKOLÜ
## Sekersoft - Emergency Response Plan

**DİKKAT:** Bu doküman sadece production deployment sonrası kritik hatalar için kullanılır.

---

## 🎯 SEVERITY SEVİYELERİ

### LEVEL 1: CRITICAL (Kırmızı)
**Tanım:** Uygulama kullanılamaz durumda veya data kaybı riski var

**Örnekler:**
- ❌ Uygulama crash oluyor (sürekli)
- ❌ Database corruption
- ❌ Toplu veri kaybı
- ❌ Lisans sistemi çalışmıyor (kimse giriş yapamıyor)
- ❌ Kritik güvenlik açığı (exploit edilebilir)
- ❌ Maliyet hesabı tamamen yanlış (para kaybı)

**Müdahale Süresi:** 0-2 SAAT  
**Escalation:** ANINDA CTO + CEO bilgilendirilir  
**Action:** HOTFIX acil deployment

---

### LEVEL 2: HIGH (Turuncu)
**Tanım:** Önemli özellikler çalışmıyor ama workaround mevcut

**Örnekler:**
- ⚠️ Rapor oluşturma çalışmıyor
- ⚠️ Mail gönderim hatası
- ⚠️ Export (Excel/PDF) fail oluyor
- ⚠️ Sipariş güncelleme çalışmıyor (silme/ekleme çalışıyor)
- ⚠️ Performance çok kötü (10x yavaşlama)
- ⚠️ Bazı kullanıcılarda crash (hepsi değil)

**Müdahale Süresi:** 2-8 SAAT  
**Escalation:** Dev Lead + QA Manager  
**Action:** Hotfix veya workaround

---

### LEVEL 3: MEDIUM (Sarı)
**Tanım:** Küçük özellikler çalışmıyor veya rahatsız edici bug

**Örnekler:**
- 🟡 UI bozukluğu
- 🟡 Yavaş response (ama kullanılabilir)
- 🟡 Küçük veri tutarsızlıkları
- 🟡 Bazı filtreleme çalışmıyor
- 🟡 Hata mesajları belirsiz
- 🟡 Grafik görünmüyor

**Müdahale Süresi:** 8-24 SAAT  
**Escalation:** Development Team  
**Action:** Normal release cycle ile düzeltme

---

### LEVEL 4: LOW (Yeşil)
**Tanım:** Estetik veya minor sorunlar

**Örnekler:**
- 🟢 Typo (yazım hatası)
- 🟢 İkon yanlış
- 🟢 Renk uyumsuzluğu
- 🟢 Tooltip eksik
- 🟢 Console warning

**Müdahale Süresi:** 1-7 GÜN  
**Escalation:** Yok (backlog'a eklenir)  
**Action:** Sonraki sprint'te düzeltilir

---

## 📞 ACİL DURUM İLETİŞİM LİSTESİ

### Tier 1: First Responders (7/24 Erişilebilir)

| Rol | İsim | Telefon | Email | Yedek |
|-----|------|---------|-------|-------|
| **Support Lead** | [İsim] | 0XXX XXX XX XX | support@... | [Yedek] |
| **Backend Dev** | [İsim] | 0XXX XXX XX XX | dev@... | [Yedek] |
| **Frontend Dev** | [İsim] | 0XXX XXX XX XX | dev@... | [Yedek] |

### Tier 2: Escalation Team (İş saatleri + on-call)

| Rol | İsim | Telefon | Email |
|-----|------|---------|-------|
| **Dev Lead** | [İsim] | 0XXX XXX XX XX | lead@... |
| **QA Manager** | [İsim] | 0XXX XXX XX XX | qa@... |

### Tier 3: Executive Team (Kritik durumlar)

| Rol | İsim | Telefon | Email |
|-----|------|---------|-------|
| **CTO** | [İsim] | 0XXX XXX XX XX | cto@... |
| **CEO** | [İsim] | 0XXX XXX XX XX | ceo@... |

---

## 🔥 CRITICAL BUG RESPONSE PROCEDURE

### İLK 15 DAKİKA: TRIAGE

#### 1. Bug Raporu Geldiğinde

```
[ ] Severity seviyesini belirle (CRITICAL/HIGH/MEDIUM/LOW)
[ ] Kaç kullanıcı etkilendi? (1 / 10 / 100 / HEPSI)
[ ] Workaround var mı?
[ ] Data loss riski var mı?
[ ] Reproduce edilebilir mi?
```

#### 2. EĞER CRITICAL ISE

```
⏰ TIMER BAŞLAT: 2 SAAT İÇİNDE ÇÖZÜLMELİ

ANINDA YAP:
1. CTO + CEO'ya WhatsApp: "CRITICAL BUG - [Kısa Açıklama]"
2. Dev team'i topla (video call)
3. Etkilenen kullanıcıları listele
4. In-app notification gönder: "Bir sorun tespit ettik, üzerinde çalışıyoruz"
5. Support ticket sistemi: "Critical bug - [ID]" oluştur
```

### 15-60 DAKİKA: ROOT CAUSE ANALYSIS

#### Checklist: Hatayı Bul

```
[ ] Error logs kontrol et
[ ] Sentry/Monitoring kontrol et
[ ] User'dan steps to reproduce al
[ ] Hata mesajını Google'la
[ ] Son deployment'tan sonra mı başladı?
[ ] Belirli bir Windows version'da mı?
[ ] Database corruption var mı?
[ ] Network problemi mi?
[ ] License problemi mi?
[ ] Calculation bug mu?
```

#### Hata Kategorileri

**A. Backend Bug**
```
Sık Sorunlar:
- Database lock
- SQL query hatası
- IPC handler crash
- File system error
- Memory leak

Debug:
1. Electron main process loglarını al
2. Database integrity check
3. Backup'tan restore test et
```

**B. Frontend Bug**
```
Sık Sorunlar:
- React render hatası
- State management problemi
- API call fail
- Memory leak (React)
- Infinite loop

Debug:
1. Chrome DevTools console
2. React DevTools
3. Network tab kontrol
```

**C. Calculation Bug (ÇOK KRİTİK!)**
```
Sık Sorunlar:
- Yanlış maliyet hesabı
- KDV hesabı hatalı
- Kar/zarar yanlış
- Floating point precision

Debug:
1. Manuel hesap yap
2. Sistem hesabı ile karşılaştır
3. Test case yaz
4. Muhasebeci ile kontrol ettir
```

**D. License Bug (GELİR KAYBI!)**
```
Sık Sorunlar:
- Hardware ID değişti
- License file corrupt
- Validation timeout
- Bypass bulundu (!)

Debug:
1. Hardware fingerprint al
2. License file decrypt et
3. Validation log'ları kontrol et
```

### 60-120 DAKİKA: FIX & TEST

#### Hotfix Hazırlama

```bash
# 1. Bug'ı isolate et
git checkout main
git checkout -b hotfix/critical-bug-[ID]

# 2. Minimal fix yap (sadece bug fix, yeni feature YOK)
# ... code changes ...

# 3. Test yaz
# tests/hotfix/bug-[ID].test.ts

# 4. Test et
npm test -- tests/hotfix/bug-[ID].test.ts
npm run test:critical

# 5. Manual test (kritik senaryolar)
# - Bug reproduce olmuyor mu?
# - Başka şey bozulmadı mı?
# - Edge cases kontrol

# 6. Code review (HIZLI ama DİKKATLİ)
# 2. göz mutlaka kontrol etsin

# 7. Commit & build
git commit -m "HOTFIX: [Kısa açıklama] (#[ID])"
npm run build:win
```

#### Express Test Suite (15 dakika)

```bash
# Sadece kritik testler
npm run test:critical

# Manuel smoke test checklist:
[ ] Uygulama açılıyor
[ ] Lisans çalışıyor
[ ] Sipariş oluşturma çalışıyor
[ ] Maliyet hesabı doğru
[ ] Dashboard açılıyor
[ ] Rapor oluşturuyor
[ ] Export çalışıyor
```

### 120+ DAKİKA: DEPLOYMENT

#### Hotfix Deployment Stratejisi

**1. Etkilenen Kullanıcılara Öncelik**
```
- Önce crash olan kullanıcılara gönder
- Sonra tüm kullanıcılara yay
```

**2. Communication**
```
EMAIL TEMPLATE:

Konu: [ACİL] Sekersoft Güncelleme v1.0.1

Değerli Kullanıcımız,

Sistemimizde [kısa açıklama] sorunu tespit ettik ve düzelttik.

Lütfen ekteki yeni versiyonu yükleyiniz.

NASIL YÜKLENİR:
1. Mevcut uygulamayı kapatın
2. Ekteki setup.exe dosyasını çalıştırın
3. Kurulum tamamlandığında uygulamayı açın

Verileriniz kaybolmayacaktır, tüm siparişleriniz güvende.

Sorun yaşarsanız: 0XXX XXX XX XX

Özür dileriz,
Sekersoft Ekibi
```

**3. Monitoring (İlk 2 Saat)**
```
[ ] Her 15 dakikada bir Sentry kontrol et
[ ] Crash rate düştü mü?
[ ] User feedback olumlu mu?
[ ] Yeni bug report var mı?
[ ] Hotline'da arama patlaması var mı?
```

**4. Post-Mortem (24 Saat İçinde)**
```
TOPLANTI: Tüm ilgili ekip

GÜNDEM:
1. Ne oldu? (timeline)
2. Neden oldu? (root cause)
3. Neden tespit edemedik? (test gap)
4. Nasıl önleriz? (prevention)

OUTPUT:
- Post-mortem raporu
- Yeni test case'ler
- Process iyileştirmesi
- Monitoring iyileştirmesi
```

---

## 📋 BUG REPORT TEMPLATE

### Kullanıcıdan Alınacak Bilgiler

```markdown
## Bug Raporu #[ID]

**Severity:** [ ] CRITICAL [ ] HIGH [ ] MEDIUM [ ] LOW

**Kısa Açıklama:**
[Tek cümle ile ne oldu?]

**Detaylı Açıklama:**
[Tam olarak ne oldu, ne bekliyordunuz?]

**Adımlar (Reproduce):**
1. 
2. 
3. 

**Hata Mesajı:**
```
[Ekran görüntüsü veya hata metni]
```

**Sistem Bilgileri:**
- Windows Version: 
- Uygulama Version: 
- RAM: 
- Disk Boş Alan: 

**Ekran Görüntüleri:**
[Eklerin linki]

**Log Dosyası:**
[Eğer varsa]

**Workaround:**
[Geçici çözüm buldunuz mu?]

**İlk Oluşma Zamanı:**
[Tarih ve saat]

**Sıklık:**
[ ] Her zaman [ ] Sık sık [ ] Bazen [ ] Nadir

**Etkilenen Kullanıcı Sayısı:**
[Biliyorsanız]
```

---

## 🛡️ ROLLBACK PROCEDURE

### EĞER HOTFIX İŞE YARAMAZSA

#### Option 1: Quick Rollback (En Hızlı)

```bash
# 1. Eski stable versiyonu hazırla
git checkout v1.0.0-stable
npm run build:win

# 2. Setup.exe oluştur (zaten builded olmalı)

# 3. Acil deployment
# Tüm kullanıcılara gönder

# 4. Communication
"Geçici olarak eski versiyona dönüyoruz. 
Verileriniz güvende, lütfen ekteki setup'ı kurun."
```

#### Option 2: Emergency Bypass (Geçici)

```typescript
// Eğer spesifik bir feature sorunluysa
// Geçici olarak disable et

// örnek: Mail gönderim sorunu
if (process.env.EMERGENCY_DISABLE_MAIL === 'true') {
  console.warn('EMERGENCY: Mail sistemi devre dışı')
  return { success: false, message: 'Mail sistemi geçici devre dışı' }
}
```

#### Option 3: Database Restore (Data Corruption)

```bash
# 1. Kullanıcıdan son backup'ı iste
# 2. Backup dosyasını restore et
# 3. Integrity check

# Script:
node scripts/restore-from-backup.js --backup-path=/path/to/backup.db
```

---

## 📊 CRITICAL BUG DASHBOARD

### Real-Time Monitoring

**Sentry Dashboard:**
```
- Crash rate: < %0.1
- Error rate: < %1
- Response time: < 500ms
```

**User Metrics:**
```
- Active users: [Şu an kaç kullanıcı aktif]
- Crash reports (son 1 saat): [Sayı]
- Support tickets (son 1 saat): [Sayı]
```

**System Health:**
```
- Hotline call volume: [Normal/Yüksek]
- Email support: [Normal/Yüksek]
- Social media mentions: [Monitoring]
```

---

## 🎯 SUCCESS CRITERIA

### Bug Kapatma Kriterleri

```
✅ Bug fix deploy edildi
✅ 24 saat boyunca yeni crash report YOK
✅ Etkilenen kullanıcılar onayladı
✅ Test case yazıldı (regression prevention)
✅ Post-mortem raporu tamamlandı
✅ Documentation güncellendi
✅ Monitoring/alerting iyileştirildi
```

---

## 📚 LESSONS LEARNED DATABASE

### Geçmiş Critical Buglar

| ID | Tarih | Açıklama | Root Cause | Fix | Prevention |
|----|-------|----------|------------|-----|------------|
| CB-001 | TBD | Maliyet hesabı yanlış | Floating point | Decimal kütüphanesi | Unit test artırıldı |
| CB-002 | TBD | Database lock | Concurrent access | Transaction fix | Stress test eklendi |
| CB-003 | TBD | License bypass | Weak validation | Encryption güçlendirildi | Pentest yapıldı |

---

## ⚠️ NEVER DO THIS (Asla Yapma!)

```
❌ Production'da test etme
❌ Hotfix'i test etmeden deploy etme
❌ Kullanıcıları bilgilendirmeden rollback yapma
❌ Backup almadan database üzerinde işlem yapma
❌ Panic yapma (sakin kal, prosedürü takip et)
❌ Tek başına karar verme (ekip ile konuş)
❌ Quick-and-dirty fix (sonra daha büyük sorun olur)
❌ Log dosyalarını silme (forensics için gerekli)
```

---

## 🔐 CONFIDENTIALITY

**Bu doküman GİZLİDİR.**
- Sadece authorized personnel
- Customer'larla paylaşılmaz
- Public repository'ye konmaz

---

**Hazırlayan:** Emergency Response Team  
**Son Güncelleme:** {{ BUGÜN }}  
**Versiyon:** 1.0

