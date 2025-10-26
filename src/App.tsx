import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import CreateOrderFixed from './pages/CreateOrderFixed'
import EditOrder from './pages/EditOrder'
import Reports from './pages/Reports'
import ChartsPage from './pages/ChartsPage'
import VehiclesProfessional from './pages/VehiclesProfessional'
import { ToastProvider } from './context/ToastContext'

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<CreateOrderFixed />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/:id/edit" element={<EditOrder />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/vehicles" element={<VehiclesProfessional />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  )
}

export default App

