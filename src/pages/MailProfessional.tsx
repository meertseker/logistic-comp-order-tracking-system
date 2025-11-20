import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Download,
  Users,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Calendar,
  ArrowUpDown,
  Plus,
  Loader,
  AlertCircle,
  Inbox,
  MailOpen,
  Package,
  RefreshCw,
  Zap,
  BarChart3,
  MapPin,
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import TextArea from '../components/TextArea'
import Modal from '../components/Modal'
import StatCard from '../components/StatCard'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/formatters'

type MailTab = 'dashboard' | 'history' | 'send' | 'bulk' | 'templates' | 'whatsapp'

interface MailLog {
  id: number
  order_id: number
  recipient_email: string
  subject: string
  status: 'success' | 'failed'
  error_message: string | null
  sent_at: string
  orderDetails?: any
}

interface MailStats {
  todayCount: number
  todaySuccess: number
  todayFailed: number
  weekCount: number
  monthCount: number
  successRate: number
  failedLast24h: number
  totalSent: number
}

interface MailTemplate {
  id: string
  name: string
  subject: string
  status: string
  description: string
  usageCount: number
}

const MAIL_TEMPLATES: MailTemplate[] = [
  { id: 'bekliyor', name: 'Sipariş Alındı', subject: 'Siparişiniz Alındı', status: 'Bekliyor', description: 'Müşteri siparişi oluşturduğunda gönderilir', usageCount: 0 },
  { id: 'yuklendi', name: 'Yükleme Tamamlandı', subject: 'Yükleme Tamamlandı', status: 'Yüklendi', description: 'Yük araca yüklendiğinde gönderilir', usageCount: 0 },
  { id: 'yolda', name: 'Aracınız Yola Çıktı', subject: 'Aracınız Yola Çıktı', status: 'Yolda', description: 'Araç yola çıktığında gönderilir', usageCount: 0 },
  { id: 'teslim', name: 'Teslimat Tamamlandı', subject: 'Teslimat Tamamlandı', status: 'Teslim Edildi', description: 'Teslimat yapıldığında gönderilir', usageCount: 0 },
  { id: 'fatura', name: 'Faturanız Hazır', subject: 'Faturanız Hazır', status: 'Faturalandı', description: 'Fatura hazırlandığında gönderilir', usageCount: 0 },
  { id: 'iptal', name: 'Sipariş İptal', subject: 'Sipariş İptal Edildi', status: 'İptal', description: 'Sipariş iptal edildiğinde gönderilir', usageCount: 0 },
]

