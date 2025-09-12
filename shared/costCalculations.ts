/**
 * AWS Landing Zone Cost Calculation Engine
 * 
 * Core cost calculation utilities for AWS Landing Zone configurations.
 * Handles complex pricing logic for infrastructure, professional services,
 * and managed services across different configuration sizes.
 * 
 * @version 1.0.0
 */

import { LandingZoneConfig, Feature, availableFeatures, AdditionalCost } from "./schema";
import { getMigrationPricing } from "./pricing-loader";

/**
 * Comprehensive cost breakdown interface for AWS Landing Zone configurations
 * Provides detailed cost analysis across all service categories
 */
export interface CostBreakdown {
  // Infrastructure costs (monthly)
  baseInfrastructureCost: number;
  featuresInfrastructureCost: number;
  totalInfrastructureCost: number;
  
  // Professional services costs (one-time)
  baseProfessionalServicesCost: number;
  featuresProfessionalServicesCost: number;
  additionalCostsTotal: number;
  totalProfessionalServicesCost: number;
  
  // Migration costs (one-time)
  migrationCost: number;
  migrationCostPerVM: number;
  migrationVMCount: number;
  
  // Managed services costs (monthly)
  managedServicesEC2Cost: number;
  managedServicesStorageCost: number;
  totalManagedServicesCost: number;
  
  // Grand totals
  totalMonthlyCost: number;
  totalFirstYearCost: number;
}

/**
 * Calculate comprehensive costs for AWS Landing Zone configuration
 * 
 * Provides detailed cost breakdown including:
 * - Infrastructure costs (base + feature-specific)
 * - Professional services (implementation costs + additional costs)  
 * - Managed services (ongoing EC2 and storage management)
 * - Total monthly and first-year costs
 * 
 * @param config - The selected Landing Zone configuration
 * @param selectedFeatures - Array of selected feature IDs
 * @param ec2Count - Number of EC2 instances to manage
 * @param storageTB - Amount of storage in TB to manage
 * @param additionalCosts - Array of additional cost items
 * @returns Complete cost breakdown with monthly and annual totals
 */
export function calculateCosts(
  config: LandingZoneConfig,
  selectedFeatures: string[],
  ec2Count: number,
  storageTB: number,
  additionalCosts: AdditionalCost[] = []
): CostBreakdown {
  // Get feature objects for selected features
  const selectedFeatureObjects = availableFeatures.filter(feature => 
    selectedFeatures.includes(feature.id) && 
    feature.availableInSizes.includes(config.size)
  );

  // Calculate infrastructure costs (monthly)
  const baseInfrastructureCost = config.baseInfraCostPerMonth;
  const featuresInfrastructureCost = selectedFeatureObjects.reduce(
    (sum, feature) => sum + feature.infraCostImpact, 0
  );
  const totalInfrastructureCost = baseInfrastructureCost + featuresInfrastructureCost;

  // Calculate professional services costs (one-time)
  const baseProfessionalServicesCost = config.baseProfessionalServicesCost;
  const featuresProfessionalServicesCost = selectedFeatureObjects.reduce(
    (sum, feature) => sum + feature.professionalServicesCostImpact, 0
  );
  const additionalCostsTotal = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalProfessionalServicesCost = baseProfessionalServicesCost + featuresProfessionalServicesCost + additionalCostsTotal;

  // Calculate migration costs (one-time)
  const migrationPricing = getMigrationPricing();
  const migrationCostPerVM = migrationPricing.costPerVM;
  const migrationVMCount = ec2Count; // Use same number as EC2 instances
  const migrationCost = migrationVMCount * migrationCostPerVM;

  // Calculate managed services costs (monthly)
  const managedServicesEC2Cost = ec2Count * config.managedServicesCostPerEC2;
  const managedServicesStorageCost = storageTB * config.managedServicesCostPerTBStorage;
  const totalManagedServicesCost = managedServicesEC2Cost + managedServicesStorageCost;

  // Calculate grand totals
  const totalMonthlyCost = totalInfrastructureCost + totalManagedServicesCost;
  const totalFirstYearCost = (totalMonthlyCost * 12) + totalProfessionalServicesCost + migrationCost;

  return {
    baseInfrastructureCost,
    featuresInfrastructureCost,
    totalInfrastructureCost,
    baseProfessionalServicesCost,
    featuresProfessionalServicesCost,
    additionalCostsTotal,
    totalProfessionalServicesCost,
    migrationCost,
    migrationCostPerVM,
    migrationVMCount,
    managedServicesEC2Cost,
    managedServicesStorageCost,
    totalManagedServicesCost,
    totalMonthlyCost,
    totalFirstYearCost,
  };
}

export function getFeaturesByCategory(config: LandingZoneConfig): Record<string, Feature[]> {
  const availableFeaturesForConfig = availableFeatures.filter(
    feature => feature.availableInSizes.includes(config.size) && 
               config.availableFeatures.includes(feature.id)
  );

  return availableFeaturesForConfig.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);
}

export function getMandatoryFeatures(config: LandingZoneConfig): Feature[] {
  return availableFeatures.filter(feature => 
    config.mandatoryFeatures.includes(feature.id) &&
    feature.availableInSizes.includes(config.size)
  );
}