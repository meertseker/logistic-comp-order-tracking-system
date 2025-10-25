# Kullanım Kılavuzu - Seymen Transport

## İçindekiler

1. [Başlangıç](#başlangıç)
2. [Sipariş Yönetimi](#sipariş-yönetimi)
3. [Gider Takibi](#gider-takibi)
4. [Fatura Yönetimi](#fatura-yönetimi)
5. [Raporlama](#raporlama)
6. [İpuçları ve En İyi Uygulamalar](#ipuçları-ve-en-iyi-uygulamalar)

## Başlangıç

### İlk Açılış

1. Uygulamayı başlatın
2. Ana sayfa (Dashboard) otomatik olarak açılacaktır
3. Boş bir veritabanı ile başlayacaksınız

### Ana Navigasyon

Sol tarafta üç ana menü bulunmaktadır:

- **Ana Sayfa**: Genel bakış ve istatistikler
- **Siparişler**: Sipariş yönetimi
- **Raporlar**: Aylık raporlar ve analizler

## Sipariş Yönetimi

### Yeni Sipariş Oluşturma

1. **"Yeni Sipariş" Butonuna Tıklayın**
   - Ana sayfadan veya Siparişler sayfasından erişebilirsiniz

2. **Zorunlu Bilgileri Doldurun:**
   - **Plaka**: Aracın plaka numarası (örn: 34 ABC 123)
   - **Müşteri Adı**: Siparişi veren kişi/firma
   - **Telefon Numarası**: İletişim numarası
   - **Nereden**: Yükleme noktası
   - **Nereye**: Teslimat noktası
   - **Başlangıç Fiyatı**: Anlaşılan ücret (₺)

3. **İsteğe Bağlı Bilgiler:**
   - **Yük Açıklaması**: Taşınan yükün detayları

4. **"Sipariş Oluştur" Butonuna Tıklayın**
   - Sipariş oluşturulduktan sonra detay sayfasına yönlendirilirsiniz

### Sipariş Listeleme ve Arama

**Filtreleme:**
- Durum filtreleme: Tüm durumlar, Bekliyor, Yolda, Teslim Edildi, vb.

**Arama:**
- Plaka numarasına göre
- Müşteri adına göre
- Telefon numarasına göre

**İşlemler:**
- 👁️ Görüntüle: Sipariş detaylarına git
- 🗑️ Sil: Siparişi sil (dikkatli kullanın!)

### Sipariş Detayları

Her siparişin detay sayfasında:

1. **Sipariş Bilgileri**
   - Tüm sipariş detaylarını görüntüleyin
   - Durum güncelleyin (✏️ ikonu ile)

2. **Finansal Özet**
   - 💚 Gelir: Başlangıç fiyatı
   - 🔴 Toplam Gider: Eklenen tüm giderler
   - 🔵 Net Kazanç: Gelir - Gider

## Gider Takibi

### Gider Ekleme

1. **Sipariş detay sayfasında "Gider Ekle" butonuna tıklayın**

2. **Gider Bilgilerini Girin:**
   - **Gider Türü**: Yakıt, HGS, Köprü, Yemek, Bakım, Diğer
   - **Tutar**: Gider miktarı (₺)
   - **Açıklama**: İsteğe bağlı detay

3. **"Ekle" butonuna tıklayın**

### Gider Türleri

- **Yakıt**: Yakıt masrafları
- **HGS**: Otoyol geçiş ücretleri
- **Köprü**: Köprü geçiş ücretleri
- **Yemek**: Şoför yemek giderleri
- **Bakım**: Araç bakım/onarım
- **Diğer**: Diğer giderler

### Gider Geçmişi

- Tüm giderler sipariş detayında listelenir
- En yeni giderler en üstte görünür
- Her giderin tarihi otomatik kaydedilir
- Hatalı giderleri silebilirsiniz

### Otomatik Hesaplamalar

Sistem otomatik olarak hesaplar:
- Toplam gider
- Net kazanç (Gelir - Gider)
- Aylık toplamlar (raporlarda)

## Fatura Yönetimi

### Fatura Yükleme

1. **Sipariş detayında "Fatura Yükle" butonuna tıklayın**

2. **Dosya Seçin:**
   - Desteklenen formatlar: PDF, JPG, PNG, vb.
   - Maksimum boyut önerisi: 10MB

3. **"Yükle" butonuna tıklayın**
   - Dosya güvenli bir şekilde saklanır
   - Sipariş ile ilişkilendirilir

### Fatura Listeleme

- Tüm faturalar sipariş detayında görünür
- Dosya adı ve yükleme tarihi gösterilir
- Hatalı faturaları silebilirsiniz

### Fatura Depolama

- Faturalar güvenli bir şekilde saklanır:
  ```
  ~/Library/Application Support/seymen-transport/uploads/
  ```
- Her dosya benzersiz isimle kaydedilir
- Manuel yedekleme yapabilirsiniz

## Raporlama

### Aylık Rapor Oluşturma

1. **Raporlar sayfasına gidin**

2. **Dönem Seçin:**
   - Yıl seçin
   - Ay seçin

3. **"Rapor Oluştur" butonuna tıklayın**

### Rapor İçeriği

**Finansal Özet:**
- 💚 Toplam Kazanç
- 🔴 Toplam Masraf
- 🔵 Net Gelir

**Sipariş Durumları:**
- Her durumdan kaç sipariş var

**En Çok Çalışan Araçlar:**
- Plaka bazında
- Sipariş sayısı
- Toplam ve ortalama kazanç

**En Çok Sipariş Veren Müşteriler:**
- Müşteri bazında
- Sipariş sayısı
- Toplam ve ortalama kazanç

### CSV Export

1. **Raporu oluşturduktan sonra "CSV İndir" butonuna tıklayın**

2. **Dosya otomatik olarak indirilir:**
   - Format: `rapor_YYYY_MM.csv`
   - Excel'de açılabilir
   - Arşivleme için ideal

## İpuçları ve En İyi Uygulamalar

### Sipariş Yönetimi

✅ **Yapılması Gerekenler:**
- Her siparişi hemen oluşturduktan sonra durumunu güncelleyin
- Plaka numaralarını standart formatta girin (örn: 34 ABC 123)
- Telefon numaralarını tam olarak kaydedin
- Güzergah bilgilerini net yazın

❌ **Yapılmaması Gerekenler:**
- Sipariş oluşturduktan sonra silmeyin (gerekmedikçe)
- Fiyat bilgisini boş bırakmayın
- Müşteri bilgilerini kısaltmayın

### Gider Takibi

✅ **Yapılması Gerekenler:**
- Giderleri günlük olarak kaydedin
- Doğru gider türünü seçin
- Açıklama alanını kullanın (özellikle "Diğer" için)
- Fişleri fatura olarak yükleyin

❌ **Yapılmaması Gerekenler:**
- Giderleri unutmayın (kar marjı yanlış hesaplanır)
- Yanlış tutar girmeyin (kontrol edin)
- Gereksiz gider eklemeyin

### Fatura Yönetimi

✅ **Yapılması Gerekenler:**
- Tüm önemli belgeleri yükleyin
- Anlamlı dosya isimleri kullanın
- Düzenli olarak yedek alın
- Yüksek çözünürlükte fotoğraf çekin

❌ **Yapılmaması Gerekenler:**
- Çok büyük dosyalar yüklemeyin (performans sorunu)
- Okunaksız fotoğraflar eklemeyin
- Gereksiz dosyalar yüklemeyin

### Raporlama

✅ **Yapılması Gerekenler:**
- Her ay sonunda rapor oluşturun
- CSV export ile yedek alın
- Trendleri takip edin
- En iyi performans gösteren araçları belirleyin

❌ **Yapılmaması Gerekenler:**
- Sadece yıl sonunda rapor bakmayın
- Anomalileri görmezden gelmeyin

### Veri Güvenliği

✅ **Yapılması Gerekenler:**
- Düzenli yedek alın (haftalık önerilir)
- Yedekleri farklı bir yerde saklayın
- Veritabanını manuel olarak kopyalayın

❌ **Yapılmaması Gerekenler:**
- Veritabanı dosyasını manuel olarak düzenlemeyin
- Uygulama çalışırken yedek almayın

### Verimlilik İpuçları

**Hızlı Erişim:**
- Dashboard'dan "Yeni Sipariş" butonu
- Arama fonksiyonunu kullanın (⌘+F benzeri)

**Klavye Kısayolları:**
- Enter tuşu ile form gönderme
- Tab ile alanlar arası geçiş

**Toplu İşlemler:**
- Birden fazla gideri arka arkaya ekleyin
- Faturaları toplu yükleyin

### Sorun Giderme

**Sipariş Kaydedilmiyor:**
- Tüm zorunlu alanları doldurduğunuzdan emin olun
- Fiyat alanına geçerli bir sayı girin

**Fatura Yüklenmiyor:**
- Dosya boyutunu kontrol edin
- Desteklenen format olduğundan emin olun
- İnternet bağlantısı gerekmez (offline çalışır)

**Rapor Boş Görünüyor:**
- Seçilen ayda sipariş olup olmadığını kontrol edin
- Farklı bir ay/yıl deneyin

## Sık Sorulan Sorular

**S: Verilerim nerede saklanıyor?**  
C: Tüm veriler Mac'inizde yerel olarak saklanır. İnternet bağlantısı gerekmez.

**S: Birden fazla kullanıcı kullanabilir mi?**  
C: Şu anda tek kullanıcı için tasarlanmıştır. Gelecek sürümlerde çoklu kullanıcı desteği eklenebilir.

**S: Veritabanı sınırı var mı?**  
C: Pratik olarak sınır yoktur. Binlerce sipariş rahatlıkla yönetilebilir.

**S: Export seçenekleri neler?**  
C: Şu anda CSV export desteklenmektedir. Excel ve PDF export gelecek sürümlerde eklenecektir.

**S: Otomatik yedekleme var mı?**  
C: Şu anda manuel yedekleme yapılmalıdır. Otomatik yedekleme gelecek bir sürümde eklenecektir.

**S: Mobil uygulama var mı?**  
C: Şu anda sadece Mac desktop uygulaması mevcuttur.

---

**Daha fazla yardım için:**
- README.md dosyasına bakın
- INSTALL.md kurulum kılavuzunu okuyun
- support@seymentransport.com adresine yazın

