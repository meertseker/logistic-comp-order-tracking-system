import { useState } from 'react'
import Button from './Button'
import Input from './Input'
import Select from './Select'

interface FilterProps {
  onFilter: (filters: any) => void
  onReset: () => void
}

const PROFITABILITY_OPTIONS = [
  { value: '', label: 'Tümü' },
  { value: 'profitable', label: 'Kârlı' },
  { value: 'loss', label: 'Zararlı' },
  { value: 'breakeven', label: 'Başabaş' },
]

export default function AdvancedFilters({ onFilter, onReset }: FilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    profitability: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApply = () => {
    onFilter(filters)
  }

  const handleReset = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      profitability: '',
    })
    onReset()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium transition-colors flex items-center space-x-2"
          style={{ color: '#0A84FF' }}
        >
          <span className="transform transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
          <span>Gelişmiş Filtreler</span>
        </button>
        {showAdvanced && (
          <div className="flex space-x-2">
            <Button size="sm" variant="secondary" onClick={handleReset}>
              Sıfırla
            </Button>
            <Button size="sm" onClick={handleApply}>
              Uygula
            </Button>
          </div>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 glass-card rounded-xl animate-fade-in" style={{ border: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
          {/* Tarih Aralığı */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Tarih Aralığı
            </label>
            <div className="space-y-3">
              <Input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleChange}
                placeholder="Başlangıç"
              />
              <Input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleChange}
                placeholder="Bitiş"
              />
            </div>
          </div>

          {/* Fiyat Aralığı */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Fiyat Aralığı (₺)
            </label>
            <div className="space-y-3">
              <Input
                type="number"
                name="priceMin"
                value={filters.priceMin}
                onChange={handleChange}
                placeholder="Min"
              />
              <Input
                type="number"
                name="priceMax"
                value={filters.priceMax}
                onChange={handleChange}
                placeholder="Max"
              />
            </div>
          </div>

          {/* Karlılık */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Karlılık Durumu
            </label>
            <Select
              options={PROFITABILITY_OPTIONS}
              value={filters.profitability}
              name="profitability"
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}

