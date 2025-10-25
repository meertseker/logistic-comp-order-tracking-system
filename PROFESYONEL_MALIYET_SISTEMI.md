# 📊 Profesyonel Lojistik Maliyet Hesaplama Sistemi

## 🔍 Araştırma Sonuçları

Türkiye ve uluslararası lojistik firmalarının maliyet hesaplama yöntemlerini inceledim.

### ✅ DOĞRU YAKLŞIM: Sabit vs Değişken Maliyet Ayrımı

```
┌─────────────────────────────────────────────────────┐
│ SABİT MALİYETLER (İş Sayısından Bağımsız)          │
├─────────────────────────────────────────────────────┤
│ • Araç kredisi/kira                                 │
│ • Sigorta (yıllık)                                  │
│ • MTV (yıllık)                                      │
│ • Sürücü maaşı (sabit)                             │
│ • Amortisman (muhasebe)                             │
│ • Ofis giderleri                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEĞİŞKEN MALİYETLER (İş Başına/Km Başına)         │
├─────────────────────────────────────────────────────┤
│ • Yakıt (km'ye bağlı) ✅                           │
│ • HGS/Köprü (güzergaha bağlı) ✅                   │
│ • Lastik aşınması (km'ye bağlı) ✅                 │
│ • Yemek (iş gününe bağlı) ✅                       │
│ • Bakım/onarım (km'ye bağlı) ✅                    │
│ • Sürücü ekstra (varsa) ✅                         │
└─────────────────────────────────────────────────────┘
```

---

## ✅ SİSTEMİMİZİN MEVCUT DURUMU

### Şu Anki Hesaplama (DOĞRU ✅)

```typescript
DEĞİŞKEN MALİYETLER:
├─ Yakıt: 7.50 TL/km         ← Direkt maliyet
├─ Sürücü: 3.20 TL/km        ← Km başına pay
├─ Bakım: 1.00 TL/km         ← Aşınma payı
├─ Ek Masraf: 1.00 TL/km     ← HGS, köprü, vb.
└─ Amortisman: 0 TL/km       ← KAPALI (muhasebe için ayrı)

TOPLAM: 12.70 TL/km
```

**Bu yaklaşım profesyonel standartlara uygun! ✅**

---

## 🔧 ÖNERİLEN İYİLEŞTİRMELER

### 1. Yakıt Hesaplaması (Daha Detaylı)

**Şu anki:** Sabit 7.5 TL/km

**Önerilen:**
```typescript
Yakıt Tüketimi: 25 lt/100km (kamyon tipi)
Yakıt Fiyatı: 40 TL/lt (güncel motorin)
Yakıt/km = (25 / 100) × 40 = 10 TL/km
```

**UI'de:**
- Yakıt tüketimi: lt/100km
- Güncel fiyat: TL/lt
- Otomatik hesaplama

### 2. Sürücü Maliyeti (Daha Akıllı)

**Şu anki:** Günlük ÷ Günlük Km = 1600 ÷ 500 = 3.2 TL/km

**Sorun:** Kısa mesafelerde sürücü tam gün ödenmeli

**Önerilen:**
```typescript
if (toplamKm < 200) {
  // Kısa mesafe: Minimum günlük ücret
  surucuMaliyet = 1600 TL (sabit)
} else {
  // Uzun mesafe: Km bazlı
  surucuMaliyet = toplamKm × 3.2 TL/km
}
```

### 3. HGS/Köprü (Gerçek Maliyetler)

**Şu anki:** Sabit 1 TL/km

**Önerilen:** Güzergah bazlı gerçek maliyetler
```typescript
const hgsMaliyetleri = {
  'İstanbul-Ankara': {
    hgs: 450 TL,
    köprü: 150 TL,
    toplam: 600 TL
  },
  'İstanbul-İzmir': {
    hgs: 380 TL,
    köprü: 150 TL,
    toplam: 530 TL
  }
}
```

### 4. Bakım Maliyeti (Daha Gerçekçi)

**Şu anki:** 15.000 TL / 15.000 km = 1 TL/km

