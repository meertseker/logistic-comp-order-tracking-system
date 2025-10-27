import { useEffect, useMemo, useState } from 'react'
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
    const needle = searchFrom.trim().toLowerCase()
    const base = needle ? cities.filter(c => c.toLowerCase().includes(needle)) : cities
    return base.filter(c => c.toLowerCase() !== (from || '').toLowerCase())
  }, [cities, searchFrom, from])

  const suggestionsTo = useMemo(() => {
    const needle = searchTo.trim().toLowerCase()
    const base = needle ? cities.filter(c => c.toLowerCase().includes(needle)) : cities
    return base.filter(c => c.toLowerCase() !== (to || '').toLowerCase())
  }, [cities, searchTo, to])

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
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Input
            label="Nereden"
            name="from"
            value={from}
            onChange={(e) => { onChange({ from: e.target.value }); setSearchFrom(e.target.value) }}
            placeholder="İstanbul"
            disabled={disabled}
            onFocus={() => setFromFocused(true)}
            onBlur={() => setTimeout(() => setFromFocused(false), 120)}
          />
          {fromFocused && suggestionsFrom.length > 0 && (
            <div className="mt-2 max-h-40 overflow-auto rounded-xl border glass-strong backdrop-blur-2xl shadow-ios" style={{ borderColor: 'rgba(84, 84, 88, 0.65)' }}>
              {suggestionsFrom.slice(0, 8).map(c => (
                <button
                  type="button"
                  key={c}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors font-medium border-b last:border-0"
                  style={{ color: '#FFFFFF', borderColor: 'rgba(84, 84, 88, 0.35)' }}
                  onClick={() => { onChange({ from: c }); setSearchFrom(c); setFromFocused(false); tryAutofill(c, to) }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-end">
          <div className="flex w-full items-center justify-center">
            <Button type="button" variant="secondary" onClick={swap} disabled={disabled}>↕️ Değiştir</Button>
          </div>
        </div>
        <div>
          <Input
            label="Nereye"
            name="to"
            value={to}
            onChange={(e) => { onChange({ to: e.target.value }); setSearchTo(e.target.value) }}
            placeholder="Ankara"
            disabled={disabled}
            onFocus={() => setToFocused(true)}
            onBlur={() => setTimeout(() => setToFocused(false), 120)}
          />
          {toFocused && suggestionsTo.length > 0 && (
            <div className="mt-2 max-h-40 overflow-auto rounded-xl border glass-strong backdrop-blur-2xl shadow-ios" style={{ borderColor: 'rgba(84, 84, 88, 0.65)' }}>
              {suggestionsTo.slice(0, 8).map(c => (
                <button
                  type="button"
                  key={c}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors font-medium border-b last:border-0"
                  style={{ color: '#FFFFFF', borderColor: 'rgba(84, 84, 88, 0.35)' }}
                  onClick={() => { onChange({ to: c }); setSearchTo(c); setToFocused(false); tryAutofill(from, c) }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.3)' }}>Şehir seçince kayıtlı güzergah varsa km ve HGS otomatik dolar.</p>
        <Button type="button" size="sm" onClick={() => setShowNewModal(true)} disabled={disabled}>+ Yeni Güzergah</Button>
      </div>

      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Yeni Güzergah Ekle"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>İptal</Button>
            <Button onClick={saveNewRoute}>Kaydet</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nereden" name="nereden" value={newData.nereden} onChange={(e) => setNewData({ ...newData, nereden: e.target.value })} />
          <Input label="Nereye" name="nereye" value={newData.nereye} onChange={(e) => setNewData({ ...newData, nereye: e.target.value })} />
          <Input label="Mesafe (km)" name="mesafeKm" type="number" value={newData.mesafeKm} onChange={(e) => setNewData({ ...newData, mesafeKm: e.target.value })} />
          <Input label="Süre (saat)" name="sureSaat" type="number" step="0.5" value={newData.sureSaat} onChange={(e) => setNewData({ ...newData, sureSaat: e.target.value })} />
          <Input label="HGS (₺)" name="hgsMaliyet" type="number" step="0.01" value={newData.hgsMaliyet} onChange={(e) => setNewData({ ...newData, hgsMaliyet: e.target.value })} />
          <Input label="Köprü (₺)" name="kopruMaliyet" type="number" step="0.01" value={newData.kopruMaliyet} onChange={(e) => setNewData({ ...newData, kopruMaliyet: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}


