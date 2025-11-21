import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, AlertCircle, CheckCircle, X, RefreshCw } from 'lucide-react'
import Button from './Button'

interface UpdateInfo {
  version: string
  releaseNotes?: string
  releaseDate?: string
}

declare global {
  interface Window {
    electronAPI?: {
      update: {
        check: () => Promise<{ success: boolean; message?: string }>
        download: () => Promise<{ success: boolean; message?: string }>
        install: () => Promise<{ success: boolean; message?: string }>
        onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void
        onUpdateNotAvailable: (callback: (info: any) => void) => void
        onDownloadProgress: (callback: (progress: any) => void) => void
        onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void
        onUpdateStatus: (callback: (message: string) => void) => void
        onUpdateError: (callback: (message: string) => void) => void
        removeAllListeners: () => void
      }
    }
  }
}

export default function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloaded, setDownloaded] = useState(false)
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const electronAPI = window.electronAPI

    if (!electronAPI?.update) {
      console.log('UpdateNotification: electron update API not available')
      return
    }

    // Update available
    electronAPI.update.onUpdateAvailable((info: any) => {
      console.log('✨ Update available:', info)
      // electron-updater'dan gelen info objesi farklı yapıda olabilir
      const updateData: UpdateInfo = {
        version: info?.version || info?.updateInfo?.version || 'Yeni',
        releaseNotes: info?.releaseNotes || info?.updateInfo?.releaseNotes,
        releaseDate: info?.releaseDate || info?.updateInfo?.releaseDate,
      }
      setUpdateInfo(updateData)
      setShow(true)
      setError(null)
    })

    // Update not available
    electronAPI.update.onUpdateNotAvailable(() => {
      console.log('✅ App is up to date')
    })

    // Download progress
    electronAPI.update.onDownloadProgress((progressObj: any) => {
      console.log('📥 Download progress:', progressObj.percent)
      setProgress(Math.round(progressObj.percent))
    })

    // Update downloaded
    electronAPI.update.onUpdateDownloaded((info: any) => {
      console.log('✅ Update downloaded:', info)
      // electron-updater'dan gelen info objesi farklı yapıda olabilir
      setUpdateInfo((prevInfo) => {
        if (prevInfo) return prevInfo // Zaten varsa değiştirme
        return {
          version: info?.version || info?.updateInfo?.version || 'Yeni',
          releaseNotes: info?.releaseNotes || info?.updateInfo?.releaseNotes,
          releaseDate: info?.releaseDate || info?.updateInfo?.releaseDate,
        }
      })
      setDownloading(false)
      setDownloaded(true)
      setProgress(100)
    })

    // Update status
    electronAPI.update.onUpdateStatus((message: string) => {
      console.log('📢 Update status:', message)
    })

    // Update error
    electronAPI.update.onUpdateError((message: string) => {
      console.error('❌ Update error:', message)
      setError(message)
      setDownloading(false)
    })

    // Cleanup
    return () => {
      electronAPI.update.removeAllListeners()
    }
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    setProgress(0)
    
    const result = await window.electronAPI?.update.download()
    if (!result?.success) {
      setError(result?.message || 'İndirme başlatılamadı')
      setDownloading(false)
    }
  }

  const handleInstall = async () => {
    await window.electronAPI?.update.install()
  }

  const handleClose = () => {
    setShow(false)
    setError(null)
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-2xl border-2 border-blue-400/30 p-6 backdrop-blur-sm">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          {!downloaded ? (
            <>
              {/* Update Available */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white/10 rounded-xl flex-shrink-0">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-1">
                    🎉 Yeni Güncelleme Mevcut!
                  </h3>
                  {updateInfo?.version ? (
                    <p className="text-blue-100 text-sm">
                      Versiyon <span className="font-semibold text-white">{updateInfo.version}</span> yayınlandı
                    </p>
                  ) : (
                    <p className="text-blue-100 text-sm">
                      Yeni bir güncelleme mevcut
                    </p>
                  )}
                  {updateInfo?.releaseNotes && (
                    <div className="mt-2 p-2 bg-blue-900/30 rounded-lg">
                      <p className="text-xs text-blue-200 whitespace-pre-wrap">
                        {updateInfo.releaseNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-100">{error}</p>
                </div>
              )}

              {/* Progress Bar */}
              {downloading && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-100">İndiriliyor...</span>
                    <span className="text-sm font-semibold text-white">{progress}%</span>
                  </div>
                  <div className="bg-blue-900/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  {downloading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      İndiriliyor...
                    </div>
                  ) : (
                    'Şimdi İndir'
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className="bg-blue-900/50 text-white hover:bg-blue-900/70"
                >
                  Daha Sonra
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Update Downloaded */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <CheckCircle className="w-7 h-7 text-green-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    ✅ Güncelleme Hazır!
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Versiyon {updateInfo?.version} yüklenmeye hazır
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-900/30 rounded-lg mb-4">
                <p className="text-sm text-blue-100">
                  Güncellemeyi şimdi yükleyebilir veya uygulamayı kapattığınızda otomatik olarak yüklenecektir.
                </p>
              </div>

              {/* Install Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-green-600 hover:bg-green-700 font-semibold"
                >
                  Yükle ve Yeniden Başlat
                </Button>
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className="bg-blue-900/50 text-white hover:bg-blue-900/70"
                >
                  Kapanırken Yükle
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

