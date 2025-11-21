import { motion } from 'framer-motion'
import { User, TrendingUp, DollarSign, Package } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

interface CustomerData {
  musteri: string
  orderCount: number
  totalEarnings: number
  totalCosts: number
  totalProfit: number
}

interface TopCustomersProps {
  customers: CustomerData[]
}

export default function TopCustomers({ customers }: TopCustomersProps) {
  if (!customers || customers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
          En Çok Kazandıran Müşteriler
        </h3>
        <div className="text-center py-8">
          <User className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
          <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Henüz müşteri verisi yok</p>
        </div>
      </motion.div>
    )
  }

  const maxEarnings = Math.max(...customers.map(c => c.totalEarnings))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
        En Çok Kazandıran Müşteriler
      </h3>
      <div className="space-y-4">
        {customers.map((customer, index) => {
          // Gerçek kar: Gelir - Maliyet
          const actualProfit = customer.totalEarnings - customer.totalCosts
          const profitMargin = customer.totalEarnings > 0 
            ? ((actualProfit / customer.totalEarnings) * 100).toFixed(1)
            : 0
          const progressWidth = (customer.totalEarnings / maxEarnings) * 100

          return (
            <motion.div
              key={customer.musteri}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `rgba(${index === 0 ? '255, 215, 0' : index === 1 ? '192, 192, 192' : index === 2 ? '205, 127, 50' : '10, 132, 255'}, 0.15)`,
                    }}
                  >
                    <User 
                      className="w-5 h-5" 
                      style={{ 
                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#0A84FF' 
                      }} 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate" style={{ color: '#FFFFFF' }}>
                      {customer.musteri}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      {customer.orderCount} sipariş
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-semibold text-sm" style={{ color: '#30D158' }}>
                    {formatCurrency(customer.totalEarnings)}
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
                  <Package className="w-3 h-3" />
                  <span>{customer.orderCount} sipariş</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  <DollarSign className="w-3 h-3" />
                  <span>Kar: {formatCurrency(actualProfit)}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

