import { app } from 'electron'
import { machineIdSync } from 'node-machine-id'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import si from 'systeminformation'

// Lisans tipi
export interface AdvancedLicense {
  key: string
  hwFingerprint: string // Gelişmiş donanım parmak izi
  activatedAt: string
  expiresAt?: string
  companyName: string
  email: string
  checksum: string // Lisans bütünlüğü için
  lastVerified?: string
}

export class AdvancedLicenseManager {
  private readonly ALGORITHM = 'aes-256-cbc'
  private readonly licensePath: string
  private readonly encryptionKey: Buffer
  private readonly hmacKey: Buffer
  private hwFingerprint: string = ''
  private verificationInterval: NodeJS.Timeout | null = null
  private lastFileModification: number = 0

  constructor() {
    this.licensePath = path.join(app.getPath('userData'), 'license.dat')
    
    // Güçlü şifreleme anahtarları
    const masterKey = 'sekersoft-ultra-secure-2025-key'
    this.encryptionKey = crypto.scryptSync(masterKey, 'encryption-salt', 32)
    this.hmacKey = crypto.scryptSync(masterKey, 'hmac-salt', 32)
    
    // Hardware fingerprint'i asenkron başlat
    this.generateHardwareFingerprint()
  }

  /**
   * Gelişmiş Donanım Parmak İzi Oluştur
   * Machine ID + CPU ID + Disk Serial + MAC Address
   */
  private async generateHardwareFingerprint(): Promise<void> {
    try {
      // Temel machine ID
      const machineId = machineIdSync({ original: true })
      
      // CPU bilgisi
      const cpu = await si.cpu()
      const cpuId = `${cpu.manufacturer}-${cpu.brand}-${cpu.cores}`
      
      // Disk serial number
      const disks = await si.diskLayout()
      const diskSerial = disks[0]?.serialNum || 'unknown'
      
      // MAC adresleri
      const networkInterfaces = os.networkInterfaces()
      const macAddresses = Object.values(networkInterfaces)
        .flat()
        .filter(iface => iface && !iface.internal && iface.mac !== '00:00:00:00:00:00')
        .map(iface => iface!.mac)
        .sort()
        .join(',')
      
      // Tüm bilgileri birleştir ve hash'le
      const combinedInfo = `${machineId}|${cpuId}|${diskSerial}|${macAddresses}`
      this.hwFingerprint = crypto
        .createHash('sha256')
        .update(combinedInfo)
        .digest('hex')
        .substring(0, 32)
      
      console.log('🔐 Hardware fingerprint generated')
    } catch (error) {
      console.error('Hardware fingerprint error:', error)
      // Fallback to basic machine ID
      this.hwFingerprint = machineIdSync({ original: true })
    }
  }

  /**
   * Hardware fingerprint'i döndür (aktivasyon için)
   */
  async getHardwareFingerprint(): Promise<string> {
    // Eğer henüz oluşturulmadıysa bekle
    if (!this.hwFingerprint) {
      await this.generateHardwareFingerprint()
    }
    return this.hwFingerprint
  }

  /**
   * Lisans anahtarı oluştur
   */
  generateLicenseKey(hwFingerprint: string, durationDays?: number): string {
    // Süre bilgisini anahtara gömme (duration-embedded key)
    const durationString = durationDays ? `-DAYS${durationDays}` : ''
    
    const hash = crypto
      .createHash('sha256')
      .update(`${hwFingerprint}-sekersoft-pro-license-2025${durationString}`)
      .digest('hex')
    
    return `${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`.toUpperCase()
  }

  /**
   * Lisans anahtarından süreyi çıkar (brute-force ile deneme)
   * NOT: Bu güvenlik için değil, kolaylık için
   */
  private extractDurationFromKey(licenseKey: string, hwFingerprint: string): number | null | undefined {
    // Önce süresiz lisans kontrolü
    const perpetualKey = this.generateLicenseKey(hwFingerprint)
    if (licenseKey === perpetualKey) {
      return null // Perpetual
    }

    // 1-365 gün arası tüm değerleri dene (brute force)
    for (let days = 1; days <= 365; days++) {
      const testKey = this.generateLicenseKey(hwFingerprint, days)
      if (licenseKey === testKey) {
        return days
      }
    }

    // 1 yıldan uzun süreleri de dene (366-730 gün, 2 yıl)
    for (let days = 366; days <= 730; days += 30) {
      const testKey = this.generateLicenseKey(hwFingerprint, days)
      if (licenseKey === testKey) {
        return days
      }
    }

    // Bulunamazsa undefined (geçersiz anahtar)
    return undefined
  }

