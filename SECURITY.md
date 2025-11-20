# 🔒 Güvenlik Politikası

## Desteklenen Versiyonlar

Şu anda güvenlik güncellemeleri alan Sekersoft versiyonları:

| Versiyon | Destekleniyor          |
| -------- | ---------------------- |
| 1.0.x    | :white_check_mark:     |
| < 1.0    | :x:                    |

## 🐛 Güvenlik Açığı Bildirimi

Sekersoft'ta bir güvenlik açığı keşfettiyseniz, lütfen aşağıdaki adımları izleyin:

### ⚠️ LÜTFEN YAPMAYIN

- ❌ Güvenlik açığını açık bir GitHub Issue olarak **yayınlamayın**
- ❌ Detayları sosyal medyada veya forumlarda **paylaşmayın**
- ❌ Açığı düzeltmeden önce **kamuya ifşa etmeyin**

### ✅ YAPMANIZ GEREKENLER

1. **🔐 Özel Olarak Bildirin**
   
   E-posta gönderin: **security@seymentransport.com**
   
   Konu: `[SECURITY] Kısa açıklama`

2. **📋 Detayları İçerin**

   ```
   - Açığın Türü: (SQL Injection, XSS, CSRF, vb.)
   - Etkilenen Bileşen: (Hangi modül/özellik)
   - Saldırı Vektörü: (Nasıl tetiklenir)
   - Etki: (Ne yapılabilir)
   - Sekersoft Versiyonu: (Hangi versiyon etkileniyor)
   - İşletim Sistemi: (Windows/macOS)
   - Yeniden Üretme Adımları: (Detaylı adımlar)
   - Proof of Concept: (Varsa)
   ```

3. **⏰ Yanıt Süreleri**

   - **İlk Yanıt:** 48 saat içinde
   - **İlk Değerlendirme:** 7 gün içinde
   - **Düzeltme Zamanı:** Ciddiyete göre değişir
     - Kritik: 7-14 gün
     - Yüksek: 30 gün
     - Orta: 60 gün
     - Düşük: 90 gün

## 🎯 Kapsam

### ✅ Dahil Olanlar

- Desktop uygulaması (Electron)
- Veritabanı işlemleri (SQLite)
- Dosya sistemi erişimi
- IPC (Inter-Process Communication)
- Güncelleme mekanizması
- Lisans doğrulama
- E-posta gönderme
- Kullanıcı verisi işleme

### ❌ Kapsam Dışı

- Üçüncü parti bağımlılıklar (bunları ayrı bildirin)
- Sosyal mühendislik saldırıları
- Fiziksel güvenlik
- DoS/DDoS saldırıları
- Spam veya sosyal medya manipülasyonu

## 🏆 Güvenlik Ödülleri

### Hall of Fame

Güvenlik açıklarını sorumlu bir şekilde bildiren araştırmacıları burada onurlandırıyoruz:

<!-- Henüz rapor yok -->
*Burası senin olabilir!* 🌟

### Kabul Kriterleri

Teşekkür listesine dahil olmak için:
- ✅ Gerçek bir güvenlik açığı olmalı
- ✅ Özel olarak bildirilmeli
- ✅ İlk bildiren kişi olmalı
- ✅ Sorumlu ifşa sürecine uyulmalı

## 🔍 Güvenlik En İyi Uygulamaları

### Kullanıcılar İçin

1. **✅ Her Zaman En Son Versiyonu Kullanın**
   - Otomatik güncelleme özelliğini aktif tutun
   - Yeni sürümleri düzenli kontrol edin

2. **🔐 Güvenli Kurulum**
   - Sadece resmi kaynaklardan indirin
     - [GitHub Releases](https://github.com/meertseker/logistic-comp-order-tracking-system/releases)
     - Resmi web sitesi
   - İmzaları doğrulayın (yakında)

3. **💾 Yedekleme**
   - Veritabanınızı düzenli yedekleyin
   - Yedekleri güvenli bir yerde saklayın

4. **🔒 Sistem Güvenliği**
   - İşletim sistemini güncel tutun
   - Antivirüs yazılımı kullanın
   - Güvenlik duvarını aktif tutun

### Geliştiriciler İçin

1. **📝 Güvenli Kod Yazma**
   - Input validation
   - SQL injection koruması (parameterized queries)
   - XSS koruması
   - CSRF token'ları
   - Secure IPC communication

2. **🔍 Kod İnceleme**
   - Tüm PR'lar review edilmeli
   - Güvenlik odaklı inceleme yapın
   - Otomatik tarama araçları kullanın

3. **🔐 Bağımlılık Yönetimi**
   - Dependabot kullanın
   - Düzenli `npm audit` çalıştırın
   - Sadece güvenilir paketler kullanın

## 📚 Güvenlik Kaynakları

### Sekersoft Güvenlik Dökümanları

- [Güvenlik Mimarisi](docs/security/ARCHITECTURE.md)
- [Data Şifreleme](docs/security/ENCRYPTION.md)
- [İzin Yönetimi](docs/security/PERMISSIONS.md)

### Harici Kaynaklar

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 🚨 Bilinen Güvenlik Sorunları

### Aktif

*Şu anda bilinen aktif güvenlik sorunu yok.*

### Çözülen

<!-- Gelecekte çözülen sorunlar burada listelenecek -->

| CVE ID | Açıklama | Ciddiyet | Düzeltilen Versiyon | Tarih |
|--------|----------|----------|---------------------|-------|
| -      | -        | -        | -                   | -     |

## 📞 İletişim

### Güvenlik Ekibi

- **E-posta:** security@seymentransport.com
- **PGP Key:** (Yakında eklenecek)
- **Response Time:** 48 saat

### Diğer İletişim

- **Genel Destek:** support@seymentransport.com
- **GitHub Issues:** Sadece genel konular için
- **Discussions:** Güvenlik dışı sorular için

## 📜 Sorumlu İfşa Politikası

1. **90 Gün Kuralı**
   - Bildiriden 90 gün sonra kamuya açıklama yapılabilir
   - Kritik açıklar için uzatma talep edilebilir

2. **Koordineli İfşa**
   - Birlikte açıklama tarihi belirleriz
   - Bildirene kredi veririz (isterseniz)
   - CVE ID alırız (gerekirse)

3. **İletişim**
   - Süreç boyunca sizi bilgilendiririz
   - Düzeltme ilerlemesini paylaşırız
   - Release notlarında teşekkür ederiz

## ⚖️ Yasal Koruma

Sorumlu ifşa politikamıza uyan güvenlik araştırmacılarına karşı yasal işlem başlatmayacağımızı taahhüt ediyoruz.

Şu şartlarda:
- ✅ Bu politikaya uygun hareket edildiğinde
- ✅ İyi niyet taşındığında
- ✅ Kullanıcı verilerine zarar verilmediğinde
- ✅ Sistemlere zarar verilmediğinde

---

**Son Güncelleme:** 2025-01-20

**Versiyon:** 1.0

**Teşekkürler:** Sekersoft'ı daha güvenli hale getirmeye yardımcı olduğunuz için! 🙏

