import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Feature, LandingZoneConfig, availableFeatures } from "@shared/schema";
import { ChevronDown, Shield, Network, Cog, Eye, Building2, DollarSign } from "lucide-react";
import { useState } from "react";

interface FeatureSelectorProps {
  selectedConfig: LandingZoneConfig;
  selectedFeatures: string[];
  onFeatureToggle: (featureId: string, enabled: boolean) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "foundation":
      return <Building2 className="h-4 w-4" />;
    case "security":
      return <Shield className="h-4 w-4" />;
    case "networking":
      return <Network className="h-4 w-4" />;
    case "automation":
      return <Cog className="h-4 w-4" />;
    case "monitoring":
      return <Eye className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "foundation":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "security":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "networking":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "automation":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "monitoring":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function FeatureSelector({ selectedConfig, selectedFeatures, onFeatureToggle }: FeatureSelectorProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    foundation: true,
    security: true,
    networking: true,
    automation: true,
    monitoring: true,
  });

  // Filter features available for this configuration size
  const availableFeaturesForConfig = availableFeatures.filter(
    feature => feature.availableInSizes.includes(selectedConfig.size) && 
               selectedConfig.availableFeatures.includes(feature.id)
  );

  // Group features by category
  const featuresByCategory = availableFeaturesForConfig.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const calculateFeatureCosts = (features: Feature[]) => {
    const selectedFeaturesInCategory = features.filter(f => selectedFeatures.includes(f.id));
    const infraCost = selectedFeaturesInCategory.reduce((sum, f) => sum + f.infraCostImpact, 0);
    const profServicesCost = selectedFeaturesInCategory.reduce((sum, f) => sum + f.professionalServicesCostImpact, 0);
    return { infraCost, profServicesCost };
  };

  return (
    <Card data-testid="card-feature-selector">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cog className="h-5 w-5" />
          Feature Selection
        </CardTitle>
        <CardDescription>
          Choose additional features for your {selectedConfig.name}. 
          Some features are mandatory and cannot be disabled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(featuresByCategory).map(([category, features]) => {
          const costs = calculateFeatureCosts(features);
          return (
            <Collapsible
              key={category}
              open={openCategories[category]}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger
                className="flex w-full items-center justify-between p-3 hover-elevate rounded-lg border"
                data-testid={`button-category-${category}`}
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <div className="text-left">
                    <h4 className="font-semibold capitalize">{category}</h4>
                    <p className="text-sm text-muted-foreground">
                      {features.length} feature{features.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(costs.infraCost > 0 || costs.profServicesCost > 0) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      {costs.infraCost > 0 && `+$${costs.infraCost}/mo`}
                      {costs.infraCost > 0 && costs.profServicesCost > 0 && " | "}
                      {costs.profServicesCost > 0 && `+$${costs.profServicesCost.toLocaleString()}`}
                    </div>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${openCategories[category] ? 'rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="pt-3">
                <div className="space-y-3 pl-4">
                  {features.map((feature) => {
                    const isSelected = selectedFeatures.includes(feature.id);
                    const isMandatory = selectedConfig.mandatoryFeatures.includes(feature.id);
                    
                    return (
                      <div
                        key={feature.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          isSelected ? 'bg-muted/50' : ''
                        }`}
                      >
                        <Checkbox
                          id={feature.id}
                          checked={isSelected}
                          disabled={isMandatory}
                          onCheckedChange={(checked) => onFeatureToggle(feature.id, checked as boolean)}
                          data-testid={`checkbox-feature-${feature.id}`}
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={feature.id}
                              className="font-medium cursor-pointer"
                            >
                              {feature.name}
                            </label>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getCategoryColor(feature.category)}`}
                            >
                              {feature.category}
                            </Badge>
                            {isMandatory && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                          
                          {(feature.infraCostImpact > 0 || feature.professionalServicesCostImpact > 0) && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {feature.infraCostImpact > 0 && (
                                <span>Infrastructure: +${feature.infraCostImpact}/month</span>
                              )}
                              {feature.professionalServicesCostImpact > 0 && (
                                <span>Professional Services: +${feature.professionalServicesCostImpact.toLocaleString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
              
              {category !== Object.keys(featuresByCategory)[Object.keys(featuresByCategory).length - 1] && (
                <Separator className="mt-4" />
              )}
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}