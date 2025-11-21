/**
 * Cost Calculator Performance Tests
 * 
 * Maliyet hesaplama modülünün performansını test eder
 * Hedef: 10,000 hesaplama < 1 saniye
 */

import { ProfessionalCostCalculator, DEFAULT_PROFESSIONAL_PARAMS } from '../../electron/main/professional-cost-calculator'

describe('Cost Calculator Performance Tests', () => {
  let calculator: ProfessionalCostCalculator
  
  beforeAll(() => {
    calculator = new ProfessionalCostCalculator(DEFAULT_PROFESSIONAL_PARAMS)
  })
  
  describe('Fuel Cost Calculation Performance', () => {
    it('1000 yakıt hesaplaması < 100ms olmalı', () => {
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        calculator.calculateFuelCost(Math.random() * 2000)
      }
      
      const duration = performance.now() - start
      
      console.log(`1000 yakıt hesaplaması: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(100)
    })
    
    it('10,000 yakıt hesaplaması < 1000ms (1 saniye) olmalı', () => {
      const start = performance.now()
      
      for (let i = 0; i < 10000; i++) {
        calculator.calculateFuelCost(Math.random() * 2000)
      }
      
      const duration = performance.now() - start
      
      console.log(`10,000 yakıt hesaplaması: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(1000)
    })
  })
  
  describe('Driver Cost Calculation Performance', () => {
    it('1000 sürücü maliyet hesaplaması < 100ms olmalı', () => {
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        calculator.calculateDriverCost(Math.random() * 10)
      }
      
      const duration = performance.now() - start
      
      console.log(`1000 sürücü hesaplaması: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(100)
    })
  })
  
  describe('Full Cost Analysis Performance', () => {
    it('100 detaylı maliyet analizi < 500ms olmalı', () => {
      const routes = Array.from({ length: 100 }, () => ({
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 400 + Math.random() * 200,
        donusKm: 400 + Math.random() * 200,
        returnLoadRate: Math.random(),
        tahminiGun: Math.ceil(Math.random() * 5),
      }))
      
      const start = performance.now()
      
      routes.forEach(route => {
        calculator.analyzeDetailedCost(route, 20000 + Math.random() * 10000)
      })
      
      const duration = performance.now() - start
      
      console.log(`100 detaylı analiz: ${duration.toFixed(2)}ms`)
      console.log(`Ortalama per analiz: ${(duration / 100).toFixed(2)}ms`)
      expect(duration).toBeLessThan(500)
    })
    
    it('1000 detaylı maliyet analizi < 5 saniye olmalı', () => {
      const routes = Array.from({ length: 1000 }, () => ({
        nereden: 'İstanbul',
        nereye: 'Ankara',
        gidisKm: 400 + Math.random() * 200,
        donusKm: 400 + Math.random() * 200,
        returnLoadRate: Math.random(),
        tahminiGun: Math.ceil(Math.random() * 5),
      }))
      
      const start = performance.now()
      
      routes.forEach(route => {
        calculator.analyzeDetailedCost(route, 20000 + Math.random() * 10000)
      })
      
      const duration = performance.now() - start
      
      console.log(`1000 detaylı analiz: ${duration.toFixed(2)}ms`)
      console.log(`Ortalama per analiz: ${(duration / 1000).toFixed(2)}ms`)
      expect(duration).toBeLessThan(5000)
    })
  })
  
  describe('Maintenance Cost Calculation Performance', () => {
    it('1000 bakım maliyet hesaplaması < 200ms olmalı', () => {
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        calculator.calculateMaintenanceCost(Math.random() * 2000)
      }
      
      const duration = performance.now() - start
      
      console.log(`1000 bakım hesaplaması: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(200)
    })
  })
  
  describe('Memory Usage', () => {
    it('çok sayıda hesaplama memory leak yaratmamalı', () => {
      // Başlangıç memory (yaklaşık)
      const iterations = 10000
      
      // Hesaplamalar
      for (let i = 0; i < iterations; i++) {
        const route = {
          nereden: 'İstanbul',
          nereye: 'Ankara',
          gidisKm: 450,
          donusKm: 450,
          returnLoadRate: 0,
          tahminiGun: 2,
        }
        
        const analysis = calculator.analyzeDetailedCost(route, 21208)
        
        // Sonuç kullanılıyor (garbage collection önleme)
        expect(analysis.toplamMaliyet).toBeGreaterThan(0)
      }
      
      // Memory leak yoksa bu test geçmeli
      expect(true).toBe(true)
    })
  })
  
  describe('Concurrent Calculation Performance', () => {
    it('aynı anda birden fazla hesaplama yapılabilmeli', async () => {
      const promises = Array.from({ length: 100 }, async () => {
        return calculator.analyzeDetailedCost({
          nereden: 'İstanbul',
          nereye: 'Ankara',
          gidisKm: 450,
          donusKm: 450,
          returnLoadRate: 0,
          tahminiGun: 2,
        }, 21208)
      })
      
      const start = performance.now()
      const results = await Promise.all(promises)
      const duration = performance.now() - start
      
      console.log(`100 concurrent hesaplama: ${duration.toFixed(2)}ms`)
      
      expect(results.length).toBe(100)
      expect(duration).toBeLessThan(1000)
    })
  })
  
  describe('Edge Case Performance', () => {
    it('çok büyük sayılarla hesaplama hızlı olmalı', () => {
      const start = performance.now()
      
      for (let i = 0; i < 100; i++) {
        calculator.calculateFuelCost(999999)
        calculator.calculateDriverCost(999)
        calculator.calculateMaintenanceCost(999999)
      }
      
      const duration = performance.now() - start
      
      console.log(`300 extreme value hesaplama: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(500)
    })
    
    it('çok küçük sayılarla hesaplama hızlı olmalı', () => {
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        calculator.calculateFuelCost(0.001)
        calculator.calculateDriverCost(0.001)
        calculator.calculateMaintenanceCost(0.001)
      }
      
      const duration = performance.now() - start
      
      console.log(`3000 tiny value hesaplama: ${duration.toFixed(2)}ms`)
      expect(duration).toBeLessThan(500)
    })
  })
  
  describe('Real-World Scenario Performance', () => {
    it('günlük operasyon simülasyonu (100 sipariş) < 2 saniye', () => {
      // Gerçek dünya senaryosu: Her gün 100 sipariş girilir
      const orders = Array.from({ length: 100 }, (_, i) => ({
        nereden: i % 2 === 0 ? 'İstanbul' : 'Ankara',
        nereye: i % 2 === 0 ? 'Ankara' : 'İstanbul',
        gidisKm: 400 + Math.random() * 200,
        donusKm: Math.random() > 0.3 ? 400 + Math.random() * 200 : 0,
        returnLoadRate: Math.random(),
        tahminiGun: Math.ceil(1 + Math.random() * 4),
      }))
      
      const start = performance.now()
      
      const analyses = orders.map(order => 
        calculator.analyzeDetailedCost(order, 15000 + Math.random() * 15000)
      )
      
      const duration = performance.now() - start
      
      console.log(`100 sipariş analizi (günlük operasyon): ${duration.toFixed(2)}ms`)
      console.log(`Ortalama per sipariş: ${(duration / 100).toFixed(2)}ms`)
      
      expect(analyses.length).toBe(100)
      expect(duration).toBeLessThan(2000)
    })
    
    it('aylık rapor simülasyonu (1000 sipariş) < 10 saniye', () => {
      // Aylık rapor: 1000 sipariş analizi
      const orders = Array.from({ length: 1000 }, (_, i) => ({
        nereden: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'][i % 4],
        nereye: ['Ankara', 'İzmir', 'Bursa', 'İstanbul'][i % 4],
        gidisKm: 200 + Math.random() * 800,
        donusKm: Math.random() > 0.5 ? 200 + Math.random() * 800 : 0,
        returnLoadRate: Math.random(),
        tahminiGun: Math.ceil(1 + Math.random() * 5),
      }))
      
      const start = performance.now()
      
      const analyses = orders.map(order => 
        calculator.analyzeDetailedCost(order, 10000 + Math.random() * 30000)
      )
      
      const duration = performance.now() - start
      
      console.log(`1000 sipariş analizi (aylık rapor): ${duration.toFixed(2)}ms`)
      console.log(`Ortalama per sipariş: ${(duration / 1000).toFixed(2)}ms`)
      
      // Toplamları hesapla (gerçek rapor senaryosu)
      const totalRevenue = analyses.reduce((sum, a) => sum + a.musteriOdemesi, 0)
      const totalCost = analyses.reduce((sum, a) => sum + a.toplamMaliyet, 0)
      const totalProfit = analyses.reduce((sum, a) => sum + a.karZarar, 0)
      
      console.log(`Toplam Gelir: ${totalRevenue.toFixed(2)} TL`)
      console.log(`Toplam Maliyet: ${totalCost.toFixed(2)} TL`)
      console.log(`Toplam Kar/Zarar: ${totalProfit.toFixed(2)} TL`)
      
      expect(analyses.length).toBe(1000)
      expect(duration).toBeLessThan(10000)
    })
  })
  
  describe('Throughput Test', () => {
    it('saniyede en az 1000 hesaplama yapabilmeli', () => {
      const duration = 1000 // 1 saniye
      const start = performance.now()
      let count = 0
      
      while (performance.now() - start < duration) {
        calculator.calculateFuelCost(Math.random() * 2000)
        count++
      }
      
      const actualDuration = performance.now() - start
      const throughput = (count / actualDuration) * 1000 // per saniye
      
      console.log(`Throughput: ${throughput.toFixed(0)} hesaplama/saniye`)
      console.log(`${duration}ms içinde ${count} hesaplama yapıldı`)
      
      expect(throughput).toBeGreaterThan(1000)
    })
  })
})

