import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

const Terms = () => {
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
              <FileText className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Kullanım Koşulları</h1>
              <p className="text-gray-400 text-sm mt-1">Son güncelleme: 1 Ocak 2024</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Kabul ve Onay</h2>
              <p className="leading-relaxed">
                Sekersoft hizmetlerini kullanarak, bu Kullanım Koşullarını kabul etmiş sayılırsınız. 
                Koşulları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayınız.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Hizmet Tanımı</h2>
              <p className="leading-relaxed">
                Sekersoft, lojistik ve nakliye yönetimi için bulut tabanlı bir yazılım hizmetidir (SaaS). 
                Hizmetlerimiz abonelik modeli ile sunulmaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Hesap Oluşturma</h2>
              <p className="leading-relaxed mb-3">Hesap oluştururken:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Doğru ve güncel bilgiler sağlamalısınız</li>
                <li>Hesap güvenliğinizden siz sorumlusunuz</li>
                <li>Hesabınızı başkalarıyla paylaşmamalısınız</li>
                <li>18 yaşından büyük olmalısınız veya yasal vasi iznine sahip olmalısınız</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Kullanım Kuralları</h2>
              <p className="leading-relaxed mb-3">Hizmetlerimizi kullanırken:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Yasalara ve düzenlemelere uymalısınız</li>
                <li>Sisteme zarar verecek faaliyetlerde bulunmamalısınız</li>
                <li>Diğer kullanıcıların haklarına saygı göstermelisiniz</li>
                <li>Fikri mülkiyet haklarını ihlal etmemelisiniz</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Abonelik ve Ödeme</h2>
              <p className="leading-relaxed mb-3">Abonelik koşulları:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Abonelikler otomatik olarak yenilenir</li>
                <li>Ödemeler seçilen dönemde (aylık/yıllık) tahsil edilir</li>
                <li>Fiyat değişiklikleri önceden bildirilir</li>
                <li>İptal işlemi cari dönem sonunda geçerli olur</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. İade Politikası</h2>
              <p className="leading-relaxed">
                30 günlük ücretsiz deneme süresinde istediğiniz zaman iptal edebilirsiniz. 
                Ücretli abonelikler için iadesiz politika uygulanır, ancak hizmet kesintisi 
                durumunda kalan süre için iade yapılır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Hizmet Seviyesi</h2>
              <p className="leading-relaxed">
                %99.9 uptime garantisi sunuyoruz. Planlı bakımlar önceden bildirilir. 
                Hizmet kesintileri durumunda telafi politikamız uygulanır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Fikri Mülkiyet</h2>
              <p className="leading-relaxed">
                Sekersoft platformu ve içeriği Sekersoft'un fikri mülkiyetidir. Kullanıcılar 
                yalnızca kişisel verilerinin sahibidir. Platform üzerinde oluşturulan içeriklerin 
                tüm hakları kullanıcıya aittir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Sorumluluk Sınırlaması</h2>
              <p className="leading-relaxed">
                Sekersoft, dolaylı zararlardan sorumlu değildir. Toplam sorumluluk, son 12 ayda 
                ödenen abonelik bedeli ile sınırlıdır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Hesap Kapatma</h2>
              <p className="leading-relaxed">
                Sekersoft, bu koşulları ihlal eden hesapları askıya alabilir veya kapatabilir. 
                Kullanıcılar istedikleri zaman hesaplarını kapatabilirler.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Değişiklikler</h2>
              <p className="leading-relaxed">
                Bu koşulları güncelleyebiliriz. Önemli değişiklikler 30 gün önceden bildirilir. 
                Değişikliklerden sonra hizmeti kullanmaya devam etmek, yeni koşulları kabul ettiğiniz anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Uygulanacak Hukuk</h2>
              <p className="leading-relaxed">
                Bu sözleşme Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklar İstanbul mahkemelerinde çözülür.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. İletişim</h2>
              <p className="leading-relaxed">
                Kullanım koşulları hakkında sorularınız için:<br />
                E-posta: legal@sekersoft.com<br />
                Telefon: +90 (212) 123 45 67
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Terms

