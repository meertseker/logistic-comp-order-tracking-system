import { app } from 'electron'
import { machineIdSync } from 'node-machine-id'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

// Lisans tipi
export interface License {
  key: string
  machineId: string
  activatedAt: string
  expiresAt?: string
  companyName: string
  email: string
}

export class LicenseManager {
  private readonly ALGORITHM = 'aes-256-cbc'
  private readonly licensePath: string
  private machineId: string
  private readonly encryptionKey: Buffer

  constructor() {
    // Lisans dosyasının konumu
    this.licensePath = path.join(app.getPath('userData'), 'license.dat')
    // Makine ID'sini al (bu her bilgisayar için benzersiz)
    this.machineId = machineIdSync({ original: true })
    // Şifreleme anahtarı - TAM 32 byte olması garantili
    const keyString = 'sekersoft-2025-key-32-chars!!' // 32 karakter
    this.encryptionKey = crypto.scryptSync(keyString, 'salt', 32)
  }

  /**
   * Makine ID'sini döndür (aktivasyon için kullanılacak)
   */
  getMachineId(): string {
    return this.machineId
  }

  /**
   * Lisans anahtarı oluştur (sadece siz kullanacaksınız)
   * Bu fonksiyonu ayrı bir script'te kullanarak müşterileriniz için lisans üretebilirsiniz
   */
  generateLicenseKey(machineId: string, companyName: string, email: string, validDays?: number): License {
    const now = new Date()
    const license: License = {
      key: this.createKey(machineId),
      machineId: machineId,
      activatedAt: now.toISOString(),
      companyName: companyName,
      email: email
    }

    // Eğer süreli lisans istiyorsanız
    if (validDays) {
      const expiresAt = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000)
      license.expiresAt = expiresAt.toISOString()
    }

    return license
  }

  /**
   * Özel anahtar oluştur (makine ID'sine göre)
   */
  private createKey(machineId: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${machineId}-sekersoft-license`)
      .digest('hex')
    
    // Daha okunabilir bir format (XXXX-XXXX-XXXX-XXXX)
    return `${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`.toUpperCase()
  }

  /**
   * Lisansı şifrele
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
      this.ALGORITHM,
      this.encryptionKey,
      iv
    )
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return iv.toString('hex') + ':' + encrypted
  }

  /**
   * Lisansı çöz
   */
  private decrypt(text: string): string {
    const parts = text.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = parts[1]
    
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      this.encryptionKey,
      iv
    )
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Lisansı kaydet
   */
  saveLicense(license: License): boolean {
    try {
      const licenseData = JSON.stringify(license)
      const encrypted = this.encrypt(licenseData)
      fs.writeFileSync(this.licensePath, encrypted, 'utf8')
      return true
    } catch (error) {
      console.error('Lisans kaydetme hatası:', error)
      return false
    }
  }

  /**
   * Lisansı yükle
   */
  loadLicense(): License | null {
    try {
      if (!fs.existsSync(this.licensePath)) {
        return null
      }
      
      const encrypted = fs.readFileSync(this.licensePath, 'utf8')
      const decrypted = this.decrypt(encrypted)
      const license = JSON.parse(decrypted) as License
      
      return license
    } catch (error) {
      console.error('Lisans yükleme hatası:', error)
      return null
    }
  }

  /**
   * Lisansı doğrula
   */
  validateLicense(licenseKey?: string): { valid: boolean; reason?: string; license?: License } {
    try {
      const license = this.loadLicense()
      
      if (!license) {
        return { valid: false, reason: 'Lisans bulunamadı' }
      }

      // Eğer parametre olarak key verilmişse onu kontrol et
      if (licenseKey && license.key !== licenseKey.toUpperCase()) {
        return { valid: false, reason: 'Geçersiz lisans anahtarı' }
      }

      // Makine ID kontrolü (en önemli güvenlik)
      if (license.machineId !== this.machineId) {
        return { 
          valid: false, 
          reason: 'Bu lisans başka bir bilgisayar için verilmiştir' 
        }
      }

      // Süre kontrolü (eğer varsa)
      if (license.expiresAt) {
        const expiresAt = new Date(license.expiresAt)
        const now = new Date()
        
        if (now > expiresAt) {
          return { 
            valid: false, 
            reason: `Lisans ${expiresAt.toLocaleDateString('tr-TR')} tarihinde sona erdi` 
          }
        }
      }

      // Key kontrolü
      const expectedKey = this.createKey(license.machineId)
      if (license.key !== expectedKey) {
        return { valid: false, reason: 'Lisans anahtarı manipüle edilmiş' }
      }

      return { valid: true, license }
    } catch (error) {
      console.error('Lisans doğrulama hatası:', error)
      return { valid: false, reason: 'Lisans doğrulama hatası' }
    }
  }

  /**
   * Lisansı aktive et
   */
  activateLicense(licenseKey: string, companyName: string, email: string): { success: boolean; message: string } {
    try {
      // Key formatını kontrol et
      const keyRegex = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/
      if (!keyRegex.test(licenseKey.toUpperCase())) {
        return { success: false, message: 'Geçersiz lisans anahtarı formatı' }
      }

      // Beklenen key'i oluştur
      const expectedKey = this.createKey(this.machineId)
      
      if (licenseKey.toUpperCase() !== expectedKey) {
        return { 
          success: false, 
          message: 'Bu lisans anahtarı bu bilgisayar için geçerli değil' 
        }
      }

      // Lisansı oluştur ve kaydet
      const license: License = {
        key: licenseKey.toUpperCase(),
        machineId: this.machineId,
        activatedAt: new Date().toISOString(),
        companyName: companyName,
        email: email
      }

      if (this.saveLicense(license)) {
        return { 
          success: true, 
          message: 'Lisans başarıyla aktive edildi' 
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
   * Lisans bilgilerini al
   */
  getLicenseInfo(): { licensed: boolean; info?: any } {
    const validation = this.validateLicense()
    
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
      machineId: license.machineId.substring(0, 8) + '...' // Güvenlik için kısaltılmış
    }

    return { licensed: true, info }
  }

  /**
   * Lisansı sil (deaktive et)
   */
  deactivateLicense(): boolean {
    try {
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
let licenseManager: LicenseManager | null = null

export function getLicenseManager(): LicenseManager {
  if (!licenseManager) {
    licenseManager = new LicenseManager()
  }
  return licenseManager
}

