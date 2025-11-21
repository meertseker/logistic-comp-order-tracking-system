import { motion } from 'framer-motion'
import { Cookie } from 'lucide-react'

const CookiePolicy = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 md:p-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Cookie className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Çerez Politikası</h1>
              <p className="text-gray-400 text-sm mt-1">Son güncelleme: 1 Ocak 2024</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Çerez Nedir?</h2>
              <p className="leading-relaxed">
                Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla 
                cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalarıdır. Web sitesini 
                ziyaretiniz boyunca edinilen bilgileri saklayarak tekrar kullanılmasını sağlar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Çerez Türleri</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Zorunlu Çerezler</h3>
                  <p className="leading-relaxed">
                    Web sitesinin düzgün çalışması için gerekli olan çerezlerdir. Bu çerezler olmadan 
                    sitenin temel fonksiyonları çalışmaz.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Performans Çerezleri</h3>
                  <p className="leading-relaxed">
                    Ziyaretçilerin web sitesini nasıl kullandığını analiz etmemizi sağlar. Bu bilgiler 
                    anonim olarak toplanır ve site performansını iyileştirmek için kullanılır.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">İşlevsellik Çerezleri</h3>
                  <p className="leading-relaxed">
                    Kullanıcı tercihlerini hatırlayarak kişiselleştirilmiş bir deneyim sunmamızı sağlar.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Pazarlama Çerezleri</h3>
                  <p className="leading-relaxed">
                    İlgi alanlarınıza uygun reklamlar göstermek için kullanılır. Üçüncü taraf reklamcılar 
                    tarafından yerleştirilebilir.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Kullandığımız Çerezler</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 pr-4">Çerez Adı</th>
                      <th className="text-left py-3 pr-4">Tür</th>
                      <th className="text-left py-3 pr-4">Süre</th>
                      <th className="text-left py-3">Amaç</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs">session_id</td>
                      <td className="py-3 pr-4">Zorunlu</td>
                      <td className="py-3 pr-4">Oturum</td>
                      <td className="py-3">Kullanıcı oturumunu takip eder</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs">csrf_token</td>
                      <td className="py-3 pr-4">Zorunlu</td>
                      <td className="py-3 pr-4">Oturum</td>
                      <td className="py-3">Güvenlik için CSRF koruması</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs">_ga</td>
                      <td className="py-3 pr-4">Analitik</td>
                      <td className="py-3 pr-4">2 yıl</td>
                      <td className="py-3">Google Analytics kullanıcı tanımlama</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs">preferences</td>
                      <td className="py-3 pr-4">İşlevsel</td>
                      <td className="py-3 pr-4">1 yıl</td>
                      <td className="py-3">Kullanıcı tercihlerini saklar</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Üçüncü Taraf Çerezleri</h2>
              <p className="leading-relaxed mb-3">
                Web sitemizde aşağıdaki üçüncü taraf hizmetlerinin çerezlerini kullanıyoruz:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Google Analytics:</strong> Site trafiğini analiz etmek için</li>
                <li><strong>Google Maps:</strong> Harita hizmetleri için</li>
                <li><strong>Hotjar:</strong> Kullanıcı deneyimini iyileştirmek için</li>
                <li><strong>Facebook Pixel:</strong> Reklamları optimize etmek için</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Çerezleri Yönetme</h2>
              <p className="leading-relaxed mb-3">
                Çerez tercihlerinizi aşağıdaki yollarla yönetebilirsiniz:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tarayıcı ayarlarından çerezleri engelleyebilir veya silebilirsiniz</li>
                <li>Web sitemizin çerez ayarları panelinden tercihlerinizi belirleyebilirsiniz</li>
                <li>Üçüncü taraf çerezler için ilgili hizmet sağlayıcıların ayarlarını kullanabilirsiniz</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>Not:</strong> Çerezleri devre dışı bırakırsanız, web sitesinin bazı özellikleri 
                düzgün çalışmayabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Tarayıcı Ayarları</h2>
              <p className="leading-relaxed mb-3">Popüler tarayıcılarda çerez ayarları:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
                <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
                <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</li>
                <li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Çerez Politikası Değişiklikleri</h2>
              <p className="leading-relaxed">
                Bu Çerez Politikası&apos;nı zaman zaman güncelleyebiliriz. Önemli değişiklikler web sitesinde 
                duyurulacaktır. Politikayı düzenli olarak gözden geçirmenizi öneririz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. İletişim</h2>
              <p className="leading-relaxed">
                Çerez politikamız hakkında sorularınız için:<br />
                E-posta: privacy@sekersoft.com<br />
                Telefon: +90 (212) 123 45 67
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CookiePolicy

