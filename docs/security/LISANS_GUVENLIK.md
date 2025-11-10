# 🔒 LİSANS SİSTEMİ GÜVENLİK AYARLARI

## ⚠️ HEMEN YAPMANIZ GEREKEN

### 1. Şifreleme Anahtarını Değiştirin (ÇOK ÖNEMLİ!)

**Dosya**: `electron/main/license-manager.ts`

**33. satırı bulun:**
\`\`\`typescript
private readonly ENCRYPTION_KEY = 'seymen-transport-2025-secret-key-32ch' // 32 karakter
\`\`\`

**Kendi 32 karakterlik anahtarınızla değiştirin:**
\`\`\`typescript
private readonly ENCRYPTION_KEY = 'buraya-kendi-benzersiz-32karakter1' // 32 karakter
\`\`\`

**Örnek Güçlü Anahtarlar:**
- `'X9mK2p!qW7$vB5nL3@hR8cT4&jF6yA1D'`
- `'aB8#kL2qW!5xZ9mN@3pR7vT&4cH6jF0e'`
- `'MyS3cr3tK3y!2025@Tr4nsp0rt#L1c$'`

**Not**: 
- Tam 32 karakter olmalı
- Karmaşık olsun (harf, rakam, özel karakter)
- Bunu değiştirdikten sonra eski lisanslar çalışmaz (yeni build'de)

---

### 2. Hash Salt'ını Değiştirin (Önerilen)

**Dosya**: `electron/main/license-manager.ts`

**52. satırı bulun:**
\`\`\`typescript
.update(\`\${machineId}-seymen-transport-license\`)
\`\`\`

**Kendi salt değerinizle değiştirin:**
\`\`\`typescript
.update(\`\${machineId}-kendi-benzersiz-salt-degeriniz-12345\`)
\`\`\`

**AYNI DEĞİŞİKLİĞİ** `scripts/generate-license.js` dosyasında da yapın:

**17. satırı bulun:**
\`\`\`javascript
.update(\`\${machineId}-seymen-transport-license\`)
\`\`\`

**Aynı değerle değiştirin:**
\`\`\`javascript
.update(\`\${machineId}-kendi-benzersiz-salt-degeriniz-12345\`)
\`\`\`

**Önemli**: Her iki dosyada da AYNI değer olmalı!

---

### 3. Script Dosyasını Gizli Tutun

**ÖNEMLİ**: `scripts/generate-license.js` dosyasını asla paylaşmayın!

**Eğer GitHub kullanıyorsanız:**

`.gitignore` dosyasına ekleyin:
\`\`\`
# Lisans üretme scriptini gizle
scripts/generate-license.js

# Veya tüm scripts klasörünü
scripts/
\`\`\`

**Alternatif**: Script'i projenin dışında, güvenli bir yerde saklayın.

---

## 🔐 Gelişmiş Güvenlik (Opsiyonel)

### Online Aktivasyon Sistemi

Daha güçlü koruma için sunucu taraflı doğrulama ekleyebilirsiniz:

1. **Backend API Oluşturun** (Node.js/PHP/Python)
   - Lisans üretme API'si
   - Lisans doğrulama API'si
   - Veritabanı ile lisans takibi

2. **Aktivasyon Akışı:**
   - Müşteri → Makine ID → Sizin API'niz
   - API → Lisans üretir ve veritabanına kaydeder
   - API → Müşteriye lisans döner
   - Her açılışta → API'de doğrulama (opsiyonel)

3. **Avantajları:**
   - Uzaktan lisans iptal edebilirsiniz
   - Kullanım istatistikleri toplayabilirsiniz
   - Daha güçlü koruma

### Kod Obfuscation (Karıştırma)

JavaScript/TypeScript kodunu okumayı zorlaştırın:

**Paket yükleyin:**
\`\`\`bash
npm install --save-dev javascript-obfuscator
\`\`\`

**Build scriptini güncelleyin:**
Build sonrası obfuscator çalıştırın.

**Not**: %100 koruma sağlamaz ama zorluk katar.

---

## 📋 Güvenlik Kontrol Listesi

Build öncesi kontrol edin:

- [ ] ✅ Şifreleme anahtarı değiştirildi
- [ ] ✅ Hash salt'ı değiştirildi
- [ ] ✅ Her iki dosya (license-manager.ts ve generate-license.js) eşleşiyor
- [ ] ✅ Generate script .gitignore'da
- [ ] ✅ Source code public değil
- [ ] ✅ Build test edildi

---

## 🚨 Güvenlik İhlali Durumunda

Eğer güvenlik ihlali olursa (lisans scripti sızdı vs):

### Acil Eylem Planı:

1. **Yeni Şifreleme Anahtarı**
   - `ENCRYPTION_KEY` değiştirin
   - `hash salt` değiştirin

2. **Yeni Build**
   - Uygulamayı yeniden build alın
   - Versiyonu güncelleyin

3. **Müşterileri Bilgilendirin**
   - Yeni versiyonu indirmeleri gerektiğini söyleyin
   - Yeni lisans üretin ve gönderin

4. **Eski Lisansları İptal**
   - Eğer online sistem varsa iptal edin
   - Offline sistemde: Yeni build eski lisansları tanımaz

---

## 🔍 Güvenlik Seviyeleri

### Seviye 1: Temel (Şu Anki Durum)
- ✅ Hardware ID bazlı
- ✅ Şifreli depolama
- ✅ Offline çalışma
- **Koruma**: Ortalama kullanıcı için yeterli

### Seviye 2: Orta (Önerilen)
- ✅ Seviye 1 +
- ✅ Özelleştirilmiş şifreleme anahtarı
- ✅ Özelleştirilmiş hash salt
- ✅ Script dosyası gizli
- **Koruma**: İyi seviye, çoğu senaryo için ideal

### Seviye 3: Yüksek (İleri Seviye)
- ✅ Seviye 2 +
- ✅ Online aktivasyon
- ✅ Kod obfuscation
- ✅ Periyodik lisans kontrolü
- ✅ Sunucu taraflı doğrulama
- **Koruma**: Kurumsal seviye

### Seviye 4: Çok Yüksek (Maksimum)
- ✅ Seviye 3 +
- ✅ Anti-debug teknikleri
- ✅ Integrity checking
- ✅ Virtual machine detection
- ✅ Memory protection
- **Koruma**: Profesyonel yazılım koruması
- **Not**: Uygulama için fazla karmaşık olabilir

---

## 💡 Önerilen Yaklaşım

**Çoğu kullanım için Seviye 2 yeterlidir:**

1. Şifreleme anahtarını değiştirin
2. Hash salt'ı değiştirin
3. Script'i gizli tutun
4. Private repository kullanın

Bu, %95 kullanıcı için yeterli koruma sağlar.

---

## 📞 Teknik Destek

Güvenlik ile ilgili sorularınız için:
- `electron/main/license-manager.ts` - Ana lisans mantığı
- `scripts/generate-license.js` - Lisans üretme
- `LICENSE_SYSTEM.md` - Detaylı dokümantasyon

---

## ⚖️ Yasal Uyarı

Bu lisans sistemi:
- ✅ Temel koruma sağlar
- ✅ Yetkisiz kullanımı zorlaştırır
- ❌ %100 kırılamaz garantisi vermez

**Not**: Hiçbir yazılım koruması %100 güvenli değildir. Bu sistem makul bir koruma seviyesi sunar.

---

**GÜVENLİK İLK ÖNCELİĞİNİZ OLMALI! 🔒**

Yukarıdaki adımları tamamladıktan sonra güvenli bir şekilde dağıtım yapabilirsiniz.

