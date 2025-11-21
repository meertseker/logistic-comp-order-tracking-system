import { autoUpdater } from 'electron-updater'
import { BrowserWindow, app } from 'electron'
import log from 'electron-log'

// Configure logging
log.transports.file.level = 'info'
autoUpdater.logger = log

// GitHub release configuration
const GITHUB_OWNER = 'meertseker'
const GITHUB_REPO = 'logistic-comp-order-tracking-system'

export class UpdateManager {
  private mainWindow: BrowserWindow | null

  constructor(window: BrowserWindow) {
    this.mainWindow = window
    this.setupAutoUpdater()
  }

  setupAutoUpdater() {
    // Configure auto-updater
    autoUpdater.autoDownload = false // Kullanıcıya sor
    autoUpdater.autoInstallOnAppQuit = true // Kapanırken otomatik kur

    // Development modda güncelleme kontrolü yapma
    if (process.env.NODE_ENV === 'development') {
      log.info('Development mode - auto-update disabled')
      return
    }

    // GitHub release URL'ini yapılandır
    // electron-updater otomatik olarak package.json'daki publish ayarlarını kullanır
    // Ancak manuel olarak da ayarlayabiliriz
    try {
      // electron-updater'ın GitHub provider'ı kullanırken, otomatik olarak şu URL'den güncellemeleri kontrol eder:
      // Windows: https://github.com/{owner}/{repo}/releases/latest/download/latest.yml
      // macOS: https://github.com/{owner}/{repo}/releases/latest/download/latest-mac.yml
      const updateServerUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/`
      log.info(`Update server URL: ${updateServerUrl}`)
      log.info(`Platform: ${process.platform}`)
      log.info(`Expected YML file: ${process.platform === 'win32' ? 'latest.yml' : 'latest-mac.yml'}`)
    } catch (error) {
      log.error('Error configuring update server URL:', error)
    }

    // Event Handlers
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for updates...')
      this.sendStatusToWindow('Güncelleme kontrol ediliyor...')
    })

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info)
      this.sendStatusToWindow(`Yeni güncelleme mevcut: v${info.version}`)
      this.mainWindow?.webContents.send('update-available', info)
    })

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info)
      this.sendStatusToWindow('Uygulama güncel')
      this.mainWindow?.webContents.send('update-not-available', info)
    })

    autoUpdater.on('error', (err) => {
      log.error('Auto-updater error:', err)
      
      // YML dosyası bulunamadı hatasını özel olarak handle et
      let errorMessage = err.message
      if (err.message && (err.message.includes('yml') || err.message.includes('YML') || err.message.includes('404'))) {
        errorMessage = 'Güncelleme dosyası bulunamadı. Lütfen GitHub release sayfasından manuel olarak indirin.'
        log.warn('Update YML file not found - this might be the first release or the file is missing from GitHub release')
      }
      
      this.sendStatusToWindow(`Güncelleme hatası: ${errorMessage}`)
      this.mainWindow?.webContents.send('update-error', errorMessage)
    })

    autoUpdater.on('download-progress', (progressObj) => {
      const message = `İndiriliyor: ${Math.round(progressObj.percent)}%`
      log.info(message)
      this.sendStatusToWindow(message)
      this.mainWindow?.webContents.send('download-progress', progressObj)
    })

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info)
      this.sendStatusToWindow('Güncelleme indirildi - yüklenmeye hazır')
      this.mainWindow?.webContents.send('update-downloaded', info)
    })
  }

  /**
   * Güncellemeleri kontrol et
   */
  async checkForUpdates(): Promise<void> {
    // Development modda güncelleme kontrolü yapma
    if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
      log.info('Development mode - skipping update check')
      this.sendStatusToWindow('Development modda güncelleme kontrolü yapılamaz')
      this.mainWindow?.webContents.send('update-error', 'Development modda güncelleme kontrolü yapılamaz. Production build kullanın.')
      return
    }

    try {
      log.info('Checking for updates...')
      log.info(`GitHub repository: ${GITHUB_OWNER}/${GITHUB_REPO}`)
      log.info(`Current app version: ${app.getVersion()}`)
      
      // electron-updater otomatik olarak package.json'daki publish ayarlarını kullanır
      // Windows için: https://github.com/{owner}/{repo}/releases/latest/download/latest.yml
      // macOS için: https://github.com/{owner}/{repo}/releases/latest/download/latest-mac.yml
      const expectedUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/${process.platform === 'win32' ? 'latest.yml' : 'latest-mac.yml'}`
      log.info(`Expected update URL: ${expectedUrl}`)
      
      // electron-updater otomatik olarak package.json'daki publish ayarlarını kullanır
      // Eğer latest.yml bulunamazsa, hata event'i tetiklenir
      const result = await autoUpdater.checkForUpdates()
      
      if (result) {
        log.info('Update check completed:', result.updateInfo)
        log.info('Update feed URL:', result.feedUrl)
      }
    } catch (error: any) {
      log.error('Error checking for updates:', error)
      log.error('Error stack:', error.stack)
      log.error('Error details:', JSON.stringify(error, null, 2))
      
      // YML dosyası bulunamadı hatasını özel olarak handle et
      let errorMessage = error.message || 'Güncelleme kontrolü başarısız'
      const errorStr = error.message?.toLowerCase() || ''
      
      if (errorStr.includes('yml') || errorStr.includes('404') || errorStr.includes('not found') || errorStr.includes('resource not accessible')) {
        const releaseUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`
        errorMessage = `Güncelleme dosyası bulunamadı. Lütfen GitHub release sayfasından manuel olarak indirin:\n${releaseUrl}`
        log.warn('Update YML file not found - this usually means the file is missing from GitHub release')
        log.warn(`Please check if latest.yml exists at: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`)
      }
      
      this.sendStatusToWindow(`Güncelleme kontrolü hatası: ${errorMessage}`)
      this.mainWindow?.webContents.send('update-error', errorMessage)
    }
  }

  /**
   * Güncellemeyi indir
   */
  async downloadUpdate(): Promise<void> {
    try {
      await autoUpdater.downloadUpdate()
    } catch (error) {
      log.error('Error downloading update:', error)
      throw error
    }
  }

  /**
   * Güncellemeyi yükle ve uygulamayı yeniden başlat
   */
  quitAndInstall(): void {
    // isSilent: false -> Kullanıcıya göster
    // isForceRunAfter: true -> Kurulumdan sonra yeniden başlat
    autoUpdater.quitAndInstall(false, true)
  }

  /**
   * Renderer process'e durum mesajı gönder
   */
  private sendStatusToWindow(message: string): void {
    log.info(message)
    this.mainWindow?.webContents.send('update-status', message)
  }
}

