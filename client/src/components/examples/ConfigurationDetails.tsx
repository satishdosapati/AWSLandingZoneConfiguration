import ConfigurationDetails from '../ConfigurationDetails';
import { landingZoneConfigurations } from '@shared/schema';

export default function ConfigurationDetailsExample() {
  return (
    <div className="p-6 max-w-4xl">
      <ConfigurationDetails config={landingZoneConfigurations[2]} />
    </div>
  );
}