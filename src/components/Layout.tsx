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
  { name: 'Raporlar', href: '/reports', icon: DocumentTextIcon },
  { name: 'Grafikler', href: '/charts', icon: DocumentTextIcon },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600 text-white">
            <TruckIcon className="w-8 h-8 mr-2" />
            <h1 className="text-xl font-bold">Seymen Transport</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href ||
                (item.href === '/orders' && location.pathname.startsWith('/orders'))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2025 Seymen Transport
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <button className="lg:hidden mr-4">
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">
              {navigation.find(item => 
                location.pathname === item.href ||
                (item.href === '/orders' && location.pathname.startsWith('/orders'))
              )?.name || 'Seymen Transport'}
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

