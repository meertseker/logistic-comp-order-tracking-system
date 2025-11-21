import { _electron as electron } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tüm sayfalar ve route'ları
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
  { name: 'mail', path: '/mail', description: 'Mail' },
  { name: 'settings', path: '/settings', description: 'Ayarlar' }
];

// Component selector'ları - her sayfa için önemli component'leri bulmak için
const componentSelectors = {
  // Genel component selector'ları (daha spesifik)
  common: [
    { name: 'chart', selector: 'canvas' },
    { name: 'chart-svg', selector: 'svg[class*="recharts"]' },
    { name: 'table', selector: 'table' },
    { name: 'form', selector: 'form' },
    { name: 'modal', selector: '[role="dialog"]' },
  ],
  // Sayfa özel selector'ları
  dashboard: [
    { name: 'stat-cards', selector: '[class*="StatCard"]' },
    { name: 'earnings-chart', selector: '[class*="EarningsChart"]' },
    { name: 'vehicle-performance', selector: '[class*="VehiclePerformance"]' },
    { name: 'status-overview', selector: '[class*="StatusOverview"]' },
    { name: 'upcoming-deliveries', selector: '[class*="UpcomingDeliveries"]' },
    { name: 'quick-actions', selector: '[class*="QuickActions"]' },
  ],
  orders: [
    { name: 'orders-list', selector: '[class*="Orders"], [class*="orders-list"]' },
    { name: 'order-card', selector: '[class*="OrderCard"], [class*="order-card"]' },
    { name: 'filters', selector: '[class*="AdvancedFilters"]' },
  ],
  'create-order': [
    { name: 'order-form', selector: 'form, [class*="CreateOrder"]' },
  ],
  reports: [
    { name: 'report-filters', selector: '[class*="Filter"], [class*="DateRangePicker"]' },
    { name: 'report-table', selector: 'table' },
    { name: 'export-controls', selector: '[class*="Export"], [class*="export"]' },
  ],
  charts: [
    { name: 'chart-container', selector: '[class*="Chart"], canvas, svg[class*="recharts"]' },
  ],
  vehicles: [
    { name: 'vehicle-list', selector: '[class*="Vehicle"], [class*="vehicle"]' },
    { name: 'vehicle-card', selector: '[class*="Card"]' },
  ],
  'active-vehicles': [
    { name: 'active-vehicles-map', selector: '[class*="Map"], [class*="map"]' },
    { name: 'vehicle-list', selector: '[class*="Vehicle"], [class*="vehicle"]' },
  ],
  trailers: [
    { name: 'trailer-list', selector: '[class*="Trailer"], [class*="trailer"]' },
  ],
  routes: [
    { name: 'route-list', selector: '[class*="Route"], [class*="route"]' },
    { name: 'route-form', selector: 'form' },
  ],
  settings: [
    { name: 'settings-tabs', selector: '[class*="Tab"], [role="tablist"]' },
    { name: 'settings-form', selector: 'form' },
  ],
};

async function takeScreenshots() {
  console.log('🚀 Gelişmiş Screenshot Sistemi Başlatılıyor...\n');

  // Klasör yapısını oluştur
  const baseDir = join(__dirname, '../screenshots');
  const fullPageDir = join(baseDir, 'full-pages');
  const componentsDir = join(baseDir, 'components');

  [baseDir, fullPageDir, componentsDir].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  // Electron uygulamasını başlat
  console.log('📱 Electron uygulaması başlatılıyor...\n');
  
  const electronApp = await electron.launch({
    args: [join(__dirname, '../dist-electron/main/index.cjs')],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      SCREENSHOT_MODE: 'true'
    }
  });

  try {
    const window = await electronApp.firstWindow();
    
    console.log('✅ Electron penceresi hazır!\n');
    
    // Pencere boyutunu ayarla (geniş ekran için)
    await window.setViewportSize({ width: 1920, height: 1080 });
    
    // Uygulamanın yüklenmesini bekle
    console.log('⏳ Uygulama yükleniyor...');
    await window.waitForLoadState('domcontentloaded');
    await window.waitForLoadState('networkidle');
    await window.waitForTimeout(3000);
    
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
      }
      
      await window.reload();
      await window.waitForLoadState('networkidle');
      await window.waitForTimeout(2000);
    } catch (error) {
      console.warn('⚠️  Örnek veri eklenirken hata oluştu, devam ediliyor...\n');
    }

    // Her sayfa için screenshot al
    for (let i = 0; i < pages.length; i++) {
      const pageInfo = pages[i];
      console.log(`\n📸 Sayfa: ${pageInfo.description}`);
      console.log('─'.repeat(50));

      try {
        // Sayfaya git
        await window.evaluate((path) => {
          window.location.hash = path;
        }, pageInfo.path);

        // Sayfanın yüklenmesini bekle
        await window.waitForLoadState('networkidle');
        await window.waitForTimeout(3000);

        // Scroll yaparak tüm içeriği yükle
        await scrollToLoadAllContent(window);

        // FULL PAGE SCREENSHOT
        console.log(`  📄 Tam sayfa screenshot alınıyor...`);
        const fullPageFileName = `${String(i + 1).padStart(2, '0')}-${pageInfo.name}-full.png`;
        const fullPagePath = join(fullPageDir, fullPageFileName);
        
        await window.screenshot({
          path: fullPagePath,
          fullPage: true,
          animations: 'disabled'
        });
        console.log(`  ✅ Kaydedildi: ${fullPageFileName}`);

        // COMPONENT SCREENSHOTS
        console.log(`  🧩 Component screenshot'ları alınıyor...`);
        await takeComponentScreenshots(window, pageInfo.name, componentsDir, i + 1);

        // Sipariş detay sayfası için özel işlem
        if (pageInfo.name === 'orders') {
          await takeOrderDetailScreenshots(window, fullPageDir, componentsDir, i + 1);
        }

      } catch (error) {
        console.error(`  ❌ Hata (${pageInfo.description}):`, error.message);
      }
    }

    console.log('\n🎉 Tüm ekran görüntüleri başarıyla alındı!');
    console.log(`📁 Tam sayfa görselleri: ${fullPageDir}`);
    console.log(`📁 Component görselleri: ${componentsDir}`);

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    await electronApp.close();
  }
}

