import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            {label}
            {props.required && <span style={{ color: '#FF453A' }} className="ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 border transition-all cursor-pointer ${className}`}
          style={{
            backgroundColor: '#2C2C2E',
            color: '#FFFFFF',
            borderColor: error ? 'rgba(255, 69, 58, 0.5)' : 'rgba(84, 84, 88, 0.65)',
            outlineColor: error ? 'rgba(255, 69, 58, 0.5)' : 'rgba(10, 132, 255, 0.5)',
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} style={{ backgroundColor: '#2C2C2E', color: '#FFFFFF' }}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-2 text-sm flex items-center" style={{ color: '#FF453A' }}>
          <span className="mr-1">⚠️</span>{error}
        </p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select

