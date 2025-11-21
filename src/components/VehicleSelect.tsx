import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import Input from './Input'
import Card from './Card'

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
  orderCount?: number
}

interface VehicleSelectProps {
  vehicles: Vehicle[]
  value: string
  onChange: (plaka: string) => void
  disabled?: boolean
}

export default function VehicleSelect({ vehicles, value, onChange, disabled }: VehicleSelectProps) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const INITIAL_SHOW_COUNT = 6

  // Araçları sipariş sayısına göre sırala (en çok kullanılanlar önce)
  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const aCount = a.orderCount || 0
      const bCount = b.orderCount || 0
      if (bCount !== aCount) {
        return bCount - aCount // En çok kullanılanlar önce
      }
      // Sipariş sayısı aynıysa plakaya göre sırala
      return a.plaka.localeCompare(b.plaka, 'tr')
    })
  }, [vehicles])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sortedVehicles
    return sortedVehicles.filter(v => v.plaka.toLowerCase().includes(q))
  }, [sortedVehicles, query])

  // Gösterilecek araçlar
  const displayedVehicles = useMemo(() => {
    if (expanded || query) return filtered
    return filtered.slice(0, INITIAL_SHOW_COUNT)
  }, [filtered, expanded, query])

  const hasMore = !expanded && !query && filtered.length > INITIAL_SHOW_COUNT

  const costPerKm = (v: Vehicle): number => {
    const fuel = ((v.yakit_tuketimi || 25) * (v.yakit_fiyati || 40)) / 100
    const driver = (v.gunluk_ucret || 1600) / (v.gunluk_ort_km || 500)
    const meal = (v.yemek_gunluk || 150) / (v.gunluk_ort_km || 500)
    // HGS güzergah bazlı hesaplanır, araç parametresinden kaldırıldı
    const maintenance = (
      (v.yag_maliyet || 500) / (v.yag_aralik || 5000) +
      (v.lastik_maliyet || 8000) / (v.lastik_omur || 50000) +
      (v.buyuk_bakim_maliyet || 3000) / (v.buyuk_bakim_aralik || 15000)
    )
    // Sabit giderler (Sigorta/MTV/Muayene) dahil - araçtan al, yoksa varsayılan
    const yillikKm = v.hedef_toplam_km || 120000
    const insurance = (v.sigorta_yillik || 12000) / yillikKm
    const mtv = (v.mtv_yillik || 5000) / yillikKm
    const inspection = (v.muayene_yillik || 1500) / yillikKm
    
    return fuel + driver + meal + maintenance + insurance + mtv + inspection
  }

  // Breakdown fetch kaldırıldı (Toplam gösterimi için gerek yok)

  return (
    <div className="space-y-3">
      <Input
        label="Araç ara (plaka)"
        placeholder="34 ABC 123"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (e.target.value) setExpanded(true) // Arama yapıldığında genişlet
        }}
        disabled={disabled}
      />

      {!query && filtered.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-4 h-4" style={{ color: 'rgba(10, 132, 255, 0.6)' }} />
          <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
            En çok kullanılan araçlar önce gösteriliyor
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayedVehicles.map((v) => {
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Plaka</p>
                    {v.orderCount !== undefined && v.orderCount > 0 && (
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium" 
                        style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF' }}>
                        {v.orderCount} sipariş
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold mt-0.5" style={{ color: '#FFFFFF' }}>{v.plaka}</p>
                </div>
                {selected && (
                  <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(10, 132, 255, 0.2)', color: '#0A84FF' }}>✓ Seçili</span>
                )}
              </div>
              <div className="mt-3 space-y-2 text-xs">
                {(() => {
                  const fuel = (((v.yakit_tuketimi || 25) * (v.yakit_fiyati || 40)) / 100)
                  const driverMeal = (((v.gunluk_ucret || 1600) + (v.yemek_gunluk || 150)) / (v.gunluk_ort_km || 500))
                  const maintenance = (
                    (v.yag_maliyet || 500) / (v.yag_aralik || 5000) +
                    (v.lastik_maliyet || 8000) / (v.lastik_omur || 50000) +
                    (v.buyuk_bakim_maliyet || 3000) / (v.buyuk_bakim_aralik || 15000)
                  )
                  const yillikKm = v.hedef_toplam_km || 120000
                  const sabitGiderler = ((v.sigorta_yillik || 12000) + (v.mtv_yillik || 5000) + (v.muayene_yillik || 1500)) / yillikKm
                  
                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: '#2C2C2E', border: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
                          <p className="font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yakıt</p>
                          <p className="font-semibold" style={{ color: '#FFFFFF' }}>{fuel.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: '#2C2C2E', border: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
                          <p className="font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sürücü+Yemek</p>
                          <p className="font-semibold" style={{ color: '#FFFFFF' }}>{driverMeal.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: '#2C2C2E', border: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
                          <p className="font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Bakım</p>
                          <p className="font-semibold" style={{ color: '#FFFFFF' }}>{maintenance.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '0.5px solid rgba(99, 102, 241, 0.3)' }}>
                        <div className="flex justify-between items-center">
                          <p className="font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sabit Giderler</p>
                          <p className="font-semibold" style={{ color: '#FFFFFF' }}>{sabitGiderler.toFixed(2)} ₺/km</p>
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(235, 235, 245, 0.4)' }}>Sigorta, MTV, Muayene</p>
                      </div>
                      <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}>
                        <div className="flex justify-between items-center">
                          <p className="font-medium" style={{ color: '#30D158' }}>Toplam Maliyet</p>
                          <p className="font-semibold text-sm" style={{ color: '#30D158' }}>
                            {costPerKm(v).toFixed(2)} ₺/km
                          </p>
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(235, 235, 245, 0.4)' }}>HGS güzergahtan eklenir</p>
                      </div>
                    </>
                  )
                })()}
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

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 hover:scale-105"
            style={{
              borderColor: 'rgba(10, 132, 255, 0.3)',
              backgroundColor: 'rgba(10, 132, 255, 0.1)',
              color: '#0A84FF',
            }}
          >
            <ChevronDown className="w-4 h-4" />
            <span className="text-sm font-medium">
              {filtered.length - INITIAL_SHOW_COUNT} araç daha göster
            </span>
          </button>
        </div>
      )}

      {expanded && !query && filtered.length > INITIAL_SHOW_COUNT && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 hover:scale-105"
            style={{
              borderColor: 'rgba(84, 84, 88, 0.5)',
              backgroundColor: 'rgba(28, 28, 30, 0.5)',
              color: 'rgba(235, 235, 245, 0.7)',
            }}
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-sm font-medium">Daha az göster</span>
          </button>
        </div>
      )}
    </div>
  )
}


