# 🔐 Lisans Sistemi Hızlı Başlangıç

## Özet

Projenize **hardware-based (donanım bazlı)** bir lisans sistemi eklendi. Artık uygulamanızı paylaştığınızda kopyalanamaz ve her bilgisayar için özel lisans gerekir.

---

## 🚀 Hızlı Başlangıç

### 1️⃣ Kendiniz İçin Lisans Oluşturun (Test)

**Adım 1**: Uygulamayı çalıştırın
\`\`\`bash
npm run electron:dev
\`\`\`

**Adım 2**: Aktivasyon ekranında **Makine ID**'nizi kopyalayın

**Adım 3**: Terminal'de lisans oluşturun
\`\`\`bash
node scripts/generate-license.js "BURAYA_MAKINE_ID_YAPIŞTIRIN"
\`\`\`

**Adım 4**: Çıkan lisans anahtarını aktivasyon ekranına girin

**Adım 5**: Firma bilgilerinizi doldurup "Aktive Et" butonuna tıklayın

✅ **Tebrikler!** Artık uygulamayı kullanabilirsiniz.

---

## 👥 Müşteriye Nasıl Satarım?

### Senaryo: Yeni Müşteri

1. **Müşteri İletişime Geçer**
   - "Uygulamanızı satın almak istiyorum"

2. **Kurulumu Yaptırın**
   - Uygulamanın setup dosyasını gönderin
   - Müşteri kurar ve açar
   - Aktivasyon ekranı karşısına çıkar

3. **Makine ID'yi İsteyin**
   - "Lütfen ekranda gördüğünüz Makine ID'yi bana gönderin"
   - Müşteri: "abc123def456ghi789..."

4. **Lisans Üretin**
   \`\`\`bash
   node scripts/generate-license.js "abc123def456ghi789..."
   \`\`\`
   
   Çıktı:
   \`\`\`
   🎫 Lisans Anahtarı: A1B2-C3D4-E5F6-G7H8
   \`\`\`

5. **Müşteriye Gönderin**
   - E-posta veya WhatsApp ile lisans anahtarını gönderin
   - Müşteri bu anahtarı uygulamaya girer
   - Aktivasyon tamamlanır ✅

6. **Kayıt Tutun** (Excel/Not)
   \`\`\`
   Firma: Örnek A.Ş.
   E-posta: ornek@firma.com
   Makine ID: abc123def...
   Lisans: A1B2-C3D4...
   Tarih: 27.10.2025
   Ücret: 5000 TL
   \`\`\`

---

## 🔄 Sık Sorulan Sorular (SSS)

### ❓ Müşteri bilgisayar değiştirirse ne olur?

Eski lisans çalışmaz. Yeni bilgisayar için **yeni lisans** üretmeniz gerekir.

**İki seçeneğiniz var:**
1. **Ücretsiz**: "Bir kereye mahsus bedava yeni lisans veriyorum"
2. **Ücretli**: "Bilgisayar değişiminde 1000 TL lisans yenileme ücreti alıyoruz"

### ❓ Müşteri lisansı başkasıyla paylaşabilir mi?

**Hayır!** Lisans makine ID'ye bağlı. Başka bilgisayarda çalışmaz. ✅

### ❓ Lisans kırılabilir mi?

Ortalama kullanıcı için **çok zor**. Ancak:
- %100 kırılmaz değil
- Teknik bilgisi olan biri kırabilir
- Ama bu çoğu müşteri için yeterli koruma sağlar

### ❓ Deneme sürümü verebilir miyim?

Şu anda sistem süresiz lisans üretiyor. Süreli lisans için:
- \`license-manager.ts\` dosyasında \`expiresAt\` alanını kullanın
- Detaylar \`LICENSE_SYSTEM.md\` dosyasında

### ❓ Lisans kayıtlarımı nasıl tutayım?

**Basit Excel Tablosu:**

| Müşteri | E-posta | Makine ID (ilk 10 karakter) | Lisans | Tarih | Ücret |
|---------|---------|------------------------------|--------|-------|-------|
| Örnek Ltd | ornek@firma.com | abc123def4... | A1B2-... | 27.10.2025 | 5000 TL |

---

## 🎯 Fiyatlandırma Önerileri

### Opsiyon 1: Tek Seferlik Ücret
- **5000 TL**: Tek bilgisayar, süresiz kullanım
- **+2000 TL**: Her ek bilgisayar için

### Opsiyon 2: Yıllık Abonelik
- **3000 TL/yıl**: Tek bilgisayar
- **+1500 TL/yıl**: Her ek bilgisayar için
- Her yıl lisans yenileme ücreti

### Opsiyon 3: Karma Model
- **4000 TL**: İlk yıl (kurulum + lisans)
- **1000 TL/yıl**: Yıllık yenileme + destek
- **1500 TL**: Bilgisayar değişimi ücreti

---

## 🛠️ Kurulum Dosyası Oluşturma

Uygulamanızı müşteriye göndermek için build alın:

\`\`\`bash
npm run build
\`\`\`

Bu komut \`release/\` klasöründe kurulum dosyası oluşturur.

**Not**: Lisans sistemi build'de de çalışır, dev mode'a özel değil.

---

## 🔐 Güvenlik İpuçları

### ✅ YAPMANIZ GEREKENLER

1. **Şifreleme Anahtarını Değiştirin**
   - \`electron/main/license-manager.ts\` dosyasını açın
   - \`ENCRYPTION_KEY\` değerini değiştirin (32 karakter olmalı)
   - Örnek: \`'kendi-benzersiz-sifreleme-anahtariniz-12'`

2. **Generate Script'i Gizli Tutun**
   - \`scripts/generate-license.js\` dosyasını asla müşterilerle paylaşmayın
   - Bu dosya lisans üretme gücü verir

3. **Source Code'u Paylaşmayın**
   - Sadece build edilmiş \`.exe\` veya setup dosyası gönderin
   - Kaynak kodu GitHub'da public yaparsanız lisans sistemi işe yaramaz

### ❌ YAPMAMANIZ GEREKENLER

1. GitHub'da Public Repo açmayın (veya \`.gitignore\`'a \`scripts/\` ekleyin)
2. Şifreleme anahtarını default bırakmayın
3. Lisans üretme scriptini müşteriye gönderm eyin

---

## 📊 Örnek Kullanım (1 Ay)

**Ayın Satışları:**
- 3 yeni müşteri → 3 lisans → 3 × 5000 TL = **15,000 TL**
- 1 bilgisayar değişimi → 1 lisans → **1,500 TL**
- 2 ek bilgisayar → 2 lisans → 2 × 2000 TL = **4,000 TL**

**Toplam:** 20,500 TL 💰

---

## 📞 Yardım

Detaylı bilgi için:
- **Teknik Dokümantasyon**: \`LICENSE_SYSTEM.md\`
- **Kod**: \`electron/main/license-manager.ts\`

---

## ✨ Sonuç

Artık uygulamanız:
- ✅ Kopyalanamaz
- ✅ Her müşteri için benzersiz lisans gerektirir
- ✅ Bilgisayar başına lisans satabilirsiniz
- ✅ Ek gelir fırsatları sunuyor

**Kolay gelsin ve bol kazançlar! 🚀**

