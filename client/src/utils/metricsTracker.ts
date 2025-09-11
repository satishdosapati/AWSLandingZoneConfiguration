/**
 * Enhanced Metrics Tracking Utility
 * Captures comprehensive user behavior and system metrics for business intelligence
 */

export interface MetricsState {
  // User behavior tracking
  pageLoadTime?: number;
  configurationChanges: number;
  featureToggleCount: number;
  formFieldInteractions: number;
  costCalculatorViews: number;
  
  // Form completion tracking
  formCompletionRate: number;
  abandonmentPoint?: string;
  validationErrors: string[];
  
  // Feature analytics
  selectedFeatureCategories: string[];
  mandatoryFeaturesAccepted: number;
  optionalFeaturesAdded: number;
}

class MetricsTracker {
  private state: MetricsState;
  private startTime: number;
  private sessionId: string;
  private isFirstTimeVisitor: boolean;
  private previousSessionsCount: number;

  constructor() {
    this.state = {
      configurationChanges: 0,
      featureToggleCount: 0,
      formFieldInteractions: 0,
      costCalculatorViews: 0,
      formCompletionRate: 0,
      validationErrors: [],
      selectedFeatureCategories: [],
      mandatoryFeaturesAccepted: 0,
      optionalFeaturesAdded: 0,
    };
    
    this.startTime = performance.now();
    this.sessionId = crypto.randomUUID();
    
    // Track visitor history using localStorage
    this.isFirstTimeVisitor = this.checkFirstTimeVisitor();
    this.previousSessionsCount = this.getPreviousSessionsCount();
    
    // Record page load metrics
    this.recordPageLoadTime();
    
    // Increment session count
    this.incrementSessionCount();
  }

  private checkFirstTimeVisitor(): boolean {
    const hasVisited = localStorage.getItem('aws-landing-zone-visitor');
    if (!hasVisited) {
      localStorage.setItem('aws-landing-zone-visitor', 'true');
      return true;
    }
    return false;
  }

  private getPreviousSessionsCount(): number {
    const count = localStorage.getItem('aws-landing-zone-sessions');
    return count ? parseInt(count, 10) : 0;
  }

  private incrementSessionCount(): void {
    const newCount = this.previousSessionsCount + 1;
    localStorage.setItem('aws-landing-zone-sessions', newCount.toString());
  }

  private recordPageLoadTime(): void {
    // Wait for page to fully load
    if (document.readyState === 'complete') {
      this.state.pageLoadTime = performance.now();
    } else {
      window.addEventListener('load', () => {
        this.state.pageLoadTime = performance.now();
      });
    }
  }

  // Track configuration changes
  trackConfigurationChange(): void {
    this.state.configurationChanges++;
  }

  // Track feature toggles
  trackFeatureToggle(featureId: string, enabled: boolean, category?: string): void {
    this.state.featureToggleCount++;
    
    if (enabled && category) {
      if (!this.state.selectedFeatureCategories.includes(category)) {
        this.state.selectedFeatureCategories.push(category);
      }
    }
  }

  // Track form field interactions
  trackFormFieldInteraction(): void {
    this.state.formFieldInteractions++;
  }

  // Track cost calculator views
  trackCostCalculatorView(): void {
    this.state.costCalculatorViews++;
  }

  // Track validation errors
  trackValidationError(errorType: string): void {
    if (!this.state.validationErrors.includes(errorType)) {
      this.state.validationErrors.push(errorType);
    }
  }

  // Track form completion progress
  updateFormCompletionRate(completedSections: number, totalSections: number): void {
    this.state.formCompletionRate = Math.round((completedSections / totalSections) * 100);
  }

  // Track abandonment point
  trackAbandonmentPoint(section: string): void {
    this.state.abandonmentPoint = section;
  }

  // Track feature analytics
  trackFeatureAcceptance(featureId: string, mandatory: boolean): void {
    if (mandatory) {
      this.state.mandatoryFeaturesAccepted++;
    } else {
      this.state.optionalFeaturesAdded++;
    }
  }

