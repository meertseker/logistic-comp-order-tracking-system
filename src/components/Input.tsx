import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            {label}
            {props.required && <span style={{ color: '#FF453A' }} className="ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 border transition-all placeholder-opacity-100 ${className}`}
          style={{
            backgroundColor: '#2C2C2E',
            color: '#FFFFFF',
            borderColor: error ? 'rgba(255, 69, 58, 0.5)' : 'rgba(84, 84, 88, 0.65)',
          }}
          {...props}
        />
        {error && <p className="mt-2 text-sm flex items-center" style={{ color: '#FF453A' }}>
          <span className="mr-1">⚠️</span>{error}
        </p>}
        {helperText && !error && (
          <p className="mt-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.3)' }}>{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

