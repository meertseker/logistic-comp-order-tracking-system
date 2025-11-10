import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Package,
  Truck,
  MapPin,
  FileText,
  BarChart3,
  Menu,
  Sparkles,
  Container,
  Navigation,
  Settings as SettingsIcon,
  Zap,
  Radio,
  Activity,
  TrendingUp,
  Layers,
  Shield,
  Mail,
  X,
  Calendar
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
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

export default function Layout({ children }: LayoutProps) {
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

      {/* Modern Glass Effect Sidebar */}
      <div className={`
        fixed lg:relative
        w-80 h-full
        z-50 lg:z-10
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full p-4">
          <motion.div 
            initial={{ opacity: 0, x: -100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 120,
              damping: 18,
              duration: 0.7 
            }}
            className="h-full flex flex-col overflow-hidden glass-card rounded-3xl"
        >
          {/* Modern Glass Header */}
          <div className="relative overflow-hidden border-b border-white/10">
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-10"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.2) 0%, rgba(191, 90, 242, 0.2) 100%)',
                backgroundSize: '200% 200%'
              }}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 150 }}
              className="relative flex items-center gap-4 px-6 py-6"
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer overflow-hidden"
                style={{ 
                  background: 'rgba(10, 132, 255, 0.15)',
                  border: '1px solid rgba(10, 132, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(10, 132, 255, 0.2), 0 0 20px rgba(10, 132, 255, 0.1)'
                }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl opacity-40" 
                  style={{ backgroundColor: '#0A84FF' }} 
                />
                <Truck className="w-7 h-7 relative z-10" style={{ 
                  color: '#0A84FF', 
                  filter: 'drop-shadow(0 2px 4px rgba(10, 132, 255, 0.3))',
                  strokeWidth: 2.5
                }} />
              </motion.div>
              
              <div className="flex-1">
                <motion.h1 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold tracking-tight" 
                  style={{ 
                    color: '#FFFFFF',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Sekersoft
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm font-medium flex items-center gap-1.5 mt-0.5" 
                  style={{ color: 'rgba(235, 235, 245, 0.6)' }}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Transport Pro
                </motion.p>
              </div>

              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ 
                  background: '#30D158',
                  boxShadow: '0 0 8px rgba(48, 209, 88, 0.6)'
                }}
              />
            </motion.div>
          </div>

          {/* Modern Glass Navigation */}
          <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto scrollbar-hide">
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href ||
                (item.href === '/orders' && location.pathname.startsWith('/orders')) ||
                (item.href === '/active-vehicles' && location.pathname === '/active-vehicles')
              
              return (
                <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: index * 0.03,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden cursor-pointer ${
                      isActive ? 'glass-card' : ''
                    }`}
                    style={isActive ? { 
                      background: 'rgba(10, 132, 255, 0.12)',
                      border: '0.5px solid rgba(10, 132, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(10, 132, 255, 0.15)'
                    } : {}}
                  >
                    {/* Glow effect for active */}
                    {isActive && (
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20" 
                        style={{ backgroundColor: '#0A84FF' }} 
                      />
                    )}
                    
                    {/* Hover background */}
                    {!isActive && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
                        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                      />
                    )}
                    
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden"
                      style={isActive ? {
                        background: 'rgba(10, 132, 255, 0.2)',
                        border: '0.5px solid rgba(10, 132, 255, 0.4)'
                      } : {
                        background: 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <motion.div
                        animate={isActive ? { 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 ${isActive ? 'opacity-40' : 'group-hover:opacity-20'} transition-opacity`}
                      />
                      <Icon 
                        className="w-4.5 h-4.5 relative z-10 transition-colors" 
                        style={{ 
                          color: isActive ? '#0A84FF' : 'rgba(235, 235, 245, 0.7)',
                          strokeWidth: 2.5
                        }} 
                      />
                    </div>
                    
                    <span 
                      className="text-sm font-medium transition-colors relative z-10"
                      style={{ 
                        color: isActive ? '#FFFFFF' : 'rgba(235, 235, 245, 0.75)',
                        fontWeight: isActive ? 600 : 500
                      }}
                    >
                      {item.name}
                    </span>
                    
                    {item.badge && (
                      <span 
                        className="ml-auto px-2 py-0.5 text-xs rounded-full font-semibold relative z-10" 
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF'
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

          {/* Modern Glass Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
            className="px-5 py-5 border-t border-white/10"
          >
            {/* Status Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-4 mb-4 relative overflow-hidden"
              style={{ 
                background: 'rgba(48, 209, 88, 0.1)',
                border: '0.5px solid rgba(48, 209, 88, 0.2)'
              }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20" 
                style={{ backgroundColor: '#30D158' }} 
              />
              
              <div className="flex items-center gap-3 relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{
                    background: 'rgba(48, 209, 88, 0.2)',
                    border: '0.5px solid rgba(48, 209, 88, 0.3)'
                  }}
                >
                  <Activity className="w-4.5 h-4.5" style={{ 
                    color: '#30D158',
                    strokeWidth: 2.5
                  }} />
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                      Sistem Aktif
                    </span>
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: '#30D158',
                        boxShadow: '0 0 6px rgba(48, 209, 88, 0.6)'
                      }}
                    />
                  </div>
                  <p className="text-xs mt-0.5 flex items-center gap-1" 
                    style={{ color: 'rgba(235, 235, 245, 0.6)' }}
                  >
                    <Zap className="w-3 h-3" style={{ color: 'rgba(48, 209, 88, 0.8)' }} />
                    Tüm sistemler çalışıyor
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Footer Info */}
            <div className="space-y-2.5">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-center font-medium flex items-center justify-center gap-2" 
                style={{ color: 'rgba(235, 235, 245, 0.5)' }}
              >
                <Shield className="w-3 h-3" />
                © 2025 Sekersoft
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center"
              >
                <div className="px-3 py-1.5 rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="text-xs font-medium" style={{ 
                    color: 'rgba(235, 235, 245, 0.5)',
                    letterSpacing: '0.02em'
                  }}>
                    v1.0.0 Pro
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex flex-col h-full">
          {/* Modern Glass Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mx-3 sm:mx-4 mt-3 sm:mt-4 glass-card rounded-2xl overflow-hidden relative"
          >
            <div className="h-14 sm:h-16 flex items-center px-4 sm:px-6 relative z-10">
              {/* Subtle gradient overlay */}
              <motion.div 
                animate={{ 
                  backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-5" 
                style={{
                  background: 'linear-gradient(90deg, rgba(10, 132, 255, 0.3) 0%, rgba(191, 90, 242, 0.3) 50%, rgba(10, 132, 255, 0.3) 100%)',
                  backgroundSize: '200% 100%'
                }}
              />
              
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-3 p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-all duration-200 relative z-10"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                ) : (
                  <Menu className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                )}
              </button>
              
              <div className="flex-1 relative z-10">
                <motion.h2 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-base sm:text-xl font-bold tracking-tight truncate"
                  style={{ 
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {navigation.find(item => 
                    location.pathname === item.href ||
                    (item.href === '/orders' && location.pathname.startsWith('/orders')) ||
                    (item.href === '/active-vehicles' && location.pathname === '/active-vehicles')
                  )?.name || 'Sekersoft'}
                </motion.h2>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ scale: 1.03 }}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '0.5px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <Calendar className="w-3.5 h-3.5" style={{ color: 'rgba(235, 235, 245, 0.7)' }} />
                  <span className="text-xs font-medium" style={{ 
                    color: 'rgba(235, 235, 245, 0.85)'
                  }}>
                    {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Page Content with clean background */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 relative">
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

