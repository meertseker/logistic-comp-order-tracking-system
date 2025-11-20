# 🔄 Otomatik Güncelleme Sistemi

Sekersoft uygulaması, **electron-updater** kullanarak otomatik güncelleme desteğine sahiptir. Yeni bir sürüm yayınlandığında, uygulama kullanıcıları otomatik olarak bilgilendirir ve güncellemeyi kolayca yüklemelerini sağlar.

## 📋 Özellikler

- ✅ **Otomatik Kontrol**: Uygulama her açıldığında güncelleme kontrolü yapar
- ✅ **Manuel Kontrol**: Ayarlar sayfasından manuel güncelleme kontrolü
- ✅ **Progress Bar**: İndirme sürecini takip edin
- ✅ **Kullanıcı Onayı**: Otomatik indirme kapalı, kullanıcı onayı gerekli
- ✅ **Arka Plan Kurulumu**: Uygulama kapanırken otomatik kurulum
- ✅ **GitHub Releases Entegrasyonu**: Sürümler GitHub'da yönetilir
- ✅ **Cross-Platform**: Windows ve macOS desteği

## 🎯 Kullanıcı Deneyimi

### 1. Otomatik Bildirim
Uygulama açıldıktan 10 saniye sonra arka planda güncelleme kontrolü yapılır. Yeni versiyon bulunursa, ekranın sağ üst köşesinde bir bildirim gösterilir.

### 2. İndirme
Kullanıcı "Şimdi İndir" butonuna tıkladığında, güncelleme arka planda indirilir ve progress bar gösterilir.

### 3. Kurulum
İki seçenek sunulur:
- **Yükle ve Yeniden Başlat**: Hemen kurulum yapılır ve uygulama yeniden başlar
- **Kapanırken Yükle**: Kullanıcı uygulamayı kapattığında otomatik kurulum yapılır

## 🛠️ Teknik Detaylar

### Mimari

```
┌─────────────────────────────────────────────────────┐
│                  GitHub Release                      │
│  ├─ Sekersoft-Setup-1.0.1.exe (Windows)            │
│  ├─ Sekersoft-1.0.1-x64.dmg (macOS Intel)          │
│  ├─ Sekersoft-1.0.1-arm64.dmg (macOS Apple Silicon)│
│  ├─ latest.yml (Windows metadata)                   │
│  └─ latest-mac.yml (macOS metadata)                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              electron-updater                        │
│  ├─ Güncelleme Kontrolü                            │
│  ├─ Versiyon Karşılaştırma                         │
│  ├─ Dosya İndirme                                  │
│  └─ Kurulum Yönetimi                               │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│               UpdateManager (Main Process)           │
│  ├─ Event Handling                                  │
│  ├─ IPC Communication                               │
│  └─ Logging                                         │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│         UpdateNotification (Renderer Process)        │
│  ├─ UI/UX                                           │
│  ├─ User Interaction                                │
│  └─ Progress Display                                │
└─────────────────────────────────────────────────────┘
```

### Kullanılan Teknolojiler

- **electron-updater**: Otomatik güncelleme kütüphanesi
- **electron-builder**: Build ve publish aracı
- **GitHub Releases**: Güncelleme dosyalarının barındırılması
- **electron-log**: Güncelleme sürecini loglama

## 📦 Yeni Sürüm Yayınlama

### 1. Versiyon Güncelleme

```bash
# package.json'da version field'ı güncelle
npm version patch   # 1.0.0 → 1.0.1 (bug fix)
npm version minor   # 1.0.0 → 1.1.0 (yeni özellik)
npm version major   # 1.0.0 → 2.0.0 (breaking change)
```

### 2. Git Tag Oluşturma

