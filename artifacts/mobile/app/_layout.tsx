import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";
import InstallPrompt from "@/components/InstallPrompt";
import OnboardingScreen from "@/components/Onboarding";
import LiquidGlassIntro from "@/components/LiquidGlassIntro";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isOnboarded, resolvedTheme } = useApp();
  const bg = resolvedTheme === "dark" ? "#0B1220" : "#F8FAFC";

  // Must complete onboarding (discipline / year)
  if (!isOnboarded) return <OnboardingScreen />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "default",
        contentStyle: { backgroundColor: bg },
      }}
    >
      <Stack.Screen name="(tabs)"                  options={{ headerShown: false, animation: "none" }} />
      <Stack.Screen name="drug-guide/index"        options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="drug-guide/[id]"         options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="emergency/index"         options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="emergency/[id]"          options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="lab-values/index"        options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="calculators/index"       options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="calculators/[id]"        options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="anaesthesia-calc"        options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="clinical-exam/index"     options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="clinical-exam/[id]"      options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="notes/[id]"              options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="quiz/[subject]"          options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="search"                  options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="privacy-policy"          options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#0B1220" }} />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <InnerLayout />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

/**
 * InnerLayout sits inside AppProvider so it can read hasSeenIntro.
 * The intro overlay renders on top of everything and fades away.
 */
function InnerLayout() {
  const { hasSeenIntro, markIntroSeen } = useApp();
  const [introDismissed, setIntroDismissed] = useState(false);

  function handleIntroDone() {
    markIntroSeen();
    setIntroDismissed(true);
  }

  const showIntro = !hasSeenIntro && !introDismissed;

  return (
    <>
      <RootLayoutNav />
      <InstallPrompt />
      {/* Liquid Glass intro overlay — only on first launch */}
      {showIntro && <LiquidGlassIntro onDone={handleIntroDone} />}
    </>
  );
}
