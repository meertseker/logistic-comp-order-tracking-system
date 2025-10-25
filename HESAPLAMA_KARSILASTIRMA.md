# 📊 Maliyet Hesaplama Karşılaştırması - Araştırma Bazlı

## 🔬 Araştırma Sonuçları

✅ UTİKAD (Uluslararası Taşımacılık ve Lojistik Hizmet Üretenleri Derneği)  
✅ Lojistik Kulübü  
✅ Sektör Profesyonelleri  
✅ Muhasebe Standartları  

---

## ⚖️ ESKİ vs YENİ SİSTEM

### 📌 Ankara-İstanbul Örneği (450 km tek yön)

#### ❌ ESKİ SİSTEM (Basit Hesap)

```
Hesaplama Yöntemi:
──────────────────
Yakıt: 450 km × 7.5 TL/km = 3.375 TL
  ↳ Sorun: Sabit TL/km yaklaşımı yanlış

Sürücü: 450 km × 3.2 TL/km = 1.440 TL  
  ↳ Sorun: Kısmi gün hesabı (1 gün ödenm

eli)

Bakım: 450 km × 1 TL/km = 450 TL
  ↳ OK

HGS: 450 km × 1 TL/km = 450 TL
  ↳ Sorun: Gerçek 600 TL olmalı

Yemek: 0 TL
  ↳ Sorun: Unutulmuş!

Amortisman: 31.94 TL/km = 14.373 TL
  ↳ YANLIŞ: İş başına değil, yıllık hesaplanmalı

──────────────────
TOPLAM: 20.088 TL (Amortisman dahil)
        5.715 TL (Amortisman hariç)
```

#### ✅ YENİ SİSTEM (Profesyonel)

```
Hesaplama Yöntemi:
──────────────────
✅ Yakıt: (450 / 100) × 25 lt × 40 TL/lt = 4.500 TL
  ↳ Gerçek tüketim bazlı

✅ Sürücü: 1 gün × 1.600 TL = 1.600 TL
  ↳ Minimum günlük garanti

✅ Yemek: 1 gün × 150 TL = 150 TL
  ↳ Günlük yemek/konaklama

✅ HGS: 450 TL + Köprü 150 TL = 600 TL
  ↳ Güzergah bazlı gerçek maliyet

✅ Bakım Detaylı:
  • Yağ: (450 / 5.000) × 500 = 45 TL
  • Lastik: (450 / 50.000) × 8.000 = 72 TL
  • Bakım: (450 / 15.000) × 3.000 = 90 TL
  • Onarım: (200 / 30) × 1 gün = 7 TL
  Toplam: 214 TL

──────────────────
TOPLAM: 7.064 TL
```

---

## 📈 DETAYLI KARŞILAŞTIRMA

| Maliyet Kalemi | Eski | Yeni | Fark | Açıklama |
|----------------|------|------|------|----------|
| **Yakıt** | 3.375 TL | 4.500 TL | +1.125 TL | lt/100km bazlı daha doğru |
| **Sürücü** | 1.440 TL | 1.600 TL | +160 TL | Minimum 1 gün garantili |
| **Yemek** | 0 TL | 150 TL | +150 TL | Unutulmuştu, eklendi |
| **HGS/Köprü** | 450 TL | 600 TL | +150 TL | Gerçek maliyetler |
| **Bakım** | 450 TL | 214 TL | -236 TL | Detaylı hesap daha düşük |
| **Amortisman** | ~~14.373 TL~~ | 0 TL | -14.373 TL | Muhasebe'ye taşındı |
| **TOPLAM** | **5.715 TL** | **7.064 TL** | **+1.349 TL** | Daha gerçekçi |

---

## 💰 FİYATLANDIRMA KARŞILAŞTIRMA

### 450 km Tek Yön

| | Eski Sistem | Yeni Sistem | Fark |
|---|-------------|-------------|------|
| **Maliyet** | 5.715 TL | 7.064 TL | +23.6% |
| **+45% Kar** | 8.286 TL | 10.243 TL | +23.6% |
| **+20% KDV** | 9.944 TL | 12.291 TL | +23.6% |
| **ÖNERİLEN** | ~10.000 TL | ~12.500 TL | +25% |

### 900 km Gidiş-Dönüş (Boş Dönüş)

| | Eski Sistem | Yeni Sistem |
|---|-------------|-------------|
| **Maliyet** | 11.430 TL | 14.128 TL |
| **Önerilen** | 19.888 TL | 24.582 TL |

### 900 km Gidiş-Dönüş (%100 Dolu Dönüş)

| | Eski Sistem | Yeni Sistem |
|---|-------------|-------------|
| **Etkin Km** | 450 km | 450 km |
| **Maliyet** | 5.715 TL | 7.064 TL |
| **Önerilen** | 9.944 TL | 12.291 TL |

---

## ✅ ARAŞTIRMA BULGULARI vs SİSTEMİMİZ

### 1. Yakıt Hesaplama

