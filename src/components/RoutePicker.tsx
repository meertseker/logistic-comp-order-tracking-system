import { useEffect, useMemo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Route, Clock, DollarSign, Bridge } from 'lucide-react'
import Input from './Input'
import Button from './Button'
import Modal from './Modal'
import { useToast } from '../context/ToastContext'

interface RoutePickerProps {
  from: string
  to: string
  onChange: (next: { from?: string; to?: string; gidisKm?: number; hgs?: number; kopru?: number; sure?: number }) => void
  disabled?: boolean
}

export default function RoutePicker({ from, to, onChange, disabled }: RoutePickerProps) {
  const { showToast } = useToast()
  const [routes, setRoutes] = useState<any[]>([])
  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')
  const [fromFocused, setFromFocused] = useState(false)
  const [toFocused, setToFocused] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newData, setNewData] = useState({ nereden: '', nereye: '', mesafeKm: '', hgsMaliyet: '', kopruMaliyet: '', sureSaat: '', notlar: '' })
  
  // Refs for positioning dropdowns
  const fromInputRef = useRef<HTMLDivElement>(null)
  const toInputRef = useRef<HTMLDivElement>(null)
  const fromDropdownRef = useRef<HTMLDivElement>(null)
  const toDropdownRef = useRef<HTMLDivElement>(null)
  const fromClickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const toClickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await window.electronAPI.db.getRoutes()
        setRoutes(data)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  // Unique city lists
  const cities = useMemo(() => {
    const set = new Set<string>()
    routes.forEach(r => { set.add(r.nereden); set.add(r.nereye) })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'))
  }, [routes])

  const suggestionsFrom = useMemo(() => {
    let availableCities: string[]
    
    // Eğer "to" seçilmişse, sadece o şehre giden güzergahların çıkış noktalarını göster
    if (to) {
      const citiesWithRouteTo = routes
        .filter(r => r.nereye && r.nereye.toLowerCase() === to.toLowerCase())
        .map(r => r.nereden)
      availableCities = Array.from(new Set(citiesWithRouteTo))
    } else {
      // Eğer "to" seçilmemişse, tüm şehirleri göster
      availableCities = cities
    }
    
    const needle = searchFrom.trim().toLowerCase()
    const base = needle ? availableCities.filter(c => c.toLowerCase().includes(needle)) : availableCities
    return base.filter(c => c.toLowerCase() !== (from || '').toLowerCase()).slice(0, 10)
  }, [routes, cities, searchFrom, from, to])

  const suggestionsTo = useMemo(() => {
    let availableCities: string[]
    
    // Eğer "from" seçilmişse, sadece o şehirden giden güzergahların varış noktalarını göster
    if (from) {
      const citiesWithRouteFrom = routes
        .filter(r => r.nereden && r.nereden.toLowerCase() === from.toLowerCase())
        .map(r => r.nereye)
      availableCities = Array.from(new Set(citiesWithRouteFrom))
    } else {
      // Eğer "from" seçilmemişse, tüm şehirleri göster
      availableCities = cities
    }
    
    const needle = searchTo.trim().toLowerCase()
    const base = needle ? availableCities.filter(c => c.toLowerCase().includes(needle)) : availableCities
    return base.filter(c => c.toLowerCase() !== (to || '').toLowerCase()).slice(0, 10)
  }, [routes, cities, searchTo, to, from])

  // Update dropdown positions when they open
  useEffect(() => {
    if (fromFocused && fromInputRef.current && fromDropdownRef.current) {
      const rect = fromInputRef.current.getBoundingClientRect()
      fromDropdownRef.current.style.top = `${rect.bottom + 8}px`
      fromDropdownRef.current.style.left = `${rect.left}px`
      fromDropdownRef.current.style.width = `${rect.width}px`
    }
  }, [fromFocused, suggestionsFrom])

  useEffect(() => {
    if (toFocused && toInputRef.current && toDropdownRef.current) {
      const rect = toInputRef.current.getBoundingClientRect()
      toDropdownRef.current.style.top = `${rect.bottom + 8}px`
      toDropdownRef.current.style.left = `${rect.left}px`
      toDropdownRef.current.style.width = `${rect.width}px`
    }
  }, [toFocused, suggestionsTo])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromInputRef.current && !fromInputRef.current.contains(event.target as Node) &&
          fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setFromFocused(false)
      }
      if (toInputRef.current && !toInputRef.current.contains(event.target as Node) &&
          toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setToFocused(false)
      }
    }

    if (fromFocused || toFocused) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [fromFocused, toFocused])

  const tryAutofill = async (nf: string, nt: string) => {
    if (!nf || !nt) return
    try {
      const route = await window.electronAPI.db.getRoute(nf, nt)
      if (route) {
        onChange({ gidisKm: route.mesafe_km || 0, hgs: route.hgs_maliyet || 0, kopru: route.kopru_maliyet || 0, sure: route.sure_saat || 0 })
        showToast('Güzergah bilgileri otomatik dolduruldu', 'success')
      }
    } catch (e) {
      console.error('Autofill failed', e)
    }
  }

  const swap = () => {
    onChange({ from: to, to: from })
    setTimeout(() => tryAutofill(to, from), 0)
  }

  const handleFromSelect = (city: string) => {
    onChange({ from: city })
    setSearchFrom(city)
    setFromFocused(false)
    tryAutofill(city, to)
  }

  const handleToSelect = (city: string) => {
    onChange({ to: city })
    setSearchTo(city)
    setToFocused(false)
    tryAutofill(from, city)
  }

  const handleFromFocus = () => {
    if (fromClickTimeoutRef.current) {
      clearTimeout(fromClickTimeoutRef.current)
    }
    setFromFocused(true)
  }

  const handleFromBlur = () => {
    // Delay to allow click events to fire first
    fromClickTimeoutRef.current = setTimeout(() => {
      setFromFocused(false)
    }, 150)
  }

  const handleToFocus = () => {
    if (toClickTimeoutRef.current) {
      clearTimeout(toClickTimeoutRef.current)
    }
    setToFocused(true)
  }

  const handleToBlur = () => {
    // Delay to allow click events to fire first
    toClickTimeoutRef.current = setTimeout(() => {
      setToFocused(false)
    }, 150)
  }

  const saveNewRoute = async () => {
    if (!newData.nereden.trim() || !newData.nereye.trim()) {
      showToast('Nereden/Nereye zorunlu', 'error')
      return
    }
    try {
      await window.electronAPI.db.saveRoute({
        nereden: newData.nereden.trim(),
        nereye: newData.nereye.trim(),
        mesafeKm: Number(newData.mesafeKm) || 0,
        hgsMaliyet: Number(newData.hgsMaliyet) || 0,
        kopruMaliyet: Number(newData.kopruMaliyet) || 0,
        sureSaat: Number(newData.sureSaat) || 0,
        notlar: newData.notlar.trim(),
      })
      showToast('✅ Güzergah eklendi', 'success')
      setShowNewModal(false)
      // refresh local list
      const data = await window.electronAPI.db.getRoutes()
      setRoutes(data)
      // if matches current, autofill
      if (from && to && (from === newData.nereden && to === newData.nereye)) {
        tryAutofill(from, to)
      }
    } catch (e) {
      console.error(e)
      showToast('Güzergah kaydedilemedi', 'error')
    }
  }

  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div ref={fromInputRef} className="relative">
            <Input
              label="Nereden"
              name="from"
              value={from}
              onChange={(e) => { onChange({ from: e.target.value }); setSearchFrom(e.target.value) }}
              placeholder="İstanbul"
              disabled={disabled}
              onFocus={handleFromFocus}
              onBlur={handleFromBlur}
            />
          </div>
          <div className="flex items-end">
            <div className="flex w-full items-center justify-center">
              <Button type="button" variant="secondary" onClick={swap} disabled={disabled}>↕️ Değiştir</Button>
            </div>
          </div>
          <div ref={toInputRef} className="relative">
            <Input
              label="Nereye"
              name="to"
              value={to}
              onChange={(e) => { onChange({ to: e.target.value }); setSearchTo(e.target.value) }}
              placeholder="Ankara"
              disabled={disabled}
              onFocus={handleToFocus}
              onBlur={handleToBlur}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.3)' }}>Şehir seçince kayıtlı güzergah varsa km ve HGS otomatik dolar.</p>
          <Button type="button" size="sm" onClick={() => setShowNewModal(true)} disabled={disabled}>+ Yeni Güzergah</Button>
        </div>
      </div>

      {/* From Dropdown - iOS 26 Liquid Glass Style */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {fromFocused && suggestionsFrom.length > 0 && (
            <motion.div
              ref={fromDropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed z-[9999] max-h-[280px] overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(20, 20, 22, 0.85)',
                backdropFilter: 'saturate(180%) blur(40px)',
                WebkitBackdropFilter: 'saturate(180%) blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: `
                  0 20px 60px rgba(0, 0, 0, 0.6),
                  0 0 0 1px rgba(255, 255, 255, 0.08) inset,
                  0 0 80px rgba(10, 132, 255, 0.2)
                `,
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="overflow-y-auto max-h-[280px] scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {suggestionsFrom.map((c, index) => (
                  <motion.button
                    key={c}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="w-full text-left px-5 py-3.5 font-medium transition-all duration-200 relative group"
                    style={{ 
                      color: '#FFFFFF',
                      borderBottom: index < suggestionsFrom.length - 1 ? '0.5px solid rgba(84, 84, 88, 0.3)' : 'none'
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleFromSelect(c)
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span className="relative z-10">{c}</span>
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{
                        background: 'linear-gradient(90deg, rgba(10, 132, 255, 0.1) 0%, rgba(10, 132, 255, 0.05) 100%)',
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* To Dropdown - iOS 26 Liquid Glass Style */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {toFocused && suggestionsTo.length > 0 && (
            <motion.div
              ref={toDropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed z-[9999] max-h-[280px] overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(20, 20, 22, 0.85)',
                backdropFilter: 'saturate(180%) blur(40px)',
                WebkitBackdropFilter: 'saturate(180%) blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: `
                  0 20px 60px rgba(0, 0, 0, 0.6),
                  0 0 0 1px rgba(255, 255, 255, 0.08) inset,
                  0 0 80px rgba(10, 132, 255, 0.2)
                `,
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="overflow-y-auto max-h-[280px] scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {suggestionsTo.map((c, index) => (
                  <motion.button
                    key={c}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="w-full text-left px-5 py-3.5 font-medium transition-all duration-200 relative group"
                    style={{ 
                      color: '#FFFFFF',
                      borderBottom: index < suggestionsTo.length - 1 ? '0.5px solid rgba(84, 84, 88, 0.3)' : 'none'
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleToSelect(c)
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span className="relative z-10">{c}</span>
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{
                        background: 'linear-gradient(90deg, rgba(10, 132, 255, 0.1) 0%, rgba(10, 132, 255, 0.05) 100%)',
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Modal
        isOpen={showNewModal}
        onClose={() => {
          setShowNewModal(false)
          setNewData({ nereden: '', nereye: '', mesafeKm: '', hgsMaliyet: '', kopruMaliyet: '', sureSaat: '', notlar: '' })
        }}
        title="Yeni Güzergah Ekle"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setShowNewModal(false)
              setNewData({ nereden: '', nereye: '', mesafeKm: '', hgsMaliyet: '', kopruMaliyet: '', sureSaat: '', notlar: '' })
            }}>İptal</Button>
            <Button onClick={saveNewRoute}>Kaydet</Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Güzergah Bilgileri */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)' }}>
                <Route className="w-4 h-4" style={{ color: '#0A84FF' }} />
              </div>
              <h4 className="text-sm font-semibold" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Güzergah Bilgileri</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#0A84FF' }} />
                  <label className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Nereden *</label>
                </div>
                <Input 
                  name="nereden" 
                  value={newData.nereden} 
                  onChange={(e) => setNewData({ ...newData, nereden: e.target.value })} 
                  placeholder="İstanbul"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#30D158' }} />
                  <label className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Nereye *</label>
                </div>
                <Input 
                  name="nereye" 
                  value={newData.nereye} 
                  onChange={(e) => setNewData({ ...newData, nereye: e.target.value })} 
                  placeholder="Ankara"
                />
              </div>
            </div>
          </div>

          {/* Mesafe ve Süre */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(191, 90, 242, 0.15)' }}>
                <Clock className="w-4 h-4" style={{ color: '#BF5AF2' }} />
              </div>
              <h4 className="text-sm font-semibold" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Mesafe ve Süre</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Route className="w-3.5 h-3.5" style={{ color: '#BF5AF2' }} />
                  <label className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Mesafe (km)</label>
                </div>
                <Input 
                  name="mesafeKm" 
                  type="number" 
                  value={newData.mesafeKm} 
                  onChange={(e) => setNewData({ ...newData, mesafeKm: e.target.value })} 
                  placeholder="450"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5" style={{ color: '#BF5AF2' }} />
                  <label className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Süre (saat)</label>
                </div>
                <Input 
                  name="sureSaat" 
                  type="number" 
                  step="0.5" 
                  value={newData.sureSaat} 
                  onChange={(e) => setNewData({ ...newData, sureSaat: e.target.value })} 
                  placeholder="6"
                />
              </div>
            </div>
          </div>

          {/* Maliyet Bilgileri */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 214, 10, 0.15)' }}>
                <DollarSign className="w-4 h-4" style={{ color: '#FFD60A' }} />
              </div>
              <h4 className="text-sm font-semibold" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Maliyet Bilgileri</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bridge className="w-3.5 h-3.5" style={{ color: '#FFD60A' }} />
                  <label className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>HGS (₺)</label>
                </div>
                <Input 
                  name="hgsMaliyet" 
                  type="number" 
                  step="0.01" 
                  value={newData.hgsMaliyet} 
                  onChange={(e) => setNewData({ ...newData, hgsMaliyet: e.target.value })} 
                  placeholder="450.00"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bridge className="w-3.5 h-3.5" style={{ color: '#FFD60A' }} />
                  <label className="text-xs font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Köprü (₺)</label>
                </div>
                <Input 
                  name="kopruMaliyet" 
                  type="number" 
                  step="0.01" 
                  value={newData.kopruMaliyet} 
                  onChange={(e) => setNewData({ ...newData, kopruMaliyet: e.target.value })} 
                  placeholder="150.00"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}


