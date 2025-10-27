import { SelectHTMLAttributes, forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold mb-2 transition-colors" style={{ color: isFocused ? '#0A84FF' : 'rgba(235, 235, 245, 0.6)' }}>
            {label}
            {props.required && <span style={{ color: '#FF453A' }} className="ml-1">*</span>}
          </label>
        )}
        <motion.div
          animate={{ 
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <select
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={`w-full px-4 py-3 rounded-xl focus:outline-none border transition-all duration-200 cursor-pointer ${className}`}
            style={{
              backgroundColor: 'rgba(44, 44, 46, 0.8)',
              backdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              borderColor: error ? 'rgba(255, 69, 58, 0.5)' : isFocused ? 'rgba(10, 132, 255, 0.5)' : 'rgba(84, 84, 88, 0.35)',
              boxShadow: isFocused ? '0 0 0 4px rgba(10, 132, 255, 0.1)' : 'none',
            }}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} style={{ backgroundColor: '#2C2C2E', color: '#FFFFFF' }}>
                {option.label}
              </option>
            ))}
          </select>
        </motion.div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm flex items-center"
              style={{ color: '#FF453A' }}
            >
              <span className="mr-1">⚠️</span>{error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select

