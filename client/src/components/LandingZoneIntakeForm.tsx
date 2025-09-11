import { useState } from "react";
import { useLocation } from "wouter";
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfigurationCard from "./ConfigurationCard";
import CostCalculator from "./CostCalculator";
import ConfigurationDetails from "./ConfigurationDetails";
import FeatureSelector from "./FeatureSelector";
import { landingZoneConfigurations, LandingZoneConfig } from "@shared/schema";
import { CheckCircle, Settings, FileText } from "lucide-react";

export default function LandingZoneIntakeForm() {
  const [, setLocation] = useLocation();
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customEC2Count, setCustomEC2Count] = useState<number>(1);
  const [customStorageTB, setCustomStorageTB] = useState<number>(1);

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
    if (selectedConfiguration) {
      // Create URL parameters to pass data to summary page
      const params = new URLSearchParams({
        config: selectedConfiguration.size,
        features: selectedFeatures.join(','),
        ec2: customEC2Count.toString(),
        storage: customStorageTB.toString(),
      });
      
      // Navigate to summary page with data
      setLocation(`/summary?${params.toString()}`);
    }
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
        </div>
      </div>
    </div>
  );
}