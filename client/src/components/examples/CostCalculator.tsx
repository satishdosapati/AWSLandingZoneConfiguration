import { useState } from 'react';
import CostCalculator from '../CostCalculator';
import { landingZoneConfigurations } from '@shared/schema';

export default function CostCalculatorExample() {
  const [customVMs, setCustomVMs] = useState(25);
  const [customStorageTB, setCustomStorageTB] = useState(15);

  return (
    <div className="p-6 max-w-md">
      <CostCalculator 
        selectedConfig={landingZoneConfigurations[2]} // Medium configuration
        customVMs={customVMs}
        customStorageTB={customStorageTB}
        onVMsChange={(value) => setCustomVMs(value[0])}
        onStorageChange={(value) => setCustomStorageTB(value[0])}
      />
    </div>
  );
}