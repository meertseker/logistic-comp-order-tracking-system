// Profesyonel Lojistik Maliyet Hesaplama Sistemi
// Araştırma Kaynakları: UTİKAD, Lojistik Kulübü, Sektör Standartları

export interface ProfessionalVehicleParams {
  // Yakıt (lt/100km bazlı - DOĞRU YÖNTEM)
  yakitTuketimi: number         // lt/100km (örn: 25 lt/100km)
  yakitFiyati: number           // TL/lt (örn: 40 TL/lt)
  
  // Sürücü (günlük bazlı - MİNİMUM GARANTİLİ)
  gunlukUcret: number           // TL/gün
  gunlukOrtKm: number           // km/gün (mesafe/gün hesabı için)
  yemekGunluk: number           // TL/gün (yemek/konaklama)
  
  // Bakım/Onarım (km bazlı gerçek maliyetler)
  yagDegisimMaliyet: number     // TL
  yagDegisimAralik: number      // km
  lastikMaliyet: number         // TL (4 lastik toplam)
  lastikOmur: number            // km
  buyukBakimMaliyet: number     // TL
  buyukBakimAralik: number      // km
  ufakOnarimAylik: number       // TL/ay (tahmini)
  
  // Sabit Yıllık Giderler (otomatik dahil edilir)
  sigorta: number               // TL/yıl
  mtv: number                   // TL/yıl
  muayene: number               // TL/yıl
  
  // Amortisman (opsiyonel - uzun vadeli maliyet analizi için)
  aracDegeri?: number           // TL (örn: 2,000,000)
  ekonomikOmur?: number         // km (örn: 800,000)
  yillikOrtalamaKm?: number     // km/yıl (örn: 120,000)
  
  // Fiyatlandırma
  karOrani: number              // 0.45 = %45
  kdv: number                   // 0.20 = %20
}

export interface RouteInfo {
  nereden: string
  nereye: string
  gidisKm: number
  donusKm: number
  returnLoadRate: number         // 0-1
  tahminiGun: number             // Kaç gün sürecek
}

export interface DetailedCostBreakdown {
  // Yakıt
  yakitLitre: number
  yakitMaliyet: number
  
  // Sürücü
  surucuGun: number
  surucuMaliyet: number
  yemekMaliyet: number
  
  // HGS/Geçiş
  hgsMaliyet: number
  
  // Bakım
  yagMaliyet: number
  lastikMaliyet: number
  bakimMaliyet: number
  onarimMaliyet: number
  toplamBakimMaliyet: number
  
  // Sabit Maliyetler (varsayılan olarak dahil)
  sigortaMaliyet?: number
  mtvMaliyet?: number
  muayeneMaliyet?: number
  amortismanMaliyet?: number
  toplamSabitmaliyet?: number
  
  // Toplam
  toplamDirektMaliyet: number      // Sadece değişken maliyetler
  toplamTumMaliyet?: number        // Sabit maliyetler dahil (varsa)
  maliyetPerKm: number
}

export interface ProfessionalProfitAnalysis {
  etkinKm: number
  costBreakdown: DetailedCostBreakdown
  toplamMaliyet: number
  fiyatKarli: number            // Kar eklendikten sonra
  fiyatKdvli: number            // KDV eklendikten sonra
  musteriOdemesi: number        // Müşteriden alınan
  karZarar: number              // Pozitif = kâr, Negatif = zarar
  karZararYuzde: number         // %
  onerilenMinFiyat: number      // Başabaş + KDV
}

// Şehir isimlerini normalize et (case-insensitive matching)
function normalizeCity(city: string): string {
  if (!city) return ''
  return city.trim()
    .split(' ')
    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR'))
    .join(' ')
}

// Güzergah bazlı HGS/Köprü maliyetleri
const ROUTE_TOLLS: Record<string, { hgs: number; kopru: number }> = {
  'İstanbul-Ankara': { hgs: 450, kopru: 150 },
  'Ankara-İstanbul': { hgs: 450, kopru: 150 },
  'İstanbul-İzmir': { hgs: 380, kopru: 150 },
  'İzmir-İstanbul': { hgs: 380, kopru: 150 },
  'İstanbul-Bursa': { hgs: 120, kopru: 150 },
  'Bursa-İstanbul': { hgs: 120, kopru: 150 },
  'Ankara-İzmir': { hgs: 350, kopru: 0 },
  'İzmir-Ankara': { hgs: 350, kopru: 0 },
  'İstanbul-Adana': { hgs: 580, kopru: 150 },
  'Adana-İstanbul': { hgs: 580, kopru: 150 },
  'Ankara-Adana': { hgs: 420, kopru: 0 },
  'Adana-Ankara': { hgs: 420, kopru: 0 },
}

export class ProfessionalCostCalculator {
  private params: ProfessionalVehicleParams

  constructor(params: ProfessionalVehicleParams) {
    this.params = params
  }

