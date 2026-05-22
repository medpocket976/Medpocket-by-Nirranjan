import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * MedPocket — PWA-optimised HTML shell
 * Compatible with PWABuilder + Android APK / Play Store packaging
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        {/* ── Charset & compatibility ── */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* ── Viewport — cover notches, no user-scaling on mobile ── */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, viewport-fit=cover"
        />

        {/* ── Primary identity ── */}
        <title>Med Pocket — Medical Reference</title>
        <meta name="application-name" content="Med Pocket" />
        <meta
          name="description"
          content="Medical & paramedical reference for students and clinicians — drug guide, calculators, lab values, emergency protocols and more."
        />
        <meta name="keywords" content="medical reference, drug guide, pharmacology, MBBS, nursing, pharmacy, paramedical, clinical calculator" />
        <meta name="author" content="Nirranjan" />
        <meta name="version" content="1.1.0" />

        {/* ── PWA Manifest — must be served at exact path ── */}
        <link rel="manifest" href="/manifest.json" />

        {/* ── Theme colour (browser chrome, Android task switcher) ── */}
        <meta name="theme-color" content="#009DB5" />
        <meta name="theme-color" content="#0A1628" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-TileColor" content="#009DB5" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />
        <meta name="msapplication-navbutton-color" content="#009DB5" />

        {/* ── Android / Chrome PWA ── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="shortcut icon" type="image/png" href="/icons/icon-192.png" />

        {/* ── iOS / Safari PWA ── */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Med Pocket" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />

        {/* iOS splash screens — portrait orientations */}
        <meta name="apple-touch-startup-image" content="/icons/icon-512.png" />

        {/* ── Favicons ── */}
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />

        {/* ── Open Graph (social sharing) ── */}
        <meta property="og:site_name" content="Med Pocket" />
        <meta property="og:title" content="Med Pocket by Nirranjan" />
        <meta
          property="og:description"
          content="Your complete medical reference — drug guide, clinical calculators, lab values, emergency protocols and more."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://medpocket.app" />
        <meta property="og:image" content="/icons/icon-512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        {/* ── Twitter Card ── */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Med Pocket" />
        <meta
          name="twitter:description"
          content="Medical reference app for students — drug guide, calculators, emergency protocols."
        />
        <meta name="twitter:image" content="/icons/icon-512.png" />

        {/* ── Android / Google Play ── */}
        <meta name="google" content="notranslate" />

        {/* ── Prevent white flash — match app background ── */}
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html {
            background-color: #F8FAFB;
            overscroll-behavior: none;
            -webkit-tap-highlight-color: transparent;
            -webkit-text-size-adjust: 100%;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #F8FAFB;
            overscroll-behavior: none;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          @media (prefers-color-scheme: dark) {
            html, body { background-color: #0A1628; }
          }
          /* Splash screen fade — hide before JS hydration */
          #splash {
            position: fixed; inset: 0; z-index: 9999;
            background: #009DB5;
            display: flex; align-items: center; justify-content: center;
            flex-direction: column; gap: 16px;
            transition: opacity 0.4s ease;
          }
          #splash.hidden { opacity: 0; pointer-events: none; }
          #splash-icon {
            width: 96px; height: 96px; border-radius: 22px;
            background: white; padding: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          }
          #splash-title {
            color: white; font-size: 24px; font-weight: 800;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            letter-spacing: -0.5px;
          }
          #splash-sub {
            color: rgba(255,255,255,0.75); font-size: 13px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin-top: -8px;
          }
        `}</style>

        <ScrollViewStyleReset />

        {/* ── Service Worker + Install prompt registration ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // ── Service Worker ──────────────────────────────────────────────
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker
                    .register('/sw.js', { scope: '/', updateViaCache: 'none' })
                    .then(function (reg) {
                      console.log('[MedPocket] SW registered, scope:', reg.scope);
                      reg.addEventListener('updatefound', function () {
                        var newWorker = reg.installing;
                        newWorker && newWorker.addEventListener('statechange', function () {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[MedPocket] New version available — refresh to update.');
                          }
                        });
                      });
                    })
                    .catch(function (err) {
                      console.warn('[MedPocket] SW registration failed:', err);
                    });
                });
              }

              // ── A2HS Install Prompt ─────────────────────────────────────────
              var _deferredInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function (e) {
                e.preventDefault();
                _deferredInstallPrompt = e;
                window._medpocketInstallPrompt = e;
                window.dispatchEvent(new CustomEvent('medpocket:installable'));
              });
              window.addEventListener('appinstalled', function () {
                _deferredInstallPrompt = null;
                window._medpocketInstallPrompt = null;
                console.log('[MedPocket] App installed successfully.');
                window.dispatchEvent(new CustomEvent('medpocket:installed'));
              });

              // ── Splash screen dismiss ───────────────────────────────────────
              window.addEventListener('load', function () {
                var splash = document.getElementById('splash');
                if (splash) {
                  setTimeout(function () {
                    splash.classList.add('hidden');
                    setTimeout(function () { splash.remove(); }, 450);
                  }, 800);
                }
              });
            `,
          }}
        />
      </head>

      <body>
        {/* Native-app-style splash screen (removed by JS on load) */}
        <div id="splash" aria-hidden="true">
          <img id="splash-icon" src="/icons/icon-192.png" alt="Med Pocket" />
          <div id="splash-title">Med Pocket</div>
          <div id="splash-sub">by Nirranjan</div>
        </div>

        {children}
      </body>
    </html>
  );
}
