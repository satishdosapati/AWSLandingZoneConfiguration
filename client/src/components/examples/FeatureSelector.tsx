import { useState } from 'react';
import FeatureSelector from '../FeatureSelector';
import { landingZoneConfigurations } from '@shared/schema';

export default function FeatureSelectorExample() {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'aws-organizations', 'cloudtrail-organization' // Default mandatory features
  ]);

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    if (enabled) {
      setSelectedFeatures(prev => [...prev, featureId]);
    } else {
      setSelectedFeatures(prev => prev.filter(id => id !== featureId));
    }
    console.log('Feature toggled:', featureId, enabled);
  };

  return (
    <div className="p-6 max-w-4xl">
      <FeatureSelector
        selectedConfig={landingZoneConfigurations[2]} // Medium configuration
        selectedFeatures={selectedFeatures}
        onFeatureToggle={handleFeatureToggle}
      />
    </div>
  );
}