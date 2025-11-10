# Sekersoft - Modern Lojistik Yönetim Yazılımı Tanıtım Websitesi

Sekersoft lojistik ve nakliye yönetim yazılımı için modern, glassmorphism tasarımlı tanıtım websitesi.

## 🚀 Özellikler

- ✨ **Modern Tasarım**: Apple tarzı liquid glass (glassmorphism) tasarım
- 🎨 **Tailwind CSS**: Utility-first CSS framework
- ⚡ **Vite**: Hızlı build ve hot reload
- 🎭 **Framer Motion**: Akıcı animasyonlar ve geçişler
- 📱 **Responsive**: Tüm cihazlarda mükemmel görünüm
- 🧭 **React Router**: SPA navigasyon
- 📝 **TypeScript**: Type-safe kod
- 🎯 **React Hook Form**: Form yönetimi
- 🔒 **Güvenli**: Modern güvenlik standartları

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development sunucusunu başlat
npm run dev

# Production build
npm run build

# Build önizleme
npm run preview
```

## 🏗️ Proje Yapısı

```
sekersoft-website/
├── src/
│   ├── components/         # Reusable componentler
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pages/              # Sayfa componentleri
│   │   ├── Home.tsx
│   │   ├── Features.tsx
│   │   ├── Solutions.tsx
│   │   ├── Pricing.tsx
│   │   ├── About.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Demo.tsx
│   │   ├── Resources.tsx
│   │   ├── Contact.tsx
│   │   ├── Blog.tsx
│   │   ├── Support.tsx
│   │   └── legal/
│   │       ├── Privacy.tsx
│   │       ├── Terms.tsx
│   │       ├── KVKK.tsx
│   │       └── CookiePolicy.tsx
│   ├── lib/                # Utility fonksiyonlar
│   │   └── utils.ts
│   ├── App.tsx             # Ana uygulama
│   ├── main.tsx            # Entry point
│   └── index.css           # Global stiller
├── public/                 # Static dosyalar
├── index.html              # HTML template
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 📄 Sayfalar

### Ana Sayfalar
- **Ana Sayfa** (`/`) - Hero, özellikler, istatistikler ve CTA
- **Özellikler** (`/features`) - Detaylı ürün özellikleri
- **Çözümler** (`/solutions`) - Sektöre özel çözümler
- **Fiyatlandırma** (`/pricing`) - Paket seçenekleri ve karşılaştırma
- **Hakkımızda** (`/about`) - Şirket bilgileri ve değerler
- **Referanslar** (`/testimonials`) - Müşteri başarı hikayeleri
- **Demo** (`/demo`) - Ücretsiz demo talep formu
- **Kaynaklar** (`/resources`) - Kılavuzlar ve eğitimler
- **İletişim** (`/contact`) - İletişim formu ve bilgileri
- **Blog** (`/blog`) - Blog yazıları ve haberler
- **Destek** (`/support`) - SSS ve yardım merkezi

### Yasal Sayfalar
- **Gizlilik Politikası** (`/privacy`)
- **Kullanım Koşulları** (`/terms`)
- **KVKK Metni** (`/kvkk`)
- **Çerez Politikası** (`/cookie-policy`)

## 🎨 Tasarım Özellikleri

### Glassmorphism Efektleri
- Yarı saydam arka planlar
- Backdrop blur efektleri
- Yumuşak gölgeler ve kenarlıklar
- Gradient renkler

### Animasyonlar
- Framer Motion ile akıcı geçişler
- Scroll animasyonları
- Hover efektleri
- Loading states

### Renk Paleti
- Primary: Blue (#0ea5e9)
- Secondary: Cyan (#06b6d4)
- Background: Gradient (slate-900 → blue-900 → slate-900)

## 🛠️ Teknolojiler

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animasyonlar
- **React Router DOM** - Routing
- **React Hook Form** - Form yönetimi
- **Lucide React** - İkonlar
- **Headless UI** - Erişilebilir componentler

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Vercel (Önerilen)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# dist klasörünü Netlify'a yükle
```

### Manuel
```bash
npm run build
# dist klasörünü web sunucunuza yükle
```

## 🔧 Özelleştirme

### Renkler
`tailwind.config.js` dosyasından renk paletini özelleştirebilirsiniz.

### Animasyonlar
`tailwind.config.js` içindeki `animation` ve `keyframes` bölümlerini düzenleyin.

### İçerik
Her sayfa componentinde içeriği doğrudan düzenleyebilirsiniz.

## 📝 Lisans

Bu proje Sekersoft Yazılım A.Ş. için geliştirilmiştir.

## 👥 Destek

Sorularınız için: support@sekersoft.com

## 🙏 Teşekkürler

Bu projeyi kullandığınız için teşekkür ederiz!

