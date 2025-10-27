import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  actions?: ReactNode
  hover?: boolean
  style?: React.CSSProperties
}

export default function Card({ children, className = '', title, actions, hover = true, style }: CardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-xl ${hover ? 'glass-hover' : ''} ${className}`}
      style={style}
    >
      {(title || actions) && (
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '0.5px solid rgba(84, 84, 88, 0.35)' }}>
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
    </motion.div>
  )
}

