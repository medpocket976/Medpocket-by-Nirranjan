---
name: MedPocket v1.3.0 upgrade
description: Key decisions and schema changes from the v1.3.0 major refactor
---

## Color system
Migrated to premium medical palette: primary #2563EB (blue), secondary #14B8A6 (teal), bg-light #F8FAFC, bg-dark #0B1220. Glass tokens: cards rgba(255,255,255,0.18), borders rgba(255,255,255,0.08). All old #009DB5 teal references replaced.

## AppContext schema additions (STORAGE_KEY unchanged: @medpocket_state_v3)
Added fields: `isNameSet: boolean`, `hasSeenIntro: boolean`. Added methods: `setUserName`, `resetName`, `markIntroSeen`, `replayIntro`.
**Migration logic in loadState()**: if `isOnboarded === true` and `isNameSet` key absent → auto-set `isNameSet = hasRealName` and `hasSeenIntro = true` so existing users skip both new flows.

## LiquidGlassIntro component (artifacts/mobile/components/LiquidGlassIntro.tsx)
Replaces AnimatedSplash. 5-scene animation (~5s): logo → tagline → icons → motivational text → fadeout. Skip button top-right. `hasSeenIntro` persisted; `replayIntro()` resets it. Rendered in InnerLayout (inside AppProvider) as overlay on top of RootLayoutNav.

## NameSetupScreen (artifacts/mobile/components/NameSetupScreen.tsx)
First-launch glassmorphism name screen. Blocks app until name.trim().length >= 2. Calls `setUserName()` → `isNameSet = true`. Profile settings: Change Name (edit mode), Reset Name (`resetName()` → shows screen again), Replay Intro (`replayIntro()`).

## App logo
New logo: attached_assets/IMG_20260718_200849_1784436983020.png → artifacts/mobile/assets/images/icon.png. All icon/splash/favicon/adaptive references in app.json use this file.

## Version
package.json: 1.3.0, app.json: versionCode 5, buildNumber 2, themeColor #2563EB.

**Why:** User-requested comprehensive production refactor per spec.
**How to apply:** When changing AppContext, add `hasOwnProperty` migration checks for new fields. Keep STORAGE_KEY at v3.
