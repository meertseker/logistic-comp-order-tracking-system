import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  TruckIcon,
  DocumentTextIcon,
  Bars3Icon,
} from './Icons'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Ana Sayfa', href: '/', icon: HomeIcon },
  { name: 'Siparişler', href: '/orders', icon: TruckIcon },
  { name: 'Araçlar', href: '/vehicles', icon: TruckIcon },
  { name: 'Güzergahlar', href: '/routes', icon: DocumentTextIcon },
  { name: 'Raporlar', href: '/reports', icon: DocumentTextIcon },
  { name: 'Grafikler', href: '/charts', icon: DocumentTextIcon },
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

      {/* Sidebar */}
      <div className="w-72 relative z-10 m-0 mr-0">
        <div className="glass-strong h-full flex flex-col overflow-hidden border-r border-white/10 backdrop-blur-2xl">
          {/* Logo */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[#1c1c1e]"></div>
            <div className="relative flex items-center justify-center h-20 px-6 text-white border-b border-white/10">
              <TruckIcon className="w-8 h-8 mr-3 text-primary-500" />
              <h1 className="text-xl font-semibold tracking-tight">Seymen Transport</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href ||
                (item.href === '/orders' && location.pathname.startsWith('/orders'))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'font-medium'
                      : 'hover:bg-white/5'
                  }`}
                  style={isActive ? { 
                    backgroundColor: 'rgba(10, 132, 255, 0.15)',
                    color: '#0A84FF'
                  } : { color: 'rgba(235, 235, 245, 0.6)' }}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-colors`} 
                    style={{ color: isActive ? '#0A84FF' : 'rgba(235, 235, 245, 0.3)' }} />
                  <span className="text-sm group-hover:text-white transition-colors">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t backdrop-blur-xl" style={{ borderColor: 'rgba(84, 84, 88, 0.65)' }}>
            <p className="text-xs text-center" style={{ color: 'rgba(235, 235, 245, 0.3)' }}>
              © 2025 Seymen Transport
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex flex-col h-full bg-[#0a0a0a]">
          {/* Header */}
          <header className="border-b border-white/10 h-16 flex items-center px-6 backdrop-blur-xl" style={{ backgroundColor: 'rgba(28, 28, 30, 0.8)' }}>
            <button className="lg:hidden mr-4 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Bars3Icon className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">
                {navigation.find(item => 
                  location.pathname === item.href ||
                  (item.href === '/orders' && location.pathname.startsWith('/orders'))
                )?.name || 'Seymen Transport'}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </header>

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

