# 🚀 Windows ve macOS Installer Oluşturma

## 📦 Installer Build Süreci

### Gereksinimler

```bash
# Paketleri yükle
npm install

# electron-builder zaten package.json'da var
```

### Build Komutları

#### Windows İçin (.exe)

```bash
npm run build:win
```

**Çıktı:**
```
dist-electron/
├── win-unpacked/          # Unpacked dosyalar
└── [app-name]-setup.exe   # Windows installer
```

#### macOS İçin (.dmg)

```bash
npm run build:mac
```

**Çıktı:**
```
dist-electron/
├── mac/                   # App bundle
└── [app-name].dmg         # macOS installer
```

#### Her İkisi İçin

```bash
npm run build
```

---

## 🔧 package.json Konfigürasyonu

Mevcut konfigürasyonunuzu kontrol edin:

```json
{
  "name": "logistic-comp-order-tracking-system",
  "version": "1.0.0",
  "build": {
    "appId": "com.sekersoft.nakliye",
    "productName": "Nakliye Yönetim Sistemi",
    "directories": {
      "output": "dist-electron"
    },
    "win": {
      "target": ["nsis"],
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "build/icon.icns",
      "category": "public.app-category.business"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "build/icon.ico",
      "uninstallerIcon": "build/icon.ico",
      "installerHeaderIcon": "build/icon.ico",
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "package.json"
    ]
  }
}
```

---

## 🎨 İkon Dosyaları (Opsiyonel)

```
build/
├── icon.ico     # Windows için (256x256 veya büyük)
└── icon.icns    # macOS için
```

İkon yoksa electron-builder varsayılan ikon kullanır.

---

## 📋 Build Öncesi Checklist

- [ ] `package.json` versiyonu güncellendi
- [ ] Tüm bağımlılıklar yüklendi (`npm install`)
- [ ] Kod test edildi (`npm run dev`)
- [ ] Linter hataları yok
- [ ] CHANGELOG.md güncellendi (önerilir)

---

## 🚀 Dağıtım Süreci

### 1. Versiyon Artır

```bash
# Patch versiyon (1.0.0 -> 1.0.1)
npm version patch

# Minor versiyon (1.0.0 -> 1.1.0)
npm version minor

# Major versiyon (1.0.0 -> 2.0.0)
npm version major
```

### 2. Build

```bash
# Windows (Windows'ta çalıştır)
npm run build:win

# macOS (macOS'ta çalıştır)
npm run build:mac
```

### 3. Test

```bash
# Windows installer'ı çalıştır
dist-electron/[app-name]-setup.exe

# macOS .dmg'yi aç
open dist-electron/[app-name].dmg
```

### 4. Dağıt

**Seçenek A: Manuel Dağıtım**
- Installer dosyalarını müşterilere email ile gönderin
- Veya web sitesinden indirilebilir yapın

**Seçenek B: Otomatik Güncelleme (Electron Auto-Updater)**
- GitHub Releases kullanın
- Installer'ları Release'e yükleyin
- Uygulama otomatik güncelleme kontrolü yapar

---

## 🔄 Güncelleme Senaryoları

### Senaryo 1: Manuel Güncelleme

```
GELIŞTIRICI:
1. Kod değişikliği yap
2. npm version minor
3. npm run build:win
4. Installer'ı müşterilere gönder

MÜŞTERI:
1. Yeni installer'ı indir
2. Çalıştır
3. "Güncelle" seçeneğini seç
4. Veriler korunur
```

### Senaryo 2: Otomatik Güncelleme (Önerilen)

```
GELIŞTIRICI:
1. Kod değişikliği yap
2. npm version minor
3. npm run build
4. GitHub Release oluştur
5. Installer'ları yükle

MÜŞTERI:
1. Uygulama otomatik kontrol eder
2. "Güncelleme mevcut" bildirimi gelir
3. "İndir ve Kur" butonuna tıklar
4. Güncelleme otomatik kurulur
```

---

## 🛡️ Veri Güvenliği

### Korunan Veriler (Güncelleme Sırasında)

✅ **SQLite Veritabanı**
```
Windows: C:\Users\[USER]\AppData\Roaming\[APP_NAME]\transport.db
macOS: ~/Library/Application Support/[APP_NAME]/transport.db
```

✅ **Kullanıcı Ayarları**
- Mail ayarları
- Lisans bilgileri
- Sistem tercihleri

✅ **Upload Edilen Dosyalar**
```
Windows: C:\Users\[USER]\AppData\Roaming\[APP_NAME]\uploads\
macOS: ~/Library/Application Support/[APP_NAME]/uploads/
```

### Güncellenen Dosyalar

❌ **Uygulama Dosyaları**
- Electron binary
- React frontend
- Node.js backend

---

## 🔐 Kod İmzalama (Code Signing)

### Windows (Opsiyonel ama Önerilen)

```bash
# Sertifika al (örn. DigiCert, Sectigo)
# package.json'a ekle:
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "password",
      "signingHashAlgorithms": ["sha256"]
    }
  }
}
```

