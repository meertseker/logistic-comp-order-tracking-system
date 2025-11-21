import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

const Privacy = () => {
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
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Gizlilik Politikası</h1>
              <p className="text-gray-400 text-sm mt-1">Son güncelleme: 1 Ocak 2024</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Giriş</h2>
              <p className="leading-relaxed">
                Sekersoft olarak, kullanıcılarımızın gizliliğine önem veriyoruz. Bu Gizlilik Politikası, 
                kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Toplanan Veriler</h2>
              <p className="leading-relaxed mb-3">Aşağıdaki kişisel verileri toplayabiliriz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ad, soyad ve iletişim bilgileri</li>
                <li>E-posta adresi ve telefon numarası</li>
                <li>Şirket bilgileri</li>
                <li>IP adresi ve tarayıcı bilgileri</li>
                <li>Kullanım verileri ve tercihler</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Verilerin Kullanımı</h2>
              <p className="leading-relaxed mb-3">Topladığımız veriler aşağıdaki amaçlarla kullanılır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Hizmetlerimizi sağlamak ve geliştirmek</li>
                <li>Kullanıcı desteği sunmak</li>
                <li>Hesap güvenliğini sağlamak</li>
                <li>Yasal yükümlülükleri yerine getirmek</li>
                <li>İstatistiksel analizler yapmak</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Veri Güvenliği</h2>
              <p className="leading-relaxed">
                Verilerinizin güvenliği bizim için öncelik taşır. Endüstri standardı güvenlik önlemleri 
                uyguluyoruz ve verileriniz 256-bit SSL şifreleme ile korunmaktadır. Veri merkezlerimiz 
                ISO 27001 sertifikalıdır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Çerezler</h2>
              <p className="leading-relaxed">
                Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Çerez 
                tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Üçüncü Taraf Paylaşımı</h2>
              <p className="leading-relaxed">
                Kişisel verilerinizi, yasal zorunluluklar dışında, izniniz olmadan üçüncü taraflarla 
                paylaşmayız. Hizmet sağlayıcılarımızla yalnızca gerekli minimum veri paylaşılır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Kullanıcı Hakları</h2>
              <p className="leading-relaxed mb-3">KVKK kapsamındaki haklarınız:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kişisel verilerinize erişim hakkı</li>
                <li>Verilerin düzeltilmesini isteme hakkı</li>
                <li>Verilerin silinmesini isteme hakkı</li>
                <li>İşleme faaliyetine itiraz etme hakkı</li>
                <li>Veri taşınabilirliği hakkı</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Veri Saklama</h2>
              <p className="leading-relaxed">
                Kişisel verileriniz, toplama amacının gerektirdiği süre boyunca ve yasal saklama 
                yükümlülükleri çerçevesinde saklanır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Değişiklikler</h2>
              <p className="leading-relaxed">
                Bu Gizlilik Politikası&apos;nı zaman zaman güncelleyebiliriz. Önemli değişiklikler 
                e-posta yoluyla bildirilecektir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. İletişim</h2>
              <p className="leading-relaxed">
                Gizlilik politikamız hakkında sorularınız için:<br />
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

export default Privacy

