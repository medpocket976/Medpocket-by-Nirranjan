---
name: MedPocket tab bar overlap
description: The tab bar is position:absolute and overlaps screen content; screens need explicit bottom padding.
---

# MedPocket Tab Bar Bottom Padding

**Why:** The Tabs layout in `(tabs)/_layout.tsx` uses `position: "absolute"` for the tab bar (height: 80px on Android, 84px on web). Screen content fills the full height and goes under the tab bar unless explicit bottom clearance is added.

**How to apply:** In any `(tabs)/` screen that has content near the bottom (especially input bars, last list items), add:
```js
const TAB_BAR_HEIGHT = 80;
const insets = useSafeAreaInsets();
const bottomClearance = TAB_BAR_HEIGHT + insets.bottom;
// Use as paddingBottom on the bottommost container
```

The existing screens use `paddingBottom: insets.bottom + 100` in scroll view contentContainerStyle as a rule of thumb.
