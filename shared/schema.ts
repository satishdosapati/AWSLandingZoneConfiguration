import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { getFeaturePricing, getBasePricing } from "./pricing-loader";
import { getAllFeatures, getAvailableFeatureIds, getMandatoryFeatureIds } from "./features-loader";

// Feature definition schema
export const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  awsDefinition: z.string(),
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

// Presales Engineer Information Schema
export const presalesInfoSchema = z.object({
  presalesEngineerEmail: z.string().email("Please enter a valid email address"),
  partnerName: z.string().min(1, "Partner name is required"),
  endCustomerName: z.string().min(1, "End customer name is required"),
  awsReferenceIds: z.string().optional(), // Optional field for multiple AWS reference IDs
});

// Submission Metrics Schema for Reporting
export const submissionMetricsSchema = z.object({
  submissionId: z.string().uuid(), // Unique identifier for this submission
  submittedAt: z.date(), // Timestamp when the form was submitted
  sessionId: z.string(), // Session tracking identifier
  userAgent: z.string().optional(), // Browser/client information
  configurationSize: z.enum(["very-small", "small", "medium", "large"]), // Selected configuration size
  totalFeaturesSelected: z.number().min(0), // Count of features selected
  totalEstimatedCost: z.number().min(0), // Total estimated cost in dollars
  timeSpentOnForm: z.number().optional(), // Time in seconds from first interaction to submission
});

// Complete submission schema that combines all form data
export const landingZoneSubmissionSchema = z.object({
  costCalculation: costCalculationSchema,
  presalesInfo: presalesInfoSchema,
  submissionMetrics: submissionMetricsSchema,
});

// Insert schemas using drizzle-zod
export const insertPresalesInfoSchema = presalesInfoSchema;
export const insertSubmissionMetricsSchema = submissionMetricsSchema.omit({ 
  submissionId: true, 
  submittedAt: true 
}); // Omit auto-generated fields
export const insertLandingZoneSubmissionSchema = landingZoneSubmissionSchema.omit({
  submissionMetrics: true
}).extend({
  submissionMetrics: insertSubmissionMetricsSchema
});

// Type exports
export type Feature = z.infer<typeof featureSchema>;
export type LandingZoneConfig = z.infer<typeof landingZoneConfigSchema>;
export type CostCalculation = z.infer<typeof costCalculationSchema>;
export type PresalesInfo = z.infer<typeof presalesInfoSchema>;
export type SubmissionMetrics = z.infer<typeof submissionMetricsSchema>;
export type LandingZoneSubmission = z.infer<typeof landingZoneSubmissionSchema>;

// Insert types
export type InsertPresalesInfo = z.infer<typeof insertPresalesInfoSchema>;
export type InsertSubmissionMetrics = z.infer<typeof insertSubmissionMetricsSchema>;
export type InsertLandingZoneSubmission = z.infer<typeof insertLandingZoneSubmissionSchema>;

// Load features from external configuration
export const availableFeatures: Feature[] = getAllFeatures();

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
    availableFeatures: getAvailableFeatureIds("very-small"),
    mandatoryFeatures: getMandatoryFeatureIds("very-small"),
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
    availableFeatures: getAvailableFeatureIds("small"),
    mandatoryFeatures: getMandatoryFeatureIds("small"),
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
    availableFeatures: getAvailableFeatureIds("medium"),
    mandatoryFeatures: getMandatoryFeatureIds("medium"),
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
    availableFeatures: getAvailableFeatureIds("large"),
    mandatoryFeatures: getMandatoryFeatureIds("large"),
  },
];
