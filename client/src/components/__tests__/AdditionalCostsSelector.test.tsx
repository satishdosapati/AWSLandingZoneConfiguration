/**
 * AdditionalCostsSelector Component Tests
 * 
 * Tests for the AdditionalCostsSelector component functionality including
 * adding, editing, and removing additional cost items.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdditionalCostsSelector from '../AdditionalCostsSelector';
import { AdditionalCost } from '@shared/schema';

// Mock the crypto.randomUUID function
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  }
});

describe('AdditionalCostsSelector', () => {
  const mockOnChange = vi.fn();
  
  const defaultProps = {
    additionalCosts: [],
    onAdditionalCostsChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders the component with empty state', () => {
    render(<AdditionalCostsSelector {...defaultProps} />);
    
    expect(screen.getByText('Additional Professional Services Costs')).toBeInTheDocument();
    expect(screen.getByText('Add Additional Cost')).toBeInTheDocument();
    expect(screen.getByTestId('input-additional-cost-description')).toBeInTheDocument();
    expect(screen.getByTestId('input-additional-cost-amount')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-additional-cost')).toBeInTheDocument();
  });

  it('adds a new cost item when form is submitted with valid data', async () => {
    render(<AdditionalCostsSelector {...defaultProps} />);
    
    const descriptionInput = screen.getByTestId('input-additional-cost-description');
    const amountInput = screen.getByTestId('input-additional-cost-amount');
    const addButton = screen.getByTestId('button-add-additional-cost');
    
    fireEvent.change(descriptionInput, { target: { value: 'Custom security assessment' } });
    fireEvent.change(amountInput, { target: { value: '5000' } });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([
        {
          id: 'test-uuid-123',
          description: 'Custom security assessment',
          amount: 5000,
        }
      ]);
    });
  });

  it('shows validation errors for empty fields', async () => {
    render(<AdditionalCostsSelector {...defaultProps} />);
    
    const addButton = screen.getByTestId('button-add-additional-cost');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Amount is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for negative amount', async () => {
    render(<AdditionalCostsSelector {...defaultProps} />);
    
    const descriptionInput = screen.getByTestId('input-additional-cost-description');
    const amountInput = screen.getByTestId('input-additional-cost-amount');
    const addButton = screen.getByTestId('button-add-additional-cost');
    
    fireEvent.change(descriptionInput, { target: { value: 'Test cost' } });
    fireEvent.change(amountInput, { target: { value: '-100' } });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Amount must be a valid non-negative number')).toBeInTheDocument();
    });
  });

  it('displays existing cost items', () => {
    const existingCosts: AdditionalCost[] = [
      {
        id: 'cost-1',
        description: 'Migration planning',
        amount: 3000,
      },
      {
        id: 'cost-2',
        description: 'Training sessions',
        amount: 2000,
      },
    ];

    render(<AdditionalCostsSelector {...defaultProps} additionalCosts={existingCosts} />);
    
    expect(screen.getByText('Additional Costs (2)')).toBeInTheDocument();
    expect(screen.getByText('Migration planning')).toBeInTheDocument();
    expect(screen.getByText('Training sessions')).toBeInTheDocument();
    expect(screen.getByText('$3,000')).toBeInTheDocument();
    expect(screen.getByText('$2,000')).toBeInTheDocument();
    expect(screen.getByText('Total: $5,000')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    const existingCosts: AdditionalCost[] = [
      {
        id: 'cost-1',
        description: 'Migration planning',
        amount: 3000,
      },
    ];

    render(<AdditionalCostsSelector {...defaultProps} additionalCosts={existingCosts} />);
    
    const editButton = screen.getByTestId('button-edit-cost-1');
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('input-edit-description-cost-1')).toBeInTheDocument();
    expect(screen.getByTestId('input-edit-amount-cost-1')).toBeInTheDocument();
    expect(screen.getByTestId('button-save-edit-cost-1')).toBeInTheDocument();
    expect(screen.getByTestId('button-cancel-edit-cost-1')).toBeInTheDocument();
  });

  it('removes a cost item when remove button is clicked', () => {
    const existingCosts: AdditionalCost[] = [
      {
        id: 'cost-1',
        description: 'Migration planning',
        amount: 3000,
      },
    ];

    render(<AdditionalCostsSelector {...defaultProps} additionalCosts={existingCosts} />);
    
    const removeButton = screen.getByTestId('button-remove-cost-1');
    fireEvent.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('shows summary alert when there are additional costs', () => {
    const existingCosts: AdditionalCost[] = [
      {
        id: 'cost-1',
        description: 'Migration planning',
        amount: 3000,
      },
    ];

    render(<AdditionalCostsSelector {...defaultProps} additionalCosts={existingCosts} />);
    
    expect(screen.getByText(/Additional costs will add \$3,000 to your total professional services cost/)).toBeInTheDocument();
  });
});
