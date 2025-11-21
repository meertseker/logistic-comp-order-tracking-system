# 🚀 Release v1.1.9 - Detaylı Maliyet Hesaplama Gösterimi

**Tarih:** 2025-01-XX  
**Versiyon:** 1.1.9

---

## 📋 Özet

Bu release, maliyet hesaplama sisteminde önemli iyileştirmeler içermektedir. Artık tüm maliyet kalemleri detaylı bir şekilde gösteriliyor ve kullanıcılar manuel hesaplamalarıyla sistem hesaplamalarını kolayca karşılaştırabiliyor.

---

## ✨ Yeni Özellikler

### 1. Detaylı Maliyet Breakdown Gösterimi

**CostCalculator Component:**
- Tüm maliyet kalemleri ayrı ayrı gösteriliyor
- Yakıt, sürücü, yemek, HGS, bakım maliyetleri detaylı
- Sigorta/MTV/Muayene maliyetleri ayrı ayrı gösteriliyor
- Kar ve KDV hesaplama adımları görüntüleniyor
- Önerilen fiyat ve başabaş noktası gösteriliyor

**CreateOrderFixed Sayfası:**
- Sağ panelde detaylı maliyet analizi eklendi
- Tüm hesaplama adımları görüntüleniyor
- Gerçek zamanlı maliyet güncellemesi

### 2. OrderDetail Sayfası İyileştirmeleri

- Sabit maliyetler (Sigorta/MTV/Muayene) dinamik hesaplanıyor
- Eski siparişler için otomatik maliyet hesaplama
- 8 maliyet kalemi ayrı kartlarda gösteriliyor
- Bilgilendirici mesajlar eklendi

### 3. Database Schema Güncellemeleri

**Yeni Kolonlar:**
- `sigorta_maliyet REAL DEFAULT 0`
- `mtv_maliyet REAL DEFAULT 0`
- `muayene_maliyet REAL DEFAULT 0`

Bu kolonlar sayesinde her sipariş için sabit maliyetler ayrı ayrı saklanıyor.

---

## 🔧 İyileştirmeler

### UI/UX İyileştirmeleri

1. **VehicleSelect & VehicleSelectCompact:**
   - Sabit giderler (sigorta/MTV/muayene) KM bazlı gösterimden kaldırıldı
   - Gün bazlı hesaplama notu eklendi
   - Sadece değişken maliyetler gösteriliyor

2. **VehiclesProfessional Sayfası:**
   - Sabit giderler KM bazlı hesaplamadan kaldırıldı
   - Yıllık sabit giderler bilgilendirme amaçlı gösteriliyor
   - Gün bazlı hesaplama açıklaması eklendi

3. **CostCalculator:**
   - Detaylı hesaplama adımları gösteriliyor
   - Sabit giderler için bilgilendirici not eklendi
   - HGS maliyeti ayrı gösteriliyor

### Backend İyileştirmeleri

1. **IPC Handlers:**
   - `db:createOrder` ve `db:updateOrder` handler'ları güncellendi
   - Yeni sabit maliyet kolonları kaydediliyor

2. **EditOrder Sayfası:**
   - Sabit maliyetler güncelleme işlemine dahil edildi

---

## 📊 Analiz ve Dokümantasyon

### Yeni Dokümantasyon

1. **MANUEL_VS_SISTEM_HESAPLAMA.md:**
   - Manuel hesaplama vs sistem hesaplama karşılaştırması
   - HGS maliyetinin fiyat farkındaki etkisi analizi
   - Detaylı hesaplama örnekleri

### Önemli Bulgular

**HGS Maliyeti Farkı:**
- Manuel hesaplamalarda HGS maliyeti genellikle eksik
- Sistem güzergah bazlı HGS hesaplıyor
- Örnek: İstanbul-Ankara güzergahı için 600 TL (450 TL HGS + 150 TL köprü)
- Bu fark önerilen fiyatta ~1,270 TL fark yaratabiliyor

**Gün Bazlı Sabit Giderler:**
- Sigorta/MTV/Muayene artık gün bazlı hesaplanıyor (piyasa standartlarına uygun)
- Önceki KM bazlı hesaplama yöntemi kaldırıldı
- Daha doğru maliyet hesaplaması sağlanıyor

---

## 🐛 Düzeltmeler

1. **OrderDetail Sayfası:**
   - Eski siparişlerde sabit maliyetler 0 gösterilme sorunu çözüldü
   - Dinamik hesaplama eklendi

2. **Maliyet Gösterimi:**
   - Tüm maliyet kalemleri tutarlı şekilde gösteriliyor
   - Gün bazlı vs KM bazlı hesaplama karışıklığı giderildi

---

## 📝 Değişiklik Detayları

### Değiştirilen Dosyalar

1. `src/components/CostCalculator.tsx`
2. `src/components/VehicleSelect.tsx`
3. `src/components/VehicleSelectCompact.tsx`
4. `src/pages/CreateOrderFixed.tsx`
5. `src/pages/EditOrder.tsx`
6. `src/pages/OrderDetail.tsx`
7. `src/pages/VehiclesProfessional.tsx`
8. `electron/main/database.ts`
9. `electron/main/index.ts`

### Yeni Dosyalar

1. `MANUEL_VS_SISTEM_HESAPLAMA.md`

---

## 🔄 Migration Notları

**Database Migration:**
- Yeni kolonlar otomatik olarak ekleniyor
- Mevcut siparişler için değerler 0 olarak başlatılıyor
- OrderDetail sayfasında dinamik hesaplama ile dolduruluyor

**Geriye Uyumluluk:**
- Eski siparişler için otomatik maliyet hesaplama eklendi
- Kullanıcı arayüzünde bilgilendirici mesajlar gösteriliyor

---

## 🎯 Sonraki Adımlar

1. Kullanıcı geri bildirimlerine göre UI iyileştirmeleri
2. Daha fazla güzergah için HGS maliyetleri eklenmesi
3. Maliyet raporlama özelliklerinin genişletilmesi

---

## 🙏 Teşekkürler

Bu release'deki iyileştirmeler için geri bildirimlerinizi bekliyoruz!

---

**Not:** Bu release'deki tüm değişiklikler geriye uyumludur ve mevcut verilerinizi etkilemez.

