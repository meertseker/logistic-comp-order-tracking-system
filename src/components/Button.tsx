import React, { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]'
  
  const variantStyles = {
    primary: 'shadow-ios',
    secondary: 'border',
    danger: 'shadow-ios',
    success: 'shadow-ios',
  }
  
  const variantColors: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#0A84FF',
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: '#2C2C2E',
      color: '#FFFFFF',
      borderColor: 'rgba(84, 84, 88, 0.65)',
    },
    danger: {
      backgroundColor: '#FF453A',
      color: '#FFFFFF',
    },
    success: {
      backgroundColor: '#30D158',
      color: '#FFFFFF',
    },
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  }
  
  const widthStyle = fullWidth ? 'w-full' : ''
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      style={variantColors[variant]}
      {...props}
    >
      {children}
    </button>
  )
}

