import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import { PlusIcon, PencilIcon, TruckIcon } from '../components/Icons'
import { formatCurrency } from '../utils/formatters'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    plaka: '',
    aracDegeri: '2300000',
    amortiSureYil: '2',
    hedefToplamKm: '72000',
    bakimMaliyet: '15000',
    bakimAralikKm: '15000',
    ekMasrafPer1000: '1000',
    benzinPerKm: '7.5',
    gunlukUcret: '1600',
    gunlukOrtKm: '500',
    karOrani: '0.45',
    kdv: '0.20',
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
      aracDegeri: vehicle.arac_degeri.toString(),
      amortiSureYil: vehicle.amorti_sure_yil.toString(),
      hedefToplamKm: vehicle.hedef_toplam_km.toString(),
      bakimMaliyet: vehicle.bakim_maliyet.toString(),
      bakimAralikKm: vehicle.bakim_aralik_km.toString(),
      ekMasrafPer1000: vehicle.ek_masraf_per_1000.toString(),
      benzinPerKm: vehicle.benzin_per_km.toString(),
      gunlukUcret: vehicle.gunluk_ucret.toString(),
      gunlukOrtKm: vehicle.gunluk_ort_km.toString(),
      karOrani: vehicle.kar_orani.toString(),
      kdv: vehicle.kdv.toString(),
    })
    setShowModal(true)
  }

  const handleNew = () => {
    setEditingVehicle(null)
    setFormData({
      plaka: '',
      aracDegeri: '2300000',
      amortiSureYil: '2',
      hedefToplamKm: '72000',
      bakimMaliyet: '15000',
      bakimAralikKm: '15000',
      ekMasrafPer1000: '1000',
      benzinPerKm: '7.5',
      gunlukUcret: '1600',
      gunlukOrtKm: '500',
      karOrani: '0.45',
      kdv: '0.20',
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
        aracDegeri: Number(formData.aracDegeri),
        amortiSureYil: Number(formData.amortiSureYil),
        hedefToplamKm: Number(formData.hedefToplamKm),
        bakimMaliyet: Number(formData.bakimMaliyet),
        bakimAralikKm: Number(formData.bakimAralikKm),
        ekMasrafPer1000: Number(formData.ekMasrafPer1000),
        benzinPerKm: Number(formData.benzinPerKm),
        gunlukUcret: Number(formData.gunlukUcret),
        gunlukOrtKm: Number(formData.gunlukOrtKm),
        karOrani: Number(formData.karOrani),
        kdv: Number(formData.kdv),
      })
      
      setShowModal(false)
      loadVehicles()
    } catch (error) {
      console.error('Failed to save vehicle:', error)
      alert('Araç kaydedilemedi')
    }
  }

  const calculateCostPerKm = (vehicle: any) => {
    const amortPerKm = vehicle.arac_degeri / vehicle.hedef_toplam_km
    const bakimPerKm = vehicle.bakim_maliyet / vehicle.bakim_aralik_km
    const ekPerKm = vehicle.ek_masraf_per_1000 / 1000
    const driverPerKm = vehicle.gunluk_ucret / vehicle.gunluk_ort_km
    return amortPerKm + bakimPerKm + ekPerKm + vehicle.benzin_per_km + driverPerKm
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Araç Yönetimi</h1>
          <p className="mt-1 text-gray-600">Araç parametrelerini ve maliyet ayarlarını yönetin</p>
        </div>
        <Button onClick={handleNew}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Yeni Araç
        </Button>
      </div>

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
                      <TruckIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-bold text-gray-900">{vehicle.plaka}</h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(calculateCostPerKm(vehicle))}/km
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Araç Değeri:</span>
                    <span className="font-medium">{formatCurrency(vehicle.arac_degeri)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amorti Süresi:</span>
                    <span className="font-medium">{vehicle.amorti_sure_yil} yıl</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hedef Km:</span>
                    <span className="font-medium">{vehicle.hedef_toplam_km.toLocaleString('tr-TR')} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yakıt:</span>
                    <span className="font-medium">{formatCurrency(vehicle.benzin_per_km)}/km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Günlük Ücret:</span>
                    <span className="font-medium">{formatCurrency(vehicle.gunluk_ucret)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Kar Oranı:</span>
                    <span className="font-medium text-green-600">%{(vehicle.kar_orani * 100).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Henüz araç eklenmemiş</p>
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
        title={editingVehicle ? `Araç Düzenle: ${editingVehicle.plaka}` : 'Yeni Araç Ekle'}
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plaka"
              name="plaka"
              value={formData.plaka}
              onChange={handleChange}
              placeholder="34 ABC 123"
              disabled={!!editingVehicle}
              required
            />
            <Input
              label="Araç Değeri (TL)"
              name="aracDegeri"
              type="number"
              value={formData.aracDegeri}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amorti Süresi (Yıl)"
              name="amortiSureYil"
              type="number"
              step="0.1"
              value={formData.amortiSureYil}
              onChange={handleChange}
              required
            />
            <Input
              label="Hedef Toplam Km"
              name="hedefToplamKm"
              type="number"
              value={formData.hedefToplamKm}
              onChange={handleChange}
              required
              helperText="Amorti süresi boyunca hedeflenen toplam km"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bakım Maliyeti (TL)"
              name="bakimMaliyet"
              type="number"
              value={formData.bakimMaliyet}
              onChange={handleChange}
              required
            />
            <Input
              label="Bakım Aralığı (Km)"
              name="bakimAralikKm"
              type="number"
              value={formData.bakimAralikKm}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ek Masraf (TL/1000km)"
              name="ekMasrafPer1000"
              type="number"
              value={formData.ekMasrafPer1000}
              onChange={handleChange}
              required
            />
            <Input
              label="Yakıt (TL/km)"
              name="benzinPerKm"
              type="number"
              step="0.01"
              value={formData.benzinPerKm}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Günlük Ücret (TL)"
              name="gunlukUcret"
              type="number"
              value={formData.gunlukUcret}
              onChange={handleChange}
              required
              helperText="Sürücü günlük ücreti"
            />
            <Input
              label="Günlük Ortalama Km"
              name="gunlukOrtKm"
              type="number"
              value={formData.gunlukOrtKm}
              onChange={handleChange}
              required
            />
          </div>

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
      </Modal>
    </div>
  )
}

