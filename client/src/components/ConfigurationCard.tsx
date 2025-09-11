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
          className={`transition-all duration-200 hover-elevate min-h-40 flex flex-col ${
            isSelected ? "ring-2 ring-primary border-primary" : ""
          }`}
          data-testid={`card-config-${config.size}`}
        >
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSizeIcon(config.size)}
                <CardTitle className="text-base font-semibold line-clamp-2">
                  {config.name.replace(/Customers?/g, '').replace(/\([^)]*\)/, '').trim()}
                </CardTitle>
              </div>
              <Badge variant={getSizeBadgeVariant(config.size) as any} className="text-xs">
                {config.size.replace("-", " ").toUpperCase()}
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {config.description.length > 60 ? config.description.substring(0, 60) + '...' : config.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <div className="space-y-2 text-xs">
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
          </CardContent>
        </Card>
      </Label>
    </div>
  );
}