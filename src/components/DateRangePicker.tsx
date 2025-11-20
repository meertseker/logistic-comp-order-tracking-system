import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

export interface DateRange {
  startDate: string
  endDate: string
  label?: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  showPresets?: boolean
  showComparison?: boolean
}

export default function DateRangePicker({
  value,
  onChange,
  showPresets = true,
  showComparison = false
}: DateRangePickerProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [customMode, setCustomMode] = useState(false)

  const presets = [
    { label: 'Bugün', value: 'today' },
    { label: 'Dün', value: 'yesterday' },
    { label: 'Son 7 Gün', value: 'last7days' },
    { label: 'Son 30 Gün', value: 'last30days' },
    { label: 'Bu Hafta', value: 'thisWeek' },
    { label: 'Geçen Hafta', value: 'lastWeek' },
    { label: 'Bu Ay', value: 'thisMonth' },
    { label: 'Geçen Ay', value: 'lastMonth' },
    { label: 'Bu Çeyrek', value: 'thisQuarter' },
    { label: 'Geçen Çeyrek', value: 'lastQuarter' },
    { label: 'Bu Yıl', value: 'thisYear' },
    { label: 'Geçen Yıl', value: 'lastYear' },
    { label: 'Özel Tarih', value: 'custom' },
  ]

  const calculateDateRange = (preset: string): DateRange => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const day = today.getDate()
    const dayOfWeek = today.getDay()

    let startDate = new Date()
    let endDate = new Date()

    switch (preset) {
      case 'today':
        startDate = new Date(year, month, day)
        endDate = new Date(year, month, day, 23, 59, 59)
        break

      case 'yesterday':
        startDate = new Date(year, month, day - 1)
        endDate = new Date(year, month, day - 1, 23, 59, 59)
        break

      case 'last7days':
        startDate = new Date(year, month, day - 7)
        endDate = new Date(year, month, day, 23, 59, 59)
        break

      case 'last30days':
        startDate = new Date(year, month, day - 30)
        endDate = new Date(year, month, day, 23, 59, 59)
        break

      case 'thisWeek':
        // Pazartesi başlangıç
        const monday = day - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
        startDate = new Date(year, month, monday)
        endDate = new Date(year, month, day, 23, 59, 59)
        break

      case 'lastWeek':
        const lastMonday = day - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7
        const lastSunday = lastMonday + 6
        startDate = new Date(year, month, lastMonday)
        endDate = new Date(year, month, lastSunday, 23, 59, 59)
        break

      case 'thisMonth':
        startDate = new Date(year, month, 1)
        endDate = new Date(year, month, day, 23, 59, 59)
        break

      case 'lastMonth':
        startDate = new Date(year, month - 1, 1)
        endDate = new Date(year, month, 0, 23, 59, 59)
        break

      case 'thisQuarter':
        const quarterStartMonth = Math.floor(month / 3) * 3
        startDate = new Date(year, quarterStartMonth, 1)
        endDate = new Date(year, month, day, 23, 59, 59)
        break

      case 'lastQuarter':
        const lastQuarterStartMonth = Math.floor(month / 3) * 3 - 3
        const lastQuarterEndMonth = lastQuarterStartMonth + 3
        startDate = new Date(year, lastQuarterStartMonth, 1)
        endDate = new Date(year, lastQuarterEndMonth, 0, 23, 59, 59)
        break

      case 'thisYear':
        startDate = new Date(year, 0, 1)
        endDate = new Date(year, month, day, 23, 59, 59)
        break

      case 'lastYear':
        startDate = new Date(year - 1, 0, 1)
        endDate = new Date(year - 1, 11, 31, 23, 59, 59)
        break

      default:
        startDate = new Date(year, month, 1)
        endDate = new Date(year, month, day, 23, 59, 59)
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      label: presets.find(p => p.value === preset)?.label
    }
  }

  const handlePresetClick = (preset: string) => {
    if (preset === 'custom') {
      setCustomMode(true)
    } else {
      const range = calculateDateRange(preset)
      onChange(range)
      setShowDropdown(false)
      setCustomMode(false)
    }
  }

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="relative z-50">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
        style={{
          background: 'rgba(99, 102, 241, 0.12)',
          border: '0.5px solid rgba(99, 102, 241, 0.3)',
          color: '#FFFFFF'
        }}
      >
        <Calendar className="w-4 h-4" style={{ color: '#6366F1' }} />
        <div className="flex flex-col items-start">
          <span className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Tarih Aralığı
          </span>
          <span className="text-sm font-medium">
            {value.label || `${formatDisplayDate(value.startDate)} - ${formatDisplayDate(value.endDate)}`}
          </span>
        </div>
        <ChevronDown className="w-4 h-4" style={{ color: 'rgba(235, 235, 245, 0.6)' }} />
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 z-[100] rounded-xl p-4 shadow-2xl min-w-[320px]"
            style={{
              background: 'rgba(28, 28, 30, 0.95)',
              border: '0.5px solid rgba(235, 235, 245, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {showPresets && !customMode ? (
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <motion.button
                    key={preset.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePresetClick(preset.value)}
                    className="px-3 py-2 rounded-lg text-sm text-left transition-all"
                    style={{
                      background: value.label === preset.label
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(99, 102, 241, 0.05)',
                      border: '0.5px solid',
                      borderColor: value.label === preset.label
                        ? 'rgba(99, 102, 241, 0.5)'
                        : 'rgba(99, 102, 241, 0.1)',
                      color: '#FFFFFF'
                    }}
                  >
                    {preset.label}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={value.startDate}
                    onChange={(e) => onChange({ ...value, startDate: e.target.value, label: undefined })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '0.5px solid rgba(99, 102, 241, 0.3)',
                      color: '#FFFFFF'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={value.endDate}
                    onChange={(e) => onChange({ ...value, endDate: e.target.value, label: undefined })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '0.5px solid rgba(99, 102, 241, 0.3)',
                      color: '#FFFFFF'
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setCustomMode(false)
                      setShowDropdown(false)
                    }}
                    variant="secondary"
                    size="sm"
                    fullWidth
                  >
                    Uygula
                  </Button>
                  <Button
                    onClick={() => setCustomMode(false)}
                    variant="secondary"
                    size="sm"
                  >
                    Geri
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

