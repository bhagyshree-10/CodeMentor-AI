import { AnalysisResult } from '../../../schemas/analysis';
import { MISTAKE_TAGS } from '../../../schemas/mistake-tags';

export interface SemanticValidationResult {
  valid: boolean;
  errors: string[];
  repairedResult?: AnalysisResult;
  confidenceClamped?: boolean;
}

export function validateSemanticAnalysis(
  result: AnalysisResult,
  totalLines: number
): SemanticValidationResult {
  const errors: string[] = [];
  const cloned = JSON.parse(JSON.stringify(result)) as AnalysisResult;

  // 1. Line range validation on walkthrough
  let prevWalkthroughEnd = 0;
  for (let i = 0; i < cloned.walkthrough.length; i++) {
    const block = cloned.walkthrough[i];
    if (block.lineStart < 1 || block.lineStart > totalLines) {
      errors.push(`walkthrough[${i}].lineStart (${block.lineStart}) out of bounds (1..${totalLines})`);
    }
    if (block.lineEnd < block.lineStart) {
  errors.push(
    `walkthrough[${i}].lineEnd (${block.lineEnd}) must be >= lineStart (${block.lineStart})`
  );
}

if (block.lineEnd > totalLines) {
  errors.push(
    `walkthrough[${i}].lineEnd (${block.lineEnd}) out of bounds (1..${totalLines})`
  );
}
  }

  // 2. Issues validation
  const issueIds = new Set<string>();
  let hasLowConfidenceIssue = false;

  for (let i = 0; i < cloned.issues.length; i++) {
    const issue = cloned.issues[i];

    if (issueIds.has(issue.id)) {
      errors.push(`issues[${i}].id "${issue.id}" is not unique`);
    }
    issueIds.add(issue.id);

    if (issue.lineStart < 1 || issue.lineStart > totalLines) {
      errors.push(`issues[${i}].lineStart (${issue.lineStart}) out of bounds (1..${totalLines})`);
    }
    if (issue.lineEnd < issue.lineStart) {
  errors.push(
    `issues[${i}].lineEnd (${issue.lineEnd}) must be >= lineStart (${issue.lineStart})`
  );
}

if (issue.lineEnd > totalLines) {
  errors.push(
    `issues[${i}].lineEnd (${issue.lineEnd}) out of bounds (1..${totalLines})`
  );
}

    if (issue.tag !== null && !MISTAKE_TAGS.includes(issue.tag as any)) {
      errors.push(`issues[${i}].tag "${issue.tag}" is not in controlled vocabulary`);
    }

    if ((issue.type === 'bug' || issue.type === 'edge-case') && !issue.evidence.trim()) {
      errors.push(`issues[${i}] of type "${issue.type}" must include non-empty evidence`);
    }

    if (issue.confidence === 'low') {
      hasLowConfidenceIssue = true;
    }
  }

  // 3. Improvement changes mapping validation
  if (cloned.improvement) {
    for (let i = 0; i < cloned.improvement.changes.length; i++) {
      const ch = cloned.improvement.changes[i];
      if (ch.issueId !== null && !issueIds.has(ch.issueId)) {
        errors.push(`improvement.changes[${i}].issueId "${ch.issueId}" refers to non-existent issue`);
      }
    }
  }

  // 4. Confidence clamp rule:
  // If any issue has low confidence, overallConfidence cannot be high
  let confidenceClamped = false;
  if (hasLowConfidenceIssue && cloned.overallConfidence.level === 'high') {
    cloned.overallConfidence.level = 'medium';
    cloned.overallConfidence.caveats.push('Overall confidence lowered because one or more specific issues had low confidence.');
    confidenceClamped = true;
  }

  return {
    valid: errors.length === 0,
    errors,
    repairedResult: cloned,
    confidenceClamped,
  };
}
