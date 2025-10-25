import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import CreateOrderAdvanced from './pages/CreateOrderAdvanced'
import Reports from './pages/Reports'
import VehiclesProfessional from './pages/VehiclesProfessional'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<CreateOrderAdvanced />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/vehicles" element={<VehiclesProfessional />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

