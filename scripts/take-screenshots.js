import { _electron as electron } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pages = [
  { name: 'dashboard', path: '/', description: 'Ana Sayfa (Dashboard)' },
  { name: 'orders', path: '/orders', description: 'Siparişler' },
  { name: 'create-order', path: '/orders/new', description: 'Yeni Sipariş Oluştur' },
  { name: 'reports', path: '/reports', description: 'Raporlar' },
  { name: 'charts', path: '/charts', description: 'Grafikler' },
  { name: 'vehicles', path: '/vehicles', description: 'Araçlar' },
  { name: 'active-vehicles', path: '/active-vehicles', description: 'Aktif Araçlar' },
  { name: 'trailers', path: '/trailers', description: 'Dorse/Römorklar' },
  { name: 'routes', path: '/routes', description: 'Güzergahlar' },
  { name: 'settings', path: '/settings', description: 'Ayarlar' }
];

async function takeScreenshots() {
  console.log('🚀 Electron uygulama ile ekran görüntüleri alınıyor...\n');

  // Screenshots klasörünü oluştur
  const screenshotsDir = join(__dirname, '../screenshots');
  if (!existsSync(screenshotsDir)) {
    mkdirSync(screenshotsDir, { recursive: true });
  }

  // Electron uygulamasını başlat
  console.log('📱 Electron uygulaması başlatılıyor...\n');
  
  const electronApp = await electron.launch({
    args: [join(__dirname, '../dist-electron/main/index.cjs')],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      SCREENSHOT_MODE: 'true'  // Lisans kontrolünü bypass et
    }
  });

  try {
    // Ana pencereyi al
    const window = await electronApp.firstWindow();
    
    console.log('✅ Electron penceresi hazır!\n');
    
    // Pencere boyutunu ayarla
    await window.setViewportSize({ width: 1920, height: 1080 });
    
    // Uygulamanın tamamen yüklenmesini bekle
    console.log('⏳ Uygulama yükleniyor...');
    await window.waitForLoadState('domcontentloaded');
    await window.waitForLoadState('networkidle');
    await window.waitForTimeout(3000);
    
    // React'in mount olmasını bekle
    await window.waitForSelector('body', { state: 'attached' });
    await window.waitForTimeout(2000);
    
    console.log('✅ Uygulama hazır!\n');
    
    // Örnek verileri ekle
    console.log('📊 Örnek veriler ekleniyor...\n');
    try {
      const seedResult = await window.evaluate(async () => {
        if (window.electronAPI && window.electronAPI.db && window.electronAPI.db.seedSampleData) {
          return await window.electronAPI.db.seedSampleData();
        }
        return { success: false, error: 'API not available' };
      });
      
      if (seedResult.success) {
        console.log(`✅ ${seedResult.ordersAdded} sipariş ve diğer örnek veriler eklendi!\n`);
      } else {
        console.warn('⚠️  Örnek veri ekleme hatası:', seedResult.error, '\n');
      }
      
      // Sayfayı yenile
      console.log('🔄 Sayfa yenileniyor...\n');
      await window.reload();
      await window.waitForLoadState('networkidle');
      await window.waitForTimeout(2000);
    } catch (error) {
      console.warn('⚠️  Örnek veri eklenirken hata oluştu, devam ediliyor...\n');
    }

    // Her sayfa için screenshot al
    for (let i = 0; i < pages.length; i++) {
      const pageInfo = pages[i];
      console.log(`📸 Alınıyor: ${pageInfo.description}`);

      try {
        // Hash router kullanıldığı için hash ile navigate et
        await window.evaluate((path) => {
          window.location.hash = path;
        }, pageInfo.path);

        // Sayfanın yüklenmesini bekle
        await window.waitForLoadState('networkidle');
        await window.waitForTimeout(2000);

        // Scroll yaparak lazy-loaded içerikleri yükle
        await window.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await window.waitForTimeout(1000);
        await window.evaluate(() => {
          window.scrollTo(0, 0);
        });
        await window.waitForTimeout(1000);

        // Screenshot al
        const fileName = `${String(i + 1).padStart(2, '0')}-${pageInfo.name}.png`;
        await window.screenshot({
          path: join(screenshotsDir, fileName),
          fullPage: true
        });

        console.log(`✅ Kaydedildi: ${fileName}\n`);

      } catch (error) {
        console.error(`❌ Hata (${pageInfo.description}):`, error.message);
      }
    }

    // Bonus: Eğer sipariş varsa, sipariş detay sayfası
    try {
      console.log('📸 Alınıyor: Sipariş Detay Sayfası (varsa)');
      
      await window.evaluate(() => {
        window.location.hash = '/orders';
      });
      await window.waitForTimeout(2000);
      
      // İlk sipariş kartına tıkla
      const firstOrder = await window.$('.cursor-pointer[onclick], a[href*="orders/"]');
      if (firstOrder) {
        await firstOrder.click();
        await window.waitForTimeout(2000);
        await window.screenshot({
          path: join(screenshotsDir, '99-order-detail.png'),
          fullPage: true
        });
        console.log('✅ Kaydedildi: 99-order-detail.png\n');
      } else {
        console.log('ℹ️  Sipariş bulunamadı\n');
      }
    } catch (error) {
      console.log('ℹ️  Sipariş detay sayfası alınamadı\n');
    }

    console.log('🎉 Tüm ekran görüntüleri başarıyla alındı!');
    console.log(`📁 Klasör: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    await electronApp.close();
  }
}

// Script'i çalıştır
takeScreenshots().catch(console.error);

