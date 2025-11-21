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
  MessageCircle,
  Send,
  Loader,
  ArrowRight,
  Receipt,
  Building2,
  User,
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import TextArea from '../components/TextArea'
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
  const [calculatedFixedCosts, setCalculatedFixedCosts] = useState<{ sigorta: number; mtv: number; muayene: number } | null>(null)
  
  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const [showMailModal, setShowMailModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState('')
  const [showUyumsoftModal, setShowUyumsoftModal] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'EARCHIVE' | 'EINVOICE'>('EARCHIVE')
  
  // Forms
  const [expenseForm, setExpenseForm] = useState({ type: 'Yakıt', amount: '', description: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Mail states
  const [recipientEmail, setRecipientEmail] = useState('')
  const [mailSubject, setMailSubject] = useState('')
  const [mailMessage, setMailMessage] = useState('')
  const [sendingMail, setSendingMail] = useState(false)
  const [mailSettings, setMailSettings] = useState<any>(null)
  
  // WhatsApp states
  const [whatsappSettings, setWhatsappSettings] = useState<any>(null)
  const [recipientPhone, setRecipientPhone] = useState('')
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)
  
  // Uyumsoft states
  const [uyumsoftSettings, setUyumsoftSettings] = useState<any>(null)
  const [uyumsoftInvoices, setUyumsoftInvoices] = useState<any[]>([])
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    customerType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'CORPORATE',
    customerTaxNumber: '',
    customerTaxOffice: '',
    customerIdNumber: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    description: '',
    amount: '',
    vatRate: '20',
    autoSendEmail: true,
  })

  useEffect(() => {
    loadOrderDetails()
    loadMailSettings()
    loadWhatsAppSettings()
    loadUyumsoftSettings()
    loadUyumsoftInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      const data = await window.electronAPI.db.getOrder(Number(id))
      setOrder(data.order)
      setExpenses(data.expenses || [])
      setInvoices(data.invoices || [])
      
      // Form'u doldur
      if (data.order) {
        setInvoiceForm({
          ...invoiceForm,
          customerName: data.order.musteri || '',
          customerEmail: data.order.customer_email || '',
          customerPhone: data.order.telefon || '',
          description: `${data.order.nereden} - ${data.order.nereye} Nakliye Hizmeti`,
          amount: data.order.baslangic_fiyati?.toString() || '',
        })
        setRecipientEmail(data.order.customer_email || '')
        
        // Eğer sigorta/MTV/muayene değerleri 0 ise, gerçek zamanlı hesapla
        if (data.order && !data.order.is_subcontractor && 
            (data.order.sigorta_maliyet === 0 || data.order.mtv_maliyet === 0 || data.order.muayene_maliyet === 0) &&
            data.order.plaka && data.order.tahmini_gun) {
          try {
            const analysis = await window.electronAPI.cost.analyze({
              plaka: data.order.plaka,
              nereden: data.order.nereden,
              nereye: data.order.nereye,
              gidisKm: data.order.gidis_km || 0,
              donusKm: data.order.donus_km || 0,
              returnLoadRate: data.order.return_load_rate || 0,
              tahminiGun: data.order.tahmini_gun || 1,
              baslangicFiyati: data.order.baslangic_fiyati || 0,
            })
            
            if (analysis?.costBreakdown) {
              setCalculatedFixedCosts({
                sigorta: analysis.costBreakdown.sigortaMaliyet || 0,
                mtv: analysis.costBreakdown.mtvMaliyet || 0,
                muayene: analysis.costBreakdown.muayeneMaliyet || 0,
              })
            }
          } catch (error) {
            console.error('Failed to calculate fixed costs:', error)
          }
        }
      }
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
  
  const loadWhatsAppSettings = async () => {
    try {
      const settings = await window.electronAPI.whatsapp.getSettings()
      setWhatsappSettings(settings)
    } catch (error) {
      console.error('Failed to load WhatsApp settings:', error)
    }
  }
  
  const loadUyumsoftSettings = async () => {
    try {
      const settings = await window.electronAPI.uyumsoft.getSettings()
      setUyumsoftSettings(settings)
    } catch (error) {
      console.error('Failed to load Uyumsoft settings:', error)
    }
  }
  
  const loadUyumsoftInvoices = async () => {
    try {
      const invoices = await window.electronAPI.uyumsoft.getInvoicesByOrder(Number(id))
      setUyumsoftInvoices(invoices || [])
    } catch (error) {
      console.error('Failed to load Uyumsoft invoices:', error)
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
        invoiceFiles,
        mailSubject || undefined,
        mailMessage || undefined
      )
      
      if (result.success) {
        showToast('Mail başarıyla gönderildi! ✅', 'success')
        setShowMailModal(false)
        setRecipientEmail('')
        setMailSubject('')
        setMailMessage('')
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
  
  const handleSendWhatsApp = async () => {
    console.log('🟢 WhatsApp gönderme başladı:', { recipientPhone, order: order?.id })
    
    // Validation
    if (!recipientPhone || recipientPhone.length < 10) {
      console.log('❌ Telefon validation hatası:', recipientPhone)
      showToast('Lütfen geçerli bir telefon numarası giriniz', 'error')
      return
    }
    
    try {
      setSendingWhatsApp(true)
      showToast('WhatsApp mesajı gönderiliyor...', 'info')
      
      const whatsappOrderData = {
        orderId: order.id,
        musteri: order.musteri,
        telefon: order.telefon,
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
      
      const result = await window.electronAPI.whatsapp.sendOrderMessage(
        recipientPhone,
        whatsappOrderData,
        'custom',
        whatsappMessage || undefined
      )
      
      if (result.success) {
        showToast('WhatsApp mesajı başarıyla gönderildi! ✅', 'success')
        setShowWhatsAppModal(false)
        setRecipientPhone('')
        setWhatsappMessage('')
      } else {
        showToast(`WhatsApp mesajı gönderilemedi: ${result.message}`, 'error')
      }
    } catch (error: any) {
      console.error('Failed to send WhatsApp:', error)
      showToast('WhatsApp mesajı gönderilemedi', 'error')
    } finally {
      setSendingWhatsApp(false)
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
      
      // Otomatik WhatsApp gönder (eğer telefon varsa ve WhatsApp sistemi aktifse)
      if (order.telefon && whatsappSettings && whatsappSettings.enabled === 1 && whatsappSettings.auto_send_on_status_change === 1) {
        console.log('🟢 Otomatik WhatsApp gönderiliyor...')
        
        try {
          // WhatsApp data hazırla
          const whatsappOrderData = {
            orderId: order.id,
            musteri: order.musteri,
            telefon: order.telefon,
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
          
          // Mesaj tipini belirle
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
          
          // WhatsApp mesajı gönder
          const whatsappResult = await window.electronAPI.whatsapp.sendOrderMessage(
            order.telefon,
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
          // WhatsApp gönderilmese de durum güncellendi, hata gösterme
        }
      }
      
    } catch (error) {
      console.error('Failed to update status:', error)
      showToast('Durum güncellenirken bir hata oluştu', 'error')
    }
  }
  
  const handleCreateInvoice = async () => {
    // Validasyon
    if (!invoiceForm.customerName) {
      showToast('Müşteri adı zorunludur', 'error')
      return
    }
    
    if (!invoiceForm.amount || parseFloat(invoiceForm.amount) <= 0) {
      showToast('Geçerli bir tutar giriniz', 'error')
      return
    }
    
    if (invoiceForm.customerType === 'CORPORATE' && !invoiceForm.customerTaxNumber) {
      showToast('Kurumsal müşteriler için vergi numarası zorunludur', 'error')
      return
    }
    
    if (invoiceForm.customerType === 'INDIVIDUAL' && !invoiceForm.customerIdNumber) {
      showToast('Bireysel müşteriler için TC kimlik numarası zorunludur', 'error')
      return
    }
    
    try {
      setCreatingInvoice(true)
      
      const invoiceData = {
        customerName: invoiceForm.customerName,
        customerType: invoiceForm.customerType,
        customerTaxNumber: invoiceForm.customerTaxNumber || undefined,
        customerTaxOffice: invoiceForm.customerTaxOffice || undefined,
        customerIdNumber: invoiceForm.customerIdNumber || undefined,
        customerEmail: invoiceForm.customerEmail || undefined,
        customerPhone: invoiceForm.customerPhone || undefined,
        customerAddress: invoiceForm.customerAddress || undefined,
        items: [
          {
            description: invoiceForm.description || `${order.nereden} - ${order.nereye} Nakliye Hizmeti`,
            quantity: 1,
            unitPrice: parseFloat(invoiceForm.amount),
            vatRate: parseFloat(invoiceForm.vatRate),
          }
        ],
        notes: `Araç: ${order.plaka}\nYük: ${order.yuk_aciklamasi || '-'}`,
        autoSendEmail: invoiceForm.autoSendEmail,
      }
      
      let result
      if (invoiceType === 'EARCHIVE') {
        result = await window.electronAPI.uyumsoft.createEArchiveInvoice(Number(id), invoiceData)
      } else {
        result = await window.electronAPI.uyumsoft.createEInvoice(Number(id), invoiceData)
      }
      
      if (result.success) {
        showToast(`✅ ${invoiceType === 'EARCHIVE' ? 'E-Arşiv' : 'E-Fatura'} başarıyla oluşturuldu!`, 'success')
        setShowUyumsoftModal(false)
        loadOrderDetails()
        loadUyumsoftInvoices()
      } else {
        showToast(`❌ Fatura oluşturulamadı: ${result.message || 'Bilinmeyen hata'}`, 'error')
      }
    } catch (error: any) {
      console.error('Failed to create invoice:', error)
      showToast(`Hata: ${error.message || 'Fatura oluşturulamadı'}`, 'error')
    } finally {
      setCreatingInvoice(false)
    }
  }
  
  const handleCancelInvoice = async (invoiceId: number) => {
    if (!confirm('Bu faturayı iptal etmek istediğinize emin misiniz?')) {
      return
    }
    
    const reason = prompt('İptal sebebi:')
    if (!reason) {
      return
    }
    
    try {
      const result = await window.electronAPI.uyumsoft.cancelInvoice(invoiceId, reason)
      
      if (result.success) {
        showToast('✅ Fatura başarıyla iptal edildi', 'success')
        loadUyumsoftInvoices()
      } else {
        showToast(`❌ ${result.message}`, 'error')
      }
    } catch (error: any) {
      console.error('Failed to cancel invoice:', error)
      showToast(`Hata: ${error.message}`, 'error')
    }
  }
  
  const handleDownloadInvoicePDF = async (invoiceId: number) => {
    try {
      const result = await window.electronAPI.uyumsoft.downloadInvoicePDF(invoiceId)
      
      if (result.success && result.path) {
        // Tarayıcıda aç
        window.open(result.path, '_blank')
      } else {
        showToast(`❌ ${result.error || 'PDF indirilemedi'}`, 'error')
      }
    } catch (error: any) {
      console.error('Failed to download PDF:', error)
      showToast(`Hata: ${error.message}`, 'error')
    }
  }
  
  const handleResendInvoiceEmail = async (invoiceId: number) => {
    const email = prompt('E-posta adresi:', invoiceForm.customerEmail || '')
    if (!email) {
      return
    }
    
    try {
      const result = await window.electronAPI.uyumsoft.resendInvoiceEmail(invoiceId, email)
      
      if (result.success) {
        showToast('✅ Fatura e-postası başarıyla gönderildi', 'success')
      } else {
        showToast(`❌ ${result.message}`, 'error')
      }
    } catch (error: any) {
      console.error('Failed to resend email:', error)
      showToast(`Hata: ${error.message}`, 'error')
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
          
          {/* WhatsApp Gönder Butonu */}
          {whatsappSettings && whatsappSettings.enabled === 1 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => {
                  setRecipientPhone(order.telefon || '')
                  setShowWhatsAppModal(true)
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Gönder
              </Button>
            </motion.div>
          )}
          
          {/* Uyumsoft Fatura Butonu */}
          {uyumsoftSettings && uyumsoftSettings.enabled === 1 && order.status !== 'Faturalandı' && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => setShowUyumsoftModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Faturala
              </Button>
            </motion.div>
          )}
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="secondary" onClick={async () => await exportOrderToPDF(order)}>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
            {/* Sabit Giderler - Her zaman göster (değer 0 olsa bile, hesaplanmış değerler varsa onları kullan) */}
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              className="text-center p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '0.5px solid rgba(99, 102, 241, 0.2)' }}
            >
              <p className="text-xs mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>🛡️ Sigorta</p>
              <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                {formatCurrency(order.sigorta_maliyet || calculatedFixedCosts?.sigorta || 0)}
              </p>
              {order.tahmini_gun > 0 && (
                <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  {order.tahmini_gun} gün
                </p>
              )}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              className="text-center p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '0.5px solid rgba(139, 92, 246, 0.2)' }}
            >
              <p className="text-xs mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>📋 MTV</p>
              <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                {formatCurrency(order.mtv_maliyet || calculatedFixedCosts?.mtv || 0)}
              </p>
              {order.tahmini_gun > 0 && (
                <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  {order.tahmini_gun} gün
                </p>
              )}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              className="text-center p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '0.5px solid rgba(168, 85, 247, 0.2)' }}
            >
              <p className="text-xs mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>🔍 Muayene</p>
              <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                {formatCurrency(order.muayene_maliyet || calculatedFixedCosts?.muayene || 0)}
              </p>
              {order.tahmini_gun > 0 && (
                <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  {order.tahmini_gun} gün
                </p>
              )}
            </motion.div>
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}>
            <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.7)' }}>
              ℹ️ Sabit giderler (sigorta/MTV/muayene) <strong>gün bazlı</strong> hesaplanmıştır (piyasa standartlarına uygun)
              {(order.sigorta_maliyet === 0 && order.mtv_maliyet === 0 && order.muayene_maliyet === 0 && calculatedFixedCosts) && (
                <span className="block mt-1 text-[10px]" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  * Bu sipariş eski sistemde oluşturulmuştu, değerler gerçek zamanlı olarak hesaplanmıştır.
                </span>
              )}
              {(order.sigorta_maliyet === 0 && order.mtv_maliyet === 0 && order.muayene_maliyet === 0 && !calculatedFixedCosts) && (
                <span className="block mt-1 text-[10px]" style={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                  * Bu sipariş eski sistemde oluşturulmuş, sabit giderler toplam maliyet içinde dahil edilmiş olabilir.
                </span>
              )}
            </p>
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
      
      {/* Uyumsoft E-Fatura Section */}
      {uyumsoftSettings && uyumsoftSettings.enabled === 1 && (
        <Card
          title="🧾 E-Fatura / E-Arşiv Faturaları"
          subtitle="Uyumsoft ile oluşturulan yasal faturalar"
        >
          {uyumsoftInvoices.length > 0 ? (
            <div className="space-y-3">
              {uyumsoftInvoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: invoice.invoice_status === 'APPROVED' 
                      ? 'rgba(48, 209, 88, 0.1)' 
                      : invoice.invoice_status === 'CANCELLED'
                      ? 'rgba(255, 69, 58, 0.1)'
                      : 'rgba(10, 132, 255, 0.1)',
                    borderColor: invoice.invoice_status === 'APPROVED'
                      ? 'rgba(48, 209, 88, 0.3)'
                      : invoice.invoice_status === 'CANCELLED'
                      ? 'rgba(255, 69, 58, 0.3)'
                      : 'rgba(10, 132, 255, 0.3)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Receipt className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-white">
                          {invoice.invoice_number || 'Fatura No Bekleniyor...'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          invoice.invoice_type === 'EARCHIVE'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {invoice.invoice_type === 'EARCHIVE' ? 'E-Arşiv' : 'E-Fatura'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          invoice.invoice_status === 'APPROVED'
                            ? 'bg-green-500/20 text-green-300'
                            : invoice.invoice_status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-300'
                            : invoice.invoice_status === 'FAILED'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {invoice.invoice_status === 'APPROVED' && '✓ Onaylandı'}
                          {invoice.invoice_status === 'DRAFT' && '⏳ Taslak'}
                          {invoice.invoice_status === 'CANCELLED' && '❌ İptal'}
                          {invoice.invoice_status === 'FAILED' && '❌ Hata'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {invoice.customer_name}
                        {invoice.customer_tax_number && ` • VKN: ${invoice.customer_tax_number}`}
                        {invoice.customer_id_number && ` • TC: ${invoice.customer_id_number}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(invoice.grand_total)}
                      </p>
                      <p className="text-xs text-gray-400">
                        KDV Dahil
                      </p>
                    </div>
                  </div>

                  {invoice.error_message && (
                    <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-red-300">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        {invoice.error_message}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                    <div>
                      <span className="block">Tarih:</span>
                      <span className="text-white">{formatDate(invoice.invoice_date)}</span>
                    </div>
                    <div>
                      <span className="block">Oluşturulma:</span>
                      <span className="text-white">{formatDate(invoice.created_at)}</span>
                    </div>
                    {invoice.sent_to_email && (
                      <div className="col-span-2">
                        <span className="block">Gönderildi:</span>
                        <span className="text-green-300">
                          <Mail className="w-3 h-3 inline mr-1" />
                          {invoice.sent_to_email} ({formatDate(invoice.sent_at)})
                        </span>
                      </div>
                    )}
                  </div>

                  {invoice.invoice_status === 'APPROVED' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownloadInvoicePDF(invoice.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF İndir
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleResendInvoiceEmail(invoice.id)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        E-posta Gönder
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCancelInvoice(invoice.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        İptal Et
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">Henüz e-fatura oluşturulmamış</p>
              {order.status !== 'Faturalandı' && (
                <Button
                  size="sm"
                  onClick={() => setShowUyumsoftModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  İlk Faturayı Oluştur
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

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
          setMailSubject('')
          setMailMessage('')
        }}
        title="📧 Sipariş Maili Gönder"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowMailModal(false)
                setRecipientEmail('')
                setMailSubject('')
                setMailMessage('')
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
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konu
            </label>
            <Input
              type="text"
              value={mailSubject}
              onChange={(e) => setMailSubject(e.target.value)}
              placeholder={`Sipariş #${order?.id} - ${order?.nereden} → ${order?.nereye}`}
              disabled={sendingMail}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mesaj
            </label>
            <TextArea
              value={mailMessage}
              onChange={(e) => setMailMessage(e.target.value)}
              placeholder="İsteğe bağlı ek mesajınızı buraya yazabilirsiniz..."
              disabled={sendingMail}
              rows={4}
            />
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📄 Mail İçeriği</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sipariş detayları (HTML format)</li>
              <li>• Müşteri ve güzergah bilgileri</li>
              <li>• Finansal özet</li>
              <li>• PDF eki (Sipariş belgesi)</li>
              {mailMessage && <li>• Özel mesajınız</li>}
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
      
      {/* Uyumsoft Fatura Modal */}
      <Modal
        isOpen={showUyumsoftModal}
        onClose={() => setShowUyumsoftModal(false)}
        title={`🧾 ${invoiceType === 'EARCHIVE' ? 'E-Arşiv' : 'E-Fatura'} Oluştur`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowUyumsoftModal(false)} disabled={creatingInvoice}>
              İptal
            </Button>
            <Button onClick={handleCreateInvoice} disabled={creatingInvoice}>
              {creatingInvoice ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Fatura Oluştur
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Fatura Tipi Seçimi */}
          <div className="flex gap-3">
            <button
              onClick={() => setInvoiceType('EARCHIVE')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                invoiceType === 'EARCHIVE'
                  ? 'bg-green-500/20 border-green-500 text-green-300'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <Receipt className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold text-sm">E-Arşiv</p>
              <p className="text-xs mt-1">Bireysel Müşteri</p>
            </button>
            <button
              onClick={() => setInvoiceType('EINVOICE')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                invoiceType === 'EINVOICE'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <Building2 className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold text-sm">E-Fatura</p>
              <p className="text-xs mt-1">Kurumsal Müşteri</p>
            </button>
          </div>

          {/* Müşteri Bilgileri */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              {invoiceType === 'EARCHIVE' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              Müşteri Bilgileri
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Müşteri Adı *</label>
              <Input
                type="text"
                value={invoiceForm.customerName}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                placeholder="ABC Nakliyat"
              />
            </div>

            {invoiceType === 'EINVOICE' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vergi Numarası *</label>
                  <Input
                    type="text"
                    value={invoiceForm.customerTaxNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customerTaxNumber: e.target.value })}
                    placeholder="1234567890"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vergi Dairesi *</label>
                  <Input
                    type="text"
                    value={invoiceForm.customerTaxOffice}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customerTaxOffice: e.target.value })}
                    placeholder="Kadıköy"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">TC Kimlik No (Opsiyonel)</label>
                <Input
                  type="text"
                  value={invoiceForm.customerIdNumber}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerIdNumber: e.target.value })}
                  placeholder="12345678901"
                  maxLength={11}
                />
                <p className="text-xs text-gray-400 mt-1">
                  TC kimlik no girmezseniz genel fatura kesilir
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                <Input
                  type="email"
                  value={invoiceForm.customerEmail}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                  placeholder="musteri@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
                <Input
                  type="tel"
                  value={invoiceForm.customerPhone}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })}
                  placeholder="0532 xxx xx xx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Adres (Opsiyonel)</label>
              <Input
                type="text"
                value={invoiceForm.customerAddress}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customerAddress: e.target.value })}
                placeholder="Müşteri adresi"
              />
            </div>
          </div>

          {/* Fatura Bilgileri */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Fatura Bilgileri
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hizmet Açıklaması *</label>
              <Input
                type="text"
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                placeholder="Nakliye hizmeti"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tutar (KDV Hariç) *</label>
                <Input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  placeholder="15000"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">KDV Oranı (%)</label>
                <select
                  value={invoiceForm.vatRate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, vatRate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="0">%0</option>
                  <option value="1">%1</option>
                  <option value="10">%10</option>
                  <option value="20">%20</option>
                </select>
              </div>
            </div>

            {/* Toplam Hesaplama */}
            {invoiceForm.amount && parseFloat(invoiceForm.amount) > 0 && (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Ara Toplam:</span>
                  <span className="text-white">{formatCurrency(parseFloat(invoiceForm.amount))}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">KDV ({invoiceForm.vatRate}%):</span>
                  <span className="text-white">
                    {formatCurrency(parseFloat(invoiceForm.amount) * parseFloat(invoiceForm.vatRate) / 100)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700">
                  <span className="text-white">TOPLAM:</span>
                  <span className="text-green-400">
                    {formatCurrency(parseFloat(invoiceForm.amount) * (1 + parseFloat(invoiceForm.vatRate) / 100))}
                  </span>
                </div>
              </div>
            )}

            {/* Otomatik E-posta */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={invoiceForm.autoSendEmail}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, autoSendEmail: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600"
              />
              <span className="text-gray-300">Faturayı müşteriye otomatik olarak e-posta ile gönder</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* WhatsApp Modal */}
      <Modal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        title="💬 WhatsApp Mesajı Gönder"
      >
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-gray-300 font-medium mb-1">
              📱 Alıcı: {order?.musteri || 'Müşteri'}
            </p>
            <p className="text-xs text-gray-400">
              Telefon numarası sipariş bilgilerinden otomatik olarak alınacak: <span className="font-mono text-green-400">{order?.telefon || 'Numara bulunamadı'}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mesaj (Opsiyonel)
            </label>
            <TextArea
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              placeholder="Özel mesaj yazabilirsiniz veya boş bırakarak varsayılan şablonu kullanabilirsiniz..."
              rows={4}
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-xs text-gray-400">
              💡 Boş bırakırsanız varsayılan sipariş bilgilendirme mesajı gönderilir
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowWhatsAppModal(false)}
            >
              İptal
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={sendingWhatsApp}
              className="bg-green-600 hover:bg-green-700"
            >
              {sendingWhatsApp ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Gönder
                </>
              )}
            </Button>
          </div>
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

