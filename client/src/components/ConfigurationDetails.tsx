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
    title: "Guardrails",
    icon: Shield,
    key: "guardrails" as keyof LandingZoneConfig,
    description: "Security policies and compliance controls"
  },
  {
    title: "Access Management",
    icon: Users,
    key: "accessManagement" as keyof LandingZoneConfig,
    description: "Identity and access control systems"
  },
  {
    title: "Networking",
    icon: Network,
    key: "networking" as keyof LandingZoneConfig,
    description: "Network architecture and connectivity"
  },
  {
    title: "Automation",
    icon: Cog,
    key: "automation" as keyof LandingZoneConfig,
    description: "Deployment and operational automation"
  },
  {
    title: "Security",
    icon: Lock,
    key: "security" as keyof LandingZoneConfig,
    description: "Security services and monitoring"
  },
  {
    title: "Monitoring & Logging",
    icon: Eye,
    key: "monitoring" as keyof LandingZoneConfig,
    description: "Observability and compliance logging"
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
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {detailSections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div key={section.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">{section.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                  {config[section.key] as string}
                </p>
                {index < detailSections.length - 1 && <Separator className="ml-6" />}
              </div>
            );
          })}
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Default Resource Allocation
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
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