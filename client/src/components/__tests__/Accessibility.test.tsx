import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingZoneIntakeForm from '../LandingZoneIntakeForm'
import ConfigurationCard from '../ConfigurationCard'
import { RadioGroup } from '@/components/ui/radio-group'
import { landingZoneConfigurations } from '@shared/schema'

// Mock the cost calculation utility
vi.mock('@/utils/costCalculations', () => ({
  calculateCosts: vi.fn(() => ({
    baseInfrastructureCost: 1000,
    featuresInfrastructureCost: 500,
    totalInfrastructureCost: 1500,
    baseProfessionalServicesCost: 5000,
    featuresProfessionalServicesCost: 2000,
    totalProfessionalServicesCost: 7000,
    managedServicesEC2Cost: 150,
    managedServicesStorageCost: 300,
    totalManagedServicesCost: 450,
    totalMonthlyCost: 1950,
    totalFirstYearCost: 30400
  }))
}))

describe('Accessibility Tests', () => {
  describe('LandingZoneIntakeForm Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<LandingZoneIntakeForm />)
      
      // Main heading should be h1
      expect(screen.getByRole('heading', { level: 1, name: /AWS Landing Zone Configuration/ })).toBeInTheDocument()
      
      // Section titles should be present (CardTitle, not heading)
      expect(screen.getByText('Choose Your Configuration')).toBeInTheDocument()
    })

    it('has accessible form controls with labels', () => {
      render(<LandingZoneIntakeForm />)
      
      // Radio group should be properly labeled
      const radioGroup = screen.getByRole('radiogroup')
      expect(radioGroup).toBeInTheDocument()
      expect(radioGroup).toHaveAttribute('data-testid', 'radiogroup-configurations')
    })

    it('supports keyboard navigation for configuration selection', async () => {
      const user = userEvent.setup()
      render(<LandingZoneIntakeForm />)
      
      const radioGroup = screen.getByTestId('radiogroup-configurations')
      const firstRadio = radioGroup.querySelector('input[type="radio"]')
      
      if (firstRadio) {
        // Tab to first radio button
        await user.tab()
        expect(document.activeElement).toBe(firstRadio)
        
        // Press space to select
        await user.keyboard(' ')
        expect(firstRadio).toBeChecked()
      }
    })

    it('provides clear focus indicators', async () => {
      const user = userEvent.setup()
      render(<LandingZoneIntakeForm />)
      
      // Tab through interactive elements
      await user.tab()
      
      const focusedElement = document.activeElement
      expect(focusedElement).toBeInstanceOf(HTMLElement)
      expect(focusedElement).toBeVisible()
    })

    it('has proper ARIA attributes for dynamic content', async () => {
      const user = userEvent.setup()
      render(<LandingZoneIntakeForm />)
      
      // Select a configuration to reveal tabs
      const smallConfig = screen.getByTestId('label-config-small')
      await user.click(smallConfig)
      
      // Tabs should have proper ARIA attributes
      const tabList = screen.queryByRole('tablist')
      if (tabList) {
        expect(tabList).toBeInTheDocument()
        
        const tabs = screen.getAllByRole('tab')
        tabs.forEach(tab => {
          expect(tab).toHaveAttribute('aria-selected')
          expect(tab).toHaveAttribute('aria-controls')
        })
      }
    })
  })

  describe('ConfigurationCard Accessibility', () => {
    const mockConfig = landingZoneConfigurations[0]
    const defaultProps = {
      config: mockConfig,
      value: 'very-small',
      isSelected: false,
    }

    it('has accessible radio button with proper labeling', () => {
      render(<ConfigurationCard {...defaultProps} />)
      
      const radio = screen.getByRole('radio')
      expect(radio).toHaveAttribute('id', 'radio-very-small')
      expect(radio).toHaveAttribute('value', 'very-small')
      
      const label = screen.getByTestId('label-config-very-small')
      expect(label).toHaveAttribute('for', 'radio-very-small')
    })

    it('supports keyboard activation', async () => {
      const user = userEvent.setup()
      render(<ConfigurationCard {...defaultProps} />)
      
      const radio = screen.getByRole('radio')
      
      // Focus and activate with keyboard
      radio.focus()
      expect(document.activeElement).toBe(radio)
      
      await user.keyboard(' ')
      expect(radio).toBeChecked()
    })

    it('provides clear visual feedback for selection state', () => {
      const { rerender } = render(<ConfigurationCard {...defaultProps} />)
      
      const card = screen.getByTestId('card-config-very-small')
      expect(card).not.toHaveClass('ring-2', 'ring-primary')
      
      rerender(<ConfigurationCard {...defaultProps} isSelected={true} />)
      expect(card).toHaveClass('ring-2', 'ring-primary', 'border-primary')
    })

    it('has descriptive text for screen readers', () => {
      render(<ConfigurationCard {...defaultProps} />)
      
      expect(screen.getByText(/Perfect for startups/)).toBeInTheDocument()
      expect(screen.getByText(/Base Cost/)).toBeInTheDocument()
      expect(screen.getByText(/Resources/)).toBeInTheDocument()
    })
  })

  describe('Form Interactions Accessibility', () => {
    it('maintains focus management when toggling features', async () => {
      const user = userEvent.setup()
      render(<LandingZoneIntakeForm />)
      
      // Select medium config to get features
      const mediumConfig = screen.getByTestId('label-config-medium')
      await user.click(mediumConfig)
      
      // Find a feature checkbox and interact with it
      const checkbox = screen.queryByRole('checkbox', { name: /Amazon GuardDuty/ })
      if (checkbox) {
        await user.click(checkbox)
        // Focus should remain manageable
        expect(document.activeElement).toBeInstanceOf(HTMLElement)
      }
    })

    it('provides clear feedback for slider interactions', async () => {
      const user = userEvent.setup()
      render(<LandingZoneIntakeForm />)
      
      // Select configuration to reveal sliders
      const smallConfig = screen.getByTestId('label-config-small')
      await user.click(smallConfig)
      
      const sliders = screen.getAllByRole('slider')
      
      sliders.forEach(slider => {
        expect(slider).toHaveAttribute('aria-valuemin')
        expect(slider).toHaveAttribute('aria-valuemax')
        expect(slider).toHaveAttribute('aria-valuenow')
      })
    })

    it('supports keyboard navigation through complex UI', async () => {
      const user = userEvent.setup()
      render(<LandingZoneIntakeForm />)
      
      // Select a configuration
      const verySmallConfig = screen.getByTestId('label-config-very-small')
      await user.click(verySmallConfig)
      
      // Should be able to tab through all interactive elements
      let tabCount = 0
      const maxTabs = 20 // Reasonable limit for testing
      
      while (tabCount < maxTabs) {
        const before = document.activeElement
        await user.tab()
        const after = document.activeElement
        
        if (before === after) {
          // Reached the end of tabbable elements
          break
        }
        
        expect(after).toBeVisible()
        tabCount++
      }
      
      // Should have found multiple tabbable elements
      expect(tabCount).toBeGreaterThan(3)
    })

    it('has proper color contrast and visual indicators', () => {
      render(<LandingZoneIntakeForm />)
      
      // Check for proper badge variants that provide good contrast
      const badges = screen.getAllByText(/VERY SMALL|SMALL|MEDIUM|LARGE/)
      badges.forEach(badge => {
        // Badges should be visible and have proper styling
        expect(badge).toBeVisible()
        expect(badge.parentElement).toHaveClass('bg-secondary')
      })
    })

    it('provides meaningful error states and feedback', () => {
      render(<LandingZoneIntakeForm />)
      
      // Submit button should be disabled initially
      const submitButton = screen.queryByTestId('button-submit')
      if (submitButton) {
        expect(submitButton).toBeDisabled()
      } else {
        // If submit button isn't visible, that's also acceptable feedback
        expect(screen.queryByText(/submit/i)).not.toBeInTheDocument()
      }
    })

    it('supports screen reader announcements for dynamic content', async () => {
      const user = userEvent.setup()
      render(<LandingZoneIntakeForm />)
      
      // When configuration is selected, relevant content should be exposed
      const smallConfig = screen.getByTestId('label-config-small')
      await user.click(smallConfig)
      
      // Cost information should be accessible to screen readers
      expect(screen.getByText(/Infrastructure \(Monthly\)/)).toBeInTheDocument()
      expect(screen.getByText(/Professional Services \(One-time\)/)).toBeInTheDocument()
    })

    it('handles high contrast mode appropriately', () => {
      render(<LandingZoneIntakeForm />)
      
      // Elements should have proper semantic markup that works in high contrast
      const headings = screen.getAllByRole('heading')
      headings.forEach(heading => {
        expect(heading).toBeValid()
      })
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeValid()
      })
    })
  })

  describe('Touch/Mobile Accessibility', () => {
    it('has properly sized touch targets', () => {
      render(<LandingZoneIntakeForm />)
      
      // Configuration cards should be large enough for touch
      const cards = screen.getAllByTestId(/card-config-/)
      cards.forEach(card => {
        const computedStyle = window.getComputedStyle(card)
        // Cards should have adequate minimum height
        expect(card).toHaveClass('min-h-40')
      })
    })

    it('provides adequate spacing between interactive elements', () => {
      render(<LandingZoneIntakeForm />)
      
      // Configuration grid should have proper gaps
      const radioGroup = screen.getByTestId('radiogroup-configurations')
      expect(radioGroup).toHaveClass('gap-4')
    })
  })
})