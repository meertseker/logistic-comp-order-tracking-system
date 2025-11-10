# ⚙️ Ayarlar Sayfası - Özellikler ve Kullanım

## 🎯 Genel Bakış

Yeni ayarlar sayfası 4 ana bölümden oluşur:
1. **Mail Ayarları** - Müşterilere otomatik mail gönderme
2. **Veri Yönetimi** - Veri export ve yedekleme
3. **Lisans Bilgileri** - Ürün lisans durumu
4. **Sistem Bilgileri** - Uygulama ve sistem detayları

---

## 📧 1. Mail Ayarları

### Özellikler

- **Gmail** veya **Outlook** mail servisi seçimi
- Kolay kurulum (sadece email ve şifre gerekir)
- Bağlantı test özelliği
- Otomatik SMTP konfigürasyonu
- Gmail için "Uygulama Şifresi" uyarısı

### Kullanım

```
1. Mail servisini seç (Gmail veya Outlook)
2. Email adresinizi girin
3. Şifrenizi girin (Gmail için App Password)
4. "Bağlantıyı Test Et" butonuna tıklayın
5. Test başarılıysa "Kaydet" butonuna tıklayın
```

### Teknik Detaylar

- SMTP ayarları veritabanında şifreli saklanır
- Test modu ile canlı ortama geçmeden önce kontrol
- Başarılı kurulumdan sonra sipariş detay sayfalarında "Mail Gönder" butonu aktif olur

---

## 📦 2. Veri Yönetimi (Export)

### 4 Farklı Export Türü

#### A. Tüm Verileri JSON Olarak Export

**Dosya Formatı:** `nakliye-verileri-2025-01-15-143022.json`

**İçerik:**
- Tüm siparişler
- Araçlar
- Güzergahlar
- Dorseler ve yükler
- Mail logları
- Sistem ayarları

**Kullanım:**
- Bilgisayar değişikliğinde veri taşıma
- Başka bir sisteme import
- Tam sistem yedeği

```bash
# Export edilen JSON formatı
{
  "exportDate": "2025-01-15T14:30:22.000Z",
  "appVersion": "1.0.0",
  "orders": [...],
  "vehicles": [...],
  "routes": [...],
  "trailers": [...],
  "settings": [...]
}
```

#### B. Siparişleri CSV Olarak Export

**Dosya Formatı:** `siparisler-2025-01-15-143022.csv`

**İçerik:**
- Sipariş ID, Plaka, Müşteri, Telefon
- Nereden-Nereye, Yük Açıklaması
- Fiyat, Maliyet, Kar/Zarar
- Durum, Tarih bilgileri

**Kullanım:**
- Excel'de analiz
- Muhasebe programlarına import
- Raporlama

**Excel'de Açma:**
Dosya UTF-8 BOM ile kodlanmıştır, Türkçe karakterler doğru görünür.

#### C. Veritabanını Yedekle

**Dosya Formatı:** `transport-db-2025-01-15-143022.db`

**İçerik:**
- SQLite veritabanının tam kopyası
- Tüm veriler (siparişler, araçlar, ayarlar, mail logları)

**Kullanım:**
- Başka bilgisayara taşıma
- Felaket kurtarma
- Geliştirme/test ortamı oluşturma

**Geri Yükleme:**
```bash
# Mevcut veritabanı konumu (Windows)
C:\Users\[KULLANICI]\AppData\Roaming\[APP_NAME]\transport.db

# Mevcut veritabanı konumu (macOS)
~/Library/Application Support/[APP_NAME]/transport.db

# Yedekten geri yükleme: Uygulamayı kapat, .db dosyasını değiştir, uygulamayı aç
```

#### D. İstatistik Raporu

**Dosya Formatı:** `istatistik-raporu-2025-01-15-143022.json`

**İçerik:**
- Toplam sipariş sayısı
- Toplam gelir, gider, kar
- Durumlara göre sipariş dağılımı
- Araç bazlı performans
- En çok kullanılan güzergahlar
- Aylık istatistikler (son 12 ay)

**Kullanım:**
- Performans analizi
- Müşteri sunumları
- Stratejik planlama

```json
{
  "summary": {
    "totalOrders": 156,
    "totalRevenue": 1240000,
    "totalCost": 850000,
    "totalProfit": 390000,
    "profitMargin": "31.45%"
  },
  "monthlyStats": [...],
  "topRoutes": [...]
}
```

---

## 🔐 3. Lisans Bilgileri

### Gösterilen Bilgiler

- Şirket adı
- Email adresi
- Aktivasyon tarihi
- Son kontrol tarihi
- Lisans durumu (Aktif/Pasif)

### Özellikler

- Lisans sadece tek bilgisayarda geçerlidir
- Periyodik doğrulama (arka planda)
- Hardware fingerprint ile bağlı

---

## 💻 4. Sistem Bilgileri

### Gösterilen Bilgiler

**Uygulama:**
- Uygulama adı
- Versiyon numarası
- Platform (Windows/macOS/Linux)
- Mimari (x64, arm64)

**Sistem Bileşenleri:**
- Electron versiyonu
- Node.js versiyonu
- Chrome versiyonu
- Veri klasörü yolu

