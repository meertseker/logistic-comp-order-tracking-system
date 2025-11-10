import React, { ReactNode, useEffect } from 'react'
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

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`relative inline-block w-full ${sizeClasses[size]} my-8 overflow-hidden text-left align-middle transition-all transform glass-strong shadow-ios-lg rounded-2xl border border-white/10`}
        >
          {/* Header */}
          <div className="border-b border-white/10 p-5" style={{ backgroundColor: 'rgba(28, 28, 30, 0.5)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end space-x-3 p-5 border-t border-white/10" style={{ backgroundColor: 'rgba(28, 28, 30, 0.3)' }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

