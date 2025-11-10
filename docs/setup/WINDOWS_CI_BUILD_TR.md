# Windows CI Build Kurulumu (Türkçe)

Bu doküman, Sekersoft Taşımacılık Yönetim Sistemi için Windows installer'larının (.exe) GitHub Actions kullanarak otomatik olarak nasıl oluşturulacağını açıklar.

## 📋 Genel Bakış

Proje artık hem **Windows** hem de **macOS** için otomatik build desteğine sahip:

- 🪟 **Windows**: `.exe` installer (NSIS formatında)
- 🍎 **macOS**: `.dmg` installer (Intel + Apple Silicon)

## 🚀 Workflow Dosyaları

### 1. build-windows.yml
**Amaç:** Sadece Windows build'i yapar  
**Tetikleyici:** Push to main/develop, PR, manuel  
**Çıktı:** `Sekersoft-Setup-1.0.0.exe`

### 2. build-macos.yml  
**Amaç:** Sadece macOS build'i yapar  
**Tetikleyici:** Push to main/develop, PR, manuel  
**Çıktı:** Intel ve Apple Silicon DMG'ler

### 3. build-all-platforms.yml
**Amaç:** Her iki platformu da aynı anda build eder  
**Tetikleyici:** Push to main/develop, PR, manuel  
**Çıktı:** Hem Windows hem macOS dosyaları tek artifact'ta

## 🎯 Windows Build Özellikleri

### Teknik Detaylar

- **Runner:** windows-latest (Windows Server 2022)
- **Node.js:** 20.x
- **Mimari:** x64 (64-bit)
- **Format:** NSIS installer
- **Build Süresi:** ~3-7 dakika
- **Çıktı Boyutu:** ~100-120 MB

### Oluşturulan Dosyalar

```
release/
  └── Sekersoft-Setup-1.0.0.exe    # Windows installer
```

### Installer Özellikleri

✅ **NSIS Installer** (Nullsoft Scriptable Install System)  
✅ **Kullanıcı seçimli kurulum yeri**  
✅ **Masaüstü kısayolu oluşturma**  
✅ **Başlat menüsü kısayolu**  
✅ **Program Ekle/Kaldır desteği**  
✅ **Sessiz kurulum desteği** (`/S` parametresi)  

## 📊 Workflow Karşılaştırması

| Özellik | build-windows.yml | build-macos.yml | build-all-platforms.yml |
|---------|------------------|-----------------|------------------------|
| Platform | 🪟 Windows | 🍎 macOS | 🪟🍎 Her İkisi |
| Runner | windows-latest | macos-latest | Both |
| Build Süresi | 3-7 dk | 5-10 dk | Paralel: ~10 dk |
| Çıktı | .exe | .dmg (x2) | .exe + .dmg (x2) |
| Maliyet (dakika) | 3-7 | 50-100 | 53-107 |

## 🔧 Nasıl Çalışır?

### Otomatik Build (Her Push'ta)

```bash
# Kod değişikliği yap
git add .
git commit -m "Yeni özellik eklendi"
git push origin main
```

**Sonuç:**
1. ✅ Windows build başlar (windows-latest runner)
2. ✅ macOS build başlar (macos-latest runner)
3. ✅ Her ikisi paralel olarak çalışır
4. ✅ ~10 dakika sonra tüm dosyalar hazır
5. ✅ Artifacts'tan indirebilirsiniz

### Manuel Build (İstediğiniz Zaman)

1. GitHub'da: https://github.com/meertseker/logistic-comp-order-tracking-system/actions
2. Sol taraftan workflow seç:
   - "Build Windows App" (sadece Windows)
   - "Build macOS App" (sadece macOS)  
   - "Build All Platforms" (her ikisi)
3. "Run workflow" tıkla
4. Branch seç → "Run workflow" tıkla

## 📥 Dosyaları İndirme

### Windows Installer'ı İndirmek

1. **Actions** sekmesine git
2. Workflow run'ına tıkla (yeşil ✓)
3. Aşağı kaydır → **Artifacts** bölümü
4. İndir:
   - `windows-installer-latest` (en son)
   - `windows-installer-<sha>` (belirli commit)

### Tüm Platformları İndirmek

"Build All Platforms" workflow'u kullandıysanız:
- `all-platforms-latest` artifact'ını indirin
- İçinde hem Windows hem macOS dosyaları var

## 💻 Windows'ta Test Etme

### Installer'ı Çalıştırma

1. **İndirilen EXE'yi çalıştır**
2. Windows Defender uyarısı çıkabilir:
   - "Daha fazla bilgi" tıkla
   - "Yine de çalıştır" seç
3. Installer açılır:
   - Kurulum yerini seç
   - Masaüstü kısayolu ister misin?
   - "Kur" tıkla
4. Program kurulur ve çalıştırabilirsin!

### Sessiz Kurulum (Otomatik)

```cmd
Sekersoft-Setup-1.0.0.exe /S
```

Kullanıcı arayüzü olmadan otomatik kurar.

## ⚙️ package.json Ayarları

Windows build konfigürasyonu:

```json
{
  "build": {
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "artifactName": "${productName}-Setup-${version}.${ext}",
      "sign": null
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "perMachine": true,
      "license": "LICENSE"
    }
  }
}
```

### Ayar Açıklamaları

- `oneClick: false` → Kullanıcı kurulum ayarlarını seçebilir
- `allowToChangeInstallationDirectory` → Kurulum yeri değiştirilebilir
- `createDesktopShortcut` → Masaüstü kısayolu oluştur
- `createStartMenuShortcut` → Başlat menüsüne ekle
- `perMachine: true` → Tüm kullanıcılar için kur
- `sign: null` → İmzalama devre dışı (şimdilik)

