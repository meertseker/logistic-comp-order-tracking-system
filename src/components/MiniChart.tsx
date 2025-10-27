import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

interface MiniChartProps {
  data: Array<{ date: string; value: number }>
  color: string
  height?: number
}

export default function MiniChart({ data, color, height = 60 }: MiniChartProps) {
  // Veri yoksa boş göster
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'rgba(235, 235, 245, 0.3)', fontSize: '12px' }}>Veri yok</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(28, 28, 30, 0.95)',
              border: '0.5px solid rgba(235, 235, 245, 0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 500 }}
            itemStyle={{ color: color, fontSize: '11px' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

