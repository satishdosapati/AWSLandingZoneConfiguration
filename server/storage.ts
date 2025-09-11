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
    
    return {
      totalSubmissions,
      submissionsByConfig,
      totalEstimatedValue,
      averageEstimatedValue,
      topPartners,
      submissionsLastWeek,
      submissionsLastMonth,
    };
  }

  async getSubmissionById(id: string): Promise<LandingZoneSubmission | undefined> {
    return this.submissions.get(id);
  }
}

export const storage = new MemStorage();