  // Yakıt maliyeti (lt/100km bazlı - PROFESYONEL YÖNTEM)
  calculateFuelCost(km: number): { litre: number; maliyet: number } {
    const litre = (km / 100) * this.params.yakitTuketimi
    const maliyet = litre * this.params.yakitFiyati
    return { litre, maliyet }
  }

  // Sürücü maliyeti (günlük minimum garantili)
  calculateDriverCost(km: number, days?: number): { gun: number; ucret: number; yemek: number } {
    // Gün sayısı verilmişse onu kullan, yoksa hesapla
    const gun = days || Math.max(1, Math.ceil(km / this.params.gunlukOrtKm))
    const ucret = gun * this.params.gunlukUcret
    const yemek = gun * this.params.yemekGunluk
    return { gun, ucret, yemek }
  }

  // HGS/Köprü maliyeti (sadece güzergah bazlı, km bazlı tahmini YOK)
  // Önce database'den kontrol et, yoksa hardcoded listeden, o da yoksa 0
  calculateTollCost(nereden: string, nereye: string, km: number, routeFromDB?: any): number {
    // Database'den gelen güzergah varsa onu kullan (ÖNCELİK 1)
    if (routeFromDB) {
      return (routeFromDB.hgs_maliyet || 0) + (routeFromDB.kopru_maliyet || 0)
    }
    
    // Şehir isimlerini normalize et
    const from = normalizeCity(nereden)
    const to = normalizeCity(nereye)
    const key = `${from}-${to}`
    const toll = ROUTE_TOLLS[key]
    
    // Hardcoded listeden kontrol et (ÖNCELİK 2)
    if (toll) {
      return toll.hgs + toll.kopru
    }
    
    // Bilinmeyen güzergah: 0 döndür (güzergahlar sayfasından eklenmeli)
    return 0
  }

  // Bakım/Onarım maliyeti (detaylı)
  calculateMaintenanceCost(km: number, estimatedDays: number): {
    yag: number
    lastik: number
    bakim: number
    onarim: number
    toplam: number
  } {
    const yag = (km / this.params.yagDegisimAralik) * this.params.yagDegisimMaliyet
    const lastik = (km / this.params.lastikOmur) * this.params.lastikMaliyet
    const bakim = (km / this.params.buyukBakimAralik) * this.params.buyukBakimMaliyet
    
    // Aylık onarım payı (gün bazında)
    const onarim = (this.params.ufakOnarimAylik / 30) * estimatedDays
    
    const toplam = yag + lastik + bakim + onarim
    
    return { yag, lastik, bakim, onarim, toplam }
  }

  // Etkin km hesapla (dönüşte yük bulma dahil)
  calculateEffectiveKm(gidisKm: number, donusKm: number, returnLoadRate: number): number {
    return gidisKm + donusKm * (1 - returnLoadRate)
  }

  // Sigorta, MTV ve Muayene maliyeti (varsayılan olarak dahil edilir)
  calculateInsuranceAndTax(km: number, estimatedDays: number, includeFixed: boolean = true): {
    sigorta: number
    mtv: number
    muayene: number
    toplam: number
  } {
    if (!includeFixed) {
      return { sigorta: 0, mtv: 0, muayene: 0, toplam: 0 }
    }
    
    // Gün bazlı hesaplama (daha doğru)
    const sigorta = (this.params.sigorta / 365) * estimatedDays
    const mtv = (this.params.mtv / 365) * estimatedDays
    const muayene = (this.params.muayene / 365) * estimatedDays
    
    return {
      sigorta,
      mtv,
      muayene,
      toplam: sigorta + mtv + muayene
    }
  }

  // Amortisman maliyeti (opsiyonel - varsayılan olarak dahil değil)
  calculateDepreciation(km: number, includeDepreciation: boolean = false): number {
    if (!includeDepreciation || !this.params.aracDegeri || !this.params.ekonomikOmur) {
      return 0
    }
    
    // KM bazlı doğrusal amortisman
    const amortizasyonPerKm = this.params.aracDegeri / this.params.ekonomikOmur
    return amortizasyonPerKm * km
  }

