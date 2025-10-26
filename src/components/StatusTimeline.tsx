import { formatDate } from '../utils/formatters'

interface TimelineItem {
  status: string
  date: string
  isActive: boolean
}

interface StatusTimelineProps {
  currentStatus: string
  createdAt: string
  updatedAt: string
}

const STATUS_ORDER = ['Bekliyor', 'Yolda', 'Teslim Edildi', 'Faturalandı']

export default function StatusTimeline({ currentStatus, createdAt, updatedAt }: StatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  const isCancelled = currentStatus === 'İptal'

  const getStatusColor = (status: string, index: number) => {
    if (isCancelled) {
      return index === 0 ? 'bg-red-500' : 'bg-gray-300'
    }
    return index <= currentIndex ? 'bg-green-500' : 'bg-gray-300'
  }

  const getLineColor = (index: number) => {
    if (isCancelled) return 'bg-red-300'
    return index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
  }

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">✕</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-semibold text-red-900">Sipariş İptal Edildi</p>
            <p className="text-xs text-red-700">Oluşturulma: {formatDate(createdAt)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {STATUS_ORDER.map((status, index) => (
        <div key={status} className="relative pb-8 last:pb-0">
          <div className="flex items-center">
            {/* İkon */}
            <div className="relative flex-shrink-0">
              <div className={`w-8 h-8 ${getStatusColor(status, index)} rounded-full flex items-center justify-center transition-all`}>
                {index <= currentIndex ? (
                  <span className="text-white font-bold text-sm">✓</span>
                ) : (
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                )}
              </div>
            </div>

            {/* Bilgi */}
            <div className="ml-4 flex-1">
              <p className={`text-sm font-semibold ${index <= currentIndex ? 'text-gray-900' : 'text-gray-500'}`}>
                {status}
              </p>
              {index === 0 && (
                <p className="text-xs text-gray-600">{formatDate(createdAt)}</p>
              )}
              {index === currentIndex && index > 0 && (
                <p className="text-xs text-gray-600">{formatDate(updatedAt)}</p>
              )}
              {index > currentIndex && (
                <p className="text-xs text-gray-400">Henüz değil</p>
              )}
            </div>
          </div>

          {/* Çizgi */}
          {index < STATUS_ORDER.length - 1 && (
            <div className={`absolute left-4 top-8 w-0.5 h-8 ${getLineColor(index)} transition-all`} />
          )}
        </div>
      ))}
    </div>
  )
}

