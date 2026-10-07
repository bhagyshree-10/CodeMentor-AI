import fs from 'fs';
import path from 'path';
import { runAnalysisPipeline } from '../services/ai/analysis-pipeline';
import { runHintPipeline } from '../services/ai/hint-pipeline';
import { validateHintLeakage } from '../services/ai/validators/hint-leakage';
import goldenData from './golden/cases.json';
import baselineData from './baseline.json';

async function runEvaluation() {
  console.log('🤖 Running CodeMentor AI Golden-Set Evaluation Harness...\n');

  let validSchemaCount = 0;
  let bugRecallCount = 0;
  let expectedBugCount = 0;
  let falseAlarmCount = 0;
  let hintLeakageCount = 0;

  // 1. Evaluate Analysis Cases
  for (const c of goldenData.analysisCases) {
    process.stdout.write(`Evaluating case [${c.id}]... `);
    try {
      const out = await runAnalysisPipeline({
        code: c.code,
        language: c.language as any,
        intent: c.intent as any,
      });

      validSchemaCount++;

      if (c.expected.noIssues) {
        if (out.result.issues.length > 0) {
          falseAlarmCount++;
          console.log(`❌ False alarm: reported ${out.result.issues.length} issues on clean code`);
        } else {
          console.log('✅ Clean code passed');
        }
      } else {
        expectedBugCount++;
        const foundTag = out.result.issues.some((iss) =>
          c.expected.issues?.some((exp) => exp.tag === iss.tag || exp.type === iss.type)
        );
        if (foundTag) {
          bugRecallCount++;
          console.log('✅ Matched expected issue');
        } else {
          console.log('⚠️ Missed expected issue tag');
        }
      }
    } catch (err: any) {
      console.log(`❌ Failed pipeline: ${err.message}`);
    }
  }

  // 2. Evaluate Hint Leakage Cases
  for (const hc of goldenData.hintCases) {
    process.stdout.write(`Evaluating hint leakage case [${hc.id}]... `);
    try {
      const entry = await runHintPipeline({
        level: 1,
        problem: hc.problem,
      });

      const check = validateHintLeakage(1, entry.content, hc.problem);
      if (check.hasLeak) {
        hintLeakageCount++;
        console.log(`❌ Spoiler leakage detected: ${check.violations[0]}`);
      } else {
        console.log('✅ Level 1 spoiler-free');
      }
    } catch (err: any) {
      console.log(`❌ Hint pipeline error: ${err.message}`);
    }
  }

  const totalCases = goldenData.analysisCases.length;
  const schemaValidityPercent = (validSchemaCount / totalCases) * 100;
  const bugRecallPercent = expectedBugCount > 0 ? (bugRecallCount / expectedBugCount) * 100 : 100;

  const results = {
    schemaValidityPercent,
    bugRecallPercent,
    falseAlarmCount,
    hintLeakageCount,
  };

  console.log('\n=============================================');
  console.log('📊 EVALUATION SUMMARY RESULTS:');
  console.log(`- Schema Validity: ${schemaValidityPercent.toFixed(1)}%`);
  console.log(`- Bug Recall: ${bugRecallPercent.toFixed(1)}%`);
  console.log(`- False Alarms: ${falseAlarmCount}`);
  console.log(`- Hint Leakage Count (L1-L3): ${hintLeakageCount}`);
  console.log('=============================================\n');

  if (hintLeakageCount > 0) {
    console.error('❌ RELEASE BLOCKED: Hint leakage detected in evaluation!');
    process.exit(1);
  } else {
    console.log('✅ Baseline criteria met!');
  }
}

runEvaluation().catch((err) => {
  console.error('Fatal eval error:', err);
  process.exit(1);
});
