import { SupportedLanguage } from '../constants';

interface DetectionResult {
  language: SupportedLanguage | null;
  confidence: 'high' | 'medium' | 'low';
}

export function detectLanguage(code: string): DetectionResult {
  const text = code.trim();
  if (!text) {
    return { language: null, confidence: 'low' };
  }

  const scores: Record<SupportedLanguage, number> = {
    python: 0,
    typescript: 0,
    javascript: 0,
    java: 0,
    cpp: 0,
    c: 0,
  };

  // Python patterns
  if (/\bdef\s+\w+\s*\(/.test(text)) scores.python += 5;
  if (/\bimport\s+\w+/.test(text)) scores.python += 2;
  if (/\bself\./.test(text)) scores.python += 4;
  if (/:\s*$/.test(text) || /:\s*#/.test(text)) scores.python += 2;
  if (/\belif\b/.test(text)) scores.python += 5;
  if (/\bprint\(/.test(text)) scores.python += 2;
  if (/\bNone\b|\bTrue\b|\bFalse\b/.test(text)) scores.python += 4;

  // TypeScript / JavaScript
  if (/\bconst\s+|\blet\s+|\bvar\s+/.test(text)) {
    scores.javascript += 3;
    scores.typescript += 3;
  }
  if (/\bfunction\s*\w*\s*\(/.test(text)) {
    scores.javascript += 3;
    scores.typescript += 3;
  }
  if (/=>/.test(text)) {
    scores.javascript += 3;
    scores.typescript += 3;
  }
  if (/\bconsole\.log\(/.test(text)) {
    scores.javascript += 3;
    scores.typescript += 3;
  }
  // TS specific
  if (/\binterface\s+\w+|\btype\s+\w+\s*=/.test(text)) scores.typescript += 6;
  if (/:\s*(string|number|boolean|any|void|unknown|never)\b/.test(text)) scores.typescript += 5;
  if (/<[A-Z]\w*>/ .test(text)) scores.typescript += 2;

  // Java
  if (/\bpublic\s+class\b|\bprivate\s+|\bprotected\s+/.test(text)) scores.java += 6;
  if (/\bSystem\.out\.println\(/.test(text)) scores.java += 6;
  if (/\bString\[\]\s+args\b/.test(text)) scores.java += 6;
  if (/\bArrayList<|\bHashMap</.test(text)) scores.java += 5;

  // C / C++
  if (/#include\s+<stdio\.h>/.test(text)) scores.c += 7;
  if (/#include\s+<iostream>|#include\s+<vector>|#include\s+<bits\/stdc\+\+\.h>/.test(text)) scores.cpp += 7;
  if (/\bstd::/.test(text)) scores.cpp += 6;
  if (/\bcout\s*<<|\bcin\s*>>/.test(text)) scores.cpp += 6;
  if (/\bprintf\(|\bscanf\(/.test(text)) scores.c += 4;
  if (/\bint\s+main\s*\(/.test(text)) {
    scores.c += 3;
    scores.cpp += 3;
    scores.java += 1;
  }

  let topLang: SupportedLanguage | null = null;
  let highestScore = 0;

  for (const [lang, score] of Object.entries(scores) as [SupportedLanguage, number][]) {
    if (score > highestScore) {
      highestScore = score;
      topLang = lang;
    }
  }

  if (!topLang || highestScore < 3) {
    return { language: null, confidence: 'low' };
  }

  const confidence = highestScore >= 6 ? 'high' : 'medium';
  return { language: topLang, confidence };
}