  /**
   * Demo lisans oluştur (süre sınırlı)
   */
  generateDemoLicense(hwFingerprint: string, companyName: string, email: string, durationDays: number = 60): Omit<AdvancedLicense, 'checksum'> {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
    
    return {
      key: this.generateLicenseKey(hwFingerprint),
      hwFingerprint: hwFingerprint,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      companyName: companyName,
      email: email
    }
  }

  /**
   * Kalan gün sayısını hesapla
   */
  getDaysRemaining(license?: AdvancedLicense): number | null {
    const lic = license || this.loadLicense()
    if (!lic || !lic.expiresAt) return null
    
    const now = new Date()
    const expiresAt = new Date(lic.expiresAt)
    const diffMs = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  /**
   * Lisansın süresi dolmuş mu kontrol et
   */
  isExpired(license?: AdvancedLicense): boolean {
    const lic = license || this.loadLicense()
    if (!lic || !lic.expiresAt) return false
    
    const now = new Date()
    const expiresAt = new Date(lic.expiresAt)
    
    return now > expiresAt
  }

  /**
   * Demo/Trial lisans mı kontrol et
   */
  isDemoLicense(license?: AdvancedLicense): boolean {
    const lic = license || this.loadLicense()
    if (!lic) return false
    
    // Eğer expiresAt varsa demo/trial lisanstır
    return !!lic.expiresAt
  }

  /**
   * Lisans tipini döndür
   */
  getLicenseType(license?: AdvancedLicense): 'demo' | 'full' | null {
    const lic = license || this.loadLicense()
    if (!lic) return null
    
    return lic.expiresAt ? 'demo' : 'full'
  }

  /**
   * Lisans için checksum oluştur (HMAC)
   */
  private createChecksum(license: Omit<AdvancedLicense, 'checksum'>): string {
    const data = JSON.stringify({
      key: license.key,
      hwFingerprint: license.hwFingerprint,
      activatedAt: license.activatedAt,
      companyName: license.companyName,
      email: license.email
    })
    
    return crypto
      .createHmac('sha256', this.hmacKey)
      .update(data)
      .digest('hex')
  }

  /**
   * Checksum'ı doğrula
   */
  private verifyChecksum(license: AdvancedLicense): boolean {
    const expectedChecksum = this.createChecksum(license)
    return crypto.timingSafeEqual(
      Buffer.from(license.checksum),
      Buffer.from(expectedChecksum)
    )
  }

  /**
   * Şifreleme
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.encryptionKey, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return iv.toString('hex') + ':' + encrypted
  }

  /**
   * Şifre çözme
   */
  private decrypt(text: string): string {
    const parts = text.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = parts[1]
    
    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.encryptionKey, iv)
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Lisansı kaydet
   */
  async saveLicense(license: Omit<AdvancedLicense, 'checksum'>): Promise<boolean> {
    try {
      // Checksum ekle
      const checksum = this.createChecksum(license)
      const fullLicense: AdvancedLicense = {
        ...license,
        checksum,
        lastVerified: new Date().toISOString()
      }
      
      const licenseData = JSON.stringify(fullLicense)
      const encrypted = this.encrypt(licenseData)
      fs.writeFileSync(this.licensePath, encrypted, 'utf8')
      
      // Dosya değişim zamanını kaydet
      const stats = fs.statSync(this.licensePath)
      this.lastFileModification = stats.mtimeMs
      
      return true
    } catch (error) {
      console.error('Lisans kaydetme hatası:', error)
      return false
    }
  }

  /**
   * Lisansı yükle
   */
  loadLicense(): AdvancedLicense | null {
    try {
      if (!fs.existsSync(this.licensePath)) {
        return null
      }
      
      const encrypted = fs.readFileSync(this.licensePath, 'utf8')
      const decrypted = this.decrypt(encrypted)
      const license = JSON.parse(decrypted) as AdvancedLicense
      
      return license
    } catch (error) {
      console.error('Lisans yükleme hatası:', error)
      return null
    }
  }

  /**
   * Lisans dosyası manipüle edilmiş mi kontrol et
   */
  private checkFileIntegrity(): boolean {
    try {
      if (!fs.existsSync(this.licensePath)) {
        return false
      }
      
      const stats = fs.statSync(this.licensePath)
      
      // İlk açılışta kaydet
      if (this.lastFileModification === 0) {
        this.lastFileModification = stats.mtimeMs
        return true
      }
      
      // Dosya manuel değiştirilmiş mi?
      if (stats.mtimeMs !== this.lastFileModification) {
        console.warn('⚠️ License file has been tampered!')
        return false
      }
      
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * VM/Emulator detection (basit)
   */
  private async detectVirtualMachine(): Promise<boolean> {
    try {
      const system = await si.system()
      const manufacturer = (system.manufacturer || '').toLowerCase()
      const model = (system.model || '').toLowerCase()
      
      // VM belirtileri
      const vmIndicators = ['vmware', 'virtualbox', 'qemu', 'virtual', 'vm']
      
      return vmIndicators.some(indicator => 
        manufacturer.includes(indicator) || model.includes(indicator)
      )
    } catch (error) {
      return false
    }
  }

  /**
   * Lisansı doğrula (Gelişmiş)
   */
  async validateLicense(): Promise<{ 
    valid: boolean; 
    reason?: string; 
    license?: AdvancedLicense;
    daysRemaining?: number | null;
    isExpired?: boolean;
    isDemoLicense?: boolean;
    expiresAt?: string | null;
  }> {
    try {
      // Hardware fingerprint hazır mı?
      if (!this.hwFingerprint) {
        await this.generateHardwareFingerprint()
      }

      // Dosya bütünlüğü kontrolü
      if (!this.checkFileIntegrity()) {
        return { valid: false, reason: 'Lisans dosyası manipüle edilmiş' }
      }

      const license = this.loadLicense()
      
      if (!license) {
        return { valid: false, reason: 'Lisans bulunamadı' }
      }

      // Checksum kontrolü (tampering detection)
      if (!this.verifyChecksum(license)) {
        return { valid: false, reason: 'Lisans verisi bozulmuş veya değiştirilmiş' }
      }

      // Hardware fingerprint kontrolü
      if (license.hwFingerprint !== this.hwFingerprint) {
        return { 
          valid: false, 
          reason: 'Bu lisans başka bir sistem için verilmiştir' 
        }
      }

      // Süre kontrolü
      const isExpired = this.isExpired(license)
      const daysRemaining = this.getDaysRemaining(license)
      const isDemoLicense = this.isDemoLicense(license)
      
      if (license.expiresAt) {
        const expiresAt = new Date(license.expiresAt)
        const now = new Date()
        
        if (now > expiresAt) {
          return { 
            valid: false, 
            reason: `Lisans ${expiresAt.toLocaleDateString('tr-TR')} tarihinde sona erdi`,
            isExpired: true,
            daysRemaining: daysRemaining,
            isDemoLicense: isDemoLicense,
            expiresAt: license.expiresAt
          }
        }
      }

      // Key kontrolü - anahtardan süreyi çıkar ve validate et
      const extractedDuration = this.extractDurationFromKey(license.key, license.hwFingerprint)
      
      if (extractedDuration === undefined) {
        return { valid: false, reason: 'Lisans anahtarı geçersiz' }
      }

      // Süre uyumsuzluğu kontrolü
      if (extractedDuration !== null && !license.expiresAt) {
        // Anahtar süreli ama lisans dosyasında süre yok - uyumsuzluk
        console.warn('⚠️ License key has duration but no expiration in license file')
      } else if (extractedDuration === null && license.expiresAt) {
        // Anahtar süresiz ama lisans dosyasında süre var - uyumsuzluk
        console.warn('⚠️ License key is perpetual but license file has expiration')
      }

      // VM detection (opsiyonel - istersen kapatabilirsin)
      const isVM = await this.detectVirtualMachine()
      if (isVM) {
        console.warn('⚠️ Running in virtual machine detected')
        // VM'de çalışmasını engellemek istiyorsan:
        // return { valid: false, reason: 'Sanal makinelerde çalıştırılamaz' }
      }

      // Son doğrulama zamanını güncelle
      license.lastVerified = new Date().toISOString()
      await this.saveLicense(license)

      return { 
        valid: true, 
        license,
        daysRemaining: daysRemaining,
        isExpired: false,
        isDemoLicense: isDemoLicense,
        expiresAt: license.expiresAt || null
      }
    } catch (error) {
      console.error('Lisans doğrulama hatası:', error)
      return { valid: false, reason: 'Lisans doğrulama hatası' }
    }
  }

  /**
   * Lisansı aktive et
   */
  async activateLicense(
    licenseKey: string, 
    companyName: string, 
    email: string,
    durationDays?: number // Optional: for demo licenses
  ): Promise<{ success: boolean; message: string; isDemoLicense?: boolean; expiresAt?: string }> {
    try {
      // Hardware fingerprint hazır mı?
      if (!this.hwFingerprint) {
        await this.generateHardwareFingerprint()
      }

      // Key formatı kontrolü
      const keyRegex = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/
      if (!keyRegex.test(licenseKey.toUpperCase())) {
        return { success: false, message: 'Geçersiz lisans anahtarı formatı' }
      }

      // Anahtardan süreyi çıkarmaya çalış
      const extractedDuration = this.extractDurationFromKey(licenseKey.toUpperCase(), this.hwFingerprint)
      
      if (extractedDuration === undefined) {
        return { 
          success: false, 
          message: 'Bu lisans anahtarı bu sistem için geçerli değil' 
        }
      }

      // Çıkarılan süreyi kullan (eğer parametre verilmediyse)
      const finalDuration = durationDays !== undefined ? durationDays : extractedDuration

      // Lisansı oluştur
      const now = new Date()
      const license: Omit<AdvancedLicense, 'checksum'> = {
        key: licenseKey.toUpperCase(),
        hwFingerprint: this.hwFingerprint,
        activatedAt: now.toISOString(),
        companyName: companyName,
        email: email
      }

      // Eğer süre varsa, expiresAt ekle
      if (finalDuration && finalDuration > 0) {
        const expiresAt = new Date(now.getTime() + finalDuration * 24 * 60 * 60 * 1000)
        license.expiresAt = expiresAt.toISOString()
      }

      if (await this.saveLicense(license)) {
        // Periyodik doğrulama başlat
        this.startPeriodicVerification()
        
        const isDemoLicense = !!license.expiresAt
        let message = 'Lisans başarıyla aktive edildi'
        
        if (isDemoLicense && finalDuration) {
          message = `Demo lisans başarıyla aktive edildi (${finalDuration} gün)`
        }
        
        return { 
          success: true, 
          message: message,
          isDemoLicense: isDemoLicense,
          expiresAt: license.expiresAt
        }
      } else {
        return { 
          success: false, 
          message: 'Lisans kaydedilemedi' 
        }
      }
    } catch (error) {
      console.error('Aktivasyon hatası:', error)
      return { 
        success: false, 
        message: 'Bir hata oluştu' 
      }
    }
  }

  /**
   * Periyodik lisans doğrulama (her 5 dakikada)
   */
  startPeriodicVerification(): void {
    // Mevcut interval'i temizle
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval)
    }

    // Her 5 dakikada bir kontrol et
    this.verificationInterval = setInterval(async () => {
      console.log('🔄 Periodic license verification...')
      const validation = await this.validateLicense()
      
      if (!validation.valid) {
        console.error('❌ License validation failed:', validation.reason)
        // Uygulama kapatılabilir veya kullanıcıya uyarı gösterilebilir
        app.quit()
      }
    }, 5 * 60 * 1000) // 5 dakika
  }

  /**
   * Periyodik doğrulamayı durdur
   */
  stopPeriodicVerification(): void {
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval)
      this.verificationInterval = null
    }
  }

  /**
   * Lisans bilgilerini al
   */
  async getLicenseInfo(): Promise<{ licensed: boolean; info?: any }> {
    const validation = await this.validateLicense()
    
    if (!validation.valid) {
      return { licensed: false }
    }

    const license = validation.license!
    const info = {
      companyName: license.companyName,
      email: license.email,
      activatedAt: new Date(license.activatedAt).toLocaleDateString('tr-TR'),
      expiresAt: license.expiresAt 
        ? new Date(license.expiresAt).toLocaleDateString('tr-TR')
        : 'Süresiz',
      lastVerified: license.lastVerified 
        ? new Date(license.lastVerified).toLocaleString('tr-TR')
        : 'Bilinmiyor',
      hwFingerprint: license.hwFingerprint.substring(0, 12) + '...'
    }

    return { licensed: true, info }
  }

  /**
   * Lisansı deaktive et
   */
  deactivateLicense(): boolean {
    try {
      this.stopPeriodicVerification()
      
      if (fs.existsSync(this.licensePath)) {
        fs.unlinkSync(this.licensePath)
      }
      return true
    } catch (error) {
      console.error('Lisans silme hatası:', error)
      return false
    }
  }
}

// Singleton instance
let advancedLicenseManager: AdvancedLicenseManager | null = null

export async function getAdvancedLicenseManager(): Promise<AdvancedLicenseManager> {
  if (!advancedLicenseManager) {
    advancedLicenseManager = new AdvancedLicenseManager()
    // Hardware fingerprint'in hazır olmasını bekle
    await advancedLicenseManager.getHardwareFingerprint()
  }
  return advancedLicenseManager
}

