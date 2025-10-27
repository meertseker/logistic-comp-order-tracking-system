import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  trend?: {
    value: string
    isPositive: boolean
  }
}

export default function StatCard({ title, value, icon, color = 'blue', trend }: StatCardProps) {
  const colorStyles = {
    blue: { bg: 'rgba(10, 132, 255, 0.15)', text: '#0A84FF' },
    green: { bg: 'rgba(48, 209, 88, 0.15)', text: '#30D158' },
    red: { bg: 'rgba(255, 69, 58, 0.15)', text: '#FF453A' },
    yellow: { bg: 'rgba(255, 214, 10, 0.15)', text: '#FFD60A' },
    purple: { bg: 'rgba(191, 90, 242, 0.15)', text: '#BF5AF2' },
  }

  return (
    <div className="glass-card rounded-xl p-6 glass-hover">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>{title}</p>
          <p className="text-3xl font-semibold mb-1" style={{ color: '#FFFFFF' }}>{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: trend.isPositive ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 69, 58, 0.15)',
                  color: trend.isPositive ? '#30D158' : '#FF453A'
                }}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: colorStyles[color].bg, color: colorStyles[color].text }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

