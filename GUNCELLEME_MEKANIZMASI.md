# 🔄 Güncelleme Mekanizması

## Windows ve macOS Installer Dağıtımı

Bu uygulama Mac ve Windows için installer olarak dağıtılır. Müşteriler programı kurup kullanmaya başladıktan sonra, güncelleme yapmanız gerektiğinde aşağıdaki stratejilerden birini kullanabilirsiniz.

---

## ✅ Önerilen Yöntem: Electron Auto-Updater

### 1. Electron Auto-Updater Nedir?

Electron'un yerleşik güncelleme sistemidir. Uygulama otomatik olarak yeni versiyonları kontrol eder ve kullanıcıya bildirim gönderir.

### 2. Kurulum

**Gerekli Paketler:**

```bash
npm install electron-updater --save
```

### 3. Kod Entegrasyonu

**electron/main/index.ts dosyasına eklenecek:**

```typescript
import { autoUpdater } from 'electron-updater'

// Auto-updater yapılandırması
autoUpdater.autoDownload = false // Manuel onay iste
autoUpdater.autoInstallOnAppQuit = true

// Güncelleme kontrolleri
app.whenReady().then(() => {
  // Uygulama başladıktan 5 saniye sonra güncelleme kontrolü
  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, 5000)
  
  // Her 4 saatte bir güncelleme kontrolü
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 4 * 60 * 60 * 1000)
})

// Güncelleme Event Handlers
autoUpdater.on('update-available', (info) => {
  // Kullanıcıya bildirim göster
  mainWindow?.webContents.send('update-available', info)
})

autoUpdater.on('update-downloaded', (info) => {
  // İndirme tamamlandı, kullanıcıya sor
  mainWindow?.webContents.send('update-downloaded', info)
})

autoUpdater.on('error', (error) => {
  console.error('Update error:', error)
})

// IPC Handlers (renderer'dan gelen istekler için)
ipcMain.handle('update:check', async () => {
  const result = await autoUpdater.checkForUpdates()
  return result
})

ipcMain.handle('update:download', async () => {
  autoUpdater.downloadUpdate()
})

ipcMain.handle('update:install', () => {
  autoUpdater.quitAndInstall()
})
```

### 4. Güncelleme Sunucusu

**Seçenek 1: GitHub Releases (ÜCRETSİZ)**

- GitHub'da repository oluşturun
- Yeni versiyon çıktığında GitHub Release oluşturun
- Installer dosyalarını (.exe, .dmg) Release'e yükleyin
- `package.json`'da repository URL'ini belirtin:

```json
{
  "name": "nakliye-sistemi",
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/KULLANICI_ADI/nakliye-sistemi.git"
  },
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "KULLANICI_ADI",
        "repo": "nakliye-sistemi"
      }
    ]
  }
}
```

**Seçenek 2: Kendi Sunucunuz**

- Kendi web sunucunuza installer dosyalarını yükleyin
- `update-server` kurarak basit bir güncelleme sunucusu oluşturun:

```bash
npm install -g electron-release-server
```

### 5. Build Ayarları

**package.json veya electron-builder.json:**

```json
{
  "build": {
    "appId": "com.sekersoft.nakliye",
    "productName": "Nakliye Yönetim Sistemi",
    "win": {
      "target": ["nsis"],
      "publish": ["github"]
    },
    "mac": {
      "target": ["dmg"],
      "publish": ["github"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

---

## 🔧 Alternatif Yöntem: Manuel Güncelleme

Eğer auto-updater kullanmak istemiyorsanız:

### 1. Kullanıcı Bildirimi

Ayarlar sayfasında "Yeni versiyon mevcut" bildirimi gösterin:

```typescript
// Sunucudan son versiyon bilgisini çek
const checkVersion = async () => {
  const response = await fetch('https://example.com/version.json')
  const data = await response.json()
  
  const currentVersion = app.getVersion()
  if (data.version > currentVersion) {
    // Yeni versiyon mevcut bildirimi göster
    showUpdateNotification(data.downloadUrl)
  }
}
```

### 2. İndirme Linki

Kullanıcıya indirme linki verin, manuel olarak indirip kurmasını isteyin.

---

## 📦 Versiyon Yükseltme Süreci

### 1. Geliştirme

```bash
# Kod değişiklikleri yap
git add .
git commit -m "Yeni özellikler eklendi"
```

### 2. Versiyon Artır

```bash
# Minor versiyon artır (1.0.0 -> 1.1.0)
npm version minor

