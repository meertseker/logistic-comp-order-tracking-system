import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, Plus, Edit, Settings } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import { formatCurrency } from '../utils/formatters'

export default function VehiclesProfessional() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    plaka: '',
    // Yakıt
    yakitTuketimi: '25',
    yakitFiyati: '40',
    // Sürücü
    gunlukUcret: '1600',
    gunlukOrtKm: '500',
    yemekGunluk: '150',
    // Bakım
    yagMaliyet: '500',
    yagAralik: '5000',
    lastikMaliyet: '8000',
    lastikOmur: '50000',
    buyukBakimMaliyet: '3000',
    buyukBakimAralik: '15000',
    ufakOnarimAylik: '200',
    // Sabit Giderler (Yıllık)
    sigortaYillik: '12000',
    mtvYillik: '5000',
    muayeneYillik: '1500',
    // Fiyatlandırma
    karOrani: '0.45',
    kdv: '0.20',
    // Opsiyonel (amortisman için)
    aracDegeri: '2300000',
    amortiSureYil: '2',
    hedefToplamKm: '72000',
  })

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const data = await window.electronAPI.db.getVehicles()
      setVehicles(data)
    } catch (error) {
      console.error('Failed to load vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setFormData({
      plaka: vehicle.plaka,
      yakitTuketimi: (vehicle.yakit_tuketimi || 25).toString(),
      yakitFiyati: (vehicle.yakit_fiyati || 40).toString(),
      gunlukUcret: (vehicle.gunluk_ucret || 1600).toString(),
      gunlukOrtKm: (vehicle.gunluk_ort_km || 500).toString(),
      yemekGunluk: (vehicle.yemek_gunluk || 150).toString(),
      yagMaliyet: (vehicle.yag_maliyet || 500).toString(),
      yagAralik: (vehicle.yag_aralik || 5000).toString(),
      lastikMaliyet: (vehicle.lastik_maliyet || 8000).toString(),
      lastikOmur: (vehicle.lastik_omur || 50000).toString(),
      buyukBakimMaliyet: (vehicle.buyuk_bakim_maliyet || 3000).toString(),
      buyukBakimAralik: (vehicle.buyuk_bakim_aralik || 15000).toString(),
      ufakOnarimAylik: (vehicle.ufak_onarim_aylik || 200).toString(),
      sigortaYillik: (vehicle.sigorta_yillik || 12000).toString(),
      mtvYillik: (vehicle.mtv_yillik || 5000).toString(),
      muayeneYillik: (vehicle.muayene_yillik || 1500).toString(),
      karOrani: (vehicle.kar_orani || 0.45).toString(),
      kdv: (vehicle.kdv || 0.20).toString(),
      aracDegeri: (vehicle.arac_degeri || 2300000).toString(),
      amortiSureYil: (vehicle.amorti_sure_yil || 2).toString(),
      hedefToplamKm: (vehicle.hedef_toplam_km || 72000).toString(),
    })
    setShowModal(true)
  }

  const handleNew = () => {
    setEditingVehicle(null)
    setFormData({
      plaka: '',
      yakitTuketimi: '25',
      yakitFiyati: '40',
      gunlukUcret: '1600',
      gunlukOrtKm: '500',
      yemekGunluk: '150',
      yagMaliyet: '500',
      yagAralik: '5000',
      lastikMaliyet: '8000',
      lastikOmur: '50000',
      buyukBakimMaliyet: '3000',
      buyukBakimAralik: '15000',
      ufakOnarimAylik: '200',
      sigortaYillik: '12000',
      mtvYillik: '5000',
      muayeneYillik: '1500',
      karOrani: '0.45',
      kdv: '0.20',
      aracDegeri: '2300000',
      amortiSureYil: '2',
      hedefToplamKm: '72000',
    })
    setShowModal(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.plaka.trim()) {
      alert('Plaka zorunludur')
      return
    }

    try {
      await window.electronAPI.db.saveVehicle({
        plaka: formData.plaka.trim(),
        yakitTuketimi: Number(formData.yakitTuketimi),
        yakitFiyati: Number(formData.yakitFiyati),
        gunlukUcret: Number(formData.gunlukUcret),
        gunlukOrtKm: Number(formData.gunlukOrtKm),
        yemekGunluk: Number(formData.yemekGunluk),
        yagMaliyet: Number(formData.yagMaliyet),
        yagAralik: Number(formData.yagAralik),
        lastikMaliyet: Number(formData.lastikMaliyet),
        lastikOmur: Number(formData.lastikOmur),
        buyukBakimMaliyet: Number(formData.buyukBakimMaliyet),
        buyukBakimAralik: Number(formData.buyukBakimAralik),
        ufakOnarimAylik: Number(formData.ufakOnarimAylik),
        sigortaYillik: Number(formData.sigortaYillik),
        mtvYillik: Number(formData.mtvYillik),
        muayeneYillik: Number(formData.muayeneYillik),
        karOrani: Number(formData.karOrani),
        kdv: Number(formData.kdv),
        aracDegeri: Number(formData.aracDegeri),
        amortiSureYil: Number(formData.amortiSureYil),
        hedefToplamKm: Number(formData.hedefToplamKm),
      })
      
      setShowModal(false)
      loadVehicles()
    } catch (error) {
      console.error('Failed to save vehicle:', error)
      alert('Araç kaydedilemedi')
    }
  }

  const calculateCostPerKm = (vehicle: any) => {
    const yakitPerKm = ((vehicle.yakit_tuketimi || 25) * (vehicle.yakit_fiyati || 40)) / 100
    const surucuPerKm = (vehicle.gunluk_ucret || 1600) / (vehicle.gunluk_ort_km || 500)
    const yemekPerKm = (vehicle.yemek_gunluk || 150) / (vehicle.gunluk_ort_km || 500)
    const bakimPerKm = (
      (vehicle.yag_maliyet || 500) / (vehicle.yag_aralik || 5000) +
      (vehicle.lastik_maliyet || 8000) / (vehicle.lastik_omur || 50000) +
      (vehicle.buyuk_bakim_maliyet || 3000) / (vehicle.buyuk_bakim_aralik || 15000)
    )
    // Sabit giderler (yıllık, km bazlı dönüşüm - ortalama 120000 km/yıl varsayımı)
    const yillikKm = vehicle.hedef_toplam_km || 120000
    const sigortaPerKm = (vehicle.sigorta_yillik || 12000) / yillikKm
    const mtvPerKm = (vehicle.mtv_yillik || 5000) / yillikKm
    const muayenePerKm = (vehicle.muayene_yillik || 1500) / yillikKm
    
    return yakitPerKm + surucuPerKm + yemekPerKm + bakimPerKm + sigortaPerKm + mtvPerKm + muayenePerKm
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
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 159, 10, 0.15)' }}>
              <Truck className="w-6 h-6" style={{ color: '#FF9F0A' }} />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
              Araç Yönetimi
            </h1>
          </div>
          <p className="text-lg ml-16" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Araç parametrelerini ve maliyet ayarlarını yönetin
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleNew}>
            <Plus className="w-5 h-5 mr-2" />
            Yeni Araç
          </Button>
        </motion.div>
      </motion.div>

      {/* Bilgilendirme */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Profesyonel Maliyet Sistemi</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-1">
              <p>✅ Yakıt: lt/100km × TL/lt hesabı</p>
              <p>✅ Sürücü: Günlük minimum garantili</p>
              <p>✅ HGS: Güzergahlar sayfasından ayrı tanımlanır</p>
              <p>✅ Bakım: Detaylı (yağ, lastik, bakım, onarım)</p>
              <p>✅ Sabit Giderler: Sigorta, MTV, Muayene (otomatik dahil)</p>
              <p>✅ Amortisman: Muhasebe için opsiyonel</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Vehicles List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Truck className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-bold text-gray-900">{vehicle.plaka}</h3>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatCurrency(calculateCostPerKm(vehicle))}/km
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(vehicle)}
                    className="p-2 rounded-xl"
                    style={{ color: '#0A84FF', backgroundColor: 'rgba(10, 132, 255, 0.15)' }}
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Maliyet Detayları */}
                <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yakıt:</span>
                    <span className="font-medium">
                      {formatCurrency(((vehicle.yakit_tuketimi || 25) * (vehicle.yakit_fiyati || 40)) / 100)}/km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sürücü:</span>
                    <span className="font-medium">
                      {formatCurrency((vehicle.gunluk_ucret || 1600) / (vehicle.gunluk_ort_km || 500))}/km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yemek:</span>
                    <span className="font-medium">
                      {formatCurrency((vehicle.yemek_gunluk || 150) / (vehicle.gunluk_ort_km || 500))}/km
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Sigorta/MTV/Muayene:</span>
                    <span>{formatCurrency((vehicle.sigorta_yillik || 12000) / 365)}/gün</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Kar Oranı:</span>
                    <span className="font-semibold text-green-600">%{((vehicle.kar_orani || 0.45) * 100).toFixed(0)}</span>
                  </div>
                </div>

                {/* Ek Bilgiler */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Yakıt: {vehicle.yakit_tuketimi || 25} lt/100km × {formatCurrency(vehicle.yakit_fiyati || 40)}/lt</p>
                  <p>Sürücü: {formatCurrency(vehicle.gunluk_ucret || 1600)}/gün (~{vehicle.gunluk_ort_km || 500} km)</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Henüz araç eklenmemiş</p>
            <p className="text-sm text-gray-600 mb-4">İlk aracınızı ekleyerek başlayın</p>
            <Button onClick={handleNew}>
              <PlusIcon className="w-5 h-5 mr-2" />
              İlk Aracı Ekle
            </Button>
          </div>
        </Card>
      )}

      {/* Edit/Add Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVehicle ? `Araç Düzenle: ${editingVehicle.plaka}` : 'Yeni Araç Ekle (Profesyonel Sistem)'}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Temel Bilgiler */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Temel Bilgiler</h4>
            <Input
              label="Plaka"
              name="plaka"
              value={formData.plaka}
              onChange={handleChange}
              placeholder="34 ABC 123"
              disabled={!!editingVehicle}
              required
            />
          </div>

          {/* Yakıt Parametreleri */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">⛽ Yakıt Parametreleri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Yakıt Tüketimi (lt/100km)"
                name="yakitTuketimi"
                type="number"
                step="0.1"
                value={formData.yakitTuketimi}
                onChange={handleChange}
                helperText="Ortalama kamyon: 25-35 lt/100km"
                required
              />
              <Input
                label="Motorin Fiyatı (TL/lt)"
                name="yakitFiyati"
                type="number"
                step="0.01"
                value={formData.yakitFiyati}
                onChange={handleChange}
                helperText="Güncel pompa fiyatı"
                required
              />
            </div>
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
              <strong>Hesaplanan:</strong> {formatCurrency((Number(formData.yakitTuketimi) * Number(formData.yakitFiyati)) / 100)}/km
            </div>
          </div>

          {/* Sürücü Parametreleri */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">👤 Sürücü Parametreleri</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Günlük Ücret (TL)"
                name="gunlukUcret"
                type="number"
                value={formData.gunlukUcret}
                onChange={handleChange}
                required
              />
              <Input
                label="Günlük Ort. Km"
                name="gunlukOrtKm"
                type="number"
                value={formData.gunlukOrtKm}
                onChange={handleChange}
                helperText="Gün hesabı için"
                required
              />
              <Input
                label="Günlük Yemek (TL)"
                name="yemekGunluk"
                type="number"
                value={formData.yemekGunluk}
                onChange={handleChange}
                helperText="Harcırah"
                required
              />
            </div>
          </div>

          {/* Bakım Parametreleri */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">🔧 Bakım/Onarım Parametreleri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Yağ Değişim Maliyeti (TL)"
                name="yagMaliyet"
                type="number"
                value={formData.yagMaliyet}
                onChange={handleChange}
                required
              />
              <Input
                label="Yağ Değişim Aralığı (km)"
                name="yagAralik"
                type="number"
                value={formData.yagAralik}
                onChange={handleChange}
                required
              />
              <Input
                label="Lastik Maliyeti (TL)"
                name="lastikMaliyet"
                type="number"
                value={formData.lastikMaliyet}
                onChange={handleChange}
                helperText="4 lastik toplam"
                required
              />
              <Input
                label="Lastik Ömrü (km)"
                name="lastikOmur"
                type="number"
                value={formData.lastikOmur}
                onChange={handleChange}
                required
              />
              <Input
                label="Büyük Bakım (TL)"
                name="buyukBakimMaliyet"
                type="number"
                value={formData.buyukBakimMaliyet}
                onChange={handleChange}
                required
              />
              <Input
                label="Bakım Aralığı (km)"
                name="buyukBakimAralik"
                type="number"
                value={formData.buyukBakimAralik}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mt-4">
              <Input
                label="Aylık Ufak Onarım Tahmini (TL)"
                name="ufakOnarimAylik"
                type="number"
                value={formData.ufakOnarimAylik}
                onChange={handleChange}
                helperText="Ortalama aylık tamir giderleri"
                required
              />
            </div>
          </div>

          {/* Sabit Giderler (Yıllık) */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">💳 Sabit Giderler (Yıllık)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Sigorta (TL/yıl)"
                name="sigortaYillik"
                type="number"
                value={formData.sigortaYillik}
                onChange={handleChange}
                helperText="Yıllık kasko/trafik sigortası"
                required
              />
              <Input
                label="MTV (TL/yıl)"
                name="mtvYillik"
                type="number"
                value={formData.mtvYillik}
                onChange={handleChange}
                helperText="Motorlu Taşıtlar Vergisi"
                required
              />
              <Input
                label="Muayene (TL/yıl)"
                name="muayeneYillik"
                type="number"
                value={formData.muayeneYillik}
                onChange={handleChange}
                helperText="Yıllık muayene maliyeti"
                required
              />
            </div>
            <div className="mt-2 p-2 bg-amber-50 rounded text-sm text-amber-800">
              <strong>Bilgi:</strong> Bu sabit giderler otomatik olarak maliyetlere dahil edilir (gün/km bazlı dönüştürülür)
            </div>
          </div>

          {/* Fiyatlandırma */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">💰 Fiyatlandırma Parametreleri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Kar Oranı (0.45 = %45)"
                name="karOrani"
                type="number"
                step="0.01"
                value={formData.karOrani}
                onChange={handleChange}
                required
              />
              <Input
                label="KDV (0.20 = %20)"
                name="kdv"
                type="number"
                step="0.01"
                value={formData.kdv}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Amortisman (Opsiyonel) */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-600 mb-3">📊 Amortisman Bilgileri (Opsiyonel - Sadece Muhasebe)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Araç Değeri (TL)"
                name="aracDegeri"
                type="number"
                value={formData.aracDegeri}
                onChange={handleChange}
              />
              <Input
                label="Amorti Süresi (Yıl)"
                name="amortiSureYil"
                type="number"
                step="0.1"
                value={formData.amortiSureYil}
                onChange={handleChange}
              />
              <Input
                label="Hedef Toplam Km"
                name="hedefToplamKm"
                type="number"
                value={formData.hedefToplamKm}
                onChange={handleChange}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Amortisman varsayılan olarak iş fiyatına dahil DEĞİLDİR. Sadece uzun vadeli raporlar için kullanılır.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

