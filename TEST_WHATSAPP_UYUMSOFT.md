# 🧪 WhatsApp & Uyumsoft Test Rehberi

Bu rehber, WhatsApp ve Uyumsoft e-fatura özelliklerini **gerçek API olmadan** test etmenizi sağlar.

## 🚀 Hızlı Başlangıç

### 1️⃣ TypeScript Değişikliklerini Derleyin

```bash
npm run build:electron
```

### 2️⃣ Test Özelliklerini Aktifleştirin

```bash
npm run enable-test-features
```

Bu komut:
- ✅ WhatsApp sistemini aktif eder (test API key'leri ile)
- ✅ Uyumsoft sistemini aktif eder (test API key'leri ile)
- ✅ Veritabanına test ayarları yazar

### 3️⃣ Uygulamayı Başlatın

```bash
npm run dev
```

---

## 🎯 Test Edebileceğiniz Özellikler

### 📱 WhatsApp Özellikleri

#### Sipariş Detay Sayfası:
1. Herhangi bir siparişi açın
2. Sağ üstte **"WhatsApp Gönder"** butonu göreceksiniz 🟢
3. Butona tıklayın:
   - WhatsApp modal penceresi açılır
   - Telefon numarası girebilirsiniz
   - Özel mesaj yazabilirsiniz
   - "WhatsApp Gönder" butonuna basın
   
**Sonuç:** API çağrısı başarısız olur (test mode), ama UI ve akış çalışır ✅

#### Siparişler Listesi (Toplu Gönderim):
1. Siparişler sayfasına gidin
2. Birden fazla sipariş seçin (checkbox'lar)
3. Üstte **"WhatsApp (X)"** butonu göreceksiniz
4. Toplu mesaj gönder

**Sonuç:** UI akışını test edebilirsiniz ✅

#### Ayarlar Sayfası:
1. Settings sayfasına gidin
2. **WhatsApp** sekmesine tıklayın
3. Mevcut ayarları göreceksiniz:
   - Provider: İletimerkezi (Test)
   - API Key: TEST_API_KEY
   - Gönderici: +905551234567
4. **"Test Mesajı Gönder"** butonunu deneyin

---

### 🧾 Uyumsoft E-Fatura Özellikleri

#### Sipariş Detay Sayfası:
1. Herhangi bir siparişi açın
2. Sağ üstte **"Faturala"** butonu göreceksiniz 🧾
3. Butona tıklayın:
   - E-Fatura modal penceresi açılır
   - **E-Arşiv** (Bireysel) veya **E-Fatura** (Kurumsal) seçin
   - Müşteri bilgilerini doldurun
   - Fatura detaylarını girin
   - "Fatura Oluştur" butonuna basın

**Sonuç:** API çağrısı başarısız olur (test mode), ama tüm form ve validasyon çalışır ✅

#### E-Fatura Kartı (OrderDetail):
- Sipariş detayında **"🧾 E-Fatura / E-Arşiv Faturaları"** kartını göreceksiniz
- "İlk Faturayı Oluştur" butonu ile fatura oluşturabilirsiniz

#### Ayarlar Sayfası:
1. Settings sayfasına gidin
2. **Uyumsoft** sekmesine tıklayın
3. Mevcut ayarları göreceksiniz:
   - Firma: Test Nakliyat A.Ş.
   - Vergi No: 1234567890
   - Ortam: TEST (sarı badge)
   - Otomatik E-posta: Açık
4. **"API Bağlantısını Test Et"** butonunu deneyin

---

## 📋 Test Checklist

### ✅ WhatsApp UI Testi
- [ ] OrderDetail sayfasında "WhatsApp Gönder" butonu görünüyor
- [ ] WhatsApp modal açılıyor
- [ ] Telefon numarası girişi çalışıyor
- [ ] Mesaj yazma alanı çalışıyor
- [ ] Gönder butonu çalışıyor (API hatası normal)
- [ ] Orders sayfasında toplu seçim ve WhatsApp butonu görünüyor
- [ ] Settings > WhatsApp sekmesi açılıyor ve ayarlar görünüyor

### ✅ Uyumsoft UI Testi
- [ ] OrderDetail sayfasında "Faturala" butonu görünüyor
- [ ] Fatura modal açılıyor
- [ ] E-Arşiv / E-Fatura seçim butonları çalışıyor
- [ ] Form alanları çalışıyor (müşteri adı, vergi no, vb.)
- [ ] KDV hesaplama gösteriliyor
- [ ] "Fatura Oluştur" butonu çalışıyor (API hatası normal)
- [ ] E-Fatura kartı görünüyor
- [ ] Settings > Uyumsoft sekmesi açılıyor ve ayarlar görünüyor

---

## 🔧 Sorun Giderme

### "Butonlar görünmüyor" ise:

1. **Uygulamayı tamamen kapatın** (Ctrl+C ile dev server'ı durdurun)

2. Script'i tekrar çalıştırın:
```bash
npm run enable-test-features
```

3. Uygulamayı yeniden başlatın:
```bash
npm run dev
```

4. Hala görmüyorsanız, database'i kontrol edin:
```bash
# Windows için database yolu:
%APPDATA%\sekersoft-logistics\transport.db
```

### "API hatası" mesajları normaldir!

Test modunda gerçek API yok, bu yüzden:
- ✅ **WhatsApp gönderim başarısız olur** - Bu beklenen davranış
- ✅ **Uyumsoft fatura oluşturma başarısız olur** - Bu beklenen davranış
- ✅ **UI ve akış çalışır** - Bunu test ediyorsunuz!

---

## 🔴 Test Modunu Kapatma

Gerçek API'leri bağlamak istediğinizde:

1. **Settings** sayfasına gidin
2. **WhatsApp** veya **Uyumsoft** sekmesini açın
3. **"Ayarları Değiştir"** butonuna tıklayın
4. Gerçek API bilgilerini girin
5. **"Kaydet"** butonuna basın

---

## 📸 Beklenen Görünüm

### OrderDetail Sayfası Üst Kısım:
```
[◀ Geri]  Sipariş #123  [✅ Teslim Edildi]

[📧 Mail Gönder]  [🟢 WhatsApp Gönder]  [🧾 Faturala]  [📄 PDF İndir]  [✏️ Düzenle]
```

### Settings > WhatsApp Sekmesi:
```
✅ WhatsApp Sistemi Yapılandırıldı

✓ WhatsApp Sistemi Aktif!

Servis: iletimerkezi
Gönderici: +905551234567
Otomatik Bildirimler: Aktif

[Test Mesajı Gönder]  [Ayarları Değiştir]
```

### Settings > Uyumsoft Sekmesi:
```
✅ Uyumsoft E-Fatura Sistemi Yapılandırıldı

✓ E-Fatura Sistemi Aktif!

Firma: Test Nakliyat A.Ş.
Vergi No: 1234567890
Ortam: [TEST]
Otomatik E-posta: Açık

[API Bağlantısını Test Et]  [Ayarları Düzenle]
```

---

## 💡 İpuçları

1. **Console'u açık tutun** (F12) - API hatalarını ve log'ları görebilirsiniz
2. **Network tab'ı izleyin** - IPC çağrılarını görebilirsiniz
3. **Test için örnek sipariş oluşturun** - Daha kolay test edersiniz
4. **Her özelliği tek tek test edin** - Hangi kısım çalışıyor, hangisi çalışmıyor görebilirsiniz

---

## ✨ Sonraki Adım: Gerçek API'leri Bağlama

Test ettikten sonra, gerçek API'leri bağlamak için:

### WhatsApp API Seçenekleri:
1. **İletimerkezi** - https://www.iletimerkezi.com
2. **NetGSM** - https://www.netgsm.com.tr
3. **Twilio** - https://www.twilio.com (Uluslararası)

### Uyumsoft E-Fatura:
1. **Uyumsoft'tan hesap açın** - https://www.uyumsoft.com.tr
2. **Test ortamı API key alın**
3. **Test faturası oluşturun**
4. **Canlı ortama geçin** (hazır olduğunuzda)

---

## 🎉 Tamamlandı!

Artık WhatsApp ve Uyumsoft özelliklerini UI seviyesinde test edebilirsiniz.
Gerçek API'leri bağladığınızda, tüm sistem çalışmaya hazır!

**Sorular?** README.md dosyasına bakın veya issue açın.

