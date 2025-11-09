import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Save, 
  Truck, 
  MapPin, 
  DollarSign, 
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Activity,
  Zap,
  Plus
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import VehicleSelect from '../components/VehicleSelect'
import TextArea from '../components/TextArea'
import RoutePicker from '../components/RoutePicker'
import { formatCurrency } from '../utils/formatters'
import { useDebounce } from '../hooks/useDebounce'
import { useToast } from '../context/ToastContext'

export default function CreateOrderFixed() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [autoPrice, setAutoPrice] = useState(true) // Otomatik fiyat toggle
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway') // Tek yön/Gidiş-dönüş
  const [isSubcontractor, setIsSubcontractor] = useState(false) // Taşeron firmaya mı veriliyor
  
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
    returnLoadRate: '0', // 0-100
    tahminiGun: '1',
    subcontractorCompany: '',
    subcontractorVehicle: '',
    subcontractorCost: '',
  })
  
  const [analysis, setAnalysis] = useState<any>(null)
  const [costBreakdown, setCostBreakdown] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Debounce expensive calculations
  const debouncedGidisKm = useDebounce(formData.gidisKm, 300)
  const debouncedDonusKm = useDebounce(formData.donusKm, 300)

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    if (formData.plaka) {
      loadCostBreakdown()
    }
  }, [formData.plaka])

  // Tahmini gün otomatik hesaplama
  useEffect(() => {
    if (formData.gidisKm) {
      const toplamKm = Number(formData.gidisKm) + (tripType === 'roundtrip' ? Number(formData.gidisKm) : 0)
      const gun = Math.max(1, Math.ceil(toplamKm / 500))
      setFormData(prev => ({ ...prev, tahminiGun: gun.toString() }))
    }
  }, [formData.gidisKm, tripType])

  // Tek yön/Gidiş-dönüş değişince dönüş km'yi ayarla
  useEffect(() => {
    if (tripType === 'roundtrip' && formData.gidisKm) {
      setFormData(prev => ({ ...prev, donusKm: formData.gidisKm }))
    } else if (tripType === 'oneway') {
      setFormData(prev => ({ ...prev, donusKm: '0', returnLoadRate: '0' }))
    }
  }, [tripType, formData.gidisKm])

  // Debounced analysis
  useEffect(() => {
    if (formData.plaka && debouncedGidisKm) {
      analyzeOrder()
    }
  }, [formData.plaka, debouncedGidisKm, debouncedDonusKm, formData.returnLoadRate, formData.tahminiGun, formData.nereden, formData.nereye, formData.baslangicFiyati])

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true)
      const data = await window.electronAPI.db.getVehicles()
      setVehicles(data)
      
      if (data.length === 1) {
        setFormData(prev => ({ ...prev, plaka: data[0].plaka }))
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error)
      showToast('Araçlar yüklenemedi', 'error')
    } finally {
      setLoadingVehicles(false)
    }
  }

  const loadCostBreakdown = async () => {
    try {
      const breakdown = await window.electronAPI.cost.getBreakdown(formData.plaka)
      setCostBreakdown(breakdown)
    } catch (error) {
      console.error('Failed to load cost breakdown:', error)
    }
  }

  const analyzeOrder = async () => {
    if (!formData.gidisKm) return
    
    try {
      setAnalyzing(true)
      const result = await window.electronAPI.cost.analyze({
        plaka: formData.plaka,
        nereden: normalizeCity(formData.nereden),
        nereye: normalizeCity(formData.nereye),
        gidisKm: Number(formData.gidisKm),
        donusKm: Number(formData.donusKm) || 0,
        returnLoadRate: Number(formData.returnLoadRate) / 100,
        tahminiGun: Number(formData.tahminiGun) || 1,
        ilkFiyat: Number(formData.baslangicFiyati) || 0,
      })
      setAnalysis(result)
      
      // Otomatik fiyat açıksa güncelle
      if (autoPrice) {
        setFormData(prev => ({
          ...prev,
          baslangicFiyati: Math.round(result.fiyatKdvli).toString()
        }))
      }
    } catch (error) {
      console.error('Failed to analyze order:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  // Şehir ismini normalize et (case-insensitive matching)
  const normalizeCity = (city: string): string => {
    if (!city) return ''
    return city.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Negatif değer engelle
    if (name === 'gidisKm' || name === 'donusKm' || name === 'baslangicFiyati') {
      if (Number(value) < 0) return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // RoutePicker'dan gelen değişiklikleri işle
  const handleRouteChange = (next: { from?: string; to?: string; gidisKm?: number }) => {
    setFormData(prev => ({
      ...prev,
      nereden: next.from !== undefined ? next.from : prev.nereden,
      nereye: next.to !== undefined ? next.to : prev.nereye,
      gidisKm: next.gidisKm !== undefined ? String(next.gidisKm) : prev.gidisKm,
    }))
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, returnLoadRate: e.target.value }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Taşeron kontrolü
    if (isSubcontractor) {
      if (!formData.subcontractorCompany.trim()) newErrors.subcontractorCompany = 'Taşeron firma adı zorunludur'
      if (!formData.subcontractorCost.trim()) {
        newErrors.subcontractorCost = 'Taşeron maliyeti zorunludur'
      } else if (isNaN(Number(formData.subcontractorCost)) || Number(formData.subcontractorCost) <= 0) {
        newErrors.subcontractorCost = 'Geçerli bir maliyet giriniz'
      }
    } else {
      if (!formData.plaka) newErrors.plaka = 'Araç seçimi zorunludur'
    }

    if (!formData.musteri.trim()) newErrors.musteri = 'Müşteri adı zorunludur'
    
    // Telefon validasyonu
    const phoneRegex = /^[0-9\s\-\+\(\)]{10,15}$/
    if (!formData.telefon.trim()) {
      newErrors.telefon = 'Telefon numarası zorunludur'
    } else if (!phoneRegex.test(formData.telefon.trim())) {
      newErrors.telefon = 'Geçerli bir telefon numarası giriniz'
    }
    
    if (!formData.nereden.trim()) newErrors.nereden = 'Nereden bilgisi zorunludur'
    if (!formData.nereye.trim()) newErrors.nereye = 'Nereye bilgisi zorunludur'
    
    if (!formData.gidisKm.trim()) {
      newErrors.gidisKm = 'Gidiş km zorunludur'
    } else if (isNaN(Number(formData.gidisKm)) || Number(formData.gidisKm) <= 0) {
      newErrors.gidisKm = 'Geçerli bir km giriniz'
    }
    
    if (!formData.baslangicFiyati.trim()) {
      newErrors.baslangicFiyati = 'Toplam ücret zorunludur'
    } else if (isNaN(Number(formData.baslangicFiyati)) || Number(formData.baslangicFiyati) <= 0) {
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
      setLoading(true)
      
      // Taşeron ise kar/zarar hesaplama
      let karZarar = 0
      let karZararYuzde = 0
      
      if (isSubcontractor) {
        karZarar = Number(formData.baslangicFiyati) - Number(formData.subcontractorCost)
        karZararYuzde = Number(formData.baslangicFiyati) > 0 
          ? (karZarar / Number(formData.baslangicFiyati)) * 100 
          : 0
      }
      
      const result = await window.electronAPI.db.createOrder({
        plaka: isSubcontractor ? (formData.subcontractorCompany + ' (Taşeron)') : formData.plaka.trim(),
        musteri: formData.musteri.trim(),
        telefon: formData.telefon.trim(),
        customerEmail: formData.customerEmail.trim() || null,
        nereden: normalizeCity(formData.nereden),
        nereye: normalizeCity(formData.nereye),
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
        toplamMaliyet: isSubcontractor ? Number(formData.subcontractorCost) : (analysis?.toplamMaliyet || 0),
        
        onerilenFiyat: isSubcontractor ? 0 : (analysis?.fiyatKdvli || 0),
        karZarar: isSubcontractor ? karZarar : (analysis?.karZarar || 0),
        karZararYuzde: isSubcontractor ? karZararYuzde : (analysis?.karZararYuzde || 0),
        
        isSubcontractor: isSubcontractor,
        subcontractorCompany: isSubcontractor ? formData.subcontractorCompany.trim() : null,
        subcontractorVehicle: isSubcontractor ? formData.subcontractorVehicle.trim() : null,
        subcontractorCost: isSubcontractor ? Number(formData.subcontractorCost) : 0,
      })

      if (result.success) {
        showToast('✅ Sipariş başarıyla oluşturuldu!', 'success')
        navigate(`/orders/${result.id}`)
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      showToast('Sipariş oluşturulurken bir hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getProfitColor = (karZarar: number) => {
    if (karZarar > 100) return 'text-green-600'
    if (karZarar < -100) return 'text-red-600'
    return 'text-yellow-600' // Başabaş veya çok küçük fark
  }

  const getProfitBgColor = (karZarar: number) => {
    if (karZarar > 100) return 'bg-green-50 border-green-200'
    if (karZarar < -100) return 'bg-red-50 border-red-200'
    return 'bg-yellow-50 border-yellow-200' // Başabaş
  }

  const getProfitStatus = (karZarar: number) => {
    if (karZarar > 100) return { icon: '✅', text: 'KÂR VAR', color: 'green' }
    if (karZarar < -100) return { icon: '⚠️', text: 'ZARAR VAR', color: 'red' }
    return { icon: '⚖️', text: 'BAŞABAŞ', color: 'yellow' }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link to="/orders">
              <motion.button
                whileHover={{ scale: 1.05, x: -4 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(10, 132, 255, 0.15)', 
                  color: '#0A84FF',
                  border: '0.5px solid rgba(10, 132, 255, 0.3)'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
                Yeni Sipariş Oluştur
              </h1>
            </div>
          </div>
          <p className="text-lg ml-16" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            🎯 Profesyonel maliyet analizi ile sipariş ekleyin
          </p>
      </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form - Sol taraf */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Taşeron Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 159, 10, 0.12)', border: '0.5px solid rgba(255, 159, 10, 0.3)' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.2)' }}>
                      <Truck className="w-5 h-5" style={{ color: '#FF9F0A' }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#FFFFFF' }}>Taşeron Firma</p>
                      <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                        Bu sipariş başka bir firmaya mı verilecek?
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isSubcontractor}
                      onChange={(e) => {
                        setIsSubcontractor(e.target.checked)
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, plaka: '' }))
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            subcontractorCompany: '',
                            subcontractorVehicle: '',
                            subcontractorCost: ''
                          }))
                        }
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>

              {/* Araç Seçimi veya Taşeron Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {isSubcontractor ? '1️⃣ Taşeron Firma Bilgileri' : '1️⃣ Araç Bilgileri'}
                </h3>
                
                {isSubcontractor ? (
                  <div className="space-y-4">
                    <Input
                      label="Taşeron Firma Adı *"
                      value={formData.subcontractorCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcontractorCompany: e.target.value }))}
                      error={errors.subcontractorCompany}
                      placeholder="Örn: ABC Lojistik"
                    />
                    <Input
                      label="Araç/Plaka Bilgisi (Opsiyonel)"
                      value={formData.subcontractorVehicle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcontractorVehicle: e.target.value }))}
                      placeholder="Örn: 34 ABC 123"
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
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.12)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: '#0A84FF' }} />
                        <div>
                          <p className="text-sm font-semibold mb-1" style={{ color: '#FFFFFF' }}>
                            Taşeron Firma Notu
                          </p>
                          <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.7)' }}>
                            Bu sipariş kendi araçlarınızla değil, taşeron firma aracılığıyla gerçekleştirilecek. 
                            Kar/zarar hesaplaması: (Müşteri ödemesi - Taşeron maliyeti)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : loadingVehicles ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-yellow-800">Henüz Araç Eklenmemiş</h3>
                        <p className="mt-1 text-sm text-yellow-700">Sipariş oluşturmak için önce bir araç eklemelisiniz.</p>
                        <Link to="/vehicles" className="mt-3 inline-block">
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Araç Ekle
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <VehicleSelect
                      vehicles={vehicles}
                      value={formData.plaka}
                      onChange={(plaka) => setFormData(prev => ({ ...prev, plaka }))}
                      disabled={false}
                    />
                    {formData.plaka && (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.12)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}>
                        <p className="text-sm" style={{ color: '#0A84FF' }}>
                          <span className="font-semibold text-white mr-1">Seçili Araç:</span>
                          {(() => {
                            const v = vehicles.find(v => v.plaka === formData.plaka)
                            if (!v) return '-'
                            const yakit = ((v.yakit_tuketimi || 25) * (v.yakit_fiyati || 40)) / 100
                            const surucu = (v.gunluk_ucret || 1600) / (v.gunluk_ort_km || 500)
                            const yemek = (v.yemek_gunluk || 150) / (v.gunluk_ort_km || 500)
                            const bakim = ((v.yag_maliyet || 500) / (v.yag_aralik || 5000)) + ((v.lastik_maliyet || 8000) / (v.lastik_omur || 50000)) + ((v.buyuk_bakim_maliyet || 3000) / (v.buyuk_bakim_aralik || 15000))
                            // HGS güzergah bazlı hesaplanır, sabit km başına değil
                            const toplam = yakit + surucu + yemek + bakim
                            return `${toplam.toFixed(2)} ₺/km (ortalama)`
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Müşteri Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold mb-4">2️⃣ Müşteri Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Müşteri Adı"
                    name="musteri"
                    value={formData.musteri}
                    onChange={handleChange}
                    error={errors.musteri}
                    placeholder="Ahmet Yılmaz"
                    required
                    disabled={vehicles.length === 0}
                  />
                  <Input
                    label="Telefon"
                    name="telefon"
                    type="tel"
                    value={formData.telefon}
                    onChange={handleChange}
                    error={errors.telefon}
                    placeholder="0532 123 45 67"
                    required
                    disabled={vehicles.length === 0}
                  />
                  <Input
                    label="E-Posta (Otomatik mail için)"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    error={errors.customerEmail}
                    placeholder="musteri@example.com"
                    disabled={vehicles.length === 0}
                  />
                </div>
              </div>

              {/* Güzergah */}
              <div>
                <h3 className="text-lg font-semibold mb-4">3️⃣ Güzergah ve Mesafe</h3>
                
                {/* Sefer Tipi */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sefer Tipi</label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setTripType('oneway')}
                      className="flex-1 px-4 py-3 rounded-lg border-2 transition-all font-semibold"
                      style={
                        tripType === 'oneway'
                          ? { backgroundColor: 'rgba(10, 132, 255, 0.15)', borderColor: 'rgba(10, 132, 255, 0.5)', color: '#0A84FF' }
                          : { borderColor: 'rgba(84, 84, 88, 0.35)', color: 'rgba(235, 235, 245, 0.7)' }
                      }
                    >
                      🔜 Tek Yön
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType('roundtrip')}
                      className="flex-1 px-4 py-3 rounded-lg border-2 transition-all font-semibold"
                      style={
                        tripType === 'roundtrip'
                          ? { backgroundColor: 'rgba(10, 132, 255, 0.15)', borderColor: 'rgba(10, 132, 255, 0.5)', color: '#0A84FF' }
                          : { borderColor: 'rgba(84, 84, 88, 0.35)', color: 'rgba(235, 235, 245, 0.7)' }
                      }
                    >
                      🔄 Gidiş-Dönüş
                    </button>
                  </div>
                </div>

                <RoutePicker
                  from={formData.nereden}
                  to={formData.nereye}
                  onChange={handleRouteChange}
                  disabled={vehicles.length === 0}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Gidiş Mesafesi (km)"
                    name="gidisKm"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.gidisKm}
                    onChange={handleChange}
                    error={errors.gidisKm}
                    placeholder="450"
                    required
                    disabled={vehicles.length === 0}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                    }}
                  />
                  {tripType === 'roundtrip' && (
                    <Input
                      label="Dönüş Mesafesi (km)"
                      name="donusKm"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.donusKm}
                      onChange={handleChange}
                      placeholder="Otomatik (gidiş ile aynı)"
                      disabled={true}
                      helperText="Gidiş mesafesi ile aynı"
                    />
                  )}
                </div>

                {/* Tahmini Gün (Otomatik, Görüntüleme Amaçlı) */}
                <div className="mt-4">
                  <Input
                    label="Tahmini Süre (Gün)"
                    name="tahminiGun"
                    type="number"
                    min="1"
                    value={formData.tahminiGun}
                    onChange={handleChange}
                    helperText="Otomatik hesaplanıyor (500 km/gün bazında)"
                    disabled={vehicles.length === 0}
                  />
                </div>
              </div>

              {/* Yük Açıklaması */}
              <div>
                <h3 className="text-lg font-semibold mb-4">4️⃣ Yük Detayları</h3>
                <TextArea
                  label="Yük Açıklaması"
                  name="yukAciklamasi"
                  value={formData.yukAciklamasi}
                  onChange={handleChange}
                  placeholder="Örn: 10 ton inşaat malzemesi, 15 palet..."
                  rows={3}
                  disabled={vehicles.length === 0}
                />
              </div>

              {/* Fiyat */}
              <div>
                <h3 className="text-lg font-semibold mb-4">5️⃣ Fiyatlandırma</h3>
                
                {/* Otomatik Fiyat Toggle - Sadece kendi araçlar için */}
                {!isSubcontractor && (
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Otomatik Fiyat</p>
                      <p className="text-xs text-gray-600">Sistem önerilen fiyatı otomatik uygular</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoPrice(!autoPrice)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoPrice ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoPrice ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                <Input
                  label="Toplam Ücret (₺)"
                  name="baslangicFiyati"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.baslangicFiyati}
                  onChange={handleChange}
                  error={errors.baslangicFiyati}
                  placeholder="Otomatik hesaplanacak..."
                  required
                  disabled={!isSubcontractor && vehicles.length === 0}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                  }}
                  helperText={isSubcontractor ? 'Müşteriden alınacak toplam ücret' : (autoPrice ? 'Önerilen fiyat otomatik uygulanıyor' : 'Manuel fiyat girişi')}
                />

                {analysis && !autoPrice && (
                  <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Sistem Önerisi:</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(analysis.fiyatKdvli)}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, baslangicFiyati: Math.round(analysis.fiyatKdvli).toString() }))}
                    >
                      Uygula
                    </Button>
                  </div>
                )}
              </div>

              {/* Modern Actions */}
              <div className="flex items-center justify-between pt-6" style={{ borderTop: '0.5px solid rgba(84, 84, 88, 0.35)' }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/orders')}
                  disabled={loading}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Geri
                </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="submit" 
                  disabled={loading || analyzing || (!isSubcontractor && vehicles.length === 0)}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Oluşturuluyor...
                    </>
                  ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sipariş Oluştur
                      </>
                  )}
                </Button>
                </motion.div>
              </div>
            </form>
          </Card>
        </div>

        {/* Modern Analiz Panel - Sağ taraf */}
        <div className="space-y-4">
          {/* Taşeron Kar/Zarar Özeti */}
          {isSubcontractor && formData.baslangicFiyati && formData.subcontractorCost && (() => {
            const gelir = Number(formData.baslangicFiyati) || 0
            const maliyet = Number(formData.subcontractorCost) || 0
            const kar = gelir - maliyet
            const karYuzde = gelir > 0 ? (kar / gelir) * 100 : 0
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-xl p-6 relative overflow-hidden"
                style={{ 
                  background: kar > 0 ? 'rgba(48, 209, 88, 0.15)' : kar < 0 ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 214, 10, 0.15)',
                  border: kar > 0 ? '0.5px solid rgba(48, 209, 88, 0.3)' : kar < 0 ? '0.5px solid rgba(255, 69, 58, 0.3)' : '0.5px solid rgba(255, 214, 10, 0.3)',
                }}
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
                  style={{ backgroundColor: kar > 0 ? '#30D158' : kar < 0 ? '#FF453A' : '#FFD60A' }}
                />
                <div className="relative text-center">
                  <div className="mb-3">
                    <span className="text-4xl">{kar > 0 ? '🎉' : kar < 0 ? '⚠️' : '➡️'}</span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    Taşeron Kar Marjı
                  </p>
                  <p className="text-5xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                    {karYuzde > 0 ? '+' : ''}{karYuzde.toFixed(1)}%
                  </p>
                  <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Net Kar:</span>
                      <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{formatCurrency(kar)}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Müşteriden Alınan:</span>
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(gelir)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Taşerona Ödenen:</span>
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(maliyet)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })()}
          
          {/* Kar/Zarar Özeti */}
          {!isSubcontractor && analysis && formData.baslangicFiyati && (() => {
            const entered = Number(formData.baslangicFiyati) || 0
            const breakEven = analysis.onerilenMinFiyat || 0
            const delta = entered - breakEven
            const pct = entered > 0 ? (delta / entered) * 100 : 0
            const profitStatus = getProfitStatus(delta)
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-xl p-6 relative overflow-hidden"
                style={{ 
                  background: delta > 100 ? 'rgba(48, 209, 88, 0.15)' : delta < -100 ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 214, 10, 0.15)',
                  border: delta > 100 ? '0.5px solid rgba(48, 209, 88, 0.3)' : delta < -100 ? '0.5px solid rgba(255, 69, 58, 0.3)' : '0.5px solid rgba(255, 214, 10, 0.3)',
                }}
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
                  style={{ backgroundColor: delta > 100 ? '#30D158' : delta < -100 ? '#FF453A' : '#FFD60A' }}
                />
                <div className="relative text-center">
                  <div className="mb-3">
                    <span className="text-4xl">{profitStatus.icon}</span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    {profitStatus.text}
                  </p>
                  <p className="text-5xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                    {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                  </p>
                  <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Başabaş Farkı:</span>
                      <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{formatCurrency(delta)}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Girilen Fiyat:</span>
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(entered)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Başabaş Noktası:</span>
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(breakEven)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Toplam Maliyet:</span>
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(analysis.toplamMaliyet)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })()}

          {/* Modern Maliyet Detayı */}
          {!isSubcontractor && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)' }}>
                  <Calculator className="w-5 h-5" style={{ color: '#0A84FF' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
                  Maliyet Analizi
                </h3>
              </div>

              <div className="space-y-3">
                {/* Etkin Mesafe */}
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#0A84FF' }} />
                      <span className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Etkin Mesafe:</span>
                    </div>
                    <span className="font-bold text-lg" style={{ color: '#FFFFFF' }}>
                      {analysis.etkinKm.toFixed(0)} km
                    </span>
                  </div>
                </div>
                
                {/* Maliyet Kalemleri */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      <Zap className="w-3.5 h-3.5" style={{ color: '#FFD60A' }} />
                      Yakıt ({analysis.costBreakdown.yakitLitre?.toFixed(1)} lt):
                    </span>
                    <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(analysis.costBreakdown.yakitMaliyet)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      <Activity className="w-3.5 h-3.5" style={{ color: '#0A84FF' }} />
                      Sürücü ({analysis.costBreakdown.surucuGun} gün):
                    </span>
                    <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(analysis.costBreakdown.surucuMaliyet)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      🍽️ Yemek:
                    </span>
                    <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(analysis.costBreakdown.yemekMaliyet)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      🛣️ HGS/Köprü:
                    </span>
                    <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(analysis.costBreakdown.hgsMaliyet)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      🔧 Bakım:
                    </span>
                    <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(analysis.costBreakdown.toplamBakimMaliyet)}
                    </span>
                  </div>
                </div>
                
                {/* Toplam Maliyet */}
                <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 69, 58, 0.15)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold" style={{ color: '#FF453A' }}>Toplam Maliyet:</span>
                    <span className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                      {formatCurrency(analysis.toplamMaliyet)}
                    </span>
                  </div>
                </div>
                
                {/* Önerilen Fiyat */}
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Önerilen Fiyat:</span>
                    <span className="text-lg font-bold" style={{ color: '#30D158' }}>
                      {formatCurrency(analysis.fiyatKdvli)}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>(+%45 kar +%20 KDV)</p>
                </div>

                {/* Başabaş */}
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 214, 10, 0.15)', border: '0.5px solid rgba(255, 214, 10, 0.3)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Başabaş Noktası:</span>
                    <span className="text-lg font-bold" style={{ color: '#FFD60A' }}>
                      {formatCurrency(analysis.onerilenMinFiyat)}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>(Sadece +%20 KDV)</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bilgi Kartı */}
          <Card className="bg-blue-50">
            <div className="space-y-2 text-xs text-blue-800">
              <p><strong>💡 İpuçları:</strong></p>
              <p>• Fiyat otomatik hesaplanır</p>
              <p>• İstersen manuel değiştirebilirsin</p>
              <p>• Kâr/zarar anlık güncellenir</p>
              <p>• Dönüşte yük bulursan maliyet düşer</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

