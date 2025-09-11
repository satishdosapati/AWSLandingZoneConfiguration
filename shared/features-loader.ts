import featuresConfig from './features-config.json';
import { getFeaturePricing } from './pricing-loader';

export interface FeatureConfigData {
  id: string;
  name: string;
  description: string;
  awsDefinition: string;
  category: "foundation" | "security" | "networking" | "automation" | "monitoring";
  mandatory: boolean;
  availableInSizes: ("very-small" | "small" | "medium" | "large")[];
}

export interface ConfigurationFeatures {
  availableFeatures: string[];
  mandatoryFeatures: string[];
}

export interface FeatureCategory {
  id: string;
  name: string;
  description: string;
}

export interface FeaturesConfiguration {
  version: string;
  lastUpdated: string;
  description: string;
  features: FeatureConfigData[];
  configurationFeatures: Record<string, ConfigurationFeatures>;
  categories: FeatureCategory[];
}

// Load features configuration
export function getFeaturesConfig(): FeaturesConfiguration {
  return featuresConfig as FeaturesConfiguration;
}

// Get all available features with pricing data
export function getAllFeatures() {
  const config = getFeaturesConfig();
  return config.features.map(feature => ({
    ...feature,
    ...getFeaturePricing(feature.id)
  }));
}

// Get features for a specific configuration size
export function getFeaturesForSize(size: "very-small" | "small" | "medium" | "large") {
  const allFeatures = getAllFeatures();
  return allFeatures.filter(feature => 
    feature.availableInSizes.includes(size)
  );
}

// Get available feature IDs for a configuration size
export function getAvailableFeatureIds(size: "very-small" | "small" | "medium" | "large"): string[] {
  const config = getFeaturesConfig();
  return config.configurationFeatures[size]?.availableFeatures || [];
}

// Get mandatory feature IDs for a configuration size
export function getMandatoryFeatureIds(size: "very-small" | "small" | "medium" | "large"): string[] {
  const config = getFeaturesConfig();
  return config.configurationFeatures[size]?.mandatoryFeatures || [];
}

// Get all feature categories
export function getFeatureCategories(): FeatureCategory[] {
  const config = getFeaturesConfig();
  return config.categories;
}

// Get feature by ID
export function getFeatureById(id: string) {
  const allFeatures = getAllFeatures();
  return allFeatures.find(feature => feature.id === id);
}

// Get features by category
export function getFeaturesByCategory(category: string) {
  const allFeatures = getAllFeatures();
  return allFeatures.filter(feature => feature.category === category);
}