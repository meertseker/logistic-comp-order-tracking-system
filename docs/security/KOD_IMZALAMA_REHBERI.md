# 🔐 Kod İmzalama Rehberi (Code Signing)

## Güvenlik Uyarılarını Kaldırma

Bu rehber, uygulamanızın güvenlik uyarısı vermeden açılmasını sağlar.

---

## 📋 Sorunlar ve Çözümleri

### Şu Anki Durum:

#### macOS'ta:
```
"Sekersoft" geliştirici doğrulanamadığından açılamıyor
```
❌ Kullanıcılar "Yine de Aç" demeli  
❌ Her yeni versiyonda tekrar uyarı

#### Windows'ta:
```
Windows Korumalı Bilgisayarınızı Korudu
SmartScreen tanınmayan bir uygulamayı engelledi
```
❌ Kullanıcılar "Daha fazla bilgi" → "Yine de çalıştır" demeli  
❌ Profesyonel görünüm kaybı

### Hedef Durum (Kod İmzalama Sonrası):

✅ **macOS:** Uyarı yok, doğrudan açılır  
✅ **Windows:** Uyarı yok, doğrudan kurulur  
✅ **Profesyonel:** Güvenilir yazılım görünümü  
✅ **Otomatik Güncellemeler:** Kod imzalı güncellemeler  

---

## 🍎 macOS Kod İmzalama

### Gereksinimler:

1. **Apple Developer Program üyeliği**
   - Maliyet: **$99/yıl**
   - Link: https://developer.apple.com/programs/

2. **Mac bilgisayar** (imza oluşturmak için)
   - Veya: GitHub Actions ile otomatik

