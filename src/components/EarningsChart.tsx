import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '../utils/formatters'
import { format, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'

interface EarningsChartProps {
  data: Array<{
    date: string
    earnings: number
    costs: number
    orders: number
  }>
  title: string
  height?: number
}

export default function EarningsChart({ data, title, height = 300 }: EarningsChartProps) {
  // Veri formatla
  const chartData = data.map((item) => ({
    ...item,
    date: format(parseISO(item.date), 'dd MMM', { locale: tr }),
    profit: item.earnings - item.costs,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
          {title}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#30D158' }} />
            <span className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Gelir
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF453A' }} />
            <span className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Gider
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0A84FF' }} />
            <span className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Kar
            </span>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <p style={{ color: 'rgba(235, 235, 245, 0.4)' }}>Henüz veri bulunmuyor</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#30D158" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#30D158" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF453A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF453A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0A84FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(235, 235, 245, 0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(235, 235, 245, 0.5)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="rgba(235, 235, 245, 0.5)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(28, 28, 30, 0.95)',
                border: '0.5px solid rgba(235, 235, 245, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
              labelStyle={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  earnings: 'Gelir',
                  costs: 'Gider',
                  profit: 'Kar',
                }
                return [formatCurrency(value), labels[name] || name]
              }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#30D158"
              strokeWidth={2}
              fill="url(#colorEarnings)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="costs"
              stroke="#FF453A"
              strokeWidth={2}
              fill="url(#colorCosts)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#0A84FF"
              strokeWidth={2}
              fill="url(#colorProfit)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  )
}

