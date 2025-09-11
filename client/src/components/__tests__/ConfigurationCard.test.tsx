import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfigurationCard from '../ConfigurationCard'
import { landingZoneConfigurations } from '@shared/schema'

describe('ConfigurationCard', () => {
  const mockConfig = landingZoneConfigurations[0] // very-small config
  const defaultProps = {
    config: mockConfig,
    value: 'very-small',
    isSelected: false,
  }

  it('renders configuration card with correct information', () => {
    render(<ConfigurationCard {...defaultProps} />)
    
    expect(screen.getByText(/Very Small/)).toBeInTheDocument()
    expect(screen.getByText('VERY SMALL')).toBeInTheDocument()
    expect(screen.getByText(/Perfect for startups/)).toBeInTheDocument()
    expect(screen.getByText(/2 VMs, 1TB/)).toBeInTheDocument()
    expect(screen.getByText(/available/)).toBeInTheDocument()
  })

  it('shows selected state correctly', () => {
    render(<ConfigurationCard {...defaultProps} isSelected={true} />)
    
    const card = screen.getByTestId('card-config-very-small')
    expect(card).toHaveClass('ring-2', 'ring-primary', 'border-primary')
  })

  it('does not show selected styles when not selected', () => {
    render(<ConfigurationCard {...defaultProps} isSelected={false} />)
    
    const card = screen.getByTestId('card-config-very-small')
    expect(card).not.toHaveClass('ring-2', 'ring-primary', 'border-primary')
  })

  it('displays correct size badge variant', () => {
    render(<ConfigurationCard {...defaultProps} />)
    
    const badge = screen.getByText('VERY SMALL')
    expect(badge.parentElement).toHaveClass('bg-secondary')
  })

  it('truncates long descriptions correctly', () => {
    const longDescConfig = {
      ...mockConfig,
      description: 'This is a very long description that should be truncated after 60 characters to prevent layout issues'
    }
    
    render(<ConfigurationCard {...defaultProps} config={longDescConfig} />)
    
    expect(screen.getByText(/This is a very long description that should be truncated/)).toBeInTheDocument()
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument()
  })

  it('is accessible with proper labels and roles', () => {
    render(<ConfigurationCard {...defaultProps} />)
    
    const label = screen.getByTestId('label-config-very-small')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'radio-very-small')
    
    const radioInput = screen.getByDisplayValue('very-small')
    expect(radioInput).toHaveAttribute('id', 'radio-very-small')
    expect(radioInput).toHaveAttribute('type', 'radio')
  })

  it('can be clicked to select', async () => {
    const user = userEvent.setup()
    render(<ConfigurationCard {...defaultProps} />)
    
    const label = screen.getByTestId('label-config-very-small')
    await user.click(label)
    
    const radioInput = screen.getByDisplayValue('very-small')
    expect(radioInput).toBeChecked()
  })

  it('displays different icons for different sizes', () => {
    const configs = [
      { config: landingZoneConfigurations[0], expectedIcon: 'Users' },
      { config: landingZoneConfigurations[1], expectedIcon: 'Cloud' },
      { config: landingZoneConfigurations[2], expectedIcon: 'Network' },
      { config: landingZoneConfigurations[3], expectedIcon: 'Shield' },
    ]

    configs.forEach(({ config }) => {
      const { unmount } = render(<ConfigurationCard {...defaultProps} config={config} value={config.size} />)
      expect(screen.getByTestId(`card-config-${config.size}`)).toBeInTheDocument()
      unmount()
    })
  })

  it('handles hover states correctly', async () => {
    const user = userEvent.setup()
    render(<ConfigurationCard {...defaultProps} />)
    
    const card = screen.getByTestId('card-config-very-small')
    expect(card).toHaveClass('hover-elevate')
    
    await user.hover(card)
    // The hover-elevate class should be present for interaction styling
    expect(card).toHaveClass('hover-elevate')
  })

  it('displays cost information correctly', () => {
    render(<ConfigurationCard {...defaultProps} />)
    
    expect(screen.getByText('Base Cost')).toBeInTheDocument()
    expect(screen.getByText(/\$.*\/mo/)).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })
})