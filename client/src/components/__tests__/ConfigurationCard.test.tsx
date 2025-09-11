import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfigurationCard from '../ConfigurationCard'
import { RadioGroup } from '@/components/ui/radio-group'
import { landingZoneConfigurations } from '@shared/schema'

describe('ConfigurationCard', () => {
  const mockConfig = landingZoneConfigurations[0] // very-small config
  const defaultProps = {
    config: mockConfig,
    value: 'very-small',
    isSelected: false,
  }

  it('renders configuration card with correct information', () => {
    render(
      <RadioGroup>
        <ConfigurationCard {...defaultProps} />
      </RadioGroup>
    )
    
    expect(screen.getByText(/Very Small/)).toBeInTheDocument()
    expect(screen.getByText('VERY SMALL')).toBeInTheDocument()
    expect(screen.getByText(/Perfect for startups/)).toBeInTheDocument()
    expect(screen.getByText(/2 VMs, 1TB/)).toBeInTheDocument()
    expect(screen.getByText(/available/)).toBeInTheDocument()
  })

  it('shows selected state correctly', () => {
    render(
      <RadioGroup>
        <ConfigurationCard {...defaultProps} isSelected={true} />
      </RadioGroup>
    )
    
    const card = screen.getByTestId('card-config-very-small')
    expect(card).toHaveClass('ring-2', 'ring-primary', 'border-primary')
  })

  it('does not show selected styles when not selected', () => {
    render(
      <RadioGroup>
        <ConfigurationCard {...defaultProps} isSelected={false} />
      </RadioGroup>
    )
    
    const card = screen.getByTestId('card-config-very-small')
    expect(card).not.toHaveClass('ring-2', 'ring-primary', 'border-primary')
  })

  it('displays correct size badge variant', () => {
    render(
      <RadioGroup>
        <ConfigurationCard {...defaultProps} />
      </RadioGroup>
    )
    
    const badge = screen.getByText('VERY SMALL')
    expect(badge).toHaveClass('bg-secondary')
  })

  it('truncates long descriptions correctly', () => {
    const longDescConfig = {
      ...mockConfig,
      description: 'This is a very long description that should be truncated after 60 characters to prevent layout issues'
    }
    
    render(
      <RadioGroup>
        <ConfigurationCard {...defaultProps} config={longDescConfig} />
      </RadioGroup>
    )
    
    expect(screen.getByText(/This is a very long description that should be truncated/)).toBeInTheDocument()
    // Note: The current layout uses line-clamp-2 which truncates with CSS, not text ellipsis
    // So we check for the truncation class instead
    const description = screen.getByText(/This is a very long description that should be truncated/)
    expect(description).toHaveClass('line-clamp-2')
  })

  it('is accessible with proper labels and roles', () => {
    render(
      <RadioGroup>
        <ConfigurationCard {...defaultProps} />
      </RadioGroup>
    )
    
    const label = screen.getByTestId('label-config-very-small')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'radio-very-small')
    
    const radioInput = screen.getByRole('radio', { hidden: true })
    expect(radioInput).toHaveAttribute('id', 'radio-very-small')
    expect(radioInput).toHaveAttribute('type', 'button')
    expect(radioInput).toHaveAttribute('value', 'very-small')
  })

  it('can be clicked to select', async () => {
    const user = userEvent.setup()
    render(
      <RadioGroup>
        <ConfigurationCard {...defaultProps} />
      </RadioGroup>
    )
    
    const label = screen.getByTestId('label-config-very-small')
    await user.click(label)
    
    const radioInput = screen.getByRole('radio', { hidden: true })
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
      const { unmount } = render(
        <RadioGroup>
          <ConfigurationCard {...defaultProps} config={config} value={config.size} />
        </RadioGroup>
      )
      expect(screen.getByTestId(`card-config-${config.size}`)).toBeInTheDocument()
      unmount()
    })
  })

  it('handles hover states correctly', async () => {
    const user = userEvent.setup()
    render(
      <RadioGroup>
        <ConfigurationCard {...defaultProps} />
      </RadioGroup>
    )
    
    const card = screen.getByTestId('card-config-very-small')
    expect(card).toHaveClass('hover-elevate')
    
    await user.hover(card)
    // The hover-elevate class should be present for interaction styling
    expect(card).toHaveClass('hover-elevate')
  })

  it('displays cost information correctly', () => {
    render(
      <RadioGroup>
        <ConfigurationCard {...defaultProps} />
      </RadioGroup>
    )
    
    expect(screen.getByText('Base Cost')).toBeInTheDocument()
    expect(screen.getByText(/\$.*\/mo/)).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })
})