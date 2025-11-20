import { motion } from 'framer-motion'
import { useState } from 'react'
import { CheckCircle2, Download, Mail, Phone, User, Building2, Send } from 'lucide-react'
import { siteConfig } from '../config/site'
import { submitLeadForm } from '../lib/forms'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  vehicleCount: '',
  message: '',
}

const Demo = () => {
  const [formData, setFormData] = useState(initialFormState)
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [botField, setBotField] = useState('')

  const features = [
    'Sipariş yönetimi sistemini test edin',
    'Otomatik maliyet hesaplama özelliğini görün',
    'Araç ve güzergah yönetimini deneyin',
    'Raporlama ve analiz araçlarını keşfedin',
    'Offline çalışma avantajını yaşayın',
    'Türkçe arayüzü inceleyin',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (botField) {
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      if (siteConfig.forms.demo) {
        await submitLeadForm({
          endpoint: siteConfig.forms.demo,
          payload: {
            ...formData,
            formName: 'demo',
          },
        })
      } else {
        console.info('Demo form submission (development only):', formData)
      }

      setSubmitted(true)
      setStatus('success')
      setFormData(initialFormState)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Talebiniz gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value

    setFormData((prev) => ({
      ...prev,
      [target.name]: value,
    }))
  }

  if (submitted && status === 'success') {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-12 text-center max-w-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Talebiniz Alındı!</h2>
          <p className="text-gray-400 mb-8">
            Demo talebiniz başarıyla alındı. {siteConfig.name} ekibi genellikle 24 saat içerisinde sizinle iletişime geçer ve uzaktan kurulum randevunuzu planlar.
          </p>
          <button onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-xl glass glass-hover font-semibold transition-all hover:scale-105">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Demo <span className="gradient-text">Talep Edin</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            14 gün boyunca tüm özellikleri sınırsız test edin. Uzaktan kurulum desteği ve canlı onboarding görüşmesi dahil. Formu doldurun, 24 saat içinde randevunuzu oluşturalım.
          </p>
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-left">
            {['14 Gün Full Sürüm', 'Uzaktan Kurulum & Eğitim', 'WhatsApp Destek + Video Kılavuz'].map((item) => (
              <motion.div key={item} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 flex items-center gap-3 justify-center md:justify-start">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-8">
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

              <div className="hidden" aria-hidden="true">
                <label htmlFor="demoWebsite">Web siteniz</label>
                <input
                  id="demoWebsite"
                  type="text"
                  name="demoWebsite"
                  autoComplete="off"
                  tabIndex={-1}
                  value={botField}
                  onChange={(event) => setBotField(event.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mesajınız (İsteğe bağlı)</label>
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
                disabled={status === 'loading'}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <Send className="w-5 h-5" />
                {status === 'loading' ? 'Gönderiliyor...' : 'Demo Talep Et'}
              </button>

              <p className="text-sm text-gray-400 text-center">* Zorunlu alanlar. Bilgileriniz gizli tutulacaktır.</p>

              {status === 'error' && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-3">{errorMessage || 'Talebiniz gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.'}</p>
              )}
            </form>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="glass rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Demo&apos;da Neler Var?</h2>
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
                {[
                  { step: 1, title: 'Formu Doldurun', text: 'İletişim bilgilerinizi ve ihtiyaçlarınızı iletin' },
                  { step: 2, title: 'Geri Dönüş', text: '24 saat içinde size ulaşıp randevunuzu planlıyoruz' },
                  { step: 3, title: 'Kurulum', text: 'Uzaktan bağlantı ile yazılımı bilgisayarınıza kuruyoruz' },
                  { step: 4, title: 'Test Süreci', text: 'Gerçek verilerinizle tüm özellikleri deneyin' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-semibold">{item.step}</span>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <h3 className="text-xl font-bold mb-4">Sıkça Sorulan Sorular</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-1 text-blue-400">Demo ne kadar sürer?</p>
                  <p className="text-sm text-gray-400">Demo süresini birlikte belirleriz. Genellikle 7-14 gün arası test süresi sunuyoruz.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1 text-blue-400">Demo ücretli mi?</p>
                  <p className="text-sm text-gray-400">Hayır. Demo tamamen ücretsizdir ve hiçbir ödeme talep edilmez.</p>
                </div>
                <div>
                  <p className="font-semibold mb-1 text-blue-400">Kendi verilerimle test edebilir miyim?</p>
                  <p className="text-sm text-gray-400">Evet. Kendi sipariş verilerinizi içeri aktarabilir ve gerçek senaryoları test edebilirsiniz.</p>
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
