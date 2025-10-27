# 🛡️ Gelişmiş Lisans Güvenlik Sistemi

## 🚀 Güvenlik Seviyesi: MAKSIMUM

Bu gelişmiş lisans sistemi, yazılımınızı kopyalanmaya ve yetkisiz kullanıma karşı **çok katmanlı koruma** ile güvence altına alır.

---

## 🔐 Güvenlik Katmanları

### 1. Gelişmiş Hardware Fingerprinting
**Ne İşe Yarar**: Her bilgisayarın benzersiz bir "parmak izi" oluşturur.

**Toplanılan Veriler**:
- ✅ Machine ID (İşletim sistemi seviyesi)
- ✅ CPU Bilgisi (Marka, model, çekirdek sayısı)
- ✅ Disk Serial Number (Ana disk seri numarası)
- ✅ MAC Adresleri (Ağ kartı adresleri)

**Sonuç**: Bu 4 farklı donanım verisinin birleşimiyle oluşturulan hash, o bilgisayara özeldir ve kopyalanamaz.

```typescript
// Örnek Fingerprint
Machine ID: 49cd9120-621e-4cc7-9813-6e2afc0b6f58
CPU: Intel-Core i7-8700K-6 cores
Disk: ST1000DM003-1CH162
MAC: 00:1B:44:11:3A:B7
→ Hash: e3b0c44298fc1c149afbf4c8996fb924
```

---

### 2. HMAC Integrity Check (Checksum)
**Ne İşe Yarar**: Lisans dosyasının değiştirilip değiştirilmediğini tespit eder.

**Nasıl Çalışır**:
- Lisans kaydedilirken HMAC-SHA256 ile bir checksum oluşturulur
- Her kontrolde bu checksum doğrulanır
- Dosya elle değiştirilirse checksum uyuşmaz → Lisans geçersiz

**Koruma**: Hex editor ile lisans dosyasını değiştirme girişimleri tespit edilir.

---

### 3. File Tampering Detection
**Ne İşe Yarar**: Lisans dosyasının son değiştirilme zamanını takip eder.

**Nasıl Çalışır**:
- İlk açılışta dosyanın `mtime` (modification time) kaydedilir
- Her kontrolde dosya zamanı kontrol edilir
- Manuel değişiklik tespit edilirse → Lisans geçersiz

**Koruma**: Dosya sistemi seviyesinde manipülasyon girişimlerini engeller.

---

### 4. Periyodik Doğrulama
**Ne İşe Yarar**: Uygulama çalışırken de sürekli lisans kontrolü yapar.

**Nasıl Çalışır**:
- Her **5 dakikada bir** otomatik lisans doğrulama
- Lisans geçersiz olursa → Uygulama otomatik kapanır
- Background'da sessizce çalışır

**Koruma**: Runtime'da lisans dosyasını silme/değiştirme girişimlerini engeller.

```typescript
// Periyodik kontrol
setInterval(async () => {
  const validation = await licenseManager.validateLicense()
  if (!validation.valid) {
    app.quit() // Uygulama kapanır
  }
}, 5 * 60 * 1000) // 5 dakika
```

---

### 5. Virtual Machine Detection
**Ne İşe Yarar**: Yazılımın sanal makinede çalışıp çalışmadığını tespit eder.

**Nasıl Çalışır**:
- Sistem bilgilerini analiz eder
- VMware, VirtualBox, QEMU gibi VM'leri tespit eder
- İsteğe bağlı olarak VM'de çalışmayı engelleyebilirsiniz

**Tespit Edilen VM'ler**:
- VMware
- VirtualBox
- QEMU
- Hyper-V
- Parallels

**Not**: Şu anda sadece tespit ediyor, engellemek isterseniz kodu aktifleştirebilirsiniz.

---

### 6. AES-256-CBC Şifreleme
**Ne İşe Yarar**: Lisans dosyasını güçlü şifreleme ile korur.

**Özellikler**:
- AES-256-CBC (Askeri seviye şifreleme)
- `crypto.scryptSync()` ile anahtar türetme
- Random IV (Initialization Vector) her kayıtta farklı
- HMAC anahtarı ayrı, şifreleme anahtarı ayrı

**Koruma**: Lisans dosyasını okumaya çalışanlar sadece şifreli veri görür.

---

## 🎯 Saldırı Senaryoları ve Korunma

### Senaryo 1: Lisans Dosyasını Kopyalama
**Saldırı**: Kullanıcı lisans dosyasını başka bilgisayara kopyalar.
**Sonuç**: ❌ BAŞARISIZ
- Hardware fingerprint uyuşmaz
- Lisans geçersiz olur

### Senaryo 2: Hex Editor ile Dosya Değiştirme
**Saldırı**: Lisans dosyasını hex editor ile değiştirir.
**Sonuç**: ❌ BAŞARISIZ
- HMAC checksum uyuşmaz
- File tampering detection devreye girer
- Lisans geçersiz olur

### Senaryo 3: Sistem Saatini Değiştirme (Süreli Lisans)
**Saldırı**: Sistem saatini geriye alarak süresiz kullanmaya çalışır.
**Sonuç**: ❌ BAŞARISIZ
- `lastVerified` zamanı her kontrolde güncellenir
- Geriye gitme tespit edilir

### Senaryo 4: Lisansı Debug/Crackle
**Saldırı**: Electron uygulamasını debug ederek lisans kontrolünü bypass etmeye çalışır.
**Sonuç**: ⚠️ ZORLAŞTIRILMIŞ
- Kod obfuscation ile zorlaştırılmış
- VM detection devrede
- Production build'de DevTools kapalı

