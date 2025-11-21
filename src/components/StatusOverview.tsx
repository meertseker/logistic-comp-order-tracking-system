import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface StatusData {
  status: string
  count: number
  totalValue: number
}

interface StatusOverviewProps {
  data: StatusData[]
}

const STATUS_COLORS: Record<string, string> = {
  'Bekliyor': '#FFD60A',
  'Yolda': '#0A84FF',
  'Teslim Edildi': '#30D158',
  'Faturalandı': '#BF5AF2',
  'İptal': '#FF453A',
}

const STATUS_LABELS: Record<string, string> = {
  'Bekliyor': 'Bekliyor',
  'Yolda': 'Yolda',
  'Teslim Edildi': 'Teslim Edildi',
  'Faturalandı': 'Faturalandı',
  'İptal': 'İptal',
}

export default function StatusOverview({ data }: StatusOverviewProps) {
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
          Sipariş Durumu Dağılımı
        </h3>
        <div className="text-center py-8">
          <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Henüz sipariş yok</p>
        </div>
      </motion.div>
    )
  }

  const chartData = data.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#0A84FF',
  }))

  const totalOrders = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
        Sipariş Durumu Dağılımı
      </h3>

      <div className="flex items-center justify-between gap-8">
        {/* Pie Chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(28, 28, 30, 0.95)',
                  border: '0.5px solid rgba(235, 235, 245, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                formatter={(value: number) => `${value} sipariş (${((value / totalOrders) * 100).toFixed(1)}%)`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with stats */}
        <div className="flex-1 space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.count / totalOrders) * 100).toFixed(1)
            return (
              <motion.div
                key={item.status}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(235, 235, 245, 0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[item.status] || '#0A84FF' }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                    {item.count}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    %{percentage}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

