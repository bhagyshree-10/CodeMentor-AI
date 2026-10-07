import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeMentor AI – Don\'t just fix your code. Understand it.',
  description: 'AI-powered code explainer, reviewer, and DSA hint ladder studio for developers and computer science learners.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `
    (function() {
      try {
        var stored = localStorage.getItem('cm-theme');
        if (stored === 'dark' || stored === 'light') {
          document.documentElement.setAttribute('data-theme', stored);
        } else {
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg text-text antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
