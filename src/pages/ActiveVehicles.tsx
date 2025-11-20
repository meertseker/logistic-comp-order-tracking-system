import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  Package, 
  Eye,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Navigation,
  FileText,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  XCircle,
  PlayCircle,
  Pause,
  Mail
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import TextArea from '../components/TextArea'
import { formatCurrency, formatDate } from '../utils/formatters'
import { generateOrderPDFForEmail } from '../utils/pdfExport'
import { useToast } from '../context/ToastContext'

const ALL_STATUS_OPTIONS = [
  { value: 'Bekliyor', label: '⏸️ Bekliyor', color: '#FFD60A' },
  { value: 'Yüklendi', label: '📦 Yüklendi', color: '#FF9F0A' },
  { value: 'Yolda', label: '🚛 Yolda', color: '#0A84FF' },
  { value: 'Teslim Edildi', label: '✅ Teslim Edildi', color: '#30D158' },
  { value: 'Faturalandı', label: '💳 Faturalandı', color: '#BF5AF2' },
  { value: 'İptal', label: '❌ İptal', color: '#FF453A' },
]

export default function ActiveVehicles() {
  const { showToast } = useToast()
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [statusNote, setStatusNote] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [pendingStatus, setPendingStatus] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [mailSettings, setMailSettings] = useState<any>(null)
  const [whatsappSettings, setWhatsappSettings] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    loadActiveOrders()
    loadMailSettings()
    loadWhatsAppSettings()
    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(loadActiveOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadMailSettings = async () => {
    try {
      const settings = await window.electronAPI.mail.getSettings()
      setMailSettings(settings)
    } catch (error) {
      console.error('Failed to load mail settings:', error)
    }
  }
  
  const loadWhatsAppSettings = async () => {
    try {
      const settings = await window.electronAPI.whatsapp.getSettings()
      setWhatsappSettings(settings)
    } catch (error) {
      console.error('Failed to load WhatsApp settings:', error)
    }
  }

  const loadActiveOrders = async () => {
    try {
      setLoading(true)
      // Bekliyor, Yüklendi ve Yolda durumundaki siparişleri getir
      const data = await window.electronAPI.db.getOrders({})
      const active = data.filter((order: any) => 
        order.status === 'Bekliyor' || 
        order.status === 'Yüklendi' ||
        order.status === 'Yolda'
      )
      setActiveOrders(active)
    } catch (error) {
      console.error('Failed to load active orders:', error)
      setActiveOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadActiveOrders()
  }

  const openStatusModal = (order: any, status: string) => {
    setSelectedOrder(order)
    setNewStatus(status)
    setPendingStatus(status)
    setStatusNote('')
    setShowStatusConfirmModal(true)
  }

  const openNoteModal = (order: any) => {
    setSelectedOrder(order)
    setStatusNote('')
    setShowNoteModal(true)
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return
    
    try {
      console.log('🔄 Durum güncelleniyor:', { orderId: selectedOrder.id, newStatus: pendingStatus })
      
      // Durumu güncelle
      await window.electronAPI.db.updateOrderStatus(selectedOrder.id, pendingStatus)
      
      setShowStatusConfirmModal(false)
      showToast(`Durum "${pendingStatus}" olarak güncellendi`, 'success')
      
      // Otomatik mail gönder (eğer customer_email varsa ve mail sistemi aktifse)
      if (selectedOrder.customer_email && mailSettings && mailSettings.enabled === 1) {
        console.log('📧 Otomatik mail gönderiliyor...')
        
        try {
          // Fatura listesini yükle
          const orderData = await window.electronAPI.db.getOrder(selectedOrder.id)
          const orderInvoices = orderData.invoices || []
          
          // PDF oluştur
          const pdfPath = await generateOrderPDFForEmail(selectedOrder)
          
          // Mail data hazırla
          const emailOrderData = {
            orderId: selectedOrder.id,
            musteri: selectedOrder.musteri,
            telefon: selectedOrder.telefon,
            customerEmail: selectedOrder.customer_email,
            nereden: selectedOrder.nereden,
            nereye: selectedOrder.nereye,
            yukAciklamasi: selectedOrder.yuk_aciklamasi || '',
            plaka: selectedOrder.plaka,
            baslangicFiyati: selectedOrder.baslangic_fiyati,
            toplamMaliyet: selectedOrder.toplam_maliyet || 0,
            onerilenFiyat: selectedOrder.onerilen_fiyat || 0,
            karZarar: selectedOrder.kar_zarar || 0,
            karZararYuzde: selectedOrder.kar_zarar_yuzde || 0,
            gidisKm: selectedOrder.gidis_km || 0,
            donusKm: selectedOrder.donus_km || 0,
            tahminiGun: selectedOrder.tahmini_gun || 1,
            status: pendingStatus, // Yeni durum!
            createdAt: selectedOrder.created_at,
            isSubcontractor: selectedOrder.is_subcontractor === 1,
            subcontractorCompany: selectedOrder.subcontractor_company,
          }
          
          // Fatura listesini hazırla (sadece path ve file_name)
          const invoiceFiles = orderInvoices.map((inv: any) => ({
            filePath: inv.file_path,
            fileName: inv.file_name
          }))
          
          // Mail gönder
          const result = await window.electronAPI.mail.sendOrderEmail(
            selectedOrder.customer_email,
            emailOrderData,
            pdfPath,
            invoiceFiles
          )
          
          if (result.success) {
            console.log('✅ Durum değişikliği maili gönderildi')
            showToast('Müşteriye durum değişikliği maili gönderildi', 'success')
          } else {
            console.warn('⚠️ Mail gönderilemedi:', result.message)
          }
        } catch (emailError) {
          console.error('Mail gönderme hatası:', emailError)
          // Mail gönderilmese de durum güncellendi, hata gösterme
        }
      }
      
      // Otomatik WhatsApp gönder
      if (selectedOrder.telefon && whatsappSettings && whatsappSettings.enabled === 1 && whatsappSettings.auto_send_on_status_change === 1) {
        console.log('🟢 Otomatik WhatsApp gönderiliyor...')
        
        try {
          const whatsappOrderData = {
            orderId: selectedOrder.id,
            musteri: selectedOrder.musteri,
            telefon: selectedOrder.telefon,
            nereden: selectedOrder.nereden,
            nereye: selectedOrder.nereye,
            yukAciklamasi: selectedOrder.yuk_aciklamasi || '',
            plaka: selectedOrder.plaka,
            baslangicFiyati: selectedOrder.baslangic_fiyati,
            toplamMaliyet: selectedOrder.toplam_maliyet || 0,
            onerilenFiyat: selectedOrder.onerilen_fiyat || 0,
            karZarar: selectedOrder.kar_zarar || 0,
            karZararYuzde: selectedOrder.kar_zarar_yuzde || 0,
            gidisKm: selectedOrder.gidis_km || 0,
            donusKm: selectedOrder.donus_km || 0,
            tahminiGun: selectedOrder.tahmini_gun || 1,
            status: pendingStatus,
            createdAt: selectedOrder.created_at,
            isSubcontractor: selectedOrder.is_subcontractor === 1,
            subcontractorCompany: selectedOrder.subcontractor_company,
          }
          
          let messageType: 'created' | 'on_way' | 'delivered' | 'invoiced' | 'cancelled' | 'custom' = 'custom'
          if (pendingStatus === 'Yolda') {
            messageType = 'on_way'
          } else if (pendingStatus === 'Teslim Edildi') {
            messageType = 'delivered'
          } else if (pendingStatus === 'Faturalandı') {
            messageType = 'invoiced'
          } else if (pendingStatus === 'İptal') {
            messageType = 'cancelled'
          }
          
          const whatsappResult = await window.electronAPI.whatsapp.sendOrderMessage(
            selectedOrder.telefon,
            whatsappOrderData,
            messageType
          )
          
          if (whatsappResult.success) {
            console.log('✅ Durum değişikliği WhatsApp mesajı gönderildi')
          } else {
            console.warn('⚠️ WhatsApp mesajı gönderilemedi:', whatsappResult.message)
          }
        } catch (whatsappError) {
          console.error('WhatsApp gönderme hatası:', whatsappError)
        }
      }
      
      // Listeyi yenile
      loadActiveOrders()
    } catch (error) {
      console.error('Failed to update status:', error)
      showToast('Durum güncellenirken bir hata oluştu', 'error')
    }
  }

  const getElapsedTime = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24)
      return `${days} gün ${diffHours % 24} saat`
    } else if (diffHours > 0) {
      return `${diffHours} saat ${diffMins} dakika`
    } else {
      return `${diffMins} dakika`
    }
  }

  const isDelayed = (createdAt: string, status: string) => {
    const hours = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60))
    if (status === 'Bekliyor' && hours > 2) return true // 2 saatten fazla bekleyen
    if (status === 'Yolda' && hours > 48) return true // 48 saatten fazla yolda
    if (status === 'Teslim Edildi' && hours > 24) return true // 24 saatten fazla faturalanmamış
    return false
  }

  const getStatusColor = (status: string) => {
    const option = ALL_STATUS_OPTIONS.find(s => s.value === status)
    return option ? option.color : '#999'
  }

  const filteredOrders = filterStatus === 'all' 
    ? activeOrders 
    : activeOrders.filter(o => o.status === filterStatus)

  return (
    <div className="space-y-6 pb-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl relative" style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)' }}>
              <Truck className="w-6 h-6" style={{ color: '#30D158' }} />
              {activeOrders.length > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#30D158' }}
                />
              )}
            </div>
            <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
              Aktif Araçlar
            </h1>
          </div>
          <p className="text-lg ml-16" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Canlı takip ve hızlı durum güncelleme
          </p>
        </div>
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </motion.div>
          <Link to="/orders/new">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button>
                <Package className="w-5 h-5 mr-2" />
                Yeni Sipariş
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Filtre Butonları */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-3 flex-wrap"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filterStatus === 'all' ? 'shadow-lg' : ''
          }`}
          style={{
            backgroundColor: filterStatus === 'all' ? 'rgba(48, 209, 88, 0.2)' : 'rgba(99, 99, 102, 0.2)',
            color: filterStatus === 'all' ? '#30D158' : 'rgba(235, 235, 245, 0.6)',
            border: `1px solid ${filterStatus === 'all' ? '#30D158' : 'transparent'}`
          }}
        >
          🌐 Tümü ({activeOrders.length})
        </motion.button>
        {ALL_STATUS_OPTIONS.filter(s => ['Bekliyor', 'Yüklendi', 'Yolda'].includes(s.value)).map((status) => {
          const count = activeOrders.filter(o => o.status === status.value).length
          return (
            <motion.button
              key={status.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === status.value ? 'shadow-lg' : ''
              }`}
              style={{
                backgroundColor: filterStatus === status.value ? `${status.color}33` : 'rgba(99, 99, 102, 0.2)',
                color: filterStatus === status.value ? status.color : 'rgba(235, 235, 245, 0.6)',
                border: `1px solid ${filterStatus === status.value ? status.color : 'transparent'}`
              }}
            >
              {status.label} ({count})
            </motion.button>
          )
        })}
      </motion.div>

      {/* Özet İstatistikler */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Bekliyor */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass-card rounded-xl p-6 relative overflow-hidden"
          style={{ background: 'rgba(255, 214, 10, 0.12)', border: '0.5px solid rgba(255, 214, 10, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#FFD60A' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Pause className="w-4 h-4" style={{ color: '#FFD60A' }} />
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#FFD60A' }}>
                Bekliyor
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
              {activeOrders.filter(o => o.status === 'Bekliyor').length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Yola çıkmadı
            </p>
          </div>
        </motion.div>

        {/* Yüklendi */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass-card rounded-xl p-6 relative overflow-hidden"
          style={{ background: 'rgba(255, 159, 10, 0.12)', border: '0.5px solid rgba(255, 159, 10, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#FF9F0A' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4" style={{ color: '#FF9F0A' }} />
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#FF9F0A' }}>
                Yüklendi
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
              {activeOrders.filter(o => o.status === 'Yüklendi').length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Yola çıkacak
            </p>
          </div>
        </motion.div>

        {/* Yolda */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass-card rounded-xl p-6 relative overflow-hidden"
          style={{ background: 'rgba(10, 132, 255, 0.12)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#0A84FF' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4" style={{ color: '#0A84FF' }} />
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#0A84FF' }}>
                Yolda
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
              {activeOrders.filter(o => o.status === 'Yolda').length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Aktif teslimat
            </p>
          </div>
        </motion.div>

        {/* Gecikenler */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass-card rounded-xl p-6 relative overflow-hidden"
          style={{ background: 'rgba(255, 69, 58, 0.12)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#FF453A' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" style={{ color: '#FF453A' }} />
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#FF453A' }}>
                Geciken
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
              {activeOrders.filter(o => isDelayed(o.created_at, o.status)).length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Dikkat gerekli
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Aktif Araç Kartları */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#30D158' }}></div>
          <p className="mt-4" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yükleniyor...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order, index) => {
            const statusColor = getStatusColor(order.status)
            const delayed = isDelayed(order.created_at, order.status)
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="hover:shadow-2xl transition-all duration-300 border-2 relative"
                  style={{ 
                    borderColor: delayed ? '#FF453A' : `${statusColor}66`,
                    background: 'linear-gradient(135deg, rgba(28, 28, 30, 0.95) 0%, rgba(44, 44, 46, 0.95) 100%)',
                    boxShadow: delayed ? '0 0 20px rgba(255, 69, 58, 0.3)' : undefined
                  }}
                >
                  <div className="space-y-4">
                    {/* Header - Araç ve Durum */}
                    <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }}>
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: `${statusColor}22` }}>
                          <Truck className="w-6 h-6" style={{ color: statusColor }} />
                        </div>
                        <div>
                          {order.is_subcontractor === 1 ? (
                            <>
                              <span className="px-2 py-1 text-xs rounded-md font-medium mb-1 inline-block" 
                                style={{ backgroundColor: 'rgba(255, 159, 10, 0.15)', color: '#FF9F0A' }}>
                                🚛 Taşeron
                              </span>
                              <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                                {order.subcontractor_company}
                              </p>
                            </>
                          ) : (
                            <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                              {order.plaka}
                            </p>
                          )}
                          <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                            #{order.id}
                          </p>
                        </div>
                      </div>
                      <div 
                        className="px-3 py-1.5 rounded-full text-sm font-semibold"
                        style={{ 
                          backgroundColor: `${statusColor}22`, 
                          color: statusColor,
                          border: `1px solid ${statusColor}66`
                        }}
                      >
                        {ALL_STATUS_OPTIONS.find(s => s.value === order.status)?.label}
                      </div>
                    </div>

                    {/* Müşteri & İletişim */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-1" style={{ color: '#BF5AF2' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Müşteri</p>
                          <p className="font-semibold truncate" style={{ color: '#FFFFFF' }}>{order.musteri}</p>
                        </div>
                      </div>
                      <a href={`tel:${order.telefon}`} className="flex items-start gap-2 hover:opacity-80">
                        <Phone className="w-4 h-4 mt-1" style={{ color: '#30D158' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Telefon</p>
                          <p className="font-semibold truncate" style={{ color: '#30D158' }}>{order.telefon}</p>
                        </div>
                      </a>
                    </div>

                    {/* Güzergah */}
                    <div 
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(10, 132, 255, 0.08)', border: '1px solid rgba(10, 132, 255, 0.2)' }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Nereden</p>
                          <p className="text-lg font-bold truncate" style={{ color: '#FFFFFF' }}>
                            {order.nereden}
                          </p>
                        </div>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowRight className="w-8 h-8 flex-shrink-0" style={{ color: '#0A84FF' }} />
                        </motion.div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Nereye</p>
                          <p className="text-lg font-bold truncate" style={{ color: '#FFFFFF' }}>
                            {order.nereye}
                          </p>
                        </div>
                      </div>
                      {order.gidis_km && order.gidis_km > 0 && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(10, 132, 255, 0.2)' }}>
                          <MapPin className="w-4 h-4" style={{ color: '#0A84FF' }} />
                          <p className="text-sm" style={{ color: '#0A84FF' }}>
                            {order.gidis_km} km
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Fiyat ve Süre */}
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className="p-3 rounded-lg text-center"
                        style={{ backgroundColor: 'rgba(48, 209, 88, 0.08)' }}
                      >
                        <p className="text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Fiyat</p>
                        <p className="text-xl font-bold" style={{ color: '#30D158' }}>
                          {formatCurrency(order.baslangic_fiyati)}
                        </p>
                      </div>
                      <div 
                        className="p-3 rounded-lg text-center"
                        style={{ backgroundColor: delayed ? 'rgba(255, 69, 58, 0.08)' : 'rgba(255, 159, 10, 0.08)' }}
                      >
                        <p className="text-xs mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Geçen Süre</p>
                        <p className="text-sm font-bold" style={{ color: delayed ? '#FF453A' : '#FF9F0A' }}>
                          {getElapsedTime(order.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Hızlı Durum Değiştirme */}
                    <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                        Hızlı Durum Değiştir:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {ALL_STATUS_OPTIONS.map((statusOption) => {
                          if (statusOption.value === order.status) return null
                          return (
                            <motion.button
                              key={statusOption.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => openStatusModal(order, statusOption.value)}
                              className="py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-all"
                              style={{ 
                                backgroundColor: `${statusOption.color}22`, 
                                color: statusOption.color,
                                border: `1px solid ${statusOption.color}44`
                              }}
                            >
                              {statusOption.label}
                            </motion.button>
                          )
                        })}
                      </div>
                      
                      {/* Detay ve Ara Butonları */}
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <Link to={`/orders/${order.id}`} className="col-span-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                            style={{ 
                              backgroundColor: 'rgba(99, 99, 102, 0.2)', 
                              color: '#FFFFFF'
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            Detaylar
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => window.open(`tel:${order.telefon}`)}
                          className="w-full py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                          style={{ 
                            backgroundColor: 'rgba(48, 209, 88, 0.15)', 
                            color: '#30D158'
                          }}
                        >
                          <Phone className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Oluşturulma Tarihi */}
                    <div className="pt-2 border-t flex items-center gap-2" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }}>
                      <Calendar className="w-3 h-3" style={{ color: 'rgba(235, 235, 245, 0.4)' }} />
                      <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.4)' }}>
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="text-center py-16">
            <div className="flex flex-col items-center">
              <div className="p-6 rounded-full mb-4" style={{ backgroundColor: 'rgba(99, 99, 102, 0.2)' }}>
                <Truck className="w-16 h-16" style={{ color: 'rgba(235, 235, 245, 0.4)' }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {filterStatus === 'all' ? 'Aktif Araç Yok' : 'Bu Durumda Araç Yok'}
              </h3>
              <p className="text-lg mb-6" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                {filterStatus === 'all' 
                  ? 'Şu anda aktif sipariş bulunmuyor'
                  : `"${ALL_STATUS_OPTIONS.find(s => s.value === filterStatus)?.label}" durumunda sipariş yok`
                }
              </p>
              <Link to="/orders/new">
                <Button>
                  <Package className="w-5 h-5 mr-2" />
                  Yeni Sipariş Oluştur
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Durum Güncelleme Onay Modal */}
      <Modal
        isOpen={showStatusConfirmModal}
        onClose={() => setShowStatusConfirmModal(false)}
        title="Durum Değişikliği Onayı"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStatusConfirmModal(false)}>
              İptal
            </Button>
            <Button onClick={handleStatusUpdate}>
              Onayla ve {selectedOrder?.customer_email ? 'Mail Gönder' : 'Güncelle'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Mevcut Durum</p>
            <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
              {selectedOrder?.status}
            </p>
          </div>
          <div className="flex items-center justify-center py-2">
            <ArrowRight className="w-8 h-8" style={{ color: '#0A84FF' }} />
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${getStatusColor(pendingStatus)}22` }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yeni Durum</p>
            <p className="text-xl font-bold" style={{ color: getStatusColor(pendingStatus) }}>
              {pendingStatus}
            </p>
          </div>
          
          {/* Otomatik mail bilgisi */}
          {selectedOrder?.customer_email && mailSettings && mailSettings.enabled === 1 && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-green-400" />
                <p className="text-sm font-semibold text-green-300">Otomatik Mail Gönderilecek</p>
              </div>
              <p className="text-xs text-gray-400">
                Müşteriye ({selectedOrder.customer_email}) durum değişikliği maili otomatik olarak gönderilecektir.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

