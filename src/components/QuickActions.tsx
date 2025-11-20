import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  Truck, 
  MapPin,
  BarChart3,
  Navigation,
  Mail
} from 'lucide-react'

interface QuickAction {
  title: string
  icon: React.ReactNode
  to: string
  color: string
  bgColor: string
}

const quickActions: QuickAction[] = [
  {
    title: 'Yeni Sipariş',
    icon: <Plus className="w-5 h-5" />,
    to: '/orders/new',
    color: '#0A84FF',
    bgColor: 'rgba(10, 132, 255, 0.15)',
  },
  {
    title: 'Aktif Araçlar',
    icon: <Navigation className="w-5 h-5" />,
    to: '/active-vehicles',
    color: '#5AC8FA',
    bgColor: 'rgba(90, 200, 250, 0.15)',
  },
  {
    title: 'Raporlar',
    icon: <FileText className="w-5 h-5" />,
    to: '/reports',
    color: '#30D158',
    bgColor: 'rgba(48, 209, 88, 0.15)',
  },
  {
    title: 'Grafikler',
    icon: <BarChart3 className="w-5 h-5" />,
    to: '/charts',
    color: '#BF5AF2',
    bgColor: 'rgba(191, 90, 242, 0.15)',
  },
  {
    title: 'Mail',
    icon: <Mail className="w-5 h-5" />,
    to: '/mail',
    color: '#FF9F0A',
    bgColor: 'rgba(255, 159, 10, 0.15)',
  },
  {
    title: 'Tüm Siparişler',
    icon: <TrendingUp className="w-5 h-5" />,
    to: '/orders',
    color: '#FFD60A',
    bgColor: 'rgba(255, 214, 10, 0.15)',
  },
]

export default function QuickActions() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
        Hızlı Erişim
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action, index) => (
          <Link key={action.to} to={action.to}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all"
              style={{
                backgroundColor: action.bgColor,
                border: `0.5px solid ${action.color}40`,
              }}
            >
              <div
                className="p-2.5 rounded-lg mb-2"
                style={{
                  backgroundColor: action.bgColor,
                  color: action.color,
                }}
              >
                {action.icon}
              </div>
              <span
                className="text-xs font-medium text-center"
                style={{ color: '#FFFFFF' }}
              >
                {action.title}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}

