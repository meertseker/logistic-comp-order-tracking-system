interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (totalPages <= 1) return null

  const pages = []
  const maxPagesToShow = 5

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 glass-card rounded-lg" style={{ border: '0.5px solid rgba(84, 84, 88, 0.65)' }}>
      <div className="flex items-center">
        <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
          <span className="font-medium" style={{ color: '#FFFFFF' }}>{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span>
          {' '}-{' '}
          <span className="font-medium" style={{ color: '#FFFFFF' }}>{Math.min(currentPage * itemsPerPage, totalItems)}</span>
          {' '}/ {totalItems}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: '#2C2C2E',
            color: currentPage === 1 ? 'rgba(235, 235, 245, 0.3)' : '#FFFFFF',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            borderColor: 'rgba(84, 84, 88, 0.65)',
          }}
        >
          Önceki
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
              style={{ backgroundColor: '#2C2C2E', color: 'rgba(235, 235, 245, 0.6)' }}
            >
              1
            </button>
            {startPage > 2 && <span className="px-2" style={{ color: 'rgba(235, 235, 245, 0.3)' }}>...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: page === currentPage ? '#0A84FF' : '#2C2C2E',
              color: page === currentPage ? '#FFFFFF' : 'rgba(235, 235, 245, 0.6)',
            }}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2" style={{ color: 'rgba(235, 235, 245, 0.3)' }}>...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
              style={{ backgroundColor: '#2C2C2E', color: 'rgba(235, 235, 245, 0.6)' }}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: '#2C2C2E',
            color: currentPage === totalPages ? 'rgba(235, 235, 245, 0.3)' : '#FFFFFF',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
          }}
        >
          Sonraki
        </button>
      </div>
    </div>
  )
}

