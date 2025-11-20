import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Truck, 
  Package, 
  MapPin, 
  BarChart3, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react'
import { screenshotPaths } from '../data/screenshots'

const Home = () => {
  const features = [
    {
      icon: Package,
      title: 'Sipariş Yönetimi',
      description: 'Tüm siparişlerinizi dijital ortamda kolayca oluşturun, takip edin ve yönetin.',
      accent: {
        bg: 'linear-gradient(135deg, rgba(10,132,255,0.22), rgba(123,97,255,0.18))',
        shadow: '0 15px 40px rgba(10,132,255,0.18)'
      }
    },
    {
      icon: BarChart3,
      title: 'Otomatik Maliyet Hesaplama',
      description: 'Her siparişin gerçek maliyetini otomatik hesaplayın. Yakıt, sürücü, bakım, yol giderleri dahil.',
      accent: {
        bg: 'linear-gradient(135deg, rgba(100,210,255,0.22), rgba(44,217,197,0.25))',
        shadow: '0 15px 40px rgba(44,217,197,0.2)'
      }
    },
    {
      icon: Truck,
      title: 'Araç & Güzergah Yönetimi',
      description: 'Her aracın maliyet profilini kaydedin. Sık kullandığınız güzergahları yönetin.',
      accent: {
        bg: 'linear-gradient(135deg, rgba(255,176,32,0.25), rgba(255,90,120,0.2))',
        shadow: '0 15px 40px rgba(255,176,32,0.2)'
      }
    },
    {
      icon: MapPin,
      title: 'Gelişmiş Raporlama',
      description: 'Detaylı finansal raporlar, araç performansı ve müşteri analizleri.',
      accent: {
        bg: 'linear-gradient(135deg, rgba(123,97,255,0.25), rgba(10,132,255,0.18))',
        shadow: '0 15px 40px rgba(123,97,255,0.18)'
      }
    },
  ]

  const stats = [
    { icon: Package, value: 'Sınırsız', label: 'Sipariş Yönetimi', accent: 'rgba(10,132,255,0.12)', border: 'rgba(10,132,255,0.35)' },
    { icon: Truck, value: 'Çoklu', label: 'Araç Desteği', accent: 'rgba(44,217,197,0.12)', border: 'rgba(44,217,197,0.35)' },
    { icon: Shield, value: '%100', label: 'Offline Çalışma', accent: 'rgba(255,176,32,0.12)', border: 'rgba(255,176,32,0.35)' },
    { icon: BarChart3, value: 'Detaylı', label: 'Raporlama', accent: 'rgba(123,97,255,0.12)', border: 'rgba(123,97,255,0.35)' },
  ]

  const benefits = [
    'Tamamen offline çalışır - İnternet bağlantısı gerektirmez',
    'Profesyonel maliyet hesaplama sistemi',
    'Tüm verileriniz bilgisayarınızda güvenle saklanır',
    'Windows ve macOS desteği',
    'Kağıt işlemlere son - Her şey dijital',
    'Tek seferlik lisans - Aylık ödeme yok',
  ]

  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      role: 'Nakliye İşletmecisi',
      content: 'Artık hangi siparişin ne kadar karlı olduğunu görebiliyorum. Maliyet hesaplaması otomatik oluyor, çok zaman kazandırıyor.',
      rating: 5,
    },
    {
      name: 'Mehmet Demir',
      role: 'Taşımacılık Sahibi',
      content: 'Ay sonunda muhasebe için rapor hazırlamak artık kâbus değil. Tek tıkla tüm veriler hazır.',
      rating: 5,
    },
    {
      name: 'Zeynep Kaya',
      role: 'Filo Yöneticisi',
      content: 'Her aracın ne kadar kar getirdiğini görebiliyorum. Gizli maliyetleri fark etmek çok önemliymiş.',
      rating: 5,
    },
  ]

  const personas = [
    {
      title: 'Operasyon Ustası',
      subtitle: '1-5 araç · Mikro işletme',
      pain: 'Excel’de kaybolan masraf kalemleri',
      value: 'Başlangıç Paketi · 49.900 TL',
    },
    {
      title: 'Filo Koordinatörü',
      subtitle: '6-20 araç · KOBİ',
      pain: 'Araç kârlılığını ve şoför primini göremiyor',
      value: 'Profesyonel Paket · 99.000 TL',
    },
    {
      title: 'Lojistik Direktörü',
      subtitle: '40+ araç · Kurumsal',
      pain: 'ERP’ye entegre offline operasyon',
      value: 'Kurumsal Paket · 250.000 TL+',
    },
  ]

  const appScreens = [
    {
      title: 'Kontrol Paneli',
      description: 'Tüm istatistikler ve KPI’ları tek ekranda görün.',
      image: screenshotPaths.dashboard
    },
    {
      title: 'Sipariş Oluşturma',
      description: 'Yükleme, gider ve rota bilgilerini dakikalar içinde kaydedin.',
      image: screenshotPaths.createOrder
    },
    {
      title: 'Maliyet Analizi',
      description: 'Expense Calculator ile sefer bazlı net kâra inin.',
      image: '/expense-calculator.png'
    },
    {
      title: 'Filo Yönetimi',
      description: 'Araç kartları, bakım tarihleri ve aktif durum takibi.',
      image: screenshotPaths.vehicles
    }
  ]

  const greetingGradient = 'linear-gradient(135deg, #0A84FF 0%, #30D158 100%)'
  const greetingGradientSoft = 'linear-gradient(135deg, rgba(10,132,255,0.25), rgba(48,209,88,0.25))'

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(10,132,255,0.4), rgba(3,5,12,0))'
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[26rem] h-[26rem] rounded-full blur-3xl animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(44,217,197,0.35), rgba(3,5,12,0))',
              animationDelay: '2s'
            }}
          />
          <div
            className="absolute top-10 right-1/4 w-80 h-80 rounded-full blur-3xl animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(123,97,255,0.28), rgba(3,5,12,0))',
              animationDelay: '3.5s'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass mb-6 border border-white/10"
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-gray-300">
                Sekersoft Logistics OS · Offline + Tek Lisans
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Taşımacılık Operasyonlarınızı
              <br />
              <span className="gradient-text">Kontrol Panelinden Yönetin</span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Tek seferlik lisanslı Sekersoft masaüstü uygulamasıyla sipariş, güzergâh ve maliyetleri aynı yerde gör.
              İnternet şartı yok, veriler şirket içinde kalır, dashboard deneyimi web ve uygulamada birebir.
            </p>

            <div className="inline-flex flex-col items-center gap-1 glass rounded-2xl px-6 py-4 mb-10">
              <p className="text-sm text-gray-400 uppercase tracking-wide">Tek seferlik lisans</p>
              <p className="text-3xl font-semibold text-white">49.900 TL + KDV'den başlayan fiyatlarla</p>
              <p className="text-xs text-gray-500">İlk yıl güncellemeler ve uzaktan kurulum dahildir.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/demo"
                className="group px-8 py-4 rounded-2xl text-white font-semibold shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105 hover:opacity-95 flex items-center justify-center gap-2"
                style={{ backgroundImage: greetingGradient }}
              >
                14 Günlük Demo Aç
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/features"
                className="px-8 py-4 rounded-2xl glass glass-hover font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 border border-white/10"
              >
                Özellikleri Keşfet
              </Link>
            </div>
          </motion.div>

          {/* Hero Image/Demo */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="glass rounded-3xl p-4 shadow-2xl shadow-blue-500/10">
                <div
                  className="aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/40"
                >
                <img
                    src={screenshotPaths.dashboard}
                  alt="Sekersoft lojistik yönetim paneli"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -left-6 glass rounded-2xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Otomatik Hesaplama</p>
                  <p className="text-xs text-gray-400">Maliyet Sistemi</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-6 -right-6 glass rounded-2xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">%100 Offline</p>
                  <p className="text-xs text-gray-400">İnternet Gerektirmez</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 text-center glass-hover"
                style={{
                  background: `linear-gradient(160deg, ${stat.accent}, rgba(0,0,0,0))`,
                  borderColor: stat.border
                }}
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold mb-2 gradient-text">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Güçlü <span className="gradient-text">Özellikler</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Modern lojistik yönetimi için ihtiyacınız olan her şey, tek bir platformda.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-8 glass-hover group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10"
                  style={{
                    background: feature.accent.bg,
                    boxShadow: feature.accent.shadow
                  }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/features"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium group"
            >
              Tüm Özellikleri Görüntüle
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Personas Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Kime <span className="gradient-text">Değer Katıyoruz?</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Pazardaki üç ana müşteri segmenti için önceden paketlenmiş projeksiyonlar.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {personas.map((persona, index) => (
              <motion.div
                key={persona.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-3xl p-6 border border-white/5 glass-hover"
              >
                <p className="text-sm text-blue-400 mb-2">{persona.subtitle}</p>
                <h3 className="text-2xl font-bold mb-4">{persona.title}</h3>
                <p className="text-gray-400 mb-4">Acı noktası: <span className="text-white">{persona.pain}</span></p>
                <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4">
                  <p className="text-sm text-gray-400">Önerilen paket</p>
                  <p className="text-lg font-semibold text-white">{persona.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot Gallery */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Uygulama <span className="gradient-text">Ekranları</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Electron uygulamasından birebir alınmış ekranlar, web sitesinde gördüğünüz görsellerle eşleşir.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {appScreens.map((screen, index) => (
              <motion.div
                key={screen.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-3xl overflow-hidden border border-white/5"
              >
                <div className="relative bg-black/40">
                  <img
                    src={screen.image}
                    alt={screen.title}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 border-t border-white/5">
                  <p className="text-sm text-blue-400 uppercase tracking-wide mb-2">{screen.title}</p>
                  <p className="text-gray-300">{screen.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Neden <span className="gradient-text">Sekersoft?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Binlerce şirket operasyonlarını optimize etmek için Sekersoft'u tercih ediyor.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl glass glass-hover font-medium transition-all hover:scale-105"
              >
                Daha Fazla Bilgi
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass rounded-3xl p-8">
                <div
                  className="aspect-square rounded-2xl flex items-center justify-center"
                  style={{ backgroundImage: greetingGradientSoft }}
                >
                  <div className="text-center">
                    <Shield className="w-24 h-24 mx-auto mb-4 text-blue-400" />
                    <p className="text-xl font-semibold">Güvenli & Güvenilir</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Müşterilerimiz <span className="gradient-text">Ne Diyor?</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Binlerce mutlu müşterimizin deneyimlerini keşfedin.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 glass-hover"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div
              className="absolute inset-0"
              style={{ backgroundImage: greetingGradient }}
            />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-10" />
            
            <div className="relative px-8 py-16 md:py-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                İşletmenizi Dijitalleştirin
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Offline masaüstü uygulama. Tüm verileriniz güvende. Tek seferlik lisans - aylık ödeme yok.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/demo"
                  className="px-8 py-4 rounded-xl bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
                >
                  Demo İsteyin
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-all hover:scale-105"
                >
                  Bilgi Alın
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home

