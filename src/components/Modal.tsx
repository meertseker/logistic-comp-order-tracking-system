import React, { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from './Icons'
import Button from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop - iOS 26 Style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
            onClick={onClose}
          />

          {/* Modal - iOS 26 Liquid Glass */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto rounded-3xl`}
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
              zIndex: 10001,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient Glow Effect */}
            <div 
              className="absolute top-0 left-0 right-0 h-32 rounded-t-3xl opacity-30 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(10, 132, 255, 0.2) 0%, transparent 100%)',
                filter: 'blur(40px)',
              }}
            />

            {/* Header - Modern iOS 26 Style */}
            <div 
              className="relative border-b p-5 sticky top-0"
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(28, 28, 30, 0.5)',
                backdropFilter: 'blur(20px)',
                zIndex: 10,
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>
                  {title}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-xl transition-all duration-200"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(235, 235, 245, 0.7)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 69, 58, 0.15)'
                    e.currentTarget.style.color = '#FF453A'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.color = 'rgba(235, 235, 245, 0.7)'
                  }}
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 relative" style={{ backgroundColor: 'rgba(20, 20, 22, 0.3)' }}>
              {children}
            </div>

            {/* Footer - Modern iOS 26 Style */}
            {footer && (
              <div 
                className="flex items-center justify-end gap-3 p-5 border-t sticky bottom-0"
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(28, 28, 30, 0.5)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