3. **Xcode** (Mac'te kurulu olmalı)

### Adım 1: Apple Developer Hesabı

1. https://developer.apple.com/programs/ adresine git
2. **Enroll** tıkla
3. Apple ID ile giriş yap
4. Ödeme yap ($99/yıl)
5. 24-48 saat içinde onaylanır

### Adım 2: Certificate Oluşturma

#### Mac'te (Keychain Access):

1. **Keychain Access**'i aç
   - Applications → Utilities → Keychain Access

2. **Certificate Assistant**'ı aç
   - Menu: Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority

3. **Bilgileri gir:**
   - Email: Apple Developer hesap e-postanız
   - Common Name: Şirket adınız (Sekersoft)
   - Request: "Saved to disk" seç
   - ✅ "Let me specify key pair information" işaretle

4. **Kaydet:** 
   - Dosya adı: `CertificateSigningRequest.certSigningRequest`
   - Güvenli yere kaydedin

#### Apple Developer Portal'da:

1. https://developer.apple.com/account/ adresine git
2. **Certificates, Identifiers & Profiles** tıkla
3. **Certificates** → **+** (Create)
4. **Developer ID Application** seç (uygulama imzalama için)
5. **Continue** tıkla
6. CSR dosyasını yükle (yukarıda oluşturduğunuz)
7. **Continue** → **Download**
8. İndirilen `.cer` dosyasını çift tıkla (Keychain'e ekler)

#### Certificate'i Export Et:

1. **Keychain Access**'i aç
2. **My Certificates** kategorisinde "Developer ID Application" bul
3. Sağ tıkla → **Export**
4. Format: **Personal Information Exchange (.p12)**
5. Dosya adı: `developer_id_application.p12`
6. **Şifre belirle** (güçlü olmalı, kaydet!)
7. Kaydet

### Adım 3: GitHub Secrets'a Ekle

#### Certificate'i Base64'e Çevir:

**Mac/Linux:**
```bash
base64 -i developer_id_application.p12 -o certificate_base64.txt
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("developer_id_application.p12")) | Out-File certificate_base64.txt
```

#### GitHub'a Ekle:

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** tıkla

**Secret 1:**
- Name: `MAC_CSC_LINK`
- Value: `certificate_base64.txt` içeriğini kopyala yapıştır

**Secret 2:**
- Name: `MAC_CSC_KEY_PASSWORD`
- Value: P12 dosyası için belirlediğiniz şifre

**Secret 3:**
- Name: `APPLE_ID`
- Value: Apple Developer hesabı e-postanız

**Secret 4:**
- Name: `APPLE_APP_SPECIFIC_PASSWORD`
- Value: Uygulama özel şifresi (aşağıda oluşturacağız)

**Secret 5:**
- Name: `APPLE_TEAM_ID`
- Value: Team ID (Developer portal'da bulabilirsiniz)

#### Apple App-Specific Password Oluştur:

1. https://appleid.apple.com/ adresine git
2. Giriş yap
3. **Security** → **App-Specific Passwords**
4. **Generate an app-specific password** tıkla
5. İsim: "Sekersoft Notarization"
6. Oluşturulan şifreyi kopyala → GitHub Secret olarak ekle

### Adım 4: Workflow'u Güncelle

`.github/workflows/build-macos.yml` dosyasını düzenle:

```yaml
- name: Build macOS DMG
  run: npx electron-builder --mac dmg --x64 --arm64 --publish never
  env:
    # Kod imzalamayı aktifleştir
    CSC_LINK: ${{ secrets.MAC_CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.MAC_CSC_KEY_PASSWORD }}
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
    # Notarization aktif
    NOTARIZE: true
```

### Adım 5: package.json'u Güncelle

```json
{
  "build": {
    "mac": {
      "target": ["dmg"],
      "category": "public.app-category.business",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "notarize": {
        "teamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### Adım 6: Entitlements Dosyası Oluştur

`build/entitlements.mac.plist` dosyası oluştur:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

### Adım 7: Test Et

```bash
git add .
git commit -m "feat: macOS kod imzalama eklendi"
git push origin main
```

GitHub Actions'ta build sonrası:
- ✅ DMG imzalı olacak
- ✅ Notarization otomatik yapılacak
- ✅ Kullanıcılar uyarı almayacak!

---

## 🪟 Windows Kod İmzalama

### Gereksinimler:

1. **Code Signing Certificate**
   - Sectigo, DigiCert, GlobalSign gibi firmalardan
   - Maliyet: **$100-400/yıl**
   - EV (Extended Validation) önerilir

2. **Certificate formatı:** `.pfx` veya `.p12`

### Adım 1: Certificate Satın Al

#### Önerilen Firmalar:

| Firma | Fiyat/Yıl | Link |
|-------|-----------|------|
| **Sectigo (ÖNERİLEN)** | ~$100-150 | https://sectigo.com/ssl-certificates-tls/code-signing |
| **DigiCert** | ~$400-500 | https://www.digicert.com/signing/code-signing-certificates |
| **GlobalSign** | ~$200-300 | https://www.globalsign.com/en/code-signing-certificate |
| **Comodo** | ~$100-200 | https://comodosslstore.com/code-signing |

#### Sipariş Adımları:

1. Firma web sitesine git
2. **Code Signing Certificate** seç
3. **Standard** veya **EV** (Extended Validation) seç
   - EV daha güvenilir, SmartScreen'i daha hızlı geçer
4. Şirket bilgilerini gir (doğrulama gerekir)
5. Ödeme yap
6. **Doğrulama süreci** (1-5 gün):
   - Telefon doğrulaması
   - Şirket belgesi doğrulaması
   - E-posta doğrulaması

### Adım 2: Certificate'i İndir ve Hazırla

1. Certificate firma tarafından `.pfx` veya `.p12` formatında gönderilir
2. Güvenli bir yere kaydedin
3. Şifresini not edin

#### Base64'e Çevir:

**Windows (PowerShell):**
```powershell
$bytes = [System.IO.File]::ReadAllBytes("certificate.pfx")
$base64 = [System.Convert]::ToBase64String($bytes)
$base64 | Out-File certificate_base64.txt
```

**Mac/Linux:**
```bash
base64 -i certificate.pfx -o certificate_base64.txt
```

### Adım 3: GitHub Secrets'a Ekle

GitHub repo → **Settings** → **Secrets** → **New secret**

**Secret 1:**
- Name: `WIN_CSC_LINK`
- Value: `certificate_base64.txt` içeriği

**Secret 2:**
- Name: `WIN_CSC_KEY_PASSWORD`
- Value: Certificate şifresi

### Adım 4: Workflow'u Güncelle

`.github/workflows/build-windows.yml` dosyasını düzenle:

```yaml
- name: Build Windows Installer
  run: npx electron-builder --win nsis --x64 --publish never
  env:
    # Kod imzalamayı aktifleştir
    CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
```

### Adım 5: package.json'u Güncelle

```json
{
  "build": {
    "win": {
      "target": ["nsis"],
      "signingHashAlgorithms": ["sha256"],
      "sign": null,  // Bu satırı sil veya kaldır
      "certificateFile": null,  // Kullanma
      "certificatePassword": null  // Kullanma
    }
  }
}
```

### Adım 6: Test Et

```bash
git add .
git commit -m "feat: Windows kod imzalama eklendi"
git push origin main
```

Build sonrası:
- ✅ EXE imzalı olacak
- ✅ SmartScreen uyarısı azalacak
- ✅ Profesyonel görünüm

### SmartScreen Reputasyonu

**Önemli:** İlk kullanımlarda hala uyarı çıkabilir!

**Neden?** Microsoft SmartScreen **reputation-based** sistem kullanır:
- Yeni imzalı uygulamalar = düşük reputasyon
- Zamanla ve kullanıcı sayısı arttıkça = yüksek reputasyon

**Çözüm:**
1. **EV Certificate** kullanın (hemen reputasyon)
2. **Zamanla:** 1000+ kullanıcı → uyarı kaybolur
3. **Microsoft'a başvur:** SmartScreen reputation programı

---

## 💰 Maliyet Özeti

| Platform | Sertifika | Yıllık Maliyet | Toplam (İlk Yıl) |
|----------|-----------|----------------|------------------|
| **macOS** | Apple Developer | $99/yıl | $99 |
| **Windows** | Code Signing Cert | $100-400/yıl | $100-400 |
| **Her İkisi** | - | $199-499/yıl | $199-499 |

### Ek Maliyetler:
- 🔄 Yıllık yenileme: Aynı fiyat
- 🏢 EV Certificate (Windows): +$200-300
- 📱 iOS/App Store: Apple Developer içinde

---

## 🚀 Hızlı Başlangıç (Özet)

### macOS:
1. ✅ Apple Developer ($99/yıl)
2. ✅ Certificate oluştur (.p12)
3. ✅ GitHub Secrets ekle (5 adet)
4. ✅ Workflow güncelle
5. ✅ Entitlements ekle
6. ✅ Push ve test!

### Windows:
1. ✅ Certificate satın al ($100-400/yıl)
2. ✅ .pfx dosyasını al
3. ✅ GitHub Secrets ekle (2 adet)
4. ✅ Workflow güncelle
5. ✅ Push ve test!

---

## 🧪 Test ve Doğrulama

### macOS'ta İmza Kontrolü:

```bash
# DMG'yi mount et
hdiutil attach Sekersoft-1.0.0-x64.dmg

# İmzayı kontrol et
codesign -dvv /Volumes/Sekersoft/Sekersoft.app

# Notarization kontrolü
spctl -a -vv /Volumes/Sekersoft/Sekersoft.app

# Başarılı çıktı:
# accepted
# source=Notarized Developer ID
```

### Windows'ta İmza Kontrolü:

1. **EXE'ye sağ tıkla** → **Properties**
2. **Digital Signatures** sekmesine git
3. İmza detaylarını gör:
   - ✅ Signer: Şirket adınız
   - ✅ Timestamp: Var
   - ✅ Status: Valid

Veya PowerShell'de:
```powershell
Get-AuthenticodeSignature .\Sekersoft-Setup-1.0.0.exe

# Status: Valid olmalı
```

---

## 🐛 Sorun Giderme

### macOS: "Notarization failed"

**Sebep:** Entitlements veya hardened runtime sorunu

**Çözüm:**
```bash
# Build loglarını incele
npx electron-builder --mac --publish never --verbose

# Entitlements kontrolü
security cms -D -i /path/to/app.app/Contents/embedded.provisionprofile
```

### Windows: "Certificate not found"

**Sebep:** GitHub Secrets doğru değil

**Çözüm:**
1. Base64 conversion'ı tekrar yap
2. Şifrenin doğru olduğundan emin ol
3. Certificate'in expire olmadığını kontrol et:
   ```powershell
   Get-PfxCertificate -FilePath certificate.pfx
   # NotAfter tarihine bak
   ```

### macOS: "No identity found"

**Sebep:** Certificate Keychain'de yok

**Çözüm:**
```bash
# Keychain'deki certificate'leri listele
security find-identity -v -p codesigning

# CSC_LINK'i test et (CI'da)
echo $CSC_LINK | base64 -d > temp.p12
security import temp.p12 -P "$CSC_KEY_PASSWORD"
```

---

## 📚 Ek Kaynaklar

### Resmi Dokümantasyon:
- **electron-builder signing:** https://www.electron.build/code-signing
- **Apple notarization:** https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution
- **Windows signing:** https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools

### Yararlı Araçlar:
- **Notarization checker:** https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution/resolving_common_notarization_issues
- **SmartScreen checker:** https://www.microsoft.com/en-us/wdsi/filesubmission

---

## ✅ Sonuç

Kod imzalama sonrası:

✅ **macOS kullanıcıları:** Uyarı almadan açabilir  
✅ **Windows kullanıcıları:** Uyarı almadan kurabilir  
✅ **Profesyonel görünüm:** Güvenilir yazılım  
✅ **Otomatik güncellemeler:** Güvenli update'ler  
✅ **App Store hazır:** macOS App Store'a gönderilebilir  

**Maliyet:** $199-499/yıl (her iki platform)  
**Kurulum süresi:** 1-2 gün (doğrulama dahil)  
**Sonuç:** Sıfır güvenlik uyarısı! 🎉

---

## 🎯 Şimdi Ne Yapmalı?

### Hemen Başla (Önerilen):

1. **Apple Developer başvurusu yap** ($99)
2. **Windows Certificate siparişi ver** ($100-400)
3. Beklerken: CI/CD'yi test et (imzasız)
4. Certificate'ler gelince: Bu rehberi takip et
5. 1-2 gün içinde: Tam imzalı uygulamalar! ✅

### Alternatif (Gelecekte):

- Şimdilik imzasız kullan
- Kullanıcılara "Yine de Aç" yöntemini anlat
- Üretim'e geçmeden önce kod imzalama yap

**Üretim için kod imzalama şart!** Kullanıcı deneyimi ve güven için çok önemli. 🔒