export default function MailProfessional() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<MailTab>('dashboard')
  const [loading, setLoading] = useState(true)
  const [mailLogs, setMailLogs] = useState<MailLog[]>([])
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>([])
  const [whatsappStats, setWhatsappStats] = useState<any>(null)
  const [stats, setStats] = useState<MailStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<MailLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Manuel mail gönderme formu
  const [manualMail, setManualMail] = useState({
    recipient: '',
    orderId: '',
    subject: '',
    message: '',
    template: 'bekliyor',
  })
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  
  // Toplu mail gönderme
  const [bulkMail, setBulkMail] = useState({
    statusFilter: 'Bekliyor',
    dateFrom: '',
    dateTo: '',
    template: 'bekliyor',
  })
  const [bulkOrders, setBulkOrders] = useState<any[]>([])
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  
  // Şablon seçimi
  const [selectedTemplate, setSelectedTemplate] = useState<MailTemplate | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  useEffect(() => {
    loadData()
    loadAllOrders()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadMailLogs(),
        loadStats(),
      ])
    } catch (error) {
      console.error('Failed to load mail data:', error)
      showToast('Mail verileri yüklenirken hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadMailLogs = async () => {
    try {
      const logs = await window.electronAPI.mail.getLogs()
      setMailLogs(logs || [])
    } catch (error) {
      console.error('Failed to load mail logs:', error)
    }
  }

  const loadStats = async () => {
    try {
      const allLogs = await window.electronAPI.mail.getLogs()
      
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      const todayLogs = allLogs.filter((log: MailLog) => new Date(log.sent_at) >= todayStart)
      const weekLogs = allLogs.filter((log: MailLog) => new Date(log.sent_at) >= weekStart)
      const monthLogs = allLogs.filter((log: MailLog) => new Date(log.sent_at) >= monthStart)
      const last24hLogs = allLogs.filter((log: MailLog) => new Date(log.sent_at) >= last24h)
      
      const statsData: MailStats = {
        todayCount: todayLogs.length,
        todaySuccess: todayLogs.filter((log: MailLog) => log.status === 'success').length,
        todayFailed: todayLogs.filter((log: MailLog) => log.status === 'failed').length,
        weekCount: weekLogs.length,
        monthCount: monthLogs.length,
        successRate: allLogs.length > 0 
          ? (allLogs.filter((log: MailLog) => log.status === 'success').length / allLogs.length) * 100 
          : 0,
        failedLast24h: last24hLogs.filter((log: MailLog) => log.status === 'failed').length,
        totalSent: allLogs.length,
      }
      
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadAllOrders = async () => {
    try {
      const orders = await window.electronAPI.db.getOrders({})
      setAllOrders(orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    showToast('Veriler güncellendi', 'success')
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleViewDetail = (log: MailLog) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const handleOrderSelect = (orderId: string) => {
    const order = allOrders.find(o => o.id === Number(orderId))
    if (order) {
      setSelectedOrder(order)
      setManualMail({ 
        ...manualMail, 
        orderId,
        recipient: order.customer_email || '',
      })
      
      // Email yoksa uyar
      if (!order.customer_email) {
        showToast('Bu siparişe ait müşteri email adresi bulunmuyor', 'warning')
      }
    }
  }

  const handleSendManualMail = async () => {
    if (!manualMail.orderId) {
      showToast('Lütfen bir sipariş seçin', 'error')
      return
    }
    
    if (!selectedOrder || !selectedOrder.customer_email) {
      showToast('Seçili siparişin email adresi bulunmuyor', 'error')
      return
    }
    
    if (!manualMail.message || !manualMail.message.trim()) {
      showToast('Lütfen müşterinize özel bir mesaj yazın', 'error')
      return
    }
    
    try {
      setSending(true)
      
      // Seçili siparişi kullan veya tekrar yükle
      let order = selectedOrder
      if (!order || order.id !== Number(manualMail.orderId)) {
        order = await window.electronAPI.db.getOrder(Number(manualMail.orderId))
      }
      if (!order) {
        showToast('Sipariş bulunamadı', 'error')
        return
      }
      
      // PDF oluştur
      const { generateOrderPDFForEmail } = await import('../utils/pdfExport')
      const pdfPath = await generateOrderPDFForEmail(order)
      
      // Mail verilerini hazırla
      const orderData = {
        orderId: order.id,
        musteri: order.musteri,
        telefon: order.telefon,
        customerEmail: order.customer_email,
        nereden: order.nereden,
        nereye: order.nereye,
        yukAciklamasi: order.yuk_aciklamasi || '',
        plaka: order.plaka,
        baslangicFiyati: order.baslangic_fiyati,
        toplamMaliyet: order.toplam_maliyet || 0,
        onerilenFiyat: order.onerilen_fiyat || 0,
        karZarar: order.kar_zarar || 0,
        karZararYuzde: order.kar_zarar_yuzde || 0,
        gidisKm: order.gidis_km || 0,
        donusKm: order.donus_km || 0,
        tahminiGun: order.tahmini_gun || 1,
        status: order.status,
        createdAt: order.created_at,
        isSubcontractor: order.is_subcontractor === 1,
        subcontractorCompany: order.subcontractor_company,
      }
      
      // Faturaları ekle
      const invoiceFiles = (order.invoices || []).map((inv: any) => ({
        filePath: inv.file_path,
        fileName: inv.file_name
      }))
      
      // Mail gönder - Mesaj zorunlu olduğu için direkt gönder
      console.log('📧 Frontend - Mail gönderiliyor:', {
        subject: manualMail.subject,
        message: manualMail.message,
        messageLength: manualMail.message?.length,
        email: order.customer_email
      })
      
      const result = await window.electronAPI.mail.sendOrderEmail(
        order.customer_email,
        orderData,
        pdfPath,
        invoiceFiles,
        manualMail.subject || undefined,
        manualMail.message  // Zorunlu alan, doğrudan gönder
      )
      
      console.log('📬 Mail gönderim sonucu:', result)
      
      if (result.success) {
        showToast('✅ Mail başarıyla gönderildi!', 'success')
        setManualMail({ recipient: '', orderId: '', subject: '', message: '', template: 'bekliyor' })
        setSelectedOrder(null)
        await loadData()
      } else {
        showToast(`❌ Mail gönderilemedi: ${result.message}`, 'error')
      }
    } catch (error: any) {
      console.error('Failed to send mail:', error)
      showToast(`Hata: ${error.message}`, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleLoadBulkOrders = async () => {
    try {
      const filters: any = {}
      if (bulkMail.statusFilter) filters.status = bulkMail.statusFilter
      
      let orders = await window.electronAPI.db.getOrders(filters)
      
      // Tarih filtresi
      if (bulkMail.dateFrom) {
        orders = orders.filter((o: any) => new Date(o.created_at) >= new Date(bulkMail.dateFrom))
      }
      if (bulkMail.dateTo) {
        const dateTo = new Date(bulkMail.dateTo)
        dateTo.setHours(23, 59, 59)
        orders = orders.filter((o: any) => new Date(o.created_at) <= dateTo)
      }
      
      // Sadece email adresi olanları filtrele
      orders = orders.filter((o: any) => o.customer_email)
      
      setBulkOrders(orders)
      setSelectedOrders([])
      
      if (orders.length === 0) {
        showToast('Filtreye uygun sipariş bulunamadı', 'info')
      } else {
        showToast(`${orders.length} sipariş bulundu`, 'success')
      }
    } catch (error) {
      console.error('Failed to load bulk orders:', error)
      showToast('Siparişler yüklenirken hata oluştu', 'error')
    }
  }

  const handleSendBulkMail = async () => {
    if (selectedOrders.length === 0) {
      showToast('Lütfen en az bir sipariş seçin', 'error')
      return
    }
    
    if (!confirm(`${selectedOrders.length} müşteriye mail göndermek istediğinizden emin misiniz?`)) {
      return
    }
    
    try {
      setSending(true)
      let successCount = 0
      let failedCount = 0
      
      for (const orderId of selectedOrders) {
        try {
          const order = bulkOrders.find(o => o.id === orderId)
          if (!order || !order.customer_email) continue
          
          // PDF oluştur
          const { generateOrderPDFForEmail } = await import('../utils/pdfExport')
          const pdfPath = await generateOrderPDFForEmail(order)
          
          // Mail verilerini hazırla
          const orderData = {
            orderId: order.id,
            musteri: order.musteri,
            telefon: order.telefon,
            customerEmail: order.customer_email,
            nereden: order.nereden,
            nereye: order.nereye,
            yukAciklamasi: order.yuk_aciklamasi || '',
            plaka: order.plaka,
            baslangicFiyati: order.baslangic_fiyati,
            toplamMaliyet: order.toplam_maliyet || 0,
            onerilenFiyat: order.onerilen_fiyat || 0,
            karZarar: order.kar_zarar || 0,
            karZararYuzde: order.kar_zarar_yuzde || 0,
            gidisKm: order.gidis_km || 0,
            donusKm: order.donus_km || 0,
            tahminiGun: order.tahmini_gun || 1,
            status: order.status,
            createdAt: order.created_at,
            isSubcontractor: order.is_subcontractor === 1,
            subcontractorCompany: order.subcontractor_company,
          }
          
          const invoiceFiles = (order.invoices || []).map((inv: any) => ({
            filePath: inv.file_path,
            fileName: inv.file_name
          }))
          
          const result = await window.electronAPI.mail.sendOrderEmail(
            order.customer_email,
            orderData,
            pdfPath,
            invoiceFiles
          )
          
          if (result.success) {
            successCount++
          } else {
            failedCount++
          }
          
          // Rate limiting - 1 saniye bekle
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to send mail for order ${orderId}:`, error)
          failedCount++
        }
      }
      
      showToast(`✅ ${successCount} mail gönderildi, ${failedCount} başarısız`, 'success')
      setShowBulkModal(false)
      setSelectedOrders([])
      await loadData()
    } catch (error: any) {
      console.error('Bulk send failed:', error)
      showToast(`Hata: ${error.message}`, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleRetryFailed = async (log: MailLog) => {
    try {
      setSending(true)
      
      const order = await window.electronAPI.db.getOrder(log.order_id)
      if (!order) {
        showToast('Sipariş bulunamadı', 'error')
        return
      }
      
      const { generateOrderPDFForEmail } = await import('../utils/pdfExport')
      const pdfPath = await generateOrderPDFForEmail(order)
      
      const orderData = {
        orderId: order.id,
        musteri: order.musteri,
        telefon: order.telefon,
        customerEmail: log.recipient_email,
        nereden: order.nereden,
        nereye: order.nereye,
        yukAciklamasi: order.yuk_aciklamasi || '',
        plaka: order.plaka,
        baslangicFiyati: order.baslangic_fiyati,
        toplamMaliyet: order.toplam_maliyet || 0,
        onerilenFiyat: order.onerilen_fiyat || 0,
        karZarar: order.kar_zarar || 0,
        karZararYuzde: order.kar_zarar_yuzde || 0,
        gidisKm: order.gidis_km || 0,
        donusKm: order.donus_km || 0,
        tahminiGun: order.tahmini_gun || 1,
        status: order.status,
        createdAt: order.created_at,
        isSubcontractor: order.is_subcontractor === 1,
        subcontractorCompany: order.subcontractor_company,
      }
      
      const invoiceFiles = (order.invoices || []).map((inv: any) => ({
        filePath: inv.file_path,
        fileName: inv.file_name
      }))
      
      const result = await window.electronAPI.mail.sendOrderEmail(
        log.recipient_email,
        orderData,
        pdfPath,
        invoiceFiles
      )
      
      if (result.success) {
        showToast('✅ Mail başarıyla yeniden gönderildi!', 'success')
        await loadData()
      } else {
        showToast(`❌ Mail gönderilemedi: ${result.message}`, 'error')
      }
    } catch (error: any) {
      console.error('Failed to retry mail:', error)
      showToast(`Hata: ${error.message}`, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleViewTemplate = (template: MailTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateModal(true)
  }

  const getFilteredLogs = () => {
    let filtered = [...mailLogs]
    
    // Arama
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        log.recipient_email.toLowerCase().includes(search) ||
        log.subject.toLowerCase().includes(search) ||
        log.order_id.toString().includes(search)
      )
    }
    
    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter)
    }
    
    // Tarih filtresi
    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate: Date
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(0)
      }
      
      filtered = filtered.filter(log => new Date(log.sent_at) >= startDate)
    }
    
    return filtered.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
  }

  const filteredLogs = getFilteredLogs()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 text-lg font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Mail verileri yükleniyor...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.15) 0%, rgba(191, 90, 242, 0.15) 100%)',
          border: '0.5px solid rgba(10, 132, 255, 0.3)',
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              📧 Mail Yönetimi
            </h1>
            <p className="text-lg" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>
              Müşteri maillerini yönetin ve takip edin
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="secondary"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'glass-card'
              : 'bg-transparent hover:bg-white/5'
          }`}
          style={activeTab === 'dashboard' ? { 
            border: '0.5px solid rgba(10, 132, 255, 0.3)',
            color: '#0A84FF'
          } : {
            color: 'rgba(235, 235, 245, 0.6)'
          }}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          İstatistikler
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
            activeTab === 'history'
              ? 'glass-card'
              : 'bg-transparent hover:bg-white/5'
          }`}
          style={activeTab === 'history' ? { 
            border: '0.5px solid rgba(10, 132, 255, 0.3)',
            color: '#0A84FF'
          } : {
            color: 'rgba(235, 235, 245, 0.6)'
          }}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Mail Geçmişi
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('send')}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
            activeTab === 'send'
              ? 'glass-card'
              : 'bg-transparent hover:bg-white/5'
          }`}
          style={activeTab === 'send' ? { 
            border: '0.5px solid rgba(10, 132, 255, 0.3)',
            color: '#0A84FF'
          } : {
            color: 'rgba(235, 235, 245, 0.6)'
          }}
        >
          <Send className="w-4 h-4 inline mr-2" />
          Manuel Gönder
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('bulk')}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
            activeTab === 'bulk'
              ? 'glass-card'
              : 'bg-transparent hover:bg-white/5'
          }`}
          style={activeTab === 'bulk' ? { 
            border: '0.5px solid rgba(10, 132, 255, 0.3)',
            color: '#0A84FF'
          } : {
            color: 'rgba(235, 235, 245, 0.6)'
          }}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Toplu Gönder
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
            activeTab === 'templates'
              ? 'glass-card'
              : 'bg-transparent hover:bg-white/5'
          }`}
          style={activeTab === 'templates' ? { 
            border: '0.5px solid rgba(10, 132, 255, 0.3)',
            color: '#0A84FF'
          } : {
            color: 'rgba(235, 235, 245, 0.6)'
          }}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Şablonlar
        </motion.button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Bugün Gönderilen"
              value={stats?.todayCount || 0}
              icon={<Mail className="w-6 h-6" />}
              color="blue"
              subtitle={`${stats?.todaySuccess || 0} başarılı, ${stats?.todayFailed || 0} hatalı`}
            />
            <StatCard
              title="Bu Hafta"
              value={stats?.weekCount || 0}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
              subtitle="Son 7 gün"
            />
            <StatCard
              title="Bu Ay"
              value={stats?.monthCount || 0}
              icon={<Calendar className="w-6 h-6" />}
              color="purple"
              subtitle="Aylık toplam"
            />
            <StatCard
              title="Başarı Oranı"
              value={`%${stats?.successRate.toFixed(1) || 0}`}
              icon={<CheckCircle className="w-6 h-6" />}
              color="yellow"
              subtitle={`${stats?.failedLast24h || 0} son 24 saatte hatalı`}
            />
          </div>

          {/* Özet Kartlar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Başarılı Mailler */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ 
                    background: 'rgba(48, 209, 88, 0.15)',
                    border: '0.5px solid rgba(48, 209, 88, 0.3)'
                  }}>
                    <CheckCircle className="w-6 h-6" style={{ color: '#30D158' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                      Başarılı Gönderimler
                    </h3>
                    <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      Son 24 saat
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: '#30D158' }}>
                    {stats?.todaySuccess || 0}
                  </p>
                  <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    mail gönderildi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(48, 209, 88, 0.2)' }}>
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${stats?.successRate || 0}%`,
                      background: '#30D158'
                    }}
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: '#30D158' }}>
                  %{stats?.successRate.toFixed(0) || 0}
                </span>
              </div>
            </Card>

            {/* Hatalı Mailler */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ 
                    background: 'rgba(255, 69, 58, 0.15)',
                    border: '0.5px solid rgba(255, 69, 58, 0.3)'
                  }}>
                    <XCircle className="w-6 h-6" style={{ color: '#FF453A' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                      Hatalı Gönderimler
                    </h3>
                    <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      Son 24 saat
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: '#FF453A' }}>
                    {stats?.failedLast24h || 0}
                  </p>
                  <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    başarısız
                  </p>
                </div>
              </div>
              {stats && stats.failedLast24h > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ 
                  background: 'rgba(255, 69, 58, 0.1)',
                  border: '0.5px solid rgba(255, 69, 58, 0.3)'
                }}>
                  <AlertCircle className="w-4 h-4" style={{ color: '#FF453A' }} />
                  <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>
                    Hatalı mailleri tekrar göndermek için geçmişe göz atın
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Toplam İstatistik */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl" style={{ 
                  background: 'rgba(10, 132, 255, 0.15)',
                  border: '0.5px solid rgba(10, 132, 255, 0.3)'
                }}>
                  <Inbox className="w-8 h-8" style={{ color: '#0A84FF' }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                    Toplam {stats?.totalSent || 0} Mail Gönderildi
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    Sistem kurulumundan bu yana tüm mail gönderim kayıtları
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setActiveTab('history')}
                variant="secondary"
              >
                <Eye className="w-4 h-4 mr-2" />
                Geçmişi Görüntüle
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Filtreler */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Ara"
                placeholder="Email, konu veya sipariş no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
              <Select
                label="Durum"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tüm Durumlar' },
                  { value: 'success', label: 'Başarılı' },
                  { value: 'failed', label: 'Hatalı' },
                ]}
              />
              <Select
                label="Tarih"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tüm Zamanlar' },
                  { value: 'today', label: 'Bugün' },
                  { value: 'week', label: 'Son 7 Gün' },
                  { value: 'month', label: 'Bu Ay' },
                ]}
              />
            </div>
          </Card>

          {/* Mail Tablosu */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  Mail Geçmişi
                </h3>
                <p className="text-sm mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  {filteredLogs.length} kayıt bulundu
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Alıcı</th>
                    <th>Konu</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <MailOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
                        <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                          Henüz mail gönderilmemiş
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span className="font-semibold">#{log.order_id}</span>
                        </td>
                        <td>{log.recipient_email}</td>
                        <td>{log.subject}</td>
                        <td>
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={log.status === 'success' ? {
                              background: 'rgba(48, 209, 88, 0.2)',
                              color: '#30D158'
                            } : {
                              background: 'rgba(255, 69, 58, 0.2)',
                              color: '#FF453A'
                            }}
                          >
                            {log.status === 'success' ? '✓ Başarılı' : '✗ Hatalı'}
                          </span>
                        </td>
                        <td>{formatDate(log.sent_at)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetail(log)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              title="Detayları Gör"
                            >
                              <Eye className="w-4 h-4" style={{ color: '#0A84FF' }} />
                            </button>
                            {log.status === 'failed' && (
                              <button
                                onClick={() => handleRetryFailed(log)}
                                disabled={sending}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Tekrar Gönder"
                              >
                                <RefreshCw className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} style={{ color: '#FFD60A' }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Send Tab */}
      {activeTab === 'send' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                Manuel Özel Mesaj Gönder
              </h3>
              <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Müşterinize özel, kişiselleştirilmiş mesaj gönderin
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Select
                    label="Sipariş Seç *"
                    value={manualMail.orderId}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    options={[
                      { value: '', label: 'Sipariş seçin...' },
                      ...allOrders
                        .filter(o => o.customer_email) // Sadece email adresi olanları göster
                        .map(o => ({ 
                          value: o.id.toString(), 
                          label: `#${o.id} - ${o.musteri} (${o.customer_email})`
                        }))
                    ]}
                  />
                  <p className="text-xs mt-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    📧 Sadece email adresi olan müşteriler gösterilmektedir
                  </p>
                </div>
              </div>
              
              {selectedOrder && (
                <div className="p-5 rounded-xl" style={{ 
                  background: 'rgba(48, 209, 88, 0.1)',
                  border: '0.5px solid rgba(48, 209, 88, 0.3)'
                }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg" style={{ 
                      background: 'rgba(48, 209, 88, 0.2)',
                      border: '0.5px solid rgba(48, 209, 88, 0.4)'
                    }}>
                      <Package className="w-5 h-5" style={{ color: '#30D158' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1" style={{ color: '#30D158' }}>
                        Seçili Sipariş: #{selectedOrder.id}
                      </h4>
                      <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                        Mail otomatik olarak hazırlanacaktır
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: '#30D158' }} />
                      <span><strong>Müşteri:</strong> {selectedOrder.musteri}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" style={{ color: '#30D158' }} />
                      <span><strong>Email:</strong> {selectedOrder.customer_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#30D158' }} />
                      <span><strong>Güzergah:</strong> {selectedOrder.nereden} → {selectedOrder.nereye}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" style={{ color: '#30D158' }} />
                      <span><strong>Durum:</strong> {selectedOrder.status}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Konu (Opsiyonel)"
                  type="text"
                  placeholder="Otomatik oluşturulacak"
                  value={manualMail.subject}
                  onChange={(e) => setManualMail({ ...manualMail, subject: e.target.value })}
                  disabled={sending}
                />
              </div>
              
              <div>
                <TextArea
                  label="Özel Mesajınız *"
                  value={manualMail.message}
                  onChange={(e) => setManualMail({ ...manualMail, message: e.target.value })}
                  placeholder="Müşterinize özel mesajınızı buraya yazın..."
                  rows={6}
                  disabled={sending}
                  required
                />
                <p className="text-xs mt-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  💬 Bu sayfadan sadece özel mesaj gönderilebilir. Otomatik template kullanılmaz.
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ 
                background: 'rgba(191, 90, 242, 0.1)',
                border: '0.5px solid rgba(191, 90, 242, 0.3)'
              }}>
                <Mail className="w-5 h-5" style={{ color: '#BF5AF2' }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#FFFFFF' }}>
                    📝 Manuel Özel Mesaj Gönderimi
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.7)' }}>
                    Mail, müşterinize özel mesajınız merkeze alınarak profesyonel formatta hazırlanacaktır. Sipariş bilgileri sadece referans olarak eklenecektir.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => {
                    setManualMail({ recipient: '', orderId: '', subject: '', message: '', template: 'bekliyor' })
                    setSelectedOrder(null)
                  }}
                  variant="secondary"
                >
                  Temizle
                </Button>
                <Button
                  onClick={handleSendManualMail}
                  disabled={sending || !manualMail.orderId || !selectedOrder?.customer_email || !manualMail.message?.trim()}
                >
                  {sending ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Mail Gönder
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Bulk Tab */}
      {activeTab === 'bulk' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                Toplu Mail Gönder
              </h3>
              <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Birden fazla müşteriye aynı anda mail gönderin
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Sipariş Durumu"
                  value={bulkMail.statusFilter}
                  onChange={(e) => setBulkMail({ ...bulkMail, statusFilter: e.target.value })}
                  options={[
                    { value: '', label: 'Tüm Durumlar' },
                    { value: 'Bekliyor', label: 'Bekliyor' },
                    { value: 'Yolda', label: 'Yolda' },
                    { value: 'Teslim Edildi', label: 'Teslim Edildi' },
                    { value: 'Faturalandı', label: 'Faturalandı' },
                  ]}
                />
                <Input
                  label="Başlangıç Tarihi"
                  type="date"
                  value={bulkMail.dateFrom}
                  onChange={(e) => setBulkMail({ ...bulkMail, dateFrom: e.target.value })}
                />
                <Input
                  label="Bitiş Tarihi"
                  type="date"
                  value={bulkMail.dateTo}
                  onChange={(e) => setBulkMail({ ...bulkMail, dateTo: e.target.value })}
                />
              </div>

              <Button onClick={handleLoadBulkOrders} fullWidth>
                <Search className="w-4 h-4 mr-2" />
                Siparişleri Filtrele
              </Button>

              {bulkOrders.length > 0 && (
                <>
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ 
                    background: 'rgba(48, 209, 88, 0.1)',
                    border: '0.5px solid rgba(48, 209, 88, 0.3)'
                  }}>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5" style={{ color: '#30D158' }} />
                      <div>
                        <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                          {bulkOrders.length} sipariş bulundu
                        </p>
                        <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                          {selectedOrders.length} sipariş seçildi
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendBulkMail}
                      disabled={sending || selectedOrders.length === 0}
                      variant="primary"
                    >
                      {sending ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {selectedOrders.length} Müşteriye Gönder
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              checked={selectedOrders.length === bulkOrders.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOrders(bulkOrders.map(o => o.id))
                                } else {
                                  setSelectedOrders([])
                                }
                              }}
                              className="w-4 h-4"
                            />
                          </th>
                          <th>Sipariş No</th>
                          <th>Müşteri</th>
                          <th>Email</th>
                          <th>Durum</th>
                          <th>Tarih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOrders([...selectedOrders, order.id])
                                  } else {
                                    setSelectedOrders(selectedOrders.filter(id => id !== order.id))
                                  }
                                }}
                                className="w-4 h-4"
                              />
                            </td>
                            <td>
                              <span className="font-semibold">#{order.id}</span>
                            </td>
                            <td>{order.musteri}</td>
                            <td>{order.customer_email}</td>
                            <td>
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  background: 'rgba(10, 132, 255, 0.2)',
                                  color: '#0A84FF'
                                }}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td>{formatDate(order.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                Mail Şablonları
              </h3>
              <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Otomatik mail gönderimi için kullanılan şablonlar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MAIL_TEMPLATES.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-xl p-6 glass-hover cursor-pointer"
                  onClick={() => handleViewTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl" style={{ 
                      background: 'rgba(10, 132, 255, 0.15)',
                      border: '0.5px solid rgba(10, 132, 255, 0.3)'
                    }}>
                      <FileText className="w-6 h-6" style={{ color: '#0A84FF' }} />
                    </div>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Eye className="w-4 h-4" style={{ color: 'rgba(235, 235, 245, 0.6)' }} />
                    </button>
                  </div>

                  <h4 className="text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>
                    {template.name}
                  </h4>
                  <p className="text-sm mb-4" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between pt-4" style={{ 
                    borderTop: '0.5px solid rgba(84, 84, 88, 0.35)'
                  }}>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(191, 90, 242, 0.2)',
                        color: '#BF5AF2'
                      }}
                    >
                      {template.status}
                    </span>
                    <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                      Konu: {template.subject}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-xl" style={{ 
              background: 'rgba(255, 214, 10, 0.1)',
              border: '0.5px solid rgba(255, 214, 10, 0.3)'
            }}>
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: '#FFD60A' }} />
                <div>
                  <h4 className="font-bold mb-2" style={{ color: '#FFFFFF' }}>
                    Şablon Bilgilendirme
                  </h4>
                  <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>
                    Mail şablonları sipariş durumu değiştiğinde otomatik olarak kullanılır. 
                    Her şablon, sipariş bilgilerini dinamik olarak içerir ve profesyonel bir 
                    HTML tasarımıyla müşterilere gönderilir.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Mail Detayları"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  Sipariş No
                </p>
                <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                  #{selectedLog.order_id}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  Durum
                </p>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold inline-block"
                  style={selectedLog.status === 'success' ? {
                    background: 'rgba(48, 209, 88, 0.2)',
                    color: '#30D158'
                  } : {
                    background: 'rgba(255, 69, 58, 0.2)',
                    color: '#FF453A'
                  }}
                >
                  {selectedLog.status === 'success' ? '✓ Başarılı' : '✗ Hatalı'}
                </span>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  Alıcı
                </p>
                <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                  {selectedLog.recipient_email}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  Gönderim Tarihi
                </p>
                <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                  {formatDate(selectedLog.sent_at)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Konu
              </p>
              <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                {selectedLog.subject}
              </p>
            </div>

            {selectedLog.error_message && (
              <div className="p-4 rounded-lg" style={{ 
                background: 'rgba(255, 69, 58, 0.1)',
                border: '0.5px solid rgba(255, 69, 58, 0.3)'
              }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#FF453A' }}>
                  Hata Mesajı:
                </p>
                <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>
                  {selectedLog.error_message}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Template Detail Modal */}
      {showTemplateModal && selectedTemplate && (
        <Modal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          title={selectedTemplate.name}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ 
              background: 'rgba(10, 132, 255, 0.1)',
              border: '0.5px solid rgba(10, 132, 255, 0.3)'
            }}>
              <p className="text-sm mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Konu
              </p>
              <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                {selectedTemplate.subject}
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ 
              background: 'rgba(191, 90, 242, 0.1)',
              border: '0.5px solid rgba(191, 90, 242, 0.3)'
            }}>
              <p className="text-sm mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Sipariş Durumu
              </p>
              <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                {selectedTemplate.status}
              </p>
            </div>

            <div>
              <p className="text-sm mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Açıklama
              </p>
              <p style={{ color: '#FFFFFF' }}>
                {selectedTemplate.description}
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ 
              background: 'rgba(255, 214, 10, 0.1)',
              border: '0.5px solid rgba(255, 214, 10, 0.3)'
            }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FFD60A' }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#FFFFFF' }}>
                    Dinamik İçerik
                  </p>
                  <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>
                    Bu şablon, sipariş bilgilerini otomatik olarak doldurur: 
                    Müşteri adı, sipariş no, plaka, nereden-nereye, fiyat bilgileri, 
                    ve daha fazlası. Profesyonel HTML tasarımıyla gönderilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

