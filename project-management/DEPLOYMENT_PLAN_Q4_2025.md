# 🚀 Q4 2025 Dağıtım & Rollout Planı

**Ürün:** Sekersoft Lojistik Sipariş Takip Sistemi (Electron + React)  
**Çıktı:** Windows (.exe) + macOS (.dmg) kurulum paketleri + tanıtım sitesi güncellemesi  
**Sahip:** Proje Yönetimi / DevOps

---

## 1. Ortamlar & Sürümleme
- **Dev:** Lokal makine, `develop` branch, feature flag `demoMode`.
- **Staging:** GitHub Actions → Artefakt yüklemesi, dahili test lisansı.
- **Prod:** Release branch + tag `v1.0.0`. Electron Builder + Code Signing.
- **Web:** `sekersoft-website` Vite build → Cloudflare Pages (primary) + Netlify (backup).

---

## 2. Teknik Adımlar
1. **Kod Dondurma:** Lansman haftasından 5 gün önce `release/v1.0.0`.
2. **CI Pipeline:** `npm run lint && npm run test && npm run build` + Playwright smoke.
3. **Installer Üretimi:** `npm run build:electron` → `dist/`, imzalama `scripts/generate-license-advanced`.
4. **Artefakt İmzalama:** EV Code Signing sertifikası; hash kontrolü `Get-FileHash`.
5. **Download CDN:** Installer’ları Cloudflare R2 + geo-redundant bucket.

---

## 3. QA & Kabul
- **Fonksiyonel:** 60 temel senaryo (orders, vehicles, reports, license).
- **Regresyon:** 2 saatlik checklist, QA ekibi.
- **Lisans Testi:** Offline/online aktivasyon, geçersiz key negative test.
- **Web:** Lighthouse ≥ 90, formlar HubSpot’a düşüyor mu?

---

## 4. Rollout Planı
| Gün | Aktivite | Sorumlu |
| --- | --- | --- |
| -7 | Basın & LinkedIn teaser | Marketing |
| -5 | Müşteri destek eğitimi | Customer Success |
| -2 | Web sitesi yeni içerik yayını | Frontend |
| 0 | Installer yayını + e-posta kampanyası | PM + Marketing |
| +2 | Webinar / soru-cevap | Sales |

---

## 5. İzleme & Telemetri
- **Crash Reports:** Sentry + local log upload.
- **Lisans aktivasyonu:** Daily dashboard (`scripts/get-license-metrics`).
- **Web Analytics:** GA4 + LinkedIn Insight Tag.

---

## 6. Rollback Stratejisi
1. Prod build’ler `dist/prev/` klasöründe saklanır.
2. Download linkleri Cloudflare Workers üzerinden yönlendirilir; gerektiğinde eski sürüme 5 dk içinde dönülür.
3. Web için Netlify backup deploy’u “rollback” etiketiyle hazır tutulur.

---

## 7. İletişim Planı
- **Sıcak Hat:** destek@sekersoft.com + WhatsApp Business.
- **Durum Güncellemeleri:** Notion status page + LinkedIn pinned post.
- **Incident Seviyesi:** Sev1 (download çalışmıyor) → tüm ekip 30 dk içinde çağrılır.

---

**Not:** Tüm çıktılar `LAUNCH_CHECKLIST.md` ile çapraz doğrulanmadan lansman yapılmayacaktır.