## 🔐 Kod İmzalama (Code Signing)

### Şu Anki Durum: ❌ Devre Dışı

Installer **imzalı değil**, bu yüzden:
- Windows Defender uyarısı gösterir
- SmartScreen uyarısı çıkabilir
- Kullanıcılar "Yine de çalıştır" demeli

### Üretim İçin: Kod İmzalama Kurulumu

**Gereksinimler:**
1. Windows Code Signing Certificate satın al
   - Sectigo, DigiCert, GlobalSign gibi firmalardan
   - Yıllık maliyet: ~$100-400
2. Certificate'i .pfx formatında al
3. GitHub Secrets'a ekle:
   ```
   WIN_CSC_LINK (base64 encoded .pfx)
   WIN_CSC_KEY_PASSWORD (certificate password)
   ```
4. Workflow'da aktifleştir:
   ```yaml
   env:
     CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
     CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
   ```

## 💰 GitHub Actions Maliyeti

### Free Tier Limitleri
- **Windows:** 2,000 dakika/ay (private repo)
- **macOS:** 2,000 dakika/ay (10x çarpan = 200 gerçek dakika)
- **Public repo:** Sınırsız (her platform)

### Tipik Kullanım
| Workflow | Süre | Ücretli Dakika | Ayda Kaç Build? |
|----------|------|----------------|-----------------|
| Windows only | 3-7 dk | 3-7 dk | ~285-666 build |
| macOS only | 5-10 dk | 50-100 dk | ~20-40 build |
| All platforms | 10 dk | 53-107 dk | ~19-38 build |

### Maliyet Tasarrufu İpuçları

✅ **Lokal test yap** - Push'tan önce `npm run build:win-installer`  
✅ **Manuel trigger kullan** - Her push'ta otomatik çalışmasın  
✅ **Branch stratejisi** - Sadece main/develop için otomatik  
✅ **Public repo yap** - Sınırsız dakika!  

## 🚧 Sorun Giderme

### Build Başarısız: "electron-builder not found"

**Çözüm:** Zaten `npx` kullanıyoruz, olmamalı

### Build Başarısız: "better-sqlite3 hatası"

**Çözüm:** `npm run rebuild` adımı var, native dependency'leri derliyor

### EXE Oluşmadı

**Kontrol:**
1. "Build Electron" adımı başarılı mı?
2. `dist/` ve `dist-electron/` oluştu mu?
3. electron-builder loglarını incele

### Windows Defender Uyarısı

**Normal!** İmzasız uygulama olduğu için uyarı veriyor.

**Kullanıcılara söyle:**
1. "Daha fazla bilgi" tıkla
2. "Yine de çalıştır" seç

## 📝 Yerel Windows Build (Geliştirme)

Windows bilgisayarında test etmek için:

```bash
# Bağımlılıkları kur
npm install

# Native modülleri derle
npm run rebuild

# Build yap
npm run build

# Windows installer oluştur
npm run build:win-installer

# Çıktı: release/Sekersoft-Setup-1.0.0.exe
```

## 🎯 Hangi Workflow'u Kullanmalı?

### build-windows.yml 🪟
**Ne zaman:** 
- Sadece Windows değişiklikleri yaptın
- macOS build'e ihtiyacın yok
- Hızlı test istiyorsun (3-7 dk)

### build-macos.yml 🍎
**Ne zaman:**
- Sadece macOS değişiklikleri yaptın
- Windows build'e ihtiyacın yok
- Mac kullanıcıları için hızlı update

### build-all-platforms.yml 🪟🍎
**Ne zaman:**
- Her iki platform için de değişiklik yaptın
- Release hazırlıyorsun
- Tüm platformları test etmek istiyorsun
- Dakika limitin yeterli

## 🔄 Workflow Durumu İzleme

### Build Durumu Badges

README'ye ekle:

```markdown
[![Build Windows](https://github.com/meertseker/logistic-comp-order-tracking-system/actions/workflows/build-windows.yml/badge.svg)](https://github.com/meertseker/logistic-comp-order-tracking-system/actions/workflows/build-windows.yml)

[![Build All Platforms](https://github.com/meertseker/logistic-comp-order-tracking-system/actions/workflows/build-all-platforms.yml/badge.svg)](https://github.com/meertseker/logistic-comp-order-tracking-system/actions/workflows/build-all-platforms.yml)
```

### Canlı İzleme

```bash
# Tarayıcıda aç
start https://github.com/meertseker/logistic-comp-order-tracking-system/actions
```

## ✅ Kontrol Listesi

### İlk Kurulum
- [x] ✅ Workflow dosyaları oluşturuldu
- [x] ✅ package.json yapılandırıldı
- [ ] Değişiklikleri commit et
- [ ] GitHub'a push et
- [ ] İlk build'i test et
- [ ] Windows'ta installer'ı test et

### Her Release İçin
- [ ] Versiyon numarasını güncelle (package.json)
- [ ] Build'leri test et
- [ ] Her iki platformda da installer'ı test et
- [ ] Release oluştur (git tag)

## 🎉 Özet

Artık projenizde:

✅ **Otomatik Windows build'i** - Her push'ta  
✅ **Otomatik macOS build'i** - Her push'ta  
✅ **Kombine build** - Tek seferde her ikisi  
✅ **Artifact storage** - 30-90 gün saklama  
✅ **Manuel trigger** - İstediğin zaman çalıştır  
✅ **Paralel build** - Zaman tasarrufu  

## 🚀 Başlayalım!

```bash
# Tüm değişiklikleri commit et
git add .
git commit -m "feat: Windows CI/CD eklendi"
git push origin main

# Actions'ta build'i izle
start https://github.com/meertseker/logistic-comp-order-tracking-system/actions
```

**İyi buildler! 🎊**

