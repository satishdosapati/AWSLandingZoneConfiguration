import { type LandingZoneSubmission, type InsertLandingZoneSubmission, type SubmissionMetrics } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Landing Zone Submissions
  createSubmission(submission: InsertLandingZoneSubmission): Promise<LandingZoneSubmission>;
  getSubmissions(filters?: SubmissionFilters): Promise<LandingZoneSubmission[]>;
  getSubmissionStats(): Promise<SubmissionStats>;
  getSubmissionById(id: string): Promise<LandingZoneSubmission | undefined>;
}

export interface SubmissionFilters {
  configurationSize?: string;
  partnerName?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

export interface SubmissionStats {
  totalSubmissions: number;
  submissionsByConfig: Record<string, number>;
  totalEstimatedValue: number;
  averageEstimatedValue: number;
  topPartners: Array<{ name: string; count: number }>;
  submissionsLastWeek: number;
  submissionsLastMonth: number;
  
  // Enhanced business intelligence metrics
  averageTimeSpentOnForm: number;
  conversionRate: number; // Percentage of sessions that result in submissions
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

export class MemStorage implements IStorage {
  private submissions: Map<string, LandingZoneSubmission>;

  constructor() {
    this.submissions = new Map();
  }

  // Landing Zone Submission Methods
  async createSubmission(insertSubmission: InsertLandingZoneSubmission): Promise<LandingZoneSubmission> {
    const submissionId = randomUUID();
    const submittedAt = new Date();
    
    const submission: LandingZoneSubmission = {
      ...insertSubmission,
      submissionMetrics: {
        ...insertSubmission.submissionMetrics,
        submissionId,
        submittedAt,
      },
    };
    
    this.submissions.set(submissionId, submission);
    return submission;
  }

  async getSubmissions(filters?: SubmissionFilters): Promise<LandingZoneSubmission[]> {
    let submissions = Array.from(this.submissions.values());
    
    if (filters) {
      if (filters.configurationSize) {
        submissions = submissions.filter(s => 
          s.submissionMetrics.configurationSize === filters.configurationSize
        );
      }
      
      if (filters.partnerName) {
        submissions = submissions.filter(s => 
          s.presalesInfo.partnerName.toLowerCase().includes(filters.partnerName!.toLowerCase())
        );
      }
      
      if (filters.dateFrom) {
        submissions = submissions.filter(s => 
          s.submissionMetrics.submittedAt >= filters.dateFrom!
        );
      }
      
      if (filters.dateTo) {
        submissions = submissions.filter(s => 
          s.submissionMetrics.submittedAt <= filters.dateTo!
        );
      }
      
      if (filters.limit) {
        submissions = submissions.slice(0, filters.limit);
      }
    }
    
    // Sort by submitted date (most recent first)
    return submissions.sort((a, b) => 
      b.submissionMetrics.submittedAt.getTime() - a.submissionMetrics.submittedAt.getTime()
    );
  }

