import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon,
  Mail, 
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
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { useToast } from '../context/ToastContext'

type Tab = 'mail' | 'export' | 'system' | 'license'
type MailProvider = 'gmail' | 'outlook' | 'custom' | null

export default function SettingsProfessional() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('mail')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [step, setStep] = useState<1 | 2>(1)
  const [provider, setProvider] = useState<MailProvider>(null)
  
  const [mailSettings, setMailSettings] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'Sekersoft',
    enabled: false,
  })
  
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [licenseInfo, setLicenseInfo] = useState<any>(null)

  useEffect(() => {
    loadSettings()
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
          enabled: settings.enabled === 1,
        })
        
        setStep(2)
      }
      
      // Sistem bilgilerini yükle
      const sysInfo = await window.electronAPI.system.getInfo()
      setSystemInfo(sysInfo)
      
      // Lisans bilgilerini yükle
      const licInfo = await window.electronAPI.license.getInfo()
      setLicenseInfo(licInfo)
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
                          Gmail'de 2 adımlı doğrulama <strong>açıksa</strong>, normal şifreniz <strong>çalışmaz</strong>!
                          "Uygulama Şifresi" oluşturmalısınız.
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

              {mailSettings.enabled && (
                <Card title="✅ Mail Sistemi Aktif">
                  <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                      <h3 className="text-xl font-bold text-white">Mail Sistemi Hazır!</h3>
                    </div>
                    <p className="text-gray-300">
                      Sipariş detay sayfalarında "Mail Gönder" butonu ile müşterilerinize mail gönderebilirsiniz.
                    </p>
                  </div>
                </Card>
              )}
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
                  Siparişlerinizi Excel'de açabileceğiniz CSV formatında indirin
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
                <strong>💡 Not:</strong> Dışa aktarılan veriler bilgisayarınızın "Belgeler" klasörüne kaydedilir.
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
          </Card>
        </div>
      )}
    </div>
  )
}

