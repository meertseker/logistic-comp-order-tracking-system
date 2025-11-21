import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  MapPin, 
  Zap, 
  Activity,
  AlertCircle
} from 'lucide-react'
import Input from './Input'
import VehicleSelectCompact from './VehicleSelectCompact'
import RoutePicker from './RoutePicker'
import { formatCurrency } from '../utils/formatters'
import { useDebounce } from '../hooks/useDebounce'

export default function CostCalculator() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [route, setRoute] = useState({ from: '', to: '', gidisKm: 0, hgs: 0, kopru: 0, sure: 0 })
  const [gidisKm, setGidisKm] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  // Debounce expensive calculations
  const debouncedGidisKm = useDebounce(gidisKm, 500)

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    if (route.gidisKm) {
      setGidisKm(route.gidisKm.toString())
    }
  }, [route.gidisKm])

  useEffect(() => {
    if (selectedVehicle && debouncedGidisKm && Number(debouncedGidisKm) > 0 && route.from && route.to) {
      calculateCost()
    } else {
      setAnalysis(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle, route.from, route.to, debouncedGidisKm])

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true)
      const data = await window.electronAPI.db.getVehicles()
      setVehicles(data.filter((v: any) => v.aktif === 1))
    } catch (error) {
      console.error('Failed to load vehicles:', error)
    } finally {
      setLoadingVehicles(false)
    }
  }

  const calculateCost = async () => {
    if (!selectedVehicle || !debouncedGidisKm || Number(debouncedGidisKm) <= 0 || !route.from || !route.to) {
      return
    }

    try {
      setAnalyzing(true)
      
      // Tahmini gün hesaplama (500 km/gün bazında)
      const tahminiGun = Math.max(1, Math.ceil(Number(debouncedGidisKm) / 500))

      const orderData = {
        plaka: selectedVehicle,
        nereden: route.from,
        nereye: route.to,
        gidisKm: Number(debouncedGidisKm),
        donusKm: 0,
        returnLoadRate: 0,
        tahminiGun: tahminiGun,
        baslangicFiyati: 0,
      }

      const result = await window.electronAPI.cost.analyze(orderData)
      setAnalysis(result)
    } catch (error) {
      console.error('Failed to calculate cost:', error)
      setAnalysis(null)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRouteChange = (next: { from?: string; to?: string; gidisKm?: number; hgs?: number; kopru?: number; sure?: number }) => {
    setRoute(prev => ({
      ...prev,
      from: next.from ?? prev.from,
      to: next.to ?? prev.to,
      gidisKm: next.gidisKm ?? prev.gidisKm,
      hgs: next.hgs ?? prev.hgs,
      kopru: next.kopru ?? prev.kopru,
      sure: next.sure ?? prev.sure,
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)' }}>
          <Calculator className="w-5 h-5" style={{ color: '#0A84FF' }} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
          Masraf Hesaplama
        </h3>
      </div>

      <div className="space-y-4">
        {/* Araç Seçimi */}
        <div>
          {loadingVehicles ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-t-transparent" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'rgba(255, 159, 10, 0.1)', border: '0.5px solid rgba(255, 159, 10, 0.3)' }}>
              <p className="text-sm" style={{ color: '#FF9F0A' }}>
                Aktif araç bulunamadı
              </p>
            </div>
          ) : (
            <VehicleSelectCompact
              vehicles={vehicles}
              value={selectedVehicle}
              onChange={setSelectedVehicle}
            />
          )}
        </div>

        {/* Güzergah Seçimi */}
        {selectedVehicle && (
          <div>
            <RoutePicker
              from={route.from}
              to={route.to}
              onChange={handleRouteChange}
            />
          </div>
        )}

        {/* Gidiş Mesafesi */}
        {selectedVehicle && route.from && route.to && (
          <div>
            <Input
              label="Gidiş Mesafesi (km)"
              type="number"
              min="0"
              step="0.1"
              value={gidisKm}
              onChange={(e) => {
                const val = e.target.value
                if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                  setGidisKm(val)
                }
              }}
              placeholder="450"
              disabled={analyzing}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
              }}
            />
          </div>
        )}

        {/* Masraf Sonuçları */}
        {analyzing && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-t-transparent mx-auto mb-3" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
              <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Masraf hesaplanıyor...
              </p>
            </div>
          </div>
        )}

        {!analyzing && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Toplam Masraf - Büyük Gösterge */}
            <div className="p-5 rounded-lg relative overflow-hidden" style={{ 
              background: 'rgba(255, 69, 58, 0.15)', 
              border: '0.5px solid rgba(255, 69, 58, 0.3)' 
            }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#FF453A' }} />
              <div className="relative text-center">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  Toplam Masraf
                </p>
                <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(analysis.toplamMaliyet)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  {analysis.etkinKm.toFixed(0)} km için
                </p>
              </div>
            </div>

            {/* Etkin Mesafe */}
            <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: '#0A84FF' }} />
                <span className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Etkin Mesafe:</span>
              </div>
              <span className="font-bold text-lg" style={{ color: '#FFFFFF' }}>
                {analysis.etkinKm.toFixed(0)} km
              </span>
            </div>

            {/* Masraf Detayları */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  <Zap className="w-4 h-4" style={{ color: '#FFD60A' }} />
                  Yakıt ({analysis.costBreakdown.yakitLitre?.toFixed(1)} lt):
                </span>
                <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(analysis.costBreakdown.yakitMaliyet)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  <Activity className="w-4 h-4" style={{ color: '#0A84FF' }} />
                  Sürücü ({analysis.costBreakdown.surucuGun} gün):
                </span>
                <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(analysis.costBreakdown.surucuMaliyet)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>🍽️ Yemek:</span>
                <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(analysis.costBreakdown.yemekMaliyet)}
                </span>
              </div>
              {analysis.costBreakdown.hgsMaliyet > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>🛣️ HGS/Köprü:</span>
                  <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                    {formatCurrency(analysis.costBreakdown.hgsMaliyet)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>🔧 Bakım:</span>
                <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(analysis.costBreakdown.toplamBakimMaliyet)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>🏛️ Sigorta/MTV/Muayene:</span>
                <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(analysis.costBreakdown.sigortaMaliyet + analysis.costBreakdown.mtvMaliyet + analysis.costBreakdown.muayeneMaliyet)}
                </span>
              </div>
            </div>

            {/* Önerilen Fiyat ve Başabaş */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Önerilen Fiyat:</p>
                <p className="text-lg font-bold" style={{ color: '#30D158' }}>
                  {formatCurrency(analysis.fiyatKdvli)}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>(+%45 kar +%20 KDV)</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 214, 10, 0.15)', border: '0.5px solid rgba(255, 214, 10, 0.3)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Başabaş Noktası:</p>
                <p className="text-lg font-bold" style={{ color: '#FFD60A' }}>
                  {formatCurrency(analysis.onerilenMinFiyat)}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>(Sadece +%20 KDV)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bilgi Mesajı */}
        {selectedVehicle && route.from && route.to && !analysis && !analyzing && (
          <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#0A84FF' }} />
            <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.7)' }}>
              Gidiş mesafesini girin (güzergahtan otomatik doldurulur)
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

