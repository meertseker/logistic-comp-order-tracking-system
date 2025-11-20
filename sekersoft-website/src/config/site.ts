const fallbackUrl = 'https://www.sekersoft.com'

const normalizeUrl = (url?: string) => {
  if (!url) return fallbackUrl
  return url.endsWith('/') ? url.slice(0, -1) : url
}

const siteUrl = normalizeUrl(import.meta.env.VITE_SITE_URL)

export const siteConfig = {
  name: 'Sekersoft Logistics OS',
  shortName: 'Sekersoft',
  tagline: 'Offline lojistik yönetim yazılımı',
  description: 'Sekersoft Logistics OS, siparişleri, maliyetleri ve araç yönetimini tek panelde toplayan offline lojistik yönetim yazılımıdır.',
  url: siteUrl,
  contact: {
    email: 'info@sekersoft.com',
    phone: '+90 212 909 32 10',
    phoneHref: '+902129093210',
    whatsapp: '+90 544 218 00 00',
    whatsappLink: 'https://wa.me/905442180000',
    address: {
      line1: 'Büyükdere Caddesi No: 201',
      district: 'Şişli',
      city: 'İstanbul',
      country: 'Türkiye',
      postalCode: '34394',
    },
    officeHours: 'Pazartesi - Cuma · 09:00 - 18:00',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/sekersoft',
    instagram: 'https://www.instagram.com/sekersoft',
    facebook: 'https://www.facebook.com/sekersoft',
    twitter: 'https://x.com/sekersoft',
  },
  metadata: {
    defaultTitle: 'Sekersoft Logistics OS · Offline Lojistik Yönetimi',
    defaultDescription: 'Sekersoft, lojistik ve nakliye ekiplerinin sipariş, güzergâh ve maliyet süreçlerini offline olarak yönetmesini sağlar.',
    keywords: [
      'Sekersoft',
      'lojistik yazılımı',
      'nakliye yönetimi',
      'maliyet hesaplama',
      'frota yönetimi',
      'offline lojistik',
      'taşımacılık yazılımı',
      'fatura yönetimi',
    ],
    ogImage: '/screenshots/01-dashboard.png',
  },
  forms: {
    contact: import.meta.env.VITE_CONTACT_FORM_ENDPOINT ?? '',
    demo: import.meta.env.VITE_DEMO_FORM_ENDPOINT ?? '',
    newsletter: import.meta.env.VITE_NEWSLETTER_FORM_ENDPOINT ?? '',
  },
}

export type SiteConfig = typeof siteConfig

