import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import AdvancedFilters from '../components/AdvancedFilters'
import Pagination from '../components/Pagination'
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, TrashIcon } from '../components/Icons'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
          <p className="mt-1 text-gray-600">Tüm siparişlerinizi yönetin</p>
        </div>
        <div className="flex space-x-2">
          {orders.length > 0 && (
            <Button variant="secondary" onClick={() => exportOrdersToExcel(orders)}>
              📊 Excel İndir
            </Button>
          )}
          <Link to="/orders/new">
            <Button>
              <PlusIcon className="w-5 h-5 mr-2" />
              Yeni Sipariş
            </Button>
          </Link>
        </div>
      </div>

      {/* Finansal Özet */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center">
              <p className="text-xs font-medium text-blue-800">Toplam Gelir</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatCurrency(statistics.toplamGelir)}
              </p>
              <p className="text-xs text-blue-700 mt-1">{statistics.toplamSiparis} sipariş</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <div className="text-center">
              <p className="text-xs font-medium text-red-800">Toplam Maliyet</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {formatCurrency(statistics.toplamMaliyet)}
              </p>
              <p className="text-xs text-red-700 mt-1">Tahmini gider</p>
            </div>
          </Card>
          <Card className={`bg-gradient-to-br ${statistics.toplamKar >= 0 ? 'from-green-50 to-green-100' : 'from-orange-50 to-orange-100'}`}>
            <div className="text-center">
              <p className={`text-xs font-medium ${statistics.toplamKar >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
                Gerçek Kâr
              </p>
              <p className={`text-2xl font-bold mt-1 ${statistics.toplamKar >= 0 ? 'text-green-900' : 'text-orange-900'}`}>
                {formatCurrency(statistics.toplamKar)}
              </p>
              <p className={`text-xs mt-1 ${statistics.toplamKar >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                {statistics.toplamKar >= 0 ? 'Kârlı' : 'Zararlı'}
              </p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-center">
              <p className="text-xs font-medium text-purple-800">Gerçek Kâr Marjı</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {statistics.toplamGelir > 0 
                  ? `%${statistics.gercekKarMarji.toFixed(1)}`
                  : '-%'
                }
              </p>
              <p className="text-xs text-purple-700 mt-1">Gelir / Kâr</p>
            </div>
          </Card>
          <Card className={`bg-gradient-to-br ${statistics.hedefKarSapmasi >= 0 ? 'from-teal-50 to-teal-100' : 'from-amber-50 to-amber-100'}`}>
            <div className="text-center">
              <p className={`text-xs font-medium ${statistics.hedefKarSapmasi >= 0 ? 'text-teal-800' : 'text-amber-800'}`}>
                Hedef Sapması
              </p>
              <p className={`text-2xl font-bold mt-1 ${statistics.hedefKarSapmasi >= 0 ? 'text-teal-900' : 'text-amber-900'}`}>
                {formatCurrency(statistics.hedefKarSapmasi)}
              </p>
              <p className={`text-xs mt-1 ${statistics.hedefKarSapmasi >= 0 ? 'text-teal-700' : 'text-amber-700'}`}>
                {statistics.hedefKarSapmasi >= 0 ? 'Hedefin üstünde' : 'Hedefin altında'}
              </p>
            </div>
          </Card>
        </div>
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

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary-900">
              {selectedOrders.length} sipariş seçildi
            </p>
            <div className="flex space-x-2">
              <Select
                options={[
                  { value: '', label: 'Durum Değiştir...' },
                  ...STATUS_OPTIONS.filter(s => s.value !== '')
                ]}
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusUpdate(e.target.value)
                    e.target.value = '' // Reset
                  }
                }}
              />
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Sil ({selectedOrders.length})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedOrders([])}
              >
                İptal
              </Button>
            </div>
          </div>
        </Card>
      )}

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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Plaka</th>
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
                  <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-primary-50' : ''}`}>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">#{order.id}</td>
                    <td className="py-3 px-4 font-medium">{order.plaka}</td>
                    <td className="py-3 px-4">{order.musteri}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.telefon}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
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
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link to={`/orders/${order.id}`}>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
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

