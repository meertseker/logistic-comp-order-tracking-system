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
  Settings as SettingsIcon,
  Zap,
  Radio,
  Activity,
  TrendingUp,
  Layers,
  Shield
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
  { name: 'Ayarlar', href: '/settings', icon: SettingsIcon, badge: null, gradient: 'from-gray-400 to-slate-400' },
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

      {/* Ultra Modern iOS 26 Liquid Glass Sidebar */}
      <div className="w-80 relative z-10 p-4">
        <motion.div 
          initial={{ opacity: 0, x: -100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 120,
            damping: 18,
            duration: 0.7 
          }}
          className="h-full flex flex-col overflow-hidden rounded-[28px]"
          style={{ 
            background: 'linear-gradient(165deg, rgba(32, 32, 36, 0.92) 0%, rgba(22, 22, 26, 0.88) 100%)',
            backdropFilter: 'saturate(200%) blur(60px)',
            WebkitBackdropFilter: 'saturate(200%) blur(60px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: `
              0 12px 48px rgba(0, 0, 0, 0.55),
              0 0 0 1px rgba(255, 255, 255, 0.06) inset,
              0 24px 64px rgba(0, 0, 0, 0.4),
              0 2px 8px rgba(255, 255, 255, 0.04) inset
            `,
          }}
        >
          {/* Ultra Modern iOS 26 Liquid Glass Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0" style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)',
            }}></div>
            <div className="absolute inset-0 opacity-50" style={{
              background: 'radial-gradient(circle at top left, rgba(100, 200, 255, 0.18) 0%, transparent 65%)'
            }}></div>
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                backgroundSize: '200% 200%'
              }}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 150 }}
              className="relative flex items-center gap-4 h-28 px-7"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.12, 
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5, type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center justify-center w-16 h-16 rounded-[18px] cursor-pointer"
                style={{ 
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: `
                    0 8px 24px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                    0 2px 4px rgba(255, 255, 255, 0.1) inset
                  `
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-[18px]"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(100, 200, 255, 0.2) 0%, transparent 70%)',
                  }}
                />
                <Truck className="w-8 h-8 relative z-10" style={{ 
                  color: 'rgba(255, 255, 255, 0.98)', 
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
                  strokeWidth: 2.2
                }} />
              </motion.div>
              
              <div className="flex-1">
                <motion.h1 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-2xl font-bold tracking-tight" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.98)',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '-0.03em',
                    fontWeight: 700
                  }}
                >
                  Seymen
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm font-semibold flex items-center gap-1.5" 
                  style={{ 
                    color: 'rgba(235, 235, 245, 0.65)',
                    letterSpacing: '0.02em'
                  }}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Transport Pro
                </motion.p>
              </div>

              <motion.div
                className="relative flex items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-4 h-4 rounded-full"
                  style={{ 
                    background: 'rgba(52, 211, 153, 0.4)',
                    filter: 'blur(4px)'
                  }}
                />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2.5 h-2.5 rounded-full relative z-10"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(52, 211, 153, 1) 0%, rgba(34, 197, 94, 1) 100%)',
                    boxShadow: '0 0 12px rgba(52, 211, 153, 0.6), 0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Ultra Modern iOS 26 Navigation */}
          <nav className="flex-1 px-4 py-7 space-y-2 overflow-y-auto scrollbar-hide">
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href ||
                (item.href === '/orders' && location.pathname.startsWith('/orders')) ||
                (item.href === '/active-vehicles' && location.pathname === '/active-vehicles')
              
              return (
                <Link key={item.name} to={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 250,
                      damping: 20
                    }}
                    whileHover={{ 
                      scale: 1.03, 
                      x: 6,
                      transition: { duration: 0.25, type: "spring", stiffness: 400 }
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`group flex items-center justify-between px-4 py-4 rounded-[16px] transition-all duration-300 relative overflow-hidden cursor-pointer`}
                    style={isActive ? { 
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%)',
                      backdropFilter: 'blur(30px)',
                      WebkitBackdropFilter: 'blur(30px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: `
                        0 4px 16px rgba(0, 0, 0, 0.2),
                        0 0 0 1px rgba(255, 255, 255, 0.12) inset,
                        0 8px 24px rgba(0, 0, 0, 0.15)
                      `
                    } : { 
                      backgroundColor: 'transparent',
                      border: '1px solid transparent',
                    }}
                  >
                    {/* Animated gradient hover overlay */}
                    {!isActive && (
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[16px]"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                        }}
                      />
                    )}
                    
                    {/* Active indicator - modern pill shape */}
                    {isActive && (
                      <>
                        <motion.div
                          layoutId="activeAppleSidebar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full"
                          style={{ 
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 100%)',
                            boxShadow: '0 0 12px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.2)'
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                        {/* Subtle glow effect */}
                        <motion.div
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-[16px]"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
                          }}
                        />
                      </>
                    )}
                    
                    <div className="flex items-center flex-1 relative z-10">
                      {/* Modern icon container with gradient */}
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        className={`relative flex items-center justify-center w-10 h-10 rounded-[12px] mr-3.5 overflow-hidden`}
                        style={isActive ? {
                          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)`,
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                        } : {
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {/* Animated gradient background for icon */}
                        <motion.div
                          animate={isActive ? { 
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            opacity: [0.6, 0.8, 0.6]
                          } : {}}
                          transition={{ duration: 3, repeat: Infinity }}
                          className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-30 ${isActive ? 'opacity-40' : ''} transition-opacity duration-300`}
                          style={{ backgroundSize: '200% 200%' }}
                        />
                        <Icon 
                          className={`w-5 h-5 transition-all duration-300 relative z-10`} 
                          style={{ 
                            color: isActive ? 'rgba(255, 255, 255, 0.98)' : 'rgba(235, 235, 245, 0.7)',
                            strokeWidth: isActive ? 2.5 : 2.2,
                            filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none'
                          }} 
                        />
                      </motion.div>
                      
                      <span 
                        className="text-sm transition-all duration-300"
                        style={{ 
                          color: isActive ? 'rgba(255, 255, 255, 0.98)' : 'rgba(235, 235, 245, 0.75)',
                          fontWeight: isActive ? 600 : 500,
                          letterSpacing: '-0.01em',
                          textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none'
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    
                    {/* Badge or chevron */}
                    {item.badge ? (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2.5 py-1 text-xs rounded-full font-semibold relative z-10" 
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          color: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          fontSize: '11px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {item.badge}
                      </motion.span>
                    ) : (
                      <motion.div
                        animate={isActive ? { x: [0, 3, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Ultra Modern iOS 26 Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="px-5 py-6 relative"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            {/* Animated background gradients */}
            <div className="absolute inset-0 opacity-40" style={{
              background: 'radial-gradient(circle at bottom, rgba(100, 200, 255, 0.08) 0%, transparent 70%)'
            }}></div>
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%, rgba(255, 255, 255, 0.03) 100%)',
                backgroundSize: '200% 200%'
              }}
            />
            
            {/* Status card with enhanced glassmorphism */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="relative p-5 rounded-[18px] mb-5 overflow-hidden cursor-pointer" 
              style={{ 
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: `
                  0 4px 16px rgba(0, 0, 0, 0.15),
                  0 0 0 1px rgba(255, 255, 255, 0.08) inset,
                  0 8px 24px rgba(0, 0, 0, 0.1)
                `
              }}
            >
              {/* Animated glow effect */}
              <motion.div 
                animate={{ 
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 opacity-30" 
                style={{
                  background: 'radial-gradient(circle at top right, rgba(52, 211, 153, 0.25) 0%, transparent 60%)'
                }}
              />
              
              <div className="flex items-center gap-3.5 mb-2.5 relative z-10">
                <motion.div
                  className="relative flex items-center justify-center"
                >
                  {/* Pulsing ring */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute w-8 h-8 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, transparent 70%)',
                      filter: 'blur(4px)'
                    }}
                  />
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.15, 1]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <Activity className="w-5 h-5" style={{ 
                      color: 'rgba(52, 211, 153, 1)',
                      filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.5))',
                      strokeWidth: 2.5
                    }} />
                  </motion.div>
                </motion.div>
                
                <div className="flex-1">
                  <motion.span 
                    className="text-sm font-bold flex items-center gap-2" 
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.98)',
                      letterSpacing: '-0.02em',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    Sistem Aktif
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: 'rgba(52, 211, 153, 1)',
                        boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)'
                      }}
                    />
                  </motion.span>
                  <p className="text-xs mt-1 flex items-center gap-1.5" style={{ 
                    color: 'rgba(235, 235, 245, 0.7)',
                    fontSize: '11px'
                  }}>
                    <Zap className="w-3 h-3" style={{ color: 'rgba(52, 211, 153, 0.8)' }} />
                    Tüm sistemler çalışıyor
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Modern divider */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="h-[1px] mb-5 mx-4"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)'
              }}
            />
            
            {/* Copyright section */}
            <div className="relative z-10 space-y-2">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-center font-semibold flex items-center justify-center gap-2" 
                style={{ 
                  color: 'rgba(235, 235, 245, 0.5)',
                  fontSize: '11px'
                }}
              >
                <Shield className="w-3 h-3" style={{ color: 'rgba(235, 235, 245, 0.4)' }} />
                © 2025 Seymen Transport
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-center gap-2"
              >
                <div className="px-2.5 py-1 rounded-full" style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <p className="text-xs font-medium" style={{ 
                    color: 'rgba(235, 235, 245, 0.45)',
                    fontSize: '10px',
                    letterSpacing: '0.03em'
                  }}>
                    v1.0.0 Pro
                  </p>
                </div>
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-1 rounded-full"
                  style={{ background: 'rgba(52, 211, 153, 0.6)' }}
                />
              </motion.div>
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

