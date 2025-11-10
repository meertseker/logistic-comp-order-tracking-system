import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import AdvancedFilters from '../components/AdvancedFilters'
import Pagination from '../components/Pagination'
import { formatCurrency, formatDate } from '../utils/formatters'
import { exportOrdersToExcel } from '../utils/excelExport'

const ITEMS_PER_PAGE = 50

const STATUS_OPTIONS = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'Bekliyor', label: 'Bekliyor' },
  { value: 'Yolda', label: 'Yolda' },
  { value: 'Teslim Edildi', label: 'Teslim Edildi' },
  { value: 'Faturalandı', label: 'Faturalandı' },
  { value: 'İptal', label: 'İptal' },
]

export default function Orders() {
  const [allOrders, setAllOrders] = useState<any[]>([]) // Tüm siparişler
  const [orders, setOrders] = useState<any[]>([]) // Filtrelenmiş siparişler
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]) // Çoklu seçim
  const [statistics, setStatistics] = useState({
    toplamGelir: 0,
    toplamMaliyet: 0,
    toplamKar: 0,
    toplamSiparis: 0,
    gercekKarMarji: 0,      // Gerçek kâr marjı %
    hedefKarSapmasi: 0,     // Hedef kâr sapması
  })

  // Pagination hesaplama
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem)

  const isAllSelected = currentOrders.length > 0 && currentOrders.every(o => selectedOrders.includes(o.id))

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  useEffect(() => {
    applyFilters()
  }, [allOrders, search, advancedFilters])

  useEffect(() => {
    calculateStatistics()
  }, [orders])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      if (statusFilter) filters.status = statusFilter
      
      const data = await window.electronAPI.db.getOrders(filters)
      setAllOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allOrders]

    // Arama
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(o => 
        o.plaka?.toLowerCase().includes(searchLower) ||
        o.musteri?.toLowerCase().includes(searchLower) ||
        o.telefon?.includes(search)
      )
    }

    // Gelişmiş filtreler
    if (advancedFilters) {
      // Tarih aralığı
      if (advancedFilters.dateFrom) {
        filtered = filtered.filter(o => new Date(o.created_at) >= new Date(advancedFilters.dateFrom))
      }
      if (advancedFilters.dateTo) {
        const dateTo = new Date(advancedFilters.dateTo)
        dateTo.setHours(23, 59, 59)
        filtered = filtered.filter(o => new Date(o.created_at) <= dateTo)
      }

      // Fiyat aralığı
      if (advancedFilters.priceMin) {
        filtered = filtered.filter(o => o.baslangic_fiyati >= Number(advancedFilters.priceMin))
      }
      if (advancedFilters.priceMax) {
        filtered = filtered.filter(o => o.baslangic_fiyati <= Number(advancedFilters.priceMax))
      }

      // Karlılık
      if (advancedFilters.profitability) {
        if (advancedFilters.profitability === 'profitable') {
          filtered = filtered.filter(o => (o.kar_zarar || 0) > 100)
        } else if (advancedFilters.profitability === 'loss') {
          filtered = filtered.filter(o => (o.kar_zarar || 0) < -100)
        } else if (advancedFilters.profitability === 'breakeven') {
          filtered = filtered.filter(o => Math.abs(o.kar_zarar || 0) <= 100)
        }
      }
    }

    setOrders(filtered)
    setCurrentPage(1) // Filtre değişince ilk sayfaya dön
  }

  const calculateStatistics = () => {
    const toplamGelir = orders.reduce((sum, o) => sum + (o.baslangic_fiyati || 0), 0)
    const toplamMaliyet = orders.reduce((sum, o) => sum + (o.toplam_maliyet || 0), 0)
    const toplamOnerilenFiyat = orders.reduce((sum, o) => sum + (o.onerilen_fiyat || 0), 0)
    
    // Gerçek Kâr: Müşteri ödemesi - Maliyet
    const gercekKar = toplamGelir - toplamMaliyet
    
    // Gerçek Kâr Marjı: (Gerçek Kâr / Toplam Gelir) × 100
    const gercekKarMarji = toplamGelir > 0 ? (gercekKar / toplamGelir) * 100 : 0
    
    // Hedef Kâr Sapması: Müşteri ödemesi - Önerilen fiyat
    const hedefKarSapmasi = toplamGelir - toplamOnerilenFiyat
    
    setStatistics({
      toplamGelir,
      toplamMaliyet,
      toplamKar: gercekKar,           // Gerçek kâr
      toplamSiparis: orders.length,
      gercekKarMarji,                 // Yeni metrik
      hedefKarSapmasi,                // Yeni metrik
    })
  }

  const handleSearch = () => {
    loadOrders()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu siparişi silmek istediğinizden emin misiniz?')) return
    
    try {
      await window.electronAPI.db.deleteOrder(id)
      loadOrders()
    } catch (error) {
      console.error('Failed to delete order:', error)
      alert('Sipariş silinirken bir hata oluştu')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(currentOrders.map(o => o.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, id])
    } else {
      setSelectedOrders(prev => prev.filter(orderId => orderId !== id))
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return
    if (!confirm(`${selectedOrders.length} siparişin durumunu "${newStatus}" olarak güncellemek istediğinizden emin misiniz?`)) return

    try {
      for (const orderId of selectedOrders) {
        await window.electronAPI.db.updateOrderStatus(orderId, newStatus)
      }
      setSelectedOrders([])
      loadOrders()
      alert(`✅ ${selectedOrders.length} sipariş güncellendi`)
    } catch (error) {
      console.error('Failed to bulk update:', error)
      alert('Toplu güncelleme başarısız')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return
    if (!confirm(`${selectedOrders.length} siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) return

    try {
      for (const orderId of selectedOrders) {
        await window.electronAPI.db.deleteOrder(orderId)
      }
      setSelectedOrders([])
      loadOrders()
      alert(`✅ ${selectedOrders.length} sipariş silindi`)
    } catch (error) {
      console.error('Failed to bulk delete:', error)
      alert('Toplu silme başarısız')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#FFFFFF' }}>
            Siparişler
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Tüm siparişlerinizi yönetin ve takip edin
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          {orders.length > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
              <Button variant="secondary" onClick={() => exportOrdersToExcel(orders)} className="w-full sm:w-auto">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Excel İndir</span>
              </Button>
            </motion.div>
          )}
          <Link to="/orders/new" className="flex-1 sm:flex-none">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span>Yeni Sipariş</span>
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Modern Finansal Özet */}
      {orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {/* Toplam Gelir */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden"
            style={{ background: 'rgba(10, 132, 255, 0.12)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#0A84FF' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#0A84FF' }} />
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: '#0A84FF' }}>
                  Toplam Gelir
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                {formatCurrency(statistics.toplamGelir)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Package className="w-3 h-3" style={{ color: 'rgba(235, 235, 245, 0.6)' }} />
                <p className="text-[10px] sm:text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  {statistics.toplamSiparis} sipariş
                </p>
              </div>
            </div>
          </motion.div>

          {/* Toplam Maliyet */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden"
            style={{ background: 'rgba(255, 69, 58, 0.12)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#FF453A' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#FF453A' }} />
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: '#FF453A' }}>
                  Toplam Maliyet
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                {formatCurrency(statistics.toplamMaliyet)}
              </p>
              <p className="text-[10px] sm:text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Tahmini gider
              </p>
            </div>
          </motion.div>

          {/* Gerçek Kâr */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden"
            style={{ 
              background: statistics.toplamKar >= 0 ? 'rgba(48, 209, 88, 0.12)' : 'rgba(255, 159, 10, 0.12)', 
              border: statistics.toplamKar >= 0 ? '0.5px solid rgba(48, 209, 88, 0.3)' : '0.5px solid rgba(255, 159, 10, 0.3)' 
            }}
          >
            <div 
              className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full blur-2xl opacity-30" 
              style={{ backgroundColor: statistics.toplamKar >= 0 ? '#30D158' : '#FF9F0A' }} 
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                {statistics.toplamKar >= 0 ? (
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#30D158' }} />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#FF9F0A' }} />
                )}
                <p 
                  className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" 
                  style={{ color: statistics.toplamKar >= 0 ? '#30D158' : '#FF9F0A' }}
                >
                  Gerçek Kâr
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                {formatCurrency(statistics.toplamKar)}
              </p>
              <p 
                className="text-[10px] sm:text-xs" 
                style={{ color: statistics.toplamKar >= 0 ? '#30D158' : '#FF9F0A' }}
              >
                {statistics.toplamKar >= 0 ? '✓ Kârlı' : '⚠ Zararlı'}
              </p>
            </div>
          </motion.div>

          {/* Kâr Marjı */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden"
            style={{ background: 'rgba(191, 90, 242, 0.12)', border: '0.5px solid rgba(191, 90, 242, 0.3)' }}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#BF5AF2' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#BF5AF2' }} />
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: '#BF5AF2' }}>
                  Kâr Marjı
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                {statistics.toplamGelir > 0 
                  ? `%${statistics.gercekKarMarji.toFixed(1)}`
                  : '-%'
                }
              </p>
              <p className="text-[10px] sm:text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Gelir / Kâr oranı
              </p>
            </div>
          </motion.div>

          {/* Hedef Sapması */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden"
            style={{ 
              background: statistics.hedefKarSapmasi >= 0 ? 'rgba(48, 209, 88, 0.12)' : 'rgba(255, 214, 10, 0.12)', 
              border: statistics.hedefKarSapmasi >= 0 ? '0.5px solid rgba(48, 209, 88, 0.3)' : '0.5px solid rgba(255, 214, 10, 0.3)' 
            }}
          >
            <div 
              className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full blur-2xl opacity-30" 
              style={{ backgroundColor: statistics.hedefKarSapmasi >= 0 ? '#30D158' : '#FFD60A' }} 
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: statistics.hedefKarSapmasi >= 0 ? '#30D158' : '#FFD60A' }} />
                <p 
                  className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" 
                  style={{ color: statistics.hedefKarSapmasi >= 0 ? '#30D158' : '#FFD60A' }}
                >
                  Hedef Sapma
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                {formatCurrency(statistics.hedefKarSapmasi)}
              </p>
              <p 
                className="text-[10px] sm:text-xs" 
                style={{ color: statistics.hedefKarSapmasi >= 0 ? '#30D158' : '#FFD60A' }}
              >
                {statistics.hedefKarSapmasi >= 0 ? '↑ Hedefin üstünde' : '↓ Hedefin altında'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Plaka, müşteri adı veya telefon ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          {/* Gelişmiş Filtreler */}
          <AdvancedFilters
            onFilter={(f) => setAdvancedFilters(f)}
            onReset={() => setAdvancedFilters(null)}
          />
        </div>
      </Card>

      {/* Modern Bulk Actions */}
      <AnimatePresence>
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="glass-card rounded-xl p-3 sm:p-4"
            style={{ background: 'rgba(10, 132, 255, 0.12)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#0A84FF' }} />
                <p className="text-xs sm:text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                  {selectedOrders.length} sipariş seçildi
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <Select
                    options={[
                      { value: '', label: 'Durum Değiştir...' },
                      ...STATUS_OPTIONS.filter(s => s.value !== '')
                    ]}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkStatusUpdate(e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Sil ({selectedOrders.length})</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
                  <Button variant="secondary" size="sm" onClick={() => setSelectedOrders([])}>
                    İptal
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Araç/Firma</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefon</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Güzergah</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fiyat</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'text-white' : ''}`}
                    style={selectedOrders.includes(order.id) ? { backgroundColor: 'rgba(10, 132, 255, 0.15)' } : undefined}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">#{order.id}</td>
                    <td className="py-3 px-4">
                      {order.is_subcontractor === 1 ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs rounded-md font-medium" style={{ backgroundColor: 'rgba(255, 159, 10, 0.15)', color: '#FF9F0A' }}>
                            🚛 Taşeron
                          </span>
                          <span className="font-medium">{order.subcontractor_company}</span>
                        </div>
                      ) : (
                        <span className="font-medium">{order.plaka}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{order.musteri}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: selectedOrders.includes(order.id) ? '#FFFFFF' : 'rgba(235, 235, 245, 0.6)' }}>{order.telefon}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: selectedOrders.includes(order.id) ? '#FFFFFF' : 'rgba(235, 235, 245, 0.6)' }}>
                      {order.nereden} → {order.nereye}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(order.baslangic_fiyati)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: selectedOrders.includes(order.id) ? '#FFFFFF' : 'rgba(235, 235, 245, 0.6)' }}>
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link to={`/orders/${order.id}`}>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#0A84FF', backgroundColor: 'rgba(10, 132, 255, 0.1)' }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(order.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#FF453A', backgroundColor: 'rgba(255, 69, 58, 0.1)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={orders.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Sipariş bulunamadı</p>
            <Link to="/orders/new">
              <Button className="mt-4" size="sm">
                Yeni Sipariş Oluştur
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Bekliyor': 'bg-yellow-100 text-yellow-800',
    'Yolda': 'bg-blue-100 text-blue-800',
    'Teslim Edildi': 'bg-green-100 text-green-800',
    'Faturalandı': 'bg-purple-100 text-purple-800',
    'İptal': 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

