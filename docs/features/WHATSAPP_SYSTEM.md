# 🟢 WhatsApp Yönetim Sistemi

## Genel Bakış

Sekersoft Lojistik Yönetim Sistemi'ne **tam özellikli WhatsApp entegrasyonu** eklendi. Müşterilere otomatik ve manuel WhatsApp mesajı gönderimi, mesaj geçmişi takibi, toplu mesaj gönderimi ve şablon yönetimi özellikleri içerir.

---

## 🎯 Özellikler

### 1. **⚙️ WhatsApp Yapılandırma**

#### Desteklenen Servisler:
- **İletimerkezi** (Önerilen) - Türk servisi, kolay kurulum, Türkçe destek
- **NetGSM** - SMS + WhatsApp kombine hizmet
- **Twilio** - Global WhatsApp Business API provider

#### Yapılandırma Adımları:
1. Ayarlar → WhatsApp Ayarları
2. Servis provider seç
3. API Key/Username/Password gir
4. Gönderici telefon numarası ekle (+90 ile başlamalı)
5. Şirket adını gir
6. Otomatik bildirim ayarlarını seç
7. Kaydet ve Test Et

---

### 2. **📬 Otomatik Bildirimler**

Sipariş durumu değiştiğinde otomatik WhatsApp mesajı gönderilir.

#### Otomatik Gönderim Senaryoları:

| Durum | Mesaj Tipi | Gönderim Şartı |
|-------|------------|----------------|
| **Sipariş Oluşturuldu** | `created` | `auto_send_on_created` aktif |
| **Yolda** | `on_way` | `auto_send_on_status_change` aktif |
| **Teslim Edildi** | `delivered` | `auto_send_on_delivered` aktif |
| **Faturalandı** | `invoiced` | `auto_send_on_invoiced` aktif |
| **İptal** | `cancelled` | `auto_send_on_status_change` aktif |

#### Mesaj Şablonları:

Tüm mesajlar veritabanındaki şablonlardan oluşturulur ve aşağıdaki değişkenleri destekler:

- `{musteri}` - Müşteri adı
- `{orderId}` - Sipariş numarası
- `{plaka}` - Araç plakası
- `{nereden}` - Başlangıç noktası
- `{nereye}` - Varış noktası
- `{fiyat}` - Sipariş fiyatı
- `{tahminiGun}` - Tahmini süre
- `{status}` - Sipariş durumu
- `{company}` - Şirket adı
- `{phone}` - Şirket telefonu

#### Örnek Şablon:

```
Sayın {musteri}, siparişiniz (#{orderId}) yola çıkmıştır. 
Plaka: {plaka}
Güzergah: {nereden} → {nereye}
Tahmini varış: {tahminiGun} gün
İyi yolculuklar!
```

---

### 3. **💬 Manuel WhatsApp Gönderimi**

#### Sipariş Detay Sayfasından Gönderim:

1. Sipariş Detay sayfasını aç
2. **"WhatsApp Gönder"** butonuna tıkla
3. Telefon numarası otomatik doldurulur (değiştirilebilir)
4. İsteğe bağlı özel mesaj yaz
5. Gönder

#### Özellikler:
- ✅ Telefon numarası validasyonu
- ✅ Otomatik numara formatlaması (+90 5XX XXX XX XX)
- ✅ Özel mesaj yazma imkanı
- ✅ Sipariş bilgileri otomatik eklenir
- ✅ Başarı/Hata bildirimi

---

### 4. **📤 Toplu WhatsApp Gönderimi**

#### Kullanım:

1. **Siparişler** sayfasına git
2. Birden fazla sipariş seç (checkbox ile)
3. **"WhatsApp (X)"** butonuna tıkla
4. Mesaj içeriği yaz (opsiyonel)
5. Onayla ve gönder

#### Özellikler:
- ✅ Çoklu sipariş seçimi
- ✅ Toplu gönderim onayı
- ✅ Rate limiting (mesajlar arası 500ms bekleme)
- ✅ Başarı/Hata raporu
- ✅ Telefon numarası olmayan siparişler otomatik atlanır

#### Örnek Kullanım:

```
Senaryo: 10 sipariş seçildi
- 8 siparişte telefon var
- 2 siparişte telefon yok

Sonuç:
✅ 7 mesaj başarıyla gönderildi
❌ 1 mesaj gönderilemedi (hatalı numara)
ℹ️ 2 sipariş atlandı (telefon yok)
```

---

### 5. **📜 WhatsApp Geçmişi**

#### İstatistikler:

- **Bugün Gönderilen**: Bugünkü toplam mesaj sayısı
- **Bu Hafta**: Son 7 gündeki mesaj sayısı
- **Bu Ay**: Aylık toplam mesaj sayısı
- **Başarı Oranı**: Genel mesaj başarı yüzdesi

