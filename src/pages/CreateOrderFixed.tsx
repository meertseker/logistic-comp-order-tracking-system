import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import VehicleSelect from '../components/VehicleSelect'
import TextArea from '../components/TextArea'
import RoutePicker from '../components/RoutePicker'
import { formatCurrency } from '../utils/formatters'
import { PlusIcon } from '../components/Icons'
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
  
  const [formData, setFormData] = useState({
    plaka: '',
    musteri: '',
    telefon: '',
    nereden: '',
    nereye: '',
    yukAciklamasi: '',
    baslangicFiyati: '',
    gidisKm: '',
    donusKm: '',
    returnLoadRate: '0', // 0-100
    tahminiGun: '1',
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

    if (!formData.plaka) newErrors.plaka = 'Araç seçimi zorunludur'
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
      const result = await window.electronAPI.db.createOrder({
        plaka: formData.plaka.trim(),
        musteri: formData.musteri.trim(),
        telefon: formData.telefon.trim(),
        nereden: normalizeCity(formData.nereden),
        nereye: normalizeCity(formData.nereye),
        yukAciklamasi: formData.yukAciklamasi.trim(),
        baslangicFiyati: Number(formData.baslangicFiyati),
        
        gidisKm: Number(formData.gidisKm),
        donusKm: Number(formData.donusKm) || 0,
        returnLoadRate: Number(formData.returnLoadRate) / 100,
        etkinKm: analysis?.etkinKm || 0,
        tahminiGun: Number(formData.tahminiGun) || 1,
        
        yakitLitre: analysis?.costBreakdown?.yakitLitre || 0,
        yakitMaliyet: analysis?.costBreakdown?.yakitMaliyet || 0,
        surucuMaliyet: analysis?.costBreakdown?.surucuMaliyet || 0,
        yemekMaliyet: analysis?.costBreakdown?.yemekMaliyet || 0,
        hgsMaliyet: analysis?.costBreakdown?.hgsMaliyet || 0,
        bakimMaliyet: analysis?.costBreakdown?.toplamBakimMaliyet || 0,
        toplamMaliyet: analysis?.toplamMaliyet || 0,
        
        onerilenFiyat: analysis?.fiyatKdvli || 0,
        karZarar: analysis?.karZarar || 0,
        karZararYuzde: analysis?.karZararYuzde || 0,
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yeni Sipariş Oluştur</h1>
        <p className="mt-1 text-gray-600">Profesyonel maliyet analizi ile sipariş ekleyin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form - Sol taraf */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Araç Seçimi */}
              <div>
                <h3 className="text-lg font-semibold mb-4">1️⃣ Araç Bilgileri</h3>
                
                {loadingVehicles ? (
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
                            <PlusIcon className="w-4 h-4 mr-2" />
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
                    {formData.plaka && costBreakdown && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Seçili Araç:</span> {formatCurrency(costBreakdown.toplamMaliyetPerKm)}/km (ortalama)
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
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                        tripType === 'oneway'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      🔜 Tek Yön
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType('roundtrip')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                        tripType === 'roundtrip'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
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

              {/* Dönüşte Yük (Sadece Gidiş-Dönüş İçin) */}
              {tripType === 'roundtrip' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">4️⃣ Dönüş Optimizasyonu</h3>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Dönüşte Yük Bulma İhtimali
                      </label>
                      <span className="text-sm font-bold text-primary-600">%{formData.returnLoadRate}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.returnLoadRate}
                      onChange={handleSliderChange}
                      className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>🔴 Boş (0%)</span>
                      <span>🟡 Yarı (%50)</span>
                      <span>🟢 Dolu (%100)</span>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        💡 <strong>İpucu:</strong> Dönüşte yük bulunursa maliyet önemli ölçüde düşer.
                        %100 dolu dönüş = dönüş km'si maliyet sıfır!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Yük Açıklaması */}
              <div>
                <h3 className="text-lg font-semibold mb-4">5️⃣ Yük Detayları</h3>
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
                <h3 className="text-lg font-semibold mb-4">6️⃣ Fiyatlandırma</h3>
                
                {/* Otomatik Fiyat Toggle */}
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
                  disabled={vehicles.length === 0}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                  }}
                  helperText={autoPrice ? 'Önerilen fiyat otomatik uygulanıyor' : 'Manuel fiyat girişi'}
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

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/orders')}
                  disabled={loading}
                >
                  ← Geri
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || analyzing || vehicles.length === 0}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Oluşturuluyor...
                    </>
                  ) : (
                    '✓ Sipariş Oluştur'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Analiz Panel - Sağ taraf */}
        <div className="space-y-4">
          {/* Kar/Zarar Özeti */}
          {analysis && formData.baslangicFiyati && (() => {
            const entered = Number(formData.baslangicFiyati) || 0
            const breakEven = analysis.onerilenMinFiyat || 0
            const delta = entered - breakEven
            const pct = entered > 0 ? (delta / entered) * 100 : 0
            return (
              <Card className={`${getProfitBgColor(delta)} border-2`}>
                <div className="text-center">
                  <div className="mb-2">
                    <span className="text-2xl">{getProfitStatus(delta).icon}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Kâr Oranı</p>
                  <p className={`text-4xl font-bold ${getProfitColor(delta)} mb-1`}>
                    {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                  </p>
                  <div className="mt-2 text-sm">
                    <p className="text-gray-700 font-medium">Başabaş Farkı: <span className={`${getProfitColor(delta)} font-semibold`}>{formatCurrency(delta)}</span></p>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-700 font-medium">Girilen fiyat: {formatCurrency(entered)}</p>
                    <p className="text-xs text-gray-600">Başabaş: {formatCurrency(breakEven)}</p>
                    <p className="text-xs text-gray-600">Maliyet: {formatCurrency(analysis.toplamMaliyet)}</p>
                  </div>
                </div>
              </Card>
            )
          })()}

          {/* Maliyet Detayı */}
          {analysis && (
            <Card title="📊 Maliyet Analizi">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Etkin Mesafe:</span>
                  <span className="font-semibold">{analysis.etkinKm.toFixed(0)} km</span>
                </div>
                
                <div className="border-t pt-2 mt-2 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">⛽ Yakıt ({analysis.costBreakdown.yakitLitre?.toFixed(1)} lt):</span>
                    <span className="font-medium">{formatCurrency(analysis.costBreakdown.yakitMaliyet)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">👤 Sürücü ({analysis.costBreakdown.surucuGun} gün):</span>
                    <span className="font-medium">{formatCurrency(analysis.costBreakdown.surucuMaliyet)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">🍽️ Yemek:</span>
                    <span className="font-medium">{formatCurrency(analysis.costBreakdown.yemekMaliyet)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">🛣️ HGS/Köprü:</span>
                    <span className="font-medium">{formatCurrency(analysis.costBreakdown.hgsMaliyet)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">🔧 Bakım:</span>
                    <span className="font-medium">{formatCurrency(analysis.costBreakdown.toplamBakimMaliyet)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-2 mt-2 bg-red-50 rounded p-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-red-800">Toplam Maliyet:</span>
                    <span className="text-red-600">{formatCurrency(analysis.toplamMaliyet)}</span>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded p-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">Önerilen Fiyat:</span>
                    <span className="font-bold text-green-700">{formatCurrency(analysis.fiyatKdvli)}</span>
                  </div>
                  <p className="text-xs text-gray-600">(+%45 kar +%20 KDV)</p>
                </div>

                <div className="bg-yellow-50 rounded p-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700">Başabaş:</span>
                    <span className="font-medium text-yellow-700">{formatCurrency(analysis.onerilenMinFiyat)}</span>
                  </div>
                  <p className="text-xs text-gray-600">(Sadece +%20 KDV)</p>
                </div>
              </div>
            </Card>
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

