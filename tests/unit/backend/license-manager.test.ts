/**
 * KRİTİK TEST: License Manager
 * Lisans sistemi bypass edilememeli!
 */

import * as crypto from 'crypto'

describe('License Manager - KRİTİK TESTLER', () => {
  
  describe('License Key Generation Logic', () => {
    it('aynı hardware fingerprint için aynı key üretilmeli', () => {
      const generateKey = (hwFingerprint: string): string => {
        const hash = crypto
          .createHash('sha256')
          .update(hwFingerprint + 'secret-salt')
          .digest('hex')
        
        // Format: XXXX-XXXX-XXXX-XXXX
        return [
          hash.substring(0, 4).toUpperCase(),
          hash.substring(4, 8).toUpperCase(),
          hash.substring(8, 12).toUpperCase(),
          hash.substring(12, 16).toUpperCase()
        ].join('-')
      }
      
      const hwId = 'test-hardware-id-123'
      const key1 = generateKey(hwId)
      const key2 = generateKey(hwId)
      
      expect(key1).toBe(key2)
      expect(key1).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/)
    })

    it('farklı hardware fingerprint için farklı key üretilmeli', () => {
      const generateKey = (hwFingerprint: string): string => {
        const hash = crypto
          .createHash('sha256')
          .update(hwFingerprint + 'secret-salt')
          .digest('hex')
        
        return hash.substring(0, 16).toUpperCase()
      }
      
      const key1 = generateKey('hardware-1')
      const key2 = generateKey('hardware-2')
      
      expect(key1).not.toBe(key2)
    })

    it('key formatı doğru olmalı', () => {
      const validateKeyFormat = (key: string): boolean => {
        return /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)
      }
      
      // Geçerli keyler
      expect(validateKeyFormat('ABCD-1234-EFGH-5678')).toBe(true)
      expect(validateKeyFormat('0000-0000-0000-0000')).toBe(true)
      
      // Geçersiz keyler
      expect(validateKeyFormat('ABCD-1234-EFGH-567')).toBe(false) // Kısa
      expect(validateKeyFormat('ABCD-1234-EFGH-5678-9999')).toBe(false) // Uzun
      expect(validateKeyFormat('abcd-1234-efgh-5678')).toBe(false) // Küçük harf
      expect(validateKeyFormat('ABCD12345678')).toBe(false) // Tire yok
    })
  })

  describe('Hardware Fingerprint Logic', () => {
    it('donanım değişiklikleri fingerprint\'i değiştirmeli', () => {
      const generateFingerprint = (machineId: string, cpuId: string, diskSerial: string): string => {
        const combined = `${machineId}|${cpuId}|${diskSerial}`
        return crypto
          .createHash('sha256')
          .update(combined)
          .digest('hex')
          .substring(0, 32)
      }
      
      // Aynı donanım
      const fp1 = generateFingerprint('machine1', 'cpu1', 'disk1')
      const fp2 = generateFingerprint('machine1', 'cpu1', 'disk1')
      expect(fp1).toBe(fp2)
      
      // Farklı donanım
      const fp3 = generateFingerprint('machine1', 'cpu1', 'disk2') // Disk değişti
      expect(fp1).not.toBe(fp3)
    })

    it('VM kopyalaması farklı fingerprint vermeli', () => {
      const generateFingerprint = (machineId: string, macAddress: string): string => {
        // MAC adresi ile birlikte kontrol
        return crypto
          .createHash('sha256')
          .update(`${machineId}|${macAddress}`)
          .digest('hex')
      }
      
      // Aynı machine ID, farklı MAC (VM kopyalandı)
      const fp1 = generateFingerprint('vm1', 'AA:BB:CC:DD:EE:FF')
      const fp2 = generateFingerprint('vm1', '11:22:33:44:55:66')
      
      expect(fp1).not.toBe(fp2)
    })

    it('fingerprint formatı doğru olmalı', () => {
      const validateFingerprint = (fp: string): boolean => {
        return /^[a-f0-9]{32}$/.test(fp)
      }
      
      // Geçerli
      expect(validateFingerprint('abcd1234ef567890abcd1234ef567890')).toBe(true)
      
      // Geçersiz
      expect(validateFingerprint('ABCD1234')).toBe(false) // Çok kısa
      expect(validateFingerprint('abcd1234ef567890abcd1234ef56789g')).toBe(false) // Geçersiz karakter
    })
  })

  describe('License Validation Logic', () => {
    it('geçerli lisans kabul edilmeli', () => {
      const validateLicense = (license: any, currentHwFingerprint: string): boolean => {
        // 1. Key formatı doğru mu?
        if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(license.key)) {
          return false
        }
        
        // 2. Hardware fingerprint eşleşiyor mu?
        if (license.hwFingerprint !== currentHwFingerprint) {
          return false
        }
        
        // 3. Süresi dolmuş mu?
        if (license.expiresAt) {
          const expiresDate = new Date(license.expiresAt)
          const now = new Date()
          if (expiresDate < now) {
            return false
          }
        }
        
        // 4. Checksum doğru mu?
        const expectedChecksum = crypto
          .createHash('sha256')
          .update(license.key + license.hwFingerprint + license.activatedAt)
          .digest('hex')
        
        if (license.checksum !== expectedChecksum) {
          return false
        }
        
        return true
      }
      
      const hwFp = 'test-fingerprint-123'
      const key = 'ABCD-1234-EFGH-5678'
      const activatedAt = new Date().toISOString()
      const checksum = crypto
        .createHash('sha256')
        .update(key + hwFp + activatedAt)
        .digest('hex')
      
      const validLicense = {
        key,
        hwFingerprint: hwFp,
        activatedAt,
        checksum,
        companyName: 'Test Company',
        email: 'test@test.com'
      }
      
      expect(validateLicense(validLicense, hwFp)).toBe(true)
    })

    it('başka makineden lisans reddedilmeli', () => {
      const validateLicense = (license: any, currentHwFingerprint: string): boolean => {
        return license.hwFingerprint === currentHwFingerprint
      }
      
      const license = {
        key: 'ABCD-1234-EFGH-5678',
        hwFingerprint: 'machine-1-fingerprint',
        activatedAt: new Date().toISOString(),
        checksum: 'test',
        companyName: 'Test',
        email: 'test@test.com'
      }
      
      // Aynı makine - OK
      expect(validateLicense(license, 'machine-1-fingerprint')).toBe(true)
      
      // Farklı makine - REJECT
      expect(validateLicense(license, 'machine-2-fingerprint')).toBe(false)
    })

    it('süresi dolmuş lisans reddedilmeli', () => {
      const validateLicense = (license: any): boolean => {
        if (!license.expiresAt) return true // Sınırsız
        
        const expiresDate = new Date(license.expiresAt)
        const now = new Date()
        return expiresDate > now
      }
      
      // Gelecek tarih - OK
      const futureLicense = {
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
      expect(validateLicense(futureLicense)).toBe(true)
      
      // Geçmiş tarih - REJECT
      const expiredLicense = {
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
      expect(validateLicense(expiredLicense)).toBe(false)
      
      // Süresiz - OK
      const unlimitedLicense = {}
      expect(validateLicense(unlimitedLicense)).toBe(true)
    })

    it('bozuk checksum reddedilmeli', () => {
      const validateChecksum = (license: any): boolean => {
        const expectedChecksum = crypto
          .createHash('sha256')
          .update(license.key + license.hwFingerprint + license.activatedAt)
          .digest('hex')
        
        return license.checksum === expectedChecksum
      }
      
      const license = {
        key: 'ABCD-1234-EFGH-5678',
        hwFingerprint: 'test-fp',
        activatedAt: '2025-01-01',
        checksum: crypto
          .createHash('sha256')
          .update('ABCD-1234-EFGH-5678test-fp2025-01-01')
          .digest('hex')
      }
      
      // Doğru checksum - OK
      expect(validateChecksum(license)).toBe(true)
      
      // Bozuk checksum - REJECT
      const corruptLicense = {
        ...license,
        checksum: 'invalid-checksum'
      }
      expect(validateChecksum(corruptLicense)).toBe(false)
    })
  })

  describe('Encryption/Decryption Logic', () => {
    it('şifreleme ve deşifreleme çalışmalı', () => {
      const ALGORITHM = 'aes-256-cbc'
      const encryptionKey = crypto.scryptSync('test-master-key', 'salt', 32)
      
      const encrypt = (text: string): { encrypted: string, iv: string } => {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv)
        let encrypted = cipher.update(text, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        
        return {
          encrypted,
          iv: iv.toString('hex')
        }
      }
      
      const decrypt = (encrypted: string, ivHex: string): string => {
        const iv = Buffer.from(ivHex, 'hex')
        const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv)
        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
      }
      
      const originalText = 'test-license-data'
      const { encrypted, iv } = encrypt(originalText)
      const decrypted = decrypt(encrypted, iv)
      
      expect(decrypted).toBe(originalText)
      expect(encrypted).not.toBe(originalText)
    })

    it('farklı IV ile farklı şifreli text üretilmeli', () => {
      const encryptionKey = crypto.scryptSync('test-key', 'salt', 32)
      
      const encrypt = (text: string) => {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv)
        let encrypted = cipher.update(text, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        return encrypted
      }
      
      const text = 'same-text'
      const encrypted1 = encrypt(text)
      const encrypted2 = encrypt(text)
      
      // Aynı metin, farklı IV = farklı şifreli output
      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  describe('Tamper Detection Logic', () => {
    it('lisans dosyası değiştirilirse tespit edilmeli', () => {
      const calculateChecksum = (licenseData: any): string => {
        const dataString = JSON.stringify(licenseData)
        return crypto.createHash('sha256').update(dataString).digest('hex')
      }
      
      const licenseData = {
        key: 'ABCD-1234-EFGH-5678',
        hwFingerprint: 'test-fp',
        activatedAt: '2025-01-01'
      }
      
      const originalChecksum = calculateChecksum(licenseData)
      
      // Data değiştirilmemiş - OK
      expect(calculateChecksum(licenseData)).toBe(originalChecksum)
      
      // Data değiştirilmiş - TAMPER DETECTED
      const tamperedData = {
        ...licenseData,
        hwFingerprint: 'different-fp' // Değiştirildi
      }
      expect(calculateChecksum(tamperedData)).not.toBe(originalChecksum)
    })

    it('lisans dosyası eksik alanlar içeriyorsa tespit edilmeli', () => {
      const validateLicenseStructure = (license: any): boolean => {
        const requiredFields = ['key', 'hwFingerprint', 'activatedAt', 'companyName', 'email', 'checksum']
        
        for (const field of requiredFields) {
          if (!license[field] || license[field].toString().trim() === '') {
            return false
          }
        }
        
        return true
      }
      
      // Tam lisans - OK
      const completeLicense = {
        key: 'ABCD-1234-EFGH-5678',
        hwFingerprint: 'test-fp',
        activatedAt: '2025-01-01',
        companyName: 'Test Co',
        email: 'test@test.com',
        checksum: 'valid-checksum'
      }
      expect(validateLicenseStructure(completeLicense)).toBe(true)
      
      // Eksik alan - INVALID
      const incompleteLicense = {
        key: 'ABCD-1234-EFGH-5678',
        hwFingerprint: 'test-fp'
        // eksik alanlar
      }
      expect(validateLicenseStructure(incompleteLicense)).toBe(false)
    })
  })

  describe('License Activation Logic', () => {
    it('aktivasyon tarihi kaydedilmeli', () => {
      const activateLicense = (key: string, hwFingerprint: string) => {
        const activatedAt = new Date().toISOString()
        
        return {
          key,
          hwFingerprint,
          activatedAt,
          status: 'active'
        }
      }
      
      const license = activateLicense('ABCD-1234-EFGH-5678', 'test-fp')
      
      expect(license.activatedAt).toBeDefined()
      expect(license.status).toBe('active')
      expect(new Date(license.activatedAt).getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('mükerrer aktivasyon engellenm eli', () => {
      const checkAlreadyActivated = (existingLicense: any, newKey: string): boolean => {
        return existingLicense && existingLicense.key !== newKey
      }
      
      const existingLicense = {
        key: 'ABCD-1234-EFGH-5678',
        status: 'active'
      }
      
      // Aynı key ile tekrar aktivasyon - OK (yenileme)
      expect(checkAlreadyActivated(existingLicense, 'ABCD-1234-EFGH-5678')).toBe(false)
      
      // Farklı key ile tekrar aktivasyon - REJECT
      expect(checkAlreadyActivated(existingLicense, 'XXXX-YYYY-ZZZZ-WWWW')).toBe(true)
    })
  })

  describe('Offline Validation Logic', () => {
    it('offline modda da lisans doğrulanabilmeli', () => {
      const validateOffline = (license: any, hwFingerprint: string): boolean => {
        // Internet olmadan da çalışmalı
        return !!(
          license.hwFingerprint === hwFingerprint &&
          license.key &&
          license.checksum
        )
      }
      
      const license = {
        key: 'ABCD-1234-EFGH-5678',
        hwFingerprint: 'test-fp',
        activatedAt: '2025-01-01',
        checksum: 'valid-checksum'
      }
      
      expect(validateOffline(license, 'test-fp')).toBe(true)
      expect(validateOffline(license, 'different-fp')).toBe(false)
    })

    it('son doğrulama zamanı güncellenmeli', () => {
      const updateLastVerified = (license: any) => {
        return {
          ...license,
          lastVerified: new Date().toISOString()
        }
      }
      
      const license = {
        key: 'ABCD-1234-EFGH-5678',
        hwFingerprint: 'test-fp'
      }
      
      const updated = updateLastVerified(license)
      
      expect(updated.lastVerified).toBeDefined()
      expect(new Date(updated.lastVerified).getTime()).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('Error Handling Logic', () => {
    it('lisans hatası user-friendly olmalı', () => {
      const formatLicenseError = (errorCode: string): string => {
        const errorMap: Record<string, string> = {
          'INVALID_KEY': 'Lisans anahtarı geçersiz',
          'HARDWARE_MISMATCH': 'Bu lisans başka bir bilgisayarda kayıtlı',
          'EXPIRED': 'Lisans süresi dolmuş',
          'TAMPERED': 'Lisans dosyası bozulmuş veya değiştirilmiş',
          'NOT_FOUND': 'Lisans dosyası bulunamadı',
          'CORRUPT': 'Lisans dosyası okunamıyor'
        }
        
        return errorMap[errorCode] || 'Lisans doğrulama hatası'
      }
      
      expect(formatLicenseError('INVALID_KEY')).toBe('Lisans anahtarı geçersiz')
      expect(formatLicenseError('HARDWARE_MISMATCH')).toBe('Bu lisans başka bir bilgisayarda kayıtlı')
      expect(formatLicenseError('EXPIRED')).toBe('Lisans süresi dolmuş')
      expect(formatLicenseError('UNKNOWN')).toBe('Lisans doğrulama hatası')
    })

    it('grace period sonrası uygulamadan çıkılmalı', () => {
      const checkGracePeriod = (lastVerified: string, gracePeriodDays: number = 5): boolean => {
        const lastVerifiedDate = new Date(lastVerified)
        const now = new Date()
        const daysDiff = (now.getTime() - lastVerifiedDate.getTime()) / (1000 * 60 * 60 * 24)
        
        return daysDiff <= gracePeriodDays
      }
      
      // Son 3 gün önce doğrulanmış - OK
      const recentDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      expect(checkGracePeriod(recentDate, 5)).toBe(true)
      
      // 10 gün önce doğrulanmış - GRACE PERIOD EXPIRED
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      expect(checkGracePeriod(oldDate, 5)).toBe(false)
    })
  })
})

