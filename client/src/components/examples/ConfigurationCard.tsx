import ConfigurationCard from '../ConfigurationCard';
import { landingZoneConfigurations } from '@shared/schema';

export default function ConfigurationCardExample() {
  return (
    <div className="p-6 space-y-4">
      <ConfigurationCard 
        config={landingZoneConfigurations[0]}
        value="very-small"
        isSelected={true}
        onSelect={() => {}}
      />
      <ConfigurationCard 
        config={landingZoneConfigurations[1]}
        value="small"
        isSelected={false}
        onSelect={() => {}}
      />
    </div>
  );
}