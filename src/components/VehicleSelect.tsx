import { useEffect, useMemo, useState } from 'react'
import Input from './Input'
import Card from './Card'

interface Vehicle {
  plaka: string
  yakit_tuketimi?: number
  yakit_fiyati?: number
  gunluk_ucret?: number
  gunluk_ort_km?: number
  yemek_gunluk?: number
  hgs_per_km?: number
  yag_maliyet?: number
  yag_aralik?: number
  lastik_maliyet?: number
  lastik_omur?: number
  buyuk_bakim_maliyet?: number
  buyuk_bakim_aralik?: number
}

interface VehicleSelectProps {
  vehicles: Vehicle[]
  value: string
  onChange: (plaka: string) => void
  disabled?: boolean
}

export default function VehicleSelect({ vehicles, value, onChange, disabled }: VehicleSelectProps) {
  const [query, setQuery] = useState('')
  // Backend breakdown is not used for Toplam artık; Araçlar sayfasıyla birebir tutarlılık için
  // kart toplamını doğrudan araç parametrelerinden hesaplıyoruz.

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return vehicles
    return vehicles.filter(v => v.plaka.toLowerCase().includes(q))
  }, [vehicles, query])

  const costPerKm = (v: Vehicle): number => {
    const fuel = ((v.yakit_tuketimi || 25) * (v.yakit_fiyati || 40)) / 100
    const driver = (v.gunluk_ucret || 1600) / (v.gunluk_ort_km || 500)
    const meal = (v.yemek_gunluk || 150) / (v.gunluk_ort_km || 500)
    const toll = v.hgs_per_km || 0.5
    const maintenance = (
      (v.yag_maliyet || 500) / (v.yag_aralik || 5000) +
      (v.lastik_maliyet || 8000) / (v.lastik_omur || 50000) +
      (v.buyuk_bakim_maliyet || 3000) / (v.buyuk_bakim_aralik || 15000)
    )
    return fuel + driver + meal + toll + maintenance
  }

  // Breakdown fetch kaldırıldı (Toplam gösterimi için gerek yok)

  return (
    <div className="space-y-3">
      <Input
        label="Araç ara (plaka)"
        placeholder="34 ABC 123"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((v) => {
          const selected = value === v.plaka
          return (
            <button
              type="button"
              key={v.plaka}
              onClick={() => onChange(v.plaka)}
              disabled={disabled}
              className="text-left rounded-xl border p-4 transition-all duration-200 focus:outline-none focus:ring-2 glass-hover"
              style={{
                borderColor: selected ? 'rgba(10, 132, 255, 0.5)' : 'rgba(84, 84, 88, 0.65)',
                backgroundColor: selected ? 'rgba(10, 132, 255, 0.1)' : 'rgba(28, 28, 30, 0.68)',
                backdropFilter: 'saturate(180%) blur(20px)',
                boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Plaka</p>
                  <p className="text-lg font-semibold mt-0.5" style={{ color: '#FFFFFF' }}>{v.plaka}</p>
                </div>
                {selected && (
                  <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(10, 132, 255, 0.2)', color: '#0A84FF' }}>✓ Seçili</span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {(() => {
                  const fuel = (((v.yakit_tuketimi || 25) * (v.yakit_fiyati || 40)) / 100)
                  const driverMeal = (((v.gunluk_ucret || 1600) + (v.yemek_gunluk || 150)) / (v.gunluk_ort_km || 500))
                  const toll = (v.hgs_per_km || 0.5)
                  const maintenance = (
                    (v.yag_maliyet || 500) / (v.yag_aralik || 5000) +
                    (v.lastik_maliyet || 8000) / (v.lastik_omur || 50000) +
                    (v.buyuk_bakim_maliyet || 3000) / (v.buyuk_bakim_aralik || 15000)
                  )
                  return (
                    <>
                      <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: '#2C2C2E', border: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
                        <p className="font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yakıt</p>
                        <p className="font-semibold" style={{ color: '#FFFFFF' }}>{fuel.toFixed(2)} ₺/km</p>
                      </div>
                      <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: '#2C2C2E', border: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
                        <p className="font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sürücü+Yemek</p>
                        <p className="font-semibold" style={{ color: '#FFFFFF' }}>{driverMeal.toFixed(2)} ₺/km</p>
                      </div>
                      <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: '#2C2C2E', border: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
                        <p className="font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>HGS</p>
                        <p className="font-semibold" style={{ color: '#FFFFFF' }}>{toll.toFixed(2)} ₺/km</p>
                      </div>
                      <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: '#2C2C2E', border: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
                        <p className="font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Bakım</p>
                        <p className="font-semibold" style={{ color: '#FFFFFF' }}>{maintenance.toFixed(2)} ₺/km</p>
                      </div>
                    </>
                  )
                })()}
                <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}>
                  <p className="font-medium" style={{ color: '#30D158' }}>Toplam</p>
                  <p className="font-semibold text-sm" style={{ color: '#30D158' }}>
                    {costPerKm(v).toFixed(2)} ₺/km
                  </p>
                </div>
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full glass-card rounded-xl p-5" style={{ border: '0.5px solid rgba(255, 159, 10, 0.3)', backgroundColor: 'rgba(255, 159, 10, 0.1)' }}>
            <p className="text-sm font-medium" style={{ color: '#FF9F0A' }}>
              Sonuç bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


