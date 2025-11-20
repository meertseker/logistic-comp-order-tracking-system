import { breadcrumbSchema, contactPageSchema, localBusinessSchema, organizationSchema, websiteSchema } from './schema'
import { siteConfig } from './site'

export type StructuredData = Record<string, unknown> | Record<string, unknown>[]

export interface PageMeta {
  title?: string
  description?: string
  keywords?: string[]
  path?: string
  image?: string
  structuredData?: StructuredData
}

const defaultMeta: PageMeta = {
  title: siteConfig.metadata.defaultTitle,
  description: siteConfig.metadata.defaultDescription,
  keywords: siteConfig.metadata.keywords,
  image: siteConfig.metadata.ogImage,
}

export const pageMeta: Record<string, PageMeta> = {
  default: defaultMeta,
  '/': {
    title: 'Sekersoft Logistics OS · Offline Lojistik Yönetimi',
    description:
      'Sipariş, maliyet, rota ve araç yönetimini aynı panelde toplayan offline lojistik yönetim yazılımı. Tek seferlik lisans, sınırsız sipariş.',
    keywords: [...siteConfig.metadata.keywords, 'logistics dashboard', 'offline erp'],
    image: '/screenshots/01-dashboard.png',
    structuredData: [organizationSchema, websiteSchema, localBusinessSchema],
  },
  '/features': {
    title: 'Özellikler · Sekersoft Logistics OS',
    description: 'Sipariş yönetimi, maliyet hesaplama, güzergâh optimizasyonu ve raporlama özelliklerini yakından inceleyin.',
    image: '/screenshots/04-reports.png',
  },
  '/solutions': {
    title: 'Sektörel Çözümler · Sekersoft Logistics OS',
    description: 'Taşımacılık işletmeleri için özelleştirilmiş iş akışları, maliyet kurguları ve raporlama çözümleri.',
  },
  '/pricing': {
    title: 'Fiyatlandırma · Tek Seferlik Lisans',
    description: 'Başlangıç, Profesyonel ve Kurumsal paketlerle ihtiyaçlarınıza uygun fiyatlandırma seçeneklerini keşfedin.',
  },
  '/about': {
    title: 'Hakkımızda · Sekersoft',
    description: 'Sekersoft’un misyonu, değerleri ve lojistik sektörüne kattığı yenilikler hakkında daha fazla bilgi alın.',
  },
  '/testimonials': {
    title: 'Referanslar · Gerçek Kullanıcı Hikayeleri',
    description: 'Sekersoft kullanarak operasyonlarını büyüten lojistik şirketlerinin deneyimlerini okuyun.',
    image: '/screenshots/99-order-detail.png',
  },
  '/demo': {
    title: 'Demo Talep Edin · 14 Gün Ücretsiz',
    description: 'Uzman ekibimizle 14 günlük demo planlayın, yazılımı kendi verilerinizle test edin.',
  },
  '/resources': {
    title: 'Kaynaklar · Kılavuzlar ve Eğitimler',
    description: 'Kurulum dökümanları, kullanım kılavuzları ve video eğitimleri tek bir sayfada.',
  },
  '/contact': {
    title: 'İletişim · Sekersoft Destek Ekibi',
    description: 'Satış ve destek ekibimizle iletişime geçin, demo planlayın veya teklif alın.',
    structuredData: [contactPageSchema, breadcrumbSchema([{ name: 'Ana Sayfa', path: '/' }, { name: 'İletişim', path: '/contact' }])],
  },
  '/blog': {
    title: 'Blog · Lojistik İçgörüleri',
    description: 'Lojistik operasyonları, maliyet optimizasyonu ve filo yönetimi üzerine güncel makaleler.',
  },
  '/support': {
    title: 'Destek Merkezi · SSS ve Kılavuzlar',
    description: 'Sekersoft kullanıcıları için detaylı SSS, destek kanalları ve kaynaklar.',
  },
  '/privacy': {
    title: 'Gizlilik Politikası · Sekersoft',
    description: 'Kişisel verilerinizi nasıl işlediğimizi ve koruduğumuzu öğrenin.',
  },
  '/terms': {
    title: 'Kullanım Koşulları · Sekersoft',
    description: 'Sekersoft ürün ve hizmetlerini kullanırken geçerli olan kurallar.',
  },
  '/kvkk': {
    title: 'KVKK Aydınlatma Metni · Sekersoft',
    description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki yükümlülüklerimiz.',
  },
  '/cookie-policy': {
    title: 'Çerez Politikası · Sekersoft',
    description: 'Çerezleri nasıl kullandığımız ve nasıl yönetebileceğiniz hakkında bilgi alın.',
  },
  '/solutions/transport': {
    title: 'Taşımacılık Çözümleri · Sekersoft Logistics OS',
    description: 'Nakliye ve taşımacılık operasyonları için süreç optimizasyonu.',
  },
  '*': {
    title: 'Sayfa Bulunamadı · Sekersoft',
    description: 'Aradığınız sayfa taşınmış veya silinmiş olabilir. Lütfen ana sayfaya dönün.',
  },
}