#### Filtreleme:

- **Sipariş No**: Sipariş numarasına göre ara
- **Telefon**: Telefon numarasına göre filtrele
- **Durum**: Başarılı / Hatalı / Tümü
- **Tarih**: Bugün / Bu Hafta / Bu Ay / Tüm Zamanlar

#### Mesaj Detayları:

Her mesaj kaydı şunları içerir:
- Sipariş numarası
- Alıcı adı
- Telefon numarası
- Mesaj içeriği
- Mesaj tipi (created, on_way, delivered, vb.)
- Gönderim durumu
- Gönderim tarihi
- Hata mesajı (varsa)

#### İşlemler:

- **Yeniden Gönder**: Hatalı mesajı tekrar gönder
- **Detay Görüntüle**: Mesaj içeriğini ve sipariş bilgilerini gör

---

## 🛠️ Teknik Detaylar

### Veritabanı Yapısı

#### `whatsapp_settings` Tablosu:

```sql
CREATE TABLE whatsapp_settings (
  id INTEGER PRIMARY KEY,
  provider TEXT DEFAULT 'iletimerkezi',
  api_key TEXT,
  api_secret TEXT,
  api_username TEXT,
  api_password TEXT,
  sender_name TEXT,
  sender_phone TEXT,
  enabled INTEGER DEFAULT 0,
  
  -- Otomatik bildirim ayarları
  auto_send_on_created INTEGER DEFAULT 1,
  auto_send_on_status_change INTEGER DEFAULT 1,
  auto_send_on_delivered INTEGER DEFAULT 1,
  auto_send_on_invoiced INTEGER DEFAULT 1,
  
  -- Mesaj şablonları
  template_order_created TEXT,
  template_order_on_way TEXT,
  template_order_delivered TEXT,
  template_order_invoiced TEXT,
  template_order_cancelled TEXT,
  template_custom TEXT,
  
  company_name TEXT,
  updated_at DATETIME
);
```

#### `whatsapp_logs` Tablosu:

```sql
CREATE TABLE whatsapp_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  message_type TEXT NOT NULL,
  message_content TEXT NOT NULL,
  status TEXT NOT NULL,
  delivery_status TEXT,
  read_status INTEGER DEFAULT 0,
  error_message TEXT,
  provider_message_id TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME,
  read_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### API Fonksiyonları

#### Frontend (React):

```typescript
// Ayarları getir
const settings = await window.electronAPI.whatsapp.getSettings()

// Ayarları kaydet
await window.electronAPI.whatsapp.saveSettings(settings)

// Bağlantıyı test et
const result = await window.electronAPI.whatsapp.testConnection()

// Mesaj gönder
await window.electronAPI.whatsapp.sendOrderMessage(
  phone,
  orderData,
  'on_way',
  customMessage
)

// Toplu mesaj gönder
await window.electronAPI.whatsapp.sendBulkMessages(
  recipients,
  'custom',
  message
)

// Logları getir
const logs = await window.electronAPI.whatsapp.getLogs({
  orderId: 123,
  status: 'sent',
  dateFrom: '2025-01-01'
})

// İstatistikleri getir
const stats = await window.electronAPI.whatsapp.getStatistics('week')

// Mesajı yeniden gönder
await window.electronAPI.whatsapp.resendMessage(logId)
```

#### Backend (Electron):

```typescript
// WhatsApp Service
class WhatsAppService {
  async initialize()
  async testConnection()
  async sendMessage(phone, message)
  async sendOrderMessage(phone, orderData, messageType, customMessage)
  async sendBulkMessages(recipients, messageType, customMessage)
  async getLogs(filters)
  async getStatistics(period)
  
  // Provider-specific methods
  private async sendViaIletimerkezi(phone, message)
  private async sendViaNetgsm(phone, message)
  private async sendViaTwilio(phone, message)
  
