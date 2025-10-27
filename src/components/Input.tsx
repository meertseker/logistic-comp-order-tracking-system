import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
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
          <input
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={`w-full px-4 py-3 rounded-xl focus:outline-none border transition-all duration-200 ${className}`}
            style={{
              backgroundColor: 'rgba(44, 44, 46, 0.8)',
              backdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              borderColor: error ? 'rgba(255, 69, 58, 0.5)' : isFocused ? 'rgba(10, 132, 255, 0.5)' : 'rgba(84, 84, 88, 0.35)',
              boxShadow: isFocused ? '0 0 0 4px rgba(10, 132, 255, 0.1)' : 'none',
            }}
            {...props}
          />
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
        {helperText && !error && (
          <p className="mt-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.4)' }}>{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

