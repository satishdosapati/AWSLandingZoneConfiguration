# AWS Price List API Integration Guide

## Overview

This application now integrates with the official AWS Price List API to provide up-to-date pricing information. The integration uses a **dual-layer approach** that combines AWS's authoritative pricing data with your custom business logic.

**Reference:** [AWS Price List API](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json)

## Architecture

### Dual-Layer Design

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: AWS Price List API (Authoritative Source)    │
│  - Fetches real-time pricing from AWS                  │
│  - Cached for 24 hours for performance                 │
│  - Handles complex multi-dimensional pricing           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Your Business Logic (Custom Aggregation)     │
│  - Maps AWS services to your features                  │
│  - Adds professional services costs                    │
│  - Provides Land Zone bundle pricing                   │
│  - Fallback to manual pricing if AWS unavailable       │
└─────────────────────────────────────────────────────────┘
```

## Key Files

### 1. `shared/aws-service-mapping.json`
Maps your feature IDs to AWS offer codes.

**Example:**
```json
{
  "featureId": "guardduty",
  "awsOfferCode": "AmazonGuardDuty",
  "awsServiceName": "Amazon GuardDuty",
  "notes": "Charged per GB of VPC Flow Logs, DNS Logs, S3 Logs, etc."
}
```

### 2. `shared/aws-pricing-loader.ts`
Core logic for fetching and caching AWS pricing data.

**Key Functions:**
- `buildAWSPricingCache()` - Fetch and cache pricing data
- `getCachedAWSPricing()` - Retrieve cached pricing
- `isAWSPricingCacheValid()` - Check cache validity
- `initializeAWSPricingCache()` - Initialize on startup

### 3. `shared/pricing-loader.ts` (Enhanced)
Now checks AWS cache first, falls back to manual pricing.

### 4. `server/routes.ts` (New Endpoints)
- `POST /api/pricing/refresh` - Manually refresh pricing cache
- `GET /api/pricing/status` - Check cache status

## How It Works

### Automatic Fallback System

```typescript
export const getFeaturePricing = (featureId: string) => {
  // 1. Try AWS pricing cache first
  if (isAWSPricingCacheValid()) {
    const awsInfraCost = getCachedAWSPricing(featureId);
    if (awsInfraCost !== null && awsInfraCost > 0) {
      // Use AWS pricing for infrastructure
      return { infraCostImpact: awsInfraCost, ... };
    }
  }
  
  // 2. Fall back to manual pricing if AWS unavailable
  return pricing.featurePricing[featureId] || { ... };
};
```

### Caching Strategy

- **Cache Duration:** 24 hours
- **Storage:** In-memory (can be extended to Redis/DB)
- **Refresh:** Manual via API or automatic on expiry

## Adding New AWS Services

### Step 1: Add Service Mapping

Edit `shared/aws-service-mapping.json`:

```json
{
  "featureId": "your-feature-id",
  "awsOfferCode": "AWSServiceName",
  "awsServiceName": "AWS Service Display Name",
  "notes": "Pricing details"
}
```

### Step 2: Add Pricing Parser

Edit `shared/aws-pricing-loader.ts`:

```typescript
async function aggregateFeaturePricing(featureId: string, offerCode: string, region: string) {
  // ... existing code ...
  
  switch (featureId) {
    case 'your-feature-id':
      return parseYourServicePricing(regionData, region);
    // ... other cases ...
  }
}

function parseYourServicePricing(serviceData: any, region: string): number {
  // Parse the AWS Price List structure for your service
  // Return monthly cost estimate in USD
}
```

### Step 3: Test

```bash
# Start your server
npm run dev

# Check pricing cache status
curl http://localhost:5000/api/pricing/status

# Refresh pricing cache
curl -X POST http://localhost:5000/api/pricing/refresh

