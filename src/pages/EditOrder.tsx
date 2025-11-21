import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import TextArea from '../components/TextArea'
import { formatCurrency } from '../utils/formatters'
import { useToast } from '../context/ToastContext'

const STATUS_OPTIONS = [
  { value: 'Bekliyor', label: 'Bekliyor' },
  { value: 'Yüklendi', label: 'Yüklendi' },
  { value: 'Yolda', label: 'Yolda' },
  { value: 'Teslim Edildi', label: 'Teslim Edildi' },
  { value: 'Faturalandı', label: 'Faturalandı' },
  { value: 'İptal', label: 'İptal' },
]

export default function EditOrder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [isSubcontractor, setIsSubcontractor] = useState(false)
  
  const [formData, setFormData] = useState({
    plaka: '',
    musteri: '',
    telefon: '',
    customerEmail: '',
    nereden: '',
    nereye: '',
    yukAciklamasi: '',
    baslangicFiyati: '',
    gidisKm: '',
    donusKm: '',
    returnLoadRate: '0',
    tahminiGun: '1',
    status: 'Bekliyor',
    subcontractorCompany: '',
    subcontractorVehicle: '',
    subcontractorCost: '',
  })
  
  const [analysis, setAnalysis] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadOrder()
    loadVehicles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (formData.plaka && formData.gidisKm) {
      analyzeOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.gidisKm, formData.donusKm, formData.returnLoadRate, formData.plaka, formData.tahminiGun, formData.baslangicFiyati, formData.nereden, formData.nereye])

  const loadOrder = async () => {
    try {
      const data = await window.electronAPI.db.getOrder(Number(id))
      const order = data.order
      
      const isSubcon = order.is_subcontractor === 1
      setIsSubcontractor(isSubcon)
      
      setFormData({
        plaka: order.plaka || '',
        musteri: order.musteri || '',
        telefon: order.telefon || '',
        customerEmail: order.customer_email || '',
        nereden: order.nereden || '',
        nereye: order.nereye || '',
        yukAciklamasi: order.yuk_aciklamasi || '',
        baslangicFiyati: order.baslangic_fiyati?.toString() || '',
        gidisKm: order.gidis_km?.toString() || '',
        donusKm: order.donus_km?.toString() || '0',
        returnLoadRate: ((order.return_load_rate || 0) * 100).toString(),
        tahminiGun: order.tahmini_gun?.toString() || '1',
        status: order.status || 'Bekliyor',
        subcontractorCompany: order.subcontractor_company || '',
        subcontractorVehicle: order.subcontractor_vehicle || '',
        subcontractorCost: order.subcontractor_cost?.toString() || '',
      })
      
      setTripType(order.donus_km > 0 ? 'roundtrip' : 'oneway')
    } catch (error) {
      console.error('Failed to load order:', error)
      showToast('Sipariş yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadVehicles = async () => {
    try {
      const data = await window.electronAPI.db.getVehicles()
      setVehicles(data)
    } catch (error) {
      console.error('Failed to load vehicles:', error)
    }
  }

  const analyzeOrder = async () => {
    if (!formData.gidisKm) return
    
    try {
      setAnalyzing(true)
      const result = await window.electronAPI.cost.analyze({
        plaka: formData.plaka,
        nereden: formData.nereden,
        nereye: formData.nereye,
        gidisKm: Number(formData.gidisKm),
        donusKm: Number(formData.donusKm) || 0,
        returnLoadRate: Number(formData.returnLoadRate) / 100,
        tahminiGun: Number(formData.tahminiGun) || 1,
        ilkFiyat: Number(formData.baslangicFiyati) || 0,
      })
      setAnalysis(result)
    } catch (error) {
      console.error('Failed to analyze order:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (isSubcontractor) {
      if (!formData.subcontractorCompany.trim()) newErrors.subcontractorCompany = 'Taşeron firma adı zorunludur'
      if (!formData.subcontractorCost.trim() || Number(formData.subcontractorCost) <= 0) {
        newErrors.subcontractorCost = 'Geçerli bir taşeron maliyeti giriniz'
      }
    } else {
      if (!formData.plaka) newErrors.plaka = 'Araç seçimi zorunludur'
    }
    
    if (!formData.musteri.trim()) newErrors.musteri = 'Müşteri adı zorunludur'
    if (!formData.telefon.trim()) newErrors.telefon = 'Telefon numarası zorunludur'
    if (!formData.nereden.trim()) newErrors.nereden = 'Nereden bilgisi zorunludur'
    if (!formData.nereye.trim()) newErrors.nereye = 'Nereye bilgisi zorunludur'
    if (!formData.gidisKm.trim() || Number(formData.gidisKm) <= 0) {
      newErrors.gidisKm = 'Geçerli bir km giriniz'
    }
    if (!formData.baslangicFiyati.trim() || Number(formData.baslangicFiyati) <= 0) {
      newErrors.baslangicFiyati = 'Geçerli bir fiyat giriniz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      showToast('Lütfen tüm zorunlu alanları doldurun', 'error')
      return
    }

    try {
      setSaving(true)
      
      // Taşeron ise kar/zarar hesaplama
      let karZarar = 0
      let karZararYuzde = 0
      
      if (isSubcontractor) {
        karZarar = Number(formData.baslangicFiyati) - Number(formData.subcontractorCost)
        karZararYuzde = Number(formData.baslangicFiyati) > 0 
          ? (karZarar / Number(formData.baslangicFiyati)) * 100 
          : 0
      }
      
      await window.electronAPI.db.updateOrder(Number(id), {
        plaka: isSubcontractor ? (formData.subcontractorCompany + ' (Taşeron)') : formData.plaka.trim(),
        musteri: formData.musteri.trim(),
        telefon: formData.telefon.trim(),
        customerEmail: formData.customerEmail.trim() || null,
        nereden: formData.nereden.trim(),
        nereye: formData.nereye.trim(),
        yukAciklamasi: formData.yukAciklamasi.trim(),
        baslangicFiyati: Number(formData.baslangicFiyati),
        gidisKm: Number(formData.gidisKm),
        donusKm: Number(formData.donusKm) || 0,
        returnLoadRate: Number(formData.returnLoadRate) / 100,
        etkinKm: isSubcontractor ? 0 : (analysis?.etkinKm || 0),
        tahminiGun: Number(formData.tahminiGun) || 1,
        yakitLitre: isSubcontractor ? 0 : (analysis?.costBreakdown?.yakitLitre || 0),
        yakitMaliyet: isSubcontractor ? 0 : (analysis?.costBreakdown?.yakitMaliyet || 0),
        surucuMaliyet: isSubcontractor ? 0 : (analysis?.costBreakdown?.surucuMaliyet || 0),
        yemekMaliyet: isSubcontractor ? 0 : (analysis?.costBreakdown?.yemekMaliyet || 0),
        hgsMaliyet: isSubcontractor ? 0 : (analysis?.costBreakdown?.hgsMaliyet || 0),
        bakimMaliyet: isSubcontractor ? 0 : (analysis?.costBreakdown?.toplamBakimMaliyet || 0),
        sigortaMaliyet: isSubcontractor ? 0 : (analysis?.costBreakdown?.sigortaMaliyet || 0),
        mtvMaliyet: isSubcontractor ? 0 : (analysis?.costBreakdown?.mtvMaliyet || 0),
        muayeneMaliyet: isSubcontractor ? 0 : (analysis?.costBreakdown?.muayeneMaliyet || 0),
        toplamMaliyet: isSubcontractor ? Number(formData.subcontractorCost) : (analysis?.toplamMaliyet || 0),
        onerilenFiyat: isSubcontractor ? 0 : (analysis?.fiyatKdvli || 0),
        karZarar: isSubcontractor ? karZarar : (analysis?.karZarar || 0),
        karZararYuzde: isSubcontractor ? karZararYuzde : (analysis?.karZararYuzde || 0),
        status: formData.status,
        isSubcontractor: isSubcontractor,
        subcontractorCompany: isSubcontractor ? formData.subcontractorCompany.trim() : null,
        subcontractorVehicle: isSubcontractor ? formData.subcontractorVehicle.trim() : null,
        subcontractorCost: isSubcontractor ? Number(formData.subcontractorCost) : 0,
      })

      showToast('✅ Sipariş başarıyla güncellendi!', 'success')
      navigate(`/orders/${id}`)
    } catch (error) {
      console.error('Failed to update order:', error)
      showToast('Sipariş güncellenirken bir hata oluştu', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sipariş Düzenle #{id}</h1>
        <p className="mt-1 text-gray-600">Sipariş bilgilerini güncelleyin</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Taşeron Bilgisi */}
          {isSubcontractor && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.12)', border: '0.5px solid rgba(255, 159, 10, 0.3)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.2)' }}>
                  <svg className="w-5 h-5" style={{ color: '#FF9F0A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-white">Taşeron Sipariş</p>
              </div>
              <Input
                label="Taşeron Firma Adı *"
                value={formData.subcontractorCompany}
                onChange={(e) => setFormData(prev => ({ ...prev, subcontractorCompany: e.target.value }))}
                error={errors.subcontractorCompany}
                placeholder="Örn: ABC Lojistik"
                className="mb-3"
              />
              <Input
                label="Araç/Plaka Bilgisi"
                value={formData.subcontractorVehicle}
                onChange={(e) => setFormData(prev => ({ ...prev, subcontractorVehicle: e.target.value }))}
                placeholder="Örn: 34 ABC 123"
                className="mb-3"
              />
              <Input
                label="Taşeron Maliyeti (₺) *"
                type="number"
                step="0.01"
                value={formData.subcontractorCost}
                onChange={(e) => setFormData(prev => ({ ...prev, subcontractorCost: e.target.value }))}
                error={errors.subcontractorCost}
                placeholder="Taşeron firmaya ödenecek tutar"
              />
            </div>
          )}
          
          {/* Araç - Sadece taşeron değilse göster */}
          {!isSubcontractor && (
            <Select
              label="Araç"
              name="plaka"
              value={formData.plaka}
              onChange={handleChange}
              error={errors.plaka}
              required
              options={[
                { value: '', label: 'Araç Seçiniz...' },
                ...vehicles.map(v => ({
                  value: v.plaka,
                  label: v.plaka
                }))
              ]}
            />
          )}

          {/* Müşteri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Müşteri Adı"
              name="musteri"
              value={formData.musteri}
              onChange={handleChange}
              error={errors.musteri}
              required
            />
            <Input
              label="Telefon"
              name="telefon"
              type="tel"
              value={formData.telefon}
              onChange={handleChange}
              error={errors.telefon}
              required
            />
            <Input
              label="E-Posta"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleChange}
              error={errors.customerEmail}
              placeholder="musteri@example.com"
            />
          </div>

          {/* Güzergah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nereden"
              name="nereden"
              value={formData.nereden}
              onChange={handleChange}
              error={errors.nereden}
              required
            />
            <Input
              label="Nereye"
              name="nereye"
              value={formData.nereye}
              onChange={handleChange}
              error={errors.nereye}
              required
            />
          </div>

          {/* Mesafe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Gidiş Km"
              name="gidisKm"
              type="number"
              value={formData.gidisKm}
              onChange={handleChange}
              error={errors.gidisKm}
              required
            />
            <Input
              label="Dönüş Km"
              name="donusKm"
              type="number"
              value={formData.donusKm}
              onChange={handleChange}
            />
            <Input
              label="Tahmini Gün"
              name="tahminiGun"
              type="number"
              value={formData.tahminiGun}
              onChange={handleChange}
            />
          </div>

          {/* Dönüş Yük Oranı */}
          {Number(formData.donusKm) > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dönüşte Yük Bulma Oranı: %{formData.returnLoadRate}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.returnLoadRate}
                onChange={(e) => setFormData(prev => ({ ...prev, returnLoadRate: e.target.value }))}
                className="w-full h-2 bg-gray-200 rounded-lg"
              />
            </div>
          )}

          {/* Yük Açıklaması */}
          <TextArea
            label="Yük Açıklaması"
            name="yukAciklamasi"
            value={formData.yukAciklamasi}
            onChange={handleChange}
            rows={3}
          />

          {/* Fiyat */}
          <Input
            label="Toplam Ücret (₺)"
            name="baslangicFiyati"
            type="number"
            step="0.01"
            value={formData.baslangicFiyati}
            onChange={handleChange}
            error={errors.baslangicFiyati}
            required
          />

          {/* Durum */}
          <Select
            label="Durum"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
          />

          {/* Kar/Zarar Özet */}
          {analysis && formData.baslangicFiyati && (
            <div className={`p-4 rounded-lg border-2 ${
              analysis.karZarar > 100 ? 'bg-green-50 border-green-200' :
              analysis.karZarar < -100 ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Güncel Kar/Zarar</p>
                <p className={`text-3xl font-bold ${
                  analysis.karZarar > 100 ? 'text-green-600' :
                  analysis.karZarar < -100 ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {formatCurrency(analysis.karZarar)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Maliyet: {formatCurrency(analysis.toplamMaliyet)} | 
                  Önerilen: {formatCurrency(analysis.fiyatKdvli)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/orders/${id}`)}
              disabled={saving}
            >
              ← İptal
            </Button>
            <Button type="submit" disabled={saving || analyzing}>
              {saving ? 'Kaydediliyor...' : '✓ Kaydet'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

