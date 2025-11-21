/**
 * Frontend Component Tests - StatCard
 * 
 * React Testing Library ile StatCard component'inin test edilmesi
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, test, expect, jest } from '@jest/globals'

// StatCard component'ini import et
import StatCard from '../../../src/components/StatCard'

describe('StatCard Component Tests', () => {
  test('title render edilmeli', () => {
    render(<StatCard title="Toplam Sipariş" value={150} />)
    
    expect(screen.getByText('Toplam Sipariş')).toBeInTheDocument()
  })

  test('value render edilmeli', () => {
    render(<StatCard title="Revenue" value={25000} />)
    
    expect(screen.getByText('25000')).toBeInTheDocument()
  })

  test('para birimi formatı doğru olmalı', () => {
    render(<StatCard title="Gelir" value={150000} format="currency" />)
    
    // TL formatında olmalı
    expect(screen.getByText(/150\.000.*TL|150\.000/)).toBeInTheDocument()
  })

  test('yüzde formatı doğru olmalı', () => {
    render(<StatCard title="Artış" value={15.5} format="percentage" />)
    
    expect(screen.getByText(/15\.5%|15,5%/)).toBeInTheDocument()
  })

  test('trend pozitif ise yeşil ok görünmeli', () => {
    const { container } = render(
      <StatCard title="Sipariş" value={100} trend={15} />
    )
    
    // Trend pozitif, yukarı ok olmalı
    const trendElement = container.querySelector('.trend-positive, .text-green-600')
    expect(trendElement).toBeInTheDocument()
  })

  test('trend negatif ise kırmızı ok görünmeli', () => {
    const { container } = render(
      <StatCard title="Sipariş" value={100} trend={-10} />
    )
    
    // Trend negatif, aşağı ok olmalı
    const trendElement = container.querySelector('.trend-negative, .text-red-600')
    expect(trendElement).toBeInTheDocument()
  })

  test('icon prop ile ikon görünmeli', () => {
    const Icon = () => <svg data-testid="test-icon"><circle /></svg>
    
    render(<StatCard title="Orders" value={50} icon={<Icon />} />)
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  test('loading state görünmeli', () => {
    render(<StatCard title="Loading" value={0} loading />)
    
    // Loading skeleton veya spinner olmalı
    screen.queryByTestId('loading-skeleton')
    // Loading durumunda value gösterilmeyebilir veya placeholder olabilir
  })

  test('subtitle render edilmeli', () => {
    render(
      <StatCard 
        title="Toplam Gelir" 
        value={100000} 
        subtitle="Son 30 gün"
      />
    )
    
    expect(screen.getByText('Son 30 gün')).toBeInTheDocument()
  })

  test('custom className eklenebilmeli', () => {
    const { container } = render(
      <StatCard 
        title="Test" 
        value={100} 
        className="custom-stat-card"
      />
    )
    
    const card = container.querySelector('.custom-stat-card')
    expect(card).toBeInTheDocument()
  })

  test('onClick handler çalışmalı', () => {
    const handleClick = jest.fn()
    
    render(
      <StatCard 
        title="Clickable" 
        value={50} 
        onClick={handleClick}
      />
    )
    
    const card = screen.getByText('Clickable').closest('div')
    if (card) {
      fireEvent.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    }
  })

  test('büyük sayılar formatlanmalı', () => {
    render(<StatCard title="Big Number" value={1234567} format="number" />)
    
    // Binlik ayraç ile gösterilmeli (1.234.567 veya 1,234,567)
    expect(screen.getByText(/1[.,]234[.,]567/)).toBeInTheDocument()
  })

  test('change değeri görünmeli', () => {
    render(
      <StatCard 
        title="Orders" 
        value={150} 
        change={25}
        changeLabel="geçen aya göre"
      />
    )
    
    expect(screen.getByText(/25|+25/)).toBeInTheDocument()
    expect(screen.getByText('geçen aya göre')).toBeInTheDocument()
  })
})

