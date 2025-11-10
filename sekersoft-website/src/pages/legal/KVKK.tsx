import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

const KVKK = () => {
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
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">KVKK Aydınlatma Metni</h1>
              <p className="text-gray-400 text-sm mt-1">Kişisel Verilerin Korunması Kanunu</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Veri Sorumlusu</h2>
              <p className="leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; 
                veri sorumlusu olarak Sekersoft Yazılım A.Ş. tarafından aşağıda açıklanan kapsamda 
                işlenebilecektir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. İşlenen Kişisel Veriler</h2>
              <p className="leading-relaxed mb-3">Aşağıdaki kişisel verileriniz işlenebilmektedir:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kimlik Bilgileri (ad, soyad, TC kimlik no)</li>
                <li>İletişim Bilgileri (adres, telefon, e-posta)</li>
                <li>Müşteri İşlem Bilgileri</li>
                <li>Finansal Bilgiler</li>
                <li>İşlem Güvenliği Bilgileri</li>
                <li>Pazarlama Bilgileri</li>
                <li>Görsel ve İşitsel Kayıtlar</li>
                <li>Mesleki Deneyim Bilgileri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. İşleme Amaçları</h2>
              <p className="leading-relaxed mb-3">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sözleşme gereklerinin yerine getirilmesi</li>
                <li>Hizmet kalitesinin artırılması</li>
                <li>Müşteri memnuniyetinin sağlanması</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Müşteri ilişkileri yönetimi</li>
                <li>Finans ve muhasebe işlemlerinin yürütülmesi</li>
                <li>İletişim faaliyetlerinin yürütülmesi</li>
                <li>Güvenlik ve denetim faaliyetleri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. İşleme Hukuki Sebepleri</h2>
              <p className="leading-relaxed mb-3">Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması</li>
                <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması</li>
                <li>Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması</li>
                <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması</li>
              </ul>
              <p className="leading-relaxed mt-3">
                hukuki sebeplerine dayanılarak işlenmektedir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Kişisel Verilerin Aktarımı</h2>
              <p className="leading-relaxed">
                Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda, 
                iş ortaklarımıza, tedarikçilerimize, hissedarlarımıza, kanunen yetkili kamu kurumları 
                ve özel kişilere KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak aktarılabilecektir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Veri Toplama Yöntemi</h2>
              <p className="leading-relaxed">
                Kişisel verileriniz, web sitesi, mobil uygulama, e-posta, telefon, fiziksel formlar 
                ve benzeri kanallar aracılığıyla sözlü, yazılı veya elektronik ortamda toplanmaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. İlgili Kişi Hakları</h2>
              <p className="leading-relaxed mb-3">KVKK'nın 11. maddesi uyarınca sahip olduğunuz haklar:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme</li>
                <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme ve yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>Münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Başvuru Hakkı</h2>
              <p className="leading-relaxed">
                Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici gerekli bilgiler 
                ve kullanmak istediğiniz hakkınıza yönelik açıklamalarınız ile birlikte talebinizi;<br /><br />
                <strong>E-posta:</strong> kvkk@sekersoft.com<br />
                <strong>Posta:</strong> Maslak Mahallesi, Büyükdere Caddesi No:123, Sarıyer/İstanbul<br /><br />
                adreslerine iletebilirsiniz. Başvurularınız en geç 30 gün içinde ücretsiz olarak 
                sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi halinde, Kişisel Verileri 
                Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Veri Güvenliği</h2>
              <p className="leading-relaxed">
                Kişisel verilerinizin güvenliğini sağlamak amacıyla teknik ve idari tedbirler alınmaktadır. 
                Verileriniz, yetkisiz erişime karşı korunmakta ve güvenli sunucularda saklanmaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. İletişim</h2>
              <p className="leading-relaxed">
                KVKK kapsamındaki sorularınız için:<br />
                E-posta: kvkk@sekersoft.com<br />
                Telefon: +90 (212) 123 45 67
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default KVKK

