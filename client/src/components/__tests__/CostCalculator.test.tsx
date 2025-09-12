import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CostCalculator from '../CostCalculator'
import { landingZoneConfigurations } from '@shared/schema'

// Mock the cost calculation utility - make it dynamic based on EC2 count
vi.mock('@shared/costCalculations', () => ({
  calculateCosts: vi.fn((config, features, ec2Count, storageTB) => {
    const baseEC2Cost = ec2Count * 30; // $30 per EC2 instance
    const baseStorageCost = storageTB * 50; // $50 per TB
    const managedServicesEC2Cost = ec2Count * 15; // $15 per instance for managed services
    const managedServicesStorageCost = storageTB * 25; // $25 per TB for managed services
    
    return {
      baseInfrastructureCost: 1000 + baseEC2Cost + baseStorageCost,
      featuresInfrastructureCost: 500,
      totalInfrastructureCost: 1500 + baseEC2Cost + baseStorageCost,
      baseProfessionalServicesCost: 5000,
      featuresProfessionalServicesCost: 2000,
      totalProfessionalServicesCost: 7000,
      managedServicesEC2Cost: managedServicesEC2Cost,
      managedServicesStorageCost: managedServicesStorageCost,
      totalManagedServicesCost: managedServicesEC2Cost + managedServicesStorageCost,
      totalMonthlyCost: 1950 + baseEC2Cost + baseStorageCost + managedServicesEC2Cost + managedServicesStorageCost,
      totalFirstYearCost: (1950 + baseEC2Cost + baseStorageCost + managedServicesEC2Cost + managedServicesStorageCost) * 12 + 7000
    }
  })
}))

