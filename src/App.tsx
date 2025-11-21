import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import CreateOrderFixed from './pages/CreateOrderFixed'
import EditOrder from './pages/EditOrder'
import ReportsProfessional from './pages/ReportsProfessional'
import ChartsProfessional from './pages/ChartsProfessional'
import VehiclesProfessional from './pages/VehiclesProfessional'
import RoutesPage from './pages/Routes'
import TrailersPro from './pages/TrailersPro'
import ActiveVehicles from './pages/ActiveVehicles'
import SettingsProfessional from './pages/SettingsProfessional'
import MailProfessional from './pages/MailProfessional'
import DesignComponents from './pages/DesignComponents'
import { ToastProvider } from './context/ToastContext'
import LicenseActivation from './components/LicenseActivation'
import UpdateNotification from './components/UpdateNotification'

function App() {
  const location = useLocation()
  const [isLicensed, setIsLicensed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  // Design components sayfası lisans kontrolü olmadan erişilebilir
  const isDesignComponentsPage = location.pathname === '/design-components'

  useEffect(() => {
    // Design components sayfası için lisans kontrolü yapma
    if (isDesignComponentsPage) {
      setLoading(false)
      return
    }
    checkLicense()
  }, [location.pathname, isDesignComponentsPage])

  const checkLicense = async () => {
    try {
      const validation = await window.electronAPI.license.validate()
      setIsLicensed(validation.valid)
    } catch (error) {
      console.error('Lisans kontrolü hatası:', error)
      setIsLicensed(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLicenseActivated = () => {
    setIsLicensed(true)
  }

  // Design components sayfası - lisans kontrolü olmadan göster
  if (isDesignComponentsPage) {
    return (
      <ToastProvider>
        <Layout whiteBackground>
          <DesignComponents />
        </Layout>
      </ToastProvider>
    )
  }

  // Yükleniyor
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  // Lisans yoksa aktivasyon ekranını göster
  if (!isLicensed) {
    return <LicenseActivation onActivated={handleLicenseActivated} />
  }

  // Lisans varsa normal uygulamayı göster
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<CreateOrderFixed />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/:id/edit" element={<EditOrder />} />
          <Route path="/reports" element={<ReportsProfessional />} />
          <Route path="/charts" element={<ChartsProfessional />} />
          <Route path="/vehicles" element={<VehiclesProfessional />} />
          <Route path="/active-vehicles" element={<ActiveVehicles />} />
          <Route path="/trailers" element={<TrailersPro />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/mail" element={<MailProfessional />} />
          <Route path="/settings" element={<SettingsProfessional />} />
          <Route path="/design-components" element={<DesignComponents />} />
        </Routes>
      </Layout>
      {/* Auto-update notification */}
      <UpdateNotification />
    </ToastProvider>
  )
}

function AppWrapper() {
  return (
    <Router>
      <Routes>
        {/* Design components sayfası - lisans kontrolü olmadan */}
        <Route 
          path="/design-components" 
          element={
            <ToastProvider>
              <Layout whiteBackground>
                <DesignComponents />
              </Layout>
            </ToastProvider>
          } 
        />
        {/* Diğer sayfalar - lisans kontrolü ile */}
        <Route path="*" element={<App />} />
      </Routes>
    </Router>
  )
}

export default AppWrapper
