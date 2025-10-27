import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  actions?: ReactNode
  hover?: boolean
}

export default function Card({ children, className = '', title, actions, hover = true }: CardProps) {
  return (
    <div className={`glass-card rounded-xl ${hover ? 'glass-hover' : ''} ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
          {title && (
            <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
              {title}
            </h3>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

