import { useColorScheme } from "react-native";

import colors from "@/constants/colors";

/**
 * Returns design tokens for the current colour scheme.
 * Theme preference is applied via Appearance.setColorScheme() in AppContext,
 * so useColorScheme() automatically reflects both system and manual overrides.
 */
export function useColors() {
  const scheme = useColorScheme();
  const palette =
    scheme === "dark" && "dark" in colors
      ? (colors as unknown as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius, scheme: scheme ?? "light" };
}