# Test feature pricing
# The feature will automatically use AWS pricing if available
```

## Current Service Coverage

The integration currently includes parsing logic for:

✅ **GuardDuty** - Threat detection  
✅ **Transit Gateway** - Network hub  
✅ **Network Firewall** - Managed firewall  
✅ **Free Services** - Organizations, Control Tower, IAM  

📋 **Mapped but using fallback:**
- Security Hub
- Inspector
- Macie
- CloudTrail
- CloudWatch
- OpenSearch
- Budgets
- Cost Explorer
- Backup
- Audit Manager

*These services are mapped but use manual pricing until parsers are added.*

## Manual Pricing Override

If you need to override AWS pricing for business reasons, you can:

1. **Keep manual pricing** - Don't add the feature to `aws-service-mapping.json`
2. **Hybrid approach** - Use AWS for infrastructure, manual for professional services (already implemented)
3. **Force fallback** - Set `infraCostImpact: 0` in cache to trigger fallback

## API Endpoints

### Refresh Pricing Cache

```bash
POST /api/pricing/refresh?region=us-east-2&force=true
```

**Parameters:**
- `region` (optional) - AWS region (default: us-east-2)
- `force` (optional) - Force refresh even if cache is valid (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Pricing cache refreshed successfully",
  "cache": {
    "lastUpdated": "2025-01-15T10:30:00.000Z",
    "publicationDate": "2025-01-15T10:30:00.000Z",
    "featuresCount": 16
  }
}
```

### Check Cache Status

```bash
GET /api/pricing/status
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "message": "Pricing cache is valid"
}
```

## Benefits

✅ **Accurate Pricing** - Always up-to-date with AWS official rates  
✅ **Reduced Maintenance** - No manual price updates needed  
✅ **Business Logic Preserved** - Professional services costs remain custom  
✅ **Performance** - 24-hour caching minimizes API calls  
✅ **Resilient** - Automatic fallback to manual pricing  

## Limitations & Future Enhancements

### Current Limitations

1. **In-memory cache** - Lost on server restart
2. **Simplified parsing** - Not all services fully parsed yet
3. **Single region** - Currently optimized for us-east-2
4. **No reservations** - Doesn't account for Reserved Instances or Savings Plans

### Recommended Enhancements

1. **Persistent Cache** - Store in PostgreSQL or Redis
2. **Comprehensive Parsing** - Add full parsers for all mapped services
3. **Multi-region Support** - Allow users to select pricing region
4. **Pricing Analytics** - Track pricing changes over time
5. **Scheduled Refresh** - Automatically refresh cache daily
6. **Price Alerts** - Notify when prices change significantly

## Testing

### Local Development

```bash
# Start development server
npm run dev

# In another terminal, test pricing refresh
curl -X POST http://localhost:5000/api/pricing/refresh

# Check a cost calculation
# Features with AWS pricing will use it automatically
```

### Production

```bash
# Set up scheduled refresh (cron or AWS EventBridge)
curl -X POST https://your-domain.com/api/pricing/refresh?region=us-east-2

# Monitor cache validity
curl https://your-domain.com/api/pricing/status
```

## Troubleshooting

### Issue: "Pricing cache is expired or not initialized"

**Solution:**
```bash
# Refresh the cache
curl -X POST http://localhost:5000/api/pricing/refresh
```

### Issue: Feature still using manual pricing

**Check:**
1. Is the feature in `aws-service-mapping.json`? ✅
2. Does the AWS offer code exist? Check [AWS Index](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json)
3. Is there a parser function in `aws-pricing-loader.ts`? ✅

### Issue: Pricing seems incorrect

**Verify:**
1. Check AWS official pricing page for the service
2. Review the parser logic in `aws-pricing-loader.ts`
3. Validate estimated usage assumptions (GB/month, etc.)

## Resources

- [AWS Price List API Documentation](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html)
- [AWS Price List Index](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json)
- [AWS Public Pricing Page](https://aws.amazon.com/pricing/)

## Support

For questions or issues with the pricing integration, refer to:
- `shared/aws-pricing-loader.ts` - Implementation details
- `shared/aws-service-mapping.json` - Service mappings
- `shared/pricing-loader.ts` - Integration layer

