# 🚀 Quick Start: WhatsApp & Uyumsoft Test

## ✅ Tamamlanan İşlemler

### 1. TypeScript Type Definitions Eklendi
- WhatsApp API tipleri eklendi ✅
- Geliştirme araçları API'si eklendi ✅

### 2. Test Mode IPC Handler Oluşturuldu  
- Backend'de `dev:enableTestMode` handler'ı eklendi ✅
- Preload bridge'de expose edildi ✅

### 3. UI'a Test Mode Butonu Eklendi
- Settings > System > "Geliştirici Araçları" kartı ✅
- "Test Modunu Aktifleştir" butonu eklendi ✅

### 4. Build Tamamlandı
- Electron main & preload build ✅
- Vite renderer build ✅

---

## 🎯 Test Etmek İçin Şimdi Yapmanız Gerekenler

### Adım 1: Uygulamayı Başlatın
```bash
npm run dev
```

### Adım 2: Settings Sayfasına Gidin
1. Sol menüden **"Settings"** (⚙️) sekmesine tıklayın
2. Üst menüden **"System"** (💻) tab'ına tıklayın  
3. En altta **"🧪 Geliştirici Araçları"** kartını göreceksiniz

### Adım 3: Test Modunu Aktifleştirin
1. **"Test Modunu Aktifleştir"** butonuna tıklayın (mor renk)
2. "Test modu aktif edildi! Lütfen uygulamayı yeniden başlatın." mesajını göreceksiniz
3. Sayfa otomatik olarak 2 saniye sonra yeniden yüklenecek

### Adım 4: Özellikleri Test Edin

#### 📱 WhatsApp Test:
1. Herhangi bir **sipariş detay** sayfasına gidin
2. Sağ üstte **"🟢 WhatsApp Gönder"** butonunu göreceksiniz
3. Butona tıklayın, modal açılacak
4. Test telefon numarası girin (örn: +905551234567)
5. "WhatsApp Gönder" butonuna basın
6. **Beklenen:** API hatası (normal) ama UI çalışıyor ✅

#### 🧾 Uyumsoft Test:
1. Herhangi bir **sipariş detay** sayfasına gidin
2. Sağ üstte **"🧾 Faturala"** butonunu göreceksiniz
3. Butona tıklayın, fatura modal'ı açılacak
4. E-Arşiv veya E-Fatura seçin
5. Müşteri bilgilerini doldurun
6. "Fatura Oluştur" butonuna basın
7. **Beklenen:** API hatası (normal) ama tüm form çalışıyor ✅

#### ⚙️ Ayarları Kontrol:
1. **Settings > WhatsApp** tab'ına gidin
   - "✅ WhatsApp Sistemi Yapılandırıldı" kartını göreceksiniz
   - Provider: İletimerkezi (Test)
   - API Key: TEST_API_KEY
   - Test butonu çalışıyor

2. **Settings > Uyumsoft** tab'ına gidin
   - "✅ Uyumsoft E-Fatura Sistemi Yapılandırıldı" kartını göreceksiniz
   - Firma: Test Nakliyat A.Ş.
   - Vergi No: 1234567890
   - Environment: TEST (sarı badge)
   - Test butonu çalışıyor

---

## 🎨 Beklenen Görünüm

### Sipariş Detay Sayfası (Üst Butonlar):
```
╔════════════════════════════════════════════════════════════╗
║ [◀ Geri]  Sipariş #123  [✅ Teslim Edildi]                ║
║                                                            ║
║ [📧 Mail]  [🟢 WhatsApp]  [🧾 Faturala]  [📄 PDF]  [✏️]  ║
╚════════════════════════════════════════════════════════════╝
```

### Settings > System > Geliştirici Araçları:
```
╔════════════════════════════════════════════════════════════╗
║  🧪 Geliştirici Araçları                                  ║
║  Test ve debugging özellikleri                            ║
║                                                            ║
║  💬 WhatsApp & Uyumsoft Test Modu                         ║
║  UI'ı test etmek için özellikleri gerçek API olmadan     ║
║  aktifleştirin                                             ║
║                                                            ║
║  ✅ Test modunda neler aktifleşir:                        ║
║    • WhatsApp "Mesaj Gönder" butonları                    ║
║    • Uyumsoft "Faturala" butonları                        ║
║    • Ayarlar sayfasında test bilgileri                    ║
║    • Tüm modal ve form UI'ları                            ║
║                                                            ║
║  ⚠️ API çağrıları başarısız olur (test verisi)           ║
║                                                            ║
║  [ 💬 Test Modunu Aktifleştir ]  (mor buton)             ║
╚════════════════════════════════════════════════════════════╝
```

