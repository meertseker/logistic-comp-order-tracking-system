import { motion } from 'framer-motion'
import { Check, HelpCircle, Shield, Download, Headphones, RefreshCw, Award, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const Pricing = () => {
  const plans = [
    {
      name: 'Tek Lisans',
      description: 'Tek kullanıcı için ideal',
      price: null, // İletişime göre
      features: [
        { text: 'Tek bilgisayar lisansı', included: true },
        { text: 'Sınırsız sipariş yönetimi', included: true },
        { text: 'Çoklu araç desteği', included: true },
        { text: 'Tam özellikli maliyet sistemi', included: true },
        { text: 'Raporlama ve analiz', included: true },
        { text: 'Email desteği', included: true },
        { text: 'Ücretsiz güncellemeler (1 yıl)', included: true },
        { text: 'Windows & macOS desteği', included: true },
      ],
      popular: false,
      cta: 'Fiyat Teklifi Al',
      ctaLink: '/contact'
    },
    {
      name: 'Küçük İşletme',
      description: '2-5 bilgisayar için',
      price: null,
      features: [
        { text: '2-5 bilgisayar lisansı', included: true },
        { text: 'Tüm Tek Lisans özellikleri', included: true },
        { text: 'Öncelikli email desteği', included: true },
        { text: 'Ücretsiz güncellemeler (1 yıl)', included: true },
        { text: 'Kurulum desteği', included: true },
        { text: 'Veri transfer yardımı', included: true },
        { text: 'Telefon desteği', included: true },
        { text: 'İndirimli lisans fiyatı', included: true },
      ],
      popular: true,
      cta: 'Fiyat Teklifi Al',
      ctaLink: '/contact'
    },
    {
      name: 'Kurumsal',
      description: '6+ bilgisayar için',
      price: null,
      customPrice: true,
      features: [
        { text: '6+ bilgisayar lisansı', included: true },
        { text: 'Tüm özellikler dahil', included: true },
        { text: 'Öncelikli telefon desteği', included: true },
        { text: 'Uzaktan kurulum', included: true },
        { text: 'Özel eğitim programı', included: true },
        { text: 'Veri migrasyonu', included: true },
        { text: 'Esnek ödeme seçenekleri', included: true },
        { text: 'Özel lisans anlaşması', included: true },
      ],
      popular: false,
      cta: 'Teklif Al',
      ctaLink: '/contact'
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Tek Seferlik Ödeme',
      description: 'Aylık veya yıllık abonelik yok. Bir kez satın alın, süresiz kullanın.'
    },
    {
      icon: Download,
      title: 'Offline Kullanım',
      description: 'İnternet bağlantısı gerektirmez. Tüm veriler bilgisayarınızda güvende.'
    },
    {
      icon: RefreshCw,
      title: 'Ücretsiz Güncellemeler',
      description: 'İlk yıl tüm güncellemeler ücretsiz. Sonrasında isteğe bağlı destek paketi.'
    },
    {
      icon: Headphones,
      title: 'Teknik Destek',
      description: 'Email ve telefon desteği. Kurulum ve kullanım konusunda yardım.'
    },
  ]

  const included = [
    'Sipariş yönetimi',
    'Profesyonel maliyet hesaplama',
    'Araç yönetimi',
    'Güzergah yönetimi',
    'Gider takibi',
    'Fatura yönetimi',
    'Gelişmiş raporlama',
    'Dashboard & İstatistikler',
    'Veri export (JSON, CSV, DB)',
    'Email entegrasyonu',
    'Yedekleme sistemi',
    'Türkçe arayüz'
  ]

  const faqs = [
    {
      question: 'Lisans modeli nasıl çalışıyor?',
      answer: 'Sekersoft tek seferlik lisans satın alarak kullanabileceğiniz bir masaüstü uygulamadır. Aylık veya yıllık abonelik yoktur. Bir kez satın alın, süresiz kullanın.'
    },
    {
      question: 'Deneme sürümü var mı?',
      answer: 'Evet! Demo talep ederek tüm özellikleri test edebilirsiniz. Satın alma kararını vermeden önce yazılımı denemek için bizimle iletişime geçin.'
    },
    {
      question: 'Hangi işletim sistemlerinde çalışır?',
      answer: 'Sekersoft hem Windows (Windows 10 ve üzeri) hem de macOS (10.15 Catalina ve üzeri) işletim sistemlerinde çalışır.'
    },
    {
      question: 'İnternet bağlantısı gerekli mi?',
      answer: 'Hayır! Sekersoft tamamen offline çalışır. İnternet bağlantısına ihtiyaç duymazsınız. Tüm verileriniz bilgisayarınızda güvenle saklanır.'
    },
    {
      question: 'Birden fazla bilgisayarda kullanabilir miyim?',
      answer: 'Her lisans bir bilgisayar için geçerlidir. Birden fazla bilgisayarda kullanmak için çoklu lisans paketlerimizden yararlanabilirsiniz.'
    },
    {
      question: 'Güncellemeler ücretli mi?',
      answer: 'İlk yıl tüm güncellemeler ücretsizdir. Sonrasında isteğe bağlı yıllık destek ve güncelleme paketi satın alabilirsiniz.'
    },
    {
      question: 'Verilerim güvende mi?',
      answer: 'Kesinlikle! Tüm verileriniz sadece kendi bilgisayarınızda saklanır. Hiçbir veri internete gönderilmez. Siz kontrol edersiniz.'
    },
    {
      question: 'Kurulum desteği sağlanıyor mu?',
      answer: 'Evet! Tüm paketlerde kurulum desteği sunuyoruz. Gerekirse uzaktan bağlanarak kurulumu yapıyoruz.'
    },
    {
      question: 'İade politikanız nedir?',
      answer: 'Satın aldıktan sonra 14 gün içinde herhangi bir nedenle iade edebilirsiniz. Sorulsuz sualsiz iade garantisi.'
    },
    {
      question: 'Toplu lisans indirimi var mı?',
      answer: 'Evet! 2 veya daha fazla lisans alımlarında indirimli fiyatlandırma sunuyoruz. Detaylar için bizimle iletişime geçin.'
    }
  ]

  const comparison = [
    { feature: 'Subscription Model', competitor: 'Aylık/Yıllık Ödeme', sekersoft: 'Tek Seferlik' },
    { feature: 'Internet Gereksinimi', competitor: 'Zorunlu', sekersoft: 'Gerektirmez' },
    { feature: 'Veri Saklama', competitor: 'Bulut (Güvenlik riski)', sekersoft: 'Lokal (Güvenli)' },
    { feature: 'Maliyet (5 Yıl)', competitor: '~50.000 ₺', sekersoft: 'Tek Ödeme' },
    { feature: 'Gizlilik', competitor: 'Şüpheli', sekersoft: '%100 Garantili' }
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Tek Seferlik Lisans - Aylık Ödeme Yok</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Şeffaf <span className="gradient-text">Fiyatlandırma</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Abonelik yok, gizli maliyet yok. Bir kez satın alın, süresiz kullanın. 
            Tüm verileriniz bilgisayarınızda, tamamen güvende.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-400">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative glass rounded-3xl p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />
                    En Popüler
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-8">
                <p className="text-3xl font-bold gradient-text mb-2">İletişime Geçin</p>
                <p className="text-gray-400 text-sm">Size özel fiyat teklifi</p>
              </div>

              <Link
                to={plan.ctaLink}
                className={`block w-full py-3 rounded-xl text-center font-semibold transition-all hover:scale-105 mb-8 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                    : 'glass glass-hover'
                }`}
              >
                {plan.cta}
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature.text} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 md:p-12 mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Tüm Paketlerde <span className="gradient-text">Dahil</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Sekersoft vs <span className="gradient-text">Diğer Çözümler</span>
          </h2>
          <div className="glass rounded-3xl p-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Özellik</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Diğer Çözümler</th>
                  <th className="text-center py-4 px-4 text-blue-400 font-semibold">Sekersoft</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, index) => (
                  <tr key={row.feature} className={index !== comparison.length - 1 ? 'border-b border-white/5' : ''}>
                    <td className="py-4 px-4 text-gray-300">{row.feature}</td>
                    <td className="text-center py-4 px-4 text-gray-400">{row.competitor}</td>
                    <td className="text-center py-4 px-4 text-green-400 font-semibold">{row.sekersoft}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Sıkça Sorulan <span className="gradient-text">Sorular</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl p-6 glass-hover"
              >
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="glass rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">
              Fiyat Teklifi Alın
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              İhtiyaçlarınıza özel fiyat teklifi için bizimle iletişime geçin. 
              Size en uygun paketi birlikte belirleyelim.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105"
              >
                İletişime Geçin
              </Link>
              <Link
                to="/demo"
                className="px-8 py-4 rounded-xl glass glass-hover font-semibold transition-all hover:scale-105"
              >
                Demo Talep Et
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Pricing
