import { motion } from 'framer-motion'
import { 
  Truck, 
  Package, 
  MapPin, 
  BarChart3, 
  Receipt,
  FileText,
  DollarSign,
  Settings,
  Shield,
  Database,
  Download,
  Mail,
  HardDrive,
  Monitor,
  CheckCircle2
} from 'lucide-react'
import { screenshotPaths } from '../data/screenshots'

const Features = () => {
  const mainFeatures = [
    {
      icon: Package,
      title: 'Akıllı Sipariş Yönetimi',
      description: 'Tüm siparişlerinizi dijital ortamda kolayca oluşturun, takip edin ve yönetin.',
      image: screenshotPaths.orders,
      details: [
        'Kolay sipariş oluşturma - Plaka, müşteri, güzergah, fiyat bilgileri',
        'Canlı durum takibi - Bekliyor, Yolda, Teslim Edildi, Faturalandı',
        'Gelişmiş arama ve filtreleme',
        'Detaylı sipariş geçmişi',
        'Müşteri ve araç bazında sipariş görüntüleme'
      ]
    },
    {
      icon: DollarSign,
      title: 'Profesyonel Maliyet Hesaplama',
      description: 'Her siparişin gerçek maliyetini otomatik hesaplayın. Hangi iş karlı hangisi zararlı, anında görün.',
      image: '/expense-calculator.png',
      details: [
        'Yakıt maliyeti - KM bazlı otomatik hesaplama',
        'Sürücü giderleri - Günlük ücret, yemek, süre hesaplama',
        'Bakım masrafları - Yağ, lastik, büyük bakım amortismanı',
        'Yol giderleri - HGS, otoyol, köprü ücretleri',
        'Sabit giderler - Sigorta, MTV, muayene amortismanı',
        'Otomatik kar-zarar analizi'
      ]
    },
    {
      icon: Truck,
      title: 'Araç Yönetimi',
      description: 'Her aracınızın maliyet profilini kaydedin. Farklı araçların farklı maliyetlerini dikkate alın.',
      image: screenshotPaths.vehicles,
      details: [
        'Yakıt ayarları - Tüketim (lt/100km), yakıt fiyatı',
        'Sürücü parametreleri - Günlük ücret, ortalama KM, yemek masrafı',
        'Bakım parametreleri - Yağ, lastik, büyük bakım maliyetleri',
        'Sabit giderler - Sigorta, MTV, muayene (yıllık)',
        'Fiyatlandırma ayarları - Kar oranı, KDV',
        'Amortisman hesaplaması'
      ]
    },
    {
      icon: MapPin,
      title: 'Güzergah Yönetimi',
      description: 'Sık kullandığınız güzergahları kaydedin. Mesafe ve maliyet bilgilerini otomatik hesaplayın.',
      image: screenshotPaths.routes,
      details: [
        'Başlangıç ve varış noktaları',
        'Mesafe bilgisi (km)',
        'HGS ve köprü maliyetleri',
        'Tahmini süre hesaplama',
        'Notlar ve alternatif güzergahlar',
        'Sipariş oluştururken listeden seçim'
      ]
    },
    {
      icon: Receipt,
      title: 'Detaylı Gider Takibi',
      description: 'Her sipariş için detaylı gider kaydı tutun. Gerçek maliyetleri tam olarak bilin.',
      image: '/gidertakibi.png',
      details: [
        'Kategorize gider türleri - Yakıt, HGS, Köprü, Yemek, Bakım, Diğer',
        'Sipariş bazlı gider ekleme',
        'Otomatik toplam hesaplama',
        'Gider geçmişi ve zaman damgası',
        'Net kazanç hesaplama (Gelir - Gider)',
        'Kolay silme ve düzenleme'
      ]
    },
    {
      icon: FileText,
      title: 'Fatura ve Belge Yönetimi',
      description: 'Tüm evraklarınızı güvenli şekilde dijital ortamda saklayın.',
      image: screenshotPaths.settings,
      details: [
        'PDF ve fotoğraf yükleme desteği',
        'Sipariş bazlı fatura ilişkilendirme',
        'Güvenli yerel dosya saklama',
        'Kolay görüntüleme ve silme',
        'Toplu fatura yükleme',
        'Kağıt karmaşasına son'
      ]
    },
    {
      icon: BarChart3,
      title: 'Gelişmiş Raporlama & Analiz',
      description: 'İşletmenizin durumunu görsel raporlar ve analizlerle anlayın.',
      image: screenshotPaths.charts,
      details: [
        'Aylık finansal raporlar - Gelir, gider, net kar',
        'Araç performans analizleri - En çok çalışan araçlar',
        'Müşteri analizleri - En çok sipariş verenler',
        'Sipariş durum dağılımı',
        'Kar marjı trendi',
        'CSV export - Excel uyumlu'
      ]
    },
    {
      icon: Monitor,
      title: 'Modern Dashboard',
      description: 'İşletmenizin anlık durumunu tek bakışta görün.',
      image: screenshotPaths.dashboard,
      details: [
        'Toplam ve aktif sipariş sayıları',
        'Tamamlanan teslimatlar',
        'Aktif araç sayısı',
        'Aylık finansal özet (gelir, gider, kar)',
        'Son siparişler listesi',
        'Görsel grafikler ve istatistikler'
      ]
    },
  ]

  const technicalFeatures = [
    {
      icon: Shield,
      title: '%100 Offline Çalışma',
      description: 'İnternet bağlantısı gerektirmez, tüm veriler bilgisayarınızda'
    },
    {
      icon: Database,
      title: 'Güvenli Veri Saklama',
      description: 'SQLite veritabanı ile hızlı ve güvenilir veri yönetimi'
    },
    {
      icon: Download,
      title: 'Çoklu Export Seçenekleri',
      description: 'JSON, CSV, veritabanı yedeği, istatistik raporu'
    },
    {
      icon: Mail,
      title: 'Email Entegrasyonu',
      description: 'Gmail/Outlook ile otomatik sipariş bildirimi gönderme'
    },
    {
      icon: HardDrive,
      title: 'Otomatik Yedekleme',
      description: 'Manuel veya otomatik veri yedekleme sistemi'
    },
    {
      icon: Settings,
      title: 'Lisans Yönetimi',
      description: 'Güvenli lisans sistemi ile yazılım koruma'
    },
    {
      icon: Monitor,
      title: 'Windows & macOS',
      description: 'Hem Windows hem de macOS işletim sistemlerinde çalışır'
    },
    {
      icon: CheckCircle2,
      title: 'Türkçe Arayüz',
      description: 'Tam Türkçe dil desteği, Türk Lirası ve tarih formatları'
    },
  ]

  const comparisons = [
    { feature: 'Offline Çalışma', sekersoft: true, others: false },
    { feature: 'Profesyonel Maliyet Sistemi', sekersoft: true, others: false },
    { feature: 'Araç Profilleme', sekersoft: true, others: false },
    { feature: 'Güzergah Yönetimi', sekersoft: true, others: false },
    { feature: 'Tek Seferlik Ödeme', sekersoft: true, others: false },
    { feature: 'Veri Gizliliği', sekersoft: true, others: false },
    { feature: 'Türkçe Destek', sekersoft: true, others: true },
    { feature: 'Raporlama', sekersoft: true, others: true },
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
            Güçlü <span className="gradient-text">Özellikler</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Taşımacılık işletmenizi profesyonelce yönetmek için ihtiyacınız olan her şey.
            Offline masaüstü uygulama ile hızlı, güvenli ve güvenilir.
          </p>
        </motion.div>

        {/* Main Features */}
        <div className="space-y-20 mb-20">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
                <p className="text-gray-400 text-lg mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-gray-300">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="glass rounded-3xl overflow-hidden border border-white/5">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center mb-12">
            Teknik <span className="gradient-text">Özellikler</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl p-6 glass-hover group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center mb-12">
            Neden <span className="gradient-text">Sekersoft?</span>
          </h2>
          <div className="glass rounded-3xl p-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Özellik</th>
                  <th className="text-center py-4 px-4 text-blue-400 font-semibold">Sekersoft</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Diğer Çözümler</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, index) => (
                  <tr key={row.feature} className={index !== comparisons.length - 1 ? 'border-b border-white/5' : ''}>
                    <td className="py-4 px-4 text-gray-300">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.sekersoft ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto" />
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.others ? (
                        <CheckCircle2 className="w-6 h-6 text-gray-600 mx-auto" />
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-6">
            Sekersoft'u denemeye hazır mısınız?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Demo talep edin, tüm özellikleri keşfedin ve işletmenizi dijitalleştirmeye başlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/demo"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105"
            >
              Demo Talep Et
            </a>
            <a
              href="/pricing"
              className="px-8 py-4 rounded-xl glass glass-hover font-semibold transition-all hover:scale-105"
            >
              Fiyatlandırmayı Görüntüle
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Features
