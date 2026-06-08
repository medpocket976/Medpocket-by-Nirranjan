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
import { AIChatProvider } from "@/context/AIChatContext";
import InstallPrompt from "@/components/InstallPrompt";
import OnboardingScreen from "@/components/Onboarding";
import AnimatedSplash from "@/components/AnimatedSplash";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isOnboarded, resolvedTheme } = useApp();
  const bg = resolvedTheme === "dark" ? "#0A1628" : "#F8FAFB";

  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  return (
    <AIChatProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "default",
          contentStyle: { backgroundColor: bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
        <Stack.Screen name="drug-guide/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="drug-guide/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="emergency/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="emergency/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="lab-values/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="calculators/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="calculators/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="anaesthesia-calc" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="clinical-exam/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="clinical-exam/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="notes/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="quiz/[subject]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="search" options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="privacy-policy" options={{ animation: "slide_from_right" }} />
      </Stack>
    </AIChatProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the native splash — our custom animated splash takes over
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // While fonts are still loading, keep the teal background visible
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#009DB5" }} />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                {/* App renders underneath — splash fades out to reveal it */}
                <RootLayoutNav />
                <InstallPrompt />
                {/* Custom animated logo splash overlay */}
                {!splashDone && (
                  <AnimatedSplash onDone={() => setSplashDone(true)} />
                )}
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
