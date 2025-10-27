# 🔐 Seymen Transport Lisans Sistemi

## Genel Bakış

Seymen Transport uygulaması artık **hardware-based (donanım bazlı)** bir lisans sistemi ile korunmaktadır. Bu sistem, yazılımın yetkisiz kopyalanmasını ve kullanılmasını engeller.

### Güvenlik Özellikleri

✅ **Makine ID Bazlı**: Her bilgisayar için benzersiz bir kimlik oluşturur  
✅ **Şifreli Depolama**: Lisans dosyası AES-256 şifreleme ile korunur  
✅ **Manipülasyon Koruması**: Lisans dosyasının değiştirilmesi tespit edilir  
✅ **Offline Çalışma**: İnternet bağlantısı gerektirmez  
✅ **Kopyalama Koruması**: Lisans başka bilgisayarda çalışmaz  

---

## 📋 Müşteri Perspektifi

### Aktivasyon Süreci

1. **Uygulamayı Açın**: İlk çalıştırmada lisans aktivasyon ekranı görünür
2. **Makine ID'yi Kopyalayın**: Ekranda gösterilen benzersiz Makine ID'yi kopyalayın
3. **Satıcıya Gönderin**: Bu ID'yi size vererek lisans anahtarı isteyin
4. **Lisans Anahtarını Girin**: Aldığınız lisans anahtarını forma girin
5. **Firma Bilgilerini Doldurun**: Firma adı ve e-posta adresi girin
6. **Aktive Et**: "Lisansı Aktive Et" butonuna tıklayın

### Lisans Bilgilerini Görüntüleme

- Dashboard veya Ayarlar sayfasında lisans bilgilerinizi görebilirsiniz
- Aktivasyon tarihi, firma adı ve süre bilgileri gösterilir

---

## 🔧 Satıcı Perspektifi (Sizin İçin)

### Lisans Üretme

Müşterinizden **Makine ID** aldıktan sonra lisans anahtarı üretmek için:

