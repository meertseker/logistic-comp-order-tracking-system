import { useMemo, useState } from 'react'
import Input from './Input'
import { Truck } from 'lucide-react'

interface Vehicle {
  plaka: string
  yakit_tuketimi?: number
  yakit_fiyati?: number
  gunluk_ucret?: number
  gunluk_ort_km?: number
  yemek_gunluk?: number
  yag_maliyet?: number
  yag_aralik?: number
  lastik_maliyet?: number
  lastik_omur?: number
  buyuk_bakim_maliyet?: number
  buyuk_bakim_aralik?: number
  sigorta_yillik?: number
  mtv_yillik?: number
  muayene_yillik?: number
  hedef_toplam_km?: number
}

interface VehicleSelectCompactProps {
  vehicles: Vehicle[]
  value: string
  onChange: (plaka: string) => void
  disabled?: boolean
}

export default function VehicleSelectCompact({ vehicles, value, onChange, disabled }: VehicleSelectCompactProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return vehicles
    return vehicles.filter(v => v.plaka.toLowerCase().includes(q))
  }, [vehicles, query])

  const costPerKm = (v: Vehicle): number => {
    const fuel = ((v.yakit_tuketimi || 25) * (v.yakit_fiyati || 40)) / 100
    const driver = (v.gunluk_ucret || 1600) / (v.gunluk_ort_km || 500)
    const meal = (v.yemek_gunluk || 150) / (v.gunluk_ort_km || 500)
    const maintenance = (
      (v.yag_maliyet || 500) / (v.yag_aralik || 5000) +
      (v.lastik_maliyet || 8000) / (v.lastik_omur || 50000) +
      (v.buyuk_bakim_maliyet || 3000) / (v.buyuk_bakim_aralik || 15000)
    )
    const yillikKm = v.hedef_toplam_km || 120000
    const insurance = (v.sigorta_yillik || 12000) / yillikKm
    const mtv = (v.mtv_yillik || 5000) / yillikKm
    const inspection = (v.muayene_yillik || 1500) / yillikKm
    
    return fuel + driver + meal + maintenance + insurance + mtv + inspection
  }

  return (
    <div className="space-y-2">
      <Input
        label="Araç ara (plaka)"
        placeholder="34 ABC 123"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
      />

      <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
        {filtered.map((v) => {
          const selected = value === v.plaka
          return (
            <button
              type="button"
              key={v.plaka}
              onClick={() => onChange(v.plaka)}
              disabled={disabled}
              className="w-full text-left rounded-lg border p-2.5 transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                borderColor: selected ? 'rgba(10, 132, 255, 0.5)' : 'rgba(84, 84, 88, 0.35)',
                backgroundColor: selected ? 'rgba(10, 132, 255, 0.1)' : 'rgba(28, 28, 30, 0.4)',
                backdropFilter: 'saturate(180%) blur(10px)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Truck className="w-4 h-4 flex-shrink-0" style={{ color: selected ? '#0A84FF' : 'rgba(235, 235, 245, 0.5)' }} />
                  <span className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }}>
                    {v.plaka}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    {costPerKm(v).toFixed(2)} ₺/km
                  </span>
                  {selected && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(10, 132, 255, 0.2)', color: '#0A84FF' }}>
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="p-3 rounded-lg text-center" style={{ backgroundColor: 'rgba(255, 159, 10, 0.1)', border: '0.5px solid rgba(255, 159, 10, 0.3)' }}>
            <p className="text-xs font-medium" style={{ color: '#FF9F0A' }}>
              Sonuç bulunamadı
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