### Güncelleme Bildirimi

Ayarlar sayfasında güncelleme mevcut olduğunda bildirim görüntülenir.

---

## 🛡️ Güvenlik ve Veri Koruma

### Veri Export Güvenliği

- Export işlemleri sadece kullanıcının bilgisayarında çalışır
- Veriler internete gönderilmez
- Dosyalar kullanıcının "Belgeler" klasörüne kaydedilir
- Hassas veriler (mail şifreleri) export'a dahil DEĞİLDİR

### Mail Şifre Güvenliği

- Şifreler veritabanında saklanır (şifreleme önerilir)
- Network trafiğinde şifreleme (TLS/SSL)
- Şifreler export dosyalarına dahil edilmez

---

## 📋 Kullanıcı Senaryoları

### Senaryo 1: Bilgisayar Değişikliği

```
1. Eski bilgisayarda: Ayarlar → Veri Yönetimi → "Veritabanını Yedekle"
2. .db dosyasını USB'ye kopyala
3. Yeni bilgisayara uygulamayı kur
4. Lisansı aktive et
5. Uygulamayı kapat
6. .db dosyasını userData klasörüne kopyala
7. Uygulamayı aç
8. Ayarlar → Mail Ayarları → Mail bilgilerini yeniden gir
```

### Senaryo 2: Aylık Raporlama

```
1. Ayarlar → Veri Yönetimi → "İstatistik Raporu"
2. JSON dosyasını aç
3. Verileri analiz et veya PowerPoint'e ekle
4. Müşterilere sunum yap
```

### Senaryo 3: Muhasebe İçin Export

```
1. Ayarlar → Veri Yönetimi → "Siparişleri CSV Olarak İndir"
2. Excel'de aç
3. Pivot table oluştur
4. Muhasebe programına import et
```

---

## 🔧 Teknik Implementasyon

### Backend (Electron Main)

```typescript
// Export Manager
electron/main/export-manager.ts

Fonksiyonlar:
- exportAllData() - Tüm verileri JSON olarak export
- exportOrdersToCSV() - Siparişleri CSV olarak export
- exportDatabaseFile() - Veritabanını kopyala
- exportStatisticsReport() - İstatistik raporu oluştur
```

### IPC Handlers

```typescript
// electron/main/index.ts
ipcMain.handle('export:allData', ...)
ipcMain.handle('export:ordersCSV', ...)
ipcMain.handle('export:database', ...)
ipcMain.handle('export:statistics', ...)
ipcMain.handle('system:getInfo', ...)
```

### Frontend (React)

```typescript
// src/pages/SettingsProfessional.tsx

Bileşenler:
- Tab navigasyonu (Mail, Export, Lisans, Sistem)
- Mail konfigürasyonu (Gmail/Outlook seçici)
- Export butonları (4 farklı export türü)
- Lisans ve sistem bilgi kartları
```

### API Kullanımı

```typescript
// Export işlemleri
const result = await window.electronAPI.export.allData()
const result = await window.electronAPI.export.ordersCSV()
const result = await window.electronAPI.export.database()
const result = await window.electronAPI.export.statistics()

// Sistem bilgileri
const info = await window.electronAPI.system.getInfo()
```

---

## 🎨 UI/UX Özellikleri

### Renkli Kategoriler

- **Mail:** Kırmızı/Mavi gradyanlar
- **Export:** Mavi, Yeşil, Mor, Turuncu gradyanlar
- **Lisans:** Yeşil (aktif)
- **Sistem:** Mavi/Yeşil

### Animasyonlar

- Tab geçişlerinde smooth transition
- Hover efektleri (scale 1.02)
- Loading spinners (export işlemleri sırasında)

### Responsive Tasarım

- Mobil: Tek sütun
- Desktop: 2 sütun grid
- Tab navigasyonu: Kaydırılabilir

---

## 🚀 Gelecek Geliştirmeler

### Öneriler

1. **Otomatik Yedekleme**
   - Günlük/haftalık otomatik backup
   - Google Drive entegrasyonu
   - Dropbox entegrasyonu

2. **Import Özelliği**
   - JSON dosyasından veri import
   - CSV'den sipariş import
   - Excel import desteği

3. **Mail Şablonları**
   - Özelleştirilebilir mail içeriği
   - Birden fazla mail şablonu
   - Logo ekleme

4. **Gelişmiş Raporlar**
   - PDF rapor export
   - Excel rapor export
   - Grafikli raporlar

5. **Güncelleme Sistemi**
   - Otomatik güncelleme kontrolü
   - İndir ve kur butonu
   - Versiyon geçmişi

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Sistem Bilgileri sekmesindeki detayları not edin
2. Hata mesajını screenshot alın
3. Destek ekibine ulaşın

---

## ✅ Checklist

Ayarlar sayfasını kullanmadan önce:
- [ ] Mail ayarlarını yapılandır ve test et
- [ ] İlk yedek alımını yap
- [ ] Export özelliklerini test et
- [ ] Lisans bilgilerini kontrol et
- [ ] Veri klasörü konumunu not et

