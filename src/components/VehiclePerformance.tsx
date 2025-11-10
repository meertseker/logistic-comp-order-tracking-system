import { motion } from 'framer-motion'
import { Truck, TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

interface VehicleData {
  plaka: string
  orderCount: number
  totalEarnings: number
  totalCosts: number
  totalProfit: number
}

interface VehiclePerformanceProps {
  vehicles: VehicleData[]
}

export default function VehiclePerformance({ vehicles }: VehiclePerformanceProps) {
  if (!vehicles || vehicles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
          En Çok Çalışan Araçlar
        </h3>
        <div className="text-center py-8">
          <Truck className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
          <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Bu ay henüz araç verisi yok</p>
        </div>
      </motion.div>
    )
  }

  const maxOrders = Math.max(...vehicles.map(v => v.orderCount))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
        En Çok Çalışan Araçlar (Bu Ay)
      </h3>
      <div className="space-y-4">
        {vehicles.map((vehicle, index) => {
          // Gerçek kar: Gelir - Maliyet
          const actualProfit = vehicle.totalEarnings - vehicle.totalCosts
          const profitMargin = vehicle.totalEarnings > 0 
            ? ((actualProfit / vehicle.totalEarnings) * 100).toFixed(1)
            : 0
          const progressWidth = (vehicle.orderCount / maxOrders) * 100

          return (
            <motion.div
              key={vehicle.plaka}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `rgba(${index === 0 ? '255, 215, 0' : index === 1 ? '192, 192, 192' : index === 2 ? '205, 127, 50' : '10, 132, 255'}, 0.15)`,
                    }}
                  >
                    <Truck 
                      className="w-5 h-5" 
                      style={{ 
                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#0A84FF' 
                      }} 
                    />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                      {vehicle.plaka}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      {vehicle.orderCount} sipariş
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm" style={{ color: '#30D158' }}>
                    {formatCurrency(actualProfit)}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    {profitMargin}% kar marjı
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(235, 235, 245, 0.1)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#0A84FF'}, ${index === 0 ? '#FFA500' : index === 1 ? '#999' : index === 2 ? '#8B4513' : '#005FCC'})`,
                  }}
                />
              </div>
              
              {/* Mini stats */}
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  <DollarSign className="w-3 h-3" />
                  <span>Gelir: {formatCurrency(vehicle.totalEarnings)}</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  <TrendingUp className="w-3 h-3" />
                  <span>Maliyet: {formatCurrency(vehicle.totalCosts)}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

