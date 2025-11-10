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
  Container,
  Navigation,
  Settings as SettingsIcon
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Ana Sayfa', href: '/', icon: Home, badge: null },
  { name: 'Siparişler', href: '/orders', icon: Package, badge: null },
  { name: 'Aktif Araçlar', href: '/active-vehicles', icon: Navigation, badge: null },
  { name: 'Araçlar', href: '/vehicles', icon: Truck, badge: null },
  { name: 'Dorseler', href: '/trailers', icon: Container, badge: null },
  { name: 'Güzergahlar', href: '/routes', icon: MapPin, badge: null },
  { name: 'Raporlar', href: '/reports', icon: FileText, badge: null },
  { name: 'Grafikler', href: '/charts', icon: BarChart3, badge: null },
  { name: 'Ayarlar', href: '/settings', icon: SettingsIcon, badge: null },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

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

      {/* Apple-style Floating Glassmorphic Sidebar */}
      <div className="w-80 relative z-10 p-4">
        <motion.div 
          initial={{ opacity: 0, x: -100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.8 
          }}
          className="h-full flex flex-col overflow-hidden rounded-3xl"
          style={{ 
            background: 'rgba(28, 28, 30, 0.78)',
            backdropFilter: 'saturate(180%) blur(40px)',
            WebkitBackdropFilter: 'saturate(180%) blur(40px)',
            border: '0.5px solid rgba(255, 255, 255, 0.18)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.08) inset,
              0 20px 50px rgba(0, 0, 0, 0.3)
            `,
          }}
        >
          {/* Apple iOS Liquid Glass Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0" style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            }}></div>
            <div className="absolute inset-0 opacity-40" style={{
              background: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 70%)'
            }}></div>
            
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative flex items-center gap-4 h-24 px-7"
              style={{ borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)' }}
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
                transition={{ duration: 0.4 }}
                className="relative flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: '0.5px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `
                    0 4px 16px rgba(0, 0, 0, 0.2),
                    0 0 0 1px rgba(255, 255, 255, 0.08) inset
                  `
                }}
              >
                <Truck className="w-7 h-7" style={{ 
                  color: 'rgba(255, 255, 255, 0.95)', 
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
                }} />
              </motion.div>
              
              <div className="flex-1">
                <h1 className="text-xl font-bold tracking-tight" style={{ 
                  color: 'rgba(255, 255, 255, 0.98)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  letterSpacing: '-0.02em'
                }}>
                  Seymen
                </h1>
                <p className="text-sm font-medium" style={{ 
                  color: 'rgba(235, 235, 245, 0.6)',
                  letterSpacing: '0.01em'
                }}>
                  Transport Pro
                </p>
              </div>

              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)'
                }}
              />
            </motion.div>
          </div>

          {/* Apple iOS Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href ||
                (item.href === '/orders' && location.pathname.startsWith('/orders')) ||
                (item.href === '/active-vehicles' && location.pathname === '/active-vehicles')
              
              return (
                <Link key={item.name} to={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: index * 0.06,
                      type: "spring",
                      stiffness: 200,
                      damping: 22
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      x: 4,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                      isActive ? 'font-semibold' : ''
                    }`}
                    style={isActive ? { 
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '0.5px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: `
                        0 2px 12px rgba(0, 0, 0, 0.15),
                        0 0 0 1px rgba(255, 255, 255, 0.1) inset
                      `
                    } : { 
                      backgroundColor: 'transparent',
                      border: '0.5px solid transparent',
                    }}
                  >
                    {/* Subtle hover effect */}
                    {!isActive && (
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                        }}
                      />
                    )}
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeAppleSidebar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.9)',
                          boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)'
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    <div className="flex items-center flex-1 relative z-10">
                      <Icon 
                        className={`w-5 h-5 mr-3 transition-all duration-200`} 
                        style={{ 
                          color: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(235, 235, 245, 0.6)',
                          strokeWidth: isActive ? 2.5 : 2
                        }} 
                      />
                      <span 
                        className="text-sm transition-all duration-200"
                        style={{ 
                          color: isActive ? 'rgba(255, 255, 255, 0.98)' : 'rgba(235, 235, 245, 0.75)',
                          fontWeight: isActive ? 600 : 500,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    
                    {item.badge && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 text-xs rounded-full font-semibold relative z-10" 
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '0.5px solid rgba(255, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          fontSize: '11px'
                        }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Apple iOS Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="px-5 py-5 relative"
            style={{ borderTop: '0.5px solid rgba(255, 255, 255, 0.1)' }}
          >
            <div className="absolute inset-0 opacity-30" style={{
              background: 'radial-gradient(circle at bottom, rgba(255, 255, 255, 0.05) 0%, transparent 70%)'
            }}></div>
            
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative p-4 rounded-xl mb-4 overflow-hidden" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="absolute inset-0 opacity-20" style={{
                background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.15) 0%, transparent 60%)'
              }}></div>
              
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-4 h-4" style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))'
                  }} />
                </motion.div>
                <span className="text-sm font-semibold" style={{ 
                  color: 'rgba(255, 255, 255, 0.95)',
                  letterSpacing: '-0.01em'
                }}>
                  Sistem Aktif
                </span>
              </div>
              <p className="text-xs relative z-10" style={{ 
                color: 'rgba(235, 235, 245, 0.65)',
                fontSize: '11px'
              }}>
                Tüm sistemler çalışıyor
              </p>
            </motion.div>
            
            <div className="relative z-10 space-y-1">
              <p className="text-xs text-center font-medium" style={{ 
                color: 'rgba(235, 235, 245, 0.45)',
                fontSize: '11px'
              }}>
                © 2025 Seymen Transport
              </p>
              <p className="text-xs text-center" style={{ 
                color: 'rgba(235, 235, 245, 0.35)',
                fontSize: '10px',
                letterSpacing: '0.02em'
              }}>
                v1.0.0 Pro
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex flex-col h-full">
          {/* Floating Liquid Glass Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mx-4 mt-4 rounded-2xl overflow-hidden relative"
          >
            <div 
              className="h-16 flex items-center px-6 backdrop-blur-xl relative z-10" 
              style={{ 
                background: 'rgba(20, 20, 22, 0.7)',
                backdropFilter: 'saturate(180%) blur(30px)',
                WebkitBackdropFilter: 'saturate(180%) blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `
                  0 4px 24px rgba(0, 0, 0, 0.3),
                  0 0 0 1px rgba(255, 255, 255, 0.05) inset
                `
              }}
            >
              {/* Subtle animated background */}
              <div className="absolute inset-0 opacity-20" style={{
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
              }}></div>
              
              <button className="lg:hidden mr-4 p-2 rounded-xl hover:bg-white/5 transition-all duration-200 relative z-10">
                <Menu className="w-5 h-5" style={{ color: 'rgba(235, 235, 245, 0.6)' }} />
              </button>
              
              <div className="flex-1 relative z-10">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-bold tracking-tight"
                  style={{ 
                    color: '#FFFFFF',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {navigation.find(item => 
                    location.pathname === item.href ||
                    (item.href === '/orders' && location.pathname.startsWith('/orders')) ||
                    (item.href === '/active-vehicles' && location.pathname === '/active-vehicles')
                  )?.name || 'Seymen Transport'}
                </motion.h2>
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl relative overflow-hidden"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '0.5px solid rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <motion.div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="text-xs font-medium" style={{ 
                    color: 'rgba(235, 235, 245, 0.85)',
                    letterSpacing: '-0.01em'
                  }}>
                    {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Page Content with clean background */}
          <main className="flex-1 overflow-y-auto p-6 relative">
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