# veya Patch versiyon artır (1.0.0 -> 1.0.1)
npm version patch

# veya Major versiyon artır (1.0.0 -> 2.0.0)
npm version major
```

### 3. Build

```bash
# Windows için
npm run build:win

# macOS için
npm run build:mac

# Her ikisi için
npm run build
```

### 4. GitHub Release (Otomatik Güncelleme için)

```bash
# GitHub'a push
git push origin main
git push --tags

# GitHub'da yeni Release oluştur
# dist/ klasöründeki .exe ve .dmg dosyalarını yükle
```

---

## 🛡️ Veri Güvenliği

### Kullanıcı Verileri Korunur

- Güncelleme yapılırken SQLite veritabanı (`transport.db`) **dokunulmaz**
- Kullanıcı ayarları korunur
- Electron `userData` klasöründeki tüm dosyalar korunur

### Yedekleme Önerisi

Güncelleme öncesi kullanıcıya yedek alma hatırlatması gösterin:

```typescript
// Ayarlar sayfasında güncelleme butonu
const handleUpdate = async () => {
  // Önce yedek al
  const backup = await window.electronAPI.backup.create()
  
  if (backup.success) {
    // Şimdi güncelleme yapabilirsin
    await window.electronAPI.update.install()
  }
}
```

---

## 📱 Kullanıcı Deneyimi

### Güncelleme Bildirimi UI

**Ayarlar sayfasında güncelleme bölümü eklenebilir:**

```tsx
{updateAvailable && (
  <Card title="🎉 Yeni Versiyon Mevcut!">
    <div className="p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl">
      <h3 className="text-xl font-bold text-white mb-2">
        Versiyon {updateInfo.version} Hazır
      </h3>
      <p className="text-gray-300 mb-4">
        Yeni özellikler ve iyileştirmeler içeriyor.
      </p>
      <Button onClick={handleDownloadUpdate}>
        İndir ve Kur
      </Button>
    </div>
  </Card>
)}
```

---

## 🚀 Dağıtım Stratejisi

### Aşamalı Dağıtım (Önerilen)

1. **Beta Test:** Önce 2-3 müşteriye beta versiyonu gönderin
2. **Geri Bildirim:** 1 hafta test ettirin
3. **Genel Dağıtım:** Sorun yoksa tüm müşterilere dağıtın

### Acil Güncelleme

Kritik güvenlik güncellemeleri için:

```typescript
autoUpdater.autoDownload = true // Otomatik indir
autoUpdater.autoInstallOnAppQuit = true // Kapanışta kur
```

---

## 📋 Checklist

Güncelleme yapmadan önce:

- [ ] Versiyon numarasını artır (`package.json`)
- [ ] CHANGELOG.md dosyası güncelle
- [ ] Yerel testler başarılı
- [ ] Build başarılı (Windows + macOS)
- [ ] Installer test edildi
- [ ] Veritabanı migration'ları test edildi
- [ ] Eski versiyondan güncelleme test edildi
- [ ] GitHub Release oluşturuldu
- [ ] Müşterilere e-posta bildirimi gönderildi

---

## 🔗 Faydalı Linkler

- [Electron Builder Docs](https://www.electron.build/)
- [Electron Updater Docs](https://www.electron.build/auto-update)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

## ❓ Sık Sorulan Sorular

**S: Kullanıcı verileri silinir mi?**
C: Hayır, güncelleme sadece program dosyalarını değiştirir. Veritabanı ve ayarlar korunur.

**S: Güncelleme ne sıklıkla kontrol edilmeli?**
C: Her 4-6 saatte bir otomatik kontrol yeterlidir. Kullanıcı fark etmez.

**S: Güncelleme zorunlu mu?**
C: Hayır, kullanıcı isterse güncellemeyi reddedebilir. Ancak kritik güvenlik güncellemelerinde zorunlu yapabilirsiniz.

**S: macOS ve Windows için ayrı versiyon mu?**
C: Hayır, versiyon numarası aynıdır. Sadece installer dosyaları farklıdır (.exe vs .dmg).

---

## 💡 İpucu

İlk 10 müşteriye manuel installer gönderin ve deneyimlerini gözlemleyin. Sorunsuz çalıştığından emin olduktan sonra auto-updater'ı aktifleştirin.

