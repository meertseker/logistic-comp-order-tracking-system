# Eski Mac Desteği (2015-2017 Modeller)

## 🖥️ Sorun: "Bu Bilgisayar Desteklemiyor" Hatası

2015-2017 arası Mac'lerde eski macOS versiyonları için özel build gerekir.

## 📋 macOS ve Electron Uyumluluğu

| Electron | Minimum macOS | Desteklenen Mac Modelleri |
|----------|---------------|---------------------------|
| **28.x** (varsayılan) | 10.15 Catalina | 2015 ve sonrası |
| **25.x** | 10.14 Mojave | 2014 ve sonrası |
| **22.x** | 10.13 High Sierra | 2013 ve sonrası |
| **19.x** | 10.11 El Capitan | 2012 ve sonrası |

## 🔍 Mac Modelinizi ve macOS Versiyonunuzu Öğrenin

### Terminal'de:
```bash
# macOS versiyonu
sw_vers

# Mac modeli ve yılı
system_profiler SPHardwareDataType | grep "Model"
```

### Sonuç örneği:
```
ProductName: macOS
ProductVersion: 10.14.6    ← Bu önemli!
BuildVersion: 18G9323

Model Name: MacBook Pro
Model Identifier: MacBookPro13,1    ← "13" = 2016 model
```

## 🚀 Çözümler

### Çözüm 1: macOS'u Güncelleyin (Önerilen)

2016 Mac'iniz **macOS 12 Monterey**'e kadar güncellenebilir:

1. **Apple menü** () → **Sistem Tercihleri**
2. **Yazılım Güncellemesi**
3. En son versiyonu yükleyin (Monterey 12.7.6)
4. Normal DMG dosyasını kullanın

**Avantajlar:**
- ✅ En son özellikler
- ✅ Güvenlik güncellemeleri
- ✅ Daha iyi performans

### Çözüm 2: Eski Electron ile Build (Legacy)

macOS'u güncelleyemiyorsanız, eski Electron versiyonuyla build oluşturabiliriz.

#### GitHub Actions ile Legacy Build

1. **GitHub'da Actions'a gidin:**
   https://github.com/meertseker/logistic-comp-order-tracking-system/actions

2. **Sol menüden seçin:**
   "Build macOS App (Legacy - 10.13+)"

3. **"Run workflow" tıklayın**

4. **Electron versiyonu seçin:**
   - macOS 10.13 High Sierra: `22.0.0`
   - macOS 10.14 Mojave: `25.0.0`
   - macOS 10.15 Catalina: `28.0.0` (varsayılan)

5. **"Run workflow" tekrar tıklayın**

6. ~10 dakika bekleyin

7. **Artifact'ı indirin:**
   - `macos-dmg-legacy-22.0.0` (veya seçtiğiniz versiyon)

#### Yerel Build (Kendi Bilgisayarınızda)

```bash
# 1. Electron versiyonunu değiştir
npm install --save-dev electron@22.0.0

# 2. Native modülleri yeniden derle
npm run rebuild

# 3. Build yap
npm run build

# 4. DMG oluştur
npm run build:mac

# Çıktı: release/Sekersoft-1.0.0-x64.dmg
```

## 🔐 Güvenlik Uyarısı Çözümü

Legacy build'de de "developer doğrulanamadı" hatası alacaksınız:

### Terminal Çözümü (En Hızlı):
```bash
sudo xattr -cr /Applications/Sekersoft.app
```

### Manuel Çözüm:
1. **Sistem Tercihleri** → **Güvenlik ve Gizlilik**
2. Alt kısımda "Sekersoft açılmasına izin verilmedi"
3. 🔒 Kilidi aç
4. **"Yine de Aç"** tıkla

## 📊 Mac Model - macOS Uyumluluk Tablosu

### 2016 Modeller:

| Mac Modeli | Model ID | Maksimum macOS | Önerilen Electron |
|------------|----------|----------------|-------------------|
| MacBook (2016) | MacBook9,1 | 12 Monterey | 28.x (varsayılan) |
| MacBook Pro 13" (2016) | MacBookPro13,1 | 12 Monterey | 28.x (varsayılan) |
| MacBook Pro 13" Touch (2016) | MacBookPro13,2 | 12 Monterey | 28.x (varsayılan) |
| MacBook Pro 15" (2016) | MacBookPro13,3 | 12 Monterey | 28.x (varsayılan) |
| iMac (2016) | iMac17,1 | 12 Monterey | 28.x (varsayılan) |

### 2015 Modeller:

| Mac Modeli | Model ID | Maksimum macOS | Önerilen Electron |
|------------|----------|----------------|-------------------|
| MacBook (2015) | MacBook8,1 | 12 Monterey | 28.x (varsayılan) |
| MacBook Pro 13" (2015) | MacBookPro12,1 | 11 Big Sur | 25.x |
| MacBook Pro 15" (2015) | MacBookPro11,4 | 11 Big Sur | 25.x |
| MacBook Air 13" (2015) | MacBookAir7,2 | 12 Monterey | 28.x (varsayılan) |
| iMac (2015) | iMac16,x | 12 Monterey | 28.x (varsayılan) |

