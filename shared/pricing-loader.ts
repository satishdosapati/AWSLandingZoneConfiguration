import pricingConfig from './pricing-config.json';
import { getCachedAWSPricing, isAWSPricingCacheValid } from './aws-pricing-loader';

export interface PricingConfig {
  version: string;
  lastUpdated: string;
  currency: string;
  description: string;
  basePricing: {
    [size: string]: {
      baseInfraCostPerMonth: number;
      baseProfessionalServicesCost: number;
      managedServicesCostPerEC2: number;
      managedServicesCostPerTBStorage: number;
    };
  };
  featurePricing: {
    [featureId: string]: {
      infraCostImpact: number;
      professionalServicesCostImpact: number;
    };
  };
  migrationPricing: {
    costPerVM: number;
    description: string;
  };
  pricingNotes: {
    [key: string]: string | {
      [key: string]: string;
    };
  };
}

// Load pricing configuration
export const pricing: PricingConfig = pricingConfig as PricingConfig;

// Helper functions to get pricing data
export const getBasePricing = (size: string) => {
  return pricing.basePricing[size] || null;
};

/**
 * Get feature pricing with AWS Pricing API integration
 * Attempts to use cached AWS pricing data if available, otherwise falls back to manual pricing
 */
export const getFeaturePricing = (featureId: string) => {
  const manualPricing = pricing.featurePricing[featureId] || { 
    infraCostImpact: 0, 
    professionalServicesCostImpact: 0 
  };
  
  // Try to get AWS pricing if cache is available and valid
  if (isAWSPricingCacheValid()) {
    const awsInfraCost = getCachedAWSPricing(featureId);
    
    // Accept AWS pricing if available (including 0 for free services)
    // Only fall back to manual pricing if AWS pricing is not found (null)
    if (awsInfraCost !== null) {
      // Use AWS pricing for infrastructure costs, keep manual for professional services
      return {
        infraCostImpact: awsInfraCost,
        professionalServicesCostImpact: manualPricing.professionalServicesCostImpact
      };
    }
  }
  
  // Fall back to manual pricing
  return manualPricing;
};

export const getMigrationPricing = () => {
  return pricing.migrationPricing || { costPerVM: 300, description: "One-time migration cost per VM" };
};

export const getPricingVersion = () => {
  return {
    version: pricing.version,
    lastUpdated: pricing.lastUpdated,
    currency: pricing.currency
  };
};