**Avantajları:**
- Windows SmartScreen uyarısı göstermez
- Kullanıcılar güvende hisseder
- Profesyonel görünüm

### macOS (Zorunlu)

```bash
# Apple Developer hesabı gerekli ($99/yıl)
# Developer ID Application sertifikası al

{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Company Name (TEAMID)"
    }
  }
}
```

**Notarization:**
macOS Catalina ve sonrası için notarization gerekli:

```bash
# Otomatik notarization
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist"
    },
    "afterSign": "scripts/notarize.js"
  }
}
```

---

## 🌐 Multi-Platform Build

### Cross-Platform Build (Sınırlı)

Windows'ta macOS installer oluşturamazsınız ve tam tersi.

**Çözüm 1: CI/CD (Önerilen)**
- GitHub Actions kullanın
- Her platform için ayrı runner
- Otomatik build ve release

**Örnek GitHub Actions:**
```yaml
name: Build

on: [push]

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build:win
      
  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build:mac
```

**Çözüm 2: VM veya Fiziksel Makineler**
- Windows makinede Windows build
- Mac makinede macOS build

---

## 📊 Build Boyutları

**Tipik Boyutlar:**
- Windows installer (.exe): ~80-120 MB
- macOS disk image (.dmg): ~100-150 MB

**Boyut optimizasyonu:**
```json
{
  "build": {
    "compression": "maximum",
    "asar": true
  }
}
```

---

## 🐛 Sorun Giderme

### Hata: "electron-builder not found"

```bash
npm install --save-dev electron-builder
```

### Hata: "Cannot sign app on macOS"

```bash
# Code signing devre dışı bırak (sadece test için)
{
  "build": {
    "mac": {
      "identity": null
    }
  }
}
```

### Hata: "Dependencies not found"

```bash
# Tüm bağımlılıkları yeniden yükle
rm -rf node_modules
npm install
```

### Build çok uzun sürüyor

```bash
# node_modules'ü temizle
npm run clean  # eğer varsa

# Cache'i temizle
rm -rf dist dist-electron
```

---

## 📦 Dağıtım Seçenekleri

### 1. Email ile Gönderme

```
장점:
- Basit
- Hızlı
- Kontrollü

Dezavantajlar:
- Dosya boyutu sınırı
- Her müşteriye manuel gönderim
```

### 2. Web Sitesinden İndirme

```
Avantajlar:
- Merkezi dağıtım
- Kolay erişim
- İstatistik takibi

Gereksinimler:
- Web hosting
- İndirme linkleri
- Versiyon yönetimi
```

### 3. GitHub Releases

```
Avantajlar:
- Ücretsiz
- Otomatik güncelleme desteği
- Versiyon geçmişi

Kurulum:
1. GitHub repo oluştur
2. Release oluştur
3. Installer'ları yükle
4. electron-updater yapılandır
```

### 4. Microsoft Store / Mac App Store

```
Avantajlar:
- Resmi mağaza
- Güvenilirlik
- Otomatik güncellemeler

Dezavantajlar:
- Onay süreci
- Komisyon (%15-30)
- Ek gereksinimler
```

---

## 🎯 Önerilen Dağıtım Stratejisi

### Başlangıç (İlk 10 Müşteri)

```
1. Manuel installer gönderimi (email)
2. Telefon desteği ile kurulum
3. Geri bildirim toplama
4. Hata düzeltme
```

### Büyüme (10-50 Müşteri)

```
1. Web sitesinden indirme
2. Dokümantasyon hazırlama
3. Video kurulum rehberi
4. Otomatik güncelleme sistemi (electron-updater)
```

### Ölçeklendirme (50+ Müşteri)

```
1. GitHub Releases + Auto-updater
2. Detaylı dokümantasyon
3. Destek sistemi
4. Beta test programı
5. Kod imzalama (Windows + macOS)
```

---

## 📞 Destek

Build sürecinde sorun yaşarsanız:

1. **Logları kontrol edin:**
   ```bash
   npm run build:win -- --verbose
   ```

2. **Electron Builder dokümantasyonu:**
   https://www.electron.build/

3. **Community yardımı:**
   - Electron Discord
   - Stack Overflow

---

## ✅ Checklist - Üretime Geçmeden Önce

- [ ] package.json versiyonu doğru
- [ ] Build başarılı (Windows + macOS)
- [ ] Installer test edildi
- [ ] Uygulama çalışıyor
- [ ] Veritabanı oluşturuluyor
- [ ] Lisans sistemi çalışıyor
- [ ] Mail sistemi test edildi
- [ ] Export özellikleri çalışıyor
- [ ] Güncelleme mekanizması kararlaştırıldı
- [ ] Dokümantasyon hazır (kullanıcı için)
- [ ] Destek planı oluşturuldu
- [ ] Backup stratejisi belirtildi

---

## 🎉 Tebrikler!

Artık uygulamanızı dağıtmaya hazırsınız!

**Son Adımlar:**
1. İlk 5 müşteriye beta testi yaptırın
2. Geri bildirimleri toplayın
3. Gerekirse düzeltmeler yapın
4. Resmi lansmanı yapın

**Başarılar! 🚀**