  async getSubmissionStats(): Promise<SubmissionStats> {
    const submissions = Array.from(this.submissions.values());
    const totalSubmissions = submissions.length;
    
    if (totalSubmissions === 0) {
      return {
        totalSubmissions: 0,
        submissionsByConfig: {},
        totalEstimatedValue: 0,
        averageEstimatedValue: 0,
        topPartners: [],
        submissionsLastWeek: 0,
        submissionsLastMonth: 0,
        
        // Enhanced metrics defaults
        averageTimeSpentOnForm: 0,
        conversionRate: 0,
        popularFeatures: [],
        averageFeatureCount: 0,
        costRangeDistribution: {},
        deviceTypeDistribution: {},
        topTimezones: [],
        partnerEngagementMetrics: [],
        formCompletionStats: {
          averageCompletionRate: 0,
          commonAbandonmentPoints: [],
          mostCommonValidationErrors: [],
        },
        submissionTrends: {
          daily: [],
          hourly: [],
          byDayOfWeek: [],
        },
      };
    }
    
    // Count submissions by configuration size
    const submissionsByConfig = submissions.reduce((acc, submission) => {
      const size = submission.submissionMetrics.configurationSize;
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate total and average estimated value
    const totalEstimatedValue = submissions.reduce((sum, submission) => 
      sum + submission.submissionMetrics.totalEstimatedCost, 0
    );
    const averageEstimatedValue = totalEstimatedValue / totalSubmissions;
    
    // Get top partners by submission count
    const partnerCounts = submissions.reduce((acc, submission) => {
      const partner = submission.presalesInfo.partnerName;
      acc[partner] = (acc[partner] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPartners = Object.entries(partnerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate time-based metrics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const submissionsLastWeek = submissions.filter(s => 
      s.submissionMetrics.submittedAt >= oneWeekAgo
    ).length;
    
    const submissionsLastMonth = submissions.filter(s => 
      s.submissionMetrics.submittedAt >= oneMonthAgo
    ).length;
    
    // Enhanced analytics calculations
    const validTimeSubmissions = submissions.filter(s => s.submissionMetrics.timeSpentOnForm);
    const averageTimeSpentOnForm = validTimeSubmissions.length > 0 
      ? validTimeSubmissions.reduce((sum, s) => sum + (s.submissionMetrics.timeSpentOnForm || 0), 0) / validTimeSubmissions.length
      : 0;
    
    // Calculate feature popularity
    const featureCounts = submissions.reduce((acc, submission) => {
      submission.costCalculation.selectedFeatures.forEach(feature => {
        acc[feature] = (acc[feature] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const popularFeatures = Object.entries(featureCounts)
      .map(([feature, count]) => ({ 
        feature, 
        count, 
        percentage: Math.round((count / totalSubmissions) * 100) 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    const averageFeatureCount = submissions.reduce((sum, s) => 
      sum + s.costCalculation.selectedFeatures.length, 0) / totalSubmissions;
    
    // Cost range distribution
    const costRangeDistribution = submissions.reduce((acc, submission) => {
      const range = submission.submissionMetrics.costRange || 'unknown';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Device type distribution
    const deviceTypeDistribution = submissions.reduce((acc, submission) => {
      const device = submission.submissionMetrics.deviceType || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Top timezones
    const timezoneCounts = submissions.reduce((acc, submission) => {
      const timezone = submission.submissionMetrics.timezone || 'unknown';
      acc[timezone] = (acc[timezone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topTimezones = Object.entries(timezoneCounts)
      .map(([timezone, count]) => ({ timezone, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Partner engagement metrics
    const partnerEngagementMetrics = topPartners.map(partner => {
      const partnerSubmissions = submissions.filter(s => 
        s.presalesInfo.partnerName === partner.name
      );
      
      const averageCost = partnerSubmissions.length > 0
        ? partnerSubmissions.reduce((sum, s) => sum + s.submissionMetrics.totalEstimatedCost, 0) / partnerSubmissions.length
        : 0;
      
      const averageTimeSpent = partnerSubmissions.filter(s => s.submissionMetrics.timeSpentOnForm).length > 0
        ? partnerSubmissions.reduce((sum, s) => sum + (s.submissionMetrics.timeSpentOnForm || 0), 0) / partnerSubmissions.length
        : 0;
      
      const configCounts = partnerSubmissions.reduce((acc, s) => {
        const config = s.submissionMetrics.configurationSize;
        acc[config] = (acc[config] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const popularConfigurations = Object.entries(configCounts)
        .map(([config, count]) => ({ config, count }))
        .sort((a, b) => b.count - a.count);
      
      return {
        partnerName: partner.name,
        totalSubmissions: partner.count,
        averageCost,
        averageTimeSpent,
        popularConfigurations,
      };
    });
    
    // Form completion stats
    const completionRates = submissions.filter(s => s.submissionMetrics.formCompletionRate)
      .map(s => s.submissionMetrics.formCompletionRate || 0);
    const averageCompletionRate = completionRates.length > 0
      ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
      : 0;
    
    const abandonmentCounts = submissions.reduce((acc, submission) => {
      const point = submission.submissionMetrics.abandonmentPoint;
      if (point) {
        acc[point] = (acc[point] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const commonAbandonmentPoints = Object.entries(abandonmentCounts)
      .map(([point, count]) => ({ point, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const errorCounts = submissions.reduce((acc, submission) => {
      submission.submissionMetrics.validationErrors?.forEach(error => {
        acc[error] = (acc[error] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonValidationErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Time-based trends
    const dailyStats = submissions.reduce((acc, submission) => {
      const date = submission.submissionMetrics.submittedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, totalValue: 0 };
      }
      acc[date].count++;
      acc[date].totalValue += submission.submissionMetrics.totalEstimatedCost;
      return acc;
    }, {} as Record<string, { count: number; totalValue: number }>);
    
    const daily = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, count: stats.count, totalValue: stats.totalValue }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const hourlyStats = submissions.reduce((acc, submission) => {
      const hour = submission.submissionMetrics.submittedAt.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyStats[hour] || 0,
    }));
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekStats = submissions.reduce((acc, submission) => {
      const dayOfWeek = submission.submissionMetrics.submittedAt.getDay();
      const dayName = dayNames[dayOfWeek];
      acc[dayName] = (acc[dayName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byDayOfWeek = dayNames.map(day => ({
      day,
      count: dayOfWeekStats[day] || 0,
    }));
    
    return {
      totalSubmissions,
      submissionsByConfig,
      totalEstimatedValue,
      averageEstimatedValue,
      topPartners,
      submissionsLastWeek,
      submissionsLastMonth,
      
      // Enhanced business intelligence metrics
      averageTimeSpentOnForm,
      conversionRate: 100, // Placeholder - would need session tracking for real conversion rate
      popularFeatures,
      averageFeatureCount,
      costRangeDistribution,
      deviceTypeDistribution,
      topTimezones,
      partnerEngagementMetrics,
      formCompletionStats: {
        averageCompletionRate,
        commonAbandonmentPoints,
        mostCommonValidationErrors,
      },
      submissionTrends: {
        daily,
        hourly,
        byDayOfWeek,
      },
    };
  }

  async getSubmissionById(id: string): Promise<LandingZoneSubmission | undefined> {
    return this.submissions.get(id);
  }
}

export const storage = new MemStorage();