**Profesyonel Standart:**
> "Yakıt maliyeti, aracın lt/100km tüketimi ile güncel motorin fiyatı çarpılarak hesaplanmalıdır."

**Sistemimiz:**
- ✅ YENİ: lt/100km × TL/lt
- ❌ ESKİ: Sabit TL/km

### 2. Sürücü Maliyeti

**Profesyonel Standart:**
> "Sürücü maliyeti günlük bazda hesaplanmalı. Kısa mesafelerde bile minimum 1 günlük ücret ödenmelidir."

**Sistemimiz:**
- ✅ YENİ: Minimum 1 gün garantili
- ⚠️ ESKİ: Km bazında pay (kısa mesafede eksik kalır)

### 3. Amortisman

**Profesyonel Standart:**
> "Amortisman muhasebe kavramıdır ve yıllık olarak hesaplanır. İş başına fiyatlandırmaya direkt dahil edilmez. Sadece uzun vadeli maliyet analizlerinde kullanılır."

**Sistemimiz:**
- ✅ YENİ: Amortisman hariç (varsayılan)
- ❌ ESKİ: Her işe ekliyordu (yanlış)

### 4. Sabit vs Değişken Ayrımı

**Profesyonel Standart:**
> "Sabit maliyetler (sigorta, MTV) ile değişken maliyetler (yakıt, HGS) kesinlikle ayrılmalıdır."

**Sistemimiz:**
- ✅ YENİ: Net ayrım var
- ⚠️ ESKİ: Karışıktı

---

## 🎯 SİSTEM GÜNCELLEMELERİ

### Değişiklik 1: Vehicles Tablosu

Yeni kolonlar eklenecek:
```sql
ALTER TABLE vehicles ADD COLUMN yakit_tuketimi REAL DEFAULT 25;      -- lt/100km
ALTER TABLE vehicles ADD COLUMN yakit_fiyati REAL DEFAULT 40;        -- TL/lt
ALTER TABLE vehicles ADD COLUMN yemek_gunluk REAL DEFAULT 150;       -- TL/gün
ALTER TABLE vehicles ADD COLUMN yag_maliyet REAL DEFAULT 500;        -- TL
ALTER TABLE vehicles ADD COLUMN yag_aralik REAL DEFAULT 5000;        -- km
ALTER TABLE vehicles ADD COLUMN lastik_maliyet REAL DEFAULT 8000;    -- TL
ALTER TABLE vehicles ADD COLUMN lastik_omur REAL DEFAULT 50000;      -- km
ALTER TABLE vehicles ADD COLUMN buyuk_bakim_maliyet REAL DEFAULT 3000;  -- TL
ALTER TABLE vehicles ADD COLUMN buyuk_bakim_aralik REAL DEFAULT 15000; -- km
ALTER TABLE vehicles ADD COLUMN ufak_onarim_aylik REAL DEFAULT 200;  -- TL/ay
ALTER TABLE vehicles ADD COLUMN hgs_per_km REAL DEFAULT 0.50;        -- TL/km
```

### Değişiklik 2: Orders Tablosu

Yeni kolonlar:
```sql
ALTER TABLE orders ADD COLUMN tahmini_gun INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN yakit_litre REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN hgs_maliyet REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN yemek_maliyet REAL DEFAULT 0;
```

---

## 💡 ÖNERİLEN UYGULAMA

### Seçenek A: İki Hesaplama Modu

```
☐ Basit Mod (Mevcut)
  ├─ Hızlı hesaplama
  ├─ Tahmini maliyetler
  └─ Km bazlı basit çarpımlar

☑ Profesyonel Mod (Yeni - Önerilen)
  ├─ Detaylı hesaplama
  ├─ Güzergah bazlı HGS
  ├─ Günlük bazlı sürücü
  └─ lt/100km bazlı yakıt
```

### Seçenek B: Tamamen Yeni Sisteme Geç

Eski sistemi kaldır, sadece profesyonel sistem kalsın.

---

## 🚀 SONUÇ VE ÖNERİ

### Araştırma Sonucunda:

1. ✅ **Amortismanı çıkarmak DOĞRU**
2. ✅ **Sabit/değişken ayrımı şart**
3. ⚠️ **Yakıt hesabı iyileştirilmeli** (lt/100km)
4. ⚠️ **Sürücü minimum günlük** olmalı
5. ⚠️ **HGS güzergah bazlı** olmalı
6. ⚠️ **Yemek maliyeti** eklenmeli

### Önerim:

**Profesyonel sisteme geç!** Çünkü:
- Daha doğru maliyetler
- Sektör standartlarına uygun
- Müşterilere açıklaması kolay
- Gerçek kar/zarar gösterir

---

## 📞 Nasıl Devam Edelim?

1. ✅ **Profesyonel sistemi uygula** (hazır)
2. ✅ **Eski sistemi güncelle** veya kaldır
3. ✅ **UI'yi yeni parametrelerle güncelle**
4. ✅ **Test et ve GitHub'a yükle**

**Devam edeyim mi?** 🚀

