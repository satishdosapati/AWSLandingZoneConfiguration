import { useEffect, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { landingZoneConfigurations, availableFeatures, LandingZoneConfig, Feature } from "@shared/schema";
import { calculateCosts, CostBreakdown } from "@/utils/costCalculations";
import { getPricingVersion } from "@shared/pricing-loader";
import { ArrowLeft, Download, FileText, CheckCircle, AlertCircle, Building, Wrench, Settings, Server, HardDrive } from "lucide-react";

interface SummaryData {
  configSize: string;
  selectedFeatures: string[];
  customEC2Count: number;
  customStorageTB: number;
}

// PDF Styles for professional Ingram Micro letterhead
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #1B4B8C',
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4B8C',
    marginBottom: 5,
  },
  companyTagline: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  documentSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4B8C',
    marginBottom: 10,
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 5,
  },
  configCard: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  configName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  configDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  resourceLabel: {
    fontSize: 10,
    color: '#4B5563',
  },
  resourceValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  featureItem: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#F0F9FF',
    borderLeft: '3px solid #0EA5E9',
  },
  featureName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 10,
    color: '#475569',
  },
  costSection: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  costTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4B8C',
    marginBottom: 10,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  costLabel: {
    fontSize: 11,
    color: '#4B5563',
  },
  costValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #D1D5DB',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B4B8C',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B4B8C',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1px solid #E5E7EB',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
});