\`\`\`bash
node scripts/generate-license.js "MUSTERI_MAKINE_ID"
\`\`\`

**Örnek:**
\`\`\`bash
node scripts/generate-license.js "abc123def456ghi789jkl012"
\`\`\`

**Çıktı:**
\`\`\`
============================================================
🔑 SEYMEN TRANSPORT - LİSANS ANAHTARI
============================================================

📋 Makine ID:
   abc123def456ghi789jkl012

🎫 Lisans Anahtarı:
   A1B2-C3D4-E5F6-G7H8

============================================================

✅ Lisans anahtarı başarıyla oluşturuldu!
Bu anahtarı müşterinize verebilirsiniz.

💡 Not: Bu lisans anahtarı sadece yukarıdaki Makine ID
   ile çalışır ve başka bilgisayarlarda geçersizdir.
\`\`\`

### Lisans Dağıtımı

1. **Makine ID Alın**: Müşteriden makine ID'sini isteyin
2. **Lisans Üretin**: Yukarıdaki komutu kullanın
3. **Lisans Anahtarını Gönderin**: Oluşan anahtarı müşteriye gönderin
4. **Kayıt Tutun**: Hangi müşteriye hangi lisansı verdiğinizi kaydedin

### Lisans Yönetimi Önerileri

**Kayıt Formatı (Excel/CSV):**
| Firma Adı | E-posta | Makine ID | Lisans Anahtarı | Aktivasyon Tarihi |
|-----------|---------|-----------|-----------------|-------------------|
| Örnek Ltd | ornek@firma.com | abc123... | A1B2-C3D4... | 27.10.2025 |

---

## 🛠️ Teknik Detaylar

### Dosya Yapısı

\`\`\`
electron/main/
  └── license-manager.ts     # Lisans yönetim modülü

scripts/
  └── generate-license.js    # Lisans üretme scripti

src/
  ├── components/
  │   └── LicenseActivation.tsx  # Aktivasyon UI
  └── App.tsx                    # Lisans kontrolü
\`\`\`

### Lisans Dosyası

- **Konum**: \`%APPDATA%/seymen-transport/license.dat\` (Windows)
- **Format**: AES-256 şifreli JSON
- **İçerik**: 
  - Lisans anahtarı
  - Makine ID
  - Firma bilgileri
  - Aktivasyon tarihi
  - Süre bilgisi (opsiyonel)

### Güvenlik Mekanizmaları

1. **Makine ID Kontrolü**: Her başlatmada lisansın makine ID'si ile eşleşip eşleşmediği kontrol edilir
2. **Anahtar Doğrulama**: Lisans anahtarının geçerliliği SHA-256 hash ile doğrulanır
3. **Şifreleme**: Lisans dosyası AES-256-CBC ile şifrelenir
4. **Manipülasyon Koruması**: Dosya değiştirilirse hash uyumsuzluğu tespit edilir

---

## 🔄 Geliştirme ve Test

### Test Modu

Geliştirme sırasında lisans kontrolünü geçici olarak devre dışı bırakmak için \`App.tsx\` dosyasında:

\`\`\`typescript
// Test için geçici olarak lisans kontrolünü atla
const [isLicensed, setIsLicensed] = useState<boolean | null>(true) // false yerine true
\`\`\`

**Önemli**: Production build'de bunu geri alın!

### Kendi Lisansınızı Oluşturun

1. Uygulamayı çalıştırın ve Makine ID'nizi alın
2. Lisans üretin:
   \`\`\`bash
   node scripts/generate-license.js "YOUR_MACHINE_ID"
   \`\`\`
3. Oluşan anahtarı uygulamada aktive edin

---

## 📱 Kullanım Senaryoları

### Senaryo 1: Yeni Müşteri

1. Müşteri uygulamayı indirir ve açar
2. Aktivasyon ekranında Makine ID'yi görür
3. Size Makine ID'yi gönderir
4. Lisans anahtarı üretip müşteriye gönderirsiniz
5. Müşteri lisansı aktive eder

### Senaryo 2: Bilgisayar Değişikliği

Müşteri yeni bir bilgisayara geçerse:
- Eski lisans çalışmaz (farklı Makine ID)
- Yeni bilgisayar için yeni lisans üretmeniz gerekir
- Bu ek ücretlendirme için bir fırsat olabilir

### Senaryo 3: Deneme Sürümü

Süreli lisans vermek isterseniz:

\`\`\`typescript
// license-manager.ts içinde generateLicenseKey fonksiyonuna:
const validDays = 30 // 30 günlük deneme
\`\`\`

Not: Şu an sistem süresiz lisans üretiyor. Süreli lisans için kod değişikliği gerekir.

---

## 🚨 Sorun Giderme

### "Lisans Bulunamadı"
- Lisans henüz aktive edilmemiş
- Lisans dosyası silinmiş olabilir

### "Bu Lisans Başka Bir Bilgisayar İçin"
- Lisans başka bir bilgisayarda üretilmiş
- Doğru Makine ID için yeni lisans üretin

### "Lisans Anahtarı Geçersiz"
- Yanlış anahtar girilmiş
- Makine ID'sine uygun olmayan anahtar

### "Lisans Manipüle Edilmiş"
- Lisans dosyası elle değiştirilmiş
- Yeni aktivasyon gerekli

---

## 🔒 Güvenlik Tavsiyeleri

1. **Şifreleme Anahtarını Değiştirin**: 
   \`license-manager.ts\` içindeki \`ENCRYPTION_KEY\` değerini kendi benzersiz 32 karakterlik anahtarınızla değiştirin

2. **Lisans Scriptini Gizli Tutun**:
   \`scripts/generate-license.js\` dosyasını müşterilerle paylaşmayın

3. **Kayıt Tutun**:
   Verdiğiniz tüm lisansları bir veritabanında/Excel'de saklayın

4. **Build'i Obfuscate Edin** (opsiyonel):
   Daha fazla güvenlik için JavaScript kodunu obfuscate edebilirsiniz

---

## 📝 Lisans Politikası Önerileri

### Fiyatlandırma Örnekleri

- **Tek Bilgisayar**: 1 lisans
- **Çoklu Bilgisayar**: Her bilgisayar için ayrı lisans
- **Deneme Sürümü**: 30 gün ücretsiz (opsiyonel)
- **Yıllık Yenileme**: Her yıl lisans yenileme ücreti

### Kullanım Şartları

1. Lisans kişiye özeldir ve devredilemez
2. Bir lisans yalnızca bir bilgisayarda kullanılabilir
3. Bilgisayar değişiminde yeni lisans gerekir
4. Lisansın yetkisiz paylaşımı yasaktır

---

## 🎯 Sonuç

Bu lisans sistemi ile:
- ✅ Yazılımınız koruma altına alınmıştır
- ✅ Yetkisiz kopyalama engellenmiştir
- ✅ Her müşteri için lisans takibi yapabilirsiniz
- ✅ Ek gelir fırsatları oluşturabilirsiniz (yenileme, ek lisans)

**Not**: Bu sistem %100 kırılamaz değildir, ancak ortalama kullanıcı için yeterli koruma sağlar. Daha gelişmiş koruma için online aktivasyon ve sunucu taraflı doğrulama eklenebilir.

---

## 📞 Destek

Lisans sistemi ile ilgili sorularınız için:
- Kod: \`electron/main/license-manager.ts\`
- UI: \`src/components/LicenseActivation.tsx\`
- Script: \`scripts/generate-license.js\`

**İyi Satışlar! 🚀**

