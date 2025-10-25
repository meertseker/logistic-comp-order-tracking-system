# ✅ Amortisman Hesaplama Düzeltmesi

## ❌ ESKİ HESAPLAMA (YANLIŞ)

```
Amortisman/km: 31.94 TL
Bakım/km: 1.00 TL
Ek Masraf/km: 1.00 TL
Yakıt/km: 7.50 TL
Sürücü/km: 3.20 TL
─────────────────────────
TOPLAM: 44.64 TL/km ❌
```

**Ankara-İstanbul Örneği (450 km):**
```
Toplam Maliyet: 450 × 44.64 = 20.088 TL
Amortisman Payı: 450 × 31.94 = 14.373 TL (Çok fazla!)
```

### Sorun:
Amortisman her sipariş için direkt maliyete ekleniyordu. Bu yanlış çünkü:
- Amortisman bir muhasebe kavramıdır
- Gerçek nakit çıkışı yoktur
- Araç zaten alınmış, parası ödenmiş
- Sadece uzun vadeli değer kaybını gösterir

---

## ✅ YENİ HESAPLAMA (DOĞRU)

```
Amortisman/km: 0 TL (opsiyonel, varsayılan kapalı)
Bakım/km: 1.00 TL
Ek Masraf/km: 1.00 TL
Yakıt/km: 7.50 TL
Sürücü/km: 3.20 TL
─────────────────────────
TOPLAM: 12.70 TL/km ✅
```

**Ankara-İstanbul Örneği (450 km):**
```
Toplam Maliyet: 450 × 12.70 = 5.715 TL
Kar (%45): 5.715 × 1.45 = 8.286 TL
KDV (%20): 8.286 × 1.20 = 9.944 TL

Önerilen Fiyat: ~10.000 TL ✅
```

---

## 📊 KARŞILAŞTIRMA

| Hesaplama | Km Maliyeti | 450 km Maliyet | Önerilen Fiyat |
|-----------|-------------|----------------|----------------|
| **Eski (Amortisman Dahil)** | 44.64 TL | 20.088 TL | 34.954 TL |
| **Yeni (Amortisman Hariç)** | 12.70 TL | 5.715 TL | 9.944 TL |
| **Fark** | -31.94 TL | -14.373 TL | -25.010 TL |

---

## 🎯 AMORTİSMAN NE ZAMAN KULLANILIR?

### ✅ Kullan (Opsiyonel):
1. **Uzun Vadeli Planlama**: Yeni araç almak için birikim hesabı
2. **Muhasebe Raporları**: Vergi beyannamesi için
3. **Stratejik Kararlar**: Araç değiştirme analizi

### ❌ Kullanma:
1. **Günlük Sipariş Fiyatlandırma** ← Bizim durumumuz
2. **Nakit Akışı Hesaplamaları**: Gerçek para çıkışı yok
3. **Kısa Vadeli Karlılık**: İş başına kar/zarar

---

## 🔧 SİSTEM DEĞİŞİKLİKLERİ

### 1. Araç Ayarlarına Eklendi

**Vehicles** tablosuna yeni kolon:
```sql
include_amortisman INTEGER DEFAULT 0  -- 0 = Kapalı, 1 = Açık
```

### 2. Maliyet Hesaplama Güncellendi

```typescript
// Eski
calculateCostBreakdown() {
  const amortPerKm = aracDegeri / hedefToplamKm  // Her zaman dahil
}

// Yeni
calculateCostBreakdown(includeAmortisman: boolean = false) {
  const amortPerKm = includeAmortisman 
    ? aracDegeri / hedefToplamKm 
    : 0  // Varsayılan KAPALI
}
```

### 3. UI'de Gösterim

**Araç Kartında:**
```
┌──────────────────────────────────┐
│ 34 ABC 123                       │
│ Maliyet: 12.70 TL/km            │
│ (Amortisman hariç)              │
└──────────────────────────────────┘
```

**Sipariş Oluştururken:**
```
Km Başı Maliyet:
• Bakım: 1.00 TL/km
• Yakıt: 7.50 TL/km
• Sürücü: 3.20 TL/km
• Ek Masraf: 1.00 TL/km
─────────────────────
Toplam: 12.70 TL/km
```

