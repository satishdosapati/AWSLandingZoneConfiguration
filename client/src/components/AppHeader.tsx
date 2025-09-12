import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Moon, Sun, BarChart3 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";

interface AppHeaderProps {
  selectedConfig?: string;
}

export default function AppHeader({ selectedConfig }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">AWS Landing Zone</h1>
              <p className="text-xs text-muted-foreground">Configuration Tool</p>
            </div>
          </div>
          {selectedConfig && (
            <Badge variant="outline" className="ml-4">
              {selectedConfig.replace("-", " ").toUpperCase()} Selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation */}
          <Link href="/metrics">
            <Button
              variant={location === "/metrics" ? "default" : "ghost"}
              size="sm"
              className="flex items-center gap-2"
              data-testid="link-metrics-dashboard"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
            </Button>
          </Link>
          
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}