import { Link } from 'react-router-dom'
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight 
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Özellikler', path: '/features' },
      { name: 'Çözümler', path: '/solutions' },
      { name: 'Fiyatlandırma', path: '/pricing' },
      { name: 'Demo', path: '/demo' },
    ],
    company: [
      { name: 'Hakkımızda', path: '/about' },
      { name: 'Referanslar', path: '/testimonials' },
      { name: 'Blog', path: '/blog' },
      { name: 'İletişim', path: '/contact' },
    ],
    resources: [
      { name: 'Kaynaklar', path: '/resources' },
      { name: 'Destek', path: '/support' },
      { name: 'Dokümantasyon', path: '/support' },
      { name: 'API', path: '/resources' },
    ],
    legal: [
      { name: 'Gizlilik Politikası', path: '/privacy' },
      { name: 'Kullanım Koşulları', path: '/terms' },
      { name: 'KVKK', path: '/kvkk' },
      { name: 'Çerez Politikası', path: '/cookie-policy' },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ]

  return (
    <footer className="relative mt-20 border-t border-white/10">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-blue-900/10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <div className="w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center">
                <span className="text-2xl font-bold gradient-text">S</span>
              </div>
              <span className="text-xl font-bold gradient-text">Sekersoft</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Taşımacılık işletmeleri için tamamen offline çalışan profesyonel masaüstü yönetim yazılımı.
              Sipariş yönetimi, maliyet hesaplama ve raporlama tek bir uygulamada.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:info@sekersoft.com" className="flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                info@sekersoft.com
              </a>
              <a href="tel:+90XXXXXXXXXX" className="flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                +90 (XXX) XXX XX XX
              </a>
              <div className="flex items-start text-sm text-gray-400">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ürün</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Şirket</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kaynaklar</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Yasal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="glass rounded-2xl p-8 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2 gradient-text">
              Yeniliklerden Haberdar Olun
            </h3>
            <p className="text-gray-400 mb-6">
              En son haberleri, ürün güncellemelerini ve özel teklifleri e-posta ile alın.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 rounded-xl glass border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} Sekersoft. Tüm hakları saklıdır.
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass glass-hover flex items-center justify-center group"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

