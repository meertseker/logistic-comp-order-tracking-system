import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import Modal from '../components/Modal'
import { TrashIcon, PlusIcon, ArrowUpTrayIcon, PencilIcon } from '../components/Icons'
import { formatCurrency, formatDate } from '../utils/formatters'

const STATUS_OPTIONS = [
  { value: 'Bekliyor', label: 'Bekliyor' },
  { value: 'Yolda', label: 'Yolda' },
  { value: 'Teslim Edildi', label: 'Teslim Edildi' },
  { value: 'Faturalandı', label: 'Faturalandı' },
  { value: 'İptal', label: 'İptal' },
]

const EXPENSE_TYPES = [
  { value: 'Yakıt', label: 'Yakıt' },
  { value: 'HGS', label: 'HGS' },
  { value: 'Köprü', label: 'Köprü' },
  { value: 'Yemek', label: 'Yemek' },
  { value: 'Bakım', label: 'Bakım' },
  { value: 'Diğer', label: 'Diğer' },
]

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  
  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  
  // Forms
  const [expenseForm, setExpenseForm] = useState({ type: 'Yakıt', amount: '', description: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    loadOrderDetails()
  }, [id])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      const data = await window.electronAPI.db.getOrder(Number(id))
      setOrder(data.order)
      setExpenses(data.expenses || [])
      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await window.electronAPI.db.updateOrderStatus(Number(id), newStatus)
      setOrder({ ...order, status: newStatus })
      setEditingStatus(false)
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Durum güncellenirken bir hata oluştu')
    }
  }

  const handleAddExpense = async () => {
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      alert('Lütfen geçerli bir tutar giriniz')
      return
    }

    try {
      await window.electronAPI.db.addExpense({
        orderId: Number(id),
        type: expenseForm.type,
        amount: Number(expenseForm.amount),
        description: expenseForm.description,
      })
      
      setExpenseForm({ type: 'Yakıt', amount: '', description: '' })
      setShowExpenseModal(false)
      loadOrderDetails()
    } catch (error) {
      console.error('Failed to add expense:', error)
      alert('Gider eklenirken bir hata oluştu')
    }
  }

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Bu gideri silmek istediğinizden emin misiniz?')) return
    
    try {
      await window.electronAPI.db.deleteExpense(expenseId)
      loadOrderDetails()
    } catch (error) {
      console.error('Failed to delete expense:', error)
      alert('Gider silinirken bir hata oluştu')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadInvoice = async () => {
    if (!selectedFile) {
      alert('Lütfen bir dosya seçiniz')
      return
    }

    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target?.result?.toString().split(',')[1]
        
        if (!base64Data) {
          alert('Dosya okunamadı')
          return
        }

        try {
          const savedFile = await window.electronAPI.fs.saveFile({
            name: selectedFile.name,
            data: base64Data,
          })

          await window.electronAPI.db.addInvoice({
            orderId: Number(id),
            fileName: savedFile.fileName,
            filePath: savedFile.filePath,
            fileType: selectedFile.type,
          })

          setSelectedFile(null)
          setShowInvoiceModal(false)
          loadOrderDetails()
        } catch (error) {
          console.error('Failed to upload invoice:', error)
          alert('Fatura yüklenirken bir hata oluştu')
        }
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Failed to read file:', error)
      alert('Dosya okunamadı')
    }
  }

  const handleDeleteInvoice = async (invoiceId: number, filePath: string) => {
    if (!confirm('Bu faturayı silmek istediğinizden emin misiniz?')) return
    
    try {
      await window.electronAPI.db.deleteInvoice(invoiceId)
      await window.electronAPI.fs.deleteFile(filePath)
      loadOrderDetails()
    } catch (error) {
      console.error('Failed to delete invoice:', error)
      alert('Fatura silinirken bir hata oluştu')
    }
  }

  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }

  const calculateEstimatedCost = () => {
    return order?.toplam_maliyet || 0
  }

  const calculateNetIncome = () => {
    const gelir = order?.baslangic_fiyati || 0
    const ekGider = calculateTotalExpenses()
    const tahminMaliyet = calculateEstimatedCost()
    return gelir - ekGider - tahminMaliyet
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sipariş bulunamadı</p>
        <Link to="/orders">
          <Button className="mt-4">Siparişlere Dön</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sipariş #{order.id}</h1>
          <p className="mt-1 text-gray-600">{order.plaka} - {order.musteri}</p>
        </div>
        <Link to="/orders">
          <Button variant="secondary">Geri</Button>
        </Link>
      </div>

      {/* Order Info */}
      <Card title="Sipariş Bilgileri">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Plaka</p>
            <p className="text-lg font-semibold">{order.plaka}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Müşteri</p>
            <p className="text-lg font-semibold">{order.musteri}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Telefon</p>
            <p className="text-lg font-semibold">{order.telefon}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Durum</p>
            <div className="flex items-center space-x-2">
              {editingStatus ? (
                <>
                  <Select
                    options={STATUS_OPTIONS}
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  />
                  <Button size="sm" variant="secondary" onClick={() => setEditingStatus(false)}>
                    İptal
                  </Button>
                </>
              ) : (
                <>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <button
                    onClick={() => setEditingStatus(true)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Güzergah</p>
            <p className="text-lg font-semibold">{order.nereden} → {order.nereye}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Başlangıç Fiyatı</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(order.baslangic_fiyati)}</p>
          </div>
          {order.yuk_aciklamasi && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-600">Yük Açıklaması</p>
              <p className="text-base mt-1">{order.yuk_aciklamasi}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-600">Oluşturulma Tarihi</p>
            <p className="text-base">{formatDate(order.created_at)}</p>
          </div>
        </div>
      </Card>

      {/* Financial Summary - Geliştirilmiş */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div>
            <p className="text-xs font-medium text-green-800">Müşteriden Alınan</p>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {formatCurrency(order.baslangic_fiyati)}
            </p>
            <p className="text-xs text-green-700 mt-1">Toplam gelir</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div>
            <p className="text-xs font-medium text-orange-800">Tahmini Maliyet</p>
            <p className="text-2xl font-bold text-orange-900 mt-2">
              {formatCurrency(calculateEstimatedCost())}
            </p>
            <p className="text-xs text-orange-700 mt-1">
              {order.etkin_km > 0 ? `${order.etkin_km.toFixed(0)} km` : 'Hesaplanmadı'}
            </p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div>
            <p className="text-xs font-medium text-red-800">Ek Giderler</p>
            <p className="text-2xl font-bold text-red-900 mt-2">
              {formatCurrency(calculateTotalExpenses())}
            </p>
            <p className="text-xs text-red-700 mt-1">Sonradan eklenen</p>
          </div>
        </Card>
        <Card className={`bg-gradient-to-br ${calculateNetIncome() >= 0 ? 'from-blue-50 to-blue-100' : 'from-gray-50 to-gray-100'}`}>
          <div>
            <p className={`text-xs font-medium ${calculateNetIncome() >= 0 ? 'text-blue-800' : 'text-gray-800'}`}>
              Net Kar/Zarar
            </p>
            <p className={`text-2xl font-bold mt-2 ${calculateNetIncome() >= 0 ? 'text-blue-900' : 'text-gray-900'}`}>
              {formatCurrency(calculateNetIncome())}
            </p>
            <p className={`text-xs mt-1 ${calculateNetIncome() >= 0 ? 'text-blue-700' : 'text-gray-700'}`}>
              {order.kar_zarar 
                ? `Tahmini: ${formatCurrency(order.kar_zarar)}` 
                : 'Hesaplanmadı'
              }
            </p>
          </div>
        </Card>
      </div>

      {/* Maliyet Dökümü (Varsa) */}
      {order.toplam_maliyet > 0 && (
        <Card title="💰 Maliyet Dökümü" className="bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {order.yakit_maliyet > 0 && (
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">⛽ Yakıt</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(order.yakit_maliyet)}</p>
                {order.yakit_litre > 0 && (
                  <p className="text-xs text-gray-500">{order.yakit_litre.toFixed(1)} lt</p>
                )}
              </div>
            )}
            {order.surucu_maliyet > 0 && (
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">👤 Sürücü</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(order.surucu_maliyet)}</p>
                {order.tahmini_gun > 0 && (
                  <p className="text-xs text-gray-500">{order.tahmini_gun} gün</p>
                )}
              </div>
            )}
            {order.yemek_maliyet > 0 && (
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">🍽️ Yemek</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(order.yemek_maliyet)}</p>
              </div>
            )}
            {order.hgs_maliyet > 0 && (
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">🛣️ HGS</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(order.hgs_maliyet)}</p>
              </div>
            )}
            {order.bakim_maliyet > 0 && (
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">🔧 Bakım</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(order.bakim_maliyet)}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Expenses */}
      <Card
        title="Giderler"
        actions={
          <Button size="sm" onClick={() => setShowExpenseModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Gider Ekle
          </Button>
        }
      >
        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tür</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tutar</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Açıklama</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{expense.type}</td>
                    <td className="py-3 px-4 font-semibold text-red-600">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{expense.description || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(expense.timestamp)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Henüz gider eklenmemiş</p>
        )}
      </Card>

      {/* Invoices */}
      <Card
        title="Faturalar"
        actions={
          <Button size="sm" onClick={() => setShowInvoiceModal(true)}>
            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
            Fatura Yükle
          </Button>
        }
      >
        {invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm truncate">{invoice.file_name}</p>
                  <button
                    onClick={() => handleDeleteInvoice(invoice.id, invoice.file_path)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">{formatDate(invoice.uploaded_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Henüz fatura yüklenmemiş</p>
        )}
      </Card>

      {/* Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Gider Ekle"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>
              İptal
            </Button>
            <Button onClick={handleAddExpense}>Ekle</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Gider Türü"
            options={EXPENSE_TYPES}
            value={expenseForm.type}
            onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
          />
          <Input
            label="Tutar (₺)"
            type="number"
            step="0.01"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            required
          />
          <Input
            label="Açıklama"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />
        </div>
      </Modal>

      {/* Invoice Upload Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Fatura Yükle"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
              İptal
            </Button>
            <Button onClick={handleUploadInvoice}>Yükle</Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dosya Seç
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Seçili: {selectedFile.name}
            </p>
          )}
        </div>
      </Modal>
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

