import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ConfigurationCard from "./ConfigurationCard";
import CostCalculator from "./CostCalculator";
import ConfigurationDetails from "./ConfigurationDetails";
import FeatureSelector from "./FeatureSelector";
import { landingZoneConfigurations, LandingZoneConfig, presalesInfoSchema, type PresalesInfo } from "@shared/schema";
import { CheckCircle, Settings, FileText, User } from "lucide-react";

export default function LandingZoneIntakeForm() {
  const [, setLocation] = useLocation();
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customEC2Count, setCustomEC2Count] = useState<number>(1);
  const [customStorageTB, setCustomStorageTB] = useState<number>(1);

  // Form setup for presales information
  const form = useForm<PresalesInfo>({
    resolver: zodResolver(presalesInfoSchema),
    defaultValues: {
      presalesEngineerEmail: "",
      partnerName: "",
      endCustomerName: "",
      awsReferenceIds: "",
    },
  });

  const selectedConfiguration = landingZoneConfigurations.find(
    config => config.size === selectedConfig
  );

  // Set default values when configuration changes
  const handleConfigSelection = (value: string) => {
    setSelectedConfig(value);
    const config = landingZoneConfigurations.find(c => c.size === value);
    if (config) {
      setCustomEC2Count(config.defaultVMs);
      setCustomStorageTB(config.defaultStorageTB);
      // Set mandatory features as selected by default
      setSelectedFeatures(config.mandatoryFeatures);
    }
  };

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    setSelectedFeatures(prev => {
      if (enabled) {
        return [...prev, featureId];
      } else {
        return prev.filter(id => id !== featureId);
      }
    });
  };

  const handleExportPDF = () => {
    console.log('Export PDF functionality - to be implemented');
    // TODO: Implement PDF export functionality
  };

  const handleExportCSV = () => {
    console.log('Export CSV functionality - to be implemented');  
    // TODO: Implement CSV export functionality
  };

  const handleSubmit = () => {
    // Validate presales form first
    form.handleSubmit((presalesData) => {
      if (selectedConfiguration) {
        // Create URL parameters to pass data to summary page
        const params = new URLSearchParams({
          config: selectedConfiguration.size,
          features: selectedFeatures.join(','),
          ec2: customEC2Count.toString(),
          storage: customStorageTB.toString(),
          // Add presales information
          presalesEmail: presalesData.presalesEngineerEmail,
          partnerName: presalesData.partnerName,
          customerName: presalesData.endCustomerName,
          awsReferenceIds: presalesData.awsReferenceIds || '',
        });
        
        // Navigate to summary page with data
        setLocation(`/summary?${params.toString()}`);
      }
    }, (errors) => {
      console.log('Form validation errors:', errors);
      // Scroll to top to show validation errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold mb-2">AWS Landing Zone Configuration</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the right AWS Landing Zone configuration for your organization. 
              Our tool provides detailed cost estimates and technical specifications.
            </p>
          </div>

          <Form {...form}>
            {/* Presales Information Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Presales Information
                </CardTitle>
                <CardDescription>
                  Please provide your contact information and customer details for this AWS Landing Zone configuration request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="presalesEngineerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presales Engineer Email *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="engineer@partner.com"
                            data-testid="input-presales-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partnerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Consulting Partner Name"
                            data-testid="input-partner-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="endCustomerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Customer Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Customer Organization Name"
                            data-testid="input-customer-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="awsReferenceIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AWS Reference IDs (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter AWS Account IDs, Case Numbers, or other reference identifiers (one per line)"
                            className="min-h-[80px]"
                            data-testid="textarea-aws-reference-ids"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-12 gap-4">
              {/* Configuration Selection */}
              <div className="lg:col-span-8 space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Choose Your Configuration
                  </CardTitle>
                  <CardDescription>
                    Select the AWS Landing Zone configuration that best matches your organization size and requirements.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={selectedConfig} 
                    onValueChange={handleConfigSelection}
                    className="space-y-3"
                    data-testid="radiogroup-configurations"
                  >
                    {landingZoneConfigurations.map((config) => (
                      <ConfigurationCard
                        key={config.size}
                        config={config}
                        value={config.size}
                        isSelected={selectedConfig === config.size}
                      />
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Configuration Details */}
              {selectedConfiguration && (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Technical Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Selected Configuration: {selectedConfiguration.name}
                        </CardTitle>
                        <CardDescription>
                          {selectedConfiguration.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <h4 className="font-semibold">Account Structure</h4>
                            <p className="text-muted-foreground">{selectedConfiguration.accountStructure}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold">Default Resources</h4>
                            <p className="text-muted-foreground">
                              {selectedConfiguration.defaultVMs} VMs, {selectedConfiguration.defaultStorageTB}TB storage
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="details" className="mt-3">
                    <ConfigurationDetails config={selectedConfiguration} />
                  </TabsContent>
                </Tabs>
              )}

              {/* Feature Selection */}
              {selectedConfiguration && (
                <div className="mt-3">
                  <FeatureSelector
                    selectedConfig={selectedConfiguration}
                    selectedFeatures={selectedFeatures}
                    onFeatureToggle={handleFeatureToggle}
                  />
                </div>
              )}
            </div>

            {/* Cost Calculator Sidebar */}
            <div className="lg:col-span-4">
              <CostCalculator
                selectedConfig={selectedConfiguration || null}
                selectedFeatures={selectedFeatures}
                customEC2Count={customEC2Count}
                customStorageTB={customStorageTB}
                onEC2Change={(value) => setCustomEC2Count(value[0])}
                onStorageChange={(value) => setCustomStorageTB(value[0])}
                onSubmit={handleSubmit}
                onExportPDF={handleExportPDF}
                onExportCSV={handleExportCSV}
              />
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}