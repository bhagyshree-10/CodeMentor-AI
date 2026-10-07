import { runAnalysisPipeline } from './ai/analysis-pipeline';
import { PROMPT_VERSION_ANALYSIS } from './ai/prompts/analysis.v1';
import { sha256 } from '../lib/hash';
import { AnalysesRepository } from '../models/analyses.repo';
import { UsersRepository } from '../models/users.repo';
import { QuotaService } from './quota-service';
import { InsightService } from './insight-service';
import { AnalyzeRequest } from '../schemas/api';
import { logger } from '../lib/logger';

export class AnalysisService {
  static async analyze(userId: string, req: AnalyzeRequest) {
    const storeCode = await UsersRepository.getStoreCodeSetting(userId);
    const codeHash = storeCode ? sha256(req.code) : undefined;

    // 1. Cache lookup (only if storeCode = true)
    if (storeCode && codeHash) {
      const cached = await AnalysesRepository.findCached(
        userId,
        codeHash,
        req.intent,
        req.language,
        PROMPT_VERSION_ANALYSIS
      );

      if (cached && cached.result) {
        logger.info('Cache hit for analysis request', { userId, language: req.language });
        const quota = await QuotaService.getUserUsage(userId);
        const insight = await InsightService.computeRecurrenceInsight(userId, cached.mistakeTags);
        return {
          analysisId: cached._id.toString(),
          result: cached.result,
          insight,
          saved: true,
          cached: true,
          quota,
        };
      }
    }

    // 2. Reserve quota & in-flight lock
    await QuotaService.reserveAnalysisQuota(userId);

    try {
      // 3. Execute AI Analysis Pipeline
      const pipelineOutput = await runAnalysisPipeline({
        code: req.code,
        language: req.language,
        intent: req.intent,
        context: req.context,
      });

      // 4. Persist Analysis Document
      const lineCount = req.code.split('\n').length;
      let saved = true;
      let createdId = '';

      try {
        const doc = await AnalysesRepository.create({
          userId,
          kind: 'analysis',
          title: pipelineOutput.result.title,
          language: req.language,
          intent: req.intent,
          code: storeCode ? req.code : undefined,
          codeHash: storeCode ? codeHash : undefined,
          codeLineCount: lineCount,
          result: pipelineOutput.result,
          mistakeTags: pipelineOutput.derivedMistakeTags,
          meta: pipelineOutput.meta,
        });
        createdId = doc._id.toString();
      } catch (err: any) {
        logger.error('Failed to persist analysis to DB', { error: err?.message });
        saved = false;
        createdId = `unsaved_${Date.now()}`;
      }

      // 5. Compute recurrence insight
      const insight = await InsightService.computeRecurrenceInsight(userId, pipelineOutput.derivedMistakeTags);

      // 6. Release in-flight lock
      await QuotaService.releaseAnalysisLock(userId, false);
      const quota = await QuotaService.getUserUsage(userId);

      return {
        analysisId: createdId,
        result: pipelineOutput.result,
        insight,
        saved,
        cached: false,
        quota,
      };
    } catch (err) {
      // On AI execution error, release lock and refund quota
      await QuotaService.releaseAnalysisLock(userId, true);
      throw err;
    }
  }
}