// Tüm içeriği yüklemek için scroll yap
async function scrollToLoadAllContent(window) {
  // Sayfanın en üstüne git
  await window.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await window.waitForTimeout(500);

  // Kademeli olarak aşağı scroll yap
  const scrollSteps = 10;
  const scrollDelay = 300;

  for (let i = 0; i < scrollSteps; i++) {
    await window.evaluate(({ step, totalSteps }) => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollPosition = (scrollHeight / totalSteps) * step;
      window.scrollTo(0, scrollPosition);
    }, { step: i, totalSteps: scrollSteps });
    
    await window.waitForTimeout(scrollDelay);
  }

  // En alta git
  await window.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await window.waitForTimeout(1000);

  // Tekrar en üste git
  await window.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await window.waitForTimeout(1000);
}

// Component screenshot'ları al
async function takeComponentScreenshots(window, pageName, componentsDir, pageIndex) {
  const pageSelectors = componentSelectors[pageName] || [];
  const commonSelectors = componentSelectors.common || [];
  const allSelectors = [...pageSelectors, ...commonSelectors];

  const foundComponents = [];
  const maxComponentsPerPage = 50; // Sayfa başına maksimum component sayısı

  // Her selector için elementleri bul
  for (const selectorInfo of allSelectors) {
    try {
      // Electron API'si için $$ kullan (tüm elementleri bul)
      const elements = await window.$$(selectorInfo.selector).catch(() => []);
      
      for (let j = 0; j < elements.length; j++) {
        const element = elements[j];
        
        try {
          // Element'in görünür olup olmadığını kontrol et
          const isVisible = await element.isVisible().catch(() => false);
          if (!isVisible) continue;

          // Element'in bounding box'ını al
          const box = await element.boundingBox().catch(() => null);
          // Minimum boyut eşiği: en az 100x100 piksel olmalı
          if (!box || box.width < 100 || box.height < 100) continue;
          
          // Çok büyük elementleri atla (muhtemelen container'lar)
          if (box.width > 1500 || box.height > 10000) continue;

          // Component adını oluştur
          const componentName = `${pageIndex.toString().padStart(2, '0')}-${pageName}-${selectorInfo.name}-${j + 1}`;
          
          foundComponents.push({
            element,
            name: componentName,
            box,
            selector: selectorInfo.name,
            area: box.width * box.height // Alan hesapla (büyük component'leri önceliklendirmek için)
          });
          
          // Maksimum component sayısına ulaşıldıysa dur
          if (foundComponents.length >= maxComponentsPerPage) break;
        } catch (error) {
          // Bu element için hata, bir sonrakine geç
          continue;
        }
      }
      
      if (foundComponents.length >= maxComponentsPerPage) break;
    } catch (error) {
      // Selector bulunamadı, devam et
      continue;
    }
  }
  
  // Component'leri alanlarına göre sırala (büyük olanlar önce)
  foundComponents.sort((a, b) => b.area - a.area);
  
  // İlk N component'i al (en büyükler)
  const componentsToScreenshot = foundComponents.slice(0, maxComponentsPerPage);

  // Her component için screenshot al
  for (const component of componentsToScreenshot) {
    try {
      // Element'in görünür olduğundan emin ol (scroll yap)
      await component.element.scrollIntoViewIfNeeded();
      await window.waitForTimeout(500);

      // Element'in güncel bounding box'ını al
      const currentBox = await component.element.boundingBox();
      if (!currentBox) continue;

      // Padding ekle (component'in etrafında biraz boşluk)
      const padding = 20;
      const screenshotBox = {
        x: Math.max(0, currentBox.x - padding),
        y: Math.max(0, currentBox.y - padding),
        width: currentBox.width + (padding * 2),
        height: currentBox.height + (padding * 2)
      };

      const fileName = `${component.name}.png`;
      const filePath = join(componentsDir, fileName);

      await window.screenshot({
        path: filePath,
        clip: screenshotBox,
        animations: 'disabled'
      });

      console.log(`    ✅ Component: ${component.name} (${Math.round(currentBox.width)}x${Math.round(currentBox.height)})`);
    } catch (error) {
      console.warn(`    ⚠️  Component screenshot alınamadı: ${component.name}`);
    }
  }

  // Eğer hiç component bulunamadıysa, sayfadaki tüm önemli section'ları dene
  if (componentsToScreenshot.length === 0) {
    console.log(`    ℹ️  Özel component bulunamadı, genel section'lar aranıyor...`);
    await takeGenericSectionScreenshots(window, pageName, componentsDir, pageIndex);
  }
}

