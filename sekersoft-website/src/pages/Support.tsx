import { motion } from 'framer-motion'
import { HelpCircle, BookOpen, Download, Mail, Phone, MessageCircle, FileText, Video, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const Support = () => {
  const faqs = [
    {
      category: 'Genel',
      questions: [
        {
          q: 'Sekersoft nedir?',
          a: 'Sekersoft, taşımacılık işletmeleri için özel olarak geliştirilmiş, tamamen offline çalışan bir masaüstü yönetim yazılımıdır. Sipariş yönetimi, maliyet hesaplama, raporlama gibi özellikleri içerir.'
        },
        {
          q: 'Hangi işletim sistemlerinde çalışır?',
          a: 'Sekersoft hem Windows (Windows 10 ve üzeri) hem de macOS (10.15 Catalina ve üzeri) işletim sistemlerinde sorunsuz çalışır.'
        },
        {
          q: 'İnternet bağlantısı gerekli mi?',
          a: 'Hayır! Sekersoft tamamen offline çalışır. İnternet bağlantısına ihtiyaç duymazsınız. Tüm verileriniz bilgisayarınızda güvenle saklanır.'
        }
      ]
    },
    {
      category: 'Lisans ve Fiyatlandırma',
      questions: [
        {
          q: 'Lisans modeli nasıl çalışıyor?',
          a: 'Sekersoft tek seferlik lisans satın alarak kullanabileceğiniz bir yazılımdır. Aylık veya yıllık abonelik yoktur. Bir kez satın alın, süresiz kullanın.'
        },
        {
          q: 'Deneme sürümü var mı?',
          a: 'Evet! Demo talep ederek tüm özellikleri test edebilirsiniz. Demo sayfamızdan başvurun.'
        },
        {
          q: 'Birden fazla bilgisayarda kullanabilir miyim?',
          a: 'Her lisans bir bilgisayar için geçerlidir. Birden fazla bilgisayarda kullanmak için çoklu lisans paketlerimizden yararlanabilirsiniz.'
        }
      ]
    },
    {
      category: 'Teknik',
      questions: [
        {
          q: 'Kurulum zor mu?',
          a: 'Hayır! Sekersoft\'un kurulumu çok basittir. İndirdiğiniz dosyayı çalıştırın ve yönergeleri takip edin. Gerekirse uzaktan destek sağlıyoruz.'
        },
        {
          q: 'Verilerim güvende mi?',
          a: 'Kesinlikle! Tüm verileriniz sadece kendi bilgisayarınızda saklanır. Hiçbir veri internete gönderilmez.'
        },
        {
          q: 'Yedekleme nasıl yapılır?',
          a: 'Sekersoft, Ayarlar menüsünden tek tıkla veritabanı yedeği almanızı sağlar. Ayrıca JSON, CSV gibi formatlarda da veri dışa aktarabilirsiniz.'
        },
        {
          q: 'Güncellemeler otomatik mi?',
          a: 'İlk yıl tüm güncellemeler ücretsizdir. Güncelleme bildirimlerini uygulama içinden alırsınız.'
        }
      ]
    },
    {
      category: 'Kullanım',
      questions: [
        {
          q: 'Sipariş nasıl oluşturulur?',
          a: 'Ana sayfadaki "Yeni Sipariş" butonuna tıklayın. Plaka, müşteri, güzergah ve fiyat bilgilerini girin. Sistem otomatik olarak maliyeti hesaplayacaktır.'
        },
        {
          q: 'Maliyet hesaplama nasıl çalışır?',
          a: 'Araç ayarlarında girdiğiniz parametrelere (yakıt tüketimi, sürücü giderleri, bakım maliyetleri vb.) göre her sipariş için otomatik maliyet hesaplanır.'
        },
        {
          q: 'Raporları nasıl alabilirim?',
          a: 'Raporlar menüsünden istediğiniz ay için rapor oluşturabilirsiniz. CSV formatında dışa aktararak Excel\'de açabilirsiniz.'
        }
      ]
    }
  ]

  const supportOptions = [
    {
      icon: Mail,
      title: 'Email Desteği',
      description: 'Sorularınız için bize email gönderin',
      action: 'info@sekersoft.com',
      link: 'mailto:info@sekersoft.com'
    },
    {
      icon: Phone,
      title: 'Telefon Desteği',
      description: 'Çalışma saatleri içinde bizi arayın',
      action: '+90 (XXX) XXX XX XX',
      link: 'tel:+90XXXXXXXXXX'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Destek',
      description: 'Hızlı destek için WhatsApp kullanın',
      action: 'WhatsApp\'tan Yaz',
      link: 'https://wa.me/90XXXXXXXXXX'
    },
    {
      icon: BookOpen,
      title: 'Dokümantasyon',
      description: 'Detaylı kullanım kılavuzları',
      action: 'Kaynaklar Sayfası',
      link: '/resources'
    }
  ]

  const resources = [
    {
      icon: FileText,
      title: 'Kullanım Kılavuzu',
      description: 'Sekersoft\'u kullanmaya başlayın'
    },
    {
      icon: Video,
      title: 'Video Eğitimler',
      description: 'Adım adım video anlatımlar'
    },
    {
      icon: Download,
      title: 'İndirmeler',
      description: 'Son sürümü indirin'
    },
    {
      icon: Users,
      title: 'Topluluk',
      description: 'Diğer kullanıcılarla etkileşim'
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
            Yardım <span className="gradient-text">Merkezi</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Size nasıl yardımcı olabiliriz? Sorularınızın cevaplarını bulun veya
            doğrudan bizimle iletişime geçin.
          </p>
        </motion.div>

        {/* Support Options */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {supportOptions.map((option, index) => (
            <motion.a
              key={option.title}
              href={option.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6 text-center glass-hover group"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <option.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">{option.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{option.description}</p>
              <p className="text-sm text-blue-400 font-medium">{option.action}</p>
            </motion.a>
          ))}
        </div>

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
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={category.category}>
                <h3 className="text-2xl font-bold mb-6 text-blue-400">{category.category}</h3>
                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <motion.div
                      key={faq.q}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                      className="glass rounded-2xl p-6 glass-hover"
                    >
                      <div className="flex items-start gap-4">
                        <HelpCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-lg font-semibold mb-2">{faq.q}</h4>
                          <p className="text-gray-400">{faq.a}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Yardımcı <span className="gradient-text">Kaynaklar</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 text-center glass-hover"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <resource.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-400">{resource.description}</p>
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
              Cevabını Bulamadınız mı?
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Sorunuzun cevabını bulamadıysanız, bizimle doğrudan iletişime geçin.
              Size yardımcı olmaktan mutluluk duyarız.
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

export default Support
