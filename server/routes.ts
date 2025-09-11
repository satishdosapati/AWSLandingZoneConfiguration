import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage, type SubmissionFilters } from "./storage";
import { insertLandingZoneSubmissionSchema, landingZoneConfigurations } from "@shared/schema";
import { calculateCosts } from "@shared/costCalculations";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for parsing JSON bodies
  app.use('/api', (req, res, next) => {
    if (req.headers['content-type']?.includes('application/json')) {
      return express.json()(req, res, next);
    }
    next();
  });

  // POST /api/submissions - Store new landing zone submission
  app.post('/api/submissions', async (req, res) => {
    const startTime = Date.now();
    console.log('[SUBMISSION] Request received', { timestamp: new Date().toISOString() });
    
    try {
      // Validate request body using Zod schema
      const validatedData = insertLandingZoneSubmissionSchema.parse(req.body);
      console.log('[SUBMISSION] Validation successful', { 
        configSize: validatedData.costCalculation.selectedConfig,
        featuresCount: validatedData.costCalculation.selectedFeatures.length
      });
      
      // Find the selected configuration
      const selectedConfig = landingZoneConfigurations.find(
        config => config.size === validatedData.costCalculation.selectedConfig
      );
      
      if (!selectedConfig) {
        return res.status(400).json({ 
          error: 'Invalid configuration size selected' 
        });
      }
      
      // Calculate total cost for validation and metrics
      const costBreakdown = calculateCosts(
        selectedConfig,
        validatedData.costCalculation.selectedFeatures,
        validatedData.costCalculation.customEC2Count,
        validatedData.costCalculation.customStorageTB
      );
      
      // Create the submission with calculated metrics, ensuring all required fields are present
      const submissionToStore = {
        ...validatedData,
        submissionMetrics: {
          ...validatedData.submissionMetrics,
          configurationSize: selectedConfig.size,
          totalFeaturesSelected: validatedData.costCalculation.selectedFeatures.length,
          totalEstimatedCost: costBreakdown.totalFirstYearCost,
          // Ensure optional fields have defaults if not provided
          pageLoadTime: validatedData.submissionMetrics.pageLoadTime || undefined,
          configurationChanges: validatedData.submissionMetrics.configurationChanges || 0,
          featureToggleCount: validatedData.submissionMetrics.featureToggleCount || 0,
          formFieldInteractions: validatedData.submissionMetrics.formFieldInteractions || 0,
          costCalculatorViews: validatedData.submissionMetrics.costCalculatorViews || 0,
          timezone: validatedData.submissionMetrics.timezone || undefined,
          language: validatedData.submissionMetrics.language || undefined,
          screenResolution: validatedData.submissionMetrics.screenResolution || undefined,
          deviceType: validatedData.submissionMetrics.deviceType || undefined,
          referralSource: validatedData.submissionMetrics.referralSource || undefined,
          isFirstTimeVisitor: validatedData.submissionMetrics.isFirstTimeVisitor || undefined,
          previousSessionsCount: validatedData.submissionMetrics.previousSessionsCount || undefined,
          formCompletionRate: validatedData.submissionMetrics.formCompletionRate || undefined,
          abandonmentPoint: validatedData.submissionMetrics.abandonmentPoint || undefined,
          validationErrors: validatedData.submissionMetrics.validationErrors || [],
          selectedFeatureCategories: validatedData.submissionMetrics.selectedFeatureCategories || [],
          mandatoryFeaturesAccepted: validatedData.submissionMetrics.mandatoryFeaturesAccepted || 0,
          optionalFeaturesAdded: validatedData.submissionMetrics.optionalFeaturesAdded || 0,
          costRange: validatedData.submissionMetrics.costRange || undefined,
          costPerVMCalculated: validatedData.submissionMetrics.costPerVMCalculated || undefined,
          costPerTBCalculated: validatedData.submissionMetrics.costPerTBCalculated || undefined,
        }
      };
      
      // Store the submission
      const storedSubmission = await storage.createSubmission(submissionToStore);
      
      console.log('[SUBMISSION] Successfully stored', { 
        submissionId: storedSubmission.submissionMetrics.submissionId,
        processingTime: Date.now() - startTime,
        totalCost: costBreakdown.totalFirstYearCost
      });
      
      res.status(201).json({
        success: true,
        submissionId: storedSubmission.submissionMetrics.submissionId,
        estimatedCost: costBreakdown.totalFirstYearCost,
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('[SUBMISSION] Validation failed', { 
          errors: error.errors,
          processingTime: Date.now() - startTime
        });
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      
      console.error('[SUBMISSION] Storage failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      });
      res.status(500).json({ 
        error: 'Internal server error while storing submission' 
      });
    }
  });

  // GET /api/submissions - Retrieve submissions for reporting
  app.get('/api/submissions', async (req, res) => {
    try {
      // Parse query parameters for filtering
      const filters: SubmissionFilters = {};
      
      if (req.query.configurationSize) {
        filters.configurationSize = req.query.configurationSize as string;
      }
      
      if (req.query.partnerName) {
        filters.partnerName = req.query.partnerName as string;
      }
      
      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }
      
      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }
      
      if (req.query.limit) {
        const limit = parseInt(req.query.limit as string, 10);
        if (!isNaN(limit) && limit > 0) {
          filters.limit = Math.min(limit, 100); // Cap at 100 for performance
        }
      }
      
      const submissions = await storage.getSubmissions(filters);
      
      res.json({
        success: true,
        count: submissions.length,
        submissions: submissions,
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: 'Internal server error while retrieving submissions' 
      });
    }
  });

  // GET /api/submissions/stats - Basic statistics for reporting
  app.get('/api/submissions/stats', async (req, res) => {
    try {
      const stats = await storage.getSubmissionStats();
      
      res.json({
        success: true,
        stats: stats,
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: 'Internal server error while retrieving statistics' 
      });
    }
  });

  // GET /api/submissions/:id - Get specific submission by ID
  app.get('/api/submissions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          error: 'Submission ID is required' 
        });
      }
      
      const submission = await storage.getSubmissionById(id);
      
      if (!submission) {
        return res.status(404).json({ 
          error: 'Submission not found' 
        });
      }
      
      res.json({
        success: true,
        submission: submission,
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: 'Internal server error while retrieving submission' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
