# 🔍 MUHASEBE İNCELEME REHBERİ
## Sekersoft - Hesaplama Sistemleri Detaylı Analiz Kılavuzu

**Hazırlanma Tarihi:** 26 Ekim 2025  
**Platform:** Sekersoft Yönetim Sistemi  
**Kapsam:** Tüm Maliyet Hesaplamaları ve Finansal Raporlar

---

## 📋 İÇİNDEKİLER

1. [Sistem Genel Bakış](#1-sistem-genel-bakış)
2. [Maliyet Hesaplama Motoru](#2-maliyet-hesaplama-motoru)
3. [Sipariş Fiyatlandırma Sistemi](#3-sipariş-fiyatlandırma-sistemi)
4. [Raporlama ve Kâr-Zarar Hesaplamaları](#4-raporlama-ve-kâr-zarar-hesaplamaları)
5. [Kritik Kontrol Noktaları](#5-kritik-kontrol-noktaları)
6. [Olası Sorunlar ve Çözümleri](#6-olası-sorunlar-ve-çözümleri)
7. [Test Senaryoları](#7-test-senaryoları)

---

## 1. SISTEM GENEL BAKIŞ

### 1.1 Platform Hakkında

**Sekersoft**, nakliye işletmeleri için geliştirilmiş, **offline çalışan** bir masa üstü uygulamasıdır (Electron tabanlı).

**Teknolojiler:**
- Electron + React (TypeScript)
- SQLite veritabanı (local)
- Profesyonel maliyet hesaplama algoritması

**Ana Modüller:**
1. **Araç Yönetimi** - Araçların maliyet parametrelerini saklar
2. **Güzergah Yönetimi** - HGS/köprü maliyetlerini ve mesafe bilgilerini tutar
3. **Sipariş Yönetimi** - Siparişlerin oluşturulması, takibi
4. **Maliyet Analizi** - Gerçek zamanlı maliyet hesaplama
5. **Raporlama** - Aylık gelir-gider raporları

---

## 2. MALİYET HESAPLAMA MOTORU

### 2.1 Hesaplama Motoru Konumu

**Dosya:** `electron/main/professional-cost-calculator.ts`

Bu dosya, **tüm maliyet hesaplamalarının merkezidir**. Sipariş oluşturulurken, düzenlenirken ve raporlar hazırlanırken bu motor kullanılır.

### 2.2 Maliyet Bileşenleri

Sistem, bir nakliye siparişinin maliyetini **5 ana bileşene** ayırarak hesaplar:

#### 2.2.1 YAKIT MALİYETİ

**Formül:**
```
Yakıt Litre = (Etkin KM / 100) × Yakıt Tüketimi (lt/100km)
Yakıt Maliyet = Yakıt Litre × Yakıt Fiyatı (TL/lt)
```

**Örnek Hesaplama:**
```
Etkin KM: 450 km
Yakıt Tüketimi: 25 lt/100km
Yakıt Fiyatı: 40 TL/lt

Yakıt Litre = (450 / 100) × 25 = 112.5 litre
Yakıt Maliyet = 112.5 × 40 = 4,500 TL
```

**Kod Referansı:**
```typescript
// electron/main/professional-cost-calculator.ts - satır 114-118
calculateFuelCost(km: number): { litre: number; maliyet: number } {
  const litre = (km / 100) * this.params.yakitTuketimi
  const maliyet = litre * this.params.yakitFiyati
  return { litre, maliyet }
}
```

**Kontrol Noktaları:**
- ✅ Yakıt tüketimi lt/100km cinsinden mi? (Doğru yöntem)
- ✅ Güncel motorin fiyatı kullanılıyor mu?
- ✅ Hesaplama etkin km üzerinden yapılıyor mu?

---

#### 2.2.2 SÜRÜCÜ MALİYETİ (Günlük Minimum Garantili)

**Formül:**
```
Gün Sayısı = max(1, ceil(Etkin KM / Günlük Ort. KM))
           VEYA
Gün Sayısı = Kullanıcının girdiği tahmini gün (öncelikli)

Sürücü Ücreti = Gün Sayısı × Günlük Ücret
Yemek Ücreti = Gün Sayısı × Günlük Yemek
```

**Örnek Hesaplama:**
```
Etkin KM: 450 km
Günlük Ort. KM: 500 km
Günlük Ücret: 1,600 TL
Günlük Yemek: 150 TL

Gün Sayısı = ceil(450 / 500) = 1 gün
Sürücü Ücreti = 1 × 1,600 = 1,600 TL
Yemek Ücreti = 1 × 150 = 150 TL
Toplam = 1,750 TL
```

**Kod Referansı:**
```typescript
// electron/main/professional-cost-calculator.ts - satır 121-127
calculateDriverCost(km: number, days?: number): { gun: number; ucret: number; yemek: number } {
  const gun = days || Math.max(1, Math.ceil(km / this.params.gunlukOrtKm))
  const ucret = gun * this.params.gunlukUcret
  const yemek = gun * this.params.yemekGunluk
  return { gun, ucret, yemek }
}
```

**Kontrol Noktaları:**
- ✅ Minimum 1 gün olarak mı hesaplanıyor?
- ✅ Kullanıcı girerse tahmini gün öncelikli mi?
- ✅ Yemek/harcırah dahil mi?

---

#### 2.2.3 HGS/KÖPRÜ MALİYETİ (3 Öncelik Seviyeli)

**Öncelik Sırası:**

**1. ÖNCE** → Veritabanından kayıtlı güzergah kontrol edilir
**2. SONRA** → Hardcoded güzergah listesine bakılır
**3. EN SON** → km × HGS per km tahmini kullanılır

**Formül:**
```
HGS Maliyet = Veritabanı HGS + Veritabanı Köprü
           VEYA
HGS Maliyet = Hardcoded HGS + Hardcoded Köprü
           VEYA
HGS Maliyet = Etkin KM × HGS per KM
```

**Örnek Hardcoded Güzergahlar:**
```
İstanbul-Ankara: HGS 450 TL + Köprü 150 TL = 600 TL
İstanbul-İzmir:  HGS 380 TL + Köprü 150 TL = 530 TL
```

**Kod Referansı:**
```typescript
// electron/main/professional-cost-calculator.ts - satır 131-150
calculateTollCost(nereden: string, nereye: string, km: number, routeFromDB?: any): number {
  // 1. Database'den kontrol
  if (routeFromDB) {
    return (routeFromDB.hgs_maliyet || 0) + (routeFromDB.kopru_maliyet || 0)
  }
  
  // 2. Hardcoded liste
  const key = `${from}-${to}`
  const toll = ROUTE_TOLLS[key]
  if (toll) {
    return toll.hgs + toll.kopru
  }
  
  // 3. Km bazlı tahmini
  return km * this.params.hgsPerKm
}
```

**Kontrol Noktaları:**
- ✅ Güzergah Yönetimi sayfasından eklenen rotalar öncelikli mi?
- ✅ Bilinmeyen güzergahlar için makul tahmini var mı? (örn: 0.5 TL/km)
- ✅ Case-insensitive çalışıyor mu? (İSTANBUL = istanbul)

---

#### 2.2.4 BAKIM/ONARIM MALİYETİ (4 Alt Bileşen)

**Bileşenler:**

**a) Yağ Değişim Maliyeti**
```
Yağ Maliyet = (Etkin KM / Yağ Değişim Aralığı) × Yağ Değişim Maliyeti
```

**Örnek:**
```
Etkin KM: 450 km
Yağ Aralığı: 5,000 km
Yağ Maliyeti: 500 TL

Yağ = (450 / 5,000) × 500 = 45 TL
```

**b) Lastik Maliyeti**
```
Lastik Maliyet = (Etkin KM / Lastik Ömrü) × Lastik Toplam Maliyet
```

**Örnek:**
```
Etkin KM: 450 km
Lastik Ömrü: 50,000 km
Lastik Maliyeti: 8,000 TL (4 lastik toplam)

Lastik = (450 / 50,000) × 8,000 = 72 TL
```

**c) Büyük Bakım Maliyeti**
```
Bakım Maliyet = (Etkin KM / Büyük Bakım Aralığı) × Büyük Bakım Maliyeti
```

**Örnek:**
```
Etkin KM: 450 km
Büyük Bakım Aralığı: 15,000 km
Büyük Bakım Maliyeti: 3,000 TL

Bakım = (450 / 15,000) × 3,000 = 90 TL
```

**d) Ufak Onarım Tahmini**
```
Onarım Maliyet = (Aylık Ufak Onarım / 30) × Tahmini Gün
```

**Örnek:**
```
Aylık Ufak Onarım: 200 TL
Tahmini Gün: 1 gün

Onarım = (200 / 30) × 1 = 6.67 TL
```

**Toplam Bakım:**
```
Toplam Bakım = Yağ + Lastik + Bakım + Onarım
             = 45 + 72 + 90 + 6.67 = 213.67 TL
```

**Kod Referansı:**
```typescript
// electron/main/professional-cost-calculator.ts - satır 153-170
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
  const onarim = (this.params.ufakOnarimAylik / 30) * estimatedDays
  
  const toplam = yag + lastik + bakim + onarim
  return { yag, lastik, bakim, onarim, toplam }
}
```

**Kontrol Noktaları:**
- ✅ Tüm 4 bileşen hesaba katılıyor mu?
- ✅ Oransal hesaplama doğru mu? (km bazlı + gün bazlı)
- ✅ Parametreler gerçekçi mi?

---

#### 2.2.5 SİGORTA VE MTV MALİYETİ (Şu Anda Dahil Değil)

**⚠️ MEVCUT DURUM:** Sigorta ve MTV parametreleri araç tanımında mevcut ancak maliyet hesaplamalarına **dahil edilmemiştir**.

**Parametreler:**
- `sigorta`: TL/yıl (örn: 12,000 TL/yıl)
- `mtv`: TL/yıl (örn: 5,000 TL/yıl)

**Neden Dahil Edilmemiş?**

1. **Sabit Maliyet Karakteri:** Sigorta ve MTV, aracın kullanılıp kullanılmamasından bağımsız **sabit yıllık giderlerdir**. Sipariş bazlı değişken maliyet hesaplamalarına dahil edilmesi yanıltıcı olabilir.

2. **Fırsat Maliyeti:** Bir araç sipariş almadığında da bu maliyetler devam eder. Bu nedenle, bunları genel işletme giderleri olarak değerlendirmek daha doğrudur.

3. **Farklı Muhasebe Yaklaşımı:** Birçok lojistik firma bu maliyetleri:
   - Genel işletme gideri olarak yıllık bütçeye dahil eder
   - Veya tüm araç filosu için ortalama hesaplar
   - Sipariş bazlı değil, araç bazlı takip eder

**İsteğe Bağlı Dahil Etme Formülü:**

Eğer sipariş bazlı maliyet hesaplamalarına dahil etmek isterseniz:

**Yöntem 1: Gün Bazlı**
```
Sigorta Payı = (Yıllık Sigorta / 365) × Tahmini Gün
MTV Payı = (Yıllık MTV / 365) × Tahmini Gün
```

**Örnek:**
```
Yıllık Sigorta: 12,000 TL
Yıllık MTV: 5,000 TL
Tahmini Gün: 1 gün

Sigorta Payı = (12,000 / 365) × 1 = 32.88 TL
MTV Payı = (5,000 / 365) × 1 = 13.70 TL
Toplam: 46.58 TL
```

**Yöntem 2: KM Bazlı**
```
Yıllık Ortalama KM = 120,000 km (varsayım)

Sigorta per KM = 12,000 / 120,000 = 0.10 TL/km
MTV per KM = 5,000 / 120,000 = 0.042 TL/km

Etkin KM: 450 km
Sigorta Payı = 450 × 0.10 = 45 TL
MTV Payı = 450 × 0.042 = 18.9 TL
Toplam: 63.9 TL
```

**Kod Eklentisi Örneği:**
```typescript
calculateInsuranceAndTax(km: number, estimatedDays: number, includeFixed: boolean = false): number {
  if (!includeFixed) return 0
  
  // Yöntem 1: Gün bazlı
  const dailyInsurance = (this.params.sigorta / 365) * estimatedDays
  const dailyTax = (this.params.mtv / 365) * estimatedDays
  
  return dailyInsurance + dailyTax
}
```

---

#### 2.2.6 AMORTİSMAN MALİYETİ (Şu Anda Dahil Değil)

**⚠️ MEVCUT DURUM:** Amortisman hesaplaması sistemde **bulunmamaktadır**.

**Neden Dahil Edilmemiş?**

1. **Muhasebe vs Yönetim Muhasebesi:** Yasal muhasebede amortisman önemlidir ancak **nakit çıkışı gerektirmez**. Gerçek maliyet analizinde zaten araç maliyeti önceden ödenmiştir.

2. **Değer Kaybı Karmaşıklığı:** Araç değer kaybı lineer değildir. Kullanım, bakım, piyasa koşulları gibi birçok faktöre bağlıdır.

3. **Pratik Kullanım:** Nakliyeciler genellikle "cebimden ne çıktı" yaklaşımını tercih eder. Amortisman teorik bir maliyet olarak görülür.

**İsteğe Bağlı Dahil Etme Formülü:**

Uzun vadeli maliyet analizi veya yatırım geri dönüşü hesaplamaları için:

**Yöntem 1: KM Bazlı Doğrusal Amortisman**
```
Amortisman per KM = Araç Değeri / Ekonomik Ömür (km)
Amortisman Maliyeti = Amortisman per KM × Etkin KM
```

**Örnek:**
```
Araç Değeri: 2,000,000 TL
Ekonomik Ömür: 800,000 km
Etkin KM: 450 km

Amortisman per KM = 2,000,000 / 800,000 = 2.50 TL/km
Amortisman = 2.50 × 450 = 1,125 TL
```

**Yöntem 2: Yıllık Bazlı + KM Oranı**
```
Yıllık Amortisman = Araç Değeri / Ekonomik Ömür (yıl)
Yıllık KM = 120,000 km (varsayım)
Amortisman per KM = Yıllık Amortisman / Yıllık KM
```

**Örnek:**
```
Araç Değeri: 2,000,000 TL
Ekonomik Ömür: 10 yıl
Yıllık KM: 120,000 km

Yıllık Amortisman = 2,000,000 / 10 = 200,000 TL/yıl
Amortisman per KM = 200,000 / 120,000 = 1.67 TL/km

Etkin KM: 450 km
Amortisman = 1.67 × 450 = 751.5 TL
```

**Kod Eklentisi Örneği:**
```typescript
calculateDepreciation(km: number, includeDepreciation: boolean = false): number {
  if (!includeDepreciation) return 0
  
  // Araç parametrelerinde olmalı:
  // this.params.aracDegeri (örn: 2,000,000 TL)
  // this.params.ekonomikOmur (örn: 800,000 km)
  
  const amortizasyonPerKm = this.params.aracDegeri / this.params.ekonomikOmur
  return amortizasyonPerKm * km
}
```

**Eksiksiz Maliyet Örneği (Sigorta/MTV/Amortisman Dahil):**
```
ETKİN KM: 450 km

TEMEL MALİYETLER:
- Yakıt:        4,500.00 TL
- Sürücü:       1,600.00 TL
- Yemek:          150.00 TL
- HGS:            600.00 TL
- Bakım:          213.67 TL
────────────────────────
Ara Toplam:     7,063.67 TL

SABIT MALİYETLER (Opsiyonel):
- Sigorta:         45.00 TL (gün bazlı)
- MTV:             18.90 TL (gün bazlı)
- Amortisman:   1,125.00 TL (km bazlı)
────────────────────────
Opsiyonel:      1,188.90 TL

GENEL TOPLAM:   8,252.57 TL
```

**💡 ÖNEMLİ NOT:** Çoğu nakliye firması sadece **temel maliyetleri** (7,063.67 TL) kullanır çünkü bunlar **gerçek nakit çıkışını** temsil eder. Sabit maliyetler genellikle **genel işletme giderlerinde** izlenir.

---

#### 2.2.7 ETKİN KM HESAPLAMA (Dönüş Optimizasyonu)

**Kritik Formül:**
```
Etkin KM = Gidiş KM + (Dönüş KM × (1 - Dönüş Yük Oranı))
```

**Mantık:** Eğer dönüşte yük bulunursa, dönüş km'sinin maliyeti azalır veya sıfırlanır.

**Örnek Hesaplamalar:**

**Senaryo 1: Dönüşte %0 Yük (Boş Dönüş)**
```
Gidiş: 450 km
Dönüş: 450 km
Dönüş Yük Oranı: 0% (0.0)

Etkin KM = 450 + (450 × (1 - 0.0))
         = 450 + 450
         = 900 km (tam maliyet)
```

**Senaryo 2: Dönüşte %50 Yük**
```
Gidiş: 450 km
Dönüş: 450 km
Dönüş Yük Oranı: 50% (0.5)

Etkin KM = 450 + (450 × (1 - 0.5))
         = 450 + 225
         = 675 km (yarı maliyet)
```

**Senaryo 3: Dönüşte %100 Yük (Tam Dolu)**
```
Gidiş: 450 km
Dönüş: 450 km
Dönüş Yük Oranı: 100% (1.0)

Etkin KM = 450 + (450 × (1 - 1.0))
         = 450 + 0
         = 450 km (sıfır ek maliyet)
```

**Kod Referansı:**
```typescript
// electron/main/professional-cost-calculator.ts - satır 173-175
calculateEffectiveKm(gidisKm: number, donusKm: number, returnLoadRate: number): number {
  return gidisKm + donusKm * (1 - returnLoadRate)
}
```

**Kontrol Noktaları:**
- ✅ Dönüş yük oranı 0-1 arasında mı?
- ✅ %100 yükte dönüş km sıfır maliyetli mi?
- ✅ Tek yön siparişlerde dönüş km = 0 mı?

---

### 2.3 TOPLAM MALİYET

**Final Formül (Mevcut Sistem):**
```
TOPLAM DEĞİŞKEN MALİYET = Yakıt Maliyet 
                        + Sürücü Ücreti 
                        + Yemek Ücreti 
                        + HGS Maliyet 
                        + Toplam Bakım Maliyet
```

**Opsiyonel: Tam Maliyet (Sigorta/MTV/Amortisman Dahil):**
```
TAM MALİYET = Değişken Maliyet
            + Sigorta Payı (opsiyonel)
            + MTV Payı (opsiyonel)
            + Amortisman (opsiyonel)
```

**Örnek Toplam (Sadece Değişken Maliyetler - Mevcut Sistem):**
```
Yakıt:        4,500.00 TL
Sürücü:       1,600.00 TL
Yemek:          150.00 TL
HGS:            600.00 TL
Bakım:          213.67 TL
─────────────────────────
TOPLAM:       7,063.67 TL ✅ (Sistemin kullandığı)
```

**Örnek Toplam (Tüm Maliyetler Dahil - İsteğe Bağlı):**
```
DEĞİŞKEN MALİYETLER:
Yakıt:        4,500.00 TL
Sürücü:       1,600.00 TL
Yemek:          150.00 TL
HGS:            600.00 TL
Bakım:          213.67 TL
─────────────────────────
Ara Toplam:   7,063.67 TL

SABİT MALİYETLER:
Sigorta:         45.00 TL
MTV:             18.90 TL
Amortisman:   1,125.00 TL
─────────────────────────
Sabit Toplam: 1,188.90 TL

GENEL TOPLAM: 8,252.57 TL
```

**Kod Referansı:**
```typescript
// electron/main/professional-cost-calculator.ts - satır 194
const toplamMaliyet = fuel.maliyet + driver.ucret + driver.yemek + hgs + maintenance.toplam

// Opsiyonel eklentiler (şu anda kullanılmıyor):
// + calculateInsuranceAndTax(etkinKm, estimatedDays)
// + calculateDepreciation(etkinKm)
```

**💡 HATIRLATMA:** Sistem varsayılan olarak **sadece değişken maliyetleri** (7,063.67 TL) kullanır. Sabit maliyetler eklemek için kod güncellemesi gerekir.

---

## 3. SİPARİŞ FİYATLANDIRMA SİSTEMİ

### 3.1 Fiyat Hesaplama Aşamaları

**Aşama 1: Maliyet (Saf)**
```
Toplam Maliyet = 7,064 TL (yukarıdaki hesaplama)
```

**Aşama 2: Kâr Ekleme**
```
Kârlı Fiyat = Toplam Maliyet × (1 + Kâr Oranı)

Örnek (Kâr Oranı %45):
Kârlı Fiyat = 7,064 × (1 + 0.45)
            = 7,064 × 1.45
            = 10,243 TL
```

**Aşama 3: KDV Ekleme**
```
KDV'li Fiyat = Kârlı Fiyat × (1 + KDV)

Örnek (KDV %20):
KDV'li Fiyat = 10,243 × (1 + 0.20)
             = 10,243 × 1.20
             = 12,291 TL
```

**Kod Referansı:**
```typescript
// electron/main/professional-cost-calculator.ts - satır 214-216
const fiyatKarli = toplamMaliyet * (1 + this.params.karOrani)
const fiyatKdvli = fiyatKarli * (1 + this.params.kdv)
const onerilenMinFiyat = toplamMaliyet * (1 + this.params.kdv) // Başabaş
```

### 3.2 Önerilen Fiyatlar

**a) Önerilen Fiyat (Kârlı + KDV)**
```
= 12,291 TL
```
Bu, sistem tarafından **otomatik önerilen** fiyattır.

**b) Başabaş Fiyat (Sadece +KDV, Kâr Yok)**
```
Başabaş = Toplam Maliyet × (1 + KDV)
        = 7,064 × 1.20
        = 8,477 TL
```
Bu fiyat, **hiç kâr etmeden** sadece maliyeti karşılar.

### 3.3 Kâr/Zarar Hesaplama - İKİ FARKLI YAKLAŞIM

**⚠️ ÖNEMLİ NOT:** Sistem iki farklı kâr metriği kullanır:

#### **A) HEDEF KÂR SAPAMASI (kar_zarar değişkeni)**

Sistemin `kar_zarar` değişkeni, **hedef kârlı fiyata göre sapma**yı ölçer. Bu, müşteri ödemesinin önerilen fiyattan ne kadar fazla veya eksik olduğunu gösterir.

**Formül:**
```
Hedef Kâr Sapması = Müşteri Ödemesi - Önerilen Fiyat (KDV'li)
Sapma % = (Sapma / Önerilen Fiyat) × 100
```

**Kod Referansı:**
```typescript
// electron/main/professional-cost-calculator.ts - satır 218-220
const karZarar = musteriOdeme - fiyatKdvli
const karZararYuzde = (karZarar / fiyatKdvli) * 100
```

#### **B) GERÇEK KÂR (Fiili Kârlılık)**

Gerçek kâr, müşteri ödemesinden maliyetin çıkarılmasıyla bulunur. Bu, sipariş için **fiilen kazanılan veya kaybedilen para**yı gösterir.

**Formül:**
```
Gerçek Kâr = Müşteri Ödemesi - Toplam Maliyet
Kâr Marjı % = (Gerçek Kâr / Müşteri Ödemesi) × 100
```

---

### 3.4 Detaylı Senaryo Örnekleri

**Temel Bilgiler:**
```
Toplam Maliyet:   7,064 TL
Önerilen Fiyat:  12,291 TL (Maliyet + %45 kâr + %20 KDV)
Başabaş Fiyat:    8,477 TL (Maliyet + %20 KDV, kâr yok)
```

---

**Senaryo A: Hedef Fiyattan Fazla Satış (Ekstra Kâr)**
```
Müşteri Ödemesi: 15,000 TL

HEDEF KÂR SAPAMASI:
Sapma = 15,000 - 12,291 = +2,709 TL
Sapma % = (2,709 / 12,291) × 100 = +%22.0
Yorum: Hedef fiyattan %22 FAZLA alındı ✅

GERÇEK KÂR:
Gerçek Kâr = 15,000 - 7,064 = +7,936 TL
Kâr Marjı = (7,936 / 15,000) × 100 = %52.9
Yorum: Net kâr %52.9 (Çok kârlı!) ✅✅
```

---

**Senaryo B: Hedef Fiyattan Az Ama Yine Kârlı**
```
Müşteri Ödemesi: 10,000 TL

HEDEF KÂR SAPAMASI:
Sapma = 10,000 - 12,291 = -2,291 TL
Sapma % = (-2,291 / 12,291) × 100 = -%18.6
Yorum: Hedef fiyattan %18.6 EKSIK ⚠️

GERÇEK KÂR:
Gerçek Kâr = 10,000 - 7,064 = +2,936 TL
Kâr Marjı = (2,936 / 10,000) × 100 = %29.4
Yorum: Yine de %29.4 kâr var! ✅
```

**💡 Öğretici Nokta:** Hedef fiyattan az satış yapılsa bile, gerçek kâr pozitif olabilir. Bu senaryo "hedefin altında ama kârlı" durumu gösterir.

---

**Senaryo C: Başabaş Noktası**
```
Müşteri Ödemesi: 8,477 TL

HEDEF KÂR SAPAMASI:
Sapma = 8,477 - 12,291 = -3,814 TL
Sapma % = (-3,814 / 12,291) × 100 = -%31.0
Yorum: Hedef fiyattan %31 EKSIK ⚠️⚠️

GERÇEK KÂR:
Gerçek Kâr = 8,477 - 7,064 = +1,413 TL (KDV tutarı)
Kâr Marjı = 0% (KDV hariç)
Yorum: Sadece KDV alındı, kâr YOK ⚖️
```

**💡 Öğretici Nokta:** Başabaş fiyatta bile hedef kâr sapması negatif görünür çünkü hedef %45 kâr içeriyordu.

---

**Senaryo D: Gerçek Zarar (Maliyetin Altında)**
```
Müşteri Ödemesi: 6,000 TL

HEDEF KÂR SAPAMASI:
Sapma = 6,000 - 12,291 = -6,291 TL
Sapma % = (-6,291 / 12,291) × 100 = -%51.2
Yorum: Hedef fiyattan %51.2 EKSIK ❌❌

GERÇEK KÂR:
Gerçek Kâr = 6,000 - 7,064 = -1,064 TL
Kâr Marjı = (-1,064 / 6,000) × 100 = -%17.7
Yorum: Gerçek ZARAR var! ❌❌❌
```

**💡 Öğretici Nokta:** Sadece bu senaryoda gerçek zarar var. Müşteri ödemesi maliyetin altında kaldı.

---

### 3.5 Kâr/Zarar Metrikleri Karşılaştırma Tablosu

| Müşteri Ödemesi | Hedef Sapması | Sapma % | Gerçek Kâr | Kâr Marjı % | Durum |
|----------------|---------------|---------|------------|-------------|-------|
| 15,000 TL | +2,709 TL | +%22.0 | +7,936 TL | %52.9 | 🟢 Çok Kârlı |
| 12,291 TL | 0 TL | 0% | +5,227 TL | %42.5 | 🟢 Hedef Kâr |
| 10,000 TL | -2,291 TL | -%18.6 | +2,936 TL | %29.4 | 🟡 Kârlı (Hedef Altı) |
| 8,477 TL | -3,814 TL | -%31.0 | +1,413 TL* | 0%* | 🟡 Başabaş |
| 7,064 TL | -5,227 TL | -%42.5 | 0 TL | 0% | ⚖️ Gerçek Başabaş |
| 6,000 TL | -6,291 TL | -%51.2 | -1,064 TL | -%17.7 | 🔴 Zarar |

*KDV dahil, KDV hariç 0 TL

---

### 3.6 Kontrol Noktaları

**Hedef Kâr Sapması İçin:**
- ✅ Sapma hesabı önerilen fiyat üzerinden mi yapılıyor?
- ✅ Yüzde hesaplama doğru mu?
- ✅ Negatif değerler "hedefin altı" olarak işaretleniyor mu?

**Gerçek Kâr İçin:**
- ✅ Gerçek kâr = Müşteri Ödemesi - Toplam Maliyet
- ✅ Kâr marjı = (Gerçek Kâr / Müşteri Ödemesi) × 100
- ✅ Sadece müşteri ödemesi < toplam maliyet olduğunda gerçek zarar var mı?

**💡 HATIRLATMA:** 
- **kar_zarar** değişkeni → Hedef kâr sapmasını gösterir
- **Gerçek kâr** → Müşteri ödemesi - Toplam maliyet
- Hedef sapması negatif olsa bile gerçek kâr pozitif olabilir!

---

## 4. RAPORLAMA VE KÂR-ZARAR HESAPLAMALARI

### 4.1 Aylık Rapor Hesaplamaları

**Dosya:** `electron/main/index.ts` - `db:getMonthlyReport` handler (satır 325-397)

**Ana Metrikler:**

#### 4.1.1 Toplam Gelir
```sql
SELECT COALESCE(SUM(baslangic_fiyati), 0) as total
FROM orders
WHERE created_at >= ? AND created_at < ?
```

**Açıklama:** Belirtilen ay içinde oluşturulan siparişlerin **müşterilerden alınan toplam ödemeleri**.

**Kod Konumu:** `electron/main/index.ts` satır 334-338

---

#### 4.1.2 Tahmini Maliyet (Hesaplanan)
```sql
SELECT COALESCE(SUM(toplam_maliyet), 0) as total
FROM orders
WHERE created_at >= ? AND created_at < ?
```

**Açıklama:** Siparişler oluşturulurken **maliyet hesaplama motorunun hesapladığı** toplam maliyetler.

**Kod Konumu:** `electron/main/index.ts` satır 349-353

---

#### 4.1.3 Ek Giderler (Manuel)
```sql
SELECT COALESCE(SUM(e.amount), 0) as total
FROM expenses e
JOIN orders o ON e.order_id = o.id
WHERE o.created_at >= ? AND created_at < ?
```

**Açıklama:** Kullanıcının **manuel olarak eklediği** giderler (örn: ekstra onarım, ceza, vb.)

**Kod Konumu:** `electron/main/index.ts` satır 341-346

---

#### 4.1.4 Net Kâr/Zarar
```
Net Kâr/Zarar = Toplam Gelir - Tahmini Maliyet - Ek Giderler
```

**Örnek Hesaplama:**
```
Toplam Gelir:        150,000 TL
Tahmini Maliyet:     -95,000 TL
Ek Giderler:          -8,000 TL
──────────────────────────────
Net Kâr/Zarar:       +47,000 TL
```

**Kod Konumu:** `electron/main/index.ts` satır 388

**ÖNEMLİ NOT:** 
Bu hesaplama **sadece tahmini maliyetleri** kullanır. Gerçek fiili giderler için **manuel eklenen giderler** de dahil edilmiştir.

---

### 4.2 Araç Bazlı Rapor

```sql
SELECT plaka, COUNT(*) as count, 
       SUM(baslangic_fiyati) as total,
       SUM(toplam_maliyet) as totalCost,
       SUM(kar_zarar) as totalProfit
FROM orders
WHERE created_at >= ? AND created_at < ?
GROUP BY plaka
ORDER BY count DESC
```

**Kontrol Noktaları:**
- ✅ Her araç için toplam sipariş sayısı
- ✅ Her araç için toplam gelir
- ✅ Her araç için toplam maliyet
- ✅ Her araç için toplam kâr/zarar

**Kod Konumu:** `electron/main/index.ts` satır 356-365

---

### 4.3 Müşteri Bazlı Rapor

```sql
SELECT musteri, COUNT(*) as count, SUM(baslangic_fiyati) as total
FROM orders
WHERE created_at >= ? AND created_at < ?
GROUP BY musteri
ORDER BY count DESC
```

**Kontrol Noktaları:**
- ✅ Her müşteri için toplam sipariş sayısı
- ✅ Her müşteri için toplam gelir
- ✅ Ortalama sipariş değeri (total / count)

**Kod Konumu:** `electron/main/index.ts` satır 368-374

---

### 4.4 Siparişler Sayfası - Finansal Özet

**Dosya:** `src/pages/Orders.tsx` - `calculateStatistics` fonksiyonu (satır 123-135)

**Hesaplama:**
```typescript
const toplamGelir = orders.reduce((sum, o) => sum + (o.baslangic_fiyati || 0), 0)
const toplamMaliyet = orders.reduce((sum, o) => sum + (o.toplam_maliyet || 0), 0)
const toplamKar = toplamGelir - toplamMaliyet

const karMarji = (toplamKar / toplamGelir) * 100
```

**Kâr Marjı Formülü:**
```
Kâr Marjı % = (Toplam Kâr / Toplam Gelir) × 100
```

**Örnek:**
```
Toplam Gelir:   150,000 TL
Toplam Maliyet:  95,000 TL
Toplam Kâr:      55,000 TL

Kâr Marjı = (55,000 / 150,000) × 100 = %36.67
```

**Kontrol Noktaları:**
- ✅ Tüm filtrelenmiş siparişler dahil mi?
- ✅ NULL değerler 0 olarak mı işleniyor?
- ✅ Kâr marjı doğru hesaplanıyor mu?

---

## 5. KRİTİK KONTROL NOKTALARI

### 5.1 Araç Parametreleri Kontrolü

**Sayfa:** Araçlar (Vehicles)  
**Kontrol Edilmesi Gerekenler:**

✅ **Yakıt Tüketimi (lt/100km):**
- Gerçekçi mi? (Kamyon için 25-35 lt/100km normal)
- YANLIŞ birim kullanılmamış mı? (km/lt DEĞİL, lt/100km OLMALI)

✅ **Yakıt Fiyatı (TL/lt):**
- Güncel motorin fiyatı mı?
- Son güncelleme ne zaman yapılmış?

✅ **Sürücü Günlük Ücret:**
- Minimum ücret standartlarına uygun mu?
- Mesai, sigorta dahil mi?

✅ **Bakım Parametreleri:**
- Yağ değişim aralığı gerçekçi mi? (5,000-10,000 km normal)
- Lastik ömrü gerçekçi mi? (40,000-60,000 km normal)
- Büyük bakım aralığı gerçekçi mi? (15,000-20,000 km normal)

✅ **Kâr Oranı:**
- %45 varsayılan değer kullanılıyor mu?
- Firma politikasına uygun mu?

---

### 5.2 Güzergah Kontrolü

**Sayfa:** Güzergahlar (Routes)  
**Kontrol Edilmesi Gerekenler:**

✅ **HGS/Köprü Maliyetleri:**
- Gerçek güncel fiyatlar mı?
- Gidiş ve dönüş ayrı ayrı kaydedilmiş mi?

✅ **Mesafe Doğruluğu:**
- Google Maps ile uyumlu mu?
- Güzergah optimizasyonu yapılmış mı?

✅ **Şehir İsimleri:**
- Case-insensitive çalışıyor mu? (İstanbul = istanbul = ISTANBUL)
- Türkçe karakter desteği var mı?

---

### 5.3 Sipariş Oluşturma Kontrolü

**Sayfa:** Yeni Sipariş (Create Order)  
**Kontrol Edilmesi Gerekenler:**

✅ **Etkin KM Hesaplama:**
- Dönüş yük oranı doğru uygulanıyor mu?
- Tek yön siparişlerde dönüş km = 0 mı?

✅ **Tahmini Gün:**
- Otomatik hesaplama doğru mu? (Toplam KM / 500 km/gün)
- Kullanıcı manuel değiştirebiliyor mu?

✅ **Otomatik Fiyat:**
- Sistem önerilen fiyat otomatik dolduruyor mu?
- Manuel değiştirme sonrası kâr/zarar güncelleniy or mu?

✅ **Maliyet Detayları:**
- Tüm 5 bileşen (yakıt, sürücü, yemek, HGS, bakım) görünüyor mu?
- Detaylı breakdown doğru mu?

---

### 5.4 Raporlama Kontrolü

**Sayfa:** Raporlar (Reports)  
**Kontrol Edilmesi Gerekenler:**

✅ **Tarih Filtreleri:**
- Ay başı ve ay sonu doğru alınıyor mu?
- Tarih aralığı doğru çalışıyor mu?

✅ **Toplam Hesaplamalar:**
- Tüm siparişler dahil mi?
- NULL değerler 0 olarak mı işleniyor?

✅ **Net Kâr/Zarar:**
- Formül doğru mu? (Gelir - Tahmini Maliyet - Ek Giderler)
- Manuel giderler dahil mi?

✅ **Excel/PDF Export:**
- Tüm veriler doğru aktarılıyor mu?
- Formatlar okunabilir mi?

---

## 6. OLASI SORUNLAR VE ÇÖZÜMLERİ

### 6.1 Yaygın Hesaplama Hataları

#### Problem 1: Negatif Kâr/Zarar (Sürekli Zarar)

**Olası Nedenler:**
1. Yakıt fiyatı çok yüksek girilmiş
2. Kâr oranı çok yüksek (%45 yerine %145 girilmiş = 1.45 yerine 14.5)
3. HGS maliyetleri abartılı
4. Dönüş yük oranı yanlış hesaplanıyor

**Kontrol Adımları:**
```
1. Araçlar sayfasını açın
2. İlgili aracı düzenleyin
3. Kâr oranının 0.45 (ONDALIK) olduğunu doğrulayın
4. Yakıt fiyatının TL/lt cinsinden olduğunu doğrulayın
```

---

#### Problem 2: Raporlarda Tutarsızlık

**Olası Nedenler:**
1. Tarih filtreleri yanlış uygulanıyor
2. Manuel giderler eksik kaydedilmiş
3. Bazı siparişlerin maliyeti hesaplanmamış

**Kontrol Adımları:**
```
1. Raporlar sayfasını açın
2. Doğru ay ve yılı seçin
3. "Tahmini Gider" + "Ek Gider" toplamını kontrol edin
4. Sipariş detaylarına giderek maliyet breakdown'ını inceleyin
```

---

#### Problem 3: HGS Maliyeti Çok Yüksek veya Çok Düşük

**Olası Nedenler:**
1. Güzergah veritabanında kayıtlı değil
2. Hardcoded listede yok
3. km × HGS per km tahmini yanlış

**Çözüm:**
```
1. Güzergahlar sayfasını açın
2. İlgili rotayı (örn: İstanbul-Ankara) ekleyin
3. Gerçek HGS ve köprü maliyetlerini girin
4. Kaydettikten sonra sipariş yeniden hesaplansın
```

---

#### Problem 4: Dönüş Optimizasyonu Çalışmıyor

**Olası Nedenler:**
1. Dönüş yük oranı yanlış girilmiş (örn: 50 yerine 0.5 girilmeli)
2. Tek yön seçiliyken dönüş km kaydedilmiş

**Kontrol Adımları:**
```
1. Sipariş detayını açın
2. "Dönüş Yük Oranı" değerini kontrol edin (0-1 arası olmalı)
3. Etkin KM hesaplamasını manuel kontrol edin:
   Etkin KM = Gidiş KM + (Dönüş KM × (1 - Dönüş Yük Oranı))
```

---

### 6.2 Veritabanı İlişkili Sorunlar

#### Problem 5: Sipariş Kaydedilirken Hata

**Olası Nedenler:**
1. NULL değerler kabul edilmiyor
2. Foreign key hatası (araç veya güzergah silinmiş)

**Kontrol:**
```sql
-- SQLite veritabanını açın
-- orders tablosunu kontrol edin

SELECT * FROM orders WHERE toplam_maliyet IS NULL;
-- Bu kayıtlar için maliyet yeniden hesaplanmalı
```

---

#### Problem 6: Raporlar Boş Geliyor

**Olası Nedenler:**
1. Tarih formatı yanlış
2. created_at alanı NULL
3. Ay/yıl parametreleri yanlış

**Kontrol:**
```sql
SELECT created_at FROM orders ORDER BY created_at DESC LIMIT 10;
-- Tarih formatını kontrol edin: 'YYYY-MM-DD HH:MM:SS'
```

---

## 7. TEST SENARYOLARI (Genişletilmiş)

### 7.1 Temel Sipariş Testi (Tek Yön)

**Senaryo:** İstanbul - Ankara, Tek Yön, 450 km

**Test Amacı:** Temel maliyet hesaplama motorunun doğru çalıştığını doğrula

**Girdiler:**
- Nereden: İstanbul
- Nereye: Ankara
- Gidiş KM: 450 km
- Dönüş KM: 0 km (tek yön)
- Tahmini Gün: 1 gün
- Araç: Varsayılan parametreler

**Beklenen Hesaplama:**
```
Araç: Varsayılan parametreler
Güzergah: İstanbul-Ankara (HGS 450 TL, Köprü 150 TL)

YAKIT:
- Etkin KM: 450 km
- Tüketim: 25 lt/100km
- Fiyat: 40 TL/lt
- Hesap: (450/100) × 25 × 40 = 4,500 TL ✓

SÜRÜCÜ:
- Gün: ceil(450/500) = 1 gün
- Ücret: 1 × 1,600 = 1,600 TL ✓
- Yemek: 1 × 150 = 150 TL ✓

HGS:
- Database: 450 + 150 = 600 TL ✓

BAKIM:
- Yağ: (450/5000) × 500 = 45 TL
- Lastik: (450/50000) × 8000 = 72 TL
- Büyük Bakım: (450/15000) × 3000 = 90 TL
- Onarım: (200/30) × 1 = 6.67 TL
- Toplam: 213.67 TL ✓

TOPLAM MALİYET: 7,063.67 TL ✓

ÖNERİLEN FİYAT:
- Kârlı (45%): 7,063.67 × 1.45 = 10,242.32 TL
- KDV'li (20%): 10,242.32 × 1.20 = 12,290.78 TL ✓

BAŞABAŞ: 7,063.67 × 1.20 = 8,476.40 TL ✓
```

**Test Adımları:**
1. Yeni sipariş oluştur
2. İstanbul → Ankara seç
3. 450 km gir
4. Tek yön seç
5. Hesaplamaların yukarıdaki ile eşleştiğini doğrula

**Beklenen Sonuç:**
- ✅ Toplam maliyet: 7,063.67 TL
- ✅ Önerilen fiyat (KDV'li): 12,290.78 TL
- ✅ Başabaş fiyat: 8,476.40 TL

---

### 7.2 Dönüş Optimizasyonu Testi (%50 Yük)

**Senaryo:** İstanbul - Ankara, Gidiş-Dönüş, %50 Yük

**Beklenen Hesaplama:**
```
Gidiş: 450 km
Dönüş: 450 km
Dönüş Yük: %50 (0.5)

Etkin KM = 450 + (450 × (1 - 0.5))
         = 450 + 225
         = 675 km ✓

TOPLAM MALİYET: ~10,000 TL (etkin km'ye göre)
```

**Test Adımları:**
1. Yeni sipariş oluştur
2. Gidiş-Dönüş seç
3. 450 km gir (dönüş otomatik dolacak)
4. Dönüş yük oranını %50'ye ayarla
5. Etkin KM'nin 675 olduğunu doğrula

---

### 7.3 Aylık Rapor Testi

**Senaryo:** 3 Sipariş, 1 Manuel Gider

**Beklenen Hesaplama:**
```
Sipariş 1: Gelir 15,000 TL, Maliyet 7,000 TL
Sipariş 2: Gelir 20,000 TL, Maliyet 11,000 TL
Sipariş 3: Gelir 18,000 TL, Maliyet 9,500 TL

Toplam Gelir: 53,000 TL ✓
Tahmini Maliyet: 27,500 TL ✓

Manuel Gider: 2,000 TL (eklenen)

Net Kâr/Zarar = 53,000 - 27,500 - 2,000 = 23,500 TL ✓
```

**Test Adımları:**
1. 3 sipariş oluştur (aynı ay içinde)
2. Birine manuel gider ekle (2,000 TL)
3. Raporlar sayfasını aç
4. İlgili ay/yıl seç
5. Hesaplamaların yukarıdaki ile eşleştiğini doğrula

**Beklenen Sonuç:**
- ✅ Net kâr/zarar: 23,500 TL
- ✅ Gerçek kâr marjı: %48.11

---

### 7.4 Gerçek Kâr vs Hedef Kâr Sapması Testi

**Senaryo:** Farklı fiyatlama senaryolarında kâr metrikleri

**Test Amacı:** Gerçek kâr ve hedef kâr sapması ayrımını doğrula

**Test Case 1: Hedefin Üstünde Satış**
```
Maliyet: 7,063.67 TL
Önerilen Fiyat: 12,290.78 TL
Müşteri Ödemesi: 15,000 TL

Beklenen:
- Hedef Kâr Sapması: 15,000 - 12,290.78 = +2,709.22 TL ✅
- Gerçek Kâr: 15,000 - 7,063.67 = +7,936.33 TL ✅
- Gerçek Kâr Marjı: (7,936.33 / 15,000) × 100 = %52.9 ✅
- Durum: Hem hedefin üstünde hem çok kârlı 🟢
```

**Test Case 2: Hedefin Altında Ama Kârlı**
```
Maliyet: 7,063.67 TL
Önerilen Fiyat: 12,290.78 TL
Müşteri Ödemesi: 10,000 TL

Beklenen:
- Hedef Kâr Sapması: 10,000 - 12,290.78 = -2,290.78 TL ⚠️
- Gerçek Kâr: 10,000 - 7,063.67 = +2,936.33 TL ✅
- Gerçek Kâr Marjı: (2,936.33 / 10,000) × 100 = %29.4 ✅
- Durum: Hedefin altında ama yine de kârlı 🟡
```

**Test Case 3: Başabaş**
```
Maliyet: 7,063.67 TL
Başabaş Fiyat: 8,476.40 TL
Müşteri Ödemesi: 8,476.40 TL

Beklenen:
- Hedef Kâr Sapması: 8,476.40 - 12,290.78 = -3,814.38 TL ⚠️
- Gerçek Kâr: 8,476.40 - 7,063.67 = +1,412.73 TL (KDV tutarı)
- Gerçek Kâr Marjı: %0 (KDV hariç) ⚖️
- Durum: Başabaş
```

**Test Case 4: Gerçek Zarar**
```
Maliyet: 7,063.67 TL
Müşteri Ödemesi: 6,000 TL

Beklenen:
- Hedef Kâr Sapması: 6,000 - 12,290.78 = -6,290.78 TL ❌
- Gerçek Kâr: 6,000 - 7,063.67 = -1,063.67 TL ❌
- Gerçek Kâr Marjı: -%17.7 ❌
- Durum: Zararlı 🔴
```

**Test Adımları:**
1. Her test case için sipariş oluştur
2. Siparişler sayfasında istatistikleri kontrol et
3. Gerçek kâr ve hedef sapması değerlerini doğrula
4. Renkli göstergelerin doğru çıktığını kontrol et

---

### 7.5 Uzun Mesafe Testi (Çok Günlü Sefer)

**Senaryo:** İstanbul - Adana, 1,000 km, 2 gün

**Test Amacı:** Çok günlük seferlerde maliyet hesaplamalarının doğruluğu

**Beklenen Hesaplama:**
```
Etkin KM: 1,000 km
Tahmini Gün: 2 gün (otomatik hesaplanan: ceil(1000/500) = 2)

YAKIT:
- Litre: (1,000/100) × 25 = 250 lt
- Maliyet: 250 × 40 = 10,000 TL ✓

SÜRÜCÜ:
- Gün: 2
- Ücret: 2 × 1,600 = 3,200 TL ✓
- Yemek: 2 × 150 = 300 TL ✓

HGS: 580 + 150 = 730 TL (İstanbul-Adana) ✓

BAKIM:
- Yağ: (1,000/5,000) × 500 = 100 TL
- Lastik: (1,000/50,000) × 8,000 = 160 TL
- Büyük Bakım: (1,000/15,000) × 3,000 = 200 TL
- Onarım: (200/30) × 2 = 13.33 TL
- Toplam: 473.33 TL ✓

TOPLAM MALİYET: 14,703.33 TL ✓
```

**Beklenen Sonuç:**
- ✅ Gün hesabı otomatik ve doğru
- ✅ Bakım maliyetleri ölçeklendirilmiş
- ✅ Tüm bileşenler proporsiyon olarak artmış

---

### 7.6 Sigorta/MTV/Amortisman Dahil Etme Testi

**Senaryo:** Opsiyonel maliyetlerle tam maliyet hesaplama

**Test Amacı:** Yeni eklenen sigorta/MTV/amortisman fonksiyonlarını doğrula

**Not:** Bu fonksiyonlar varsayılan olarak **kapalıdır**. Kod güncellemesi gerektirir.

**Beklenen Hesaplama (Temel Sipariş + Opsiyonel):**
```
TEMEL MALİYETLER: 7,063.67 TL (Test 7.1'den)

OPSİYONEL SABİT MALİYETLER:
- Sigorta (Gün bazlı): (12,000/365) × 1 = 32.88 TL
- MTV (Gün bazlı): (5,000/365) × 1 = 13.70 TL
- Amortisman (KM bazlı): (2,000,000/800,000) × 450 = 1,125 TL
- Toplam Sabit: 1,171.58 TL

TAM MALİYET: 7,063.67 + 1,171.58 = 8,235.25 TL ✓
```

**Test Kodu:**
```typescript
// professional-cost-calculator.ts içinde:
const analysis = calculator.analyzeDetailedCost(
  route,
  musteriOdeme,
  routeFromDB,
  {
    includeSigorta: true,      // Aktif et
    includeAmortisman: true    // Aktif et
  }
)

// Beklenen:
console.log(analysis.costBreakdown.sigortaMaliyet)     // 32.88
console.log(analysis.costBreakdown.mtvMaliyet)         // 13.70
console.log(analysis.costBreakdown.amortismanMaliyet)  // 1,125.00
console.log(analysis.costBreakdown.toplamSabitmaliyet) // 1,171.58
console.log(analysis.costBreakdown.toplamTumMaliyet)   // 8,235.25
```

---

### 7.7 Raporlama Gerçek Kâr Marjı Testi

**Senaryo:** Reports sayfasında gerçek kâr marjı gösterimi

**Test Amacı:** Backend ve frontend'de gerçek kâr marjı hesaplamalarını doğrula

**Test Verisi:**
```
Sipariş 1: Gelir 15,000 TL, Maliyet 7,000 TL
Sipariş 2: Gelir 20,000 TL, Maliyet 11,000 TL
Sipariş 3: Gelir 18,000 TL, Maliyet 9,500 TL

Toplam Gelir: 53,000 TL
Toplam Maliyet: 27,500 TL
Gerçek Kâr: 25,500 TL
```

**Beklenen Backend Hesaplama:**
```typescript
// electron/main/index.ts - getMonthlyReport
gercekKar = 53,000 - 27,500 = 25,500 TL ✓
gercekKarMarji = (25,500 / 53,000) × 100 = 48.11% ✓
```

**Beklenen Frontend Gösterim:**
```
Reports.tsx - 5. Kart:
Gerçek Kâr Marjı: %48.1
Gelir / Kâr oranı
```

**Test Adımları:**
1. 3 sipariş oluştur (aynı ay)
2. Raporlar sayfasını aç
3. İlgili ay seç
4. 5. kartın "Gerçek Kâr Marjı" gösterdiğini doğrula
5. Değerin %48.1 olduğunu kontrol et

---

### 7.8 Edge Case Testleri

#### Test 7.8.1: Sıfır KM Siparişi

**Senaryo:** Hatalı giriş testi
```
Gidiş KM: 0
Beklenen: Validasyon hatası ✅
Mesaj: "Geçerli bir km giriniz"
```

#### Test 7.8.2: Negatif Fiyat

**Senaryo:** Hatalı giriş testi
```
Müşteri Ödemesi: -5000
Beklenen: Engellenmeli ✅
```

#### Test 7.8.3: %100 Dönüş Yükü

**Senaryo:** Tam dolu dönüş
```
Gidiş: 500 km
Dönüş: 500 km
Dönüş Yük: %100

Etkin KM = 500 + (500 × 0) = 500 km ✓
Beklenen: Dönüş km sıfır maliyetli ✅
```

#### Test 7.8.4: Bilinmeyen Güzergah

**Senaryo:** HGS hesaplama fallback
```
Nereden: Antalya
Nereye: Trabzon
KM: 1,200 km

Beklenen HGS: 1,200 × 0.50 = 600 TL (km bazlı tahmini) ✅
```

---

## 8. İNCELEME KONTROL LİSTESİ

### 8.1 Araç Parametreleri
- [ ] Yakıt tüketimi lt/100km cinsinden mi?
- [ ] Yakıt fiyatı güncel mi?
- [ ] Sürücü günlük ücreti gerçekçi mi?
- [ ] Bakım parametreleri makul aralıklarda mı?
- [ ] Kâr oranı ondalık formatta mı? (0.45, 14.5 DEĞİL)
- [ ] KDV oranı doğru mu? (0.20 = %20)

### 8.2 Güzergah Yönetimi
- [ ] Popüler rotalar kaydedilmiş mi?
- [ ] HGS/köprü maliyetleri güncel mi?
- [ ] Gidiş ve dönüş ayrı ayrı mı?
- [ ] Mesafeler doğru mu?

### 8.3 Sipariş Hesaplamaları
- [ ] 5 maliyet bileşeni (yakıt, sürücü, yemek, HGS, bakım) hesaplanıyor mu?
- [ ] Etkin KM hesaplaması doğru mu?
- [ ] Dönüş optimizasyonu çalışıyor mu?
- [ ] Önerilen fiyat doğru mu?
- [ ] Başabaş fiyat doğru mu?
- [ ] Kâr/zarar doğru hesaplanıyor mu?

### 8.4 Raporlama
- [ ] Tarih filtreleri doğru çalışıyor mu?
- [ ] Toplam gelir doğru mu?
- [ ] Tahmini maliyet doğru mu?
- [ ] Manuel giderler dahil mi?
- [ ] Net kâr/zarar formülü doğru mu?
- [ ] Araç bazlı breakdown doğru mu?
- [ ] Müşteri bazlı breakdown doğru mu?

### 8.5 Genel Sistem
- [ ] NULL değerler 0 olarak mı işleniyor?
- [ ] Negatif değerlere izin veriliyor mu?
- [ ] Ondalık hassasiyet yeterli mi?
- [ ] Excel/PDF export çalışıyor mu?
- [ ] Veritabanı yedekleme aktif mi?

---

## 9. SONUÇ VE ÖNERİLER

### 9.1 Sistemin Güçlü Yönleri

✅ **Profesyonel Maliyet Modeli:**
- lt/100km bazlı yakıt hesabı (sektör standardı)
- Günlük minimum garantili sürücü ücreti
- Detaylı bakım/onarım kalemleri
- Güzergah bazlı HGS maliyetleri

✅ **Gerçek Zamanlı Analiz:**
- Sipariş oluşturulurken anlık maliyet hesaplama
- Kâr/zarar görünürlüğü
- Dönüş optimizasyonu desteği

✅ **Kapsamlı Raporlama:**
- Aylık finansal özet
- Araç ve müşteri bazlı detaylar
- Excel/PDF export desteği

### 9.2 İyileştirme Önerileri

**1. Amortisman Entegrasyonu**
- Şu anda amortisman parametreleri girilse de hesaplamalara **dahil edilmiyor**
- Uzun vadeli maliyet analizi için amortisman eklenmeli

**2. Gerçek Maliyet Takibi**
- Tahmini maliyetler ile gerçek harcamalar karşılaştırılabilir
- Her sipariş için fiili gider ekleme sistemi daha entegre edilebilir

**3. KDV ve Vergi Yönetimi**
- KDV beyanı için ayrı rapor modülü eklenebilir
- Vergi muafiyeti senaryoları desteklenebilir

**4. Müşteri Bazlı Fiyatlandırma**
- Sık sipariş veren müşteriler için otomatik indirim
- Müşteri segmentasyonu ve fiyat farklılaştırma

**5. Tahmin vs Gerçek Analizi**
- Tahmin edilen yakıt tüketimi vs gerçek
- Tahmin edilen gün vs gerçek süre
- Sapma raporları

---

## 10. İLETİŞİM VE DESTEK

Bu rehberle ilgili sorularınız için:

**Teknik Destek:** Proje geliştiricisi  
**Muhasebe Danışmanlığı:** [Firma muhasebe departmanı]

---

**Son Güncelleme:** 26 Ekim 2025 (Genişletilmiş Versiyon)
**Versiyon:** 2.0  
**Hazırlayan:** AI Kod Asistanı (Claude Sonnet 4.5)

**Versiyon 2.0 Güncellemeleri:**
- ✅ Kâr/Zarar hesaplama mantığı netleştirildi ("Hedef Kâr Sapması" vs "Gerçek Kâr")
- ✅ Sigorta/MTV/Amortisman açıklamaları eklendi
- ✅ calculateInsuranceAndTax() ve calculateDepreciation() fonksiyonları eklendi
- ✅ Araç parametrelerine aracDegeri, ekonomikOmur ve yillikOrtalamaKm eklendi
- ✅ Raporlama sayfalarına "Gerçek Kâr Marjı" metriği eklendi
- ✅ SQL sorgular genişletildi (7 kategori, 20+ sorgu)
- ✅ Test senaryoları genişletildi (8 ana senaryo, edge case'ler)

---

## EKLER

### Ek A: Varsayılan Parametreler

```
YAKIT:
- Tüketim: 25 lt/100km
- Fiyat: 40 TL/lt

SÜRÜCÜ:
- Günlük Ücret: 1,600 TL
- Günlük Ort. KM: 500 km
- Günlük Yemek: 150 TL

BAKIM:
- Yağ: 500 TL / 5,000 km
- Lastik: 8,000 TL / 50,000 km
- Büyük Bakım: 3,000 TL / 15,000 km
- Ufak Onarım: 200 TL/ay

HGS:
- Bilinmeyen güzergah: 0.50 TL/km

FİYATLANDIRMA:
- Kâr Oranı: %45 (0.45)
- KDV: %20 (0.20)
```

### Ek B: SQL Sorgular (Genişletilmiş)

#### B.1 Temel Finansal Raporlar

**Tüm Siparişlerin Toplam Kâr/Zarar Analizi:**
```sql
SELECT 
  COUNT(*) as siparis_sayisi,
  SUM(baslangic_fiyati) as toplam_gelir,
  SUM(toplam_maliyet) as toplam_maliyet,
  SUM(onerilen_fiyat) as toplam_onerilen_fiyat,
  -- Gerçek Kâr: Müşteri ödemesi - Maliyet
  SUM(baslangic_fiyati - toplam_maliyet) as gercek_kar,
  -- Gerçek Kâr Marjı %
  ROUND((SUM(baslangic_fiyati - toplam_maliyet) / SUM(baslangic_fiyati)) * 100, 2) as gercek_kar_marji_yuzde,
  -- Hedef Kâr Sapması: Müşteri ödemesi - Önerilen fiyat
  SUM(kar_zarar) as hedef_kar_sapmasi,
  -- Ortalama sipariş değeri
  ROUND(AVG(baslangic_fiyati), 2) as ortalama_siparis_degeri
FROM orders;
```

**Aylık Bazda Kârlılık Trendi:**
```sql
SELECT 
  strftime('%Y-%m', created_at) as ay,
  COUNT(*) as siparis_sayisi,
  SUM(baslangic_fiyati) as toplam_gelir,
  SUM(toplam_maliyet) as toplam_maliyet,
  SUM(baslangic_fiyati - toplam_maliyet) as gercek_kar,
  ROUND((SUM(baslangic_fiyati - toplam_maliyet) / SUM(baslangic_fiyati)) * 100, 2) as kar_marji_yuzde
FROM orders
GROUP BY strftime('%Y-%m', created_at)
ORDER BY ay DESC
LIMIT 12;
```

#### B.2 Müşteri Analizi

**En Kârlı Müşteriler (Gerçek Kâr Bazında):**
```sql
SELECT 
  musteri,
  COUNT(*) as siparis_sayisi,
  SUM(baslangic_fiyati) as toplam_odeme,
  SUM(toplam_maliyet) as toplam_maliyet,
  SUM(baslangic_fiyati - toplam_maliyet) as gercek_kar,
  ROUND((SUM(baslangic_fiyati - toplam_maliyet) / SUM(baslangic_fiyati)) * 100, 2) as kar_marji_yuzde,
  ROUND(AVG(baslangic_fiyati), 2) as ortalama_siparis_degeri
FROM orders
GROUP BY musteri
ORDER BY gercek_kar DESC
LIMIT 10;
```

**Hedef Fiyattan En Fazla Sapan Müşteriler:**
```sql
SELECT 
  musteri,
  COUNT(*) as siparis_sayisi,
  SUM(kar_zarar) as toplam_hedef_sapma,
  ROUND(AVG(kar_zarar_yuzde), 2) as ortalama_sapma_yuzde,
  CASE 
    WHEN SUM(kar_zarar) > 0 THEN 'Hedefin Üstünde'
    WHEN SUM(kar_zarar) < 0 THEN 'Hedefin Altında'
    ELSE 'Hedefte'
  END as durum
FROM orders
GROUP BY musteri
ORDER BY ABS(SUM(kar_zarar)) DESC
LIMIT 10;
```

**Müşteri Sadakati (Tekrar Sipariş Analizi):**
```sql
SELECT 
  musteri,
  COUNT(*) as siparis_sayisi,
  MIN(created_at) as ilk_siparis,
  MAX(created_at) as son_siparis,
  JULIANDAY(MAX(created_at)) - JULIANDAY(MIN(created_at)) as gun_farki,
  SUM(baslangic_fiyati) as toplam_gelir
FROM orders
GROUP BY musteri
HAVING siparis_sayisi >= 3
ORDER BY siparis_sayisi DESC;
```

#### B.3 Araç Performans Analizi

**Araç Bazlı Detaylı Kârlılık:**
```sql
SELECT 
  plaka,
  COUNT(*) as siparis_sayisi,
  SUM(gidis_km + donus_km) as toplam_km,
  SUM(etkin_km) as toplam_etkin_km,
  SUM(baslangic_fiyati) as toplam_gelir,
  SUM(toplam_maliyet) as toplam_maliyet,
  SUM(baslangic_fiyati - toplam_maliyet) as gercek_kar,
  ROUND(SUM(toplam_maliyet) / SUM(etkin_km), 2) as km_basina_maliyet,
  ROUND(SUM(baslangic_fiyati) / SUM(etkin_km), 2) as km_basina_gelir,
  ROUND((SUM(baslangic_fiyati - toplam_maliyet) / SUM(baslangic_fiyati)) * 100, 2) as kar_marji_yuzde
FROM orders
GROUP BY plaka
ORDER BY gercek_kar DESC;
```

**Araç Kullanım Verimliliği:**
```sql
SELECT 
  plaka,
  COUNT(*) as siparis_sayisi,
  SUM(etkin_km) as toplam_etkin_km,
  SUM(gidis_km + donus_km) - SUM(etkin_km) as optimizasyon_kazanim_km,
  ROUND(AVG(return_load_rate) * 100, 2) as ortalama_donus_yuk_orani,
  ROUND(SUM(yakit_litre), 2) as toplam_yakit_litre,
  ROUND(SUM(yakit_maliyet), 2) as toplam_yakit_maliyet
FROM orders
GROUP BY plaka
ORDER BY siparis_sayisi DESC;
```

#### B.4 Güzergah Analizi

**En Kârlı Güzergahlar:**
```sql
SELECT 
  nereden || ' → ' || nereye as guzergah,
  COUNT(*) as siparis_sayisi,
  ROUND(AVG(gidis_km), 0) as ortalama_km,
  SUM(baslangic_fiyati) as toplam_gelir,
  SUM(toplam_maliyet) as toplam_maliyet,
  SUM(baslangic_fiyati - toplam_maliyet) as gercek_kar,
  ROUND(AVG(baslangic_fiyati), 2) as ortalama_fiyat
FROM orders
GROUP BY nereden, nereye
HAVING siparis_sayisi >= 3
ORDER BY gercek_kar DESC
LIMIT 20;
```

**Dönüş Optimizasyonu Başarı Analizi:**
```sql
SELECT 
  CASE 
    WHEN return_load_rate = 0 THEN 'Boş Dönüş (%0)'
    WHEN return_load_rate < 0.5 THEN 'Kısmi Yük (%1-49)'
    WHEN return_load_rate < 1.0 THEN 'Yarı Yük (%50-99)'
    ELSE 'Tam Yük (%100)'
  END as donus_kategori,
  COUNT(*) as siparis_sayisi,
  ROUND(AVG(gidis_km + donus_km), 0) as ortalama_toplam_km,
  ROUND(AVG(etkin_km), 0) as ortalama_etkin_km,
  ROUND(AVG((gidis_km + donus_km) - etkin_km), 0) as ortalama_kazanim_km,
  ROUND(SUM(baslangic_fiyati - toplam_maliyet), 2) as toplam_kar
FROM orders
WHERE donus_km > 0
GROUP BY donus_kategori
ORDER BY 
  CASE donus_kategori
    WHEN 'Tam Yük (%100)' THEN 1
    WHEN 'Yarı Yük (%50-99)' THEN 2
    WHEN 'Kısmi Yük (%1-49)' THEN 3
    ELSE 4
  END;
```

#### B.5 Maliyet Bileşenleri Analizi

**Maliyet Dağılımı (Toplam):**
```sql
SELECT 
  COUNT(*) as siparis_sayisi,
  ROUND(SUM(yakit_maliyet), 2) as toplam_yakit,
  ROUND(SUM(surucu_maliyet), 2) as toplam_surucu,
  ROUND(SUM(yemek_maliyet), 2) as toplam_yemek,
  ROUND(SUM(hgs_maliyet), 2) as toplam_hgs,
  ROUND(SUM(bakim_maliyet), 2) as toplam_bakim,
  ROUND(SUM(toplam_maliyet), 2) as genel_toplam,
  -- Yüzdelik dağılım
  ROUND((SUM(yakit_maliyet) / SUM(toplam_maliyet)) * 100, 1) as yakit_yuzde,
  ROUND((SUM(surucu_maliyet) / SUM(toplam_maliyet)) * 100, 1) as surucu_yuzde,
  ROUND((SUM(hgs_maliyet) / SUM(toplam_maliyet)) * 100, 1) as hgs_yuzde,
  ROUND((SUM(bakim_maliyet) / SUM(toplam_maliyet)) * 100, 1) as bakim_yuzde
FROM orders;
```

**Sipariş Süreleri vs Kârlılık:**
```sql
SELECT 
  tahmini_gun as gun_sayisi,
  COUNT(*) as siparis_sayisi,
  ROUND(AVG(etkin_km), 0) as ortalama_km,
  ROUND(AVG(baslangic_fiyati), 2) as ortalama_gelir,
  ROUND(AVG(toplam_maliyet), 2) as ortalama_maliyet,
  ROUND(AVG(baslangic_fiyati - toplam_maliyet), 2) as ortalama_kar,
  ROUND((SUM(baslangic_fiyati - toplam_maliyet) / SUM(baslangic_fiyati)) * 100, 2) as kar_marji_yuzde
FROM orders
GROUP BY tahmini_gun
ORDER BY tahmini_gun;
```

#### B.6 Durum Bazlı Analizler

**Sipariş Durumlarına Göre Finansal Özet:**
```sql
SELECT 
  status,
  COUNT(*) as siparis_sayisi,
  SUM(baslangic_fiyati) as toplam_gelir,
  SUM(toplam_maliyet) as toplam_maliyet,
  SUM(baslangic_fiyati - toplam_maliyet) as gercek_kar,
  ROUND(AVG(JULIANDAY(updated_at) - JULIANDAY(created_at)), 1) as ortalama_tamamlanma_suresi_gun
FROM orders
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'Bekliyor' THEN 1
    WHEN 'Yolda' THEN 2
    WHEN 'Teslim Edildi' THEN 3
    WHEN 'Faturalandı' THEN 4
    ELSE 5
  END;
```

**Gecikmeli Siparişler (30 günden eski "Yolda" siparişler):**
```sql
SELECT 
  id,
  plaka,
  musteri,
  nereden,
  nereye,
  created_at,
  JULIANDAY('now') - JULIANDAY(created_at) as gecikme_gun,
  baslangic_fiyati,
  status
FROM orders
WHERE status IN ('Bekliyor', 'Yolda')
  AND JULIANDAY('now') - JULIANDAY(created_at) > 30
ORDER BY created_at ASC;
```

#### B.7 İleri Düzey Analizler

**Kârlılık Segmentasyonu:**
```sql
SELECT 
  CASE 
    WHEN kar_marji_yuzde >= 50 THEN '🟢 Çok Kârlı (≥%50)'
    WHEN kar_marji_yuzde >= 30 THEN '🔵 Kârlı (%30-49)'
    WHEN kar_marji_yuzde >= 10 THEN '🟡 Az Kârlı (%10-29)'
    WHEN kar_marji_yuzde >= 0 THEN '🟠 Başabaş (%0-9)'
    ELSE '🔴 Zararlı (<0)'
  END as karlılik_segment,
  COUNT(*) as siparis_sayisi,
  ROUND(AVG(baslangic_fiyati), 2) as ortalama_fiyat,
  ROUND(SUM(baslangic_fiyati), 2) as toplam_gelir,
  ROUND(SUM(gercek_kar), 2) as toplam_kar
FROM (
  SELECT 
    baslangic_fiyati,
    toplam_maliyet,
    baslangic_fiyati - toplam_maliyet as gercek_kar,
    ((baslangic_fiyati - toplam_maliyet) / baslangic_fiyati) * 100 as kar_marji_yuzde
  FROM orders
)
GROUP BY karlılik_segment
ORDER BY 
  CASE karlılik_segment
    WHEN '🟢 Çok Kârlı (≥%50)' THEN 1
    WHEN '🔵 Kârlı (%30-49)' THEN 2
    WHEN '🟡 Az Kârlı (%10-29)' THEN 3
    WHEN '🟠 Başabaş (%0-9)' THEN 4
    ELSE 5
  END;
```

**Günlere Göre Sipariş Dağılımı (Hafta İçi vs Hafta Sonu):**
```sql
SELECT 
  CASE CAST(strftime('%w', created_at) AS INTEGER)
    WHEN 0 THEN 'Pazar'
    WHEN 1 THEN 'Pazartesi'
    WHEN 2 THEN 'Salı'
    WHEN 3 THEN 'Çarşamba'
    WHEN 4 THEN 'Perşembe'
    WHEN 5 THEN 'Cuma'
    WHEN 6 THEN 'Cumartesi'
  END as gun,
  CAST(strftime('%w', created_at) AS INTEGER) as gun_index,
  COUNT(*) as siparis_sayisi,
  ROUND(AVG(baslangic_fiyati), 2) as ortalama_fiyat,
  ROUND(SUM(baslangic_fiyati - toplam_maliyet), 2) as toplam_kar
FROM orders
GROUP BY gun, gun_index
ORDER BY gun_index;
```

**Performans Benchmark (En iyi %20 vs Ortalama):**
```sql
WITH top_performers AS (
  SELECT 
    AVG(kar_marji) as top_kar_marji,
    AVG(km_basina_gelir) as top_km_gelir
  FROM (
    SELECT 
      (baslangic_fiyati - toplam_maliyet) / baslangic_fiyati * 100 as kar_marji,
      baslangic_fiyati / NULLIF(etkin_km, 0) as km_basina_gelir
    FROM orders
    WHERE baslangic_fiyati > 0 AND etkin_km > 0
    ORDER BY kar_marji DESC
    LIMIT (SELECT COUNT(*) * 0.2 FROM orders)
  )
),
avg_performers AS (
  SELECT 
    AVG((baslangic_fiyati - toplam_maliyet) / baslangic_fiyati * 100) as avg_kar_marji,
    AVG(baslangic_fiyati / NULLIF(etkin_km, 0)) as avg_km_gelir
  FROM orders
  WHERE baslangic_fiyati > 0 AND etkin_km > 0
)
SELECT 
  ROUND(top.top_kar_marji, 2) as en_iyi_20_kar_marji,
  ROUND(avg.avg_kar_marji, 2) as ortalama_kar_marji,
  ROUND(top.top_kar_marji - avg.avg_kar_marji, 2) as fark,
  ROUND(top.top_km_gelir, 2) as en_iyi_20_km_gelir,
  ROUND(avg.avg_km_gelir, 2) as ortalama_km_gelir
FROM top_performers top, avg_performers avg;
```

---

**NOT:** Bu rehber, sistemin mevcut hali (26 Ekim 2025) için hazırlanmıştır. Sistem güncellemeleri sonrası bazı formüller değişebilir. Lütfen kod tabanını da referans alın.

