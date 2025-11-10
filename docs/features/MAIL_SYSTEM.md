# 📧 Mail Yönetim Sistemi

## Genel Bakış

Sekersoft Lojistik Yönetim Sistemi'ne **tam özellikli, profesyonel bir Mail Yönetim Sayfası** eklendi. Müşterilere otomatik ve manuel mail gönderimi, mail geçmişi takibi, toplu mail gönderimi ve şablon yönetimi özellikleri içerir.

---

## 🎯 Özellikler

### 1. **📊 Mail Dashboard (İstatistikler)**

#### İstatistik Kartları:
- **Bugün Gönderilen**: Bugünkü toplam mail sayısı (başarılı/hatalı ayrımı)
- **Bu Hafta**: Son 7 gündeki toplam mail sayısı
- **Bu Ay**: Aylık toplam mail sayısı
- **Başarı Oranı**: Genel mail başarı yüzdesi + son 24 saatteki hatalı mail sayısı

#### Detaylı Özet:
- **Başarılı Gönderimler**: Yeşil renk kodlamalı, progress bar ile görsel gösterim
- **Hatalı Gönderimler**: Kırmızı renk kodlamalı, hata uyarısı ile
- **Toplam İstatistik**: Sistem kurulumundan beri tüm mail kayıtları

---

### 2. **📜 Mail Geçmişi**

#### Filtreleme Özellikleri:
- **Arama**: Email, konu veya sipariş numarasına göre
- **Durum Filtresi**: Başarılı / Hatalı / Tümü
- **Tarih Filtresi**: Bugün / Son 7 Gün / Bu Ay / Tüm Zamanlar

#### Tablo Görünümü:
| Sipariş No | Alıcı | Konu | Durum | Tarih | İşlemler |
|------------|-------|------|-------|-------|----------|
| Veri gösterimi | ✓ | ✓ | ✓ | ✓ | Detay / Yeniden Gönder |

#### Özellikler:
- **Detaylı Görüntüleme**: Her mail için modal ile detay görüntüleme
  - Sipariş bilgileri
  - Alıcı email
  - Gönderim tarihi
  - Hata mesajı (varsa)
- **Yeniden Gönderme**: Hatalı mailleri tek tıkla yeniden gönderme

---

### 3. **✉️ Manuel Mail Gönder**

#### Form Alanları:
- **Sipariş No** *(Zorunlu)*: Hangi siparişe ait mail gönderileceği
- **Alıcı Email** *(Zorunlu)*: Mail gönderilecek email adresi
- **Mail Şablonu**: Otomatik seçilebilir şablon (6 farklı şablon)

#### Özellikler:
- Sipariş bilgileri otomatik doldurulur
- Seçilen şablona göre mail içeriği oluşturulur
- PDF ve fatura ekleri otomatik eklenir
- Gerçek zamanlı gönderim durumu gösterimi

---

### 4. **👥 Toplu Mail Gönder**

#### Filtreleme:
- **Sipariş Durumu**: Bekliyor / Yolda / Teslim Edildi / Faturalandı / Tümü
- **Tarih Aralığı**: Başlangıç - Bitiş tarihi seçimi
- **Otomatik Filtreleme**: Sadece email adresi olan siparişler gösterilir

#### Toplu Gönderim:
- **Çoklu Seçim**: Checkbox ile istediğiniz siparişleri seçin
- **Seç/Tümünü Seç**: Toplu seçim özelliği
- **Canlı Sayaç**: Kaç sipariş bulundu / Kaç sipariş seçildi
- **Progress Tracking**: Gönderim sırasında ilerleme gösterimi
- **Rate Limiting**: Mail sunucusunu yormamak için 1 saniye bekleme

#### Güvenlik:
- Gönderim öncesi onay modalı
- Başarılı/Başarısız gönderim özeti

---

### 5. **📄 Mail Şablonları**

#### Mevcut Şablonlar:

