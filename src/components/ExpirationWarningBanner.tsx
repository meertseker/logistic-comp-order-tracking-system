import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, ArrowRight } from 'lucide-react'
import Button from './Button'

interface ExpirationWarningBannerProps {
  daysRemaining: number
  expiresAt: string
  onClose?: () => void
  onUpgrade?: () => void
}

const ExpirationWarningBanner: React.FC<ExpirationWarningBannerProps> = ({
  daysRemaining,
  expiresAt,
  onClose,
  onUpgrade
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) {
      onClose()
    }
  }

  const handleUpgrade = () => {
    // Contact sayfasını aç
    window.open('https://sekersoft.com/contact', '_blank')
    
    if (onUpgrade) {
      onUpgrade()
    }
  }

  // Color coding based on urgency
  const getBgColor = () => {
    if (daysRemaining < 3) return 'bg-red-50 border-red-300'
    if (daysRemaining <= 7) return 'bg-orange-50 border-orange-300'
    return 'bg-yellow-50 border-yellow-300'
  }

  const getTextColor = () => {
    if (daysRemaining < 3) return 'text-red-900'
    if (daysRemaining <= 7) return 'text-orange-900'
    return 'text-yellow-900'
  }

  const getIconColor = () => {
    if (daysRemaining < 3) return 'text-red-600'
    if (daysRemaining <= 7) return 'text-orange-600'
    return 'text-yellow-600'
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getMessage = () => {
    if (daysRemaining === 0) {
      return 'Demo lisansınızın süresi bugün doluyor!'
    }
    if (daysRemaining === 1) {
      return 'Demo lisansınızın süresi yarın doluyor!'
    }
    return `Demo lisansınızın süresi ${daysRemaining} gün içinde dolacak`
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`border rounded-lg p-4 mb-4 ${getBgColor()}`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getIconColor()}`} />
            
            <div className="flex-1 min-w-0">
              <div className={`font-semibold mb-1 ${getTextColor()}`}>
                {getMessage()}
              </div>
              <p className={`text-sm ${getTextColor()} opacity-90 mb-3`}>
                Lisansınız <strong>{formatDate(expiresAt)}</strong> tarihinde sona erecek. 
                Kesintisiz kullanım için tam lisansa geçiş yapın.
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleUpgrade}
                  size="sm"
                  className="text-xs"
                >
                  Tam Lisansa Geç
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                
                <button
                  onClick={handleClose}
                  className={`text-xs underline ${getTextColor()} opacity-75 hover:opacity-100`}
                >
                  Daha sonra hatırlat
                </button>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className={`flex-shrink-0 p-1 rounded hover:bg-black hover:bg-opacity-5 transition-colors ${getTextColor()}`}
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ExpirationWarningBanner
