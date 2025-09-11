import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { metricsTracker, calculateFormSections } from "@/utils/metricsTracker";

export default function LandingZoneIntakeForm() {
  const [, setLocation] = useLocation();
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customEC2Count, setCustomEC2Count] = useState<number>(1);
  const [customStorageTB, setCustomStorageTB] = useState<number>(1);
  const { toast } = useToast();
  
  // Enhanced metrics tracking
  const formStartTime = useRef<Date>(new Date());
  const sessionId = useRef<string>(crypto.randomUUID());

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
  
  // Track form completion rate
  useEffect(() => {
    const sections = calculateFormSections(form.getValues(), selectedConfig, selectedFeatures);
    metricsTracker.updateFormCompletionRate(sections.completed, sections.total);
  }, [form.watch(), selectedConfig, selectedFeatures]);

  const selectedConfiguration = landingZoneConfigurations.find(
    config => config.size === selectedConfig
  );

  // Enhanced configuration selection with metrics
  const handleConfigSelection = (value: string) => {
    setSelectedConfig(value);
    metricsTracker.trackConfigurationChange();
    
    const config = landingZoneConfigurations.find(c => c.size === value);
    if (config) {
      setCustomEC2Count(config.defaultVMs);
      setCustomStorageTB(config.defaultStorageTB);
      // Set mandatory features as selected by default
      setSelectedFeatures(config.mandatoryFeatures);
      
      // Track mandatory feature acceptance
      config.mandatoryFeatures.forEach(featureId => {
        metricsTracker.trackFeatureAcceptance(featureId, true);
      });
    }
  };

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    // Track feature toggle metrics
    metricsTracker.trackFeatureToggle(featureId, enabled);
    if (enabled) {
      metricsTracker.trackFeatureAcceptance(featureId, false);
    }
    
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

  // Mutation for submitting form data to API
  const submitMutation = useMutation({
    mutationFn: async (submissionData: any) => {
      const response = await apiRequest('POST', '/api/submissions', submissionData);
      return await response.json();
    },
    onSuccess: (data, variables) => {
      console.log('Form submitted successfully:', data);
      
      toast({
        title: "Form submitted successfully!",
        description: `Submission ID: ${data.submissionId}`,
      });
      
      // Navigate to summary page with original URL parameters for display
      if (selectedConfiguration) {
        const params = new URLSearchParams({
          config: selectedConfiguration.size,
          features: selectedFeatures.join(','),
          ec2: customEC2Count.toString(),
          storage: customStorageTB.toString(),
          presalesEmail: variables.presalesInfo.presalesEngineerEmail,
          partnerName: variables.presalesInfo.partnerName,
          customerName: variables.presalesInfo.endCustomerName,
          awsReferenceIds: variables.presalesInfo.awsReferenceIds || '',
          submissionId: data.submissionId,
        });
        setLocation(`/summary?${params.toString()}`);
      }
    },
    onError: (error) => {
      console.error('Error submitting form:', error);
      
      toast({
        title: "Submission failed",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const handleSubmit = async () => {
    // Validate presales form first
    form.handleSubmit(async (presalesData) => {
      if (selectedConfiguration) {
        // Calculate total cost for metrics
        const { calculateCosts } = await import('@shared/costCalculations');
        const costBreakdown = calculateCosts(
          selectedConfiguration,
          selectedFeatures,
          customEC2Count,
          customStorageTB
        );
        
        // Generate comprehensive metrics
        const enhancedMetrics = metricsTracker.generateSubmissionMetrics(
          costBreakdown.totalFirstYearCost,
          customEC2Count,
          customStorageTB
        );
        
        // Prepare submission data
        const submissionData = {
          costCalculation: {
            selectedConfig: selectedConfiguration.size,
            selectedFeatures,
            customEC2Count,
            customStorageTB,
          },
          presalesInfo: presalesData,
          submissionMetrics: {
            ...enhancedMetrics,
            configurationSize: selectedConfiguration.size,
            totalFeaturesSelected: selectedFeatures.length,
          },
        };
        
        // Submit to API
        submitMutation.mutate(submissionData);
      }
    }, (errors) => {
      console.log('Form validation errors:', errors);
      
      // Track validation errors for metrics
      Object.keys(errors).forEach(fieldName => {
        metricsTracker.trackValidationError(fieldName);
      });
      
      toast({
        title: "Please check your inputs",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      
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
                isSubmitting={submitMutation.isPending}
              />
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}