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

export default function ConfigurationCard({ config, value, isSelected }: ConfigurationCardProps) {
  const radioId = `radio-${value}`;
  
  return (
    <div className="relative">
      <RadioGroupItem value={value} id={radioId} className="sr-only" />
      <Label 
        htmlFor={radioId}
        className="block cursor-pointer"
        data-testid={`label-config-${config.size}`}
      >
        <Card 
          className={`transition-all duration-200 hover-elevate ${
            isSelected ? "ring-2 ring-primary border-primary" : ""
          }`}
          data-testid={`card-config-${config.size}`}
        >
          <div className="flex items-center gap-3 p-3">
            <div className="flex-shrink-0">
              {getSizeIcon(config.size)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {config.name.replace(/Customers?/g, '').replace(/\([^)]*\)/, '').trim()}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {config.description}
                  </CardDescription>
                </div>
                <Badge variant={getSizeBadgeVariant(config.size) as any} className="text-xs flex-shrink-0">
                  {config.size.replace("-", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0 text-right space-y-1.5 text-sm">
              <div>
                <h4 className="font-medium text-foreground">Base Cost</h4>
                <p className="text-muted-foreground">${config.baseInfraCostPerMonth.toLocaleString()}/mo</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Resources</h4>
                <p className="text-muted-foreground">{config.defaultVMs} VMs, {config.defaultStorageTB}TB</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Features</h4>
                <p className="text-muted-foreground">{config.availableFeatures.length} available</p>
              </div>
            </div>
          </div>
        </Card>
      </Label>
    </div>
  );
}