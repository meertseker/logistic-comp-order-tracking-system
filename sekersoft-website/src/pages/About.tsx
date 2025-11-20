import { motion } from 'framer-motion'
import { Target, Shield, Heart, Code, Database, Monitor, Zap, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { screenshotPaths } from '../data/screenshots'

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Offline-First',
      description: 'İnternet bağlantısı gerektirmez. Tüm verileriniz bilgisayarınızda güvende.'
    },
    {
      icon: Heart,
      title: 'Kullanıcı Dostu',
      description: 'Basit, anlaşılır arayüz. Teknik bilgi gerektirmez, herkes kolayca kullanabilir.'
    },
    {
      icon: Database,
      title: 'Gizlilik',
      description: 'Verileriniz sadece sizindir. Hiçbir veri internete gönderilmez.'
    },
    {
      icon: Zap,
      title: 'Hızlı ve Güvenilir',
      description: 'Yerel veritabanı sayesinde çok hızlı. SQLite ile güvenilir veri yönetimi.'
    },
  ]

  const techStack = [
    {
      name: 'Electron',
      description: 'Cross-platform masaüstü uygulama framework\'ü',
      icon: Monitor
    },
    {
      name: 'React',
      description: 'Modern, hızlı ve kullanıcı dostu arayüz',
      icon: Code
    },
    {
      name: 'SQLite',
      description: 'Hızlı ve güvenilir yerel veritabanı',
      icon: Database
    },
    {
      name: 'TypeScript',
      description: 'Tip güvenli, hatasız kod',
      icon: CheckCircle2
    },
  ]

  const features = [
    'Tamamen offline çalışır',
    'Windows ve macOS desteği',
    'Türkçe dil desteği',
    'Hızlı ve güvenilir',
    'Kolay kurulum',
    'Veri gizliliği',
    'Tek seferlik ödeme',
    'Sürekli güncelleme'
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Sekersoft <span className="gradient-text">Hakkında</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Taşımacılık işletmeleri için özel olarak geliştirilmiş, tamamen offline çalışan
            profesyonel masaüstü yönetim yazılımı.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 mb-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Neden Sekersoft?</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Taşımacılık sektöründe çalışan küçük ve orta ölçekli işletmelerin en büyük 
                sorunlarından biri, sipariş takibi ve maliyet hesaplamalarını düzenli bir şekilde 
                yapamamaktır. Kağıt karmaşası, manuel hesaplamalar, unutulan giderler...
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                Sekersoft tam da bu sorunu çözmek için geliştirildi. İnternet bağlantısı gerektirmeyen, 
                tüm verilerinizi bilgisayarınızda güvenle saklayan, kolay kullanımlı bir masaüstü uygulaması.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Karmaşık ERP sistemleri yerine, sadece ihtiyacınız olanı sunuyoruz. Sipariş yönetimi, 
                otomatik maliyet hesaplama, detaylı raporlama. Hepsi bu kadar basit.
              </p>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img
                  src={screenshotPaths.dashboard}
                  alt="Sekersoft masaüstü ekran görüntüsü"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Temel <span className="gradient-text">Değerlerimiz</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 glass-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Modern <span className="gradient-text">Teknoloji</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 text-center glass-hover"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <tech.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{tech.name}</h3>
                <p className="text-sm text-gray-400">{tech.description}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-gray-400 mt-8">
            Sekersoft, en son web teknolojileri kullanılarak geliştirilmiş modern bir masaüstü uygulamasıdır.
            Electron framework'ü sayesinde hem Windows hem de macOS'ta sorunsuz çalışır.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Neden <span className="gradient-text">Sekersoft?</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Hikayemiz
          </h2>
          <div className="max-w-3xl mx-auto space-y-6 text-gray-400 leading-relaxed">
            <p>
              Sekersoft, taşımacılık sektöründeki gerçek ihtiyaçlardan doğdu. Küçük ve orta ölçekli 
              taşımacılık işletmelerinin karşılaştığı en büyük sorunları gözlemledik: karmaşık yazılımlar, 
              pahalı abonelikler, internet bağımlılığı ve veri güvenliği endişeleri.
            </p>
            <p>
              Piyasadaki çözümler ya çok karmaşık ve pahalı kurumsal ERP sistemleriydi, ya da 
              güvenilirliği şüpheli bulut tabanlı uygulamalardı. İşte tam da bu noktada, basit, 
              güvenli ve uygun fiyatlı bir çözüm geliştirmeye karar verdik.
            </p>
            <p>
              Sekersoft'u geliştirirken en önemli prensiplerimiz şunlar oldu:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li><strong>Basitlik:</strong> Karmaşık menüler değil, ihtiyacınız olanı kolayca bulun</li>
              <li><strong>Offline:</strong> İnternet kesintisi işinizi durdurmasın</li>
              <li><strong>Gizlilik:</strong> Verileriniz sadece sizindir</li>
              <li><strong>Uygun Fiyat:</strong> Aylık abonelik yerine tek seferlik ödeme</li>
              <li><strong>Türkçe:</strong> Tam Türkçe dil desteği ve yerel formatlar</li>
            </ul>
            <p>
              Bugün, birçok küçük ve orta ölçekli taşımacılık işletmesi Sekersoft ile işlerini 
              dijitalleştirmiş durumda. Her gün yeni özellikler eklemeye ve ürünümüzü geliştirmeye 
              devam ediyoruz.
            </p>
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
              Sekersoft'u Keşfedin
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Demo talep edin, tüm özellikleri test edin ve işletmenizi dijitalleştirmeye başlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/demo"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105"
              >
                Demo Talep Et
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 rounded-xl glass glass-hover font-semibold transition-all hover:scale-105"
              >
                İletişime Geçin
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default About
