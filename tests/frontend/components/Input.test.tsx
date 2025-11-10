/**
 * Frontend Component Tests - Input
 * 
 * React Testing Library ile Input component'inin test edilmesi
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, test, expect, jest } from '@jest/globals'

// Input component'ini import et
import Input from '../../../src/components/Input'

describe('Input Component Tests', () => {
  test('input render edilmeli', () => {
    render(<Input placeholder="Test Input" />)
    
    const input = screen.getByPlaceholderText('Test Input')
    expect(input).toBeInTheDocument()
  })

  test('label görünmeli', () => {
    render(<Input label="Test Label" />)
    
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  test('value prop çalışmalı', () => {
    render(<Input value="test value" onChange={() => {}} />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('test value')
  })

  test('onChange handler çalışmalı', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  test('disabled prop çalışmalı', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  test('required prop çalışmalı', () => {
    render(<Input required />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  test('type prop doğru çalışmalı', () => {
    const { rerender } = render(<Input type="text" />)
    
    let input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'text')
    
    rerender(<Input type="email" />)
    input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    
    rerender(<Input type="number" />)
    input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  test('error message görünmeli', () => {
    render(<Input error="Bu alan zorunludur" />)
    
    expect(screen.getByText('Bu alan zorunludur')).toBeInTheDocument()
  })

  test('error olduğunda kırmızı border olmalı', () => {
    render(<Input error="Error message" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  test('maxLength prop çalışmalı', () => {
    render(<Input maxLength={10} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  test('placeholder prop çalışmalı', () => {
    render(<Input placeholder="Enter text..." />)
    
    const input = screen.getByPlaceholderText('Enter text...')
    expect(input).toBeInTheDocument()
  })

  test('custom className eklenebilmeli', () => {
    render(<Input className="custom-input" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  test('onFocus ve onBlur handler çalışmalı', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  test('Türkçe karakter desteği olmalı', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Türkçe Öğüşçı İşlem' } })
    
    expect(handleChange).toHaveBeenCalled()
  })
})

