import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import TextArea from '../components/TextArea'
import { formatCurrency } from '../utils/formatters'
import { PlusIcon } from '../components/Icons'

export default function CreateOrderAdvanced() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  
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
  })
  
  const [analysis, setAnalysis] = useState<any>(null)
  const [costBreakdown, setCostBreakdown] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Araçları yükle
    loadVehicles()
  }, [])

  useEffect(() => {
    // Araç seçilince maliyet breakdown'ını yükle
    if (formData.plaka) {
      loadCostBreakdown()
    }
  }, [formData.plaka])

  useEffect(() => {
    // Form değiştiğinde analiz yap
    if (formData.plaka && formData.gidisKm && formData.baslangicFiyati) {
      analyzeOrder()
    }
  }, [formData.gidisKm, formData.donusKm, formData.returnLoadRate, formData.baslangicFiyati, formData.plaka])

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true)
      const data = await window.electronAPI.db.getVehicles()
      setVehicles(data)
      
      // Eğer tek araç varsa otomatik seç
      if (data.length === 1) {
        setFormData(prev => ({ ...prev, plaka: data[0].plaka }))
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error)
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
    if (!formData.gidisKm || !formData.baslangicFiyati) return
    
    try {
      setAnalyzing(true)
      const result = await window.electronAPI.cost.analyze({
        plaka: formData.plaka,
        gidisKm: Number(formData.gidisKm),
        donusKm: Number(formData.donusKm) || 0,
        returnLoadRate: Number(formData.returnLoadRate) / 100,
        ilkFiyat: Number(formData.baslangicFiyati),
      })
      setAnalysis(result)
    } catch (error) {
      console.error('Failed to analyze order:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, returnLoadRate: e.target.value }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.plaka) newErrors.plaka = 'Araç seçimi zorunludur'
    if (!formData.musteri.trim()) newErrors.musteri = 'Müşteri adı zorunludur'
    if (!formData.telefon.trim()) newErrors.telefon = 'Telefon numarası zorunludur'
    if (!formData.nereden.trim()) newErrors.nereden = 'Nereden bilgisi zorunludur'
    if (!formData.nereye.trim()) newErrors.nereye = 'Nereye bilgisi zorunludur'
    
    if (!formData.gidisKm.trim()) {
      newErrors.gidisKm = 'Gidiş km zorunludur'
    } else if (isNaN(Number(formData.gidisKm)) || Number(formData.gidisKm) <= 0) {
      newErrors.gidisKm = 'Geçerli bir km giriniz'
    }
    
    if (!formData.baslangicFiyati.trim()) {
      newErrors.baslangicFiyati = 'Başlangıç fiyatı zorunludur'
    } else if (isNaN(Number(formData.baslangicFiyati)) || Number(formData.baslangicFiyati) < 0) {
      newErrors.baslangicFiyati = 'Geçerli bir fiyat giriniz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    try {
      setLoading(true)
      const result = await window.electronAPI.db.createOrder({
        plaka: formData.plaka.trim(),
        musteri: formData.musteri.trim(),
        telefon: formData.telefon.trim(),
        nereden: formData.nereden.trim(),
        nereye: formData.nereye.trim(),
        yukAciklamasi: formData.yukAciklamasi.trim(),
        baslangicFiyati: Number(formData.baslangicFiyati),
        gidisKm: Number(formData.gidisKm),
        donusKm: Number(formData.donusKm) || 0,
        returnLoadRate: Number(formData.returnLoadRate) / 100,
        // Analiz sonuçlarını da kaydet
        etkinKm: analysis?.etkinKm || 0,
        toplamMaliyet: analysis?.toplamMaliyet || 0,
        onerilenFiyat: analysis?.fiyatKdvli || 0,
        karZarar: analysis?.karZarar || 0,
      })

      if (result.success) {
        navigate(`/orders/${result.id}`)
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Sipariş oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getProfitColor = (karZarar: number) => {
    if (karZarar > 0) return 'text-green-600'
    if (karZarar < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getProfitBgColor = (karZarar: number) => {
    if (karZarar > 0) return 'bg-green-50 border-green-200'
    if (karZarar < 0) return 'bg-red-50 border-red-200'
    return 'bg-gray-50 border-gray-200'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yeni Sipariş Oluştur</h1>
        <p className="mt-1 text-gray-600">Maliyet analizi ile yeni taşıma siparişi ekleyin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form - Sol taraf */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Araç ve Müşteri Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Araç ve Müşteri Bilgileri</h3>
                
                {/* Araç Seçimi */}
                {loadingVehicles ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Araçlar yükleniyor...</p>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-yellow-800">Henüz Araç Eklenmemiş</h3>
                        <p className="mt-1 text-sm text-yellow-700">
                          Sipariş oluşturmak için önce en az bir araç eklemelisiniz.
                        </p>
                        <div className="mt-3">
                          <Link to="/vehicles">
                            <Button size="sm">
                              <PlusIcon className="w-4 h-4 mr-2" />
                              Araç Ekle
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <Select
                      label="Araç Seçimi"
                      name="plaka"
                      value={formData.plaka}
                      onChange={handleChange}
                      error={errors.plaka}
                      required
                      options={[
                        { value: '', label: 'Araç Seçiniz...' },
                        ...vehicles.map(v => ({
                          value: v.plaka,
                          label: `${v.plaka} (${formatCurrency(
                            v.arac_degeri / v.hedef_toplam_km + 
                            v.bakim_maliyet / v.bakim_aralik_km + 
                            v.ek_masraf_per_1000 / 1000 + 
                            v.benzin_per_km + 
                            v.gunluk_ucret / v.gunluk_ort_km
                          )}/km)`
                        }))
                      ]}
                    />
                    {formData.plaka && costBreakdown && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Seçili Araç Maliyeti:</span> {formatCurrency(costBreakdown.toplamMaliyetPerKm)}/km
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
                    label="Telefon Numarası"
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

              {/* Güzergah Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Güzergah Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nereden"
                    name="nereden"
                    value={formData.nereden}
                    onChange={handleChange}
                    error={errors.nereden}
                    placeholder="İstanbul"
                    required
                  />
                  <Input
                    label="Nereye"
                    name="nereye"
                    value={formData.nereye}
                    onChange={handleChange}
                    error={errors.nereye}
                    placeholder="Ankara"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Gidiş Km"
                    name="gidisKm"
                    type="number"
                    value={formData.gidisKm}
                    onChange={handleChange}
                    error={errors.gidisKm}
                    placeholder="450"
                    required
                  />
                  <Input
                    label="Dönüş Km"
                    name="donusKm"
                    type="number"
                    value={formData.donusKm}
                    onChange={handleChange}
                    placeholder="450 (boş bırakılabilir)"
                  />
                </div>
              </div>

              {/* Dönüşte Yük Bulma Oranı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dönüşte Yük Bulma Oranı: %{formData.returnLoadRate}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.returnLoadRate}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Boş Dönüş (0%)</span>
                  <span>Yarı Dolu (%50)</span>
                  <span>Tam Dolu (%100)</span>
                </div>
              </div>

              {/* Yük Açıklaması */}
              <TextArea
                label="Yük Açıklaması"
                name="yukAciklamasi"
                value={formData.yukAciklamasi}
                onChange={handleChange}
                placeholder="Yük hakkında detaylı bilgi..."
                rows={3}
              />

              {/* Müşteri Fiyatı */}
              <Input
                label="Müşteriden Alınan Ücret (₺)"
                name="baslangicFiyati"
                type="number"
                step="0.01"
                value={formData.baslangicFiyati}
                onChange={handleChange}
                error={errors.baslangicFiyati}
                placeholder="0.00"
                required
              />

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/orders')}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || analyzing || vehicles.length === 0}
                >
                  {loading ? 'Oluşturuluyor...' : 'Sipariş Oluştur'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Analiz - Sağ taraf */}
        <div className="space-y-4">
          {/* Kar/Zarar Özeti */}
          {analysis && (
            <Card className={`${getProfitBgColor(analysis.karZarar)} border-2`}>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Kar/Zarar Durumu</p>
                <p className={`text-4xl font-bold ${getProfitColor(analysis.karZarar)}`}>
                  {formatCurrency(analysis.karZarar)}
                </p>
                <p className={`text-sm mt-1 ${getProfitColor(analysis.karZarar)}`}>
                  {analysis.karZararYuzde > 0 ? '+' : ''}
                  {analysis.karZararYuzde.toFixed(2)}%
                </p>
              </div>
            </Card>
          )}

          {/* Maliyet Detayı */}
          {analysis && (
            <Card title="Maliyet Analizi">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Etkin Km:</span>
                  <span className="font-semibold">{analysis.etkinKm.toFixed(0)} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Toplam Maliyet:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(analysis.toplamMaliyet)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>• Amortisman:</span>
                    <span>{formatCurrency(analysis.maliyetDetay.amortisman)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>• Yakıt:</span>
                    <span>{formatCurrency(analysis.maliyetDetay.benzin)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>• Sürücü:</span>
                    <span>{formatCurrency(analysis.maliyetDetay.surucu)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>• Bakım:</span>
                    <span>{formatCurrency(analysis.maliyetDetay.bakim)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>• Ek Masraf:</span>
                    <span>{formatCurrency(analysis.maliyetDetay.ekMasraf)}</span>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Önerilen Fiyat:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(analysis.fiyatKdvli)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    (Maliyet + %45 Kar + %20 KDV)
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Km Başı Maliyet */}
          {costBreakdown && (
            <Card title="Km Başı Maliyet">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amortisman:</span>
                  <span>{formatCurrency(costBreakdown.amortPerKm)}/km</span>
                </div>
                <div className="flex justify-between">
                  <span>Yakıt:</span>
                  <span>{formatCurrency(costBreakdown.benzinPerKm)}/km</span>
                </div>
                <div className="flex justify-between">
                  <span>Sürücü:</span>
                  <span>{formatCurrency(costBreakdown.driverPerKm)}/km</span>
                </div>
                <div className="flex justify-between">
                  <span>Bakım:</span>
                  <span>{formatCurrency(costBreakdown.bakimPerKm)}/km</span>
                </div>
                <div className="flex justify-between">
                  <span>Ek Masraf:</span>
                  <span>{formatCurrency(costBreakdown.ekMasrafPerKm)}/km</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Toplam:</span>
                  <span className="text-primary-600">
                    {formatCurrency(costBreakdown.toplamMaliyetPerKm)}/km
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Uyarılar */}
          {analysis && analysis.karZarar < 0 && (
            <Card className="bg-red-50 border border-red-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Zarar Uyarısı!</h3>
                  <p className="mt-1 text-xs text-red-700">
                    Bu işte {formatCurrency(Math.abs(analysis.karZarar))} zarar ediyorsunuz.
                    Önerilen fiyat: {formatCurrency(analysis.fiyatKdvli)}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

