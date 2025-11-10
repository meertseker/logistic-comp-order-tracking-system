/**
 * Frontend Component Tests - Button
 * 
 * React Testing Library ile Button component'inin test edilmesi
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, test, expect, jest } from '@jest/globals'

// Button component'ini import et
import { Button } from '../../../src/components/Button'

describe('Button Component Tests', () => {
  test('button render edilmeli', () => {
    render(<Button>Test Button</Button>)
    
    const button = screen.getByRole('button', { name: /test button/i })
    expect(button).toBeInTheDocument()
  })

  test('children text görünmeli', () => {
    render(<Button>Click Me</Button>)
    
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  test('onClick handler çalışmalı', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('disabled prop çalışmalı', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick} disabled>Disabled</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })

  test('variant prop ile farklı stil uygulanmalı', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600')
    
    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-600')
    
    rerender(<Button variant="danger">Danger</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600')
  })

  test('size prop ile boyut değişmeli', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('text-sm')
    
    rerender(<Button size="md">Medium</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('text-base')
    
    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('text-lg')
  })

  test('loading prop ile loading state görünmeli', () => {
    render(<Button loading>Loading</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    // Loading spinner or text kontrolü
  })

  test('fullWidth prop ile full genişlik olmalı', () => {
    render(<Button fullWidth>Full Width</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full')
  })

  test('custom className eklenebilmeli', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  test('type prop doğru çalışmalı', () => {
    const { rerender } = render(<Button type="button">Button</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
    
    rerender(<Button type="submit">Submit</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})

