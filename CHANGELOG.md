# Changelog

Sekersoft projesindeki tüm önemli değişiklikler bu dosyada belgelenecektir.

Format [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) standardına dayanır ve bu proje [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kullanır.

## [Unreleased]

### Planlanıyor
- Kullanıcı kimlik doğrulama sistemi
- Çoklu kullanıcı desteği
- OCR ile fatura okuma
- Excel export özelliği
- Gelişmiş grafik ve charts

## [1.1.8] - 2025-11-21

### 🐛 Fixed (Bug Fixes)
- **Settings Page Crash Fix**
  - Fixed black screen issue when opening Settings page
  - Added error handling for `getCompanyName()` API calls
  - Settings page now gracefully handles missing or unavailable company name API
  
- **Mail Management Page Fix**
  - Fixed missing `Calendar` icon import causing page crash
  - Mail Professional page now loads correctly
  
- **PDF Export Stability**
  - Added error handling for company name retrieval in PDF exports
  - PDF generation now works even if company name API is unavailable
  - All PDF export functions (order, report, email) are now more resilient
  
- **Reports Page Stability**
  - Fixed CSV export crash when company name API is unavailable
  - Added proper error handling for company name retrieval

### 🔧 Changed (Improvements)
- **Error Handling**
  - All `getCompanyName()` calls now use optional chaining and try-catch
  - Default fallback values used when company name cannot be retrieved
  - Better error logging for debugging

## [1.1.7] - 2025-01-22

### ✨ Added (New Features)
- **Multi-tenant Company Branding System**
  - Company name from license registration is now used throughout the application
  - All generated PDFs (orders, reports) display customer's company name
  - All email templates use customer's company name
  - CSV reports include customer's company name
  - Settings default to company name from license activation

### 🔧 Changed (Improvements)
- **Branding Updates**
  - PDF exports now show customer company name instead of "Sekersoft"
  - Email templates display customer company name in headers and footers
  - Reports (PDF and CSV) use customer company name
  - Mail and WhatsApp settings default to company name from license
  - Added "Created with Sekersoft" branding to all emails and reports

### 🐛 Fixed (Bug Fixes)
- Company name is now properly stored in database during license activation
- Mail service now retrieves company name from license (priority) or settings (fallback)
- Settings page now loads company name from license for default values

## [1.1.0] - 2025-01-21

### ✨ Added (New Features)

#### UI/UX Enhancements
- **Figma Design System Integration**
  - Complete Figma design tokens export system
  - Component specifications documentation
  - Design token JSON export functionality
  - Component guide for Figma integration
  - Automated token extraction scripts

- **New Components**
  - `CostCalculator` component for route cost analysis
  - `VehicleSelectCompact` for compact vehicle selection
  - `DesignComponents` showcase page for component library
  - Enhanced `Modal` component with improved animations
  - Improved `RoutePicker` with better UX

- **Screenshot System**
  - Advanced screenshot capture system
  - Component-level screenshot generation
  - Full-page screenshot capabilities
  - Automated screenshot pipeline
  - Screenshot organization and indexing

#### Backend Improvements
- **Enhanced Electron Main Process**
  - Improved IPC communication handlers
  - Better error handling and logging
  - Optimized database operations
  - Enhanced mail service integration
  - Improved WhatsApp service stability

- **Database Utilities**
  - Database clearing script for testing
  - Enhanced seed data scripts
  - Improved test feature enabling

#### Documentation
- **New Documentation Files**
  - Figma Component Guide
  - Figma Design Tokens documentation
  - Video pipeline documentation
  - Enhanced test documentation
  - Code signing guide updates
  - Legacy Mac support documentation

### 🔄 Changed (Improvements)

#### UI Components
- **Layout Component**
  - Major refactoring for better performance
  - Improved responsive design
  - Enhanced navigation structure
  - Better mobile support

- **Create Order Page**
  - Improved form validation
  - Better error handling
  - Enhanced user experience
  - Optimized component structure

- **Order Detail Page**
  - Enhanced display of order information
  - Improved expense tracking UI
  - Better invoice management interface

- **Route Picker Component**
  - Enhanced route selection UI
  - Better route data management
  - Improved validation and error handling

- **Vehicle Select Component**
  - Improved vehicle selection interface
  - Better filtering and search
  - Enhanced display of vehicle information

#### Website Updates
- **Sekersoft Website**
  - Updated screenshot data
  - Enhanced About page
  - Improved Blog page
  - Updated Testimonials page

#### CI/CD
- **GitHub Actions**
  - Updated macOS legacy build workflow
  - Improved build configurations
  - Enhanced artifact management

### 🐛 Fixed (Bug Fixes)
- Fixed line ending issues in various files
- Improved error handling in mail service
- Fixed WhatsApp service integration issues
- Enhanced Uyumsoft integration stability
- Fixed modal component rendering issues
- Improved route picker validation

### 📚 Documentation Updates
- Updated test documentation
- Enhanced quick start guides
- Improved WhatsApp integration docs
- Updated security documentation
- Enhanced setup guides

### 🔧 Technical Improvements
- Updated dependencies
- Improved build scripts
- Enhanced development utilities
- Better code organization
- Improved TypeScript types

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

[Unreleased]: https://github.com/meertseker/logistic-comp-order-tracking-system/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/meertseker/logistic-comp-order-tracking-system/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/meertseker/logistic-comp-order-tracking-system/releases/tag/v1.0.0

