# ❓ Sık Sorulan Sorular (FAQ)

Bu dokümanda Sekersoft hakkında en sık sorulan soruların cevaplarını bulabilirsiniz.

## 📦 Genel Sorular

### Sekersoft nedir?

Sekersoft, taşımacılık firmalarının sipariş, gider ve fatura yönetimini kolaylaştıran, tamamen offline çalışan bir masaüstü uygulamasıdır. Windows ve macOS'ta çalışır.

### Sekersoft ücretsiz mi?

Evet! Sekersoft MIT lisansı altında açık kaynak ve ücretsizdir. Kaynak koduna [GitHub'dan](https://github.com/meertseker/logistic-comp-order-tracking-system) erişebilirsiniz.

### Hangi platformlarda çalışır?

- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 10.15 (Catalina) veya üzeri (Intel ve Apple Silicon)

### İnternet bağlantısı gerekli mi?

Hayır! Sekersoft tamamen offline çalışır. İnternet bağlantısı sadece şunlar için gereklidir:
- Otomatik güncelleme kontrolü
- E-posta gönderme
- Lisans aktivasyonu (ilk kurulumda)

### Verilerim nerede saklanır?

Tüm verileriniz bilgisayarınızda yerel olarak SQLite veritabanında saklanır:
- **Windows**: `%APPDATA%\sekersoft\transport.db`
- **macOS**: `~/Library/Application Support/sekersoft/transport.db`

Hiçbir veri buluta veya harici sunuculara gönderilmez.

## 🚀 Kurulum ve Başlangıç

### Nasıl indirebilirim?

[GitHub Releases](https://github.com/meertseker/logistic-comp-order-tracking-system/releases) sayfasından işletim sisteminize uygun dosyayı indirin:
- Windows için: `.exe` installer
- macOS için: `.dmg` (Intel veya Apple Silicon)

### macOS'ta "tanımlanamayan geliştirici" hatası alıyorum

Bu normal bir durumdur çünkü uygulama henüz notarize edilmemiştir. Çözüm:

1. Sistem Tercihleri > Güvenlik ve Gizlilik'i açın
2. "Yine de Aç" düğmesine tıklayın

Alternatif olarak terminalde:
```bash
xattr -cr /Applications/Sekersoft.app
```

### Windows'ta SmartScreen uyarısı alıyorum

Bu normal bir durumdur çünkü uygulama henüz code signing sertifikası ile imzalanmamıştır. Çözüm:

1. "Daha fazla bilgi" bağlantısına tıklayın
2. "Yine de çalıştır" düğmesine tıklayın

## 💾 Veri Yönetimi

### Verilerimi nasıl yedeklerim?

**Otomatik Yedekleme:**
- Sekersoft her gün otomatik olarak veritabanını yedekler
- Yedekler 30 gün boyunca saklanır

**Manuel Yedekleme:**
1. Ayarlar > Yedekleme sayfasına gidin
2. "Yedek Al" düğmesine tıklayın
3. Yedek dosyasını güvenli bir yere kaydedin

### Yedekten nasıl geri yüklerim?

1. Ayarlar > Yedekleme sayfasına gidin
2. "Geri Yükle" düğmesine tıklayın
3. Yedek dosyasını seçin
4. Onaylayın (mevcut veriler üzerine yazılacak!)

### Veritabanım bozuldu, ne yapmalıyım?

1. Uygulamayı kapatın
2. En son yedek dosyasını bulun
3. Uygulamayı açın ve yedekten geri yükleyin
4. Sorun devam ederse: support@seymentransport.com

### Verilerimi başka bir bilgisayara nasıl taşırım?

1. Eski bilgisayarda yedek alın
2. Yeni bilgisayara Sekersoft'ı kurun
3. Yedek dosyasını yeni bilgisayara kopyalayın
4. Yeni bilgisayarda yedekten geri yükleyin

## 🔧 Kullanım Soruları

### Sipariş nasıl oluştururum?

1. Sol menüden "Siparişler"e tıklayın
2. Sağ üstteki "Yeni Sipariş" düğmesine tıklayın
3. Formu doldurun (plaka, müşteri, güzergah, vb.)
4. "Kaydet" düğmesine tıklayın

### Gider nasıl eklerim?

1. Bir siparişin detay sayfasına gidin
2. "Giderler" sekmesine tıklayın
3. "Yeni Gider" düğmesine tıklayın
4. Gider türü ve tutarı girin
5. "Kaydet" düğmesine tıklayın

### Fatura nasıl yüklerim?

1. Bir siparişin detay sayfasına gidin
2. "Faturalar" sekmesine tıklayın
3. "Fatura Yükle" düğmesine tıklayın
4. PDF veya resim dosyasını seçin
5. Yükle

Desteklenen formatlar: PDF, JPG, PNG, JPEG

### Rapor nasıl oluştururum?

1. Sol menüden "Raporlar"a tıklayın
2. Tarih aralığını seçin
3. Rapor türünü seçin (Aylık, Müşteri bazlı, vb.)
4. "Rapor Oluştur" düğmesine tıklayın
5. İsterseniz CSV olarak dışa aktarın

### E-posta ayarlarını nasıl yapılandırırım?

1. Ayarlar > E-posta sayfasına gidin
2. SMTP bilgilerinizi girin:
   - Sunucu adresi
   - Port (genellikle 587 veya 465)
   - Kullanıcı adı
   - Şifre
3. "Test Et" ile bağlantıyı kontrol edin
4. "Kaydet"

**Popüler SMTP Ayarları:**
- Gmail: smtp.gmail.com:587 (App Password gerekli)
- Outlook: smtp.office365.com:587
- Yahoo: smtp.mail.yahoo.com:587

## 🐛 Sorun Giderme

### Uygulama açılmıyor

1. Bilgisayarı yeniden başlatın
2. Uygulamayı yönetici olarak çalıştırmayı deneyin
3. Antivirüs yazılımını geçici olarak devre dışı bırakın
4. Uygulamayı kaldırıp yeniden kurun

### Veritabanı hatası alıyorum

```
Error: database is locked
```

**Çözüm:**
1. Uygulamayı tamamen kapatın
2. Görev yöneticisinde arka planda çalışan Sekersoft işlemlerini kapatın
3. Uygulamayı tekrar açın

### Sipariş silinmiyor

Sipariş silinmez, sadece "iptal" edilir. Bu veri bütünlüğü için yapılmıştır. İptal edilen siparişler:
- Listede gizlenir (filtre ile görebilirsiniz)
- Raporlara dahil edilmez
- Geri getirilebilir

### Fatura yüklenmiyor

**Olası Nedenler:**
- Dosya çok büyük (max 10MB)
- Desteklenmeyen format
- Dosya bozuk

**Çözüm:**
1. Dosya boyutunu kontrol edin
2. PDF/JPG/PNG formatında olduğundan emin olun
3. Dosyayı başka bir yerde açıp açılmadığını kontrol edin

### Güncelleme başarısız oluyor

1. İnternet bağlantınızı kontrol edin
2. Güvenlik duvarı veya antivirüs engel olabilir
3. [GitHub Releases](https://github.com/meertseker/logistic-comp-order-tracking-system/releases) sayfasından manuel indirip kurun

### Uygulama yavaş çalışıyor

**Olası Nedenler:**
- Çok fazla sipariş kaydı
- Büyük fatura dosyaları
- Düşük sistem kaynakları

**Çözümler:**
1. Eski siparişleri arşivleyin
2. Büyük fatura dosyalarını sıkıştırın
3. Bilgisayarı yeniden başlatın
4. Diğer uygulamaları kapatın

## 🔄 Güncelleme

### Nasıl güncelleme yaparım?

Sekersoft otomatik olarak güncellemeleri kontrol eder ve bildirim gösterir:

1. Güncelleme bildirimi geldiğinde "İndir" tıklayın
2. İndirme tamamlandığında "Yükle ve Yeniden Başlat" tıklayın
3. Uygulama kendini güncelleyecek ve yeniden açılacak

**Manuel Güncelleme:**
1. Ayarlar > Hakkında sayfasına gidin
2. "Güncellemeleri Kontrol Et" düğmesine tıklayın

### Otomatik güncellemeyi kapatabilir miyim?

Hayır, güvenlik ve stabilite için otomatik güncelleme zorunludur. Ancak güncellemeyi ne zaman yükleyeceğinize siz karar verirsiniz.

## 🔐 Güvenlik

### Verilerim güvenli mi?

Evet! 
- Tüm veriler yerel olarak saklanır
- Hiçbir veri buluta gönderilmez
- Veritabanı dosya sistemi izinleri ile korunur
- E-posta şifreleri encrypt edilir

### Lisans doğrulama nasıl çalışır?

Sekersoft makine kimliği tabanlı lisans kullanır:
- Her bilgisayar için benzersiz bir kimlik oluşturulur
- Lisans bu kimliğe bağlıdır
- İnternet bağlantısı sadece ilk aktivasyonda gereklidir
- Offline doğrulama yapılır

### Çok faktörlü kimlik doğrulama var mı?

Şu anda yoktur. Gelecek versiyonlarda eklenecektir.

## 💼 İş ve Lisanslama

### Ticari olarak kullanabilir miyim?

Evet! MIT lisansı altında ticari kullanım serbesttir.

### Kaynak kodunu değiştirebilir miyim?

Evet! Açık kaynak bir projedir. Fork edip istediğiniz değişiklikleri yapabilirsiniz.

### Katkıda bulunabilir miyim?

Kesinlikle! [CONTRIBUTING.md](development/CONTRIBUTING.md) dosyasına göz atın.

### Enterprise destek var mı?

Şu anda hayır, ancak yakında eklenecek. İlgileniyorsanız: business@seymentransport.com

## 📱 Diğer Sorular

### Mobil uygulama var mı?

Henüz yok, ancak roadmap'te var. Şu an sadece masaüstü (Windows/macOS) destekleniyor.

### Web versiyonu var mı?

Hayır. Sekersoft offline-first bir masaüstü uygulamasıdır.

### Çoklu kullanıcı desteği var mı?

Henüz yok. Gelecek versiyonlarda eklenecektir.

### Farklı dillerde mevcut mu?

Şu anda sadece Türkçe. Çeviri desteği yakında eklenecek.

### Veritabanını dışa aktarabilir miyim?

Evet! CSV formatında dışa aktarabilirsiniz:
- Siparişler listesinde "Dışa Aktar" düğmesi
- Raporlar sayfasında "CSV İndir"

### Başka bir yazılımdan veri aktarabilir miyim?

Manuel olarak CSV import özelliği yakında gelecek. Şu anda yoktur.

## 🆘 Hala Sorunuz mu Var?

### Destek Kanalları

- 💬 **[GitHub Discussions](https://github.com/meertseker/logistic-comp-order-tracking-system/discussions)** - Topluluk soruları
- 🐛 **[GitHub Issues](https://github.com/meertseker/logistic-comp-order-tracking-system/issues)** - Bug raporları
- 📧 **E-posta:** support@seymentransport.com
- 📚 **[Dokümantasyon](INDEX.md)** - Detaylı kılavuzlar

### Yanıt Süreleri

- GitHub Discussions: 24-48 saat
- E-posta: 24-48 saat (iş günleri)
- Kritik buglar: 12-24 saat

---

**Son Güncelleme:** 2025-01-20

*Bu FAQ sürekli güncellenmektedir. Yeni sorular için lütfen Discussion açın.*

