import { z } from "zod";
import { getFeaturePricing, getBasePricing } from "./pricing-loader";

// Feature definition schema
export const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(["foundation", "security", "networking", "automation", "monitoring"]),
  mandatory: z.boolean(),
  infraCostImpact: z.number(), // Additional monthly infrastructure cost
  professionalServicesCostImpact: z.number(), // Additional one-time professional services cost
  availableInSizes: z.array(z.enum(["very-small", "small", "medium", "large"])),
});

// AWS Landing Zone Configuration Types
export const landingZoneConfigSchema = z.object({
  size: z.enum(["very-small", "small", "medium", "large"]),
  name: z.string(),
  description: z.string(),
  accountStructure: z.string(),
  organizationalStructure: z.string(),
  defaultVMs: z.number(),
  defaultStorageTB: z.number(),
  baseInfraCostPerMonth: z.number(), // Base infrastructure cost without features
  baseProfessionalServicesCost: z.number(), // Base professional services cost without features
  managedServicesCostPerEC2: z.number(), // Cost per EC2 instance managed
  managedServicesCostPerTBStorage: z.number(), // Cost per TB of storage managed
  availableFeatures: z.array(z.string()), // Array of feature IDs available for this size
  mandatoryFeatures: z.array(z.string()), // Array of mandatory feature IDs
});

export const costCalculationSchema = z.object({
  selectedConfig: z.string(),
  selectedFeatures: z.array(z.string()),
  customEC2Count: z.number(),
  customStorageTB: z.number(),
});

export type Feature = z.infer<typeof featureSchema>;
export type LandingZoneConfig = z.infer<typeof landingZoneConfigSchema>;
export type CostCalculation = z.infer<typeof costCalculationSchema>;

// Feature definitions
export const availableFeatures: Feature[] = [
  {
    id: "aws-organizations",
    name: "AWS Organizations",
    description: "Basic account organization and management",
    category: "foundation",
    mandatory: true,
    ...getFeaturePricing("aws-organizations"),
    availableInSizes: ["very-small", "small", "medium", "large"],
  },
  {
    id: "control-tower",
    name: "AWS Control Tower",
    description: "Landing zone setup and governance with guardrails",
    category: "foundation",
    mandatory: false,
    ...getFeaturePricing("control-tower"),
    availableInSizes: ["small", "medium", "large"],
  },
  {
    id: "control-tower-extensions",
    name: "Control Tower Custom Extensions",
    description: "Advanced Control Tower customizations and extensions",
    category: "foundation",
    mandatory: false,
    ...getFeaturePricing("control-tower-extensions"),
    availableInSizes: ["large"],
  },
  {
    id: "guardduty",
    name: "Amazon GuardDuty",
    description: "Threat detection and security monitoring",
    category: "security",
    mandatory: false,
    ...getFeaturePricing("guardduty"),
    availableInSizes: ["very-small", "small", "medium", "large"],
  },
  {
    id: "security-hub",
    name: "AWS Security Hub",
    description: "Centralized security findings and compliance dashboard",
    category: "security",
    mandatory: false,
    ...getFeaturePricing("security-hub"),
    availableInSizes: ["small", "medium", "large"],
  },
  {
    id: "inspector",
    name: "Amazon Inspector",
    description: "Automated security assessment for applications",
    category: "security",
    mandatory: false,
    ...getFeaturePricing("inspector"),
    availableInSizes: ["small", "medium", "large"],
  },
  {
    id: "network-firewall",
    name: "AWS Network Firewall",
    description: "Managed network firewall service",
    category: "networking",
    mandatory: false,
    ...getFeaturePricing("network-firewall"),
    availableInSizes: ["medium", "large"],
  },
  {
    id: "transit-gateway",
    name: "AWS Transit Gateway",
    description: "Network transit hub for VPC connectivity",
    category: "networking",
    mandatory: false,
    ...getFeaturePricing("transit-gateway"),
    availableInSizes: ["small", "medium", "large"],
  },
  {
    id: "direct-connect",
    name: "AWS Direct Connect",
    description: "Dedicated network connection to AWS",
    category: "networking",
    mandatory: false,
    ...getFeaturePricing("direct-connect"),
    availableInSizes: ["medium", "large"],
  },
  {
    id: "systems-manager",
    name: "AWS Systems Manager",
    description: "Operational data and automation across AWS resources",
    category: "automation",
    mandatory: false,
    ...getFeaturePricing("systems-manager"),
    availableInSizes: ["small", "medium", "large"],
  },
  {
    id: "cloudformation-stacksets",
    name: "CloudFormation StackSets",
    description: "Deploy CloudFormation stacks across multiple accounts",
    category: "automation",
    mandatory: false,
    ...getFeaturePricing("cloudformation-stacksets"),
    availableInSizes: ["medium", "large"],
  },
  {
    id: "account-factory-terraform",
    name: "Account Factory for Terraform (AFT)",
    description: "Automated account provisioning with Terraform",
    category: "automation",
    mandatory: false,
    ...getFeaturePricing("account-factory-terraform"),
    availableInSizes: ["large"],
  },
  {
    id: "cloudwatch-enhanced",
    name: "Enhanced CloudWatch Monitoring",
    description: "Advanced monitoring, dashboards, and alerting",
    category: "monitoring",
    mandatory: false,
    ...getFeaturePricing("cloudwatch-enhanced"),
    availableInSizes: ["medium", "large"],
  },
  {
    id: "cloudtrail-organization",
    name: "Organization-wide CloudTrail",
    description: "Centralized audit logging across all accounts",
    category: "monitoring",
    mandatory: true,
    ...getFeaturePricing("cloudtrail-organization"),
    availableInSizes: ["small", "medium", "large"],
  },
  {
    id: "elasticsearch-logging",
    name: "Elasticsearch Service for Logging",
    description: "Advanced log analytics and search capabilities",
    category: "monitoring",
    mandatory: false,
    ...getFeaturePricing("elasticsearch-logging"),
    availableInSizes: ["large"],
  },
];

