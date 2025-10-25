import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import TextArea from '../components/TextArea'

export default function CreateOrder() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    plaka: '',
    musteri: '',
    telefon: '',
    nereden: '',
    nereye: '',
    yukAciklamasi: '',
    baslangicFiyati: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.plaka.trim()) newErrors.plaka = 'Plaka zorunludur'
    if (!formData.musteri.trim()) newErrors.musteri = 'Müşteri adı zorunludur'
    if (!formData.telefon.trim()) newErrors.telefon = 'Telefon numarası zorunludur'
    if (!formData.nereden.trim()) newErrors.nereden = 'Nereden bilgisi zorunludur'
    if (!formData.nereye.trim()) newErrors.nereye = 'Nereye bilgisi zorunludur'
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yeni Sipariş Oluştur</h1>
        <p className="mt-1 text-gray-600">Yeni bir taşıma siparişi ekleyin</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Plaka"
              name="plaka"
              value={formData.plaka}
              onChange={handleChange}
              error={errors.plaka}
              placeholder="34 ABC 123"
              required
            />
            <Input
              label="Müşteri Adı"
              name="musteri"
              value={formData.musteri}
              onChange={handleChange}
              error={errors.musteri}
              placeholder="Ahmet Yılmaz"
              required
            />
          </div>

          <Input
            label="Telefon Numarası"
            name="telefon"
            type="tel"
            value={formData.telefon}
            onChange={handleChange}
            error={errors.telefon}
            placeholder="0532 123 45 67"
            required
          />

          {/* Route Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Load Description */}
          <TextArea
            label="Yük Açıklaması"
            name="yukAciklamasi"
            value={formData.yukAciklamasi}
            onChange={handleChange}
            error={errors.yukAciklamasi}
            placeholder="Yük hakkında detaylı bilgi..."
            rows={4}
          />

          {/* Price */}
          <Input
            label="Başlangıç Fiyatı (₺)"
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Sipariş Oluştur'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

