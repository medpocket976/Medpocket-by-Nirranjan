import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme & meta */}
        <meta name="theme-color" content="#009DB5" />
        <meta name="application-name" content="MedPocket" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MedPocket" />
        <meta name="description" content="Medical reference app for students and clinicians — drug guide, calculators, lab values, emergency protocols." />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />

        {/* Open Graph */}
        <meta property="og:title" content="MedPocket by Nirranjan" />
        <meta property="og:description" content="Your complete medical reference companion." />
        <meta property="og:type" content="website" />

        <ScrollViewStyleReset />

        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('SW registered:', reg.scope); },
                    function(err) { console.log('SW registration failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
