import { test as base, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Extended test fixtures for Electron E2E testing
 */
type TestFixtures = {
  app: ElectronApplication
  mainWindow: Page
  testDataDir: string
}

/**
 * Temiz bir test ortamı için geçici data dizini oluştur
 */
function createTestDataDir(): string {
  const testDir = path.join(process.cwd(), 'test-data', `test-${Date.now()}`)
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }
  return testDir
}

/**
 * Test sonrası temizlik
 */
function cleanupTestDataDir(testDir: string) {
  try {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  } catch (error) {
    console.warn('Cleanup warning:', error)
  }
}

/**
 * Electron uygulamasını başlat
 */
export const test = base.extend<TestFixtures>({
  testDataDir: async (_unused, use) => {
    const testDir = createTestDataDir()
    await use(testDir)
    cleanupTestDataDir(testDir)
  },

  app: async ({ testDataDir }, use) => {
    // Electron ana dosyasının yolu
    const electronPath = path.join(process.cwd(), 'dist-electron', 'main', 'index.cjs')
    
    // Eğer build edilmemişse uyar
    if (!fs.existsSync(electronPath)) {
      throw new Error(
        'Electron build bulunamadı. Lütfen önce "npm run build" komutunu çalıştırın.'
      )
    }

    // Electron uygulamasını başlat
    const app = await electron.launch({
      args: [electronPath],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        // Test için özel environment variables
        TEST_MODE: 'true',
        USER_DATA_DIR: testDataDir,
      },
    })

    await use(app)

    // Test sonrası uygulamayı kapat
    await app.close()
  },

  mainWindow: async ({ app }, use) => {
    // Ana pencereyi al
    const mainWindow = await app.firstWindow()
    
    // Pencere yüklenene kadar bekle
    await mainWindow.waitForLoadState('domcontentloaded')
    
    // Başlangıç ekranı varsa bekle
    await mainWindow.waitForTimeout(1000)

    await use(mainWindow)
  },
})

export { expect } from '@playwright/test'

/**
 * Test helper functions
 */
export const helpers = {
  /**
   * Lisans aktivasyon ekranını atla (test için)
   */
  async bypassLicenseIfNeeded(page: Page): Promise<void> {
    try {
      // Lisans ekranı varsa çık
      const licenseForm = page.locator('form').filter({ hasText: 'Lisans Anahtarı' })
      const isVisible = await licenseForm.isVisible({ timeout: 2000 })
      
      if (isVisible) {
        // Test lisans anahtarı gir (generate-license.js ile oluşturulmuş)
        await page.fill('input[type="text"]', 'TEST-LICENSE-KEY-12345')
        await page.click('button[type="submit"]')
        await page.waitForTimeout(2000)
      }
    } catch (error) {
      // Lisans ekranı yoksa devam et
      console.log('Lisans ekranı atlandı veya bulunamadı')
    }
  },

  /**
   * Belirli bir route'a git
   */
  async navigateTo(page: Page, route: string): Promise<void> {
    await page.click(`a[href="${route}"]`)
    await page.waitForLoadState('networkidle')
  },

  /**
   * Form alanını doldur
   */
  async fillFormField(page: Page, label: string, value: string): Promise<void> {
    const input = page.locator(`input, select, textarea`).filter({ 
      has: page.locator(`label:has-text("${label}")`) 
    }).or(
      page.locator(`input[placeholder*="${label}"], select[aria-label*="${label}"], textarea[placeholder*="${label}"]`)
    )
    await input.fill(value)
  },

  /**
   * Toast/notification mesajını kontrol et
   */
  async expectToastMessage(page: Page, message: string): Promise<void> {
    const toast = page.locator('.toast, [role="alert"], [role="status"]').filter({ 
      hasText: message 
    })
    await toast.waitFor({ state: 'visible', timeout: 5000 })
  },

  /**
   * Modal/dialog'u bekle
   */
  async waitForModal(page: Page): Promise<void> {
    await page.locator('[role="dialog"], .modal').waitFor({ state: 'visible' })
  },

  /**
   * Table row sayısını kontrol et
   */
  async getTableRowCount(page: Page, tableSelector: string = 'table tbody tr'): Promise<number> {
    await page.waitForSelector(tableSelector, { timeout: 5000 })
    return await page.locator(tableSelector).count()
  },

  /**
   * Loading durumunun bitmesini bekle
   */
  async waitForLoadingComplete(page: Page): Promise<void> {
    // Loading spinner veya skeleton bekle
    await page.waitForSelector('[role="progressbar"], .loading, .skeleton', { 
      state: 'hidden', 
      timeout: 10000 
    }).catch(() => {
      // Loading elementi yoksa devam et
    })
  },

  /**
   * Screenshot al (debug için)
   */
  async takeDebugScreenshot(page: Page, name: string): Promise<void> {
    const screenshotDir = path.join(process.cwd(), 'test-results', 'debug-screenshots')
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true })
    }
    await page.screenshot({ 
      path: path.join(screenshotDir, `${name}-${Date.now()}.png`),
      fullPage: true 
    })
  },
}

