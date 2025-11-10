import { useState } from 'react'
import { Download, Image, FileText, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ChartExportControlsProps {
  chartId: string
  chartTitle: string
  onExport?: (format: string) => void
}

export default function ChartExportControls({ chartId, chartTitle, onExport }: ChartExportControlsProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [exporting, setExporting] = useState(false)

  const exportAsPNG = async () => {
    try {
      setExporting(true)
      const element = document.getElementById(chartId)
      if (!element) throw new Error('Chart element not found')

      const canvas = await html2canvas(element, {
        backgroundColor: '#1C1C1E',
        scale: 2, // High quality
        logging: false,
        useCORS: true
      })

      const link = document.createElement('a')
      link.download = `${chartTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      onExport?.('png')
      setShowMenu(false)
    } catch (error) {
      console.error('Error exporting chart as PNG:', error)
      alert('Grafik dışa aktarılırken hata oluştu')
    } finally {
      setExporting(false)
    }
  }

  const exportAsPDF = async () => {
    try {
      setExporting(true)
      const element = document.getElementById(chartId)
      if (!element) throw new Error('Chart element not found')

      const canvas = await html2canvas(element, {
        backgroundColor: '#1C1C1E',
        scale: 2,
        logging: false,
        useCORS: true
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`${chartTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)

      onExport?.('pdf')
      setShowMenu(false)
    } catch (error) {
      console.error('Error exporting chart as PDF:', error)
      alert('Grafik dışa aktarılırken hata oluştu')
    } finally {
      setExporting(false)
    }
  }

  const exportAsSVG = async () => {
    try {
      setExporting(true)
      const element = document.getElementById(chartId)
      if (!element) throw new Error('Chart element not found')

      // SVG export için alternatif yöntem
      const svgElements = element.querySelectorAll('svg')
      if (svgElements.length === 0) {
        throw new Error('No SVG element found in chart')
      }

      const svgData = new XMLSerializer().serializeToString(svgElements[0])
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.download = `${chartTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.svg`
      link.href = url
      link.click()

      URL.revokeObjectURL(url)
      onExport?.('svg')
      setShowMenu(false)
    } catch (error) {
      console.error('Error exporting chart as SVG:', error)
      alert('SVG export desteklenmiyor, PNG veya PDF kullanın')
    } finally {
      setExporting(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      setExporting(true)
      const element = document.getElementById(chartId)
      if (!element) throw new Error('Chart element not found')

      const canvas = await html2canvas(element, {
        backgroundColor: '#1C1C1E',
        scale: 2,
        logging: false,
        useCORS: true
      })

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            alert('Grafik panoya kopyalandı!')
            onExport?.('clipboard')
          } catch (err) {
            console.error('Clipboard error:', err)
            alert('Panoya kopyalama desteklenmiyor')
          }
        }
      })
      setShowMenu(false)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      alert('Panoya kopyalama sırasında hata oluştu')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className="p-2 rounded-lg transition-all"
        style={{
          background: 'rgba(99, 102, 241, 0.12)',
          border: '0.5px solid rgba(99, 102, 241, 0.3)',
          color: '#FFFFFF'
        }}
        title="Export Chart"
      >
        {exporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: '#6366F1' }} />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl z-50"
            style={{
              background: 'rgba(28, 28, 30, 0.95)',
              border: '0.5px solid rgba(235, 235, 245, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="p-2 space-y-1">
              <motion.button
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                onClick={exportAsPNG}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                style={{ color: '#FFFFFF' }}
              >
                <Image className="w-4 h-4" />
                <span>PNG olarak kaydet</span>
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                onClick={exportAsPDF}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                style={{ color: '#FFFFFF' }}
              >
                <FileText className="w-4 h-4" />
                <span>PDF olarak kaydet</span>
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                onClick={exportAsSVG}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                style={{ color: '#FFFFFF' }}
              >
                <Image className="w-4 h-4" />
                <span>SVG olarak kaydet</span>
              </motion.button>

              <div className="border-t my-1" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }} />

              <motion.button
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                onClick={copyToClipboard}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                style={{ color: '#FFFFFF' }}
              >
                <Share2 className="w-4 h-4" />
                <span>Panoya kopyala</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

