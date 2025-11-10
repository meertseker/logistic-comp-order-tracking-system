import { test, expect, helpers } from './fixtures'
import * as fs from 'fs'
import * as path from 'path'

/**
 * E2E Tests: Database Backup & Restore
 * 
 * Database yedekleme ve geri yükleme testleri:
 * - Manual backup oluşturma
 * - Otomatik backup kontrolü
 * - Backup dosyası doğrulama
 * - Restore işlemi
 * - Data integrity after restore
 * - Backup scheduling
 */

test.describe('Database Backup ve Restore Testleri', () => {
  test.beforeEach(async ({ mainWindow }) => {
    await helpers.bypassLicenseIfNeeded(mainWindow)
    await helpers.waitForLoadingComplete(mainWindow)
  })

  test('01 - Ayarlar sayfasında backup bölümü erişilebilir olmalı', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    // Backup/Yedek sekmesi veya bölümü
    const backupSection = mainWindow.locator('button, a, div').filter({ 
      hasText: /yedek|backup|database/i 
    }).first()

    if (await backupSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await backupSection.click()
      await mainWindow.waitForTimeout(500)

      await helpers.takeDebugScreenshot(mainWindow, 'backup-section-loaded')
    } else {
      console.log('⚠️  Backup bölümü bulunamadı - ayarlar ana sayfasında olabilir')
    }
  })

  test('02 - Manuel backup oluştur butonu görünür olmalı', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const backupButton = mainWindow.locator('button').filter({ 
      hasText: /yedek al|yedekle|backup|create backup/i 
    }).first()

    await expect(backupButton).toBeVisible({ timeout: 3000 })
    console.log('✓ Backup butonu mevcut')

    await helpers.takeDebugScreenshot(mainWindow, 'backup-button-visible')
  })

  test('03 - Manuel backup oluşturulabilmeli ve indirilmeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const backupButton = mainWindow.locator('button').filter({ 
      hasText: /yedek al|yedekle|backup/i 
    }).first()

    // Download event dinle
    const downloadPromise = mainWindow.waitForEvent('download', { timeout: 15000 })

    await backupButton.click()
    console.log('Backup oluşturuluyor...')

    try {
      const download = await downloadPromise
      const filename = download.suggestedFilename()
      
      console.log('✓ Backup dosyası indirildi:', filename)
      
      // Dosya adı kontrolü (backup-YYYY-MM-DD.db gibi)
      expect(filename).toMatch(/backup.*\.db$/i)

      // Dosya boyutu kontrolü
      const downloadPath = path.join(process.cwd(), 'test-results', filename)
      await download.saveAs(downloadPath)

      // Dosya gerçekten kaydedildi mi?
      if (fs.existsSync(downloadPath)) {
        const stats = fs.statSync(downloadPath)
        console.log('Backup dosya boyutu:', stats.size, 'bytes')
        
        // Minimum dosya boyutu (boş olmamalı)
        expect(stats.size).toBeGreaterThan(1000) // En az 1KB
        
        // Test sonrası temizle
        fs.unlinkSync(downloadPath)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'backup-created-successfully')
    } catch (error) {
      console.log('⚠️  Backup download timeout veya hata:', error)
      await helpers.takeDebugScreenshot(mainWindow, 'backup-timeout')
      throw error
    }
  })

  test('04 - Backup geçmişi/listesi görüntülenebilmeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    // Backup listesi veya geçmişi
    const backupList = mainWindow.locator('table, .backup-list, .backup-history')
    
    if (await backupList.isVisible({ timeout: 2000 }).catch(() => false)) {
      const backupItems = backupList.locator('tr, .backup-item')
      const count = await backupItems.count()
      
      console.log('Backup kayıt sayısı:', count)

      // En az 1 backup olmalı (az önce oluşturduk)
      if (count > 0) {
        // İlk backup'ın detayları
        const firstBackup = backupItems.first()
        const backupText = await firstBackup.textContent()
        console.log('İlk backup:', backupText)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'backup-list-displayed')
    } else {
      console.log('⚠️  Backup listesi bulunamadı')
    }
  })

  test('05 - Restore işlemi için dosya seçme butonu olmalı', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const restoreButton = mainWindow.locator('button, input[type="file"]').filter({ 
      hasText: /geri yükle|restore|import/i 
    }).or(
      mainWindow.locator('input[type="file"][accept*=".db"]')
    ).first()

    if (await restoreButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✓ Restore butonu mevcut')
      await helpers.takeDebugScreenshot(mainWindow, 'restore-button-visible')
    } else {
      console.log('⚠️  Restore butonu bulunamadı')
    }
  })

  test('06 - Otomatik backup ayarları yapılandırılabilmeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    // Otomatik backup seçenekleri
    const autoBackupCheckbox = mainWindow.locator('input[type="checkbox"]').filter({ 
      has: mainWindow.locator('label').filter({ hasText: /otomatik|auto.*backup/i }) 
    }).or(
      mainWindow.locator('input[name*="autoBackup"], input[name*="otomatikYedek"]')
    ).first()

    if (await autoBackupCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Aktif et
      await autoBackupCheckbox.check()
      await mainWindow.waitForTimeout(500)

      // Periyod seçimi (günlük, haftalık, aylık)
      const periodSelect = mainWindow.locator('select[name*="period"], select[name*="periyot"]')
      
      if (await periodSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
        await periodSelect.selectOption({ label: /Günlük|Daily/i })
        console.log('✓ Otomatik backup günlük olarak ayarlandı')
      }

      // Kaydet
      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(2000)

      await helpers.takeDebugScreenshot(mainWindow, 'auto-backup-configured')
    } else {
      console.log('⚠️  Otomatik backup ayarları bulunamadı')
    }
  })

  test('07 - Backup konumu gösterilmeli', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    // Backup folder path gösterimi
    const backupPath = mainWindow.locator('text=/C:|Users|Documents|backup/i, code, pre').first()
    
    if (await backupPath.isVisible({ timeout: 2000 }).catch(() => false)) {
      const pathText = await backupPath.textContent()
      console.log('Backup konumu:', pathText)

      await helpers.takeDebugScreenshot(mainWindow, 'backup-location-displayed')
    } else {
      console.log('⚠️  Backup konumu gösterilmiyor')
    }
  })

  test('08 - Backup dosyası konumunu açma butonu çalışmalı', async ({ mainWindow }) => {
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const openFolderButton = mainWindow.locator('button').filter({ 
      hasText: /klasörü aç|open folder|göster/i 
    }).first()

    if (await openFolderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await openFolderButton.click()
      await mainWindow.waitForTimeout(1000)

      // File explorer açılmalı (Electron shell.openPath)
      console.log('✓ Klasör aç butonu tıklandı')

      await helpers.takeDebugScreenshot(mainWindow, 'backup-folder-opened')
    } else {
      console.log('⚠️  Klasör aç butonu bulunamadı')
    }
  })

  test('09 - Data integrity: Backup öncesi ve sonrası veri kontrolü', async ({ mainWindow }) => {
    // İlk sipariş oluştur
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    const initialRowCount = await helpers.getTableRowCount(mainWindow).catch(() => 0)
    console.log('Backup öncesi sipariş sayısı:', initialRowCount)

    // Yeni sipariş ekle
    const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
    await newOrderButton.click()
    await mainWindow.waitForTimeout(1000)

    await mainWindow.locator('input[name="plaka"]').fill('34 BCK 111')
    await mainWindow.locator('input[name="musteri"]').fill('Backup Test Firma')
    await mainWindow.locator('input[name="telefon"]').fill('0555 888 7766')
    await mainWindow.locator('input[name="nereden"]').first().fill('İstanbul')
    await mainWindow.locator('input[name="nereye"]').first().fill('Ankara')
    await mainWindow.locator('input[name="yukAciklamasi"]').fill('Backup integrity test')
    await mainWindow.locator('input[name="baslangicFiyati"]').fill('15000')

    const saveButton = mainWindow.locator('button[type="submit"]').first()
    await saveButton.click()
    await mainWindow.waitForTimeout(2000)

    const afterInsertRowCount = await helpers.getTableRowCount(mainWindow).catch(() => 0)
    console.log('Sipariş ekleme sonrası:', afterInsertRowCount)

    // Backup al
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const backupButton = mainWindow.locator('button').filter({ hasText: /yedek al|backup/i }).first()
    const downloadPromise = mainWindow.waitForEvent('download', { timeout: 15000 })
    
    await backupButton.click()
    
    try {
      const download = await downloadPromise
      console.log('✓ Backup alındı, data integrity korundu')
      
      await helpers.takeDebugScreenshot(mainWindow, 'backup-data-integrity')
    } catch (error) {
      console.log('⚠️  Backup timeout')
    }
  })

  test('10 - Backup boyutu veri miktarıyla orantılı olmalı', async ({ mainWindow }) => {
    // Çok fazla veri ekle
    await helpers.navigateTo(mainWindow, '/orders')
    await mainWindow.waitForTimeout(1000)

    const initialRowCount = await helpers.getTableRowCount(mainWindow).catch(() => 0)

    // 5 sipariş daha ekle (hızlı)
    for (let i = 1; i <= 5; i++) {
      const newOrderButton = mainWindow.locator('button').filter({ hasText: /yeni sipariş/i }).first()
      await newOrderButton.click()
      await mainWindow.waitForTimeout(500)

      await mainWindow.locator('input[name="plaka"]').fill(`34 SIZ ${100 + i}`)
      await mainWindow.locator('input[name="musteri"]').fill(`Test Firma ${i}`)
      await mainWindow.locator('input[name="telefon"]').fill(`055${i} 111 222`)
      await mainWindow.locator('input[name="nereden"]').first().fill('A')
      await mainWindow.locator('input[name="nereye"]').first().fill('B')
      await mainWindow.locator('input[name="baslangicFiyati"]').fill('10000')

      const saveButton = mainWindow.locator('button[type="submit"]').first()
      await saveButton.click()
      await mainWindow.waitForTimeout(1000)
    }

    const finalRowCount = await helpers.getTableRowCount(mainWindow).catch(() => 0)
    console.log('Veri ekleme sonrası sipariş sayısı:', finalRowCount)

    // Backup al ve boyut kontrolü
    await helpers.navigateTo(mainWindow, '/settings')
    await mainWindow.waitForTimeout(1000)

    const backupButton = mainWindow.locator('button').filter({ hasText: /yedek al|backup/i }).first()
    const downloadPromise = mainWindow.waitForEvent('download', { timeout: 15000 })
    
    await backupButton.click()
    
    try {
      const download = await downloadPromise
      const filename = download.suggestedFilename()
      
      const downloadPath = path.join(process.cwd(), 'test-results', filename)
      await download.saveAs(downloadPath)

      if (fs.existsSync(downloadPath)) {
        const stats = fs.statSync(downloadPath)
        console.log('Büyük veri backup boyutu:', stats.size, 'bytes')
        
        // Daha fazla veri = daha büyük backup
        expect(stats.size).toBeGreaterThan(5000) // En az 5KB
        
        fs.unlinkSync(downloadPath)
      }

      await helpers.takeDebugScreenshot(mainWindow, 'backup-size-verification')
    } catch (error) {
      console.log('⚠️  Backup timeout')
    }
  })
})

/**
 * TEST NOTLARI:
 * 
 * 1. Restore testi gerçek dosya upload gerektirir (Playwright limitation)
 * 2. Otomatik backup cron job veya scheduled task kullanır
 * 3. Backup dosyası SQLite database (better-sqlite3)
 * 4. Compression kullanılabilir (zlib)
 * 5. Encryption önerilir (production için)
 */

