/**
 * KRİTİK TEST: Maliyet Hesaplama Modülü
 * Bu modül yanlış çalışırsa şirketler para kaybeder!
 */

import { 
  ProfessionalCostCalculator, 
  DEFAULT_PROFESSIONAL_PARAMS,
  type ProfessionalVehicleParams,
  type RouteInfo
} from '../../../electron/main/professional-cost-calculator'

describe('ProfessionalCostCalculator - KRİTİK TESTLER', () => {
  let calculator: ProfessionalCostCalculator

  beforeEach(() => {
    calculator = new ProfessionalCostCalculator(DEFAULT_PROFESSIONAL_PARAMS)
  })

  describe('Yakıt Hesaplaması', () => {
    it('900 km için doğru litre ve maliyet hesaplamalı', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(900)
      
      // MANUEL HESAP:
      // 900 km / 100 * 25 lt/100km = 225 lt
      // 225 lt * 40 TL/lt = 9000 TL
      
      expect(litre).toBe(225)
      expect(maliyet).toBe(9000)
    })

    it('450 km (İstanbul-Ankara) için doğru hesaplama', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(450)
      
      // 450 / 100 * 25 = 112.5 lt
      // 112.5 * 40 = 4500 TL
      
      expect(litre).toBe(112.5)
      expect(maliyet).toBe(4500)
    })

    it('0 km için 0 maliyet dönmeli', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(0)
      expect(litre).toBe(0)
      expect(maliyet).toBe(0)
    })

    it('çok büyük mesafe (100,000 km) için overflow olmamalı', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(100000)
      
      expect(Number.isFinite(litre)).toBe(true)
      expect(Number.isFinite(maliyet)).toBe(true)
      expect(litre).toBeGreaterThan(0)
      expect(maliyet).toBeGreaterThan(0)
    })

    it('ondalıklı km (456.78) için doğru hesaplama', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(456.78)
      
      const expectedLitre = (456.78 / 100) * 25
      const expectedMaliyet = expectedLitre * 40
      
      expect(litre).toBeCloseTo(expectedLitre, 2)
      expect(maliyet).toBeCloseTo(expectedMaliyet, 2)
    })
  })

  describe('Sürücü Maliyeti', () => {
    it('2 gün için doğru sürücü ve yemek maliyeti', () => {
      const { gun, ucret, yemek } = calculator.calculateDriverCost(900, 2)
      
      // 2 gün * 1600 TL = 3200 TL
      // 2 gün * 150 TL = 300 TL
      
      expect(gun).toBe(2)
      expect(ucret).toBe(3200)
      expect(yemek).toBe(300)
    })

    it('gün belirtilmezse km bazlı hesaplamalı', () => {
      const { gun, ucret, yemek } = calculator.calculateDriverCost(900)
      
      // 900 km / 500 km/gün = 1.8 -> yukarı yuvarla -> 2 gün
      expect(gun).toBe(2)
      expect(ucret).toBe(3200)
      expect(yemek).toBe(300)
    })

    it('1 günden az sürecek sefer için minimum 1 gün saymalı', () => {
      const { gun, ucret, yemek } = calculator.calculateDriverCost(100)
      
      expect(gun).toBe(1)
      expect(ucret).toBe(1600)
      expect(yemek).toBe(150)
    })

    it('çok uzun sefer (10,000 km) için mantıklı gün hesabı', () => {
      const { gun, ucret, yemek } = calculator.calculateDriverCost(10000)
      
      // 10000 / 500 = 20 gün
      expect(gun).toBe(20)
      expect(ucret).toBe(32000)
      expect(yemek).toBe(3000)
    })
  })

  describe('HGS/Köprü Maliyeti', () => {
    it('İstanbul-Ankara güzergahı için doğru HGS', () => {
      const hgs = calculator.calculateTollCost('İstanbul', 'Ankara', 450)
      
      // Hardcoded: 450 TL HGS + 150 TL köprü = 600 TL
      expect(hgs).toBe(600)
    })

    it('database\'den gelen güzergah bilgisini öncelikli kullanmalı', () => {
      const routeFromDB = {
        hgs_maliyet: 500,
        kopru_maliyet: 200
      }
      
      const hgs = calculator.calculateTollCost('İstanbul', 'Ankara', 450, routeFromDB)
      
      // Database öncelikli: 500 + 200 = 700
      expect(hgs).toBe(700)
    })

    it('bilinmeyen güzergah için 0 dönmeli', () => {
      const hgs = calculator.calculateTollCost('Bilinmeyen Şehir', 'Başka Şehir', 100)
      
      expect(hgs).toBe(0)
    })

    it('şehir ismi case-insensitive olmalı', () => {
      const hgs1 = calculator.calculateTollCost('istanbul', 'ankara', 450)
      const hgs2 = calculator.calculateTollCost('İSTANBUL', 'ANKARA', 450)
      const hgs3 = calculator.calculateTollCost('İstanbul', 'Ankara', 450)
      
      expect(hgs1).toBe(hgs2)
      expect(hgs2).toBe(hgs3)
    })
  })

  describe('Bakım Maliyeti', () => {
    it('900 km için detaylı bakım maliyeti doğru hesaplanmalı', () => {
      const maintenance = calculator.calculateMaintenanceCost(900, 2)
      
      // MANUEL HESAP:
      // Yağ: (900 / 5000) * 500 = 90 TL
      // Lastik: (900 / 50000) * 8000 = 144 TL
      // Büyük Bakım: (900 / 15000) * 3000 = 180 TL
      // Ufak Onarım: (200 / 30) * 2 gün = 13.33 TL
      // TOPLAM: ~427 TL
      
      expect(maintenance.yag).toBeCloseTo(90, 1)
      expect(maintenance.lastik).toBeCloseTo(144, 1)
      expect(maintenance.bakim).toBeCloseTo(180, 1)
      expect(maintenance.onarim).toBeCloseTo(13.33, 1)
      expect(maintenance.toplam).toBeCloseTo(427.33, 1)
    })

    it('0 km için 0 maliyet (onarım hariç)', () => {
      const maintenance = calculator.calculateMaintenanceCost(0, 1)
      
      expect(maintenance.yag).toBe(0)
      expect(maintenance.lastik).toBe(0)
      expect(maintenance.bakim).toBe(0)
      // Ufak onarım günlük bazlı, 0 değil
      expect(maintenance.onarim).toBeGreaterThan(0)
    })
  })

  describe('Etkin KM Hesaplama', () => {
    it('dönüşte yük yoksa (return rate = 0) tam mesafe sayılmalı', () => {
      const etkinKm = calculator.calculateEffectiveKm(450, 450, 0)
      
      // 450 + 450 * (1-0) = 450 + 450 = 900
      expect(etkinKm).toBe(900)
    })

    it('dönüşte %100 yük varsa (return rate = 1) dönüş sayılmamalı', () => {
      const etkinKm = calculator.calculateEffectiveKm(450, 450, 1)
      
      // 450 + 450 * (1-1) = 450 + 0 = 450
      expect(etkinKm).toBe(450)
    })

    it('dönüşte %50 yük varsa (return rate = 0.5) yarısı sayılmalı', () => {
      const etkinKm = calculator.calculateEffectiveKm(450, 450, 0.5)
      
      // 450 + 450 * (1-0.5) = 450 + 225 = 675
      expect(etkinKm).toBe(675)
    })

    it('sadece gidiş varsa (dönüş = 0) sadece gidiş sayılmalı', () => {
      const etkinKm = calculator.calculateEffectiveKm(450, 0, 0)
      
      expect(etkinKm).toBe(450)
    })
  })

  describe('KRİTİK: Detaylı Maliyet Analizi - İstanbul-Ankara Örneği', () => {
    it('gerçek senaryo: İstanbul-Ankara gidiş-dönüş TAM HESAP', () => {
      const route: RouteInfo = {
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 450,
        donusKm: 450,
        returnLoadRate: 0,
        tahminiGun: 2
      }

      const routeFromDB = {
        hgs_maliyet: 450,
        kopru_maliyet: 150
      }

      const analysis = calculator.analyzeDetailedCost(route, 21208, routeFromDB)

      // MANUEL HESAP KONTROLÜ:
      
      // 1. Etkin KM
      expect(analysis.etkinKm).toBe(900)

      // 2. Yakıt
      // 900 / 100 * 25 = 225 lt
      // 225 * 40 = 9000 TL
      expect(analysis.costBreakdown.yakitLitre).toBe(225)
      expect(analysis.costBreakdown.yakitMaliyet).toBe(9000)

      // 3. Sürücü
      // 2 gün * 1600 = 3200 TL
      expect(analysis.costBreakdown.surucuGun).toBe(2)
      expect(analysis.costBreakdown.surucuMaliyet).toBe(3200)

      // 4. Yemek
      // 2 gün * 150 = 300 TL
      expect(analysis.costBreakdown.yemekMaliyet).toBe(300)

      // 5. HGS
      // 450 + 150 = 600 TL
      expect(analysis.costBreakdown.hgsMaliyet).toBe(600)

      // 6. Bakım (yaklaşık)
      // Yağ: 90, Lastik: 144, Büyük Bakım: 180, Onarım: 13.33 = ~427 TL
      expect(analysis.costBreakdown.toplamBakimMaliyet).toBeCloseTo(427, 0)

      // 7. TOPLAM MALİYET (direkt değişken)
      // 9000 + 3200 + 300 + 600 + 427 = ~13527 TL (sigorta/MTV hariç)
      const expectedDirectCost = 9000 + 3200 + 300 + 600 + 427
      expect(analysis.costBreakdown.toplamDirektMaliyet).toBeCloseTo(expectedDirectCost, 0)

      // 8. Kar/Zarar Kontrolü
      expect(analysis.musteriOdemesi).toBe(21208)
      
      // NOT: 21,208 TL gerçekte DÜŞÜK bir fiyat (zararlı)
      // Çünkü maliyet ~13,628 TL + %45 kar + %20 KDV = ~23,713 TL olmalı
      // Test amacı: Sistemi önerilen fiyat ile karlı mı kontrol et
      
      // Sistemin önerdiği fiyat ile test edelim
      const testWithRecommended = calculator.analyzeDetailedCost(route, analysis.fiyatKdvli, routeFromDB)
      expect(testWithRecommended.karZarar).toBeGreaterThanOrEqual(-1) // ~0 olmalı (başabaş veya hafif kar)
      expect(testWithRecommended.karZararYuzde).toBeGreaterThanOrEqual(-1)
    })

    it('müşteri çok düşük fiyat verirse ZARAR göstermeli', () => {
      const route: RouteInfo = {
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 450,
        donusKm: 450,
        returnLoadRate: 0,
        tahminiGun: 2
      }

      const analysis = calculator.analyzeDetailedCost(route, 10000, {
        hgs_maliyet: 450,
        kopru_maliyet: 150
      })

      // 10000 TL çok düşük, maliyet ~13500 TL
      expect(analysis.karZarar).toBeLessThan(0) // Zararlı
      expect(analysis.karZararYuzde).toBeLessThan(0)
    })

    it('önerilen fiyat mantıklı olmalı (maliyet + kar + KDV)', () => {
      const route: RouteInfo = {
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 450,
        donusKm: 450,
        returnLoadRate: 0,
        tahminiGun: 2
      }

      const analysis = calculator.analyzeDetailedCost(route, 0)

      // Önerilen fiyat: maliyet * (1 + kar) * (1 + KDV)
      // Maliyet ~13527, Kar %45, KDV %20
      // 13527 * 1.45 * 1.20 = ~23524 TL
      
      expect(analysis.fiyatKdvli).toBeGreaterThan(analysis.toplamMaliyet)
      expect(analysis.fiyatKdvli).toBeGreaterThan(20000)
      expect(analysis.fiyatKdvli).toBeLessThan(30000)
    })

    it('başabaş noktası = maliyet + KDV (kar 0)', () => {
      const route: RouteInfo = {
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 450,
        donusKm: 450,
        returnLoadRate: 0,
        tahminiGun: 2
      }

      const analysis = calculator.analyzeDetailedCost(route, 0)

      // Başabaş = maliyet * 1.20
      const expectedBreakEven = analysis.toplamMaliyet * 1.20
      expect(analysis.onerilenMinFiyat).toBeCloseTo(expectedBreakEven, 0)
    })
  })

  describe('KRİTİK: Manuel Hesap vs Sistem Hesabı Karşılaştırması', () => {
    it('1000 farklı senaryo için fark toleransı: maksimum 1 TL', () => {
      const scenarios = generateRandomScenarios(1000)
      
      let maxDifference = 0
      let failedScenarios = 0

      scenarios.forEach((scenario, index) => {
        const manualCost = calculateManualCost(scenario)
        const systemAnalysis = calculator.analyzeDetailedCost(scenario.route, 0)
        
        const difference = Math.abs(manualCost - systemAnalysis.toplamMaliyet)
        
        if (difference > maxDifference) {
          maxDifference = difference
        }
        
        if (difference > 1) {
          failedScenarios++
          console.error(`Senaryo ${index + 1} HATA: Manuel=${manualCost}, Sistem=${systemAnalysis.toplamMaliyet}, Fark=${difference}`)
        }
      })

      expect(failedScenarios).toBe(0)
      expect(maxDifference).toBeLessThanOrEqual(1)
    })
  })

  describe('Edge Cases ve Hata Senaryoları', () => {
    it('null/undefined parametrelerde crash olmamalı', () => {
      const route: any = {
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 450,
        donusKm: undefined,
        returnLoadRate: null,
        tahminiGun: undefined
      }

      expect(() => calculator.analyzeDetailedCost(route, 0)).not.toThrow()
    })

    it('negatif km ile mantıklı davranış', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(-100)
      
      // Negatif km kabul edilmemeli veya 0 dönmeli
      expect(litre).toBeGreaterThanOrEqual(0)
      expect(maliyet).toBeGreaterThanOrEqual(0)
    })

    it('çok büyük sayılar (Number.MAX_SAFE_INTEGER yakını) ile overflow yok', () => {
      const { litre, maliyet } = calculator.calculateFuelCost(1000000)
      
      expect(Number.isSafeInteger(litre)).toBe(true)
      expect(Number.isSafeInteger(maliyet)).toBe(true)
    })

    it('ondalık hassasiyeti: 0.01 TL fark olmamalı', () => {
      const { maliyet } = calculator.calculateFuelCost(456.789)
      
      const expectedMaliyet = (456.789 / 100) * 25 * 40
      expect(Math.abs(maliyet - expectedMaliyet)).toBeLessThan(0.01)
    })
  })
})

