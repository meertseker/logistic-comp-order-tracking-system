import { motion } from 'framer-motion'
import { useState } from 'react'
import { CheckCircle2, Download, Mail, Phone, User, Building2, Send } from 'lucide-react'

const Demo = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    vehicleCount: '',
    message: ''
  })

  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Burada form gönderme işlemi yapılabilir
    console.log('Form submitted:', formData)
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const features = [
    'Sipariş yönetimi sistemini test edin',
    'Otomatik maliyet hesaplama özelliğini görün',
    'Araç ve güzergah yönetimini deneyin',
    'Raporlama ve analiz araçlarını keşfedin',
    'Offline çalışma avantajını yaşayın',
    'Türkçe arayüzü inceleyin'
  ]

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-12 text-center max-w-2xl"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Talebiniz Alındı!</h2>
          <p className="text-gray-400 mb-8">
            Demo talebiniz başarıyla alındı. Ekibimiz en kısa sürede sizinle iletişime geçecektir.
            Genellikle 24 saat içinde geri dönüş yapıyoruz.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 rounded-xl glass glass-hover font-semibold transition-all hover:scale-105"
          >
            Yeni Talep Gönder
          </button>
        </motion.div>
      </div>
    )
  }

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
            Demo <span className="gradient-text">Talep Edin</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Sekersoft'u satın almadan önce deneyebilir, tüm özellikleri test edebilirsiniz.
            Formu doldurun, sizinle iletişime geçelim.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">İletişim Bilgileriniz</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  E-posta *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400" />
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="0555 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Şirket Adı
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="Şirket Adınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  Araç Sayısı
                </label>
                <select
                  name="vehicleCount"
                  value={formData.vehicleCount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="">Seçiniz</option>
                  <option value="1">1 Araç</option>
                  <option value="2-5">2-5 Araç</option>
                  <option value="6-10">6-10 Araç</option>
                  <option value="10+">10+ Araç</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mesajınız (İsteğe bağlı)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 focus:outline-none transition-all resize-none"
                  placeholder="Özel talepleriniz veya sorularınız varsa buraya yazabilirsiniz..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Demo Talep Et
              </button>

              <p className="text-sm text-gray-400 text-center">
                * Zorunlu alanlar. Bilgileriniz gizli tutulacaktır.
              </p>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="glass rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Demo'da Neler Var?</h2>
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-4">Demo Süreci</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-semibold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Formu Doldurun</p>
                    <p className="text-sm text-gray-400">İletişim bilgilerinizi girin</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-semibold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Geri Dönüş Bekleyin</p>
                    <p className="text-sm text-gray-400">24 saat içinde sizinle iletişime geçiyoruz</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-semibold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Demo Kurulumu</p>
                    <p className="text-sm text-gray-400">Yazılımı bilgisayarınıza kuruyoruz</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-semibold">4</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Test Edin</p>
                    <p className="text-sm text-gray-400">Tüm özellikleri dilediğiniz gibi test edin</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <h3 className="text-xl font-bold mb-4">Sıkça Sorulan Sorular</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-1 text-blue-400">Demo ne kadar sürelidir?</p>
                  <p className="text-sm text-gray-400">Demo süresini sizinle birlikte belirleriz. Genellikle 7-14 gün arası test süresi sunuyoruz.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1 text-blue-400">Ücretli mi?</p>
                  <p className="text-sm text-gray-400">Hayır! Demo tamamen ücretsizdir. Hiçbir ödeme gerekmez.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1 text-blue-400">Kendi verilerimle test edebilir miyim?</p>
                  <p className="text-sm text-gray-400">Evet! Kendi sipariş verilerinizi girebilir, gerçek senaryolarla test edebilirsiniz.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Demo
