import { LandingZoneConfig, Feature, availableFeatures } from "./schema";

export interface CostBreakdown {
  // Infrastructure costs (monthly)
  baseInfrastructureCost: number;
  featuresInfrastructureCost: number;
  totalInfrastructureCost: number;
  
  // Professional services costs (one-time)
  baseProfessionalServicesCost: number;
  featuresProfessionalServicesCost: number;
  totalProfessionalServicesCost: number;
  
  // Managed services costs (monthly)
  managedServicesEC2Cost: number;
  managedServicesStorageCost: number;
  totalManagedServicesCost: number;
  
  // Grand totals
  totalMonthlyCost: number;
  totalFirstYearCost: number;
}

export function calculateCosts(
  config: LandingZoneConfig,
  selectedFeatures: string[],
  ec2Count: number,
  storageTB: number
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
  const totalProfessionalServicesCost = baseProfessionalServicesCost + featuresProfessionalServicesCost;

  // Calculate managed services costs (monthly)
  const managedServicesEC2Cost = ec2Count * config.managedServicesCostPerEC2;
  const managedServicesStorageCost = storageTB * config.managedServicesCostPerTBStorage;
  const totalManagedServicesCost = managedServicesEC2Cost + managedServicesStorageCost;

  // Calculate grand totals
  const totalMonthlyCost = totalInfrastructureCost + totalManagedServicesCost;
  const totalFirstYearCost = (totalMonthlyCost * 12) + totalProfessionalServicesCost;

  return {
    baseInfrastructureCost,
    featuresInfrastructureCost,
    totalInfrastructureCost,
    baseProfessionalServicesCost,
    featuresProfessionalServicesCost,
    totalProfessionalServicesCost,
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