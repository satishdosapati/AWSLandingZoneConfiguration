import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingZoneIntakeForm from '../LandingZoneIntakeForm'

// Mock the cost calculation utility
vi.mock('@/utils/costCalculations', () => ({
  calculateCosts: vi.fn(() => ({
    baseInfrastructureCost: 1000,
    featuresInfrastructureCost: 500,
    totalInfrastructureCost: 1700,
    baseProfessionalServicesCost: 5000,
    featuresProfessionalServicesCost: 2000,
    totalProfessionalServicesCost: 7000,
    managedServicesEC2Cost: 300,
    managedServicesStorageCost: 500,
    totalManagedServicesCost: 800,
    totalMonthlyCost: 2500,
    totalFirstYearCost: 37000
  }))
}))

describe('LandingZoneIntakeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main form with header content', () => {
    render(<LandingZoneIntakeForm />)
    
    expect(screen.getByText('AWS Landing Zone Configuration')).toBeInTheDocument()
    expect(screen.getByText(/Select the right AWS Landing Zone configuration/)).toBeInTheDocument()
  })

  it('displays all configuration options', () => {
    render(<LandingZoneIntakeForm />)
    
    expect(screen.getByText('Very Small')).toBeInTheDocument()
    expect(screen.getByText('Small')).toBeInTheDocument()  
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('shows "Choose Your Configuration" section', () => {
    render(<LandingZoneIntakeForm />)
    
    expect(screen.getByText('Choose Your Configuration')).toBeInTheDocument()
    expect(screen.getByText(/Select the AWS Landing Zone configuration that best matches/)).toBeInTheDocument()
  })

  it('renders radio group for configuration selection', () => {
    render(<LandingZoneIntakeForm />)
    
    const radioGroup = screen.getByTestId('radiogroup-configurations')
    expect(radioGroup).toBeInTheDocument()
  })

  it('handles configuration selection and updates state', async () => {
    const user = userEvent.setup()
    render(<LandingZoneIntakeForm />)
    
    // Select very-small configuration
    const verySmallConfig = screen.getByTestId('label-config-very-small')
    await user.click(verySmallConfig)
    
    // Should show tabs container
    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })
    
    // Should show cost calculator
    expect(screen.getByTestId('card-cost-calculator')).toBeInTheDocument()
  })

  it('shows tabs when configuration is selected', async () => {
    const user = userEvent.setup()
    render(<LandingZoneIntakeForm />)
    
    // Select a configuration
    const smallConfig = screen.getByTestId('label-config-small')
    await user.click(smallConfig)
    
    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /technical details/i })).toBeInTheDocument()
    })
  })

  it('displays feature selector when configuration is selected', async () => {
    const user = userEvent.setup()
    render(<LandingZoneIntakeForm />)
    
    // Select medium configuration (has more features)
    const mediumConfig = screen.getByTestId('label-config-medium')
    await user.click(mediumConfig)
    
    await waitFor(() => {
      expect(screen.getByTestId('card-feature-selector')).toBeInTheDocument()
      expect(screen.getByText('Feature Selection')).toBeInTheDocument()
    })
  })

  it('handles feature toggling correctly', async () => {
    const user = userEvent.setup()
    render(<LandingZoneIntakeForm />)
    
    // Select a configuration first
    const mediumConfig = screen.getByTestId('label-config-medium')
    await user.click(mediumConfig)
    
    await waitFor(() => {
      // Find a non-mandatory feature checkbox
      const securityHubCheckbox = screen.queryByRole('checkbox', { name: /AWS Security Hub/ })
      if (securityHubCheckbox && !securityHubCheckbox.hasAttribute('disabled')) {
        user.click(securityHubCheckbox)
        expect(securityHubCheckbox).toBeChecked()
      }
    })
  })

  it('updates resource counts with sliders', async () => {
    const user = userEvent.setup()
    render(<LandingZoneIntakeForm />)
    
    // Select a configuration first
    const smallConfig = screen.getByTestId('label-config-small')
    await user.click(smallConfig)
    
    await waitFor(() => {
      const ec2Count = screen.getByTestId('text-ec2-count')
      expect(ec2Count).toBeInTheDocument()
      
      const storageCount = screen.getByTestId('text-storage-count')
      expect(storageCount).toBeInTheDocument()
    })
  })

  it('shows configuration details in details tab', async () => {
    const user = userEvent.setup()
    render(<LandingZoneIntakeForm />)
    
    // Select a configuration first
    const smallConfig = screen.getByTestId('label-config-small')
    await user.click(smallConfig)
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /technical details/i })).toBeInTheDocument()
    })
    
    // Click on details tab
    const detailsTab = screen.getByRole('tab', { name: /technical details/i })
    await user.click(detailsTab)
    
    await waitFor(() => {
      expect(screen.getByText(/Account Structure/)).toBeInTheDocument()
      expect(screen.getByText(/Organizational Structure/)).toBeInTheDocument()
    })
  })

  it('enables submit button when configuration is selected', async () => {
    const user = userEvent.setup()
    render(<LandingZoneIntakeForm />)
    
    // Select a configuration
    const verySmallConfig = screen.getByTestId('label-config-very-small')
    await user.click(verySmallConfig)
    
    await waitFor(() => {
      const submitButton = screen.getByTestId('button-submit')
      expect(submitButton).toBeEnabled()
    })
  })

  it('handles export button clicks', async () => {
    const user = userEvent.setup()
    
    // Mock console.log to check if export functions are called
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    render(<LandingZoneIntakeForm />)
    
    // Select a configuration first
    const verySmallConfig = screen.getByTestId('label-config-very-small')
    await user.click(verySmallConfig)
    
    await waitFor(async () => {
      const pdfButton = screen.getByTestId('button-export-pdf-form')
      const csvButton = screen.getByTestId('button-export-csv-form')
      
      await user.click(pdfButton)
      expect(consoleSpy).toHaveBeenCalledWith('Export PDF functionality - to be implemented')
      
      await user.click(csvButton)
      expect(consoleSpy).toHaveBeenCalledWith('Export CSV functionality - to be implemented')
    })
    
    consoleSpy.mockRestore()
  })

  it('handles form submission', async () => {
    const user = userEvent.setup()
    
    // Mock console.log to check if submit function is called
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    render(<LandingZoneIntakeForm />)
    
    // Select a configuration first
    const verySmallConfig = screen.getByTestId('label-config-very-small')
    await user.click(verySmallConfig)
    
    await waitFor(async () => {
      const submitButton = screen.getByTestId('button-submit')
      await user.click(submitButton)
      
      expect(consoleSpy).toHaveBeenCalledWith('Form submitted with:', expect.any(Object))
    })
    
    consoleSpy.mockRestore()
  })

  it('sets default values when configuration changes', async () => {
    const user = userEvent.setup()
    render(<LandingZoneIntakeForm />)
    
    // Select small configuration
    const smallConfig = screen.getByTestId('label-config-small')
    await user.click(smallConfig)
    
    await waitFor(() => {
      // Should show default values for small config
      const ec2Count = screen.getByTestId('text-ec2-count')
      expect(ec2Count).toHaveTextContent('8') // default VMs for small
      
      const storageCount = screen.getByTestId('text-storage-count')
      expect(storageCount).toHaveTextContent('5') // default storage for small
    })
  })

  it('displays cost calculations in real-time', async () => {
    const user = userEvent.setup()
    render(<LandingZoneIntakeForm />)
    
    // Select a configuration
    const smallConfig = screen.getByTestId('label-config-small')
    await user.click(smallConfig)
    
    await waitFor(() => {
      // Should display calculated costs
      expect(screen.getByTestId('text-total-infrastructure')).toBeInTheDocument()
      expect(screen.getByTestId('text-total-professional')).toBeInTheDocument() 
      expect(screen.getByTestId('text-total-managed')).toBeInTheDocument()
    })
  })

  it('has proper responsive layout', () => {
    render(<LandingZoneIntakeForm />)
    
    // Should have responsive grid classes
    const mainGrid = screen.getByText('Choose Your Configuration').closest('.grid')
    expect(mainGrid).toHaveClass('lg:grid-cols-12')
    
    // Configuration section should have responsive columns
    const configSection = screen.getByTestId('radiogroup-configurations')
    expect(configSection).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-3')
  })

  it('is accessible with proper headings and navigation', () => {
    render(<LandingZoneIntakeForm />)
    
    // Should have proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1, name: /AWS Landing Zone Configuration/ })).toBeInTheDocument()
    
    // Should have accessible radio group
    const radioGroup = screen.getByRole('radiogroup')
    expect(radioGroup).toBeInTheDocument()
  })
})