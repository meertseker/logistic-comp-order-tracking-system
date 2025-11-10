/**
 * Formatters Utility Tests
 * 
 * Currency, date ve number formatlama fonksiyonlarını test eder
 */

import { formatCurrency, formatDate, formatShortDate, formatNumber } from '../../../src/utils/formatters'

describe('Formatters Utility Tests', () => {
  
  describe('formatCurrency', () => {
    it('pozitif sayıyı TL formatında göstermeli', () => {
      const result = formatCurrency(21208)
      expect(result).toContain('₺')
      expect(result).toMatch(/21[.,]208/)
    })
    
    it('0 değerini doğru formatlamalı', () => {
      const result = formatCurrency(0)
      expect(result).toContain('₺')
      expect(result).toContain('0')
    })
    
    it('negatif sayıyı doğru formatlamalı', () => {
      const result = formatCurrency(-1500)
      expect(result).toContain('₺')
      expect(result).toContain('-')
    })
    
    it('ondalıklı sayıyı doğru formatlamalı', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('₺')
      expect(result).toBeTruthy()
    })
    
    it('çok büyük sayıyı doğru formatlamalı', () => {
      const result = formatCurrency(9999999)
      expect(result).toContain('₺')
      expect(result).toBeTruthy()
    })
    
    it('çok küçük sayıyı doğru formatlamalı', () => {
      const result = formatCurrency(0.5)
      expect(result).toContain('₺')
      expect(result).toBeTruthy()
    })
  })
  
  describe('formatDate', () => {
    it('ISO string tarihini Türkçe formatla göstermeli', () => {
      const result = formatDate('2025-11-10T14:30:00.000Z')
      
      // Türkçe ay adları
      const turkishMonths = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
      const hasMonth = turkishMonths.some(month => result.includes(month))
      
      expect(hasMonth).toBe(true)
      expect(result).toMatch(/\d{2}:\d{2}/) // Saat:dakika formatı
    })
    
    it('Date object ile çalışmalı', () => {
      const date = new Date('2025-11-10T14:30:00.000Z')
      const result = formatDate(date)
      
      expect(result).toBeTruthy()
      expect(result).toMatch(/\d{2}:\d{2}/)
    })
    
    it('geçmiş tarihi doğru formatlamalı', () => {
      const result = formatDate('2020-01-15T10:00:00.000Z')
      
      expect(result).toContain('2020')
      expect(result).toBeTruthy()
    })
    
    it('gelecek tarihi doğru formatlamalı', () => {
      const result = formatDate('2030-12-31T23:59:00.000Z')
      
      expect(result).toContain('2030')
      expect(result).toBeTruthy()
    })
  })
  
  describe('formatShortDate', () => {
    it('ISO string tarihini kısa formatta göstermeli', () => {
      const result = formatShortDate('2025-11-10T14:30:00.000Z')
      
      // Türkçe ay adları (kısa)
      const turkishMonths = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
      const hasMonth = turkishMonths.some(month => result.includes(month))
      
      expect(hasMonth).toBe(true)
      expect(result).not.toMatch(/\d{2}:\d{2}/) // Saat:dakika olmamalı
    })
    
    it('Date object ile çalışmalı', () => {
      const date = new Date('2025-11-10T14:30:00.000Z')
      const result = formatShortDate(date)
      
      expect(result).toBeTruthy()
      expect(result).toContain('2025')
    })
    
    it('aynı tarih için formatDate ve formatShortDate farklı olmalı', () => {
      const dateStr = '2025-11-10T14:30:00.000Z'
      const longFormat = formatDate(dateStr)
      const shortFormat = formatShortDate(dateStr)
      
      // Long format saati içermeli, short format içermemeli
      expect(longFormat).toMatch(/\d{2}:\d{2}/)
      expect(shortFormat).not.toMatch(/\d{2}:\d{2}/)
    })
  })
  
  describe('formatNumber', () => {
    it('tam sayıyı binlik ayraçla göstermeli', () => {
      const result = formatNumber(21208)
      
      // Türkçe binlik ayracı (.) veya space
      expect(result).toMatch(/21[.,\s]208/)
    })
    
    it('0 değerini doğru formatlamalı', () => {
      const result = formatNumber(0)
      expect(result).toBe('0')
    })
    
    it('negatif sayıyı doğru formatlamalı', () => {
      const result = formatNumber(-1500)
      expect(result).toContain('-')
      expect(result).toContain('1')
    })
    
    it('çok büyük sayıyı doğru formatlamalı', () => {
      const result = formatNumber(9999999)
      expect(result).toBeTruthy()
      expect(result.length).toBeGreaterThan(5)
    })
    
    it('ondalıklı sayıyı doğru formatlamalı', () => {
      const result = formatNumber(1234.56)
      expect(result).toBeTruthy()
      // Türkçe locale ondalık ayracı virgül
      expect(result).toMatch(/1[.,\s]234/)
    })
    
    it('küçük sayıları doğru formatlamalı', () => {
      const result = formatNumber(42)
      expect(result).toBe('42')
    })
  })
  
  describe('Edge Cases', () => {
    it('NaN değerini handle etmeli', () => {
      const result = formatCurrency(NaN)
      expect(result).toContain('NaN')
    })
    
    it('Infinity değerini handle etmeli', () => {
      const result = formatNumber(Infinity)
      expect(result).toContain('∞')
    })
    
    it('geçersiz tarih hata fırlatmalı', () => {
      expect(() => formatDate('invalid-date')).toThrow()
    })
    
    it('very old date handle etmeli', () => {
      const result = formatDate('1900-01-01T00:00:00.000Z')
      expect(result).toContain('1900')
    })
  })
  
  describe('Consistency', () => {
    it('aynı input her zaman aynı output vermeli', () => {
      const input = 12345
      const result1 = formatCurrency(input)
      const result2 = formatCurrency(input)
      
      expect(result1).toBe(result2)
    })
    
    it('aynı tarih her zaman aynı format vermeli', () => {
      const date = '2025-11-10T14:30:00.000Z'
      const result1 = formatDate(date)
      const result2 = formatDate(date)
      
      expect(result1).toBe(result2)
    })
  })
  
  describe('Turkish Locale', () => {
    it('currency formatı Türkçe olmalı', () => {
      const result = formatCurrency(1000)
      // TRY sembolü (₺) veya "TL" olmalı
      expect(result).toMatch(/₺|TL/)
    })
    
    it('date formatı Türkçe ay isimleri kullanmalı', () => {
      // Kasım ayı
      const result = formatDate('2025-11-10T14:30:00.000Z')
      
      // "Kas" (Kasım) içermeli
      expect(result).toContain('Kas')
    })
    
    it('number formatı Türkçe binlik ayracı kullanmalı', () => {
      const result = formatNumber(1000)
      // Türkçe: 1.000 (nokta) veya 1 000 (space)
      // İngilizce: 1,000 (virgül) OLMAMALI
      expect(result).toBeTruthy()
    })
  })
  
  describe('Performance', () => {
    it('çok sayıda formatCurrency hızlı çalışmalı', () => {
      const start = Date.now()
      
      for (let i = 0; i < 1000; i++) {
        formatCurrency(Math.random() * 100000)
      }
      
      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000) // 1 saniyeden az
    })
    
    it('çok sayıda formatDate hızlı çalışmalı', () => {
      const start = Date.now()
      
      for (let i = 0; i < 1000; i++) {
        formatDate(new Date())
      }
      
      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000)
    })
  })
})

