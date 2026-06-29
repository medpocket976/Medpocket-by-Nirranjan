import { useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { AppContext } from "@/context/AppContext";

/**
 * Returns design tokens for the current resolved colour scheme.
 *
 * Priority: AppContext.resolvedTheme (user preference) → system scheme → "light"
 *
 * The returned object is memoized — its reference only changes when the
 * colour scheme actually flips (light ↔ dark). This lets downstream
 * useMemo(() => makeStyles(colors), [colors]) avoid rebuilding StyleSheets
 * on every unrelated re-render.
 */
export function useColors() {
  const ctx = useContext(AppContext);
  const systemScheme = useColorScheme();
  const scheme: "light" | "dark" = ctx?.resolvedTheme ?? (systemScheme === "dark" ? "dark" : "light");
  return useMemo(() => {
    const palette = scheme === "dark" ? colors.dark : colors.light;
    return { ...palette, radius: colors.radius, scheme };
  }, [scheme]);
}
