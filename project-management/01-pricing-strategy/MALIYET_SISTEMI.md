# 📊 Gelişmiş Maliyet Analiz Sistemi - Kullanım Kılavuzu

## 🎯 Genel Bakış

Lojistik maliyet hesaplama sistemi entegre edildi. Artık her sipariş için:
- **Gerçek zamanlı kar/zarar analizi**
- **Km başına maliyet hesaplaması**  
- **Dönüşte yük bulma oranı**
- **Önerilen fiyat hesaplama**
- **Detaylı maliyet dökümü**

---

## 🔢 Maliyet Hesaplama Formülü

### 1. Km Başına Maliyet Bileşenleri

```
Amortisman/km = Araç Değeri ÷ Hedef Toplam Km
Bakım/km = Bakım Maliyeti ÷ Bakım Aralığı Km
Ek Masraf/km = Ek Masraf (1000 TL) ÷ 1000
Yakıt/km = 7.5 TL (sabit)
Sürücü/km = Günlük Ücret ÷ Günlük Ort. Km

TOPLAM MALİYET/KM = Tüm bileşenlerin toplamı
```

### 2. Etkin Km Hesabı (Dönüşte Yük Bulma Dahil)

```
Etkin Km = Gidiş Km + (Dönüş Km × (1 - Return Load Rate))
```

**Örnekler:**
- Return Load Rate = %0 (boş dönüş) → Etkin Km = 450 + 450 = **900 km**
- Return Load Rate = %50 (yarı dolu) → Etkin Km = 450 + 225 = **675 km**
- Return Load Rate = %100 (tam dolu) → Etkin Km = 450 + 0 = **450 km**

### 3. Fiyat Hesaplama

```
Toplam Maliyet = Etkin Km × Maliyet/Km
Karlı Fiyat = Toplam Maliyet × (1 + Kar Oranı)    [%45 kar]
KDV'li Fiyat = Karlı Fiyat × (1 + KDV)            [%20 KDV]
Kar/Zarar = Müşteri Ödemesi - KDV'li Fiyat
```

---

## 📱 Kullanım Adımları

### Adım 1: Araç Parametrelerini Ayarlama

1. **Araçlar** menüsüne gidin
2. **"Yeni Araç"** butonuna tıklayın
3. Parametreleri girin:

| Parametre | Varsayılan | Açıklama |
|-----------|------------|----------|
| Araç Değeri | 2.300.000 TL | Aracın satın alma bedeli |
| Amorti Süresi | 2 yıl | Amortisman süresi |
| Hedef Toplam Km | 72.000 km | 2 yılda yapılacak toplam km |
| Bakım Maliyeti | 15.000 TL | Her bakım maliyeti |
| Bakım Aralığı | 15.000 km | Bakımlar arası km |
| Ek Masraf | 1.000 TL/1000km | Diğer masraflar |
| Yakıt | 7.5 TL/km | Km başına yakıt |
| Günlük Ücret | 1.600 TL | Sürücü günlük ücreti |
| Günlük Ort Km | 500 km | Günde ortalama km |
| Kar Oranı | 0.45 (%45) | Hedef kar marjı |
| KDV | 0.20 (%20) | KDV oranı |

4. **"Kaydet"** butonuna tıklayın

### Adım 2: Sipariş Oluşturma

1. **Siparişler** → **Yeni Sipariş**
2. Form doldurun:
   - **Plaka**: Araç seç (parametreleri otomatik yükler)
   - **Müşteri & Telefon**: İletişim bilgileri
   - **Nereden/Nereye**: Güzergah
   - **Gidiş Km**: Tek yön mesafe
   - **Dönüş Km**: Geri dönüş mesafesi (opsiyonel)
   - **Dönüşte Yük Bulma Oranı**: Slider ile %0-100 arası
   - **Müşteriden Alınan Ücret**: Anlaşılan fiyat

3. **Sağ panelde anlık analiz görün:**
   - ✅ **Yeşil**: Kâr var
   - ❌ **Kırmızı**: Zarar var
   - Detaylı maliyet dökümü
   - Önerilen fiyat
   - Kar/zarar tutarı ve yüzdesi

4. **"Sipariş Oluştur"** ile kaydet

---

## 💡 Gerçek Dünya Örnekleri

### Örnek 1: Ankara - İstanbul (Zarar Durumu)

**Giriş:**
- Mesafe: 450 km (gidiş) + 450 km (dönüş) = 900 km
- Return Load Rate: %0 (boş dönüş)
- Müşteri Ödemesi: 24.000 TL

**Hesaplama:**
```
Etkin Km = 450 + 450×(1-0) = 900 km
Maliyet/km = 44.64 TL
Toplam Maliyet = 900 × 44.64 = 40.176 TL
Karlı Fiyat = 40.176 × 1.45 = 58.255 TL
KDV'li Fiyat = 58.255 × 1.20 = 69.906 TL

KAR/ZARAR = 24.000 - 69.906 = -45.906 TL ❌
```

**Çözüm:** Müşteriye 69.906 TL teklif edilmeli veya dönüşte yük bulunmalı.

### Örnek 2: Ankara - İstanbul (%50 Dolu Dönüş)