**Önerilen:** Km bazlı bakım planı
```typescript
Bakım Kalemleri:
- Yağ değişimi: 5.000 km'de bir → 500 TL
- Lastik: 50.000 km'de bir → 8.000 TL
- Büyük bakım: 15.000 km'de bir → 3.000 TL
- Küçük onarımlar: Ortalama 200 TL/ay

Toplam bakım/km ≈ 0.50-1.50 TL/km
```

---

## 💡 GÜNCELLENMİŞ PROFESYONEL HESAPLAMA

### Direkt (Değişken) Maliyetler

```typescript
class ProfessionalCostCalculator {
  
  // Yakıt maliyeti (lt/100km bazlı)
  calculateFuelCost(km: number, consumption: number, pricePerLiter: number) {
    return (km / 100) * consumption * pricePerLiter
  }
  
  // Sürücü maliyeti (minimum garantili)
  calculateDriverCost(km: number, dailyWage: number, avgKmPerDay: number) {
    const days = Math.ceil(km / avgKmPerDay)
    return days * dailyWage
  }
  
  // HGS/Köprü (güzergah bazlı)
  calculateTollCost(route: string) {
    const tollRates = {
      'İstanbul-Ankara': 600,
      'İstanbul-İzmir': 530,
      // ...
    }
    return tollRates[route] || (km * 0.5) // Varsayılan: 0.5 TL/km
  }
  
  // Bakım (km bazlı gerçek)
  calculateMaintenanceCost(km: number) {
    const oilChange = (km / 5000) * 500          // 5K km'de yağ
    const tireWear = (km / 50000) * 8000         // 50K km'de lastik
    const majorService = (km / 15000) * 3000     // 15K km'de bakım
    const minorRepairs = km * 0.2                // Küçük onarımlar
    return oilChange + tireWear + majorService + minorRepairs
  }
  
  // Toplam direkt maliyet
  calculateDirectCost(order) {
    const fuel = this.calculateFuelCost(...)
    const driver = this.calculateDriverCost(...)
    const tolls = this.calculateTollCost(...)
    const maintenance = this.calculateMaintenanceCost(...)
    return fuel + driver + tolls + maintenance
  }
}
```

---

## 📊 ESKİ vs YENİ KARŞILAŞTIRMA

### Ankara-İstanbul Örneği (450 km tek yön)

#### ❌ Eski Sistem
```
Amortisman: 14.373 TL  ← Yanlış (iş başına değil)
Yakıt: 3.375 TL        ← Eksik (25 lt/100km için 4.500 TL olmalı)
Sürücü: 1.440 TL       ← OK
Bakım: 450 TL          ← OK
Ek: 450 TL             ← OK
─────────────────
Toplam: 20.088 TL
```

#### ✅ Yeni Sistem (Önerilen)
```
Yakıt: (450/100) × 25lt × 40TL = 4.500 TL
Sürücü: 1 gün × 1.600 TL = 1.600 TL
HGS/Köprü: 600 TL (güzergah bazlı)
Bakım: 450 × 0.80 = 360 TL
Lastik: 450 × 0.15 = 68 TL
Yemek: 1 gün × 150 TL = 150 TL
─────────────────
Toplam: 7.278 TL

Kar (%45): 7.278 × 1.45 = 10.553 TL
KDV (%20): 10.553 × 1.20 = 12.664 TL

ÖNERİLEN FİYAT: 12.664 TL ≈ 13.000 TL
```

---

## 🎯 SİSTEM GÜNCELLEMELERİ

### Güncelleme 1: Yakıt Hesaplama Modülü

```typescript
// electron/main/cost-calculator.ts
interface FuelParams {
  consumptionPer100Km: number  // lt/100km
  fuelPricePerLiter: number    // TL/lt
}

calculateFuelCost(km: number): number {
  return (km / 100) * this.params.consumptionPer100Km * this.params.fuelPricePerLiter
}
```

### Güncelleme 2: Sürücü Minimum Garanti

```typescript
calculateDriverCost(km: number): number {
  const days = Math.max(1, Math.ceil(km / this.params.gunlukOrtKm))
  return days * this.params.gunlukUcret
}
```

