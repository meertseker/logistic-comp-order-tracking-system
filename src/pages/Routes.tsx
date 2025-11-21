import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import TextArea from '../components/TextArea'
import Modal from '../components/Modal'
import { formatCurrency } from '../utils/formatters'
import { useToast } from '../context/ToastContext'

export default function Routes() {
  const { showToast } = useToast()
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    nereden: '',
    nereye: '',
    mesafeKm: '',
    hgsMaliyet: '',
    kopruMaliyet: '',
    sureSaat: '',
    notlar: '',
  })

  useEffect(() => {
    loadRoutes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadRoutes = async () => {
    try {
      setLoading(true)
      const data = await window.electronAPI.db.getRoutes()
      setRoutes(data)
    } catch (error) {
      console.error('Failed to load routes:', error)
      showToast('Güzergahlar yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    setEditingRoute(null)
    setFormData({
      nereden: '',
      nereye: '',
      mesafeKm: '',
      hgsMaliyet: '',
      kopruMaliyet: '',
      sureSaat: '',
      notlar: '',
    })
    setShowModal(true)
  }

  const handleEdit = (route: any) => {
    setEditingRoute(route)
    setFormData({
      nereden: route.nereden,
      nereye: route.nereye,
      mesafeKm: route.mesafe_km.toString(),
      hgsMaliyet: route.hgs_maliyet.toString(),
      kopruMaliyet: route.kopru_maliyet.toString(),
      sureSaat: route.sure_saat.toString(),
      notlar: route.notlar || '',
    })
    setShowModal(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.nereden.trim() || !formData.nereye.trim()) {
      showToast('Nereden ve Nereye alanları zorunludur', 'error')
      return
    }

    try {
      await window.electronAPI.db.saveRoute({
        nereden: formData.nereden.trim(),
        nereye: formData.nereye.trim(),
        mesafeKm: Number(formData.mesafeKm) || 0,
        hgsMaliyet: Number(formData.hgsMaliyet) || 0,
        kopruMaliyet: Number(formData.kopruMaliyet) || 0,
        sureSaat: Number(formData.sureSaat) || 0,
        notlar: formData.notlar.trim(),
      })
      
      showToast('✅ Güzergah kaydedildi!', 'success')
      setShowModal(false)
      loadRoutes()
    } catch (error) {
      console.error('Failed to save route:', error)
      showToast('Güzergah kaydedilemedi', 'error')
    }
  }

  const handleDelete = async (id: number, nereden: string, nereye: string) => {
    if (!confirm(`${nereden} → ${nereye} güzergahını silmek istediğinizden emin misiniz?`)) return
    
    try {
      await window.electronAPI.db.deleteRoute(id)
      showToast('✅ Güzergah silindi', 'success')
      loadRoutes()
    } catch (error) {
      console.error('Failed to delete route:', error)
      showToast('Güzergah silinemedi', 'error')
    }
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
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 69, 58, 0.15)' }}>
              <MapPin className="w-6 h-6" style={{ color: '#FF453A' }} />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
              Güzergah Yönetimi
            </h1>
          </div>
          <p className="text-lg ml-16" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            HGS/köprü maliyetlerini ve mesafe bilgilerini yönetin
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleNew}>
            <Plus className="w-5 h-5 mr-2" />
            Yeni Güzergah
          </Button>
        </motion.div>
      </motion.div>

      {/* Bilgilendirme */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Güzergahlar Nasıl Kullanılır?</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-1">
              <p>• Buraya eklenen güzergahlar sipariş oluştururken otomatik olarak kullanılır</p>
              <p>• HGS ve köprü maliyetleri gerçek fiyatlarla girilmelidir</p>
              <p>• Mesafe ve süre bilgileri de kaydedilir</p>
              <p>• Aynı güzergahın gidiş ve dönüşü ayrı ayrı eklenmelidir</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Routes Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        ) : routes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nereden</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nereye</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Mesafe (km)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">HGS (₺)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Köprü (₺)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Toplam (₺)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Süre (saat)</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{route.nereden}</td>
                    <td className="py-3 px-4 font-medium">{route.nereye}</td>
                    <td className="py-3 px-4 text-right">{route.mesafe_km}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(route.hgs_maliyet)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(route.kopru_maliyet)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary-600">
                      {formatCurrency(route.hgs_maliyet + route.kopru_maliyet)}
                    </td>
                    <td className="py-3 px-4 text-right">{route.sure_saat}h</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(route)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#0A84FF', backgroundColor: 'rgba(10, 132, 255, 0.1)' }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(route.id, route.nereden, route.nereye)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#FF453A', backgroundColor: 'rgba(255, 69, 58, 0.1)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Henüz güzergah eklenmemiş</p>
            <Button onClick={handleNew}>
              <Plus className="w-5 h-5 mr-2" />
              İlk Güzergahı Ekle
            </Button>
          </div>
        )}
      </Card>

      {/* Güzergah Özeti */}
      {routes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50">
            <div className="text-center">
              <p className="text-sm text-blue-800">Toplam Güzergah</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{routes.length}</p>
            </div>
          </Card>
          <Card className="bg-green-50">
            <div className="text-center">
              <p className="text-sm text-green-800">En Uzun Mesafe</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {Math.max(...routes.map(r => r.mesafe_km))} km
              </p>
            </div>
          </Card>
          <Card className="bg-orange-50">
            <div className="text-center">
              <p className="text-sm text-orange-800">Ort. HGS Maliyeti</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {formatCurrency(routes.reduce((sum, r) => sum + r.hgs_maliyet, 0) / routes.length)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRoute ? 'Güzergah Düzenle' : 'Yeni Güzergah Ekle'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nereden (Şehir)"
              name="nereden"
              value={formData.nereden}
              onChange={handleChange}
              placeholder="İstanbul"
              required
              disabled={!!editingRoute}
            />
            <Input
              label="Nereye (Şehir)"
              name="nereye"
              value={formData.nereye}
              onChange={handleChange}
              placeholder="Ankara"
              required
              disabled={!!editingRoute}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mesafe (km)"
              name="mesafeKm"
              type="number"
              value={formData.mesafeKm}
              onChange={handleChange}
              placeholder="450"
              required
            />
            <Input
              label="Tahmini Süre (saat)"
              name="sureSaat"
              type="number"
              step="0.5"
              value={formData.sureSaat}
              onChange={handleChange}
              placeholder="6"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="HGS Maliyeti (₺)"
              name="hgsMaliyet"
              type="number"
              step="0.01"
              value={formData.hgsMaliyet}
              onChange={handleChange}
              placeholder="450"
              required
            />
            <Input
              label="Köprü Maliyeti (₺)"
              name="kopruMaliyet"
              type="number"
              step="0.01"
              value={formData.kopruMaliyet}
              onChange={handleChange}
              placeholder="150"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Toplam Geçiş Ücreti:</strong> {formatCurrency((Number(formData.hgsMaliyet) || 0) + (Number(formData.kopruMaliyet) || 0))}
            </p>
          </div>

          <TextArea
            label="Notlar"
            name="notlar"
            value={formData.notlar}
            onChange={handleChange}
            placeholder="Ek bilgiler (opsiyonel)"
            rows={3}
          />
        </div>
      </Modal>
    </div>
  )
}

