import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { LandingZoneConfig } from "@shared/schema";
import { Cloud, Users, Shield, Network } from "lucide-react";

interface ConfigurationCardProps {
  config: LandingZoneConfig;
  value: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

const getSizeIcon = (size: string) => {
  switch (size) {
    case "very-small":
      return <Users className="h-5 w-5" />;
    case "small":
      return <Cloud className="h-5 w-5" />;
    case "medium":
      return <Network className="h-5 w-5" />;
    case "large":
      return <Shield className="h-5 w-5" />;
    default:
      return <Cloud className="h-5 w-5" />;
  }
};

const getSizeBadgeVariant = (size: string) => {
  switch (size) {
    case "very-small":
      return "secondary";
    case "small":
      return "outline";
    case "medium":
      return "default";
    case "large":
      return "destructive";
    default:
      return "default";
  }
};

export default function ConfigurationCard({ config, value, isSelected, onSelect }: ConfigurationCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover-elevate ${
        isSelected ? "ring-2 ring-primary border-primary" : ""
      }`}
      onClick={() => onSelect(value)}
      data-testid={`card-config-${config.size}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <RadioGroupItem value={value} id={value} className="sr-only" />
            <div className="flex items-center gap-2">
              {getSizeIcon(config.size)}
              <div>
                <CardTitle className="text-lg font-semibold">{config.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  {config.description}
                </CardDescription>
              </div>
            </div>
          </div>
          <Badge variant={getSizeBadgeVariant(config.size) as any} className="ml-2">
            {config.size.replace("-", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-foreground mb-1">Infrastructure</h4>
            <p className="text-muted-foreground">${config.infraCostPerMonth.toLocaleString()}/month</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Professional Services</h4>
            <p className="text-muted-foreground">${config.professionalServicesCost.toLocaleString()} one-time</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Default Resources</h4>
            <p className="text-muted-foreground">{config.defaultVMs} VMs, {config.defaultStorageTB}TB storage</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Managed Services</h4>
            <p className="text-muted-foreground">${config.managedServicesCostPerVM}/VM + ${config.managedServicesCostPerTB}/TB</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium text-foreground mb-2">Key Features</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Accounts:</strong> {config.accountStructure}</p>
            <p><strong>Security:</strong> {config.security.substring(0, 80)}...</p>
            <p><strong>Networking:</strong> {config.networking.substring(0, 80)}...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}