**Giriş:**
- Mesafe: 450 km + 450 km
- Return Load Rate: %50 (yarı dolu dönüş)
- Müşteri Ödemesi: 24.000 TL

**Hesaplama:**
```
Etkin Km = 450 + 450×(1-0.5) = 675 km
Toplam Maliyet = 675 × 44.64 = 30.132 TL
Karlı Fiyat = 30.132 × 1.45 = 43.691 TL
KDV'li Fiyat = 43.691 × 1.20 = 52.429 TL

KAR/ZARAR = 24.000 - 52.429 = -28.429 TL ❌
```

Hala zarar ama yarısına indi.

### Örnek 3: Ankara - İstanbul (%100 Dolu Dönüş)

**Giriş:**
- Mesafe: 450 km + 450 km
- Return Load Rate: %100 (tam dolu dönüş)
- Müşteri Ödemesi: 24.000 TL

**Hesaplama:**
```
Etkin Km = 450 + 450×(1-1) = 450 km
Toplam Maliyet = 450 × 44.64 = 20.088 TL
Karlı Fiyat = 20.088 × 1.45 = 29.128 TL
KDV'li Fiyat = 29.128 × 1.20 = 34.954 TL

KAR/ZARAR = 24.000 - 34.954 = -10.954 TL ❌
```

Hala zarar (dönüş için ayrı bir sipariş alınmalı).

### Örnek 4: İdeal Fiyat Teklifi

**Giriş:**
- Mesafe: 450 km (tek yön, dönüş yok)
- Return Load Rate: N/A
- Müşteri Ödemesi: ?

**Sistem Önerisi:**
```
Etkin Km = 450 km
Toplam Maliyet = 450 × 44.64 = 20.088 TL
Karlı Fiyat = 20.088 × 1.45 = 29.128 TL
KDV'li Fiyat = 29.128 × 1.20 = 34.954 TL

ÖNERİLEN FİYAT: 34.954 TL ✅
```

---

## 📊 Raporlama

### Araç Performans Analizi

**Araçlar** sayfasında her araç için:
- Km başına toplam maliyet
- Araç değeri ve amortisman
- Güncel parametreler

### Sipariş Kar/Zarar Takibi

Her sipariş kaydında şunlar saklanır:
- Gidiş/dönüş km
- Return load rate
- Etkin km
- Toplam maliyet
- Önerilen fiyat
- Gerçek kar/zarar

---

## ⚙️ Sistem Parametreleri

### Varsayılan Değerler (Senin Verdiğin)

```typescript
Araç Değeri: 2.300.000 TL
Amorti Süresi: 2 yıl (24 ay)
Hedef Km: 72.000 km (ayda 3.000 km)
Bakım: 15.000 TL / 15.000 km = 1 TL/km
Ek Masraf: 1.000 TL / 1.000 km = 1 TL/km
Yakıt: 7.5 TL/km
Günlük Ücret: 1.600 TL/gün
Günlük Km: 500 km/gün → 3.2 TL/km
Kar: %45
KDV: %20

➡️ TOPLAM: 44.64 TL/km
```

### Maliyet Dağılımı

```
Amortisman: 31.94 TL/km (71.5%)
Yakıt: 7.50 TL/km (16.8%)
Sürücü: 3.20 TL/km (7.2%)
Bakım: 1.00 TL/km (2.2%)
Ek Masraf: 1.00 TL/km (2.2%)
```

---

## 🎓 Şirket Sahibine Açıklama

**Kısa Versiyon:**

> "Sistemimiz her işi km başına hesaplıyor. Bizim ortalama maliyetimiz **44.64 TL/km**. 
> Buna %45 kar ve %20 KDV eklenince önerilen fiyatımız çıkıyor. 
> Dönüşte yük bulursak maliyet önemli ölçüde düşüyor."

**Detaylı Versiyon:**

> "Biz işleri **km başı maliyet** üzerinden fiyatlıyoruz. Tüm giderlerimiz dahil:
> - Amortisman (araç değerini 2 yıla böldük)
> - Yakıt (7.5 TL/km)
> - Sürücü maaşı (günlük 1600 TL ÷ 500 km)
> - Bakım-onarım
> - Geçiş ücretleri
> 
> Toplam maliyetimiz **44.64 TL/km** çıkıyor. Örneğin Ankara-İstanbul gidiş-dönüş 900 km = 40.176 TL maliyet.
> 
> Bu maliyete %45 kar ve %20 KDV ekliyoruz. Böylece:
> - Başabaş noktası (sadece KDV ile): ~48.211 TL
> - Karlı satış fiyatı (kar + KDV): ~69.906 TL
> 
> **Dönüşte yük bulunursa:** Maliyet yarıya düşer. %100 dolu dönüşte sadece gidiş km'si sayılır."

---

## 🚀 Gelecek Özellikler

- [ ] Araç bazlı karlılık raporları
- [ ] Müşteri bazlı kar/zarar analizi
- [ ] Otomatik fiyat önerileri (AI)
- [ ] Gerçek km vs tahmini km karşılaştırması
- [ ] Çoklu araç karşılaştırma
- [ ] Export to Excel/PDF

---

## 📞 Destek

Sorular için:
- README.md dosyasına bakın
- GitHub Issues açın
- support@seymentransport.com

**Son Güncelleme:** 25 Ekim 2025

