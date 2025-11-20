import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-12 space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">Hata 404</p>
        <h1 className="text-4xl md:text-5xl font-bold">Sayfa bulunamadı</h1>
        <p className="text-gray-400 text-lg">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir. Ana sayfaya dönerek tekrar deneyebilirsiniz.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Ana Sayfaya Dön
          </Link>
          <Link to="/contact" className="px-6 py-3 rounded-xl glass glass-hover font-semibold hover:scale-105 transition-all inline-flex items-center justify-center gap-2">
            Destek ekibine ulaş
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound

