import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, TrashIcon } from '../components/Icons'
import { formatCurrency, formatDate } from '../utils/formatters'

const STATUS_OPTIONS = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'Bekliyor', label: 'Bekliyor' },
  { value: 'Yolda', label: 'Yolda' },
  { value: 'Teslim Edildi', label: 'Teslim Edildi' },
  { value: 'Faturalandı', label: 'Faturalandı' },
  { value: 'İptal', label: 'İptal' },
]

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [statistics, setStatistics] = useState({
    toplamGelir: 0,
    toplamMaliyet: 0,
    toplamKar: 0,
    toplamSiparis: 0,
  })

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  useEffect(() => {
    calculateStatistics()
  }, [orders])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      if (statusFilter) filters.status = statusFilter
      if (search) filters.search = search
      
      const data = await window.electronAPI.db.getOrders(filters)
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = () => {
    const toplamGelir = orders.reduce((sum, o) => sum + (o.baslangic_fiyati || 0), 0)
    const toplamMaliyet = orders.reduce((sum, o) => sum + (o.toplam_maliyet || 0), 0)
    // Doğru hesap: Toplam Gelir - Toplam Maliyet
    const toplamKar = toplamGelir - toplamMaliyet
    
    setStatistics({
      toplamGelir,
      toplamMaliyet,
      toplamKar,
      toplamSiparis: orders.length,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
          <p className="mt-1 text-gray-600">Tüm siparişlerinizi yönetin</p>
        </div>
        <Link to="/orders/new">
          <Button>
            <PlusIcon className="w-5 h-5 mr-2" />
            Yeni Sipariş
          </Button>
        </Link>
      </div>

      {/* Finansal Özet */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Toplam Kar/Zarar
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
              <p className="text-xs font-medium text-purple-800">Kar Marjı</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {statistics.toplamGelir > 0 
                  ? `%${((statistics.toplamKar / statistics.toplamGelir) * 100).toFixed(1)}`
                  : '-%'
                }
              </p>
              <p className="text-xs text-purple-700 mt-1">Ortalama</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Plaka, müşteri adı veya telefon ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <MagnifyingGlassIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

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
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
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

