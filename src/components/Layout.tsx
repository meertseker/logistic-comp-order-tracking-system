import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Package,
  Truck,
  MapPin,
  FileText,
  Menu,
  Radio,
  TrendingUp,
  Layers,
  Mail,
  X,
  Calendar
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  whiteBackground?: boolean
}

const navigation = [
  { name: 'Ana Sayfa', href: '/', icon: Home, badge: null, gradient: 'from-blue-400 to-cyan-400' },
  { name: 'Siparişler', href: '/orders', icon: Package, badge: null, gradient: 'from-purple-400 to-pink-400' },
  { name: 'Aktif Araçlar', href: '/active-vehicles', icon: Radio, badge: null, gradient: 'from-green-400 to-emerald-400' },
  { name: 'Araçlar', href: '/vehicles', icon: Truck, badge: null, gradient: 'from-orange-400 to-amber-400' },
  { name: 'Dorseler', href: '/trailers', icon: Layers, badge: null, gradient: 'from-indigo-400 to-purple-400' },
  { name: 'Güzergahlar', href: '/routes', icon: MapPin, badge: null, gradient: 'from-red-400 to-rose-400' },
  { name: 'Raporlar', href: '/reports', icon: FileText, badge: null, gradient: 'from-teal-400 to-cyan-400' },
  { name: 'Grafikler', href: '/charts', icon: TrendingUp, badge: null, gradient: 'from-yellow-400 to-orange-400' },
  { name: 'Mail', href: '/mail', icon: Mail, badge: null, gradient: 'from-pink-400 to-fuchsia-400' },
  { name: 'Ayarlar', href: '/settings', icon: SettingsIcon, badge: null, gradient: 'from-gray-400 to-slate-400' },
]

export default function Layout({ children, whiteBackground = false }: LayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Professional Background Image */}
      <div className="fixed inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/background.jpeg)',
          }}
        />
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/65" />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(0, 0, 0, 0.3) 100%)'
        }} />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* iOS 26 Minimal Sidebar */}
      <div className={`
        fixed lg:relative
        w-72 h-full
        z-50 lg:z-10
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full p-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 25,
              duration: 0.4 
            }}
            className="h-full flex flex-col overflow-hidden glass rounded-2xl"
            style={{
              background: 'rgba(28, 28, 30, 0.75)',
              backdropFilter: 'saturate(180%) blur(30px)',
              WebkitBackdropFilter: 'saturate(180%) blur(30px)',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Minimal Header */}
            <div className="px-5 pt-6 pb-5 border-b border-white/5">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ 
                    background: 'rgba(10, 132, 255, 0.12)',
                    border: '0.5px solid rgba(10, 132, 255, 0.2)'
                  }}
                >
                  <Truck className="w-5 h-5" style={{ 
                    color: '#0A84FF',
                    strokeWidth: 2
                  }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 
                    className="text-lg font-semibold truncate" 
                    style={{ 
                      color: '#FFFFFF',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Sekersoft
                  </h1>
                  <p 
                    className="text-xs mt-0.5 truncate" 
                    style={{ color: 'rgba(235, 235, 245, 0.5)' }}
                  >
                    Transport Pro
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Minimal Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
              {navigation.map((item, index) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href ||
                  (item.href === '/orders' && location.pathname.startsWith('/orders')) ||
                  (item.href === '/active-vehicles' && location.pathname === '/active-vehicles')
                
                return (
                  <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: index * 0.02,
                        duration: 0.2
                      }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative ${
                        isActive ? '' : ''
                      }`}
                      style={isActive ? { 
                        background: 'rgba(10, 132, 255, 0.15)',
                      } : {}}
                    >
                      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg"
                        style={isActive ? {
                          background: 'rgba(10, 132, 255, 0.2)',
                        } : {
                          background: 'transparent'
                        }}
                      >
                        <Icon 
                          className="w-4 h-4 transition-colors" 
                          style={{ 
                            color: isActive ? '#0A84FF' : 'rgba(235, 235, 245, 0.6)',
                            strokeWidth: 2
                          }} 
                        />
                      </div>
                      
                      <span 
                        className="text-sm font-medium transition-colors flex-1"
                        style={{ 
                          color: isActive ? '#FFFFFF' : 'rgba(235, 235, 245, 0.7)',
                          fontWeight: isActive ? 600 : 400
                        }}
                      >
                        {item.name}
                      </span>
                      
                      {item.badge && (
                        <span 
                          className="px-2 py-0.5 text-xs rounded-md font-medium" 
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(235, 235, 245, 0.8)'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </nav>

            {/* Minimal Footer */}
            <div className="px-4 py-4 border-t border-white/5">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ 
                  background: 'rgba(48, 209, 88, 0.08)',
                  border: '0.5px solid rgba(48, 209, 88, 0.15)'
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#30D158',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>
                    Sistem Aktif
                  </p>
                </div>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="text-xs text-center mt-3" 
                style={{ color: 'rgba(235, 235, 245, 0.4)' }}
              >
                © 2025 Sekersoft
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex flex-col h-full">
          {/* Minimal Header */}
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-3 sm:mx-4 mt-3 sm:mt-4 rounded-xl overflow-hidden relative"
            style={{
              background: 'rgba(28, 28, 30, 0.75)',
              backdropFilter: 'saturate(180%) blur(30px)',
              WebkitBackdropFilter: 'saturate(180%) blur(30px)',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="h-14 sm:h-16 flex items-center px-4 sm:px-5 relative z-10">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-3 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-all duration-150 relative z-10"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                ) : (
                  <Menu className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                )}
              </button>
              
              <div className="flex-1 relative z-10">
                <h2 
                  className="text-base sm:text-lg font-semibold tracking-tight truncate"
                  style={{ 
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {navigation.find(item => 
                    location.pathname === item.href ||
                    (item.href === '/orders' && location.pathname.startsWith('/orders')) ||
                    (item.href === '/active-vehicles' && location.pathname === '/active-vehicles')
                  )?.name || 'Sekersoft'}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '0.5px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <Calendar className="w-3.5 h-3.5" style={{ color: 'rgba(235, 235, 245, 0.6)' }} />
                  <span className="text-xs font-medium" style={{ 
                    color: 'rgba(235, 235, 245, 0.7)'
                  }}>
                    {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Page Content with clean background */}
          <main 
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 relative"
            style={whiteBackground ? { backgroundColor: '#ffffff' } : {}}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="animate-fade-in relative z-10"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

