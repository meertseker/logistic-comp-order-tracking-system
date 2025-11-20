import { motion } from 'framer-motion'
import { Truck, Package, Users, Building2, DollarSign, Clock, CheckCircle2, BarChart3, Calculator } from 'lucide-react'
import { Link } from 'react-router-dom'
import { screenshotPaths } from '../data/screenshots'

const Solutions = () => {
  const solutions = [
    {
      icon: Truck,
      title: 'Tek Araç Sahipleri',
      description: 'Kendi aracıyla çalışan taşımacılar için mükemmel çözüm.',
      benefits: [
        'Her siparişin ne kadar karlı olduğunu görün',
        'Gizli maliyetleri keşfedin',
        'Müşteri ve sipariş geçmişini takip edin',
        'Ay sonu raporlarını kolayca hazırlayın',
        'Faturalarınızı dijital ortamda saklayın'
      ],
      scenario: 'Sabah siparişinizi alıyorsunuz. Sisteme giriyorsunuz: güzergah, müşteri, fiyat. Sekersoft anında maliyeti hesaplıyor. Karlı mı zararlı mı, hemen biliyorsunuz.',
      image: screenshotPaths.orders
    },
    {
      icon: Building2,
      title: 'Nakliye Firmaları',
      description: 'Küçük ve orta ölçekli nakliye işletmeleri için.',
      benefits: [
        'Çoklu araç yönetimi',
        'Araç bazında performans analizi',
        'Hangi araç daha karlı, kolayca görün',
        'Müşteri bazında sipariş takibi',
        'Detaylı finansal raporlama'
      ],
      scenario: '5 aracınız var. Hangisi daha çok kazandırıyor? Hangi müşteri en çok sipariş veriyor? Hangi güzergah karlı? Tüm cevaplar dashboard\'ta.',
      image: screenshotPaths.dashboard
    },
    {
      icon: Package,
      title: 'Kargo Şirketleri',
      description: 'Sefer yönetimi ve maliyet optimizasyonu.',
      benefits: [
        'Sefer bazında sipariş yönetimi',
        'Otomatik maliyet hesaplama',
        'Sürücü performans takibi',
        'Güzergah maliyet analizi',
        'İstatistiksel raporlar'
      ],
      scenario: 'Her seferin maliyetini biliyorsunuz. Yakıt, sürücü, bakım, yol giderleri otomatik hesaplanıyor. Karlılık marjınız her zaman görünür.',
      image: screenshotPaths.charts
    },
    {
      icon: Users,
      title: 'Özel Taşımacılık',
      description: 'Özel müşteriler için düzenli taşımacılık hizmeti.',
      benefits: [
        'Müşteri bazlı fiyatlandırma',
        'Tekrar eden güzergahları kaydedin',
        'Sipariş geçmişi ve analizler',
        'Email ile otomatik bildirimler',
        'Profesyonel raporlar'
      ],
      scenario: 'Aynı güzergahı sürekli yapıyorsunuz. Bir kez kaydediyorsunuz, her seferinde otomatik maliyet hesaplanıyor. Zaman kazanıyorsunuz.',
      image: screenshotPaths.createOrder
    },
  ]

  const useCases = [
    {
      icon: Calculator,
      title: 'Doğru Fiyatlandırma',
      description: 'Gerçek maliyetleri bilerek doğru fiyat verin',
      result: '%15-25 kar artışı'
    },
    {
      icon: Clock,
      title: 'Zaman Tasarrufu',
      description: 'Manuel hesaplama ve kağıt işi yerine otomatik sistem',
      result: 'Günde 2 saat kazanç'
    },
    {
      icon: BarChart3,
      title: 'Görünürlük',
      description: 'Hangi iş karlı, hangi müşteri daha çok kazandırıyor',
      result: 'Bilinçli kararlar'
    },
    {
      icon: DollarSign,
      title: 'Maliyet Kontrolü',
      description: 'Gizli maliyetleri görün, harcamaları kontrol edin',
      result: '%10-15 tasarruf'
    },
  ]

  const realScenarios = [
    {
      title: 'Sabah Rutini',
      steps: [
        'Dashboard\'ı açıyorsunuz',
        'Yeni sipariş alıyorsunuz',
        'Sisteme plaka, müşteri, güzergah giriyorsunuz',
        'Araç ve güzergahı seçiyorsunuz',
        'Sekersoft otomatik maliyet hesaplıyor',
        'Fiyatlandırıp işe başlıyorsunuz'
      ],
      time: '30 saniye'
    },
    {
      title: 'Ay Sonu Muhasebe',
      steps: [
        'Raporlar sayfasına gidiyorsunuz',
        'Ayı seçip "Rapor Oluştur" tıklıyorsunuz',
        'Tüm gelir, gider, kar özeti görünüyor',
        'CSV export yapıyorsunuz',
        'Excel\'de açıp muhasebeciye gönderiyorsunuz'
      ],
      time: '2 dakika'
    },
    {
      title: 'Araç Performans Analizi',
      steps: [
        'Raporlarda "En Çok Çalışan Araçlar" bölümüne bakıyorsunuz',
        'Hangi araç kaç sipariş yaptı görüyorsunuz',
        'Araç başına ortalama kazanç görünüyor',
        'Hangi aracın daha karlı olduğunu anlıyorsunuz',
        'Optimum atamalar yapıyorsunuz'
      ],
      time: '5 dakika'
    },
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
            Kimler İçin <span className="gradient-text">Sekersoft?</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            1 araçtan 50+ araç filosuna kadar, her büyüklükteki taşımacılık işletmesi için ideal çözüm.
            İster tek başınıza çalışın, ister ekibiniz olsun - Sekersoft size göre.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-3xl p-8 glass-hover"
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 mb-6">
                <img
                  src={solution.image}
                  alt={solution.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                <solution.icon className="w-7 h-7 text-blue-400" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3">{solution.title}</h3>
              <p className="text-gray-400 mb-6">{solution.description}</p>
              
              <div className="space-y-2 mb-6">
                {solution.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400 italic">
                  <strong className="text-blue-400">Senaryo:</strong> {solution.scenario}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center mb-12">
            Size Ne <span className="gradient-text">Kazandırır?</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 text-center glass-hover"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                  <useCase.icon className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{useCase.description}</p>
                <p className="text-blue-400 font-semibold">{useCase.result}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Real Scenarios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center mb-12">
            Gerçek Kullanım <span className="gradient-text">Senaryoları</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {realScenarios.map((scenario, index) => (
              <motion.div
                key={scenario.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{scenario.title}</h3>
                  <span className="px-3 py-1 rounded-lg glass text-sm font-semibold text-green-400">
                    {scenario.time}
                  </span>
                </div>
                <ol className="space-y-2">
                  {scenario.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-xs text-blue-400 font-semibold">
                        {stepIndex + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </motion.div>
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
          <h2 className="text-4xl font-bold text-center mb-12">
            Önce vs <span className="gradient-text">Sonra</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-red-400">❌ Sekersoft Olmadan</h3>
              <ul className="space-y-3">
                {[
                  'Siparişler kağıtta, kaybolabiliyor',
                  'Manuel maliyet hesaplama - Zaman kaybı',
                  'Hangi iş karlı bilmiyorsunuz',
                  'Gizli maliyetleri göremiyorsunuz',
                  'Ay sonu rapor hazırlamak kâbus',
                  'Müşteri geçmişi karışık',
                  'Her şey hafızada, unutabiliyor'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-300">
                    <span className="text-red-400 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="glass rounded-2xl p-8 border border-green-500/20">
              <h3 className="text-2xl font-bold mb-6 text-green-400">✅ Sekersoft İle</h3>
              <ul className="space-y-3">
                {[
                  'Tüm siparişler dijital, düzenli',
                  'Otomatik maliyet hesaplama - Saniyeler içinde',
                  'Her işin karlılığını anında görüyorsunuz',
                  'Tüm maliyetler şeffaf',
                  'Tek tıkla rapor - 2 dakika',
                  'Müşteri geçmişi bir tık uzağınızda',
                  'Her şey kayıtlı, güvende'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Success Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 mb-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Gerçek <span className="gradient-text">Başarı Hikayesi</span>
              </h2>
              <p className="text-gray-400 mb-6 italic">
                "3 aracım var. Önceden hangi araçla hangi işi yapsam diye düşünürdüm ama tam bilmiyordum. 
                Sekersoft ile her aracın maliyetini girdim. Şimdi hangi araç ne kadar karlı hemen görüyorum. 
                Artık en karlı atamayı yapabiliyorum. Aylık kazancım %20 arttı."
              </p>
              <div className="mb-6">
                <p className="font-semibold text-lg">Mehmet Bey</p>
                <p className="text-gray-400">Nakliye İşletmesi Sahibi - Bursa</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="glass rounded-xl px-4 py-2">
                  <p className="text-2xl font-bold text-green-400">%20</p>
                  <p className="text-xs text-gray-400">Kar Artışı</p>
                </div>
                <div className="glass rounded-xl px-4 py-2">
                  <p className="text-2xl font-bold text-blue-400">2 saat</p>
                  <p className="text-xs text-gray-400">Günlük Zaman Tasarrufu</p>
                </div>
                <div className="glass rounded-xl px-4 py-2">
                  <p className="text-2xl font-bold text-cyan-400">3 Araç</p>
                  <p className="text-xs text-gray-400">Yönetilen Filo</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={screenshotPaths.activeVehicles}
                  alt="Sekersoft başarı ekranı"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
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
              Siz De <span className="gradient-text">Başlayın</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Demo talep edin, Sekersoft'u keşfedin ve işletmenizi dijitalleştirmeye başlayın.
              Tüm sorularınızı yanıtlayalım.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/demo"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105"
              >
                Demo Talep Et
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 rounded-xl glass glass-hover font-semibold transition-all hover:scale-105"
              >
                Fiyatları Görüntüle
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Solutions
