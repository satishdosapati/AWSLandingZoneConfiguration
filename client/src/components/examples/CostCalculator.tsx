import { useState } from 'react';
import CostCalculator from '../CostCalculator';
import { landingZoneConfigurations } from '@shared/schema';

export default function CostCalculatorExample() {
  const [customEC2Count, setCustomEC2Count] = useState(25);
  const [customStorageTB, setCustomStorageTB] = useState(15);
  const [selectedFeatures] = useState(['aws-organizations', 'cloudtrail-organization', 'control-tower', 'guardduty']);

  return (
    <div className="p-6 max-w-md">
      <CostCalculator 
        selectedConfig={landingZoneConfigurations[2]} // Medium configuration
        selectedFeatures={selectedFeatures}
        customEC2Count={customEC2Count}
        customStorageTB={customStorageTB}
        onEC2Change={(value) => setCustomEC2Count(value[0])}
        onStorageChange={(value) => setCustomStorageTB(value[0])}
      />
    </div>
  );
}