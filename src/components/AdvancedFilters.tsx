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
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {showAdvanced ? '▼' : '▶'} Gelişmiş Filtreler
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Tarih Aralığı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarih Aralığı
            </label>
            <div className="space-y-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat Aralığı (₺)
            </label>
            <div className="space-y-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