---

## ❓ Sorun Giderme

### Problem: "Geliştirici Araçları" kartı görünmüyor
**Çözüm:**
1. Electron build'i yeniden yapın: `npm run build:electron`
2. Uygulamayı kapatıp yeniden başlatın: `npm run dev`

### Problem: Test modu butonu çalışmıyor
**Çözüm:**
1. Console'u açın (F12)
2. Hata mesajına bakın
3. Database yolunu kontrol edin: `%APPDATA%\sekersoft-logistics\transport.db`

### Problem: WhatsApp/Uyumsoft butonları görünmüyor
**Çözüm:**
1. Settings > System'e gidin
2. "Test Modunu Aktifleştir" butonuna tekrar basın
3. Sayfayı yenileyin (F5)
4. Sipariş detay sayfasına geri dönün

### Problem: "API hatası" alıyorum
**Bu normaldir!** Test modunda gerçek API yok:
- ✅ UI çalışıyor = Başarılı
- ❌ API hatası = Beklenen davranış
- 🎯 Amacımız UI'ı test etmek

---

## 📊 Test Checklist

### ✅ Build ve Başlatma
- [x] Electron build başarılı
- [x] Renderer build başarılı  
- [ ] Uygulama başlatıldı (`npm run dev`)

### ✅ Test Modu Aktivasyonu
- [ ] Settings > System sayfası açıldı
- [ ] "Geliştirici Araçları" kartı görünüyor
- [ ] "Test Modunu Aktifleştir" butonuna basıldı
- [ ] Başarı mesajı alındı
- [ ] Sayfa yeniden yüklendi

### ✅ WhatsApp UI Testi
- [ ] Sipariş detayda "WhatsApp Gönder" butonu görünüyor
- [ ] WhatsApp modal açılıyor
- [ ] Telefon input çalışıyor
- [ ] Mesaj textarea çalışıyor
- [ ] "Gönder" butonu çalışıyor
- [ ] Settings > WhatsApp ayarları görünüyor

### ✅ Uyumsoft UI Testi
- [ ] Sipariş detayda "Faturala" butonu görünüyor
- [ ] Fatura modal açılıyor
- [ ] E-Arşiv/E-Fatura seçimi çalışıyor
- [ ] Form alanları çalışıyor
- [ ] KDV hesaplama görünüyor
- [ ] "Fatura Oluştur" butonu çalışıyor
- [ ] Settings > Uyumsoft ayarları görünüyor
- [ ] E-Fatura kartı (order detail) görünüyor

---

## 🔄 Test Modunu Kapatma

Test sonrasında gerçek API'lere geçmek için:

1. **Settings > WhatsApp** veya **Uyumsoft** sekmesine gidin
2. **"Ayarları Değiştir"** butonuna tıklayın
3. Gerçek API credentials'ları girin
4. **"Kaydet"** butonuna basın
5. **"Test Et"** butonuyla doğrulayın

---

## 🎉 Başarı!

Eğer yukarıdaki checklistteki tüm maddeleri işaretleyebildiyseniz:
- ✅ UI implementasyonu **%100 çalışıyor**
- ✅ Backend services **hazır**
- ✅ Database schema **tamamlanmış**
- ✅ IPC handlers **aktif**
- 🚀 Gerçek API'leri bağlamaya **HAZIRSINIZ**

---

## 📚 Daha Fazla Bilgi

- **Detaylı Test Rehberi:** `TEST_WHATSAPP_UYUMSOFT.md`
- **API Dokümantasyonu:** `docs/features/WHATSAPP_SYSTEM.md`
- **Kurulum Tamamı:** `WHATSAPP_IMPLEMENTATION_COMPLETE.md`

## 🆘 Hala Çalışmıyor mu?

1. **Database'i manuel kontrol edin:**
   - Konum: `%APPDATA%\sekersoft-logistics\transport.db`
   - SQL dosyasını çalıştırın: `scripts/enable-test-features-simple.sql`

2. **Console loglarına bakın:**
   - F12 ile DevTools'u açın
   - Console tab'ına bakın
   - Kırmızı hatalar varsa paylaşın

3. **Uygulamayı tamamen yeniden başlatın:**
   ```bash
   # Dev server'ı durdurun (Ctrl+C)
   npm run dev  # Yeniden başlatın
   ```

**İyi testler! 🚀**



