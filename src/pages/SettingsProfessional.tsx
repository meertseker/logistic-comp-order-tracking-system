import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon,
  Mail, 
  MessageCircle,
  Database,
  Download,
  Upload,
  FileText,
  BarChart3,
  Info,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowRight,
  HardDrive,
  Package,
  FileSpreadsheet,
  Building2,
  Server,
  Edit,
  Receipt,
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { useToast } from '../context/ToastContext'

type Tab = 'mail' | 'whatsapp' | 'uyumsoft' | 'export' | 'system' | 'license'
type MailProvider = 'gmail' | 'outlook' | 'custom' | null
type WhatsAppProvider = 'iletimerkezi' | 'netgsm' | 'twilio' | null

export default function SettingsProfessional() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('mail')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [step, setStep] = useState<1 | 2>(1)
  const [provider, setProvider] = useState<MailProvider>(null)
  const [whatsappProvider, setWhatsappProvider] = useState<WhatsAppProvider>(null)
  
  const [mailSettings, setMailSettings] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'Sekersoft',
    company_name: 'Şirket Adı',
    enabled: false,
  })
  
  const [whatsappSettings, setWhatsappSettings] = useState({
    provider: 'iletimerkezi',
    api_key: '',
    api_secret: '',
    api_username: '',
    api_password: '',
    sender_name: 'Sekersoft',
    sender_phone: '',
    enabled: false,
    auto_send_on_created: true,
    auto_send_on_status_change: true,
    auto_send_on_delivered: true,
    auto_send_on_invoiced: true,
    template_order_created: '',
    template_order_on_way: '',
    template_order_delivered: '',
    template_order_invoiced: '',
    template_order_cancelled: '',
    template_custom: '',
    company_name: 'Sekersoft',
  })
  
  const [uyumsoftSettings, setUyumsoftSettings] = useState({
    api_key: '',
    api_secret: '',
    environment: 'TEST',
    company_name: '',
    company_tax_number: '',
    company_tax_office: '',
    company_address: '',
    company_city: '',
    company_district: '',
    company_postal_code: '',
    company_phone: '',
    company_email: '',
    sender_email: '',
    auto_send_email: true,
    auto_approve: false,
    invoice_prefix: 'SEK',
    enabled: false,
  })
  
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [licenseInfo, setLicenseInfo] = useState<any>(null)
  const [isTestModeActive, setIsTestModeActive] = useState(false)
  const [checkingUpdate, setCheckingUpdate] = useState(false)

  useEffect(() => {
    loadSettings()
    
    // Güncelleme event'lerini dinle
    const electronAPI = (window as any).electronAPI
    if (electronAPI?.update) {
      const handleUpdateAvailable = (info: any) => {
        setCheckingUpdate(false)
        showToast(`Yeni güncelleme mevcut: v${info.version}`, 'success')
      }
      
      const handleUpdateNotAvailable = () => {
        setCheckingUpdate(false)
        showToast('Uygulama güncel - en son versiyonu kullanıyorsunuz', 'success')
      }
      
      const handleUpdateError = (message: string) => {
        setCheckingUpdate(false)
        showToast(`Güncelleme hatası: ${message}`, 'error')
      }
      
      const handleUpdateStatus = (message: string) => {
        console.log('Update status:', message)
      }
      
      electronAPI.update.onUpdateAvailable(handleUpdateAvailable)
      electronAPI.update.onUpdateNotAvailable(handleUpdateNotAvailable)
      electronAPI.update.onUpdateError(handleUpdateError)
      electronAPI.update.onUpdateStatus(handleUpdateStatus)
      
      return () => {
        electronAPI.update.removeAllListeners()
      }
    }
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Mail ayarlarını yükle
      const settings = await window.electronAPI.mail.getSettings()
      if (settings && settings.smtp_host) {
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
          from_name: settings.from_name || 'Sekersoft',
          company_name: settings.company_name || 'Şirket Adı',
          enabled: settings.enabled === 1,
        })
        
        setStep(2)
      }
      
      // WhatsApp ayarlarını yükle
      const whatsappSetts = await window.electronAPI.whatsapp.getSettings()
      if (whatsappSetts) {
        setWhatsappSettings({
          provider: whatsappSetts.provider || 'iletimerkezi',
          api_key: whatsappSetts.api_key || '',
          api_secret: whatsappSetts.api_secret || '',
          api_username: whatsappSetts.api_username || '',
          api_password: whatsappSetts.api_password || '',
          sender_name: whatsappSetts.sender_name || 'Sekersoft',
          sender_phone: whatsappSetts.sender_phone || '',
          enabled: whatsappSetts.enabled === 1,
          auto_send_on_created: whatsappSetts.auto_send_on_created === 1,
          auto_send_on_status_change: whatsappSetts.auto_send_on_status_change === 1,
          auto_send_on_delivered: whatsappSetts.auto_send_on_delivered === 1,
          auto_send_on_invoiced: whatsappSetts.auto_send_on_invoiced === 1,
          template_order_created: whatsappSetts.template_order_created || '',
          template_order_on_way: whatsappSetts.template_order_on_way || '',
          template_order_delivered: whatsappSetts.template_order_delivered || '',
          template_order_invoiced: whatsappSetts.template_order_invoiced || '',
          template_order_cancelled: whatsappSetts.template_order_cancelled || '',
          template_custom: whatsappSetts.template_custom || '',
          company_name: whatsappSetts.company_name || 'Sekersoft',
        })
        
        setWhatsappProvider(whatsappSetts.provider || 'iletimerkezi')
      }
      
      // Uyumsoft ayarlarını yükle
      const uyumsoftSetts = await window.electronAPI.uyumsoft.getSettings()
      if (uyumsoftSetts) {
        setUyumsoftSettings({
          api_key: uyumsoftSetts.api_key || '',
          api_secret: uyumsoftSetts.api_secret || '',
          environment: uyumsoftSetts.environment || 'TEST',
          company_name: uyumsoftSetts.company_name || '',
          company_tax_number: uyumsoftSetts.company_tax_number || '',
          company_tax_office: uyumsoftSetts.company_tax_office || '',
          company_address: uyumsoftSetts.company_address || '',
          company_city: uyumsoftSetts.company_city || '',
          company_district: uyumsoftSetts.company_district || '',
          company_postal_code: uyumsoftSetts.company_postal_code || '',
          company_phone: uyumsoftSetts.company_phone || '',
          company_email: uyumsoftSetts.company_email || '',
          sender_email: uyumsoftSetts.sender_email || '',
          auto_send_email: uyumsoftSetts.auto_send_email === 1,
          auto_approve: uyumsoftSetts.auto_approve === 1,
          invoice_prefix: uyumsoftSetts.invoice_prefix || 'SEK',
          enabled: uyumsoftSetts.enabled === 1,
        })
      }
      
      // Sistem bilgilerini yükle
      const sysInfo = await window.electronAPI.system.getInfo()
      setSystemInfo(sysInfo)
      
      // Lisans bilgilerini yükle
      const licInfo = await window.electronAPI.license.getInfo()
      setLicenseInfo(licInfo)
      
      // Test modu durumunu kontrol et
      const testModeStatus = await window.electronAPI.dev.getTestModeStatus()
      setIsTestModeActive(testModeStatus.isActive)
    } catch (error) {
      console.error('Failed to load settings:', error)
      showToast('Ayarlar yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }
  
  const selectProvider = (selectedProvider: MailProvider) => {
    setProvider(selectedProvider)
    
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
      
      const finalSettings = {
        ...mailSettings,
        from_email: mailSettings.from_email || mailSettings.smtp_user,
        enabled: true,
      }
      
      await window.electronAPI.mail.saveSettings(finalSettings)
      setMailSettings(finalSettings)
      
      showToast('✅ Mail sistemi başarıyla yapılandırıldı!', 'success')
    } catch (error) {
      console.error('Failed to save settings:', error)
      showToast('Ayarlar kaydedilemedi', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveUyumsoft = async () => {
    if (!uyumsoftSettings.api_key || !uyumsoftSettings.api_secret) {
      showToast('Lütfen API Key ve API Secret bilgilerini girin', 'error')
      return
    }
    
    if (!uyumsoftSettings.company_name || !uyumsoftSettings.company_tax_number) {
      showToast('Lütfen firma bilgilerini eksiksiz doldurun', 'error')
      return
    }
    
    try {
      setSaving(true)
      
      const finalSettings = {
        ...uyumsoftSettings,
        enabled: true,
      }
      
      await window.electronAPI.uyumsoft.saveSettings(finalSettings)
      setUyumsoftSettings(finalSettings)
      
      showToast('✅ Uyumsoft API başarıyla yapılandırıldı!', 'success')
    } catch (error) {
      console.error('Failed to save Uyumsoft settings:', error)
      showToast('Ayarlar kaydedilemedi', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveWhatsApp = async () => {
    if (!whatsappSettings.api_key || !whatsappSettings.sender_phone) {
      showToast('Lütfen API Key ve Gönderici Telefon bilgilerini girin', 'error')
      return
    }
    
    try {
      setSaving(true)
      
      const finalSettings = {
        ...whatsappSettings,
        enabled: true,
      }
      
      await window.electronAPI.whatsapp.saveSettings(finalSettings)
      setWhatsappSettings(finalSettings)
      
      showToast('✅ WhatsApp servisi başarıyla yapılandırıldı!', 'success')
    } catch (error) {
      console.error('Failed to save WhatsApp settings:', error)
      showToast('Ayarlar kaydedilemedi', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleTestWhatsApp = async () => {
    if (!whatsappSettings.api_key || !whatsappSettings.sender_phone) {
      showToast('Lütfen önce ayarları kaydedin', 'error')
      return
    }
    
    try {
      setTesting(true)
      showToast('Test mesajı gönderiliyor...', 'info')
      
      const result = await window.electronAPI.whatsapp.testConnection()
      
      if (result.success) {
        showToast('✅ ' + result.message, 'success')
      } else {
        showToast('❌ ' + result.message, 'error')
      }
    } catch (error) {
      console.error('WhatsApp test error:', error)
      showToast('Test başarısız', 'error')
    } finally {
      setTesting(false)
    }
  }
  
  const handleTestUyumsoft = async () => {
    try {
      setTesting(true)
      const result = await window.electronAPI.uyumsoft.testConnection()
      
      if (result.success) {
        showToast('✅ ' + result.message, 'success')
      } else {
        showToast('❌ ' + result.message, 'error')
      }
    } catch (error: any) {
      console.error('Failed to test Uyumsoft connection:', error)
      showToast('Bağlantı testi başarısız: ' + (error.message || 'Bilinmeyen hata'), 'error')
    } finally {
      setTesting(false)
    }
  }

  const handleTestConnection = async () => {
    if (!mailSettings.smtp_user || !mailSettings.smtp_password) {
      showToast('Lütfen mail adresinizi ve şifrenizi girin', 'error')
      return
    }
    
    try {
      setTesting(true)
      
      const testSettings = {
        ...mailSettings,
        from_email: mailSettings.from_email || mailSettings.smtp_user,
        enabled: false,
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

  const handleExportAllData = async () => {
    try {
      setExporting(true)
      showToast('Veriler dışa aktarılıyor...', 'info')
      
      const result = await window.electronAPI.export.allData()
      
      if (result.success) {
        showToast(`✅ Tüm veriler başarıyla dışa aktarıldı!`, 'success')
      } else {
        showToast(`❌ Dışa aktarma hatası: ${result.error}`, 'error')
      }
    } catch (error: any) {
      showToast(`Dışa aktarma başarısız: ${error.message}`, 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      showToast('Siparişler CSV formatında dışa aktarılıyor...', 'info')
      
      const result = await window.electronAPI.export.ordersCSV()
      
      if (result.success) {
        showToast(`✅ Siparişler CSV olarak dışa aktarıldı!`, 'success')
      } else {
        showToast(`❌ Dışa aktarma hatası: ${result.error}`, 'error')
      }
    } catch (error: any) {
      showToast(`Dışa aktarma başarısız: ${error.message}`, 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleExportDatabase = async () => {
    try {
      setExporting(true)
      showToast('Veritabanı yedekleniyor...', 'info')
      
      const result = await window.electronAPI.export.database()
      
      if (result.success) {
        showToast(`✅ Veritabanı başarıyla yedeklendi!`, 'success')
      } else {
        showToast(`❌ Yedekleme hatası: ${result.error}`, 'error')
      }
    } catch (error: any) {
      showToast(`Yedekleme başarısız: ${error.message}`, 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleExportStatistics = async () => {
    try {
      setExporting(true)
      showToast('İstatistik raporu oluşturuluyor...', 'info')
      
      const result = await window.electronAPI.export.statistics()
      
      if (result.success) {
        showToast(`✅ İstatistik raporu oluşturuldu!`, 'success')
      } else {
        showToast(`❌ Rapor hatası: ${result.error}`, 'error')
      }
    } catch (error: any) {
      showToast(`Rapor oluşturma başarısız: ${error.message}`, 'error')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const tabs = [
    { id: 'mail' as Tab, label: 'Mail Ayarları', icon: Mail },
    { id: 'whatsapp' as Tab, label: 'WhatsApp Ayarları', icon: MessageCircle },
    { id: 'uyumsoft' as Tab, label: 'Uyumsoft E-Fatura', icon: Receipt },
    { id: 'export' as Tab, label: 'Veri Yönetimi', icon: Database },
    { id: 'license' as Tab, label: 'Lisans Bilgileri', icon: Shield },
    { id: 'system' as Tab, label: 'Sistem Bilgileri', icon: Info },
  ]

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            Ayarlar
          </h1>
          <p className="text-gray-400">Sistem ayarlarını yönetin ve veri yedekleme yapın</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Mail Settings Tab */}
      {activeTab === 'mail' && (
        <div className="space-y-6">
          {step === 1 && (
            <Card title="📧 Mail Servisinizi Seçin" subtitle="Hangi mail adresinizi kullanıyorsunuz?">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  onClick={() => selectProvider('gmail')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-8 bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500/30 rounded-2xl hover:border-red-500/60 transition-all"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">📧</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Gmail</h3>
                    <p className="text-gray-300 text-sm mb-4">@gmail.com adresi kullanıyorum</p>
                    <div className="flex items-center justify-center gap-2 text-red-400">
                      <span className="font-medium">Seç</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => selectProvider('outlook')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 rounded-2xl hover:border-blue-500/60 transition-all"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">📬</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Outlook / Hotmail</h3>
                    <p className="text-gray-300 text-sm mb-4">@outlook.com veya @hotmail.com</p>
                    <div className="flex items-center justify-center gap-2 text-blue-400">
                      <span className="font-medium">Seç</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.button>
              </div>
            </Card>
          )}

          {step === 2 && provider && (
            <>
              {mailSettings.enabled ? (
                <Card title="✅ Mail Sistemi Yapılandırıldı">
                  <div className="space-y-6">
                    <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        <h3 className="text-xl font-bold text-white">Mail Sistemi Aktif!</h3>
                      </div>
                      
                      <div className="space-y-3 text-gray-300">
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-green-400" />
                          <span className="font-medium">Mail Adresi:</span>
                          <span>{mailSettings.smtp_user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-green-400" />
                          <span className="font-medium">Şirket İsmi:</span>
                          <span>{mailSettings.company_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-green-400" />
                          <span className="font-medium">SMTP:</span>
                          <span>{mailSettings.smtp_host}:{mailSettings.smtp_port}</span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mt-4">
                        Sipariş detay sayfalarında &quot;Mail Gönder&quot; butonu ile müşterilerinize otomatik mail gönderebilirsiniz.
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        setMailSettings({ ...mailSettings, enabled: false })
                        // Ayarları düzenle moduna geç ama enabled'ı false yap
                      }}
                      variant="secondary"
                      className="w-full"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Ayarları Düzenle
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card 
                  title={`📧 ${provider === 'gmail' ? 'Gmail' : 'Outlook'} Bilgilerinizi Girin`}
                  subtitle="Mail gönderme ayarları"
                >
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-800/50 rounded-xl border-2 border-gray-700/50">
                      <label className="block text-lg font-bold text-white mb-3">📧 Mail Adresiniz</label>
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

                    <div className="p-6 bg-gray-800/50 rounded-xl border-2 border-gray-700/50">
                      <label className="block text-lg font-bold text-white mb-3">🔒 Şifre</label>
                      <Input
                        type="password"
                        value={mailSettings.smtp_password}
                        onChange={(e) => setMailSettings({ ...mailSettings, smtp_password: e.target.value })}
                        placeholder="••••••••••••"
                        className="text-lg py-3"
                      />
                      
                      {provider === 'gmail' && (
                        <div className="mt-4 p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg">
                          <p className="text-sm text-yellow-200 font-medium mb-2">⚠️ Gmail kullanıcılarına özel:</p>
                          <p className="text-sm text-yellow-100 mb-3">
                            Gmail&apos;de 2 adımlı doğrulama <strong>açıksa</strong>, normal şifreniz <strong>çalışmaz</strong>!
                            &quot;Uygulama Şifresi&quot; oluşturmalısınız.
                          </p>
                          <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-yellow-300 hover:text-yellow-100 font-medium underline transition-colors"
                          >
                            🔗 Uygulama Şifresi Oluştur
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-gray-800/50 rounded-xl border-2 border-gray-700/50">
                      <label className="block text-lg font-bold text-white mb-3">🏢 Şirket İsmi</label>
                      <Input
                        type="text"
                        value={mailSettings.company_name}
                        onChange={(e) => setMailSettings({ ...mailSettings, company_name: e.target.value })}
                        placeholder="Şirket Adı"
                        className="text-lg py-3"
                      />
                      <p className="text-sm text-gray-400 mt-2">
                        E-maillerde görünecek şirket ismi (ör: ACME Lojistik)
                      </p>
                    </div>
                  </div>

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
                          Test ediliyor...
                        </>
                      ) : (
                        <>
                          <Shield className="w-6 h-6 mr-2" />
                          Bağlantıyı Test Et
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
                          Kaydet ve Kullanmaya Başla
                        </>
                      )}
                    </Button>
                  </div>

                  <button
                    onClick={() => {
                      setStep(1)
                      setProvider(null)
                    }}
                    className="mt-4 text-gray-400 hover:text-white transition-colors"
                  >
                    ← Geri dön
                  </button>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* WhatsApp Settings Tab */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          {whatsappSettings.enabled ? (
            <Card title="✅ WhatsApp Sistemi Yapılandırıldı">
              <div className="space-y-6">
                <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-bold text-white">WhatsApp Sistemi Aktif!</h3>
                  </div>
                  
                  <div className="space-y-3 text-gray-300">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Servis:</span>
                      <span className="px-3 py-1 bg-green-500/20 rounded-lg font-medium capitalize">
                        {whatsappSettings.provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Gönderici:</span>
                      <span>{whatsappSettings.sender_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Otomatik Bildirimler:</span>
                      <span className="px-3 py-1 bg-blue-500/20 rounded-lg">
                        {whatsappSettings.auto_send_on_status_change ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <Button 
                      onClick={handleTestWhatsApp} 
                      disabled={testing}
                      variant="secondary"
                    >
                      {testing ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin mr-2" />
                          Test Ediliyor...
                        </>
                      ) : (
                        'Test Mesajı Gönder'
                      )}
                    </Button>
                    <Button 
                      onClick={() => setWhatsappSettings({ ...whatsappSettings, enabled: false })}
                      variant="danger"
                    >
                      Ayarları Değiştir
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card title="🟢 WhatsApp Servisi Seçin" subtitle="Hangi WhatsApp API servisini kullanmak istersiniz?">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.button
                    onClick={() => {
                      setWhatsappProvider('iletimerkezi')
                      setWhatsappSettings({ ...whatsappSettings, provider: 'iletimerkezi' })
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      p-6 bg-gradient-to-br rounded-2xl border-2 transition-all
                      ${whatsappProvider === 'iletimerkezi'
                        ? 'from-green-500/30 to-green-600/30 border-green-500/60'
                        : 'from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-500/40'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🇹🇷</div>
                      <h3 className="text-xl font-bold text-white mb-2">İletimerkezi</h3>
                      <p className="text-gray-300 text-sm mb-3">Türk servisi - Kolay kurulum</p>
                      <div className="text-green-400 text-xs">✓ Önerilen</div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setWhatsappProvider('netgsm')
                      setWhatsappSettings({ ...whatsappSettings, provider: 'netgsm' })
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      p-6 bg-gradient-to-br rounded-2xl border-2 transition-all
                      ${whatsappProvider === 'netgsm'
                        ? 'from-blue-500/30 to-blue-600/30 border-blue-500/60'
                        : 'from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-500/40'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">📱</div>
                      <h3 className="text-xl font-bold text-white mb-2">NetGSM</h3>
                      <p className="text-gray-300 text-sm mb-3">SMS + WhatsApp</p>
                      <div className="text-blue-400 text-xs">Güvenilir</div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setWhatsappProvider('twilio')
                      setWhatsappSettings({ ...whatsappSettings, provider: 'twilio' })
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      p-6 bg-gradient-to-br rounded-2xl border-2 transition-all
                      ${whatsappProvider === 'twilio'
                        ? 'from-purple-500/30 to-purple-600/30 border-purple-500/60'
                        : 'from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-500/40'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🌍</div>
                      <h3 className="text-xl font-bold text-white mb-2">Twilio</h3>
                      <p className="text-gray-300 text-sm mb-3">Global servis</p>
                      <div className="text-purple-400 text-xs">Gelişmiş</div>
                    </div>
                  </motion.button>
                </div>
              </Card>

              {whatsappProvider && (
                <Card title="⚙️ WhatsApp API Ayarları" subtitle="API bilgilerinizi girin">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          API Key / Username *
                        </label>
                        <Input
                          value={whatsappSettings.api_key || whatsappSettings.api_username}
                          onChange={(e) => setWhatsappSettings({
                            ...whatsappSettings,
                            api_key: e.target.value,
                            api_username: e.target.value
                          })}
                          placeholder="API Key veya kullanıcı adı"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          API Secret / Password *
                        </label>
                        <Input
                          type="password"
                          value={whatsappSettings.api_secret || whatsappSettings.api_password}
                          onChange={(e) => setWhatsappSettings({
                            ...whatsappSettings,
                            api_secret: e.target.value,
                            api_password: e.target.value
                          })}
                          placeholder="API Secret veya şifre"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Gönderici Telefon *
                        </label>
                        <Input
                          value={whatsappSettings.sender_phone}
                          onChange={(e) => setWhatsappSettings({
                            ...whatsappSettings,
                            sender_phone: e.target.value
                          })}
                          placeholder="+90 555 123 4567"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Başında +90 ile yazın
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Şirket Adı
                        </label>
                        <Input
                          value={whatsappSettings.company_name}
                          onChange={(e) => setWhatsappSettings({
                            ...whatsappSettings,
                            company_name: e.target.value
                          })}
                          placeholder="Sekersoft"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        📬 Otomatik Bildirimler
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={whatsappSettings.auto_send_on_created}
                            onChange={(e) => setWhatsappSettings({
                              ...whatsappSettings,
                              auto_send_on_created: e.target.checked
                            })}
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-gray-300">Sipariş oluşturulduğunda gönder</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={whatsappSettings.auto_send_on_status_change}
                            onChange={(e) => setWhatsappSettings({
                              ...whatsappSettings,
                              auto_send_on_status_change: e.target.checked
                            })}
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-gray-300">Durum değiştiğinde gönder (Yolda, Teslim vb.)</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={whatsappSettings.auto_send_on_delivered}
                            onChange={(e) => setWhatsappSettings({
                              ...whatsappSettings,
                              auto_send_on_delivered: e.target.checked
                            })}
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-gray-300">Teslimat tamamlandığında gönder</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={whatsappSettings.auto_send_on_invoiced}
                            onChange={(e) => setWhatsappSettings({
                              ...whatsappSettings,
                              auto_send_on_invoiced: e.target.checked
                            })}
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-gray-300">Fatura kesildiğinde gönder</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                      <Button
                        onClick={() => setWhatsappProvider(null)}
                        variant="secondary"
                      >
                        Geri
                      </Button>
                      <Button
                        onClick={handleSaveWhatsApp}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin mr-2" />
                            Kaydediliyor...
                          </>
                        ) : (
                          'Kaydet ve Aktifleştir'
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Uyumsoft E-Fatura Tab */}
      {activeTab === 'uyumsoft' && (
        <div className="space-y-6">
          {uyumsoftSettings.enabled ? (
            <Card title="✅ Uyumsoft E-Fatura Sistemi Yapılandırıldı">
              <div className="space-y-6">
                <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-bold text-white">E-Fatura Sistemi Aktif!</h3>
                  </div>
                  
                  <div className="space-y-3 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Firma:</span>
                      <span>{uyumsoftSettings.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Vergi No:</span>
                      <span>{uyumsoftSettings.company_tax_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Ortam:</span>
                      <span className={`px-2 py-1 rounded ${uyumsoftSettings.environment === 'PRODUCTION' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {uyumsoftSettings.environment === 'PRODUCTION' ? 'Canlı' : 'Test'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Otomatik E-posta:</span>
                      <span>{uyumsoftSettings.auto_send_email ? 'Açık' : 'Kapalı'}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mt-4">
                    Sipariş detay sayfalarında &quot;Faturala&quot; butonu ile yasal e-fatura/e-arşiv oluşturabilirsiniz.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleTestUyumsoft}
                    variant="secondary"
                    disabled={testing}
                  >
                    {testing ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Test Ediliyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Bağlantıyı Test Et
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setUyumsoftSettings({ ...uyumsoftSettings, enabled: false })
                    }}
                    variant="secondary"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Ayarları Düzenle
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card 
                title="🧾 Uyumsoft E-Fatura Entegrasyonu"
                subtitle="Yasal e-fatura ve e-arşiv fatura oluşturun"
              >
                <div className="space-y-6">
                  <div className="p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-3">ℹ️ Uyumsoft Nedir?</h3>
                    <p className="text-gray-300 mb-3">
                      Uyumsoft, GİB (Gelir İdaresi Başkanlığı) entegre e-fatura ve e-arşiv fatura çözümüdür.
                      Bu entegrasyon ile yasal faturalarınızı otomatik oluşturup müşterilerinize gönderebilirsiniz.
                    </p>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span>E-Arşiv fatura (bireysel müşteriler için)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span>E-Fatura (kurumsal müşteriler için)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span>Otomatik GİB bildirimi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span>E-posta ile otomatik gönderim</span>
                      </li>
                    </ul>
                    <div className="mt-4 flex items-center gap-2 text-yellow-200">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Uyumsoft hesabınız yoksa, <a href="https://uyumsoft.com.tr" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">uyumsoft.com.tr</a> adresinden oluşturabilirsiniz.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">🔑 API Bilgileri</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                        <Input
                          type="text"
                          value={uyumsoftSettings.api_key}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, api_key: e.target.value })}
                          placeholder="uyumsoft-api-key-xxxx"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Secret</label>
                        <Input
                          type="password"
                          value={uyumsoftSettings.api_secret}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, api_secret: e.target.value })}
                          placeholder="••••••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Ortam</label>
                        <select
                          value={uyumsoftSettings.environment}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, environment: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        >
                          <option value="TEST">Test Ortamı</option>
                          <option value="PRODUCTION">Canlı Ortam</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                          Önce TEST ortamında deneyip, sonra PRODUCTION&apos;a geçin
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">🏢 Firma Bilgileri</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Firma Ünvanı *</label>
                        <Input
                          type="text"
                          value={uyumsoftSettings.company_name}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, company_name: e.target.value })}
                          placeholder="ABC Nakliyat Ltd. Şti."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Vergi Numarası *</label>
                        <Input
                          type="text"
                          value={uyumsoftSettings.company_tax_number}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, company_tax_number: e.target.value })}
                          placeholder="1234567890"
                          maxLength={10}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Vergi Dairesi *</label>
                        <Input
                          type="text"
                          value={uyumsoftSettings.company_tax_office}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, company_tax_office: e.target.value })}
                          placeholder="Kadıköy"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">📍 İletişim Bilgileri (Opsiyonel)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Şehir</label>
                        <Input
                          type="text"
                          value={uyumsoftSettings.company_city}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, company_city: e.target.value })}
                          placeholder="İstanbul"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">İlçe</label>
                        <Input
                          type="text"
                          value={uyumsoftSettings.company_district}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, company_district: e.target.value })}
                          placeholder="Kadıköy"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Adres</label>
                      <Input
                        type="text"
                        value={uyumsoftSettings.company_address}
                        onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, company_address: e.target.value })}
                        placeholder="Moda Cad. No:123 Kadıköy/İstanbul"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
                        <Input
                          type="tel"
                          value={uyumsoftSettings.company_phone}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, company_phone: e.target.value })}
                          placeholder="0212 xxx xx xx"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                        <Input
                          type="email"
                          value={uyumsoftSettings.company_email}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, company_email: e.target.value })}
                          placeholder="info@firma.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">⚙️ Fatura Ayarları</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Fatura Prefix</label>
                        <Input
                          type="text"
                          value={uyumsoftSettings.invoice_prefix}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, invoice_prefix: e.target.value.toUpperCase().slice(0, 3) })}
                          placeholder="SEK"
                          maxLength={3}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Fatura No: {uyumsoftSettings.invoice_prefix}2024000001
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Gönderen E-posta</label>
                        <Input
                          type="email"
                          value={uyumsoftSettings.sender_email}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, sender_email: e.target.value })}
                          placeholder="fatura@firma.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uyumsoftSettings.auto_send_email}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, auto_send_email: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Faturaları otomatik olarak müşteriye e-posta ile gönder</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uyumsoftSettings.auto_approve}
                          onChange={(e) => setUyumsoftSettings({ ...uyumsoftSettings, auto_approve: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Faturaları otomatik olarak onayla (dikkatli kullanın!)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleTestUyumsoft}
                      variant="secondary"
                      disabled={testing || !uyumsoftSettings.api_key || !uyumsoftSettings.api_secret}
                    >
                      {testing ? (
                        <>
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          Test Ediliyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Bağlantıyı Test Et
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleSaveUyumsoft}
                      disabled={saving || !uyumsoftSettings.api_key || !uyumsoftSettings.api_secret || !uyumsoftSettings.company_name}
                    >
                      {saving ? (
                        <>
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Kaydet ve Aktif Et
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <Card title="📦 Veri Yönetimi" subtitle="Verilerinizi yedekleyin ve dışa aktarın">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export All Data */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 rounded-2xl"
              >
                <Package className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Tüm Verileri Dışa Aktar</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Siparişler, araçlar, güzergahlar ve tüm sistem verilerini JSON formatında indirin
                </p>
                <Button
                  onClick={handleExportAllData}
                  disabled={exporting}
                  className="w-full"
                >
                  <Download className="w-5 h-5 mr-2" />
                  JSON İndir
                </Button>
              </motion.div>

              {/* Export CSV */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/30 rounded-2xl"
              >
                <FileSpreadsheet className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Siparişleri CSV Olarak İndir</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Siparişlerinizi Excel&apos;de açabileceğiniz CSV formatında indirin
                </p>
                <Button
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  CSV İndir
                </Button>
              </motion.div>

              {/* Export Database */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-500/30 rounded-2xl"
              >
                <HardDrive className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Veritabanını Yedekle</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Tüm veritabanını (.db dosyası) yedekleyin. Başka bilgisayara taşımak için ideal
                </p>
                <Button
                  onClick={handleExportDatabase}
                  disabled={exporting}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Yedek Al
                </Button>
              </motion.div>

              {/* Export Statistics */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-2 border-orange-500/30 rounded-2xl"
              >
                <BarChart3 className="w-12 h-12 text-orange-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">İstatistik Raporu</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Detaylı istatistik raporu oluşturun (gelir, gider, kar, aylık analiz)
                </p>
                <Button
                  onClick={handleExportStatistics}
                  disabled={exporting}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Rapor Oluştur
                </Button>
              </motion.div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-200">
                <strong>💡 Not:</strong> Dışa aktarılan veriler bilgisayarınızın &quot;Belgeler&quot; klasörüne kaydedilir.
                Verilerinizi düzenli olarak yedeklemenizi öneririz.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* License Tab */}
      {activeTab === 'license' && licenseInfo && (
        <div className="space-y-6">
          <Card title="🔐 Lisans Bilgileri" subtitle="Ürün lisans durumunuz">
            <div className="space-y-4">
              <div className="p-6 bg-gray-800/50 rounded-xl border-2 border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-green-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Lisans Durumu</h3>
                    <p className="text-sm text-green-400">Aktif ve Geçerli</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-400">Şirket Adı</p>
                    <p className="text-white font-medium">{licenseInfo.companyName || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-medium">{licenseInfo.email || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Aktivasyon Tarihi</p>
                    <p className="text-white font-medium">
                      {licenseInfo.activatedAt ? new Date(licenseInfo.activatedAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Son Kontrol</p>
                    <p className="text-white font-medium">
                      {licenseInfo.lastChecked ? new Date(licenseInfo.lastChecked).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl">
                <p className="text-sm text-blue-200">
                  <strong>ℹ️ Lisans Hakkında:</strong> Bu lisans sadece bu bilgisayarda geçerlidir.
                  Farklı bir bilgisayarda kullanmak için yeni bir lisans almanız gerekir.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* System Info Tab */}
      {activeTab === 'system' && systemInfo && (
        <div className="space-y-6">
          <Card title="💻 Sistem Bilgileri" subtitle="Uygulama ve sistem detayları">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-800/50 rounded-xl border-2 border-gray-700/50">
                <Info className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-4">Uygulama Bilgileri</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400">Uygulama Adı</p>
                    <p className="text-white font-medium">{systemInfo.appName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Versiyon</p>
                    <p className="text-white font-medium">{systemInfo.appVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Platform</p>
                    <p className="text-white font-medium">
                      {systemInfo.platform === 'darwin' ? 'macOS' : systemInfo.platform === 'win32' ? 'Windows' : 'Linux'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Mimari</p>
                    <p className="text-white font-medium">{systemInfo.arch}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-800/50 rounded-xl border-2 border-gray-700/50">
                <HardDrive className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-4">Sistem Bileşenleri</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400">Electron</p>
                    <p className="text-white font-medium">{systemInfo.electronVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Node.js</p>
                    <p className="text-white font-medium">{systemInfo.nodeVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Chrome</p>
                    <p className="text-white font-medium">{systemInfo.chromeVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Veri Klasörü</p>
                    <p className="text-white font-medium text-xs break-all">{systemInfo.userDataPath}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl">
              <p className="text-sm text-yellow-200">
                <strong>🔄 Güncelleme Hakkında:</strong> Yeni versiyon yayınlandığında size bildirim gelecektir.
                Güncelleme dosyasını indirip kurmanız yeterlidir. Verileriniz otomatik olarak korunur.
              </p>
            </div>

            {/* Manuel Güncelleme Kontrolü */}
            <div className="mt-6">
              <Button
                onClick={async () => {
                  try {
                    setCheckingUpdate(true)
                    const electronAPI = (window as any).electronAPI
                    if (electronAPI?.update) {
                      showToast('Güncellemeler kontrol ediliyor...', 'info')
                      const result = await electronAPI.update.check()
                      if (!result.success) {
                        setCheckingUpdate(false)
                        showToast(result.message || 'Güncelleme kontrolü başarısız', 'error')
                      }
                      // Event'ler sonucu gösterecek, burada sadece başlatıyoruz
                    } else {
                      setCheckingUpdate(false)
                      showToast('Güncelleme özelliği kullanılamıyor', 'warning')
                    }
                  } catch (error: any) {
                    console.error('Update check error:', error)
                    setCheckingUpdate(false)
                    showToast(error.message || 'Güncelleme kontrolünde hata oluştu', 'error')
                  }
                }}
                disabled={checkingUpdate || saving}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Download className="w-5 h-5 mr-2" />
                {checkingUpdate ? 'Kontrol Ediliyor...' : 'Güncellemeleri Kontrol Et'}
              </Button>
            </div>
          </Card>
          
          {/* Development Tools */}
          <Card title="🧪 Geliştirici Araçları" subtitle="Test ve debugging özellikleri">
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">WhatsApp & Uyumsoft Test Modu</h3>
                  <p className="text-sm text-gray-400">UI&apos;ı test etmek için özellikleri gerçek API olmadan aktifleştirin</p>
                </div>
              </div>
              
              {isTestModeActive && (
                <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-sm font-semibold text-green-300">Test Modu Aktif</p>
                  </div>
                  <p className="text-sm text-gray-300">
                    WhatsApp ve Uyumsoft test modunda çalışıyor. API çağrıları başarısız olacak (normal).
                  </p>
                </div>
              )}
              
              <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">✅ Test modunda neler aktifleşir:</p>
                <ul className="text-sm text-gray-400 space-y-1 ml-4">
                  <li>• WhatsApp &quot;Mesaj Gönder&quot; butonları</li>
                  <li>• Uyumsoft &quot;Faturala&quot; butonları</li>
                  <li>• Ayarlar sayfasında test bilgileri</li>
                  <li>• Tüm modal ve form UI&apos;ları</li>
                </ul>
                <p className="text-sm text-yellow-300 mt-3">⚠️ API çağrıları başarısız olur (test verisi)</p>
              </div>
              
              {isTestModeActive ? (
                <Button
                  onClick={async () => {
                    try {
                      setSaving(true)
                      const result = await window.electronAPI.dev.disableTestMode()
                      if (result.success) {
                        showToast(result.message, 'success')
                        // Reload to apply changes
                        setTimeout(() => {
                          window.location.reload()
                        }, 2000)
                      } else {
                        showToast(result.message || 'Test modu kapatılamadı', 'error')
                      }
                    } catch (error: any) {
                      console.error('Disable test mode error:', error)
                      showToast(error.message || 'Test modu kapatılırken hata oluştu', 'error')
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Kapatılıyor...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Test Modunu Kapat
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    try {
                      setSaving(true)
                      const result = await window.electronAPI.dev.enableTestMode()
                      if (result.success) {
                        showToast(result.message, 'success')
                        // Reload to apply changes
                        setTimeout(() => {
                          window.location.reload()
                        }, 2000)
                      } else {
                        showToast(result.message || 'Test modu aktif edilemedi', 'error')
                      }
                    } catch (error: any) {
                      console.error('Enable test mode error:', error)
                      showToast(error.message || 'Test modu aktif edilirken hata oluştu', 'error')
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Aktifleştiriliyor...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Test Modunu Aktifleştir
                    </>
                  )}
                </Button>
              )}
              
              <p className="text-xs text-gray-400 mt-3 text-center">
                {isTestModeActive 
                  ? 'Kapatıldıktan sonra sayfa otomatik yeniden yüklenecek'
                  : 'Aktifleştirdikten sonra sayfa otomatik yeniden yüklenecek'
                }
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

