import { useContext } from "react";
import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { AppContext } from "@/context/AppContext";

/**
 * Returns design tokens for the current resolved colour scheme.
 *
 * Priority: AppContext.resolvedTheme (user preference) → system scheme → "light"
 *
 * We read resolvedTheme from AppContext directly (not useApp()) so this hook
 * is safe even when called close to the Provider boundary, and we can
 * fall back gracefully if the context isn't mounted yet.
 */
export function useColors() {
  const ctx = useContext(AppContext);
  const systemScheme = useColorScheme();
  const scheme: "light" | "dark" = ctx?.resolvedTheme ?? (systemScheme === "dark" ? "dark" : "light");
  const palette = scheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius, scheme };
}