// PDF Document Component
const ConfigurationPDFDocument = ({ 
  config, 
  selectedFeatureObjects, 
  costs, 
  customEC2Count, 
  customStorageTB 
}: {
  config: LandingZoneConfig;
  selectedFeatureObjects: Feature[];
  costs: CostBreakdown;
  customEC2Count: number;
  customStorageTB: number;
}) => {
  const pricingInfo = getPricingVersion();
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header with Ingram Micro Branding */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.companyName}>Ingram Micro</Text>
          <Text style={pdfStyles.companyTagline}>Technology Solutions • Digital Transformation • Cloud Services</Text>
          <Text style={pdfStyles.documentTitle}>AWS Landing Zone Configuration Summary</Text>
          <Text style={pdfStyles.documentSubtitle}>Generated on {currentDate}</Text>
        </View>

        {/* Selected Configuration */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Selected Configuration</Text>
          <View style={pdfStyles.configCard}>
            <Text style={pdfStyles.configName}>{config.name}</Text>
            <Text style={pdfStyles.configDescription}>{config.description}</Text>
            <View style={pdfStyles.resourceRow}>
              <Text style={pdfStyles.resourceLabel}>Account Structure:</Text>
              <Text style={pdfStyles.resourceValue}>{config.accountStructure}</Text>
            </View>
            <View style={pdfStyles.resourceRow}>
              <Text style={pdfStyles.resourceLabel}>Organization Structure:</Text>
              <Text style={pdfStyles.resourceValue}>{config.organizationalStructure}</Text>
            </View>
            <View style={pdfStyles.resourceRow}>
              <Text style={pdfStyles.resourceLabel}>EC2 Instances:</Text>
              <Text style={pdfStyles.resourceValue}>{customEC2Count}</Text>
            </View>
            <View style={pdfStyles.resourceRow}>
              <Text style={pdfStyles.resourceLabel}>Storage:</Text>
              <Text style={pdfStyles.resourceValue}>{customStorageTB} TB</Text>
            </View>
          </View>
        </View>

        {/* Selected Features */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Selected Features ({selectedFeatureObjects.length})</Text>
          {selectedFeatureObjects.map((feature) => (
            <View key={feature.id} style={pdfStyles.featureItem}>
              <Text style={pdfStyles.featureName}>{feature.name}</Text>
              <Text style={pdfStyles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>

        {/* Cost Breakdown */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Cost Breakdown</Text>
          
          {/* Infrastructure Costs */}
          <View style={pdfStyles.costSection}>
            <Text style={pdfStyles.costTitle}>Infrastructure Costs (Monthly)</Text>
            <View style={pdfStyles.costRow}>
              <Text style={pdfStyles.costLabel}>Base Infrastructure</Text>
              <Text style={pdfStyles.costValue}>${costs.baseInfrastructureCost.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.costRow}>
              <Text style={pdfStyles.costLabel}>Features Add-on</Text>
              <Text style={pdfStyles.costValue}>${costs.featuresInfrastructureCost.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total Infrastructure</Text>
              <Text style={pdfStyles.totalValue}>${costs.totalInfrastructureCost.toLocaleString()}/month</Text>
            </View>
          </View>

          {/* Professional Services */}
          <View style={pdfStyles.costSection}>
            <Text style={pdfStyles.costTitle}>Professional Services (One-time)</Text>
            <View style={pdfStyles.costRow}>
              <Text style={pdfStyles.costLabel}>Base Implementation</Text>
              <Text style={pdfStyles.costValue}>${costs.baseProfessionalServicesCost.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.costRow}>
              <Text style={pdfStyles.costLabel}>Features Setup</Text>
              <Text style={pdfStyles.costValue}>${costs.featuresProfessionalServicesCost.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total Professional Services</Text>
              <Text style={pdfStyles.totalValue}>${costs.totalProfessionalServicesCost.toLocaleString()}</Text>
            </View>
          </View>

          {/* Managed Services */}
          <View style={pdfStyles.costSection}>
            <Text style={pdfStyles.costTitle}>Managed Services (Monthly)</Text>
            <View style={pdfStyles.costRow}>
              <Text style={pdfStyles.costLabel}>EC2 Management</Text>
              <Text style={pdfStyles.costValue}>${costs.managedServicesEC2Cost.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.costRow}>
              <Text style={pdfStyles.costLabel}>Storage Management</Text>
              <Text style={pdfStyles.costValue}>${costs.managedServicesStorageCost.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total Managed Services</Text>
              <Text style={pdfStyles.totalValue}>${costs.totalManagedServicesCost.toLocaleString()}/month</Text>
            </View>
          </View>

          {/* Grand Totals */}
          <View style={pdfStyles.costSection}>
            <Text style={pdfStyles.costTitle}>Summary</Text>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total Monthly Cost</Text>
              <Text style={pdfStyles.totalValue}>${costs.totalMonthlyCost.toLocaleString()}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>First Year Total</Text>
              <Text style={pdfStyles.totalValue}>${costs.totalFirstYearCost.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>
            This configuration summary was generated using Ingram Micro's AWS Landing Zone Calculator (v{pricingInfo.version})
          </Text>
          <Text style={pdfStyles.footerText}>
            Pricing data last updated: {pricingInfo.lastUpdated} | Currency: {pricingInfo.currency}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default function SummaryPage() {
  const [location] = useLocation();
  const [match] = useRoute("/summary");
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [config, setConfig] = useState<LandingZoneConfig | null>(null);
  const [costs, setCosts] = useState<CostBreakdown | null>(null);
  const [selectedFeatureObjects, setSelectedFeatureObjects] = useState<Feature[]>([]);

  useEffect(() => {
    if (match) {
      // Parse URL parameters to get configuration data
      const urlParams = new URLSearchParams(window.location.search);
      const configSize = urlParams.get('config');
      const featuresParam = urlParams.get('features');
      const ec2Count = urlParams.get('ec2');
      const storageTB = urlParams.get('storage');

      if (configSize && ec2Count && storageTB) {
        const data: SummaryData = {
          configSize,
          selectedFeatures: featuresParam ? featuresParam.split(',') : [],
          customEC2Count: parseInt(ec2Count, 10),
          customStorageTB: parseInt(storageTB, 10),
        };
        
        setSummaryData(data);

        // Find the configuration
        const selectedConfig = landingZoneConfigurations.find(c => c.size === configSize);
        if (selectedConfig) {
          setConfig(selectedConfig);
          
          // Calculate costs
          const calculatedCosts = calculateCosts(
            selectedConfig, 
            data.selectedFeatures, 
            data.customEC2Count, 
            data.customStorageTB
          );
          setCosts(calculatedCosts);

          // Get selected feature objects
          const features = availableFeatures.filter(feature => 
            data.selectedFeatures.includes(feature.id) && 
            feature.availableInSizes.includes(selectedConfig.size)
          );
          setSelectedFeatureObjects(features);
        }
      }
    }
  }, [location, match]);

  if (!summaryData || !config || !costs) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load configuration data. Please return to the main form and try again.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Configuration Form
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Group features by category for better organization
  const featuresByCategory = selectedFeatureObjects.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  const categoryNames = {
    foundation: "Foundation Services",
    security: "Security & Compliance",
    networking: "Networking",
    automation: "Automation & Management",
    monitoring: "Monitoring & Logging",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Configuration Summary</h1>
              <p className="text-muted-foreground">
                Review your AWS Landing Zone configuration and download the comprehensive report
              </p>
            </div>
            <div className="flex gap-2">
              <PDFDownloadLink
                document={
                  <ConfigurationPDFDocument
                    config={config}
                    selectedFeatureObjects={selectedFeatureObjects}
                    costs={costs}
                    customEC2Count={summaryData.customEC2Count}
                    customStorageTB={summaryData.customStorageTB}
                  />
                }
                fileName={`aws-landing-zone-${config.size}-configuration.pdf`}
              >
                {({ loading }) => (
                  <Button data-testid="button-download-pdf" disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Generating PDF...' : 'Download PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
              
              <Link href="/">
                <Button variant="outline" data-testid="button-back-to-form">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Form
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Selected Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2" data-testid="text-config-name">
                      {config.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">{config.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">Account Structure</h4>
                        <p className="text-muted-foreground">{config.accountStructure}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Organizational Structure</h4>
                        <p className="text-muted-foreground">{config.organizationalStructure}</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">EC2 Instances:</span>
                        <Badge variant="outline" data-testid="text-summary-ec2">
                          {summaryData.customEC2Count}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Storage:</span>
                        <Badge variant="outline" data-testid="text-summary-storage">
                          {summaryData.customStorageTB} TB
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Features */}
              {selectedFeatureObjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Selected Features ({selectedFeatureObjects.length})
                    </CardTitle>
                    <CardDescription>
                      Additional services and capabilities included in your configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(featuresByCategory).map(([category, features]) => (
                        <div key={category}>
                          <h4 className="font-semibold mb-3">{categoryNames[category as keyof typeof categoryNames]}</h4>
                          <div className="grid gap-3">
                            {features.map((feature) => (
                              <div 
                                key={feature.id} 
                                className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border-l-4 border-blue-500"
                                data-testid={`feature-${feature.id}`}
                              >
                                <h5 className="font-medium mb-1">{feature.name}</h5>
                                <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">{feature.awsDefinition}</p>
                                {feature.mandatory && (
                                  <Badge variant="secondary" className="mt-2">Mandatory</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Cost Summary Sidebar */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Cost Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Infrastructure Costs */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-sm">Infrastructure (Monthly)</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base</span>
                        <span>${costs.baseInfrastructureCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Features</span>
                        <span>+${costs.featuresInfrastructureCost.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-blue-700 dark:text-blue-300" data-testid="text-summary-infrastructure">
                          ${costs.totalInfrastructureCost.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Services */}
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold text-sm">Professional Services</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base</span>
                        <span>${costs.baseProfessionalServicesCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Features</span>
                        <span>+${costs.featuresProfessionalServicesCost.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-green-700 dark:text-green-300" data-testid="text-summary-professional">
                          ${costs.totalProfessionalServicesCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Managed Services */}
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold text-sm">Managed Services (Monthly)</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">EC2</span>
                        <span>${costs.managedServicesEC2Cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage</span>
                        <span>${costs.managedServicesStorageCost.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-purple-700 dark:text-purple-300" data-testid="text-summary-managed">
                          ${costs.totalManagedServicesCost.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grand Totals */}
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total Monthly</span>
                        <span className="text-primary" data-testid="text-summary-monthly-total">
                          ${costs.totalMonthlyCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">First Year Total</span>
                        <span className="font-semibold" data-testid="text-summary-annual-total">
                          ${costs.totalFirstYearCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PDF Download */}
                  <PDFDownloadLink
                    document={
                      <ConfigurationPDFDocument
                        config={config}
                        selectedFeatureObjects={selectedFeatureObjects}
                        costs={costs}
                        customEC2Count={summaryData.customEC2Count}
                        customStorageTB={summaryData.customStorageTB}
                      />
                    }
                    fileName={`aws-landing-zone-${config.size}-configuration.pdf`}
                  >
                    {({ loading }) => (
                      <Button 
                        className="w-full" 
                        disabled={loading}
                        data-testid="button-download-pdf-sidebar"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? 'Generating...' : 'Download Report'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}