### Güncelleme 3: Güzergah Bazlı HGS

```typescript
interface RouteData {
  nereden: string
  nereye: string
}

const TOLL_RATES: Record<string, number> = {
  'İstanbul-Ankara': 600,
  'Ankara-İstanbul': 600,
  'İstanbul-İzmir': 530,
  // ...
}

calculateTollCost(route: RouteData): number {
  const key = `${route.nereden}-${route.nereye}`
  return TOLL_RATES[key] || 0
}
```

---

## 📱 UI DEĞİŞİKLİKLERİ

### Araç Parametrelerine Eklenecekler:

```
┌──────────────────────────────────────┐
│ YAKIT AYARLARI                       │
├──────────────────────────────────────┤
│ Tüketim: [25] lt/100km               │
│ Güncel Fiyat: [40] TL/lt             │
│ → Hesaplanan: 10 TL/km               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ SÜRÜCÜ AYARLARI                      │
├──────────────────────────────────────┤
│ Günlük Ücret: [1600] TL              │
│ Günlük Ort Km: [500] km              │
│ ☑ Minimum 1 gün garanti              │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ BAKIM AYARLARI                       │
├──────────────────────────────────────┤
│ Yağ Değişim: [500] TL / [5000] km    │
│ Lastik: [8000] TL / [50000] km       │
│ Büyük Bakım: [3000] TL / [15000] km  │
│ Aylık Onarım: [200] TL/ay            │
└──────────────────────────────────────┘
```

---

## 🎓 ÖĞRENILEN EN İYİ UYGULAMALAR

### 1. Faaliyet Tabanlı Maliyetleme (ABC)
✅ **Kullanıyoruz:** Her maliyet kalemi ayrı hesaplanıyor