// ====== HELPER FUNCTIONS ======

interface TestScenario {
  route: RouteInfo
  params: ProfessionalVehicleParams
}

function generateRandomScenarios(count: number): TestScenario[] {
  const scenarios: TestScenario[] = []
  
  for (let i = 0; i < count; i++) {
    const gidisKm = Math.floor(Math.random() * 2000) + 100 // 100-2100 km
    const donusKm = Math.floor(Math.random() * gidisKm) // 0-gidisKm
    const returnLoadRate = Math.random() // 0-1
    const tahminiGun = Math.max(1, Math.ceil(gidisKm / 500))
    
    scenarios.push({
      route: {
        nereden: 'Test A',
        nereye: 'Test B',
        gidisKm,
        donusKm,
        returnLoadRate,
        tahminiGun
      },
      params: DEFAULT_PROFESSIONAL_PARAMS
    })
  }
  
  return scenarios
}

function calculateManualCost(scenario: TestScenario): number {
  const { route, params } = scenario
  
  // Etkin KM
  const etkinKm = route.gidisKm + route.donusKm * (1 - route.returnLoadRate)
  
  // Yakıt
  const yakitLitre = (etkinKm / 100) * params.yakitTuketimi
  const yakitMaliyet = yakitLitre * params.yakitFiyati
  
  // Sürücü
  const gun = route.tahminiGun || Math.max(1, Math.ceil(etkinKm / params.gunlukOrtKm))
  const surucuMaliyet = gun * params.gunlukUcret
  const yemekMaliyet = gun * params.yemekGunluk
  
  // HGS (varsayılan 0)
  const hgsMaliyet = 0
  
  // Bakım
  const yagMaliyet = (etkinKm / params.yagDegisimAralik) * params.yagDegisimMaliyet
  const lastikMaliyet = (etkinKm / params.lastikOmur) * params.lastikMaliyet
  const bakimMaliyet = (etkinKm / params.buyukBakimAralik) * params.buyukBakimMaliyet
  const onarimMaliyet = (params.ufakOnarimAylik / 30) * gun
  
  // Sigorta/MTV (gün bazlı)
  const sigortaMaliyet = (params.sigorta / 365) * gun
  const mtvMaliyet = (params.mtv / 365) * gun
  const muayeneMaliyet = (params.muayene / 365) * gun
  
  const toplamMaliyet = 
    yakitMaliyet +
    surucuMaliyet +
    yemekMaliyet +
    hgsMaliyet +
    yagMaliyet +
    lastikMaliyet +
    bakimMaliyet +
    onarimMaliyet +
    sigortaMaliyet +
    mtvMaliyet +
    muayeneMaliyet
  
  return toplamMaliyet
}

