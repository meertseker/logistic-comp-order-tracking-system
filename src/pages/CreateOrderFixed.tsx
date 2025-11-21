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
  Plus,
  Users,
  Package
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
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-4 mb-2">
            <Link to="/orders">
              <motion.button
                whileHover={{ scale: 1.05, x: -4 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(10, 132, 255, 0.15)', 
                  color: '#0A84FF',
                  border: '0.5px solid rgba(10, 132, 255, 0.3)'
                }}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold" style={{ color: '#FFFFFF' }}>
                Yeni Sipariş Oluştur
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg ml-10 sm:ml-16" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            🎯 Profesyonel maliyet analizi ile sipariş ekleyin
          </p>
      </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Form - Sol taraf */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Taşeron Toggle - Modern Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#FF9F0A' }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.15)' }}>
                    <Truck className="w-5 h-5" style={{ color: '#FF9F0A' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Taşeron Firma</p>
                    <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
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
                  <div className="w-11 h-6 rounded-full transition-all duration-200 peer-checked:bg-[#FF9F0A] peer-focus:ring-4 peer-focus:ring-[#FF9F0A]/20" style={{ backgroundColor: isSubcontractor ? '#FF9F0A' : 'rgba(84, 84, 88, 0.65)' }}>
                    <div className={`absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-transform duration-200 ${isSubcontractor ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Araç Seçimi veya Taşeron Bilgileri */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-xl p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#0A84FF' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)' }}>
                    <Truck className="w-4 h-4" style={{ color: '#0A84FF' }} />
                  </div>
                  <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                    {isSubcontractor ? 'Taşeron Firma Bilgileri' : 'Araç Bilgileri'}
                  </h3>
                </div>
                
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
                          <span className="font-semibold text-white mr-1">Seçili Araç Maliyeti:</span>
                          {(() => {
                            const v = vehicles.find(v => v.plaka === formData.plaka)
                            if (!v) return 'Araç bulunamadı'
                            
                            console.log('Seçili araç:', v.plaka)
                            console.log('Yakıt tüketimi:', v.yakit_tuketimi, 'Yakıt fiyatı:', v.yakit_fiyati)
                            console.log('Günlük ücret:', v.gunluk_ucret, 'Günlük ort km:', v.gunluk_ort_km)
                            console.log('Yemek günlük:', v.yemek_gunluk)
                            console.log('Sigorta yıllık:', v.sigorta_yillik, 'MTV:', v.mtv_yillik, 'Muayene:', v.muayene_yillik)
                            console.log('Hedef toplam km:', v.hedef_toplam_km)
                            
                            const yakit = ((v.yakit_tuketimi || 25) * (v.yakit_fiyati || 40)) / 100
                            const surucu = (v.gunluk_ucret || 1600) / (v.gunluk_ort_km || 500)
                            const yemek = (v.yemek_gunluk || 150) / (v.gunluk_ort_km || 500)
                            const bakim = ((v.yag_maliyet || 500) / (v.yag_aralik || 5000)) + ((v.lastik_maliyet || 8000) / (v.lastik_omur || 50000)) + ((v.buyuk_bakim_maliyet || 3000) / (v.buyuk_bakim_aralik || 15000))
                            // HGS güzergah bazlı hesaplanır, araç bazında değil. Sabit giderler (sigorta/MTV/muayene) dahil.
                            const yillikKm = v.hedef_toplam_km || 120000
                            const sigortaPerKm = (v.sigorta_yillik || 12000) / yillikKm
                            const mtvPerKm = (v.mtv_yillik || 5000) / yillikKm
                            const muayenePerKm = (v.muayene_yillik || 1500) / yillikKm
                            const toplam = yakit + surucu + yemek + bakim + sigortaPerKm + mtvPerKm + muayenePerKm
                            
                            console.log('Yakıt:', yakit.toFixed(2), 'Sürücü:', surucu.toFixed(2), 'Yemek:', yemek.toFixed(2), 'Bakım:', bakim.toFixed(2))
                            console.log('Sigorta/km:', sigortaPerKm.toFixed(2), 'MTV/km:', mtvPerKm.toFixed(2), 'Muayene/km:', muayenePerKm.toFixed(2))
                            console.log('Toplam maliyet:', toplam.toFixed(2), '₺/km')
                            
                            return `${toplam.toFixed(2)} ₺/km (Yakıt: ${yakit.toFixed(2)} + Sürücü: ${surucu.toFixed(2)} + Yemek: ${yemek.toFixed(2)} + Bakım: ${bakim.toFixed(2)} + Sigorta/MTV/Muayene: ${(sigortaPerKm + mtvPerKm + muayenePerKm).toFixed(2)})`
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Müşteri Bilgileri */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#30D158' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)' }}>
                    <Users className="w-4 h-4" style={{ color: '#30D158' }} />
                  </div>
                  <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Müşteri Bilgileri</h3>
                </div>
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
            </motion.div>

            {/* Güzergah */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#BF5AF2' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(191, 90, 242, 0.15)' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#BF5AF2' }} />
                  </div>
                  <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Güzergah ve Mesafe</h3>
                </div>
                
                {/* Sefer Tipi - Modern Buttons */}
                <div className="mb-4">
                  <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sefer Tipi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setTripType('oneway')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2.5 rounded-lg border transition-all font-medium text-sm"
                      style={
                        tripType === 'oneway'
                          ? { 
                              backgroundColor: 'rgba(10, 132, 255, 0.15)', 
                              borderColor: 'rgba(10, 132, 255, 0.5)', 
                              color: '#0A84FF',
                              boxShadow: '0 0 0 1px rgba(10, 132, 255, 0.2)'
                            }
                          : { 
                              borderColor: 'rgba(84, 84, 88, 0.35)', 
                              color: 'rgba(235, 235, 245, 0.7)',
                              backgroundColor: 'transparent'
                            }
                      }
                    >
                      🔜 Tek Yön
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setTripType('roundtrip')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2.5 rounded-lg border transition-all font-medium text-sm"
                      style={
                        tripType === 'roundtrip'
                          ? { 
                              backgroundColor: 'rgba(10, 132, 255, 0.15)', 
                              borderColor: 'rgba(10, 132, 255, 0.5)', 
                              color: '#0A84FF',
                              boxShadow: '0 0 0 1px rgba(10, 132, 255, 0.2)'
                            }
                          : { 
                              borderColor: 'rgba(84, 84, 88, 0.35)', 
                              color: 'rgba(235, 235, 245, 0.7)',
                              backgroundColor: 'transparent'
                            }
                      }
                    >
                      🔄 Gidiş-Dönüş
                    </motion.button>
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
            </motion.div>

            {/* Yük Açıklaması */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-xl p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#FF9F0A' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.15)' }}>
                    <Package className="w-4 h-4" style={{ color: '#FF9F0A' }} />
                  </div>
                  <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Yük Detayları</h3>
                </div>
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
            </motion.div>

            {/* Fiyat */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-xl p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: '#30D158' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)' }}>
                    <DollarSign className="w-4 h-4" style={{ color: '#30D158' }} />
                  </div>
                  <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Fiyatlandırma</h3>
                </div>
                
                {/* Otomatik Fiyat Toggle - Modern */}
                {!isSubcontractor && (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between mb-4 p-3 rounded-lg" 
                    style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', border: '0.5px solid rgba(10, 132, 255, 0.2)' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Otomatik Fiyat</p>
                      <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sistem önerilen fiyatı otomatik uygular</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoPrice}
                        onChange={() => setAutoPrice(!autoPrice)}
                      />
                      <div className="w-11 h-6 rounded-full transition-all duration-200 peer-checked:bg-[#0A84FF] peer-focus:ring-4 peer-focus:ring-[#0A84FF]/20" style={{ backgroundColor: autoPrice ? '#0A84FF' : 'rgba(84, 84, 88, 0.65)' }}>
                        <div className={`absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-transform duration-200 ${autoPrice ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </label>
                  </motion.div>
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
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center justify-between p-3 rounded-lg" 
                    style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}
                  >
                    <div>
                      <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sistem Önerisi:</p>
                      <p className="text-lg font-bold" style={{ color: '#30D158' }}>{formatCurrency(analysis.fiyatKdvli)}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, baslangicFiyati: Math.round(analysis.fiyatKdvli).toString() }))}
                    >
                      Uygula
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Modern Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between pt-4"
            >
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
            </motion.div>
          </form>
        </div>

        {/* Modern Analiz Panel - Sağ taraf - iOS 26 Style */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {/* Kar/Zarar Özeti - Kompakt StatCard */}
          {!isSubcontractor && analysis && formData.baslangicFiyati && (() => {
            const entered = Number(formData.baslangicFiyati) || 0
            const breakEven = analysis.onerilenMinFiyat || 0
            const delta = entered - breakEven
            const pct = entered > 0 ? (delta / entered) * 100 : 0
            const profitStatus = getProfitStatus(delta)
            const color = delta > 100 ? '#30D158' : delta < -100 ? '#FF453A' : '#FFD60A'
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card rounded-xl p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: color }} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
                      <TrendingUp className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Kar/Zarar</p>
                      <p className="text-2xl font-bold" style={{ color }}>{pct > 0 ? '+' : ''}{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Fark:</span>
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(delta)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Fiyat:</span>
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(entered)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })()}

          {/* Taşeron Kar/Zarar - Kompakt */}
          {isSubcontractor && formData.baslangicFiyati && formData.subcontractorCost && (() => {
            const gelir = Number(formData.baslangicFiyati) || 0
            const maliyet = Number(formData.subcontractorCost) || 0
            const kar = gelir - maliyet
            const karYuzde = gelir > 0 ? (kar / gelir) * 100 : 0
            const color = kar > 0 ? '#30D158' : kar < 0 ? '#FF453A' : '#FFD60A'
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card rounded-xl p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: color }} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
                      <DollarSign className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Kar Marjı</p>
                      <p className="text-2xl font-bold" style={{ color }}>{karYuzde > 0 ? '+' : ''}{karYuzde.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Net Kar:</span>
                      <span className="font-semibold" style={{ color: '#FFFFFF' }}>{formatCurrency(kar)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })()}

          {/* Maliyet Analizi - Kompakt Grid */}
          {!isSubcontractor && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-xl p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#0A84FF' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: '#0A84FF20' }}>
                    <Calculator className="w-5 h-5" style={{ color: '#0A84FF' }} />
                  </div>
                  <h3 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Maliyet Analizi</h3>
                </div>

                <div className="space-y-3">
                  {/* Etkin Mesafe - Kompakt */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" style={{ color: '#0A84FF' }} />
                      <span className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Mesafe</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{analysis.etkinKm.toFixed(0)} km</span>
                  </div>
                  
                  {/* Maliyet Kalemleri - Kompakt Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 214, 10, 0.1)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="w-3 h-3" style={{ color: '#FFD60A' }} />
                        <span className="text-[10px] font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yakıt</span>
                      </div>
                      <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>{formatCurrency(analysis.costBreakdown.yakitMaliyet)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Activity className="w-3 h-3" style={{ color: '#0A84FF' }} />
                        <span className="text-[10px] font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sürücü</span>
                      </div>
                      <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>{formatCurrency(analysis.costBreakdown.surucuMaliyet)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.1)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px]">🍽️</span>
                        <span className="text-[10px] font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yemek</span>
                      </div>
                      <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>{formatCurrency(analysis.costBreakdown.yemekMaliyet)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px]">🔧</span>
                        <span className="text-[10px] font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Bakım</span>
                      </div>
                      <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>{formatCurrency(analysis.costBreakdown.toplamBakimMaliyet)}</p>
                    </div>
                  </div>

                  {analysis.costBreakdown.hgsMaliyet > 0 && (
                    <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(191, 90, 242, 0.1)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px]">🛣️</span>
                          <span className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>HGS/Köprü</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>{formatCurrency(analysis.costBreakdown.hgsMaliyet)}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Toplam Maliyet */}
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 69, 58, 0.15)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold" style={{ color: '#FF453A' }}>Toplam</span>
                      <span className="text-base font-bold" style={{ color: '#FFFFFF' }}>{formatCurrency(analysis.toplamMaliyet)}</span>
                    </div>
                  </div>
                  
                  {/* Önerilen Fiyat & Başabaş - Yan Yana */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}>
                      <p className="text-[10px] mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Önerilen</p>
                      <p className="text-sm font-bold" style={{ color: '#30D158' }}>{formatCurrency(analysis.fiyatKdvli)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255, 214, 10, 0.15)', border: '0.5px solid rgba(255, 214, 10, 0.3)' }}>
                      <p className="text-[10px] mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Başabaş</p>
                      <p className="text-sm font-bold" style={{ color: '#FFD60A' }}>{formatCurrency(analysis.onerilenMinFiyat)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

