// Bu scripti Electron içinden çalıştırmak için
// electron/main/index.ts içine ekleyeceğiz

export function seedSampleData(db) {
  console.log('\n📊 Örnek veri ekleme başlatılıyor...');
  
  // Örnek şirket isimleri
  const companies = [
    'Anadolu Lojistik A.Ş.',
    'Marmara Nakliyat Ltd.',
    'Ege Taşımacılık',
    'Karadeniz Kargo',
    'Akdeniz Transport',
    'Başkent Lojistik',
    'Metro Nakliye',
    'Elit Taşıma',
    'Güven Kargo',
    'Hızır Nakliyat'
  ];

  // Örnek şehirler
  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
    'Adana', 'Gaziantep', 'Konya', 'Kayseri', 'Mersin',
    'Eskişehir', 'Denizli', 'Samsun', 'Trabzon', 'Malatya'
  ];

  // Örnek yük açıklamaları
  const cargoTypes = [
    'Gıda Ürünleri - Paletli',
    'Tekstil Malzemeleri',
    'İnşaat Malzemesi',
    'Elektronik Eşya',
    'Mobilya - Dikkat',
    'Kimyevi Maddeler',
    'Otomotiv Yedek Parça',
    'Tarım Ürünleri',
    'Medikal Malzeme',
    'Kırtasiye Ürünleri',
    'Temizlik Malzemeleri',
    'Plastik Ürünler',
    'Metal İşleri',
    'Cam ve Seramik'
  ];

  // Durum tipleri
  const statuses = ['Bekliyor', 'Yolda', 'Teslim Edildi', 'İptal'];
  const statusWeights = [0.2, 0.3, 0.4, 0.1];

  // Ağırlıklı rastgele seçim
  function weightedRandom(items, weights) {
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return items[i];
    }
    return items[items.length - 1];
  }

  // Rastgele tarih (son 6 ay)
  function randomDate() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
    return new Date(randomTime).toISOString().slice(0, 19).replace('T', ' ');
  }

  // Plaka oluştur
  function generatePlate() {
    const cities = ['34', '06', '35', '16', '07', '01', '27', '42', '38', '33'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const letters = 'ABCDEFGHJKLMNPRSTUVYZ';
    const letter1 = letters[Math.floor(Math.random() * letters.length)];
    const letter2 = letters[Math.floor(Math.random() * letters.length)];
    const letter3 = letters[Math.floor(Math.random() * letters.length)];
    const number = Math.floor(Math.random() * 900) + 100;
    return `${city} ${letter1}${letter2} ${number}`;
  }

  // Telefon numarası
  function generatePhone() {
    return `05${Math.floor(Math.random() * 4) + 3}${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`;
  }

  // Email oluştur
  function generateEmail(company) {
    const domain = company.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z]/g, '')
      .substring(0, 10);
    return `info@${domain}.com.tr`;
  }

  try {
    console.log('🚛 1. Araçlar ekleniyor...');
    const plates = [];
    for (let i = 0; i < 15; i++) {
      const plaka = generatePlate();
      plates.push(plaka);
      try {
        db.prepare(`
          INSERT OR IGNORE INTO vehicles (plaka, aktif, created_at)
          VALUES (?, 1, datetime('now'))
        `).run(plaka);
      } catch (error) {
        // Ignore duplicate
      }
    }
    console.log(`✅ ${plates.length} araç eklendi`);

    console.log('🚚 2. Dorseler ekleniyor...');
    const dorseTypes = ['Kapalı', 'Açık', 'Soğuk Hava', 'Tenteli', 'Lowbed'];
    const dorseStatuses = ['Boş', 'Dolu', 'Bakımda', 'Yolda'];

    for (let i = 1; i <= 20; i++) {
      const dorseNo = `D-${i.toString().padStart(4, '0')}`;
      const tip = dorseTypes[Math.floor(Math.random() * dorseTypes.length)];
      const durum = dorseStatuses[Math.floor(Math.random() * dorseStatuses.length)];
      const en = 240 + Math.floor(Math.random() * 20);
      const boy = 1320 + Math.floor(Math.random() * 80);
      const yukseklik = 250 + Math.floor(Math.random() * 50);
      const hacim = (en * boy * yukseklik) / 1000000;
      const maxAgirlik = 20 + Math.floor(Math.random() * 15);
      const mevcutAgirlik = durum === 'Dolu' ? Math.random() * maxAgirlik : 0;
      const mevcutHacim = durum === 'Dolu' ? Math.random() * hacim : 0;
      const aracPlaka = plates[Math.floor(Math.random() * plates.length)];
      
      try {
        db.prepare(`
          INSERT OR IGNORE INTO trailers (
            dorse_no, en_cm, boy_cm, yukseklik_cm, hacim_m3,
            max_agirlik_ton, mevcut_agirlik_ton, mevcut_hacim_m3,
            durum, lokasyon, arac_plakasi, tip, notlar, aktif,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        `).run(
          dorseNo, en, boy, yukseklik, hacim, maxAgirlik,
          mevcutAgirlik, mevcutHacim, durum,
          cities[Math.floor(Math.random() * cities.length)],
          aracPlaka, tip, ''
        );
      } catch (error) {
        // Ignore duplicate
      }
    }
    console.log('✅ 20 dorse eklendi');

    console.log('🗺️  3. Güzergahlar ekleniyor...');
    for (let i = 0; i < 30; i++) {
      const from = cities[Math.floor(Math.random() * cities.length)];
      let to = cities[Math.floor(Math.random() * cities.length)];
      while (to === from) {
        to = cities[Math.floor(Math.random() * cities.length)];
      }
      
      const distance = 100 + Math.random() * 1000;
      const hgsCost = distance * (0.05 + Math.random() * 0.1);
      const time = distance / (60 + Math.random() * 20);
      
      try {
        db.prepare(`
          INSERT OR IGNORE INTO routes (
            nereden, nereye, mesafe_km, hgs_maliyet, kopru_maliyet, sure_saat,
            notlar, aktif, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 0, ?, '', 1, datetime('now'), datetime('now'))
        `).run(from, to, distance, hgsCost, time);
      } catch (error) {
        // Ignore duplicate
      }
    }
    console.log('✅ 30 güzergah eklendi');

    console.log('📦 4. Siparişler ekleniyor...');
    let ordersAdded = 0;

    for (let i = 0; i < 50; i++) {
      const plaka = plates[Math.floor(Math.random() * plates.length)];
      const musteri = companies[Math.floor(Math.random() * companies.length)];
      const telefon = generatePhone();
      const email = generateEmail(musteri);
      const nereden = cities[Math.floor(Math.random() * cities.length)];
      let nereye = cities[Math.floor(Math.random() * cities.length)];
      while (nereye === nereden) {
        nereye = cities[Math.floor(Math.random() * cities.length)];
      }
      
      const yukAciklamasi = cargoTypes[Math.floor(Math.random() * cargoTypes.length)];
      const status = weightedRandom(statuses, statusWeights);
      
      // Maliyet hesaplamaları
      const gidisKm = 200 + Math.random() * 800;
      const donusKm = Math.random() > 0.7 ? gidisKm * (0.3 + Math.random() * 0.5) : gidisKm;
      const returnLoadRate = donusKm / gidisKm;
      const etkinKm = gidisKm + (donusKm * (1 - returnLoadRate));
      const tahminiGun = Math.ceil(etkinKm / 600);
      
      const yakitLitre = etkinKm * (0.25 + Math.random() * 0.1);
      const yakitFiyat = 35 + Math.random() * 5;
      const yakitMaliyet = yakitLitre * yakitFiyat;
      
      const surucuMaliyet = tahminiGun * (1500 + Math.random() * 500);
      const yemekMaliyet = tahminiGun * 3 * (150 + Math.random() * 100);
      const hgsMaliyet = gidisKm * (0.15 + Math.random() * 0.1);
      const bakimMaliyet = etkinKm * (0.3 + Math.random() * 0.2);
      
      const toplamMaliyet = yakitMaliyet + surucuMaliyet + yemekMaliyet + hgsMaliyet + bakimMaliyet;
      const karMarji = 0.15 + Math.random() * 0.25;
      const onerilenFiyat = toplamMaliyet * (1 + karMarji);
      
      // Gerçek fiyat
      const fiyatVariance = -0.1 + Math.random() * 0.3;
      const baslangicFiyati = onerilenFiyat * (1 + fiyatVariance);
      
      const karZarar = baslangicFiyati - toplamMaliyet;
      const karZararYuzde = (karZarar / toplamMaliyet) * 100;
      
      const isSubcontractor = Math.random() > 0.8 ? 1 : 0;
      const subcontractorCompany = isSubcontractor ? companies[Math.floor(Math.random() * companies.length)] : null;
      const subcontractorVehicle = isSubcontractor ? generatePlate() : null;
      const subcontractorCost = isSubcontractor ? toplamMaliyet * (1.05 + Math.random() * 0.1) : 0;
      
      const createdAt = randomDate();
      
      try {
        const result = db.prepare(`
          INSERT INTO orders (
            plaka, musteri, telefon, customer_email, nereden, nereye, yuk_aciklamasi, baslangic_fiyati,
            gidis_km, donus_km, return_load_rate, etkin_km, tahmini_gun,
            yakit_litre, yakit_maliyet, surucu_maliyet, yemek_maliyet, hgs_maliyet, bakim_maliyet,
            toplam_maliyet, onerilen_fiyat, kar_zarar, kar_zarar_yuzde,
            is_subcontractor, subcontractor_company, subcontractor_vehicle, subcontractor_cost,
            status, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          plaka, musteri, telefon, email, nereden, nereye, yukAciklamasi, baslangicFiyati,
          gidisKm, donusKm, returnLoadRate, etkinKm, tahminiGun,
          yakitLitre, yakitMaliyet, surucuMaliyet, yemekMaliyet, hgsMaliyet, bakimMaliyet,
          toplamMaliyet, onerilenFiyat, karZarar, karZararYuzde,
          isSubcontractor, subcontractorCompany, subcontractorVehicle, subcontractorCost,
          status, createdAt, createdAt
        );
        
        ordersAdded++;
        
        // Bazı siparişlere masraf ekle
        if (Math.random() > 0.6 && result.lastInsertRowid) {
          const expenseTypes = ['Yakıt', 'Yemek', 'HGS/Köprü', 'Bakım', 'Park', 'Vinjeta', 'Diğer'];
          const expenseCount = 1 + Math.floor(Math.random() * 3);
          
          for (let j = 0; j < expenseCount; j++) {
            const expenseType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
            const expenseAmount = 100 + Math.random() * 1000;
            const expenseDesc = `${expenseType} masrafı`;
            
            db.prepare(`
              INSERT INTO expenses (order_id, type, amount, description, timestamp)
              VALUES (?, ?, ?, ?, ?)
            `).run(result.lastInsertRowid, expenseType, expenseAmount, expenseDesc, createdAt);
          }
        }
      } catch (error) {
        console.error('Sipariş ekleme hatası:', error);
      }
    }
    console.log(`✅ ${ordersAdded} sipariş eklendi`);

    console.log('⚙️  5. Ayarlar ekleniyor...');
    const settings = [
      { key: 'yakit_litre_fiyat', value: '38.50', description: 'Yakıt litre fiyatı (TL)' },
      { key: 'surucu_gunluk_ucret', value: '1800', description: 'Sürücü günlük ücreti (TL)' },
      { key: 'yemek_gun_kisi', value: '250', description: 'Yemek günlük kişi başı (TL)' },
      { key: 'bakim_km_maliyet', value: '0.35', description: 'Bakım km başı maliyet (TL)' },
      { key: 'km_yakit_tuketim', value: '0.28', description: 'KM başı yakıt tüketimi (lt)' },
      { key: 'gunluk_ortalama_km', value: '600', description: 'Günlük ortalama KM' },
      { key: 'kar_marji_hedef', value: '20', description: 'Hedef kar marjı (%)' },
      { key: 'company_name', value: 'Sekersoft Lojistik', description: 'Firma Adı' },
      { key: 'company_phone', value: '0555 123 4567', description: 'Firma Telefon' },
      { key: 'company_email', value: 'info@sekersoft.com.tr', description: 'Firma Email' }
    ];

    for (const setting of settings) {
      try {
        db.prepare(`
          INSERT OR REPLACE INTO settings (key, value, description, updated_at)
          VALUES (?, ?, ?, datetime('now'))
        `).run(setting.key, setting.value, setting.description);
      } catch (error) {
        // Ignore
      }
    }
    console.log('✅ Ayarlar eklendi');

    console.log('\n🎉 Tüm örnek veriler başarıyla eklendi!');
    console.log(`
📊 Özet:
  • 15 Araç
  • 20 Dorse
  • 30 Güzergah
  • ${ordersAdded} Sipariş
  • 10 Ayar
`);

    return { success: true, ordersAdded };
  } catch (error) {
    console.error('❌ Örnek veri ekleme hatası:', error);
    return { success: false, error: error.message };
  }
}




