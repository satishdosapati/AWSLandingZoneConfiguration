import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LandingZoneConfig } from "@shared/schema";
import { 
  Building2, 
  Shield, 
  Network, 
  Users, 
  Cog, 
  Eye, 
  Lock,
  Workflow
} from "lucide-react";

interface ConfigurationDetailsProps {
  config: LandingZoneConfig;
}

const detailSections = [
  {
    title: "Account Structure",
    icon: Building2,
    key: "accountStructure" as keyof LandingZoneConfig,
    description: "AWS account organization and structure"
  },
  {
    title: "Organizational Structure", 
    icon: Workflow,
    key: "organizationalStructure" as keyof LandingZoneConfig,
    description: "Organizational units and hierarchy"
  },
  {
    title: "Default Resources",
    icon: Cog,
    key: "defaultVMs" as keyof LandingZoneConfig,
    description: "Default number of VMs and storage capacity",
    isNumeric: true,
    unit: "VMs"
  },
  {
    title: "Storage Capacity",
    icon: Network,
    key: "defaultStorageTB" as keyof LandingZoneConfig,
    description: "Default storage allocation",
    isNumeric: true,
    unit: "TB"
  },
  {
    title: "Base Infrastructure Cost",
    icon: Building2,
    key: "baseInfraCostPerMonth" as keyof LandingZoneConfig,
    description: "Monthly infrastructure cost baseline",
    isNumeric: true,
    unit: "/month",
    isCost: true
  },
  {
    title: "Professional Services Cost",
    icon: Shield,
    key: "baseProfessionalServicesCost" as keyof LandingZoneConfig,
    description: "One-time implementation cost",
    isNumeric: true,
    isCost: true
  }
];

export default function ConfigurationDetails({ config }: ConfigurationDetailsProps) {
  return (
    <Card data-testid="card-config-details">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{config.name}</CardTitle>
            <CardDescription className="mt-1">
              Detailed technical specifications and architecture
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {config.size.replace("-", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          {detailSections.map((section, index) => {
            const IconComponent = section.icon;
            const value = config[section.key];
            return (
              <div key={section.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">{section.title}</h4>
                </div>
                <div className="pl-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                  {section.isNumeric ? (
                    <div className="mt-1">
                      <span className="font-mono text-sm font-medium">
                        {section.isCost ? `$${Number(value).toLocaleString()}` : value}
                        {section.unit && ` ${section.unit}`}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed mt-1">
                      {value as string}
                    </p>
                  )}
                </div>
                {index < detailSections.length - 1 && <Separator className="ml-6" />}
              </div>
            );
          })}
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Default Resource Allocation
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Virtual Machines:</span>
              <span className="ml-2 font-mono">{config.defaultVMs}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Storage:</span>
              <span className="ml-2 font-mono">{config.defaultStorageTB} TB</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}