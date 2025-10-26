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
  
  // HGS/Köprü (güzergah bazlı veya km bazlı)
  hgsPerKm: number             // TL/km (bilinmeyen güzergahlar için)
  
  // Diğer değişken giderler
  sigorta: number               // TL/yıl (opsiyonel)
  mtv: number                   // TL/yıl (opsiyonel)
  
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
  
  // Toplam
  toplamDirektMaliyet: number
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

  // HGS/Köprü maliyeti (güzergah bazlı, case-insensitive)
  calculateTollCost(nereden: string, nereye: string, km: number): number {
    // Şehir isimlerini normalize et
    const from = normalizeCity(nereden)
    const to = normalizeCity(nereye)
    const key = `${from}-${to}`
    const toll = ROUTE_TOLLS[key]
    
    if (toll) {
      return toll.hgs + toll.kopru
    }
    
    // Bilinmeyen güzergah: km bazlı tahmini
    return km * this.params.hgsPerKm
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

  // Detaylı maliyet analizi
  analyzeDetailedCost(route: RouteInfo, musteriOdeme: number): ProfessionalProfitAnalysis {
    const etkinKm = this.calculateEffectiveKm(route.gidisKm, route.donusKm, route.returnLoadRate)
    
    // Yakıt
    const fuel = this.calculateFuelCost(etkinKm)
    
    // Sürücü
    const driver = this.calculateDriverCost(etkinKm, route.tahminiGun)
    
    // HGS
    const hgs = this.calculateTollCost(route.nereden, route.nereye, etkinKm)
    
    // Bakım
    const maintenance = this.calculateMaintenanceCost(etkinKm, route.tahminiGun || 1)
    
    // Toplam direkt maliyet
    const toplamMaliyet = fuel.maliyet + driver.ucret + driver.yemek + hgs + maintenance.toplam
    
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
      toplamDirektMaliyet: toplamMaliyet,
      maliyetPerKm: toplamMaliyet / etkinKm,
    }
    
    // Fiyatlandırma
    const fiyatKarli = toplamMaliyet * (1 + this.params.karOrani)
    const fiyatKdvli = fiyatKarli * (1 + this.params.kdv)
    const onerilenMinFiyat = toplamMaliyet * (1 + this.params.kdv) // Başabaş + KDV
    
    // Kar/Zarar
    const karZarar = musteriOdeme - fiyatKdvli
    const karZararYuzde = (karZarar / fiyatKdvli) * 100
    
    return {
      etkinKm,
      costBreakdown,
      toplamMaliyet,
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
  
  // HGS
  hgsPerKm: 0.50,               // TL/km (bilinmeyen güzergahlar)
  
  // Diğer
  sigorta: 12_000,              // TL/yıl (opsiyonel)
  mtv: 5_000,                   // TL/yıl (opsiyonel)
  
  // Fiyatlandırma
  karOrani: 0.45,               // %45
  kdv: 0.20,                    // %20
}