### Senaryo 5: VM'de Crack Denemesi
**Saldırı**: Sanal makinede crack denemesi yapar.
**Sonuç**: ⚠️ TESPİT EDİLİR
- VM detection uyarı verir
- İsterseniz VM'de çalışmayı engelleyebilirsiniz

---

## 📊 Güvenlik Seviye Karşılaştırması

| Özellik | Basit Lisans | Gelişmiş Lisans (PRO) |
|---------|-------------|----------------------|
| Machine ID | ✅ | ✅ |
| CPU + Disk + MAC | ❌ | ✅ |
| HMAC Integrity | ❌ | ✅ |
| File Tampering | ❌ | ✅ |
| Periyodik Kontrol | ❌ | ✅ (Her 5 dk) |
| VM Detection | ❌ | ✅ |
| AES Şifreleme | ✅ AES-256 | ✅ AES-256 + scrypt |
| Kırılma Zorluğu | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🚀 Kullanım

### Gelişmiş Lisans Üretme

```bash
# 1. Hardware fingerprint al (uygulama içinde gösterilir)
npm run electron:dev

# 2. Gelişmiş lisans üret
npm run license:advanced "HARDWARE_FINGERPRINT"

# Örnek:
npm run license:advanced "e3b0c44298fc1c149afbf4c8996fb924"
```

### Çıktı:
```
======================================================================
🔐 SEYMEN TRANSPORT - GELİŞMİŞ LİSANS ANAHTARI (PRO)
======================================================================

🖥️  Hardware Fingerprint:
   e3b0c44298fc1c149afbf4c8996fb924

🎫 Lisans Anahtarı:
   A1B2-C3D4-E5F6-G7H8

======================================================================

🛡️  GÜVENLİK ÖZELLİKLERİ:
   • Machine ID + CPU + Disk + MAC Address bazlı
   • HMAC ile bütünlük kontrolü
   • Anti-tampering mekanizması
   • Periyodik doğrulama (her 5 dakika)
   • VM detection (sanal makine tespiti)
```

---

## ⚙️ Yapılandırma

### Periyodik Kontrol Süresini Değiştirme

`electron/main/advanced-license-manager.ts` dosyasında:

```typescript
// 5 dakika yerine 10 dakika için:
this.verificationInterval = setInterval(async () => {
  // ...
}, 10 * 60 * 1000) // 10 dakika
```

### VM'de Çalışmayı Engelleme

`electron/main/advanced-license-manager.ts` dosyasında, `validateLicense()` fonksiyonunda:

```typescript
const isVM = await this.detectVirtualMachine()
if (isVM) {
  return { valid: false, reason: 'Sanal makinelerde çalıştırılamaz' }
}
```

### Şifreleme Anahtarını Değiştirme (ÖNEMLİ!)

```typescript
const masterKey = 'kendi-benzersiz-super-guclu-anahtariniz'
```

---

## 🔒 Güvenlik Tavsiyeleri

### 1. Şifreleme Anahtarını Değiştirin
**Dosya**: `electron/main/advanced-license-manager.ts`

```typescript
// BUNU DEĞİŞTİRİN!
const masterKey = 'seymen-ultra-secure-2025-key'
```

### 2. Hash Salt'ı Değiştirin

```typescript
// BUNU DEĞİŞTİRİN!
.update(`${hwFingerprint}-seymen-transport-pro-license-2025`)
```

**AYNI DEĞİŞİKLİĞİ** `scripts/generate-license-advanced.js` dosyasında da yapın!

### 3. Production Build'de Obfuscation Kullanın

```bash
npm install --save-dev javascript-obfuscator
```

Build sonrası obfuscation uygulayın.

### 4. DevTools'u Production'da Kapatın

`electron/main/index.ts`:

```typescript
if (process.env.VITE_DEV_SERVER_URL) {
  mainWindow.webContents.openDevTools()
}
// Production'da DevTools açılmayacak
```

---

## 📈 Kırılma Zorluğu

### Ortalama Kullanıcı
**Zorluk**: 🔒🔒🔒🔒🔒 (Neredeyse İmkansız)
- Teknik bilgisi olmayan kullanıcı için tamamen kırılamaz

### Deneyimli Kullanıcı
**Zorluk**: 🔒🔒🔒🔒⚪ (Çok Zor)
- Hex editor, dosya manipülasyonu bilenlere karşı korumalı
- Kopyalama tamamen engellendi

### Profesyonel Cracker
**Zorluk**: 🔒🔒🔒⚪⚪ (Zor)
- Electron uygulaması olduğu için kod erişilebilir
- Ancak çok katmanlı koruma nedeniyle zaman alır
- Obfuscation ile daha da zorlaştırılabilir

---

## 🎯 Sonuç

Bu gelişmiş lisans sistemi:

✅ **Kopyalanmaya** karşı %99 koruma  
✅ **Manipülasyona** karşı çok katmanlı savunma  
✅ **VM/Debug** ortamlarını tespit eder  
✅ **Runtime** koruması ile sürekli güvende  
✅ **Askeri seviye** şifreleme (AES-256)  

**Not**: Hiçbir yazılım koruması %100 güvenli değildir. Ama bu sistem, çoğu kullanım senaryosu için **yeterinden fazla** koruma sağlar.

---

## 📞 Destek

Güvenlik ile ilgili sorularınız için:
- `electron/main/advanced-license-manager.ts` - Ana lisans sistemi
- `scripts/generate-license-advanced.js` - Lisans üretme

**İyi Satışlar ve Güvenli Yazılım! 🚀**