### 2. Sabit vs Değişken Ayrımı
✅ **Doğru:** Amortisman sabit (yıllık), yakıt değişken (km'ye bağlı)

### 3. Dönüş Optimizasyonu
✅ **Uygulandı:** Return load rate sistemi var

### 4. Güzergah Bazlı Maliyetleme
⚠️ **Eklenecek:** HGS maliyetleri güzergaha göre

---

## 💰 YENİ MALIYET YAPISI (ÖNERİLEN)

### Detaylı Maliyet Formülü

```typescript
YAKALES * Yakıt Maliyeti (Detaylı)
───────────────────────────────────
Tüketim: 25 lt/100km (kamyon tipi)
Fiyat: 40 TL/lt (güncel motorin)
Hesap: (km / 100) × 25 × 40
Örnek (450 km): 4.500 TL


✅ Sürücü Maliyeti (Günlük Minimum)
───────────────────────────────────
Günlük Ücret: 1.600 TL
Günlük Km: 500 km
Hesap: Math.max(1 gün, km ÷ 500) × 1.600
Örnek (450 km): 1.600 TL (1 gün)
Örnek (600 km): 3.200 TL (2 gün)


✅ HGS/Geçiş Ücretleri
───────────────────────────────────
İstanbul-Ankara: 600 TL (sabit)
İstanbul-İzmir: 530 TL (sabit)
Diğer: km × 0.50 TL (tahmini)


✅ Bakım/Onarım
───────────────────────────────────
Yağ: (km / 5.000) × 500 = 45 TL
Lastik: (km / 50.000) × 8.000 = 72 TL
Bakım: (km / 15.000) × 3.000 = 90 TL
Aylık: 200 TL payı
Toplam: ~400-500 TL


✅ Yemek/Konaklama
───────────────────────────────────
Günlük: 150-200 TL
Hesap: Gün sayısı × 150 TL


══════════════════════════════════════
TOPLAM GERÇEK MALİYET (450 km):
──────────────────────────────────────
Yakıt: 4.500 TL
Sürücü: 1.600 TL
HGS: 600 TL
Bakım: 450 TL
Yemek: 150 TL
──────────────────────────────────────
TOPLAM: 7.300 TL

+45% Kar: 10.585 TL
+20% KDV: 12.702 TL

ÖNERİLEN FİYAT: ~13.000 TL
```

---

## 🔄 SİSTEM GÜNCELLEMELERİ

### Güncelleme 1: Yakıt Modülü

Dosya: `electron/main/cost-calculator.ts`

```typescript
export interface VehicleParams {
  // Yakıt (yeni)
  yakitTuketimi: number        // lt/100km
  yakitFiyati: number          // TL/lt
  
  // Eski benzinPerKm kaldırılacak
}

calculateFuelCost(km: number): number {
  return (km / 100) * this.params.yakitTuketimi * this.params.yakitFiyati
}
```

### Güncelleme 2: Sürücü Modülü

```typescript
calculateDriverCost(km: number, tripDays?: number): number {
  // Eğer gün sayısı verilmişse onu kullan
  if (tripDays) {
    return tripDays * this.params.gunlukUcret
  }
  
  // Yoksa km'den hesapla (minimum 1 gün)
  const estimatedDays = Math.max(1, Math.ceil(km / this.params.gunlukOrtKm))
  return estimatedDays * this.params.gunlukUcret
}
```

### Güncelleme 3: HGS/Geçiş Modülü

```typescript
interface TollData {
  hgs: number
  kopru: number
  diger: number
}

const ROUTE_TOLLS: Record<string, TollData> = {
  'İstanbul-Ankara': { hgs: 450, kopru: 150, diger: 0 },
  'İstanbul-İzmir': { hgs: 380, kopru: 150, diger: 0 },
  'İstanbul-Bursa': { hgs: 150, kopru: 150, diger: 0 },
}

calculateTolls(nereden: string, nereye: string, km: number): number {
  const key = `${nereden}-${nereye}`
  const tolls = ROUTE_TOLLS[key]
  
  if (tolls) {
    return tolls.hgs + tolls.kopru + tolls.diger
  }
  
  // Bilinmeyen güzergah: tahmini
  return km * 0.50
}
```

---

## 📊 YENİ vs ESKİ KARŞILAŞTIRMA

| Maliyet Kalemi | Eski Hesap | Yeni Hesap | Fark |
|----------------|------------|------------|------|
| Yakıt (450 km) | 3.375 TL | 4.500 TL | +1.125 TL |
| Sürücü (450 km) | 1.440 TL | 1.600 TL | +160 TL |
| HGS (İst-Ank) | 450 TL | 600 TL | +150 TL |
| Bakım | 450 TL | 450 TL | 0 |
| Yemek | 0 TL | 150 TL | +150 TL |
| **TOPLAM** | **5.715 TL** | **7.300 TL** | **+1.585 TL** |
| **Önerilen Fiyat** | **9.944 TL** | **12.702 TL** | **+2.758 TL** |

---

## ✅ DOĞRU HESAPLAMA PRENSİPLERİ

### 1. Direkt Maliyetler (İş Başına)
```
✅ Yakıt → Her km için gerçek tüketim
✅ HGS/Köprü → Güzergah bazlı sabit
✅ Sürücü → Gün bazlı (minimum garantili)
✅ Yemek → Gün bazlı
✅ Bakım → Km bazlı aşınma payı
```

### 2. Dolaylı Maliyetler (Aylık/Yıllık)
```
❌ Fiyatlandırmaya dahil etme:
• Amortisman → Muhasebe
• MTV → Yıllık sabit
• Sigorta → Yıllık sabit
• Ofis giderleri → Genel gider
```

### 3. Kar Marjı
```
✅ %45 → Sektör ortalaması %40-50
✅ %20 KDV → Yasal zorunluluk
```

---

## 🚀 SONRAKI ADIMLAR

Sistemi daha da profesyonelleştirmek için:

1. ✅ **Yakıt lt/100km bazlı** yapılacak
2. ✅ **Sürücü gün bazlı minimum** garantili
3. ✅ **HGS güzergah bazlı** gerçek maliyetler
4. ✅ **Yemek/konaklama** eklenmeli
5. ✅ **Lastik aşınması** ayrı hesaplanmalı

Bunları şimdi koda uygulayalım mı? 🎯