  // Utility methods
  private formatPhone(phone)
  private getTemplate(messageType)
  private replaceVariables(template, orderData)
}
```

---

## 📋 Kurulum Rehberi

### 1. İletimerkezi Kurulumu (Önerilen)

#### API Key Alma:

1. [https://www.iletimerkezi.com](https://www.iletimerkezi.com) adresine git
2. Hesap oluştur
3. WhatsApp Business API için başvur
4. API Key ve Username/Password al

#### Sekersoft Ayarları:

1. Ayarlar → WhatsApp Ayarları
2. Provider: **İletimerkezi** seç
3. Bilgileri gir:
   - API Username: `kullanici_adiniz`
   - API Password: `sifreniz`
   - Gönderici Telefon: `+90 5XX XXX XX XX`
   - Şirket Adı: `Şirket Adınız`
4. Otomatik bildirimleri aktifleştir
5. **Test Mesajı Gönder** butonuna tıkla
6. Kaydet

### 2. NetGSM Kurulumu

#### API Key Alma:

1. [https://www.netgsm.com.tr](https://www.netgsm.com.tr) adresine git
2. Hesap oluştur
3. SMS/WhatsApp paketi satın al
4. API bilgilerini al

#### Sekersoft Ayarları:

1. Provider: **NetGSM** seç
2. API Username: `kullanici_kodu`
3. API Password: `sifre`
4. Gönderici Telefon: `+90 5XX XXX XX XX`
5. Test et ve kaydet

### 3. Twilio Kurulumu

#### API Key Alma:

1. [https://www.twilio.com](https://www.twilio.com) adresine git
2. Hesap oluştur
3. WhatsApp Business API için başvur
4. Account SID ve Auth Token al

#### Sekersoft Ayarları:

1. Provider: **Twilio** seç
2. API Username: `Account SID`
3. API Key: `Auth Token`
4. Gönderici Telefon: `whatsapp:+14155238886` (Twilio sandbox)
5. Test et ve kaydet

---

## 💰 Maliyet Tahmini

### İletimerkezi:

- 1000 mesaj: ~₺250-400
- 5000 mesaj: ~₺1,000-1,500
- Paket sistemleri mevcut

### NetGSM:

- 1000 mesaj: ~₺200-350
- SMS ile kombine paketler

### Twilio:

- 1000 mesaj: ~$5-20 (WhatsApp Business API)
- Sandbox ücretsiz (test için)

---

## ⚠️ Önemli Notlar

### Telefon Numarası Formatı:

- ✅ Doğru: `+90 555 123 4567`
- ✅ Doğru: `+905551234567`
- ✅ Doğru: `0555 123 4567`
- ❌ Yanlış: `555 123 4567`

Sistem otomatik olarak tüm formatları `+905551234567` şekline çevirir.

### Rate Limiting:

Toplu mesaj gönderiminde her mesaj arası 500ms bekleme vardır. Bu, API limitlerini aşmamak içindir.

### Hata Yönetimi:

- Mesaj gönderilemezse `whatsapp_logs` tablosuna hata kaydedilir
- Kullanıcıya bildirim gösterilir
- Yeniden gönder özelliği ile tekrar denenebilir
- Sipariş işlemleri etkilenmez (graceful failure)

### Güvenlik:

- API Key/Password veritabanında saklanır (şifreleme önerilir)
- HTTPS zorunlu
- Rate limiting
- Input validation

---

## 🔧 Sorun Giderme

### Mesaj Gönderilmiyor:

1. API bilgilerini kontrol et
2. Test mesajı gönder
3. Telefon numarası formatını kontrol et
4. API limitlerini kontrol et
5. Bakiye/kredi kontrolü yap

### "API hatası" Mesajı:

- API Key/Password yanlış olabilir
- API servisi down olabilir
- Rate limit aşılmış olabilir

### Otomatik Bildirimler Gitmiyor:

1. WhatsApp ayarlarında `enabled` aktif mi?
2. Otomatik bildirim checkbox'ları işaretli mi?
3. Siparişte telefon numarası var mı?
4. Durum değişikliği doğru mu?

---

## 📊 İstatistikler ve Raporlama

### Günlük İstatistikler:

```
📊 Bugün Gönderilen: 45 mesaj
✅ Başarılı: 42 (%93)
❌ Hatalı: 3 (%7)
```

### Haftalık Rapor:

```
📅 Bu Hafta
Toplam: 315 mesaj
Başarı Oranı: %91
En Çok Gönderilen Mesaj: "Yolda" (125 mesaj)
En Aktif Müşteri: Ahmet Yılmaz (12 mesaj)
```

---

## 🚀 Gelecek Özellikler

- [ ] WhatsApp QR kod takibi
- [ ] Canlı konum paylaşımı
- [ ] Chatbot desteği
- [ ] Ses/Video arama entegrasyonu
- [ ] Medya dosyası gönderimi (PDF, resim)
- [ ] Zamanlı mesaj gönderimi
- [ ] A/B test için farklı şablonlar
- [ ] Gelişmiş analytics ve grafikler

---

## 📞 Destek

Sorunlarınız için:

- 📧 E-posta: support@sekersoft.com
- 💬 GitHub Issues
- 📖 Dokümantasyon: [docs/](../)

---

**Son Güncelleme**: Kasım 2025  
**Versiyon**: 1.0.0  
**Durum**: ✅ Aktif ve Kullanıma Hazır

