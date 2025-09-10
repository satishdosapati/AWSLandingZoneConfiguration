import pricingConfig from './pricing-config.json';

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
  pricingNotes: {
    [key: string]: string;
  };
}

// Load pricing configuration
export const pricing: PricingConfig = pricingConfig as PricingConfig;

// Helper functions to get pricing data
export const getBasePricing = (size: string) => {
  return pricing.basePricing[size] || null;
};

export const getFeaturePricing = (featureId: string) => {
  return pricing.featurePricing[featureId] || { infraCostImpact: 0, professionalServicesCostImpact: 0 };
};

export const getPricingVersion = () => {
  return {
    version: pricing.version,
    lastUpdated: pricing.lastUpdated,
    currency: pricing.currency
  };
};