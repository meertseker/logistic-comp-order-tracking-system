import { motion } from 'framer-motion'
import { Star, Quote, Truck, Building2, Package, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { screenshotPaths } from '../data/screenshots'

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      role: 'Nakliye İşletmecisi',
      company: 'Bursa',
      icon: Truck,
      image: null,
      rating: 5,
      text: 'Artık hangi siparişin ne kadar karlı olduğunu görebiliyorum. Maliyet hesaplaması otomatik oluyor, çok zaman kazandırıyor. 3 aracım var ve her birinin maliyetini girdiğimde, hangisinin daha karlı olduğunu anında görüyorum.',
      highlight: 'Aylık kazancım %20 arttı'
    },
    {
      name: 'Mehmet Demir',
      role: 'Taşımacılık Sahibi',
      company: 'İzmir',
      icon: Building2,
      image: null,
      rating: 5,
      text: 'Önceden her şeyi kağıtta tutuyordum. Siparişleri, giderleri... Ay sonunda muhasebe için rapor hazırlamak kâbustu. Şimdi tek tıkla tüm veriler hazır. Sekersoft sayesinde işim çok kolaylaştı.',
      highlight: 'Günde 2 saat zaman tasarrufu'
    },
    {
      name: 'Zeynep Kaya',
      role: 'Filo Yöneticisi',
      company: 'Ankara',
      icon: Package,
      image: null,
      rating: 5,
      text: 'Her aracın ne kadar kar getirdiğini görebiliyorum. Gizli maliyetleri fark etmek çok önemliymiş. Yakıt, bakım, sürücü giderleri... Sekersoft hepsini otomatik hesaplıyor.',
      highlight: 'Maliyet kontrolü %100 arttı'
    },
    {
      name: 'Can Özkan',
      role: 'Tek Araç Sahibi',
      company: 'Antalya',
      icon: Truck,
      image: null,
      rating: 5,
      text: 'Kendi aracımla çalışıyorum. Sekersoft sayesinde hangi müşterilerden ne kadar kazandığımı takip edebiliyorum. Offline çalışması harika, internetsiz her yerde kullanabiliyorum.',
      highlight: 'İnternet gerektirmez'
    },
    {
      name: 'Ayşe Türk',
      role: 'Nakliye Firması Sahibi',
      company: 'İstanbul',
      icon: Building2,
      image: null,
      rating: 5,
      text: 'Ekibimde 5 sürücü ve 5 araç var. Sekersoft ile her birinin performansını kolayca takip edebiliyorum. Raporlar çok detaylı ve anlaşılır. Fiyatlandırma konusunda çok daha bilinçli kararlar veriyorum.',
      highlight: 'Karlılık %25 arttı'
    },
    {
      name: 'Hasan Yıldız',
      role: 'Kargo Şirketi',
      company: 'Konya',
      icon: Package,
      image: null,
      rating: 5,
      text: 'Günlük 20-30 sefer yapıyoruz. Her seferin maliyetini bilmek çok önemliymiş. Sekersoft otomatik hesaplıyor, biz sadece sonuçlara bakıyoruz. Müşterilerimize de daha profesyonel görünüyoruz.',
      highlight: 'Profesyonel imaj'
    }
  ]

  const stats = [
    { value: '200+', label: 'Mutlu Kullanıcı' },
    { value: '4.9/5', label: 'Ortalama Puan' },
    { value: '%95', label: 'Memnuniyet Oranı' },
    { value: '1000+', label: 'Yönetilen Sipariş/Gün' }
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
            Müşterilerimiz <span className="gradient-text">Ne Diyor?</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Sekersoft kullanan taşımacılık işletmelerinin gerçek deneyimleri.
            Sizin hikayeniz de burada olabilir!
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <h3 className="text-3xl font-bold mb-2 gradient-text">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-3xl p-8 glass-hover relative"
            >
              <Quote className="w-12 h-12 text-blue-400/20 absolute top-6 right-6" />
              
              <div className="relative z-10">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Highlight */}
                <div className="inline-block px-3 py-1 rounded-lg glass text-sm font-semibold text-green-400 mb-4">
                  {testimonial.highlight}
                </div>

                {/* Text */}
                <p className="text-gray-300 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <testimonial.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 mb-20 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            Video <span className="gradient-text">Yorumları</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Müşterilerimizin video yorumları yakında burada olacak. 
            Siz de Sekersoft deneyiminizi paylaşmak isterseniz bizimle iletişime geçin.
          </p>
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
            <img
              src={screenshotPaths.orderDetail}
              alt="Sekersoft müşteri deneyimi ekranı"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border border-white/40">
                <Play className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-200">Video yorumları yakında...</p>
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
              Siz de <span className="gradient-text">Deneyin</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Bu müşterilerimiz gibi siz de işletmenizi dijitalleştirin ve
              karlılığınızı artırın. Hemen demo talep edin!
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

export default Testimonials
