# AWS Landing Zone Features Management Guide

## Overview
The features configuration system allows you to easily add, remove, and modify features for each AWS Landing Zone configuration size without touching application code.

## Configuration Files

### `shared/features-config.json`
This is the main configuration file containing:
- Feature definitions 
- Configuration size mappings
- Feature categories
- Version tracking

## How to Manage Features

### Adding a New Feature

1. **Add feature definition to the `features` array:**
```json
{
  "id": "new-feature-id",
  "name": "Display Name", 
  "description": "What this feature does",
  "category": "foundation|security|networking|automation|monitoring",
  "mandatory": false,
  "availableInSizes": ["small", "medium", "large"]
}
```

2. **Add pricing for the feature in `shared/pricing-config.json`:**
```json
"new-feature-id": {
  "infraCostImpact": 500,
  "professionalServicesCostImpact": 2000
}
```

3. **Add feature to configuration sizes in `configurationFeatures`:**
```json
"small": {
  "availableFeatures": [...existing..., "new-feature-id"],
  "mandatoryFeatures": [...existing...]
}
```

### Removing a Feature

1. Remove from `configurationFeatures` for all sizes
2. Remove from the `features` array
3. Remove pricing data from `pricing-config.json`

### Modifying Feature Availability

**To add a feature to a configuration size:**
```json
"medium": {
  "availableFeatures": [...existing..., "feature-id"]
}
```

**To make a feature mandatory:**
```json
"large": {
  "availableFeatures": [...existing...],
  "mandatoryFeatures": [...existing..., "feature-id"]
}
```

### Feature Categories

Current categories:
- **foundation**: Core AWS account setup
- **security**: Security monitoring and compliance
- **networking**: Network connectivity services
- **automation**: Infrastructure automation
- **monitoring**: Logging and observability

To add a new category:
1. Add to the `categories` array
2. Update the feature schema enum in code (requires development)

## Configuration Sizes

- **very-small**: 1-2 accounts (startups)
- **small**: 3-5 accounts (small businesses) 
- **medium**: 6-15 accounts (established businesses)
- **large**: 15+ accounts (enterprises)

## Best Practices

1. **Version Control**: Update the `version` and `lastUpdated` fields when making changes
2. **Testing**: Test changes in a development environment first
3. **Dependencies**: Ensure mandatory features are available in all required sizes
4. **Pricing**: Always add pricing data when adding new features
5. **Documentation**: Update feature descriptions to be clear and business-friendly

## Example: Adding AWS WAF Feature

```json
// In features array:
{
  "id": "aws-waf",
  "name": "AWS Web Application Firewall",
  "description": "Web application firewall for protecting against common exploits",
  "category": "security",
  "mandatory": false,
  "availableInSizes": ["medium", "large"]
}

// In pricing-config.json:
"aws-waf": {
  "infraCostImpact": 300,
  "professionalServicesCostImpact": 1500
}

// In configurationFeatures:
"medium": {
  "availableFeatures": [...existing..., "aws-waf"]
},
"large": {
  "availableFeatures": [...existing..., "aws-waf"]
}
```

## Validation

The system will automatically validate:
- Feature IDs are unique
- Referenced features exist in pricing config
- Mandatory features are available in configuration sizes
- Configuration sizes have valid feature references

Changes take effect immediately when the configuration files are updated.