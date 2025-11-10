# Sekersoft - Taşımacılık Yönetim Sistemi

Modern, offline-first masaüstü taşımacılık yönetim uygulaması. Mac bilgisayarlarda çalışmak üzere Electron, React, ve SQLite ile geliştirilmiştir.

## 🚀 Özellikler

### ✅ Sipariş Yönetimi
- Yeni sipariş oluşturma (plaka, müşteri, telefon, güzergah, yük açıklaması, fiyat)
- Sipariş detaylarını görüntüleme ve düzenleme
- Sipariş durumu takibi (Bekliyor, Yolda, Teslim Edildi, Faturalandı, İptal)
- Gelişmiş arama ve filtreleme

### 💰 Gider Takibi
- Sipariş bazlı gider ekleme (Yakıt, HGS, Köprü, Yemek, Bakım, Diğer)
- Otomatik toplam hesaplama
- Gider geçmişi
- Net kazanç analizi

### 📄 Fatura Yönetimi
- PDF ve fotoğraf formatında fatura yükleme
- Sipariş bazlı fatura listeleme
- Güvenli dosya saklama

### 📊 Raporlama
- Aylık kazanç, masraf ve net gelir raporları
- En çok çalışan araçlar analizi
- En çok sipariş veren müşteriler
- Sipariş durumu dağılımı
- CSV export özelliği

### 🎯 Dashboard
- Genel bakış istatistikleri
- Aktif ve tamamlanan sipariş sayıları
- Aylık finansal özet
- Son siparişler listesi

## 🛠️ Teknoloji Stack

| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| Electron | ^33.0.0 | Masaüstü uygulama runtime |
| React | ^19.0.0 | Kullanıcı arayüzü |
| Vite | ^5.4.0 | Build tool ve dev server |
| TypeScript | ^5.5.0 | Tip güvenliği |
| better-sqlite3 | ^12.0.0 | Yerel veritabanı |
| Tailwind CSS | ^3.4.0 | Styling |
| React Router | ^6.27.0 | Navigasyon |
| date-fns | ^4.1.0 | Tarih işlemleri |

## 📋 Gereksinimler

- **Node.js**: 18.x veya üzeri
- **npm**: 9.x veya üzeri
- **macOS**: 10.15 (Catalina) veya üzeri

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Native Modülleri Rebuild Edin

```bash
npm run rebuild
```

## 🎮 Kullanım

### Geliştirme Modu

```bash
npm run electron:dev
```

Bu komut hem Vite dev server'ı hem de Electron uygulamasını başlatır.

### Production Build

```bash
npm run build:mac
```

Bu komut `release` klasöründe Mac için `.dmg` installer oluşturur.

### Sadece Vite Build

```bash
npm run build
```

## 📁 Proje Yapısı

```
seymentransport/
├── electron/                 # Electron ana süreç dosyaları
│   ├── main/
│   │   ├── index.ts         # Ana Electron dosyası
│   │   └── database.ts      # SQLite veritabanı yönetimi
│   └── preload/
│       └── index.ts         # Preload scripti (IPC köprüsü)
├── src/                      # React uygulaması
│   ├── components/          # Yeniden kullanılabilir componentler
│   ├── pages/               # Sayfa componentleri
│   ├── utils/               # Yardımcı fonksiyonlar
│   ├── types/               # TypeScript tip tanımları
│   ├── App.tsx              # Ana uygulama componenti
│   ├── main.tsx             # React giriş noktası
│   └── index.css            # Global stiller
├── package.json             # Proje bağımlılıkları ve scriptler
├── vite.config.ts           # Vite yapılandırması
├── tsconfig.json            # TypeScript yapılandırması
└── tailwind.config.js       # Tailwind CSS yapılandırması
```

## 💾 Veritabanı

Uygulama SQLite kullanarak tamamen offline çalışır. Veritabanı dosyası kullanıcı data klasöründe saklanır:

```
~/Library/Application Support/seymen-transport/transport.db
```

### Tablolar

1. **orders** - Sipariş bilgileri
2. **expenses** - Gider kayıtları
3. **invoices** - Fatura dosya referansları

## 🎨 Kullanıcı Arayüzü

- Modern, responsive tasarım
- Koyu/açık tema desteği için hazır altyapı
- Türkçe dil desteği
- Kullanıcı dostu form validasyonları
- Canlı veri güncellemeleri

## 🔒 Güvenlik

- Context isolation enabled
- Node integration disabled in renderer
- Safe IPC communication via preload script
- File system access sadece izin verilen işlemler için

## 📦 Paketleme

Uygulama electron-builder kullanılarak paketlenir:

```json
{
  "appId": "com.seymen.transport",
  "productName": "Sekersoft",
  "mac": {
    "target": ["dmg"],
    "category": "public.app-category.business"
  }
}
```

## 🐛 Troubleshooting

### SQLite Build Hataları

```bash
npm run rebuild
```

### Port Zaten Kullanımda

Vite dev server varsayılan olarak 5173 portunu kullanır. Değiştirmek için `vite.config.ts` dosyasını düzenleyin.

### Electron Açılmıyor

1. Node modüllerini temizleyin: `rm -rf node_modules`
2. Yeniden yükleyin: `npm install`
3. Rebuild edin: `npm run rebuild`

## 🚧 Gelecek Özellikler

- [ ] Kullanıcı kimlik doğrulama
- [ ] Çoklu kullanıcı desteği
- [ ] Gelişmiş grafik ve charts
- [ ] OCR ile fatura okuma
- [ ] Otomatik yedekleme
- [ ] Export to Excel
- [ ] Yazdırma özellikleri
- [ ] E-posta entegrasyonu
- [ ] WhatsApp bildirimleri

## 📚 Dokümantasyon

Tüm detaylı dokümantasyona **[docs/](docs/)** klasöründen ulaşabilirsiniz.

### Hızlı Erişim

- 🚀 **Kurulum**: [docs/setup/](docs/setup/) - Kurulum ve başlangıç rehberleri
- 📖 **Kullanım**: [docs/user-guide/](docs/user-guide/) - Kullanıcı kılavuzları
- 👨‍💻 **Geliştirici**: [docs/development/](docs/development/) - Geliştirici dokümantasyonu
- 🔒 **Güvenlik**: [docs/security/](docs/security/) - Güvenlik ve lisans bilgileri
- 📊 **Raporlar**: [docs/reports/](docs/reports/) - Proje raporları ve analizler
- 🎯 **Pazarlama**: [docs/marketing/](docs/marketing/) - Pazarlama materyalleri

**Dokümantasyon İndeksi:** [docs/INDEX.md](docs/INDEX.md)

## 📝 Lisans

MIT License - Detaylar için LICENSE dosyasına bakınız.

## 👨‍💻 Geliştirici

Sekersoft ekibi tarafından geliştirilmiştir.

## 🤝 Katkıda Bulunma

Katkıda bulunmak için [docs/development/CONTRIBUTING.md](docs/development/CONTRIBUTING.md) dosyasını inceleyiniz.

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 Destek

Sorularınız için: support@seymentransport.com

---

**Not**: Bu uygulama tamamen offline çalışır ve internet bağlantısı gerektirmez. Tüm veriler yerel olarak Mac bilgisayarda saklanır.

