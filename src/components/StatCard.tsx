import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  loading?: boolean
}

export default function StatCard({ title, value, icon, color = 'blue', trend, subtitle, loading }: StatCardProps) {
  const colorStyles = {
    blue: { bg: 'rgba(10, 132, 255, 0.15)', text: '#0A84FF', border: 'rgba(10, 132, 255, 0.3)' },
    green: { bg: 'rgba(48, 209, 88, 0.15)', text: '#30D158', border: 'rgba(48, 209, 88, 0.3)' },
    red: { bg: 'rgba(255, 69, 58, 0.15)', text: '#FF453A', border: 'rgba(255, 69, 58, 0.3)' },
    yellow: { bg: 'rgba(255, 214, 10, 0.15)', text: '#FFD60A', border: 'rgba(255, 214, 10, 0.3)' },
    purple: { bg: 'rgba(191, 90, 242, 0.15)', text: '#BF5AF2', border: 'rgba(191, 90, 242, 0.3)' },
    orange: { bg: 'rgba(255, 159, 10, 0.15)', text: '#FF9F0A', border: 'rgba(255, 159, 10, 0.3)' },
  }

  const getTrendIcon = () => {
    if (!trend || trend.value === 0) return <Minus className="w-3 h-3" />
    return trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
  }

  const getTrendColor = () => {
    if (!trend || trend.value === 0) return 'rgba(235, 235, 245, 0.6)'
    return trend.isPositive ? '#30D158' : '#FF453A'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-xl p-6 glass-hover relative overflow-hidden"
      style={{ borderColor: colorStyles[color].border }}
    >
      {/* Arka plan gradient efekti */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: colorStyles[color].text }}
      />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
              {title}
            </p>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
              </div>
            ) : (
              <motion.p 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold mb-1" 
                style={{ color: '#FFFFFF' }}
              >
                {value}
              </motion.p>
            )}
          </div>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-3 rounded-xl" 
            style={{ 
              backgroundColor: colorStyles[color].bg, 
              color: colorStyles[color].text,
              boxShadow: `0 0 20px ${colorStyles[color].bg}`
            }}
          >
            {icon}
          </motion.div>
        </div>

        {/* Trend veya subtitle */}
        <div className="flex items-center justify-between mt-3">
          {trend !== undefined && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: trend.value === 0 ? 'rgba(235, 235, 245, 0.1)' : trend.isPositive ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 69, 58, 0.15)',
                color: getTrendColor()
              }}
            >
              {getTrendIcon()}
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
              <span style={{ color: 'rgba(235, 235, 245, 0.5)' }}>geçen aya göre</span>
            </motion.div>
          )}
          
          {subtitle && (
            <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