### 2014 ve Öncesi:

| Mac Modeli | Maksimum macOS | Önerilen Electron |
|------------|----------------|-------------------|
| 2014 modeller | 10.15 Catalina | 22.x |
| 2013 modeller | 10.15 Catalina | 22.x |
| 2012 ve öncesi | 10.15 veya öncesi | 19.x veya daha eski |

## ⚙️ Electron Versiyonu Kalıcı Olarak Değiştirme

Takımınız eski Mac'ler kullanıyorsa, projeyi kalıcı olarak legacy desteğe çevirebiliriz:

### package.json'u Güncelle:

```json
{
  "devDependencies": {
    "electron": "^22.0.0"  // 28.0.0 yerine
  }
}
```

### Yeniden kur:
```bash
npm install
npm run rebuild
```

### CI/CD Workflow'ları Güncelle:

`.github/workflows/build-macos.yml` dosyasına ekle:

```yaml
- name: Use Legacy Electron
  run: npm install --save-dev electron@22.0.0
```

## 🧪 Test Senaryoları

### macOS 10.13 High Sierra'da Test:

```bash
# 1. Sistem versiyonunu doğrula
sw_vers
# ProductVersion: 10.13.6 olmalı

# 2. Uygulamayı kur
# Sekersoft-1.0.0-x64-legacy.dmg

# 3. Güvenlik uyarısını aş
sudo xattr -cr /Applications/Sekersoft.app

# 4. Uygulamayı başlat
open /Applications/Sekersoft.app

# 5. Test et
# - Sipariş oluştur
# - Veritabanı kontrolü
# - Arayüz testi
```

## 🐛 Sorun Giderme

### "Bu bilgisayar desteklemiyor" Hatası

**1. Lisans Sistemi Kontrolü:**

Lisans sistemi donanım parmak izi oluşturuyor. Eğer hata lisans sisteminden geliyorsa:

```bash
# Uygulama verilerini temizle
rm -rf ~/Library/Application\ Support/sekersoft/

# Uygulamayı tekrar aç ve yeni lisans gir
```

**2. macOS Versiyonu Kontrolü:**

```bash
sw_vers

# Eğer 10.13'ten eski ise:
# Electron 19.x veya daha eski gerekir
```

**3. better-sqlite3 Hatası:**

Native modül sorunu olabilir:

```bash
# Lokal build yapıyorsanız
npm run rebuild

# Veya manuel:
./node_modules/.bin/electron-rebuild -f -w better-sqlite3
```

### "Developer Doğrulanamadı" Hatası

Bu **normal**dir. Çözüm:

```bash
# En hızlı çözüm
sudo xattr -cr /Applications/Sekersoft.app
```

### Uygulama Açılmıyor (Hiçbir Hata Yok)

Console loglarına bakın:

```bash
# Console.app'i aç
/Applications/Utilities/Console.app

# Filtre: "Sekersoft"
# Hata mesajlarını incele
```

## 📝 Özet ve Tavsiyeler

### Önerilen Çözüm (Öncelik Sırasına Göre):

1. **✅ macOS'u Güncelleyin** (En İyi)
   - 2016 Mac → Monterey 12.7.6'ya güncellenebilir
   - Normal build'i kullanabilirsiniz
   - En son özelliklere erişim

2. **⚙️ Legacy Build Kullanın** (İyi)
   - macOS güncellenemiyorsa
   - GitHub Actions ile otomatik oluşturulabilir
   - Eski Electron versiyonu kullanır

3. **🔧 Yerel Legacy Build** (Son Çare)
   - Internet bağlantısı kısıtlıysa
   - Kendi bilgisayarınızda build edin
   - Manuel süreç gerektirir

### Güvenlik Uyarısı Her Durumda Çıkar

- ✅ Normal bir davranıştır
- ✅ Kod imzalama olmadığı için
- ✅ `sudo xattr -cr` ile çözülür
- ✅ Üretim için kod imzalama yapılmalı

## 🆘 Hala Sorun mu Var?

1. **macOS versiyonunuzu paylaşın:**
   ```bash
   sw_vers
   ```

2. **Mac modelinizi paylaşın:**
   ```bash
   system_profiler SPHardwareDataType | grep "Model"
   ```

3. **Tam hata mesajını paylaşın:**
   - Ekran görüntüsü
   - Console.app logları

4. **Hangi DMG'yi kullandınız:**
   - Normal build?
   - Legacy build?
   - Hangi Electron versiyonu?

Bu bilgilerle size özel çözüm üretebiliriz!

---

**Not:** 2016 Mac'iniz Monterey'e güncellenebilir. Bu en iyi ve en basit çözümdür. ✅



