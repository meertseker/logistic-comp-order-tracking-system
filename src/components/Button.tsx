import React, { ReactNode, ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden'
  
  const variantStyles = {
    primary: 'shadow-lg',
    secondary: 'border',
    danger: 'shadow-lg',
    success: 'shadow-lg',
  }
  
  const variantColors: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #0A84FF 0%, #007AFF 100%)',
      color: '#FFFFFF',
      boxShadow: '0 4px 14px 0 rgba(10, 132, 255, 0.4)',
    },
    secondary: {
      backgroundColor: 'rgba(44, 44, 46, 0.8)',
      backdropFilter: 'blur(10px)',
      color: '#FFFFFF',
      borderColor: 'rgba(84, 84, 88, 0.35)',
      boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.3)',
    },
    danger: {
      background: 'linear-gradient(135deg, #FF453A 0%, #FF3B30 100%)',
      color: '#FFFFFF',
      boxShadow: '0 4px 14px 0 rgba(255, 69, 58, 0.4)',
    },
    success: {
      background: 'linear-gradient(135deg, #30D158 0%, #34C759 100%)',
      color: '#FFFFFF',
      boxShadow: '0 4px 14px 0 rgba(48, 209, 88, 0.4)',
    },
  }

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: {
      boxShadow: '0 6px 20px 0 rgba(10, 132, 255, 0.5)',
      transform: 'translateY(-2px)',
    },
    secondary: {
      backgroundColor: 'rgba(58, 58, 60, 0.9)',
      transform: 'translateY(-2px)',
    },
    danger: {
      boxShadow: '0 6px 20px 0 rgba(255, 69, 58, 0.5)',
      transform: 'translateY(-2px)',
    },
    success: {
      boxShadow: '0 6px 20px 0 rgba(48, 209, 88, 0.5)',
      transform: 'translateY(-2px)',
    },
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const widthStyle = fullWidth ? 'w-full' : ''
  
  return (
    <motion.button
      whileHover={props.disabled ? {} : hoverStyles[variant]}
      whileTap={props.disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      style={variantColors[variant]}
      {...props}
    >
      {/* Shine effect */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          transform: 'skewX(-20deg)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

