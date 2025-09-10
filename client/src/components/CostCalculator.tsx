import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LandingZoneConfig } from "@shared/schema";
import { Calculator, DollarSign, Server, HardDrive } from "lucide-react";

interface CostCalculatorProps {
  selectedConfig: LandingZoneConfig | null;
  customVMs: number;
  customStorageTB: number;
  onVMsChange: (value: number[]) => void;
  onStorageChange: (value: number[]) => void;
}

export default function CostCalculator({ 
  selectedConfig, 
  customVMs, 
  customStorageTB, 
  onVMsChange, 
  onStorageChange 
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

  const managedServicesMonthly = (customVMs * selectedConfig.managedServicesCostPerVM) + 
                                (customStorageTB * selectedConfig.managedServicesCostPerTB);
  const totalMonthly = selectedConfig.infraCostPerMonth + managedServicesMonthly;

  return (
    <Card className="sticky top-6" data-testid="card-cost-calculator">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <CardTitle>Cost Calculator</CardTitle>
        </div>
        <CardDescription>
          Customize resources for {selectedConfig.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resource Customization */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span className="text-sm font-medium">Virtual Machines</span>
              </div>
              <Badge variant="outline" data-testid="text-vm-count">{customVMs}</Badge>
            </div>
            <Slider
              value={[customVMs]}
              onValueChange={onVMsChange}
              max={200}
              min={1}
              step={1}
              className="w-full"
              data-testid="slider-vms"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1</span>
              <span>200</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
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

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Cost Breakdown</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Infrastructure (monthly)</span>
              <span className="font-mono" data-testid="text-infra-cost">
                ${selectedConfig.infraCostPerMonth.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Professional Services (one-time)</span>
              <span className="font-mono" data-testid="text-professional-cost">
                ${selectedConfig.professionalServicesCost.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Managed Services ({customVMs} VMs + {customStorageTB} TB)
              </span>
              <span className="font-mono" data-testid="text-managed-cost">
                ${managedServicesMonthly.toLocaleString()}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-base font-semibold">
            <span>Total Monthly Cost</span>
            <span className="font-mono text-primary" data-testid="text-total-monthly">
              ${totalMonthly.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Annual Projection */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Annual Projection</div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Year 1 Total</span>
            <span className="font-mono font-semibold" data-testid="text-annual-cost">
              ${(totalMonthly * 12 + selectedConfig.professionalServicesCost).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}