1. **Sipariş Alındı** (`Bekliyor`)
   - Müşteri siparişi oluşturduğunda
   - Konu: "Siparişiniz Alındı"

2. **Yükleme Tamamlandı** (`Yüklendi`)
   - Yük araca yüklendiğinde
   - Konu: "Yükleme Tamamlandı"

3. **Aracınız Yola Çıktı** (`Yolda`)
   - Araç yola çıktığında
   - Konu: "Aracınız Yola Çıktı"

4. **Teslimat Tamamlandı** (`Teslim Edildi`)
   - Teslimat yapıldığında
   - Konu: "Teslimat Tamamlandı"

5. **Faturanız Hazır** (`Faturalandı`)
   - Fatura hazırlandığında
   - Konu: "Faturanız Hazır"

6. **Sipariş İptal** (`İptal`)
   - Sipariş iptal edildiğinde
   - Konu: "Sipariş İptal Edildi"

#### Şablon Kartları:
- Modern card tasarımı
- Şablon açıklaması
- İlgili sipariş durumu
- Önizleme butonu
- Kullanım bilgisi

---

## 🎨 Tasarım Özellikleri

### Modern iOS 26 Liquid Glass Tasarım:
- ✨ **Glassmorphism** efektleri
- 🎭 **Framer Motion** animasyonlar
- 🎨 **Renk Paleti**:
  - Mavi (`#0A84FF`) - Ana renk, mailbox
  - Yeşil (`#30D158`) - Başarılı işlemler
  - Kırmızı (`#FF453A`) - Hatalı işlemler
  - Mor (`#BF5AF2`) - Şablonlar
  - Sarı (`#FFD60A`) - Uyarılar

### Responsive Tasarım:
- Mobil uyumlu
- Tablet ve desktop optimize
- Grid layout sistemleri

### Animasyonlar:
- Sayfa geçiş animasyonları
- Card hover efektleri
- Button interaktif animasyonlar
- Loading spinners

---

## 🔧 Teknik Detaylar

### Frontend (React + TypeScript):
```typescript
// Sayfa: src/pages/MailProfessional.tsx
// 1,350+ satır kod
// 5 ana tab: Dashboard, History, Send, Bulk, Templates
```

### Backend (Electron + SQLite):
```sql
-- Tablo: mail_logs
CREATE TABLE mail_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success' | 'failed'
  error_message TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tablo: mail_settings
CREATE TABLE mail_settings (
  id INTEGER PRIMARY KEY,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_secure INTEGER,
  smtp_user TEXT,
  smtp_password TEXT,
  from_email TEXT,
  from_name TEXT,
  enabled INTEGER
);
```

### API Endpoints:
```typescript
// Electron IPC Handlers
ipcMain.handle('mail:getSettings', ...)   // Mail ayarlarını getir
ipcMain.handle('mail:saveSettings', ...)   // Mail ayarlarını kaydet
ipcMain.handle('mail:testConnection', ...) // SMTP bağlantısını test et
ipcMain.handle('mail:sendOrderEmail', ...) // Sipariş maili gönder
ipcMain.handle('mail:getLogs', ...)        // Mail loglarını getir
```

### Bağımlılıklar:
- ✅ **nodemailer**: SMTP mail gönderimi
- ✅ **better-sqlite3**: Veritabanı
- ✅ **framer-motion**: Animasyonlar
- ✅ **lucide-react**: İkonlar
- ✅ **react-router-dom**: Routing

---

## 📱 Kullanım Senaryoları

### Senaryo 1: Sipariş Durumu Değiştiğinde Otomatik Mail
```typescript
// Orders.tsx veya OrderDetail.tsx
// Sipariş durumu "Yolda" olarak değiştirildi
// -> Otomatik mail gönderildi (customer_email varsa)
```

### Senaryo 2: Manuel Bilgilendirme Maili
```typescript
// Mail -> Manuel Gönder
// Sipariş No: 123
// Alıcı: musteri@example.com
// Şablon: Sipariş Alındı
// -> Mail gönder
```

