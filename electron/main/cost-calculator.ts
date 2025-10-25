// Lojistik Maliyet Hesaplama Motoru

export interface VehicleParams {
  aracDegeri: number          // TL
  amortiSureYil: number       // yıl
  hedefToplamKm: number       // km (amorti süresi boyunca)
  bakimMaliyet: number        // TL
  bakimAralikKm: number       // km
  ekMasrafPer1000: number     // TL/1000km
  benzinPerKm: number         // TL/km
  gunlukUcret: number         // TL/gün
  gunlukOrtKm: number         // km/gün
  karOrani: number            // 0.45 = %45
  kdv: number                 // 0.20 = %20
}

export interface OrderCalculation {
  gidisKm: number
  donusKm: number
  returnLoadRate: number      // 0-1 arası (0.5 = %50)
  ilkFiyat: number           // Müşteriden alınan ücret
}

export interface CostBreakdown {
  amortPerKm: number
  bakimPerKm: number
  ekMasrafPerKm: number
  benzinPerKm: number
  driverPerKm: number
  toplamMaliyetPerKm: number
}

export interface ProfitAnalysis {
  etkinKm: number
  costBreakdown: CostBreakdown
  toplamMaliyet: number
  fiyatKarli: number          // Kar eklendikten sonra
  fiyatKdvli: number          // KDV eklendikten sonra
  musteriOdemesi: number      // İlk fiyat
  karZarar: number            // Pozitif = kâr, Negatif = zarar
  karZararYuzde: number       // %
  maliyetDetay: {
    amortisman: number
    bakim: number
    ekMasraf: number
    benzin: number
    surucu: number
  }
}

export class CostCalculator {
  private params: VehicleParams

  constructor(params: VehicleParams) {
    this.params = params
  }

  // Km başına maliyet bileşenlerini hesapla
  calculateCostBreakdown(includeAmortisman: boolean = false): CostBreakdown {
    // Amortisman genelde direkt maliyete dahil edilmez, opsiyonel
    const amortPerKm = includeAmortisman ? this.params.aracDegeri / this.params.hedefToplamKm : 0
    const bakimPerKm = this.params.bakimMaliyet / this.params.bakimAralikKm
    const ekMasrafPerKm = this.params.ekMasrafPer1000 / 1000
    const benzinPerKm = this.params.benzinPerKm
    const driverPerKm = this.params.gunlukUcret / this.params.gunlukOrtKm

    return {
      amortPerKm,
      bakimPerKm,
      ekMasrafPerKm,
      benzinPerKm,
      driverPerKm,
      toplamMaliyetPerKm: amortPerKm + bakimPerKm + ekMasrafPerKm + benzinPerKm + driverPerKm
    }
  }

  // Etkin km hesapla (dönüşte yük bulma oranı dahil)
  calculateEffectiveKm(gidisKm: number, donusKm: number, returnLoadRate: number): number {
    // returnLoadRate = 0 → tam maliyet (boş dönüş)
    // returnLoadRate = 1 → dönüş maliyeti yok (dolu dönüş)
    return gidisKm + donusKm * (1 - returnLoadRate)
  }

  // Tam kar/zarar analizi
  analyzeProfitability(order: OrderCalculation, includeAmortisman: boolean = false): ProfitAnalysis {
    const costBreakdown = this.calculateCostBreakdown(includeAmortisman)
    const etkinKm = this.calculateEffectiveKm(order.gidisKm, order.donusKm, order.returnLoadRate)
    
    // Toplam maliyet
    const toplamMaliyet = etkinKm * costBreakdown.toplamMaliyetPerKm
    
    // Maliyet detayları
    const maliyetDetay = {
      amortisman: etkinKm * costBreakdown.amortPerKm,
      bakim: etkinKm * costBreakdown.bakimPerKm,
      ekMasraf: etkinKm * costBreakdown.ekMasrafPerKm,
      benzin: etkinKm * costBreakdown.benzinPerKm,
      surucu: etkinKm * costBreakdown.driverPerKm,
    }
    
    // Karlı satış fiyatı (maliyet + kar)
    const fiyatKarli = toplamMaliyet * (1 + this.params.karOrani)
    
    // KDV dahil fiyat
    const fiyatKdvli = fiyatKarli * (1 + this.params.kdv)
    
    // Kar/Zarar
    const karZarar = order.ilkFiyat - fiyatKdvli
    const karZararYuzde = (karZarar / fiyatKdvli) * 100
    
    return {
      etkinKm,
      costBreakdown,
      toplamMaliyet,
      fiyatKarli,
      fiyatKdvli,
      musteriOdemesi: order.ilkFiyat,
      karZarar,
      karZararYuzde,
      maliyetDetay
    }
  }

  // Önerilen fiyat hesapla
  calculateRecommendedPrice(gidisKm: number, donusKm: number, returnLoadRate: number, includeAmortisman: boolean = false): number {
    const costBreakdown = this.calculateCostBreakdown(includeAmortisman)
    const etkinKm = this.calculateEffectiveKm(gidisKm, donusKm, returnLoadRate)
    const toplamMaliyet = etkinKm * costBreakdown.toplamMaliyetPerKm
    const fiyatKarli = toplamMaliyet * (1 + this.params.karOrani)
    const fiyatKdvli = fiyatKarli * (1 + this.params.kdv)
    return fiyatKdvli
  }

  // Başabaş noktası (minimum fiyat)
  calculateBreakEvenPrice(gidisKm: number, donusKm: number, returnLoadRate: number, includeAmortisman: boolean = false): number {
    const costBreakdown = this.calculateCostBreakdown(includeAmortisman)
    const etkinKm = this.calculateEffectiveKm(gidisKm, donusKm, returnLoadRate)
    const toplamMaliyet = etkinKm * costBreakdown.toplamMaliyetPerKm
    const fiyatKdvli = toplamMaliyet * (1 + this.params.kdv)
    return fiyatKdvli
  }
}

// Varsayılan parametreler (senin verdiğin değerler)
export const DEFAULT_VEHICLE_PARAMS: VehicleParams = {
  aracDegeri: 2_300_000,      // 2.3M TL
  amortiSureYil: 2,           // 2 yıl
  hedefToplamKm: 72_000,      // 2 yılda 72K km (ayda 3000km)
  bakimMaliyet: 15_000,       // 15K TL
  bakimAralikKm: 15_000,      // her 15K km'de
  ekMasrafPer1000: 1_000,     // 1000 TL / 1000km
  benzinPerKm: 7.5,           // 7.5 TL/km
  gunlukUcret: 1_600,         // 1600 TL/gün
  gunlukOrtKm: 500,           // günde 500 km ortalama
  karOrani: 0.45,             // %45 kar
  kdv: 0.20,                  // %20 KDV
}

