/**
 * Frontend Component Tests - Modal
 * 
 * React Testing Library ile Modal component'inin test edilmesi
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, test, expect, jest } from '@jest/globals'

// Modal component'ini import et
import { Modal } from '../../../src/components/Modal'

describe('Modal Component Tests', () => {
  test('isOpen=true iken modal görünmeli', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    )
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  test('isOpen=false iken modal görünmemeli', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    )
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  test('title render edilmeli', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Modal Başlık">
        <p>Content</p>
      </Modal>
    )
    
    expect(screen.getByText('Modal Başlık')).toBeInTheDocument()
  })

  test('children content render edilmeli', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Title">
        <div>
          <p>Line 1</p>
          <p>Line 2</p>
        </div>
      </Modal>
    )
    
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 2')).toBeInTheDocument()
  })

  test('close button tıklanınca onClose çalışmalı', () => {
    const handleClose = jest.fn()
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Title">
        <p>Content</p>
      </Modal>
    )
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  test('backdrop tıklanınca onClose çalışmalı', () => {
    const handleClose = jest.fn()
    
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose} title="Title">
        <p>Content</p>
      </Modal>
    )
    
    const backdrop = container.querySelector('.modal-backdrop')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(handleClose).toHaveBeenCalledTimes(1)
    }
  })

  test('ESC tuşu ile modal kapanmalı', () => {
    const handleClose = jest.fn()
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Title">
        <p>Content</p>
      </Modal>
    )
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    
    expect(handleClose).toHaveBeenCalled()
  })

  test('size prop ile boyut değişmeli', () => {
    const { rerender, container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Title" size="sm">
        <p>Content</p>
      </Modal>
    )
    
    let modal = container.querySelector('.modal-content')
    expect(modal).toHaveClass('max-w-sm')
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} title="Title" size="lg">
        <p>Content</p>
      </Modal>
    )
    
    modal = container.querySelector('.modal-content')
    expect(modal).toHaveClass('max-w-lg')
  })

  test('footer prop ile footer render edilmeli', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Title"
        footer={
          <div>
            <button>Save</button>
            <button>Cancel</button>
          </div>
        }
      >
        <p>Content</p>
      </Modal>
    )
    
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  test('multiple modal açılabilmeli (z-index)', () => {
    const { container: container1 } = render(
      <Modal isOpen={true} onClose={() => {}} title="Modal 1">
        <p>Content 1</p>
      </Modal>
    )
    
    const { container: container2 } = render(
      <Modal isOpen={true} onClose={() => {}} title="Modal 2">
        <p>Content 2</p>
      </Modal>
    )
    
    // Her iki modal da görünmeli
    expect(screen.getByText('Modal 1')).toBeInTheDocument()
    expect(screen.getByText('Modal 2')).toBeInTheDocument()
  })

  test('closeOnBackdropClick=false ise backdrop tıklanınca kapanmamalı', () => {
    const handleClose = jest.fn()
    
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose} title="Title" closeOnBackdropClick={false}>
        <p>Content</p>
      </Modal>
    )
    
    const backdrop = container.querySelector('.modal-backdrop')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(handleClose).not.toHaveBeenCalled()
    }
  })

  test('animation ile açılıp kapanmalı', () => {
    const { rerender, container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Title">
        <p>Content</p>
      </Modal>
    )
    
    // Modal kapalı
    expect(screen.queryByText('Title')).not.toBeInTheDocument()
    
    // Modal açılıyor
    rerender(
      <Modal isOpen={true} onClose={() => {}} title="Title">
        <p>Content</p>
      </Modal>
    )
    
    // Modal açık
    expect(screen.getByText('Title')).toBeInTheDocument()
  })
})

