import React from 'react'
import { Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface LicenseStatusProps {
  licenseType: 'demo' | 'full'
  expiresAt?: string | null
  daysRemaining?: number | null
  companyName?: string
  activatedAt?: string
  className?: string
}

const LicenseStatus: React.FC<LicenseStatusProps> = ({
  licenseType,
  expiresAt,
  daysRemaining,
  companyName,
  activatedAt,
  className = ''
}) => {
  // Color coding based on days remaining
  const getStatusColor = () => {
    if (licenseType === 'full') return 'text-green-600'
    if (!daysRemaining) return 'text-gray-600'
    
    if (daysRemaining < 3) return 'text-red-600'
    if (daysRemaining <= 7) return 'text-orange-600'
    if (daysRemaining <= 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getBgColor = () => {
    if (licenseType === 'full') return 'bg-green-50 border-green-200'
    if (!daysRemaining) return 'bg-gray-50 border-gray-200'
    
    if (daysRemaining < 3) return 'bg-red-50 border-red-200'
    if (daysRemaining <= 7) return 'bg-orange-50 border-orange-200'
    if (daysRemaining <= 30) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  const getIcon = () => {
    if (licenseType === 'full') return <CheckCircle className="w-5 h-5 text-green-600" />
    if (!daysRemaining) return <Shield className="w-5 h-5 text-gray-600" />
    
    if (daysRemaining < 3) return <AlertTriangle className="w-5 h-5 text-red-600" />
    if (daysRemaining <= 7) return <AlertTriangle className="w-5 h-5 text-orange-600" />
    return <Clock className="w-5 h-5 text-yellow-600" />
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getBgColor()} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm font-semibold ${getStatusColor()}`}>
              {licenseType === 'full' ? 'Tam Lisans' : 'Demo Lisans'}
            </h3>
          </div>
          
          {companyName && (
            <p className="text-xs text-gray-600 mb-2">
              {companyName}
            </p>
          )}
          
          <div className="space-y-1">
            {licenseType === 'demo' && daysRemaining !== null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Kalan Süre:</span>
                <span className={`font-medium ${getStatusColor()}`}>
                  {daysRemaining > 0 ? `${daysRemaining} gün` : 'Süresi dolmuş'}
                </span>
              </div>
            )}
            
            {licenseType === 'demo' && expiresAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Son Kullanım:</span>
                <span className="text-gray-700 font-medium">
                  {formatDate(expiresAt)}
                </span>
              </div>
            )}
            
            {activatedAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Aktivasyon:</span>
                <span className="text-gray-700">
                  {formatDate(activatedAt)}
                </span>
              </div>
            )}
            
            {licenseType === 'full' && (
              <div className="text-xs text-gray-600">
                Süresiz kullanım
              </div>
            )}
          </div>
          
          {licenseType === 'demo' && daysRemaining !== null && daysRemaining < 7 && daysRemaining > 0 && (
            <div className={`mt-2 text-xs ${getStatusColor()} font-medium`}>
              ⚠️ Lisansınızın süresi yakında dolacak
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LicenseStatus
