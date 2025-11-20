import { motion } from 'framer-motion'
import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from 'lucide-react'
import { siteConfig } from '../config/site'
import { submitLeadForm } from '../lib/forms'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  kvkk: false,
}

const Contact = () => {
  const [formData, setFormData] = useState(initialFormState)
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [botField, setBotField] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (botField) {
      return
    }

    setStatus('loading')
    setErrorMessage('')

    const payload = {
      ...formData,
      kvkk: formData.kvkk ? 'on' : 'off',
    }

    try {
      if (siteConfig.forms.contact) {
        await submitLeadForm({
          endpoint: siteConfig.forms.contact,
          payload: {
            ...payload,
            formName: 'contact',
          },
        })
      } else {
        console.info('Contact form submission (development only):', payload)
      }

      setFormData(initialFormState)
      setSubmitted(true)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Mesaj gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.')
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

  const contactMethods = [
    {
      icon: Mail,
      title: 'E-posta',
      value: siteConfig.contact.email,
      description: 'Bize e-posta gönderin, 24 saat içinde yanıt verelim',
      href: `mailto:${siteConfig.contact.email}`,
    },
    {
      icon: Phone,
      title: 'Telefon',
      value: siteConfig.contact.phone,
      description: 'Çalışma saatleri içinde bizi arayın',
      href: `tel:${siteConfig.contact.phoneHref}`,
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: siteConfig.contact.whatsapp,
      description: 'WhatsApp üzerinden hızlı destek alın',
      href: siteConfig.contact.whatsappLink,
    },
    {
      icon: Clock,
      title: 'Çalışma Saatleri',
      value: siteConfig.contact.officeHours,
      description: 'Talebinizi aynı gün yanıtlıyoruz',
    },
  ]

  const subjectOptions = ['Demo Talebi', 'Fiyat Teklifi', 'Teknik Destek', 'Satış', 'Diğer']

  if (submitted && status === 'success') {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-12 text-center max-w-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Mesajınız Gönderildi!</h2>
          <p className="text-gray-400 mb-8">
            Mesajınız başarıyla alındı. Ekibimiz çalışma saatleri içinde genellikle birkaç saat içerisinde geri dönüş yapar.
          </p>
          <button onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-xl glass glass-hover font-semibold transition-all hover:scale-105">
            Yeni Mesaj Gönder
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
            İletişime <span className="gradient-text">Geçin</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Sorularınız mı var? Size yardımcı olmak için buradayız. Formu doldurun veya doğrudan bize ulaşın.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <motion.div key={method.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass rounded-2xl p-6 text-center glass-hover">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <method.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">{method.title}</h3>
              {method.href ? (
                <a href={method.href} className="text-blue-400 font-semibold mb-2 block">
                  {method.value}
                </a>
              ) : (
                <p className="text-blue-400 font-semibold mb-2">{method.value}</p>
              )}
              <p className="text-sm text-gray-400">{method.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6">Mesaj Gönderin</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Ad Soyad *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="Adınız Soyadınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-posta *</label>
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
                <label className="block text-sm font-medium mb-2">Telefon *</label>
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
                <label className="block text-sm font-medium mb-2">Konu *</label>
                <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 focus:outline-none transition-all">
                  <option value="">Konu Seçin</option>
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="companyWebsite">Şirket Web Sitesi</label>
                <input
                  id="companyWebsite"
                  type="text"
                  name="companyWebsite"
                  tabIndex={-1}
                  autoComplete="off"
                  value={botField}
                  onChange={(event) => setBotField(event.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mesajınız *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 focus:outline-none transition-all resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="kvkk"
                  name="kvkk"
                  checked={formData.kvkk}
                  onChange={handleChange}
                  required
                  className="mt-1 rounded border-white/20 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="kvkk" className="text-sm text-gray-400">
                  Kişisel verilerimin Sekersoft tarafından KVKK kapsamında işlenmesine yönelik aydınlatma metnini okudum ve onaylıyorum.
                </label>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <Send className="w-5 h-5" />
                {status === 'loading' ? 'Gönderiliyor...' : 'Mesaj Gönder'}
              </button>

              {status === 'error' && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-3">{errorMessage || 'Mesaj gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.'}</p>
              )}
            </form>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="glass rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">Sıkça Sorulan Sorular</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-2 text-blue-400">Ne kadar sürede geri dönüş yapıyorsunuz?</p>
                  <p className="text-sm text-gray-400">Çalışma saatleri içinde gönderilen mesajlara genellikle 2-4 saat içinde, mesai dışı mesajlara ise bir sonraki iş günü yanıt veriyoruz.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2 text-blue-400">Telefon desteği var mı?</p>
                  <p className="text-sm text-gray-400">Evet! Çalışma saatleri içinde bizi arayabilir veya WhatsApp üzerinden mesaj gönderebilirsiniz.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2 text-blue-400">Teknik destek nasıl alınır?</p>
                  <p className="text-sm text-gray-400">Teknik destek için formdan "Teknik Destek" konusunu seçerek mesaj iletebilir veya destek ekibimizi arayabilirsiniz.</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <h3 className="text-xl font-bold mb-4">Demo Talep Edebilirsiniz</h3>
              <p className="text-gray-400 mb-6">
                Satın almadan önce Sekersoft&apos;u denemek ister misiniz? Demo sayfamızdan ücretsiz demo talep edebilirsiniz.
              </p>
              <a href="/demo" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:scale-105 transition-all">
                Demo Talep Et
              </a>
            </div>

            <div className="glass rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-4">Adres Bilgileri</h3>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-300 mb-2">{siteConfig.name}</p>
                  <p className="text-sm text-gray-400">
                    {siteConfig.contact.address.line1}, {siteConfig.contact.address.district}
                    <br />
                    {siteConfig.contact.address.city}, {siteConfig.contact.address.country}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                <p className="font-semibold text-blue-400">Çalışma Saatleri</p>
                <p>{siteConfig.contact.officeHours}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact
