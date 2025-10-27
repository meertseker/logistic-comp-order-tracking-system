import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, MapPin, Truck, ArrowRight } from 'lucide-react'
import { formatDate } from '../utils/formatters'

interface Order {
  id: number
  plaka: string
  musteri: string
  nereden: string
  nereye: string
  status: string
  created_at: string
}

interface UpcomingDeliveriesProps {
  orders: Order[]
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Bekliyor': '#FFD60A',
    'Yolda': '#0A84FF',
    'Teslim Edildi': '#30D158',
    'Faturalandı': '#BF5AF2',
    'İptal': '#FF453A',
  }
  return colors[status] || '#0A84FF'
}

export default function UpcomingDeliveries({ orders }: UpcomingDeliveriesProps) {
  if (!orders || orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
          Aktif Teslimatlar
        </h3>
        <div className="text-center py-8">
          <Truck className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
          <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Aktif teslimat bulunmuyor</p>
          <Link to="/orders/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'rgba(10, 132, 255, 0.15)',
                color: '#0A84FF',
                border: '0.5px solid rgba(10, 132, 255, 0.3)',
              }}
            >
              Yeni Sipariş Oluştur
            </motion.button>
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
          Aktif Teslimatlar
        </h3>
        <Link to="/orders">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: '#0A84FF' }}
          >
            Tümünü Gör
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        </Link>
      </div>

      <div className="space-y-3">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
          >
            <Link to={`/orders/${order.id}`}>
              <div
                className="p-4 rounded-xl cursor-pointer transition-all"
                style={{
                  backgroundColor: 'rgba(235, 235, 245, 0.05)',
                  border: '0.5px solid rgba(235, 235, 245, 0.1)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${getStatusColor(order.status)}20`,
                      }}
                    >
                      <Truck className="w-5 h-5" style={{ color: getStatusColor(order.status) }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>
                        {order.plaka}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                        {order.musteri}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status),
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{order.nereden}</span>
                  <ArrowRight className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{order.nereye}</span>
                </div>

                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