```bash
# Commit ve tag
git add .
git commit -m "Release v1.0.1"
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

### 3. GitHub Actions
Tag push edildiğinde otomatik olarak:
1. ✅ Windows ve macOS için build yapılır
2. ✅ DMG ve EXE dosyaları oluşturulur
3. ✅ Metadata dosyaları (latest.yml, latest-mac.yml) oluşturulur
4. ✅ GitHub Release'e yüklenir
5. ✅ Release notes otomatik oluşturulur

### 4. Kullanıcıların Güncellemesi
- Kullanıcılar uygulamayı açtığında otomatik bildirim alır
- Tek tıkla güncelleme yapabilir
- Veriler korunur

## 🔒 Güvenlik

### Kod İmzalama (Production İçin Önerilen)

#### Windows
```json
// package.json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "process.env.WIN_CSC_KEY_PASSWORD",
  "signingHashAlgorithms": ["sha256"]
}
```

#### macOS
```json
// package.json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAMID)",
  "hardenedRuntime": true,
  "entitlements": "build/entitlements.mac.plist"
}
```

### GitHub Token
CI/CD'de kullanılan `GITHUB_TOKEN` otomatik olarak sağlanır ve release yetkileri vardır.

## 🧪 Test Etme

### Development'ta Test

```bash
# Düşük versiyon numarası ile build
npm version 0.9.0
npm run build:win  # veya build:mac

# GitHub'a test release yükle
git tag v0.9.0
git push origin v0.9.0

# Uygulamayı çalıştır ve güncellemeyi test et
```

### Staging Test

```bash
# Draft release kullan
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1

# Workflow'da draft: true olarak ayarla
```

## 📊 Güncelleme Stratejileri

### 1. Tam Güncelleme (Mevcut)
- Tüm uygulama dosyası indirilir
- Güvenilir ve basit
- Boyut: ~150-200 MB

### 2. Differential Updates (Gelecek)
- Sadece değişen dosyalar indirilir
- Daha hızlı ve az bant genişliği
- electron-updater differential update desteği

### 3. Update Kanalları (Gelecek)
- **Stable**: Stabil sürümler
- **Beta**: Test sürümleri
- **Alpha**: Geliştirme sürümleri

## 🐛 Troubleshooting

### Güncelleme Çalışmıyor
```javascript
// electron/main/updater.ts içinde loglara bakın
// Veya electron-log dosyasını kontrol edin:
// Windows: %USERPROFILE%\AppData\Roaming\sekersoft\logs\main.log
// macOS: ~/Library/Logs/sekersoft/main.log
```

### Development'ta Güncelleme Testi
```javascript
// updater.ts içinde NODE_ENV kontrolünü geçici olarak kapat
if (process.env.NODE_ENV === 'development') {
  // Comment this return for testing
  // return
}
```

### Manuel Güncelleme
Ayarlar > Sistem Bilgileri > "Güncellemeleri Kontrol Et" butonunu kullanın.

## 📝 Best Practices

1. ✅ **Semantic Versioning Kullanın**: v1.2.3 (major.minor.patch)
2. ✅ **Release Notes Yazın**: Kullanıcılar neyin değiştiğini görsün
3. ✅ **Beta Test Yapın**: Kritik güncellemeleri önce test edin
4. ✅ **Kod İmzalayın**: Production'da güvenlik için şart
5. ✅ **Rollback Planı**: Sorunlu güncellemeyi geri alabilme
6. ✅ **Changelog Tutun**: CHANGELOG.md dosyası
7. ✅ **Breaking Changes**: Major versiyonda yıkıcı değişiklikler

## 🎨 UI Customization

UpdateNotification component'i özelleştirilebilir:

```tsx
// src/components/UpdateNotification.tsx
// - Renk şeması
// - Animasyonlar
// - Konum
// - Mesajlar
```

## 📚 İlgili Dokümantasyon

- [electron-updater](https://www.electron.build/auto-update)
- [electron-builder](https://www.electron.build/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [Semantic Versioning](https://semver.org/)

## ✅ Checklist: İlk Güncelleme

- [ ] `package.json` version güncellendi
- [ ] Kod değişiklikleri commit edildi
- [ ] Git tag oluşturuldu (`v1.0.1`)
- [ ] Tag push edildi
- [ ] GitHub Actions workflow başarılı
- [ ] GitHub Release oluştu
- [ ] DMG/EXE dosyaları yüklendi
- [ ] `latest.yml` ve `latest-mac.yml` mevcut
- [ ] Eski versiyon uygulaması güncellemeyi gördü
- [ ] İndirme ve kurulum başarılı

---

**Not**: Bu sistem production-ready olup, kullanıcılarınıza kesintisiz güncelleme deneyimi sunar.

