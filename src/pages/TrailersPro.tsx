import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Container, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Truck,
  MapPin,
  Weight,
  Maximize2,
  PackagePlus,
  PackageMinus,
  Info
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import TextArea from '../components/TextArea'
import Modal from '../components/Modal'
import { formatCurrency } from '../utils/formatters'

const DORSE_TIPLERI = [
  { value: 'Kapalı', label: '🚛 Kapalı Kasa' },
  { value: 'Açık', label: '🚜 Açık Kasa' },
  { value: 'Soğutmalı', label: '❄️ Soğutmalı' },
  { value: 'Lowbed', label: '🏗️ Lowbed' },
]

const YUK_TIPLERI = [
  { value: 'Normal', label: '📦 Normal Kargo' },
  { value: 'Hassas', label: '⚠️ Hassas/Kırılır' },
  { value: 'Soğuk Zincir', label: '❄️ Soğuk Zincir' },
  { value: 'Ağır Yük', label: '🏗️ Ağır Yük' },
  { value: 'İstiflenemez', label: '⛔ İstiflenemez' },
]

export default function TrailersPro() {
  const [trailers, setTrailers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [editingTrailer, setEditingTrailer] = useState<any>(null)
  const [selectedTrailer, setSelectedTrailer] = useState<any>(null)
  const [loads, setLoads] = useState<any[]>([])
  const [capacityCheck, setCapacityCheck] = useState<any>(null)

  const [trailerForm, setTrailerForm] = useState({
    dorseNo: '',
    enCm: '',
    boyCm: '',
    yukseklikCm: '',
    maxAgirlikTon: '',
    tip: 'Kapalı',
    lokasyon: '',
    aracPlakasi: '',
    notlar: ''
  })

  const [loadForm, setLoadForm] = useState({
    musteriAdi: '',
    yukAciklamasi: '',
    enCm: '',
    boyCm: '',
    yukseklikCm: '',
    agirlikTon: '',
    yukTipi: 'Normal',
    bosaltmaNoktasi: '',
    notlar: ''
  })

  useEffect(() => {
    loadTrailers()
  }, [])

  const loadTrailers = async () => {
    try {
      setLoading(true)
      const data = await window.electronAPI.db.getTrailers()
      setTrailers(data)
    } catch (error) {
      console.error('Failed to load trailers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrailerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTrailerForm(prev => ({ ...prev, [name]: value }))
  }

  const handleLoadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setLoadForm(prev => ({ ...prev, [name]: value }))
    
    // Real-time kapasite kontrolü
    if (['enCm', 'boyCm', 'yukseklikCm', 'agirlikTon'].includes(name) && selectedTrailer) {
      const updatedForm = { ...loadForm, [name]: value }
      if (updatedForm.enCm && updatedForm.boyCm && updatedForm.yukseklikCm && updatedForm.agirlikTon) {
        checkCapacity(
          selectedTrailer.id,
          Number(updatedForm.enCm),
          Number(updatedForm.boyCm),
          Number(updatedForm.yukseklikCm),
          Number(updatedForm.agirlikTon)
        )
      }
    }
  }

  const checkCapacity = async (trailerId: number, enCm: number, boyCm: number, yukseklikCm: number, agirlikTon: number) => {
    try {
      const result = await window.electronAPI.db.checkTrailerCapacity(trailerId, enCm, boyCm, yukseklikCm, agirlikTon)
      setCapacityCheck(result)
    } catch (error) {
      console.error('Failed to check capacity:', error)
    }
  }

  const calculateHacim = (en: number, boy: number, yukseklik: number) => {
    return (en * boy * yukseklik) / 1000000 // cm³ to m³
  }

  const handleSaveTrailer = async () => {
    if (!trailerForm.dorseNo || !trailerForm.enCm || !trailerForm.boyCm || !trailerForm.yukseklikCm || !trailerForm.maxAgirlikTon) {
      alert('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    try {
      const data = {
        dorseNo: trailerForm.dorseNo,
        enCm: Number(trailerForm.enCm),
        boyCm: Number(trailerForm.boyCm),
        yukseklikCm: Number(trailerForm.yukseklikCm),
        maxAgirlikTon: Number(trailerForm.maxAgirlikTon),
        tip: trailerForm.tip,
        lokasyon: trailerForm.lokasyon,
        aracPlakasi: trailerForm.aracPlakasi,
        notlar: trailerForm.notlar
      }

      if (editingTrailer) {
        await window.electronAPI.db.updateTrailer(editingTrailer.id, data)
      } else {
        await window.electronAPI.db.createTrailer(data)
      }

      setShowTrailerModal(false)
      resetTrailerForm()
      loadTrailers()
    } catch (error) {
      console.error('Failed to save trailer:', error)
      alert('Dorse kaydedilemedi')
    }
  }

  const handleAddLoad = async () => {
    if (!loadForm.musteriAdi || !loadForm.enCm || !loadForm.boyCm || !loadForm.yukseklikCm) {
      alert('Lütfen müşteri adı ve yük boyutlarını girin')
      return
    }

    if (!capacityCheck?.fits) {
      if (!confirm('Bu yük dorsede yer kalmadığı için sığmayabilir. Yine de eklemek istiyor musunuz?')) {
        return
      }
    }

    try {
      await window.electronAPI.db.addTrailerLoad({
        trailerId: selectedTrailer.id,
        musteriAdi: loadForm.musteriAdi,
        yukAciklamasi: loadForm.yukAciklamasi,
        enCm: Number(loadForm.enCm),
        boyCm: Number(loadForm.boyCm),
        yukseklikCm: Number(loadForm.yukseklikCm),
        agirlikTon: Number(loadForm.agirlikTon) || 0,
        yukTipi: loadForm.yukTipi,
        bosaltmaNoktasi: loadForm.bosaltmaNoktasi,
        notlar: loadForm.notlar
      })

      setShowLoadModal(false)
      resetLoadForm()
      loadTrailers()
      loadTrailerLoads(selectedTrailer.id)
    } catch (error) {
      console.error('Failed to add load:', error)
      alert('Yük eklenemedi')
    }
  }

  const handleDeleteLoad = async (loadId: number) => {
    if (!confirm('Bu yükü silmek istediğinizden emin misiniz?')) return

    try {
      await window.electronAPI.db.deleteTrailerLoad(loadId)
      loadTrailers()
      if (selectedTrailer) {
        loadTrailerLoads(selectedTrailer.id)
      }
    } catch (error) {
      console.error('Failed to delete load:', error)
      alert('Yük silinemedi')
    }
  }

  const loadTrailerLoads = async (trailerId: number) => {
    try {
      const data = await window.electronAPI.db.getTrailerLoads(trailerId)
      setLoads(data)
    } catch (error) {
      console.error('Failed to load trailer loads:', error)
    }
  }

  const handleDeleteTrailer = async (id: number) => {
    if (!confirm('Bu dorseyi silmek istediğinizden emin misiniz?')) return

    try {
      await window.electronAPI.db.deleteTrailer(id)
      loadTrailers()
    } catch (error) {
      console.error('Failed to delete trailer:', error)
      alert('Dorse silinemedi')
    }
  }

  const openNewTrailerModal = () => {
    setEditingTrailer(null)
    resetTrailerForm()
    setShowTrailerModal(true)
  }

  const openEditTrailerModal = (trailer: any) => {
    setEditingTrailer(trailer)
    setTrailerForm({
      dorseNo: trailer.dorse_no,
      enCm: trailer.en_cm?.toString() || '',
      boyCm: trailer.boy_cm?.toString() || '',
      yukseklikCm: trailer.yukseklik_cm?.toString() || '',
      maxAgirlikTon: trailer.max_agirlik_ton?.toString() || '',
      tip: trailer.tip || 'Kapalı',
      lokasyon: trailer.lokasyon || '',
      aracPlakasi: trailer.arac_plakasi || '',
      notlar: trailer.notlar || ''
    })
    setShowTrailerModal(true)
  }

  const openLoadModal = async (trailer: any) => {
    setSelectedTrailer(trailer)
    await loadTrailerLoads(trailer.id)
    resetLoadForm()
    setCapacityCheck(null)
    setShowLoadModal(true)
  }

  const resetTrailerForm = () => {
    setTrailerForm({
      dorseNo: '',
      enCm: '',
      boyCm: '',
      yukseklikCm: '',
      maxAgirlikTon: '',
      tip: 'Kapalı',
      lokasyon: '',
      aracPlakasi: '',
      notlar: ''
    })
  }

  const resetLoadForm = () => {
    setLoadForm({
      musteriAdi: '',
      yukAciklamasi: '',
      enCm: '',
      boyCm: '',
      yukseklikCm: '',
      agirlikTon: '',
      yukTipi: 'Normal',
      bosaltmaNoktasi: '',
      notlar: ''
    })
    setCapacityCheck(null)
  }

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'Boş': return { bg: '#30D158', text: 'Boş - Yüklenebilir' }
      case 'Kısmi Dolu': return { bg: '#FFD60A', text: 'Kısmi Dolu' }
      case 'Dolu': return { bg: '#FF453A', text: 'Dolu - Kapasite' }
      default: return { bg: '#999', text: durum }
    }
  }

  const getDolulukYuzdesi = (trailer: any) => {
    if (!trailer.hacim_m3) return 0
    return Math.min(100, (trailer.mevcut_hacim_m3 / trailer.hacim_m3) * 100)
  }

  const getAgirlikYuzdesi = (trailer: any) => {
    if (!trailer.max_agirlik_ton) return 0
    return Math.min(100, (trailer.mevcut_agirlik_ton / trailer.max_agirlik_ton) * 100)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(191, 90, 242, 0.15)' }}>
              <Container className="w-6 h-6" style={{ color: '#BF5AF2' }} />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
              Dorse Yönetimi
            </h1>
          </div>
          <p className="text-lg ml-16" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Akıllı hacim ve yük takip sistemi
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={openNewTrailerModal}>
            <Plus className="w-5 h-5 mr-2" />
            Yeni Dorse
          </Button>
        </motion.div>
      </motion.div>

      {/* Bilgilendirme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-4"
        style={{ background: 'rgba(10, 132, 255, 0.08)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#0A84FF' }} />
          <div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: '#0A84FF' }}>Akıllı Dorse Sistemi</h3>
            <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              ✅ Dorse boyutlarını girin (cm) - sistem otomatik m³ hesaplar | 
              ✅ Müşteri yük boyutlarını girin - sığar/sığmaz kontrolü yapar | 
              ✅ Doluluk oranı ve kalan alan gerçek zamanlı görünür
            </p>
          </div>
        </div>
      </motion.div>

      {/* İstatistikler */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="glass-card rounded-xl p-6"
          style={{ background: 'rgba(191, 90, 242, 0.12)', border: '0.5px solid rgba(191, 90, 242, 0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Container className="w-4 h-4" style={{ color: '#BF5AF2' }} />
            <p className="text-xs font-medium uppercase" style={{ color: '#BF5AF2' }}>Toplam Dorse</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>{trailers.length}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="glass-card rounded-xl p-6"
          style={{ background: 'rgba(48, 209, 88, 0.12)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4" style={{ color: '#30D158' }} />
            <p className="text-xs font-medium uppercase" style={{ color: '#30D158' }}>Boş</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
            {trailers.filter(t => t.durum === 'Boş').length}
          </p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="glass-card rounded-xl p-6"
          style={{ background: 'rgba(255, 214, 10, 0.12)', border: '0.5px solid rgba(255, 214, 10, 0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#FFD60A' }} />
            <p className="text-xs font-medium uppercase" style={{ color: '#FFD60A' }}>Kısmi Dolu</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
            {trailers.filter(t => t.durum === 'Kısmi Dolu').length}
          </p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -4 }} className="glass-card rounded-xl p-6"
          style={{ background: 'rgba(255, 69, 58, 0.12)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4" style={{ color: '#FF453A' }} />
            <p className="text-xs font-medium uppercase" style={{ color: '#FF453A' }}>Dolu</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
            {trailers.filter(t => t.durum === 'Dolu').length}
          </p>
        </motion.div>
      </motion.div>

      {/* Dorse Kartları */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#BF5AF2' }}></div>
          <p className="mt-4" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yükleniyor...</p>
        </div>
      ) : trailers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trailers.map((trailer, index) => {
            const durumInfo = getDurumColor(trailer.durum)
            const dolulukYuzde = getDolulukYuzdesi(trailer)
            const agirlikYuzde = getAgirlikYuzdesi(trailer)
            
            return (
              <motion.div
                key={trailer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-2xl transition-all relative overflow-hidden">
                  {/* Durum Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${durumInfo.bg}33`, color: durumInfo.bg, border: `1px solid ${durumInfo.bg}` }}>
                    {durumInfo.text}
                  </div>

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3 pr-24">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: `${durumInfo.bg}22` }}>
                        <Container className="w-6 h-6" style={{ color: durumInfo.bg }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold truncate" style={{ color: '#FFFFFF' }}>
                          {trailer.dorse_no}
                        </h3>
                        <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                          {DORSE_TIPLERI.find(t => t.value === trailer.tip)?.label || trailer.tip}
                        </p>
                      </div>
                    </div>

                    {/* Boyutlar */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(99, 99, 102, 0.1)' }}>
                      <div className="text-center">
                        <p className="text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>En</p>
                        <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{trailer.en_cm} cm</p>
                      </div>
                      <div className="text-center border-x" style={{ borderColor: 'rgba(99, 99, 102, 0.3)' }}>
                        <p className="text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Boy</p>
                        <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{trailer.boy_cm} cm</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yükseklik</p>
                        <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{trailer.yukseklik_cm} cm</p>
                      </div>
                    </div>

                    {/* Hacim Doluluk */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Maximize2 className="w-4 h-4" style={{ color: '#0A84FF' }} />
                          <span className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                            Hacim Doluluk
                          </span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#0A84FF' }}>
                          %{dolulukYuzde.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(99, 99, 102, 0.2)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dolulukYuzde}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{
                            background: dolulukYuzde >= 90 ? 'linear-gradient(90deg, #FF453A 0%, #FF6B58 100%)' :
                                      dolulukYuzde >= 70 ? 'linear-gradient(90deg, #FFD60A 0%, #FFE040 100%)' :
                                      'linear-gradient(90deg, #30D158 0%, #40E068 100%)'
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                        <span>{trailer.mevcut_hacim_m3?.toFixed(2) || 0} m³</span>
                        <span>{trailer.hacim_m3?.toFixed(2) || 0} m³</span>
                      </div>
                    </div>

                    {/* Ağırlık Doluluk */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Weight className="w-4 h-4" style={{ color: '#BF5AF2' }} />
                          <span className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                            Ağırlık Doluluk
                          </span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#BF5AF2' }}>
                          %{agirlikYuzde.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(99, 99, 102, 0.2)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${agirlikYuzde}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                          className="h-full rounded-full"
                          style={{
                            background: agirlikYuzde >= 90 ? 'linear-gradient(90deg, #FF453A 0%, #FF6B58 100%)' :
                                      agirlikYuzde >= 70 ? 'linear-gradient(90deg, #FFD60A 0%, #FFE040 100%)' :
                                      'linear-gradient(90deg, #BF5AF2 0%, #CF6FFF 100%)'
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                        <span>{trailer.mevcut_agirlik_ton?.toFixed(2) || 0} ton</span>
                        <span>{trailer.max_agirlik_ton?.toFixed(2) || 0} ton</span>
                      </div>
                    </div>

                    {/* Lokasyon & Araç */}
                    {(trailer.lokasyon || trailer.arac_plakasi) && (
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.08)' }}>
                        {trailer.lokasyon && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" style={{ color: '#0A84FF' }} />
                            <div>
                              <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Lokasyon</p>
                              <p className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>{trailer.lokasyon}</p>
                            </div>
                          </div>
                        )}
                        {trailer.arac_plakasi && (
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" style={{ color: '#0A84FF' }} />
                            <div>
                              <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Araç</p>
                              <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{trailer.arac_plakasi}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Aksiyon Butonları */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openLoadModal(trailer)}
                        className="py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', color: '#30D158' }}
                      >
                        <PackagePlus className="w-4 h-4" />
                        Yük Ekle
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditTrailerModal(trailer)}
                        className="py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF' }}
                      >
                        <Edit className="w-4 h-4" />
                        Düzenle
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteTrailer(trailer.id)}
                        className="py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'rgba(255, 69, 58, 0.15)', color: '#FF453A' }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Sil
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="text-center py-16">
            <Container className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(235, 235, 245, 0.4)' }} />
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Henüz Dorse Yok</h3>
            <p className="text-lg mb-6" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>İlk dorsenizi ekleyerek başlayın</p>
            <Button onClick={openNewTrailerModal}>
              <Plus className="w-5 h-5 mr-2" />
              Yeni Dorse Ekle
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Dorse Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        title={editingTrailer ? `Dorse Düzenle: ${editingTrailer.dorse_no}` : 'Yeni Dorse Ekle'}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowTrailerModal(false)}>İptal</Button>
            <Button onClick={handleSaveTrailer}>
              {editingTrailer ? 'Güncelle' : 'Kaydet'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Dorse No *"
            name="dorseNo"
            value={trailerForm.dorseNo}
            onChange={handleTrailerChange}
            placeholder="34-ABC-123"
            required
          />

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.08)' }}>
            <h4 className="font-semibold mb-3" style={{ color: '#0A84FF' }}>📐 Dorse Boyutları (cm)</h4>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="En (cm) *"
                name="enCm"
                type="number"
                value={trailerForm.enCm}
                onChange={handleTrailerChange}
                placeholder="240"
                required
              />
              <Input
                label="Boy (cm) *"
                name="boyCm"
                type="number"
                value={trailerForm.boyCm}
                onChange={handleTrailerChange}
                placeholder="1360"
                required
              />
              <Input
                label="Yükseklik (cm) *"
                name="yukseklikCm"
                type="number"
                value={trailerForm.yukseklikCm}
                onChange={handleTrailerChange}
                placeholder="270"
                required
              />
            </div>
            {trailerForm.enCm && trailerForm.boyCm && trailerForm.yukseklikCm && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(48, 209, 88, 0.1)' }}>
                <p className="text-sm font-bold" style={{ color: '#30D158' }}>
                  💡 Toplam Hacim: {calculateHacim(Number(trailerForm.enCm), Number(trailerForm.boyCm), Number(trailerForm.yukseklikCm)).toFixed(2)} m³
                </p>
              </div>
            )}
          </div>

          <Input
            label="Maksimum Ağırlık (ton) *"
            name="maxAgirlikTon"
            type="number"
            step="0.1"
            value={trailerForm.maxAgirlikTon}
            onChange={handleTrailerChange}
            placeholder="24"
            required
          />

          <Select
            label="Dorse Tipi"
            name="tip"
            value={trailerForm.tip}
            onChange={handleTrailerChange}
            options={DORSE_TIPLERI}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Lokasyon"
              name="lokasyon"
              value={trailerForm.lokasyon}
              onChange={handleTrailerChange}
              placeholder="İstanbul Depo"
            />
            <Input
              label="Araç Plakası"
              name="aracPlakasi"
              value={trailerForm.aracPlakasi}
              onChange={handleTrailerChange}
              placeholder="34 XYZ 789"
            />
          </div>

          <TextArea
            label="Notlar"
            name="notlar"
            value={trailerForm.notlar}
            onChange={handleTrailerChange}
            placeholder="Ek bilgiler..."
            rows={3}
          />
        </div>
      </Modal>

      {/* Yük Ekleme Modal */}
      <Modal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        title={`Yük Ekle: ${selectedTrailer?.dorse_no}`}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowLoadModal(false)}>İptal</Button>
            <Button onClick={handleAddLoad} disabled={capacityCheck && !capacityCheck.fits}>
              {capacityCheck?.fits === false ? '⚠️ Yine de Ekle' : '✅ Yükü Ekle'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Dorse Bilgisi */}
          {selectedTrailer && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(191, 90, 242, 0.08)', border: '1px solid rgba(191, 90, 242, 0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold" style={{ color: '#BF5AF2' }}>Dorse Durumu</h4>
                <span className="text-sm font-bold" style={{ color: getDurumColor(selectedTrailer.durum).bg }}>
                  {getDurumColor(selectedTrailer.durum).text}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Toplam Hacim</p>
                  <p className="font-bold" style={{ color: '#FFFFFF' }}>{selectedTrailer.hacim_m3?.toFixed(2)} m³</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Kalan Hacim</p>
                  <p className="font-bold" style={{ color: '#30D158' }}>
                    {(selectedTrailer.hacim_m3 - selectedTrailer.mevcut_hacim_m3).toFixed(2)} m³
                  </p>
                </div>
                <div>
                  <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Max Ağırlık</p>
                  <p className="font-bold" style={{ color: '#FFFFFF' }}>{selectedTrailer.max_agirlik_ton?.toFixed(2)} ton</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Kalan Ağırlık</p>
                  <p className="font-bold" style={{ color: '#30D158' }}>
                    {(selectedTrailer.max_agirlik_ton - selectedTrailer.mevcut_agirlik_ton).toFixed(2)} ton
                  </p>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Müşteri Adı *"
            name="musteriAdi"
            value={loadForm.musteriAdi}
            onChange={handleLoadChange}
            placeholder="ABC Lojistik"
            required
          />

          <Input
            label="Yük Açıklaması"
            name="yukAciklamasi"
            value={loadForm.yukAciklamasi}
            onChange={handleLoadChange}
            placeholder="10 adet palet, elektronik malzeme"
          />

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.08)' }}>
            <h4 className="font-semibold mb-3" style={{ color: '#FF9F0A' }}>📦 Yük Boyutları (cm)</h4>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="En (cm) *"
                name="enCm"
                type="number"
                value={loadForm.enCm}
                onChange={handleLoadChange}
                placeholder="120"
                required
              />
              <Input
                label="Boy (cm) *"
                name="boyCm"
                type="number"
                value={loadForm.boyCm}
                onChange={handleLoadChange}
                placeholder="80"
                required
              />
              <Input
                label="Yükseklik (cm) *"
                name="yukseklikCm"
                type="number"
                value={loadForm.yukseklikCm}
                onChange={handleLoadChange}
                placeholder="100"
                required
              />
            </div>
            {loadForm.enCm && loadForm.boyCm && loadForm.yukseklikCm && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.15)' }}>
                <p className="text-sm font-bold" style={{ color: '#FF9F0A' }}>
                  💡 Yük Hacmi: {calculateHacim(Number(loadForm.enCm), Number(loadForm.boyCm), Number(loadForm.yukseklikCm)).toFixed(2)} m³
                </p>
              </div>
            )}
          </div>

          <Input
            label="Ağırlık (ton)"
            name="agirlikTon"
            type="number"
            step="0.01"
            value={loadForm.agirlikTon}
            onChange={handleLoadChange}
            placeholder="1.5"
          />

          {/* Kapasite Kontrolü */}
          {capacityCheck && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: capacityCheck.fits ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 69, 58, 0.1)',
                  border: `1px solid ${capacityCheck.fits ? '#30D158' : '#FF453A'}`
                }}
              >
                <div className="flex items-start gap-3">
                  {capacityCheck.fits ? (
                    <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: '#30D158' }} />
                  ) : (
                    <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: '#FF453A' }} />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold mb-2" style={{ color: capacityCheck.fits ? '#30D158' : '#FF453A' }}>
                      {capacityCheck.fits ? '✅ Yük Sığar!' : '⚠️ Yük Sığmaz!'}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p style={{ color: 'rgba(235, 235, 245, 0.8)' }}>
                        {capacityCheck.hacimSigar ? '✅' : '❌'} Hacim: Bu yük eklenirse doluluk %{capacityCheck.yuzdeHacimKullanim.toFixed(1)} olacak
                      </p>
                      <p style={{ color: 'rgba(235, 235, 245, 0.8)' }}>
                        {capacityCheck.agirlikSigar ? '✅' : '❌'} Ağırlık: Bu yük eklenirse doluluk %{capacityCheck.yuzdeAgirlikKullanim.toFixed(1)} olacak
                      </p>
                      <p className="font-semibold mt-2" style={{ color: 'rgba(235, 235, 245, 0.9)' }}>
                        📊 Kalan: {capacityCheck.kalanHacim.toFixed(2)} m³ • {capacityCheck.kalanAgirlik.toFixed(2)} ton
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <Select
            label="Yük Tipi"
            name="yukTipi"
            value={loadForm.yukTipi}
            onChange={handleLoadChange}
            options={YUK_TIPLERI}
          />

          <Input
            label="Boşaltma Noktası"
            name="bosaltmaNoktasi"
            value={loadForm.bosaltmaNoktasi}
            onChange={handleLoadChange}
            placeholder="Ankara - XYZ Depo"
          />

          <TextArea
            label="Notlar"
            name="notlar"
            value={loadForm.notlar}
            onChange={handleLoadChange}
            placeholder="Özel talimatlar..."
            rows={2}
          />

          {/* Dorsedeki Mevcut Yükler */}
          {loads.length > 0 && (
            <div className="pt-4 border-t" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }}>
              <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                <Package className="w-5 h-5" />
                Dorsedeki Mevcut Yükler ({loads.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loads.map((load) => (
                  <div key={load.id} className="p-3 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: 'rgba(99, 99, 102, 0.1)' }}>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>{load.musteri_adi}</p>
                      <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                        {load.en_cm}×{load.boy_cm}×{load.yukseklik_cm} cm • {load.hacim_m3?.toFixed(2)} m³ • {load.agirlik_ton} ton
                      </p>
                      {load.bosaltma_noktasi && (
                        <p className="text-xs mt-1" style={{ color: '#0A84FF' }}>📍 {load.bosaltma_noktasi}</p>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteLoad(load.id)}
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: 'rgba(255, 69, 58, 0.15)', color: '#FF453A' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

