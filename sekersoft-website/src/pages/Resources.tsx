import { motion } from 'framer-motion'
import { BookOpen, FileText, Video, Download, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const Resources = () => {
  const categories = [
    {
      title: 'Başlangıç Kılavuzları',
      icon: BookOpen,
      resources: [
        {
          title: 'Hızlı Başlangıç Rehberi',
          description: 'Sekersoft\'u 5 dakikada kurun ve kullanmaya başlayın',
          type: 'PDF',
          link: '#'
        },
        {
          title: 'Kurulum Kılavuzu',
          description: 'Detaylı kurulum talimatları (Windows & macOS)',
          type: 'PDF',
          link: '#'
        },
        {
          title: 'İlk Adımlar',
          description: 'İlk siparişinizi oluşturun, sistemi keşfedin',
          type: 'PDF',
          link: '#'
        }
      ]
    },
    {
      title: 'Kullanım Kılavuzları',
      icon: FileText,
      resources: [
        {
          title: 'Sipariş Yönetimi',
          description: 'Sipariş oluşturma, düzenleme ve takip',
          type: 'PDF',
          link: '#'
        },
        {
          title: 'Maliyet Sistemi',
          description: 'Otomatik maliyet hesaplama nasıl çalışır',
          type: 'PDF',
          link: '#'
        },
        {
          title: 'Araç ve Güzergah Yönetimi',
          description: 'Araç profilleri ve güzergah kayıtları',
          type: 'PDF',
          link: '#'
        },
        {
          title: 'Raporlama ve Analiz',
          description: 'Detaylı raporlar oluşturun, verileri analiz edin',
          type: 'PDF',
          link: '#'
        },
        {
          title: 'Veri Yönetimi',
          description: 'Yedekleme, export ve veri güvenliği',
          type: 'PDF',
          link: '#'
        }
      ]
    },
    {
      title: 'Video Eğitimler',
      icon: Video,
      resources: [
        {
          title: 'Sekersoft\'a Giriş',
          description: '10 dakikalık genel tanıtım videosu',
          type: 'Video',
          duration: '10:30',
          link: '#'
        },
        {
          title: 'İlk Sipariş Oluşturma',
          description: 'Adım adım sipariş oluşturma',
          type: 'Video',
          duration: '5:45',
          link: '#'
        },
        {
          title: 'Maliyet Hesaplama',
          description: 'Maliyet sistemini anlama',
          type: 'Video',
          duration: '8:15',
          link: '#'
        },
        {
          title: 'Raporlar ve Export',
          description: 'Raporları oluşturma ve dışa aktarma',
          type: 'Video',
          duration: '6:20',
          link: '#'
        }
      ]
    },
    {
      title: 'İndirilenler',
      icon: Download,
      resources: [
        {
          title: 'Sekersoft Windows',
          description: 'Windows 10 ve üzeri için son sürüm',
          type: 'EXE',
          size: '~120 MB',
          link: '#'
        },
        {
          title: 'Sekersoft macOS',
          description: 'macOS 10.15 Catalina ve üzeri için',
          type: 'DMG',
          size: '~125 MB',
          link: '#'
        },
        {
          title: 'Örnek Veriler',
          description: 'Test için örnek sipariş verileri',
          type: 'ZIP',
          size: '2 MB',
          link: '#'
        }
      ]
    }
  ]

  const updates = [
    {
      version: 'v1.0.0',
      date: 'Kasım 2024',
      changes: [
        'İlk stabil sürüm yayınlandı',
        'Sipariş yönetimi sistemi',
        'Profesyonel maliyet hesaplama',
        'Detaylı raporlama'
      ]
    }
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Kaynaklar ve <span className="gradient-text">Dokümantasyon</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Sekersoft'u etkili kullanmanız için gereken tüm kaynaklar. Kılavuzlar, 
            video eğitimler ve indirilebilir dosyalar.
          </p>
        </motion.div>

        {/* Resources Categories */}
        <div className="space-y-12 mb-20">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold">{category.title}</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.resources.map((resource, index) => (
                  <motion.a
                    key={resource.title}
                    href={resource.link}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                    className="glass rounded-2xl p-6 glass-hover group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="px-3 py-1 rounded-lg glass text-xs font-semibold text-blue-400">
                        {resource.type}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{resource.description}</p>
                    {(resource as any).duration && (
                      <p className="text-xs text-gray-500">Süre: {(resource as any).duration}</p>
                    )}
                    {(resource as any).size && (
                      <p className="text-xs text-gray-500">Boyut: {(resource as any).size}</p>
                    )}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Sürüm <span className="gradient-text">Notları</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {updates.map((update) => (
              <div key={update.version} className="glass rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold gradient-text">{update.version}</h3>
                  <span className="text-sm text-gray-400">{update.date}</span>
                </div>
                <ul className="space-y-2">
                  {update.changes.map((change) => (
                    <li key={change} className="flex items-start gap-2 text-gray-300">
                      <span className="text-blue-400 mt-1">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
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
              Daha Fazla Yardıma İhtiyacınız Var mı?
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Dokümantasyonda bulamadığınız bir şey mi var? Destek ekibimiz size yardımcı olmaya hazır.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/support"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105"
              >
                Destek Al
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 rounded-xl glass glass-hover font-semibold transition-all hover:scale-105"
              >
                İletişime Geç
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Resources
