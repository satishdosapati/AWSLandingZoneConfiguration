import AppHeader from '../AppHeader';

export default function AppHeaderExample() {
  return (
    <div>
      <AppHeader 
        selectedConfig="medium"
      />
      <div className="p-6 text-center text-muted-foreground">
        Header with export options when configuration is selected
      </div>
    </div>
  );
}