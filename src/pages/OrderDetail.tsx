import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Edit,
  Trash2,
  Plus,
  Upload,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin,
  Truck,
  Mail,
  Send,
  Loader,
  ArrowRight
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import Modal from '../components/Modal'
import StatusTimeline from '../components/StatusTimeline'
import { formatCurrency, formatDate } from '../utils/formatters'
import { exportOrderToPDF, generateOrderPDFForEmail } from '../utils/pdfExport'
import { useToast } from '../context/ToastContext'

const STATUS_OPTIONS = [
  { value: 'Bekliyor', label: 'Bekliyor' },
  { value: 'Yüklendi', label: 'Yüklendi' },
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
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  
  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const [showMailModal, setShowMailModal] = useState(false)
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState('')
  
  // Forms
  const [expenseForm, setExpenseForm] = useState({ type: 'Yakıt', amount: '', description: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Mail states
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sendingMail, setSendingMail] = useState(false)
  const [mailSettings, setMailSettings] = useState<any>(null)

  useEffect(() => {
    loadOrderDetails()
    loadMailSettings()
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
  
  const loadMailSettings = async () => {
    try {
      const settings = await window.electronAPI.mail.getSettings()
      setMailSettings(settings)
    } catch (error) {
      console.error('Failed to load mail settings:', error)
    }
  }
  
  const handleSendEmail = async () => {
    console.log('🔍 Mail gönderme başladı:', { recipientEmail, order: order?.id })
    
    // Validation
    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.log('❌ Mail validation hatası:', recipientEmail)
      showToast('Lütfen geçerli bir mail adresi giriniz', 'error')
      return
    }
    
    try {
      setSendingMail(true)
      console.log('📄 PDF oluşturuluyor...')
      showToast('PDF oluşturuluyor...', 'info')
      
      // PDF oluştur
      const pdfPath = await generateOrderPDFForEmail(order)
      console.log('✅ PDF oluşturuldu:', pdfPath)
      
      // Mail gönder
      console.log('📧 Mail gönderiliyor...')
      showToast('Mail gönderiliyor...', 'info')
      const orderData = {
        orderId: order.id,
        musteri: order.musteri,
        telefon: order.telefon,
        customerEmail: recipientEmail,
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
      
      // Fatura listesini hazırla (sadece path ve file_name)
      const invoiceFiles = invoices.map(inv => ({
        filePath: inv.file_path,
        fileName: inv.file_name
      }))
      
      const result = await window.electronAPI.mail.sendOrderEmail(
        recipientEmail,
        orderData,
        pdfPath,
        invoiceFiles
      )
      
      if (result.success) {
        showToast('Mail başarıyla gönderildi! ✅', 'success')
        setShowMailModal(false)
        setRecipientEmail('')
      } else {
        showToast(`Mail gönderilemedi: ${result.message}`, 'error')
      }
    } catch (error: any) {
      console.error('Failed to send email:', error)
      showToast(`Hata: ${error.message}`, 'error')
    } finally {
      setSendingMail(false)
    }
  }

  const openStatusConfirmation = (newStatus: string) => {
    setPendingStatus(newStatus)
    setShowStatusConfirmModal(true)
    setEditingStatus(false)
  }
  
  const handleStatusChange = async () => {
    try {
      console.log('🔄 Durum güncelleniyor:', { orderId: order.id, newStatus: pendingStatus })
      
      // Durumu güncelle
      await window.electronAPI.db.updateOrderStatus(Number(id), pendingStatus)
      
      const oldStatus = order.status
      setOrder({ ...order, status: pendingStatus })
      setShowStatusConfirmModal(false)
      
      showToast(`Durum "${pendingStatus}" olarak güncellendi`, 'success')
      
      // Otomatik mail gönder (eğer customer_email varsa ve mail sistemi aktifse)
      if (order.customer_email && mailSettings && mailSettings.enabled === 1) {
        console.log('📧 Otomatik mail gönderiliyor...')
        
        try {
          // PDF oluştur
          const pdfPath = await generateOrderPDFForEmail(order)
          
          // Mail data hazırla
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
            status: pendingStatus, // Yeni durum!
            createdAt: order.created_at,
            isSubcontractor: order.is_subcontractor === 1,
            subcontractorCompany: order.subcontractor_company,
          }
          
          // Fatura listesini hazırla (sadece path ve file_name)
          const invoiceFiles = invoices.map(inv => ({
            filePath: inv.file_path,
            fileName: inv.file_name
          }))
          
          // Mail gönder
          const result = await window.electronAPI.mail.sendOrderEmail(
            order.customer_email,
            orderData,
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
      
    } catch (error) {
      console.error('Failed to update status:', error)
      showToast('Durum güncellenirken bir hata oluştu', 'error')
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

  const handleDownloadInvoice = async (invoice: any) => {
    try {
      // Dosyayı oku
      const base64Data = await window.electronAPI.fs.readFile(invoice.file_path)
      
      // Base64'ü blob'a çevir
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: invoice.file_type || 'application/octet-stream' })
      
      // Download link oluştur
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = invoice.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      showToast('Fatura başarıyla indirildi', 'success')
    } catch (error) {
      console.error('Failed to download invoice:', error)
      showToast('Fatura indirilirken bir hata oluştu', 'error')
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 text-lg font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Sipariş yükleniyor...
          </p>
        </motion.div>
      </div>
    )
  }

  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#FF453A' }} />
        <p className="text-xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>Sipariş bulunamadı</p>
        <p className="mb-6" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Bu sipariş silinmiş veya mevcut değil</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl"
            style={{ 
              backgroundColor: 'rgba(10, 132, 255, 0.15)', 
              color: '#0A84FF',
              border: '0.5px solid rgba(10, 132, 255, 0.3)'
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
                Sipariş #{order.id}
              </h1>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${getStatusTextColor(order.status)}22 0%, ${getStatusTextColor(order.status)}44 100%)`,
                  border: `2px solid ${getStatusTextColor(order.status)}`,
                  color: getStatusTextColor(order.status)
                }}
              >
                <span className="text-xl">{getStatusIcon(order.status)}</span>
                <span className="text-base">{order.status}</span>
              </motion.div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" style={{ color: 'rgba(235, 235, 245, 0.6)' }} />
                <span className="text-lg" style={{ color: 'rgba(235, 235, 245, 0.7)' }}>{order.plaka}</span>
              </div>
              <span style={{ color: 'rgba(235, 235, 245, 0.4)' }}>•</span>
              <span className="text-lg" style={{ color: 'rgba(235, 235, 245, 0.7)' }}>{order.musteri}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {mailSettings && mailSettings.enabled === 1 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setShowMailModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Mail Gönder
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="secondary" onClick={() => exportOrderToPDF(order)}>
              <Download className="w-4 h-4 mr-2" />
              PDF İndir
            </Button>
          </motion.div>
          <Link to={`/orders/${id}/edit`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="secondary">
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Status Timeline */}
      <Card title="📍 Sipariş Durumu">
        <StatusTimeline
          currentStatus={order.status}
          createdAt={order.created_at}
          updatedAt={order.updated_at}
        />
      </Card>

      {/* Taşeron Uyarısı */}
      {order.is_subcontractor === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-5"
          style={{ background: 'rgba(255, 159, 10, 0.15)', border: '0.5px solid rgba(255, 159, 10, 0.3)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.2)' }}>
              <Truck className="w-5 h-5" style={{ color: '#FF9F0A' }} />
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: '#FFFFFF' }}>Taşeron Sipariş</p>
              <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.7)' }}>
                Bu sipariş taşeron firma aracılığıyla gerçekleştirilmektedir
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Order Info */}
      <Card title="Sipariş Bilgileri">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {order.is_subcontractor === 1 ? (
            <>
              <div>
                <p className="text-sm font-medium text-gray-600">Taşeron Firma</p>
                <p className="text-lg font-semibold">{order.subcontractor_company}</p>
              </div>
              {order.subcontractor_vehicle && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Taşeron Araç</p>
                  <p className="text-lg font-semibold">{order.subcontractor_vehicle}</p>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-600">Plaka</p>
              <p className="text-lg font-semibold">{order.plaka}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-600">Müşteri</p>
            <p className="text-lg font-semibold">{order.musteri}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Telefon</p>
            <p className="text-lg font-semibold">{order.telefon}</p>
          </div>
          {order.customer_email && (
            <div>
              <p className="text-sm font-medium text-gray-600">E-posta</p>
              <p className="text-lg font-semibold">{order.customer_email}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-600">Durum</p>
            <div className="flex items-center space-x-2">
              {editingStatus ? (
                <div className="space-y-2 min-w-[200px]">
                  {STATUS_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={option.value === order.status ? 'primary' : 'secondary'}
                      onClick={() => openStatusConfirmation(option.value)}
                      className="w-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                  <Button size="sm" variant="secondary" onClick={() => setEditingStatus(false)} className="w-full mt-2">
                    İptal
                  </Button>
                </div>
              ) : (
                <>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <button
                    onClick={() => setEditingStatus(true)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
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

      {/* Modern Financial Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Gelir */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass-card rounded-xl p-6 relative overflow-hidden"
          style={{ background: 'rgba(48, 209, 88, 0.12)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#30D158' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" style={{ color: '#30D158' }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#30D158' }}>
                Müşteriden Alınan
              </p>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
              {formatCurrency(order.baslangic_fiyati)}
            </p>
            <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Toplam gelir</p>
          </div>
        </motion.div>

        {/* Tahmini Maliyet / Taşeron Maliyeti */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass-card rounded-xl p-6 relative overflow-hidden"
          style={{ background: 'rgba(255, 159, 10, 0.12)', border: '0.5px solid rgba(255, 159, 10, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#FF9F0A' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4" style={{ color: '#FF9F0A' }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF9F0A' }}>
                {order.is_subcontractor === 1 ? 'Taşeron Maliyeti' : 'Tahmini Maliyet'}
              </p>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
              {formatCurrency(calculateEstimatedCost())}
            </p>
            <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              {order.is_subcontractor === 1 
                ? 'Taşeron firmaya ödenen'
                : (order.etkin_km > 0 ? `${order.etkin_km.toFixed(0)} km` : 'Hesaplanmadı')
              }
            </p>
          </div>
        </motion.div>

        {/* Ek Giderler */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass-card rounded-xl p-6 relative overflow-hidden"
          style={{ background: 'rgba(255, 69, 58, 0.12)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#FF453A' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" style={{ color: '#FF453A' }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF453A' }}>
                Ek Giderler
              </p>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
              {formatCurrency(calculateTotalExpenses())}
            </p>
            <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sonradan eklenen</p>
          </div>
        </motion.div>

        {/* Net Kar/Zarar */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="glass-card rounded-xl p-6 relative overflow-hidden"
          style={{ 
            background: calculateNetIncome() >= 0 ? 'rgba(10, 132, 255, 0.12)' : 'rgba(255, 69, 58, 0.12)',
            border: calculateNetIncome() >= 0 ? '0.5px solid rgba(10, 132, 255, 0.3)' : '0.5px solid rgba(255, 69, 58, 0.3)'
          }}
        >
          <div 
            className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" 
            style={{ backgroundColor: calculateNetIncome() >= 0 ? '#0A84FF' : '#FF453A' }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              {calculateNetIncome() >= 0 ? (
                <TrendingUp className="w-4 h-4" style={{ color: '#0A84FF' }} />
              ) : (
                <TrendingDown className="w-4 h-4" style={{ color: '#FF453A' }} />
              )}
              <p 
                className="text-xs font-semibold uppercase tracking-wider" 
                style={{ color: calculateNetIncome() >= 0 ? '#0A84FF' : '#FF453A' }}
              >
                Net Kar/Zarar
              </p>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
              {formatCurrency(calculateNetIncome())}
            </p>
            <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              {order.kar_zarar 
                ? `Tahmini: ${formatCurrency(order.kar_zarar)}` 
                : 'Hesaplanmadı'
              }
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Modern Maliyet Dökümü - Sadece kendi araçlar için */}
      {order.is_subcontractor !== 1 && order.toplam_maliyet > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: '#FFFFFF' }}>
            💰 Maliyet Dökümü
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {order.yakit_maliyet > 0 && (
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                className="text-center p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(255, 214, 10, 0.1)', border: '0.5px solid rgba(255, 214, 10, 0.2)' }}
              >
                <p className="text-xs mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>⛽ Yakıt</p>
                <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(order.yakit_maliyet)}
                </p>
                {order.yakit_litre > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                    {order.yakit_litre.toFixed(1)} lt
                  </p>
                )}
              </motion.div>
            )}
            {order.surucu_maliyet > 0 && (
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                className="text-center p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', border: '0.5px solid rgba(10, 132, 255, 0.2)' }}
              >
                <p className="text-xs mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>👤 Sürücü</p>
                <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(order.surucu_maliyet)}
                </p>
                {order.tahmini_gun > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                    {order.tahmini_gun} gün
                  </p>
                )}
              </motion.div>
            )}
            {order.yemek_maliyet > 0 && (
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                className="text-center p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(255, 159, 10, 0.1)', border: '0.5px solid rgba(255, 159, 10, 0.2)' }}
              >
                <p className="text-xs mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>🍽️ Yemek</p>
                <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(order.yemek_maliyet)}
                </p>
              </motion.div>
            )}
            {order.hgs_maliyet > 0 && (
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                className="text-center p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(191, 90, 242, 0.1)', border: '0.5px solid rgba(191, 90, 242, 0.2)' }}
              >
                <p className="text-xs mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>🛣️ HGS</p>
                <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(order.hgs_maliyet)}
                </p>
              </motion.div>
            )}
            {order.bakim_maliyet > 0 && (
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                className="text-center p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(48, 209, 88, 0.1)', border: '0.5px solid rgba(48, 209, 88, 0.2)' }}
              >
                <p className="text-xs mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>🔧 Bakım</p>
                <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(order.bakim_maliyet)}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Modern Expenses Section */}
      <Card
        title="Giderler"
        actions={
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" onClick={() => setShowExpenseModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Gider Ekle
            </Button>
          </motion.div>
        }
      >
        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(84, 84, 88, 0.35)' }}>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Tür</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Tutar</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Açıklama</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Tarih</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '0.5px solid rgba(84, 84, 88, 0.25)' }}
                  >
                    <td className="py-3 px-4 font-medium" style={{ color: '#FFFFFF' }}>{expense.type}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: '#FF453A' }}>
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      {expense.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      {formatDate(expense.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: '#FF453A', backgroundColor: 'rgba(255, 69, 58, 0.1)' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
            <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Henüz gider eklenmemiş</p>
          </div>
        )}
      </Card>

      {/* Modern Invoices Section */}
      <Card
        title="Faturalar"
        actions={
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" onClick={() => setShowInvoiceModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Fatura Yükle
            </Button>
          </motion.div>
        }
      >
        {invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(10, 132, 255, 0.1)', 
                  border: '0.5px solid rgba(10, 132, 255, 0.2)' 
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#0A84FF' }} />
                    <p className="font-medium text-sm truncate" style={{ color: '#FFFFFF' }}>
                      {invoice.file_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="p-1.5 rounded-lg"
                      style={{ color: '#30D158', backgroundColor: 'rgba(48, 209, 88, 0.15)' }}
                      title="İndir"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteInvoice(invoice.id, invoice.file_path)}
                      className="p-1.5 rounded-lg"
                      style={{ color: '#FF453A', backgroundColor: 'rgba(255, 69, 58, 0.15)' }}
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  {formatDate(invoice.uploaded_at)}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
            <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Henüz fatura yüklenmemiş</p>
          </div>
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
      
      {/* Mail Modal */}
      <Modal
        isOpen={showMailModal}
        onClose={() => {
          setShowMailModal(false)
          setRecipientEmail('')
        }}
        title="📧 Sipariş Maili Gönder"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowMailModal(false)
                setRecipientEmail('')
              }}
            >
              İptal
            </Button>
            <Button 
              onClick={() => {
                console.log('🖱️ Gönder butonuna tıklandı. recipientEmail:', recipientEmail)
                handleSendEmail()
              }}
              disabled={sendingMail || !recipientEmail}
              className={!recipientEmail ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {sendingMail ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {recipientEmail ? 'Gönder' : 'Önce mail adresi giriniz'}
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alıcı Mail Adresi
            </label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => {
                console.log('📧 Mail adresi değişti:', e.target.value)
                setRecipientEmail(e.target.value)
              }}
              placeholder="musteri@example.com"
              disabled={sendingMail}
              autoFocus
            />
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📄 Mail İçeriği</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sipariş detayları (HTML format)</li>
              <li>• Müşteri ve güzergah bilgileri</li>
              <li>• Finansal özet</li>
              <li>• PDF eki (Sipariş belgesi)</li>
            </ul>
          </div>
          
          {!mailSettings || mailSettings.enabled !== 1 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Mail servisi henüz yapılandırılmamış. Lütfen <Link to="/settings" className="underline font-semibold">Ayarlar</Link> sayfasından SMTP ayarlarını yapın.
              </p>
            </div>
          ) : null}
        </div>
      </Modal>
      
      {/* Status Confirmation Modal - ActiveVehicles style */}
      <Modal
        isOpen={showStatusConfirmModal}
        onClose={() => setShowStatusConfirmModal(false)}
        title="Durum Değişikliği Onayı"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStatusConfirmModal(false)}>
              İptal
            </Button>
            <Button onClick={handleStatusChange}>
              Onayla ve {order?.customer_email ? 'Mail Gönder' : 'Güncelle'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Mevcut Durum</p>
            <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
              {order?.status}
            </p>
          </div>
          <div className="flex items-center justify-center py-2">
            <ArrowRight className="w-8 h-8" style={{ color: '#0A84FF' }} />
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: getStatusBgColor(pendingStatus) }}>
            <p className="text-sm mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yeni Durum</p>
            <p className="text-xl font-bold" style={{ color: getStatusTextColor(pendingStatus) }}>
              {pendingStatus}
            </p>
          </div>
          
          {/* Otomatik mail bilgisi */}
          {order?.customer_email && mailSettings && mailSettings.enabled === 1 && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-green-400" />
                <p className="text-sm font-semibold text-green-300">Otomatik Mail Gönderilecek</p>
              </div>
              <p className="text-xs text-gray-400">
                Müşteriye ({order.customer_email}) durum değişikliği maili otomatik olarak gönderilecektir.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Bekliyor': 'bg-yellow-100 text-yellow-800',
    'Yüklendi': 'bg-orange-100 text-orange-800',
    'Yolda': 'bg-blue-100 text-blue-800',
    'Teslim Edildi': 'bg-green-100 text-green-800',
    'Faturalandı': 'bg-purple-100 text-purple-800',
    'İptal': 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    'Bekliyor': 'rgba(255, 214, 10, 0.2)',
    'Yüklendi': 'rgba(255, 159, 10, 0.2)',
    'Yolda': 'rgba(10, 132, 255, 0.2)',
    'Teslim Edildi': 'rgba(48, 209, 88, 0.2)',
    'Faturalandı': 'rgba(191, 90, 242, 0.2)',
    'İptal': 'rgba(255, 69, 58, 0.2)',
  }
  return colors[status] || 'rgba(235, 235, 245, 0.2)'
}

function getStatusTextColor(status: string): string {
  const colors: Record<string, string> = {
    'Bekliyor': '#FFD60A',
    'Yüklendi': '#FF9F0A',
    'Yolda': '#0A84FF',
    'Teslim Edildi': '#30D158',
    'Faturalandı': '#BF5AF2',
    'İptal': '#FF453A',
  }
  return colors[status] || 'rgba(235, 235, 245, 0.6)'
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    'Bekliyor': '⏸️',
    'Yüklendi': '📦',
    'Yolda': '🚛',
    'Teslim Edildi': '✅',
    'Faturalandı': '💳',
    'İptal': '❌',
  }
  return icons[status] || '📋'
}

