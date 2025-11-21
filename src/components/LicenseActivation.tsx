import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Key, Shield, AlertTriangle, CheckCircle, Copy } from 'lucide-react'
import Button from './Button'
import Input from './Input'

interface LicenseActivationProps {
  onActivated: () => void
}

const LicenseActivation: React.FC<LicenseActivationProps> = ({ onActivated }) => {
  const [machineId, setMachineId] = useState<string>('')
  const [licenseKey, setLicenseKey] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadMachineId()
  }, [])

  const loadMachineId = async () => {
    try {
      const result = await window.electronAPI.license.getMachineId()
      if (result.success && result.machineId) {
        setMachineId(result.machineId)
      }
    } catch (err) {
      console.error('Makine ID alınamadı:', err)
    }
  }

  const handleCopyMachineId = () => {
    navigator.clipboard.writeText(machineId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Form validasyonu
      if (!licenseKey.trim()) {
        setError('Lütfen lisans anahtarını girin')
        setLoading(false)
        return
      }

      if (!companyName.trim()) {
        setError('Lütfen firma adını girin')
        setLoading(false)
        return
      }

      if (!email.trim()) {
        setError('Lütfen e-posta adresini girin')
        setLoading(false)
        return
      }

      // Email validasyonu
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Geçerli bir e-posta adresi girin')
        setLoading(false)
        return
      }

      const result = await window.electronAPI.license.activate(
        licenseKey.trim(),
        companyName.trim(),
        email.trim()
      )

      if (result.success) {
        setSuccess(result.message)
        setTimeout(() => {
          onActivated()
        }, 1500)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Aktivasyon sırasında bir hata oluştu')
      console.error('Aktivasyon hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">
            Sekersoft
          </h1>
          <p className="text-center text-blue-100">
            Lisans Aktivasyonu
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Uyarı */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Önemli Bilgi</p>
              <p>
                Bu yazılım lisanslıdır ve yalnızca yetkili kullanıcılar tarafından kullanılabilir.
                Lisansınızı almak için lütfen aşağıdaki <strong>Makine ID</strong>&apos;nizi satıcınıza iletin.
              </p>
            </div>
          </div>

          {/* Makine ID */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Makine ID (Bu bilgisayarın benzersiz kimliği)
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 break-all">
                {machineId || 'Yükleniyor...'}
              </div>
              <Button
                type="button"
                onClick={handleCopyMachineId}
                disabled={!machineId}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Bu ID&apos;yi lisans sağlayıcınıza göndererek size özel bir lisans anahtarı alın.
            </p>
          </div>

          {/* Aktivasyon Formu */}
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lisans Anahtarı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm uppercase"
                  maxLength={19}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firma Adı
              </label>
              <Input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Firma adınızı girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@firma.com"
              />
            </div>

            {/* Hata mesajı */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}

            {/* Başarı mesajı */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{success}</p>
              </motion.div>
            )}

            {/* Aktivasyon butonu */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg"
            >
              {loading ? 'Aktive Ediliyor...' : 'Lisansı Aktive Et'}
            </Button>
          </form>

          {/* Alt bilgi */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Lisans ile ilgili sorunlar için lütfen satıcınızla iletişime geçin.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LicenseActivation