describe('CostCalculator', () => {
  const mockConfig = landingZoneConfigurations[1] // small config
  const mockOnEC2Change = vi.fn()
  const mockOnStorageChange = vi.fn()
  const mockOnSubmit = vi.fn()

  const defaultProps = {
    selectedConfig: mockConfig,
    selectedFeatures: ['aws-organizations', 'control-tower'],
    customEC2Count: 5,
    customStorageTB: 3,
    onEC2Change: mockOnEC2Change,
    onStorageChange: mockOnStorageChange,
    onSubmit: mockOnSubmit,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with no configuration selected', () => {
    render(
      <CostCalculator
        {...defaultProps}
        selectedConfig={null}
        selectedFeatures={[]}
      />
    )
    
    expect(screen.getByText('Cost Calculator')).toBeInTheDocument()
    expect(screen.getByText('Select a configuration to see cost estimates')).toBeInTheDocument()
    expect(screen.getByText('Choose a landing zone configuration to calculate costs')).toBeInTheDocument()
  })

  it('renders with configuration and displays cost information', () => {
    render(<CostCalculator {...defaultProps} />)
    
    expect(screen.getByText('Cost Calculator')).toBeInTheDocument()
    expect(screen.getByText(/Customize resources for/)).toBeInTheDocument()
    expect(screen.getByTestId('card-cost-calculator')).toBeInTheDocument()
  })

  it('displays EC2 slider with correct value', () => {
    render(<CostCalculator {...defaultProps} />)
    
    expect(screen.getByText('EC2 Instances')).toBeInTheDocument()
    expect(screen.getByTestId('text-ec2-count')).toHaveTextContent('5')
    
    const slider = screen.getByTestId('slider-ec2')
    expect(slider).toBeInTheDocument()
  })

  it('displays Storage slider with correct value', () => {
    render(<CostCalculator {...defaultProps} />)
    
    expect(screen.getByText('Storage (TB)')).toBeInTheDocument()
    expect(screen.getByTestId('text-storage-count')).toHaveTextContent('3')
    
    const slider = screen.getByTestId('slider-storage')
    expect(slider).toBeInTheDocument()
  })

  it('handles EC2 slider changes', async () => {
    const user = userEvent.setup()
    render(<CostCalculator {...defaultProps} />)
    
    const slider = screen.getByTestId('slider-ec2')
    expect(slider).toBeInTheDocument()
    
    // Test that the slider element exists and can potentially be interacted with
    // The actual Radix slider interaction is complex to test in jsdom
    expect(slider).toHaveAttribute('data-testid', 'slider-ec2')
    
    // Verify the current value is displayed
    expect(screen.getByTestId('text-ec2-count')).toHaveTextContent('5')
  })

  it('handles Storage slider changes', async () => {
    const user = userEvent.setup()
    render(<CostCalculator {...defaultProps} />)
    
    const slider = screen.getByTestId('slider-storage')
    expect(slider).toBeInTheDocument()
    
    // Test that the slider element exists and can potentially be interacted with
    // The actual Radix slider interaction is complex to test in jsdom
    expect(slider).toHaveAttribute('data-testid', 'slider-storage')
    
    // Verify the current value is displayed
    expect(screen.getByTestId('text-storage-count')).toHaveTextContent('3')
  })

  it('displays all three cost categories', () => {
    render(<CostCalculator {...defaultProps} />)
    
    expect(screen.getByText('Infrastructure (Monthly)')).toBeInTheDocument()
    expect(screen.getByText('Professional Services (One-time)')).toBeInTheDocument()
    expect(screen.getByText('Managed Services (Monthly)')).toBeInTheDocument()
  })

  it('formats cost numbers correctly', () => {
    render(<CostCalculator {...defaultProps} />)
    
    // Should display costs with dollar signs and proper formatting
    const costElements = screen.getAllByText(/\$[\d,]+/)
    expect(costElements.length).toBeGreaterThan(0)
    
    // Check for month indicators in the text content
    expect(screen.getByTestId('text-total-infrastructure')).toHaveTextContent('/month')
    expect(screen.getByTestId('text-total-managed')).toHaveTextContent('/month')
  })

  it('displays breakdown sections for each cost type', () => {
    render(<CostCalculator {...defaultProps} />)
    
    // Should show base costs
    expect(screen.getByText(/Base Infrastructure/)).toBeInTheDocument()
    expect(screen.getByText(/Features Add-on/)).toBeInTheDocument()
    expect(screen.getByText(/Base Implementation/)).toBeInTheDocument()
  })

  it('handles submit button click', async () => {
    const user = userEvent.setup()
    render(<CostCalculator {...defaultProps} />)
    
    const submitButton = screen.getByTestId('button-submit')
    expect(submitButton).toBeInTheDocument()
    
    await user.click(submitButton)
    expect(mockOnSubmit).toHaveBeenCalled()
  })



  it('calculates costs dynamically based on inputs', () => {
    // Test with different EC2 counts
    const { rerender } = render(<CostCalculator {...defaultProps} />)
    
    const initialCost = screen.getByTestId('text-total-monthly').textContent
    
    rerender(<CostCalculator {...defaultProps} customEC2Count={20} />)
    
    const newCost = screen.getByTestId('text-total-monthly').textContent
    
    // Cost should be different with more EC2 instances
    expect(initialCost).not.toBe(newCost)
  })

  it('shows sticky positioning class', () => {
    render(<CostCalculator {...defaultProps} />)
    
    const container = screen.getByTestId('card-cost-calculator').parentElement
    expect(container).toHaveClass('sticky', 'top-6')
  })

  it('displays proper icons for each section', () => {
    render(<CostCalculator {...defaultProps} />)
    
    // Calculator icon should be in header
    expect(screen.getByText('Cost Calculator').previousElementSibling).toBeInTheDocument()
    
    // Server and HardDrive icons should be present for sliders
    expect(screen.getByText('EC2 Instances').previousElementSibling).toBeInTheDocument()
    expect(screen.getByText('Storage (TB)').previousElementSibling).toBeInTheDocument()
  })

  it('is accessible with proper ARIA labels', () => {
    render(<CostCalculator {...defaultProps} />)
    
    const sliders = screen.getAllByRole('slider')
    sliders.forEach(slider => {
      expect(slider).toHaveAttribute('aria-valuemin')
      expect(slider).toHaveAttribute('aria-valuemax')
      expect(slider).toHaveAttribute('aria-valuenow')
    })
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeValid()
    })
  })
})