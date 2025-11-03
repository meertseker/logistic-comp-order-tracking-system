import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Package, MapPin, AlertCircle } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import TextArea from '../components/TextArea'
import Modal from '../components/Modal'
import { formatDate } from '../utils/formatters'
import { useToast } from '../context/ToastContext'

const DURUM_OPTIONS = [
  { value: 'Boş', label: 'Boş' },
  { value: 'Yarı Dolu', label: 'Yarı Dolu' },
  { value: 'Dolu', label: 'Dolu' },
  { value: 'Bakımda', label: 'Bakımda' },
]

const KAPASITE_BIRIMI_OPTIONS = [
  { value: 'ton', label: 'Ton' },
  { value: 'm³', label: 'm³' },
  { value: 'palet', label: 'Palet' },
]

interface Trailer {
  id: number
  dorse_no: string
  musteri_adi: string
  kapasite: number
  kapasite_birimi: string
  mevcut_yuk: number
  lokasyon: string
  durum: string
  notlar: string
  created_at: string
  updated_at: string
}

export default function Trailers() {
  const { showToast } = useToast()
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTrailer, setEditingTrailer] = useState<Trailer | null>(null)
  
  const [formData, setFormData] = useState({
    dorseNo: '',
    musteriAdi: '',
    kapasite: '',
    kapasiteBirimi: 'ton',
    mevcutYuk: '',
    lokasyon: '',
    durum: 'Boş',
    notlar: '',
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
      showToast('Dorseler yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (trailer?: Trailer) => {
    if (trailer) {
      setEditingTrailer(trailer)
      setFormData({
        dorseNo: trailer.dorse_no,
        musteriAdi: trailer.musteri_adi,
        kapasite: trailer.kapasite.toString(),
        kapasiteBirimi: trailer.kapasite_birimi,
        mevcutYuk: trailer.mevcut_yuk.toString(),
        lokasyon: trailer.lokasyon || '',
        durum: trailer.durum,
        notlar: trailer.notlar || '',
      })
    } else {
      setEditingTrailer(null)
      setFormData({
        dorseNo: '',
        musteriAdi: '',
        kapasite: '',
        kapasiteBirimi: 'ton',
        mevcutYuk: '',
        lokasyon: '',
        durum: 'Boş',
        notlar: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTrailer(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.dorseNo || !formData.musteriAdi) {
      showToast('Dorse No ve Müşteri Adı zorunludur', 'error')
      return
    }

    try {
      if (editingTrailer) {
        await window.electronAPI.db.updateTrailer(editingTrailer.id, {
          dorseNo: formData.dorseNo,
          musteriAdi: formData.musteriAdi,
          kapasite: Number(formData.kapasite) || 0,
          kapasiteBirimi: formData.kapasiteBirimi,
          mevcutYuk: Number(formData.mevcutYuk) || 0,
          lokasyon: formData.lokasyon,
          durum: formData.durum,
          notlar: formData.notlar,
        })
        showToast('✅ Dorse güncellendi!', 'success')
      } else {
        await window.electronAPI.db.createTrailer({
          dorseNo: formData.dorseNo,
          musteriAdi: formData.musteriAdi,
          kapasite: Number(formData.kapasite) || 0,
          kapasiteBirimi: formData.kapasiteBirimi,
          mevcutYuk: Number(formData.mevcutYuk) || 0,
          lokasyon: formData.lokasyon,
          durum: formData.durum,
          notlar: formData.notlar,
        })
        showToast('✅ Dorse eklendi!', 'success')
      }
      
      handleCloseModal()
      loadTrailers()
    } catch (error) {
      console.error('Failed to save trailer:', error)
      showToast('Dorse kaydedilemedi', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu dorseyi silmek istediğinizden emin misiniz?')) return

    try {
      await window.electronAPI.db.deleteTrailer(id)
      showToast('✅ Dorse silindi', 'success')
      loadTrailers()
    } catch (error) {
      console.error('Failed to delete trailer:', error)
      showToast('Dorse silinemedi', 'error')
    }
  }

  const getDurumColor = (durum: string) => {
    const colors: Record<string, string> = {
      'Boş': 'rgba(48, 209, 88, 0.2)',
      'Yarı Dolu': 'rgba(255, 214, 10, 0.2)',
      'Dolu': 'rgba(255, 69, 58, 0.2)',
      'Bakımda': 'rgba(10, 132, 255, 0.2)',
    }
    return colors[durum] || 'rgba(235, 235, 245, 0.2)'
  }

  const getDurumTextColor = (durum: string) => {
    const colors: Record<string, string> = {
      'Boş': '#30D158',
      'Yarı Dolu': '#FFD60A',
      'Dolu': '#FF453A',
      'Bakımda': '#0A84FF',
    }
    return colors[durum] || 'rgba(235, 235, 245, 0.6)'
  }

  const getYukYuzdesi = (mevcut: number, kapasite: number) => {
    if (kapasite === 0) return 0
    return Math.min((mevcut / kapasite) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 text-lg font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Dorseler yükleniyor...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
            Dorseler
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Müşteri dorselerini yönetin ve yük durumunu takip edin
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 mr-2" />
            Yeni Dorse Ekle
          </Button>
        </motion.div>
      </motion.div>

      {/* Dorseler Grid */}
      {trailers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trailers.map((trailer, index) => {
            const yukYuzdesi = getYukYuzdesi(trailer.mevcut_yuk, trailer.kapasite)
            
            return (
              <motion.div
                key={trailer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: getDurumTextColor(trailer.durum) }} />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: getDurumColor(trailer.durum) }}>
                        <Package className="w-6 h-6" style={{ color: getDurumTextColor(trailer.durum) }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                          {trailer.dorse_no}
                        </h3>
                        <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                          {trailer.musteri_adi}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 text-xs rounded-full font-semibold"
                      style={{
                        backgroundColor: getDurumColor(trailer.durum),
                        color: getDurumTextColor(trailer.durum),
                      }}
                    >
                      {trailer.durum}
                    </span>
                  </div>

                  {/* Kapasite */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                        Yük Durumu
                      </span>
                      <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                        {trailer.mevcut_yuk} / {trailer.kapasite} {trailer.kapasite_birimi}
                      </span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(235, 235, 245, 0.1)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${yukYuzdesi}%`,
                          backgroundColor: getDurumTextColor(trailer.durum),
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-right" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                      %{yukYuzdesi.toFixed(0)} dolu
                    </p>
                  </div>

                  {/* Lokasyon */}
                  {trailer.lokasyon && (
                    <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                      <MapPin className="w-4 h-4" style={{ color: '#0A84FF' }} />
                      <p className="text-sm" style={{ color: '#0A84FF' }}>
                        {trailer.lokasyon}
                      </p>
                    </div>
                  )}

                  {/* Notlar */}
                  {trailer.notlar && (
                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(235, 235, 245, 0.05)' }}>
                      <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.7)' }}>
                        {trailer.notlar}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: '0.5px solid rgba(84, 84, 88, 0.35)' }}>
                    <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                      {formatDate(trailer.created_at)}
                    </p>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal(trailer)}
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF' }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(trailer.id)}
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(255, 69, 58, 0.15)', color: '#FF453A' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Package className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
          <p className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>
            Henüz dorse eklenmemiş
          </p>
          <p className="mb-6" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            İlk dorseyi eklemek için yukarıdaki butona tıklayın
          </p>
        </motion.div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTrailer ? 'Dorse Düzenle' : 'Yeni Dorse Ekle'}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {editingTrailer ? 'Güncelle' : 'Ekle'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dorse No *"
              value={formData.dorseNo}
              onChange={(e) => setFormData({ ...formData, dorseNo: e.target.value })}
              placeholder="Örn: D-001"
              required
            />
            <Input
              label="Müşteri Adı *"
              value={formData.musteriAdi}
              onChange={(e) => setFormData({ ...formData, musteriAdi: e.target.value })}
              placeholder="Müşteri adı"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Kapasite"
              type="number"
              step="0.01"
              value={formData.kapasite}
              onChange={(e) => setFormData({ ...formData, kapasite: e.target.value })}
              placeholder="0"
            />
            <Select
              label="Birim"
              options={KAPASITE_BIRIMI_OPTIONS}
              value={formData.kapasiteBirimi}
              onChange={(e) => setFormData({ ...formData, kapasiteBirimi: e.target.value })}
            />
            <Input
              label="Mevcut Yük"
              type="number"
              step="0.01"
              value={formData.mevcutYuk}
              onChange={(e) => setFormData({ ...formData, mevcutYuk: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Lokasyon"
              value={formData.lokasyon}
              onChange={(e) => setFormData({ ...formData, lokasyon: e.target.value })}
              placeholder="Örn: İstanbul Depo"
            />
            <Select
              label="Durum"
              options={DURUM_OPTIONS}
              value={formData.durum}
              onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
            />
          </div>

          <TextArea
            label="Notlar"
            value={formData.notlar}
            onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
            placeholder="Ek notlar..."
            rows={3}
          />
        </form>
      </Modal>
    </div>
  )
}