  // Detaylı maliyet analizi
  analyzeDetailedCost(
    route: RouteInfo, 
    musteriOdeme: number, 
    routeFromDB?: any,
    options?: {
      includeSigorta?: boolean,    // Varsayılan: false
      includeAmortisman?: boolean  // Varsayılan: false
    }
  ): ProfessionalProfitAnalysis {
    const etkinKm = this.calculateEffectiveKm(route.gidisKm, route.donusKm, route.returnLoadRate)
    
    // Yakıt
    const fuel = this.calculateFuelCost(etkinKm)
    
    // Sürücü
    const driver = this.calculateDriverCost(etkinKm, route.tahminiGun)
    
    // HGS (database'den gelen güzergah bilgisi varsa kullan)
    const hgs = this.calculateTollCost(route.nereden, route.nereye, etkinKm, routeFromDB)
    
    // Bakım
    const maintenance = this.calculateMaintenanceCost(etkinKm, route.tahminiGun || 1)
    
    // Toplam değişken maliyet
    const toplamMaliyet = fuel.maliyet + driver.ucret + driver.yemek + hgs + maintenance.toplam
    
    // Sabit maliyetler (sigorta/MTV/muayene varsayılan olarak dahil, amortisman opsiyonel)
    const insuranceAndTax = this.calculateInsuranceAndTax(
      etkinKm, 
      route.tahminiGun || 1, 
      true  // Her zaman dahil et
    )
    const depreciation = this.calculateDepreciation(
      etkinKm, 
      options?.includeAmortisman || false
    )
    
    const toplamSabitmaliyet = insuranceAndTax.toplam + depreciation
    const toplamTumMaliyet = toplamMaliyet + toplamSabitmaliyet
    
    // Detaylı breakdown
    const costBreakdown: DetailedCostBreakdown = {
      yakitLitre: fuel.litre,
      yakitMaliyet: fuel.maliyet,
      surucuGun: driver.gun,
      surucuMaliyet: driver.ucret,
      yemekMaliyet: driver.yemek,
      hgsMaliyet: hgs,
      yagMaliyet: maintenance.yag,
      lastikMaliyet: maintenance.lastik,
      bakimMaliyet: maintenance.bakim,
      onarimMaliyet: maintenance.onarim,
      toplamBakimMaliyet: maintenance.toplam,
      sigortaMaliyet: insuranceAndTax.sigorta,
      mtvMaliyet: insuranceAndTax.mtv,
      muayeneMaliyet: insuranceAndTax.muayene,
      amortismanMaliyet: depreciation,
      toplamSabitmaliyet: toplamSabitmaliyet,
      toplamDirektMaliyet: toplamMaliyet,
      toplamTumMaliyet: toplamTumMaliyet,
      maliyetPerKm: toplamMaliyet / etkinKm,
    }
    
    // Fiyatlandırma (sabit maliyetler dahil, amortisman hariç)
    const maliyetFiyatlandirmaIcin = toplamMaliyet + insuranceAndTax.toplam  // Sigorta/MTV/Muayene dahil
    const fiyatKarli = maliyetFiyatlandirmaIcin * (1 + this.params.karOrani)
    const fiyatKdvli = fiyatKarli * (1 + this.params.kdv)
    const onerilenMinFiyat = maliyetFiyatlandirmaIcin * (1 + this.params.kdv) // Başabaş + KDV
    
    // Kar/Zarar
    const karZarar = musteriOdeme - fiyatKdvli
    const karZararYuzde = (karZarar / fiyatKdvli) * 100
    
    return {
      etkinKm,
      costBreakdown,
      toplamMaliyet: maliyetFiyatlandirmaIcin,  // Sigorta/MTV/Muayene dahil maliyet
      fiyatKarli,
      fiyatKdvli,
      musteriOdemesi: musteriOdeme,
      karZarar,
      karZararYuzde,
      onerilenMinFiyat,
    }
  }
}

// Varsayılan profesyonel parametreler (Araştırma bazlı)
export const DEFAULT_PROFESSIONAL_PARAMS: ProfessionalVehicleParams = {
  // Yakıt (Ortalama kamyon tüketimi)
  yakitTuketimi: 25,            // lt/100km
  yakitFiyati: 40,              // TL/lt (2024-2025 motorin ortalaması)
  
  // Sürücü
  gunlukUcret: 1_600,           // TL/gün (sektör ortalaması)
  gunlukOrtKm: 500,             // km/gün
  yemekGunluk: 150,             // TL/gün
  
  // Bakım (Gerçek maliyetler)
  yagDegisimMaliyet: 500,       // TL
  yagDegisimAralik: 5_000,      // km
  lastikMaliyet: 8_000,         // TL (4 lastik)
  lastikOmur: 50_000,           // km
  buyukBakimMaliyet: 3_000,     // TL
  buyukBakimAralik: 15_000,     // km
  ufakOnarimAylik: 200,         // TL/ay
  
  // Sabit Giderler (varsayılan olarak dahil edilir)
  sigorta: 12_000,              // TL/yıl
  mtv: 5_000,                   // TL/yıl
  muayene: 1_500,               // TL/yıl
  
  // Amortisman (opsiyonel - varsayılan hesaplamalara dahil değil)
  aracDegeri: 2_000_000,        // TL (örnek araç değeri)
  ekonomikOmur: 800_000,        // km (ekonomik kullanım ömrü)
  yillikOrtalamaKm: 120_000,    // km/yıl (ortalama yıllık kullanım)
  
  // Fiyatlandırma
  karOrani: 0.45,               // %45
  kdv: 0.20,                    // %20
}