### Senaryo 3: Toplu Hatırlatma Maili
```typescript
// Mail -> Toplu Gönder
// Filtre: Durum = "Bekliyor", Tarih = Son 7 gün
// -> 15 sipariş bulundu
// -> 15 sipariş seç
// -> Toplu mail gönder
```

### Senaryo 4: Hatalı Mail Yeniden Gönderme
```typescript
// Mail -> Geçmiş
// Filtre: Durum = "Hatalı"
// -> Hatalı mail detayını gör
// -> Yeniden gönder butonu
```

---

## 🚀 Kurulum ve Aktivasyon

### 1. Mail Ayarları (Settings sayfası):
```
Ayarlar -> Mail Ayarları
- SMTP Host: smtp.gmail.com
- SMTP Port: 587
- Email: sirket@example.com
- Şifre: ********
- Test Bağlantı
- Kaydet ve Aktifleştir
```

### 2. Sipariş Oluşturma (Email alanı):
```
Siparişler -> Yeni Sipariş
- Müşteri Email: musteri@example.com (opsiyonel)
- Diğer bilgileri doldur
- Oluştur
```

### 3. Otomatik Mail Gönderimi:
```
Sipariş Detay -> Durum Değiştir
- "Yolda" seçildi
- Otomatik mail gönderildi (eğer email varsa)
```

---

## 📊 İstatistik ve Raporlama

### Günlük İzleme:
- Bugün kaç mail gönderildi?
- Başarı oranı nedir?
- Hatalı mailler hangileri?

### Aylık Analiz:
- Bu ay toplam mail sayısı
- En çok mail alan müşteriler
- Mail başarı trendi

### Hata Analizi:
- Hangi maillerde hata var?
- En sık görülen hata nedenleri
- Yeniden gönderim gerekenleri tespit et

---

## 🎯 Gelecek Özellikler (Potansiyel)

### Faz 2:
- [ ] Özel şablon oluşturma editörü
- [ ] Şablon önizleme (gerçek verilerle)
- [ ] Mail açılma oranı takibi (read receipts)
- [ ] Ek dosya yükleme (fatura dışında)

### Faz 3:
- [ ] Zamanlanmış mail gönderimi
- [ ] Otomatik hatırlatma kuralları
- [ ] Mail gruplaması (CC, BCC)
- [ ] HTML editör (WYSIWYG)

### Faz 4:
- [ ] Gelen mail okuma (IMAP)
- [ ] Mail cevaplama
- [ ] Mail thread takibi
- [ ] Gelişmiş istatistikler ve grafikler

---

## 🔒 Güvenlik

### Veri Koruması:
- SMTP şifreleri veritabanında saklanır (production'da encrypt edilmeli)
- Mail logları sadece 100 kayıt gösterilir (performans)
- Rate limiting ile spam önleme

### Erişim Kontrolü:
- Sadece lisanslı kullanıcılar erişebilir
- Mail ayarları yönetici yetkisi gerektirir

---

## 📝 Notlar

- Mail sistemi **nodemailer** kullanır (SMTP)
- Gmail kullanıyorsanız "Daha az güvenli uygulamalar" açık olmalı veya App Password kullanın
- Outlook/Office365 için SMTP ayarları farklıdır
- Mail gönderimi sırasında internet bağlantısı gerekir
- PDF ve fatura ekleri otomatik oluşturulur

---

## 🎉 Sonuç

**Tam özellikli, profesyonel bir Mail Yönetim Sistemi** başarıyla Sekersoft projesine entegre edildi. Modern tasarım, kullanıcı dostu arayüz ve güçlü özelliklerle müşteri iletişiminizi kolaylaştırın!

---

**Geliştirici:** AI Assistant  
**Tarih:** 2025-01-10  
**Versiyon:** 1.0.0  
**Dosya:** `src/pages/MailProfessional.tsx`

