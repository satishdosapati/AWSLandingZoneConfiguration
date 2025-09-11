import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LandingZoneConfig } from "@shared/schema";
import { calculateCosts } from "@/utils/costCalculations";
import { Calculator, DollarSign, Server, HardDrive, Building, Wrench, Settings, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CostCalculatorProps {
  selectedConfig: LandingZoneConfig | null;
  selectedFeatures: string[];
  customEC2Count: number;
  customStorageTB: number;
  onEC2Change: (value: number[]) => void;
  onStorageChange: (value: number[]) => void;
  onSubmit: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export default function CostCalculator({ 
  selectedConfig, 
  selectedFeatures,
  customEC2Count, 
  customStorageTB, 
  onEC2Change, 
  onStorageChange,
  onSubmit,
  onExportPDF,
  onExportCSV
}: CostCalculatorProps) {
  if (!selectedConfig) {
    return (
      <Card className="sticky top-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            <CardTitle>Cost Calculator</CardTitle>
          </div>
          <CardDescription>
            Select a configuration to see cost estimates
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Choose a landing zone configuration to calculate costs</p>
        </CardContent>
      </Card>
    );
  }

  const costs = calculateCosts(selectedConfig, selectedFeatures, customEC2Count, customStorageTB);

  return (
    <div className="sticky top-6">
      <Card data-testid="card-cost-calculator">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            <CardTitle>Cost Calculator</CardTitle>
          </div>
          <CardDescription>
            Customize resources for {selectedConfig.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Resource Customization */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span className="text-sm font-medium">EC2 Instances</span>
              </div>
              <Badge variant="outline" data-testid="text-ec2-count">{customEC2Count}</Badge>
            </div>
            <Slider
              value={[customEC2Count]}
              onValueChange={onEC2Change}
              max={200}
              min={1}
              step={1}
              className="w-full"
              data-testid="slider-ec2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1</span>
              <span>200</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="text-sm font-medium">Storage (TB)</span>
              </div>
              <Badge variant="outline" data-testid="text-storage-count">{customStorageTB}</Badge>
            </div>
            <Slider
              value={[customStorageTB]}
              onValueChange={onStorageChange}
              max={500}
              min={1}
              step={1}
              className="w-full"
              data-testid="slider-storage"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 TB</span>
              <span>500 TB</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Three Separate Cost Estimates */}
        <div className="space-y-3">
          {/* 1. Infrastructure Monthly Cost */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Infrastructure (Monthly)</h4>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Infrastructure</span>
                <span className="font-mono">${costs.baseInfrastructureCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Features Add-on</span>
                <span className="font-mono">+${costs.featuresInfrastructureCost.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Infrastructure</span>
                <span className="font-mono text-blue-700 dark:text-blue-300" data-testid="text-total-infrastructure">
                  ${costs.totalInfrastructureCost.toLocaleString()}/month
                </span>
              </div>
            </div>
          </div>

          {/* 2. Professional Services (One-time) */}
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold text-sm text-green-900 dark:text-green-100">Professional Services (One-time)</h4>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Implementation</span>
                <span className="font-mono">${costs.baseProfessionalServicesCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Features Setup</span>
                <span className="font-mono">+${costs.featuresProfessionalServicesCost.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Professional Services</span>
                <span className="font-mono text-green-700 dark:text-green-300" data-testid="text-total-professional">
                  ${costs.totalProfessionalServicesCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Managed Services (Monthly) */}
          <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Managed Services (Monthly)</h4>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">EC2 Management ({customEC2Count} instances)</span>
                <span className="font-mono">${costs.managedServicesEC2Cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage Management ({customStorageTB} TB)</span>
                <span className="font-mono">${costs.managedServicesStorageCost.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Managed Services</span>
                <span className="font-mono text-purple-700 dark:text-purple-300" data-testid="text-total-managed">
                  ${costs.totalManagedServicesCost.toLocaleString()}/month
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="space-y-1.5">
              <div className="flex justify-between text-base font-semibold">
                <span>Total Monthly Cost</span>
                <span className="font-mono text-primary" data-testid="text-total-monthly">
                  ${costs.totalMonthlyCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">First Year Total</span>
                <span className="font-mono font-semibold" data-testid="text-annual-cost">
                  ${costs.totalFirstYearCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={onSubmit} 
            className="w-full" 
            size="lg"
            data-testid="button-submit"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit Configuration
          </Button>
          
          <div className="grid grid-cols-2 gap-1.5 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportPDF}
              data-testid="button-export-pdf-form"
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportCSV}
              data-testid="button-export-csv-form"
            >
              <FileText className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}