// AWS Landing Zone configurations data
export const landingZoneConfigurations: LandingZoneConfig[] = [
  {
    size: "very-small",
    name: "Very Small Customers (1-2 accounts)",
    description: "Perfect for startups and small businesses with minimal AWS infrastructure needs",
    accountStructure: "Management account + 1 workload account",
    organizationalStructure: "Minimal AWS Organizations structure with Root and Workloads OU",
    defaultVMs: 2,
    defaultStorageTB: 1,
    ...getBasePricing("very-small")!,
    availableFeatures: ["aws-organizations", "guardduty"],
    mandatoryFeatures: ["aws-organizations"],
  },
  {
    size: "small",
    name: "Small Customers (3-5 accounts/apps)",
    description: "Ideal for growing companies with multiple applications and environments",
    accountStructure: "Management, Log archive, Audit accounts + 1+ workload accounts",
    organizationalStructure: "Basic AWS Organizations structure with Root, Core OU (Log, Audit), and Workloads OU",
    defaultVMs: 8,
    defaultStorageTB: 5,
    ...getBasePricing("small")!,
    availableFeatures: ["aws-organizations", "control-tower", "guardduty", "security-hub", "inspector", "transit-gateway", "systems-manager", "cloudtrail-organization"],
    mandatoryFeatures: ["aws-organizations", "cloudtrail-organization"],
  },
  {
    size: "medium",
    name: "Medium Customers (6-15 accounts/apps)",
    description: "Suitable for established businesses with complex multi-environment setups",
    accountStructure: "Management, Log archive, Audit, Shared services accounts + Separate Dev, Test, Prod accounts + business unit/app accounts",
    organizationalStructure: "More complex OU structure with Root, Core OU (Log, Audit, Shared Services), Prod OU, Non-Prod OU, Sandbox OU",
    defaultVMs: 25,
    defaultStorageTB: 15,
    ...getBasePricing("medium")!,
    availableFeatures: ["aws-organizations", "control-tower", "guardduty", "security-hub", "inspector", "network-firewall", "transit-gateway", "direct-connect", "systems-manager", "cloudformation-stacksets", "cloudwatch-enhanced", "cloudtrail-organization"],
    mandatoryFeatures: ["aws-organizations", "cloudtrail-organization"],
  },
  {
    size: "large",
    name: "Large Customers (15+ accounts/apps)",
    description: "Enterprise-grade solution for large organizations with extensive AWS infrastructure",
    accountStructure: "Management, Log archive, Audit, Security, Shared services, Network accounts + Separate Dev, Test, Stage, Prod accounts + business unit/department/app accounts",
    organizationalStructure: "Comprehensive OU structure with Root, Infrastructure OU (Core, Network, Security), Prod OU (by business unit), Non-Prod OU (by business unit), Sandbox OU, Suspended OU",
    defaultVMs: 100,
    defaultStorageTB: 50,
    ...getBasePricing("large")!,
    availableFeatures: ["aws-organizations", "control-tower", "control-tower-extensions", "guardduty", "security-hub", "inspector", "network-firewall", "transit-gateway", "direct-connect", "systems-manager", "cloudformation-stacksets", "account-factory-terraform", "cloudwatch-enhanced", "cloudtrail-organization", "elasticsearch-logging"],
    mandatoryFeatures: ["aws-organizations", "cloudtrail-organization"],
  },
];
