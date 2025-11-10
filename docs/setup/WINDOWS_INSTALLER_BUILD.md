# Windows Installer Oluşturma Rehberi

Bu rehber, Sekersoft uygulaması için Windows installer (setup.exe) oluşturma adımlarını içerir.

## 📋 İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [Hızlı Başlangıç](#hızlı-başlangıç)
3. [Build Seçenekleri](#build-seçenekleri)
4. [Detaylı Adımlar](#detaylı-adımlar)
5. [Çıktı Dosyaları](#çıktı-dosyaları)
6. [Özelleştirme](#özelleştirme)
7. [Sorun Giderme](#sorun-giderme)

---

## 🔧 Gereksinimler

### Zorunlu
- **Node.js** v18 veya üzeri
- **npm** v8 veya üzeri
- **Windows** işletim sistemi (Windows 10/11)
- **İnternet bağlantısı** (ilk build için dependencies)

### İsteğe Bağlı
- **Visual Studio Build Tools** (better-sqlite3 için)
- Özel icon dosyası (yoksa varsayılan Electron icon kullanılır)

---

## ⚡ Hızlı Başlangıç

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Installer Oluştur
```bash
npm run build:win-installer
```

Bu komut:
- ✅ React uygulamasını derler (`npm run build:renderer`)
- ✅ Electron main process'i derler (`npm run build:electron`)
- ✅ Windows NSIS installer oluşturur
- ✅ Yaklaşık 3-5 dakika sürer

### 3. Installer'ı Bul
Oluşturulan installer:
```
📁 release/
   └── Sekersoft-Setup-1.0.0.exe
```

---

## 🎯 Build Seçenekleri

### Tüm Windows Formatları (Installer + Portable)
```bash
npm run build:win
```
**Çıktı:**
- `Sekersoft-Setup-1.0.0.exe` (NSIS Installer)
- `Sekersoft 1.0.0.exe` (Portable)

### Sadece NSIS Installer
```bash
npm run build:win-installer
```
**Çıktı:**
- `Sekersoft-Setup-1.0.0.exe`

### Sadece Portable Sürüm
```bash
npm run build:win-portable
```
**Çıktı:**
- `Sekersoft 1.0.0.exe` (Kurulum gerektirmez)

### Geliştirme Modu
```bash
npm run electron:dev
```
Canlı yenileme ile geliştirme yapar (installer oluşturmaz).

---

## 📝 Detaylı Adımlar

### Adım 1: Proje Hazırlığı

#### 1.1 Bağımlılıkları Kontrol Et
```bash
npm install
```

#### 1.2 Native Modülleri Rebuild Et (Gerekirse)
```bash
npm run rebuild
```
Better-sqlite3 gibi native modüller için gerekli olabilir.

### Adım 2: Build İşlemi

#### 2.1 Manuel Build (Adım Adım)
```bash
# 1. React frontend'i derle
npm run build:renderer

# 2. Electron backend'i derle
npm run build:electron

# 3. Installer oluştur
npx electron-builder --win nsis --x64
```

#### 2.2 Otomatik Build (Önerilen)
```bash
npm run build:win-installer
```

### Adım 3: Çıktıyı Kontrol Et

Build başarılı olursa:
```
✔ Building NSIS installer                  
  • electron-builder  version=24.9.0
  • loaded configuration  file=package.json
  • building  target=nsis arch=x64
  • writing installer  file=release\Sekersoft-Setup-1.0.0.exe
```

---

## 📦 Çıktı Dosyaları

### release/ Klasör Yapısı
```
release/
├── Sekersoft-Setup-1.0.0.exe      # NSIS Installer (Önerilen)
├── Sekersoft 1.0.0.exe            # Portable sürüm
├── win-unpacked/                          # Geliştirme için unpack edilmiş
└── builder-debug.yml                      # Debug bilgileri
```

### Dosya Boyutları (Yaklaşık)
- **NSIS Installer**: ~100-150 MB
- **Portable**: ~120-180 MB
- **win-unpacked**: ~200-250 MB (klasör)

### Installer Özellikleri

#### NSIS Installer (`Sekersoft-Setup-1.0.0.exe`)
✅ **Özellikler:**
- Kurulum dizini seçimi
- Desktop kısayolu oluşturma
- Start Menu kısayolu
- Program Files'a kurulum
- Kontrol Paneli'nden kaldırma
- Otomatik güncelleme desteği (ileride)

#### Portable Sürüm
✅ **Özellikler:**
- Kurulum gerektirmez
- USB bellekte çalıştırılabilir
- Kayıt defterine yazmaz
- Sistem değişikliği yapmaz

---

## 🎨 Özelleştirme

### Icon Ekleme (İsteğe Bağlı)

#### 1. Icon Hazırla
- **Format**: ICO
- **Boyut**: 256x256 piksel (veya daha büyük)
- **Renk Derinliği**: 32-bit (şeffaflık destekli)

#### 2. Icon Oluşturma Araçları
- **Online**: [icoconverter.com](https://icoconverter.com/)
- **Masaüstü**: Paint.NET, GIMP, Photoshop

#### 3. Icon'u Ekle
```
build/
└── icon.ico        # Buraya kopyala
```

#### 4. package.json'a Ekle
```json
"win": {
  "icon": "build/icon.ico"
},
"nsis": {
  "installerIcon": "build/icon.ico",
  "uninstallerIcon": "build/icon.ico"
}
```

### Installer Görselleri (İsteğe Bağlı)

#### Header Image (Üst Banner)
```
build/installerHeader.bmp
- Boyut: 150x57 piksel
- Format: BMP
```

#### Sidebar Image (Yan Panel)
```
build/installerSidebar.bmp
- Boyut: 164x314 piksel
- Format: BMP
```

**Not:** Bu dosyalar yoksa varsayılan görüntüler kullanılır.

### Versiyon Güncelleme

#### package.json
```json
{
  "version": "1.0.1"  // Yeni versiyon
}
```

Build sonrası otomatik olarak:
- `Sekersoft-Setup-1.0.1.exe` oluşur

---

## 🛠️ Sorun Giderme

### Build Hataları

#### ❌ "Cannot find module 'better-sqlite3'"
**Çözüm:**
```bash
npm run rebuild
```

#### ❌ "Python not found"
**Çözüm:**
1. Python 3.x yükle: https://www.python.org/downloads/
2. Visual Studio Build Tools yükle: https://visualstudio.microsoft.com/downloads/

#### ❌ "MSBuild.exe is not found"
**Çözüm:**
Visual Studio Build Tools yükle:
```bash
npm install --global windows-build-tools
```

#### ❌ Icon Dosyası Bulunamadı
**Çözüm:**
package.json'dan icon satırlarını kaldır veya:
```bash
# build klasörüne icon.ico ekle
# Veya varsayılan icon kullan (hata olmayacak)
```

### Build Süreci Çok Yavaş

#### 1. Antivirus'ü Geçici Devre Dışı Bırak
Windows Defender bazen build sürecini yavaşlatır.

#### 2. Node Modüllerini Önbelleğe Al
```bash
npm ci --cache .npm-cache
```

#### 3. SSD Kullan
HDD yerine SSD kullanmak build süresini %50+ azaltır.

### Installer Çalışmıyor

#### Kurulum Hatası
1. **Admin olarak çalıştır** (sağ tık → "Run as administrator")
2. Windows Defender/SmartScreen uyarılarını "More info" → "Run anyway"
3. Eski sürüm kuruluysa önce kaldır

#### Uygulama Açılmıyor
1. Veritabanı dosyalarını kontrol et
2. Loglara bak: `%APPDATA%/seymen-transport/logs`
3. Better-sqlite3 native modülü rebuild edilmiş mi?

---

## 📊 Build Süresi ve Performans

### Donanım Gereksinimleri

#### Minimum
- **CPU**: Intel i3 veya eşdeğeri
- **RAM**: 4 GB
- **Disk**: 5 GB boş alan
- **Süre**: ~5-8 dakika

#### Önerilen
- **CPU**: Intel i5/i7 veya eşdeğeri
- **RAM**: 8 GB+
- **Disk**: SSD, 10 GB+ boş alan
- **Süre**: ~2-4 dakika

### Build Aşamaları ve Süreleri

1. **Dependencies yükleme** (~2-3 dakika) - ilk sefer
2. **React build** (~30-60 saniye)
3. **Electron build** (~20-30 saniye)
4. **NSIS packaging** (~60-90 saniye)
5. **Toplam**: ~3-5 dakika (ilk build sonrası ~2-3 dakika)

---

## 🚀 Production Build Checklist

Build öncesi kontrol listesi:

### Kod Kalitesi
- [ ] `npm run lint` hatasız çalışıyor
- [ ] TypeScript hataları yok
- [ ] Tüm testler geçiyor (varsa)

### Versiyon ve Metadata
- [ ] `package.json` versiyonu güncellendi
- [ ] `LICENSE` dosyası mevcut
- [ ] `README.md` güncel

### Veritabanı
- [ ] Migration scriptleri çalışıyor
- [ ] Schema değişiklikleri uygulandı

### Güvenlik
- [ ] Lisans sistemi aktif
- [ ] API anahtarları environment variables'da
- [ ] Hassas bilgiler kod içinde yok

### Build
- [ ] `npm run build` başarılı
- [ ] Installer test edildi
- [ ] Temiz Windows'ta test edildi

### Dağıtım
- [ ] Installer dosya adı doğru
- [ ] Dosya boyutu makul (<200 MB)
- [ ] Setup.exe dijital imza (isteğe bağlı)

---

## 📚 Ek Kaynaklar

### Dokümantasyon
- [Electron Builder Docs](https://www.electron.build/)
- [NSIS Configuration](https://www.electron.build/configuration/nsis)
- [Code Signing](https://www.electron.build/code-signing)

### İlgili Dosyalar
- `package.json` - Build konfigürasyonu
- `electron.vite.config.ts` - Electron build ayarları
- `build/README.md` - Icon ve görsel rehberi
- `WINDOWS_SETUP.md` - Windows kurulum rehberi

---

## 💡 İpuçları

### 1. Build Cache'i Temizle
```bash
# node_modules ve cache'leri temizle
Remove-Item -Recurse -Force node_modules, dist, dist-electron, release
npm install
```

### 2. Debug Modu
```bash
# Detaylı log çıktısı
set DEBUG=electron-builder
npm run build:win-installer
```

### 3. Sadece Değişen Dosyaları Rebuild Et
```bash
# Electron-builder cache kullanır
# İkinci build daha hızlıdır
npm run build:win-installer
```

### 4. Paralel Build (Daha Hızlı)
package.json'da:
```json
"build": {
  "electronDownload": {
    "cache": "./.electron-cache"
  }
}
```

---

## 🎉 Başarıyla Tamamlandı!

Artık Windows installer'ınız hazır:

```
📦 release/Sekersoft-Setup-1.0.0.exe
```

**Sonraki Adımlar:**
1. Installer'ı test edin
2. Müşterilere dağıtın
3. Feedback toplayın
4. Güncellemeleri yayınlayın

**Sorularınız için:**
- GitHub Issues
- README.md dosyası
- QUICKSTART.md dosyası

---

**Son Güncelleme**: 4 Kasım 2025
**Versiyon**: 1.0.0