---

## 💡 GERÇEK DÜNYA ÖRNEKLERİ

### Örnek 1: İstanbul - Ankara (450 km tek yön)

**Gerçek Maliyetler:**
- Yakıt: 450 × 7.5 = **3.375 TL**
- Sürücü (1 gün): **1.600 TL**
- Geçişler/Ek: 450 × 1 = **450 TL**
- Bakım payı: 450 × 1 = **450 TL**

**Toplam Gerçek Çıkış: 5.875 TL**  
**Sistem Hesabı: 5.715 TL** ✅ Yakın!

### Örnek 2: Kısa Mesafe (50 km)

**Gerçek Maliyetler:**
- Yakıt: 50 × 7.5 = **375 TL**
- Sürücü (yarım gün): **800 TL**
- Geçişler: **50 TL**
- Bakım: **50 TL**

**Toplam: 1.275 TL**  
**Sistem: 50 × 12.7 = 635 TL** (Sürücü günlük sayılırsa 1.600 + 635 = 2.235 TL)

---

## 🎓 ŞİRKET SAHİBİNE AÇIKLAMA

### Kısa Versiyon:
> "Amortismanı fiyatlandırmadan çıkardık. Şimdi sadece gerçek masrafları (yakıt, sürücü, bakım, geçiş) hesaplıyoruz. Amortisman muhasebe için ayrıca takip edilecek."

### Detaylı Versiyon:
> "Önceki sistemde her işe aracın amortismanını ekliyorduk (31.94 TL/km). Bu teorik bir maliyet ama gerçek nakit çıkışı değil. Araç zaten alınmış durumda.
>
> Yeni sistemde sadece **gerçek çıkan paraları** hesaplıyoruz:
> - Yakıt: 7.5 TL/km (pompa fişi)
> - Sürücü: 3.2 TL/km (maaş)
> - Bakım: 1 TL/km (servis faturası)
> - Ek: 1 TL/km (HGS, köprü, vb.)
>
> **Toplam: 12.7 TL/km**
>
> Örnek: Ankara-İstanbul (450 km) → Maliyet 5.715 TL → Önerilen fiyat ~10.000 TL
>
> Amortisman muhasebe defterinde ayrıca takip edilecek, ama günlük fiyatlandırmaya karıştırmıyoruz."

---

## 📈 YENİ FİYATLANDIRMA ÖRNEKLERİ

| Mesafe | Maliyet | +45% Kar | +20% KDV | **Önerilen** |
|--------|---------|----------|----------|--------------|
| 50 km  | 635 TL  | 921 TL   | 1.105 TL | **1.100 TL** |
| 100 km | 1.270 TL| 1.841 TL | 2.210 TL | **2.200 TL** |
| 200 km | 2.540 TL| 3.683 TL | 4.420 TL | **4.400 TL** |
| 450 km | 5.715 TL| 8.286 TL | 9.944 TL | **10.000 TL** |
| 900 km | 11.430 TL| 16.573 TL| 19.888 TL| **20.000 TL** |

---

## ⚙️ AMORTİSMANI TEKRAR AÇMAK İSTERSENİZ

### Yöntem 1: Araç Ayarlarından (Gelecekte eklenecek)

```
Araçlar → 34 ABC 123 → Düzenle
☐ Amortismanı fiyatlandırmaya dahil et
```

### Yöntem 2: Manuel (Şimdilik)

Veritabanında:
```sql
UPDATE vehicles 
SET include_amortisman = 1 
WHERE plaka = '34 ABC 123';
```

### Yöntem 3: Tüm Araçlar İçin

```sql
UPDATE vehicles 
SET include_amortisman = 1;
```

---

## ✅ SONUÇ

- **Eski Maliyet:** 44.64 TL/km (Amortisman dahil)
- **Yeni Maliyet:** 12.70 TL/km (Sadece gerçek masraflar)
- **Fiyatlar:** %70 daha rekabetçi
- **Kar Marjı:** Aynı (%45)
- **Sistem:** Daha gerçekçi

**Tüm değişiklikler GitHub'a yüklendi! 🚀**

