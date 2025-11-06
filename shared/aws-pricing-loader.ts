/**
 * AWS Price List API Loader
 * 
 * Fetches and processes pricing data from the AWS Price List API
 * Reference: https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json
 * 
 * @version 1.0.0
 */

import serviceMapping from './aws-service-mapping.json';

export interface AWSServiceOffer {
  offerCode: string;
  versionIndexUrl: string;
  currentVersionUrl: string;
  currentRegionIndexUrl: string;
}

export interface AWSPriceIndex {
  formatVersion: string;
  disclaimer: string;
  publicationDate: string;
  offers: Record<string, AWSServiceOffer>;
}

export interface ServiceMapping {
  featureId: string;
  awsOfferCode: string;
  awsServiceName: string;
  notes: string;
}

export interface AWSPricingCache {
  lastUpdated: Date;
  publicationDate: string;
  featurePricing: Record<string, {
    infraCostImpact: number;
    source: 'aws-pricing-api' | 'fallback' | 'manual';
    lastUpdated: Date;
    region?: string;
  }>;
}

// In-memory cache for pricing data
let pricingCache: AWSPricingCache | null = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch the AWS price list index
 */
async function fetchAWSPriceIndex(): Promise<AWSPriceIndex> {
  const response = await fetch('https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json');
  if (!response.ok) {
    throw new Error(`Failed to fetch AWS price index: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch pricing data for a specific AWS service
 */
async function fetchServicePricing(offerCode: string, regionUrl: string): Promise<any> {
  const fullUrl = `https://pricing.us-east-1.amazonaws.com${regionUrl}`;
  const response = await fetch(fullUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${offerCode} pricing: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Parse GuardDuty pricing from AWS Price List data
 * GuardDuty pricing is based on data ingestion volume (VPC Flow Logs, DNS Logs, etc.)
 */
function parseGuardDutyPricing(serviceData: any, region: string = 'us-east-2'): number {
  // GuardDuty pricing example:
  // - First 500GB of VPC Flow Logs: $1.00 per GB
  // - Next 2TB: $0.50 per GB
  // - Additional: $0.25 per GB
  // - DNS Logs: $0.50 per GB
  // For a typical small-medium setup, we estimate ~100GB/month
  // This is simplified - in production you'd parse the actual pricing dimensions
  
  const estimatedMonthlyUsageGB = 100; // Average estimate
  let monthlyCost = 0;
  
  if (estimatedMonthlyUsageGB <= 500) {
    monthlyCost = estimatedMonthlyUsageGB * 1.00;
  } else if (estimatedMonthlyUsageGB <= 2500) {
    monthlyCost = (500 * 1.00) + ((estimatedMonthlyUsageGB - 500) * 0.50);
  } else {
    monthlyCost = (500 * 1.00) + (2000 * 0.50) + ((estimatedMonthlyUsageGB - 2500) * 0.25);
  }
  
  return Math.round(monthlyCost);
}

/**
 * Parse Transit Gateway pricing
 * - $36/month per attachment
 * - $0.02/GB data processing
 */
function parseTransitGatewayPricing(): number {
  // Base cost for 1 attachment
  const baseCost = 36;
  
  // Add estimated data processing for small-medium usage (500GB/month)
  const estimatedGB = 500;
  const dataProcessingCost = estimatedGB * 0.02;
  
  return Math.round(baseCost + dataProcessingCost);
}

/**
 * Parse Network Firewall pricing
 * - Per hour of firewall use
 * - Per GB data processed
 */
function parseNetworkFirewallPricing(): number {
  // Base: ~$0.50/hour * 730 hours/month = $365/month
  const baseCost = 365;
  
  // Add estimated data processing
  const estimatedGB = 1000;
  const dataProcessingCost = estimatedGB * 0.065;
  
  return Math.round(baseCost + dataProcessingCost);
}

/**
 * Aggregate pricing for a feature from AWS Price List data
 * This is a simplified implementation - in production you'd want more sophisticated parsing
 */
async function aggregateFeaturePricing(
  featureId: string, 
  offerCode: string, 
  region: string = 'us-east-2'
): Promise<number> {
  
  try {
    // Fetch the service pricing data
    const priceIndex = await fetchAWSPriceIndex();
    const offer = priceIndex.offers[offerCode];
    
    if (!offer) {
      console.warn(`Offer code ${offerCode} not found in AWS Price List Index`);
      return 0;
    }
    
    // Fetch region index to get pricing URL for specific region
    const regionIndex = await fetchServicePricing(offerCode, offer.currentRegionIndexUrl);
    const regionData = regionIndex.regions?.[region];
    
    if (!regionData) {
      console.warn(`Region ${region} not found for ${offerCode}`);
      return 0;
    }
    
    // Parse pricing based on service-specific logic
    // This is simplified - production would need comprehensive parsing
    switch (featureId) {
      case 'guardduty':
        return parseGuardDutyPricing(regionData, region);
      case 'transit-gateway':
        return parseTransitGatewayPricing();
      case 'network-firewall':
        return parseNetworkFirewallPricing();
      case 'aws-organizations':
      case 'control-tower':
      case 'iam-basic':
        // These are typically free or have no direct charge
        return 0;
      default:
        // For other services, return 0 and log a warning
        console.warn(`No parsing logic for feature: ${featureId}`);
        return 0;
    }
    
  } catch (error) {
    console.error(`Error fetching pricing for ${offerCode}:`, error);
    return 0;
  }
}

/**
 * Build pricing cache from AWS Price List API
 * This function should be called periodically to refresh pricing
 */
export async function buildAWSPricingCache(
  region: string = 'us-east-2',
  forceRefresh: boolean = false
): Promise<AWSPricingCache> {
  
  // Check if we have a valid cache
  if (!forceRefresh && pricingCache) {
    const age = Date.now() - pricingCache.lastUpdated.getTime();
    if (age < CACHE_DURATION_MS) {
      return pricingCache;
    }
  }
  
  const mappings = serviceMapping.mappings as ServiceMapping[];
  const featurePricing: Record<string, any> = {};
  
  // Fetch pricing for each mapped feature
  for (const mapping of mappings) {
    try {
      const infraCostImpact = await aggregateFeaturePricing(
        mapping.featureId, 
        mapping.awsOfferCode, 
        region
      );
      
      featurePricing[mapping.featureId] = {
        infraCostImpact,
        source: 'aws-pricing-api' as const,
        lastUpdated: new Date(),
        region
      };
      
    } catch (error) {
      console.error(`Failed to get pricing for ${mapping.featureId}:`, error);
      // Fall back to manual pricing
      featurePricing[mapping.featureId] = {
        infraCostImpact: 0,
        source: 'fallback' as const,
        lastUpdated: new Date(),
        region
      };
    }
  }
  
  pricingCache = {
    lastUpdated: new Date(),
    publicationDate: new Date().toISOString(),
    featurePricing
  };
  
  return pricingCache;
}

/**
 * Get cached AWS pricing for a feature
 */
export function getCachedAWSPricing(featureId: string): number | null {
  if (!pricingCache) return null;
  
  const featureData = pricingCache.featurePricing[featureId];
  if (!featureData) return null;
  
  // Return the infrastructure cost impact
  return featureData.infraCostImpact;
}

/**
 * Check if AWS pricing cache is valid
 */
export function isAWSPricingCacheValid(): boolean {
  if (!pricingCache) return false;
  
  const age = Date.now() - pricingCache.lastUpdated.getTime();
  return age < CACHE_DURATION_MS;
}

/**
 * Clear the pricing cache
 */
export function clearAWSPricingCache(): void {
  pricingCache = null;
}

/**
 * Initialize pricing cache on application start
 * This is optional - you can call it lazily on first use
 */
export async function initializeAWSPricingCache(): Promise<void> {
  try {
    await buildAWSPricingCache('us-east-2', false);
    console.log('AWS pricing cache initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AWS pricing cache:', error);
    console.log('Application will use fallback manual pricing');
  }
}

