import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Package,
  Truck,
  MapPin,
  FileText,
  BarChart3,
  Menu,
  Sparkles,
  Container
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Ana Sayfa', href: '/', icon: Home, badge: null },
  { name: 'Siparişler', href: '/orders', icon: Package, badge: null },
  { name: 'Araçlar', href: '/vehicles', icon: Truck, badge: null },
  { name: 'Dorseler', href: '/trailers', icon: Container, badge: null },
  { name: 'Güzergahlar', href: '/routes', icon: MapPin, badge: null },
  { name: 'Raporlar', href: '/reports', icon: FileText, badge: null },
  { name: 'Grafikler', href: '/charts', icon: BarChart3, badge: null },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ 
          background: 'radial-gradient(ellipse at top, rgba(10, 132, 255, 0.05) 0%, transparent 50%)'
        }}></div>
      </div>

      {/* Modern Sidebar */}
      <div className="w-72 relative z-10">
        <div className="glass-strong h-full flex flex-col overflow-hidden border-r backdrop-blur-2xl" style={{ borderColor: 'rgba(84, 84, 88, 0.35)' }}>
          {/* Modern Logo */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0" style={{ 
              background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(48, 209, 88, 0.1) 100%)'
            }}></div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex items-center gap-3 h-20 px-6"
              style={{ borderBottom: '0.5px solid rgba(84, 84, 88, 0.35)' }}
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ 
                  background: 'linear-gradient(135deg, #0A84FF 0%, #30D158 100%)',
                  boxShadow: '0 4px 14px 0 rgba(10, 132, 255, 0.4)'
                }}
              >
                <Truck className="w-6 h-6" style={{ color: '#FFFFFF' }} />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                  Seymen
                </h1>
                <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  Transport Pro
                </p>
              </div>
            </motion.div>
          </div>

          {/* Modern Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href ||
                (item.href === '/orders' && location.pathname.startsWith('/orders'))
              
              return (
                <Link key={item.name} to={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                      isActive ? 'font-semibold' : ''
                    }`}
                    style={isActive ? { 
                      background: 'linear-gradient(90deg, rgba(10, 132, 255, 0.15) 0%, rgba(10, 132, 255, 0.05) 100%)',
                      border: '0.5px solid rgba(10, 132, 255, 0.3)',
                      boxShadow: '0 2px 8px rgba(10, 132, 255, 0.2)'
                    } : { 
                      backgroundColor: 'transparent',
                      border: '0.5px solid transparent'
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                        style={{ backgroundColor: '#0A84FF' }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <div className="flex items-center flex-1">
                      <Icon 
                        className={`w-5 h-5 mr-3 transition-all duration-200`} 
                        style={{ color: isActive ? '#0A84FF' : 'rgba(235, 235, 245, 0.5)' }} 
                      />
                      <span 
                        className="text-sm transition-colors"
                        style={{ color: isActive ? '#0A84FF' : 'rgba(235, 235, 245, 0.7)' }}
                      >
                        {item.name}
                      </span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs rounded-full font-medium" style={{ 
                        backgroundColor: 'rgba(10, 132, 255, 0.2)',
                        color: '#0A84FF'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Modern Footer with Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-4 py-4"
            style={{ borderTop: '0.5px solid rgba(84, 84, 88, 0.35)' }}
          >
            <div className="p-3 rounded-xl mb-3" style={{ 
              background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(48, 209, 88, 0.1) 100%)',
              border: '0.5px solid rgba(10, 132, 255, 0.2)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" style={{ color: '#0A84FF' }} />
                <span className="text-xs font-semibold" style={{ color: '#0A84FF' }}>
                  Sistem Aktif
                </span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                Tüm sistemler çalışıyor
              </p>
            </div>
            <p className="text-xs text-center" style={{ color: 'rgba(235, 235, 245, 0.3)' }}>
              © 2025 Seymen Transport
            </p>
            <p className="text-xs text-center mt-1" style={{ color: 'rgba(235, 235, 245, 0.2)' }}>
              v1.0.0
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex flex-col h-full bg-[#0a0a0a]">
          {/* Modern Header */}
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-16 flex items-center px-6 backdrop-blur-xl" 
            style={{ 
              backgroundColor: 'rgba(28, 28, 30, 0.8)',
              borderBottom: '0.5px solid rgba(84, 84, 88, 0.35)'
            }}
          >
            <button className="lg:hidden mr-4 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Menu className="w-5 h-5" style={{ color: 'rgba(235, 235, 245, 0.6)' }} />
            </button>
            <div className="flex-1">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold"
                style={{ color: '#FFFFFF' }}
              >
                {navigation.find(item => 
                  location.pathname === item.href ||
                  (item.href === '/orders' && location.pathname.startsWith('/orders'))
                )?.name || 'Seymen Transport'}
              </motion.h2>
            </div>
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(10, 132, 255, 0.1)',
                  border: '0.5px solid rgba(10, 132, 255, 0.2)'
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#30D158' }}></div>
                <span className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.7)' }}>
                  {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </motion.div>
            </div>
          </motion.header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-black">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

