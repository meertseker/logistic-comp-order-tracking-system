# 📸 Otomatik Screenshot Alma Rehberi

Bu rehber, uygulamanızın tüm sayfalarının ekran görüntülerini otomatik olarak nasıl alacağınızı gösterir.

## 🚀 Hızlı Başlangıç

### Adım 1: Uygulamayı Build Edin
```bash
npm run build
```

Bu komut hem React uygulamasını hem de Electron uygulamasını production modunda derleyecektir.

### Adım 2: Screenshot'ları Alın
```bash
npm run screenshots
```

Bu komut Electron uygulamasını otomatik olarak başlatacak, tüm sayfaları gezecek ve screenshot'ları alacaktır.

## 📁 Sonuç

Tüm ekran görüntüleri `screenshots/` klasöründe kaydedilecektir:

- `00-license-activation.png` - Lisans Aktivasyon Ekranı
- `01-dashboard.png` - Ana Sayfa (Dashboard)
- `02-orders.png` - Siparişler Listesi
- `03-create-order.png` - Yeni Sipariş Oluşturma
- `04-reports.png` - Raporlar
- `05-charts.png` - Grafikler
- `06-vehicles.png` - Araçlar
- `07-active-vehicles.png` - Aktif Araçlar
- `08-trailers.png` - Dorse/Römorklar
- `09-routes.png` - Güzergahlar
- `10-settings.png` - Ayarlar
- `99-order-detail.png` - Sipariş Detay (eğer sipariş varsa)

## ⚙️ Ayarlar

Screenshot ayarlarını değiştirmek için `scripts/take-screenshots.js` dosyasını düzenleyin:

### Çözünürlük Değiştirme
```javascript
viewport: { width: 1920, height: 1080 }  // Varsayılan: Full HD
```

### Farklı ekran boyutları için:
- **4K:** `{ width: 3840, height: 2160 }`
- **2K:** `{ width: 2560, height: 1440 }`
- **Laptop:** `{ width: 1366, height: 768 }`
- **Tablet:** `{ width: 768, height: 1024 }`
- **Mobil:** `{ width: 375, height: 667 }`

### Headless Mod
Tarayıcıyı görmek istemiyorsanız:
```javascript
headless: true  // Arka planda çalışır
```

## 🎯 Özellikler

✅ Tüm sayfalarda otomatik gezinme  
✅ Full page screenshot (tüm sayfa, scroll dahil)  
✅ Lazy-loaded içerikleri yükleme  
✅ Yüksek kaliteli görüntüler (1920x1080)  
✅ Otomatik dosya isimlendirme  
✅ Hata yönetimi  

## 🔧 Sorun Giderme

### Problem: "ECONNREFUSED" hatası
**Çözüm:** Önce `npm run dev` ile uygulamayı başlatın.

### Problem: Lisans ekranından geçemiyor
**Çözüm:** Script 10 saniye bekleyecek, bu sürede manuel olarak lisansı girebilirsiniz. Veya önceden lisans aktif olmalı.

### Problem: Bazı sayfalar boş geliyor
**Çözüm:** `page.waitForTimeout()` değerlerini artırın (3000 -> 5000 ms).

### Problem: Görüntüler düşük kalitede
**Çözüm:** `deviceScaleFactor` değerini artırın (1 -> 2).

## 📝 Not

- Screenshot'lar her çalıştırmada üzerine yazılır
- Önceki screenshot'ları saklamak isterseniz klasörü yedekleyin
- Script çalışırken tarayıcı penceresini kapatmayın

