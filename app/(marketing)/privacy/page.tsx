import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-text">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose dark:prose-invert space-y-4 text-sm text-text-muted leading-relaxed">
        <p>
          CodeMentor AI values your privacy. This document outlines what data is collected, stored, and processed when using our platform.
        </p>

        <h2 className="text-lg font-semibold text-text pt-4">1. Information We Store</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account Information:</strong> Email, name, avatar image from OAuth providers (Google / GitHub).</li>
          <li><strong>Analyses & Snippets:</strong> Analyzed code and generated reports (unless private storage is enabled).</li>
          <li><strong>Usage & Metrics:</strong> Daily analysis counts for quota management. No code or AI output is ever logged in server operations logs.</li>
        </ul>

        <h2 className="text-lg font-semibold text-text pt-4">2. Private Storage Mode</h2>
        <p>
          When you disable &quot;Store my code with saved analyses&quot; in Account settings, original code snippets and hashes are not stored in our database.
        </p>

        <h2 className="text-lg font-semibold text-text pt-4">3. AI Service Provider</h2>
        <p>
          Code snippets are processed statically using Google Gemini API. We never run or execute your code on our servers. Do not submit sensitive passwords or API keys.
        </p>

        <h2 className="text-lg font-semibold text-text pt-4">4. Data Erasure</h2>
        <p>
          You can delete any saved analysis at any time, or permanently delete your account and all associated data in Account settings.
        </p>
      </div>
    </div>
  );
}
