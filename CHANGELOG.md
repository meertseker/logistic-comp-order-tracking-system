# Changelog

Sekersoft projesindeki tüm önemli değişiklikler bu dosyada belgelenecektir.

Format [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) standardına dayanır ve bu proje [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kullanır.

## [Unreleased]

### Planlanıyor
- Kullanıcı kimlik doğrulama sistemi
- Çoklu kullanıcı desteği
- OCR ile fatura okuma
- Excel export özelliği
- WhatsApp bildirimleri
- Gelişmiş grafik ve charts

## [1.0.0] - 2025-01-20

### 🎉 İlk Stabil Sürüm

### ✨ Eklenenler

#### Temel Özellikler
- **Sipariş Yönetimi**
  - Yeni sipariş oluşturma (plaka, müşteri, telefon, güzergah, yük açıklaması, fiyat)
  - Sipariş detaylarını görüntüleme ve düzenleme
  - Sipariş durumu takibi (Bekliyor, Yolda, Teslim Edildi, Faturalandı, İptal)
  - Gelişmiş arama ve filtreleme
  
- **Gider Takibi**
  - Sipariş bazlı gider ekleme (Yakıt, HGS, Köprü, Yemek, Bakım, Diğer)
  - Otomatik toplam hesaplama
  - Gider geçmişi
  - Net kazanç analizi

- **Fatura Yönetimi**
  - PDF ve fotoğraf formatında fatura yükleme
  - Sipariş bazlı fatura listeleme
  - Güvenli dosya saklama

- **Raporlama**
  - Aylık kazanç, masraf ve net gelir raporları
  - En çok çalışan araçlar analizi
  - En çok sipariş veren müşteriler
  - Sipariş durumu dağılımı
  - CSV export özelliği

- **Dashboard**
  - Genel bakış istatistikleri
  - Aktif ve tamamlanan sipariş sayıları
  - Aylık finansal özet
  - Son siparişler listesi

#### Teknik Özellikler
- **Otomatik Güncelleme**
  - Yeni sürümler için otomatik kontrol
  - Tek tıkla güncelleme
  - Arka planda indirme
  - Güvenli kurulum
  - GitHub Releases entegrasyonu

- **Otomatik Yedekleme**
  - Günlük otomatik veritabanı yedeği
  - Manuel yedekleme seçeneği
  - Yedekten geri yükleme

- **E-posta Entegrasyonu**
  - SMTP ile e-posta gönderme
  - Fatura ve rapor gönderme
  - Şablon sistemi

- **Lisans Yönetimi**
  - Makine bazlı lisans doğrulama
  - Lisans aktivasyonu
  - Deneme sürümü desteği

#### Platform Desteği
- **Windows**
  - Windows 10/11 (64-bit)
  - NSIS installer
  - Portable versiyon
  - Auto-update desteği

- **macOS**
  - macOS 10.15 (Catalina) veya üzeri
  - Intel Macs (x64)
  - Apple Silicon Macs (M1/M2/M3)
  - DMG installer
  - Auto-update desteği

#### CI/CD
- GitHub Actions workflows
- Otomatik build sistemi
- Multi-platform destek
- Artifact storage
- Release automation

### 🛠️ Teknoloji Stack
- Electron ^28.0.0
- React ^18.2.0
- TypeScript ^5.3.0
- Vite ^5.0.0
- better-sqlite3 ^9.2.0
- Tailwind CSS ^3.4.0
- React Router ^6.20.0

### 📚 Dokümantasyon
- Kapsamlı README
- Kullanıcı kılavuzu
- Geliştirici dokümantasyonu
- API dokümantasyonu
- Kurulum rehberleri
- Troubleshooting guides
- Pazarlama materyalleri

### 🔒 Güvenlik
- Context isolation enabled
- Node integration disabled
- Secure IPC communication
- Input validation
- SQL injection koruması
- File system güvenliği

### 🎨 Kullanıcı Arayüzü
- Modern, responsive tasarım
- Türkçe dil desteği
- Intuitive navigasyon
- Form validasyonları
- Loading states
- Error handling
- Success notifications

---

## Versiyon Notasyonu

Projede Semantic Versioning (SemVer) kullanılmaktadır:

- **MAJOR.MINOR.PATCH** (örn: 1.0.0)
- **MAJOR**: Breaking changes (geriye dönük uyumsuz değişiklikler)
- **MINOR**: Yeni özellikler (geriye dönük uyumlu)
- **PATCH**: Bug fixes (geriye dönük uyumlu düzeltmeler)

## Değişiklik Kategorileri

### ✨ Added (Eklenenler)
Yeni özellikler için

### 🔄 Changed (Değişenler)
Mevcut özelliklerdeki değişiklikler için

### ⚠️ Deprecated (Kullanımdan Kaldırılacak)
Yakında kaldırılacak özellikler için

### ❌ Removed (Kaldırılanlar)
Artık mevcut olmayan özellikler için

### 🐛 Fixed (Düzeltilenler)
Bug fix'ler için

### 🔒 Security (Güvenlik)
Güvenlik yamalarında olan açıklar için

---

## İletişim

Önerileriniz ve geri bildirimleriniz için:
- GitHub Issues: https://github.com/meertseker/logistic-comp-order-tracking-system/issues
- E-posta: support@seymentransport.com

[Unreleased]: https://github.com/meertseker/logistic-comp-order-tracking-system/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/meertseker/logistic-comp-order-tracking-system/releases/tag/v1.0.0