// Genel section screenshot'ları al (fallback)
async function takeGenericSectionScreenshots(window, pageName, componentsDir, pageIndex) {
  const sectionSelectors = [
    'main > div > div', // Ana içerik alanları
    'section',
    '[class*="container"]',
    '[class*="grid"] > div',
    '[class*="flex"] > div[class*="w-"]'
  ];

  let sectionIndex = 1;
  
  for (const selector of sectionSelectors) {
    try {
      const elements = await window.$$(selector).catch(() => []);
      
      for (const element of elements) {
        try {
          const isVisible = await element.isVisible().catch(() => false);
          if (!isVisible) continue;

          const box = await element.boundingBox().catch(() => null);
          if (!box || box.width < 100 || box.height < 100) continue;

          await element.scrollIntoViewIfNeeded();
          await window.waitForTimeout(500);

          const currentBox = await element.boundingBox();
          if (!currentBox) continue;
          
          // Çok küçük veya çok büyük elementleri atla
          if (currentBox.width < 100 || currentBox.height < 100) continue;
          if (currentBox.width > 1500 || currentBox.height > 10000) continue;

          const padding = 20;
          const screenshotBox = {
            x: Math.max(0, currentBox.x - padding),
            y: Math.max(0, currentBox.y - padding),
            width: currentBox.width + (padding * 2),
            height: currentBox.height + (padding * 2)
          };

          const fileName = `${pageIndex.toString().padStart(2, '0')}-${pageName}-section-${sectionIndex}.png`;
          const filePath = join(componentsDir, fileName);

          await window.screenshot({
            path: filePath,
            clip: screenshotBox,
            animations: 'disabled'
          });

          console.log(`    ✅ Section: ${fileName}`);
          sectionIndex++;
          
          // Maksimum 10 section al
          if (sectionIndex > 10) break;
        } catch (error) {
          continue;
        }
      }
      
      if (sectionIndex > 10) break;
    } catch (error) {
      continue;
    }
  }
}

// Sipariş detay sayfası screenshot'ları
async function takeOrderDetailScreenshots(window, fullPageDir, componentsDir, pageIndex) {
  try {
    console.log(`  📋 Sipariş detay sayfası screenshot'ları alınıyor...`);
    
    // Siparişler sayfasına git
    await window.evaluate(() => {
      window.location.hash = '/orders';
    });
    await window.waitForTimeout(2000);
    
    // İlk sipariş kartını bul ve tıkla
    const orderSelectors = [
      'a[href*="/orders/"]',
      '[class*="OrderCard"]',
      '[class*="order-card"]',
      '.cursor-pointer[onclick*="order"]'
    ];
    
    let orderClicked = false;
    for (const selector of orderSelectors) {
      try {
        const firstOrder = await window.$(selector);
        if (firstOrder && await firstOrder.isVisible().catch(() => false)) {
          await firstOrder.click();
          await window.waitForTimeout(3000);
          orderClicked = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (orderClicked) {
      await scrollToLoadAllContent(window);
      
      // Full page screenshot
      const fullPagePath = join(fullPageDir, `${pageIndex.toString().padStart(2, '0')}-order-detail-full.png`);
      await window.screenshot({
        path: fullPagePath,
        fullPage: true,
        animations: 'disabled'
      });
      console.log(`    ✅ Tam sayfa: order-detail-full.png`);
      
      // Component screenshots
      await takeComponentScreenshots(window, 'order-detail', componentsDir, pageIndex);
    } else {
      console.log(`    ℹ️  Sipariş bulunamadı`);
    }
  } catch (error) {
    console.warn(`    ⚠️  Sipariş detay screenshot'ları alınamadı`);
  }
}

// Script'i çalıştır
takeScreenshots().catch(console.error);

