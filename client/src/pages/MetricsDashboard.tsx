import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Settings, 
  Globe, 
  Smartphone,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle
} from "lucide-react";

interface SubmissionStats {
  totalSubmissions: number;
  submissionsByConfig: Record<string, number>;
  totalEstimatedValue: number;
  averageEstimatedValue: number;
  topPartners: Array<{ name: string; count: number }>;
  submissionsLastWeek: number;
  submissionsLastMonth: number;
  
  // Enhanced business intelligence metrics
  averageTimeSpentOnForm: number;
  conversionRate: number;
  popularFeatures: Array<{ feature: string; count: number; percentage: number }>;
  averageFeatureCount: number;
  costRangeDistribution: Record<string, number>;
  deviceTypeDistribution: Record<string, number>;
  topTimezones: Array<{ timezone: string; count: number }>;
  
  // Partner engagement analytics
  partnerEngagementMetrics: Array<{
    partnerName: string;
    totalSubmissions: number;
    averageCost: number;
    averageTimeSpent: number;
    popularConfigurations: Array<{ config: string; count: number }>;
  }>;
  
  // Form completion analytics
  formCompletionStats: {
    averageCompletionRate: number;
    commonAbandonmentPoints: Array<{ point: string; count: number }>;
    mostCommonValidationErrors: Array<{ error: string; count: number }>;
  };
  
  // Time-based trend analysis
  submissionTrends: {
    daily: Array<{ date: string; count: number; totalValue: number }>;
    hourly: Array<{ hour: number; count: number }>;
    byDayOfWeek: Array<{ day: string; count: number }>;
  };
}

export default function MetricsDashboard() {
  const { data: stats, isLoading, error } = useQuery<{ success: boolean; stats: SubmissionStats }>({
    queryKey: ['/api/submissions/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading metrics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Dashboard Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Unable to load metrics data. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AWS Landing Zone Metrics Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Real-time analytics and business intelligence for landing zone configurations
            </p>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-submissions">
                  {stats.stats.totalSubmissions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats.stats.submissionsLastWeek} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-value">
                  {formatCurrency(stats.stats.totalEstimatedValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatCurrency(stats.stats.averageEstimatedValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Time on Form</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-time">
                  {formatTime(Math.round(stats.stats.averageTimeSpentOnForm))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.stats.formCompletionStats.averageCompletionRate.toFixed(1)}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Features Selected</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-features">
                  {stats.stats.averageFeatureCount.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.stats.popularFeatures.length} unique features used
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Distribution & Popular Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Configuration Distribution
                </CardTitle>
                <CardDescription>Distribution of selected landing zone configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.stats.submissionsByConfig).map(([config, count]) => {
                  const percentage = (count / stats.stats.totalSubmissions) * 100;
                  return (
                    <div key={config} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize" data-testid={`text-config-${config}`}>
                          {config.replace('-', ' ')}
                        </span>
                        <span>{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Features
                </CardTitle>
                <CardDescription>Most frequently selected optional features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.stats.popularFeatures.slice(0, 8).map((feature, index) => (
                    <div key={feature.feature} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="text-sm" data-testid={`text-feature-${feature.feature}`}>
                          {feature.feature}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {feature.count}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {feature.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Partner Analytics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Partner Engagement
              </CardTitle>
              <CardDescription>Partner performance and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stats.stats.partnerEngagementMetrics.slice(0, 4).map((partner) => (
                  <div key={partner.partnerName} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold" data-testid={`text-partner-${partner.partnerName}`}>
                        {partner.partnerName}
                      </h4>
                      <Badge>{partner.totalSubmissions} submissions</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Avg. Deal Size</p>
                        <p className="font-medium">{formatCurrency(partner.averageCost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Time</p>
                        <p className="font-medium">{formatTime(Math.round(partner.averageTimeSpent))}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {partner.popularConfigurations.slice(0, 3).map((config) => (
                        <Badge key={config.config} variant="outline" className="text-xs">
                          {config.config}: {config.count}
                        </Badge>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device & Geographic Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats.stats.deviceTypeDistribution).map(([device, count]) => {
                  const percentage = (count / stats.stats.totalSubmissions) * 100;
                  return (
                    <div key={device} className="flex justify-between items-center">
                      <span className="capitalize text-sm" data-testid={`text-device-${device}`}>
                        {device}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <Badge variant="outline" className="text-xs">
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Timezones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.stats.topTimezones.map((tz) => (
                  <div key={tz.timezone} className="flex justify-between items-center">
                    <span className="text-sm" data-testid={`text-timezone-${tz.timezone}`}>
                      {tz.timezone}
                    </span>
                    <Badge variant="outline">{tz.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Deal Size Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats.stats.costRangeDistribution).map(([range, count]) => {
                  const percentage = (count / stats.stats.totalSubmissions) * 100;
                  return (
                    <div key={range} className="flex justify-between items-center">
                      <span className="text-sm" data-testid={`text-cost-range-${range}`}>
                        {range.replace('-', ' - ').toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <Badge variant="outline" className="text-xs">
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Activity Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity Trends
              </CardTitle>
              <CardDescription>Form submission patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Daily Activity (Last 7 Days)</h4>
                  <div className="space-y-2">
                    {stats.stats.submissionTrends.daily.slice(-7).map((day) => (
                      <div key={day.date} className="flex justify-between items-center text-sm">
                        <span data-testid={`text-daily-${day.date}`}>
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{day.count} submissions</span>
                          <Badge variant="outline" className="text-xs">
                            {formatCurrency(day.totalValue)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">By Day of Week</h4>
                  <div className="space-y-2">
                    {stats.stats.submissionTrends.byDayOfWeek.map((dayData) => (
                      <div key={dayData.day} className="flex justify-between items-center text-sm">
                        <span data-testid={`text-dow-${dayData.day}`}>{dayData.day}</span>
                        <Badge variant="outline">{dayData.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}