  // Get device type classification
  private getDeviceType(): "desktop" | "tablet" | "mobile" | "unknown" {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return "tablet";
    }
    
    if (/mobile|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return "mobile";
    }
    
    if (/windows|macintosh|linux/i.test(userAgent)) {
      return "desktop";
    }
    
    return "unknown";
  }

  // Get cost range classification
  private getCostRange(totalCost: number): "under-10k" | "10k-50k" | "50k-100k" | "100k-500k" | "over-500k" {
    if (totalCost < 10000) return "under-10k";
    if (totalCost < 50000) return "10k-50k";
    if (totalCost < 100000) return "50k-100k";
    if (totalCost < 500000) return "100k-500k";
    return "over-500k";
  }

  // Get referral source (simple implementation)
  private getReferralSource(): string {
    const referrer = document.referrer;
    if (!referrer) return "direct";
    
    try {
      const referrerDomain = new URL(referrer).hostname;
      if (referrerDomain.includes('google')) return "google";
      if (referrerDomain.includes('aws')) return "aws-official";
      if (referrerDomain.includes('linkedin')) return "linkedin";
      return referrerDomain;
    } catch {
      return "unknown";
    }
  }

  // Generate comprehensive metrics for submission
  generateSubmissionMetrics(totalCost: number, vmCount: number, storageTB: number): Record<string, unknown> {
    const timeSpentOnForm = Math.floor((Date.now() - this.startTime) / 1000);
    
    return {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      timeSpentOnForm,
      
      // Enhanced behavior metrics
      pageLoadTime: this.state.pageLoadTime,
      configurationChanges: this.state.configurationChanges,
      featureToggleCount: this.state.featureToggleCount,
      formFieldInteractions: this.state.formFieldInteractions,
      costCalculatorViews: this.state.costCalculatorViews,
      
      // Geographic and device info
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      deviceType: this.getDeviceType(),
      
      // Business intelligence
      referralSource: this.getReferralSource(),
      isFirstTimeVisitor: this.isFirstTimeVisitor,
      previousSessionsCount: this.previousSessionsCount,
      
      // Form completion
      formCompletionRate: this.state.formCompletionRate,
      abandonmentPoint: this.state.abandonmentPoint,
      validationErrors: this.state.validationErrors,
      
      // Feature analytics
      selectedFeatureCategories: this.state.selectedFeatureCategories,
      mandatoryFeaturesAccepted: this.state.mandatoryFeaturesAccepted,
      optionalFeaturesAdded: this.state.optionalFeaturesAdded,
      
      // Cost analytics
      costRange: this.getCostRange(totalCost),
      costPerVMCalculated: vmCount > 0 ? totalCost / vmCount : 0,
      costPerTBCalculated: storageTB > 0 ? totalCost / storageTB : 0,
    };
  }

  // Generate abandonment metrics (for analytics tracking)
  generateAbandonmentMetrics(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      abandonmentPoint: this.state.abandonmentPoint || 'unknown',
      formCompletionRate: this.state.formCompletionRate,
      timeSpentBeforeAbandonment: Math.floor((Date.now() - this.startTime) / 1000),
      configurationChanges: this.state.configurationChanges,
      featureToggleCount: this.state.featureToggleCount,
      validationErrors: this.state.validationErrors,
    };
  }
}

// Create singleton instance
export const metricsTracker = new MetricsTracker();

// Utility function to track form section progress
export const calculateFormSections = (
  presalesInfo: Record<string, unknown>, 
  selectedConfig: string, 
  selectedFeatures: string[]
): { completed: number; total: number } => {
  let completed = 0;
  const total = 3; // Presales info, Configuration, Features
  
  // Check presales info completion
  if (presalesInfo.presalesEngineerEmail && presalesInfo.partnerName && presalesInfo.endCustomerName) {
    completed++;
  }
  
  // Check configuration selection
  if (selectedConfig) {
    completed++;
  }
  
  // Check features (at least one selected)
  if (selectedFeatures.length > 0) {
    completed++;
  }
  
  return { completed, total };
};