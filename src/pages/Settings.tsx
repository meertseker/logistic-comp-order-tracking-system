import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Loader,
  ArrowRight,
  Shield
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { useToast } from '../context/ToastContext'

type MailProvider = 'gmail' | 'outlook' | 'custom' | null

export default function Settings() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  
  const [step, setStep] = useState<1 | 2>(1)
  const [provider, setProvider] = useState<MailProvider>(null)
  
  const [mailSettings, setMailSettings] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'Seymen Transport',
    enabled: false,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const settings = await window.electronAPI.mail.getSettings()
      if (settings && settings.smtp_host) {
        // Ayarlar varsa, hangisi kullanılıyor bul
        if (settings.smtp_host.includes('gmail')) {
          setProvider('gmail')
        } else if (settings.smtp_host.includes('outlook')) {
          setProvider('outlook')
        } else {
          setProvider('custom')
        }
        
        setMailSettings({
          smtp_host: settings.smtp_host || '',
          smtp_port: settings.smtp_port || 587,
          smtp_secure: settings.smtp_secure === 1,
          smtp_user: settings.smtp_user || '',
          smtp_password: settings.smtp_password || '',
          from_email: settings.from_email || '',
          from_name: settings.from_name || 'Seymen Transport',
          enabled: settings.enabled === 1,
        })
        
        setStep(2) // Doğrudan adım 2'ye geç
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      showToast('Ayarlar yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }
  
  const selectProvider = (selectedProvider: MailProvider) => {
    setProvider(selectedProvider)
    
    // Otomatik SMTP ayarları
    if (selectedProvider === 'gmail') {
      setMailSettings({
        ...mailSettings,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: false,
      })
    } else if (selectedProvider === 'outlook') {
      setMailSettings({
        ...mailSettings,
        smtp_host: 'smtp-mail.outlook.com',
        smtp_port: 587,
        smtp_secure: false,
      })
    }
    
    setStep(2)
  }

  const handleSave = async () => {
    if (!mailSettings.smtp_user || !mailSettings.smtp_password) {
      showToast('Lütfen mail adresinizi ve şifrenizi girin', 'error')
      return
    }
    
    try {
      setSaving(true)
      
      // Kaydet ve ETKİNLEŞTİR!
      const finalSettings = {
        ...mailSettings,
        from_email: mailSettings.from_email || mailSettings.smtp_user,
        enabled: true, // Kayıt yapılınca otomatik etkinleştir
      }
      
      await window.electronAPI.mail.saveSettings(finalSettings)
      setMailSettings(finalSettings)
      
      showToast('✅ Harika! Mail sistemi hazır. Artık siparişlerinize mail gönderebilirsiniz!', 'success')
    } catch (error) {
      console.error('Failed to save settings:', error)
      showToast('Ayarlar kaydedilemedi', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    // Önce geçici olarak kaydet (test için)
    if (!mailSettings.smtp_user || !mailSettings.smtp_password) {
      showToast('Lütfen mail adresinizi ve şifrenizi girin', 'error')
      return
    }
    
    try {
      setTesting(true)
      
      // Test için geçici kaydet (enabled = false)
      const testSettings = {
        ...mailSettings,
        from_email: mailSettings.from_email || mailSettings.smtp_user,
        enabled: false, // Henüz etkinleştirme, sadece test
      }
      
      await window.electronAPI.mail.saveSettings(testSettings)
      
      showToast('Bağlantı test ediliyor...', 'info')
      const result = await window.electronAPI.mail.testConnection()
      
      if (result.success) {
        showToast('✅ Bağlantı başarılı! Şimdi kaydetebilirsiniz.', 'success')
      } else {
        showToast(`❌ Bağlantı hatası: ${result.message}`, 'error')
      }
    } catch (error: any) {
      showToast(`Bağlantı testi başarısız: ${error.message}`, 'error')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">⚙️ Ayarlar</h1>
          <p className="text-gray-400">Müşterilerinize otomatik mail gönderin</p>
        </div>
      </motion.div>

      {/* ADIM 1: Sağlayıcı Seçimi */}
      {step === 1 && (
        <Card title="1️⃣ Mail Servisinizi Seçin" subtitle="Hangi mail adresinizi kullanıyorsunuz?">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gmail */}
            <motion.button
              onClick={() => selectProvider('gmail')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-8 bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500/30 rounded-2xl hover:border-red-500/60 transition-all"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-2xl font-bold text-white mb-2">Gmail</h3>
                <p className="text-gray-300 text-sm mb-4">
                  @gmail.com adresi kullanıyorum
                </p>
                <div className="flex items-center justify-center gap-2 text-red-400">
                  <span className="font-medium">Seç</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.button>

            {/* Outlook */}
            <motion.button
              onClick={() => selectProvider('outlook')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 rounded-2xl hover:border-blue-500/60 transition-all"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📬</div>
                <h3 className="text-2xl font-bold text-white mb-2">Outlook / Hotmail</h3>
                <p className="text-gray-300 text-sm mb-4">
                  @outlook.com veya @hotmail.com
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <span className="font-medium">Seç</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.button>
          </div>
        </Card>
      )}

      {/* ADIM 2: Mail Bilgileri */}
      {step === 2 && provider && (
        <>
          <Card 
            title={`2️⃣ ${provider === 'gmail' ? 'Gmail' : 'Outlook'} Bilgilerinizi Girin`}
            subtitle="Sadece 2 bilgi lazım, hepsi bu kadar!"
          >
              {/* Büyük, açıklayıcı input alanları */}
              <div className="space-y-6">
                {/* Mail Adresi */}
                <div className="p-6 bg-gray-800/50 rounded-xl border-2 border-gray-700/50">
                  <label className="block text-lg font-bold text-white mb-3">
                    📧 Mail Adresiniz
                  </label>
                  <Input
                    type="email"
                    value={mailSettings.smtp_user}
                    onChange={(e) => setMailSettings({ ...mailSettings, smtp_user: e.target.value, from_email: e.target.value })}
                    placeholder={provider === 'gmail' ? 'ornek@gmail.com' : 'ornek@outlook.com'}
                    className="text-lg py-3"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Müşterilerinize mail göndermek için kullanacağınız adres
                  </p>
                </div>

                {/* Şifre */}
                <div className="p-6 bg-gray-800/50 rounded-xl border-2 border-gray-700/50">
                  <label className="block text-lg font-bold text-white mb-3">
                    🔒 Şifre
                  </label>
                  <Input
                    type="password"
                    value={mailSettings.smtp_password}
                    onChange={(e) => setMailSettings({ ...mailSettings, smtp_password: e.target.value })}
                    placeholder="••••••••••••"
                    className="text-lg py-3"
                  />
                  
                  {/* Gmail özel uyarı */}
                  {provider === 'gmail' && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-yellow-200 font-medium mb-2">
                        ⚠️ Gmail kullanıcılarına özel:
                      </p>
                      <p className="text-sm text-yellow-100">
                        Gmail'de 2 adımlı doğrulama <strong>açıksa</strong>, normal şifreniz <strong>çalışmaz</strong>!
                      </p>
                      <p className="text-sm text-yellow-100 mt-2">
                        "Uygulama Şifresi" oluşturmalısınız:
                      </p>
                      <ol className="list-decimal list-inside text-sm text-yellow-100 mt-2 space-y-1 ml-2">
                        <li>Google hesabınıza girin</li>
                        <li>Güvenlik → 2 Adımlı Doğrulama</li>
                        <li>En altta "Uygulama şifreleri" bulun</li>
                        <li>16 haneli şifreyi kopyalayın ve buraya yapıştırın</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {/* Test ve Kaydet Butonları */}
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={handleTestConnection}
                  disabled={testing || !mailSettings.smtp_user || !mailSettings.smtp_password}
                  variant="secondary"
                  className="w-full py-4 text-lg"
                >
                  {testing ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin mr-2" />
                      Bağlantı test ediliyor...
                    </>
                  ) : (
                    <>
                      <Shield className="w-6 h-6 mr-2" />
                      1. Önce Bağlantıyı Test Et
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 text-lg bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin mr-2" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 mr-2" />
                      2. Kaydet ve Kullanmaya Başla
                    </>
                  )}
                </Button>
              </div>

              {/* Geri dön butonu */}
              <button
                onClick={() => {
                  setStep(1)
                  setProvider(null)
                }}
                className="mt-4 text-gray-400 hover:text-white transition-colors"
              >
                ← Geri dön (Başka mail servisi seç)
              </button>
          </Card>

          {/* Başarı mesajı */}
          {mailSettings.enabled && (
            <Card title="✅ Başarılı!" subtitle="Mail sistemi aktif">
              <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Mail Sistemi Hazır!</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Artık sipariş detay sayfalarında <strong>"Mail Gönder"</strong> butonu göreceksiniz.
                  Müşterilerinize tek tıkla sipariş maili gönderebilirsiniz!
                </p>
                <p className="text-sm text-gray-400">
                  📧 Mail içeriği: Sipariş detayları + PDF eki
                </p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

