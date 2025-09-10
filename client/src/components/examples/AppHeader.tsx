import AppHeader from '../AppHeader';

export default function AppHeaderExample() {
  return (
    <div>
      <AppHeader 
        selectedConfig="medium"
        onExportPDF={() => console.log('Export PDF triggered')}
        onExportCSV={() => console.log('Export CSV triggered')}
      />
      <div className="p-6 text-center text-muted-foreground">
        Header with export options when configuration is selected
      </div>
    </div>
  );
}