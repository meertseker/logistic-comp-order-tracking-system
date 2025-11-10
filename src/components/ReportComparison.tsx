import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

interface ComparisonData {
  period1: {
    label: string
    earnings: number
    costs: number
    expenses: number
    netIncome: number
    orderCount: number
  }
  period2: {
    label: string
    earnings: number
    costs: number
    expenses: number
    netIncome: number
    orderCount: number
  }
}

interface ReportComparisonProps {
  data: ComparisonData
}

export default function ReportComparison({ data }: ReportComparisonProps) {
  const calculateChange = (oldValue: number, newValue: number) => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0
    return ((newValue - oldValue) / oldValue) * 100
  }

  const renderChangeIndicator = (change: number) => {
    const isPositive = change > 0
    const isNeutral = Math.abs(change) < 0.1
    
    if (isNeutral) {
      return (
        <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
          <Minus className="w-3 h-3" />
          <span>Değişmedi</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 text-xs" style={{ color: isPositive ? '#30D158' : '#FF453A' }}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
      </div>
    )
  }

  const ComparisonRow = ({ 
    label, 
    value1, 
    value2, 
    format = 'currency',
    reverseColor = false 
  }: { 
    label: string
    value1: number
    value2: number
    format?: 'currency' | 'number'
    reverseColor?: boolean
  }) => {
    const change = calculateChange(value1, value2)
    const isPositive = reverseColor ? change < 0 : change > 0
    
    return (
      <div className="flex items-center justify-between py-3 border-b border-opacity-10" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }}>
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{label}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right min-w-[100px]">
            <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              {format === 'currency' ? formatCurrency(value1) : value1.toLocaleString('tr-TR')}
            </p>
          </div>
          <ArrowRight className="w-4 h-4" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
          <div className="text-right min-w-[100px]">
            <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              {format === 'currency' ? formatCurrency(value2) : value2.toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="min-w-[80px] text-right">
            {renderChangeIndicator(change)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
            Karşılaştırmalı Analiz
          </h3>
          <p className="text-sm mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            {data.period1.label} vs {data.period2.label}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl"
          style={{ background: 'rgba(48, 209, 88, 0.1)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(48, 209, 88, 0.8)' }}>Gelir Değişimi</p>
          <p className="text-xl font-bold" style={{ color: '#30D158' }}>
            {calculateChange(data.period1.earnings, data.period2.earnings) > 0 ? '+' : ''}
            {calculateChange(data.period1.earnings, data.period2.earnings).toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl"
          style={{ background: 'rgba(255, 69, 58, 0.1)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(255, 69, 58, 0.8)' }}>Maliyet Değişimi</p>
          <p className="text-xl font-bold" style={{ color: '#FF453A' }}>
            {calculateChange(data.period1.costs, data.period2.costs) > 0 ? '+' : ''}
            {calculateChange(data.period1.costs, data.period2.costs).toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl"
          style={{ background: 'rgba(10, 132, 255, 0.1)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(10, 132, 255, 0.8)' }}>Kar Değişimi</p>
          <p className="text-xl font-bold" style={{ color: '#0A84FF' }}>
            {calculateChange(data.period1.netIncome, data.period2.netIncome) > 0 ? '+' : ''}
            {calculateChange(data.period1.netIncome, data.period2.netIncome).toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl"
          style={{ background: 'rgba(191, 90, 242, 0.1)', border: '0.5px solid rgba(191, 90, 242, 0.3)' }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(191, 90, 242, 0.8)' }}>Sipariş Değişimi</p>
          <p className="text-xl font-bold" style={{ color: '#BF5AF2' }}>
            {calculateChange(data.period1.orderCount, data.period2.orderCount) > 0 ? '+' : ''}
            {calculateChange(data.period1.orderCount, data.period2.orderCount).toFixed(1)}%
          </p>
        </motion.div>
      </div>

      {/* Detailed Comparison */}
      <div className="space-y-2">
        <ComparisonRow
          label="Toplam Gelir"
          value1={data.period1.earnings}
          value2={data.period2.earnings}
        />
        <ComparisonRow
          label="Tahmini Maliyetler"
          value1={data.period1.costs}
          value2={data.period2.costs}
          reverseColor
        />
        <ComparisonRow
          label="Ek Giderler"
          value1={data.period1.expenses}
          value2={data.period2.expenses}
          reverseColor
        />
        <ComparisonRow
          label="Net Kar/Zarar"
          value1={data.period1.netIncome}
          value2={data.period2.netIncome}
        />
        <ComparisonRow
          label="Sipariş Sayısı"
          value1={data.period1.orderCount}
          value2={data.period2.orderCount}
          format="number"
        />
        <ComparisonRow
          label="Ortalama Sipariş Değeri"
          value1={data.period1.orderCount > 0 ? data.period1.earnings / data.period1.orderCount : 0}
          value2={data.period2.orderCount > 0 ? data.period2.earnings / data.period2.orderCount : 0}
        />
      </div>
    </motion.div>
  )
}

