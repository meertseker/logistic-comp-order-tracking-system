import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',
    info: '#0A84FF',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div 
        className="px-5 py-3.5 rounded-xl flex items-center space-x-3 min-w-[320px] shadow-ios-lg"
        style={{ backgroundColor: colors[type], color: '#FFFFFF' }}
      >
        <span className="text-lg font-bold">{icons[type]}</span>
        <p className="flex-1 font-medium text-sm">{message}</p>
        <button
          onClick={onClose}
          className="rounded-lg w-7 h-7 flex items-center justify-center font-bold text-lg transition-opacity hover:opacity-80"
          style={{ color: '#FFFFFF' }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

